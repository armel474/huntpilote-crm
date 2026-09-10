# HuntPilote — Phase 3 : SEO local

Ce dossier contient **uniquement les fichiers créés ou modifiés pendant la phase 3**
(sessions 3.1 à 3.3). Les fichiers partagés déjà existants avant la phase 3
(`au-data.jsx`, `au-panels.jsx`, `au-audit.css`, `hp-shell.css`, `hp-mobile.css`,
`to-panels.jsx`, `to-results.jsx`, `to-shell.css`, `fonts/`, les autres écrans du
CRM) ne sont **pas inclus** ici — ils sont supposés déjà présents dans le dépôt
cible. Un seul fichier de cette liste existait déjà et a été **modifié** :
`hp-sidebar.jsx` (ajout de l'entrée « SEO local » dans la barre latérale) — à
écraser dans le dépôt avec la version de ce zip.

## Contenu, par écran

**Vue d'ensemble locale (3.1)** — `SEO Local.html`
KPI de portefeuille, file « Ce qui demande une action » (avis négatif sans
réponse, fiche suspendue, chute de position, incohérence détectée), liste des
établissements filtrable par client et triable (urgence / score / note), et
rappel des clients sans établissement suivi.

**Fiche d'établissement (3.1)** — `Fiche Etablissement.html`
Complétude de la fiche Google Business (9 champs, seuil 9/9, lien de retour
vers l'audit qui l'a relevée), éditeur de zone desservie à trois modes — point
et rayon, liste de secteurs, grille de points avec estimation de coût — et
états bloquants pour fiche non revendiquée / suspendue / revendiquée par un
tiers. `lo-data.jsx` / `lo-panels.jsx` / `lo-audit.css` sont le socle partagé
des cinq écrans de la phase (portefeuille d'établissements, icônes, jetons
d'état).

**Avis (3.2)** — `Avis.html`, `lo-avis-data.jsx`, `lo-avis-panels.jsx`
Note moyenne et tendance avec répartition par étoile, analyse de tonalité par
l'agent, flux d'avis (sans réponse en tête) et réponse assistée reprenant à
l'identique le mécanisme « Libellé client » déjà utilisé sur le détail d'une
priorité et la clôture d'une tâche : brouillon violet, pastille à relire/validé,
« ✦ Régénérer », aperçu cerné d'un pointillé tant que rien n'est publié. Cas
particuliers : avis signalé (faux), avis sans texte.

**Citations et annuaires (3.2)** — `Citations.html`, `lo-citations-data.jsx`, `lo-citations-panels.jsx`
Référence officielle (nom, adresse, téléphone), liste d'annuaires triée par
gravité puis par autorité de la source, détail champ par champ des
incohérences, doublons de fiche mis en évidence, geste « créer une priorité »
ou « créer une tâche » par incohérence.

**Positions locales (3.3)** — `Positions.html`, `lo-positions-data.jsx`, `lo-positions-panels.jsx`
Carte de la zone (grille de points ou secteurs selon le mode configuré),
chaque point lisible en couleur ET en chiffre, tableau requête par requête
(moyenne / meilleure / pire / évolution), lecture par secteurs forts et
faibles, alerte de forte variance géographique, renvoi vers l'éditeur de zone
si elle n'est jamais configurée.

**Concurrence locale (3.3)** — `Concurrence.html`, `lo-concurrence-data.jsx`, `lo-concurrence-panels.jsx`
Concurrents rencontrés dans le pack local classés par fréquence d'apparition,
leviers concrets (avis, complétude apparente, catégories), recoupement par
requête et par secteur, écarts actionnables avec création de priorité.

## Dépendances à conserver dans le dépôt cible

Chaque écran charge, dans cet ordre : `hp-sidebar.jsx` → `au-data.jsx` →
`lo-data.jsx` → `lo-panels.jsx` (socle partagé SEO local) → le trio propre à
l'écran (`lo-avis-*`, `lo-citations-*`, `lo-positions-*`, `lo-concurrence-*`)
quand il existe. Feuilles de style : `hp-shell.css`, `hp-mobile.css`,
`au-audit.css`, `to-shell.css` (pour `.seg`, `.banner`, `.inp`) et `lo-audit.css`
propre à la phase. Rien de tout cela n'est dupliqué dans ce zip à part
`hp-sidebar.jsx`, explicitement modifié.

## Frontière avec l'audit

Les critères de présence en ligne (complétude Google Business, cohérence
nom·adresse·téléphone, citations, avis sans réponse) reprennent mot pour mot
les libellés et seuils de `au-data.jsx` (dimension `presence` de `AUDIT`) —
établissement `acme-siege` sert de fil conducteur d'un bout à l'autre de la
phase pour le vérifier.
