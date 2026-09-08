import type { Metadata } from 'next';
import { RapportClientView } from '@/app/r/[token]/RapportClientView';
import { REPORT } from '@/lib/data/rapport';
import './rapport.css';

export const metadata: Metadata = {
  title: `Rapport ${REPORT.period} — ${REPORT.client}`,
  description: 'Votre rapport mensuel : ce qui a changé sur votre site.',
  // Un rapport client n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

/**
 * Le lien remis au client est un jeton opaque ; une seule période est
 * disponible dans le jeu de démonstration.
 */
export function generateStaticParams() {
  return [{ token: REPORT.token.replace('r/', '') }];
}

export default function RapportClientPage() {
  return <RapportClientView />;
}
