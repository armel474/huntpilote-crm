import type { Metadata } from 'next';
import { AuditProspectView } from '@/app/audit-prospect/[token]/AuditProspectView';
import { AUDIT_PROSPECT } from '@/lib/data/audit-prospect';
import './audit-prospect.css';

export const metadata: Metadata = {
  title: `Audit de prospect — ${AUDIT_PROSPECT.name}`,
  description: "Document commercial partageable : ce que l'audit organique révèle et son potentiel chiffré.",
  // Un audit de prospect nommé n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

/** Le lien remis au prospect est un jeton opaque ; un seul document est disponible dans la démo. */
export function generateStaticParams() {
  return [{ token: AUDIT_PROSPECT.token }];
}

export default function AuditProspectPage() {
  return <AuditProspectView />;
}
