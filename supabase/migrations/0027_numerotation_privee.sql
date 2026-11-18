-- 0027 — La numérotation des documents n'est pas un point d'entrée public.
--
-- La 0026 a exposé `public.next_document_ref` aux membres connectés, mais
-- PostgreSQL accorde EXECUTE au rôle `public` par défaut : l'audit de
-- sécurité Supabase signalait la fonction comme appelable par `anon`. La
-- fonction refuse déjà (aucune agence courante sans session), mais un
-- appel refusé reste un appel possible : on retire le droit.
revoke execute on function public.next_document_ref(uuid) from public, anon;
grant execute on function public.next_document_ref(uuid) to authenticated;
