-- =============================================================================
-- Vérification du contrat et de son échéancier (migration 0015)
-- =============================================================================
-- Ce fichier monte le mandat réel — contrat n° 2026-007, Agence DigiHunt ×
-- SHGM — tel que le contrat et l'Annexe A le décrivent. C'est la seule façon
-- de vérifier que le modèle tient ce qu'un client signé peut opposer.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


insert into public.client (id, agency_id, slug, name, initials, type)
values ('cccccccc-0000-0000-0000-0000000000d1', 'aaaaaaaa-0000-0000-0000-000000000001',
        'shgm', 'Société d''Histoire et de Généalogie de La Matapédia', 'SH', 'client');

insert into public.contact (id, agency_id, client_id, full_name, initials, role, is_primary)
values ('dddddddd-0000-0000-0000-0000000000d1', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-0000000000d1', 'Audrey Venick', 'AV', 'Présidente', true);

insert into public.contract
  (id, agency_id, client_id, ref, title, status, fee_cents, hourly_rate_cents,
   acceptance_business_days, content_deadline_days, warranty_days,
   signed_on, started_on, signed_by_contact_id)
values ('e5000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-0000000000d1',
        '2026-007', 'Conception et mise en ligne du site web de la SHGM',
        'signe', 975000, 10000, 5, 60, 30,
        '2026-10-01', '2026-10-01', 'dddddddd-0000-0000-0000-0000000000d1');


\echo ''
\echo '--- La chaîne documentaire porte son ordre de priorité ---'

insert into public.contract_document (contract_id, kind, name, ref, precedence) values
  ('e5000000-0000-0000-0000-000000000001', 'contrat',
   'Contrat de services professionnels', '2026-007', 1),
  ('e5000000-0000-0000-0000-000000000001', 'annexe',
   'Annexe A — Description détaillée des livrables et échéancier', '2026-007', 2),
  ('e5000000-0000-0000-0000-000000000001', 'proposition',
   'Proposition de services acceptée', '2026-007', 3);

do $$
declare premier text;
begin
  select name into premier from public.contract_document
   where contract_id = 'e5000000-0000-0000-0000-000000000001'
   order by precedence limit 1;

  if premier not like 'Contrat%' then
    raise exception 'ÉCHEC — le corps du contrat devrait primer, obtenu « % »', premier;
  end if;

  begin
    insert into public.contract_document (contract_id, kind, name, precedence)
    values ('e5000000-0000-0000-0000-000000000001', 'avenant', 'Avenant au même rang', 2);
    raise exception 'ÉCHEC — deux documents au même rang ont été acceptés';
  exception when unique_violation then
    raise notice 'OK   — l''ordre de priorité est explicite : deux documents ne partagent pas un rang';
  end;
end $$;


\echo ''
\echo '--- Les rondes au-delà du nombre inclus sont facturables ---'

insert into public.deliverable (id, contract_id, code, title, included_rounds, position) values
  ('e6000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001',
   'L-01', 'Architecture et arborescence', 1, 1),
  ('e6000000-0000-0000-0000-000000000002', 'e5000000-0000-0000-0000-000000000001',
   'L-02', 'Maquettes Figma (design haute-fidélité)', 2, 2),
  ('e6000000-0000-0000-0000-000000000003', 'e5000000-0000-0000-0000-000000000001',
   'L-03', 'Développement Webflow — Pages statiques', 1, 3),
  ('e6000000-0000-0000-0000-000000000004', 'e5000000-0000-0000-0000-000000000001',
   'L-04', 'Développement Webflow — CMS', 1, 4),
  ('e6000000-0000-0000-0000-000000000009', 'e5000000-0000-0000-0000-000000000001',
   'L-09', 'Adaptation responsive', null, 9),
  ('e6000000-0000-0000-0000-000000000010', 'e5000000-0000-0000-0000-000000000001',
   'L-10', 'Formation à la gestion du site', null, 10);

-- « L-09 — Adaptation responsive : inclus dans L-03 / L-04 ».
insert into public.deliverable_inclusion (deliverable_id, included_in_id) values
  ('e6000000-0000-0000-0000-000000000009', 'e6000000-0000-0000-0000-000000000003'),
  ('e6000000-0000-0000-0000-000000000009', 'e6000000-0000-0000-0000-000000000004');

-- Deux rondes comprises sur les maquettes, trois consommées.
insert into public.revision_round (deliverable_id, number, opened_on, closed_on) values
  ('e6000000-0000-0000-0000-000000000002', 1, '2026-11-15', '2026-11-18'),
  ('e6000000-0000-0000-0000-000000000002', 2, '2026-11-20', '2026-11-23');
insert into public.revision_round (deliverable_id, number, opened_on, hours)
values ('e6000000-0000-0000-0000-000000000002', 3, '2026-11-26', 3.5);

do $$
declare r record;
begin
  select included_rounds, rounds_used, rounds_billable, billable_hours into r
  from public.deliverable_revision_status
  where deliverable_id = 'e6000000-0000-0000-0000-000000000002';

  if r.rounds_used <> 3 or r.rounds_billable <> 1 then
    raise exception 'ÉCHEC — 3 rondes pour 2 incluses devraient donner 1 facturable, obtenu % / %',
      r.rounds_used, r.rounds_billable;
  end if;
  if r.billable_hours <> 3.5 then
    raise exception 'ÉCHEC — 3,5 h facturables attendues, obtenu %', r.billable_hours;
  end if;

  raise notice 'OK   — 3 rondes sur 2 incluses : 1 facturable, 3,5 h à 100 $/h, comptées par le moteur';
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.deliverable_revision_status
   where deliverable_id = 'e6000000-0000-0000-0000-000000000001' and rounds_billable > 0;
  if n <> 0 then
    raise exception 'ÉCHEC — un livrable sans ronde consommée ne facture rien';
  end if;
  raise notice 'OK   — un livrable resté dans son quota ne facture rien';
end $$;


\echo ''
\echo '--- L''état d''un livrable et ses dates ne se contredisent pas ---'

do $$
begin
  begin
    update public.deliverable set state = 'accepte'
     where id = 'e6000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un livrable accepté sans date d''acceptation';
  exception when check_violation then
    raise notice 'OK   — « accepté » porte sa date, sinon rien ne dit quand';
  end;

  begin
    update public.deliverable set state = 'soumis'
     where id = 'e6000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un livrable soumis sans date de remise';
  exception when check_violation then
    raise notice 'OK   — « soumis » veut dire remis un jour précis';
  end;
end $$;

do $$
begin
  update public.deliverable
     set state = 'accepte_tacitement', submitted_on = '2026-10-22', accepted_on = '2026-10-29'
   where id = 'e6000000-0000-0000-0000-000000000001';
  raise notice 'OK   — l''acceptation tacite est un état à part entière, daté comme les autres';
end $$;


\echo ''
\echo '--- L''échéancier se calcule, et glisse d''un bloc ---'

insert into public.milestone (id, contract_id, code, description, owner, fixed_on, position) values
  ('e7000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001',
   'J-01', 'Signature du contrat et versement de l''acompte (50 %)', 'client', '2026-10-01', 1);

insert into public.milestone
  (id, contract_id, code, description, owner, depends_on_id, offset_days, position)
values
  ('e7000000-0000-0000-0000-000000000002', 'e5000000-0000-0000-0000-000000000001',
   'J-02', 'Questionnaire de démarrage et solution de paiement', 'client',
   'e7000000-0000-0000-0000-000000000001', 7, 2),
  ('e7000000-0000-0000-0000-000000000003', 'e5000000-0000-0000-0000-000000000001',
   'J-03', 'Remise du contenu brut (textes, photos, accès)', 'client',
   'e7000000-0000-0000-0000-000000000001', 14, 3),
  ('e7000000-0000-0000-0000-000000000004', 'e5000000-0000-0000-0000-000000000001',
   'J-04', 'Livraison du plan de site pour validation', 'prestataire',
   'e7000000-0000-0000-0000-000000000003', 7, 4),
  ('e7000000-0000-0000-0000-000000000005', 'e5000000-0000-0000-0000-000000000001',
   'J-05', 'Livraison des maquettes Figma pour validation', 'prestataire',
   'e7000000-0000-0000-0000-000000000004', 21, 5),
  ('e7000000-0000-0000-0000-000000000006', 'e5000000-0000-0000-0000-000000000001',
   'J-06', 'Livraison du site en développement Webflow', 'prestataire',
   'e7000000-0000-0000-0000-000000000005', 30, 6),
  ('e7000000-0000-0000-0000-000000000007', 'e5000000-0000-0000-0000-000000000001',
   'J-07', 'Ronde de corrections finales — approbation du Client', 'les_deux',
   'e7000000-0000-0000-0000-000000000006', 7, 7),
  ('e7000000-0000-0000-0000-000000000008', 'e5000000-0000-0000-0000-000000000001',
   'J-08', 'Facturation du solde (50 %)', 'prestataire',
   'e7000000-0000-0000-0000-000000000007', 0, 8),
  ('e7000000-0000-0000-0000-000000000009', 'e5000000-0000-0000-0000-000000000001',
   'J-09', 'Réception du paiement du solde', 'client',
   'e7000000-0000-0000-0000-000000000008', 15, 9),
  ('e7000000-0000-0000-0000-00000000000a', 'e5000000-0000-0000-0000-000000000001',
   'J-10', 'Mise en ligne du site et formation', 'les_deux',
   'e7000000-0000-0000-0000-000000000009', 7, 10);

do $$
declare j04 date; j10 date;
begin
  select planned_on into j04 from public.contract_schedule
   where milestone_id = 'e7000000-0000-0000-0000-000000000004';
  select planned_on into j10 from public.contract_schedule
   where milestone_id = 'e7000000-0000-0000-0000-00000000000a';

  -- J-01 1ᵉʳ oct. → J-03 le 15 → J-04 le 22 → … → J-10 le 10 janvier.
  if j04 <> date '2026-10-22' then
    raise exception 'ÉCHEC — J-04 attendu le 22 octobre, obtenu %', j04;
  end if;
  if j10 <> date '2027-01-10' then
    raise exception 'ÉCHEC — J-10 attendu le 10 janvier 2027, obtenu %', j10;
  end if;
  raise notice 'OK   — onze jalons enchaînés, aucune date saisie : J-10 tombe le 10 janvier 2027';
end $$;

do $$
declare j04 date; j10 date;
begin
  -- Le client remet son contenu un mois en retard (article 5.2 : les jalons
  -- suivants sont reportés d'autant, sans pénalité pour le Prestataire).
  update public.milestone set reached_on = '2026-11-15'
   where id = 'e7000000-0000-0000-0000-000000000003';

  select planned_on into j04 from public.contract_schedule
   where milestone_id = 'e7000000-0000-0000-0000-000000000004';
  select planned_on into j10 from public.contract_schedule
   where milestone_id = 'e7000000-0000-0000-0000-00000000000a';

  if j04 <> date '2026-11-22' then
    raise exception 'ÉCHEC — J-04 devrait suivre le retard, obtenu %', j04;
  end if;
  if j10 <> date '2027-02-10' then
    raise exception 'ÉCHEC — J-10 devrait glisser d''un mois, obtenu %', j10;
  end if;
  raise notice 'OK   — un mois de retard du client décale tout l''échéancier d''un mois, d''un seul geste';
end $$;

do $$
begin
  begin
    update public.milestone set fixed_on = null, depends_on_id = 'e7000000-0000-0000-0000-00000000000a',
                                offset_days = 7
     where id = 'e7000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un échéancier circulaire a été accepté';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — %', left(sqlerrm, 72);
  end;
end $$;


\echo ''
\echo '--- L''échéancier de paiement suit les jalons, pas le calendrier ---'

insert into public.payment_milestone
  (contract_id, label, percentage, trigger, milestone_id, terms_days, position)
values
  ('e5000000-0000-0000-0000-000000000001', 'Acompte à la signature', 50,
   'signature', null, 0, 1),
  ('e5000000-0000-0000-0000-000000000001', 'Solde à la livraison finale', 50,
   'jalon', 'e7000000-0000-0000-0000-000000000008', 15, 2);

do $$
declare prevu bigint; facture bigint;
begin
  select scheduled_cents, invoiced_cents into prevu, facture
  from public.contract_financials where contract_id = 'e5000000-0000-0000-0000-000000000001';

  -- 50 % + 50 % de 9 750 $ = 9 750 $, et rien n'est encore facturé.
  if prevu <> 975000 then
    raise exception 'ÉCHEC — l''échéancier devrait couvrir 9 750 $, obtenu % $', prevu / 100.0;
  end if;
  if facture <> 0 then
    raise exception 'ÉCHEC — rien ne devrait être facturé, obtenu % $', facture / 100.0;
  end if;
  raise notice 'OK   — deux versements de 50 %% couvrent exactement les honoraires, rien n''est encore facturé';
end $$;

do $$
begin
  begin
    insert into public.payment_milestone
      (contract_id, label, percentage, amount_cents, trigger)
    values ('e5000000-0000-0000-0000-000000000001', 'Les deux à la fois', 25, 100000, 'signature');
    raise exception 'ÉCHEC — un versement à la fois en pourcentage et en montant';
  exception when check_violation then
    raise notice 'OK   — un versement est un pourcentage ou un montant, jamais les deux';
  end;

  begin
    insert into public.payment_milestone (contract_id, label, percentage, trigger)
    values ('e5000000-0000-0000-0000-000000000001', 'Jalon sans jalon', 10, 'jalon');
    raise exception 'ÉCHEC — un versement déclenché par un jalon sans jalon nommé';
  exception when check_violation then
    raise notice 'OK   — un versement déclenché par un jalon doit dire lequel';
  end;
end $$;


\echo ''
\echo '--- Le contenu qui manque, et la date à partir de laquelle on peut suspendre ---'

insert into public.client_input_item
  (contract_id, label, expected_format, due_milestone_id, position)
values
  ('e5000000-0000-0000-0000-000000000001', 'Textes de présentation',
   'Document Word, PDF ou courriel', 'e7000000-0000-0000-0000-000000000003', 1),
  ('e5000000-0000-0000-0000-000000000001', 'Logo de la SHGM',
   'Fichier vectoriel (.svg ou .ai) ou PNG haute résolution',
   'e7000000-0000-0000-0000-000000000003', 2),
  ('e5000000-0000-0000-0000-000000000001', 'Photos disponibles',
   'JPG ou PNG, 1 200 px de large minimum', 'e7000000-0000-0000-0000-000000000003', 3);

update public.client_input_item set received_on = '2026-11-10'
 where contract_id = 'e5000000-0000-0000-0000-000000000001' and label = 'Logo de la SHGM';

do $$
declare r record;
begin
  select items_pending, suspension_possible_from into r
  from public.contract_pending_input
  where contract_id = 'e5000000-0000-0000-0000-000000000001';

  if r.items_pending <> 2 then
    raise exception 'ÉCHEC — 2 éléments devraient manquer, obtenu %', r.items_pending;
  end if;
  -- Signature le 1ᵉʳ octobre + 60 jours de date butoir.
  if r.suspension_possible_from <> date '2026-11-30' then
    raise exception 'ÉCHEC — suspension possible à partir du 30 novembre, obtenu %',
      r.suspension_possible_from;
  end if;
  raise notice 'OK   — 2 éléments manquants, suspension possible à partir du 30 novembre';
end $$;


\echo ''
\echo '--- Les exclusions sont la prochaine vente, pas une note de bas de page ---'

insert into public.contract_exclusion (contract_id, label, detail, position) values
  ('e5000000-0000-0000-0000-000000000001', 'Prestation SEO',
   'L-11 inclut des conseils SEO de base uniquement. Audit technique, stratégie de mots-clés, référencement local et suivi de positions non inclus.', 1),
  ('e5000000-0000-0000-0000-000000000001', 'Version anglaise ou site multilingue',
   'Le site est livré en français uniquement.', 2),
  ('e5000000-0000-0000-0000-000000000001', 'Espace membre avec connexion sécurisée',
   'Non inclus dans cette phase.', 3);

do $$
declare n integer;
begin
  select count(*) into n from public.contract_exclusion
   where contract_id = 'e5000000-0000-0000-0000-000000000001' and quote_id is null;
  if n <> 3 then
    raise exception 'ÉCHEC — 3 exclusions non converties attendues, obtenu %', n;
  end if;
  raise notice 'OK   — 3 exclusions écrites au contrat attendent leur devis : c''est du pipeline, pas du texte';
end $$;


\echo ''
\echo '--- La banque d''heures ne se reporte pas ---'

insert into public.support_period
  (id, contract_id, starts_on, months, hours_min, hours_max, overage_rate_cents)
values ('e8000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001',
        '2027-02-17', 3, 4, 6, 10000);

insert into public.support_month (period_id, month, hours_used, warranty_hours) values
  ('e8000000-0000-0000-0000-000000000001', '2027-02-01', 2.0, 1.5),
  ('e8000000-0000-0000-0000-000000000001', '2027-03-01', 6.0, 0);

do $$
declare fev numeric; garantie numeric;
begin
  select hours_used, warranty_hours into fev, garantie from public.support_month
   where period_id = 'e8000000-0000-0000-0000-000000000001' and month = '2027-02-01';

  if fev <> 2.0 or garantie <> 1.5 then
    raise exception 'ÉCHEC — février : 2 h de forfait et 1,5 h de garantie attendues, obtenu % / %', fev, garantie;
  end if;
  raise notice 'OK   — les heures de garantie sont comptées à part : elles ne mangent pas le forfait';
end $$;


\echo ''
\echo '--- Ce que le client voit de son mandat ---'

insert into public.portal_identity (user_id, contact_id)
values ('33333333-3333-3333-3333-333333333333', 'dddddddd-0000-0000-0000-0000000000d1')
on conflict (user_id) do update set contact_id = excluded.contact_id;

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare nc integer; nd integer; nj integer; ni integer; nx integer; nr integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into nc from public.contract;
  select count(*) into nd from public.deliverable;
  select count(*) into nj from public.milestone;
  select count(*) into ni from public.client_input_item;
  select count(*) into nx from public.contract_exclusion;
  select count(*) into nr from public.revision_round;

  if nc <> 1 then raise exception 'ÉCHEC — le client devrait voir son contrat signé, il en voit %', nc; end if;
  if nd <> 6 then raise exception 'ÉCHEC — le client devrait voir ses 6 livrables, il en voit %', nd; end if;
  if nj <> 10 then raise exception 'ÉCHEC — le client devrait voir les 10 jalons, il en voit %', nj; end if;
  if ni <> 3 then raise exception 'ÉCHEC — le client devrait voir ce qu''on attend de lui, il voit % élément(s)', ni; end if;
  if nx <> 0 then raise exception 'ÉCHEC — le client voit le suivi des exclusions (%)', nx; end if;
  if nr <> 0 then raise exception 'ÉCHEC — le client voit le décompte des rondes facturables (%)', nr; end if;

  raise notice 'OK   — son contrat, ses livrables, l''échéancier et ce qu''on attend de lui ; ni les rondes facturables ni le suivi des exclusions';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
  select count(*) into n from public.contract;
  if n <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % contrat(s)', n;
  end if;
  raise notice 'OK   — un contrat ne franchit pas la frontière de l''agence';
end $$;


\echo ''
\echo 'Tous les tests du contrat sont passés.'
