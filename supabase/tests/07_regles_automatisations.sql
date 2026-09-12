-- =============================================================================
-- Vérification du contenu, des automatisations et de l'agenda (migration 0011)
-- =============================================================================
-- Trois choses que le code portait dans des constantes d'interface et qui
-- descendent ici : la compatibilité condition/déclencheur, le seuil d'échecs
-- au-delà duquel une règle s'arrête, et le fait qu'un événement d'agenda
-- pointe vers quelque chose de réel.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


\echo ''
\echo '--- Une condition qui ne parle pas du déclencheur est refusée ---'

insert into public.automation
  (id, agency_id, slug, name, description, category, status, trigger, trigger_params, action, action_params)
values
  ('d1000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'alerte-chute-position', 'Alerte chute de position',
   'Surveille les mots-clés stratégiques en temps réel',
   'surveillance', 'active', 'position', '{"places": 5}', 'tache',
   '{"assignee": "Marie Chen", "effort": 2}');

-- « Au-delà d'un volume de recherche » a du sens sur un déclencheur de
-- position ; « sur certaines dimensions » n'en a aucun.
insert into public.automation_condition (automation_id, kind, value)
values ('d1000000-0000-0000-0000-000000000001', 'volume', '500');

insert into public.automation_condition (automation_id, kind, value)
values ('d1000000-0000-0000-0000-000000000001', 'semaine', 'true');

do $$
begin
  begin
    insert into public.automation_condition (automation_id, kind, value)
    values ('d1000000-0000-0000-0000-000000000001', 'dim', '["SEO"]');
    raise exception 'ÉCHEC — une condition de dimension a été posée sur un déclencheur de position';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — la condition refusée dit pourquoi : « % »', left(sqlerrm, 72);
  end;
end $$;


\echo ''
\echo '--- Changer de déclencheur emporte les conditions devenues fausses ---'

do $$
declare reste text;
begin
  update public.automation set trigger = 'facture', trigger_params = '{"jours": 10}'
   where id = 'd1000000-0000-0000-0000-000000000001';

  select string_agg(kind::text, ', ' order by kind::text) into reste
  from public.automation_condition
  where automation_id = 'd1000000-0000-0000-0000-000000000001';

  -- « volume » ne parle que des positions : elle ne survit pas.
  -- « semaine » est universelle : elle reste.
  if reste is distinct from 'semaine' then
    raise exception 'ÉCHEC — après changement de déclencheur il devrait rester « semaine », il reste « % »', reste;
  end if;
  raise notice 'OK   — la condition de volume disparaît avec son déclencheur, la condition universelle reste';
end $$;


\echo ''
\echo '--- Trois échecs d''affilée arrêtent la règle ---'

insert into public.automation
  (id, agency_id, slug, name, category, status, trigger, action)
values ('d1000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
        'rapport-mensuel', 'Rapport mensuel automatique', 'rapports', 'active',
        'date', 'rapport');

do $$
declare st public.automation_status;
begin
  insert into public.automation_run (agency_id, automation_id, ran_at, outcome, detail)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002',
          now() - interval '5 days', 'echec', 'Jeton Search Console expiré'),
         ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002',
          now() - interval '4 days', 'echec', 'Jeton Search Console expiré');

  select status into st from public.automation where id = 'd1000000-0000-0000-0000-000000000002';
  if st <> 'active' then
    raise exception 'ÉCHEC — deux échecs ne devraient pas suffire à arrêter la règle (%)', st;
  end if;

  insert into public.automation_run (agency_id, automation_id, ran_at, outcome, detail)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002',
          now() - interval '3 days', 'echec', 'Jeton Search Console expiré');

  select status into st from public.automation where id = 'd1000000-0000-0000-0000-000000000002';
  if st <> 'echec' then
    raise exception 'ÉCHEC — trois échecs d''affilée devraient arrêter la règle, elle est « % »', st;
  end if;

  raise notice 'OK   — « FAIL_MAX » n''est plus une constante d''écran : la règle s''arrête d''elle-même';
end $$;

-- Une réussite au milieu casse la série : ce sont les échecs *consécutifs*
-- qui comptent, pas le total.
insert into public.automation
  (id, agency_id, slug, name, category, status, trigger, action)
values ('d1000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
        'veille-avis', 'Veille des avis', 'surveillance', 'active', 'avis', 'notifier');

do $$
declare st public.automation_status;
begin
  insert into public.automation_run (agency_id, automation_id, ran_at, outcome, detail)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003',
          now() - interval '5 days', 'echec', 'Fournisseur injoignable'),
         ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003',
          now() - interval '4 days', 'echec', 'Fournisseur injoignable'),
         ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003',
          now() - interval '3 days', 'succes', null),
         ('aaaaaaaa-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003',
          now() - interval '2 days', 'echec', 'Fournisseur injoignable');

  select status into st from public.automation where id = 'd1000000-0000-0000-0000-000000000003';
  if st <> 'active' then
    raise exception 'ÉCHEC — trois échecs non consécutifs ont arrêté la règle (%)', st;
  end if;
  raise notice 'OK   — ce sont les échecs consécutifs qui comptent, pas le total';
end $$;

do $$
begin
  begin
    insert into public.automation_run (agency_id, automation_id, outcome)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'd1000000-0000-0000-0000-000000000003', 'echec');
    raise exception 'ÉCHEC — un échec sans explication a été accepté';
  exception when check_violation then
    raise notice 'OK   — une exécution qui échoue dit pourquoi';
  end;
end $$;


\echo ''
\echo '--- « 24 exécutions, 100 % de réussite » se comptent ---'

do $$
declare n bigint; pct numeric; dernier timestamptz;
begin
  select runs, success_pct, last_run_at into n, pct, dernier
  from public.automation_health where automation_id = 'd1000000-0000-0000-0000-000000000003';

  if n <> 4 then raise exception 'ÉCHEC — 4 exécutions attendues, obtenu %', n; end if;
  if pct <> 25 then raise exception 'ÉCHEC — 25 %% de réussite attendus, obtenu %', pct; end if;
  if dernier is null then raise exception 'ÉCHEC — « dernière exécution » devrait être datée'; end if;

  raise notice 'OK   — 4 exécutions, 25 %% de réussite, dernière datée : trois chiffres déduits du journal';
end $$;


\echo ''
\echo '--- Un contenu publié a une adresse ; un contenu assigné a un rédacteur ---'

insert into public.content_item
  (id, agency_id, client_id, slug, title, state, target_keyword, search_volume, due_on, writer_id)
values ('d2000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-000000000001', 'a-105',
        'Structurer les URL d''une fiche produit pour le SEO', 'assigne',
        'structure url fiche produit seo', 610, current_date - 5,
        'bbbbbbbb-0000-0000-0000-000000000001');

do $$
begin
  begin
    insert into public.content_item (agency_id, client_id, slug, title, state)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'a-106', 'Article sans adresse', 'publie');
    raise exception 'ÉCHEC — un contenu publié sans adresse a été accepté';
  exception when check_violation then
    raise notice 'OK   — « publié » veut dire qu''il y a une page et une date';
  end;

  begin
    insert into public.content_item (agency_id, client_id, slug, title, state)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'a-107', 'Article sans rédacteur', 'redaction');
    raise exception 'ÉCHEC — un contenu en rédaction sans rédacteur a été accepté';
  exception when check_violation then
    raise notice 'OK   — « en rédaction » veut dire que quelqu''un le rédige';
  end;
end $$;


\echo ''
\echo '--- Le retard et la mesure précédente se lisent ---'

insert into public.content_performance (agency_id, content_id, measured_on, visits, position)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001',
        current_date - 30, 120, 18),
       ('aaaaaaaa-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001',
        current_date, 340, 9);

do $$
declare r record;
begin
  select late, position, position_previous, visits into r
  from public.content_item_status where content_id = 'd2000000-0000-0000-0000-000000000001';

  if not r.late then
    raise exception 'ÉCHEC — une échéance dépassée sur un contenu non publié, c''est un retard';
  end if;
  if r.position <> 9 or r.position_previous <> 18 then
    raise exception 'ÉCHEC — attendu 9ᵉ (précédemment 18ᵉ), obtenu %ᵉ (%ᵉ)', r.position, r.position_previous;
  end if;
  raise notice 'OK   — retard et position précédente déduits, jamais saisis';
end $$;


\echo ''
\echo '--- Une longueur cible sans justification est refusée ---'

do $$
begin
  begin
    insert into public.content_brief (content_id, agency_id, target_length)
    values ('d2000000-0000-0000-0000-000000000001',
            'aaaaaaaa-0000-0000-0000-000000000001', '1 400 mots');
    raise exception 'ÉCHEC — une longueur cible sans justification a été acceptée';
  exception when check_violation then
    raise notice 'OK   — un chiffre de longueur porte la raison qui l''explique';
  end;
end $$;

insert into public.content_brief
  (content_id, agency_id, intent, intent_text, intent_proof, difficulty,
   target_length, length_why, tone, proof_draft)
values ('d2000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'informationnelle',
        'La personne veut comprendre comment structurer ses URL.',
        'Les huit premiers résultats sont des guides, aucun n''est une page produit.',
        37, '1 400 mots',
        'Moyenne des quatre premiers résultats : 1 320 mots.',
        'Pédagogique, sans jargon', 'Brouillon de preuve à relire.');

do $$
begin
  begin
    insert into public.brief_outline_row (content_id, position, level, title)
    values ('d2000000-0000-0000-0000-000000000001', 1, 1, 'Titre principal');
    raise exception 'ÉCHEC — un H1 a été accepté dans le plan';
  exception when check_violation then
    raise notice 'OK   — un plan d''article n''a que des H2 et des H3 : le H1, c''est le titre';
  end;
end $$;


\echo ''
\echo '--- Un événement d''agenda pointe vers quelque chose de réel ---'

insert into public.task (id, agency_id, client_id, slug, ref, title)
values ('d3000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-000000000001', '301', '#301', 'Corriger les URL des fiches produit');

insert into public.agenda_event
  (agency_id, client_id, type, title, occurs_on, task_id)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'echeance', 'Corriger les URL des fiches produit', current_date + 2,
        'd3000000-0000-0000-0000-000000000001');

do $$
begin
  begin
    insert into public.agenda_event (agency_id, client_id, type, title, occurs_on)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'echeance', 'Échéance qui n''ouvre rien', current_date + 3);
    raise exception 'ÉCHEC — une échéance sans tâche a été acceptée';
  exception when check_violation then
    raise notice 'OK   — « Ouvrir la tâche » n''est proposé que s''il y a une tâche';
  end;

  begin
    insert into public.agenda_event
      (agency_id, client_id, type, title, occurs_on, task_id, automation_id)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'echeance', 'Échéance qui ouvre deux choses', current_date + 3,
            'd3000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001');
    raise exception 'ÉCHEC — un événement pointant deux objets a été accepté';
  exception when check_violation then
    raise notice 'OK   — un événement ouvre une chose, pas deux';
  end;

  begin
    insert into public.agenda_event
      (agency_id, client_id, type, title, occurs_on, automation_id, done)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'exec', 'Exécution planifiée cochée', current_date + 3,
            'd1000000-0000-0000-0000-000000000001', true);
    raise exception 'ÉCHEC — une exécution planifiée a pu être cochée « faite »';
  exception when check_violation then
    raise notice 'OK   — seule une échéance se coche ; on ne coche pas une exécution planifiée';
  end;
end $$;


\echo ''
\echo '--- Une notification qui ne mène nulle part ne le propose pas ---'

insert into public.notification
  (agency_id, recipient_id, client_id, kind, title, body, cta_label, href)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-000000000001', 'sante',
        'Score de santé d''Acme Corp. passé à 61',
        'Sous le seuil d''alerte de 70.', 'Ouvrir la fiche client', '/clients/acme-corp');

-- Une notification pour toute l'agence : pas de destinataire nommé.
insert into public.notification (agency_id, kind, title, body)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'deal',
        'Deal gagné — Spa Nordik Estrie', '14 400 $ par an, forfait Croissance.');

do $$
begin
  begin
    insert into public.notification (agency_id, kind, title, cta_label)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'rapport',
            'Rapport prêt', 'Ouvrir le rapport');
    raise exception 'ÉCHEC — un appel à l''action sans destination a été accepté';
  exception when check_violation then
    raise notice 'OK   — un bouton sans destination ne se propose pas';
  end;

  begin
    insert into public.notification (agency_id, kind, title, cta_label, href, stale_reason)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'rapport',
            'Rapport de juillet supprimé', 'Ouvrir le rapport', '/rapport/juillet',
            'Le brouillon a été supprimé.');
    raise exception 'ÉCHEC — une notification périmée a gardé son lien';
  exception when check_violation then
    raise notice 'OK   — quand l''objet n''existe plus, le lien disparaît avec lui';
  end;
end $$;


\echo ''
\echo '--- Chacun ne lit que ses notifications, et celles de l''agence ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  select count(*) into n from public.notification;
  -- La sienne, plus celle adressée à toute l'agence.
  if n <> 2 then
    raise exception 'ÉCHEC — Marie devrait voir 2 notifications, elle en voit %', n;
  end if;
  raise notice 'OK   — la sienne et celle de l''agence, pas celles des autres';
end $$;

do $$
declare n integer; a integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.notification;
  select count(*) into a from public.automation_health;
  if n <> 0 or a <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % notification(s) et % règle(s)', n, a;
  end if;
  raise notice 'OK   — l''agence rivale ne voit ni les notifications ni les automatisations';
end $$;


\echo ''
\echo 'Tous les tests du contenu et des automatisations sont passés.'
