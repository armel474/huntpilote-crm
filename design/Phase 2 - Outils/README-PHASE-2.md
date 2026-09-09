# HuntPilote — Phase 2 : cadre des outils SEO

Ce dossier contient **uniquement les fichiers créés ou modifiés pendant la phase 2**
(sessions 2.1 à 2.6). Les fichiers partagés déjà existants avant la phase 2
(`au-data.jsx`, `au-panels.jsx`, `au-audit.css`, `hp-mobile.css`, `fonts/`, les
autres écrans du CRM) ne sont **pas inclus** ici — ils sont supposés déjà présents
dans le dépôt cible. Trois fichiers de cette liste existaient déjà et ont été
**modifiés** : `Parametres.html`, `hp-sidebar.jsx`, `hp-shell.css` — à écraser
dans le dépôt avec les versions de ce zip.

## Contenu, par écran

**Cadre commun (session 2.1)**
- `Cadre Outils.html` — coquille de démonstration du cadre partagé par les 7 outils.
- `to-panels.jsx`, `to-results.jsx`, `to-shell.css` — sous-barre de contexte
  (compte, filtre clients/prospects, domaine éditable, période, coût, action
  « Enregistrer dans la fiche »), bandeaux d'état, colonnes latérales génériques
  (conservation, coût, derniers enregistrements). Réutilisés par tous les outils.

**Site Audit (2.2)** — `Site Audit.html`, `sa-data.jsx`, `sa-panels.jsx`, `sa-audit.css`
Résumé de crawl, 5 familles de constats repliables (indexation, erreurs, on-page,
performance, structure), création de priorité à trois échelles (famille / constat
/ page). 8 états de démo.

**Position Tracking (2.3)** — `Position Tracking.html`, `pt-*`
Mouvements notables, répartition par tranche de position, courbe d'évolution,
gestion de la liste suivie (ajout/retrait/thème), coût mensuel par palier de
mots-clés suivis (pas en crédits par requête).

**Backlink Analyse (2.3)** — `Backlink Analyse.html`, `bl-*`
Profil (domaines référents, ancres), gains/pertes de la période comme vue
principale, liens toxiques avec désaveu, comparaison concurrents. « Verser au
rapport » distinct de « créer la priorité ».

**Keyword Hunter (2.4)** — `Keyword Hunter.html`, `kh-*`
Champ de départ + filtres, suggestions groupées par thème, sélection multiple,
gestes « ajouter au suivi de positions » et « créer un brief d'article ».

**Keyword Gap (2.4)** — `Keyword Gap.html`, `kg-*`
Client + jusqu'à 3 concurrents gérables en direct, 4 catégories (Manquants /
Faibles / Forts / Uniques), manquants à fort volume mis en avant.

**Domain Overview (2.5)** — `Domain Overview.html`, `do-*`
Dashboard dense en grille (trafic, mots-clés, autorité, top pages/requêtes,
géo), lisible d'un coup d'œil. Action contextuelle : Créer un prospect / Déjà
au pipeline / Rattacher à un prospect existant.

**Organic Research (2.5)** — `Organic Research.html`, `or-*`
Évolution trafic + positions sur 24 mois avec décrochage daté, requêtes
filtrables, pages qui progressent/reculent, encart « Potentiel estimé ».
Sortie : « Générer un audit de prospect ».

**Audit Prospect (2.5)** — `Audit Prospect.html`
Document partageable statique (one-pager), généré depuis Organic Research —
plus léger que le rapport client mensuel, pensé comme argument commercial.

**Suivi de consommation (2.6)** — intégré dans `Parametres.html`
**Ce n'est pas un des 7 outils** : pas de sélecteur de compte, pas les actions
constantes du cadre. C'est une vue agence sur tous les comptes, ajoutée comme
**6ᵉ onglet** de Paramètres (après Abonnement), dans le style exact des cinq
autres onglets (`SectionHead`, `.card`, `Bdg`, `.fld`) — pas de composants du
cadre outils. `Parametres.html` fourni ici remplace la version du dépôt.

## Petits ajustements faits en cours de route

- **Bug de fragmentation de texte** : des libellés comme « 17 pages » ou
  « +8 » éclataient en plusieurs nœuds texte à l'intérieur d'un conteneur
  `flex` + `gap`, ce qui insérait l'espacement du `gap` au milieu du texte
  (« 17 page s »). Corrigé en regroupant chaque libellé dans un seul élément.
- **Bouton imbriqué** : l'action « Créer la priorité · famille » était un
  `<span role="button">` à l'intérieur du `<button>` d'en-tête de famille
  (Site Audit) — sortie du bouton parent pour respecter la sémantique.
- **`ContextBar` étendu** (`to-panels.jsx`), de façon non destructive :
  `periods` / `periodLabel` personnalisables, `costText` / `costTitle` pour
  un coût qui ne s'exprime pas en « crédits » (ex. Position Tracking),
  `saveHint` pour le message d'un bouton désactivé, et `action` pour
  remplacer entièrement le bouton « Enregistrer dans la fiche » par une
  action contextuelle (ex. Domain Overview : « Créer un prospect »).
- **Bug latent dans `Banner`** (`to-panels.jsx`) : l'objet de bandeaux était
  construit en accédant à `quota.used` sans condition, ce qui plantait le
  rendu dès qu'un bandeau *autre* que `quota` s'affichait sans qu'un objet
  `quota` soit fourni (repéré sur Organic Research). Corrigé avec une valeur
  de repli.
- **Sidebar** (`hp-sidebar.jsx` + `hp-shell.css`) : l'outil actif est
  maintenant surligné en vert dans la sous-liste « Outil » de la barre
  latérale (`activeTool="Nom de l'outil"` sur `<NavSidebar>`), pour qu'on
  sache toujours dans quel outil on se trouve.
- **Suivi de consommation** a été construit une première fois comme 8ᵉ outil
  autonome (fichiers `co-*`), puis **entièrement repensé** en 6ᵉ onglet de
  Paramètres suite à une clarification : ce n'est pas un outil du cadre
  commun. Les anciens fichiers `co-*.jsx/css` et la page autonome ont été
  supprimés ; les données et panneaux ont été réécrits directement dans
  `Parametres.html` avec ses propres composants (`SectionHead`, `Bdg`, `.fld`,
  `Field`) plutôt qu'avec `ASec`/`APill` du cadre outils.

## Dépendances à conserver dans le dépôt cible

Chaque écran d'outil charge, dans cet ordre : `hp-sidebar.jsx` → `au-data.jsx`
→ `au-panels.jsx` (jetons, icônes, `CritRow`, `ASec`/`APill` partagés) →
`to-panels.jsx` / `to-results.jsx` (cadre commun) → son propre trio
`xx-data.jsx` / `xx-panels.jsx` / `xx-audit.css`. Et les feuilles de style
`hp-shell.css`, `hp-mobile.css`, `au-audit.css`, `to-shell.css` en plus de la
CSS propre à l'outil. Rien de tout cela n'est dupliqué dans ce zip à part les
trois fichiers explicitement modifiés.
