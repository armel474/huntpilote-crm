-- =============================================================================
-- 0010 — Le garde-fou de l'audit de prospect fige son chemin de recherche
-- =============================================================================
-- `app.block_prospect_audit_rewrite()` ne lit aucune table : elle lève, point.
-- Mais une fonction sans `search_path` figé reste une fonction dont le
-- comportement dépend de l'appelant, et c'est une catégorie de faille entière
-- — celle où quelqu'un place un objet de son choix devant celui qu'on croyait
-- appeler. Le linter Supabase ne fait pas d'exception pour les cas anodins, et
-- il a raison : l'exception d'aujourd'hui est le trou de demain.
--
-- Toutes les autres fonctions du schéma le figent déjà. Celle-ci l'avait
-- oublié en 0009.
-- =============================================================================

create or replace function app.block_prospect_audit_rewrite()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Un audit de prospect publié ne se modifie pas — produisez-en un nouveau (règle 3).';
end;
$$;
