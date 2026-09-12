import type { Metadata } from 'next';
import { ParametresView } from '@/app/parametres/ParametresView';
import { getSession } from '@/lib/auth';
import { loadAgencyData } from '@/lib/queries/agence';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Paramètres — HuntPilote' };

// La page lit la base à chaque requête, avec les droits de la personne
// connectée : elle ne peut pas être prérendue.
export const dynamic = 'force-dynamic';

export default async function ParametresPage() {
  const [session, supabase] = await Promise.all([getSession(), createClient()]);
  const agency = await loadAgencyData(supabase);
  return <ParametresView session={session} agency={agency} />;
}
