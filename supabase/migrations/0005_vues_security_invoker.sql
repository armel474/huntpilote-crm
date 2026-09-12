-- =============================================================================
-- 0005 — Les vues respectent le RLS de leur appelant
-- =============================================================================
-- Une vue PostgreSQL s'exécute par défaut avec les droits de son créateur, et
-- contourne donc les politiques RLS de celui qui l'interroge. Concrètement,
-- avant ce correctif :
--
--   · `review_queue` montrait la file de relecture de TOUTES les agences à
--     n'importe quel utilisateur connecté ;
--   · `quote_total` exposait les montants de tous les devis de toutes les
--     agences.
--
-- `security_invoker = on` fait exécuter la vue avec les droits de l'appelant :
-- les politiques de `priority`, `proof`, `quote` et `quote_line` s'appliquent
-- alors normalement.
--
-- Trouvé par l'audit de sécurité Supabase (lint 0010_security_definer_view)
-- juste après la première application du schéma. Les tests locaux ne l'avaient
-- pas attrapé parce qu'ils n'interrogeaient jamais ces vues sous le rôle
-- `authenticated` — `supabase/tests/03_regles_vues.sql` comble ce trou.
--
-- Les migrations 0003 et 0004 ne sont volontairement pas corrigées en place :
-- une migration déjà appliquée ne se réécrit pas, sinon le dépôt cesse de
-- décrire ce qui tourne réellement.
-- =============================================================================

alter view public.review_queue set (security_invoker = on);
alter view public.quote_total  set (security_invoker = on);
