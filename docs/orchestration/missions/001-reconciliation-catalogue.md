# Mission 001 — Réconcilier les offres et les documents

Statut : exécutée le 14 septembre 2026 par Claude Code, prête pour revue (Codex). Livrables : `../analyses/001-reconciliation-catalogue.md` et `../comptes-rendus/001-reconciliation-catalogue.md`, sur la branche `claude/laughing-fermat-bd7riu`. Le périmètre documentaire a été étendu à la demande d'Armel aux amendements des briefs 9.3 et 9.4, au brief 9.5 et à la mission 002. Responsable : Claude Code. Relecture proposée : Codex. Base d'analyse : commit `ada3eb29e526181a9e7cfd76306547f45c77efc9`. Type : documentation et analyse métier.

## Objectif

Préparer une source commerciale cohérente pour le constructeur d'offres et le générateur, en rendant explicites les contradictions à résoudre. Ne pas transformer les exemples des gabarits en tarifs approuvés.

## Sources à lire

Commencer par [l'analyse Claude existante](https://github.com/armel474/huntpilote-crm/blob/0e46e4bb56eb24f0734aca84ef6d57604e2e59e8/docs/analyse-generateur-propositions.md) sur la branche `claude/huntpilote-proposal-generator-5cc3id`. Elle n'est pas encore dans `main` au moment de préparer cette mission. Réutiliser ses constats et sa table de balises ; compléter les écarts et préciser les correspondances, sans réécrire une analyse générale.


- `docs/catalogue-agence.md`, `docs/reconciliation-donnees.md`, `supabase/seed.sql`.
- `docs/briefs/9-2-catalogue-offres.md`, `9-3-modeles-documents.md` et `9-4-generateur-documents.md` dans le même dossier.
- `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/hp-cat-data.jsx`, `hp-doc-gen-data.jsx` et `hp-tpl-data.jsx` dans le même dossier.
- `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html`.
- `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Acquisition Meta Ads.dc.html`.
- `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html`.
- `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Annexe A DigiHunt.html`.

Recontrôler les chemins et les évolutions depuis le commit de référence.

## Travail demandé

1. Comparer les offres web, SEO, maintenance et acquisition. Pour chaque écart : champ métier, valeur de chaque source, chemin et section, impact, recommandation et statut de décision.
2. Couvrir prix, taxes, quantité et limites, options exclusives, récurrence, remise, durée, délais, livrables, révisions, exclusions, échéances de paiement et budget média.
3. Identifier les fragments spécifiques à un ancien client dans les gabarits, sans recopier ses coordonnées dans un nouveau rapport.
4. Proposer un dictionnaire de variables avec sens métier, type, caractère requis, source envisagée et correspondance des syntaxes existantes. Signaler les correspondances ambiguës, notamment entreprise et contact, contact et signataire, nom complet et nom de famille, date d'expiration et durée de validité.
5. Préparer les corrections à reporter dans les briefs de design et le catalogue une fois les valeurs actées.

## Livrables

Créer `docs/orchestration/analyses/001-reconciliation-catalogue.md` avec la matrice des écarts, les questions métier regroupées et une recommandation pour chacune. Créer un compte rendu dans `docs/orchestration/comptes-rendus/001-reconciliation-catalogue.md`.

Périmètre de modification : ces deux documents et le statut de la mission. Les sources existantes servent de référence pendant cette comparaison. Les corrections de code, semis, gabarits et clauses relèvent de missions suivantes.

## Critères d'acceptation

- Chaque divergence renvoie à des sources précises ; une absence de donnée est indiquée comme telle.
- Faits, recommandations et choix confirmés sont distingués.
- Le rapport couvre notamment les limites des forfaits web, la maintenance, les honoraires Meta et le budget média, les contradictions de paiement et de périmètre SEO.
- Aucune valeur commerciale nouvelle n'est inventée.
- Le dictionnaire distingue client, contact, agence, opportunité, offre et document.
- Un autre outil peut reprendre le travail à partir du rapport et du commit, sans l'historique de conversation.

Vérification attendue : relecture des sources, contrôle des calculs cités et des liens. Pas de tests applicatifs pour cette mission documentaire. En présence d'une question métier, achever l'analyse et présenter la décision concrète à prendre ; ne pas arrêter la collecte des autres écarts.
