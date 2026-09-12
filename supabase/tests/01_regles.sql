-- =============================================================================
-- Vérification des règles produit appliquées par le moteur
-- =============================================================================
-- Les migrations ne se contentent pas de stocker : elles font respecter par
-- PostgreSQL des règles de docs/decisions.md qui, jusqu'ici, ne vivaient que
-- dans des composants React. Ce fichier le prouve.
--
-- Chaque test affiche « OK » ou lève. À lancer sur une base jetable, après
-- 00_stub_supabase.sql et les migrations :
--   psql -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/01_regles.sql
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;

-- Assertion : l'instruction donnée DOIT échouer.
create or replace function pg_temp.must_fail(stmt text, label text)
returns void
language plpgsql
as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'OK   — %  (refusé : %)', label, left(sqlerrm, 70);
    return;
  end;
  raise exception 'ÉCHEC — % : l''opération aurait dû être refusée', label;
end;
$$;

create or replace function pg_temp.must_pass(stmt text, label text)
returns void
language plpgsql
as $$
begin
  execute stmt;
  raise notice 'OK   — %', label;
end;
$$;


-- =============================================================================
-- Jeu d'essai minimal
-- =============================================================================

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'marie@huntpilote.ca'),
  ('22222222-2222-2222-2222-222222222222', 'rivale@autre-agence.ca'),
  ('33333333-3333-3333-3333-333333333333', 'contact@acmecorp.ca');

insert into public.agency (id, name, slug) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'HuntPilote', 'huntpilote'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Agence rivale', 'rivale');

-- `full_name` est une colonne calculée depuis le prénom et le nom (migration
-- 0016) : un nom d'affichage qui diverge de ses parties est un bogue qui
-- attend son heure.
insert into public.user_profile (user_id, kind, first_name, last_name) values
  ('11111111-1111-1111-1111-111111111111', 'agency_member', 'Marie', 'Chen'),
  ('22222222-2222-2222-2222-222222222222', 'agency_member', 'Concurrente', null),
  ('33333333-3333-3333-3333-333333333333', 'client_contact', 'Sophie', 'Tremblay');

insert into public.agency_member (id, agency_id, user_id, role, initials) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', 'admin', 'MC'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222', 'admin', 'XX');

insert into public.client (id, agency_id, slug, name, initials, type) values
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'acme-corp', 'Acme Corp.', 'AC', 'client'),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002',
   'client-rival', 'Client de la rivale', 'CR', 'client');

insert into public.contact (id, agency_id, client_id, full_name, initials, is_primary) values
  ('dddddddd-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'Sophie Tremblay', 'ST', true);

insert into public.portal_identity (user_id, contact_id) values
  ('33333333-3333-3333-3333-333333333333', 'dddddddd-0000-0000-0000-000000000001');


\echo ''
\echo '--- Règle 1 : le double libellé et la visibilité client ---'

select pg_temp.must_fail($$
  insert into public.priority
    (agency_id, client_id, slug, ref, severity, dimension, visibility, internal_label)
  values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
     'p-9001', 'P-9001', 'critique', 'seo', 'annonce', 'LCP mobile à 4,2 s (p75)');
$$, 'une priorité visible sans libellé client est refusée');

select pg_temp.must_fail($$
  insert into public.priority
    (agency_id, client_id, slug, ref, severity, dimension, internal_label, client_label)
  values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
     'p-9002', 'P-9002', 'critique', 'seo', 'LCP mobile à 4,2 s',
     'Vos pages mettent trop de temps à s''afficher');
$$, 'un libellé client sans état de relecture est refusé');

select pg_temp.must_pass($$
  insert into public.priority
    (id, agency_id, client_id, slug, ref, severity, dimension, visibility,
     internal_label, client_label, client_label_review)
  values
    ('eeeeeeee-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
     'p-0418', 'P-0418', 'critique', 'seo', 'annonce',
     'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques',
     'Vos pages mettent trop de temps à s''afficher sur mobile', 'relu');
$$, 'une priorité annoncée avec libellé client relu est acceptée');


\echo ''
\echo '--- Règle 1 : entrer au plan d''action rend la priorité visible ---'

insert into public.task
  (agency_id, client_id, slug, ref, title, priority_id)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   '142', '#142', 'Optimiser le LCP mobile', 'eeeeeeee-0000-0000-0000-000000000001');

do $$
declare v public.priority_visibility;
begin
  select visibility into v from public.priority
   where id = 'eeeeeeee-0000-0000-0000-000000000001';
  if v <> 'traitement' then
    raise exception 'ÉCHEC — la priorité devrait être passée en traitement, elle est « % »', v;
  end if;
  raise notice 'OK   — l''assignation d''une tâche fait passer « annoncé » en « en traitement »';
end $$;


\echo ''
\echo '--- Règle 1 : l''état « à relire » bloque la publication ---'

insert into public.report (id, agency_id, client_id, period_month, slug, state)
values ('ffffffff-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        date '2026-09-01', '2026-09', 'pret');

insert into public.proof
  (id, agency_id, client_id, slug, ref, internal_title, client_label, client_label_review)
values
  ('a0000000-0000-0000-0000-00000000000f',
   'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   'pv-081', 'PV-081', 'LCP ramené sous le seuil',
   'Vos pages s''affichent deux fois plus vite', 'a_relire');

insert into public.report_proof (report_id, proof_id)
values ('ffffffff-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000f');

select pg_temp.must_fail($$
  insert into public.report_version
    (agency_id, report_id, version, token, content, data_as_of)
  values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000001',
     1, 'r/9f3a-acme-sept26', '{}'::jsonb, date '2026-09-30');
$$, 'publier un rapport dont une preuve attend une relecture est refusé');

update public.proof set client_label_review = 'relu'
 where id = 'a0000000-0000-0000-0000-00000000000f';

select pg_temp.must_pass($$
  insert into public.report_version
    (agency_id, report_id, version, token, content, data_as_of)
  values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000001',
     1, 'r/9f3a-acme-sept26', '{}'::jsonb, date '2026-09-30');
$$, 'une fois tout relu, la publication passe');


\echo ''
\echo '--- Session 7.1 : un seul contact principal par compte ---'

select pg_temp.must_fail($$
  insert into public.contact
    (agency_id, client_id, full_name, initials, is_primary)
  values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
     'Deuxième principal', 'DP', true);
$$, 'un deuxième contact principal sur le même compte est refusé');


\echo ''
\echo '--- Convention : une mesure ne s''affiche jamais sans son seuil ---'

insert into public.audit (id, agency_id, client_id, slug, ref)
values ('b0000000-0000-0000-0000-00000000000a',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'a-0142', 'A-0142');

select pg_temp.must_fail($$
  insert into public.audit_criterion (audit_id, dimension, label, status, measure)
  values ('b0000000-0000-0000-0000-00000000000a', 'seo', 'LCP mobile', 'fail', '4,2 s');
$$, 'un critère mesuré sans seuil est refusé');


\echo ''
\echo '--- Cloisonnement : une agence ne voit pas les comptes d''une autre ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  select count(*) into n from public.client;
  if n <> 1 then
    raise exception 'ÉCHEC — Marie devrait voir 1 compte (le sien), elle en voit %', n;
  end if;

  select count(*) into n from public.client where slug = 'client-rival';
  if n <> 0 then
    raise exception 'ÉCHEC — le compte de l''agence rivale est visible';
  end if;

  raise notice 'OK   — un membre ne voit que les comptes de son agence';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into n from public.priority;
  if n <> 0 then
    raise exception 'ÉCHEC — un contact du portail voit % priorité(s) du cockpit', n;
  end if;

  select count(*) into n from public.client;
  if n <> 1 then
    raise exception 'ÉCHEC — un contact du portail devrait voir son seul compte, il en voit %', n;
  end if;

  raise notice 'OK   — un contact du portail n''atteint pas la table des priorités';
  raise notice 'OK   — un contact du portail ne voit que son propre compte';
end $$;

\echo ''
\echo 'Tous les tests sont passés.'
