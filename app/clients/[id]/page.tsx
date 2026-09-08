import type { Metadata } from 'next';
import { FicheClientView } from '@/app/clients/[id]/FicheClientView';
import { CLIENTS } from '@/lib/data/clients';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `${client?.name ?? 'Fiche client'} — HuntPilote` };
}

export function generateStaticParams() {
  return CLIENTS.map((c) => ({ id: c.id }));
}

export default async function FicheClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FicheClientView clientId={id} />;
}
