# Session 4.4 — Détail de deal et éditeur d'automatisation

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

> Ces deux écrans complètent des pages **déjà livrées** : le Pipeline et le
> Workflow. Le shell, les cartes et les interrupteurs existent — reprends-les.

---

## Panneau de détail d'un deal

S'ouvre depuis une carte du Kanban, **en panneau latéral** plutôt qu'en page : on
ne veut pas perdre le tableau de vue.

### Ce qu'il doit montrer

- Entreprise, secteur, MRR proposé, services envisagés, responsable, étape,
  probabilité, jours dans l'étape.
- **L'historique des échanges** — appels, courriels, réunions, avec le geste pour
  en consigner un nouveau.
- **Les documents** : devis, proposition, audit de prospect généré depuis Organic
  Research.
- **La prochaine action** et sa date.
- **Les données SEO du prospect**, si un Domain Overview a été fait — le lien vers
  l'instantané, avec le rappel qu'il n'est pas historisé.

### Le geste qui compte

**« Marquer gagné »** ne change pas seulement une étape : il enclenche la création
du client et l'onboarding. Le panneau doit annoncer cette conséquence avant de la
déclencher, et montrer ce qui sera créé.

Prévois aussi « marquer perdu », avec un motif — c'est ce qui purge l'instantané
du prospect, conformément à la politique de conservation.

### États

Deal neuf · en négociation · gagné, onboarding lancé · perdu avec motif · deal
dormant depuis longtemps.

---

## Éditeur d'automatisation

La page Workflow liste les règles « Quand → Alors » avec un bouton **Modifier** qui
ne mène nulle part. Cet écran est ce qui manque.

### Ce qu'il doit permettre

- **Choisir le déclencheur** parmi ceux que l'application sait produire : chute de
  position, score sous un seuil, nouvelle erreur de crawl, nouvel avis, date
  récurrente, changement d'étape au pipeline, facture en retard, incohérence de
  citation.
- **Ajouter des conditions** — seulement certains clients, seulement au-delà d'un
  seuil, seulement en semaine.
- **Choisir l'action** : créer une tâche ou une priorité, notifier, envoyer un
  courriel, générer un rapport, lancer un audit.
- **Prévisualiser en langage naturel** la règle complète — c'est ce qui rend un
  éditeur de règles compréhensible.

### Le journal d'exécution

Chaque exécution passée avec sa date, son résultat, et ce qu'elle a produit. Les
échecs sont visibles et rejouables. Une automatisation dont on ne voit pas les
effets ne sera jamais activée avec confiance.

### La zone de danger

Une règle mal réglée peut créer cent tâches. Prévois un test à blanc — « qu'aurait
fait cette règle le mois dernier ? » — avant activation.

### États

Nouvelle règle · règle active · en pause · règle en échec répété · règle jamais
déclenchée depuis sa création.

## Ce qu'il ne faut pas faire

- Ne pas faire un éditeur de flux à nœuds : ces règles sont linéaires, une phrase
  suffit.
- Ne pas permettre d'activer une règle sans avoir vu ce qu'elle ferait.
