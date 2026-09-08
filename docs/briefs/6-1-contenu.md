# Session 6.1 — Calendrier éditorial et brief d'article

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session** — au moins
pour les règles d'écriture du HTML et les jetons, même si les classes de densité
du cockpit ne s'appliquent pas ici.

Règles de fond : interface dense mais lisible ; aucune métrique décorative ; les
statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une mesure ne s'affiche jamais sans son seuil**.

> **Retour dans le cockpit** : shell complet, barre latérale et header.

> Le contenu est **déjà vendu** dans les forfaits — articles de blog, et plus tard
> contenu social. Ces écrans formalisent un service qui existe, ils n'en créent pas
> un nouveau.

---

## Deux écrans

1. **Calendrier éditorial**, route `/clients/[id]/contenu`
2. **Brief d'article**, route `/clients/[id]/contenu/[b]`

---

## Calendrier éditorial

### Ce qu'il doit montrer

- **Le planning de publication** du client, en vue mois et en vue liste.
- Pour chaque contenu : titre, mot-clé cible, statut, échéance, rédacteur.
- **Le quota du forfait** : combien d'articles prévus ce mois, combien livrés. Un
  forfait qui inclut quatre articles et n'en livre que deux est un problème
  commercial autant qu'éditorial.
- **Les performances des articles publiés** — trafic généré, positions obtenues.
  C'est ce qui justifie la ligne « contenu » de la facture.

### Le lien avec le reste

Un contenu naît souvent d'une opportunité repérée par Keyword Hunter, et un
article publié devient une **preuve de valeur** pour le rapport. Ces deux liens
doivent être visibles.

### États

Aucun contenu planifié · mois complet · article en retard · quota du forfait non
atteint · article publié sans performance encore mesurable.

---

## Brief d'article

Ce qu'on remet à un rédacteur.

### Ce qu'il doit contenir

- **Mot-clé cible et requêtes secondaires**, avec volumes et intention.
- **L'intention de recherche** — ce que cherche vraiment la personne qui tape cette
  requête. C'est ce qui manque le plus souvent dans les briefs et qui fait rater
  l'article.
- **Le plan proposé** — structure de titres, généré par l'agent puis modifiable.
- **Les concurrents à battre** : qui se positionne aujourd'hui, longueur et angle
  de leurs contenus.
- **Les consignes** : longueur visée, ton, liens internes à placer, appel à
  l'action.
- **Le suivi** : statut de rédaction, relecture, date de publication, URL une fois
  en ligne.

### La clôture

Marquer un article publié doit proposer d'en faire une **preuve de valeur**, avec
son libellé client — même mécanique que la clôture d'une tâche.

### États

Brief en préparation · assigné · en rédaction · en relecture · publié · publié et
mesuré.

## Ce qu'il ne faut pas faire

- Ne pas concevoir un éditeur de texte : l'article s'écrit ailleurs, ici on cadre
  et on suit.
- Ne pas oublier le quota du forfait, qui est la raison commerciale de l'écran.
