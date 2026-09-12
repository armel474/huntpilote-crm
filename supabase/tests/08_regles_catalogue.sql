-- =============================================================================
-- Vérification du catalogue de l'agence (migration 0012)
-- =============================================================================
-- L'enjeu de cette migration n'est pas de stocker des prix : c'est que vendre
-- une offre engage un travail, et que ce travail apparaisse sans que personne
-- l'invente. Ce fichier le vérifie mois par mois.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- =============================================================================
-- Le catalogue de démonstration — les cinq services de `onboarding.ts`
-- =============================================================================

insert into public.catalog_item (id, agency_id, code, name, description, price_cents, kind, billing, unit, position)
values
  ('e1000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'seotech', 'SEO technique', 'Performance, exploration, indexation', 40000, 'service', 'mensuel', 'mois', 1),
  ('e1000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'contenu', 'Contenu', 'Rédaction et optimisation on-page', 35000, 'service', 'mensuel', 'mois', 2),
  ('e1000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'seolocal', 'SEO local', 'Fiche Google Business, citations', 25000, 'service', 'mensuel', 'mois', 3),
  ('e1000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001',
   'audit-complet', 'Audit complet', 'Audit technique ponctuel', 120000, 'produit', 'ponctuel', 'audit', 4);


\echo ''
\echo '--- Un produit se vend une fois, un service se reconduit ---'

do $$
begin
  begin
    insert into public.catalog_item (agency_id, code, name, kind, billing)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'incoherent',
            'Produit facturé au mois', 'produit', 'mensuel');
    raise exception 'ÉCHEC — un produit facturé au mois a été accepté';
  exception when check_violation then
    raise notice 'OK   — un produit est ponctuel, un service ne l''est jamais';
  end;
end $$;


\echo ''
\echo '--- La remise d''un forfait se voit ---'

insert into public.offer (id, agency_id, code, name, description, price_cents, billing, position)
values ('e2000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'croissance', 'Croissance', 'SEO technique, contenu et audits trimestriels',
        90000, 'mensuel', 2);

insert into public.offer_line (offer_id, catalog_item_id, quantity, position) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 1, 1),
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 1, 2);

do $$
declare valeur bigint; remise bigint;
begin
  select catalog_value_cents, discount_cents into valeur, remise
  from public.offer_value where offer_id = 'e2000000-0000-0000-0000-000000000001';

  -- 400 $ + 350 $ = 750 $ de valeur catalogue, vendus 900 $… non : 750 $
  -- vendus 900 $ serait une majoration. Ici le forfait est à 900 $ pour
  -- 750 $ de catalogue — l'écart est négatif, et c'est exactement ce qu'il
  -- faut voir plutôt que de le découvrir en facturant.
  if valeur <> 75000 then
    raise exception 'ÉCHEC — valeur catalogue attendue 750 $, obtenu % $', valeur / 100.0;
  end if;
  if remise <> -15000 then
    raise exception 'ÉCHEC — écart attendu −150 $, obtenu % $', remise / 100.0;
  end if;
  raise notice 'OK   — 750 $ de catalogue vendus 900 $ : l''écart de −150 $ est affiché, pas caché';
end $$;


\echo ''
\echo '--- Vendre une offre crée le travail qu''elle engage ---'

insert into public.offer_task_template
  (id, offer_id, title, kind, cadence, estimate_hours, due_day, default_role, position)
values
  ('e3000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001',
   'Configurer les accès et les intégrations', 'technique', 'signature', 3, 10, 'chef_projet', 1),
  ('e3000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000001',
   'Relevé de positions et compte rendu', 'technique', 'mensuel', 2, 5, 'specialiste_seo', 2),
  ('e3000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000001',
   'Audit technique complet', 'technique', 'trimestriel', 6, 15, 'specialiste_seo', 3);

insert into public.client_subscription
  (id, agency_id, client_id, offer_id, price_cents, billing, started_on)
values ('e4000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001',
        90000, 'mensuel', '2026-01-15');

do $$
declare n integer; titres text;
begin
  select count(*), string_agg(title, ' · ' order by title) into n, titres
  from public.task
  where client_id = 'cccccccc-0000-0000-0000-000000000001'
    and period_month = '2026-01-01';

  -- Le mois de signature porte les trois : celle de démarrage, la mensuelle,
  -- et la trimestrielle (le trimestre commence à la signature).
  if n <> 3 then
    raise exception 'ÉCHEC — 3 tâches attendues au mois de signature, obtenu % (%)', n, titres;
  end if;
  raise notice 'OK   — souscrire crée les 3 tâches du mois de signature, sans intervention';
end $$;


\echo ''
\echo '--- Chaque cadence tombe quand elle doit ---'

do $$
declare fev integer; mars integer; avril integer;
begin
  fev   := app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-02-01');
  mars  := app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-03-01');
  avril := app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-04-01');

  -- Février et mars : la mensuelle seule. Avril : mensuelle + trimestrielle.
  if fev <> 1 or mars <> 1 then
    raise exception 'ÉCHEC — février et mars devraient porter 1 tâche chacun, obtenu % et %', fev, mars;
  end if;
  if avril <> 2 then
    raise exception 'ÉCHEC — avril devrait porter 2 tâches (mensuelle + trimestrielle), obtenu %', avril;
  end if;
  raise notice 'OK   — mensuelle chaque mois, trimestrielle en avril : la cadence est respectée';
end $$;


\echo ''
\echo '--- Relancer la routine ne duplique rien ---'

do $$
declare avant integer; rejoue integer; apres integer;
begin
  select count(*) into avant from public.task
   where client_id = 'cccccccc-0000-0000-0000-000000000001' and offer_template_id is not null;

  rejoue := app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-04-01')
          + app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-02-01')
          + app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-01-01');

  select count(*) into apres from public.task
   where client_id = 'cccccccc-0000-0000-0000-000000000001' and offer_template_id is not null;

  if rejoue <> 0 or apres <> avant then
    raise exception 'ÉCHEC — la relance a créé % tâche(s) (% → %)', rejoue, avant, apres;
  end if;
  raise notice 'OK   — rejouer trois mois déjà traités ne crée rien : la routine se planifie sans risque';
end $$;


\echo ''
\echo '--- Hors de la période du mandat, rien n''est dû ---'

do $$
declare avant_mandat integer; apres_fin integer;
begin
  avant_mandat := app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2025-12-01');

  update public.client_subscription set ended_on = '2026-04-30'
   where id = 'e4000000-0000-0000-0000-000000000001';
  apres_fin := app.apply_offer_tasks('e4000000-0000-0000-0000-000000000001', '2026-05-01');

  if avant_mandat <> 0 then
    raise exception 'ÉCHEC — % tâche(s) créée(s) avant le début du mandat', avant_mandat;
  end if;
  if apres_fin <> 0 then
    raise exception 'ÉCHEC — % tâche(s) créée(s) après la fin du mandat', apres_fin;
  end if;
  raise notice 'OK   — avant la signature et après la résiliation, l''offre n''engage rien';
end $$;


\echo ''
\echo '--- Deux comptes sur la même offre ne se marchent pas dessus ---'

insert into public.client (id, agency_id, slug, name, initials, type)
values ('cccccccc-0000-0000-0000-0000000000b1', 'aaaaaaaa-0000-0000-0000-000000000001',
        'boreal-immobilier', 'Boréal Immobilier', 'BI', 'client');

do $$
declare n integer;
begin
  insert into public.client_subscription
    (agency_id, client_id, offer_id, price_cents, billing, started_on)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-0000000000b1',
          'e2000000-0000-0000-0000-000000000001', 90000, 'mensuel', '2026-01-15');

  select count(*) into n from public.task
   where client_id = 'cccccccc-0000-0000-0000-0000000000b1' and period_month = '2026-01-01';

  if n <> 3 then
    raise exception 'ÉCHEC — le second compte devrait avoir ses 3 tâches, il en a %', n;
  end if;
  raise notice 'OK   — le second compte a ses propres tâches, sans collision de référence';
end $$;


\echo ''
\echo '--- Un compte ne souscrit pas deux fois à la même offre ---'

do $$
begin
  begin
    insert into public.client_subscription
      (agency_id, client_id, offer_id, price_cents, billing)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-0000000000b1',
            'e2000000-0000-0000-0000-000000000001', 90000, 'mensuel');
    raise exception 'ÉCHEC — un second abonnement actif à la même offre a été accepté';
  exception when unique_violation then
    raise notice 'OK   — deux fois le même forfait actif sur le même compte est refusé';
  end;

  begin
    insert into public.client_subscription
      (agency_id, client_id, offer_id, catalog_item_id, price_cents)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', 90000);
    raise exception 'ÉCHEC — un abonnement à la fois offre et article a été accepté';
  exception when check_violation then
    raise notice 'OK   — on souscrit à une offre ou à un article, pas aux deux';
  end;
end $$;


\echo ''
\echo '--- Le revenu récurrent se compte sur les abonnements ---'

insert into public.client_subscription
  (agency_id, client_id, catalog_item_id, price_cents, billing)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-0000000000b1',
        'e1000000-0000-0000-0000-000000000003', 24000, 'annuel');

do $$
declare mrr bigint;
begin
  select mrr_cents into mrr from public.client_mrr
   where client_id = 'cccccccc-0000-0000-0000-0000000000b1';

  -- 900 $ par mois + 240 $ par an ramenés au mois (20 $) = 920 $.
  if mrr <> 92000 then
    raise exception 'ÉCHEC — revenu mensuel attendu 920 $, obtenu % $', mrr / 100.0;
  end if;
  raise notice 'OK   — 900 $/mois + 240 $/an ramenés au mois = 920 $, calculés, jamais saisis';
end $$;

do $$
declare mrr bigint;
begin
  -- Le mandat d'Acme s'est terminé plus haut : il ne compte plus.
  select mrr_cents into mrr from public.client_mrr
   where client_id = 'cccccccc-0000-0000-0000-000000000001';
  if mrr is not null then
    raise exception 'ÉCHEC — un mandat résilié compte encore pour % $', mrr / 100.0;
  end if;
  raise notice 'OK   — un mandat résilié sort du revenu récurrent le jour même';
end $$;


\echo ''
\echo '--- Deux objets ne partagent jamais un numéro ---'

do $$
declare a integer; b integer; c integer;
begin
  -- Un usage de test, pas « facture » : consommer des numéros de facture ici
  -- décalerait la suite réelle vérifiée par 09_regles_documents.sql.
  a := app.next_number('aaaaaaaa-0000-0000-0000-000000000001', 'essai', 2026);
  b := app.next_number('aaaaaaaa-0000-0000-0000-000000000001', 'essai', 2026);
  c := app.next_number('aaaaaaaa-0000-0000-0000-000000000002', 'essai', 2026);

  if b <> a + 1 then
    raise exception 'ÉCHEC — deux appels ont rendu % puis %', a, b;
  end if;
  if c <> 1 then
    raise exception 'ÉCHEC — une autre agence devrait repartir à 1, elle obtient %', c;
  end if;
  raise notice 'OK   — le compteur avance, et chaque agence a le sien';
end $$;


\echo ''
\echo '--- Cloisonnement ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer; o integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.offer;
  select count(*) into o from public.offer_value;
  if n <> 0 or o <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % offre(s) et % valorisation(s)', n, o;
  end if;
  raise notice 'OK   — le catalogue d''une agence reste chez elle';
end $$;

do $$
declare n integer; t integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into n from public.client_subscription;
  select count(*) into t from public.offer_task_template;
  if n <> 1 then
    raise exception 'ÉCHEC — le contact devrait voir son seul abonnement, il en voit %', n;
  end if;
  if t <> 0 then
    raise exception 'ÉCHEC — le contact voit le détail du travail engagé par l''offre';
  end if;
  raise notice 'OK   — le client voit son contrat, pas la mécanique interne de l''offre';
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  begin
    perform app.next_number('aaaaaaaa-0000-0000-0000-000000000001', 'essai', 2026);
    raise notice 'OK   — la numérotation passe par la fonction, jamais par la table';
  exception when others then
    raise exception 'ÉCHEC — un membre ne peut plus obtenir un numéro : %', left(sqlerrm, 60);
  end;
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  select count(*) into n from public.number_counter;
  if n <> 0 then
    raise exception 'ÉCHEC — les compteurs sont lisibles depuis l''application (% ligne(s))', n;
  end if;
  raise notice 'OK   — les compteurs eux-mêmes restent hors de portée';
end $$;


\echo ''
\echo 'Tous les tests du catalogue sont passés.'
