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
