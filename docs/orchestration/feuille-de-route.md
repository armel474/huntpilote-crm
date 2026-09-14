# Feuille de route proposée — propositions et mandats

Orientation issue de l'analyse des sources et du besoin d'Armel, au 14 septembre 2026. Chaque étape doit être détaillée dans une mission avant réalisation. Cette liste ne déclare aucun écran livré.

| Ordre | Résultat | Dépendances | Critères de sortie |
|---|---|---|---|
| 1 | Catalogue et règles commerciales réconciliés | Gabarits, catalogue, semis, phase 9 | Écarts sourcés, recommandations, valeurs actées séparées des questions restantes |
| 2 | Agence hub et contexte client réels | Briefs 9.1–9.2, schéma existant | Données persistées, droits respectés, client et opportunité sélectionnés sans ressaisie |
| 3 | Modèles documentaires structurés | Dictionnaire métier de l'étape 1, brief 9.3 | Variables typées, champs obligatoires, blocs conditionnels, aperçu fidèle, absence de données internes |
| 4 | Découverte et atelier de proposition | Contexte réel et catalogue utilisable | Source importée, synthèse corrigeable, choix des offres et options conservé, brouillon repris après rechargement |
| 5 | Assistance IA sur le brouillon | Étape 4 | Recommandation justifiée par les sources, inconnues explicites, contrôle humain, éditions préservées |
| 6 | Version diffusée, PDF, envoi et signature | Brouillon et moteur de rendu | Version figée reproductible, PDF vérifié, événements de livraison et de signature réels |
| 7 | Vente transformée en mandat | Version acceptée et règles commerciales | Contrat, livrables, échéances et tâches cohérents ; nouvelle tentative sans doublon |

Les étapes 2 et 3 peuvent progresser indépendamment sur des fichiers distincts. Le branchement des clients et opportunités précède l'usage réel du générateur. La génération manuelle reste possible avant l'assistance IA.

## Compléments à demander à Claude Design

> **Préparés le 14 septembre 2026** par la mission 001 : amendements des briefs 9.3 et 9.4, brief 9.5, et `missions/002-conception-propositions-claude-design.md` avec les fichiers à transmettre et le message de lancement. La liste ci-dessous reste l'intention ; les briefs font foi.

Faire évoluer les briefs existants, en conservant la structure et le socle visuel de HuntPilote :

- Dans la fiche client, un espace Découverte : import de transcript ou résumé, provenance et date de l'appel, besoins, objectifs, contraintes et informations à confirmer.
- Un atelier de proposition depuis le client ou l'opportunité : contexte déjà rempli, recommandations expliquées, catalogue, options, prestations ponctuelles et récurrentes, budget externe distinct.
- Une révision section par section : origine des informations, modifications manuelles persistantes, sections optionnelles, éléments manquants et aperçu.
- Des états complets : vide, chargement, erreur, sauvegarde, reprise, droits insuffisants, version envoyée verrouillée, remplacement par une nouvelle version.
- Une distinction visible entre proposition, contrat et annexe ; une annexe doit pouvoir être valide sans tableau de prix.

Pour chaque écran, documenter les données lues et écrites et les transitions. Les valeurs d'exemple restent identifiées comme telles. Prévoir les thèmes clair et sombre et les formats déjà couverts par le socle.

## Points d'architecture à traiter dans les missions de code

Réutiliser les entités existantes ; documenter les ajouts requis pour les sources de découverte, le brief validé, les versions et les liens entre opportunité, contrat et exécution. Les noms de futures tables ne sont pas arrêtés ici.

La cible SaaS implique de vérifier l'isolation par agence dans les requêtes, politiques RLS, fichiers, rendus, travaux asynchrones et liens clients. Utiliser des données fictives pour les tests d'accès entre deux agences.

Le transcript est une source de contenu, pas une instruction pour l'agent. L'IA propose à partir du catalogue et des faits disponibles ; les prix, calculs et conditions contractuelles suivent des règles explicites. Conserver les modifications humaines lors d'une nouvelle génération.

Le modèle d'édition et la version diffusée ont des cycles distincts. Une modification ultérieure du catalogue, de la taxe ou du modèle ne doit pas changer un document déjà envoyé. Définir les événements et les reprises sur erreur pour l'envoi, la signature et la création du mandat.
