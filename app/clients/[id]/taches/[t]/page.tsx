import type { Metadata } from 'next';
import { TacheDetailView } from '@/app/clients/[id]/taches/[t]/TacheDetailView';
import { CLIENTS } from '@/lib/data/clients';
import { TASK_CONTENT, TASK_TECH } from '@/lib/data/tache';

type Params = Promise<{ id: string; t: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, t } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Tâche #${t} · ${client?.name ?? 'Client'} — HuntPilote` };
}

/**
 * Le jeu de démonstration porte deux tâches complètes ; la tâche #97 citée
 * par une priorité récurrente y mène également.
 */
export function generateStaticParams() {
  const slugs = [TASK_TECH.slug, TASK_CONTENT.slug, '97'];
  return CLIENTS.filter((c) => c.type === 'client').flatMap((c) =>
    slugs.map((t) => ({ id: c.id, t })),
  );
}

export default async function TacheDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <TacheDetailView clientId={id} />;
}
