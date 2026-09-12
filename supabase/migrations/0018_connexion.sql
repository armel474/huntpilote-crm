-- =============================================================================
-- 0018 — Ce que l'application appelle à la connexion
-- =============================================================================
-- L'API Supabase n'expose que le schéma `public` : les fonctions de `app` ne
-- sont pas appelables depuis le navigateur ni depuis le serveur applicatif,
-- et c'est voulu — elles s'exécutent avec leurs propres droits. Ce qui doit
-- être appelable passe par un point d'entrée public, étroit, qui ne prend
-- aucun argument qu'on pourrait falsifier.
-- =============================================================================

-- Rattache la personne connectée à son invitation, si une invitation porte
-- son courriel. Identité et courriel viennent du jeton, jamais d'un paramètre.
-- Idempotente : une fois rattachée, elle ne trouve plus rien et rend null.
create or replace function public.accept_my_invitation()
returns uuid
language sql
security definer
set search_path = ''
as $$
  select app.accept_member_invitation(
    (select auth.uid()),
    (select auth.jwt() ->> 'email'));
$$;

revoke all on function public.accept_my_invitation() from public;
grant execute on function public.accept_my_invitation() to authenticated;


-- Qui suis-je, pour l'application : membre d'agence, contact du portail, ou
-- personne d'encore connue. Un seul aller-retour au chargement de la session.
create or replace function public.whoami()
returns table (
  kind        text,
  member_id   uuid,
  agency_id   uuid,
  agency_name text,
  role        public.agency_role,
  full_name   text,
  initials    text,
  contact_id  uuid,
  client_id   uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select 'membre', m.id, m.agency_id, a.name, m.role, m.full_name, m.initials, null::uuid, null::uuid
    from public.agency_member m
    join public.agency a on a.id = m.agency_id
   where m.user_id = (select auth.uid()) and m.active
  union all
  select 'contact', null, c.agency_id, a.name, null, c.full_name, c.initials, c.id, c.client_id
    from public.portal_identity p
    join public.contact c on c.id = p.contact_id
    join public.agency a on a.id = c.agency_id
   where p.user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function public.whoami() from public;
grant execute on function public.whoami() to authenticated;
