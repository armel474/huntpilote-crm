-- =============================================================================
-- Semis — l'agence, son catalogue, son portefeuille
-- =============================================================================
-- Ce fichier pose des **données**, pas du schéma. Le remplacer par une révision
-- de tarifs ou un nouveau client ne demande aucune migration.
--
-- Ce qui est réel :
--   · l'agence DigiHunt, son identité de facturation, son NEQ ;
--   · les six offres telles qu'elles sont vendues ;
--   · le mandat SHGM — contrat n° 2026-007, ses livrables, son échéancier.
--
-- Ce qui est fictif, et assumé comme tel : les trois autres comptes, les trois
-- membres d'équipe de décor, les prospects. Les noms d'entreprise viennent de
-- données de prospection, pas de mandats.
--
-- À lancer sur une base fraîche. Le garde-fou ci-dessous empêche un second
-- passage de dupliquer le portefeuille.
-- =============================================================================

do $$
begin
  if exists (select 1 from public.agency) then
    raise exception
      'Le semis a déjà été passé sur cette base : il n''est pas conçu pour être rejoué.';
  end if;
end $$;


-- =============================================================================
-- L'agence
-- =============================================================================
-- Identité tirée du contrat de services n° 2026-007.

insert into public.agency
  (id, name, slug, legal_name, address, city, province, postal_code, country,
   website, phone, email)
values ('11110000-0000-0000-0000-000000000001',
        'Agence DigiHunt', 'digihunt',
        'Armel Junior Nguimbi, faisant affaire sous le nom d''« Agence DigiHunt »',
        '25 rue des Mouettes', 'Amqui', 'QC', null, 'CA',
        null, null, null);

-- ⚠ À compléter : les numéros d'inscription à la TPS et à la TVQ. Le contrat
-- réclame les deux taxes sans les afficher — or une facture qui les réclame
-- doit les porter, sinon le client ne peut pas récupérer ses crédits.
-- Le NEQ figure au contrat : 2272419658.

update public.agency_settings
   set monthly_credit_quota = 10000,
       health_score_alert_below = 70
 where agency_id = '11110000-0000-0000-0000-000000000001';


-- =============================================================================
-- L'équipe
-- =============================================================================
-- Une personne réelle, invitée — elle prendra son compte à la première
-- connexion, par rapprochement sur le courriel. Trois membres de décor, pour
-- que l'assignation, la relecture et les permissions s'exercent vraiment.

insert into public.agency_member
  (id, agency_id, role, initials, first_name, last_name, email, job_title,
   started_on, hourly_rate_cents, invited_at)
values
  ('22220000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   'admin', 'AN', 'Armel Junior', 'Nguimbi', 'armel.nguimbi47@gmail.com',
   'Fondateur', '2026-01-01', 10000, now()),
  ('22220000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   'chef_projet', 'JD', 'Julien', 'Dubois', 'julien@digihunt.ca',
   'Chef de projet', '2026-02-01', 9000, now()),
  ('22220000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   'specialiste_seo', 'AL', 'Aïcha', 'Lemaire', 'aicha@digihunt.ca',
   'Spécialiste SEO', '2026-03-15', 8500, now()),
  ('22220000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001',
   'redacteur', 'TB', 'Tom', 'Bélanger', 'tom@digihunt.ca',
   'Rédacteur', '2026-05-01', 7000, now());


-- =============================================================================
-- Les modèles de documents
-- =============================================================================

insert into public.document_template
  (id, agency_id, kind, name, is_default, prefix, include_year, number_padding,
   payment_terms_days, legal_mentions, payment_instructions)
values
  ('33330000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   'devis', 'Devis standard', true, 'DV', true, 3, 30,
   'Devis valide 30 jours à compter de sa date d''émission. Taxes en sus.',
   'Virement bancaire ou carte de crédit (facturation transmise via QuickBooks ou Stripe).'),
  ('33330000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   'facture', 'Facture standard', true, 'FA', true, 4, 30,
   'Tout retard de paiement doit être signalé dans les meilleurs délais. '
   'Au-delà de 60 jours sans justification, des frais de retard raisonnables '
   'peuvent être appliqués et les services en cours suspendus.',
   'Virement bancaire ou carte de crédit (facturation transmise via QuickBooks ou Stripe).'),
  ('33330000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   'proposition', 'Proposition de services', true, null, true, 3, 0,
   'La présente proposition est valide 30 jours. Son acceptation par le Client '
   'entraîne la signature d''un contrat de services professionnels.', null),
  ('33330000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001',
   'contrat', 'Contrat de services professionnels', true, null, true, 3, 0,
   'Le présent contrat est régi par les lois du Québec. En cas de conflit entre '
   'le corps du contrat, l''Annexe A et la Proposition, cet ordre de priorité '
   'prévaut.', null);


-- =============================================================================
-- Le catalogue
-- =============================================================================
-- Les livrables des forfaits web (produits, ponctuels) et les services des
-- packs SEO (mensuels). Les prix unitaires sont laissés vides : l'agence vend
-- des forfaits, pas des lignes. Les renseigner ne sert qu'à faire apparaître
-- la remise d'un forfait dans `offer_value`.

insert into public.catalog_item (agency_id, code, name, description, kind, billing, unit, position)
values
  -- Présence Digitale
  ('11110000-0000-0000-0000-000000000001', 'sitemap-archi',
   'Sitemap et architecture de l''information', null, 'produit', 'ponctuel', 'plan', 1),
  ('11110000-0000-0000-0000-000000000001', 'maquette-figma',
   'Maquette Figma (desktop et mobile)', null, 'produit', 'ponctuel', 'maquette', 2),
  ('11110000-0000-0000-0000-000000000001', 'dev-webflow',
   'Développement Webflow responsive mobile-first', null, 'produit', 'ponctuel', 'site', 3),
  ('11110000-0000-0000-0000-000000000001', 'pages-10',
   'Jusqu''à 10 pages + 1 collection CMS (blogue)', null, 'produit', 'ponctuel', 'lot', 4),
  ('11110000-0000-0000-0000-000000000001', 'copywriting-5',
   'Copywriting (5 sections clés)', null, 'produit', 'ponctuel', 'lot', 5),
  ('11110000-0000-0000-0000-000000000001', 'images-ia',
   'Génération d''images IA haute qualité', null, 'produit', 'ponctuel', 'lot', 6),
  ('11110000-0000-0000-0000-000000000001', 'seo-onpage',
   'SEO technique on-page complet', null, 'produit', 'ponctuel', 'site', 7),
  ('11110000-0000-0000-0000-000000000001', 'analytics-gsc',
   'Google Analytics + Search Console', null, 'produit', 'ponctuel', 'branchement', 8),
  ('11110000-0000-0000-0000-000000000001', 'formation-1h',
   'Formation Webflow (1 h)', null, 'produit', 'ponctuel', 'atelier', 9),

  -- Croissance Digitale
  ('11110000-0000-0000-0000-000000000001', 'pages-20',
   'Jusqu''à 20 pages + 5 collections CMS', null, 'produit', 'ponctuel', 'lot', 10),
  ('11110000-0000-0000-0000-000000000001', 'espace-membres',
   'Espace membres (MemberStack)', null, 'produit', 'ponctuel', 'module', 11),
  ('11110000-0000-0000-0000-000000000001', 'reservation-avancee',
   'Réservation avancée (Acuity + Jotform)', null, 'produit', 'ponctuel', 'module', 12),
  ('11110000-0000-0000-0000-000000000001', 'copywriting-10',
   'Copywriting étendu (10 sections clés)', null, 'produit', 'ponctuel', 'lot', 13),
  ('11110000-0000-0000-0000-000000000001', 'animations-webflow',
   'Animations Webflow avancées', null, 'produit', 'ponctuel', 'lot', 14),
  ('11110000-0000-0000-0000-000000000001', 'clarity',
   'Rapport de comportement (Microsoft Clarity)', null, 'produit', 'ponctuel', 'branchement', 15),
  ('11110000-0000-0000-0000-000000000001', 'formation-2h',
   'Formation Webflow (2 h)', null, 'produit', 'ponctuel', 'atelier', 16),

  -- Commerce Digital
  ('11110000-0000-0000-0000-000000000001', 'boutique-shopify',
   'Boutique e-commerce (Shopify + Webflow)', null, 'produit', 'ponctuel', 'boutique', 17),
  ('11110000-0000-0000-0000-000000000001', 'produits-100',
   'Jusqu''à 100 produits intégrés', null, 'produit', 'ponctuel', 'lot', 18),
  ('11110000-0000-0000-0000-000000000001', 'integrations-ecom',
   'Intégrations Shippo, Printful, Foxy.io', null, 'produit', 'ponctuel', 'branchement', 19),
  ('11110000-0000-0000-0000-000000000001', 'workflows-commandes',
   'Workflows automatisés (commandes, relances)', null, 'produit', 'ponctuel', 'lot', 20),
  ('11110000-0000-0000-0000-000000000001', 'pages-produits',
   'Pages produits optimisées pour la conversion', null, 'produit', 'ponctuel', 'lot', 21),
  ('11110000-0000-0000-0000-000000000001', 'formation-ecom-3h',
   'Formation e-commerce (3 h + tutoriels vidéo)', null, 'produit', 'ponctuel', 'atelier', 22),

  -- Visibilité Locale
  ('11110000-0000-0000-0000-000000000001', 'suivi-mots-cles-locaux',
   'Suivi et optimisation mensuelle des mots-clés locaux', null, 'service', 'mensuel', 'mois', 30),
  ('11110000-0000-0000-0000-000000000001', 'gmb-gestion',
   'Gestion et optimisation Google My Business', null, 'service', 'mensuel', 'mois', 31),
  ('11110000-0000-0000-0000-000000000001', 'gmb-publications',
   'Publication mensuelle sur GMB (2 posts)', null, 'service', 'mensuel', 'mois', 32),
  ('11110000-0000-0000-0000-000000000001', 'netlinking-3',
   'Netlinking local (3 citations par mois)', null, 'service', 'mensuel', 'mois', 33),
  ('11110000-0000-0000-0000-000000000001', 'rapport-local',
   'Rapport mensuel de performance locale', null, 'service', 'mensuel', 'mois', 34),
  ('11110000-0000-0000-0000-000000000001', 'suivi-gsc',
   'Suivi Google Search Console', null, 'service', 'mensuel', 'mois', 35),

  -- Croissance SEO
  ('11110000-0000-0000-0000-000000000001', 'strategie-mots-cles',
   'Stratégie de mots-clés évolutive (veille mensuelle)', null, 'service', 'mensuel', 'mois', 40),
  ('11110000-0000-0000-0000-000000000001', 'articles-2',
   'Rédaction de 2 articles de blogue SEO (1 000 mots)', null, 'service', 'mensuel', 'mois', 41),
  ('11110000-0000-0000-0000-000000000001', 'onpage-continu',
   'Optimisation on-page continue (balises, méta)', null, 'service', 'mensuel', 'mois', 42),
  ('11110000-0000-0000-0000-000000000001', 'rapport-complet',
   'Rapport mensuel complet (trafic, positions, leads)', null, 'service', 'mensuel', 'mois', 43),
  ('11110000-0000-0000-0000-000000000001', 'netlinking-6',
   'Netlinking local (6 citations par mois)', null, 'service', 'mensuel', 'mois', 44),

  -- Domination SEO
  ('11110000-0000-0000-0000-000000000001', 'articles-4',
   'Rédaction de 4 articles de blogue SEO (1 200 mots)', null, 'service', 'mensuel', 'mois', 50),
  ('11110000-0000-0000-0000-000000000001', 'white-hat-avance',
   'Stratégie white hat SEO avancée', null, 'service', 'mensuel', 'mois', 51),
  ('11110000-0000-0000-0000-000000000001', 'audit-trimestriel',
   'Audit SEO trimestriel complet', null, 'service', 'trimestriel', 'audit', 52),
  ('11110000-0000-0000-0000-000000000001', 'analyse-concurrentielle',
   'Analyse concurrentielle mensuelle', null, 'service', 'mensuel', 'mois', 53),
  ('11110000-0000-0000-0000-000000000001', 'netlinking-10',
   'Netlinking local et autorité de domaine (10 citations)', null, 'service', 'mensuel', 'mois', 54),
  ('11110000-0000-0000-0000-000000000001', 'point-strategique',
   'Point stratégique mensuel (30 min avec le fondateur)', null, 'service', 'mensuel', 'mois', 55);


-- =============================================================================
-- Les six offres
-- =============================================================================
-- ⚠ À compléter : le tarif préférentiel des trois premiers mois de chaque pack
-- SEO. Les pages de vente l'annoncent sans le chiffrer ; `intro_price_cents`
-- et `intro_periods` l'attendent.

insert into public.offer
  (id, agency_id, code, name, tagline, price_cents, price_is_from, billing,
   delivery_weeks_min, delivery_weeks_max, free_consult_minutes, is_popular, position)
values
  ('44440000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   'presence-digitale', 'Présence Digitale',
   'Votre vitrine professionnelle sur le web, conçue pour inspirer confiance et générer des contacts.',
   450000, true, 'ponctuel', 4, 4, 30, false, 1),
  ('44440000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   'croissance-digitale', 'Croissance Digitale',
   'Un écosystème digital complet qui gère vos clients, vos réservations et votre contenu en autonomie.',
   900000, true, 'ponctuel', 5, 6, 30, true, 2),
  ('44440000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   'commerce-digital', 'Commerce Digital',
   'Une boutique en ligne haute performance qui vend pour vous, 24 h/24 et 7 j/7.',
   1300000, true, 'ponctuel', 6, 8, 30, false, 3),

  ('44440000-0000-0000-0000-000000000011', '11110000-0000-0000-0000-000000000001',
   'visibilite-locale', 'Visibilité Locale',
   'Dominez les recherches locales et attirez des clients dans votre zone géographique.',
   40000, true, 'mensuel', null, null, null, false, 11),
  ('44440000-0000-0000-0000-000000000012', '11110000-0000-0000-0000-000000000001',
   'croissance-seo', 'Croissance SEO',
   'Augmentez votre trafic organique et convertissez plus de visiteurs en clients qualifiés.',
   70000, true, 'mensuel', null, null, null, true, 12),
  ('44440000-0000-0000-0000-000000000013', '11110000-0000-0000-0000-000000000001',
   'domination-seo', 'Domination SEO',
   'Une stratégie SEO complète et agressive pour dominer votre marché et écraser la concurrence.',
   110000, true, 'mensuel', null, null, null, false, 13);

-- Chaque forfait web désigne le pack mensuel qui le prolonge, et chaque pack
-- désigne le forfait dont il part. C'est le chemin commercial de l'agence.
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000011'
 where id = '44440000-0000-0000-0000-000000000001';
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000012'
 where id = '44440000-0000-0000-0000-000000000002';
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000013'
 where id = '44440000-0000-0000-0000-000000000003';
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000001'
 where id = '44440000-0000-0000-0000-000000000011';
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000002'
 where id = '44440000-0000-0000-0000-000000000012';
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000003'
 where id = '44440000-0000-0000-0000-000000000013';


-- Ce que chaque offre contient, et ce qu'elle inclut des précédentes.
insert into public.offer_line (offer_id, catalog_item_id, quantity, position)
select '44440000-0000-0000-0000-000000000001', i.id, 1, i.position
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001'
   and i.code in ('sitemap-archi', 'maquette-figma', 'dev-webflow', 'pages-10',
                  'copywriting-5', 'images-ia', 'seo-onpage', 'analytics-gsc',
                  'formation-1h');

insert into public.offer_line (offer_id, included_offer_id, quantity, position)
values ('44440000-0000-0000-0000-000000000002', '44440000-0000-0000-0000-000000000001', 1, 0);

insert into public.offer_line (offer_id, catalog_item_id, quantity, position)
select '44440000-0000-0000-0000-000000000002', i.id, 1, i.position
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001'
   and i.code in ('pages-20', 'copywriting-10', 'animations-webflow', 'clarity',
                  'formation-2h');

-- « Espace membres *ou* réservation avancée » : deux alternatives, le client
-- en retient une.
insert into public.offer_line
  (offer_id, catalog_item_id, quantity, position, option_group, option_key, label)
select '44440000-0000-0000-0000-000000000002', i.id, 1, 11,
       'espace-ou-reservation', 'membres', 'Espace membres (MemberStack)'
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001' and i.code = 'espace-membres';

insert into public.offer_line
  (offer_id, catalog_item_id, quantity, position, option_group, option_key, label)
select '44440000-0000-0000-0000-000000000002', i.id, 1, 12,
       'espace-ou-reservation', 'reservation', 'Réservation avancée (Acuity + Jotform)'
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001' and i.code = 'reservation-avancee';

insert into public.offer_line (offer_id, included_offer_id, quantity, position)
values ('44440000-0000-0000-0000-000000000003', '44440000-0000-0000-0000-000000000002', 1, 0);

insert into public.offer_line (offer_id, catalog_item_id, quantity, position)
select '44440000-0000-0000-0000-000000000003', i.id, 1, i.position
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001'
   and i.code in ('boutique-shopify', 'produits-100', 'integrations-ecom',
                  'workflows-commandes', 'pages-produits', 'formation-ecom-3h');

insert into public.offer_line (offer_id, catalog_item_id, quantity, position)
select '44440000-0000-0000-0000-000000000011', i.id, 1, i.position
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001'
   and i.code in ('suivi-mots-cles-locaux', 'gmb-gestion', 'gmb-publications',
                  'netlinking-3', 'rapport-local', 'suivi-gsc');

insert into public.offer_line (offer_id, included_offer_id, quantity, position)
values ('44440000-0000-0000-0000-000000000012', '44440000-0000-0000-0000-000000000011', 1, 0);

insert into public.offer_line (offer_id, catalog_item_id, quantity, position)
select '44440000-0000-0000-0000-000000000012', i.id, 1, i.position
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001'
   and i.code in ('strategie-mots-cles', 'articles-2', 'onpage-continu',
                  'rapport-complet', 'netlinking-6');

insert into public.offer_line (offer_id, included_offer_id, quantity, position)
values ('44440000-0000-0000-0000-000000000013', '44440000-0000-0000-0000-000000000012', 1, 0);

insert into public.offer_line (offer_id, catalog_item_id, quantity, position)
select '44440000-0000-0000-0000-000000000013', i.id, 1, i.position
  from public.catalog_item i
 where i.agency_id = '11110000-0000-0000-0000-000000000001'
   and i.code in ('articles-4', 'white-hat-avance', 'audit-trimestriel',
                  'analyse-concurrentielle', 'netlinking-10', 'point-strategique');


-- Les segments visés.
insert into public.offer_segment (offer_id, label, position) values
  ('44440000-0000-0000-0000-000000000001', 'Comptables', 1),
  ('44440000-0000-0000-0000-000000000001', 'Coachs', 2),
  ('44440000-0000-0000-0000-000000000001', 'Consultants', 3),
  ('44440000-0000-0000-0000-000000000001', 'Artisans', 4),
  ('44440000-0000-0000-0000-000000000001', 'Cliniques', 5),
  ('44440000-0000-0000-0000-000000000002', 'Agences', 1),
  ('44440000-0000-0000-0000-000000000002', 'Cliniques', 2),
  ('44440000-0000-0000-0000-000000000002', 'Coaching', 3),
  ('44440000-0000-0000-0000-000000000002', 'Restauration', 4),
  ('44440000-0000-0000-0000-000000000002', 'Multi-services', 5),
  ('44440000-0000-0000-0000-000000000003', 'E-commerce', 1),
  ('44440000-0000-0000-0000-000000000003', 'Boutiques', 2),
  ('44440000-0000-0000-0000-000000000003', 'Artisans', 3),
  ('44440000-0000-0000-0000-000000000003', 'Marques', 4),
  ('44440000-0000-0000-0000-000000000003', 'Abonnements', 5);

-- « Ce que vous gagnez » — la promesse, distincte de la liste des livrables.
insert into public.offer_benefit (offer_id, position, label) values
  ('44440000-0000-0000-0000-000000000001', 1, 'Un site qui inspire confiance en 5 secondes'),
  ('44440000-0000-0000-0000-000000000001', 2, 'Visible sur Google pour les recherches locales'),
  ('44440000-0000-0000-0000-000000000001', 3, 'Autonomie totale grâce à la formation'),
  ('44440000-0000-0000-0000-000000000002', 1, 'Réservations en ligne 24 h/24 sans appels'),
  ('44440000-0000-0000-0000-000000000002', 2, 'Contenu dynamique gérable sans développeur'),
  ('44440000-0000-0000-0000-000000000002', 3, 'Visibilité locale renforcée sur Google et Bing'),
  ('44440000-0000-0000-0000-000000000003', 1, 'Une boutique qui vend 24 h/24 sans intervention'),
  ('44440000-0000-0000-0000-000000000003', 2, 'Processus de commande entièrement automatisé'),
  ('44440000-0000-0000-0000-000000000003', 3, 'Visibilité maximale sur les moteurs de recherche'),
  ('44440000-0000-0000-0000-000000000011', 1, 'Apparaître dans le « Pack Local » Google Maps'),
  ('44440000-0000-0000-0000-000000000011', 2, 'Plus de clients dans votre quartier ou ville'),
  ('44440000-0000-0000-0000-000000000011', 3, 'Réputation locale renforcée sur Google'),
  ('44440000-0000-0000-0000-000000000012', 1, 'Trafic organique en croissance constante'),
  ('44440000-0000-0000-0000-000000000012', 2, 'Contenu qui attire et convertit sans publicité'),
  ('44440000-0000-0000-0000-000000000012', 3, 'Visibilité sur Google ET Bing renforcée'),
  ('44440000-0000-0000-0000-000000000013', 1, 'Positionnement dominant sur vos mots-clés cibles'),
  ('44440000-0000-0000-0000-000000000013', 2, 'Autorité de domaine en croissance continue'),
  ('44440000-0000-0000-0000-000000000013', 3, 'Un partenaire stratégique, pas juste un prestataire');


-- =============================================================================
-- Ce que chaque offre engage comme travail
-- =============================================================================
-- C'est ici que le catalogue cesse d'être un tarif et devient un plan de
-- travail. Souscrire crée ces tâches — celles de l'offre et celles des offres
-- qu'elle contient — à la bonne date et avec le bon rôle.

insert into public.offer_task_template
  (offer_id, title, kind, cadence, estimate_hours, due_day, default_role, position)
values
  -- Présence Digitale
  ('44440000-0000-0000-0000-000000000001', 'Établir le sitemap et l''architecture de l''information',
   'technique', 'signature', 4, 7, 'chef_projet', 1),
  ('44440000-0000-0000-0000-000000000001', 'Concevoir les maquettes Figma (desktop et mobile)',
   'technique', 'signature', 12, 14, 'chef_projet', 2),
  ('44440000-0000-0000-0000-000000000001', 'Développer le site Webflow responsive',
   'technique', 'signature', 20, 21, 'specialiste_seo', 3),
  ('44440000-0000-0000-0000-000000000001', 'Rédiger les 5 sections clés',
   'contenu', 'signature', 8, 14, 'redacteur', 4),
  ('44440000-0000-0000-0000-000000000001', 'Générer les images du site',
   'contenu', 'signature', 3, 14, 'redacteur', 5),
  ('44440000-0000-0000-0000-000000000001', 'Appliquer le SEO technique on-page',
   'technique', 'signature', 4, 24, 'specialiste_seo', 6),
  ('44440000-0000-0000-0000-000000000001', 'Brancher Google Analytics et Search Console',
   'technique', 'signature', 2, 26, 'specialiste_seo', 7),
  ('44440000-0000-0000-0000-000000000001', 'Animer la formation Webflow (1 h)',
   'technique', 'signature', 1, 28, 'chef_projet', 8),

  -- Croissance Digitale
  ('44440000-0000-0000-0000-000000000002', 'Développer les pages et collections CMS supplémentaires',
   'technique', 'signature', 12, 21, 'specialiste_seo', 1),
  ('44440000-0000-0000-0000-000000000002', 'Rédiger le copywriting étendu (10 sections)',
   'contenu', 'signature', 6, 14, 'redacteur', 2),
  ('44440000-0000-0000-0000-000000000002', 'Monter les animations Webflow avancées',
   'technique', 'signature', 6, 24, 'specialiste_seo', 3),
  ('44440000-0000-0000-0000-000000000002', 'Installer Microsoft Clarity',
   'technique', 'signature', 1, 26, 'specialiste_seo', 4),
  ('44440000-0000-0000-0000-000000000002', 'Animer la formation Webflow approfondie (2 h)',
   'technique', 'signature', 2, 28, 'chef_projet', 5),

  -- Commerce Digital
  ('44440000-0000-0000-0000-000000000003', 'Intégrer la boutique Shopify',
   'technique', 'signature', 16, 21, 'specialiste_seo', 1),
  ('44440000-0000-0000-0000-000000000003', 'Intégrer le catalogue produits',
   'technique', 'signature', 10, 24, 'specialiste_seo', 2),
  ('44440000-0000-0000-0000-000000000003', 'Brancher Shippo, Printful et Foxy.io',
   'technique', 'signature', 6, 24, 'specialiste_seo', 3),
  ('44440000-0000-0000-0000-000000000003', 'Monter les workflows de commande et de relance',
   'technique', 'signature', 5, 26, 'specialiste_seo', 4),
  ('44440000-0000-0000-0000-000000000003', 'Optimiser les pages produits pour la conversion',
   'contenu', 'signature', 6, 26, 'redacteur', 5),
  ('44440000-0000-0000-0000-000000000003', 'Animer la formation e-commerce (3 h)',
   'technique', 'signature', 3, 28, 'chef_projet', 6),

  -- Visibilité Locale
  ('44440000-0000-0000-0000-000000000011', 'Configurer le suivi des mots-clés locaux',
   'technique', 'signature', 4, 7, 'specialiste_seo', 1),
  ('44440000-0000-0000-0000-000000000011', 'Relever Google Search Console',
   'technique', 'mensuel', 0.5, 3, 'specialiste_seo', 2),
  ('44440000-0000-0000-0000-000000000011', 'Optimiser la fiche Google My Business',
   'technique', 'mensuel', 2, 5, 'specialiste_seo', 3),
  ('44440000-0000-0000-0000-000000000011', 'Publier 2 posts sur Google My Business',
   'contenu', 'mensuel', 1, 10, 'redacteur', 4),
  ('44440000-0000-0000-0000-000000000011', 'Déposer 3 citations locales',
   'technique', 'mensuel', 2, 15, 'specialiste_seo', 5),
  ('44440000-0000-0000-0000-000000000011', 'Produire le rapport de performance locale',
   'technique', 'mensuel', 1.5, 28, 'chef_projet', 6),

  -- Croissance SEO
  ('44440000-0000-0000-0000-000000000012', 'Mettre à jour la stratégie de mots-clés',
   'technique', 'mensuel', 2, 5, 'specialiste_seo', 1),
  ('44440000-0000-0000-0000-000000000012', 'Optimiser les balises et méta-descriptions',
   'technique', 'mensuel', 3, 12, 'specialiste_seo', 2),
  ('44440000-0000-0000-0000-000000000012', 'Déposer 3 citations locales supplémentaires',
   'technique', 'mensuel', 2, 15, 'specialiste_seo', 3),
  ('44440000-0000-0000-0000-000000000012', 'Rédiger 2 articles de blogue SEO (1 000 mots)',
   'contenu', 'mensuel', 8, 20, 'redacteur', 4),
  ('44440000-0000-0000-0000-000000000012', 'Produire le rapport mensuel complet',
   'technique', 'mensuel', 2, 28, 'chef_projet', 5),

  -- Domination SEO
  ('44440000-0000-0000-0000-000000000013', 'Analyser la concurrence du mois',
   'technique', 'mensuel', 2, 8, 'specialiste_seo', 1),
  ('44440000-0000-0000-0000-000000000013', 'Déposer 4 citations supplémentaires et travailler l''autorité',
   'technique', 'mensuel', 3, 15, 'specialiste_seo', 2),
  ('44440000-0000-0000-0000-000000000013', 'Rédiger 2 articles de blogue SEO supplémentaires (1 200 mots)',
   'contenu', 'mensuel', 8, 20, 'redacteur', 3),
  ('44440000-0000-0000-0000-000000000013', 'Tenir le point stratégique mensuel (30 min)',
   'technique', 'mensuel', 0.5, 25, 'admin', 4),
  ('44440000-0000-0000-0000-000000000013', 'Mener l''audit SEO trimestriel complet',
   'technique', 'trimestriel', 6, 15, 'specialiste_seo', 5);

-- Les deux modules alternatifs de Croissance Digitale : un seul sera créé,
-- celui que le client aura retenu.
insert into public.offer_task_template
  (offer_id, title, kind, cadence, estimate_hours, due_day, default_role,
   option_group, option_key, position)
values
  ('44440000-0000-0000-0000-000000000002', 'Configurer l''espace membres (MemberStack)',
   'technique', 'signature', 8, 21, 'specialiste_seo', 'espace-ou-reservation', 'membres', 6),
  ('44440000-0000-0000-0000-000000000002', 'Configurer la réservation avancée (Acuity + Jotform)',
   'technique', 'signature', 8, 21, 'specialiste_seo', 'espace-ou-reservation', 'reservation', 7);


-- =============================================================================
-- Le portefeuille
-- =============================================================================
-- Un compte réel — la SHGM, dont le contrat est signé — et sept comptes
-- fictifs. Les noms d'entreprise viennent de données de prospection : ce sont
-- des comptes de démonstration, pas des mandats.

insert into public.client
  (id, agency_id, slug, name, initials, type, domain, sector, address, monthly_content_quota)
values
  -- Clients
  ('55550000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   'shgm', 'Société d''Histoire et de Généalogie de La Matapédia', 'SH', 'client',
   null, 'Organisme sans but lucratif', '24 Promenade Marcel-Rioux, Amqui (Québec) G5J 3E1', null),
  ('55550000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   'acme-corp', 'Acme Corp.', 'AC', 'client', 'acmecorp.ca', 'Construction', 'Montréal (Québec)', 4),
  ('55550000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   'boreal-immobilier', 'Boréal Immobilier', 'BI', 'client', 'borealimmo.ca',
   'Immobilier', 'Québec (Québec)', 2),
  ('55550000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001',
   'le-marche-bio', 'Le Marché Bio', 'MB', 'client', 'lemarchebio.ca',
   'Alimentation', 'Repentigny (Québec)', 2),

  -- Prospects
  ('55550000-0000-0000-0000-000000000011', '11110000-0000-0000-0000-000000000001',
   'clinique-lavoie', 'Clinique Lavoie', 'CL', 'prospect', 'cliniquelavoie.com',
   'Santé', 'Laval (Québec)', null),
  ('55550000-0000-0000-0000-000000000012', '11110000-0000-0000-0000-000000000001',
   'spa-nordik-estrie', 'Spa Nordik Estrie', 'SN', 'prospect', 'spanordik.ca',
   'Tourisme', 'Sherbrooke (Québec)', null),
  ('55550000-0000-0000-0000-000000000013', '11110000-0000-0000-0000-000000000001',
   'quincaillerie-fortin', 'Quincaillerie Fortin', 'QF', 'prospect', 'quincaillerie-fortin.ca',
   'Commerce de détail', 'Trois-Rivières (Québec)', null),
  ('55550000-0000-0000-0000-000000000014', '11110000-0000-0000-0000-000000000001',
   'novatech', 'Novatech', 'NT', 'prospect', 'novatech.ca',
   'SaaS B2B', 'Montréal (Québec)', null);

insert into public.contact
  (id, agency_id, client_id, full_name, initials, role, email, is_primary)
values
  ('66660000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000001', 'Audrey Venick', 'AV', 'Présidente', null, true),
  ('66660000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000002', 'Sophie Tremblay', 'ST', 'Directrice marketing',
   'sophie@acmecorp.ca', true),
  ('66660000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000003', 'Nadia Fortier', 'NF', 'Courtière',
   'nadia@borealimmo.ca', true),
  ('66660000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000004', 'Geneviève Roy', 'GR', 'Propriétaire',
   'genevieve@lemarchebio.ca', true);


-- =============================================================================
-- Les mandats en cours
-- =============================================================================
-- Souscrire crée les tâches de l'offre : les écrans de travail ne sont pas
-- vides parce qu'on a inventé des tâches, mais parce que l'agence s'est
-- engagée à les faire.

insert into public.client_subscription
  (id, agency_id, client_id, offer_id, price_cents, billing, started_on)
values
  ('77770000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000002', '44440000-0000-0000-0000-000000000012',
   70000, 'mensuel', date_trunc('month', current_date)::date - 60),
  ('77770000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000003', '44440000-0000-0000-0000-000000000013',
   110000, 'mensuel', date_trunc('month', current_date)::date - 120),
  ('77770000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000004', '44440000-0000-0000-0000-000000000011',
   40000, 'mensuel', date_trunc('month', current_date)::date - 30);

-- Les trois derniers mois de travail engagé par ces mandats.
do $$
declare s record; m integer;
begin
  for s in select id from public.client_subscription loop
    for m in 0..3 loop
      perform app.apply_offer_tasks(s.id, (date_trunc('month', current_date) - (m || ' months')::interval)::date);
    end loop;
  end loop;
end $$;


-- =============================================================================
-- Le mandat SHGM — contrat n° 2026-007
-- =============================================================================

insert into public.contract
  (id, agency_id, client_id, ref, title, status, fee_cents, hourly_rate_cents,
   acceptance_business_days, content_deadline_days, warranty_days,
   signed_on, started_on, signed_by_contact_id, signed_by_member_id)
values ('88880000-0000-0000-0000-000000000001',
        '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000001',
        '2026-007',
        'Conception, développement et mise en ligne du site web de la SHGM',
        'signe', 975000, 10000, 5, 60, 30,
        '2026-10-01', '2026-10-01',
        '66660000-0000-0000-0000-000000000001', '22220000-0000-0000-0000-000000000001');

insert into public.contract_document (contract_id, kind, name, ref, precedence) values
  ('88880000-0000-0000-0000-000000000001', 'contrat',
   'Contrat de services professionnels', '2026-007', 1),
  ('88880000-0000-0000-0000-000000000001', 'annexe',
   'Annexe A — Description détaillée des livrables et échéancier', '2026-007', 2),
  ('88880000-0000-0000-0000-000000000001', 'proposition',
   'Proposition de services acceptée', '2026-007', 3);

insert into public.deliverable (id, contract_id, code, title, description, included_rounds, position)
values
  ('99990000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000001',
   'L-01', 'Architecture et arborescence',
   'Structure des pages, hiérarchie de contenu et navigation. Livré sous forme de plan de site validé avant le début du design.', 1, 1),
  ('99990000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000001',
   'L-02', 'Maquettes Figma (design haute-fidélité)',
   'Interface visuelle complète : accueil, pages intérieures types, composants réutilisables. N''inclut pas la refonte du logo.', 2, 2),
  ('99990000-0000-0000-0000-000000000003', '88880000-0000-0000-0000-000000000001',
   'L-03', 'Développement Webflow — Pages statiques',
   'Jusqu''à 12 pages statiques selon la structure validée à L-01.', 1, 3),
  ('99990000-0000-0000-0000-000000000004', '88880000-0000-0000-0000-000000000001',
   'L-04', 'Développement Webflow — CMS',
   'Jusqu''à 7 collections CMS et leurs gabarits. La liste est figée par écrit à L-01.', 1, 4),
  ('99990000-0000-0000-0000-000000000005', '88880000-0000-0000-0000-000000000001',
   'L-05', 'Formulaire d''adhésion en ligne',
   'Parcours d''adhésion connecté à une solution de paiement standard. Zeffy par défaut, à confirmer au jalon J-02.', 1, 5),
  ('99990000-0000-0000-0000-000000000006', '88880000-0000-0000-0000-000000000001',
   'L-06', 'Section dons',
   'Redirection vers la solution de collecte utilisée par le Client. Intégration native non incluse.', 1, 6),
  ('99990000-0000-0000-0000-000000000007', '88880000-0000-0000-0000-000000000001',
   'L-07', 'Section publications et ressources',
   'Revues et répertoires généalogiques, avec lien simple vers la bibliothèque Zotero externe.', 1, 7),
  ('99990000-0000-0000-0000-000000000008', '88880000-0000-0000-0000-000000000001',
   'L-08', 'Rédaction et adaptation des textes',
   'Rédaction ou adaptation des textes de l''ensemble des pages, sur la base des éléments fournis par le Client.', 1, 8),
  ('99990000-0000-0000-0000-000000000009', '88880000-0000-0000-0000-000000000001',
   'L-09', 'Adaptation responsive',
   'Ordinateur, tablette et mobile.', null, 9),
  ('99990000-0000-0000-0000-000000000010', '88880000-0000-0000-0000-000000000001',
   'L-10', 'Formation à la gestion du site',
   'Atelier de prise en main de l''administration Webflow. Durée estimée : 1 à 2 heures.', null, 10),
  ('99990000-0000-0000-0000-000000000011', '88880000-0000-0000-0000-000000000001',
   'L-11', 'Accompagnement post-lancement',
   '3 mois après la mise en ligne, 4 à 6 heures par mois.', null, 11);

-- « L-09 — inclus dans L-03 / L-04 ».
insert into public.deliverable_inclusion (deliverable_id, included_in_id) values
  ('99990000-0000-0000-0000-000000000009', '99990000-0000-0000-0000-000000000003'),
  ('99990000-0000-0000-0000-000000000009', '99990000-0000-0000-0000-000000000004');


-- Les douze jalons de l'Annexe A. Aucune date n'est saisie au-delà de la
-- première : tout le reste se calcule, et glisse si le client tarde.
insert into public.milestone (id, contract_id, code, description, owner, fixed_on, position)
values ('aaaa0000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000001',
        'J-01', 'Signature du contrat et versement de l''acompte (50 %)',
        'client', '2026-10-01', 1);

insert into public.milestone
  (id, contract_id, code, description, owner, depends_on_id, offset_days, position)
values
  ('aaaa0000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000001',
   'J-02', 'Questionnaire de démarrage complété et confirmation de la solution de paiement',
   'client', 'aaaa0000-0000-0000-0000-000000000001', 7, 2),
  ('aaaa0000-0000-0000-0000-000000000003', '88880000-0000-0000-0000-000000000001',
   'J-03', 'Remise du contenu brut (textes, photos, accès)',
   'client', 'aaaa0000-0000-0000-0000-000000000001', 14, 3),
  ('aaaa0000-0000-0000-0000-000000000004', '88880000-0000-0000-0000-000000000001',
   'J-04', 'Livraison du plan de site (L-01) pour validation',
   'prestataire', 'aaaa0000-0000-0000-0000-000000000003', 7, 4),
  ('aaaa0000-0000-0000-0000-000000000005', '88880000-0000-0000-0000-000000000001',
   'J-05', 'Livraison des maquettes Figma (L-02) pour validation',
   'prestataire', 'aaaa0000-0000-0000-0000-000000000004', 21, 5),
  ('aaaa0000-0000-0000-0000-000000000006', '88880000-0000-0000-0000-000000000001',
   'J-06', 'Livraison du site en développement Webflow (L-03 à L-07)',
   'prestataire', 'aaaa0000-0000-0000-0000-000000000005', 30, 6),
  ('aaaa0000-0000-0000-0000-000000000007', '88880000-0000-0000-0000-000000000001',
   'J-07', 'Ronde de corrections finales — approbation finale du Client',
   'les_deux', 'aaaa0000-0000-0000-0000-000000000006', 7, 7),
  ('aaaa0000-0000-0000-0000-000000000008', '88880000-0000-0000-0000-000000000001',
   'J-08', 'Facturation du solde (50 %)',
   'prestataire', 'aaaa0000-0000-0000-0000-000000000007', 0, 8),
  ('aaaa0000-0000-0000-0000-000000000009', '88880000-0000-0000-0000-000000000001',
   'J-09', 'Réception du paiement du solde',
   'client', 'aaaa0000-0000-0000-0000-000000000008', 15, 9),
  ('aaaa0000-0000-0000-0000-000000000010', '88880000-0000-0000-0000-000000000001',
   'J-10', 'Mise en ligne du site et formation (L-10)',
   'les_deux', 'aaaa0000-0000-0000-0000-000000000009', 7, 10),
  ('aaaa0000-0000-0000-0000-000000000011', '88880000-0000-0000-0000-000000000001',
   'J-11', 'Début de la période d''accompagnement post-lancement (L-11)',
   'prestataire', 'aaaa0000-0000-0000-0000-000000000010', 0, 11),
  ('aaaa0000-0000-0000-0000-000000000012', '88880000-0000-0000-0000-000000000001',
   'J-12', 'Fin de la période d''accompagnement post-lancement',
   'prestataire', 'aaaa0000-0000-0000-0000-000000000010', 90, 12);


-- Ce que le Client doit fournir, au plus tard au jalon J-03.
insert into public.client_input_item
  (contract_id, label, expected_format, note, due_milestone_id, position)
values
  ('88880000-0000-0000-0000-000000000001', 'Textes de présentation (mission, historique, équipe)',
   'Document Word, PDF ou courriel',
   'Si indisponibles, le Prestataire rédigera sur la base des éléments bruts fournis (L-08).',
   'aaaa0000-0000-0000-0000-000000000003', 1),
  ('88880000-0000-0000-0000-000000000001', 'Logo de la SHGM',
   'Fichier vectoriel (.svg ou .ai) ou PNG haute résolution',
   'Si le logo doit être adapté, cela sera traité dans L-02 — adaptation, non refonte.',
   'aaaa0000-0000-0000-0000-000000000003', 2),
  ('88880000-0000-0000-0000-000000000001', 'Photos disponibles (archives, activités)',
   'JPG ou PNG, 1 200 px de large minimum',
   'Le Client garantit détenir les droits sur les images fournies (art. 8.4).',
   'aaaa0000-0000-0000-0000-000000000003', 3),
  ('88880000-0000-0000-0000-000000000001', 'Informations du Centre de recherche',
   'Adresse, horaires, tarifs, coordonnées du responsable', null,
   'aaaa0000-0000-0000-0000-000000000003', 4),
  ('88880000-0000-0000-0000-000000000001', 'Détails de l''adhésion',
   'Montants, types, avantages inclus', 'Nécessaires pour L-05.',
   'aaaa0000-0000-0000-0000-000000000003', 5),
  ('88880000-0000-0000-0000-000000000001', 'Confirmation de la solution de paiement',
   'Acceptation de Zeffy (par défaut) ou autre solution standard',
   'À confirmer au jalon J-02.', 'aaaa0000-0000-0000-0000-000000000002', 6),
  ('88880000-0000-0000-0000-000000000001', 'Solution de dons retenue',
   'Lien ou coordonnées de la plateforme', 'Nécessaire pour L-06.',
   'aaaa0000-0000-0000-0000-000000000003', 7),
  ('88880000-0000-0000-0000-000000000001', 'Liste des publications à mettre en ligne',
   'Titre, type, prix, fichier PDF si disponible', 'Nécessaire pour L-07.',
   'aaaa0000-0000-0000-0000-000000000003', 8),
  ('88880000-0000-0000-0000-000000000001', 'Lien vers la bibliothèque Zotero publique',
   'URL', 'Nécessaire pour L-07.', 'aaaa0000-0000-0000-0000-000000000003', 9),
  ('88880000-0000-0000-0000-000000000001', 'Accès au nom de domaine actuel',
   'Identifiants ou coordonnées du registraire', 'Nécessaire pour la mise en ligne (J-10).',
   'aaaa0000-0000-0000-0000-000000000010', 10);


-- Les exclusions du contrat. Chacune pointe, quand elle existe, vers l'offre
-- du catalogue qui la couvrirait — c'est-à-dire vers la prochaine vente.
insert into public.contract_exclusion (contract_id, label, detail, offer_id, position)
values
  ('88880000-0000-0000-0000-000000000001', 'Prestation SEO',
   'L-11 inclut des conseils SEO de base uniquement. L''audit SEO technique, la stratégie de mots-clés, l''optimisation sémantique, le référencement local et le suivi de positionnement ne sont pas inclus.',
   '44440000-0000-0000-0000-000000000011', 1),
  ('88880000-0000-0000-0000-000000000001', 'Boutique en ligne ou vente avancée de documents PDF',
   'Non incluse dans la portée actuelle.',
   '44440000-0000-0000-0000-000000000003', 2),
  ('88880000-0000-0000-0000-000000000001', 'Espace membre avec connexion sécurisée',
   'Non inclus dans cette phase.',
   '44440000-0000-0000-0000-000000000002', 3),
  ('88880000-0000-0000-0000-000000000001', 'Version anglaise ou site multilingue',
   'Le site est livré en français uniquement. Toute version additionnelle fait l''objet d''une offre distincte.',
   null, 4),
  ('88880000-0000-0000-0000-000000000001', 'Archives avancées avec moteur de recherche',
   'Non incluses comme système complexe de classement ou de numérisation.', null, 5),
  ('88880000-0000-0000-0000-000000000001', 'Intégration API Zotero',
   'Seul un lien simple vers la bibliothèque publique est prévu (L-07).', null, 6),
  ('88880000-0000-0000-0000-000000000001', 'Migration massive de fichiers ou de contenus existants',
   'Les contenus sont intégrés dans le cadre de la création du nouveau site.', null, 7),
  ('88880000-0000-0000-0000-000000000001', 'Photographie professionnelle et banques d''images payantes',
   'Le Client fournit ses propres visuels. Si aucun visuel utilisable n''est disponible, une solution peut être proposée sur devis.',
   null, 8),
  ('88880000-0000-0000-0000-000000000001', 'Refonte complète du logo ou de l''identité de marque',
   'L-02 couvre l''adaptation de l''identité visuelle existante.', null, 9),
  ('88880000-0000-0000-0000-000000000001', 'Rédaction de contenu spécialisé',
   'L-08 couvre l''adaptation rédactionnelle des contenus fournis, non la recherche historique ou généalogique originale.',
   null, 10),
  ('88880000-0000-0000-0000-000000000001', 'Accessibilité certifiée (WCAG)',
   'Les bonnes pratiques sont appliquées, mais aucun audit ni certification n''est inclus.', null, 11),
  ('88880000-0000-0000-0000-000000000001', 'Frais récurrents externes',
   'Hébergement Webflow, nom de domaine, licences, outils tiers et frais transactionnels exclus (art. 9).',
   null, 12),
  ('88880000-0000-0000-0000-000000000001', 'Maintenance continue après 3 mois',
   'Non incluse dans le projet initial ; disponible séparément sous forme de forfait mensuel.',
   '44440000-0000-0000-0000-000000000011', 13);


-- L'échéancier de paiement : 50 % à la signature, 50 % au jalon de facturation.
insert into public.payment_milestone
  (contract_id, label, percentage, trigger, milestone_id, terms_days, position)
values
  ('88880000-0000-0000-0000-000000000001', 'Acompte à la signature', 50,
   'signature', null, 0, 1),
  ('88880000-0000-0000-0000-000000000001', 'Solde à l''approbation finale', 50,
   'jalon', 'aaaa0000-0000-0000-0000-000000000008', 15, 2);


-- L'accompagnement post-lancement : 4 à 6 h par mois pendant 3 mois.
insert into public.support_period
  (contract_id, starts_on, months, hours_min, hours_max, overage_rate_cents)
select '88880000-0000-0000-0000-000000000001',
       app.milestone_planned_on('aaaa0000-0000-0000-0000-000000000011'),
       3, 4, 6, 10000;


-- =============================================================================
-- Ce qu'il reste à saisir
-- =============================================================================
--   1. Les numéros d'inscription à la TPS et à la TVQ de l'agence.
--   2. Le tarif préférentiel des trois premiers mois de chaque pack SEO.
--   3. Les prix unitaires du catalogue, si l'on veut voir la remise d'un
--      forfait — facultatif, l'agence vend des forfaits.
-- =============================================================================
