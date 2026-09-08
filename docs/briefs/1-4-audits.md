# Session 1.4 — Détail d'audit et comparaison

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

## Deux écrans liés

1. **Détail d'un audit**, route `/clients/[id]/audits/[a]`.
2. **Comparaison de deux audits**, route `/clients/[id]/audits/comparer`.

## Le point structurant

**L'audit n'est pas un audit SEO.** Il couvre trois dimensions, et l'écran doit
s'organiser par dimension, pas en une liste plate :

- **Présence en ligne** — fiche Google Business, annuaires, réseaux, cohérence des
  informations.
- **SEO** — technique, on-page, contenu, backlinks.
- **Design** — voir la grille ci-dessous.

Le score global affiché sur la fiche client est une **moyenne pondérée des trois**.
L'écran doit montrer la pondération, sinon le chiffre est incompréhensible.

## La dimension design — deux sorties séparées

C'est la partie délicate. L'expérience utilisateur se mesure, le style s'apprécie.
Ne les mélange pas.

### Ce qui entre dans le score — vérifiable

| Critère | Ce qui est vérifié |
|---|---|
| **Mobile** | Viewport déclaré, cibles tactiles ≥ 44 px, aucun débordement horizontal |
| **Lisibilité** | Contraste au seuil WCAG AA, corps ≥ 16 px, longueur de ligne, hiérarchie des titres |
| **Parcours** | Profondeur de navigation, position des appels à l'action, étapes jusqu'à la conversion |
| **Conversion** | Champs par formulaire, libellés, gestion des erreurs, preuves sociales |
| **Cohérence de marque** | Nombre de familles typographiques, étendue de la palette, réutilisation des composants |

Chaque critère affiche la mesure relevée et le seuil, jamais une note seule.

### Ce qui est caractérisé — jamais noté

- **Style dominant** — éditorial, minimaliste, tech, corporate ou artisanal.
- **Axe de modernité** — de daté à actuel, justifié par des signaux nommés :
  densité, ombres, dégradés, largeur des conteneurs, typographie, images.

Traite visuellement cette partie autrement que le score : c'est une description,
pas une évaluation. Un site peut être daté et parfaitement utilisable — l'écran
doit rendre cette nuance possible.

## Chaque constat mène à une priorité

Un résultat d'audit n'a de valeur que s'il devient actionnable. Chaque ligne
problématique doit porter un geste **« créer la priorité »**, et signaler celles
qui ont déjà généré une priorité ouverte.

## L'écran de comparaison

Deux audits côte à côte, avec un sélecteur de dates. Il doit répondre à une seule
question : **qu'est-ce qui s'est amélioré, qu'est-ce qui a régressé depuis la
dernière fois ?** Les régressions passent en premier.

Distingue trois cas : critère amélioré, critère dégradé, critère nouvellement
détecté (absent du premier audit).

## États à prévoir

- Audit terminé
- Audit en cours d'exécution, avec progression par dimension
- Audit partiellement échoué — une dimension n'a pas pu être analysée, par exemple
  faute d'intégration connectée
- Premier audit d'un client : rien à comparer
- Audit ancien, données périmées

## Ce qu'il ne faut pas faire

- Ne pas afficher une note de design globale sans les mesures qui la fondent.
- Ne pas mélanger le score et la caractérisation dans le même bloc visuel.
- Ne pas produire un mur de constats sans geste possible.
