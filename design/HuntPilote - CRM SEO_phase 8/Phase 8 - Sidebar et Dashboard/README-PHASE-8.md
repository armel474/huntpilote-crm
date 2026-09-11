# HuntPilote — Phase 8 : sidebar unifiée et Dashboard portefeuille

Ce dossier contient **uniquement les fichiers modifiés pendant la phase 8**.
Les fichiers partagés déjà livrés dans les zips précédents (`hp-sidebar.jsx`,
`hp-shell.css`, `hp-mobile.css`, `hp-overlays.*`, `hp-search-data.jsx`,
`hp-notif-data.jsx`, `xp-data.jsx`, `rq-data.jsx`, `fc3-atoms.jsx`,
`fc3-panels.jsx`, `fc4-panels.jsx`, `ct-*`, `cm-*`, `qt-*`, `fonts/`, les autres
écrans du CRM) ne sont **pas inclus** ici — ils sont supposés déjà présents
dans le dépôt cible, non modifiés.

Trois fichiers de cette liste existaient déjà et ont été **modifiés** —
à écraser dans le dépôt avec les versions de ce zip :
`Client Hub.html`, `Fiche Client v4.html`, `Dashboard.html`.

## 8.1 — Sidebar unifiée

`Client Hub.html` et `Fiche Client v4.html` avaient chacun leur propre barre
latérale (respectivement un composant `Sidebar` local et un rail d'icônes
`fc4-nav` à 4 items) au lieu de la barre partagée rétractable
`hp-sidebar.jsx` / `hp-shell.css` déjà utilisée par tous les autres écrans.
Les deux écrans chargent maintenant `hp-sidebar.jsx` et rendent
`<NavSidebar active="clienthub" />` — même liste de navigation, même
comportement dépliée/compacte que le reste du CRM.

`Fiche Client v4.html` avait sa propre palette de jetons (`--bg-0`…`--bg-4`,
`--fg-1`…`--fg-4`, `--bd`, etc., distincte de `--bg-surface` / `--fg1` /
`--border` attendus par `hp-shell.css`) : des alias ont été ajoutés dans son
`:root` (`--fg1`, `--bg-surface`, `--border`, `--primary`, `--green-m`, `--blur`)
plutôt que de rejouer sa palette — aucune valeur de couleur existante n'a été
changée ailleurs sur l'écran.

`Client Hub.html` avait aussi 2 liens obsolètes vers `Fiche Client v2.html`
(ancienne itération) — corrigés vers `Fiche Client v4.html`, la fiche client
en ligne.

## 8.2 — Dashboard : le portefeuille en un coup d'œil

`Dashboard.html` gagne cinq blocs, en résumé avec lien de sortie — aucun ne
duplique un écran complet déjà en ligne :

- **Priorités critiques** — top 4 (sur le total réel) tirées de `xp-data.jsx`,
  lien vers `Priorites Transversales.html`.
- **Rapports à produire** — dus / publiés / en retard, calculés avec
  `rqScenario()` et `rqLate()` de `rq-data.jsx`, lien vers
  `Rapports a Produire.html`. Le retard est mis en évidence en rouge, jamais
  une couleur seule sans texte.
- **Intégrations** — miroir des 6 intégrations de `Parametres.html` ; toute
  intégration déconnectée est affichée en permanence avec son impact concret
  (vocabulaire repris de `ErrorIntegration` / `hp-states.jsx`, pas un point de
  couleur), lien vers `Parametres.html`.
- **Pipeline** — MRR proposé cumulé des deals en négociation (miroir des
  chiffres de `Pipeline.html`), lien vers `Pipeline.html`.
- **Devis & communications** — deux compteurs portefeuille (devis en attente,
  messages non lus), résumé agrégé léger par client — pas de fiche détaillée
  par compte, seule Acme Corp. en a une aujourd'hui. Chaque compteur ouvre
  `Fiche Client v4.html` directement sur l'onglet concerné (Contrat &
  facturation / Communications).

Tous les cinq prévoient un état sain (bannière verte, pas une absence) et
restent lisibles indépendamment les uns des autres. Rangés en deux rangées en
haut de l'écran, visibles sans défiler, avant les cartes déjà en ligne
(trafic, performance client, revenu, tâches — non modifiées).
