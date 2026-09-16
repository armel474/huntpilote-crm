import type { Metadata } from 'next';
import { ClientHubView } from '@/app/clients/ClientHubView';
import { getSession } from '@/lib/auth';
import { loadClientHub } from '@/lib/queries/clients';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Client Hub — HuntPilote' };

// La page lit la base à chaque requête, avec les droits de la personne
// connectée : elle ne peut pas être prérendue.
export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  // Sans variables d'environnement, l'écran tourne sur son jeu de
  // démonstration, comme avant la base.
  if (!supabaseConfigured()) return <ClientHubView />;

  const [session, supabase] = await Promise.all([getSession(), createClient()]);
  const data = await loadClientHub(supabase);
  return (
    <ClientHubView
      entries={data.entries}
      kpis={data.kpis}
      subtitle={data.subtitle}
      signedOut={!session}
    />
  );
}
