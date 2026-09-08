# Session 5.1 — Portail client : connexion et tableau de bord

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

> **Attention : ce n'est plus le cockpit.** Le portail client n'a **pas** la barre
> latérale ni le header de l'application. C'est un espace séparé, plus calme, plus
> aéré, destiné à quelqu'un qui ne connaît pas l'outil et s'y connecte une fois
> par mois. Garde la palette et la typographie du design system pour la continuité
> de marque, mais pas la densité du cockpit.

> **Prérequis :** session 1.3 validée. Le portail affiche le rapport publié conçu
> là-bas.

---

## Deux écrans

1. **Connexion client**, route `/portail/connexion`
2. **Tableau de bord client**, route `/portail`

---

## Connexion

**Par lien magique**, pas par mot de passe. Le client reçoit un courriel, clique,
il est connecté. Un mot de passe de plus est un mot de passe oublié de plus, et
une raison de ne jamais revenir.

À concevoir : la saisie du courriel, l'écran « vérifiez votre boîte », l'erreur
d'adresse inconnue, le lien expiré avec renvoi.

---

## Tableau de bord client

**Le portail est figé à la publication du rapport.** Il ne montre pas de données en
temps réel : il affiche l'état publié au dernier rapport. L'écran doit dater ce
qu'il montre — « données au 2 juin » — sans quoi le client croira voir du direct.

> **La page du rapport est déjà conçue et en ligne** (session 1.3, route
> `/r/[token]`) : en-tête daté, puis les cinq temps — *où on en est*, *ce qui a
> bougé*, *ce qu'on a fait*, *ce sur quoi on travaille*, *la suite* —, corps de
> texte à 16px, largeur de lecture limitée, thème clair et sombre. Le tableau de
> bord du portail **reprend cette page**, il ne la redessine pas.
>
> Ce qui reste à concevoir ici, c'est ce qui l'entoure : la connexion, la
> navigation entre les mois, l'accès aux échanges, et l'en-tête de compte. Le
> corps du rapport, lui, est acquis.

### Ce qu'il doit montrer, dans cet ordre

1. **Où on en est** — le score de santé et l'objectif principal avec sa
   progression. Une phrase de l'agent qui résume le mois.
2. **Ce qui a bougé** — les indicateurs de la période avec la comparaison au mois
   précédent. Trafic, positions, visibilité. Peu de chiffres, bien expliqués.
3. **Ce qu'on a fait** — les preuves de valeur du mois, en langage client.
4. **Ce sur quoi on travaille** — les priorités visibles (états *annoncé* et *en
   traitement*), en langage client, avec l'avancement.
5. **La suite** — ce qui est prévu le mois prochain.

### La règle de visibilité

Le client ne voit **que** les priorités marquées *annoncé* ou *en traitement*.
Jamais l'inventaire complet des défauts. Si l'écran donne l'impression d'un audit
brut, la conception a raté.

### Le ton

Aucun jargon. Pas de capture d'outil. Chaque chiffre accompagné d'une phrase qui
dit ce qu'il signifie. Le client doit comprendre sans vous avoir au téléphone —
c'est la raison d'être du portail.

## États à prévoir

- Premier mois : pas de comparaison possible
- Aucun rapport encore publié — que voit le client qui se connecte trop tôt ?
- Mois sans preuve de valeur : dire quelque chose d'honnête plutôt que rien
- Client à plusieurs établissements
- Consultation sur mobile — c'est le cas le plus probable

## Ce qu'il ne faut pas faire

- Ne pas réutiliser le shell du cockpit.
- Ne pas laisser croire que les données sont en direct.
- Ne pas montrer une priorité interne, jamais.
