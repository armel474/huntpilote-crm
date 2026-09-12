import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ConnexionView } from '@/app/connexion/ConnexionView';
import './connexion.css';

export const metadata: Metadata = {
  title: 'Connexion — HuntPilote',
  // Un outil interne n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  // `useSearchParams` côté client exige une frontière Suspense au prérendu.
  return (
    <Suspense>
      <ConnexionView />
    </Suspense>
  );
}
