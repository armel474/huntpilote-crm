# Session 2.1 — Le cadre commun des outils

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français.

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

- Aucun client sélectionné — état d'accueil de l'outil
- Chargement des résultats
- Résultat vide — le domaine n'a pas de données
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
