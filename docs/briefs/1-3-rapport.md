# Session 1.3 — Éditeur de rapport et rapport partageable

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

> **Prérequis :** sessions 1.1 et 1.2 validées. Cet écran consomme ce qu'elles
> produisent — les priorités visibles et les preuves de valeur.

---

## Deux écrans liés

1. **Éditeur de rapport**, route `/clients/[id]/rapports/[r]` — côté agence.
2. **Rapport partageable**, route `/r/[jeton]` — page publique, sans connexion,
   que le client ouvre depuis son courriel.

Le second est ce que produit le premier. Conçois-les ensemble : l'éditeur doit
montrer fidèlement ce que le client recevra.

**Un rapport est une page web, jamais un PDF.** Le portail client la lira plus
tard. Le téléchargement PDF reste une commodité, pas le format de référence.

## L'éditeur — ce qu'il doit permettre

- **Choisir les sections.** Le générateur existe déjà dans l'onglet Rapports de la
  fiche client ; il s'agit de le prolonger en édition réelle.
- **Éditer chaque section.** La synthèse rédigée par l'agent est modifiable.
- **Choisir les preuves mises en avant.** Les tâches terminées de la période
  arrivent en proposition ; l'utilisateur retient celles qui comptent et les
  ordonne.
- **Voir les priorités visibles.** Celles en *annoncé* et *en traitement*
  apparaissent avec leur libellé client.
- **Prévisualiser exactement ce que le client verra**, puis **publier**.

### Le blocage par relecture

Si un libellé client — de priorité ou de preuve — est encore « à relire », la
publication est **bloquée**. L'écran doit lister ce qui manque et permettre d'y
aller directement. Ce n'est pas un avertissement discret : c'est un état de
l'écran.

### La publication

Publier crée un **instantané versionné**. Le portail client lira cette version
figée, pas la base vivante — le rapport publié ne bouge plus jusqu'au suivant.
Prévois l'historique des versions et la possibilité de republier une correction.

## Le rapport partageable — ce que voit le client

Une page sobre, lisible sur mobile, qui raconte le mois dans cet ordre :

1. **Où on en est** — le score de santé, l'objectif principal et sa progression.
2. **Ce qui a bougé** — les KPIs de la période, avec la comparaison au mois
   précédent.
3. **Ce qu'on a fait** — les preuves de valeur, en langage client.
4. **Ce sur quoi on travaille** — les priorités visibles, en langage client.
5. **La suite** — ce qui est prévu le mois prochain.

Pas de jargon, pas de capture d'outil brute, pas de métrique sans phrase qui
l'explique. Le client doit comprendre sans vous avoir au téléphone.

## États à prévoir

**Éditeur :** brouillon · prêt à publier · bloqué par une relecture en attente ·
publié · publié puis corrigé (nouvelle version) · période sans aucune preuve.

**Rapport partageable :** rapport normal · premier rapport d'un client (pas de
comparaison possible) · lien expiré ou révoqué.

## Ce qu'il ne faut pas faire

- Ne pas concevoir la page publique comme une capture du cockpit : c'est un
  document destiné à quelqu'un qui ne connaît pas l'outil.
- Ne pas laisser publier sans relecture — le blocage est une décision, pas une
  gêne à contourner.
