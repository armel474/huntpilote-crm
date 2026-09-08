# Session 2.1 — Le cadre commun des outils

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.** Il liste
les classes déjà implémentées et réutilisables : la ligne de constat, les
tableaux en grille, le document client, la sous-barre, les deux colonnes d'un
écran de détail. Six écrans existent déjà — n'en redessine aucun morceau.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une mesure ne s'affiche jamais sans son seuil** ; **une
seule action principale verte par écran**, tout le reste en contour.

L'application repose sur une boucle : **Audit → Priorité → Tâche → Preuve de
valeur → Rapport client**. L'audit couvre trois dimensions — présence en ligne,
SEO, design. Une priorité appartient toujours à l'une des trois.

---

## La session la plus importante de la séquence

Tu conçois ici **un cadre réutilisé par sept écrans d'outils**. Si ce cadre change
après avoir dessiné trois outils, tu redessines trois outils. Prends le temps.

L'écran à produire est une **coquille démonstrative** : le cadre complet, avec un
outil fictif simple à l'intérieur (une liste de résultats quelconque) qui sert
seulement à montrer comment le contenu s'y insère.

## La décision de structure à respecter

Les outils sont **rattachés à un client**, pas autonomes. Mais on n'entre pas dans
un outil depuis une fiche : on ouvre l'outil, puis on choisit le compte.

## Frontière avec ce qui existe déjà

La phase 1 a livré six écrans. Trois morceaux du cadre y sont **déjà dessinés et
implémentés** — reprends-les, ne les réinvente pas :

| Ce dont le cadre a besoin | Ce qui existe | Où le voir |
|---|---|---|
| La barre de contexte sous le header | `.subbar` | Détail d'une priorité, détail d'une tâche |
| Une ligne de résultat qui devient une priorité | `.crit` | Détail d'audit |
| Un tableau dense qui tient sur mobile | `.tbl` + `.tbl-4` | Pages touchées, détail d'une priorité |

**La ligne de résultat est le point le plus important.** Un critère d'audit et une
ligne d'outil font exactement la même chose : afficher une mesure avec son seuil,
dire si elle passe, et offrir « créer la priorité » — en signalant celles qui en
ont déjà une. C'est `.crit`, avec son icône de statut, ses trois états
`fail / warn / ok` et son geste à droite. Le cadre des outils hérite de cette
ligne ; il ne la redessine pas.

## L'action principale — à trancher ici, une fois

Le brief parlait de « deux actions constantes ». La règle figée en phase 1 dit
qu'un écran ne porte **qu'une** action verte pleine. Les deux ne sont pas au même
niveau, et il faut le montrer :

- **« Enregistrer dans la fiche »** est l'action principale de l'écran : verte
  pleine, en tête, une seule. C'est elle qui fait entrer un résultat d'outil dans
  la boucle de livraison.
- **« Créer la priorité »** est une action de ligne : en contour, discrète,
  répétée sur chaque résultat. Elle est fréquente, pas principale.

Ce partage vaut pour les sept outils. Ne le rejoue pas outil par outil.

## Le cadre — ce qu'il contient

### En tête, la barre de contexte

- **Sélecteur de client** — il pré-remplit le domaine et **mémorise le dernier
  compte consulté**. C'est l'élément le plus utilisé de l'écran.
- **Les prospects y figurent aussi**, distingués des clients. Sans cela, Organic
  Research et Domain Overview perdent leur usage commercial. Prévois un filtre
  clients / prospects / tous.
- **Sélecteur de période**, quand l'outil en a besoin.
- Le **domaine analysé**, modifiable ponctuellement sans changer de client — pour
  analyser un concurrent depuis le contexte d'un client.

### Les deux actions constantes

Présentes sur chaque outil, toujours au même endroit :

1. **Enregistrer dans la fiche** — verse le résultat à l'historique du client.
2. **Créer une priorité** — sur une ligne de résultat, la transforme en priorité
   dans la fiche. C'est ce qui relie les outils à la boucle de livraison.

### Le marqueur de conservation

Certaines données sont historisées automatiquement, d'autres sont éphémères et
purgées après 30 jours. **L'utilisateur doit savoir laquelle il regarde** — sans
quoi il ne sait jamais si un résultat consulté existera encore demain.

| Conservé automatiquement | Éphémère |
|---|---|
| Scores d'audit, Lighthouse, positions SERP et locales, backlinks (en delta) | Exploration de mots-clés, analyses ponctuelles de concurrents |

Un prospect n'a droit qu'à un **instantané**, jamais à un historique. Le cadre
doit le signaler quand un prospect est sélectionné.

### Le coût

Chaque appel est facturé chez le fournisseur de données. Affiche discrètement le
coût de la requête en cours ou son poids relatif — pas une facture, juste de quoi
ne pas lancer cinquante analyses sans y penser.

## États à prévoir

Les trois vides ne se confondent pas — un écran vide n'a pas toujours la même
signification :

- **Aucun client sélectionné** — vide initial : expliquer, proposer le premier
  geste
- **Résultat vide après filtrage** — proposer d'élargir la recherche
- **Résultat vide, rien à corriger** — vide sain : le dire comme une bonne
  nouvelle, pas comme une absence

Puis :

- Chargement des résultats
- Prospect sélectionné — bandeau « instantané, non historisé »
- Intégration requise mais non connectée, avec le geste pour la connecter
- Erreur du fournisseur de données, avec possibilité de réessayer
- Quota de consommation proche de la limite

## Ce qu'il ne faut pas faire

- Ne pas concevoir un tableau de bord : un outil sert à interroger, filtrer,
  exporter et agir sur des lignes.
- Ne pas cacher le sélecteur de client dans un menu : c'est le premier geste.
- Ne pas rendre les deux actions constantes dépendantes de l'outil : elles doivent
  être identiques partout.
- Ne pas redessiner la sous-barre, la ligne de constat ni le tableau en grille :
  ils existent, ils sont implémentés, ils se réutilisent.
