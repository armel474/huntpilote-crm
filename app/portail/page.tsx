import type { Metadata } from 'next';
import { PortailView } from '@/app/portail/PortailView';
import { PORTAL_ACCOUNT } from '@/lib/data/portail';
import './portail.css';

export const metadata: Metadata = {
  title: `Votre espace client — ${PORTAL_ACCOUNT.client} · HuntPilote`,
  robots: { index: false, follow: false },
};

export default function PortailPage() {
  return <PortailView />;
}
