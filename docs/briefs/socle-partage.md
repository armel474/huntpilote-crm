# Le socle partagé — ce qui existe déjà et se réutilise

Ce fichier n'est pas un brief. C'est l'inventaire du vocabulaire visuel **déjà
implémenté** dans l'application après la phase 1. Chaque brief y renvoie.

**Pourquoi il existe.** Sur les six premiers écrans, Claude Design a réinventé
trois fois la même chose sous trois noms — `vis-row` puis `vis-row-t`,
`client-doc` puis `client-doc-t`, `fld-t` puis `fld-r` — et a retapé les jetons
de couleur dans chaque fichier. Une de ces recopies a introduit un chiffre
devanagari dans une valeur hexadécimale (`#5F5F६8`), sans conséquence parce
qu'elle était redéclarée juste après. La quatrième recopie ne le sera peut-être
pas.

Colle le contenu ci-dessous dans la session Claude Design **avec** le brief.

---

## Ce qui ne se retape pas

Les jetons de couleur, la typographie, `.card`, `.btn-pri`, `.btn-out`, `.lbl`,
`.pill`, `.sc`, le header et la barre latérale existent dans les feuilles
partagées `hp-shell.css` et `hp-mobile.css`. **Charge-les, ne les recopie pas
dans un bloc `<style>`.** Si un écran a besoin de styles nouveaux, il les ajoute
à la suite — il ne redéclare pas `:root`.

## Les classes qui existent — réutilise-les telles quelles

### Mise en page

| Classe | Rôle |
|---|---|
| `.app-shell` `.main` | Coquille : barre latérale + colonne principale |
| `.crm-header` | Header contextuel avec fil d'Ariane |
| `.subbar` | Sous-barre sous le header : retour, filtres, sélecteur de démo |
| `.detail-row` | Rangée à deux colonnes d'un écran de détail |
| `.col-main` | Colonne qui s'étire |
| `.col-side` | Panneau latéral 340px · `.col-side.narrow` pour 320px |
| `.sc` | Zone défilante |

> ⚠️ **`.content` est déjà pris** et veut dire autre chose ailleurs dans
> l'application. Pour une rangée à deux colonnes, c'est `.detail-row`.

### Atomes

| Classe | Rôle |
|---|---|
| `.card` | Carte pleine, bord et ombre |
| `.pill` | Étiquette dense — sévérité, statut, compteur |
| `.lbl` | Libellé de section en petites capitales |
| `.btn-pri` `.btn-out` `.btn-sm` | Bouton plein, contour, compact |
| `.btn-main` | Action principale verte pleine (voir plus bas) |
| `.state-sel` `.date-sel` | Sélecteur arrondi de la sous-barre |
| `.menu` | Menu déroulant d'actions secondaires |
| `.note-box` | Encart explicatif en pied de carte |
| `.empty` | État vide encadré en pointillés |
| `.track` `.fill` | Jauge de progression |
| `.seg` | Sélecteur segmenté — état par `data-on="true"` |
| `.fld-t` | Champ de saisie long (texte, libellé, mesure) |

### Lignes de liste — le point important

Quatre écrans ont déjà une ligne « un constat, sa mesure, son geste ». **C'est la
même ligne.** Ne la redessine pas :

| Classe | D'où elle vient | Ce qu'elle porte |
|---|---|---|
| `.crit` | Audit | Icône de statut, critère, mesure **et seuil**, note, bouton « créer la priorité » |
| `.step-row` | Tâche | Case à cocher, libellé, gain, initiales du responsable |
| `.proof-row` | Rapport | Case à cocher, titre, texte client, état de relecture |
| `.cmp-row` | Comparaison | Critère, valeur avant, valeur après, geste |

Un résultat d'outil qui peut devenir une priorité, c'est `.crit`. Une ligne de
mots-clés cochable, c'est `.step-row`. Pars de celles-là.

### Tableaux

Les tableaux sont en `display: grid`, pas en `<table>` : l'alignement reste sous
contrôle et une cellule peut contenir une jauge.

- `.tbl` sur le conteneur, `.td` sur chaque cellule
- `.tbl-4` ou `.tbl-6` selon le nombre de colonnes : sous 900px, les colonnes
  secondaires **disparaissent** au lieu de comprimer les libellés
- `.keep-2` sur une grille qui ne doit jamais tomber à une seule colonne

### Le document client

`.client-doc` — le rendu blanc de ce que le client verra, **qui reste blanc même
en thème sombre** parce que c'est son document, pas notre interface. Il existe
déjà dans le détail d'une priorité et dans la clôture d'une tâche. Toute nouvelle
prévisualisation client passe par lui.

### Le cadre commun des outils — depuis la phase 2

Sept écrans (Site Audit, Position Tracking, Backlink Analyse, Keyword Hunter,
Keyword Gap, Domain Overview, Organic Research) partagent le même cadre, conçu
une seule fois en session 2.1. **Un écran nouveau rattaché à un client** —
fiche d'établissement, positions locales, avis — commence probablement par ce
cadre plutôt que d'en redessiner un.

| Composant | Rôle |
|---|---|
| `ContextBar` | Sélecteur de compte (clients/prospects/tous), domaine éditable, période, coût de la requête, **une seule** action constante — enregistrer dans la fiche |
| `Banner` | Cinq états qui bloquent ou avertissent : non connecté, erreur, quota, prospect, aucune sélection |
| `KeepCard` / `CostCard` / `SavesCard` | Colonne latérale : ce qui sera conservé (voir le marqueur, règle 3 de `decisions.md`), le coût, l'historique enregistré dans la fiche |

**Le sélecteur de compte pointe vers de vrais comptes**, jamais une liste de
noms inventée pour la démo — sinon « enregistrer dans la fiche » ne mène nulle
part. Les prospects y figurent au même titre que les clients (décision 3).

**Ce qui n'entre PAS dans ce cadre :** un écran agence, sans sélecteur de
client ni les deux actions constantes — la Consommation en est l'exemple. Ne
le mets pas dans le dropdown « Outil » ni sous une route `/outils/...`, et son
fil d'Ariane ne doit jamais laisser croire qu'il suit les mêmes règles qu'un
outil.

---

## Règles d'écriture du HTML

**Un état = un attribut `data-*`.** Le socle utilise `data-on="true"`,
`data-st="fail|warn|ok|na"`, `data-kind="regress|improve|new"`. Pas de classe
`.on` en parallèle : les deux conventions ont cohabité sur deux écrans, il faut
en garder une.

**Pas de sélecteur CSS sur un style en ligne.** Des règles comme
`[style*="grid-template-columns: 1fr 1fr"]` fonctionnent dans une maquette et
cassent dès que l'espacement du style change. Donne une vraie classe aux
éléments qui doivent réagir au responsive.

**Aucune police propriétaire.** Le premier lot contenait `Consolas.ttf`, une
police Microsoft sous licence. Pour le monospace : `ui-monospace,
SFMono-Regular, Menlo, Consolas, monospace`.

**Un nom de classe, un seul.** Si une classe existe déjà pour ce que tu dessines,
reprends-la. Ne crée pas `-t`, `-r`, `-2` ni aucun suffixe de session.

**Le lien « créer la priorité » d'une ligne est une fonction du contenu de la
ligne, jamais une constante.** Sur un tableau ou une liste, chaque ligne doit
calculer son propre lien (`prioHref(ligne)`, pas un `prioHref` unique passé au
tableau) — sinon toutes les lignes pointent vers la même priorité. Ce bug est
passé inaperçu deux fois (le détail d'audit en phase 1, puis reproduit dans les
premiers outils de la phase 2) avant d'être corrigé partout.

---

## Les deux conventions figées par la phase 1

Elles sont dans [`../decisions.md`](../decisions.md), rappelées ici parce
qu'elles s'appliquent à chaque écran.

### Une seule action principale par écran, en vert plein

`.btn-main` : vert plein, pleine largeur, un seul par écran. C'est le geste qui
fait avancer la boucle de livraison d'un cran — *assigner au plan d'action*,
*terminer et produire la preuve*, *publier le rapport*. Tout le reste est en
contour.

Quand ce geste est bloqué, **le bouton reste à sa place, verrouillé**, et l'écran
dit ce qui manque et où. Il ne disparaît pas.

Un écran qui en porterait deux a un problème de conception, pas de style.

### Une mesure s'affiche toujours avec son seuil

`LCP 4,2 s` ne dit rien. `4,2 s · seuil ≤ 2,5 s · 3,6 s au dernier audit` se lit
sans expertise. Partout où une mesure apparaît, le seuil retenu l'accompagne, et
le relevé précédent quand il existe.

C'est aussi ce qui fait qu'un statut ne repose jamais sur la seule couleur : le
mot (« hors seuil »), l'icône et le chiffre disent la même chose trois fois.
