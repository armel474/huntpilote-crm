import type { Metadata } from 'next';
import { ConnexionPortailView } from '@/app/portail/connexion/ConnexionPortailView';
import '@/app/portail/portail.css';

export const metadata: Metadata = {
  title: 'Connexion — Votre espace client HuntPilote',
  // Le portail d'un client n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

export default function PortailConnexionPage() {
  return <ConnexionPortailView />;
}
