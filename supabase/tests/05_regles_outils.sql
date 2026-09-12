-- =============================================================================
-- Vérification des outils à série temporelle (migration 0008)
-- =============================================================================
-- Le jeu d'essai reprend les vraies valeurs de `lib/data/position-tracking.ts`
-- et `lib/data/backlink-analyse.ts` : c'est la seule façon de vérifier que ce
-- qui n'est plus stocké se retrouve bien à l'identique.
--
-- À lancer après 01_regles.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- =============================================================================
-- Huit relevés hebdomadaires, tels que `history` les empile aujourd'hui
-- =============================================================================

insert into public.keyword_group (id, agency_id, client_id, name, position) values
  ('a1000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'Toiture résidentielle', 1),
  ('a1000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'Urgence & réparation', 2),
  ('a1000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'Marque', 3);

insert into public.tracked_keyword (id, agency_id, client_id, group_id, query, intent) values
  ('a2000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'toiture montréal', 'transactionnelle'),
  ('a2000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'soumission toiture rive-sud', 'transactionnelle'),
  ('a2000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002',
   'fuite toiture que faire', 'informationnelle'),
  ('a2000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'inspection toiture drone', 'informationnelle');

-- Les huit semaines de `history`, avec enfin une date chacune.
with semaines as (
  select generate_series(0, 7) as i
), series as (
  select 'a2000000-0000-0000-0000-000000000001'::uuid as kw, 1900 as vol,
         array[14, 13, 13, 12, 11, 10, 9, 7]::smallint[] as pos
  union all
  select 'a2000000-0000-0000-0000-000000000002', 640,
         array[28, 30, 32, 40, 70, null, null, null]::smallint[]
  union all
  select 'a2000000-0000-0000-0000-000000000003', 260,
         array[11, 10, 10, 9, 9, 10, 9, 9]::smallint[]
)
insert into public.keyword_reading (agency_id, keyword_id, measured_on, position, search_volume)
select 'aaaaaaaa-0000-0000-0000-000000000001', s.kw,
       date '2026-07-17' + (w.i * 7), s.pos[w.i + 1], s.vol
from series s cross join semaines w;

-- Le onzième mot-clé n'a qu'un seul relevé : il vient d'entrer au suivi.
insert into public.keyword_reading (agency_id, keyword_id, measured_on, position, search_volume)
values ('aaaaaaaa-0000-0000-0000-000000000001',
        'a2000000-0000-0000-0000-000000000004', '2026-09-04', 8, 140);

-- Deux URL classées sur « fuite toiture que faire » au dernier relevé.
insert into public.keyword_reading_url (reading_id, url, position)
select r.id, u.url, u.pos
from public.keyword_reading r
cross join (values ('/blogue/fuite-toiture', 9::smallint),
                   ('/services/urgence', 17::smallint)) as u(url, pos)
where r.keyword_id = 'a2000000-0000-0000-0000-000000000003'
  and r.measured_on = '2026-09-04';

insert into public.keyword_reading_url (reading_id, url)
select r.id, '/services/toiture-plate'
from public.keyword_reading r
where r.keyword_id = 'a2000000-0000-0000-0000-000000000001'
  and r.measured_on = '2026-09-04';


\echo ''
\echo '--- La position précédente est la ligne d''avant, pas une colonne ---'

do $$
declare pos smallint; prec smallint; le_jour date;
begin
  select position, position_previous, measured_on_previous
    into pos, prec, le_jour
  from public.tracked_keyword_reading
  where keyword_id = 'a2000000-0000-0000-0000-000000000001'
    and measured_on = '2026-09-04';

  if pos <> 7 or prec <> 9 then
    raise exception 'ÉCHEC — attendu 7 (précédent 9), obtenu % (précédent %)', pos, prec;
  end if;
  -- Le tableau `history` ne disait pas quand : maintenant si.
  if le_jour <> date '2026-08-28' then
    raise exception 'ÉCHEC — le relevé précédent devrait dater du 28 août, obtenu %', le_jour;
  end if;
  raise notice 'OK   — « 7, précédemment 9 » se lit dans la série, datée au 28 août';
end $$;


\echo ''
\echo '--- Les trois drapeaux de la série se lisent dans la série ---'

do $$
declare sorti boolean; prem boolean; cann boolean; prec smallint;
begin
  -- « soumission toiture rive-sud » : hors classement depuis trois semaines.
  select dropped_out, position_previous into sorti, prec
  from public.tracked_keyword_reading
  where keyword_id = 'a2000000-0000-0000-0000-000000000002'
    and measured_on = '2026-09-04';

  if not sorti then
    raise exception 'ÉCHEC — le mot-clé est hors classement depuis trois semaines, il devrait être « sorti »';
  end if;
  -- Le code affichait « précédemment 34 » alors que son propre `history`
  -- donne null aux trois derniers relevés. La série tranche : rien.
  if prec is not null then
    raise exception 'ÉCHEC — la position précédente devrait être nulle, obtenu %', prec;
  end if;

  select is_first_reading into prem
  from public.tracked_keyword_reading
  where keyword_id = 'a2000000-0000-0000-0000-000000000004';
  if not prem then
    raise exception 'ÉCHEC — un mot-clé à un seul relevé est un premier relevé';
  end if;

  select cannibalised into cann
  from public.tracked_keyword_reading
  where keyword_id = 'a2000000-0000-0000-0000-000000000003'
    and measured_on = '2026-09-04';
  if not cann then
    raise exception 'ÉCHEC — deux URL classées sur la même requête, c''est une cannibalisation';
  end if;

  select cannibalised into cann
  from public.tracked_keyword_reading
  where keyword_id = 'a2000000-0000-0000-0000-000000000001'
    and measured_on = '2026-09-04';
  if cann then
    raise exception 'ÉCHEC — une seule URL classée ne fait pas une cannibalisation';
  end if;

  raise notice 'OK   — sorti du classement, premier relevé et cannibalisation, tous déduits';
end $$;


\echo ''
\echo '--- Le seuil « première page » se compte sur le dernier relevé ---'

do $$
declare n integer;
begin
  select count(*) into n
  from public.tracked_keyword_reading t
  where t.client_id = 'cccccccc-0000-0000-0000-000000000001'
    and t.measured_on = '2026-09-04'
    and t.position <= 10;

  -- 7 (toiture montréal), 9 (fuite toiture que faire), 8 (inspection drone).
  if n <> 3 then
    raise exception 'ÉCHEC — 3 mots-clés attendus en première page, obtenu %', n;
  end if;
  raise notice 'OK   — 3 mots-clés en première page au relevé du 4 septembre';
end $$;


\echo ''
\echo '--- Un mot-clé n''est relevé qu''une fois par semaine ---'

do $$
begin
  begin
    insert into public.keyword_reading (agency_id, keyword_id, measured_on, position)
    values ('aaaaaaaa-0000-0000-0000-000000000001',
            'a2000000-0000-0000-0000-000000000001', '2026-09-04', 3);
    raise exception 'ÉCHEC — deux relevés du même mot-clé le même jour ont été acceptés';
  exception when unique_violation then
    raise notice 'OK   — deux relevés du même mot-clé le même jour sont refusés';
  end;
end $$;


\echo ''
\echo '--- Backlinks : le profil précédent est le relevé précédent ---'

insert into public.backlink_reading
  (id, agency_id, client_id, measured_on, referring_domains, authority, followed_pct)
values
  ('a3000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', '2026-08-21', 198, 31, 69),
  ('a3000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001', '2026-09-04', 214, 34, 71);

do $$
declare dom integer; dom_prec integer; aut smallint; aut_prec smallint;
begin
  select referring_domains, referring_domains_previous, authority, authority_previous
    into dom, dom_prec, aut, aut_prec
  from public.backlink_reading_delta
  where reading_id = 'a3000000-0000-0000-0000-000000000002';

  if dom <> 214 or dom_prec <> 198 then
    raise exception 'ÉCHEC — attendu 214 domaines (précédemment 198), obtenu % (%)', dom, dom_prec;
  end if;
  if aut <> 34 or aut_prec <> 31 then
    raise exception 'ÉCHEC — attendu autorité 34 (précédemment 31), obtenu % (%)', aut, aut_prec;
  end if;
  raise notice 'OK   — « 214, +16 » et « 34, +3 » se lisent entre deux relevés';
end $$;


\echo ''
\echo '--- Un gain pointe une page, une perte dit pourquoi ---'

insert into public.backlink_event
  (agency_id, client_id, reading_id, kind, domain, authority, anchor, occurred_on, target_url)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'a3000000-0000-0000-0000-000000000002', 'gain', 'batirenoquebec.ca', 58,
        'toiture montréal', '2026-09-03', '/services/toiture-plate');

insert into public.backlink_event
  (agency_id, client_id, reading_id, kind, domain, authority, anchor, occurred_on, reason)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'a3000000-0000-0000-0000-000000000002', 'perte', 'annuaire-construction.ca', 33,
        'toiture rive-sud', '2026-09-02', 'page supprimée');

do $$
begin
  begin
    insert into public.backlink_event
      (agency_id, client_id, kind, domain, occurred_on)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'gain', 'exemple.ca', '2026-09-01');
    raise exception 'ÉCHEC — un gain sans page cible a été accepté';
  exception when check_violation then
    raise notice 'OK   — un gain de lien nomme la page qu''il pointe';
  end;

  begin
    insert into public.backlink_event
      (agency_id, client_id, kind, domain, occurred_on, target_url)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
            'perte', 'exemple2.ca', '2026-09-01', '/services/');
    raise exception 'ÉCHEC — une perte sans motif a été acceptée';
  exception when check_violation then
    raise notice 'OK   — une perte de lien dit pourquoi le lien n''est plus là';
  end;
end $$;


\echo ''
\echo '--- Un désaveu se date, ou n''est pas un désaveu ---'

insert into public.toxic_backlink
  (id, agency_id, client_id, domain, authority, spam_score, reason)
values ('a4000000-0000-0000-0000-000000000001',
        'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
        'liens-gratuits-fr.ru', 4, 91, 'réseau PBN suspecté');

do $$
begin
  begin
    update public.toxic_backlink set status = 'desavoue'
     where id = 'a4000000-0000-0000-0000-000000000001';
    raise exception 'ÉCHEC — un lien marqué désavoué sans date a été accepté';
  exception when check_violation then
    raise notice 'OK   — « désavoué » sans date de désaveu est refusé';
  end;
end $$;

do $$
begin
  update public.toxic_backlink
     set status = 'desavoue', disavowed_on = '2026-09-10'
   where id = 'a4000000-0000-0000-0000-000000000001';
  raise notice 'OK   — le désaveu passe une fois daté';
end $$;


\echo ''
\echo '--- Cloisonnement : les outils restent dans leur agence ---'

grant usage on schema public, app to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema app to authenticated;

do $$
declare n integer; nb integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select count(*) into n  from public.tracked_keyword_reading;
  select count(*) into nb from public.backlink_reading_delta;
  if n <> 0 or nb <> 0 then
    raise exception 'ÉCHEC — l''agence rivale voit % relevé(s) de position et % de liens', n, nb;
  end if;
  raise notice 'OK   — l''agence rivale n''atteint ni les positions ni les liens du portefeuille';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into n from public.tracked_keyword;
  if n <> 0 then
    raise exception 'ÉCHEC — le contact du portail voit % mot(s)-clé(s) suivi(s)', n;
  end if;
  raise notice 'OK   — le portail n''atteint pas les outils de travail de l''agence';
end $$;


\echo ''
\echo 'Tous les tests des outils à série temporelle sont passés.'
