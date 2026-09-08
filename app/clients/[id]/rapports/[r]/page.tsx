import type { Metadata } from 'next';
import { EditeurRapportView } from '@/app/clients/[id]/rapports/[r]/EditeurRapportView';
import { CLIENTS } from '@/lib/data/clients';
import { REPORT } from '@/lib/data/rapport';

type Params = Promise<{ id: string; r: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Rapport ${REPORT.period} · ${client?.name ?? 'Client'} — HuntPilote` };
}

/** Une seule période complète dans le jeu de démonstration. */
export function generateStaticParams() {
  return CLIENTS.filter((c) => c.type === 'client').map((c) => ({ id: c.id, r: REPORT.slug }));
}

export default async function EditeurRapportPage({ params }: { params: Params }) {
  const { id } = await params;
  return <EditeurRapportView clientId={id} />;
}
