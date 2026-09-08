# Session 2.6 — Suivi de consommation

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

## L'écran à concevoir

**Suivi de consommation**, route `/outils/consommation`.

Les données SEO sont facturées à l'appel. Cet écran répond à : *où part l'argent,
et est-ce que ça vaut le coup ?*

## Le point structurant

**La ventilation par client est obligatoire.** Les zones géographiques du SEO local
et le nombre de mots-clés suivis varient d'un compte à l'autre — un client peut
coûter cinq fois plus qu'un autre. Sans cette ventilation, l'écran ne sert à rien.

## Ce qu'il doit montrer

- **La consommation du mois** en cours, rapportée au budget, et la projection de
  fin de mois.
- **La répartition par client** — c'est la vue principale. Coût du mois, coût
  rapporté au MRR de ce client. Un compte qui coûte plus qu'il ne rapporte doit
  sauter aux yeux.
- **La répartition par type d'appel** — crawl, positions, backlinks, SERP locales.
- **L'historique** sur douze mois.
- **Les réglages qui pilotent le coût**, modifiables ici : fréquence des relevés,
  nombre de mots-clés suivis par client, densité des zones locales.

## Les seuils sont des réglages, pas des constantes

Les durées de conservation et les fréquences de relevé se règlent au niveau de
l'agence. Cet écran est l'endroit naturel pour les exposer, avec l'effet de chaque
réglage sur la facture.

## États à prévoir

- Consommation normale
- Approche du budget mensuel — avertissement
- Budget dépassé : que se passe-t-il ? À décider, mais l'écran doit le dire
- Premier mois, pas d'historique
- Un client dont le coût dépasse le MRR

## Ce qu'il ne faut pas faire

- Ne pas en faire une page de facturation : c'est un outil de pilotage.
- Ne pas afficher des unités d'API brutes sans les traduire en dollars.
