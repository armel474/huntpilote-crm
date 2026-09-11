'use client';

/**
 * Garde des commandes de démonstration.
 *
 * Chaque écran porte un sélecteur « Démo · état » qui sert à concevoir et à
 * vérifier ses variantes (chargement, vide, erreur, permission). C'est un
 * outil de conception, pas une fonctionnalité : il n'a rien à faire dans une
 * application en ligne devant un vrai client.
 *
 * Règle retenue : **visible en développement, absent en production**, sans
 * configuration à faire au déploiement. `npm run dev` les montre, un build de
 * production les retire. Pour les garder sur un déploiement de préversion —
 * une démo commerciale, une revue de design partagée —, poser
 * `NEXT_PUBLIC_DEMO_UI=on` dans l'environnement ; pour les masquer en local,
 * `NEXT_PUBLIC_DEMO_UI=off`.
 *
 * Masquer le sélecteur ne change rien à l'état affiché : chaque écran reste
 * sur son scénario par défaut (« normal »), celui qui correspond au
 * fonctionnement réel.
 */

const FLAG = process.env.NEXT_PUBLIC_DEMO_UI;

/** Vrai quand les commandes de démonstration doivent s'afficher. */
export const DEMO_UI = FLAG === 'on' || (FLAG !== 'off' && process.env.NODE_ENV === 'development');

/**
 * N'affiche ses enfants que lorsque les commandes de démonstration sont
 * actives. Enveloppe le groupe complet — libellé compris —, jamais le seul
 * `<select>`, sinon il reste un libellé orphelin dans la sous-barre.
 */
export function DemoOnly({ children }: { children: React.ReactNode }) {
  if (!DEMO_UI) return null;
  return <>{children}</>;
}
