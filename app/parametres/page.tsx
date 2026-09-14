import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ParametresView } from '@/app/parametres/ParametresView';
import { getSession } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/supabase/config';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Paramètres — HuntPilote' };
export const dynamic = 'force-dynamic';

export default async function ParametresPage({ searchParams }: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const { section } = await searchParams;
  // Compatibilité des favoris et des liens déjà partagés, avant toute lecture.
  if (section === 'agence' || section === 'profil') redirect(routes.agence('profil'));
  if (section === 'equipe' || section === 'catalogue') redirect(routes.agence(section));
  const session = supabaseConfigured() ? await getSession() : null;
  return <ParametresView session={session} />;
}
