-- =============================================================================
-- 0001 — Fondations : agence, membres, vocabulaires, garde-fous RLS
-- =============================================================================
-- Voir docs/modele-donnees.md pour le raisonnement, docs/decisions.md pour les
-- règles produit que ce schéma applique.
--
-- Ce fichier pose trois choses dont tout le reste dépend :
--   1. les types énumérés figés par decisions.md ;
--   2. l'agence et ses membres — la racine du cloisonnement ;
--   3. les fonctions que toutes les politiques RLS appellent.
-- =============================================================================

create schema if not exists app;
comment on schema app is
  'Fonctions internes (RLS, déclencheurs). Rien ici n''est exposé par PostgREST.';


-- =============================================================================
-- Vocabulaires figés
-- =============================================================================
-- Ces trois-là sont des invariants du produit, écrits dans decisions.md. Un
-- type énuméré fait refuser par le moteur toute valeur hors vocabulaire, et se
-- génère en union de chaînes TypeScript identique à celle du code actuel.
--
-- Les statuts plus mouvants — étapes du pipeline, états d'une tâche ou d'un
-- devis — restent du texte avec une contrainte `check`, dans leurs migrations
-- respectives : ajouter une étape ne doit pas demander un `alter type`.

-- Règle : une priorité appartient toujours à l'une des trois sévérités.
create type public.severity as enum ('critique', 'important', 'opportunite');

-- Décision 13 : l'audit n'est pas un audit SEO, il couvre trois dimensions.
create type public.audit_dimension as enum ('presence', 'seo', 'design');

-- Règle 1 : trois états de visibilité, pas deux.
--   interne     — par défaut, à la détection. Le client ne voit rien.
--   annonce     — interrupteur manuel. Le constat, sans échéance.
--   traitement  — automatique, à l'entrée au plan d'action. Constat + avancement.
create type public.priority_visibility as enum ('interne', 'annonce', 'traitement');

-- Règle 1 : tout texte rédigé par l'agent et destiné à sortir de l'agence passe
-- par une relecture humaine. `null` = pas de texte client rédigé à ce jour.
create type public.review_state as enum ('a_relire', 'relu');

-- Les quatre rôles nommés dans les paramètres. Codes stables en base ; les
-- libellés affichés (« Administratrice », « Chef de projet »…) restent côté
-- application, pour ne pas figer une graphie dans la donnée.
create type public.agency_role as enum ('admin', 'chef_projet', 'specialiste_seo', 'redacteur');

-- Deux populations se connectent, sans droits communs (voir modele-donnees.md).
create type public.user_kind as enum ('agency_member', 'client_contact');


-- =============================================================================
-- Déclencheur partagé
-- =============================================================================

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function app.touch_updated_at is
  'À poser en trigger BEFORE UPDATE sur toute table portant updated_at.';


-- =============================================================================
-- L'agence
-- =============================================================================
-- Une seule ligne pendant longtemps (décision 12 : mono-utilisateur, multi à
-- trois ans). La colonne existe quand même partout dès maintenant : l'ajouter
-- plus tard coûterait une migration de données et la réécriture de toutes les
-- politiques RLS.

create table public.agency (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger agency_touch
  before update on public.agency
  for each row execute function app.touch_updated_at();


-- Les réglages de conservation sont des réglages d'agence, pas des constantes
-- (règle 3 : « ils se révisent quand la facture DataForSEO parlera »).
create table public.agency_settings (
  agency_id                  uuid primary key references public.agency(id) on delete cascade,

  -- Dilution des séries temporelles, en jours (règle 3).
  serp_daily_days            integer not null default 90,
  serp_weekly_days           integer not null default 365,
  cwv_detail_days            integer not null default 365,

  -- Cache d'exploration de mots-clés : éphémère, purgé au-delà.
  keyword_cache_days         integer not null default 30,

  -- Seuil du score de santé sous lequel un compte remonte en alerte.
  health_score_alert_below   integer not null default 70,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),

  constraint agency_settings_delays_positive check (
    serp_daily_days > 0 and serp_weekly_days > 0
    and cwv_detail_days > 0 and keyword_cache_days > 0
  ),
  constraint agency_settings_health_threshold check (
    health_score_alert_below between 0 and 100
  )
);

create trigger agency_settings_touch
  before update on public.agency_settings
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- Les identités
-- =============================================================================
-- Membres de l'agence et contacts client passent tous deux par auth.users de
-- Supabase. Ce qui les sépare est la table de profil ci-dessous : c'est d'elle
-- que partent toutes les politiques RLS.

create table public.user_profile (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  kind        public.user_kind not null,
  full_name   text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger user_profile_touch
  before update on public.user_profile
  for each row execute function app.touch_updated_at();

comment on table public.user_profile is
  'Aiguillage d''identité. Un contact client ne doit jamais atteindre une table du cockpit, même en devinant son nom.';


create table public.agency_member (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agency(id) on delete cascade,
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  role        public.agency_role not null default 'chef_projet',
  initials    text not null,
  -- Décor aujourd'hui, réel plus tard : un membre désactivé garde son
  -- historique (tâches assignées, échanges consignés) au lieu d'être supprimé.
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index agency_member_agency_idx on public.agency_member (agency_id);

create trigger agency_member_touch
  before update on public.agency_member
  for each row execute function app.touch_updated_at();


-- =============================================================================
-- Garde-fous RLS
-- =============================================================================
-- Ces fonctions sont `security definer` : elles lisent les tables d'identité en
-- contournant RLS, sinon une politique qui les appelle s'appellerait elle-même
-- en boucle. `search_path = ''` et qualification complète : sans ça, un schéma
-- malveillant dans le chemin de recherche détourne l'appel.

create or replace function app.is_agency_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_member m
    where m.user_id = (select auth.uid())
      and m.active
  );
$$;

comment on function app.is_agency_member is
  'Vrai si l''utilisateur courant est un membre actif de l''agence.';


create or replace function app.current_agency_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.agency_id
  from public.agency_member m
  where m.user_id = (select auth.uid())
    and m.active
  limit 1;
$$;

comment on function app.current_agency_id is
  'Agence de l''utilisateur courant, NULL s''il n''est pas membre. Discriminant de toutes les politiques du cockpit.';


-- =============================================================================
-- Politiques
-- =============================================================================
-- RLS est activé sur chaque table dès sa création, dans la même migration :
-- une table créée ici et sécurisée dans une migration ultérieure resterait
-- ouverte entre les deux, ce qui suffit sur une base en ligne.

alter table public.agency           enable row level security;
alter table public.agency_settings  enable row level security;
alter table public.user_profile     enable row level security;
alter table public.agency_member    enable row level security;

-- L'agence : lisible par ses membres, modifiable par ses seuls administrateurs.
create policy agency_read on public.agency
  for select to authenticated
  using (id = app.current_agency_id());

create policy agency_settings_read on public.agency_settings
  for select to authenticated
  using (agency_id = app.current_agency_id());

create policy agency_settings_write on public.agency_settings
  for update to authenticated
  using (agency_id = app.current_agency_id())
  with check (agency_id = app.current_agency_id());

-- Chacun lit son propre profil ; les membres de l'agence lisent aussi ceux de
-- leurs collègues (l'écran Membres d'équipe en a besoin).
create policy user_profile_read_self on public.user_profile
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy user_profile_read_colleagues on public.user_profile
  for select to authenticated
  using (
    app.is_agency_member()
    and exists (
      select 1 from public.agency_member m
      where m.user_id = public.user_profile.user_id
        and m.agency_id = app.current_agency_id()
    )
  );

create policy agency_member_read on public.agency_member
  for select to authenticated
  using (agency_id = app.current_agency_id());
