-- =============================================================================
-- Vérification du document généré (migration 0024)
-- =============================================================================
-- Une proposition est un devis d'une sorte donnée, sur un modèle de la même
-- sorte. Ses lignes ont une nature et une récurrence, ses taux se figent à
-- l'envoi, son corps rendu ne bouge plus, et le client l'accepte par un lien.
-- Envoyer demande le droit et les numéros de taxes.
--
-- À lancer après 16_regles_corps_modeles.sql, sur la même base.
-- =============================================================================

\set ON_ERROR_STOP on
\set QUIET on

\echo ''
\echo '=== 17. Le document généré ==='

-- Un modèle de proposition, à côté des modèles de devis et de facture du test 09.
insert into public.document_template
  (id, agency_id, kind, name, is_default, prefix, include_year, number_padding, payment_terms_days)
values
  ('f7000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'proposition', 'Proposition de services', true, 'PR', true, 3, 15);


\echo ''
\echo '--- Une proposition sur un modèle de sa sorte ---'

do $$
begin
  begin
    insert into public.quote (id, agency_id, client_id, ref, subject, kind, template_id)
    values ('f8000000-0000-0000-0000-000000000009', 'aaaaaaaa-0000-0000-0000-000000000001',
            'cccccccc-0000-0000-0000-000000000001', 'PR-TEST-009', 'Mauvais modèle', 'proposition',
            'f5000000-0000-0000-0000-000000000001');
    raise exception 'ÉCHEC — une proposition a pris un modèle de devis';
  exception when check_violation then
    raise notice 'OK   — une proposition refuse un modèle de devis';
  end;
end $$;

insert into public.quote
  (id, agency_id, client_id, contact_id, ref, subject, kind, template_id, payment_terms_days)
values
  ('f8000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001',
   'PR-TEST-001', 'Refonte du site', 'proposition', 'f7000000-0000-0000-0000-000000000001', 15);

do $$
declare k text;
begin
  select kind::text into k from public.quote where id = 'f8000000-0000-0000-0000-000000000001';
  if k <> 'proposition' then raise exception 'ÉCHEC — sorte attendue proposition, obtenu %', k; end if;
  raise notice 'OK   — une proposition est un devis de sorte « proposition », sur son modèle';
end $$;


\echo ''
\echo '--- Les lignes ont une nature et une récurrence ; deux sous-totaux ---'

insert into public.quote_line (quote_id, position, description, quantity, unit_price_cents, kind, billing) values
  ('f8000000-0000-0000-0000-000000000001', 1, 'Forfait Croissance Digitale', 1, 900000, 'facturable', 'ponctuel'),
  ('f8000000-0000-0000-0000-000000000001', 2, 'Séance photo produit', 1, 0, 'offert', 'ponctuel'),
  ('f8000000-0000-0000-0000-000000000001', 3, 'Escompte de bienvenue', 1, -50000, 'remise', 'ponctuel'),
  ('f8000000-0000-0000-0000-000000000001', 4, 'Budget média Meta (payé à Meta)', 1, 180000, 'informatif', 'mensuel'),
  ('f8000000-0000-0000-0000-000000000001', 5, 'Maintenance Croissance', 1, 45000, 'facturable', 'mensuel');

do $$
declare t record;
begin
  select * into t from public.quote_total where quote_id = 'f8000000-0000-0000-0000-000000000001';
  -- 9 000 − 500 + 450 = 8 950 $ ; l'offert et l'informatif n'y sont pas.
  if t.subtotal_cents <> 895000 then raise exception 'ÉCHEC — sous-total attendu 8 950 $, obtenu % $', t.subtotal_cents / 100.0; end if;
  if t.ponctuel_cents <> 850000 then raise exception 'ÉCHEC — ponctuel attendu 8 500 $, obtenu % $', t.ponctuel_cents / 100.0; end if;
  if t.recurrent_cents <> 45000 then raise exception 'ÉCHEC — récurrent attendu 450 $, obtenu % $', t.recurrent_cents / 100.0; end if;
  if t.tps_cents <> 44750 or t.tvq_cents <> 89276 then
    raise exception 'ÉCHEC — taxes attendues 447,50 $ et 892,76 $, obtenu % $ et % $', t.tps_cents / 100.0, t.tvq_cents / 100.0;
  end if;
  if t.total_cents <> 1029026 then raise exception 'ÉCHEC — total attendu 10 290,26 $, obtenu % $', t.total_cents / 100.0; end if;
  raise notice 'OK   — sous-total % $ (ponctuel % $, récurrent % $) : l''offert et l''informatif restent hors totaux, la remise se soustrait',
    t.subtotal_cents / 100.0, t.ponctuel_cents / 100.0, t.recurrent_cents / 100.0;
end $$;

do $$
begin
  begin
    insert into public.quote_line (quote_id, position, description, quantity, unit_price_cents, kind)
    values ('f8000000-0000-0000-0000-000000000001', 9, 'Bonus payant', 1, 100, 'offert');
    raise exception 'ÉCHEC — une ligne offerte avec un prix a été acceptée';
  exception when check_violation then
    raise notice 'OK   — une ligne offerte est à zéro, un prix négatif n''existe que pour une remise';
  end;
end $$;


\echo ''
\echo '--- Les taux se figent sur le document ---'

do $$
declare tot bigint;
begin
  update public.quote set tps_rate = 0, tvq_rate = 0 where id = 'f8000000-0000-0000-0000-000000000001';
  select total_cents into tot from public.quote_total where quote_id = 'f8000000-0000-0000-0000-000000000001';
  if tot <> 895000 then raise exception 'ÉCHEC — avec des taux figés à zéro, total attendu 8 950 $, obtenu % $', tot / 100.0; end if;
  update public.quote set tps_rate = null, tvq_rate = null where id = 'f8000000-0000-0000-0000-000000000001';
  select total_cents into tot from public.quote_total where quote_id = 'f8000000-0000-0000-0000-000000000001';
  if tot <> 1029026 then raise exception 'ÉCHEC — sans taux figés, les réglages de l''agence reprennent (obtenu % $)', tot / 100.0; end if;
  raise notice 'OK   — les taux du document priment sur ceux de l''agence ; sans eux, l''agence reprend';
end $$;


\echo ''
\echo '--- Les sections appartiennent au document ---'

insert into public.document_section (quote_id, key, title, position, body, optional) values
  ('f8000000-0000-0000-0000-000000000001', 'besoins', 'Vos besoins', 1, '<p>Le client veut…</p>', false),
  ('f8000000-0000-0000-0000-000000000001', 'preuve', 'Preuve et résultats', 2, null, true);

do $$
begin
  begin
    insert into public.document_section (quote_id, key, title, position)
    values ('f8000000-0000-0000-0000-000000000001', 'besoins', 'Doublon', 3);
    raise exception 'ÉCHEC — deux sections avec la même clé';
  exception when unique_violation then
    raise notice 'OK   — une clé de section est unique dans son document';
  end;
  begin
    insert into public.document_section (quote_id, key, title, position)
    values ('f8000000-0000-0000-0000-000000000001', 'Mauvaise Clé', 'Clé illisible', 4);
    raise exception 'ÉCHEC — une clé avec majuscules et espace';
  exception when check_violation then
    raise notice 'OK   — une clé de section est en minuscules, sans espace';
  end;
end $$;


\echo ''
\echo '--- Envoyer demande le droit, et les numéros de taxes ---'

update public.agency set gst_number = null, qst_number = null
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur
  update public.quote
     set status = 'envoye', sent_at = now(), issued_on = current_date, tps_rate = 0.05, tvq_rate = 0.09975,
         rendered_html = '<p>rendu</p>', access_token = 'jeton-de-test-proposition-000001'
   where id = 'f8000000-0000-0000-0000-000000000001';
  raise exception 'ÉCHEC — le rédacteur a envoyé une proposition';
exception
  when insufficient_privilege then
    raise notice 'OK   — sans « Envoyer des documents », l''envoi est refusé';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — sans « Envoyer des documents », l''envoi est refusé  (%)', left(sqlerrm, 50);
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin
  update public.quote
     set status = 'envoye', sent_at = now(), issued_on = current_date, tps_rate = 0.05, tvq_rate = 0.09975,
         rendered_html = '<p>rendu</p>', access_token = 'jeton-de-test-proposition-000001'
   where id = 'f8000000-0000-0000-0000-000000000001';
  raise exception 'ÉCHEC — une proposition est partie sans numéros de taxes';
exception
  when check_violation then
    raise notice 'OK   — sans TPS ni TVQ sur l''agence, rien ne part : %', left(sqlerrm, 60);
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise;
end $$;

update public.agency set gst_number = '123456789 RT0001', qst_number = '1234567890 TQ0001'
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';

do $$
declare st text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin
  update public.quote
     set status = 'envoye', sent_at = now(), issued_on = current_date, expires_on = current_date + 30,
         tps_rate = 0.05, tvq_rate = 0.09975,
         rendered_html = '<p>rendu</p>', access_token = 'jeton-de-test-proposition-000001'
   where id = 'f8000000-0000-0000-0000-000000000001';
  insert into public.quote_version (quote_id, version, note, content)
  values ('f8000000-0000-0000-0000-000000000001', 1, 'Envoyée', '{"rendered_html": "<p>rendu</p>"}');
  insert into public.document_event (agency_id, quote_id, kind, member_id, version)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'f8000000-0000-0000-0000-000000000001', 'envoye',
          'bbbbbbbb-0000-0000-0000-000000000001', 1);
  select status::text into st from public.quote where id = 'f8000000-0000-0000-0000-000000000001';
  if st <> 'envoye' then raise exception 'ÉCHEC — statut attendu envoye, obtenu %', st; end if;
  raise notice 'OK   — avec le droit et les numéros, la proposition part : taux, corps et jeton posés';
end $$;


\echo ''
\echo '--- Un document parti ne se réécrit pas ---'

do $$
begin
  begin
    insert into public.quote_line (quote_id, position, description, quantity, unit_price_cents)
    values ('f8000000-0000-0000-0000-000000000001', 6, 'Ligne ajoutée après coup', 1, 100);
    raise exception 'ÉCHEC — une ligne ajoutée à une proposition envoyée';
  exception when check_violation then
    raise notice 'OK   — %', left(sqlerrm, 76);
  end;
  begin
    update public.document_section set body = '<p>réécrit</p>'
     where quote_id = 'f8000000-0000-0000-0000-000000000001' and key = 'besoins';
    raise exception 'ÉCHEC — une section réécrite après l''envoi';
  exception when check_violation then
    raise notice 'OK   — les sections aussi sont gelées';
  end;
  begin
    update public.quote set rendered_html = '<p>autre</p>' where id = 'f8000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — le corps rendu a changé après l''envoi';
  exception when check_violation then
    raise notice 'OK   — le corps rendu ne change pas : ce que le client a reçu ne bouge plus';
  end;
end $$;


\echo ''
\echo '--- Le lien du client : lire, puis accepter ---'

do $$
declare r record; n integer;
begin
  set local role anon;
  select * into r from public.document_by_token('jeton-de-test-proposition-000001');
  if r.ref is distinct from 'PR-TEST-001' or r.rendered_html is distinct from '<p>rendu</p>' or not r.can_decide then
    raise exception 'ÉCHEC — le lien ne rend pas le document envoyé (ref %, décision %)', r.ref, r.can_decide;
  end if;
  if r.total_cents <> 1029026 then raise exception 'ÉCHEC — le total du lien : % $', r.total_cents / 100.0; end if;
  perform public.document_by_token('jeton-de-test-proposition-000001');
  reset role;
  select count(*) into n from public.document_event
   where quote_id = 'f8000000-0000-0000-0000-000000000001' and kind = 'ouvert';
  if n <> 1 then raise exception 'ÉCHEC — la première ouverture devrait se noter une fois (% fois)', n; end if;
  raise notice 'OK   — sans compte, le lien rend le document rendu, son total, et note la première ouverture';
end $$;

do $$
declare r record;
begin
  set local role anon;
  select * into r from public.document_by_token('jeton-inconnu-0000000000000000');
  if r.ref is not null then raise exception 'ÉCHEC — un jeton inconnu a rendu quelque chose'; end if;
  reset role;
  raise notice 'OK   — un jeton inconnu ne rend rien';
end $$;

do $$
declare out text; st text; n integer; s record;
begin
  set local role anon;
  out := public.decide_document_by_token('jeton-de-test-proposition-000001', true, 'Sophie Tremblay', null, '203.0.113.7', 'Test');
  reset role;
  if out <> 'accepte' then raise exception 'ÉCHEC — réponse attendue accepte, obtenu %', out; end if;
  select status::text into st from public.quote where id = 'f8000000-0000-0000-0000-000000000001';
  if st <> 'accepte' then raise exception 'ÉCHEC — statut attendu accepte, obtenu %', st; end if;
  select * into s from public.document_signature where quote_id = 'f8000000-0000-0000-0000-000000000001';
  if s.typed_name <> 'Sophie Tremblay' or s.ip <> '203.0.113.7' or s.contact_id <> 'dddddddd-0000-0000-0000-000000000001'
     or s.rendered_html_sha256 <> encode(sha256(convert_to('<p>rendu</p>', 'UTF8')), 'hex') then
    raise exception 'ÉCHEC — la signature ne porte pas le nom, l''adresse, le contact et l''empreinte';
  end if;
  select count(*) into n from public.document_event
   where quote_id = 'f8000000-0000-0000-0000-000000000001' and kind = 'accepte';
  if n <> 1 then raise exception 'ÉCHEC — l''acceptation devrait laisser un événement'; end if;
  raise notice 'OK   — accepter par le lien signe (nom, date, adresse, empreinte du rendu) et passe le statut';
end $$;

do $$
begin
  set local role anon;
  perform public.decide_document_by_token('jeton-de-test-proposition-000001', false, null, 'Trop cher', null, null);
  raise exception 'ÉCHEC — un document accepté a été refusé ensuite';
exception
  when check_violation then
    raise notice 'OK   — un document déjà accepté ne se refuse plus';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise;
end $$;


\echo ''
\echo '--- Corriger ramène au brouillon, et le devis redevient modifiable ---'

insert into public.quote
  (id, agency_id, client_id, ref, subject, kind, template_id, status, issued_on, sent_at,
   tps_rate, tvq_rate, rendered_html, access_token)
values
  ('f8000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'DV-TEST-002', 'Section carrières', 'devis',
   'f5000000-0000-0000-0000-000000000001', 'envoye', current_date, now(),
   0.05, 0.09975, '<p>v1</p>', 'jeton-de-test-devis-000000000002');

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin
  update public.quote set status = 'brouillon' where id = 'f8000000-0000-0000-0000-000000000002';
  insert into public.quote_line (quote_id, position, description, quantity, unit_price_cents)
  values ('f8000000-0000-0000-0000-000000000002', 1, 'Conception de la section', 1, 145000);
  raise notice 'OK   — la correction rouvre le brouillon : les lignes se modifient de nouveau';
end $$;


\echo ''
\echo '--- Une facture s''envoie avec « Facturer » ---'

insert into public.invoice
  (id, agency_id, client_id, template_id, ref, period_month, issued_on, due_on, status)
values ('f6000000-0000-0000-0000-000000000017',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'f5000000-0000-0000-0000-000000000002', 'FA-TEST-0002',
        '2026-10-01', '2026-10-01', '2026-10-31', 'en_attente');

do $$
declare t timestamptz;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur
  -- Les politiques de 0016 réservent déjà l'écriture d'une facture à « Facturer » :
  -- l'ordre ne touche aucune ligne. Le déclencheur de 0024 double la garde.
  update public.invoice set sent_at = now(), tps_rate = 0.05, tvq_rate = 0.09975, rendered_html = '<p>f</p>'
   where id = 'f6000000-0000-0000-0000-000000000017';
  select sent_at into t from public.invoice where id = 'f6000000-0000-0000-0000-000000000017';
  if t is not null then raise exception 'ÉCHEC — le rédacteur a envoyé une facture'; end if;
  raise notice 'OK   — sans « Facturer », une facture ne part pas';
end $$;

do $$
declare t timestamptz;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin
  update public.invoice set sent_at = now(), tps_rate = 0.05, tvq_rate = 0.09975, rendered_html = '<p>f</p>',
         access_token = 'jeton-de-test-facture-00000000002'
   where id = 'f6000000-0000-0000-0000-000000000017';
  select sent_at into t from public.invoice where id = 'f6000000-0000-0000-0000-000000000017';
  if t is null then raise exception 'ÉCHEC — la facture n''est pas partie'; end if;
  raise notice 'OK   — avec « Facturer », la facture part, taux et corps figés';
end $$;


\echo ''
\echo '--- Rien ne franchit la frontière de l''agence ---'

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';   -- la rivale
  select count(*) into n from public.quote where id::text like 'f8000000-%';
  if n <> 0 then raise exception 'ÉCHEC — la rivale voit % devis', n; end if;
  select count(*) into n from public.document_section;
  if n <> 0 then raise exception 'ÉCHEC — la rivale voit % sections', n; end if;
  select count(*) into n from public.document_event;
  if n <> 0 then raise exception 'ÉCHEC — la rivale voit % événements', n; end if;
  select count(*) into n from public.document_signature;
  if n <> 0 then raise exception 'ÉCHEC — la rivale voit % signatures', n; end if;
  raise notice 'OK   — ni les documents, ni leurs sections, leur journal ou leurs signatures ne se voient d''une autre agence';
end $$;

-- Un contact du client, connectable au portail (le contact du test 01 est
-- rattaché ailleurs par un test antérieur).
insert into auth.users (id, email) values ('34343434-3434-3434-3434-343434343434', 'sophie@acmecorp.ca');
insert into public.portal_identity (user_id, contact_id)
values ('34343434-3434-3434-3434-343434343434', 'dddddddd-0000-0000-0000-000000000001');

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '34343434-3434-3434-3434-343434343434';   -- le contact du client
  select count(*) into n from public.quote where sent_at is not null;
  if n < 1 then raise exception 'ÉCHEC — le contact devrait voir les documents envoyés à son compte'; end if;
  select count(*) into n from public.quote where sent_at is null;
  if n <> 0 then raise exception 'ÉCHEC — le contact voit un brouillon'; end if;
  raise notice 'OK   — le contact voit ce qui lui a été envoyé, jamais un brouillon';
end $$;

\echo ''
\echo 'Migration 0024 : toutes les règles du document généré sont vérifiées.'


\echo ''
\echo '--- Les compléments d''un document sont une carte plate (migration 0025) ---'

do $$
begin
  update public.quote set extras = '{"brief.atout_principal": "une équipe locale"}'
   where id = 'f8000000-0000-0000-0000-000000000002';
  begin
    update public.quote set extras = '["pas", "un", "objet"]' where id = 'f8000000-0000-0000-0000-000000000002';
    raise exception 'ÉCHEC — un tableau a été accepté comme compléments';
  exception when check_violation then
    raise notice 'OK   — les compléments sont un objet clé → texte, jamais autre chose';
  end;
end $$;


\echo ''
\echo '--- La numérotation exposée respecte la frontière de l''agence (migration 0026) ---'

do $$
declare r text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin
  r := public.next_document_ref('f7000000-0000-0000-0000-000000000001');
  if r not like 'PR-%' then raise exception 'ÉCHEC — référence attendue PR-…, obtenu %', r; end if;
  raise notice 'OK   — depuis l''application, l''admin obtient la référence suivante : %', r;
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';   -- la rivale
  perform public.next_document_ref('f7000000-0000-0000-0000-000000000001');
  raise exception 'ÉCHEC — la rivale a numéroté un document de l''autre agence';
exception
  when insufficient_privilege then
    raise notice 'OK   — la rivale ne consomme pas les numéros d''une autre agence';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise;
end $$;
