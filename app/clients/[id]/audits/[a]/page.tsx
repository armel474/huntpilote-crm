import type { Metadata } from 'next';
import { AuditDetailView } from '@/app/clients/[id]/audits/[a]/AuditDetailView';
import { CLIENTS } from '@/lib/data/clients';
import { AUDIT } from '@/lib/data/audit';

type Params = Promise<{ id: string; a: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const client = CLIENTS.find((c) => c.id === id);
  return { title: `Audit ${AUDIT.id} · ${client?.name ?? 'Client'} — HuntPilote` };
}

/**
 * Le jeu de démonstration ne porte qu'un audit complet ; les audits
 * antérieurs de l'historique y mènent aussi.
 */
export function generateStaticParams() {
  const slugs = ['tech-q2', ...AUDIT.history.map((h) => h.id.toLowerCase())];
  return CLIENTS.filter((c) => c.type === 'client').flatMap((c) =>
    slugs.map((a) => ({ id: c.id, a })),
  );
}

export default async function AuditDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <AuditDetailView clientId={id} />;
}
