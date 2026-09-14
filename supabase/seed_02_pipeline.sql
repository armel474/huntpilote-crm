-- =============================================================================
-- Semis complémentaire — le pipeline, les scores, l'appel découverte
-- =============================================================================
-- `seed.sql` a posé l'agence, son catalogue et huit comptes, mais aucune
-- opportunité, aucun contact de prospect, aucun score d'audit, aucun échange.
-- Le Client hub et le pipeline, une fois lus dans la base, n'avaient rien à
-- montrer. Ce fichier comble ça.
--
-- Il se rejoue sans dommage : chaque ligne porte un identifiant fixe et un
-- `on conflict do nothing`. Il suppose `seed.sql` déjà passé.
--
-- Ce qui est fictif, et assumé comme tel : tout. Les numéros de taxes sont
-- des valeurs de démonstration, pas ceux de l'agence.
-- =============================================================================

-- =============================================================================
-- L'agence : des numéros de taxes de démonstration
-- =============================================================================
-- Un document qui réclame les taxes sans les numéros ne peut pas partir.
-- Pour avancer sans les vrais numéros, des valeurs au bon format.

update public.agency
   set gst_number = coalesce(gst_number, '123456789 RT0001'),
       qst_number = coalesce(qst_number, '1234567890 TQ0001')
 where id = '11110000-0000-0000-0000-000000000001';


-- =============================================================================
-- Les clients : plan affiché, ancienneté, score de santé
-- =============================================================================

update public.client set plan = 'Présence Digitale', since = current_date - 140,
       health_score = 74, health_score_prev = 68
 where id = '55550000-0000-0000-0000-000000000001' and plan is null;
update public.client set plan = 'Croissance SEO', since = current_date - 70,
       health_score = 88, health_score_prev = 83
 where id = '55550000-0000-0000-0000-000000000002' and plan is null;
update public.client set plan = 'Domination SEO', since = current_date - 130,
       health_score = 91, health_score_prev = 92
 where id = '55550000-0000-0000-0000-000000000003' and plan is null;
update public.client set plan = 'Visibilité Locale', since = current_date - 35,
       health_score = 66, health_score_prev = 58
 where id = '55550000-0000-0000-0000-000000000004' and plan is null;

-- La courbe de progression : un audit terminé par mois, trois à cinq par
-- compte. Le score de santé ci-dessus est celui du dernier.
insert into public.audit (id, agency_id, client_id, slug, ref, state, run_at, score)
values
  ('99990000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000001', 'shgm-2026-05', 'AU-2026-001', 'termine', current_date - 120, 52),
  ('99990000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000001', 'shgm-2026-06', 'AU-2026-002', 'termine', current_date - 90,  58),
  ('99990000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000001', 'shgm-2026-07', 'AU-2026-003', 'termine', current_date - 60,  63),
  ('99990000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000001', 'shgm-2026-08', 'AU-2026-004', 'termine', current_date - 30,  68),
  ('99990000-0000-0000-0000-000000000005', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000001', 'shgm-2026-09', 'AU-2026-005', 'termine', current_date - 2,   74),
  ('99990000-0000-0000-0000-000000000006', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000002', 'acme-2026-07', 'AU-2026-006', 'termine', current_date - 60,  79),
  ('99990000-0000-0000-0000-000000000007', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000002', 'acme-2026-08', 'AU-2026-007', 'termine', current_date - 30,  83),
  ('99990000-0000-0000-0000-000000000008', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000002', 'acme-2026-09', 'AU-2026-008', 'termine', current_date - 3,   88),
  ('99990000-0000-0000-0000-000000000009', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000003', 'boreal-2026-06', 'AU-2026-009', 'termine', current_date - 100, 86),
  ('99990000-0000-0000-0000-000000000010', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000003', 'boreal-2026-07', 'AU-2026-010', 'termine', current_date - 70,  90),
  ('99990000-0000-0000-0000-000000000011', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000003', 'boreal-2026-08', 'AU-2026-011', 'termine', current_date - 40,  92),
  ('99990000-0000-0000-0000-000000000012', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000003', 'boreal-2026-09', 'AU-2026-012', 'termine', current_date - 5,   91),
  ('99990000-0000-0000-0000-000000000013', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000004', 'bio-2026-08', 'AU-2026-013', 'termine', current_date - 32,  58),
  ('99990000-0000-0000-0000-000000000014', '11110000-0000-0000-0000-000000000001', '55550000-0000-0000-0000-000000000004', 'bio-2026-09', 'AU-2026-014', 'termine', current_date - 4,   66)
on conflict (id) do nothing;

-- Une partie du travail du mois est faite : l'avancement des cartes se
-- calcule dessus, il ne se saisit pas.
update public.task t
   set status = 'terminee', completed_at = now() - interval '3 days'
 where t.period_month = date_trunc('month', current_date)::date
   and t.status = 'afaire'
   and t.completed_at is null
   and (('x' || substr(md5(t.id::text), 1, 8))::bit(32)::int % 10) < 4;


-- =============================================================================
-- Le prospect de l'appel découverte : Ébénisterie Rivard
-- =============================================================================
-- Un atelier d'ébénisterie de Rimouski, site de 2016 jamais refait, qui veut
-- une refonte et quelqu'un pour s'en occuper ensuite. C'est le cas d'usage
-- de la proposition : un forfait web ponctuel, plus une maintenance
-- mensuelle.

insert into public.client
  (id, agency_id, slug, name, initials, type, domain, sector, address, context, plan)
values
  ('55550000-0000-0000-0000-000000000015', '11110000-0000-0000-0000-000000000001',
   'ebenisterie-rivard', 'Ébénisterie Rivard', 'ER', 'prospect', 'ebenisterierivard.ca',
   'Ébénisterie et menuiserie', '412 boul. Saint-Germain O., Rimouski (Québec) G5L 3N4',
   'Refonte du site vitrine (2016, non adapté au mobile, aucune demande de soumission en ligne) '
   'et maintenance mensuelle après la livraison — personne à l''atelier pour tenir le site à jour.',
   'Croissance Digitale')
on conflict (id) do nothing;

-- Le prospect et ceux du semis ont maintenant un contact principal.
insert into public.contact
  (id, agency_id, client_id, full_name, initials, role, email, phone, is_primary)
values
  ('66660000-0000-0000-0000-000000000011', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000011', 'Dr Étienne Lavoie', 'EL', 'Propriétaire',
   'etienne@cliniquelavoie.com', '450 555 0148', true),
  ('66660000-0000-0000-0000-000000000012', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000012', 'Camille Girard', 'CG', 'Directrice générale',
   'camille@spanordik.ca', '819 555 0231', true),
  ('66660000-0000-0000-0000-000000000013', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000013', 'Denis Fortin', 'DF', 'Propriétaire',
   'denis@quincaillerie-fortin.ca', '819 555 0377', true),
  ('66660000-0000-0000-0000-000000000014', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000014', 'Karine Boucher', 'KB', 'VP marketing',
   'karine@novatech.ca', '514 555 0402', true),
  ('66660000-0000-0000-0000-000000000015', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000015', 'Martin Rivard', 'MR', 'Propriétaire',
   'martin@ebenisterierivard.ca', '418 555 0196', true)
on conflict (id) do nothing;


-- =============================================================================
-- Les opportunités
-- =============================================================================
-- Une par prospect, à des étapes différentes pour que le tableau se lise.
-- `stage_since` est une date : les jours dans l'étape se comptent, ne se
-- stockent pas.

insert into public.deal
  (id, agency_id, client_id, stage, mrr_cents, probability, owner_id,
   next_action, next_action_on, stage_since, created_at)
values
  -- Quincaillerie Fortin — tout neuf, à qualifier
  ('88880000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000013', 'prospect', 40000, 15,
   '22220000-0000-0000-0000-000000000002',
   'Appel de découverte', current_date + 3, current_date - 4, now() - interval '4 days'),
  -- Clinique Lavoie — qualifiée, audit gratuit à présenter
  ('88880000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000011', 'qualifie', 70000, 40,
   '22220000-0000-0000-0000-000000000003',
   'Présenter l''audit de prospection', current_date + 5, current_date - 9, now() - interval '23 days'),
  -- Spa Nordik Estrie — proposition envoyée
  ('88880000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000012', 'proposition', 70000, 55,
   '22220000-0000-0000-0000-000000000001',
   'Suivi de la proposition', current_date + 2, current_date - 6, now() - interval '31 days'),
  -- Novatech — en négociation sur l'engagement
  ('88880000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000014', 'negociation', 110000, 75,
   '22220000-0000-0000-0000-000000000001',
   'Négocier la durée d''engagement', current_date + 1, current_date - 3, now() - interval '48 days'),
  -- Ébénisterie Rivard — appel découverte fait, proposition à rédiger
  ('88880000-0000-0000-0000-000000000005', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000015', 'proposition', 45000, 55,
   '22220000-0000-0000-0000-000000000001',
   'Rédiger la proposition depuis le brief de découverte', current_date + 4, current_date - 1,
   now() - interval '12 days')
on conflict (id) do nothing;

-- L'instantané SEO d'un prospect : une photo, jamais une courbe (règle 3).
insert into public.deal_seo_snapshot
  (deal_id, captured_at, domain, authority, keywords, monthly_visits, top10)
values
  ('88880000-0000-0000-0000-000000000003', now() - interval '29 days', 'spanordik.ca', 27, 84, 2100, 6),
  ('88880000-0000-0000-0000-000000000004', now() - interval '46 days', 'novatech.ca', 34, 212, 5400, 14),
  ('88880000-0000-0000-0000-000000000005', now() - interval '10 days', 'ebenisterierivard.ca', 9, 11, 140, 0)
on conflict (deal_id) do nothing;

-- Les documents déjà produits, en attendant le générateur.
insert into public.deal_document (id, deal_id, name, kind, generated, created_at)
values
  ('cccc0000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000003',
   'Proposition — Spa Nordik Estrie · Croissance Digitale', 'proposition', false, now() - interval '6 days'),
  ('cccc0000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000004',
   'Proposition v2 — Novatech · Domination SEO', 'proposition', false, now() - interval '9 days'),
  ('cccc0000-0000-0000-0000-000000000003', '88880000-0000-0000-0000-000000000004',
   'Audit de prospection — novatech.ca', 'audit_prospect', true, now() - interval '46 days'),
  ('cccc0000-0000-0000-0000-000000000004', '88880000-0000-0000-0000-000000000005',
   'Audit de prospection — ebenisterierivard.ca', 'audit_prospect', true, now() - interval '10 days')
on conflict (id) do nothing;

-- Un devis envoyé à Spa Nordik, numéroté par le compteur de l'agence.
insert into public.quote
  (id, agency_id, client_id, contact_id, ref, subject, status, issued_on, expires_on, template_id)
select
  'bbbb0000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
  '55550000-0000-0000-0000-000000000012', '66660000-0000-0000-0000-000000000012',
  app.next_document_ref('33330000-0000-0000-0000-000000000001'),
  'Croissance Digitale — boutique en ligne et SEO local', 'envoye',
  current_date - 6, current_date + 24, '33330000-0000-0000-0000-000000000001'
where not exists (select 1 from public.quote where id = 'bbbb0000-0000-0000-0000-000000000001');

insert into public.quote_line (quote_id, position, description, quantity, unit_price_cents, offer_id)
values
  ('bbbb0000-0000-0000-0000-000000000001', 1, 'Forfait Croissance Digitale — boutique, réservation, SEO de démarrage', 1, 900000,
   '44440000-0000-0000-0000-000000000002')
on conflict (quote_id, position) do nothing;


-- =============================================================================
-- Les échanges consignés
-- =============================================================================
-- Le fil d'un prospect : ce qui s'est dit, par qui, quand. Jamais visible du
-- client (le canal le dit, la colonne dérivée le garantit).

insert into public.communication
  (id, agency_id, client_id, contact_id, channel, direction, body, occurred_at, author_id)
values
  -- Quincaillerie Fortin
  ('aaaa0000-0000-0000-0000-000000000001', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000013', '66660000-0000-0000-0000-000000000013',
   'note', 'out', 'Deal créé depuis le formulaire du site. Denis Fortin veut « être trouvé sur Google à Trois-Rivières ».',
   now() - interval '4 days', '22220000-0000-0000-0000-000000000002'),
  -- Clinique Lavoie
  ('aaaa0000-0000-0000-0000-000000000002', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000011', '66660000-0000-0000-0000-000000000011',
   'appel', 'out', 'Appel de qualification. Deux cliniques, une seule fiche Google : c''est leur premier irritant. Budget évoqué : 600 à 800 $ par mois.',
   now() - interval '9 days', '22220000-0000-0000-0000-000000000003'),
  ('aaaa0000-0000-0000-0000-000000000003', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000011', '66660000-0000-0000-0000-000000000011',
   'courriel', 'out', 'Envoi du lien vers l''audit de prospection, avec la fiche Google en tête des constats.',
   now() - interval '7 days', '22220000-0000-0000-0000-000000000003'),
  -- Spa Nordik Estrie
  ('aaaa0000-0000-0000-0000-000000000004', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000012', '66660000-0000-0000-0000-000000000012',
   'reunion', 'out', 'Présentation de l''audit de prospection en visioconférence. Camille veut vendre des forfaits en ligne avant l''hiver.',
   now() - interval '14 days', '22220000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000005', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000012', '66660000-0000-0000-0000-000000000012',
   'courriel', 'out', 'Proposition Croissance Digitale envoyée, avec le devis DV correspondant. Relance prévue dans une semaine.',
   now() - interval '6 days', '22220000-0000-0000-0000-000000000001'),
  -- Novatech
  ('aaaa0000-0000-0000-0000-000000000006', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000014', '66660000-0000-0000-0000-000000000014',
   'reunion', 'out', 'Négociation du périmètre : Karine accepte le pack Domination SEO mais veut un engagement de 6 mois renouvelable plutôt que 12.',
   now() - interval '3 days', '22220000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000007', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000014', '66660000-0000-0000-0000-000000000014',
   'courriel', 'in', 'Merci pour la proposition révisée. Le conseil se réunit jeudi ; je reviens vers vous vendredi au plus tard. — Karine',
   now() - interval '2 days', null),
  -- Ébénisterie Rivard : l'appel découverte, consigné avec son résumé.
  -- La transcription complète est dans docs/fixtures/appel-decouverte-ebenisterie-rivard.md
  -- et rejoindra la base avec la session 9.5.
  ('aaaa0000-0000-0000-0000-000000000008', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000015', '66660000-0000-0000-0000-000000000015',
   'note', 'out', 'Deal créé après un appel entrant : Martin Rivard a trouvé l''agence par le site de la SHGM.',
   now() - interval '12 days', '22220000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000009', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000015', '66660000-0000-0000-0000-000000000015',
   'appel', 'out',
   'Appel découverte, 42 min, enregistré (Google Meet). Résumé : atelier d''ébénisterie sur mesure, 6 employés, '
   'site WordPress de 2016 non adapté au mobile, aucune demande de soumission en ligne — tout passe par le '
   'téléphone. Problème cardinal : le site ne montre pas les réalisations et n''apparaît pas sur Google pour '
   '« ébéniste Rimouski ». Objectif principal : recevoir des demandes de soumission qualifiées par le site, '
   'cible 8 à 10 par mois avant le salon Expo Habitat d''avril. Périmètre : 8 pages, galerie de projets, '
   'formulaire de soumission avec photos, français seulement. Budget évoqué : 6 000 à 9 000 $ pour la refonte, '
   'ouvert à une maintenance mensuelle « si quelqu''un s''en occupe ». Décision : Martin et sa conjointe Julie '
   '(administration), sous deux semaines. À clarifier : propriété de la fiche Google, nombre de projets à '
   'photographier, hébergement actuel chez GoDaddy.',
   now() - interval '5 days', '22220000-0000-0000-0000-000000000001'),
  ('aaaa0000-0000-0000-0000-000000000010', '11110000-0000-0000-0000-000000000001',
   '55550000-0000-0000-0000-000000000015', '66660000-0000-0000-0000-000000000015',
   'courriel', 'in', 'Bonjour Armel, merci pour l''appel. Je vous envoie une dizaine de photos de projets d''ici la fin de semaine. Julie aimerait voir la proposition avant le 25. — Martin',
   now() - interval '4 days', null)
on conflict (id) do nothing;


-- =============================================================================
-- L'agence : ce que le profil complété attend (migration 0020)
-- =============================================================================
-- Le NEQ figure au contrat ; le reste est ce que les gabarits écrivent en dur.

update public.agency
   set neq = coalesce(neq, '2272419658'),
       representative_name = coalesce(representative_name, 'Armel Junior Nguimbi'),
       representative_title = coalesce(representative_title, 'Propriétaire, Agence DigiHunt'),
       judicial_district = coalesce(judicial_district, 'Rimouski'),
       payment_instructions = coalesce(payment_instructions,
         'Virement bancaire ou Interac. Factures payables sous 15 jours.')
 where id = '11110000-0000-0000-0000-000000000001';
