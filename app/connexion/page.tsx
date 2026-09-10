import type { Metadata } from 'next';
import { ConnexionView } from '@/app/connexion/ConnexionView';
import './connexion.css';

export const metadata: Metadata = {
  title: 'Connexion — HuntPilote',
  // Un outil interne n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return <ConnexionView />;
}
