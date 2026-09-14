# Orchestration de HuntPilote

Créé le 14 septembre 2026 à la demande d'Armel. Ce dossier organise la collaboration entre Codex, Claude Code et Claude Design autour du dépôt. Il fournit une mémoire explicite et des missions transmissibles ; il ne crée pas de connexion automatique entre leurs sessions.

## Répartition proposée

| Intervenant | Responsabilité | Livrable |
|---|---|---|
| Armel | Vision, priorités, contenu commercial et choix métier | Objectif et arbitrages nécessaires |
| Codex | Cadrage produit, architecture, préparation des missions, revue et corrections | Brief, critères d'acceptation, analyse du diff et correctifs |
| Claude Design | Parcours, écrans, états, variantes et cohérence visuelle | Exports dans `design/`, liés à un brief |
| Claude Code | Réalisation technique des missions confiées | Code, migrations éventuelles, vérifications et compte rendu |

Ces rôles peuvent être réattribués explicitement selon la mission. La revue s'applique au code de tous les outils.

## Documents de référence

- `etat-projet.md` : état observé, contexte actuel, réserves et contribution Claude sur sa branche existante.
- `feuille-de-route.md` : ordre recommandé et critères de sortie.
- `missions/001-reconciliation-catalogue.md` : première mission préparée.
- `modeles/mission.md` et `modeles/compte-rendu.md` : formats réutilisables.
- `../briefs/` : exigences de conception des écrans ; continuer ce dossier existant.
- `../../design/` : maquettes et gabarits sources.
- `../passation-agence-hub.md`, `../modele-donnees.md`, `../catalogue-agence.md` et `../decisions.md` : documentation existante, avec son contexte historique.

Ne pas dupliquer un brief d'écran dans ce dossier. Une mission le référence et indique les modifications attendues. Ajouter les décisions datées dans le registre existant quand elles sont effectivement prises, en précisant ce qu'elles remplacent.

## Cycle d'une amélioration

1. Codex transforme le besoin en mission : résultat attendu, sources, périmètre, dépendances et critères observables.
2. Si le parcours change, préparer ou compléter le brief dans `docs/briefs/`. Claude Design produit les écrans et leurs états. Codex vérifie leur adéquation avec les données et les règles métier.
3. Claude Code ou Codex réalise une tranche fonctionnelle sur une branche dédiée. Réutiliser les maquettes adaptées et le schéma existant.
4. Le relecteur examine le diff d'un commit identifié, contrôle les critères d'acceptation et corrige ou décrit les écarts. Une capture ne prouve pas une écriture en base.
5. Le compte rendu transmet le résultat, les preuves et la prochaine action. Fusion et déploiement suivent l'autorisation de la session concernée.

Une mission documentaire peut se terminer sans exécuter de tests applicatifs. Pour une modification métier, choisir les vérifications qui prouvent son résultat : calcul, persistance, autorisations, non-régression ou rendu selon le risque.

## Travail dans un même environnement

Le dépôt est le point commun. Chaque outil peut ouvrir son propre clone ou worktree du même projet. Désigner un responsable par mission et indiquer les branches en cours dans les comptes rendus ; intégrer les contributions par Git.

Dans cette session, la transmission à Claude passe par les fichiers et les liens GitHub. Aucune commande Claude Code ni liaison Claude Design n'a été configurée. Un pilotage programmatique futur demande un environnement équipé et authentifié, un lanceur, une gestion des erreurs et un retour des résultats. Il doit réutiliser ces mêmes missions.

## Message pour reprendre

> Lis AGENTS.md, docs/orchestration/README.md et docs/orchestration/etat-projet.md. Compare le commit courant à celui de l'état documenté. Exécute la mission que je t'indique, respecte son périmètre et rends un compte rendu factuel. Si une décision métier manque, prépare l'arbitrage et poursuis les éléments indépendants. Ne suppose pas connaître les conversations des autres outils.
