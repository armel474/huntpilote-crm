# Session 5.2 — Portail client : rapports et échanges

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre.

Règles de fond : interface dense mais lisible ; aucune métrique décorative ; les
statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français.

> Même cadre que la session 5.1 : espace client séparé, sans le shell du cockpit,
> aéré, lisible sur mobile.

---

## Deux écrans

1. **Ses rapports**, route `/portail/rapports`
2. **Échanges**, route `/portail/echanges`

---

## Ses rapports

L'historique complet, consultable et téléchargeable.

- **La liste par période**, du plus récent au plus ancien, avec le score de santé
  de chaque mois — la progression se lit dans la colonne.
- **Ouvrir un rapport** affiche la version publiée de l'époque, telle qu'elle a été
  envoyée. Un rapport publié ne bouge plus : c'est un document daté.
- **Télécharger en PDF**, commodité utile pour transmettre en interne.
- **La courbe du score sur douze mois** en tête : c'est le seul endroit où le
  client voit sa trajectoire longue, et c'est l'argument de renouvellement.

### États

Aucun rapport · un seul rapport · rapport corrigé après publication (deux versions
d'une même période) · archive longue.

---

## Échanges

Le client pose une question, l'agence répond. Ce qui s'y dit alimente l'historique
des communications côté cockpit — les deux vues montrent la même conversation.

### Ce qu'il doit permettre

- **Un fil de conversation** simple, chronologique.
- **Poser une question depuis un élément précis** — une preuve, une priorité, un
  indicateur du rapport. Le contexte accompagne le message, ce qui évite les
  « c'est quoi ce chiffre ? » sans référence.
- **Pièces jointes** dans les deux sens.
- **L'état de lecture** : le client doit savoir que son message est arrivé, et
  quand une réponse est attendue.

### Ce qu'il ne faut pas en faire

Pas une messagerie instantanée. Le rythme est celui d'un échange professionnel :
on écrit, on reçoit une réponse dans la journée. Concevoir un chat créerait une
attente de réponse immédiate que l'agence ne tiendra pas.

### États

Aucun échange · question en attente de réponse · réponse reçue non lue ·
conversation longue.

## Ce qu'il ne faut pas faire

- Ne pas transformer les échanges en support technique avec tickets et priorités.
- Ne pas laisser un rapport publié se modifier rétroactivement.
