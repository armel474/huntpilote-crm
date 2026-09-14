'use client';

import { Notice } from '@/app/parametres/bits';

export default function AgencyError({ reset }: { reset: () => void }) {
  return <>
    <Notice tone="err">Les informations de l’agence n’ont pas pu être chargées. Réessayez ; si le problème persiste, vérifiez votre connexion.</Notice>
    <button className="btn-out" type="button" onClick={reset}>Réessayer</button>
  </>;
}
