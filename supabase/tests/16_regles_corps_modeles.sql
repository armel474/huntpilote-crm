-- =============================================================================
-- Vérification du corps des modèles et de leurs sections (migration 0023)
-- =============================================================================
-- Un modèle porte un corps HTML ; ses sections ont une clé unique et bien
-- formée, une longueur positive, et une clause verrouillée n'est pas ouverte
-- à l'IA. Tout se lit dans l'agence et ne s'écrit qu'avec « Gérer le
-- catalogue ».
--
-- À lancer après 15_regles_livrables_offre.sql, sur la même base.
-- =============================================================================

\set QUIET on
\pset tuples_only on
\pset format unaligned
set client_min_messages = notice;


\echo ''
\echo '--- Un modèle porte un corps, et des sections bien formées ---'

do $$
declare tid uuid;
begin
  insert into public.document_template (id, agency_id, kind, name, prefix)
  values ('e0000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001',
          'proposition', 'Proposition test', 'PR')
  returning id into tid;

  update public.document_template
     set body_html = '<div>{{client.nom}} {{section.besoins}}</div>'
   where id = tid;
  raise notice 'OK   — un modèle reçoit son corps HTML';

  insert into public.document_template_section
    (template_id, key, title, position, default_body, optional, ai_assist, max_chars)
  values (tid, 'besoins', 'Compréhension de vos besoins', 1,
          '[Compléter : mission principale de l''entreprise]', false, true, 1200);
  raise notice 'OK   — une section se déclare avec son guide et sa longueur';

  begin
    insert into public.document_template_section (template_id, key, title)
    values (tid, 'besoins', 'Doublon');
    raise exception 'ÉCHEC — deux sections portent la même clé';
  exception when unique_violation then
    raise notice 'OK   — une clé de section est unique dans son modèle';
  end;

  begin
    insert into public.document_template_section (template_id, key, title)
    values (tid, 'Mes Besoins', 'Clé mal formée');
    raise exception 'ÉCHEC — une clé avec majuscules et espace a été acceptée';
  exception when check_violation then
    raise notice 'OK   — une clé de section est en minuscules, sans espace';
  end;

  begin
    insert into public.document_template_section (template_id, key, title, locked_by_agency, ai_assist)
    values (tid, 'modalites', 'Modalités', true, true);
    raise exception 'ÉCHEC — une clause verrouillée ouverte à l''IA a été acceptée';
  exception when check_violation then
    raise notice 'OK   — une clause verrouillée n''est pas ouverte à l''IA';
  end;

  insert into public.document_template_section (template_id, key, title, locked_by_agency, ai_assist, position)
  values (tid, 'modalites', 'Modalités', true, false, 2);
  raise notice 'OK   — une clause verrouillée se déclare sans IA';

  begin
    insert into public.document_template_section (template_id, key, title, max_chars)
    values (tid, 'vide', 'Longueur nulle', 0);
    raise exception 'ÉCHEC — une longueur nulle a été acceptée';
  exception when check_violation then
    raise notice 'OK   — la longueur indicative est positive';
  end;
end $$;


\echo ''
\echo '--- Les sections se lisent dans l''agence, s''écrivent avec le droit ---'

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur

  select count(*) into n from public.document_template_section
   where template_id = 'e0000000-0000-0000-0000-000000000001';
  if n <> 2 then
    raise exception 'ÉCHEC — le rédacteur devrait voir les sections du modèle (% vues)', n;
  end if;

  update public.document_template_section set title = 'Piraté'
   where template_id = 'e0000000-0000-0000-0000-000000000001';
  update public.document_template set body_html = '<b>piraté</b>'
   where id = 'e0000000-0000-0000-0000-000000000001';

  select count(*) into n from public.document_template_section where title = 'Piraté';
  if n <> 0 then raise exception 'ÉCHEC — le rédacteur a renommé une section'; end if;
  select count(*) into n from public.document_template where body_html like '%piraté%';
  if n <> 0 then raise exception 'ÉCHEC — le rédacteur a réécrit le corps d''un modèle'; end if;
  raise notice 'OK   — sans « Gérer le catalogue », ni le corps ni les sections ne bougent';
end $$;

do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '66666666-6666-6666-6666-666666666666';   -- rédacteur

  insert into public.document_template_section (template_id, key, title)
  values ('e0000000-0000-0000-0000-000000000001', 'preuve', 'Section improvisée');
  raise exception 'ÉCHEC — le rédacteur a ajouté une section';
exception
  when insufficient_privilege then
    raise notice 'OK   — ajouter une section lui est refusé';
  when others then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
    raise notice 'OK   — ajouter une section lui est refusé  (%)', left(sqlerrm, 44);
end $$;

do $$
declare v text;
begin
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';   -- admin

  update public.document_template set body_html = '<div>{{client.nom}}</div>'
   where id = 'e0000000-0000-0000-0000-000000000001';
  select body_html into v from public.document_template
   where id = 'e0000000-0000-0000-0000-000000000001';
  if v <> '<div>{{client.nom}}</div>' then
    raise exception 'ÉCHEC — l''administratrice n''a pas pu réécrire le corps';
  end if;

  insert into public.document_template_section (template_id, key, title, optional, position)
  values ('e0000000-0000-0000-0000-000000000001', 'preuve', 'Preuve et résultats', true, 3);
  raise notice 'OK   — avec « Gérer le catalogue », le corps et les sections s''écrivent';
end $$;


\echo ''
\echo '--- Supprimer un modèle emporte ses sections ---'

do $$
declare n integer;
begin
  delete from public.document_template where id = 'e0000000-0000-0000-0000-000000000001';
  select count(*) into n from public.document_template_section
   where template_id = 'e0000000-0000-0000-0000-000000000001';
  if n <> 0 then raise exception 'ÉCHEC — une section a survécu à son modèle'; end if;
  raise notice 'OK   — les sections disparaissent avec le modèle';
end $$;
