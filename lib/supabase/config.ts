/**
 * Supabase est-il configuré sur cet environnement ?
 *
 * Tant que les variables ne sont pas posées (Vercel avant mise en service),
 * l'application doit continuer de fonctionner comme avant : sans session,
 * sans base, sans planter. Chaque point d'entrée vérifie ici avant d'appeler.
 */
export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
