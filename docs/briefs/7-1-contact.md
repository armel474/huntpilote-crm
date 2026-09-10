# Session 7.1 — Les contacts d'un client

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel
quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.** Il liste
les classes déjà implémentées et réutilisables — en particulier le panneau
latéral de détail (slide-over, pas une page), déjà utilisé pour le deal du
pipeline, et les champs de type `.dl-field` qu'il porte.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative ; les statuts ne reposent jamais uniquement sur la
couleur ; libellés de boutons concrets en français ; **une seule action
principale verte par écran**, tout le reste en contour.

> **Ce que ça change concrètement.** Aujourd'hui, la fiche client n'a qu'un seul
> bloc « Contact » dans le panneau de gauche — courriel, téléphone, site web,
> adresse. Ce sont les coordonnées de l'**entreprise**, pas d'une **personne**.
> Un client réel a plusieurs interlocuteurs : la personne qui décide, celle qui
> valide le contenu, celle qui reçoit les factures. Cette session introduit le
> contact comme objet à part entière, distinct du client.

---

## Deux écrans

1. **Les contacts d'un client** — remplace le bloc « Contact » actuel du
   panneau de gauche de la fiche client
2. **Fiche d'un contact** — panneau latéral, ouvert depuis un contact

---

## Les contacts d'un client

### Ce qu'il doit montrer

Le panneau de gauche de la fiche client (celui qui porte aujourd'hui logo,
statut, un seul bloc « Contact », chef de projet, client depuis, dernier audit)
affiche désormais une **liste courte** de contacts plutôt qu'un bloc unique :

- Chaque ligne : nom, rôle (« Directrice marketing », « Responsable TI »),
  initiales ou avatar, un badge si c'est le **contact principal**.
- **Un seul contact principal par client** — c'est celui qui reçoit le rapport
  mensuel et les communications par défaut, sauf précision contraire. Le
  marquer clairement, pas seulement par sa position dans la liste.
- Si la liste dépasse trois ou quatre contacts, un lien « Voir tous les
  contacts (n) » plutôt que de faire grandir le panneau indéfiniment — le
  panneau de gauche reste un résumé, pas l'écran de gestion complet.
- Un geste pour **ajouter un contact** directement depuis ce panneau.

### Le cas des établissements multiples

Un client à plusieurs établissements (SEO local, phase 3) peut avoir un contact
différent par adresse — la gérante de la succursale de Laval n'est pas celle de
Rive-Sud. Le contact porte donc un rattachement optionnel à un établissement
précis ; sans établissement précisé, il est considéré comme un contact du siège.

---

## Fiche d'un contact

**Panneau latéral**, pas une page — même mécanique que le panneau de détail
d'un deal (session 4.4) : le reste de l'écran reste visible derrière.

### Ce qu'il doit montrer

- **Identité** : nom, rôle, entreprise (rappel du client), établissement
  rattaché s'il y en a un.
- **Coordonnées** : courriel, téléphone, et le **canal de communication
  préféré** — c'est ce qui doit guider l'agence quand elle initie un échange.
  Voir aussi la session 7.2, qui construit le fil d'échanges : cette fiche n'en
  montre qu'un résumé (les trois ou quatre derniers), pas le fil complet.
- **Notes internes** — ce qu'il faut savoir avant de l'appeler. Jamais visible
  du client.
- **Marquer comme contact principal** — un geste explicite, pas un tri
  automatique.

### Ce qu'il ne montre pas

Le fil de communication complet avec ce contact : c'est l'écran de la session
7.2, filtré sur ce contact. Le panneau y renvoie par un lien plutôt que de le
redessiner.

### États

Contact unique renseigné (cas actuel, à faire migrer) · plusieurs contacts avec
un principal désigné · contact sans coordonnées complètes (courriel manquant,
par exemple) · contact qui a quitté l'entreprise — à archiver, jamais à
supprimer, pour que l'historique des échanges reste lisible · client à
plusieurs établissements avec un contact par adresse.

## Ce qu'il ne faut pas faire

- Ne pas faire du contact un second compte de connexion — c'est une fiche, pas
  un utilisateur du portail (le portail reste lié au client, pas à une personne
  précise, pour l'instant).
- Ne pas dupliquer le fil de communication ici — un lien suffit.
- Ne pas permettre plus d'un contact principal en même temps.
