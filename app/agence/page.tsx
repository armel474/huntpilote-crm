import type { Metadata } from 'next';
import { AgenceHubView } from '@/app/agence/AgenceHubView';
import { getSession } from '@/lib/auth';
import { loadAgencyData, type AgencyData } from '@/lib/queries/agence';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Agence hub — HuntPilote' };

// La page lit la base à chaque requête, avec les droits de la personne
// connectée : elle ne peut pas être prérendue.
export const dynamic = 'force-dynamic';

const EMPTY: AgencyData = {
  agency: null,
  items: [],
  offers: [],
  members: [],
  roleDefaults: { admin: [], chef_projet: [], specialiste_seo: [], redacteur: [] },
  hub: { templateKinds: [], quotesPending: 0, invoicesLate: 0, itemsWithoutPrice: 0 },
};

export default async function AgencePage() {
  if (!supabaseConfigured()) {
    return <AgenceHubView session={null} agency={EMPTY} />;
  }
  const [session, supabase] = await Promise.all([getSession(), createClient()]);
  const agency = await loadAgencyData(supabase);
  return <AgenceHubView session={session} agency={agency} />;
}
