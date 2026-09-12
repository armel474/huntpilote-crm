import type { Metadata } from 'next';
import { TravailView } from '@/app/travail/TravailView';
import { getSession } from '@/lib/auth';
import { loadOpenTasks } from '@/lib/queries/travail';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Mon plan de travail — HuntPilote' };
export const dynamic = 'force-dynamic';

export default async function TravailPage() {
  // Sans base configurée, ou sans personne connectée, l'écran rejoue la
  // démonstration : il n'y a rien de réel à montrer, et rien à cacher.
  if (!supabaseConfigured()) return <TravailView />;
  const session = await getSession();
  if (!session || session.kind !== 'membre') return <TravailView />;

  const supabase = await createClient();
  const tasks = await loadOpenTasks(supabase);
  return <TravailView tasks={tasks} me={session.initials} />;
}
