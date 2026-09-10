import type { Metadata } from 'next';
import { PortailRapportsView } from '@/app/portail/rapports/PortailRapportsView';
import { PORTAL_ACCOUNT } from '@/lib/data/portail';
import '@/app/portail/portail.css';

export const metadata: Metadata = {
  title: `Vos rapports — ${PORTAL_ACCOUNT.client} · HuntPilote`,
  robots: { index: false, follow: false },
};

export default function PortailRapportsPage() {
  return <PortailRapportsView />;
}
