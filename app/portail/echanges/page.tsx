import type { Metadata } from 'next';
import { PortailEchangesView } from '@/app/portail/echanges/PortailEchangesView';
import { PORTAL_ACCOUNT } from '@/lib/data/portail';
import '@/app/portail/portail.css';

export const metadata: Metadata = {
  title: `Échanges — ${PORTAL_ACCOUNT.client} · HuntPilote`,
  robots: { index: false, follow: false },
};

export default function PortailEchangesPage() {
  return <PortailEchangesView />;
}
