# État de référence pour la reprise

Observation du 14 septembre 2026, dépôt `armel474/huntpilote-crm`, commit `ada3eb29e526181a9e7cfd76306547f45c77efc9`. Recontrôler le code et la branche au démarrage : ce document n'est pas un constat en temps réel de la production.

## Intention exprimée par Armel

HuntPilote évolue du CRM et cockpit interne vers un SaaS. La proposition de services doit partir de la fiche client et d'une opportunité, exploiter le transcript ou résumé de l'appel découverte, permettre le choix ou la recommandation d'une offre du catalogue de l'agence, puis la révision des sections, la génération PDF et l'envoi avec signature si nécessaire.

Armel souhaite confier à Codex le cadrage et la revue, avec des missions transmissibles à Claude Design et Claude Code. L'orientation est acquise ; les choix commerciaux contradictoires dans les sources ne sont pas arbitrés par cette intention.

## Ce qui est présent

| Élément | État observé ou documenté | Conséquence |
|---|---|---|
| Application | Next.js, React, TypeScript, Supabase | Étendre l'application existante |
| Connexion des écrans | Passation du 12 septembre : lecture réelle pour Paramètres et Travail ; écriture pour Paramètres. Clients et Pipeline utilisent encore les données de démonstration dans le code examiné | Brancher les données nécessaires au parcours de proposition |
| Schéma métier | Catalogue, offres, devis, versions, contrats, livrables et tâches existent | Auditer les manques avant une migration |
| Phase 9 | Maquettes ajoutées dans `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/` | Reprendre ces exports ; leur présence ne prouve pas leur intégration |
| Gabarits commerciaux | Offre web, Acquisition Meta Ads, contrat et Annexe A ajoutés dans `design/` | Sources à réconcilier et à convertir en sections et variables |
| Découverte et recommandation | Parcours souhaité, absent des fonctions opérationnelles examinées | Préparer le brief et le modèle d'information |
| Export et signature du prototype | Impression navigateur et changements d'état de démonstration | Aucun service PDF serveur ni preuve de signature opérationnelle n'a été établi |

La passation documente Vercel et une authentification existante. Certaines décisions plus anciennes parlent encore de VPS et d'application durablement mono-utilisateur : ne pas les reprendre comme état courant. La cible SaaS nécessite un examen explicite de l'isolation entre agences et des droits ; elle ne prouve pas que ces propriétés sont déjà complètes.

## Points issus de l'analyse à conserver

- Les contenus et délais des forfaits divergent entre catalogue, semis, maquettes et gabarits. Préparer une matrice sourcée avant de changer les données commerciales.
- Les prestations de maintenance et l'offre Meta Ads ne sont pas entièrement représentées par les six offres de démonstration. Séparer honoraires de l'agence et budget média externe.
- L'Annexe A contient des éléments propres à un mandat existant et des exclusions qui peuvent contredire une offre web. Les sélectionner selon le périmètre vendu.
- Trois syntaxes de variables coexistent : majuscules entre doubles accolades, champs entre crochets, noms structurés avec un point. Distinguer personne de contact et entreprise.
- Le prototype ne conserve pas toutes les sélections du générateur et réduit une offre à une ligne. Il utilise un acompte fixe ; l'Annexe A est mal adaptée à la validation de lignes.
- Le moteur de démonstration ne signale pas correctement les valeurs manquantes ou les blocs inconnus et n'échappe pas toutes les valeurs injectées. Formaliser le rendu sûr avant un usage réel.
- Les pages A4 de hauteur fixe avec contenu masqué peuvent tronquer un texte long. La légende interne doit être absente de toute version client, web compris.
- Figer les données, règles tarifaires, taxes, sections et rendu des versions envoyées. Les métadonnées de version seules ne suffisent pas.
- Vérifier les liens opportunité → proposition → contrat → abonnement/tâches. La déduplication des tâches doit distinguer deux mandats d'un même client.
- Réconcilier les événements d'acompte, de solde et de publication entre les différents documents. L'analyse de cohérence ne constitue pas une validation juridique.

## Prochaine mission préparée

`missions/001-reconciliation-catalogue.md` : produire une comparaison exploitable des sources et les décisions nécessaires. Cette mission est prête à être confiée ; elle n'a pas encore été exécutée. Les travaux indépendants sur le socle Agence hub et les données clients peuvent faire l'objet de missions séparées.

## Contribution Claude déjà présente sur une autre branche

La branche `claude/huntpilote-proposal-generator-5cc3id`, examinée au commit `0e46e4bb56eb24f0734aca84ef6d57604e2e59e8`, ajoute `docs/analyse-generateur-propositions.md` par rapport à la base ci-dessus. Aucune pull request ouverte n'a été trouvée lors de cette vérification.

[Lire l'analyse existante](https://github.com/armel474/huntpilote-crm/blob/0e46e4bb56eb24f0734aca84ef6d57604e2e59e8/docs/analyse-generateur-propositions.md). Elle couvre déjà la découverte, la composition, les versions, les liens métier et une correspondance des balises. La mission 001 doit compléter ce travail par une matrice détaillée des divergences commerciales et corriger les correspondances ambiguës, sans refaire l'analyse générale. Les propositions de schéma et de signature de ce document restent à examiner dans les missions concernées.
