-- =============================================================================
-- Vérification du cloisonnement des vues (migration 0005)
-- =============================================================================
-- Ce fichier existe à cause d'un trou réel dans les deux précédents : ils
-- vérifiaient les politiques RLS des *tables*, jamais ce que renvoient les
-- *vues* interrogées sous le rôle `authenticated`.
--
-- Or une vue PostgreSQL s'exécute par défaut avec les droits de son créateur
-- et contourne RLS. `review_queue` montrait donc la file de relecture de
-- toutes les agences, et `quote_total` les montants de tous les devis. C'est
-- l'audit de sécurité Supabase qui l'a trouvé, pas ces tests — d'où celui-ci.
--
-- À lancer après 01_regles.sql et 02_regles_crm.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


-- =============================================================================
-- De quoi comparer : une relecture en attente de chaque côté
-- =============================================================================

-- Agence HuntPilote : une priorité dont le libellé client attend une relecture.
insert into public.priority
  (agency_id, client_id, slug, ref, severity, dimension,
   internal_label, client_label, client_label_review)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001',
   'p-0499', 'P-0499', 'important', 'presence',
   'NAP incohérent sur 4 annuaires',
   'Vos coordonnées diffèrent d''un annuaire à l''autre', 'a_relire');

-- Agence rivale : même situation, sur son propre compte.
insert into public.priority
  (agency_id, client_id, slug, ref, severity, dimension,
   internal_label, client_label, client_label_review)
values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000002',
   'p-9500', 'P-9500', 'critique', 'seo',
   'Secret industriel de la rivale',
   'Texte client de la rivale', 'a_relire');


\echo ''
\echo '--- La file de relecture ne franchit pas la frontière de l''agence ---'

do $$
declare n integer; fuite integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  select count(*) into n from public.review_queue;
  select count(*) into fuite from public.review_queue
   where internal_label like '%rivale%';

  if fuite > 0 then
    raise exception
      'ÉCHEC — la file de relecture laisse voir % ligne(s) d''une autre agence', fuite;
  end if;
  if n <> 1 then
    raise exception
      'ÉCHEC — Marie devrait voir 1 relecture en attente (la sienne), elle en voit %', n;
  end if;

  raise notice 'OK   — review_queue ne montre que les relectures de sa propre agence';
end $$;


\echo ''
\echo '--- Les totaux de devis non plus ---'

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  select count(*) into n from public.quote_total;
  if n <> 1 then
    raise exception
      'ÉCHEC — Marie devrait voir le total de son seul devis, elle en voit %', n;
  end if;

  raise notice 'OK   — quote_total ne montre que les devis de sa propre agence';
end $$;


\echo ''
\echo '--- Un contact du portail ne voit aucune de ces deux vues ---'

do $$
declare nq integer; nt integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  select count(*) into nq from public.review_queue;
  select count(*) into nt from public.quote_total;

  if nq > 0 then
    raise exception 'ÉCHEC — un contact du portail voit % ligne(s) de la file de relecture', nq;
  end if;
  if nt > 0 then
    raise exception 'ÉCHEC — un contact du portail voit % total(aux) de devis', nt;
  end if;

  raise notice 'OK   — le portail n''atteint ni la file de relecture ni les totaux de devis';
end $$;


\echo ''
\echo 'Tous les tests de vues sont passés.'
