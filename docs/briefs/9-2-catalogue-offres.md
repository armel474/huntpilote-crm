# Session 9.2 — Catalogue et constructeur d'offres

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.** Il liste
les classes déjà implémentées et réutilisables. Trente-huit écrans existent —
n'en redessine aucun morceau.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une seule action principale verte par écran**, tout le
reste en contour ; **un message d'erreur dit quoi faire**.

> **Prérequis :** la session 9.1 (cadre de l'Agence hub) doit être validée.
> Ces deux écrans sont deux de ses sections.

---

## Ce que l'agence vend, en trois notions

La base les distingue, et l'écran doit les faire sentir sans les expliquer :

- Un **article de catalogue** est une brique : un **produit** se vend et se
  livre une fois (un site vitrine, un logo), un **service** se reconduit (au
  mois, au trimestre, à l'année). Un article a un code, un nom, une
  description, une unité, un prix unitaire facultatif. Trente-neuf existent.
- Une **offre** assemble des articles sous un nom et un prix qui n'est pas la
  somme de ses parties. Six existent, réelles : trois forfaits web ponctuels
  (Présence Digitale à partir de 4 500 $, Croissance Digitale à partir de
  9 000 $, Commerce Digital à partir de 13 000 $) et trois packs SEO mensuels
  (Visibilité Locale 400 $, Croissance SEO 700 $, Domination SEO 1 100 $).
- Ce qu'une offre **engendre à la vente** : des tâches (37 gabarits existent,
  avec rôle et échéance relative — c'est ce qui produit 115 tâches sur trois
  mandats sans que personne les écrive) et, nouveauté de cette session, des
  **livrables contractuels** — ce que le client approuve, avec ses rondes de
  révision incluses.

Une offre peut **contenir une autre offre** (« Tout ce qui est dans Présence
Digitale »), proposer des **options au choix du client** (« hébergement chez
nous *ou* chez vous »), afficher un prix « à partir de », un **tarif d'entrée**
sur les premiers mois, un délai de livraison, une consultation gratuite, et
désigner l'offre **recommandée ensuite** (« Idéal avec : Croissance SEO »).

L'écran Catalogue de Paramètres montre déjà tout ça en lecture : cartes
d'offres avec prix plancher, tarif d'entrée ou son absence signalée, délai,
lignes incluses avec les groupes « ou », bénéfices, nombre de tâches
engendrées, valeur catalogue et remise, offre recommandée ; tableaux
d'articles. **Pars de ce rendu** pour la lecture ; cette session ajoute
l'écriture.

## Deux écrans

1. **Catalogue**, route `/agence/catalogue` — les articles, à éditer en place.
2. **Constructeur d'offre**, route `/agence/offres/[id]` — une page par offre,
   avec la liste `/agence/offres` devant.

---

## Catalogue — les articles

### Ce qu'il doit montrer

- Deux tableaux (`.tbl`) : **Services** et **Produits**, réordonnables par
  glissement, chaque ligne avec code, nom, récurrence, unité, prix unitaire,
  actif ou archivé. Un article sans prix se signale (« sans prix »), parce
  que c'est lui qui empêche de calculer la valeur catalogue d'une offre.
- **L'édition en panneau latéral** (`slide-over`, classes `.dl-*`), jamais en
  page séparée : la liste reste visible derrière. Champs : nom, code (généré
  depuis le nom, modifiable), sorte (produit ou service), récurrence
  (ponctuel, mensuel, trimestriel, annuel — un produit est forcément
  ponctuel : la base le refuse, l'écran doit l'empêcher avant), unité,
  prix unitaire, description, actif.
- **Où l'article est utilisé.** En bas du panneau : les offres qui
  l'incluent, en lien. Archiver un article utilisé par une offre active doit
  prévenir, pas bloquer.
- L'action principale verte : **« Nouvel article »**.

### Le droit

« Gérer le catalogue ». Sans lui : lecture, panneau ouvrable mais figé,
boutons verrouillés avec leur raison.

---

## Constructeur d'offre — l'écran important

### La liste `/agence/offres`

Les cartes d'offres qui existent déjà, en deux groupes (forfaits web, packs
SEO), avec un geste « Modifier » sur chacune, un interrupteur actif/inactif,
et l'action principale **« Nouvelle offre »**. Une offre inactive reste
visible, atténuée : elle a pu être vendue, ses abonnements existent.

### La page d'une offre

Deux colonnes (`.detail-row`) : à gauche l'édition, à droite **l'aperçu de
la carte d'offre telle que l'agence la verra** partout ailleurs (pipeline,
devis) — l'aperçu se met à jour pendant qu'on édite. C'est le même rendu que
la carte de la liste, pas un troisième.

L'édition, en sections repliables, dans cet ordre :

1. **Identité** — nom, code, accroche, segments (« Idéal pour : PME de
   services, professionnels, artisans »), populaire ou non, active.
2. **Prix** — récurrence ; prix ; « à partir de » ou fixe ; tarif d'entrée et
   nombre de périodes (« 525 $ les 3 premiers mois, puis 700 $ ») ; délai de
   livraison en semaines (min et max) pour un forfait ponctuel ; consultation
   gratuite en minutes. Sous le prix, **la valeur catalogue et la remise**,
   calculées depuis les lignes : « Valeur catalogue 1 240 $ · remise 540 $ »,
   ou « valeur incalculable : 3 articles sans prix » avec le lien vers eux.
3. **Contenu** — les lignes, réordonnables. Une ligne est soit un article
   (avec quantité et libellé de surcharge facultatif), soit **une offre
   incluse** (« Tout ce qui est dans Présence Digitale », qui affiche en
   retrait ce qu'elle apporte, sans qu'on puisse l'éditer ici), soit un
   **groupe d'options** : un nom de groupe (« Hébergement ») et deux lignes
   ou plus au choix du client, dont une par défaut. Ajouter une ligne ouvre
   un sélecteur qui cherche dans le catalogue *et* dans les autres offres.
   Une offre ne peut pas s'inclure elle-même ni créer une boucle : la base
   le refuse, l'écran retire simplement ces offres du sélecteur.
4. **Bénéfices** — la liste « ce que le client y gagne », une ligne par
   bénéfice, réordonnable.
5. **Ce que la vente engendre** — deux listes côte à côte ou l'une sous
   l'autre :
   - **Tâches** : titre, rôle par défaut (admin, chef de projet, spécialiste
     SEO, rédacteur), échéance relative (« jour 7 », « chaque mois, jour 3 »
     pour une offre récurrente), option qui la déclenche s'il y a lieu. Un
     compteur en tête : « 14 tâches par mois ».
   - **Livrables** : code (L-01), titre, rondes de révision incluses, ordre.
     Ce que le client approuvera ; distinct des tâches, qui sont le travail
     interne. Un forfait web en a une dizaine ; un pack SEO mensuel en a peu
     ou pas.
6. **Ensuite** — l'offre recommandée après celle-ci (« Idéal avec »), une
   seule.

L'action principale verte : **« Enregistrer l'offre »**, en haut à droite,
verrouillée tant que rien n'a changé, avec la mention « modifications non
enregistrées » quand il y en a. Quitter la page avec des modifications
demande confirmation.

### Le droit

« Gérer le catalogue ». Sans lui, la page se lit — c'est utile pour vendre —
mais ne s'écrit pas.

### Ce que ça change ailleurs, à dire dans l'écran

Modifier une offre **ne modifie pas les abonnements déjà vendus** : un client
qui a signé Croissance SEO à 700 $ le garde à 700 $. Une ligne en tête de la
section Prix le rappelle quand l'offre a déjà des abonnements actifs, avec
leur nombre.

## États

Catalogue : liste · panneau d'édition · panneau en lecture seule · article
sans prix · article archivé · archivage d'un article utilisé (avertissement).
Offre : liste · édition vierge (nouvelle offre) · édition avec modifications
non enregistrées · valeur incalculable · offre inactive · offre avec
abonnements actifs · lecture seule sans droit · erreur d'enregistrement.

## Ce qu'il ne faut pas faire

- Ne pas inventer un troisième rendu de carte d'offre : celui de la liste
  est l'aperçu.
- Ne pas laisser un produit se facturer au mois — l'écran l'empêche avant la
  base.
- Ne pas confondre tâche et livrable : la tâche est du travail, le livrable
  est ce que le client approuve.
- Ne pas laisser croire qu'un changement de prix touche les clients déjà
  signés.
