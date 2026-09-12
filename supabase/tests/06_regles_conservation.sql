-- =============================================================================
-- Vérification des analyses ponctuelles et de la règle 3 (migration 0009)
-- =============================================================================
-- La règle 3 de `docs/decisions.md` n'existait jusqu'ici que sous forme de
-- tableau dans un document. Ce fichier vérifie qu'elle tient dans le moteur :
-- le marqueur de conservation ne peut pas mentir, le cache se périme, les
-- séries se diluent, et l'instantané d'un prospect perdu disparaît.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- Un prospect, pour comparer les deux régimes de conservation.
insert into public.client (id, agency_id, slug, name, initials, type, domain)
values ('cccccccc-0000-0000-0000-0000000000a1',
        'aaaaaaaa-0000-0000-0000-000000000001', 'spa-nordik-estrie',
        'Spa Nordik Estrie', 'SN', 'prospect', 'spanordik.ca');


\echo ''
\echo '--- Le marqueur de conservation se calcule, il ne se déclare pas ---'

insert into public.tool_run (id, agency_id, client_id, tool, scope, credits, cost_cents)
values ('b1000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'keyword_gap', '3 derniers mois', 26, 13);

insert into public.tool_run (id, agency_id, client_id, tool, scope, credits, cost_cents)
values ('b1000000-0000-0000-0000-000000000002',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'domain_overview', 'Analyse ponctuelle', 6, 3);

-- Le même outil, sur un prospect : ce n'est plus le même régime.
insert into public.tool_run (id, agency_id, client_id, tool, scope, credits, cost_cents)
values ('b1000000-0000-0000-0000-000000000003',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-0000000000a1',
        'organic_research', '12–24 mois', 62, 31);

do $$
declare r record;
begin
  select retention, expires_on into r from public.tool_run
   where id = 'b1000000-0000-0000-0000-000000000001';
  if r.retention <> 'ephemere' or r.expires_on <> current_date + 30 then
    raise exception 'ÉCHEC — l''exploration de mots-clés devrait être éphémère à 30 jours, obtenu % / %',
      r.retention, r.expires_on;
  end if;

  select retention, expires_on into r from public.tool_run
   where id = 'b1000000-0000-0000-0000-000000000002';
  if r.retention <> 'historise' or r.expires_on is not null then
    raise exception 'ÉCHEC — une analyse de domaine sur un client est historisée, obtenu % / %',
      r.retention, r.expires_on;
  end if;

  select retention, expires_on into r from public.tool_run
   where id = 'b1000000-0000-0000-0000-000000000003';
  if r.retention <> 'instantane' or r.expires_on is not null then
    raise exception 'ÉCHEC — un prospect n''a droit qu''à un instantané, obtenu % / %',
      r.retention, r.expires_on;
  end if;

  raise notice 'OK   — éphémère, historisé, instantané : les trois régimes se déduisent du compte et de l''outil';
end $$;

-- Un appel ne peut pas se déclarer conservé alors qu'il ne l'est pas : c'est
-- exactement le marqueur que l'interface doit afficher.
do $$
declare r public.retention_kind;
begin
  insert into public.tool_run (id, agency_id, client_id, tool, retention, expires_on)
  values ('b1000000-0000-0000-0000-000000000004',
          'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
          'keyword_hunter', 'historise', null);

  select retention into r from public.tool_run where id = 'b1000000-0000-0000-0000-000000000004';
  if r <> 'ephemere' then
    raise exception 'ÉCHEC — l''appelant a pu déclarer un cache comme historisé (%)', r;
  end if;
  raise notice 'OK   — un appel qui se déclare conservé est corrigé, pas cru';
end $$;


\echo ''
\echo '--- Keyword Gap : les quatre catégories se calculent ---'

insert into public.gap_competitor (id, tool_run_id, domain, name, position) values
  ('b2000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'couvreur-rive-sud.ca', 'Couvreur Rive-Sud Inc.', 1),
  ('b2000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001',
   'toitures-estrie.ca', 'Toitures Estrie', 2);

insert into public.gap_row (id, tool_run_id, query, search_volume, client_position) values
  ('b3000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'toiture verte avantages', 210, null),
  ('b3000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001',
   'toiture montréal', 1900, 7),
  ('b3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001',
   'couvreur rive-sud', 520, 6),
  ('b3000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001',
   'inspection toiture drone', 140, 8);

insert into public.gap_position (row_id, competitor_id, position) values
  ('b3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 5),
  ('b3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000002', null),
  ('b3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 3),
  ('b3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 15),
  ('b3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000001', 11),
  ('b3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002', 9),
  ('b3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000001', null),
  ('b3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000002', null);

do $$
declare c text;
begin
  select category into c from public.gap_row_category where row_id = 'b3000000-0000-0000-0000-000000000001';
  if c <> 'manquants' then raise exception 'ÉCHEC — « toiture verte avantages » devrait être manquant, obtenu %', c; end if;

  select category into c from public.gap_row_category where row_id = 'b3000000-0000-0000-0000-000000000002';
  if c <> 'faibles' then raise exception 'ÉCHEC — 7ᵉ derrière un concurrent 3ᵉ, c''est « faible », obtenu %', c; end if;

  select category into c from public.gap_row_category where row_id = 'b3000000-0000-0000-0000-000000000003';
  if c <> 'forts' then raise exception 'ÉCHEC — 6ᵉ devant 9ᵉ et 11ᵉ, c''est « fort », obtenu %', c; end if;

  select category into c from public.gap_row_category where row_id = 'b3000000-0000-0000-0000-000000000004';
  if c <> 'uniques' then raise exception 'ÉCHEC — seul classé, c''est « unique », obtenu %', c; end if;

  raise notice 'OK   — manquant, faible, fort, unique : quatre comparaisons, plus quatre listes à tenir';
end $$;

-- Un concurrent sans données n'est pas un concurrent absent.
insert into public.gap_competitor (id, tool_run_id, domain, name, no_data, position)
values ('b2000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001',
        'renotoit-longueuil.ca', 'Réno-Toit Longueuil', true, 3);

insert into public.gap_position (row_id, competitor_id, position)
values ('b3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000003', 2);

do $$
declare c text;
begin
  select category into c from public.gap_row_category where row_id = 'b3000000-0000-0000-0000-000000000004';
  if c <> 'uniques' then
    raise exception 'ÉCHEC — un concurrent sans données a changé la catégorie (%)', c;
  end if;
  raise notice 'OK   — ne pas savoir n''est pas être absent : le concurrent sans données ne compte pas';
end $$;


\echo ''
\echo '--- La longueur d''une requête se compte ---'

insert into public.keyword_suggestion (tool_run_id, query, theme, search_volume, difficulty, intent, trend, is_question)
values ('b1000000-0000-0000-0000-000000000004',
        'combien de temps pour refaire une toiture',
        'Questions fréquentes sur la toiture', 320, 22, 'informationnelle', 'stable', true);

do $$
declare n smallint;
begin
  select word_count into n from public.keyword_suggestion
   where query = 'combien de temps pour refaire une toiture';
  if n <> 7 then
    raise exception 'ÉCHEC — 7 mots attendus, obtenu %', n;
  end if;
  raise notice 'OK   — « words: 7 » se compte sur la requête';
end $$;


\echo ''
\echo '--- La courbe du domaine : quatre tranches qui font le compte ---'

insert into public.domain_reading
  (agency_id, client_id, measured_on, organic_traffic, keyword_count, authority,
   referring_domains, bucket_top3, bucket_top10, bucket_top30, bucket_beyond)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   '2026-08-01', 3350, 181, 33, 208, 7, 32, 60, 82),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   '2026-09-01', 3400, 187, 34, 214, 8, 34, 61, 84);

do $$
declare t integer; prec integer;
begin
  select organic_traffic, organic_traffic_previous into t, prec
  from public.domain_reading_delta
  where client_id = 'cccccccc-0000-0000-0000-000000000001' and measured_on = '2026-09-01';

  if t <> 3400 or prec <> 3350 then
    raise exception 'ÉCHEC — attendu 3400 (précédemment 3350), obtenu % (%)', t, prec;
  end if;
  raise notice 'OK   — « trafficPrev » se lit dans la série';
end $$;

do $$
begin
  begin
    insert into public.domain_reading
      (agency_id, client_id, measured_on, keyword_count,
       bucket_top3, bucket_top10, bucket_top30, bucket_beyond)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            '2026-10-01', 187, 8, 34, 61, 99);
    raise exception 'ÉCHEC — des tranches qui ne font pas le total ont été acceptées';
  exception when check_violation then
    raise notice 'OK   — les quatre tranches de position doivent faire le nombre de mots-clés';
  end;

  begin
    insert into public.domain_reading (agency_id, client_id, measured_on, organic_traffic)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            '2026-10-15', 3500);
    raise exception 'ÉCHEC — un relevé en milieu de mois a été accepté';
  exception when check_violation then
    raise notice 'OK   — un point de la courbe est un mois, pas une date quelconque';
  end;
end $$;


\echo ''
\echo '--- Un audit de prospect envoyé ne se réécrit pas ---'

insert into public.prospect_audit
  (id, agency_id, client_id, token, source_tool, potential_gain, ctr_multiplier, payload)
values ('b4000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-0000000000a1',
        'ap-9c2e-spanordik', 'organic_research', 202, 2.4,
        '{"drop": {"date": "2 juin 2025", "avant": 2900, "apres": 950}}');

do $$
begin
  begin
    update public.prospect_audit set potential_gain = 400
     where id = 'b4000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un audit de prospect publié a pu être modifié';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — ce que le prospect a reçu ne bouge plus  (%)', left(sqlerrm, 48);
  end;
end $$;

do $$
begin
  begin
    insert into public.prospect_audit
      (agency_id, client_id, token, source_tool, potential_gain, payload)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'cccccccc-0000-0000-0000-0000000000a1',
            'ap-sans-methode', 'organic_research', 900, '{}');
    raise exception 'ÉCHEC — un gain estimé sans sa méthode a été accepté';
  exception when check_violation then
    raise notice 'OK   — un gain chiffré porte le multiplicateur qui l''a produit';
  end;
end $$;


\echo ''
\echo '--- Perdre un deal purge l''instantané du prospect (règle 3) ---'

insert into public.deal (id, agency_id, client_id, stage)
values ('b5000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-0000000000a1', 'qualifie');

insert into public.deal_seo_snapshot (deal_id, domain, authority, keywords, monthly_visits, top10)
values ('b5000000-0000-0000-0000-000000000001', 'spanordik.ca', 18, 64, 1280, 3);

do $$
declare n integer; ni integer;
begin
  update public.deal
     set stage = 'perdu', lost_at = now(), lost_reason = 'Budget reporté à l''an prochain'
   where id = 'b5000000-0000-0000-0000-000000000001';

  select count(*) into n from public.deal_seo_snapshot
   where deal_id = 'b5000000-0000-0000-0000-000000000001';
  select count(*) into ni from public.tool_run
   where client_id = 'cccccccc-0000-0000-0000-0000000000a1'
     and retention = 'instantane';

  if n <> 0 then raise exception 'ÉCHEC — l''instantané du prospect survit à la perte du deal'; end if;
  if ni <> 0 then raise exception 'ÉCHEC — % appel(s) instantané(s) du prospect ont survécu', ni; end if;

  raise notice 'OK   — le deal perdu emporte l''instantané et les appels du prospect';
end $$;


\echo ''
\echo '--- La dilution des séries n''est plus un vœu de document ---'

-- Quatorze relevés quotidiens vieux de plus de 90 jours : au-delà du détail
-- quotidien, la règle 3 ne garde qu'un relevé par semaine.
insert into public.tracked_keyword (id, agency_id, client_id, query)
values ('b6000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'toiture ancienne série');

insert into public.keyword_reading (agency_id, keyword_id, measured_on, position)
select 'aaaaaaaa-0000-0000-0000-000000000001', 'b6000000-0000-0000-0000-000000000001',
       current_date - 120 + i, 10 + i
from generate_series(0, 13) i;

-- Un relevé récent, qui doit survivre intact.
insert into public.keyword_reading (agency_id, keyword_id, measured_on, position)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'b6000000-0000-0000-0000-000000000001',
        current_date - 3, 6);

-- Un cache périmé d'hier.
insert into public.tool_run (id, agency_id, client_id, tool)
values ('b7000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'keyword_hunter');
update public.tool_run set expires_on = current_date - 1
 where id = 'b7000000-0000-0000-0000-000000000001';

do $$
declare semaines integer; restants integer; recent integer; cache integer;
begin
  select count(distinct date_trunc('week', measured_on)) into semaines
  from public.keyword_reading
  where keyword_id = 'b6000000-0000-0000-0000-000000000001'
    and measured_on < current_date - 90;

  perform app.purge_expired_data();

  select count(*) into restants from public.keyword_reading
   where keyword_id = 'b6000000-0000-0000-0000-000000000001'
     and measured_on < current_date - 90;
  select count(*) into recent from public.keyword_reading
   where keyword_id = 'b6000000-0000-0000-0000-000000000001'
     and measured_on >= current_date - 90;
  select count(*) into cache from public.tool_run
   where id = 'b7000000-0000-0000-0000-000000000001';

  if restants <> semaines then
    raise exception 'ÉCHEC — % semaines couvertes, il devrait rester % relevés, il en reste %',
      semaines, semaines, restants;
  end if;
  if recent <> 1 then
    raise exception 'ÉCHEC — le relevé récent devrait être intact, il en reste %', recent;
  end if;
  if cache <> 0 then
    raise exception 'ÉCHEC — le cache périmé d''hier est toujours là';
  end if;

  raise notice 'OK   — 14 relevés quotidiens dilués à % hebdomadaires, le récent intact, le cache purgé', semaines;
end $$;


\echo ''
\echo '--- La consommation se compte, elle ne se saisit pas ---'

do $$
declare cr bigint;
begin
  select credits into cr from public.credit_usage_by_client
   where client_id = 'cccccccc-0000-0000-0000-000000000001'
     and month = date_trunc('month', now())::date;

  -- 26 (keyword_gap) + 6 (domain_overview) + 0 + 0 : les appels sans crédit
  -- déclaré comptent pour zéro, pas pour rien.
  if cr <> 32 then
    raise exception 'ÉCHEC — 32 crédits attendus sur le compte ce mois-ci, obtenu %', cr;
  end if;
  raise notice 'OK   — « Quota.used » est une somme d''appels, ventilée par compte';
end $$;


\echo ''
\echo '--- Cloisonnement ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer; g integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.tool_run;
  select count(*) into g from public.gap_row_category;
  if n <> 0 or g <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % appel(s) et % ligne(s) d''écart', n, g;
  end if;
  raise notice 'OK   — l''agence rivale ne voit ni les appels ni leurs résultats';
end $$;


\echo ''
\echo 'Tous les tests de conservation sont passés.'
