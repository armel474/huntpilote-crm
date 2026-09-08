import type { Metadata } from 'next';
import { PrioriteDetailView } from '@/app/clients/[id]/priorites/[p]/PrioriteDetailView';
import { CLIENTS } from '@/lib/data/clients';
import { PRIORITIES } from '@/lib/data/fiche-client';

type Params = Promise<{ id: string; p: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, p } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Priorité ${p.toUpperCase()} · ${client?.name ?? 'Client'} — HuntPilote` };
}

/**
 * Le jeu de démonstration ne porte qu'un constat complet (P-0418) ; toutes
 * les priorités de la fiche mènent donc au même détail pour l'instant.
 */
export function generateStaticParams() {
  return CLIENTS.filter((c) => c.type === 'client').flatMap((c) =>
    PRIORITIES.map((p) => ({ id: c.id, p: p.id })),
  );
}

export default async function PrioriteDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <PrioriteDetailView clientId={id} />;
}
