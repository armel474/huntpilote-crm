import type { Metadata } from 'next';
import { AgenceHubView } from '@/app/agence/AgenceHubView';
import { getSession } from '@/lib/auth';
import { loadAgencyData, type AgencyData } from '@/lib/queries/agence';
import { loadModelesData, type ModelesData } from '@/lib/queries/modeles';
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
const EMPTY_MODELES: ModelesData = { templates: [], samples: [] };

export default async function AgencePage() {
  if (!supabaseConfigured()) {
    return <AgenceHubView session={null} agency={EMPTY} modeles={EMPTY_MODELES} />;
  }
  const [session, supabase] = await Promise.all([getSession(), createClient()]);
  const [agency, modeles] = await Promise.all([loadAgencyData(supabase), loadModelesData(supabase)]);
  return <AgenceHubView session={session} agency={agency} modeles={modeles} />;
}
