import type { Metadata } from 'next';
import { BriefDetailView } from '@/app/clients/[id]/contenu/[b]/BriefDetailView';
import { CLIENTS } from '@/lib/data/clients';
import { CONTENU_IDS } from '@/lib/data/contenu';
import { BRIEF } from '@/lib/data/brief';

type Params = Promise<{ id: string; b: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Brief ${BRIEF.id.toUpperCase()} · ${client?.name ?? BRIEF.client} — HuntPilote` };
}

/**
 * Le jeu de démonstration ne porte qu'un brief complet (`a-105`, voir
 * `lib/data/brief.ts`) ; les huit identifiants de contenu du calendrier y
 * mènent tous — même convention que le détail d'audit ou de tâche.
 */
export function generateStaticParams() {
  return CLIENTS.filter((c) => c.type === 'client').flatMap((c) => CONTENU_IDS.map((b) => ({ id: c.id, b })));
}

export default async function BriefDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <BriefDetailView clientId={id} />;
}
