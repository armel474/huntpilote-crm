# Session 4.2 — Agenda et rapports à produire

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

## Deux écrans

1. **Agenda**, route `/agenda`
2. **Rapports à produire**, route `/rapports`

---

## Agenda

L'entrée existe dans la barre latérale depuis la conception du Dashboard, mais
aucun écran n'a jamais été dessiné.

### Ce qu'il doit rassembler

Quatre natures d'événements, visuellement distinctes :

- **Échéances de tâches** — depuis le plan d'action
- **Envois de rapports programmés** — le 2 de chaque mois par défaut
- **Rendez-vous clients** — points mensuels, présentations
- **Exécutions planifiées** — audits trimestriels, relevés de positions

### Les vues

Mois et semaine. La vue semaine doit être exploitable — c'est celle qu'on utilise.
Prévois le clic sur un jour pour en voir le détail.

### Les gestes

Déplacer une échéance depuis l'agenda, créer un rendez-vous, ouvrir l'objet lié.
Un déplacement d'échéance doit se répercuter sur la tâche.

### États

Journée vide · semaine chargée · échéance dépassée · conflit de rendez-vous.

---

## Rapports à produire

La vue agence du cycle mensuel. *Où en est-on des livrables du mois ?*

### Ce qu'il doit montrer

Une ligne par client, avec l'état de son rapport du mois :

| État | Ce que ça veut dire |
|---|---|
| **À préparer** | La période est close, rien n'est commencé |
| **En cours** | Brouillon ouvert |
| **Bloqué** | Un libellé client attend une relecture |
| **Prêt** | Publiable |
| **Publié** | Envoyé, avec la date |
| **En retard** | La date d'envoi promise est passée |

Les **bloqués** et les **en retard** passent devant. Pour les bloqués, indique ce
qui manque et permets d'y aller directement — c'est le point de friction du cycle
mensuel, et c'est cet écran qui doit le résoudre.

### Ce qui aide vraiment

- **La progression du mois** : combien de rapports partis sur combien attendus.
- **Le nombre de preuves disponibles** par client : un compte sans preuve ce
  mois-ci est un signal avant même d'ouvrir le rapport.

### États

Début de mois, rien à faire · pic de fin de mois · client sans preuve · rapport en
retard.

## Ce qu'il ne faut pas faire

- Ne pas faire de l'agenda un calendrier générique : il ne montre que ce que
  l'application produit.
- Ne pas se contenter de lister les rapports : l'écran sert à débloquer.
