-- =============================================================================
-- Vérification des règles CRM (migration 0004)
-- =============================================================================
-- À lancer après 01_regles.sql, sur la même base : ce fichier réutilise son
-- jeu d'essai (agence HuntPilote, compte Acme, contact Sophie, portail ouvert).
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;

create or replace function pg_temp.must_fail_crm(stmt text, label text)
returns void
language plpgsql
as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'OK   — %  (refusé : %)', label, left(sqlerrm, 60);
    return;
  end;
  raise exception 'ÉCHEC — % : l''opération aurait dû être refusée', label;
end;
$$;


\echo ''
\echo '--- Pipeline : marquer perdu exige un motif (règle 3, purge de l''instantané) ---'

select pg_temp.must_fail_crm($$
  insert into public.deal (agency_id, client_id, stage, lost_at)
  values ('aaaaaaaa-0000-0000-0000-000000000001',
          'cccccccc-0000-0000-0000-000000000001', 'perdu', now());
$$, 'un deal perdu sans motif est refusé');


\echo ''
\echo '--- Devis : le total et les taxes se calculent, ne se stockent pas ---'

-- Les réglages de l'agence (taux de taxes compris) existent déjà : la
-- migration 0007 les crée en même temps que l'agence.

insert into public.quote (id, agency_id, client_id, contact_id, ref, subject, status, issued_on)
values ('c1000000-0000-0000-0000-00000000000a',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'dddddddd-0000-0000-0000-000000000001',
        'DV-2026-017', 'Ajout d''une seconde langue au site', 'envoye', current_date);

insert into public.quote_line (quote_id, position, description, quantity, unit_price_cents)
values ('c1000000-0000-0000-0000-00000000000a', 1, 'Traduction de 12 pages', 1, 120000),
       ('c1000000-0000-0000-0000-00000000000a', 2, 'Balisage hreflang',      1,  35000);

do $$
declare sub bigint; tot bigint;
begin
  select subtotal_cents, total_cents into sub, tot
  from public.quote_total where quote_id = 'c1000000-0000-0000-0000-00000000000a';

  if sub <> 155000 then
    raise exception 'ÉCHEC — sous-total attendu 155000 cents, obtenu %', sub;
  end if;
  -- 1 550,00 $ + TPS 77,50 $ + TVQ 154,61 $ = 1 782,11 $ (TVQ sur le hors-taxes)
  if tot <> 178211 then
    raise exception 'ÉCHEC — total attendu 178211 cents, obtenu %', tot;
  end if;
  raise notice 'OK   — sous-total % $ et total taxes comprises % $ calculés depuis les lignes',
    (sub / 100.0), (tot / 100.0);
end $$;


\echo ''
\echo '--- Communications : visible du client ou interne, sans ambiguïté ---'

insert into public.communication
  (id, agency_id, client_id, contact_id, channel, direction, body, author_id)
values
  ('c2000000-0000-0000-0000-00000000000a',
   'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   'dddddddd-0000-0000-0000-000000000001', 'portail', 'out',
   'Votre rapport de septembre est en ligne.', 'bbbbbbbb-0000-0000-0000-000000000001'),
  ('c2000000-0000-0000-0000-00000000000b',
   'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   'dddddddd-0000-0000-0000-000000000001', 'note', 'out',
   'Relancer avant le renouvellement — ne pas mentionner la hausse tout de suite.',
   'bbbbbbbb-0000-0000-0000-000000000001');

do $$
declare vis boolean; inte boolean;
begin
  select client_visible into vis from public.communication
   where id = 'c2000000-0000-0000-0000-00000000000a';
  select client_visible into inte from public.communication
   where id = 'c2000000-0000-0000-0000-00000000000b';

  if not vis then raise exception 'ÉCHEC — un message portail devrait être visible du client'; end if;
  if inte     then raise exception 'ÉCHEC — une note interne ne doit jamais être visible du client'; end if;
  raise notice 'OK   — la visibilité dérive du canal, elle ne peut pas être saisie de travers';
end $$;

select pg_temp.must_fail_crm($$
  update public.communication set client_visible = true
   where id = 'c2000000-0000-0000-0000-00000000000b';
$$, 'rendre une note interne visible du client est impossible');


\echo ''
\echo '--- Le portail ne lit que son fil, et n''écrit que sur son canal ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into n from public.communication;
  if n <> 1 then
    raise exception 'ÉCHEC — le contact devrait voir 1 message (le portail), il en voit %', n;
  end if;

  select count(*) into n from public.communication where channel = 'note';
  if n <> 0 then
    raise exception 'ÉCHEC — la note interne est visible du portail';
  end if;

  raise notice 'OK   — le contact ne voit que le fil du portail, jamais la note interne';
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  begin
    insert into public.communication (agency_id, client_id, channel, direction, body)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'cccccccc-0000-0000-0000-000000000001', 'slack', 'in', 'tentative');
    raise exception 'ÉCHEC — le portail a pu écrire sur le canal Slack';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'OK   — le portail ne peut pas écrire sur un canal interne';
  end;
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  insert into public.communication (agency_id, client_id, channel, direction, body)
  values ('aaaaaaaa-0000-0000-0000-000000000001',
          'cccccccc-0000-0000-0000-000000000001', 'portail', 'in',
          'Merci — une question sur le chiffre du trafic organique.');

  select count(*) into n from public.communication;
  if n <> 2 then
    raise exception 'ÉCHEC — le contact devrait voir ses 2 messages de portail, il en voit %', n;
  end if;
  raise notice 'OK   — le contact peut répondre dans son fil de portail';
end $$;


\echo ''
\echo 'Tous les tests CRM sont passés.'
