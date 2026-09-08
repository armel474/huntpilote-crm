# Session 3.3 — Positions locales et concurrence locale

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

1. **Positions locales**, route `/local/[etab]/positions`
2. **Concurrence locale**, route `/local/[etab]/concurrence`

---

## Positions locales

Le classement dans le pack local — les trois établissements que Google affiche sur
la carte. **La position varie selon l'endroit d'où l'on cherche**, et c'est toute
la difficulté de cet écran.

### Ce qu'il doit montrer

- **Le tableau requête par requête** : position moyenne sur la zone, meilleure et
  pire position, évolution.
- **La carte de la zone** — la représentation qui rend le sujet compréhensible.
  Chaque point de mesure porte la position relevée à cet endroit. On voit
  immédiatement où l'établissement sort et où il disparaît.
- **La lecture par zone** : les secteurs où le client est fort, ceux où il est
  absent. C'est ce qui oriente le travail — et ce qui parle au client.
- Le **rappel de la configuration** de zone, avec le lien pour la modifier.

Choisis une représentation lisible en thème clair comme en sombre, et qui reste
compréhensible sans couleur seule — la position se lit aussi en chiffre.

### États

Zone non configurée : l'écran renvoie vers l'éditeur · premier relevé · relevé en
cours · établissement absent du pack sur toute la zone · position très variable
selon les points, ce qui est un résultat en soi.

---

## Concurrence locale

*Qui sort devant, sur quelles requêtes, à quels endroits ?*

### Ce qu'il doit montrer

- **Les établissements concurrents** rencontrés dans le pack local, classés par
  fréquence d'apparition.
- Pour chacun : note moyenne, nombre d'avis, complétude apparente de la fiche,
  catégories déclarées. Ce sont les leviers concrets — un concurrent avec 200 avis
  contre 30 explique beaucoup.
- **Le recoupement** : sur quelles requêtes et dans quels secteurs il vous devance.
- **L'écart actionnable** : ce qui vous sépare de lui, traduit en actions
  possibles.

### Le geste

Créer une priorité depuis un écart identifié — « obtenir 50 avis supplémentaires »
est une priorité de la dimension présence en ligne.

## Ce qu'il ne faut pas faire

- Ne pas réduire la position locale à un chiffre unique : la variation
  géographique est l'information.
- Ne pas comparer sans donner les leviers qui expliquent l'écart.
