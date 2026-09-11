# HuntPilote — Phase 7 : contacts, communications, devis

Ce dossier contient **uniquement les fichiers créés ou modifiés pendant la phase 7**
(sessions 7.1 à 7.3). Les fichiers partagés déjà livrés dans le zip de la phase
4-6 (`fc3-atoms.jsx`, `hp-overlays.*`, `hp-search-data.jsx`, `hp-notif-data.jsx`,
`hp-mobile.css`, `pc-thread-data.jsx`, `fonts/`, les autres écrans du CRM) ne
sont **pas inclus** ici — ils sont supposés déjà présents dans le dépôt cible.

Quatre fichiers de cette liste existaient déjà et ont été **modifiés** :
`Fiche Client v4.html`, `fc3-panels.jsx`, `fc4-panels.jsx`, `Parametres.html` —
à écraser dans le dépôt avec les versions de ce zip.

Toute la phase 7 vit dans un seul écran hôte : **`Fiche Client v4.html`**. Il
n'y a pas de nouvelle page — les trois sessions ajoutent des panneaux latéraux
et un onglet à cet écran existant.

## Contenu, par session

**7.1 — Les contacts d'un client**
- `ct-data.jsx` — contacts de démonstration (Acme Corp.), un principal désigné.
- `ct-panels.jsx` — bloc « Contacts » du panneau de gauche (remplace l'ancien
  bloc « Contact » unique), panneau « Tous les contacts », fiche d'un contact
  en panneau latéral (coordonnées, canal préféré, notes internes, marquer
  principal / archiver).
- `ct-panel.css` — mécanique de panneau latéral (scrim + sheet) et styles de
  champs, réutilisés aussi par les sessions 7.2 et 7.3.

**7.2 — Communications**
- `cm-data.jsx` — canaux (courriel, portail, WhatsApp, Messenger, appel,
  réunion, note, Slack), ancres de contexte, fil agence de démonstration.
- `cm-panels.jsx` — nouvel onglet « Communications » : fil chronologique unique
  tous canaux (fusionne le fil du portail client via `pc-thread-data.jsx` —
  même donnée, pas une copie), distinction visible/interne sur chaque ligne,
  composer avec confirmation obligatoire avant tout envoi visible du client,
  rattachement à une priorité/un rapport/une facture/un contact, filtres
  canal/contact/période, 4 états (aucune, active, en attente, long historique).
- `cm-panel.css` — styles du fil, du composer et des filtres.
- *(modifié)* `fc4-panels.jsx` — l'ancien tableau « Historique des
  communications » de l'onglet Rapports est remplacé par un renvoi vers ce
  nouvel onglet (une seule source de vérité).
- *(modifié)* `Parametres.html` — Slack, WhatsApp et Messenger ajoutés à la
  liste des intégrations (non connectés), et l'onglet Intégrations peut être
  ouvert directement via `?section=integrations` (utilisé par le geste de
  connexion depuis Communications).

**7.3 — Devis**
- `qt-data.jsx` — statuts (brouillon/envoyé/accepté/refusé/expiré), devis de
  démonstration, calcul TPS/TVQ.
- `qt-panels.jsx` — section « Devis » de l'onglet Contrat & facturation
  (liste, geste « Nouveau devis »), document `.qt-doc` (même langage visuel
  que `.client-doc` : toujours blanc, même en thème sombre), versions à la
  manière du rapport client (un devis envoyé est verrouillé — une correction
  crée une nouvelle version).
- `qt-panel.css` — panneau latéral large pour le document et ses lignes de
  service.
- *(modifié)* `fc3-panels.jsx` — `PanelContrat` gagne un historique de
  factures (lecture seule) et la section Devis ; un devis accepté se lie
  visiblement au plan actif affiché plus haut dans l'onglet.

## Frontière respectée

Le devis de vente initiale du panneau de deal (pipeline, session 4.4) n'a pas
été touché — cette phase couvre uniquement les devis émis à un client déjà
signé.
