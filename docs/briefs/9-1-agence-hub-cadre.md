# Session 9.1 — L'Agence hub : le cadre, le profil, l'équipe

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

**Ce qui a changé depuis la phase 8 :** l'application est branchée sur une
vraie base de données. Ce que tu dessines sera rempli par des enregistrements
réels, pas par un fichier de démonstration — les états vides et les états
« pas le droit » ne sont plus théoriques.

---

## Le point structurant

Le menu latéral a un **Client hub** : tout ce qui concerne un client. Il lui
manque son pendant : un **Agence hub**, route `/agence`, tout ce qui concerne
l'agence elle-même — qui elle est, qui y travaille, ce qu'elle vend, avec quels
documents. Aujourd'hui ces trois choses se cachent dans Paramètres, entre les
intégrations et la consommation, et le catalogue n'y est qu'en lecture.

Cette session pose le cadre et y installe ce qui existe déjà. Les sessions 9.2
à 9.4 remplissent les sections nouvelles.

## Trois écrans, dont deux existent déjà

1. **Le cadre de l'Agence hub** — l'entrée de menu, la sous-navigation, la page
   d'accueil du hub.
2. **Profil** — déplacé de Paramètres, augmenté du téléversement du logo.
3. **Équipe** — déplacé de Paramètres, augmenté du téléversement des photos.

Paramètres ne garde que ce qui est réglage : intégrations, notifications,
abonnement, consommation. Ne le redessine pas, retire-lui simplement trois
entrées.

---

## Le cadre

### La navigation

- Une entrée **Agence hub** dans la barre latérale, sous Client hub, avec une
  icône distincte (un bâtiment, pas un groupe de personnes — ça, c'est
  l'équipe). Elle se comporte comme les autres entrées : active sur toute
  route `/agence/...`.
- À l'intérieur, une **sous-navigation verticale** à gauche, comme celle de
  Paramètres (`.set-nav`) — reprends-la, ne dessine pas une deuxième colonne
  de réglages. Six sections, dans cet ordre : Profil, Équipe, Catalogue,
  Offres, Modèles de documents, Documents.
- Le fil d'Ariane : « HuntPilote › Agence hub › Profil ».

### La page d'accueil du hub

Ce qu'on voit en arrivant sur `/agence`, avant de choisir une section. Pas un
tableau de bord de plus : **six cartes, une par section**, chacune avec un
chiffre qui dit si la section est complète et un geste pour y aller.

| Carte | Ce qu'elle dit | Exemple |
|---|---|---|
| Profil | Ce qui manque encore | « 2 champs manquants : TPS, TVQ » ou « Complet » |
| Équipe | Membres actifs, invitations en attente | « 4 membres · 1 invitation en attente » |
| Catalogue | Articles actifs, articles sans prix | « 39 articles · 12 sans prix unitaire » |
| Offres | Offres actives, offres sans tarif d'entrée | « 6 offres · 3 packs sans tarif d'entrée » |
| Modèles de documents | Sortes couvertes sur six | « 4 modèles sur 6 sortes · sans annexe ni avenant » |
| Documents | Ce qui attend | « 2 devis en attente · 1 facture en retard » |

Un chiffre qui signale un manque se lit comme un manque (mot + icône, pas
seulement une couleur). Une carte complète le dit sobrement.

---

## Profil

Il existe (`/parametres`, section « Profil de l'agence ») : nom, raison
sociale, site web, courriel, téléphone, adresse, ville, province, code postal,
TPS, TVQ, avec un avertissement quand les numéros de taxes manquent, et un
bouton Enregistrer. **Reprends-le tel quel** et ajoute :

- **Le logo, téléversable.** Aujourd'hui c'est une adresse d'image. Il faut
  une zone de dépôt (glisser ou cliquer), l'aperçu, le remplacement, le
  retrait. Contraintes affichées : PNG ou SVG, carré, 512 px. Le logo apparaît
  sur les devis, factures et contrats : dis-le à côté de la zone, c'est ce qui
  motive à le fournir.
- **Le numéro d'entreprise du Québec (NEQ)**, à côté de TPS et TVQ.
- **Les instructions de paiement par défaut** — un champ long : ce qui
  s'imprime en pied de facture (virement, carte, QuickBooks ou Stripe). Un
  modèle de document peut le surcharger ; ici c'est la valeur de l'agence.
- **Le mode lecture seule.** Une personne sans le droit « Gérer l'agence » voit
  le profil mais ne le modifie pas : les champs sont figés, le bouton
  Enregistrer verrouillé avec sa raison, et une ligne en tête explique. Ce
  cas existe déjà dans le code ; assure-toi que la maquette le montre.

## Équipe

Elle existe (`/parametres`, section « Membres d'équipe ») : la liste avec
initiales ou photo, rôle, poste, mention VOUS, invitation en attente, membre
désactivé, exceptions de droits ; la boîte de dialogue d'invitation ; la fiche
membre avec identité, coordonnées, rôle, poste, date d'arrivée, taux horaire,
compte actif, et les onze droits cochables avec la mention « Accordé en plus »
ou « Retiré » quand ils s'écartent du rôle. **Reprends tout ça** et ajoute :

- **La photo, téléversable**, dans la fiche membre : même zone de dépôt que le
  logo, format carré, recadrage simple si c'est peu coûteux, sinon un
  avertissement « une image carrée s'affiche mieux ».
- **Ma fiche.** Un membre sans le droit « Gérer l'équipe » ouvre sa propre
  fiche et ne voit que ce qu'il peut changer : nom, coordonnées, photo. Le
  rôle, le poste, le taux et les droits sont affichés, pas modifiables, avec
  la mention « Réservé à la gestion d'équipe ». Un titre différent : « Mon
  profil » plutôt que le nom.
- **Ce que voit une personne invitée qui vient de se connecter.** Elle
  arrive sur l'application avec son compte rattaché à l'invitation. Dessine
  le petit encart qui l'accueille une seule fois : « Bienvenue, Nadia. Votre
  compte est rattaché à Agence DigiHunt comme rédactrice. Complétez votre
  fiche. » Un seul geste : compléter la fiche.

---

## Les droits, rappel pour la maquette

Onze droits existent, et deux commandent cet écran :

| Droit | Ce qu'il ouvre ici |
|---|---|
| Gérer l'agence | Modifier le profil, le logo, les taxes, les instructions de paiement |
| Gérer l'équipe | Inviter, modifier une fiche, changer un rôle, désactiver, accorder ou retirer un droit |

Sans le droit, l'écran se lit mais ne s'écrit pas. **Un bouton verrouillé
reste à sa place et dit pourquoi** — il ne disparaît pas. Deux garde-fous
existent déjà et doivent se voir : on ne peut pas se désactiver soi-même, et on
ne peut pas se retirer « Gérer l'équipe ».

## États

Accueil du hub : tout complet · un ou plusieurs manques · première ouverture,
rien de rempli. Profil : modifiable · lecture seule · enregistrement en cours ·
enregistré · erreur (« Le profil n'a pas pu être enregistré. Réessayez ; si
ça persiste, vérifiez votre connexion. »). Logo et photo : vide · en cours de
téléversement · téléversé · fichier refusé (format ou taille, avec la
contrainte rappelée). Équipe : liste · fiche en gestion · ma fiche sans
gestion · accueil d'une personne invitée.

## Ce qu'il ne faut pas faire

- Ne pas redessiner la colonne de réglages : `.set-nav` existe.
- Ne pas dessiner un tableau de bord d'agence — les cartes d'accueil disent
  ce qui manque et mènent à la section, rien de plus.
- Ne pas mélanger Paramètres et Agence hub : ce qui décrit l'agence va dans le
  hub, ce qui règle l'application reste dans Paramètres.
- Ne pas faire disparaître un bouton verrouillé.
