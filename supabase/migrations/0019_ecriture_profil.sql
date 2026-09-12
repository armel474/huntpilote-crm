-- =============================================================================
-- 0019 — Le profil de l'agence et le profil personnel se modifient
-- =============================================================================
-- L'écran Agence lisait la base sans pouvoir y écrire : aucune politique
-- n'autorisait la mise à jour de `agency`, alors que le commentaire de la
-- migration 0001 l'annonçait « modifiable par ses seuls administrateurs ».
-- Cette migration tient la promesse, en la rattachant à la permission
-- `manage_agency` plutôt qu'au rôle (migration 0016 : c'est la permission qui
-- compte, le rôle n'en est que la valeur par défaut).
--
-- Deuxième trou : un membre ne pouvait pas corriger son propre téléphone ni
-- son adresse. Seule la gestion d'équipe écrivait sur `agency_member`. Un
-- membre peut désormais modifier sa propre ligne — mais pas ce qui engage
-- l'agence : son rôle, son activation, son courriel d'invitation, son taux.
-- La politique RLS ne distingue pas les colonnes ; un déclencheur le fait.
-- =============================================================================


-- =============================================================================
-- L'agence : lisible par ses membres, modifiable avec `manage_agency`
-- =============================================================================

create policy agency_write on public.agency
  for update to authenticated
  using (id = app.current_agency_id() and app.member_has('manage_agency'))
  with check (id = app.current_agency_id() and app.member_has('manage_agency'));

-- Les réglages (conservation, seuils d'alerte) étaient ouverts à tout membre
-- depuis la migration 0001 : ils suivent désormais la même permission.
drop policy agency_settings_write on public.agency_settings;
create policy agency_settings_write on public.agency_settings
  for update to authenticated
  using (agency_id = app.current_agency_id() and app.member_has('manage_agency'))
  with check (agency_id = app.current_agency_id() and app.member_has('manage_agency'));


-- =============================================================================
-- Sa propre ligne : oui, mais pas ce qui engage l'agence
-- =============================================================================

create policy agency_member_update_self on public.agency_member
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Ce qu'un membre ne change pas lui-même. Le déclencheur laisse passer :
--   - le rattachement d'une invitation (`user_id` était null : c'est
--     `accept_member_invitation` qui écrit, pour le compte de la personne) ;
--   - toute écriture sans jeton (semis, console, service) ;
--   - la gestion d'équipe, qui a le droit de tout changer.
create or replace function app.guard_member_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.user_id is null then return new; end if;
  if (select auth.uid()) is null then return new; end if;
  if app.member_has('manage_team') then return new; end if;

  if new.role             is distinct from old.role
  or new.active           is distinct from old.active
  or new.agency_id        is distinct from old.agency_id
  or new.user_id          is distinct from old.user_id
  or new.email            is distinct from old.email
  or new.accepted_at      is distinct from old.accepted_at
  or new.invited_at       is distinct from old.invited_at
  or new.job_title        is distinct from old.job_title
  or new.started_on       is distinct from old.started_on
  or new.hourly_rate_cents is distinct from old.hourly_rate_cents
  then
    raise exception 'Seule la gestion d''équipe change le rôle, l''activation, le poste ou le taux d''un membre'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger agency_member_guard_self_update
  before update on public.agency_member
  for each row execute function app.guard_member_self_update();

comment on function app.guard_member_self_update() is
  'Un membre corrige son propre profil (nom, téléphone, adresse, photo), '
  'mais pas ce qui engage l''agence : rôle, activation, poste, taux.';


-- =============================================================================
-- Les points d'entrée de la connexion ne s'appellent pas sans jeton
-- =============================================================================
-- `whoami()` et `accept_my_invitation()` ne rendent rien sans `auth.uid()`,
-- mais l'audit Supabase signale qu'un visiteur anonyme peut les appeler.
-- Autant fermer la porte : seule une personne connectée a une raison de le
-- faire.
revoke execute on function public.whoami() from anon, public;
revoke execute on function public.accept_my_invitation() from anon, public;
