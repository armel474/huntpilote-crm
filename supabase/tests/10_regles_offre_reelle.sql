-- =============================================================================
-- Vérification de l'offre réelle de l'agence (migration 0014)
-- =============================================================================
-- Ce fichier monte les vraies offres — les trois forfaits web et les trois
-- packs SEO — et vérifie que le modèle les décrit sans rien perdre : les
-- emboîtements, le prix plancher, le tarif d'entrée, l'alternative laissée au
-- client, et le travail que tout cela engage.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- =============================================================================
-- Quelques livrables du catalogue
-- =============================================================================

insert into public.catalog_item (id, agency_id, code, name, price_cents, kind, billing, unit) values
  ('a0000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'maquette-figma', 'Maquette Figma (desktop + mobile)', 120000, 'produit', 'ponctuel', 'maquette'),
  ('a0000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'dev-webflow', 'Développement Webflow responsive', 180000, 'produit', 'ponctuel', 'site'),
  ('a0000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'boutique-shopify', 'Boutique e-commerce (Shopify + Webflow)', 300000, 'produit', 'ponctuel', 'boutique'),
  ('a0000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001',
   'gmb-gestion', 'Gestion et optimisation Google My Business', 12000, 'service', 'mensuel', 'mois'),
  ('a0000000-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001',
   'article-seo', 'Article de blogue SEO', 18000, 'service', 'mensuel', 'article');


-- =============================================================================
-- Les trois forfaits web, qui s'emboîtent
-- =============================================================================

insert into public.offer
  (id, agency_id, code, name, tagline, price_cents, price_is_from, billing,
   delivery_weeks_min, delivery_weeks_max, free_consult_minutes, is_popular, position)
values
  ('b0000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'presence-digitale', 'Présence Digitale',
   'Votre vitrine professionnelle sur le web, conçue pour inspirer confiance et générer des contacts.',
   450000, true, 'ponctuel', 4, 4, 30, false, 1),
  ('b0000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'croissance-digitale', 'Croissance Digitale',
   'Un écosystème digital complet qui gère vos clients, vos réservations et votre contenu en autonomie.',
   900000, true, 'ponctuel', 5, 6, 30, true, 2),
  ('b0000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'commerce-digital', 'Commerce Digital',
   'Une boutique en ligne haute performance qui vend pour vous, 24 h/24 et 7 j/7.',
   1300000, true, 'ponctuel', 6, 8, 30, false, 3);

-- « Tout ce qui est dans Présence Digitale », « … dans Croissance Digitale ».
insert into public.offer_line (offer_id, catalog_item_id, quantity) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 1),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 1);

insert into public.offer_line (offer_id, included_offer_id, quantity) values
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 1);

insert into public.offer_benefit (offer_id, position, label) values
  ('b0000000-0000-0000-0000-000000000002', 1, 'Réservations en ligne 24 h/24 sans appels'),
  ('b0000000-0000-0000-0000-000000000002', 2, 'Contenu dynamique gérable sans développeur'),
  ('b0000000-0000-0000-0000-000000000002', 3, 'Visibilité locale renforcée sur Google & Bing');

insert into public.offer_segment (offer_id, label, position) values
  ('b0000000-0000-0000-0000-000000000002', 'Agences', 1),
  ('b0000000-0000-0000-0000-000000000002', 'Cliniques', 2),
  ('b0000000-0000-0000-0000-000000000002', 'Restauration', 3);


\echo ''
\echo '--- Une offre en contient une autre, et la valeur suit ---'

do $$
declare v bigint; e bigint;
begin
  -- Commerce Digital contient Croissance Digitale, qui contient Présence
  -- Digitale : 1 200 $ + 1 800 $ (Présence) + 3 000 $ (boutique) = 6 000 $.
  select catalog_value_cents into v from public.offer_value
   where offer_id = 'b0000000-0000-0000-0000-000000000003';

  if v <> 600000 then
    raise exception 'ÉCHEC — valeur catalogue attendue 6 000 $, obtenu % $', v / 100.0;
  end if;

  select catalog_value_cents into e from public.offer_value
   where offer_id = 'b0000000-0000-0000-0000-000000000002';
  if e <> 300000 then
    raise exception 'ÉCHEC — Croissance devrait valoir 3 000 $ de catalogue, obtenu % $', e / 100.0;
  end if;

  raise notice 'OK   — « tout ce qui est dans… » se calcule en cascade, sans rien recopier';
end $$;


\echo ''
\echo '--- Le catalogue ne peut pas tourner en rond ---'

do $$
begin
  begin
    insert into public.offer_line (offer_id, included_offer_id)
    values ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003');
    raise exception 'ÉCHEC — un cycle d''inclusion a été accepté';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — %', left(sqlerrm, 74);
  end;

  begin
    insert into public.offer_line (offer_id, included_offer_id)
    values ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');
    raise exception 'ÉCHEC — une offre s''est incluse elle-même';
  exception when check_violation then
    raise notice 'OK   — une offre ne se contient pas elle-même';
  end;
end $$;


\echo ''
\echo '--- « À partir de » : le prix est un plancher, pas un tarif ---'

do $$
declare depuis boolean; prix integer;
begin
  select price_is_from, price_cents into depuis, prix
  from public.offer_value where offer_id = 'b0000000-0000-0000-0000-000000000001';

  if not depuis or prix <> 450000 then
    raise exception 'ÉCHEC — attendu « à partir de 4 500 $ », obtenu % / %', depuis, prix / 100.0;
  end if;
  raise notice 'OK   — 4 500 $ est annoncé comme un plancher : un devis à 6 200 $ ne le contredit pas';
end $$;


-- =============================================================================
-- Les trois packs SEO, et le chemin commercial
-- =============================================================================

insert into public.offer
  (id, agency_id, code, name, tagline, price_cents, price_is_from, billing,
   intro_price_cents, intro_periods, is_popular, position)
values
  ('b1000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'visibilite-locale', 'Visibilité Locale',
   'Dominez les recherches locales et attirez des clients dans votre zone géographique.',
   40000, true, 'mensuel', 30000, 3, false, 1),
  ('b1000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'croissance-seo', 'Croissance SEO',
   'Augmentez votre trafic organique et convertissez plus de visiteurs en clients qualifiés.',
   70000, true, 'mensuel', 52500, 3, true, 2),
  ('b1000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'domination-seo', 'Domination SEO',
   'Une stratégie SEO complète et agressive pour dominer votre marché.',
   110000, true, 'mensuel', 82500, 3, false, 3);

insert into public.offer_line (offer_id, catalog_item_id, quantity) values
  ('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 1),
  ('b1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 2);

insert into public.offer_line (offer_id, included_offer_id) values
  ('b1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002');

-- « Idéal pour : Croissance Digitale » — le pack prolonge le forfait web.
update public.offer set recommended_offer_id = 'b1000000-0000-0000-0000-000000000001'
 where id = 'b0000000-0000-0000-0000-000000000001';
update public.offer set recommended_offer_id = 'b1000000-0000-0000-0000-000000000002'
 where id = 'b0000000-0000-0000-0000-000000000002';
update public.offer set recommended_offer_id = 'b1000000-0000-0000-0000-000000000003'
 where id = 'b0000000-0000-0000-0000-000000000003';


\echo ''
\echo '--- Chaque forfait web désigne le pack qui le prolonge ---'

do $$
declare suite text;
begin
  select o2.name into suite
    from public.offer o1
    join public.offer o2 on o2.id = o1.recommended_offer_id
   where o1.code = 'commerce-digital';

  if suite <> 'Domination SEO' then
    raise exception 'ÉCHEC — Commerce Digital devrait mener à Domination SEO, obtenu %', suite;
  end if;
  raise notice 'OK   — vendre un site désigne le pack qui suit : le chemin est dans la base, pas dans une tête';
end $$;


\echo ''
\echo '--- Le tarif d''entrée compte dans le revenu, pas le prix courant ---'

insert into public.client_subscription
  (id, agency_id, client_id, offer_id, price_cents, billing, started_on,
   intro_price_cents, intro_ends_on)
values ('b2000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
        70000, 'mensuel', current_date, 52500, current_date + 60);

do $$
declare mrr bigint;
begin
  select mrr_cents into mrr from public.client_mrr
   where client_id = 'cccccccc-0000-0000-0000-000000000001';

  if mrr <> 52500 then
    raise exception 'ÉCHEC — pendant les 3 premiers mois, le revenu est de 525 $, obtenu % $', mrr / 100.0;
  end if;

  update public.client_subscription set intro_ends_on = current_date - 1
   where id = 'b2000000-0000-0000-0000-000000000001';

  select mrr_cents into mrr from public.client_mrr
   where client_id = 'cccccccc-0000-0000-0000-000000000001';
  if mrr <> 70000 then
    raise exception 'ÉCHEC — le tarif préférentiel terminé, le revenu passe à 700 $, obtenu % $', mrr / 100.0;
  end if;

  raise notice 'OK   — 525 $ pendant la période préférentielle, 700 $ ensuite, sans intervention';
end $$;

do $$
declare mrr bigint;
begin
  -- Un forfait web est un paiement unique : il ne gonfle pas le récurrent.
  insert into public.client_subscription
    (agency_id, client_id, offer_id, price_cents, billing)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
          'b0000000-0000-0000-0000-000000000002', 900000, 'ponctuel');

  select mrr_cents into mrr from public.client_mrr
   where client_id = 'cccccccc-0000-0000-0000-000000000001';
  if mrr <> 70000 then
    raise exception 'ÉCHEC — un site à 9 000 $ payé une fois a été compté comme du récurrent (% $)', mrr / 100.0;
  end if;
  raise notice 'OK   — 9 000 $ de site ne sont pas 9 000 $ par mois : le récurrent reste à 700 $';
end $$;


\echo ''
\echo '--- L''alternative laissée au client décide du travail ---'

insert into public.offer_task_template
  (id, offer_id, title, kind, cadence, estimate_hours, option_group, option_key, position)
values
  ('b3000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
   'Configurer l''espace membres (MemberStack)', 'technique', 'signature', 6,
   'espace-ou-reservation', 'membres', 1),
  ('b3000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
   'Configurer la réservation avancée (Acuity + Jotform)', 'technique', 'signature', 6,
   'espace-ou-reservation', 'reservation', 2);

-- Une tâche sans alternative, pour vérifier qu'elle tombe quand même.
insert into public.offer_task_template
  (id, offer_id, title, kind, cadence, estimate_hours, position)
values ('b3000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
        'Sitemap et architecture de l''information', 'technique', 'signature', 4, 1);

insert into public.client (id, agency_id, slug, name, initials, type)
values ('cccccccc-0000-0000-0000-0000000000c1', 'aaaaaaaa-0000-0000-0000-000000000001',
        'clinique-lavoie', 'Clinique Lavoie', 'CL', 'client');

insert into public.client_subscription
  (id, agency_id, client_id, offer_id, price_cents, billing, started_on)
values ('b2000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-0000000000c1', 'b0000000-0000-0000-0000-000000000002',
        900000, 'ponctuel', current_date);

do $$
declare n integer; titres text;
begin
  select count(*), string_agg(title, ' | ' order by title) into n, titres
  from public.task where client_id = 'cccccccc-0000-0000-0000-0000000000c1';

  -- Sans choix exprimé : seule la tâche de l'offre incluse (Présence
  -- Digitale) est due. Les deux alternatives attendent.
  if n <> 1 then
    raise exception 'ÉCHEC — 1 tâche attendue tant que le choix n''est pas fait, obtenu % (%)', n, titres;
  end if;
  raise notice 'OK   — l''offre incluse engage son travail ; l''alternative attend le choix du client';
end $$;

do $$
declare n integer; quoi text;
begin
  insert into public.subscription_option (subscription_id, option_group, option_key)
  values ('b2000000-0000-0000-0000-000000000002', 'espace-ou-reservation', 'reservation');

  select count(*) into n from public.task
   where client_id = 'cccccccc-0000-0000-0000-0000000000c1';
  select title into quoi from public.task
   where client_id = 'cccccccc-0000-0000-0000-0000000000c1'
     and offer_template_id is not null
     and title like 'Configurer%';

  if n <> 2 then
    raise exception 'ÉCHEC — 2 tâches attendues après le choix, obtenu %', n;
  end if;
  if quoi not like '%Acuity%' then
    raise exception 'ÉCHEC — c''est la réservation qui a été choisie, la tâche créée est « % »', quoi;
  end if;
  raise notice 'OK   — choisir la réservation crée sa tâche, et pas celle de l''espace membres';
end $$;


\echo ''
\echo '--- Souscrire à Commerce Digital engage tout ce qu''il contient ---'

insert into public.offer_task_template
  (offer_id, title, kind, cadence, estimate_hours, position)
values ('b0000000-0000-0000-0000-000000000003',
        'Intégrer la boutique Shopify', 'technique', 'signature', 12, 1);

insert into public.client (id, agency_id, slug, name, initials, type)
values ('cccccccc-0000-0000-0000-0000000000c2', 'aaaaaaaa-0000-0000-0000-000000000001',
        'marche-bio', 'Le Marché Bio', 'MB', 'client');

insert into public.client_subscription
  (id, agency_id, client_id, offer_id, price_cents, billing, started_on)
values ('b2000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-0000000000c2', 'b0000000-0000-0000-0000-000000000003',
        1300000, 'ponctuel', current_date);

do $$
declare n integer; titres text;
begin
  select count(*), string_agg(title, ' | ' order by title) into n, titres
  from public.task where client_id = 'cccccccc-0000-0000-0000-0000000000c2';

  -- La boutique (Commerce) + le sitemap (Présence, via Croissance). Les deux
  -- alternatives de Croissance attendent toujours un choix.
  if n <> 2 then
    raise exception 'ÉCHEC — 2 tâches attendues en cascade, obtenu % (%)', n, titres;
  end if;
  raise notice 'OK   — le travail des offres incluses descend jusqu''au compte : %', titres;
end $$;


\echo ''
\echo '--- Cloisonnement ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer; b integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.offer_value;
  select count(*) into b from public.offer_benefit;
  if n <> 0 or b <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % offre(s) et % promesse(s)', n, b;
  end if;
  raise notice 'OK   — l''offre commerciale d''une agence ne sort pas de chez elle';
end $$;


\echo ''
\echo 'Tous les tests de l''offre réelle sont passés.'
