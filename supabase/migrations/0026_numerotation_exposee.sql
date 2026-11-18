-- =============================================================================
-- 0026 — La numérotation, exposée à l'application
-- =============================================================================
-- `app.next_document_ref` (migration 0013) fabrique la référence suivante
-- d'un modèle — `DV-2026-017` — avec le compteur qui garantit qu'aucune ne
-- sert deux fois. Elle vit dans le schéma `app`, que l'API n'expose pas. Le
-- générateur (session 9.4) en a besoin au moment de créer un brouillon.
--
-- Cette porte publique vérifie que le modèle appartient à l'agence de la
-- personne connectée : personne ne consomme les numéros d'une autre agence.
-- =============================================================================

create or replace function public.next_document_ref(p_template uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare owner uuid;
begin
  select t.agency_id into owner from public.document_template t where t.id = p_template;
  if owner is null then
    raise exception 'Modèle de document introuvable.' using errcode = 'no_data_found';
  end if;
  if owner is distinct from app.current_agency_id() then
    raise exception 'Ce modèle n''appartient pas à votre agence.' using errcode = 'insufficient_privilege';
  end if;
  return app.next_document_ref(p_template);
end;
$$;

revoke all on function public.next_document_ref(uuid) from public;
grant execute on function public.next_document_ref(uuid) to authenticated;
