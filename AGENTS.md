# Consignes communes — HuntPilote

## Démarrage

Lire `docs/orchestration/README.md`, `docs/orchestration/etat-projet.md`, puis la mission confiée. Lire les briefs, le code et les instructions propres aux répertoires concernés avant de modifier leurs fichiers. Les anciennes conversations ne constituent pas une mémoire partagée entre outils.

La demande actuelle d'Armel définit le périmètre. Distinguer dans chaque travail : comportement constaté, décision actée, recommandation et question métier. Une ancienne passation ou une donnée de démonstration ne remplace pas une instruction plus récente.

## Méthode

- Une mission bornée, un responsable de modification, une branche. Pour du travail simultané, utiliser des worktrees ou des clones séparés ; ne pas modifier les mêmes fichiers dans une copie partagée.
- Réutiliser le schéma, les composants et les briefs existants. Justifier les ajouts de tables ou de dépendances par un manque vérifié.
- Avancer sur les actions réversibles déjà autorisées sans redemander permission. Lorsqu'une décision métier manque, préparer une proposition sourcée et continuer les tâches indépendantes.
- Relire le diff, vérifier les comportements concernés et fournir un compte rendu avec le commit examiné. Ne pas présenter une maquette comme une fonctionnalité connectée.
- Ne pas déduire d'une mission de documentation une autorisation de déploiement ou de modification de données de production.

## Conventions existantes à préserver

Français dans l'interface, la documentation, les commentaires et les commits. Pas d'identifiant de modèle d'IA dans le dépôt. Pas de force push ni d'amend sur un commit poussé. Aucun secret ni fichier d'environnement dans Git.

Pour du code applicatif, lire `docs/passation-agence-hub.md`, notamment sa section 2. Chargement serveur par écran, requêtes dans `lib/queries`, écritures par actions serveur avec le client de la requête sous RLS. Garder `supabaseConfigured()` aux points d'entrée. Une écriture sans ligne retournée n'est pas une réussite.

Pour une migration, lire `supabase/README.md` : ne pas réécrire une migration appliquée ; valider localement avant application en ligne ; séparer ajout de valeur d'enum et utilisation ; régénérer les types lorsque le schéma change ; vérifier l'audit de sécurité. Conserver les invariants de publication explicite, d'immuabilité des documents concernés et d'idempotence.

Les instructions d'environnement dans les anciennes passations sont des observations datées : vérifier les capacités de la session présente. Les données de découverte client restent dans le stockage privé de l'application ; utiliser des exemples fictifs dans ce dépôt.

## Fin de mission

Indiquer : résultat, fichiers, branche et commit, vérifications réellement exécutées, limites, décisions restantes et prochaine action. Mettre à jour l'état du projet uniquement avec des faits vérifiés. Utiliser `docs/orchestration/modeles/compte-rendu.md`.
