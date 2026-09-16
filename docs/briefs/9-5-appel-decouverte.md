# Session 9.5 — L'appel découverte et le brief

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.** Il liste
les classes déjà implémentées et réutilisables. Quarante-huit écrans existent —
n'en redessine aucun morceau.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une seule action principale verte par écran**, tout le
reste en contour ; **un message d'erreur dit quoi faire** ; **tout texte
produit par l'IA passe par une relecture humaine avant de sortir de l'agence**
(règle 1 de `decisions.md`).

> **Prérequis :** la session 9.4 (générateur) validée — ses maquettes sont
> dans `design/HuntPilote - CRM SEO_phase 9/`. **Colle aussi dans la session
> une transcription réelle d'appel découverte, anonymisée** : l'écran du
> brief doit se concevoir sur un vrai appel de quarante minutes, avec ses
> digressions, pas sur trois phrases inventées. Lis
> [`../analyse-generateur-propositions.md`](../analyse-generateur-propositions.md),
> sections 3.3, 4.4 et 4.5 : c'est le cadrage de fond de cette session.

---

## Le point structurant

Une proposition se rédige après un appel découverte, enregistré. Le
prototype qui précédait HuntPilote partait d'un formulaire vide ; le
générateur de la session 9.4 part de la fiche client et du catalogue.
Cette session ajoute ce qui manque entre les deux : **ce que le prospect a
dit**.

On ne fait pas passer une transcription brute dans une génération de
proposition. Entre l'appel et le document, HuntPilote montre **ce qu'il a
compris, ce qui reste incertain, et ce qui justifie sa recommandation**.
C'est le **brief de découverte** : un objet relu et corrigé par l'agence,
qui garde la trace de trois choses distinctes — *ce que le client a
demandé* (le brief), *ce que l'agence recommande* (la suggestion d'offre),
*ce qui sera vendu* (les lignes de la proposition).

Le gabarit réel d'offre de service de l'agence porte déjà les champs du
brief sans le savoir : `atout principal`, `problème cardinal`, `objectif
principal`, `résultat visé`, reviennent dix-neuf fois dans ses seize pages.
Le brief est ce qui les remplit.

## Ce qui existe déjà et qu'il ne faut pas redessiner

- **Le panneau de deal** (session 4.4, `dl-sheet.jsx`) : historique des
  échanges avec « Consigner un échange » (canal appel, courriel, réunion,
  note), documents, « Nouveau document » en étapes Proposition et
  Négociation, instantané SEO non historisé, « Marquer gagné ».
- **L'onglet Communications** de la fiche client (session 7.2) : un seul
  fil tous canaux, distinction visible / interne, pièces jointes,
  rattachement à un élément.
- **Le panneau « Nouveau document »** (session 9.4, `hp-doc-gen-panels.jsx`) :
  sorte, contenu (depuis une offre · depuis un document · lignes libres),
  particularités, aperçu, « Créer le brouillon ».
- **Le document** `/documents/[id]` (session 9.4, `Document.html`) : rendu,
  statut, chaîne, versions, journal.

Cette session **étend** trois de ces écrans et en **ajoute un**.

## Trois écrans

1. **Joindre un appel** — l'extension du geste « Consigner un échange »,
   dans le panneau de deal et dans l'onglet Communications.
2. **Le brief de découverte**, route `/clients/[id]/decouverte/[b]` — la
   page de relecture, avec les passages sources en regard.
3. **La carte « Brief de découverte »** — dans le panneau de deal, dans
   l'Aperçu de la fiche, et comme **source « Depuis le brief »** à l'étape
   2 du panneau « Nouveau document ».

---

## 1. Joindre un appel

Le formulaire « Consigner un échange » existe ; sur le canal **Appel** ou
**Réunion**, il gagne une zone **« Joindre la transcription »** :

- coller le texte, ou déposer un fichier `.txt`, `.vtt`, `.srt` ;
- dire ce que c'est : **transcription** (mot à mot, horodatée ou non) ou
  **résumé** (notes, compte rendu d'un outil). La distinction compte : un
  résumé ne sera jamais cité comme si le prospect l'avait dit ;
- durée de l'appel, langue, et **l'opportunité** à laquelle l'appel se
  rattache (présélectionnée depuis le panneau de deal ; à choisir depuis
  l'onglet Communications si le client a plusieurs opportunités ouvertes) ;
- une limite de taille, dite à l'écran avant le dépôt, pas après ;
- une ligne de rappel : l'interlocuteur doit avoir été informé de
  l'enregistrement.

Une fois l'échange consigné, la ligne du fil porte une marque
« Transcription jointe · 42 min » et un geste **« Extraire le brief »** en
violet — c'est de l'IA. Si un brief existe déjà pour cette opportunité, le
geste devient « Enrichir le brief » : l'appel s'ajoute aux sources, il ne
remplace pas ce qui a été relu.

Le geste lance une extraction qui peut prendre du temps : la ligne montre
« Extraction en cours », puis « Brief à relire » avec le lien, ou
« L'extraction a échoué — réessayer » sans rien laisser à moitié écrit.

**Sans transcription**, le brief se rédige à la main depuis la carte
(écran 3) : même objet, mêmes champs, sans IA. Ce n'est pas un mode
dégradé, c'est le mode d'un appel non enregistré.

---

## 2. Le brief de découverte — l'écran important

Une page à deux colonnes (`.detail-row` : `.col-main` + `.col-side`).

### La colonne principale — le brief

En tête : le client, l'opportunité, les appels lus (« 2 appels · 1 h 10 »),
l'état (**à relire** · relu · rédigé à la main), qui l'a relu et quand.

Puis les blocs, dans cet ordre, chacun modifiable en place :

| Bloc | Contenu | Ce qui le remplit dans la proposition |
|---|---|---|
| **Synthèse** | Atout principal · problème cardinal · objectif principal · résultat visé chiffré · zone · secteur | Les balises `brief.*` du gabarit (résumé analytique, recommandation) |
| **Problèmes exprimés** | Une ligne par problème, reformulée | Section « Compréhension de vos besoins » |
| **Objectifs** | Résultats recherchés, avec priorité | Section « Objectifs du projet » |
| **Périmètre** | Sites, établissements, services, langues, fonctionnalités évoquées | Section « Objectifs du projet » — structure et fonctionnalités |
| **Budget et échéance** | Valeurs exprimées, ou « non précisé » — jamais devinées | Le choix de l'offre |
| **Contraintes** | Outils existants, ressources, dépendances, contenus disponibles | Attendus du client, exclusions |
| **Décision** | Interlocuteurs, processus d'approbation, délai de décision | Contact destinataire, date d'expiration |
| **Points à clarifier** | Ce qui manque ou se contredit, avec la question à poser | La prochaine action du deal |

**Chaque ligne porte sa source.** Un clic ou un survol montre, dans la
colonne latérale, le passage de la transcription d'où elle vient
(horodatage ou position, deux ou trois phrases en contexte). Une ligne
tirée d'un résumé importé le dit : « d'après le résumé du 3 septembre »,
pas de guillemets. Une ligne ajoutée à la main n'a pas de source, et ça se
voit.

Les gestes par ligne : corriger, supprimer, ajouter. Le geste sur le bloc
Synthèse : chaque champ est un champ court, parce qu'il finira dans une
phrase du gabarit.

### La colonne latérale — les sources et la recommandation

- **Les appels lus**, un par un : date, durée, contact, transcription ou
  résumé, avec la transcription **lisible en entier** dans un panneau
  défilant, le passage cité surligné quand une ligne du brief est
  sélectionnée.
- **La suggestion d'offre** (violet) : l'offre du catalogue recommandée,
  avec — c'est le point important — **les besoins couverts, les besoins
  non couverts, les options à trancher, les incertitudes**, et trois
  phrases de justification. Une alternative en dessous. Et la sortie
  « aucune offre ne convient entièrement », qui est une réponse valide et
  mène à des lignes libres. La suggestion se recalcule après relecture du
  brief, pas avant : elle est datée de la dernière relecture.
- **Le geste vers la proposition** : « Créer la proposition depuis ce
  brief » — ouvre le panneau « Nouveau document » de la session 9.4, sorte
  Proposition, source « Depuis le brief » (écran 3). Ce n'est pas l'action
  principale de cet écran.

### L'action principale

**« Marquer le brief comme relu »** — l'unique action verte. Elle date et
signe la relecture, et c'est elle qui débloque la suite : tant que le brief
est à relire, la carte du deal le dit, et le panneau « Nouveau document »
propose la source « Depuis le brief » **grisée** avec la raison. Relire
n'est pas un formalisme : c'est ce qui empêche une proposition bien écrite
sur une mauvaise compréhension.

Une modification après relecture remet le brief « à relire » ? **Non** :
une correction faite par l'agence est une relecture. Seule une nouvelle
extraction (« Enrichir le brief » depuis un nouvel appel) remet à relire
les lignes qu'elle a ajoutées — pas celles déjà relues, qui sont marquées
et ne bougent pas.

---

## 3. La carte et la source « Depuis le brief »

### La carte « Brief de découverte »

Dans le **panneau de deal**, entre « Prochaine action » et « Historique des
échanges » ; dans l'**Aperçu de la fiche** d'un prospect, en colonne
latérale. Même composant :

- sans brief : « Aucun brief. Joignez la transcription d'un appel ou
  rédigez le brief à la main. » avec les deux gestes ;
- à relire : la synthèse en quatre lignes, le nombre de points à clarifier,
  le geste « Relire le brief » ;
- relu : la synthèse, l'offre suggérée avec son prix, « Créer la
  proposition » en contour, la date de relecture ;
- purgé : « La transcription a été purgée le 12 octobre (deal perdu). Le
  brief relu est conservé. »

Un client signé garde son brief : il documente ce qui a été compris au
départ, et il sert à la prochaine vente (les exclusions du contrat sont
souvent des besoins non couverts du brief).

### La source « Depuis le brief » — extension de la session 9.4

À l'étape 2 du panneau « Nouveau document », un quatrième onglet à côté
de « Depuis une offre · Depuis un document · Lignes libres » :
**« Depuis le brief »**, disponible seulement pour la sorte Proposition et
seulement si un brief relu existe pour ce client ou cette opportunité.

Ce qu'il fait, visible d'un coup :

- l'offre suggérée est **présélectionnée**, sa justification affichée, ses
  options « au choix du client » tranchées quand l'appel le permet (et
  laissées à trancher sinon, signalées) ;
- la maintenance recommandée (offre mensuelle du catalogue) proposée en
  ligne récurrente, à cocher ;
- les balises `brief.*` du modèle sont remplies — l'aperçu de l'étape 4 le
  montre : plus de « {{brief.probleme_cardinal}} est vide » ;
- une note dit ce que l'IA fera **après** la création du brouillon, dans
  l'espace de composition (session 9.4, mode brouillon) : proposer les
  sections « Compréhension de vos besoins », « Objectifs du projet » et la
  justification du forfait, une à une, à côté du texte du modèle, à
  relire. Rien de tout ça n'est rédigé dans le panneau.

Le geste final reste **« Créer le brouillon »**. Rien n'est envoyé.

---

## Ce qui reste dans le cadre de la base

Pour que la maquette parle le même langage que le schéma :

- un appel est une `communication` de canal `appel` ou `reunion`, rattachée
  à une opportunité ; sa transcription est un objet à part, avec sa nature
  (transcription ou résumé) ;
- le brief est un objet par opportunité, avec ses lignes sourcées, son état
  de relecture, et les appels dont il est tiré ;
- la suggestion d'offre ne choisit que parmi les offres du catalogue et ne
  touche jamais à un prix ;
- la transcription d'un prospect suit la règle 3 : purgée quand le deal est
  perdu, après le même délai que l'instantané SEO ; le brief relu reste ;
- chaque extraction et chaque suggestion est comptée pour l'écran
  Consommation (session 2.6) ;
- rien de ce que contient une transcription ne se retrouve dans un document
  client : la proposition ne lit que le brief relu et les sections
  rédigées.

## Le droit

« Gérer les comptes » pour joindre un appel et rédiger ou relire un brief.
L'extraction et la suggestion (IA) suivent le même droit ; un plafond de
consommation atteint verrouille le geste violet avec la raison et le lien
vers Consommation.

## États

Joindre un appel : sans transcription · collée · fichier déposé · trop
volumineux (dit avant) · résumé plutôt que transcription · extraction en
cours · échec relançable. Brief : aucun · à relire (extrait) · à relire
partiellement (enrichi par un second appel) · relu · rédigé à la main ·
ligne sans source · ligne tirée d'un résumé · transcription purgée ·
lecture seule sans droit · plafond IA atteint. Suggestion : offre
recommandée avec besoins non couverts · aucune offre ne convient ·
suggestion périmée (brief modifié depuis). Source « Depuis le brief » :
disponible · grisée (brief à relire) · absente (pas de brief, ou sorte
autre que Proposition).

## Ce qu'il ne faut pas faire

- Ne pas générer une proposition directement depuis une transcription :
  le brief relu est le seul passage.
- Ne pas présenter une ligne tirée d'un résumé comme une citation de
  l'appel.
- Ne pas laisser l'IA proposer un prix, un forfait hors catalogue ou une
  échéance de paiement.
- Ne pas remettre « à relire » ce qu'un humain a déjà relu.
- Ne pas redessiner le panneau de deal, le fil de communications ni le
  panneau « Nouveau document » : les étendre.
- Ne pas faire de la colonne des sources un lecteur audio : le texte
  suffit, l'enregistrement reste dans l'outil qui l'a produit.
