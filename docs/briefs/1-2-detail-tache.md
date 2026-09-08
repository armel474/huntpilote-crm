# Session 1.2 — Détail d'une tâche

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

> **Prérequis :** la session 1.1 (détail d'une priorité) doit être validée. Cet
> écran en hérite directement — notamment le lien remontant vers la priorité.

---

## L'écran à concevoir

**Détail d'une tâche**, route `/taches/[t]`. Accessible depuis la fiche client
comme depuis les vues transversales à venir.

## Ce qu'il doit montrer

- Titre, description, échéance, responsable, statut, effort estimé.
- **Le lien remontant vers la priorité source**, visible et cliquable. C'est ce
  lien qui permettra au rapport de dire « voici ce qui n'allait pas, voici ce
  qu'on a fait ». Une tâche sans priorité source (créée à la main) doit rester
  possible mais se distinguer visuellement.
- Des **sous-étapes** cochables, pour les tâches qui se découpent.
- Un fil de **commentaires** et des **pièces jointes**.
- Le **temps passé**, s'il est suivi.

## La clôture — le moment important

Terminer une tâche n'est pas un changement de statut : c'est le moment où elle
devient une **preuve de valeur**. Conçois ce geste comme une petite étape à part
entière, qui demande :

- **ce qui a changé** — la mesure avant et après quand elle existe, une note
  sinon ;
- si la preuve **part au prochain rapport** ou reste interne ;
- le **libellé client** de la preuve, rédigé par l'agent et relu, sur le même
  principe que celui des priorités.

Une tâche de type **contenu** — un article de blog publié — est une preuve au même
titre qu'un correctif technique. Le geste de clôture doit accepter les deux.

## États à prévoir

- À faire · en cours · en retard
- Bloquée, avec le motif
- Terminée mais pas encore valorisée en preuve
- Terminée et intégrée à un rapport publié
- Tâche sans priorité source

## Ce qu'il ne faut pas faire

- Ne pas faire un clone de Jira : cette tâche existe pour produire une preuve
  client, pas pour gérer un sprint.
- Ne pas cacher la clôture derrière un menu : c'est l'action qui fait vivre la
  boucle.
