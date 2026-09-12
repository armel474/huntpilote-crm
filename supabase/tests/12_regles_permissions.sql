-- =============================================================================
-- Vérification des profils d'équipe et des permissions (migration 0016)
-- =============================================================================
-- Quatre rôles existaient comme étiquettes, sans rien empêcher : un rédacteur
-- pouvait modifier les tarifs, envoyer une facture ou publier un rapport chez
-- un client. Ce fichier vérifie que ce n'est plus le cas — et que le travail
-- quotidien reste ouvert, parce qu'un outil qui refuse tout finit contourné.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- Trois membres de plus, un par rôle restant.
insert into auth.users (id, email) values
  ('44444444-4444-4444-4444-444444444444', 'julien@huntpilote.ca'),
  ('55555555-5555-5555-5555-555555555555', 'aicha@huntpilote.ca'),
  ('66666666-6666-6666-6666-666666666666', 'tom@huntpilote.ca');

insert into public.agency_member
  (id, agency_id, user_id, role, initials, first_name, last_name, email,
   phone, city, province, job_title, started_on, hourly_rate_cents, accepted_at)
values
  ('bbbbbbbb-0000-0000-0000-00000000000c', 'aaaaaaaa-0000-0000-0000-000000000001',
   '44444444-4444-4444-4444-444444444444', 'chef_projet', 'JD',
   'Julien', 'Dubois', 'julien@huntpilote.ca', '514-555-0110', 'Montréal', 'QC',
   'Chef de projet', '2026-02-01', 9000, now()),
  ('bbbbbbbb-0000-0000-0000-00000000000d', 'aaaaaaaa-0000-0000-0000-000000000001',
   '55555555-5555-5555-5555-555555555555', 'specialiste_seo', 'AL',
   'Aïcha', 'Lemaire', 'aicha@huntpilote.ca', '514-555-0111', 'Laval', 'QC',
   'Spécialiste SEO', '2026-03-15', 8500, now()),
  ('bbbbbbbb-0000-0000-0000-00000000000e', 'aaaaaaaa-0000-0000-0000-000000000001',
   '66666666-6666-6666-6666-666666666666', 'redacteur', 'TB',
   'Tom', 'Bélanger', 'tom@huntpilote.ca', '418-555-0112', 'Québec', 'QC',
   'Rédacteur', '2026-05-01', 7000, now());


\echo ''
\echo '--- Le nom d''affichage descend du prénom et du nom ---'

do $$
declare n text; mono text;
begin
  select full_name into n from public.agency_member
   where user_id = '55555555-5555-5555-5555-555555555555';
  if n <> 'Aïcha Lemaire' then
    raise exception 'ÉCHEC — nom d''affichage attendu « Aïcha Lemaire », obtenu « % »', n;
  end if;

  -- Un mononyme s'écrit dans le prénom, et le nom d'affichage ne traîne pas
  -- d'espace.
  select full_name into mono from public.agency_member
   where user_id = '22222222-2222-2222-2222-222222222222';
  if mono <> 'Concurrente' then
    raise exception 'ÉCHEC — un mononyme devrait donner « Concurrente », obtenu « % »', mono;
  end if;

  raise notice 'OK   — « Aïcha Lemaire » se calcule, et un mononyme ne laisse pas d''espace en trop';
end $$;

do $$
begin
  begin
    insert into public.agency_member
      (agency_id, role, initials, first_name, last_name, email)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'redacteur', 'ZZ',
            null, null, 'sansnom@huntpilote.ca');
    raise exception 'ÉCHEC — une personne sans aucun nom a été acceptée';
  exception when check_violation or unique_violation then
    raise notice 'OK   — une personne a au moins un prénom ou un nom';
  end;
end $$;


\echo ''
\echo '--- Chaque rôle autorise ce qu''il doit, et rien de plus ---'

do $$
declare n integer;
begin
  select count(*) into n from public.member_effective_permission
   where member_id = 'bbbbbbbb-0000-0000-0000-00000000000e';
  if n <> 1 then
    raise exception 'ÉCHEC — le rédacteur devrait avoir 1 permission, il en a %', n;
  end if;

  select count(*) into n from public.member_effective_permission
   where member_id = 'bbbbbbbb-0000-0000-0000-000000000001';
  if n <> 11 then
    raise exception 'ÉCHEC — l''administratrice devrait tout pouvoir (11), elle a %', n;
  end if;

  select count(*) into n from public.member_effective_permission
   where member_id = 'bbbbbbbb-0000-0000-0000-00000000000c'
     and permission = 'manage_catalogue';
  if n <> 0 then
    raise exception 'ÉCHEC — un chef de projet ne gère pas le catalogue';
  end if;

  raise notice 'OK   — 11 permissions pour l''administratrice, 1 pour le rédacteur, et le catalogue reste fermé au chef de projet';
end $$;


\echo ''
\echo '--- Le rédacteur ne touche pas aux tarifs ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

insert into public.catalog_item (id, agency_id, code, name, price_cents, kind, billing)
values ('c9000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'seotech-perm', 'SEO technique (essai permissions)', 40000, 'service', 'mensuel');

do $$
declare n integer; prix integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';

  -- Il voit le catalogue : il doit savoir ce que l'agence vend.
  select count(*) into n from public.catalog_item
   where id = 'c9000000-0000-0000-0000-000000000001';
  if n <> 1 then
    raise exception 'ÉCHEC — le rédacteur devrait voir le catalogue de son agence';
  end if;

  -- Mais il ne le modifie pas.
  update public.catalog_item set price_cents = 1
   where id = 'c9000000-0000-0000-0000-000000000001';

  select price_cents into prix from public.catalog_item
   where id = 'c9000000-0000-0000-0000-000000000001';
  if prix <> 40000 then
    raise exception 'ÉCHEC — le rédacteur a changé le prix (% $)', prix / 100.0;
  end if;

  raise notice 'OK   — le rédacteur lit le catalogue, il ne le tarife pas';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';

  insert into public.offer (agency_id, code, name, price_cents)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'forfait-pirate', 'Forfait improvisé', 100);
  raise exception 'ÉCHEC — le rédacteur a créé une offre';
exception
  when insufficient_privilege then
    raise notice 'OK   — créer une offre lui est refusé';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — créer une offre lui est refusé  (%)', left(sqlerrm, 44);
end $$;


\echo ''
\echo '--- Le spécialiste travaille les comptes, il ne facture pas ---'

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';

  begin
    insert into public.invoice
      (agency_id, client_id, ref, period_month, issued_on, status)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'FA-PIRATE-001', '2026-09-01', current_date, 'en_attente');
    raise exception 'ÉCHEC — le spécialiste a émis une facture';
  exception
    when insufficient_privilege then
      raise notice 'OK   — émettre une facture lui est refusé';
    when others then
      if sqlerrm like 'ÉCHEC%' then raise; end if;
      raise notice 'OK   — émettre une facture lui est refusé  (%)', left(sqlerrm, 44);
  end;
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';

  -- Le travail quotidien reste ouvert : une tâche s'assigne, un audit se lance.
  insert into public.task (agency_id, client_id, slug, ref, title)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
          't-perm-1', '#901', 'Corriger les balises de titre');

  select count(*) into n from public.task where slug = 't-perm-1';
  if n <> 1 then
    raise exception 'ÉCHEC — le spécialiste ne peut plus créer de tâche';
  end if;
  raise notice 'OK   — le travail quotidien reste ouvert : un outil qui refuse tout finit contourné';
end $$;


\echo ''
\echo '--- L''exception nominative l''emporte sur le rôle ---'

insert into public.member_permission (member_id, permission, granted, reason)
values ('bbbbbbbb-0000-0000-0000-00000000000d', 'manage_billing', true,
        'Facture les mandats pendant le congé de la chargée de compte.');

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';

  insert into public.invoice
    (agency_id, client_id, ref, period_month, issued_on, status)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
          'FA-2026-0900', '2026-09-01', current_date, 'en_attente');

  select count(*) into n from public.invoice where ref = 'FA-2026-0900';
  if n <> 1 then
    raise exception 'ÉCHEC — l''exception accordée ne prend pas effet';
  end if;
  raise notice 'OK   — le droit accordé nommément prend effet, avec son motif écrit';
end $$;

-- Et dans l'autre sens : retirer un droit que le rôle donne.
insert into public.member_permission (member_id, permission, granted, reason)
values ('bbbbbbbb-0000-0000-0000-00000000000c', 'view_financials', false,
        'Accès aux chiffres réservé à la direction pendant la période de revue.');

do $$
declare n integer;
begin
  select count(*) into n from public.member_effective_permission
   where member_id = 'bbbbbbbb-0000-0000-0000-00000000000c'
     and permission = 'view_financials';
  if n <> 0 then
    raise exception 'ÉCHEC — le droit retiré est toujours effectif';
  end if;
  raise notice 'OK   — un droit se retire aussi nommément, sans inventer un rôle de plus';
end $$;


\echo ''
\echo '--- Personne ne s''accorde ses propres droits ---'

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';

  insert into public.member_permission (member_id, permission, granted)
  values ('bbbbbbbb-0000-0000-0000-00000000000e', 'manage_agency', true);
  raise exception 'ÉCHEC — le rédacteur s''est accordé la gestion de l''agence';
exception
  when insufficient_privilege then
    raise notice 'OK   — s''accorder un droit soi-même est refusé';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — s''accorder un droit soi-même est refusé  (%)', left(sqlerrm, 40);
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.member_permission;
  if n <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % exception(s) de permission', n;
  end if;
  raise notice 'OK   — les exceptions d''une agence ne se lisent pas depuis une autre';
end $$;


\echo ''
\echo '--- Un membre désactivé n''a plus aucun droit ---'

update public.agency_member set active = false
 where id = 'bbbbbbbb-0000-0000-0000-00000000000d';

do $$
declare peut boolean;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';

  select app.member_has('manage_billing') into peut;
  if peut then
    raise exception 'ÉCHEC — un membre désactivé conserve ses droits';
  end if;
  raise notice 'OK   — désactiver un membre lui retire tout, y compris ses exceptions';
end $$;


\echo ''
\echo '--- On invite d''abord, on se connecte ensuite ---'

insert into public.agency_member
  (id, agency_id, role, initials, first_name, last_name, email, job_title, invited_at)
values ('bbbbbbbb-0000-0000-0000-00000000000f', 'aaaaaaaa-0000-0000-0000-000000000001',
        'redacteur', 'CL', 'Camille', 'Ouellet', 'camille@huntpilote.ca',
        'Rédactrice', now());

do $$
declare n text; compte uuid;
begin
  select full_name, user_id into n, compte from public.agency_member
   where id = 'bbbbbbbb-0000-0000-0000-00000000000f';

  if n <> 'Camille Ouellet' then
    raise exception 'ÉCHEC — la personne invitée devrait s''appeler Camille Ouellet, obtenu « % »', n;
  end if;
  if compte is not null then
    raise exception 'ÉCHEC — une personne invitée n''a pas encore de compte';
  end if;
  raise notice 'OK   — Camille existe dans l''équipe avec son nom et son poste, sans compte';
end $$;

do $$
begin
  begin
    update public.agency_member set accepted_at = now()
     where id = 'bbbbbbbb-0000-0000-0000-00000000000f';
    raise exception 'ÉCHEC — une invitation acceptée sans compte a été acceptée';
  exception when check_violation then
    raise notice 'OK   — accepter une invitation sans compte est refusé : l''un ne va pas sans l''autre';
  end;
end $$;

insert into auth.users (id, email) values
  ('77777777-7777-7777-7777-777777777777', 'camille@huntpilote.ca');

do $$
declare lie uuid; compte uuid; orphelin uuid;
begin
  lie := app.accept_member_invitation('77777777-7777-7777-7777-777777777777',
                                      'Camille@HuntPilote.ca');

  select user_id into compte from public.agency_member
   where id = 'bbbbbbbb-0000-0000-0000-00000000000f';

  if lie is null or compte <> '77777777-7777-7777-7777-777777777777' then
    raise exception 'ÉCHEC — la première connexion n''a pas rattaché l''invitation';
  end if;

  -- Une connexion sans invitation correspondante ne rattache rien.
  orphelin := app.accept_member_invitation('77777777-7777-7777-7777-777777777777',
                                           'inconnu@ailleurs.ca');
  if orphelin is not null then
    raise exception 'ÉCHEC — un courriel sans invitation a été rattaché à une agence';
  end if;

  raise notice 'OK   — la première connexion rattache l''invitation (casse comprise), et rien d''autre';
end $$;


\echo ''
\echo 'Tous les tests de permissions sont passés.'
