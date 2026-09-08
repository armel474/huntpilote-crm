# Brief Claude Design — Phase 1 : fermer la boucle de livraison

À coller dans une session Claude Design, dans le projet *HuntPilote - CRM SEO*.
Trois écrans, dans cet ordre : le second découle du premier, le troisième consomme
les deux.

Les décisions de cadrage sont dans `docs/decisions.md`. Les points qui touchent
directement ces trois écrans sont repris ci-dessous — le brief se suffit à lui-même.

---

## Contexte à rappeler à Claude Design

Reprends le design system existant du projet : base beige `#F2EFEA`, accent vert
`#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités critique / important /
opportunité, thème clair et sombre. Le shell CRM — barre latérale et header — est
déjà en place et doit être conservé tel quel.

Ces trois écrans ferment la boucle qui fait le produit :

```
Audit → Priorité → Tâche → Preuve de valeur → Rapport client
```

L'audit couvre **trois dimensions : présence en ligne, SEO, design**. Une priorité
appartient toujours à l'une des trois.

---

## Écran 1 — Détail d'une priorité

*Route : `/clients/[id]/priorites/[p]`. C'est l'écran qui porte le plus de logique ;
figer celui-ci débloque les deux autres.*

### Ce qu'il doit montrer

- **Le constat** — le libellé interne, technique, avec la sévérité et la dimension
  d'audit qui l'a produit (présence, SEO ou design).
- **Les pages touchées** — une liste, avec la mesure relevée sur chacune. C'est ce
  qui rend le constat vérifiable.
- **La recommandation** — ce qu'il faut faire, rédigé par l'agent.
- **La provenance** — quel audit, quelle date, quelle source de données. Chaque
  affirmation de l'agent doit pouvoir remonter à la donnée qui la fonde.
- **L'historique** — depuis quand le problème existe, s'il s'aggrave, s'il avait
  déjà été traité.

### Les trois états de visibilité client

Une priorité est **interne** par défaut, **annoncée** par interrupteur manuel, ou
**en traitement** automatiquement dès qu'elle entre au plan d'action. Cet état doit
se lire et se changer depuis cet écran, avec une explication de ce que le client
verra dans chaque cas.

### Le double libellé

- Le **libellé interne** — technique, pour l'équipe.
- Le **libellé client** — rédigé par l'agent, dans la langue du client.
  « LCP à 4,2 s » devient « vos pages mettent trop de temps à s'afficher sur
  mobile ».

Les deux s'affichent côte à côte. Le libellé client porte un état **« à relire »**
tant qu'un humain ne l'a pas validé, et cet état bloque la publication du rapport.
Prévois l'édition en ligne du libellé client.

### L'action principale

**« Assigner au plan d'action »** — elle crée une tâche et fait basculer la priorité
en *en traitement*. L'écran doit rendre évident que c'est le geste central, et
montrer la tâche créée une fois le geste fait.

### États à prévoir

Priorité déjà assignée · priorité résolue · priorité récurrente (revenue après
correction) · libellé client encore à relire.

---

## Écran 2 — Détail d'une tâche

*Route : `/taches/[t]`. Accessible depuis la fiche client comme depuis les vues
transversales à venir.*

### Ce qu'il doit montrer

- Titre, description, échéance, responsable, statut.
- **Le lien remontant vers la priorité source** — visible et cliquable. C'est ce
  lien qui permettra au rapport de dire « voici ce qui n'allait pas, voici ce qu'on
  a fait ».
- Des **sous-étapes** cochables, pour les tâches qui se découpent.
- Un fil de **commentaires** et des **pièces jointes**.

### La clôture

Terminer une tâche n'est pas un simple changement de statut : c'est le moment où
elle devient une **preuve de valeur**. Prévois un geste de clôture qui demande ce
qui a changé — la mesure avant et après quand elle existe, une note sinon — et qui
propose de rattacher la preuve au prochain rapport.

Une tâche de type **contenu** (article de blog publié) est une preuve au même titre
qu'un correctif technique.

### États à prévoir

À faire · en cours · terminée non encore valorisée · terminée et intégrée à un
rapport · en retard.

---

## Écran 3 — Éditeur de rapport

*Route : `/clients/[id]/rapports/[r]`. Un rapport est une **page web**, jamais un
PDF — le portail client le lira plus tard.*

### Ce qu'il doit permettre

- **Choisir les sections** — le générateur existe déjà dans l'onglet Rapports de la
  fiche client ; il s'agit de le prolonger en édition réelle.
- **Éditer chaque section** — la synthèse rédigée par l'agent doit être modifiable.
- **Choisir les preuves mises en avant** — les tâches terminées de la période
  arrivent en proposition, l'utilisateur retient celles qui comptent.
- **Voir les priorités visibles** — celles en *annoncé* et *en traitement*
  apparaissent avec leur libellé client. Si un libellé est encore « à relire », la
  publication est bloquée et l'écran doit le dire clairement.
- **Prévisualiser exactement ce que le client verra**, puis **publier**.

### Publication

Publier crée un **instantané versionné** : le portail client lira cette version
figée, pas la base vivante. Le rapport publié ne bouge plus jusqu'au suivant.
Prévois l'historique des versions.

### États à prévoir

Brouillon · prêt à publier · bloqué par une relecture en attente · publié ·
publié puis corrigé (nouvelle version).

---

## Ce qu'il ne faut pas faire

- Pas de nouveau vocabulaire visuel : ces écrans réutilisent les cartes, badges,
  jauges et sévérités existants.
- Pas de métrique décorative — chaque bloc doit aider à comprendre, prioriser ou
  agir.
- Les statuts ne reposent jamais uniquement sur la couleur.
- Les libellés de boutons sont concrets et en français.
