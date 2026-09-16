-- =============================================================================
-- Semis complémentaire — les packs de maintenance, les livrables promis
-- =============================================================================
-- Le gabarit d'offre de service et l'Annexe A vendent trois packs de
-- maintenance mensuels — Essentiel 200 $, Croissance 450 $, Partenaire
-- Stratégique 750 $ — que `seed.sql` ne connaissait pas : il portait les trois
-- packs SEO. Décision du 14 septembre 2026 (`docs/analyse-generateur-
-- propositions.md`, section 9) : les packs de maintenance entrent au
-- catalogue, les packs SEO restent.
--
-- Ce fichier sème aussi les **livrables promis** par chaque offre
-- (`offer_deliverable_template`, migration 0022), d'après les livrables du
-- contrat SHGM pour les forfaits web.
--
-- Il se rejoue sans dommage : identifiants fixes, `on conflict do nothing`,
-- et les modèles de tâches ne se créent que s'ils n'existent pas déjà. Il
-- suppose `seed.sql` passé et la migration 0022 appliquée.
-- =============================================================================


-- =============================================================================
-- Les services de maintenance
-- =============================================================================
-- Ce que les packs assemblent. Les prix unitaires restent vides, comme pour le
-- reste du catalogue : l'agence vend des forfaits.

insert into public.catalog_item (agency_id, code, name, description, kind, billing, unit, position)
values
  ('11110000-0000-0000-0000-000000000001', 'maintenance-heures',
   'Heures de maintenance et d''évolutions', 'Le temps inclus chaque mois pour corriger, ajuster et faire évoluer le site.',
   'service', 'mensuel', 'heure', 60),
  ('11110000-0000-0000-0000-000000000001', 'maj-webflow',
   'Maintenance technique et mises à jour Webflow', null, 'service', 'mensuel', 'mois', 61),
  ('11110000-0000-0000-0000-000000000001', 'suivi-seo-base',
   'Suivi SEO de base', null, 'service', 'mensuel', 'mois', 62),
  ('11110000-0000-0000-0000-000000000001', 'rapport-analytique',
   'Rapport analytique mensuel', null, 'service', 'mensuel', 'rapport', 63),
  ('11110000-0000-0000-0000-000000000001', 'sauvegardes',
   'Sauvegardes du site', null, 'service', 'mensuel', 'mois', 64),
  ('11110000-0000-0000-0000-000000000001', 'page-mensuelle',
   'Page additionnelle', 'Une nouvelle page conçue, rédigée et intégrée chaque mois.', 'service', 'mensuel', 'page', 65),
  ('11110000-0000-0000-0000-000000000001', 'clarity-heatmaps',
   'Cartes de chaleur (Microsoft Clarity)', null, 'service', 'mensuel', 'mois', 66),
  ('11110000-0000-0000-0000-000000000001', 'suivi-formation-30',
   'Suivi et formation (30 min par mois)', null, 'service', 'mensuel', 'séance', 67),
  ('11110000-0000-0000-0000-000000000001', 'support-prioritaire',
   'Support prioritaire (réponse en moins de 24 h)', null, 'service', 'mensuel', 'mois', 68),
  ('11110000-0000-0000-0000-000000000001', 'redesign-sections',
   'Redesign de sections', 'Reprise du design d''une section existante du site.', 'service', 'mensuel', 'section', 69)
on conflict (agency_id, code) do nothing;


-- =============================================================================
-- Les trois packs
-- =============================================================================
-- Chaque pack inclut le précédent (« Tout Essentiel + … »), comme les forfaits
-- web s'emboîtent. Les heures incluses sont une ligne du catalogue avec sa
-- quantité ; le taux au-delà est celui du pack.

insert into public.offer
  (id, agency_id, code, name, tagline, price_cents, price_is_from, billing,
   free_consult_minutes, is_popular, overage_hourly_rate_cents, position)
values
  ('44440000-0000-0000-0000-000000000021', '11110000-0000-0000-0000-000000000001',
   'maintenance-essentiel', 'Maintenance Essentiel',
   'Votre site reste à jour, sauvegardé et suivi, sans y penser.',
   20000, false, 'mensuel', null, false, 9500, 21),
  ('44440000-0000-0000-0000-000000000022', '11110000-0000-0000-0000-000000000001',
   'maintenance-croissance', 'Maintenance Croissance',
   'Un site qui grandit d''une page par mois, avec un suivi régulier.',
   45000, false, 'mensuel', null, true, 9000, 22),
  ('44440000-0000-0000-0000-000000000023', '11110000-0000-0000-0000-000000000001',
   'maintenance-partenaire', 'Maintenance Partenaire Stratégique',
   'Un partenaire technique et stratégique, prioritaire, chaque mois.',
   75000, false, 'mensuel', null, false, 8500, 23)
on conflict (id) do nothing;

-- « Idéal avec » : chaque pack de maintenance prolonge un forfait web.
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000001'
 where id = '44440000-0000-0000-0000-000000000021' and recommended_offer_id is null;
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000002'
 where id = '44440000-0000-0000-0000-000000000022' and recommended_offer_id is null;
update public.offer set recommended_offer_id = '44440000-0000-0000-0000-000000000003'
 where id = '44440000-0000-0000-0000-000000000023' and recommended_offer_id is null;


-- Ce que chaque pack contient.
insert into public.offer_line (offer_id, catalog_item_id, quantity, position, label)
select '44440000-0000-0000-0000-000000000021', i.id, l.quantity, l.position, l.label
  from (values
    ('maintenance-heures', 2, 1, '2 h de maintenance et d''évolutions par mois'),
    ('maj-webflow',        1, 2, null),
    ('suivi-seo-base',     1, 3, null),
    ('rapport-analytique', 1, 4, null),
    ('sauvegardes',        1, 5, null)
  ) as l(code, quantity, position, label)
  join public.catalog_item i on i.agency_id = '11110000-0000-0000-0000-000000000001' and i.code = l.code
on conflict do nothing;

insert into public.offer_line (offer_id, included_offer_id, quantity, position)
values ('44440000-0000-0000-0000-000000000022', '44440000-0000-0000-0000-000000000021', 1, 0)
on conflict do nothing;

insert into public.offer_line (offer_id, catalog_item_id, quantity, position, label)
select '44440000-0000-0000-0000-000000000022', i.id, l.quantity, l.position, l.label
  from (values
    ('maintenance-heures', 2, 1, '2 h de plus — 4 h de maintenance par mois au total'),
    ('page-mensuelle',     1, 2, 'Une page de plus chaque mois'),
    ('clarity-heatmaps',   1, 3, null),
    ('suivi-formation-30', 1, 4, null)
  ) as l(code, quantity, position, label)
  join public.catalog_item i on i.agency_id = '11110000-0000-0000-0000-000000000001' and i.code = l.code
on conflict do nothing;

insert into public.offer_line (offer_id, included_offer_id, quantity, position)
values ('44440000-0000-0000-0000-000000000023', '44440000-0000-0000-0000-000000000022', 1, 0)
on conflict do nothing;

insert into public.offer_line (offer_id, catalog_item_id, quantity, position, label)
select '44440000-0000-0000-0000-000000000023', i.id, l.quantity, l.position, l.label
  from (values
    ('maintenance-heures',  4, 1, '4 h de plus — 8 h de maintenance par mois au total'),
    ('support-prioritaire', 1, 2, null),
    ('audit-trimestriel',   1, 3, 'Audit SEO trimestriel'),
    ('redesign-sections',   2, 4, 'Redesign de 2 sections par mois'),
    ('point-strategique',   2, 5, 'Point stratégique bimensuel avec le fondateur')
  ) as l(code, quantity, position, label)
  join public.catalog_item i on i.agency_id = '11110000-0000-0000-0000-000000000001' and i.code = l.code
on conflict do nothing;


-- Pour qui, et ce que le client y gagne.
insert into public.offer_segment (offer_id, label, position) values
  ('44440000-0000-0000-0000-000000000021', 'Sites vitrines', 1),
  ('44440000-0000-0000-0000-000000000021', 'Professionnels', 2),
  ('44440000-0000-0000-0000-000000000022', 'PME en croissance', 1),
  ('44440000-0000-0000-0000-000000000022', 'Sites avec blogue ou CMS', 2),
  ('44440000-0000-0000-0000-000000000023', 'Boutiques en ligne', 1),
  ('44440000-0000-0000-0000-000000000023', 'Entreprises sans équipe web', 2)
on conflict do nothing;

insert into public.offer_benefit (offer_id, position, label) values
  ('44440000-0000-0000-0000-000000000021', 1, 'Un site toujours à jour et sauvegardé'),
  ('44440000-0000-0000-0000-000000000021', 2, 'Deux heures par mois pour corriger et ajuster'),
  ('44440000-0000-0000-0000-000000000021', 3, 'Un rapport clair chaque mois'),
  ('44440000-0000-0000-0000-000000000022', 1, 'Tout ce qui est dans Essentiel'),
  ('44440000-0000-0000-0000-000000000022', 2, 'Une nouvelle page chaque mois pour nourrir le site'),
  ('44440000-0000-0000-0000-000000000022', 3, 'Le comportement des visiteurs observé et expliqué'),
  ('44440000-0000-0000-0000-000000000023', 1, 'Tout ce qui est dans Croissance'),
  ('44440000-0000-0000-0000-000000000023', 2, 'Une réponse en moins de 24 h, chaque fois'),
  ('44440000-0000-0000-0000-000000000023', 3, 'Un point stratégique deux fois par mois avec le fondateur')
on conflict do nothing;


-- Ce que chaque pack engage comme travail, chaque mois.
insert into public.offer_task_template
  (offer_id, title, kind, cadence, estimate_hours, due_day, default_role, position)
select v.offer_id::uuid, v.title, v.kind, v.cadence::public.task_cadence, v.estimate_hours,
       v.due_day, v.default_role::public.agency_role, v.position
  from (values
    ('44440000-0000-0000-0000-000000000021', 'Appliquer les mises à jour Webflow et vérifier le site',
     'technique', 'mensuel', 1.0, 5, 'specialiste_seo', 1),
    ('44440000-0000-0000-0000-000000000021', 'Vérifier les sauvegardes du site',
     'technique', 'mensuel', 0.5, 7, 'specialiste_seo', 2),
    ('44440000-0000-0000-0000-000000000021', 'Traiter les demandes de maintenance du mois',
     'technique', 'mensuel', 2.0, 20, 'chef_projet', 3),
    ('44440000-0000-0000-0000-000000000021', 'Produire le rapport analytique mensuel',
     'technique', 'mensuel', 1.0, 28, 'admin', 4),
    ('44440000-0000-0000-0000-000000000022', 'Concevoir, rédiger et intégrer la page du mois',
     'contenu', 'mensuel', 3.0, 20, 'redacteur', 1),
    ('44440000-0000-0000-0000-000000000022', 'Relever les cartes de chaleur Clarity',
     'technique', 'mensuel', 0.5, 25, 'specialiste_seo', 2),
    ('44440000-0000-0000-0000-000000000022', 'Tenir la séance de suivi et de formation (30 min)',
     'technique', 'mensuel', 0.5, 15, 'chef_projet', 3),
    ('44440000-0000-0000-0000-000000000023', 'Redesigner les deux sections du mois',
     'technique', 'mensuel', 4.0, 18, 'chef_projet', 1),
    ('44440000-0000-0000-0000-000000000023', 'Tenir les deux points stratégiques du mois',
     'technique', 'mensuel', 1.0, 14, 'admin', 2),
    ('44440000-0000-0000-0000-000000000023', 'Mener l''audit SEO trimestriel',
     'technique', 'trimestriel', 6.0, 20, 'specialiste_seo', 3)
  ) as v(offer_id, title, kind, cadence, estimate_hours, due_day, default_role, position)
 where not exists (select 1 from public.offer_task_template t
                    where t.offer_id = v.offer_id::uuid and t.title = v.title);


-- =============================================================================
-- Les livrables promis par chaque offre
-- =============================================================================
-- Ce que le client approuvera. Les forfaits web reprennent les livrables du
-- contrat SHGM ; les packs mensuels promettent peu : un rapport, une page.

insert into public.offer_deliverable_template (offer_id, code, title, description, included_rounds, position)
values
  -- Présence Digitale
  ('44440000-0000-0000-0000-000000000001', 'L-01', 'Architecture et arborescence',
   'Structure des pages, hiérarchie de contenu et navigation, validée avant le design.', 1, 1),
  ('44440000-0000-0000-0000-000000000001', 'L-02', 'Maquettes Figma (design haute fidélité)',
   'Interface visuelle complète : accueil, pages intérieures types, composants réutilisables.', 2, 2),
  ('44440000-0000-0000-0000-000000000001', 'L-03', 'Développement Webflow',
   'Jusqu''à 10 pages et une collection CMS, selon la structure validée à L-01.', 1, 3),
  ('44440000-0000-0000-0000-000000000001', 'L-04', 'Rédaction des sections clés',
   'Cinq sections rédigées sur la base des éléments fournis par le client.', 1, 4),
  ('44440000-0000-0000-0000-000000000001', 'L-05', 'Formation à la gestion du site',
   'Atelier de prise en main de l''administration Webflow (1 h).', null, 5),
  -- Croissance Digitale
  ('44440000-0000-0000-0000-000000000002', 'L-01', 'Développement Webflow étendu',
   'Jusqu''à 20 pages et 5 collections CMS, avec animations avancées.', 1, 1),
  ('44440000-0000-0000-0000-000000000002', 'L-02', 'Module au choix : espace membres ou réservation',
   'Le module retenu à la signature, configuré et testé.', 1, 2),
  ('44440000-0000-0000-0000-000000000002', 'L-03', 'Rédaction étendue',
   'Dix sections rédigées.', 1, 3),
  ('44440000-0000-0000-0000-000000000002', 'L-04', 'Formation à la gestion du site',
   'Atelier de prise en main de l''administration Webflow (2 h).', null, 4),
  -- Commerce Digital
  ('44440000-0000-0000-0000-000000000003', 'L-01', 'Boutique Shopify',
   'Boutique configurée, jusqu''à 100 produits intégrés.', 1, 1),
  ('44440000-0000-0000-0000-000000000003', 'L-02', 'Intégrations et flux de commandes',
   'Paiement, expédition, taxes et automatisations de commandes.', 1, 2),
  ('44440000-0000-0000-0000-000000000003', 'L-03', 'Pages produits',
   'Gabarit de page produit et pages de collection.', 1, 3),
  ('44440000-0000-0000-0000-000000000003', 'L-04', 'Formation e-commerce',
   'Atelier de gestion de la boutique (3 h).', null, 4),
  -- Packs SEO
  ('44440000-0000-0000-0000-000000000011', 'L-01', 'Rapport de performance locale',
   'Chaque mois : positions locales, fiche Google, actions menées.', null, 1),
  ('44440000-0000-0000-0000-000000000012', 'L-01', 'Rapport mensuel complet',
   'Chaque mois : trafic, positions, contenu publié, liens obtenus.', null, 1),
  ('44440000-0000-0000-0000-000000000012', 'L-02', 'Articles publiés',
   'Les articles du mois, relus avant publication.', 1, 2),
  ('44440000-0000-0000-0000-000000000013', 'L-01', 'Rapport mensuel complet',
   'Chaque mois : trafic, positions, contenu publié, liens obtenus.', null, 1),
  ('44440000-0000-0000-0000-000000000013', 'L-02', 'Articles publiés',
   'Les articles du mois, relus avant publication.', 1, 2),
  ('44440000-0000-0000-0000-000000000013', 'L-03', 'Audit SEO trimestriel',
   'Chaque trimestre : audit complet et plan d''action.', null, 3),
  -- Packs de maintenance
  ('44440000-0000-0000-0000-000000000021', 'L-01', 'Rapport analytique mensuel',
   'Chaque mois : fréquentation, comportement, interventions faites.', null, 1),
  ('44440000-0000-0000-0000-000000000022', 'L-01', 'Rapport analytique mensuel',
   'Chaque mois : fréquentation, comportement, interventions faites.', null, 1),
  ('44440000-0000-0000-0000-000000000022', 'L-02', 'Page du mois',
   'La nouvelle page, soumise avant mise en ligne.', 1, 2),
  ('44440000-0000-0000-0000-000000000023', 'L-01', 'Rapport analytique mensuel',
   'Chaque mois : fréquentation, comportement, interventions faites.', null, 1),
  ('44440000-0000-0000-0000-000000000023', 'L-02', 'Page du mois',
   'La nouvelle page, soumise avant mise en ligne.', 1, 2),
  ('44440000-0000-0000-0000-000000000023', 'L-03', 'Sections redessinées',
   'Les deux sections du mois, soumises avant mise en ligne.', 1, 3),
  ('44440000-0000-0000-0000-000000000023', 'L-04', 'Audit SEO trimestriel',
   'Chaque trimestre : audit complet et plan d''action.', null, 4)
on conflict (offer_id, code) do nothing;
