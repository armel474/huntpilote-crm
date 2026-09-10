import type { Metadata } from 'next';
import { ContenuView } from '@/app/clients/[id]/contenu/ContenuView';
import { CLIENTS } from '@/lib/data/clients';
import { CONTENU_CLIENT } from '@/lib/data/contenu';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Calendrier éditorial · ${client?.name ?? CONTENU_CLIENT.name} — HuntPilote` };
}

export function generateStaticParams() {
  return CLIENTS.filter((c) => c.type === 'client').map((c) => ({ id: c.id }));
}

export default async function ContenuPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ContenuView clientId={id} />;
}
