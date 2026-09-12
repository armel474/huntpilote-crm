/**
 * Client Supabase côté serveur — composants serveur, actions serveur, routes.
 *
 * La session vit dans les cookies : ce client la lit et la rafraîchit. Il
 * interroge la base **avec les droits de la personne connectée**, donc sous
 * RLS — le serveur ne voit pas plus que l'utilisateur, et c'est voulu.
 *
 * Un nouveau client par requête : `cookies()` est lié à la requête en cours.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Appelé depuis un composant serveur : les cookies ne s'écrivent
            // pas ici, le middleware s'en charge au passage suivant.
          }
        },
      },
    },
  );
}
