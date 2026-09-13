# HuntPilote — Phase 9 : Agence hub (profil, équipe, catalogue, modèles, générateur)

Ce dossier contient **uniquement les fichiers créés ou modifiés pendant la phase 9**
(sessions 9.1 à 9.4). Les fichiers partagés déjà livrés dans les zips précédents
(`hp-sidebar.jsx`, `hp-shell.css`, `hp-states.*`, `hp-mobile.css`,
`hp-overlays.*`, `hp-search-data.jsx`, `hp-notif-data.jsx`, `dl-panel.css`,
`dl-data.jsx`, `dl-panels.jsx`, `qt-data.jsx`, `pc-data.jsx`, `pc-portal.css`,
`rp-doc.css`, `fonts/`, les autres écrans du CRM et du portail) ne sont **pas
inclus** ici — ils sont supposés déjà présents dans le dépôt cible.

Cinq fichiers existants ont été **modifiés** et doivent écraser les versions
du dépôt : `Pipeline.html`, `Fiche Client v4.html`, `fc3-panels.jsx`,
`qt-panels.jsx`, `dl-sheet.jsx`, `pc-nav.jsx`.

## Contenu, par session

**9.1 — Cadre de l'Agence hub**
- `Agence Hub.html` — écran hôte : navigation par section (Profil, Équipe,
  Catalogue, Offres, Modèles de documents, Documents), accueil en cartes.
- `hp-agence-data.jsx` — profil d'agence, équipe, droits (`AG_RIGHTS`),
  rôles par défaut et surcharges par membre.
- `hp-agence-panels.jsx` — Profil (logo, coordonnées, taxes), Équipe (fiche
  membre, droits, invitation, prembelle connexion), composants partagés
  (`AgField`, `AgBdg`, `AgSectionHead`, etc.).

**9.2 — Catalogue et constructeur d'offres**
- `hp-cat-data.jsx` — 39 articles (produits/services), 6 offres réelles
  (forfaits web + packs SEO) avec lignes, groupes d'options, offres incluses,
  tâches et livrables générés à la vente.
- `hp-cat-panels.jsx` — écran Catalogue (tableaux réordonnables, panneau
  d'édition), écran Offres (liste + constructeur deux colonnes avec aperçu
  partagé `OfferCard`).
- `hp-cat.css` — tableaux, sections repliables, cartes d'offre.

**9.3 — Modèles de documents**
- `hp-tpl-data.jsx` — 6 sortes de documents, 5 modèles HTML réels (mustache
  `{{groupe.champ}}` / blocs `{{#bloc}}…{{/bloc}}`), dictionnaire de balises,
  analyseur de balises inconnues, données d'exemple (SHGM).
- `hp-tpl-panels.jsx` — écran Modèles (liste par sorte), éditeur trois
  colonnes (réglages, code avec numéros de ligne, aperçu `.client-doc` avec
  sélecteur de client d'exemple), dictionnaire des balises.
- `hp-doc-render.css` — rendu `.client-doc` / `.cdoc-*`, éditeur de code.

**9.4 — Le générateur (devis, contrat, annexe, facture)**
- `hp-doc-gen-data.jsx` — statuts généralisés, 13 documents chaînés de
  démonstration (proposition → contrat → facture/annexe), calcul des taxes.
- `hp-doc-gen-panels.jsx` — panneau « Nouveau document » (sorte, contenu
  depuis une offre / un document existant / lignes libres, particularités,
  aperçu avec balises non remplies signalées), écran Documents de l'Agence hub.
- `hp-doc-gen.css` — mise en page du document et de la colonne latérale.
- `Document.html` — écran `/documents/[id]` : rendu figé, statut, chaîne,
  versions, journal, verrou fiscal (TPS/TVQ manquantes), « Créer la suite ».
- `Portail Document.html` — écran du portail client : le document, geste
  d'acceptation (devis/proposition) ou signature simple (contrat).
- `Portail Documents.html` — liste des documents du client dans le portail,
  nouvel onglet « Documents ».
- *(modifiés)* `Pipeline.html` / `dl-sheet.jsx` — bouton « Nouveau document »
  dans le panneau de deal (étapes Proposition/Négociation).
- *(modifiés)* `Fiche Client v4.html` / `fc3-panels.jsx` / `qt-panels.jsx` —
  le bouton « Nouveau devis » de l'onglet Contrat & facturation ouvre
  désormais le panneau générateur généralisé (« Nouveau document »).

## Frontière respectée

Le devis à un client déjà signé (session 7.3, `qt-data.jsx` / `QuoteSheet`)
n'a pas été redessiné — seul son geste de création a été remplacé par le
générateur, qui l'alimente maintenant via les offres du catalogue et les
modèles de l'agence.
