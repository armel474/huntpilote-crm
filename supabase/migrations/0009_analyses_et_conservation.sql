-- =============================================================================
-- 0009 — Analyses ponctuelles, et la règle 3 appliquée par le moteur
-- =============================================================================
-- Quatre outils qui interrogent le fournisseur à la demande plutôt que sur un
-- rythme : Domain Overview, Organic Research, Keyword Gap, Keyword Hunter. Et
-- surtout la politique de conservation de `docs/decisions.md` (règle 3), qui
-- jusqu'ici n'existait que sous forme de tableau dans un document.
--
-- Ce que la règle 3 dit, et que ce fichier fait tenir :
--
--   « Liste blanche historisée automatiquement ; le reste éphémère,
--     enregistrable sur action explicite. Les prospects n'ont droit qu'à un
--     instantané, purgé si le deal est perdu. »
--
-- Trois conséquences :
--
--   1. Le marqueur de conservation que l'interface doit afficher (« ceci sera
--      conservé », « ceci disparaît dans 30 jours ») n'est pas une décision
--      d'écran : il se calcule depuis l'outil et le type de compte. Un
--      déclencheur le pose à l'insertion, pour qu'aucun appel ne puisse
--      l'oublier ni mentir dessus.
--   2. La dilution (« quotidien 90 j → hebdo 12 mois → mensuel ») est une
--      routine de maintenance, pas un vœu. `app.purge_expired_data()`
--      l'exécute, avec les seuils de l'agence.
--   3. L'instantané d'un prospect disparaît quand le deal est perdu. La
--      migration 0004 exigeait le motif ; ici la purge a lieu. Elle est
--      immédiate et sans retour — c'est une copie de données du fournisseur,
--      pas une donnée originale : elle se rachète, elle ne se perd pas.
--
-- Le reste suit la même ligne que 0007 et 0008 : ce qui se compte n'est pas
-- stocké. `trafficPrev`, `KgCategoryId`, `words`, `self`, `Quota.used` et le
-- décrochage daté se déduisent tous.
-- =============================================================================


-- =============================================================================
-- Vocabulaires
-- =============================================================================

create type public.tool_id as enum (
  'site_audit', 'position_tracking', 'backlink_analyse',
  'keyword_hunter', 'keyword_gap', 'domain_overview', 'organic_research'
);

create type public.tool_run_state as enum ('encours', 'termine', 'incomplet', 'echec');

-- Le marqueur de conservation de la règle 3.
create type public.retention_kind as enum (
  'historise',   -- rejoint la courbe du compte, dilué avec le temps
  'instantane',  -- prospect : une photo, purgée si le deal est perdu
  'ephemere'     -- cache du fournisseur, purgé au-delà du délai d'agence
);

create type public.seasonality as enum ('hiver', 'ete', 'stable');

-- Les cinq familles de constats de l'exploration de site (`SaFamilyId`).
create type public.audit_family as enum (
  'indexation', 'erreurs', 'onpage', 'perf', 'structure'
);

create type public.url_change_kind as enum ('apparue', 'disparue');


-- =============================================================================
-- Le quota du fournisseur : un plafond réglé, une consommation comptée
-- =============================================================================

alter table public.agency_settings
  -- `NORMAL_QUOTA.max` — le plafond mensuel chez le fournisseur de données.
  add column monthly_credit_quota integer,
  add constraint agency_settings_quota_positive
    check (monthly_credit_quota is null or monthly_credit_quota > 0);


-- =============================================================================
-- Un appel au fournisseur
-- =============================================================================
-- Chaque interrogation d'un outil laisse une ligne : ce qu'elle a coûté, sur
-- quel compte, et combien de temps son résultat vivra. C'est cette table qui
-- alimente à la fois le marqueur de conservation et l'écran de consommation.

create table public.tool_run (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  -- Un outil s'interroge toujours pour un compte — c'est la décision « les
  -- outils sont rattachés à un client », prospects compris.
  client_id    uuid not null references public.client(id) on delete cascade,

  tool         public.tool_id not null,
  state        public.tool_run_state not null default 'encours',
  -- L'étendue ou la période demandée (« Analyse standard », « 12 derniers
  -- mois »), telle que l'écran l'a proposée.
  scope        text,
  params       jsonb,

  -- Ce que l'appel a coûté chez le fournisseur.
  credits      integer,
  cost_cents   integer,

  -- Posés par déclencheur, jamais par l'appelant : voir plus bas.
  retention    public.retention_kind not null default 'ephemere',
  expires_on   date,

  ran_at       timestamptz not null default now(),
  created_at   timestamptz not null default now(),

  constraint tool_run_credits_positive check (credits is null or credits >= 0),
  constraint tool_run_cost_positive check (cost_cents is null or cost_cents >= 0),
  -- Seul un résultat éphémère a une date de péremption ; un historisé n'en a
  -- pas, et un instantané de prospect disparaît avec son deal, pas au calendrier.
  constraint tool_run_expiry_only_ephemeral check (
    (retention = 'ephemere') = (expires_on is not null)
  )
);

create index tool_run_agency_idx on public.tool_run (agency_id, ran_at desc);
create index tool_run_client_idx on public.tool_run (client_id, ran_at desc);
create index tool_run_expiry_idx on public.tool_run (expires_on) where expires_on is not null;


-- La conservation ne se saisit pas : elle se déduit de l'outil et du type de
-- compte. Un écran qui la choisirait lui-même finirait par afficher un
-- marqueur qui ment.
create or replace function app.set_tool_run_retention()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  type_compte public.client_type;
  jours       integer;
begin
  select c.type into type_compte from public.client c where c.id = new.client_id;

  if type_compte = 'prospect' then
    -- Règle 3 : « Les prospects n'ont droit qu'à un instantané. »
    new.retention := 'instantane';
    new.expires_on := null;
  elsif new.tool in ('keyword_hunter', 'keyword_gap') then
    -- Règle 3 : « Exploration de mots-clés — cache 30 jours puis purge. »
    select s.keyword_cache_days into jours
      from public.agency_settings s where s.agency_id = new.agency_id;
    new.retention := 'ephemere';
    new.expires_on := current_date + coalesce(jours, 30);
  else
    new.retention := 'historise';
    new.expires_on := null;
  end if;

  return new;
end;
$$;

create trigger tool_run_retention
  before insert on public.tool_run
  for each row execute function app.set_tool_run_retention();


-- « Enregistré dans la fiche » : le geste explicite qui fait passer un
-- résultat du cache au dossier du compte (`SaveEntry`).
create table public.tool_save (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  client_id    uuid not null references public.client(id) on delete cascade,
  -- L'appel d'origine peut avoir été purgé : ce qui a été versé à la fiche,
  -- lui, reste.
  tool_run_id  uuid references public.tool_run(id) on delete set null,

  tool         public.tool_id not null,
  summary      text not null,
  saved_at     timestamptz not null default now(),
  saved_by     uuid references public.agency_member(id) on delete set null
);

create index tool_save_client_idx on public.tool_save (client_id, saved_at desc);
create index tool_save_agency_idx on public.tool_save (agency_id);
create index tool_save_run_idx on public.tool_save (tool_run_id);
create index tool_save_member_idx on public.tool_save (saved_by);


-- =============================================================================
-- Exploration de mots-clés — le cache éphémère
-- =============================================================================

create table public.keyword_suggestion (
  id            uuid primary key default gen_random_uuid(),
  tool_run_id   uuid not null references public.tool_run(id) on delete cascade,

  query         text not null,
  -- Le regroupement thématique : « une liste de 400 requêtes n'est pas
  -- exploitable, trois sujets d'articles le sont ».
  theme         text,
  search_volume integer,
  difficulty    smallint,
  intent        public.search_intent,
  trend         public.seasonality,
  is_question   boolean not null default false,

  -- La longueur de la requête se compte, elle ne se saisit pas.
  word_count    smallint generated always as (
                  coalesce(array_length(string_to_array(btrim(query), ' '), 1), 0)
                ) stored,

  constraint keyword_suggestion_unique unique (tool_run_id, query),
  constraint keyword_suggestion_difficulty_range
    check (difficulty is null or difficulty between 0 and 100),
  constraint keyword_suggestion_volume_positive
    check (search_volume is null or search_volume >= 0)
);

create index keyword_suggestion_run_idx on public.keyword_suggestion (tool_run_id);


-- =============================================================================
-- Keyword Gap — l'écart avec les concurrents
-- =============================================================================
-- Les quatre catégories (manquants, faibles, forts, uniques) ne sont pas une
-- donnée : ce sont quatre façons de comparer une position à celles des
-- concurrents. Une vue les calcule, et elles ne peuvent plus se contredire.

create table public.gap_competitor (
  id           uuid primary key default gen_random_uuid(),
  tool_run_id  uuid not null references public.tool_run(id) on delete cascade,
  domain       text not null,
  name         text,
  -- Le concurrent interrogé dont le fournisseur n'a rien renvoyé : l'absence
  -- de données n'est pas l'absence de positions.
  no_data      boolean not null default false,
  position     smallint not null default 0,

  constraint gap_competitor_unique unique (tool_run_id, domain)
);

create index gap_competitor_run_idx on public.gap_competitor (tool_run_id);

create table public.gap_row (
  id              uuid primary key default gen_random_uuid(),
  tool_run_id     uuid not null references public.tool_run(id) on delete cascade,
  query           text not null,
  search_volume   integer,
  -- null = le client n'est pas classé sur cette requête.
  client_position smallint,

  constraint gap_row_unique unique (tool_run_id, query),
  constraint gap_row_position_range check (client_position is null or client_position > 0),
  constraint gap_row_volume_positive check (search_volume is null or search_volume >= 0)
);

create index gap_row_run_idx on public.gap_row (tool_run_id);

create table public.gap_position (
  row_id         uuid not null references public.gap_row(id) on delete cascade,
  competitor_id  uuid not null references public.gap_competitor(id) on delete cascade,
  -- null = le concurrent n'est pas classé sur cette requête.
  position       smallint,
  primary key (row_id, competitor_id),
  constraint gap_position_range check (position is null or position > 0)
);

create index gap_position_competitor_idx on public.gap_position (competitor_id);


-- =============================================================================
-- Domain Overview et Organic Research — la courbe du domaine
-- =============================================================================
-- Les deux outils lisent la même chose à deux profondeurs : douze mois pour
-- qualifier, vingt-quatre pour creuser. Une seule série, donc.

create table public.domain_reading (
  id                 uuid primary key default gen_random_uuid(),
  agency_id          uuid not null references public.agency(id) on delete cascade,
  client_id          uuid not null references public.client(id) on delete cascade,
  tool_run_id        uuid references public.tool_run(id) on delete set null,
  -- Un point par mois : on stocke le premier jour du mois pour que deux
  -- relevés du même mois ne puissent pas coexister.
  measured_on        date not null,

  organic_traffic    integer,
  avg_position       numeric(4,1),
  keyword_count      integer,
  authority          smallint,
  referring_domains  integer,

  -- La répartition par tranche de position (`DoBucketId`). Quatre tranches
  -- disjointes dont la somme doit faire le nombre de mots-clés.
  bucket_top3        integer,
  bucket_top10       integer,
  bucket_top30       integer,
  bucket_beyond      integer,

  created_at         timestamptz not null default now(),

  constraint domain_reading_unique unique (client_id, measured_on),
  constraint domain_reading_is_a_month check (measured_on = date_trunc('month', measured_on)::date),
  constraint domain_reading_authority_range check (authority is null or authority between 0 and 100),
  constraint domain_reading_buckets_sum check (
    bucket_top3 is null or keyword_count is null
    or bucket_top3 + bucket_top10 + bucket_top30 + bucket_beyond = keyword_count
  ),
  constraint domain_reading_buckets_together check (
    num_nulls(bucket_top3, bucket_top10, bucket_top30, bucket_beyond) in (0, 4)
  )
);

create index domain_reading_client_idx on public.domain_reading (client_id, measured_on desc);
create index domain_reading_agency_idx on public.domain_reading (agency_id);
create index domain_reading_run_idx on public.domain_reading (tool_run_id);

create table public.domain_top_page (
  reading_id  uuid not null references public.domain_reading(id) on delete cascade,
  url         text not null,
  visits      integer,
  -- Progression ou recul de la page sur la période (`PAGES_UP` / `PAGES_DOWN`),
  -- en pourcentage. Un seul champ signé : deux listes, c'est le même chiffre.
  delta_pct   smallint,
  primary key (reading_id, url)
);

create table public.domain_top_query (
  reading_id     uuid not null references public.domain_reading(id) on delete cascade,
  query          text not null,
  search_volume  integer,
  position       smallint,
  page_url       text,
  primary key (reading_id, query),
  constraint domain_top_query_position_range check (position is null or position > 0)
);

-- La répartition géographique — au Québec, c'est elle qui distingue un site
-- local d'un site pancanadien.
create table public.domain_geo_share (
  reading_id  uuid not null references public.domain_reading(id) on delete cascade,
  region      text not null,
  share_pct   smallint not null,
  primary key (reading_id, region),
  constraint domain_geo_share_range check (share_pct between 0 and 100)
);


-- Un décrochage daté. La chute se voit dans la série ; ce qui ne s'y voit pas,
-- c'est *pourquoi* — et c'est la seule chose qu'on écrit ici.
create table public.traffic_drop (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  client_id    uuid not null references public.client(id) on delete cascade,
  occurred_on  date not null,
  cause        text not null,
  created_at   timestamptz not null default now(),

  constraint traffic_drop_unique unique (client_id, occurred_on)
);

create index traffic_drop_client_idx on public.traffic_drop (client_id, occurred_on desc);
create index traffic_drop_agency_idx on public.traffic_drop (agency_id);


-- =============================================================================
-- L'audit de prospect — un document figé, comme le rapport client
-- =============================================================================
-- Même thèse que `report_version` : une fois envoyé à un prospect, le chiffre
-- qu'il contient ne doit plus bouger, même si la série sous-jacente est
-- rafraîchie. Ce que le prospect a reçu est ce que le prospect a reçu.

create table public.prospect_audit (
  id               uuid primary key default gen_random_uuid(),
  agency_id        uuid not null references public.agency(id) on delete cascade,
  client_id        uuid not null references public.client(id) on delete cascade,
  tool_run_id      uuid references public.tool_run(id) on delete set null,

  token            text not null unique,
  prepared_on      date not null default current_date,
  -- « Validité : 30 jours » — affichée sur le document, donc réglée avec lui.
  validity_days    integer not null default 30,
  source_tool      public.tool_id not null,

  -- Le gain estimé, et le multiplicateur de taux de clic qui l'a produit : un
  -- chiffre sans sa méthode n'est pas vérifiable.
  potential_gain   integer,
  ctr_multiplier   numeric(3,1),

  -- La photo complète du document tel qu'il a été produit.
  payload          jsonb not null,

  published_at     timestamptz not null default now(),
  published_by     uuid references public.agency_member(id) on delete set null,

  constraint prospect_audit_validity_positive check (validity_days > 0),
  constraint prospect_audit_gain_has_method check (
    potential_gain is null or ctr_multiplier is not null
  )
);

create index prospect_audit_client_idx on public.prospect_audit (client_id, prepared_on desc);
create index prospect_audit_agency_idx on public.prospect_audit (agency_id);
create index prospect_audit_run_idx on public.prospect_audit (tool_run_id);
create index prospect_audit_member_idx on public.prospect_audit (published_by);

-- Figé veut dire figé.
create or replace function app.block_prospect_audit_rewrite()
returns trigger
language plpgsql
as $$
begin
  raise exception
    'Un audit de prospect publié ne se modifie pas — produisez-en un nouveau (règle 3).';
end;
$$;

create trigger prospect_audit_immutable
  before update or delete on public.prospect_audit
  for each row execute function app.block_prospect_audit_rewrite();


-- =============================================================================
-- L'exploration de site rejoint l'audit, elle ne le double pas
-- =============================================================================
-- `site-audit.ts` produit exactement ce que `audit` et `audit_criterion`
-- portent déjà : des constats avec mesure, seuil et pages touchées. Il leur
-- manquait le relevé d'exploration lui-même et la famille du constat.

alter table public.audit
  add column crawl_errors integer,
  add column avg_depth    numeric(3,1),
  add column quota_pages  integer,
  add constraint audit_crawl_errors_positive check (crawl_errors is null or crawl_errors >= 0),
  add constraint audit_pages_within_quota check (
    quota_pages is null or pages_crawled is null or pages_crawled <= quota_pages
  );

alter table public.audit_criterion
  add column family public.audit_family,
  -- Le nombre de pages touchées. `pages` n'en porte qu'un échantillon
  -- (« +2 autres URL ») : le compte ne s'en déduit donc pas.
  add column affected_pages integer,
  add constraint audit_criterion_affected_positive check (
    affected_pages is null or affected_pages >= 0
  );

-- Les URL apparues et disparues depuis l'exploration précédente.
create table public.audit_url_change (
  audit_id  uuid not null references public.audit(id) on delete cascade,
  kind      public.url_change_kind not null,
  url       text not null,
  primary key (audit_id, kind, url)
);


-- =============================================================================
-- Ce qui se déduit
-- =============================================================================

-- Les quatre catégories du Keyword Gap. Un concurrent sans données ne compte
-- pas : ne pas savoir n'est pas être absent.
create view public.gap_row_category as
select
  r.id as row_id,
  r.tool_run_id,
  r.query,
  r.search_volume,
  r.client_position,
  (select min(p.position) from public.gap_position p
   join public.gap_competitor c on c.id = p.competitor_id
   where p.row_id = r.id and not c.no_data) as best_competitor_position,
  case
    when r.client_position is null then 'manquants'
    when not exists (
      select 1 from public.gap_position p
      join public.gap_competitor c on c.id = p.competitor_id
      where p.row_id = r.id and not c.no_data and p.position is not null
    ) then 'uniques'
    when exists (
      select 1 from public.gap_position p
      join public.gap_competitor c on c.id = p.competitor_id
      where p.row_id = r.id and not c.no_data and p.position < r.client_position
    ) then 'faibles'
    else 'forts'
  end as category
from public.gap_row r
-- Une requête sur laquelle personne n'est classé n'est pas un écart.
where r.client_position is not null
   or exists (
     select 1 from public.gap_position p
     join public.gap_competitor c on c.id = p.competitor_id
     where p.row_id = r.id and not c.no_data and p.position is not null
   );

alter view public.gap_row_category set (security_invoker = on);


-- La courbe du domaine, et le mois d'avant. `trafficPrev` disparaît.
create view public.domain_reading_delta as
select
  d.id as reading_id,
  d.agency_id,
  d.client_id,
  d.measured_on,
  d.organic_traffic,
  d.avg_position,
  d.keyword_count,
  d.authority,
  d.referring_domains,
  lag(d.organic_traffic) over w as organic_traffic_previous,
  lag(d.avg_position)    over w as avg_position_previous,
  lag(d.measured_on)     over w as measured_on_previous
from public.domain_reading d
window w as (partition by d.client_id order by d.measured_on);

alter view public.domain_reading_delta set (security_invoker = on);


-- La consommation de crédits du mois, ventilée par compte — « un client peut
-- coûter cinq fois plus qu'un autre » (règle 3). `Quota.used` n'est pas une
-- donnée, c'est une somme.
create view public.credit_usage_by_client as
select
  r.agency_id,
  r.client_id,
  date_trunc('month', r.ran_at)::date as month,
  count(*)                            as runs,
  coalesce(sum(r.credits), 0)         as credits,
  coalesce(sum(r.cost_cents), 0)      as cost_cents
from public.tool_run r
where r.state <> 'echec'
group by r.agency_id, r.client_id, date_trunc('month', r.ran_at);

alter view public.credit_usage_by_client set (security_invoker = on);

create view public.credit_usage_month as
select
  u.agency_id,
  u.month,
  sum(u.credits)    as credits_used,
  sum(u.cost_cents) as cost_cents,
  s.monthly_credit_quota
from public.credit_usage_by_client u
join public.agency_settings s on s.agency_id = u.agency_id
group by u.agency_id, u.month, s.monthly_credit_quota;

alter view public.credit_usage_month set (security_invoker = on);


-- =============================================================================
-- La règle 3, exécutée
-- =============================================================================

-- L'instantané d'un prospect disparaît quand le deal est perdu. La migration
-- 0004 exigeait le motif ; c'est ici que la purge a lieu. Elle est immédiate :
-- ce sont des données rachetées au fournisseur, pas des données originales.
create or replace function app.purge_lost_prospect_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.deal_seo_snapshot s where s.deal_id = new.id;

  delete from public.tool_run r
   where r.client_id = new.client_id
     and r.retention = 'instantane';

  return null;
end;
$$;

create trigger deal_lost_purges_snapshot
  after update of stage on public.deal
  for each row
  when (new.stage = 'perdu' and old.stage is distinct from 'perdu')
  execute function app.purge_lost_prospect_snapshot();


-- La routine de maintenance : péremption du cache, puis dilution des séries
-- selon les seuils de chaque agence. Rend le nombre de lignes supprimées, pour
-- qu'un passage silencieux se remarque.
create or replace function app.purge_expired_data()
returns table (etape text, lignes bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare n bigint;
begin
  -- 1. Le cache d'exploration de mots-clés, au-delà du délai d'agence.
  delete from public.tool_run r where r.expires_on < current_date;
  get diagnostics n = row_count;
  etape := 'cache éphémère périmé'; lignes := n; return next;

  -- 2. Positions SERP : au-delà du détail quotidien, un relevé par semaine.
  delete from public.keyword_reading r
   using public.tracked_keyword k, public.agency_settings s
   where r.keyword_id = k.id
     and s.agency_id = k.agency_id
     and r.measured_on <  current_date - s.serp_daily_days
     and r.measured_on >= current_date - s.serp_weekly_days
     and r.measured_on <> (
       select max(r2.measured_on) from public.keyword_reading r2
        where r2.keyword_id = r.keyword_id
          and date_trunc('week', r2.measured_on) = date_trunc('week', r.measured_on));
  get diagnostics n = row_count;
  etape := 'positions diluées à la semaine'; lignes := n; return next;

  -- 3. Puis, au-delà de la fenêtre hebdomadaire, un relevé par mois.
  delete from public.keyword_reading r
   using public.tracked_keyword k, public.agency_settings s
   where r.keyword_id = k.id
     and s.agency_id = k.agency_id
     and r.measured_on < current_date - s.serp_weekly_days
     and r.measured_on <> (
       select max(r2.measured_on) from public.keyword_reading r2
        where r2.keyword_id = r.keyword_id
          and date_trunc('month', r2.measured_on) = date_trunc('month', r.measured_on));
  get diagnostics n = row_count;
  etape := 'positions diluées au mois'; lignes := n; return next;

  -- 4. Positions locales : « même dilution que les positions SERP ». Relevées
  --    mensuellement, seule l'étape mensuelle les concerne — et un point isolé
  --    ne se supprime pas sans les autres points du même relevé.
  delete from public.local_position p
   using public.local_keyword k, public.agency_settings s
   where p.keyword_id = k.id
     and s.agency_id = k.agency_id
     and p.measured_on < current_date - s.serp_weekly_days
     and p.measured_on <> (
       select max(p2.measured_on) from public.local_position p2
        where p2.keyword_id = p.keyword_id
          and date_trunc('month', p2.measured_on) = date_trunc('month', p.measured_on));
  get diagnostics n = row_count;
  etape := 'positions locales diluées au mois'; lignes := n; return next;

  return;
end;
$$;

comment on function app.purge_expired_data() is
  'Règle 3 de docs/decisions.md — péremption du cache et dilution des séries, '
  'avec les seuils de chaque agence. À planifier quotidiennement.';


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.tool_run           enable row level security;
alter table public.tool_save          enable row level security;
alter table public.keyword_suggestion enable row level security;
alter table public.gap_competitor     enable row level security;
alter table public.gap_row            enable row level security;
alter table public.gap_position       enable row level security;
alter table public.domain_reading     enable row level security;
alter table public.domain_top_page    enable row level security;
alter table public.domain_top_query   enable row level security;
alter table public.domain_geo_share   enable row level security;
alter table public.traffic_drop       enable row level security;
alter table public.prospect_audit     enable row level security;
alter table public.audit_url_change   enable row level security;

create policy tool_run_agency_all on public.tool_run
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy tool_save_agency_all on public.tool_save
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy domain_reading_agency_all on public.domain_reading
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy traffic_drop_agency_all on public.traffic_drop
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy prospect_audit_agency_all on public.prospect_audit
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Les résultats suivent l'appel qui les a produits.
create policy keyword_suggestion_agency_all on public.keyword_suggestion
  for all to authenticated
  using (exists (select 1 from public.tool_run r
                  where r.id = public.keyword_suggestion.tool_run_id
                    and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.tool_run r
                  where r.id = public.keyword_suggestion.tool_run_id
                    and r.agency_id = app.current_agency_id()));

create policy gap_competitor_agency_all on public.gap_competitor
  for all to authenticated
  using (exists (select 1 from public.tool_run r
                  where r.id = public.gap_competitor.tool_run_id
                    and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.tool_run r
                  where r.id = public.gap_competitor.tool_run_id
                    and r.agency_id = app.current_agency_id()));

create policy gap_row_agency_all on public.gap_row
  for all to authenticated
  using (exists (select 1 from public.tool_run r
                  where r.id = public.gap_row.tool_run_id
                    and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.tool_run r
                  where r.id = public.gap_row.tool_run_id
                    and r.agency_id = app.current_agency_id()));

create policy gap_position_agency_all on public.gap_position
  for all to authenticated
  using (exists (select 1 from public.gap_row g
                  join public.tool_run r on r.id = g.tool_run_id
                  where g.id = public.gap_position.row_id
                    and r.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.gap_row g
                  join public.tool_run r on r.id = g.tool_run_id
                  where g.id = public.gap_position.row_id
                    and r.agency_id = app.current_agency_id()));

-- Les détails d'un relevé de domaine suivent le relevé.
create policy domain_top_page_agency_all on public.domain_top_page
  for all to authenticated
  using (exists (select 1 from public.domain_reading d
                  where d.id = public.domain_top_page.reading_id
                    and d.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.domain_reading d
                  where d.id = public.domain_top_page.reading_id
                    and d.agency_id = app.current_agency_id()));

create policy domain_top_query_agency_all on public.domain_top_query
  for all to authenticated
  using (exists (select 1 from public.domain_reading d
                  where d.id = public.domain_top_query.reading_id
                    and d.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.domain_reading d
                  where d.id = public.domain_top_query.reading_id
                    and d.agency_id = app.current_agency_id()));

create policy domain_geo_share_agency_all on public.domain_geo_share
  for all to authenticated
  using (exists (select 1 from public.domain_reading d
                  where d.id = public.domain_geo_share.reading_id
                    and d.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.domain_reading d
                  where d.id = public.domain_geo_share.reading_id
                    and d.agency_id = app.current_agency_id()));

create policy audit_url_change_agency_all on public.audit_url_change
  for all to authenticated
  using (exists (select 1 from public.audit a
                  where a.id = public.audit_url_change.audit_id
                    and a.agency_id = app.current_agency_id()))
  with check (exists (select 1 from public.audit a
                  where a.id = public.audit_url_change.audit_id
                    and a.agency_id = app.current_agency_id()));
