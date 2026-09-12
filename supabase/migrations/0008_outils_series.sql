-- =============================================================================
-- 0008 — Outils SEO à série temporelle : suivi de positions et backlinks
-- =============================================================================
-- Deux outils que l'agence relève semaine après semaine pour le même compte.
-- Comme pour le SEO local, presque tout ce que le code fige se déduit de la
-- série — et s'en écarte dès qu'un relevé arrive :
--
--   · `prev` — la position au relevé précédent, recopiée à côté de la
--     position actuelle. C'est la ligne d'avant.
--   · `history: (number|null)[]` — huit relevés hebdomadaires empilés dans un
--     tableau, sans date. Un tableau positionnel ne dit pas *quand* : le
--     quatrième élément d'Acme et celui de Boréal peuvent ne pas parler de la
--     même semaine. Chaque relevé porte donc sa date.
--   · `dropped`, `isNew`, `cannib` — trois drapeaux qui décrivent la série :
--     sorti du classement (position nulle après une position), premier relevé
--     (un seul), cannibalisation (plus d'une URL classée sur la requête).
--   · `domainsPrev`, `authorityPrev` — mêmes valeurs précédentes, côté
--     backlinks.
--   · `BlCompetitor.self` — « c'est nous » : se lit en comparant le domaine.
--
-- Ce que le code dit lui-même et que le schéma prend au mot : « Le corpus
-- complet des backlinks n'est jamais conservé — trop volumineux, change en
-- continu. Seuls les gains et les pertes de chaque relevé rejoignent
-- l'historique du client. » Il n'y a donc pas de table `backlink`.
-- =============================================================================


-- =============================================================================
-- Vocabulaires
-- =============================================================================

-- L'intention derrière une requête. Le suivi de positions en connaît trois et
-- l'exploration de mots-clés trois autres, avec deux en commun — c'est le même
-- vocabulaire, vu deux fois.
create type public.search_intent as enum (
  'informationnelle', 'commerciale', 'transactionnelle', 'navigationnelle'
);

create type public.backlink_event_kind as enum ('gain', 'perte');

create type public.toxic_backlink_status as enum ('a_desavouer', 'desavoue');


-- =============================================================================
-- Ce que coûte un relevé de positions
-- =============================================================================
-- Le suivi de positions n'est pas facturé à la requête comme les autres
-- outils : son prix dépend du nombre de mots-clés suivis pour le compte
-- (`PLAN_TIERS`). Un palier, c'est un plafond et un prix — et ça change, donc
-- ça se règle, ça ne se code pas.

create table public.keyword_plan_tier (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  max_keywords  integer not null,
  -- null = inclus au forfait, ce qui n'est pas la même chose que gratuit.
  price_cents   integer,
  created_at    timestamptz not null default now(),

  constraint keyword_plan_tier_unique unique (agency_id, max_keywords),
  constraint keyword_plan_tier_max_positive check (max_keywords > 0),
  constraint keyword_plan_tier_price_positive check (price_cents is null or price_cents >= 0)
);

create index keyword_plan_tier_agency_idx on public.keyword_plan_tier (agency_id);


-- =============================================================================
-- Les mots-clés suivis
-- =============================================================================

-- Les regroupements sont propres au compte (« Toiture résidentielle »,
-- « Urgence & réparation », « Marque ») : c'est le client qui les nomme, et
-- l'écran filtre dessus. Une table plutôt qu'un texte libre, sinon le filtre
-- se met à proposer « Marque » et « marque ».
create table public.keyword_group (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agency(id) on delete cascade,
  client_id   uuid not null references public.client(id) on delete cascade,
  name        text not null,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),

  constraint keyword_group_unique unique (client_id, name)
);

create index keyword_group_agency_idx on public.keyword_group (agency_id);
create index keyword_group_client_idx on public.keyword_group (client_id);

create table public.tracked_keyword (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agency(id) on delete cascade,
  client_id   uuid not null references public.client(id) on delete cascade,
  group_id    uuid references public.keyword_group(id) on delete set null,

  query       text not null,
  intent      public.search_intent,

  -- Le mot-clé qui a motivé une priorité du plan d'action (`prio: 'P-0431'`).
  priority_id uuid references public.priority(id) on delete set null,

  created_at  timestamptz not null default now(),
  archived_at timestamptz,

  constraint tracked_keyword_unique unique (client_id, query)
);

create index tracked_keyword_agency_idx on public.tracked_keyword (agency_id);
create index tracked_keyword_client_idx on public.tracked_keyword (client_id);
create index tracked_keyword_group_idx on public.tracked_keyword (group_id);
create index tracked_keyword_priority_idx on public.tracked_keyword (priority_id);


-- Un relevé hebdomadaire. `history` devient cette table : une ligne par
-- semaine, et sa date. La position précédente, le premier relevé et la sortie
-- du classement se lisent tous ici.
create table public.keyword_reading (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,
  keyword_id    uuid not null references public.tracked_keyword(id) on delete cascade,
  measured_on   date not null default current_date,

  -- null = hors du top 100. Un mot-clé non relevé n'a pas de ligne.
  position      smallint,
  -- Le volume de recherche tel que le fournisseur le rapporte ce jour-là : il
  -- bouge d'un mois à l'autre, il appartient donc au relevé.
  search_volume integer,

  created_at    timestamptz not null default now(),

  constraint keyword_reading_unique unique (keyword_id, measured_on),
  constraint keyword_reading_position_range check (position is null or position > 0),
  constraint keyword_reading_volume_positive check (search_volume is null or search_volume >= 0)
);

create index keyword_reading_keyword_idx on public.keyword_reading (keyword_id, measured_on desc);
create index keyword_reading_agency_idx on public.keyword_reading (agency_id);


-- Les URL classées sur la requête à ce relevé. Plus d'une, et c'est une
-- cannibalisation — le drapeau `cannib` n'a donc pas à être coché à la main.
create table public.keyword_reading_url (
  reading_id  uuid not null references public.keyword_reading(id) on delete cascade,
  url         text not null,
  position    smallint,
  primary key (reading_id, url),
  constraint keyword_reading_url_position_range check (position is null or position > 0)
);


-- =============================================================================
-- Les backlinks : le profil, ses mouvements, et rien du corpus
-- =============================================================================

create table public.backlink_reading (
  id                 uuid primary key default gen_random_uuid(),
  agency_id          uuid not null references public.agency(id) on delete cascade,
  client_id          uuid not null references public.client(id) on delete cascade,
  measured_on        date not null default current_date,

  referring_domains  integer,
  authority          smallint,
  -- Part de liens suivis (dofollow), en pourcentage.
  followed_pct       smallint,

  created_at         timestamptz not null default now(),

  constraint backlink_reading_unique unique (client_id, measured_on),
  constraint backlink_reading_domains_positive
    check (referring_domains is null or referring_domains >= 0),
  constraint backlink_reading_authority_range
    check (authority is null or authority between 0 and 100),
  constraint backlink_reading_followed_range
    check (followed_pct is null or followed_pct between 0 and 100)
);

create index backlink_reading_client_idx on public.backlink_reading (client_id, measured_on desc);
create index backlink_reading_agency_idx on public.backlink_reading (agency_id);


-- La répartition des ancres à ce relevé.
create table public.backlink_anchor (
  reading_id  uuid not null references public.backlink_reading(id) on delete cascade,
  anchor      text not null,
  occurrences integer not null,
  primary key (reading_id, anchor),
  constraint backlink_anchor_positive check (occurrences > 0)
);


-- Les gains et les pertes — la seule chose qu'on garde du corpus.
create table public.backlink_event (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  client_id    uuid not null references public.client(id) on delete cascade,
  -- Le relevé qui l'a constaté : sans lui, on ne sait pas d'où vient la ligne.
  reading_id   uuid references public.backlink_reading(id) on delete set null,

  kind         public.backlink_event_kind not null,
  domain       text not null,
  authority    smallint,
  anchor       text,
  occurred_on  date not null,

  -- Un gain pointe vers une page du site ; une perte dit pourquoi le lien
  -- n'est plus là. Ni l'un ni l'autre n'a de sens dans l'autre sens.
  target_url   text,
  reason       text,

  created_at   timestamptz not null default now(),

  constraint backlink_event_unique unique (client_id, kind, domain, occurred_on),
  constraint backlink_event_authority_range
    check (authority is null or authority between 0 and 100),
  constraint backlink_event_gain_targets_a_page check (
    kind <> 'gain' or (target_url is not null and reason is null)
  ),
  constraint backlink_event_loss_states_a_reason check (
    kind <> 'perte' or (reason is not null and target_url is null)
  )
);

create index backlink_event_client_idx on public.backlink_event (client_id, occurred_on desc);
create index backlink_event_agency_idx on public.backlink_event (agency_id);
create index backlink_event_reading_idx on public.backlink_event (reading_id);


-- Les liens toxiques : eux persistent, parce qu'un désaveu se suit dans le
-- temps et qu'on doit pouvoir montrer quand il a été demandé.
create table public.toxic_backlink (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  client_id    uuid not null references public.client(id) on delete cascade,

  domain       text not null,
  authority    smallint,
  spam_score   smallint,
  reason       text not null,
  status       public.toxic_backlink_status not null default 'a_desavouer',
  disavowed_on date,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint toxic_backlink_unique unique (client_id, domain),
  constraint toxic_backlink_spam_range check (spam_score is null or spam_score between 0 and 100),
  constraint toxic_backlink_authority_range check (authority is null or authority between 0 and 100),
  -- « Désavoué » sans date de désaveu ne veut rien dire, et une date sans le
  -- statut non plus.
  constraint toxic_backlink_disavow_pairing check (
    (status = 'desavoue') = (disavowed_on is not null)
  )
);

create index toxic_backlink_client_idx on public.toxic_backlink (client_id);
create index toxic_backlink_agency_idx on public.toxic_backlink (agency_id);

create trigger toxic_backlink_touch
  before update on public.toxic_backlink
  for each row execute function app.touch_updated_at();


-- Les concurrents comparés sur le profil de liens. Le code marquait d'un
-- drapeau `self` la ligne du client lui-même ; ici elle n'existe pas — le
-- chiffre du client est dans son propre relevé.
create table public.backlink_competitor (
  reading_id         uuid not null references public.backlink_reading(id) on delete cascade,
  name               text not null,
  domain             text,
  referring_domains  integer,
  primary key (reading_id, name),
  constraint backlink_competitor_domains_positive
    check (referring_domains is null or referring_domains >= 0)
);


-- =============================================================================
-- Ce qui se déduit
-- =============================================================================

-- Un mot-clé à un relevé : sa position, celle d'avant, et les trois états que
-- le code cochait à la main.
create view public.tracked_keyword_reading as
select
  k.id            as keyword_id,
  k.agency_id,
  k.client_id,
  k.group_id,
  k.query,
  k.intent,
  r.id            as reading_id,
  r.measured_on,
  r.position,
  r.search_volume,
  lag(r.position)     over w as position_previous,
  lag(r.measured_on)  over w as measured_on_previous,
  -- Premier relevé : rien à comparer.
  (row_number() over w = 1)                                             as is_first_reading,
  -- Sorti du classement : il n'y est pas, et il y a déjà été. Compté sur tout
  -- l'historique, pas seulement sur la ligne d'avant — un mot-clé sorti depuis
  -- trois semaines est toujours sorti.
  (r.position is null
   and count(r.position) over (w rows between unbounded preceding and 1 preceding) > 0)
                                                                        as dropped_out,
  -- Cannibalisation : plus d'une URL classée sur la même requête.
  (select count(*) from public.keyword_reading_url u where u.reading_id = r.id) > 1
                                                                        as cannibalised
from public.tracked_keyword k
join public.keyword_reading r on r.keyword_id = k.id
window w as (partition by k.id order by r.measured_on);

alter view public.tracked_keyword_reading set (security_invoker = on);


-- Le profil de liens à un relevé, et le relevé d'avant.
create view public.backlink_reading_delta as
select
  b.id as reading_id,
  b.agency_id,
  b.client_id,
  b.measured_on,
  b.referring_domains,
  b.authority,
  b.followed_pct,
  lag(b.referring_domains) over w as referring_domains_previous,
  lag(b.authority)         over w as authority_previous,
  lag(b.measured_on)       over w as measured_on_previous
from public.backlink_reading b
window w as (partition by b.client_id order by b.measured_on);

alter view public.backlink_reading_delta set (security_invoker = on);


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.keyword_plan_tier    enable row level security;
alter table public.keyword_group        enable row level security;
alter table public.tracked_keyword      enable row level security;
alter table public.keyword_reading      enable row level security;
alter table public.keyword_reading_url  enable row level security;
alter table public.backlink_reading     enable row level security;
alter table public.backlink_anchor      enable row level security;
alter table public.backlink_event       enable row level security;
alter table public.toxic_backlink       enable row level security;
alter table public.backlink_competitor  enable row level security;

create policy keyword_plan_tier_agency_all on public.keyword_plan_tier
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy keyword_group_agency_all on public.keyword_group
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy tracked_keyword_agency_all on public.tracked_keyword
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy keyword_reading_agency_all on public.keyword_reading
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy backlink_reading_agency_all on public.backlink_reading
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy backlink_event_agency_all on public.backlink_event
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy toxic_backlink_agency_all on public.toxic_backlink
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Les tables de détail suivent leur relevé.
create policy keyword_reading_url_agency_all on public.keyword_reading_url
  for all to authenticated
  using (exists (
    select 1 from public.keyword_reading r
    where r.id = public.keyword_reading_url.reading_id
      and r.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.keyword_reading r
    where r.id = public.keyword_reading_url.reading_id
      and r.agency_id = app.current_agency_id()));

create policy backlink_anchor_agency_all on public.backlink_anchor
  for all to authenticated
  using (exists (
    select 1 from public.backlink_reading b
    where b.id = public.backlink_anchor.reading_id
      and b.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.backlink_reading b
    where b.id = public.backlink_anchor.reading_id
      and b.agency_id = app.current_agency_id()));

create policy backlink_competitor_agency_all on public.backlink_competitor
  for all to authenticated
  using (exists (
    select 1 from public.backlink_reading b
    where b.id = public.backlink_competitor.reading_id
      and b.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.backlink_reading b
    where b.id = public.backlink_competitor.reading_id
      and b.agency_id = app.current_agency_id()));

-- Le portail ne voit rien de tout ceci : ce sont les outils de travail de
-- l'agence, pas le bilan du client. Ce qui doit lui parvenir passe par le
-- rapport publié (règle 1).
