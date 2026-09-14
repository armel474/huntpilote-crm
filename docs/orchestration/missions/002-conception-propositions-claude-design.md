# Mission 002 — Concevoir le parcours de proposition (sessions 9.3 amendée, 9.4 amendée, 9.5)

- Statut : préparée le 14 septembre 2026, prête à transmettre.
- Résultat utilisateur attendu : les maquettes HTML des écrans qui permettent de consigner un appel découverte, d'en tirer un brief corrigeable, de composer une proposition à sections depuis la fiche client ou l'opportunité, de la figer et de l'envoyer, avec tous leurs états.
- Responsable de modification : Claude Design.
- Relecteur : Codex (adéquation avec les données et les règles métier), puis Armel.
- Branche / commit de départ : `claude/laughing-fermat-bd7riu` (depuis `docs/orchestration-huntpilote`) ; base applicative `main` au commit `ada3eb2`.
- Dépendances : mission 001 exécutée (`../analyses/001-reconciliation-catalogue.md`). Les décisions D-01 à D-15 de cette analyse ne sont pas prises ; les maquettes montrent les deux hypothèses ou laissent une note, elles ne tranchent pas.

## Sources et décisions applicables

- Briefs : `docs/briefs/socle-partage.md`, `9-3-modeles-documents.md` (section « Amendements du 14 septembre 2026 »), `9-4-generateur-documents.md` (même section), `9-5-appel-decouverte.md`.
- Dictionnaire des variables et décisions ouvertes : `docs/orchestration/analyses/001-reconciliation-catalogue.md`, sections 5 et 6.
- Gabarits réels à coller pour la session 9.3 : `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html` et `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html`.
- Maquettes existantes à réutiliser (ne pas redessiner) : dossier `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/` (`Document.html`, `Portail Document.html`, `hp-doc-gen-panels.jsx`, `hp-doc-gen-data.jsx`, `hp-tpl-panels.jsx`, `hp-tpl-data.jsx`, `hp-doc-gen.css`, `hp-doc-render.css`, `dl-sheet.jsx`, `fc3-panels.jsx`, `Fiche Client v4.html`, `Pipeline.html`) et le socle des phases précédentes (`hp-shell.css`, `hp-mobile.css`, `hp-states.css`, `hp-states.jsx`, `hp-overlays.css`, `hp-overlays.jsx`, `dl-panel.css`, `dl-panels.jsx` dans `design/HuntPilote - CRM SEO_phase 4 à 6/Phase 4-6 Handoff/`).
- Décisions déjà prises : signature simple (nom tapé, date, IP) ; une seule action principale verte par écran ; `.client-doc` blanc pour tout rendu client ; les valeurs des maquettes ne sont pas des décisions commerciales (`CLAUDE.md`).

## Périmètre

Trois sessions Claude Design, une par brief, dans cet ordre : **9.5** (indépendante, deux écrans et deux cartes), **9.3 amendée** (l'éditeur avec sections et blocs conditionnels), **9.4 amendée** (le panneau de création complété et l'atelier de composition). Ne pas fusionner deux briefs dans une session.

Les exports vont dans un **nouveau dossier** `design/HuntPilote - CRM SEO_phase 9/Phase 9b - Propositions/`, avec un `README-PHASE-9B.md` sur le modèle de `README-PHASE-9.md`. Les exports originaux de la phase 9 ne sont pas écrasés : un fichier modifié est livré sous le même nom dans le nouveau dossier, et le README dit lesquels remplacent lesquels.

Hors périmètre : le code applicatif, les migrations, le semis, les gabarits originaux, le brief 9.2 (ses corrections attendent les décisions D-01 à D-05), l'IA elle-même (seulement ses états à l'écran).

## Travail et livrables

Pour chaque écran : le HTML et ses données de démonstration fictives, les états listés dans le brief (au minimum : vide, chargement, erreur actionnable, sauvegarde, reprise, droits insuffisants, verrouillé), les thèmes clair et sombre, et une note « données lues et écrites » et « transitions » dans le README. Les valeurs d'exemple qui dépendent d'une décision ouverte (maintenance recommandée, délais, échéancier, validité, escompte, budget média) portent la mention « exemple, non acté ».

## Critères d'acceptation

- Aucun écran existant n'est redessiné ; les classes du socle sont réutilisées, aucun suffixe de session.
- Le parcours complet se lit sans IA : appel consigné → brief rédigé à la main → proposition composée → envoyée → acceptée.
- Un texte modifié à la main n'est jamais réécrit par un geste de la maquette ; la suggestion IA est à côté, jamais à la place.
- Les montants ponctuels, récurrents et informatifs sont distincts partout où un total s'affiche.
- La version envoyée est visiblement figée ; « Corriger » crée une version.
- Les transcriptions, briefs bruts et légendes n'apparaissent dans aucun rendu client.
- Chaque état du brief 9.5 et des amendements 9.3 et 9.4 est présent ou explicitement écarté avec la raison.
- Aucune donnée réelle (client, contact, contrat, transcription) dans les exports.

## Questions restantes

Les quinze décisions de l'analyse 001, section 6. Aucune ne bloque la conception : chaque brief indique comment montrer les deux hypothèses. Les décisions D-01, D-06, D-07, D-13 et D-14 sont celles que les maquettes rendront visibles, avec une note.

## Transmission

Compte rendu attendu de Codex après revue des exports, dans `docs/orchestration/comptes-rendus/002-conception-propositions.md` : fichiers livrés, écarts avec les briefs, corrections demandées, prochaine mission (intégration, étapes 2 à 4 de la feuille de route).

---

## Fichiers à transmettre à Claude Design

À coller ou joindre dans chaque session, dans cet ordre. Les chemins sont ceux du dépôt sur la branche `claude/laughing-fermat-bd7riu`.

Communs aux trois sessions :

1. `docs/briefs/socle-partage.md` (intégral).
2. `docs/orchestration/analyses/001-reconciliation-catalogue.md`, section 5 « Dictionnaire des variables » et section 6 « Décisions à prendre ».
3. Le message de lancement ci-dessous.

Session 9.5 :

4. `docs/briefs/9-5-appel-decouverte.md` (intégral).
5. `design/HuntPilote - CRM SEO_phase 4 à 6/Phase 4-6 Handoff/dl-sheet.jsx` et `dl-panels.jsx` (le panneau de deal à compléter), `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/fc3-panels.jsx` et `Fiche Client v4.html` (l'Aperçu et les Communications de la fiche).

Session 9.3 amendée :

6. `docs/briefs/9-3-modeles-documents.md` (intégral, amendements compris).
7. `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html` et `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html` (les vrais modèles).
8. `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/hp-tpl-panels.jsx`, `hp-tpl-data.jsx`, `hp-doc-render.css` (l'éditeur existant à amender).

Session 9.4 amendée :

9. `docs/briefs/9-4-generateur-documents.md` (intégral, amendements compris).
10. `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/Document.html`, `Portail Document.html`, `hp-doc-gen-panels.jsx`, `hp-doc-gen-data.jsx`, `hp-doc-gen.css` (le générateur existant à amender).
11. Les exports de la session 9.5 une fois livrés (la source « Depuis le brief » en dépend).

Ne pas transmettre : `supabase/seed.sql` ni aucune donnée réelle ; `GABARIT - Annexe A DigiHunt.html` (il contient les éléments d'un mandat existant ; le modèle d'annexe se dessine depuis les blocs de données décrits dans l'analyse) ; les fichiers `uploads/` de `design/`.

## Message de lancement pour Claude Design

À coller tel quel en tête de chaque session, suivi des fichiers de la session.

> Projet HuntPilote, cockpit de livraison client d'une agence web et SEO québécoise. Trente-huit écrans existent et sont intégrés ; la phase 9 (Agence hub) est maquettée dans `design/HuntPilote - CRM SEO_phase 9/`. Tu conçois la suite : le parcours de proposition, qui part de la fiche client ou de l'opportunité, passe par un brief tiré de l'appel découverte, compose une proposition à sections, la fige et l'envoie.
>
> Règles de cette session :
> - Reprends le socle visuel tel quel (`socle-partage.md`) : base beige `#F2EFEA`, vert `#16A34A` pour l'unique action principale, violet `#7C3AED` réservé à l'IA, thème clair et sombre, `.client-doc` blanc pour tout ce que le client verra. Réutilise les écrans existants que je te joins ; ajoute, ne redessine pas.
> - Le brief de la session fait foi, y compris sa section « Amendements du 14 septembre 2026 » quand elle existe. Le dictionnaire des variables de l'analyse 001 donne le nom et le sens de chaque balise.
> - Les décisions notées D-01 à D-15 ne sont pas prises. Là où une valeur en dépend, montre-la comme un exemple avec la mention « exemple, non acté », ou montre les deux états.
> - Le parcours doit fonctionner sans IA. L'IA aide à comprendre, recommander et rédiger ; sa proposition s'affiche à côté du texte courant, jamais à la place, et un texte modifié par une personne est toujours conservé.
> - Distingue partout montants ponctuels, récurrents et informatifs (budget média payé à un tiers, jamais facturé par l'agence). Une version envoyée est figée ; une correction crée une version.
> - Dessine tous les états du brief : vide, chargement, erreur qui dit quoi faire, sauvegarde et reprise, droits insuffisants (bouton verrouillé qui reste à sa place et dit pourquoi), verrouillage d'une version envoyée, remplacement par une nouvelle version.
> - Données d'exemple fictives uniquement : aucun vrai client, contact, contrat ni transcription.
> - Livre dans `design/HuntPilote - CRM SEO_phase 9/Phase 9b - Propositions/` avec un `README-PHASE-9B.md` qui liste les fichiers créés, ceux qui remplacent un fichier de la phase 9, et pour chaque écran les données lues et écrites et les transitions.
>
> Commence par lire le brief en entier, puis les écrans joints, avant de dessiner. Si une consigne du brief contredit un écran existant, suis le brief et note l'écart dans le README.
