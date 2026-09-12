-- =============================================================================
-- 0017 — Un membre d'équipe existe avant de s'être connecté
-- =============================================================================
-- Deux défauts se répondaient, et le semis les a rendus visibles.
--
-- **Un membre ne pouvait pas être invité.** `agency_member.user_id` pointait
-- vers `auth.users` sans être nullable : impossible d'ajouter quelqu'un à
-- l'équipe avant qu'il ne se connecte. Or on invite d'abord, on se connecte
-- ensuite — et entre les deux, la personne a un nom, un rôle et un poste. Le
-- lien vers le compte d'authentification se fait à la première connexion, par
-- rapprochement sur le courriel.
--
-- **`user_profile` dupliquait deux tables.** Elle portait l'identité des deux
-- populations — membres et contacts — alors que `contact` porte déjà celle des
-- contacts (nom, courriel, téléphone), et qu'un membre a sa ligne dans
-- `agency_member`. Son seul apport propre était `kind`, qui se déduit : on est
-- membre si on figure dans `agency_member`, contact si on figure dans
-- `portal_identity`. Aucune clé étrangère ne pointait vers elle.
--
-- L'identité d'une personne de l'agence vit donc là où vit son appartenance à
-- l'agence, et `user_profile` disparaît.
-- =============================================================================


-- =============================================================================
-- Le membre porte son identité
-- =============================================================================

alter table public.agency_member
  add column first_name   text,
  add column last_name    text,
  add column email        text,
  add column avatar_url   text,
  add column phone        text,
  add column address      text,
  add column city         text,
  add column province     text,
  add column postal_code  text,
  add column country      text default 'CA',

  -- L'invitation et son acceptation. Tant que la personne ne s'est pas
  -- connectée, elle existe dans l'équipe sans compte.
  add column invited_at   timestamptz,
  add column accepted_at  timestamptz;

-- Ce que `user_profile` savait déjà des membres existants passe ici avant
-- qu'elle ne disparaisse.
update public.agency_member m
   set first_name  = p.first_name,
       last_name   = p.last_name,
       avatar_url  = p.avatar_url,
       phone       = p.phone,
       address     = p.address,
       city        = p.city,
       province    = p.province,
       postal_code = p.postal_code,
       country     = p.country,
       accepted_at = coalesce(m.created_at, now())
  from public.user_profile p
 where p.user_id = m.user_id;

alter table public.agency_member
  add column full_name text generated always as (
    btrim(coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
  ) stored,

  -- Le courriel est l'identifiant de l'invitation : c'est lui qui rapproche la
  -- personne de son compte à la première connexion.
  add constraint agency_member_has_a_name check (
    first_name is not null or last_name is not null
  ),
  -- Un membre connecté a forcément accepté ; un membre qui a accepté a
  -- forcément un compte. L'un ne va pas sans l'autre.
  add constraint agency_member_accepted_pairing check (
    (user_id is null) = (accepted_at is null)
  );

-- Un membre invité n'a pas encore de compte.
alter table public.agency_member alter column user_id drop not null;

create unique index agency_member_email_unique
  on public.agency_member (agency_id, lower(email))
  where email is not null;


-- =============================================================================
-- `user_profile` disparaît
-- =============================================================================

drop policy user_profile_read_self on public.user_profile;
drop policy user_profile_read_colleagues on public.user_profile;
drop table public.user_profile;
drop type public.user_kind;


-- =============================================================================
-- Rapprocher une personne invitée de son compte
-- =============================================================================
-- À la première connexion : on cherche l'invitation au même courriel, et on la
-- rattache. Sans ça, une personne invitée qui se connecte se retrouverait sans
-- agence, donc sans rien voir.

create or replace function app.accept_member_invitation(p_user uuid, p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare membre uuid;
begin
  update public.agency_member m
     set user_id = p_user, accepted_at = now()
   where m.user_id is null
     and lower(m.email) = lower(p_email)
     and m.active
  returning m.id into membre;

  return membre;   -- null si aucune invitation ne correspond
end;
$$;

comment on function app.accept_member_invitation(uuid, text) is
  'À appeler à la première connexion : rattache le compte à l''invitation '
  'portant le même courriel. Rend null si aucune invitation ne correspond.';


-- La lecture entre collègues existait déjà (`agency_member_read`, migration
-- 0001) : c'est l'écriture qui manquait. Inviter quelqu'un, changer son rôle
-- ou le désactiver relève de la gestion d'équipe, et d'elle seule.
create policy agency_member_write on public.agency_member
  for all to authenticated
  using (agency_id = app.current_agency_id() and app.member_has('manage_team'))
  with check (agency_id = app.current_agency_id() and app.member_has('manage_team'));
