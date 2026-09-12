-- =============================================================================
-- Vérification des écritures sur le profil (migration 0019)
-- =============================================================================
-- L'agence se modifie avec `manage_agency` et pas autrement ; un membre
-- corrige son propre profil sans pouvoir se promouvoir.
--
-- À lancer après 12_regles_permissions.sql, sur la même base : il réutilise
-- ses membres (Julien chef de projet, Tom rédacteur) et ses droits accordés au
-- rôle `authenticated`.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


\echo ''
\echo '--- L''agence se modifie avec manage_agency, et pas autrement ---'

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin

  update public.agency set gst_number = '123456789 RT0001'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';

  select gst_number into v from public.agency where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if v is distinct from '123456789 RT0001' then
    raise exception 'ÉCHEC — l''administratrice n''a pas pu saisir le numéro de TPS';
  end if;
  raise notice 'OK   — l''administratrice saisit le numéro de TPS de son agence';
end $$;

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- Tom, rédacteur

  update public.agency set gst_number = 'pirate'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';

  reset role;
  select gst_number into v from public.agency where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if v <> '123456789 RT0001' then
    raise exception 'ÉCHEC — le rédacteur a modifié le profil de l''agence';
  end if;
  raise notice 'OK   — le rédacteur ne touche pas au profil de l''agence';
end $$;

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';   -- admin d'une autre agence

  update public.agency set name = 'Piratée'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';

  reset role;
  select name into v from public.agency where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if v = 'Piratée' then
    raise exception 'ÉCHEC — une autre agence a modifié le profil';
  end if;
  raise notice 'OK   — l''administratrice d''une autre agence ne voit ni ne modifie ce profil';
end $$;


\echo ''
\echo '--- Un membre corrige son propre profil, sans se promouvoir ---'

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- Tom

  update public.agency_member set phone = '418-555-0199', city = 'Rimouski'
   where user_id = '66666666-6666-6666-6666-666666666666';

  select phone into v from public.agency_member where user_id = '66666666-6666-6666-6666-666666666666';
  if v is distinct from '418-555-0199' then
    raise exception 'ÉCHEC — Tom n''a pas pu changer son téléphone';
  end if;
  raise notice 'OK   — Tom change son téléphone et sa ville';
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- Tom

  update public.agency_member set role = 'admin'
   where user_id = '66666666-6666-6666-6666-666666666666';
  raise exception 'ÉCHEC — Tom s''est nommé administrateur';
exception
  when insufficient_privilege then
    raise notice 'OK   — Tom ne change pas son propre rôle';
end $$;

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- Tom

  update public.agency_member set phone = '000'
   where user_id = '44444444-4444-4444-4444-444444444444';               -- Julien

  reset role;
  select phone into v from public.agency_member where user_id = '44444444-4444-4444-4444-444444444444';
  if v = '000' then
    raise exception 'ÉCHEC — Tom a modifié le profil de Julien';
  end if;
  raise notice 'OK   — Tom ne modifie pas le profil d''un collègue';
end $$;

do $$
declare v public.agency_role;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin

  update public.agency_member set role = 'specialiste_seo', job_title = 'Spécialiste contenu'
   where user_id = '66666666-6666-6666-6666-666666666666';

  select role into v from public.agency_member where user_id = '66666666-6666-6666-6666-666666666666';
  if v <> 'specialiste_seo' then
    raise exception 'ÉCHEC — la gestion d''équipe n''a pas pu changer le rôle de Tom';
  end if;
  raise notice 'OK   — la gestion d''équipe change le rôle et le poste';

  -- On remet Tom rédacteur : les fichiers suivants comptent sur lui.
  update public.agency_member set role = 'redacteur', job_title = 'Rédacteur'
   where user_id = '66666666-6666-6666-6666-666666666666';
end $$;


\echo ''
\echo '--- Une invitation se rattache encore au premier accès ---'

do $$
declare membre uuid;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin

  insert into public.agency_member
    (id, agency_id, role, initials, first_name, last_name, email, invited_at)
  values
    ('bbbbbbbb-0000-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000001',
     'redacteur', 'NP', 'Nadia', 'Perron', 'nadia@huntpilote.ca', now());

  reset role;
  insert into auth.users (id, email) values
    ('78787878-7878-7878-7878-787878787878', 'nadia@huntpilote.ca');

  set local role authenticated;
  set local request.jwt.claim.sub = '78787878-7878-7878-7878-787878787878';
  set local request.jwt.claim.email = 'nadia@huntpilote.ca';

  membre := public.accept_my_invitation();
  if membre is distinct from 'bbbbbbbb-0000-0000-0000-000000000013' then
    raise exception 'ÉCHEC — le garde-fou bloque le rattachement d''une invitation';
  end if;
  raise notice 'OK   — le garde-fou laisse passer le rattachement d''une invitation';
end $$;
