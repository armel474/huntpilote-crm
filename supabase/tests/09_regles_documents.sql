-- =============================================================================
-- Vérification des documents de l'agence (migration 0013)
-- =============================================================================
-- Un devis et une facture sortent de l'agence. Ce fichier vérifie les trois
-- choses qui comptent une fois qu'ils sont partis : la numérotation ne se
-- répète pas, le montant se justifie ligne à ligne, et une facture envoyée ne
-- se réécrit plus.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


insert into public.document_template
  (id, agency_id, kind, name, is_default, prefix, include_year, number_padding,
   payment_terms_days, legal_mentions)
values
  ('f5000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'devis', 'Devis standard', true, 'DV', true, 3, 30,
   'Devis valide 30 jours. Taxes en sus.'),
  ('f5000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'facture', 'Facture standard', true, 'FA', true, 4, 30,
   'Payable à réception. Intérêts de 1,5 % par mois sur tout solde en retard.');


\echo ''
\echo '--- La référence se fabrique, et ne se répète pas ---'

do $$
declare a text; b text; annee text := extract(year from current_date)::text;
begin
  a := app.next_document_ref('f5000000-0000-0000-0000-000000000001');
  b := app.next_document_ref('f5000000-0000-0000-0000-000000000001');

  if a <> 'DV-' || annee || '-001' then
    raise exception 'ÉCHEC — première référence attendue DV-%-001, obtenu %', annee, a;
  end if;
  if b <> 'DV-' || annee || '-002' then
    raise exception 'ÉCHEC — seconde référence attendue DV-%-002, obtenu %', annee, b;
  end if;
  raise notice 'OK   — % puis % : le préfixe, l''année et le rang viennent du modèle', a, b;
end $$;

do $$
declare f text;
begin
  -- Les factures ont leur propre suite : elles ne repartent pas de 3.
  f := app.next_document_ref('f5000000-0000-0000-0000-000000000002');
  if f <> 'FA-' || extract(year from current_date)::text || '-0001' then
    raise exception 'ÉCHEC — la suite des factures devrait démarrer à 0001, obtenu %', f;
  end if;
  raise notice 'OK   — chaque type de document a sa propre suite, avec son remplissage';
end $$;


\echo ''
\echo '--- Un seul modèle par défaut par type ---'

do $$
begin
  begin
    insert into public.document_template (agency_id, kind, name, is_default, prefix)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'devis', 'Second devis par défaut', true, 'DX');
    raise exception 'ÉCHEC — deux modèles de devis par défaut ont été acceptés';
  exception when unique_violation then
    raise notice 'OK   — « lequel s''applique ? » n''est jamais une question';
  end;
end $$;


\echo ''
\echo '--- Le montant d''une facture se lit dans ses lignes ---'

insert into public.invoice
  (id, agency_id, client_id, template_id, ref, period_month, issued_on, due_on, status)
values ('f6000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'f5000000-0000-0000-0000-000000000002', 'FA-2026-0002',
        '2026-09-01', '2026-09-30', '2026-10-30', 'en_attente');

insert into public.invoice_line
  (invoice_id, position, description, quantity, unit_price_cents, period_month)
values
  ('f6000000-0000-0000-0000-000000000001', 1, 'Forfait Croissance — septembre', 1, 90000, '2026-09-01'),
  ('f6000000-0000-0000-0000-000000000001', 2, 'Article de blogue supplémentaire', 2, 15000, '2026-09-01');

do $$
declare sous bigint; tot bigint;
begin
  select subtotal_cents, total_cents into sous, tot
  from public.invoice_total where invoice_id = 'f6000000-0000-0000-0000-000000000001';

  if sous <> 120000 then
    raise exception 'ÉCHEC — sous-total attendu 1 200 $, obtenu % $', sous / 100.0;
  end if;
  -- 1 200,00 $ + TPS 60,00 $ + TVQ 119,70 $ = 1 379,70 $
  if tot <> 137970 then
    raise exception 'ÉCHEC — total attendu 1 379,70 $, obtenu % $', tot / 100.0;
  end if;
  raise notice 'OK   — sous-total % $ et total % $ calculés, comme pour un devis', sous / 100.0, tot / 100.0;
end $$;


\echo ''
\echo '--- Tant qu''elle n''est pas partie, la facture se corrige ---'

do $$
begin
  update public.invoice_line set unit_price_cents = 95000
   where invoice_id = 'f6000000-0000-0000-0000-000000000001' and position = 1;
  update public.invoice set due_on = '2026-11-15'
   where id = 'f6000000-0000-0000-0000-000000000001';
  raise notice 'OK   — un brouillon de facture reste modifiable, lignes comprises';
end $$;

-- Remise à la valeur attendue avant l'envoi.
update public.invoice_line set unit_price_cents = 90000
 where invoice_id = 'f6000000-0000-0000-0000-000000000001' and position = 1;


\echo ''
\echo '--- Une fois envoyée, elle est gelée ---'

update public.invoice set sent_at = now()
 where id = 'f6000000-0000-0000-0000-000000000001';

do $$
begin
  begin
    update public.invoice set ref = 'FA-2026-9999'
     where id = 'f6000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — le numéro d''une facture envoyée a été changé';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — %', left(sqlerrm, 76);
  end;

  begin
    update public.invoice_line set unit_price_cents = 1
     where invoice_id = 'f6000000-0000-0000-0000-000000000001' and position = 1;
    raise exception 'ÉCHEC — une ligne de facture envoyée a été modifiée';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — %', left(sqlerrm, 76);
  end;

  begin
    delete from public.invoice where id = 'f6000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — une facture envoyée a été supprimée';
  exception when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — %', left(sqlerrm, 76);
  end;
end $$;

do $$
declare st public.invoice_status;
begin
  -- Ce qui reste permis : constater le paiement.
  update public.invoice set status = 'payee', paid_on = current_date
   where id = 'f6000000-0000-0000-0000-000000000001';

  select status into st from public.invoice where id = 'f6000000-0000-0000-0000-000000000001';
  if st <> 'payee' then
    raise exception 'ÉCHEC — le paiement n''a pas pu être constaté';
  end if;
  raise notice 'OK   — le paiement et l''annulation restent possibles : c''est tout';
end $$;


\echo ''
\echo '--- Le client voit ses factures envoyées, pas les brouillons ---'

insert into public.invoice
  (id, agency_id, client_id, template_id, ref, period_month, issued_on, status)
values ('f6000000-0000-0000-0000-000000000002',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'f5000000-0000-0000-0000-000000000002', 'FA-2026-0003',
        '2026-10-01', '2026-10-31', 'en_attente');

insert into public.invoice_line (invoice_id, position, description, quantity, unit_price_cents)
values ('f6000000-0000-0000-0000-000000000002', 1, 'Brouillon d''octobre — à relire', 1, 90000);

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into n from public.invoice_line;
  if n <> 2 then
    raise exception 'ÉCHEC — le client devrait voir les 2 lignes de sa facture envoyée, il en voit %', n;
  end if;
  raise notice 'OK   — le détail de la facture envoyée, jamais celui du brouillon d''octobre';
end $$;

do $$
declare n integer; m integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n from public.invoice_line;
  select count(*) into m from public.document_template;
  if n <> 0 or m <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % ligne(s) et % modèle(s)', n, m;
  end if;
  raise notice 'OK   — ni les lignes ni les modèles ne franchissent la frontière de l''agence';
end $$;


\echo ''
\echo 'Tous les tests des documents sont passés.'
