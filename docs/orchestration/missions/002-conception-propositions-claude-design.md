# Mission 002 — Concevoir le parcours de proposition (sessions 9.3 amendée, 9.4 amendée, 9.5)

- Statut : préparée le 14 septembre 2026, révisée le même jour après la revue de la pull request nº 2, prête à transmettre.
- Résultat utilisateur attendu : les maquettes HTML des écrans qui permettent de consigner un appel découverte, d'en tirer un brief corrigeable, de composer une proposition à sections depuis la fiche client ou l'opportunité, de la figer et de l'envoyer, avec tous leurs états.
- Responsable de modification : Claude Design.
- Relecteur : Codex (adéquation avec les données et les règles métier), puis Armel.
- Branche / commit de départ : `claude/laughing-fermat-bd7riu` (depuis `docs/orchestration-huntpilote`) ; base applicative `main` au commit `ada3eb2`.
- Dépendances : mission 001 exécutée (`../analyses/001-reconciliation-catalogue.md`). Les décisions D-01 à D-15 de cette analyse ne sont pas prises ; les maquettes montrent les deux hypothèses ou laissent une note, elles ne tranchent pas.

## Sources et décisions applicables

- Briefs : `docs/briefs/socle-partage.md`, `9-3-modeles-documents.md` (section « Amendements du 14 septembre 2026 »), `9-4-generateur-documents.md` (même section), `9-5-appel-decouverte.md`.
- Dictionnaire des variables et décisions ouvertes : `docs/orchestration/analyses/001-reconciliation-catalogue.md`, sections 5 et 6.
- Gabarits réels à coller pour la session 9.3 : `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html`, `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Acquisition Meta Ads.dc.html` (la proposition à deux phases, avec escompte et budget externe : c'est lui qui exerce les blocs conditionnels et les totaux par périodicité) et `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html`.
- Maquettes existantes à réutiliser (ne pas redessiner) : les versions les plus récentes de chaque écran, listées fichier par fichier dans « Fichiers à transmettre ». Règle de version : un fichier présent dans `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/` est la version à jour (le README de la phase 9 nomme ceux qu'elle a modifiés : `Pipeline.html`, `Fiche Client v4.html`, `fc3-panels.jsx`, `qt-panels.jsx`, `dl-sheet.jsx`, `pc-nav.jsx`) ; sinon la version de `design/HuntPilote - CRM SEO_phase 4 à 6/Phase 4-6 Handoff/` ; les fichiers de la phase 7 (`ct-*`, `cm-*`, `qt-data.jsx`) dans `design/HuntPilote - CRM SEO_phase 7/Phase 7 - Handoff/`.
- Décisions déjà prises : signature simple (nom tapé, date, IP) ; une seule action principale verte par écran ; `.client-doc` blanc pour tout rendu client ; les valeurs des maquettes ne sont pas des décisions commerciales (`CLAUDE.md`).
- Règles transversales issues de la revue : un champ du brief distingue « connu, inconnu, sans objet » de « relu, à relire » ; une valeur proposée depuis une autre donnée s'affiche comme proposition et se confirme visiblement avant de servir ; une recommandation d'offre ou d'option reste une suggestion jusqu'à un geste explicite ; accès au dossier, modification du brief et consommation d'IA sont trois autorisations distinctes ; les totaux sont séparés par périodicité, l'engagement est propre à chaque ligne récurrente, une remise montre pourcentage, assiette et montant, un budget externe porte sa période, un total estimé n'existe qu'avec un horizon et une liste de composants.

## Périmètre

Trois sessions Claude Design, une par brief, dans cet ordre : **9.5** (indépendante, deux écrans et deux cartes), **9.3 amendée** (l'éditeur avec sections et blocs conditionnels), **9.4 amendée** (le panneau de création complété et l'atelier de composition). Ne pas fusionner deux briefs dans une session.

Les exports vont dans un **nouveau dossier** `design/HuntPilote - CRM SEO_phase 9/Phase 9b - Propositions/`, avec un `README-PHASE-9B.md` sur le modèle de `README-PHASE-9.md`. Les exports originaux de la phase 9 ne sont pas écrasés : un fichier modifié est livré sous le même nom dans le nouveau dossier, et le README dit lesquels remplacent lesquels.

Hors périmètre : le code applicatif, les migrations, le semis, les gabarits originaux, le brief 9.2 (ses corrections attendent les décisions D-01 à D-05), l'IA elle-même (seulement ses états à l'écran).

## Travail et livrables

Pour chaque écran : le HTML et ses données de démonstration fictives, les états listés dans le brief (au minimum : vide, chargement, erreur actionnable, sauvegarde, reprise, droits insuffisants, verrouillé), les thèmes clair et sombre, et une note « données lues et écrites » et « transitions » dans le README. Les valeurs d'exemple qui dépendent d'une décision ouverte (maintenance recommandée, délais, échéancier, validité, escompte, budget média) portent la mention « exemple, non acté ».

## Critères d'acceptation

- Aucun écran existant n'est redessiné ; les classes du socle sont réutilisées, aucun suffixe de session.
- Le parcours complet se lit sans IA : appel consigné → brief rédigé à la main → proposition composée → envoyée → acceptée.
- Le brief se valide avec un résultat chiffré ou une zone cible inconnus ou sans objet, et l'écran distingue « relu » de « connu ».
- Aucune valeur n'est substituée à une autre sans une proposition visible et sa confirmation.
- La source « Depuis le brief » montre ses cinq états (aucune offre adaptée, plusieurs offres possibles, options non tranchées, recommandation indisponible, sélection manuelle).
- Le cas « accès au dossier en lecture, modification interdite » est dessiné, et l'autorisation d'IA n'ouvre jamais un dossier à elle seule.
- Les totaux sont séparés par périodicité ; l'engagement, la remise (pourcentage, assiette, montant), le budget externe (période) et le total estimé (horizon, composants) suivent la section 5.6 de l'analyse 001.
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
5. Le panneau de deal, version la plus récente et ses dépendances : `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/dl-sheet.jsx` (modifié en phase 9, remplace celui de la phase 4-6) et `Pipeline.html` ; `design/HuntPilote - CRM SEO_phase 4 à 6/Phase 4-6 Handoff/dl-data.jsx`, `dl-panels.jsx`, `dl-panel.css`.
6. La fiche client, version la plus récente et ses dépendances : `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/Fiche Client v4.html` et `fc3-panels.jsx` (modifiés en phase 9) ; `design/HuntPilote - CRM SEO/fc3-atoms.jsx` et `fc4-panels.jsx` ; pour l'onglet Communications, `design/HuntPilote - CRM SEO_phase 7/Phase 7 - Handoff/cm-data.jsx`, `cm-panels.jsx`, `cm-panel.css`.
7. Le socle : `design/HuntPilote - CRM SEO_phase 4 à 6/Phase 4-6 Handoff/hp-shell.css`, `hp-mobile.css`, `hp-states.css`, `hp-states.jsx`, `hp-overlays.css`, `hp-overlays.jsx`, `hp-sidebar.jsx`, `hp-search-data.jsx`, `hp-notif-data.jsx`.

Session 9.3 amendée :

8. `docs/briefs/9-3-modeles-documents.md` (intégral, amendements compris).
9. Les trois gabarits réels : `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html`, `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Acquisition Meta Ads.dc.html`, `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html`.
10. L'éditeur existant et ses dépendances, tous dans `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/` : `Agence Hub.html`, `hp-tpl-panels.jsx`, `hp-tpl-data.jsx`, `hp-doc-render.css`, `hp-agence-data.jsx`, `hp-agence-panels.jsx` (profil et composants partagés `AgField`, `AgSectionHead`), `hp-cat.css`, `README-PHASE-9.md`.
11. Le socle, comme au point 7.

Session 9.4 amendée :

12. `docs/briefs/9-4-generateur-documents.md` (intégral, amendements compris).
13. Le générateur existant et ses dépendances, tous dans `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/` : `Document.html`, `Portail Document.html`, `Portail Documents.html`, `hp-doc-gen-panels.jsx`, `hp-doc-gen-data.jsx`, `hp-doc-gen.css`, `hp-doc-render.css`, `hp-tpl-data.jsx` (modèles et rendu), `hp-cat-data.jsx` et `hp-cat-panels.jsx` (offres et carte d'offre), `hp-agence-data.jsx`, `hp-agence-panels.jsx`, `hp-cat.css`, `pc-nav.jsx` (modifié en phase 9), `dl-sheet.jsx`, `Pipeline.html`, `Fiche Client v4.html`, `fc3-panels.jsx`, `qt-panels.jsx` (modifié en phase 9).
14. Pour le portail et le devis existant : `design/HuntPilote - CRM SEO_phase 4 à 6/Phase 4-6 Handoff/pc-data.jsx`, `pc-portal.css`, `rp-doc.css`, `dl-data.jsx`, `dl-panels.jsx`, `dl-panel.css` ; `design/HuntPilote - CRM SEO_phase 7/Phase 7 - Handoff/qt-data.jsx`, `qt-panel.css`.
15. Le socle, comme au point 7.
16. Les exports de la session 9.5 une fois livrés (la source « Depuis le brief » en dépend).

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
> - Une valeur proposée depuis une autre donnée (raison sociale depuis le nom commercial, zone cible depuis la ville, signataire depuis le destinataire) s'affiche comme proposition et se confirme visiblement ; rien n'est substitué en silence. Une recommandation d'offre ou d'option reste une suggestion jusqu'à un geste explicite.
> - Trois autorisations distinctes : voir le dossier du client, modifier, consommer de l'IA. Dessine le cas « lecture autorisée, modification interdite » ; l'autorisation d'IA n'ouvre jamais un dossier à elle seule.
> - Données d'exemple fictives uniquement : aucun vrai client, contact, contrat ni transcription.
> - Livre dans `design/HuntPilote - CRM SEO_phase 9/Phase 9b - Propositions/` avec un `README-PHASE-9B.md` qui liste les fichiers créés, ceux qui remplacent un fichier de la phase 9, et pour chaque écran les données lues et écrites et les transitions.
>
> Commence par lire le brief en entier, puis les écrans joints, avant de dessiner. Si une consigne du brief contredit un écran existant, suis le brief et note l'écart dans le README.

### Complément à coller pour la session 9.5

> Pour cette session, deux écrans (consigner l'échange ; le brief de découverte) et deux cartes (panneau de deal ; Aperçu de la fiche). Chaque champ du brief a deux états séparés et visibles : ce qu'on sait (connu, inconnu, sans objet) et ce qu'on a relu (à relire, relu). « Valider le brief » exige que l'essentiel soit relu, pas connu : un résultat chiffré ou une zone cible inconnus ou sans objet ne bloquent pas, et l'écran le dit. Une valeur proposée depuis la fiche client (zone cible depuis la ville, secteur) s'affiche comme proposition avec « Confirmer » ou « Modifier », distincte d'une valeur confirmée. Les droits : accès au dossier, modification du brief, consommation d'IA sont trois choses ; dessine « lecture autorisée, modification interdite » avec tous les gestes d'écriture verrouillés et leur raison, y compris l'extraction. Le parcours sans IA est complet. Aucune transcription réelle : invente un échange fictif court et signale-le comme tel.
