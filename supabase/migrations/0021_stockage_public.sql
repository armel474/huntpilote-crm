-- =============================================================================
-- 0021 — Un espace de stockage pour ce qui s'affiche : logo, photos
-- =============================================================================
-- `agency.logo_url` et `agency_member.avatar_url` existaient sans que rien
-- ne permette d'y déposer une image : l'écran demandait une adresse. Un
-- seau Supabase Storage, public en lecture (une image de document doit se
-- charger sans jeton, dans un courriel comme dans un PDF), cloisonné en
-- écriture : chaque agence n'écrit que sous son propre dossier, nommé par
-- son identifiant.
--
-- Le schéma `storage` est fourni par la plateforme, pas par ces migrations.
-- La doublure locale (`tests/00_stub_supabase.sql`) ne le crée pas : tout
-- ici s'exécute seulement s'il existe, pour que la validation locale reste
-- possible et que la mise en ligne fasse le vrai travail.
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'Schéma storage absent : seau et politiques non créés (doublure locale).';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('public-assets', 'public-assets', true, 2097152,
          array['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'])
  on conflict (id) do nothing;

  -- Lecture publique : c'est le sens du seau.
  execute $p$
    create policy public_assets_read on storage.objects
      for select to public
      using (bucket_id = 'public-assets')
  $p$;

  -- Écriture : un membre connecté, dans le dossier de son agence, et nulle
  -- part ailleurs. Le premier segment du chemin est l'identifiant de
  -- l'agence ; c'est la seule chose qu'une politique de stockage sait lire.
  execute $p$
    create policy public_assets_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'public-assets'
        and (storage.foldername(name))[1] = app.current_agency_id()::text
      )
  $p$;
  execute $p$
    create policy public_assets_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'public-assets'
        and (storage.foldername(name))[1] = app.current_agency_id()::text
      )
      with check (
        bucket_id = 'public-assets'
        and (storage.foldername(name))[1] = app.current_agency_id()::text
      )
  $p$;
  execute $p$
    create policy public_assets_delete on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'public-assets'
        and (storage.foldername(name))[1] = app.current_agency_id()::text
      )
  $p$;
end $$;
