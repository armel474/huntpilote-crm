import type { Metadata } from 'next';
import { AuditComparaisonView } from '@/app/clients/[id]/audits/[a]/comparaison/AuditComparaisonView';
import { CLIENTS } from '@/lib/data/clients';
import { AUDIT } from '@/lib/data/audit';

type Params = Promise<{ id: string; a: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Comparer deux audits · ${client?.name ?? 'Client'} — HuntPilote` };
}

export function generateStaticParams() {
  return CLIENTS.filter((c) => c.type === 'client').map((c) => ({ id: c.id, a: AUDIT.slug }));
}

export default async function AuditComparaisonPage({ params }: { params: Params }) {
  const { id } = await params;
  return <AuditComparaisonView clientId={id} />;
}
