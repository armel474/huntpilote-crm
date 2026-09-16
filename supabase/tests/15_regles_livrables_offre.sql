-- =============================================================================
-- Vérification des livrables d'offre et du droit sur le catalogue (0022)
-- =============================================================================
-- Une offre promet des livrables, distincts de ses tâches ; leur code est
-- unique par offre et les rondes ne sont pas négatives. Ce qui compose une
-- offre — lignes, segments, bénéfices, tâches, livrables — se lit dans toute
-- l'agence et ne s'écrit qu'avec « Gérer le catalogue ». Le taux de
-- dépassement d'une offre n'est pas négatif.
--
-- À lancer après 14_regles_profil_complet.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


\echo ''
\echo '--- Une offre promet des livrables, avec un code unique et des rondes ---'

do $$
begin
  insert into public.offer_deliverable_template (id, offer_id, code, title, included_rounds, position)
  values ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
          'L-01', 'Maquettes Figma', 2, 1),
         ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
          'L-02', 'Formation Webflow', null, 2);
  raise notice 'OK   — une offre porte ses livrables, avec ou sans rondes';

  begin
    insert into public.offer_deliverable_template (offer_id, code, title)
    values ('b0000000-0000-0000-0000-000000000001', 'L-01', 'Doublon');
    raise exception 'ÉCHEC — deux livrables portent le même code dans une offre';
  exception when unique_violation then
    raise notice 'OK   — un code de livrable est unique dans son offre';
  end;

  begin
    insert into public.offer_deliverable_template (offer_id, code, title, included_rounds)
    values ('b0000000-0000-0000-0000-000000000001', 'L-99', 'Négatif', -1);
    raise exception 'ÉCHEC — des rondes négatives ont été acceptées';
  exception when check_violation then
    raise notice 'OK   — les rondes incluses ne sont pas négatives';
  end;

  begin
    update public.offer set overage_hourly_rate_cents = -1
     where id = 'b0000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un taux de dépassement négatif a été accepté';
  exception when check_violation then
    raise notice 'OK   — le taux de dépassement n''est pas négatif';
  end;

  update public.offer set overage_hourly_rate_cents = 9500
   where id = 'b0000000-0000-0000-0000-000000000001';
  raise notice 'OK   — le taux de dépassement s''enregistre en cents par heure';
end $$;


\echo ''
\echo '--- Ce qui compose une offre se lit dans l''agence, s''écrit avec le droit ---'

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur

  select count(*) into n from public.offer_deliverable_template
   where offer_id = 'b0000000-0000-0000-0000-000000000001';
  if n <> 2 then
    raise exception 'ÉCHEC — le rédacteur devrait voir les livrables promis (% vus)', n;
  end if;
  select count(*) into n from public.offer_line
   where offer_id = 'b0000000-0000-0000-0000-000000000001';
  if n = 0 then
    raise exception 'ÉCHEC — le rédacteur devrait voir le contenu d''une offre';
  end if;
  raise notice 'OK   — le rédacteur lit les lignes et les livrables d''une offre';

  update public.offer_deliverable_template set title = 'Piraté'
   where id = 'd0000000-0000-0000-0000-000000000001';
  update public.offer_line set quantity = 99
   where offer_id = 'b0000000-0000-0000-0000-000000000001';
  update public.offer_task_template set title = 'Piraté'
   where offer_id = 'b0000000-0000-0000-0000-000000000001';
  delete from public.offer_benefit
   where offer_id = 'b0000000-0000-0000-0000-000000000001';
  delete from public.offer_segment
   where offer_id = 'b0000000-0000-0000-0000-000000000001';

  select count(*) into n from public.offer_deliverable_template where title = 'Piraté';
  if n <> 0 then raise exception 'ÉCHEC — le rédacteur a renommé un livrable'; end if;
  select count(*) into n from public.offer_line where quantity = 99;
  if n <> 0 then raise exception 'ÉCHEC — le rédacteur a changé une quantité'; end if;
  select count(*) into n from public.offer_task_template where title = 'Piraté';
  if n <> 0 then raise exception 'ÉCHEC — le rédacteur a renommé une tâche engagée'; end if;
  raise notice 'OK   — sans « Gérer le catalogue », aucune ligne, tâche ou livrable ne bouge';
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur

  insert into public.offer_deliverable_template (offer_id, code, title)
  values ('b0000000-0000-0000-0000-000000000001', 'L-03', 'Livrable improvisé');
  raise exception 'ÉCHEC — le rédacteur a promis un livrable';
exception
  when insufficient_privilege then
    raise notice 'OK   — promettre un livrable lui est refusé';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — promettre un livrable lui est refusé  (%)', left(sqlerrm, 44);
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur

  insert into public.offer_benefit (offer_id, position, label)
  values ('b0000000-0000-0000-0000-000000000001', 99, 'Bénéfice improvisé');
  raise exception 'ÉCHEC — le rédacteur a ajouté un bénéfice';
exception
  when insufficient_privilege then
    raise notice 'OK   — ajouter un bénéfice lui est refusé';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — ajouter un bénéfice lui est refusé  (%)', left(sqlerrm, 44);
end $$;

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin

  update public.offer_deliverable_template set title = 'Maquettes Figma (haute fidélité)'
   where id = 'd0000000-0000-0000-0000-000000000001';
  select title into v from public.offer_deliverable_template
   where id = 'd0000000-0000-0000-0000-000000000001';
  if v <> 'Maquettes Figma (haute fidélité)' then
    raise exception 'ÉCHEC — l''administratrice n''a pas pu renommer un livrable';
  end if;

  insert into public.offer_deliverable_template (offer_id, code, title, included_rounds, position)
  values ('b0000000-0000-0000-0000-000000000001', 'L-03', 'Site Webflow', 1, 3);
  insert into public.offer_benefit (offer_id, position, label)
  values ('b0000000-0000-0000-0000-000000000001', 99, 'Un site prêt à convaincre');
  delete from public.offer_benefit
   where offer_id = 'b0000000-0000-0000-0000-000000000001' and position = 99;
  raise notice 'OK   — avec « Gérer le catalogue », livrables et bénéfices s''écrivent';
end $$;


\echo ''
\echo '--- Supprimer une offre emporte ses livrables promis ---'

do $$
declare n integer;
begin
  insert into public.offer (id, agency_id, code, name, price_cents, billing)
  values ('b9000000-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001',
          'offre-jetable', 'Offre jetable', 100, 'ponctuel');
  insert into public.offer_deliverable_template (offer_id, code, title)
  values ('b9000000-0000-0000-0000-000000000009', 'L-01', 'Jetable');
  delete from public.offer where id = 'b9000000-0000-0000-0000-000000000009';
  select count(*) into n from public.offer_deliverable_template
   where offer_id = 'b9000000-0000-0000-0000-000000000009';
  if n <> 0 then raise exception 'ÉCHEC — un livrable a survécu à son offre'; end if;
  raise notice 'OK   — les livrables promis disparaissent avec l''offre';
end $$;
