import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ParametresView } from '@/app/parametres/ParametresView';
import { getSession } from '@/lib/auth';
import { routes } from '@/lib/routes';
import { supabaseConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Paramètres — HuntPilote' };

// La page lit la session à chaque requête : elle ne peut pas être prérendue.
export const dynamic = 'force-dynamic';

/** Les sections qui ont déménagé dans l'Agence hub, et leur nouveau nom. */
const MOVED: Record<string, string> = { agence: 'profil', catalogue: 'catalogue', equipe: 'equipe' };

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  // Un ancien lien vers le profil, le catalogue ou l'équipe mène désormais à
  // l'Agence hub, sans page intermédiaire.
  if (section && MOVED[section]) redirect(routes.agence(MOVED[section]));

  const session = supabaseConfigured() ? await getSession() : null;
  return <ParametresView session={session} />;
}
