import 'server-only';

import { getSession } from '@/lib/auth';
import { loadAgencyData, type AgencyData } from '@/lib/queries/agence';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

const EMPTY: AgencyData = {
  agency: null, items: [], offers: [], members: [],
  roleDefaults: { admin: [], chef_projet: [], specialiste_seo: [], redacteur: [] },
};

/** Chargé par page, jamais dans un layout conservé entre deux navigations. */
export async function loadAgencyScreen() {
  if (!supabaseConfigured()) return { session: null, data: EMPTY, configured: false };
  const session = await getSession();
  if (session?.kind !== 'membre') return { session, data: EMPTY, configured: true };
  const data = await loadAgencyData(await createClient());
  return { session, data, configured: true };
}
