# Session 9.4 — Le générateur : devis, contrat, annexe, facture

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

> **Prérequis :** sessions 9.2 (offres) et 9.3 (modèles) validées. Le
> générateur assemble ce qu'elles produisent : une offre donne les lignes, un
> modèle donne le rendu.

---

## La frontière à respecter

Le **devis à un client déjà signé** existe (session 7.3, onglet « Contrat &
facturation » de la fiche client) : liste, document `.client-doc`, statuts
brouillon / envoyé / accepté / refusé / expiré, nouvelle version plutôt que
modification d'un devis envoyé, envoi par courriel ou par le fil de
communications. **Ne le redessine pas.** Cette session le généralise : le
même mécanisme, pour cinq sortes de documents, alimenté par les offres du
catalogue et rendu par les modèles de l'agence, depuis un client *ou une
opportunité du pipeline*.

## Trois écrans

1. **Créer un document** — un panneau latéral, ouvert depuis la fiche client
   ou le panneau de deal.
2. **Le document**, route `/documents/[id]` — le rendu, ses gestes, ses
   versions.
3. **Documents**, route `/agence/documents` — la liste de tout ce qui a été
   produit, section de l'Agence hub.

---

## Créer un document — le panneau

S'ouvre en `slide-over` (classes `.dl-*`) depuis deux endroits, avec le
client ou le prospect déjà connu :

- la fiche client, onglet « Contrat & facturation » — bouton « Nouveau
  document » qui remplace « Nouveau devis » ;
- le panneau de deal du pipeline — un prospect en étape Proposition ou
  Négociation reçoit une proposition ou un devis.

Quatre étapes dans le panneau, visibles d'un coup quand l'écran est assez
large, en accordéon sinon :

1. **La sorte** — proposition, devis, contrat, annexe, avenant, facture. Une
   sorte sans modèle est grisée avec le lien vers les modèles. Le modèle par
   défaut de la sorte est présélectionné, changeable.
2. **Le contenu** — trois façons de remplir les lignes :
   - **depuis une offre** : choisir Croissance Digitale, et les lignes
     arrivent (articles, offres incluses dépliées, options au choix à
     trancher ici — « Hébergement : chez nous / chez vous ») avec le prix de
     l'offre, modifiable si elle est « à partir de » ;
   - **depuis un document existant** : un contrat depuis la proposition
     acceptée, une facture d'acompte depuis le contrat (50 % à la signature,
     lu dans l'échéancier de paiement), une annexe depuis le contrat ;
   - **lignes libres** : article du catalogue ou ligne saisie.
   Les totaux (hors taxes, TPS 5 %, TVQ 9,975 %, toutes taxes) se calculent
   et s'affichent en bas de l'étape, toujours.
3. **Les particularités** — selon la sorte : date d'expiration (devis,
   proposition), délai de paiement (facture, prérempli depuis le modèle),
   contact destinataire, objet, et pour un contrat : la date de signature
   prévue, qui pose l'échéancier des jalons.
4. **L'aperçu** — le document rendu dans `.client-doc`, avec **les balises
   non remplies signalées** (« {{client.contact.titre}} est vide : ajoutez un
   titre au contact ou retirez la balise du modèle »). Le geste final :
   **« Créer le brouillon »** — l'action principale verte du panneau. Rien
   n'est envoyé à cette étape.

## Le document — `/documents/[id]`

Deux colonnes : le rendu à gauche (`.client-doc`, blanc), la colonne latérale
à droite (`.col-side`).

### La colonne latérale

- **Statut** et **référence** (« DV-2026-018 · brouillon »), client, contact,
  montant toutes taxes, dates.
- **Le geste qui compte**, un seul, vert, selon l'état :
  - brouillon → **« Envoyer »** (courriel au contact ou dépôt dans le fil de
    communications, session 7.2 — pas de troisième canal) ;
  - envoyé → en attente ; « Relancer » en contour ; pour un devis ou une
    proposition, deux gestes en contour : « Marquer accepté », « Marquer
    refusé » ; pour un contrat : « Marquer signé » avec la date ;
  - accepté ou signé → **« Créer la suite »** : le contrat depuis la
    proposition, la facture d'acompte depuis le contrat, le mandat (les
    tâches et les livrables engendrés par l'offre) depuis le contrat signé.
    C'est le geste qui transforme une vente en travail ;
  - payé (facture) → rien à faire, le dire.
- **Les versions** : un document envoyé ne se modifie pas ; « Corriger »
  crée une version 2, l'ancienne reste consultable, marquée remplacée. Même
  mécanisme que le rapport client et le devis : reprends-le.
- **La chaîne** : de quoi ce document est issu, ce qu'il a produit
  (« depuis la proposition PR-2026-004 · a produit la facture FA-2026-0031 »),
  en liens.
- **Le journal** : créé, envoyé, ouvert par le client si on le sait, accepté,
  facturé — daté, avec la personne.

### Le rendu

Le HTML du modèle rempli, figé à l'envoi : ce que le client a reçu ne bouge
plus, même si le modèle change ensuite. Un geste « Télécharger en PDF » et
« Imprimer » en contour, sous le document.

### Les taxes

Un document qui réclame les taxes **sans que l'agence ait saisi ses numéros
de TPS et de TVQ** ne peut pas être envoyé : le bouton reste verrouillé, la
raison est dite, le lien mène au profil de l'agence. C'est une vraie règle
fiscale, pas une préférence.

## Documents — la liste de l'Agence hub

Tout ce qui a été produit, toutes sortes confondues, en tableau (`.tbl`) :
référence, sorte, client, objet, montant, statut, date, personne. Filtres
par sorte, statut, période, client. Trois résumés en tête, qui sont des
manques et non des décorations : « 2 devis expirent cette semaine »,
« 1 facture en retard de 12 jours », « 3 propositions sans réponse depuis
plus de 10 jours ». Chaque ligne mène au document.

Pas d'action principale ici : on crée un document depuis un client ou un
deal, là où sont les données. La liste le dit dans son état vide.

## Ce que voit le client

Un document envoyé arrive par courriel avec un lien, ou dans le portail
client (phase 5) sous « Documents » — le même rendu blanc, le même PDF. Un
devis ou une proposition peut y être **accepté d'un geste** ; un contrat y
est **signé** (nom tapé, date, adresse IP consignée — une signature simple,
pas une signature électronique certifiée : dis-le dans la maquette).
Dessine seulement l'écran du portail qui montre le document et le geste
d'acceptation ; le reste du portail existe.

## États

Panneau de création : sorte sans modèle · contenu depuis une offre avec
option à trancher · balise vide à l'aperçu · taxes sans numéros. Document :
brouillon · envoyé · relancé · accepté / signé · refusé avec motif · expiré ·
payé · en retard · remplacé par une version · verrouillé sans droit. Liste :
avec manques · sans manque · vide (« Aucun document. Créez-en un depuis une
fiche client ou une opportunité. »).

## Le droit

« Envoyer des documents » pour envoyer une proposition, un devis, un contrat ;
« Facturer » pour une facture. Créer un brouillon est ouvert à qui gère les
comptes. Un bouton verrouillé dit lequel des droits manque.

## Ce qu'il ne faut pas faire

- Ne pas redessiner le devis de la session 7.3 : c'est le même document,
  généralisé.
- Ne pas permettre d'envoyer un document avec des balises vides ou sans les
  numéros de taxes.
- Ne pas modifier un document envoyé : une version.
- Ne pas inventer un troisième canal d'envoi ni un second rendu de
  document.
- Ne pas faire du portail une deuxième application : un écran, un geste.

---

## Amendements du 14 septembre 2026 — composition du brouillon, montants, versions figées, états

Issus de la mission 001 (`../orchestration/analyses/001-reconciliation-catalogue.md`),
de l'analyse générale du générateur (sections 3.7, 4 et 5) et de la feuille de
route (étapes 3 à 6). Ce qui précède reste valable ; ce qui suit le précise ou
le remplace. Les décisions `D-nn` ne sont pas prises : la maquette montre les
deux hypothèses ou laisse une note.

### Le point de départ ne change pas

Une proposition part de la **fiche client** (onglet « Contrat & facturation »)
ou de l'**opportunité** (panneau de deal, étapes Proposition et Négociation).
Le panneau de création en quatre étapes reste le geste pour créer. Deux ajouts
à l'étape 2, « Le contenu » :

- une quatrième source, **« Depuis le brief »** (session 9.5) : la
  recommandation s'affiche comme une **suggestion**, en violet, avec sa
  justification en trois phrases, ce qu'elle couvre et ce qu'elle ne couvre
  pas ; un geste « Retenir » la transforme en choix, et la sélection manuelle
  dans le catalogue reste possible à tout moment. Les options au choix sont
  **proposées** d'après le brief, marquées « à confirmer » ; une option
  incertaine ne devient jamais un choix vendu tant qu'une personne ne l'a pas
  confirmée. Les balises `brief.*` connues sont remplies ; celles marquées
  inconnues ou sans objet restent vides et leurs phrases conditionnelles ne
  se rendent pas. Sans brief validé, la source est grisée avec la raison.

  États de cette source, tous à dessiner : **aucune offre adaptée** (la
  recommandation le conclut, avec la raison ; le panneau propose les lignes
  libres et le catalogue) · **plusieurs offres possibles** (deux ou trois
  suggestions côte à côte avec leurs couvertures, aucune présélectionnée,
  choix manuel requis) · **options non tranchées** (le brouillon peut être
  créé, l'option reste « à trancher » dans les éléments manquants et bloque
  l'envoi) · **recommandation indisponible** (IA absente, non autorisée,
  plafond atteint ou erreur : la source reste utilisable, elle remplit les
  balises du brief et laisse choisir l'offre à la main) · **sélection
  manuelle** (une offre choisie sans suggestion, ou contre la suggestion :
  la justification n'est pas copiée, la section « recommandation » repart du
  texte par défaut) ;
- pour « Depuis une offre » : le choix des **offres présentées** dans le
  document (D-06 : par défaut la seule offre recommandée, option « comparer »),
  la **maintenance recommandée** (D-01, affichée « exemple » tant que la
  décision manque) et la séparation visible entre **prestations ponctuelles**
  et **prestations récurrentes**.

### « Créer le brouillon » ouvre la composition, pas le rendu figé

`/documents/[id]` en mode brouillon est un **atelier**, en pleine page. Deux
colonnes (`.detail-row`) :

- à gauche, le document dans `.client-doc`, blanc, **éditable en place** :
  chaque section narrative est un champ long à sa position dans la mise en
  page, chaque ligne du tableau se modifie ou se retire ; ce n'est pas un
  éditeur visuel de mise en page, seulement le contenu ;
- à droite, `.col-side` : le brief (résumé, lien vers la session 9.5), la
  liste des sections avec leur état, les lignes avec les deux sous-totaux,
  la liste des éléments manquants, un geste « Aperçu » qui montre le rendu
  tel qu'il partira.

### Les sections, une à une

Chaque section a un état visible : **à rédiger** (texte par défaut du modèle,
pas encore touché) · **proposée par l'IA** (violet, à relire) · **modifiée à la
main** · **relue** · **verrouillée** (plus jamais touchée par une régénération)
· **retirée** (section optionnelle désactivée) · **verrouillée par l'agence**
(clause, lecture seule avec cadenas).

- Une suggestion de l'IA s'affiche **à côté** du texte courant, jamais à sa
  place, avec deux gestes : « Retenir » et « Ignorer ». Le geste violet
  « Rédiger avec le brief » existe par section et pour toutes les sections
  autorisées à la fois.
- **Un texte modifié à la main est conservé.** Changer d'offre, de contact, de
  modèle ou relancer l'IA ne le réécrit pas ; l'atelier le dit : « 3 sections
  modifiées à la main conservées ». C'est la correction du défaut du
  prototype Docus-Gen.
- **Sans IA**, tout fonctionne : le texte par défaut est le guide, on écrit
  dedans ; les gestes violets sont absents (ou verrouillés avec la raison
  « IA non configurée pour cette agence »). Dessine cet état.
- Une section proposée par l'IA et non relue bloque l'envoi (règle 1 de
  `decisions.md`).

### Les lignes : récurrence, nature, deux totaux

Chaque ligne porte une **récurrence** (ponctuel, mensuel, trimestriel, annuel)
et une **nature** : facturable, **offert** (bonus à la signature, montant
affiché « Offert »), **remise** (en pourcentage ou en montant, prix avant
remise visible), **informatif** (budget média payé à un tiers : hors totaux,
hors taxes, dans un bloc à part libellé « non facturé par l'agence »).

Les totaux affichés, dans la colonne et dans le rendu, **séparés par
périodicité** : **investissement initial** (ponctuel, avant remises, remises,
HT, taxes, TTC) · **par mois**, et s'il y a lieu **par trimestre**, **par
année** (un bloc par périodicité présente, jamais un « récurrent » qui les
additionne) · **budget externe** (informatif, avec sa période de référence :
« 600 $ par mois, 20 $ par jour »).

- La **durée d'engagement** est propre à chaque prestation récurrente, sur
  sa ligne (« 295 $ par mois · engagement 3 mois : 885 $ »), copiée de
  l'offre et modifiable ligne par ligne ; deux lignes mensuelles peuvent
  différer.
- Une **remise** affiche son pourcentage, son assiette (« −25 % sur la phase
  ponctuelle, 1 200 $ ») et le montant calculé (« −300 $ ») comme trois
  informations distinctes ; une remise saisie en montant affiche l'assiette
  et le montant, sans pourcentage inventé.
- Le **total estimé** n'apparaît que si le composeur a fixé son horizon
  (« sur 3 mois ») et si la liste de ce qu'il additionne est affichée sous
  lui, chaque élément marqué « facturé par l'agence » ou « payé à un tiers ».
  Sans horizon, le bloc dit « Choisissez un horizon pour afficher un total
  estimé » ; il ne calcule rien.

Le catalogue reste la seule source de prix : une ligne dont le prix s'écarte
du catalogue le signale (« prix catalogue 700 $ ») ; une offre « à partir de »
accepte un prix supérieur sans avertissement. Les exemples de rendu
attendus sont dans l'analyse 001, section 5.6.

L'**échéancier de paiement** (50 % à la signature, 50 % avant mise en ligne,
15 jours — libellés sous réserve de D-07) s'affiche depuis l'offre, dans la
colonne et le rendu ; il se change par ses règles (pourcentages,
déclencheurs, délai), pas en texte libre.

### Les éléments manquants

Une liste, dans la colonne, chaque élément cliquable vers l'endroit à
corriger : section à relire · balise requise vide (`brief.*` dans une section
activée, contact sans courriel, adresse manquante pour un contrat) · valeur
proposée non confirmée (raison sociale proposée depuis le nom commercial,
signataire proposé depuis le destinataire, zone cible proposée depuis la
ville) · option d'offre non tranchée · ligne récurrente sans engagement quand
un total sur engagement est rendu · total estimé sans horizon · numéros de
taxes non renseignés · ligne sans prix · offre devenue inactive · modèle
incomplet. Tant qu'elle n'est pas vide, **« Envoyer »** reste à sa place,
verrouillé, avec le compte (« 3 éléments manquants »).

### Envoyer, c'est figer

À l'envoi, la **version 1** est figée : lignes, sections, taux de taxes,
modèle et sa version, contact destinataire, rendu HTML. La colonne montre
« Version 1 · figée le 14 septembre · envoyée à … par courriel ». Une version
envoyée ne se modifie plus ; **« Corriger »** ouvre l'atelier sur une
version 2 initialisée depuis la version 1, et la version 1 reste consultable,
marquée « remplacée » quand la version 2 part. Chaque version figée se rend
telle qu'elle était, même si le catalogue, le modèle ou les taux ont changé
depuis ; un bandeau dans le rendu figé le rappelle.

Le **journal** distingue les événements : créé · envoyé (version,
destinataire, canal) · ouvert par le client · accepté · refusé (motif) ·
expiré · signé · facturé · remplacé par la version N. Chaque ligne est datée
et nomme la personne.

### « Créer la suite » depuis une proposition mixte

Une proposition acceptée qui contient du ponctuel et du récurrent engendre
plusieurs objets : le **contrat** (mandat ponctuel), l'**abonnement**
(prestations récurrentes ; D-15 dit si une entente signée est requise), la
**facture d'acompte**. L'écran dit ce qu'il va créer avant de le faire, avec
les montants, et ce qui existe déjà (pas de doublon si on recommence).

### Le portail

Inchangé : acceptation d'un geste, signature simple. Si le modèle de
proposition active la section « Accord et signature » (D-14), le geste du
portail devient « Accepter et signer » et consigne nom tapé, date et adresse
IP comme pour un contrat.

### États — complément

Atelier : brouillon vide (sections au texte par défaut, aucune ligne) ·
brouillon depuis une offre · brouillon depuis le brief · section proposée en
attente · IA indisponible ou en erreur (« Réessayer » ou rédiger à la main) ·
plafond d'utilisation de l'IA atteint · éléments manquants · prêt à envoyer ·
enregistrement automatique en cours · « enregistré à 14 h 32 » · non
enregistré, connexion perdue (les modifications seront réessayées, ne pas
fermer) · conflit (un autre membre a modifié ce brouillon : recharger, pas
d'écrasement silencieux) · reprise après rechargement (« brouillon repris là
où vous l'aviez laissé ») · prix catalogue changé depuis la création (« ce
brouillon garde 700 $ · mettre à jour ? ») · modèle changé depuis la création
(même chose pour les sections non touchées) · lecture seule sans « Gérer les
comptes » · envoi verrouillé sans « Envoyer des documents » · facture
verrouillée sans « Facturer ». Document : version envoyée verrouillée avec
« Corriger » · version remplacée · rendu figé avec bandeau.

### Transitions

| De | Geste ou événement | Vers |
|---|---|---|
| brouillon (composition) | Envoyer | envoyé, version 1 figée |
| envoyé | Corriger | brouillon version 2 ; version 1 en attente |
| brouillon version 2 | Envoyer | envoyé version 2 ; version 1 remplacée |
| envoyé | Marquer accepté, ou acceptation dans le portail | accepté |
| envoyé | Marquer refusé, avec motif | refusé |
| envoyé | date d'expiration passée | expiré ; « Relancer » crée une version avec une nouvelle date |
| accepté | Créer la suite | contrat en brouillon, abonnement, facture d'acompte ; la proposition ne change pas |
| contrat envoyé | signature dans le portail, ou Marquer signé | signé |
| facture envoyée | paiement | payée ; ou en retard à l'échéance |

Aucune transition ne ramène un document envoyé à brouillon sans nouvelle
version.

### Données lues et écrites

Lues : client, contacts, opportunité, brief validé, offres actives avec
lignes, options, livrables, échéancier, modèle par défaut de la sorte avec
ses sections, taux de taxes, profil et numéros de l'agence, droits de la
personne. Écrites : le document (sorte proposition ou devis, opportunité
d'origine), lignes avec récurrence et nature, sections et leurs états, choix
d'options, versions figées, événements du journal, communication d'envoi.
Jamais : la transcription, le contenu du brief au-delà des balises `brief.*`
validées.

### Ce qu'il ne faut pas faire — compléments

- Ne pas réécrire un texte modifié à la main, quel que soit le geste.
- Ne pas faire calculer ni proposer un prix par l'IA : les prix viennent du
  catalogue, les calculs du moteur.
- Ne pas transformer une suggestion d'offre ou d'option en choix vendu sans
  un geste explicite de la personne.
- Ne pas remplir la raison sociale, le signataire ou la zone cible depuis une
  autre donnée sans afficher la proposition et sa confirmation.
- Ne pas mélanger budget média et honoraires dans un même total sans le dire.
- Ne pas afficher la transcription, le brief brut ni la légende d'un gabarit
  dans le document.
- Ne pas dessiner un second rendu : l'atelier, l'aperçu, le PDF et le portail
  montrent le même document.
