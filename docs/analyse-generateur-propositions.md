# Analyse — du générateur Docus-Gen au générateur de propositions de HuntPilote

Rédigé le 13 septembre 2026, à partir des dépôts `Docus-Gen_first` (le
prototype), `Docus-Gen_second` (vide : un README d'AI Studio, rien d'autre)
et de l'état de HuntPilote au commit `29fda51` (briefs de la phase 9 prêts,
Agence hub non encore intégré).

Ce document dit trois choses : ce que Docus-Gen est et ce qu'il vaut ; ce
que HuntPilote sait déjà faire de ce que Docus-Gen faisait ; et ce qu'il
faut ajouter au plan de la phase 9 pour obtenir le générateur voulu — celui
qui part de la fiche client et de l'appel découverte, pas d'un formulaire.

---

## 1. Ce qu'est Docus-Gen

Une application Vite + React 19 d'un seul écran, générée dans Google AI
Studio, sans backend ni persistance. Un assistant en cinq étapes :

| Étape | Ce qu'elle fait | Où ça vit |
|---|---|---|
| 1 | Coordonnées du client, du projet, **et du fournisseur** | `Step1ClientAndProjectInfo` |
| 2 | Trois besoins libres, puis **dix-sept textes de sections** préremplis et modifiables | `Step2ProjectNeedsAndTexts` |
| 3 | Un forfait principal parmi trois, des services optionnels, des lignes libres, une remise en % | `Step3PackageSelection` |
| 4 | Récapitulatif : investissement initial (ponctuel) et mensuel (récurrent), coûts externes à la charge du client | `Step4PricingSummary` |
| 5 | Aperçu page par page au format lettre, puis export PDF (`html2pdf.js`) ou HTML | `Step5ReviewAndExport` |

Tout l'état tient dans un seul objet `FormData` d'une cinquantaine de
champs. Le catalogue (packs Éclaireur 3 750 $, Traqueur 6 750 $, Chasseur
8 750 $ ; trois services ponctuels ; trois packs de maintenance mensuels
Bronze / Silver / Gold) et l'identité de l'agence sont des constantes dans
`constants/appConstants.ts`. Les textes par défaut sont des fonctions
paramétrées par le nom du contact, de l'entreprise, du projet.

### Ce qui vaut la peine d'être gardé

Quatre idées, et elles sont bonnes :

1. **Une proposition est un document narratif qui contient un tableau de
   prix**, pas l'inverse. Lettre d'introduction, résumé exécutif,
   compréhension des besoins, objectifs et solutions, gestion de projet,
   valeurs, collaboration, approbations, accord, signature : dix sections de
   texte pour un tableau. C'est la différence de nature entre une
   proposition et un devis, et elle a une conséquence directe sur le modèle
   de données (section 3).
2. **Chaque section a un texte par défaut et une version propre au
   document.** Le modèle fournit la base, le document la possède ensuite.
3. **Deux totaux, pas un** : « Investissement initial » (ce qui se paie une
   fois) et « Services mensuels » (ce qui se reconduit), avec la remise
   appliquée au premier seulement. Une agence qui vend un site *et* un pack
   SEO en a besoin sur chaque proposition.
4. **Les coûts externes à la charge du client** (hébergement, domaine,
   courriel, certificat) sont listés à part, hors totaux. C'est ce qui évite
   la surprise à la facture d'hébergement et une conversation désagréable.

### Ce qui ne tient pas

- **Les textes modifiés sont écrasés.** L'effet dans `App.tsx` (lignes 71
  à 85) régénère la lettre, le résumé, la communication et l'accord dès
  qu'un champ de contexte change. Corriger la lettre puis retoucher le nom
  du projet efface la correction. C'est le défaut le plus grave du
  prototype et la leçon la plus utile : **un texte généré appartient au
  document dès qu'il est créé ; le contexte ne le réécrit plus.**
- **Rien n'est paramétrable.** Le catalogue, l'identité, les textes sont
  du code. Changer un prix demande un déploiement. HuntPilote a déjà réglé
  ça (`catalog_item`, `offer`, `agency`, `document_template`).
- **Le PDF est une image.** `html2pdf.js` passe par un canevas : texte non
  sélectionnable, fichier lourd, sauts de page fragiles, aucune recherche
  ni accessibilité. Le CSS d'impression du prototype, lui, est correct et
  suffit à produire un vrai PDF par le navigateur ou par un Chromium côté
  serveur.
- **Aucune persistance, aucun cycle de vie.** Rafraîchir la page perd
  tout. Pas de brouillon, pas de statut, pas de version, pas d'envoi.
- **Les prix sont hors taxes, en dollars flottants.** Ni TPS ni TVQ, et
  `parseFloat` là où HuntPilote compte en cents entiers.
- **Une section = un champ.** Dix-sept champs `custom*` dans `FormData`,
  chacun cité dans quatre fichiers. Ajouter une section touche les types,
  l'état, le formulaire et le rendu.
- **Le fournisseur est saisi à chaque proposition** (étape 1), alors que
  c'est le profil de l'agence.
- Détails hérités de l'export AI Studio : dans `Step3`, les échappements
  doublés (`split('\\n')`, `/\\*\\*(.*?)\\*\\*/`) cassent les sauts de ligne
  des livrables et la mise en gras ; `esm.sh` et Tailwind en CDN dans
  `index.html` ne conviennent pas à une mise en production.

**Conclusion sur le code :** rien à réutiliser tel quel. Ce qui se
transfère, c'est la structure du document et les quatre idées ci-dessus.
Le HTML de l'aperçu (`Step5`) peut servir de point de départ au modèle
`proposition` de l'agence une fois converti en balises — mais le brief 9.3
demande de partir du vrai modèle actuel de l'agence, qui a changé depuis.

---

## 2. Ce que HuntPilote sait déjà faire

Presque tout le socle existe, et les briefs 9.3 / 9.4 décrivent déjà le
générateur générique. Correspondance point par point :

| Docus-Gen | HuntPilote aujourd'hui | Brief |
|---|---|---|
| Étape 1 — client et contact saisis | `client`, `contact` (session 7.1), `deal` du pipeline | — |
| Étape 1 — fournisseur saisi | `agency` : raison sociale, adresse, TPS, TVQ, logo | 9.1 |
| Constantes de forfaits | `offer` (6 offres réelles), `offer_line`, `offer_benefit`, `offer_segment` (« idéal pour ») | 9.2 |
| Services optionnels et lignes libres | `catalog_item` (39 articles), `quote_line` avec `catalog_item_id` ou `offer_id` | 9.2, 9.4 |
| Remise en % | `offer_value` (remise d'une offre) ; remise de document : à poser sur la ligne ou le document | 9.4 |
| Textes par défaut | `document_template.intro`, `legal_mentions`, `footer`, `payment_instructions` | 9.3 |
| Aperçu page par page | `.client-doc`, rendu serveur `/documents/[id]`, CSS d'impression | 9.3, 9.4 |
| Export PDF | Impression navigateur au départ, PDF serveur ensuite | 9.4 |
| Dates de proposition et d'expiration | `quote.issued_on`, `quote.expires_on` | 7.3 |
| Signature (page imprimée) | Signature simple dans le portail : nom tapé, date, adresse IP | 9.4 |
| Envoi | Courriel au contact ou fil de communications (`communication`, canal `courriel`) | 7.2, 9.4 |
| Statuts, versions | `quote_status`, `quote_version` ; `rendered_html` figé à l'envoi (à ajouter) | 7.3, 9.4 |

Autrement dit : **Docus-Gen est la v0 du générateur de la session 9.4,
pour une seule sorte de document, sans base.** Le plan de la phase 9 le
couvre déjà en grande partie. Le reste de ce document ne concerne que ce
qui manque.

---

## 3. Ce qui manque, et qu'il faut ajouter au plan

Cinq écarts. Les trois premiers viennent de la nature d'une proposition
et sont révélés par Docus-Gen ; les deux derniers viennent de la demande
nouvelle — partir de l'appel découverte, avec l'aide d'un modèle de
langage.

### 3.1 Une proposition doit avoir un foyer dans la base

`document_kind` connaît `proposition` depuis la migration 0015a, mais
aucune table ne porte une proposition : la passation dit « un document
produit = une ligne de `quote`, `contract` ou `invoice` », et `quote` n'a
pas de colonne de sorte. Le premier `insert` d'une proposition n'a nulle
part où aller.

**Proposition :** la proposition *est* un devis au sens de la base — mêmes
lignes, mêmes totaux, mêmes statuts, mêmes versions — avec deux
différences : elle porte des sections narratives (3.2) et elle précède un
contrat. Une colonne `quote.kind` (`devis` | `proposition`, contrainte
avec `template_id` de même sorte) et une colonne `contract.source_quote_id`
suffisent. On ne crée pas une table `document` générique tant que trois
tables typées font le travail ; on la créera si l'avenant ou l'annexe la
réclament.

### 3.2 Les sections narratives

C'est l'ajout le plus important aux briefs 9.3 et 9.4. Un devis se rend
avec quatre textes courts autour d'un tableau. Une proposition a dix
sections de prose, dont la moitié se réécrit pour chaque client. Le modèle
actuel (`document_template` + `body_html` à balises) ne sait pas dire
« cette partie du document est un texte que l'agence édite pour ce client,
avec une valeur par défaut ».

Deux tables :

```
document_template_section
  template_id, key ('lettre', 'resume', 'besoins', 'solutions',
  'gestion_projet', 'collaboration', 'approbations', 'accord', 'signature'…),
  title, default_body (texte avec balises), position, required, ai_assist

document_section
  quote_id (ou contract_id), key, title, body, position,
  ai_generated boolean, reviewed_at, reviewed_by
```

Et une balise de bloc dans le modèle : `{{#sections}} {{section.titre}}
{{section.corps}} {{/sections}}`, ou une balise par clé
(`{{section.lettre}}`) quand la mise en page varie d'une section à l'autre
— les deux formes se rendent avec le même moteur.

Règles :

- À la création du brouillon, les sections sont **copiées** depuis le
  modèle, balises remplies, puis appartiennent au document. Modifier le
  modèle ne les réécrit pas ; changer le contact non plus. C'est la
  correction du défaut principal de Docus-Gen.
- Une section `ai_generated` sans `reviewed_at` bloque l'envoi, exactement
  comme un libellé client « à relire » bloque la publication d'un rapport
  (règle 1 de `decisions.md`). La règle existe ; on l'applique.
- Le panneau de création (9.4, étape 2 « Le contenu ») gagne un onglet
  **Sections** à côté des lignes, avec l'aperçu qui se met à jour.

### 3.3 Deux totaux, une remise, des coûts externes

Une proposition qui vend Croissance Digitale (ponctuel) et Croissance SEO
(mensuel) doit afficher « Investissement initial » et « Mensuel ».
`offer.billing` et `catalog_item.billing` le savent, mais `quote_line`
porte seulement quantité et prix unitaire : une fois la ligne écrite,
l'information est perdue.

- Ajouter `quote_line.billing` (`public.billing_period`), copié de
  l'article ou de l'offre à la création, modifiable pour une ligne libre.
  `quote_total` se dédouble en deux sous-totaux avant taxes.
- Ajouter `quote.discount_percent` ou une ligne de remise négative — la
  ligne négative est plus simple et se voit sur le document ; la
  contrainte `quote_line_amounts_positive` doit alors admettre un montant
  négatif pour une ligne marquée remise.
- Les **coûts externes** ne sont pas des lignes : ils ne se facturent pas.
  C'est une section narrative (`key = 'couts_externes'`) dont le texte par
  défaut vit dans le modèle, à jour une fois par an quand Webflow change
  ses prix. Pas de table.

### 3.4 L'appel découverte : transcription et brief

La demande : importer la transcription (ou le résumé) de l'appel
découverte dans la fiche, pour qu'elle serve de matière à la proposition.

Ce qui existe : `communication` avec les canaux `appel` et `reunion`,
rattachée à un contact, jamais visible du client. C'est le bon foyer — un
appel découverte *est* une communication. Ce qui manque : le contenu long
et ce qu'on en tire.

```
communication_transcript
  communication_id (unique), source ('collé', 'fichier', 'integration'),
  format ('texte', 'vtt', 'srt'), language, duration_seconds,
  body text, storage_path (le fichier d'origine), imported_by, created_at

discovery_brief
  id, client_id, deal_id (nullable), communication_id (nullable : un brief
  peut être écrit à la main),
  besoins jsonb, douleurs jsonb, objectifs jsonb, budget_evoque_cents,
  echeance_evoquee date, decideurs jsonb, objections jsonb,
  prochaines_etapes jsonb, offre_suggeree_id (→ offer), justification text,
  ai_generated boolean, reviewed_at, reviewed_by, created_at
```

Dans l'écran : « Consigner l'échange » (panneau de deal et onglet
Communications) accepte une transcription — collée ou en fichier `.txt`,
`.vtt`, `.srt`. Un geste violet **« Extraire le brief »** produit un
`discovery_brief` à relire. Le brief s'affiche en carte dans le panneau de
deal et dans l'Aperçu de la fiche ; il est le point d'entrée de la
proposition.

Conservation (règle 3) : la transcription d'un prospect suit le sort de
l'instantané SEO — purgée quand le deal est perdu, après le même délai. Le
brief relu, lui, reste : c'est de la connaissance client, pas une donnée
brute. Un mot dans l'écran rappelle que l'interlocuteur doit être informé
de l'enregistrement.

Intégrations d'enregistrement (Google Meet, Fireflies, tl;dv) : plus tard,
par une intégration de Paramètres qui écrit dans `communication_transcript`
avec `source = 'integration'`. Le modèle ne change pas.

### 3.5 Le modèle de langage, à trois endroits, jamais en direct

Trois usages, trois routes serveur (`app/api/ia/*`, clé côté serveur,
sous RLS via la session), chacun marqué violet dans l'interface et chacun
produisant quelque chose **à relire** :

1. **Extraire le brief** d'une transcription (3.4). Entrée : la
   transcription, la fiche (secteur, domaine, contexte), le catalogue.
   Sortie : le `discovery_brief` structuré.
2. **Suggérer l'offre.** Entrée : le brief, les six offres avec leurs
   segments « idéal pour », leurs bénéfices, leurs prix. Sortie : une offre
   recommandée, une alternative, une justification en trois phrases, les
   options « au choix du client » tranchées quand l'appel le permet. C'est
   une présélection dans l'étape 2 du panneau, pas une décision.
3. **Rédiger les sections** narratives d'une proposition à partir du
   brief, de l'offre choisie et du texte par défaut du modèle (qui donne le
   ton). Sortie : `document_section` avec `ai_generated = true`.

Trois règles d'implémentation :

- **Sortie structurée, jamais du texte libre à parser** : un schéma par
  usage, validé côté serveur avant d'écrire en base.
- **Le catalogue est la seule source des offres et des prix.** Le modèle
  choisit parmi ce qui existe ; il n'invente ni un forfait ni un montant.
- **Chaque appel se compte** : une table `ai_usage` (agence, usage,
  jetons entrés et sortis, coût estimé, objet concerné, date), pour
  l'écran Consommation (brief 2.6) et pour le jour où HuntPilote facture
  des agences. `automation_rule.uses_ai` existe déjà pour les règles ; ceci
  est son pendant pour les gestes manuels.

### 3.6 Signature et envoi

Le brief 9.4 a déjà tranché : signature simple dans le portail (nom tapé,
date, adresse IP), pas de signature électronique certifiée au départ. Ce
qui reste à écrire pour que ce soit vrai :

```
document_signature
  quote_id ou contract_id, contact_id, typed_name, signed_at, ip, user_agent,
  rendered_html_sha256  -- ce qui a été signé, prouvable
```

Le courriel d'envoi porte un lien à jeton vers le document rendu (même
mécanisme que `/r/[token]` pour les rapports), avec le PDF en pièce jointe
quand le rendu serveur existera. Le geste « Accepter » ou « Signer » depuis
ce lien écrit la signature et fait passer le statut. La demande de signature
n'est donc pas un troisième canal : c'est l'envoi, avec un geste au bout.

Le PDF : impression navigateur en v1 (le CSS d'impression de Docus-Gen
montre que ça suffit pour un rendu propre au format lettre). En v2, un
rendu Chromium côté serveur (Playwright ou `@sparticuz/chromium` sur
Vercel) pour joindre le PDF au courriel — du vrai texte, pas une image.

---

## 4. Le parcours cible, de bout en bout

1. Appel découverte avec le prospect, enregistré.
2. Dans le panneau de deal : « Consigner l'échange », canal Appel, on
   joint la transcription. « Extraire le brief » (violet). On relit le
   brief, on corrige, on valide.
3. Le deal passe en étape Proposition. « Nouveau document » → sorte
   Proposition, modèle par défaut présélectionné.
4. Étape Contenu, source **« Depuis le brief de découverte »** : l'offre
   suggérée est présélectionnée avec sa justification, les options
   tranchées, les lignes arrivent avec `billing`. On ajuste, on ajoute une
   ligne libre, une remise.
5. Onglet Sections : les textes du modèle sont copiés et remplis ;
   « Rédiger avec le brief » (violet) propose les sections personnalisées,
   marquées à relire. On relit chacune.
6. Étape Particularités : contact destinataire, date d'expiration.
7. Aperçu `.client-doc`, balises vides signalées. « Créer le brouillon ».
8. `/documents/[id]` : « Envoyer » — verrouillé tant qu'une section reste
   à relire ou que les numéros de taxes manquent. Courriel avec lien à
   jeton, `rendered_html` figé.
9. Le prospect ouvre, accepte ou signe. Le journal le consigne.
10. « Créer la suite » : le contrat depuis la proposition acceptée
    (`contract.source_quote_id`), ses livrables, ses tâches, la facture
    d'acompte. « Marquer gagné » sur le deal, le client naît.

Chaque étape existe dans un brief, sauf 2, 4 (la source « brief ») et 5.

---

## 5. Ce que ça change au plan de la phase 9

Amender plutôt qu'ajouter, là où c'est possible :

| Brief | Amendement |
|---|---|
| 9.3 Modèles | Les modèles de sorte `proposition` et `contrat` portent des **sections** avec un texte par défaut, en plus du corps HTML ; le dictionnaire gagne `{{#sections}}` / `{{section.*}}`. |
| 9.4 Générateur | Étape Contenu : source « depuis le brief de découverte » ; onglet Sections ; deux sous-totaux (initial, mensuel) ; envoi verrouillé tant qu'une section est à relire ; `quote.kind`. |
| **9.5 Appel découverte** (nouveau) | Un brief de conception : transcription jointe à une communication, geste d'extraction, carte « Brief de découverte » dans le panneau de deal et dans l'Aperçu, états (sans transcription · en extraction · à relire · relu · purgé). Une session Claude Design, un ou deux écrans. |

Migrations, dans l'ordre où elles débloquent quelque chose :

1. `quote.kind`, `quote_line.billing`, ligne de remise,
   `contract.source_quote_id` — petite, avec test. Débloque 9.4.
2. `document_template_section`, `document_section` — moyenne. Débloque le
   modèle de proposition.
3. `communication_transcript`, `discovery_brief`, purge à la perte du deal
   — moyenne. Débloque 9.5.
4. `document_signature`, jeton d'accès au document — petite. Débloque
   l'acceptation en ligne.
5. `ai_usage` — petite. À poser avant le premier appel au modèle.

Et dans la séquence de la passation (section 5), une ligne de plus :

| # | Étape | Taille | Dépend de |
|---|---|---|---|
| 5b | Intégrer 9.5 : transcription, extraction du brief, suggestion d'offre, rédaction des sections. Routes serveur IA, `ai_usage`. | grande | 5, brief 9.5 conçu |

L'IA se branche **après** que le générateur fonctionne sans elle : un
générateur qui remplit un modèle depuis le catalogue et la fiche est déjà
utile, et c'est lui qui fixe les schémas que le modèle de langage devra
respecter.

---

## 6. Ce qu'il faut à la prochaine session

- Le **HTML actuel** du modèle de proposition de l'agence, avec ses
  balises, et la liste de ses sections narratives dans l'ordre.
- Une **transcription réelle** d'appel découverte (anonymisée), pour
  concevoir l'écran 9.5 et calibrer l'extraction sur un vrai cas.
- La décision sur `quote.kind` (section 3.1) — c'est le seul point de ce
  document qui tranche une question de structure et non d'ajout.
