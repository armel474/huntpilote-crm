# Session 7.3 — Devis

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel
quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session** — en
particulier **le document client** (`.client-doc`), déjà utilisé pour le
rapport et pour la clôture d'une tâche : un devis en est une nouvelle
application.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative ; les statuts ne reposent jamais uniquement sur la
couleur ; libellés de boutons concrets en français ; **une mesure ne s'affiche
jamais sans son seuil** ; **une seule action principale verte par écran**.

> **Ce qui existe déjà.** L'onglet « Contrat & facturation » de la fiche client
> a un historique de factures — lecture seule, aucun geste de création. Le
> panneau de détail d'un deal (session 4.4) mentionne déjà un devis parmi ses
> documents, mais c'est le devis de **vente initiale**, avant signature.

## La frontière à respecter

**Cette session ne touche pas au devis de vente initiale** du panneau de deal
— celui-là reste dans le pipeline, avant qu'un prospect devienne client. Cette
session couvre les devis émis à un **client déjà signé** : un service
additionnel, un avenant au forfait, un renouvellement à un tarif différent.
Même objet visuellement, contexte commercial différent — ne fusionne pas les
deux écrans, mais réutilise le même gabarit de document.

---

## Deux écrans

1. **Devis** — nouvelle section dans l'onglet « Contrat & facturation »,
   à côté de l'historique de factures existant
2. **Détail d'un devis** — le document lui-même

---

## Devis — la liste

### Ce qu'elle doit montrer

- Une liste à côté de « Historique des factures », pas une refonte de celle-ci
  — même gabarit de tableau (`.tbl`), mêmes colonnes de statut.
- Colonnes : numéro, objet (« Ajout d'une seconde langue au site »), montant,
  date d'émission, **statut**, date d'expiration si applicable.
- **Statuts** : brouillon, envoyé, accepté, refusé, expiré. Chacun se
  reconnaît sans dépendre de la seule couleur.
- Un geste **« Nouveau devis »** — l'action principale verte de cette section.

### Un devis accepté devient quoi ?

Il doit se lier clairement à ce qu'il produit : une ligne ajoutée au contrat
actif, ou un avenant daté. Ne laisse pas un devis accepté flotter sans
conséquence visible sur le contrat affiché plus haut dans l'onglet.

---

## Détail d'un devis — le document

Repose sur `.client-doc` — le même rendu blanc, qui reste blanc même en thème
sombre, déjà utilisé pour le rapport client et la clôture de tâche. C'est un
document destiné au client, pas une vue interne.

### Ce qu'il doit contenir

- En-tête : agence, client, numéro, date d'émission, date d'expiration.
- **Lignes de service** — chacune avec sa description, sa quantité s'il y a
  lieu, son prix. Un total clair, taxes séparées (TPS/TVQ).
- **Conditions** — modalités de paiement, durée de validité de l'offre.
- **Le geste qui compte**, selon l'état :
  - Brouillon → « Envoyer au client » (action principale verte).
  - Envoyé → en attente ; un geste de relance en contour, pas vert.
  - Un devis envoyé n'est plus modifiable directement — une correction crée
    une nouvelle version, comme pour le rapport client (l'ancienne reste
    consultable). Ne réinvente pas ce mécanisme, reprends celui du rapport.

### Comment il arrive au client

Envoyé par courriel, ou déposé dans le fil de communications (session 7.2) sur
le contact concerné — pas un troisième canal de livraison à inventer.

### États

Brouillon en cours de rédaction · envoyé, en attente de réponse · accepté,
lié au contrat · refusé, avec motif optionnel · expiré sans réponse.

## Ce qu'il ne faut pas faire

- Ne pas fusionner avec le devis de vente initiale du panneau de deal.
- Ne pas permettre de modifier un devis déjà envoyé — une nouvelle version,
  jamais une modification silencieuse d'un document que le client a peut-être
  déjà ouvert.
- Ne pas inventer un troisième mécanisme d'envoi — courriel ou fil de
  communications, rien de plus.
