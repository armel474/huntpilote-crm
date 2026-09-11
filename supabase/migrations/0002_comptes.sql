-- =============================================================================
-- 0002 — Comptes : clients, prospects, services, contacts, établissements
-- =============================================================================
-- La racine du modèle. `clientId` apparaît aujourd'hui dans une quinzaine de
-- fichiers de `lib/data/` ; tout en dépend.
--
-- Plusieurs choix ci-dessous corrigent des incohérences relevées dans le code
-- actuel — elles sont signalées par « ⚠ » et détaillées dans
-- docs/reconciliation-donnees.md.
-- =============================================================================

-- Un compte est un client OU un prospect. C'est déjà l'union discriminée de
-- `lib/data/clients.ts` ; gagner un deal fait passer le compte de l'un à
-- l'autre (voir migration 0004, `deal`).
create type public.client_type as enum ('client', 'prospect');

-- Un seul vocabulaire de canal pour toute l'application. ⚠ Le code actuel en a
-- trois — `ContactChannel` ('email'|'phone'|'sms'), `ExchangeChannel` (4
-- valeurs) et `ChannelId` (8 valeurs) — avec 'email' et 'courriel' pour la
-- même chose.
create type public.communication_channel as enum (
  'courriel', 'portail', 'whatsapp', 'messenger', 'slack',
  'appel', 'reunion', 'note'
);


-- =============================================================================
-- Le compte
-- =============================================================================

create table public.client (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references public.agency(id) on delete cascade,

  -- Ce que les routes exposent : /clients/acme-corp
  slug          text not null,
  name          text not null,
  initials      text not null,
  type          public.client_type not null,

  -- Identité — ce que l'import d'onboarding apporte, et rien d'autre
  -- (décision 13 : tout le reste vient de l'audit).
  sector        text,
  domain        text,
  email         text,
  phone         text,
  address       text,
  context       text,

  -- Contrat. ⚠ `mrr` est une chaîne formatée (« 1 200 $ CA ») dans
  -- `clients.ts` et un nombre dans `pipeline.ts` ; ici, des cents, en entier,
  -- pour que la somme d'un portefeuille soit calculable.
  mrr_cents     integer,
  plan          text,
  engagement    text,
  since         date,

  -- Chargé de compte. Décision 12 : chaque objet porte un responsable dès
  -- maintenant, même si l'agence est mono-utilisateur.
  owner_id      uuid references public.agency_member(id) on delete set null,

  -- Score de santé, moyenne pondérée des trois dimensions du dernier audit
  -- (décision 13). Dénormalisé volontairement : le Client Hub affiche dix
  -- comptes d'un coup, et l'audit est le seul écrivain de ces deux colonnes.
  health_score       smallint,
  health_score_prev  smallint,

  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint client_slug_unique unique (agency_id, slug),
  constraint client_health_range check (
    (health_score is null or health_score between 0 and 100)
    and (health_score_prev is null or health_score_prev between 0 and 100)
  ),
  constraint client_mrr_positive check (mrr_cents is null or mrr_cents >= 0)
);

create index client_agency_idx on public.client (agency_id);
create index client_owner_idx  on public.client (owner_id);
create index client_type_idx   on public.client (agency_id, type);

create trigger client_touch
  before update on public.client
  for each row execute function app.touch_updated_at();

comment on column public.client.health_score is
  'Moyenne pondérée des trois dimensions du dernier audit. Écrit par l''audit, jamais à la main.';


-- =============================================================================
-- Les services souscrits
-- =============================================================================
-- ⚠ Le code référence les services de trois façons : des identifiants dans
-- `onboarding.SERVICES` (`seotech`, `contenu`…), des libellés dans
-- `ClientRecord.services` et `Deal.services` (« SEO Tech. »…), et un compteur
-- figé `servicesCount`. Un référentiel plus une table de jointure remplacent
-- les trois — et `servicesCount` se compte au lieu de se stocker.

create table public.service (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  code         text not null,
  name         text not null,
  description  text,
  price_cents  integer,
  created_at   timestamptz not null default now(),

  constraint service_code_unique unique (agency_id, code),
  constraint service_price_positive check (price_cents is null or price_cents >= 0)
);

create table public.client_service (
  client_id   uuid not null references public.client(id) on delete cascade,
  service_id  uuid not null references public.service(id) on delete restrict,
  created_at  timestamptz not null default now(),
  primary key (client_id, service_id)
);

create index client_service_service_idx on public.client_service (service_id);


-- =============================================================================
-- Les contacts
-- =============================================================================
-- Session 7.1 : un contact est une personne, distincte du compte. ⚠ Dans le
-- code actuel, `Contact` n'a pas de `clientId` — les cinq contacts sont
-- rattachés implicitement à Acme Corp., ce qui rend un deuxième client
-- impossible.

create table public.contact (
  id                 uuid primary key default gen_random_uuid(),
  agency_id          uuid not null references public.agency(id) on delete cascade,
  client_id          uuid not null references public.client(id) on delete cascade,

  full_name          text not null,
  role               text,
  initials           text not null,
  email              text,
  phone              text,
  preferred_channel  public.communication_channel not null default 'courriel',

  -- Un seul contact principal par compte — c'est lui qui reçoit le rapport
  -- mensuel par défaut (session 7.1). L'index unique partiel plus bas en fait
  -- une garantie du moteur, pas une convention d'interface.
  is_primary         boolean not null default false,

  -- Un contact qui quitte l'entreprise s'archive, ne se supprime jamais :
  -- l'historique des échanges doit rester lisible (session 7.1).
  archived_at        timestamptz,

  -- Jamais visible du client. Aucune politique du portail n'expose cette
  -- colonne (voir 0007, vues du portail).
  notes              text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint contact_channel_reachable check (
    preferred_channel in ('courriel', 'portail', 'whatsapp', 'messenger', 'appel')
  )
);

create unique index contact_one_primary_per_client
  on public.contact (client_id)
  where is_primary and archived_at is null;

create index contact_client_idx on public.contact (client_id);

create trigger contact_touch
  before update on public.contact
  for each row execute function app.touch_updated_at();

comment on index public.contact_one_primary_per_client is
  'Un seul contact principal par compte, garanti par le moteur (session 7.1).';


-- =============================================================================
-- Les établissements
-- =============================================================================
-- Décision 8 : le SEO local est une section complète. Un compte peut avoir
-- plusieurs adresses — Clinique Lavoie en a deux. Les mesures locales (avis,
-- citations, positions, concurrence) arrivent en migration 0005 ; ici, le lieu
-- lui-même, parce que d'autres tables le référencent déjà.

create type public.gbp_state as enum (
  'revendiquee', 'non_revendiquee', 'suspendue', 'tiers'
);

create table public.establishment (
  id           uuid primary key default gen_random_uuid(),
  agency_id    uuid not null references public.agency(id) on delete cascade,
  -- ⚠ `Establishment` porte aujourd'hui à la fois `client` (le nom) et
  -- `clientId`. Seule la clé étrangère subsiste.
  client_id    uuid not null references public.client(id) on delete cascade,

  slug         text not null,
  name         text not null,
  city         text,
  address      text,
  gbp_state    public.gbp_state not null default 'revendiquee',

  -- Décision 9 : la zone desservie se règle par client, et sa forme varie
  -- (rayon, secteurs nommés, grille de points). Trois formes disjointes pour
  -- une donnée lue en bloc : du JSON validé vaut mieux que trois tables dont
  -- deux seraient toujours vides. Le coût d'un relevé en dépend
  -- (GRID_POINT_PRICE), d'où la contrainte sur la forme.
  zone         jsonb,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint establishment_slug_unique unique (agency_id, slug),
  constraint establishment_zone_shape check (
    zone is null
    or (zone->>'mode' = 'rayon'    and (zone->>'km') is not null)
    or (zone->>'mode' = 'secteurs' and jsonb_typeof(zone->'secteurs') = 'array')
    or (zone->>'mode' = 'grille'   and (zone->>'rows') is not null
                                   and (zone->>'cols') is not null
                                   and (zone->>'spacingKm') is not null)
  )
);

create index establishment_client_idx on public.establishment (client_id);

create trigger establishment_touch
  before update on public.establishment
  for each row execute function app.touch_updated_at();


-- Un contact peut être rattaché à un établissement précis — la gérante de
-- Laval n'est pas celle de Rive-Sud (session 7.1). ⚠ Le code le fait par nom
-- d'établissement (`Contact.establishment: string|null`).
alter table public.contact
  add column establishment_id uuid references public.establishment(id) on delete set null;

create index contact_establishment_idx on public.contact (establishment_id);


-- =============================================================================
-- L'identité d'un contact qui se connecte au portail
-- =============================================================================
-- Décision 5 de docs/modele-donnees.md : deux populations, un seul
-- `auth.users`. Un contact devient connectable quand on lui ouvre le portail.

create table public.portal_identity (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  contact_id  uuid not null unique references public.contact(id) on delete cascade,
  created_at  timestamptz not null default now()
);

comment on table public.portal_identity is
  'Lie un compte auth.users à un contact client. Sa seule présence autorise l''accès au portail.';


create or replace function app.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.client_id
  from public.portal_identity p
  join public.contact c on c.id = p.contact_id
  where p.user_id = (select auth.uid())
    and c.archived_at is null
  limit 1;
$$;

comment on function app.current_client_id is
  'Compte du contact connecté au portail, NULL pour un membre de l''agence. Discriminant de toutes les politiques du portail.';


-- =============================================================================
-- Politiques
-- =============================================================================
-- Le cockpit voit tout ce qui appartient à son agence. Le portail ne voit que
-- son propre compte, et seulement les colonnes que la règle 1 autorise — d'où
-- une vue dédiée (migration 0007) plutôt qu'un accès direct aux tables.

alter table public.client           enable row level security;
alter table public.service          enable row level security;
alter table public.client_service   enable row level security;
alter table public.contact          enable row level security;
alter table public.establishment    enable row level security;
alter table public.portal_identity  enable row level security;

create policy client_agency_all on public.client
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy service_agency_all on public.service
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy client_service_agency_all on public.client_service
  for all to authenticated
  using (exists (
    select 1 from public.client c
    where c.id = public.client_service.client_id
      and c.agency_id = app.current_agency_id()
  ))
  with check (exists (
    select 1 from public.client c
    where c.id = public.client_service.client_id
      and c.agency_id = app.current_agency_id()
  ));

create policy contact_agency_all on public.contact
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy establishment_agency_all on public.establishment
  for all to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

create policy portal_identity_agency_read on public.portal_identity
  for select to authenticated
  using (exists (
    select 1 from public.contact c
    where c.id = public.portal_identity.contact_id
      and c.agency_id = app.current_agency_id()
  ));

-- Le contact connecté lit la fiche de son propre compte — et rien d'autre.
-- Les notes internes d'un contact, elles, ne passent jamais par là : le
-- portail n'accède pas à `contact`, seulement aux vues de la migration 0007.
create policy client_portal_read on public.client
  for select to authenticated
  using (id = app.current_client_id());
