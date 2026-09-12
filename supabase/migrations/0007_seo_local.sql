-- =============================================================================
-- 0007 — SEO local : fiche Google Business, avis, citations, positions, rivaux
-- =============================================================================
-- Le SEO local est une section entière, pas un outil de plus : cinq écrans par
-- établissement (`lib/data/local*.ts`). Le travail de cette migration est
-- surtout un travail de retrait — le code fige aujourd'hui quantité de valeurs
-- qui se déduisent, et qui finissent donc par se contredire :
--
--   · `scorePrev`, `packPosPrev`, `prevMoy`, `appelsD`, `itinD`, `visitesD` —
--     six champs « valeur précédente / variation » recopiés à la main. Ils
--     deviennent une série : la valeur précédente, c'est le relevé d'avant.
--   · `alerts: AlertId[]` — sept alertes saisies alors qu'elles se lisent
--     toutes dans les données (une fiche suspendue *est* suspendue). Le code
--     n'en affichait d'ailleurs qu'une par établissement, la plus grave, et
--     omettait les autres : Acme porte trois incohérences de NAP sans que
--     l'alerte correspondante soit listée. Elles passent en vue.
--   · `posMoy`, `posMin`, `posMax` — moyenne, minimum et maximum d'une série
--     de points, recopiés à côté de la série.
--   · `citTotal`, `citRef` — deux dénombrements de la liste d'annuaires.
--   · `criteres: LocalCriterion[]` — `local.ts` dit lui-même que ces critères
--     « reprennent mot pour mot les libellés et les seuils de la dimension
--     presence de audit.ts ». Une seule table les porte donc : celle de
--     l'audit, à qui il manquait seulement de savoir de quel établissement
--     elle parle (Clinique Lavoie a deux fiches sous le même audit A-0140).
--   · `CompetitorGap.vous` — notre propre chiffre recopié dans la fiche du
--     rival, où il se périme au premier nouvel avis.
--   · `Publication.expiree` — une date d'échéance passée, rien de plus.
--
-- Ce qui reste stocké, ce sont les mesures qui viennent du dehors : ce que
-- Google rapporte (note globale, nombre d'avis, appels, itinéraires), ce
-- qu'un relevé constate (position d'un point), et ce qu'un humain écrit.
-- =============================================================================


-- =============================================================================
-- Vocabulaires
-- =============================================================================

create type public.local_review_state as enum (
  'sans_reponse',  -- reçu, rien de rédigé
  'a_relire',      -- une réponse est rédigée, personne ne l'a encore validée
  'publiee',       -- la réponse est en ligne
  'signale'        -- avis contesté auprès de Google
);

create type public.citation_state as enum (
  'conforme',
  'incoherent',
  'absent',
  'doublon',
  'inaccessible'   -- l'annuaire n'a pas répondu au dernier relevé
);

create type public.directory_authority as enum ('haute', 'moyenne', 'faible');

-- Les champs qu'un annuaire peut publier de travers. Les quatre premiers ont
-- une valeur de référence sur l'établissement ; les suivants n'en ont pas.
create type public.nap_field as enum (
  'nom', 'adresse', 'telephone', 'site_web',
  'horaires', 'categorie', 'autre'
);

-- Les neuf champs de la fiche Google Business (`ALL_GBP_FIELDS`). Un
-- vocabulaire fermé : « complétude 6 sur 9 » n'a de sens que si le
-- dénominateur ne bouge pas.
create type public.gbp_field as enum (
  'nom_coordonnees', 'categories', 'horaires', 'photos', 'description',
  'services', 'zone_desservie', 'attributs', 'site_web'
);

create type public.gbp_post_type as enum ('offre', 'mise_a_jour', 'evenement');

create type public.sentiment_polarity as enum ('positif', 'negatif');


-- Un tableau de valeurs sans doublon — sinon « 6 champs sur 9 » se calcule
-- faux. Immuable, donc utilisable dans une contrainte de vérification.
create or replace function app.array_is_distinct(arr anyarray)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(cardinality(arr), 0) = (select count(distinct e) from unnest(arr) e);
$$;


-- =============================================================================
-- Réglages d'agence
-- =============================================================================

alter table public.agency_settings
  -- Prix d'un point de mesure sur la grille (`GRID_POINT_PRICE`). Affiché avec
  -- le réglage de la grille, jamais après coup : c'est le client qui paie.
  add column grid_point_price_cents integer not null default 35,
  -- Recul de position à partir duquel le pack local remonte une alerte. Le
  -- code le décidait implicitement (Marché Bio alerte à −3,3 places, Acme non
  -- à −0,2) ; le seuil devient un réglage nommé.
  add column pack_drop_alert_places numeric(4,1) not null default 1.0,
  add constraint agency_settings_grid_price_positive
    check (grid_point_price_cents >= 0),
  add constraint agency_settings_pack_drop_positive
    check (pack_drop_alert_places > 0);


-- Une agence sans ligne de réglages perd silencieusement ses seuils : les
-- alertes qui en dépendent cessent simplement de remonter, sans erreur nulle
-- part. Puisque toutes les colonnes ont une valeur par défaut, la ligne n'a
-- aucune raison de manquer — elle naît avec l'agence.
create or replace function app.create_agency_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.agency_settings (agency_id) values (new.id)
  on conflict (agency_id) do nothing;
  return new;
end;
$$;

create trigger agency_settings_autocreate
  after insert on public.agency
  for each row execute function app.create_agency_settings();

-- Les agences déjà créées rattrapent la leur.
insert into public.agency_settings (agency_id)
select a.id from public.agency a
on conflict (agency_id) do nothing;


-- =============================================================================
-- L'établissement gagne son identité de référence
-- =============================================================================
-- `REFERENCE_BY_ETAB` porte le nom, l'adresse, le téléphone et le site tels
-- qu'ils *doivent* apparaître partout. C'est la référence contre laquelle on
-- compare chaque annuaire — elle appartient donc à l'établissement, et nulle
-- part ailleurs. `name` reste le nom d'affichage interne (« Acme Corp. —
-- siège ») ; `nap_name` est le nom commercial publié (« Acme Corp. »).

alter table public.establishment
  add column nap_name text,
  add column phone    text,
  add column website  text;


-- =============================================================================
-- Le relevé — ce que Google rapporte à une date donnée
-- =============================================================================
-- Une ligne par établissement et par relevé. Toutes les variations affichées
-- (« +6 », « −11 », « −0,1 sur 90 jours ») se lisent en comparant deux lignes,
-- et ne se stockent donc pas.

create table public.establishment_reading (
  id                    uuid primary key default gen_random_uuid(),
  agency_id             uuid not null references public.agency(id) on delete cascade,
  establishment_id      uuid not null references public.establishment(id) on delete cascade,
  measured_on           date not null default current_date,

  -- Score local composite, calculé par la chaîne de relevé puis recopié ici :
  -- c'est une note d'ensemble, pas une mesure brute.
  local_score           smallint,

  -- Note globale et nombre d'avis tels que Google les publie. Ils ne se
  -- déduisent pas de `local_review` : on ne récupère qu'une partie des avis
  -- (neuf sur les quatre-vingt-sept d'Acme).
  rating                numeric(2,1),
  review_count          integer,

  -- Cohérence nom·adresse·téléphone : « 3 incohérences sur 14 sources ».
  -- Le dénominateur compte les sources réellement interrogées, annuaires
  -- compris mais pas seulement — il ne se déduit pas de `citation`.
  nap_inconsistencies   integer,
  nap_sources           integer,

  -- Statistiques de la fiche (`EstabStats`).
  calls                 integer,
  direction_requests    integer,
  profile_views         integer,

  -- Complétude de la fiche : on stocke ce qui manque, le nombre de champs
  -- remplis s'en déduit. `null` quand la fiche n'est pas accessible.
  gbp_missing_fields    public.gbp_field[],
  gbp_filled            smallint generated always as (
                          case when gbp_missing_fields is null then null
                               else 9 - coalesce(cardinality(gbp_missing_fields), 0) end
                        ) stored,

  created_at            timestamptz not null default now(),

  constraint establishment_reading_unique unique (establishment_id, measured_on),
  constraint establishment_reading_score_range
    check (local_score is null or local_score between 0 and 100),
  constraint establishment_reading_rating_range
    check (rating is null or rating between 0 and 5),
  constraint establishment_reading_counts_positive check (
    coalesce(review_count, 0) >= 0 and coalesce(calls, 0) >= 0
    and coalesce(direction_requests, 0) >= 0 and coalesce(profile_views, 0) >= 0
  ),
  -- Une mesure ne s'affiche jamais sans son dénominateur (même convention que
  -- « mesure sans seuil » en phase 1).
  constraint establishment_reading_nap_pairing check (
    (nap_inconsistencies is null) = (nap_sources is null)
  ),
  constraint establishment_reading_nap_within_sources check (
    nap_inconsistencies is null or nap_inconsistencies <= nap_sources
  ),
  constraint establishment_reading_missing_fields_distinct
    check (app.array_is_distinct(gbp_missing_fields))
);

create index establishment_reading_estab_idx
  on public.establishment_reading (establishment_id, measured_on desc);
create index establishment_reading_agency_idx
  on public.establishment_reading (agency_id);


-- =============================================================================
-- Les avis, et la relecture des réponses
-- =============================================================================
-- Même thèse que la règle 1 : rien ne part vers le public sans qu'un humain
-- l'ait lu. Une réponse rédigée par l'agent reste un brouillon (`a_relire`)
-- jusqu'à validation ; l'état et le texte ne peuvent pas se contredire.

create table public.local_review (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references public.agency(id) on delete cascade,
  establishment_id  uuid not null references public.establishment(id) on delete cascade,

  -- Identifiant de l'avis chez le fournisseur : c'est lui qui empêche
  -- d'importer deux fois le même avis.
  external_id       text not null,

  author            text,           -- null = avis anonyme
  rating            smallint not null,
  published_on      date not null,
  body              text,           -- un avis peut n'être qu'une note

  state             public.local_review_state not null default 'sans_reponse',
  response          text,           -- la réponse en ligne
  response_draft    text,           -- la réponse rédigée, pas encore validée
  flag_reason       text,           -- le motif du signalement à Google

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint local_review_unique unique (establishment_id, external_id),
  constraint local_review_rating_range check (rating between 1 and 5),

  -- L'état dit exactement ce qui existe, et rien d'autre.
  constraint local_review_state_matches_content check (
    case state
      when 'sans_reponse' then response is null and response_draft is null
      when 'a_relire'     then response is null and response_draft is not null
      when 'publiee'      then response is not null
      when 'signale'      then flag_reason is not null
    end
  ),
  constraint local_review_flag_reason_only_when_flagged check (
    state = 'signale' or flag_reason is null
  )
);

create index local_review_estab_idx on public.local_review (establishment_id, published_on desc);
create index local_review_agency_idx on public.local_review (agency_id);
-- Les avis négatifs restés sans réponse : c'est la question posée à chaque
-- ouverture de l'écran, et l'alerte la plus grave du portefeuille.
create index local_review_unanswered_idx on public.local_review (establishment_id)
  where state = 'sans_reponse';

create trigger local_review_touch
  before update on public.local_review
  for each row execute function app.touch_updated_at();


-- Les thèmes qu'un avis mentionne (`sentiments: string[]`).
create table public.local_review_theme (
  review_id  uuid not null references public.local_review(id) on delete cascade,
  theme      text not null,
  primary key (review_id, theme)
);


-- L'analyse de sentiment : un dénombrement sur l'ensemble du corpus, plus une
-- observation écrite. Les comptes ne se déduisent pas des avis importés — ils
-- portent sur tous les avis, pas sur l'échantillon.
create table public.review_analysis (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references public.agency(id) on delete cascade,
  establishment_id  uuid not null references public.establishment(id) on delete cascade,
  analysed_on       date not null default current_date,
  insight           text,
  created_at        timestamptz not null default now(),

  constraint review_analysis_unique unique (establishment_id, analysed_on)
);

create index review_analysis_agency_idx on public.review_analysis (agency_id);

create table public.review_theme_count (
  analysis_id   uuid not null references public.review_analysis(id) on delete cascade,
  polarity      public.sentiment_polarity not null,
  theme         text not null,
  occurrences   integer not null,
  primary key (analysis_id, theme),
  constraint review_theme_count_positive check (occurrences > 0)
);


-- =============================================================================
-- Les citations en annuaire
-- =============================================================================
-- La liste d'annuaires de référence dépend du métier : Boréal a Centris,
-- Clinique Lavoie a le répertoire de la RAMQ. C'est donc un vocabulaire
-- d'agence, et « 12 annuaires sur 20 de référence » se compte sur les lignes.

create table public.directory (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agency(id) on delete cascade,
  slug        text not null,
  name        text not null,
  authority   public.directory_authority not null default 'moyenne',
  created_at  timestamptz not null default now(),

  constraint directory_slug_unique unique (agency_id, slug)
);

create index directory_agency_idx on public.directory (agency_id);

create table public.citation (
  id                 uuid primary key default gen_random_uuid(),
  agency_id          uuid not null references public.agency(id) on delete cascade,
  establishment_id   uuid not null references public.establishment(id) on delete cascade,
  directory_id       uuid not null references public.directory(id) on delete cascade,

  state              public.citation_state not null,
  checked_on         date,

  -- Un état qui demande une explication ne peut pas rester nu.
  duplicate_note     text,
  unreachable_note   text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint citation_unique unique (establishment_id, directory_id),
  constraint citation_duplicate_needs_note check (
    (state = 'doublon') = (duplicate_note is not null)
  ),
  constraint citation_unreachable_needs_note check (
    (state = 'inaccessible') = (unreachable_note is not null)
  ),
  -- Un annuaire inaccessible n'a pas été constaté : la date de relevé dit
  -- quand la tentative a eu lieu, elle est donc obligatoire.
  constraint citation_unreachable_needs_date check (
    state <> 'inaccessible' or checked_on is not null
  )
);

create index citation_estab_idx on public.citation (establishment_id);
create index citation_directory_idx on public.citation (directory_id);
create index citation_agency_idx on public.citation (agency_id);

create trigger citation_touch
  before update on public.citation
  for each row execute function app.touch_updated_at();


-- Le détail d'une incohérence : quel champ, et ce que l'annuaire publie.
-- La valeur *attendue* n'est pas recopiée ici pour les quatre champs de
-- référence — elle se lit sur l'établissement, sinon elle se met à diverger de
-- la référence qu'elle est censée faire respecter.
create table public.citation_mismatch (
  id              uuid primary key default gen_random_uuid(),
  citation_id     uuid not null references public.citation(id) on delete cascade,
  field           public.nap_field not null,
  published_value text not null,
  expected_value  text,

  constraint citation_mismatch_unique unique (citation_id, field),
  constraint citation_mismatch_expected_only_off_reference check (
    (field in ('nom', 'adresse', 'telephone', 'site_web')) = (expected_value is null)
  )
);

create index citation_mismatch_citation_idx on public.citation_mismatch (citation_id);


-- Une citation incohérente nomme au moins un champ qui diffère, et seule une
-- citation incohérente en porte. Vérifié en fin de transaction : l'état et ses
-- écarts s'écrivent en deux instructions.
create or replace function app.assert_citation_mismatch_pairing(cid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare st public.citation_state; n integer;
begin
  select c.state into st from public.citation c where c.id = cid;
  if st is null then return; end if;               -- citation supprimée entre-temps
  select count(*) into n from public.citation_mismatch m where m.citation_id = cid;

  if st = 'incoherent' and n = 0 then
    raise exception
      'Une citation incohérente doit nommer au moins un champ qui diffère (citation %)', cid;
  end if;
  if st <> 'incoherent' and n > 0 then
    raise exception
      'Seule une citation incohérente peut porter des écarts de champ (citation %)', cid;
  end if;
end;
$$;

create or replace function app.citation_pairing_from_citation()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform app.assert_citation_mismatch_pairing(new.id);
  return null;
end;
$$;

create or replace function app.citation_pairing_from_mismatch()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform app.assert_citation_mismatch_pairing(
    case when tg_op = 'DELETE' then old.citation_id else new.citation_id end);
  return null;
end;
$$;

create constraint trigger citation_mismatch_pairing_on_citation
  after insert or update of state on public.citation
  deferrable initially deferred
  for each row execute function app.citation_pairing_from_citation();

create constraint trigger citation_mismatch_pairing_on_mismatch
  after insert or update or delete on public.citation_mismatch
  deferrable initially deferred
  for each row execute function app.citation_pairing_from_mismatch();


-- =============================================================================
-- Les positions locales
-- =============================================================================
-- « La position varie selon l'endroit d'où l'on cherche » : une mesure par
-- point (ou par secteur) et par requête. La moyenne, le minimum, le maximum et
-- la valeur précédente se calculent — ils ne se saisissent pas.

create table public.local_keyword (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references public.agency(id) on delete cascade,
  establishment_id  uuid not null references public.establishment(id) on delete cascade,
  query             text not null,
  -- La requête principale : c'est la sienne que le portefeuille affiche comme
  -- « position pack local » de l'établissement.
  is_primary        boolean not null default false,
  created_at        timestamptz not null default now(),

  constraint local_keyword_unique unique (establishment_id, query)
);

create unique index local_keyword_one_primary
  on public.local_keyword (establishment_id) where is_primary;
create index local_keyword_agency_idx on public.local_keyword (agency_id);

create table public.local_position (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  keyword_id   uuid not null references public.local_keyword(id) on delete cascade,
  measured_on  date not null default current_date,

  -- Une grille de points, ou des secteurs nommés — jamais les deux.
  point_row    smallint,
  point_col    smallint,
  sector_name  text,

  -- null = le point a bien été relevé, l'établissement n'y est pas classé.
  -- Un point non relevé n'a pas de ligne du tout.
  position     smallint,

  created_at   timestamptz not null default now(),

  constraint local_position_one_shape check (
    (point_row is not null and point_col is not null and sector_name is null)
    or (point_row is null and point_col is null and sector_name is not null)
  ),
  constraint local_position_range check (position is null or position > 0)
);

create unique index local_position_grid_unique
  on public.local_position (keyword_id, measured_on, point_row, point_col)
  where sector_name is null;
create unique index local_position_sector_unique
  on public.local_position (keyword_id, measured_on, sector_name)
  where sector_name is not null;
create index local_position_keyword_idx on public.local_position (keyword_id, measured_on);
create index local_position_agency_idx on public.local_position (agency_id);


-- =============================================================================
-- La concurrence locale
-- =============================================================================

create table public.competitor (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references public.agency(id) on delete cascade,
  establishment_id  uuid not null references public.establishment(id) on delete cascade,

  name              text not null,
  -- « apparaît sur 18 des 25 points relevés »
  appearances       integer,
  appearances_total integer,
  rating            numeric(2,1),
  review_count      integer,
  completeness      smallint,
  categories        text[],

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint competitor_unique unique (establishment_id, name),
  constraint competitor_rating_range check (rating is null or rating between 0 and 5),
  constraint competitor_completeness_range
    check (completeness is null or completeness between 0 and 100),
  constraint competitor_appearances_pairing check (
    (appearances is null) = (appearances_total is null)
  ),
  constraint competitor_appearances_within_total check (
    appearances is null or appearances <= appearances_total
  )
);

create index competitor_estab_idx on public.competitor (establishment_id);
create index competitor_agency_idx on public.competitor (agency_id);

create trigger competitor_touch
  before update on public.competitor
  for each row execute function app.touch_updated_at();

-- Les requêtes et les secteurs sur lesquels on se croise.
create table public.competitor_overlap (
  competitor_id  uuid not null references public.competitor(id) on delete cascade,
  kind           text not null check (kind in ('requete', 'secteur')),
  value          text not null,
  primary key (competitor_id, kind, value)
);

-- L'écart relevé sur un levier. `vous` n'est pas stocké : notre chiffre se lit
-- sur nos propres relevés, sinon il reste figé au jour de l'analyse.
create table public.competitor_gap (
  id             uuid primary key default gen_random_uuid(),
  competitor_id  uuid not null references public.competitor(id) on delete cascade,
  lever          text not null,
  their_value    text not null,
  action         text not null,
  created_at     timestamptz not null default now(),

  constraint competitor_gap_unique unique (competitor_id, lever)
);

create index competitor_gap_competitor_idx on public.competitor_gap (competitor_id);


-- =============================================================================
-- Publications et questions de la fiche
-- =============================================================================

create table public.gbp_post (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references public.agency(id) on delete cascade,
  establishment_id  uuid not null references public.establishment(id) on delete cascade,

  published_on      date not null,
  -- Une offre ou un événement se périment ; une mise à jour non. « Expirée »
  -- n'est donc pas un état à cocher, c'est une date passée.
  expires_on        date,
  kind              public.gbp_post_type not null,
  body              text not null,
  views             integer not null default 0,

  created_at        timestamptz not null default now(),

  constraint gbp_post_expiry_after_publication check (
    expires_on is null or expires_on >= published_on
  ),
  constraint gbp_post_update_never_expires check (
    kind <> 'mise_a_jour' or expires_on is null
  ),
  constraint gbp_post_views_positive check (views >= 0)
);

create index gbp_post_estab_idx on public.gbp_post (establishment_id, published_on desc);
create index gbp_post_agency_idx on public.gbp_post (agency_id);

create table public.gbp_question (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references public.agency(id) on delete cascade,
  establishment_id  uuid not null references public.establishment(id) on delete cascade,

  asked_on          date not null,
  body              text not null,
  answer            text,
  answered_on       date,

  created_at        timestamptz not null default now(),

  constraint gbp_question_answer_pairing check (
    (answer is null) = (answered_on is null)
  ),
  constraint gbp_question_answer_after_question check (
    answered_on is null or answered_on >= asked_on
  )
);

create index gbp_question_estab_idx on public.gbp_question (establishment_id, asked_on desc);
create index gbp_question_agency_idx on public.gbp_question (agency_id);
-- Les questions restées sans réponse : la seule chose qu'on cherche ici.
create index gbp_question_unanswered_idx on public.gbp_question (establishment_id)
  where answer is null;


-- =============================================================================
-- Les critères de présence appartiennent à l'audit, pas à l'écran local
-- =============================================================================
-- `local.ts` le dit lui-même : ses critères « reprennent mot pour mot les
-- libellés et les seuils de la dimension presence de audit.ts ». Il manquait
-- seulement à l'audit de savoir de quelle fiche il parle — Clinique Lavoie a
-- deux établissements sous le même audit A-0140, avec des constats différents.

alter table public.audit_criterion
  add column establishment_id uuid references public.establishment(id) on delete cascade,
  -- Seule la présence en ligne se constate établissement par établissement :
  -- un défaut de balisage ou de design porte sur le site, pas sur une fiche.
  add constraint audit_criterion_establishment_only_presence check (
    establishment_id is null or dimension = 'presence'
  );

create index audit_criterion_establishment_idx
  on public.audit_criterion (establishment_id);


-- =============================================================================
-- Ce qui se déduit
-- =============================================================================

-- L'état des citations d'un établissement : « 12 annuaires sur 20 de
-- référence », « 3 incohérences ». Deux dénombrements, plus jamais recopiés.
create view public.establishment_citation_summary as
select
  c.establishment_id,
  count(*)                                                   as directories_referenced,
  count(*) filter (where c.state not in ('absent', 'inaccessible')) as directories_present,
  count(*) filter (where c.state = 'incoherent')             as inconsistent,
  count(*) filter (where c.state = 'doublon')                as duplicated,
  count(*) filter (where c.state = 'absent')                 as missing,
  count(*) filter (where c.state = 'inaccessible')           as unreachable
from public.citation c
group by c.establishment_id;

alter view public.establishment_citation_summary set (security_invoker = on);


-- Une requête, un relevé : la moyenne, l'étendue, et la valeur du relevé
-- précédent. Les quatre champs que `KeywordPos` figeait.
create view public.local_keyword_reading as
select
  k.id                                     as keyword_id,
  k.establishment_id,
  k.query,
  k.is_primary,
  p.measured_on,
  round(avg(p.position)::numeric, 1)       as position_avg,
  min(p.position)                          as position_min,
  max(p.position)                          as position_max,
  count(*)                                 as points_measured,
  count(*) filter (where p.position is null) as points_unranked,
  lag(round(avg(p.position)::numeric, 1))
    over (partition by k.id order by p.measured_on) as position_avg_previous
from public.local_keyword k
join public.local_position p on p.keyword_id = k.id
group by k.id, k.establishment_id, k.query, k.is_primary, p.measured_on;

alter view public.local_keyword_reading set (security_invoker = on);


-- La carte : un point, une position moyenne sur toutes les requêtes suivies.
create view public.local_grid_point as
select
  k.establishment_id,
  p.measured_on,
  p.point_row,
  p.point_col,
  p.sector_name,
  round(avg(p.position)::numeric, 1) as position_avg
from public.local_position p
join public.local_keyword k on k.id = p.keyword_id
group by k.establishment_id, p.measured_on, p.point_row, p.point_col, p.sector_name;

alter view public.local_grid_point set (security_invoker = on);


-- Les alertes du portefeuille. Sept états saisis à la main dans le code, qui
-- se lisent tous dans les données. `rank` donne la gravité : l'écran de
-- portefeuille n'en montre qu'une par établissement, la plus grave.
create view public.establishment_alert as
with dernier as (
  select distinct on (r.establishment_id) r.*
  from public.establishment_reading r
  order by r.establishment_id, r.measured_on desc
),
precedent as (
  select establishment_id, local_score, measured_on,
         lag_score, lag_on
  from (
    select r.establishment_id, r.local_score, r.measured_on,
           lag(r.local_score) over w as lag_score,
           lag(r.measured_on) over w as lag_on,
           row_number() over (partition by r.establishment_id order by r.measured_on desc) as rn
    from public.establishment_reading r
    window w as (partition by r.establishment_id order by r.measured_on)
  ) s where rn = 1
),
pack as (
  select establishment_id, position_avg, position_avg_previous
  from (
    select lkr.*, row_number() over (
             partition by lkr.establishment_id order by lkr.measured_on desc) as rn
    from public.local_keyword_reading lkr
    where lkr.is_primary
  ) s where rn = 1
)
select e.id as establishment_id, e.agency_id, a.code, a.rank
from public.establishment e
cross join lateral (
  values
    ('fiche_suspendue',        1, e.gbp_state = 'suspendue'),
    ('fiche_tiers',            1, e.gbp_state = 'tiers'),
    ('avis_negatif',           1, exists (
        select 1 from public.local_review r
        where r.establishment_id = e.id and r.state = 'sans_reponse' and r.rating <= 2)),
    ('fiche_non_revendiquee',  2, e.gbp_state = 'non_revendiquee'),
    ('chute_position',         2, exists (
        select 1 from pack p
        join public.agency_settings s on s.agency_id = e.agency_id
        where p.establishment_id = e.id
          and p.position_avg_previous is not null
          and p.position_avg - p.position_avg_previous >= s.pack_drop_alert_places)),
    ('incoherence',            3, exists (
        select 1 from public.establishment_citation_summary cs
        where cs.establishment_id = e.id and cs.inconsistent > 0)),
    ('zone_non_configuree',    3, e.gbp_state = 'revendiquee' and e.zone is null)
) as a(code, rank, applies)
where a.applies;

alter view public.establishment_alert set (security_invoker = on);


-- =============================================================================
-- Cloisonnement
-- =============================================================================

alter table public.establishment_reading enable row level security;
alter table public.local_review          enable row level security;
alter table public.local_review_theme    enable row level security;
alter table public.review_analysis       enable row level security;
alter table public.review_theme_count    enable row level security;
alter table public.directory             enable row level security;
alter table public.citation              enable row level security;
alter table public.citation_mismatch     enable row level security;
alter table public.local_keyword         enable row level security;
alter table public.local_position        enable row level security;
alter table public.competitor            enable row level security;
alter table public.competitor_overlap    enable row level security;
alter table public.competitor_gap        enable row level security;
alter table public.gbp_post              enable row level security;
alter table public.gbp_question          enable row level security;

create policy establishment_reading_agency_all on public.establishment_reading
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy local_review_agency_all on public.local_review
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy review_analysis_agency_all on public.review_analysis
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy directory_agency_all on public.directory
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy citation_agency_all on public.citation
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy local_keyword_agency_all on public.local_keyword
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy local_position_agency_all on public.local_position
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy competitor_agency_all on public.competitor
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy gbp_post_agency_all on public.gbp_post
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy gbp_question_agency_all on public.gbp_question
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Les tables de détail suivent leur parent : elles ne portent pas d'agence,
-- c'est le parent qui la porte.
create policy local_review_theme_agency_all on public.local_review_theme
  for all to authenticated
  using (exists (
    select 1 from public.local_review r
    where r.id = public.local_review_theme.review_id
      and r.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.local_review r
    where r.id = public.local_review_theme.review_id
      and r.agency_id = app.current_agency_id()));

create policy review_theme_count_agency_all on public.review_theme_count
  for all to authenticated
  using (exists (
    select 1 from public.review_analysis a
    where a.id = public.review_theme_count.analysis_id
      and a.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.review_analysis a
    where a.id = public.review_theme_count.analysis_id
      and a.agency_id = app.current_agency_id()));

create policy citation_mismatch_agency_all on public.citation_mismatch
  for all to authenticated
  using (exists (
    select 1 from public.citation c
    where c.id = public.citation_mismatch.citation_id
      and c.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.citation c
    where c.id = public.citation_mismatch.citation_id
      and c.agency_id = app.current_agency_id()));

create policy competitor_overlap_agency_all on public.competitor_overlap
  for all to authenticated
  using (exists (
    select 1 from public.competitor k
    where k.id = public.competitor_overlap.competitor_id
      and k.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.competitor k
    where k.id = public.competitor_overlap.competitor_id
      and k.agency_id = app.current_agency_id()));

create policy competitor_gap_agency_all on public.competitor_gap
  for all to authenticated
  using (exists (
    select 1 from public.competitor k
    where k.id = public.competitor_gap.competitor_id
      and k.agency_id = app.current_agency_id()))
  with check (exists (
    select 1 from public.competitor k
    where k.id = public.competitor_gap.competitor_id
      and k.agency_id = app.current_agency_id()));


-- Le portail : le client voit sa fiche et ses chiffres de fiche — les appels,
-- les itinéraires, les visites sont à lui. Il ne voit ni la liste des
-- incohérences, ni les brouillons de réponse en attente de relecture, ni
-- l'analyse de ses rivaux : c'est le travail de l'agence, pas le bilan du
-- client (règle 1).
create policy establishment_portal_read on public.establishment
  for select to authenticated
  using (client_id = app.current_client_id());

create policy establishment_reading_portal_read on public.establishment_reading
  for select to authenticated
  using (exists (
    select 1 from public.establishment e
    where e.id = public.establishment_reading.establishment_id
      and e.client_id = app.current_client_id()));
