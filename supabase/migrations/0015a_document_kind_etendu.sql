-- =============================================================================
-- 0015a — La proposition, le contrat, l'annexe et l'avenant
-- =============================================================================
-- Un devis et une facture ne sont pas les seuls documents qui sortent de
-- l'agence. La proposition précède le contrat, l'annexe le complète, l'avenant
-- le modifie.
--
-- Séparé de 0015b parce qu'une valeur d'énumération ajoutée ne s'utilise
-- qu'après validation de la transaction qui l'ajoute : les deux fichiers ne
-- peuvent pas n'en faire qu'un.
-- =============================================================================

alter type public.document_kind add value if not exists 'proposition';
alter type public.document_kind add value if not exists 'contrat';
alter type public.document_kind add value if not exists 'annexe';
alter type public.document_kind add value if not exists 'avenant';
