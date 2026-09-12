-- =============================================================================
-- Vérification du SEO local (migration 0007)
-- =============================================================================
-- L'enjeu de cette migration est ce qu'elle a *retiré* : les valeurs
-- précédentes, les variations, les alertes, les moyennes et les dénombrements
-- ne sont plus saisis. Ce fichier vérifie donc surtout qu'ils se retrouvent
-- bien — au chiffre près, ceux de `lib/data/local.ts` pour la fiche Acme.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- =============================================================================
-- Jeu d'essai : la fiche Acme, telle que le code la décrit aujourd'hui
-- =============================================================================

insert into public.establishment
  (id, agency_id, client_id, slug, name, city, address, gbp_state,
   nap_name, phone, website, zone)
values
  ('eeeeeeee-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   'acme-siege', 'Acme Corp. — siège', 'Montréal (Ville-Marie)',
   '1450 rue Sherbrooke Ouest, Montréal (Québec) H3G 1K4', 'revendiquee',
   'Acme Corp.', '514-555-0142', 'acmecorp.ca',
   null);  -- zone desservie jamais configurée — Acme l'a dans `gbpMissing`

-- Deux relevés : juin, puis septembre. Le code figeait `scorePrev: 58` ;
-- ici c'est simplement la ligne d'avant.
insert into public.establishment_reading
  (agency_id, establishment_id, measured_on, local_score, rating, review_count,
   nap_inconsistencies, nap_sources, calls, direction_requests, profile_views,
   gbp_missing_fields)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
   '2026-06-01', 58, 4.5, 79, 3, 14, 28, 55, 216,
   '{horaires,services,zone_desservie}'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
   '2026-09-01', 64, 4.6, 87, 3, 14, 34, 58, 212,
   '{horaires,services,zone_desservie}');


\echo ''
\echo '--- La complétude de la fiche se compte, elle ne se saisit pas ---'

do $$
declare rempli smallint;
begin
  select gbp_filled into rempli from public.establishment_reading
   where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001'
     and measured_on = '2026-09-01';

  if rempli <> 6 then
    raise exception 'ÉCHEC — 3 champs manquants sur 9 devraient donner 6 remplis, obtenu %', rempli;
  end if;
  raise notice 'OK   — 6 champs sur 9, déduits des 3 champs manquants';
end $$;

-- Le même champ deux fois fausserait le compte.
do $$
begin
  begin
    insert into public.establishment_reading
      (agency_id, establishment_id, measured_on, gbp_missing_fields)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'eeeeeeee-0000-0000-0000-000000000001', '2026-10-01',
            '{horaires,horaires,services}');
    raise exception 'ÉCHEC — un champ manquant en double a été accepté';
  exception when check_violation then
    raise notice 'OK   — un champ manquant listé deux fois est refusé';
  end;
end $$;


\echo ''
\echo '--- Les variations se lisent entre deux relevés ---'

do $$
declare ecart integer; ecart_visites integer;
begin
  select r.local_score - p.local_score, r.profile_views - p.profile_views
    into ecart, ecart_visites
  from public.establishment_reading r
  join public.establishment_reading p
    on p.establishment_id = r.establishment_id and p.measured_on = '2026-06-01'
  where r.establishment_id = 'eeeeeeee-0000-0000-0000-000000000001'
    and r.measured_on = '2026-09-01';

  if ecart <> 6 then
    raise exception 'ÉCHEC — le score devrait progresser de 6 (58 → 64), obtenu %', ecart;
  end if;
  if ecart_visites <> -4 then
    raise exception 'ÉCHEC — les visites devraient reculer de 4, obtenu %', ecart_visites;
  end if;
  raise notice 'OK   — « +6 » et « −4 » se retrouvent sans avoir été stockés';
end $$;


\echo ''
\echo '--- Une réponse à un avis ne part pas sans relecture ---'

insert into public.local_review
  (id, agency_id, establishment_id, external_id, author, rating, published_on, body, state, response)
values
  ('f0000000-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
   'g-001', 'Martine L.', 5, '2026-08-28',
   'Équipe professionnelle, travail impeccable sur notre toiture.',
   'publiee', 'Merci beaucoup Martine !');

-- L'avis négatif de juillet, resté sans réponse : c'est lui l'alerte d'Acme.
insert into public.local_review
  (agency_id, establishment_id, external_id, author, rating, published_on, body, state)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
   'g-002', 'Jean-François R.', 1, '2026-07-22',
   'Rendez-vous reporté trois fois sans nous avertir.', 'sans_reponse');

do $$
begin
  begin
    insert into public.local_review
      (agency_id, establishment_id, external_id, rating, published_on, state, response)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'eeeeeeee-0000-0000-0000-000000000001', 'g-003', 4, '2026-08-18',
            'publiee', null);
    raise exception 'ÉCHEC — un avis « réponse publiée » sans texte a été accepté';
  exception when check_violation then
    raise notice 'OK   — un avis marqué « réponse publiée » sans réponse est refusé';
  end;

  begin
    insert into public.local_review
      (agency_id, establishment_id, external_id, rating, published_on, state, response)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'eeeeeeee-0000-0000-0000-000000000001', 'g-004', 4, '2026-08-18',
            'a_relire', 'Texte publié sans être relu');
    raise exception 'ÉCHEC — une réponse en ligne a pu porter l''état « à relire »';
  exception when check_violation then
    raise notice 'OK   — « à relire » porte un brouillon, jamais une réponse en ligne';
  end;

  begin
    insert into public.local_review
      (agency_id, establishment_id, external_id, rating, published_on, state)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'eeeeeeee-0000-0000-0000-000000000001', 'g-005', 1, '2026-08-02', 'signale');
    raise exception 'ÉCHEC — un avis signalé sans motif a été accepté';
  exception when check_violation then
    raise notice 'OK   — signaler un avis à Google exige un motif écrit';
  end;
end $$;


\echo ''
\echo '--- Les citations : 12 annuaires sur 20, 3 incohérences, comptés ---'

-- Les vingt annuaires de référence d'Acme, avec leur autorité.
insert into public.directory (id, agency_id, slug, name, authority)
select
  ('f1000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid,
  'aaaaaaaa-0000-0000-0000-000000000001',
  'annuaire-' || i, 'Annuaire ' || i,
  case when i <= 6 then 'haute' when i <= 14 then 'moyenne' else 'faible' end::public.directory_authority
from generate_series(1, 20) i;

-- Huit conformes.
insert into public.citation (agency_id, establishment_id, directory_id, state, checked_on)
select 'aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
       ('f1000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid,
       'conforme', '2026-09-07'
from generate_series(1, 8) i;

-- Sept absents.
insert into public.citation (agency_id, establishment_id, directory_id, state, checked_on)
select 'aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
       ('f1000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid,
       'absent', '2026-09-07'
from generate_series(9, 15) i;

-- Un doublon et un annuaire injoignable, chacun avec son explication.
insert into public.citation
  (agency_id, establishment_id, directory_id, state, checked_on, duplicate_note)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
        'f1000000-0000-0000-0000-000000000016', 'doublon', '2026-09-07',
        'Deux fiches actives : l''ancienne adresse reste indexée.');

insert into public.citation
  (agency_id, establishment_id, directory_id, state, checked_on, unreachable_note)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
        'f1000000-0000-0000-0000-000000000017', 'inaccessible', '2026-09-07',
        'Délai d''attente dépassé lors du dernier relevé.');

-- Trois incohérences, chacune nommant le champ fautif. L'état et les écarts
-- s'écrivent ensemble : c'est pour ça que la vérification est reportée en fin
-- de transaction plutôt que posée sur une ligne isolée.
begin;

insert into public.citation (id, agency_id, establishment_id, directory_id, state, checked_on)
values
  ('f2000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'eeeeeeee-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000018',
   'incoherent', '2026-09-07'),
  ('f2000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'eeeeeeee-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000019',
   'incoherent', '2026-09-07'),
  ('f2000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'eeeeeeee-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000020',
   'incoherent', '2026-09-07');

insert into public.citation_mismatch (citation_id, field, published_value) values
  ('f2000000-0000-0000-0000-000000000001', 'telephone', '514-555-0099'),
  ('f2000000-0000-0000-0000-000000000002', 'adresse', '1200 rue Sherbrooke O, Montréal'),
  ('f2000000-0000-0000-0000-000000000003', 'nom', 'Acme Corp Toiture');

commit;

do $$
declare ref integer; present integer; incoh integer;
begin
  select directories_referenced, directories_present, inconsistent
    into ref, present, incoh
  from public.establishment_citation_summary
  where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001';

  if ref <> 20 or present <> 12 then
    raise exception 'ÉCHEC — attendu « 12 annuaires sur 20 », obtenu « % sur % »', present, ref;
  end if;
  if incoh <> 3 then
    raise exception 'ÉCHEC — attendu 3 incohérences, obtenu %', incoh;
  end if;
  raise notice 'OK   — « 12 annuaires sur 20 » et « 3 incohérences » se comptent sur les lignes';
end $$;


\echo ''
\echo '--- Une incohérence nomme toujours le champ fautif ---'

do $$
declare refuse boolean := false;
begin
  begin
    insert into public.citation (agency_id, establishment_id, directory_id, state, checked_on)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'eeeeeeee-0000-0000-0000-000000000001',
            'f1000000-0000-0000-0000-000000000009', 'incoherent', '2026-09-07');
    set constraints all immediate;
  exception when others then
    refuse := true;
  end;
  if not refuse then
    raise exception 'ÉCHEC — une citation incohérente sans écart de champ a été acceptée';
  end if;
  raise notice 'OK   — une citation incohérente sans champ nommé est refusée';
end $$;

do $$
declare refuse boolean := false;
begin
  begin
    insert into public.citation_mismatch (citation_id, field, published_value)
    select c.id, 'horaires', 'Fermé le dimanche'
      from public.citation c
     where c.establishment_id = 'eeeeeeee-0000-0000-0000-000000000001'
       and c.state = 'conforme' limit 1;
    set constraints all immediate;
  exception when others then
    refuse := true;
  end;
  if not refuse then
    raise exception 'ÉCHEC — un écart de champ a pu être posé sur une citation conforme';
  end if;
  raise notice 'OK   — seule une citation incohérente porte des écarts de champ';
end $$;

-- La valeur attendue des quatre champs de référence se lit sur la fiche : la
-- recopier ferait diverger la référence de ce qu'elle contrôle.
do $$
begin
  begin
    insert into public.citation_mismatch (citation_id, field, published_value, expected_value)
    values ('f2000000-0000-0000-0000-000000000001', 'nom', 'Acme Toiture', 'Acme Corp.');
    raise exception 'ÉCHEC — la valeur attendue du nom a pu être recopiée';
  exception when check_violation then
    raise notice 'OK   — le nom attendu se lit sur l''établissement, il ne se recopie pas';
  end;
end $$;


\echo ''
\echo '--- Les positions : moyenne, étendue et relevé précédent se calculent ---'

insert into public.local_keyword (id, agency_id, establishment_id, query, is_primary)
values ('f3000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001',
        'couvreur montréal', true);

insert into public.local_position
  (agency_id, keyword_id, measured_on, point_row, point_col, position)
select 'aaaaaaaa-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000001',
       d.jour, 1, p.col, p.pos
from (values ('2026-06-01'::date, 1, 1), ('2026-06-01', 2, 2), ('2026-06-01', 3, 3),
             ('2026-06-01', 4, 2), ('2026-06-01', 5, 2),
             ('2026-09-01', 1, 4), ('2026-09-01', 2, 6), ('2026-09-01', 3, 5),
             ('2026-09-01', 4, 7), ('2026-09-01', 5, 5))
     as p(jour, col, pos)
join (values ('2026-06-01'::date), ('2026-09-01'::date)) as d(jour) on d.jour = p.jour;

do $$
declare moy numeric; mini smallint; maxi smallint; prec numeric;
begin
  select position_avg, position_min, position_max, position_avg_previous
    into moy, mini, maxi, prec
  from public.local_keyword_reading
  where keyword_id = 'f3000000-0000-0000-0000-000000000001'
    and measured_on = '2026-09-01';

  if moy <> 5.4 then raise exception 'ÉCHEC — moyenne attendue 5,4, obtenue %', moy; end if;
  if mini <> 4 or maxi <> 7 then
    raise exception 'ÉCHEC — étendue attendue 4 à 7, obtenue % à %', mini, maxi;
  end if;
  if prec <> 2.0 then
    raise exception 'ÉCHEC — le relevé précédent devrait valoir 2,0, obtenu %', prec;
  end if;
  raise notice 'OK   — moyenne 5,4, étendue 4–7 et relevé précédent 2,0, tous calculés';
end $$;

do $$
begin
  begin
    insert into public.local_position
      (agency_id, keyword_id, measured_on, point_row, point_col, sector_name, position)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000001',
            '2026-09-01', 2, 2, 'Ville-Marie', 3);
    raise exception 'ÉCHEC — un relevé à la fois sur grille et sur secteur a été accepté';
  exception when check_violation then
    raise notice 'OK   — un relevé est sur la grille ou sur un secteur, jamais les deux';
  end;
end $$;


\echo ''
\echo '--- Les alertes se lisent dans les données ---'

do $$
declare n integer; plus_grave text; codes text;
begin
  select count(*) into n from public.establishment_alert
   where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001';

  select string_agg(code, ', ' order by rank, code) into codes
  from public.establishment_alert
  where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001';

  select code into plus_grave from public.establishment_alert
   where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001'
   order by rank, code limit 1;

  -- Le code n'en affichait qu'une — « avis_negatif ». Les trois autres
  -- existaient pourtant dans les mêmes données.
  if plus_grave <> 'avis_negatif' then
    raise exception 'ÉCHEC — la plus grave devrait être « avis_negatif », obtenu %', plus_grave;
  end if;
  if n <> 4 then
    raise exception 'ÉCHEC — 4 alertes attendues pour Acme, obtenu % (%)', n, codes;
  end if;
  raise notice 'OK   — % ; la plus grave reste « avis_negatif »', codes;
end $$;

-- Répondre à l'avis négatif fait tomber l'alerte, sans rien effacer ailleurs.
do $$
declare reste integer;
begin
  update public.local_review
     set state = 'publiee', response = 'Toutes nos excuses, un responsable vous rappelle.'
   where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001'
     and external_id = 'g-002';

  select count(*) into reste from public.establishment_alert
   where establishment_id = 'eeeeeeee-0000-0000-0000-000000000001'
     and code = 'avis_negatif';

  if reste <> 0 then
    raise exception 'ÉCHEC — l''alerte « avis négatif » survit à la réponse publiée';
  end if;
  raise notice 'OK   — répondre à l''avis fait tomber l''alerte, sans intervention';
end $$;


\echo ''
\echo '--- Les critères de présence restent ceux de l''audit ---'

-- L'audit A-0142 est celui de 01_regles.sql — c'est bien le même que la fiche
-- locale d'Acme référence (`auditRef` dans lib/data/local.ts).
insert into public.audit_criterion
  (audit_id, dimension, establishment_id, label, status, measure, threshold)
values ('b0000000-0000-0000-0000-00000000000a', 'presence',
        'eeeeeeee-0000-0000-0000-000000000001',
        'Cohérence nom · adresse · téléphone', 'fail',
        '3 incohérences sur 14 sources', 'Seuil : 0 incohérence');

do $$
begin
  begin
    insert into public.audit_criterion
      (audit_id, dimension, establishment_id, label, status)
    values ('b0000000-0000-0000-0000-00000000000a', 'seo',
            'eeeeeeee-0000-0000-0000-000000000001', 'Balisage Hn', 'warn');
    raise exception 'ÉCHEC — un critère SEO a pu être rattaché à un établissement';
  exception when check_violation then
    raise notice 'OK   — seule la présence en ligne se constate fiche par fiche';
  end;
end $$;


\echo ''
\echo '--- Le portail voit sa fiche et ses chiffres, rien du travail d''agence ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare nf integer; nr integer; nc integer; nk integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into nf from public.establishment;
  select count(*) into nr from public.establishment_reading;
  select count(*) into nc from public.citation;
  select count(*) into nk from public.competitor;

  if nf <> 1 then raise exception 'ÉCHEC — le contact devrait voir sa seule fiche, il en voit %', nf; end if;
  if nr <> 2 then raise exception 'ÉCHEC — le contact devrait voir ses 2 relevés, il en voit %', nr; end if;
  if nc <> 0 then raise exception 'ÉCHEC — le contact voit % citation(s) — c''est l''inventaire des défauts', nc; end if;
  if nk <> 0 then raise exception 'ÉCHEC — le contact voit l''analyse de la concurrence'; end if;

  raise notice 'OK   — sa fiche et ses relevés, jamais l''inventaire des incohérences';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.establishment_reading;
  if n <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % relevé(s) qui ne sont pas à elle', n;
  end if;
  raise notice 'OK   — l''agence rivale n''atteint aucun relevé du portefeuille';
end $$;


\echo ''
\echo 'Tous les tests SEO local sont passés.'
