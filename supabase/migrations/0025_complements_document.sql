-- =============================================================================
-- 0025 — Les compléments d'un document : ce qui se saisit à la main
-- =============================================================================
-- Un modèle porte des balises que ni la base ni le catalogue ne remplissent
-- encore — celles du brief de découverte (`brief.*`, session 9.5), ou un
-- détail propre au mandat (`contrat.nombre_pages`). Plutôt que d'envoyer un
-- document avec des trous, la personne les complète depuis le brouillon :
-- les valeurs vivent ici, sur le document, et se figent avec lui à l'envoi.
--
-- Une carte plate : `{"brief.atout_principal": "…", "contrat.nombre_pages": "12"}`.
-- La session 9.5 la remplira depuis le brief ; jusque-là, elle se tape.
-- =============================================================================

alter table public.quote
  add column extras jsonb not null default '{}'::jsonb,
  add constraint quote_extras_is_object check (jsonb_typeof(extras) = 'object');

comment on column public.quote.extras is
  'Balises complétées à la main sur ce document (clé canonique → texte). Figées avec le document à l''envoi.';
