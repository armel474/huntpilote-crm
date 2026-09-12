/**
 * Client Supabase côté navigateur — pour les rares interactions qui ne
 * passent pas par le serveur : authentification, temps réel.
 *
 * Un seul client par onglet ; `createBrowserClient` le met en cache.
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
