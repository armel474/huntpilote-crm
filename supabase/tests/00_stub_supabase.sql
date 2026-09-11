-- =============================================================================
-- Doublure de la plateforme Supabase — pour valider les migrations en local
-- =============================================================================
-- Les migrations référencent des objets que Supabase fournit et qu'un
-- PostgreSQL nu n'a pas : le schéma `auth`, la table `auth.users`, la fonction
-- `auth.uid()` et le rôle `authenticated`.
--
-- Ce fichier les recrée à l'identique du strict nécessaire, pour pouvoir
-- appliquer les migrations sur une base jetable et vérifier qu'elles passent
-- avant de les envoyer sur un vrai projet. Il n'est JAMAIS appliqué en ligne :
-- sur Supabase, ces objets existent déjà.
--
--   psql -f supabase/tests/00_stub_supabase.sql
--   psql -f supabase/migrations/0001_fondations.sql
--   ... puis les suivantes dans l'ordre
-- =============================================================================

create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

-- Sur Supabase, `auth.uid()` lit l'identifiant du porteur du jeton JWT courant.
-- En local, on le pose à la main pour jouer un utilisateur donné :
--   set local request.jwt.claim.sub = '<uuid>';
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
end
$$;
