-- =============================================================================
-- Vérification du profil complété (migrations 0020 et 0021)
-- =============================================================================
-- Le NEQ a un format ; le représentant, le district et les instructions de
-- paiement s'écrivent avec `manage_agency` comme le reste du profil ; le
-- stockage ne s'installe pas sur la doublure locale.
--
-- À lancer après 13_regles_profil.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


\echo ''
\echo '--- Le NEQ est fait de dix chiffres, ou il est absent ---'

do $$
begin
  begin
    update public.agency set neq = '12345'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un NEQ de cinq chiffres a été accepté';
  exception when check_violation then
    raise notice 'OK   — un NEQ mal formé est refusé';
  end;

  update public.agency set neq = '2272419658'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  raise notice 'OK   — un NEQ de dix chiffres est accepté';

  update public.agency set neq = null
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  raise notice 'OK   — le NEQ peut rester vide';
end $$;


\echo ''
\echo '--- Le représentant et le district suivent la permission manage_agency ---'

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin

  update public.agency
     set representative_name = 'Marie Chen', representative_title = 'Fondatrice',
         judicial_district = 'Montréal',
         payment_instructions = 'Virement ou Interac, sous 15 jours.'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';

  select representative_name into v from public.agency
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if v is distinct from 'Marie Chen' then
    raise exception 'ÉCHEC — l''administratrice n''a pas pu nommer le représentant';
  end if;
  raise notice 'OK   — l''administratrice nomme le représentant, le district, les instructions';
end $$;

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';   -- Tom, rédacteur

  update public.agency set representative_name = 'Tom Bélanger'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';

  select representative_name into v from public.agency
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if v = 'Tom Bélanger' then
    raise exception 'ÉCHEC — un rédacteur a changé le représentant de l''agence';
  end if;
  raise notice 'OK   — sans manage_agency, la modification ne touche aucune ligne';
end $$;


\echo ''
\echo '--- Le stockage ne s''installe que là où la plateforme le fournit ---'

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    if not exists (select 1 from storage.buckets where id = 'public-assets') then
      raise exception 'ÉCHEC — le schéma storage existe mais le seau public-assets manque';
    end if;
    raise notice 'OK   — le seau public-assets existe';
  else
    raise notice 'OK   — pas de schéma storage ici : rien n''a été créé, rien n''a cassé';
  end if;
end $$;
