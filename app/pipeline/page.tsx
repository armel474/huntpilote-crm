import type { Metadata } from 'next';
import { PipelineView } from '@/app/pipeline/PipelineView';
import { getSession } from '@/lib/auth';
import { loadPipeline } from '@/lib/queries/pipeline';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Pipeline commercial — HuntPilote' };

// La page lit la base à chaque requête, avec les droits de la personne
// connectée : elle ne peut pas être prérendue.
export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  // Sans variables d'environnement, l'écran tourne sur son jeu de
  // démonstration, comme avant la base.
  if (!supabaseConfigured()) return <PipelineView />;

  const [session, supabase] = await Promise.all([getSession(), createClient()]);
  const data = await loadPipeline(supabase);
  return (
    <PipelineView
      deals={data.deals}
      owners={data.owners}
      details={data.details}
      live={session?.kind === 'membre'}
      who={session?.fullName || undefined}
      signedOut={!session}
    />
  );
}
