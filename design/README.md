# Maquettes reçues de Claude Design

Ce dossier accueille les prototypes HTML produits en session de conception, **avant
implémentation**. Ils ne font pas partie de l'application : ils servent de
référence pour vérifier la fidélité du rendu, et de trace de ce qui a été décidé
visuellement.

## Convention de nommage

Un fichier par écran, préfixé du numéro de session qui l'a produit :

```
design/
  1-1-detail-priorite.html
  1-2-detail-tache.html
  1-3-editeur-rapport.html
  1-3-rapport-partageable.html
  ...
```

Le numéro fait le lien avec [`../docs/briefs/`](../docs/briefs/) : on retrouve
toujours le brief qui a produit une maquette.

## Le cycle

1. **Concevoir** — coller le brief `docs/briefs/N-M-*.md` dans Claude Design.
2. **Déposer** la maquette ici, sous le nom correspondant.
3. **Implémenter** — la maquette devient des composants React dans `app/` et
   `components/`.
4. **Vérifier** au navigateur, en thème clair et sombre.
5. **Commiter** la maquette et son implémentation ensemble, pour que le diff
   raconte l'histoire complète.

## Ce que ces fichiers ne sont pas

Ce sont des **prototypes**, pas du code de production. Ils utilisent React par CDN
et Babel dans le navigateur ; l'application, elle, est compilée. On reproduit leur
rendu, pas leur structure interne.

Une fois un écran implémenté et validé, sa maquette reste ici en référence — elle
ne se maintient pas. Si l'écran évolue dans l'application, la maquette devient
un document historique, pas une source de vérité.
