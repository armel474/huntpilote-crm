# Analyse — du générateur Docus-Gen au générateur de propositions de HuntPilote

Rédigé le 13 septembre 2026, à partir des dépôts `Docus-Gen_first` (le
prototype), `Docus-Gen_second` (vide : un README d'AI Studio, rien d'autre)
et de l'état de HuntPilote au commit `29fda51` (briefs de la phase 9 prêts,
Agence hub non encore intégré). Révisé le même jour pour intégrer une
seconde analyse, convergente, dont les apports sont listés en section 7.

Ce document dit trois choses : ce que Docus-Gen est et ce qu'il vaut ; ce
que HuntPilote sait déjà faire de ce que Docus-Gen faisait ; et ce qu'il
faut ajouter au plan de la phase 9 pour obtenir le générateur voulu — celui
qui part de la fiche client et de l'appel découverte, pas d'un formulaire.

**La thèse :** la proposition n'est pas un PDF à produire. C'est le maillon
qui transforme des besoins entendus en services proposés, puis en
engagements précis, puis en livrables que HuntPilote suit. Le module vaut
par cette chaîne, pas par le document.

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

Cinq idées, et elles sont bonnes :

1. **Le parcours guidé** : contexte, besoins, forfait et options,
   récapitulatif, révision avant export. L'ordre est le bon ; c'est celui
   d'une conversation de vente.
2. **Une proposition est un document narratif qui contient un tableau de
   prix**, pas l'inverse. Lettre d'introduction, résumé exécutif,
   compréhension des besoins, objectifs et solutions, gestion de projet,
   valeurs, collaboration, approbations, accord, signature : dix sections de
   texte pour un tableau. C'est la différence de nature entre une
   proposition et un devis, et elle a une conséquence directe sur le modèle
   de données (section 3).
3. **Chaque section a un texte par défaut et une version propre au
   document.** Le modèle fournit la base, le document la possède ensuite.
4. **Deux totaux, pas un** : « Investissement initial » (ce qui se paie une
   fois) et « Services mensuels » (ce qui se reconduit), avec la remise
   appliquée au premier seulement. Une agence qui vend un site *et* un pack
   SEO en a besoin sur chaque proposition.
5. **Les coûts externes à la charge du client** (hébergement, domaine,
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
- **Le document mélange trois choses** : l'argumentaire commercial, les
  modalités du projet (gestion, approbations, facturation) et l'accord
  signé. Dans HuntPilote, la proposition porte l'argumentaire ; les
  modalités et l'accord vivent dans le contrat et l'Annexe A, qui existent
  déjà en base (`contract`, `contract_document` avec rang de priorité).
- **Le PDF est une image.** `html2pdf.js` passe par un canevas : texte non
  sélectionnable, fichier lourd, sauts de page fragiles, aucune recherche
  ni accessibilité. Le CSS d'impression du prototype, lui, est correct et
  suffit à produire un vrai PDF par le navigateur ou par un Chromium côté
  serveur.
- **Aucune persistance, aucun cycle de vie.** Rafraîchir la page perd
  tout. Pas de brouillon, pas de statut, pas de version, pas d'envoi.
- **La signature est une zone imprimée à remplir.** Aucun circuit.
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
transfère, c'est la structure du document et les cinq idées ci-dessus.
Les tarifs, engagements et textes viendront de l'offre actuelle de
l'agence, pas du prototype.

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
| Statuts, versions | `quote_status`, `quote_version.content` (jsonb) ; `rendered_html` figé à l'envoi (à ajouter) | 7.3, 9.4 |
| Suite de la vente | `contract`, `deliverable`, `milestone`, `payment_milestone`, `offer_task_template`, `app.apply_offer_tasks` | 9.2, 9.4 |

Autrement dit : **Docus-Gen est la v0 du générateur de la session 9.4,
pour une seule sorte de document, sans base.** Le plan de la phase 9 le
couvre déjà en grande partie. La demande nouvelle enrichit surtout
**l'amont** de ce parcours : découverte, recommandation, rédaction
assistée. Le reste de ce document ne concerne que ce qui manque.

---

## 3. Ce qui manque, et qu'il faut ajouter au plan

Sept écarts. Les trois premiers viennent de la nature d'une proposition
et sont révélés par Docus-Gen ; les deux suivants viennent de la demande
nouvelle ; les deux derniers sont des défauts du schéma actuel à corriger
avant d'automatiser quoi que ce soit.

### 3.1 Une proposition doit avoir un foyer, et appartenir à une opportunité

`document_kind` connaît `proposition` depuis la migration 0015a, mais
aucune table ne porte une proposition : la passation dit « un document
produit = une ligne de `quote`, `contract` ou `invoice` », et `quote` n'a
pas de colonne de sorte. Le premier `insert` d'une proposition n'a nulle
part où aller.

Et `quote` n'a pas de `deal_id`. Or un même client achète une refonte
cette année, du SEO ensuite, une autre prestation plus tard : les appels,
le brief et la proposition de chaque vente doivent se retrouver sans se
mélanger. **La fiche client reste le point d'entrée ; la proposition
appartient à une opportunité.** `contract.deal_id` existe déjà ; le devis
doit suivre.

**Proposition :** la proposition *est* un devis au sens de la base — mêmes
lignes, mêmes totaux, mêmes statuts, mêmes versions — avec deux
différences : elle porte des sections narratives (3.2) et elle précède un
contrat. Trois colonnes :

- `quote.kind` (`devis` | `proposition`), avec contrainte : le
  `template_id` est de la même sorte ;
- `quote.deal_id` (nullable : un devis à un client signé n'a pas
  d'opportunité) ;
- `contract.source_quote_id`, la proposition acceptée dont le contrat
  est issu.

On ne crée pas une table `document` générique tant que trois tables
typées font le travail ; on la créera si l'avenant ou l'annexe la
réclament.

### 3.2 Les sections narratives, révisables une à une

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
  'gestion_projet', 'couts_externes', 'collaboration', 'signature'…),
  title, default_body (texte avec balises), position, required,
  ai_assist boolean   -- l'IA peut proposer un texte pour cette section
  locked_by_agency    -- clause approuvée : jamais réécrite par l'IA

document_section
  quote_id (ou contract_id), key, title, body, position,
  locked boolean,          -- paragraphe validé : plus touché par une régénération
  ai_generated boolean, reviewed_at, reviewed_by
```

Et une balise de bloc dans le modèle : `{{#sections}} {{section.titre}}
{{section.corps}} {{/sections}}`, ou une balise par clé
(`{{section.lettre}}`) quand la mise en page varie d'une section à l'autre
— les deux formes se rendent avec le même moteur.

Règles :

- À la création du brouillon, les sections sont **copiées** depuis le
  modèle, balises remplies, puis appartiennent au document. Modifier le
  modèle ne les réécrit pas ; changer le contact ou le forfait non plus.
  C'est la correction du défaut principal de Docus-Gen.
- **Révision section par section.** Modifier les objectifs ne régénère pas
  le prix ; ajuster une option ne perd pas l'introduction. Une section
  verrouillée ne bouge plus. Une nouvelle suggestion de l'IA s'affiche **à
  côté** du texte courant, et n'est écrite qu'au geste « Retenir » — la
  suggestion refusée n'est pas conservée, seul l'appel est compté (3.5).
- Une section `ai_generated` sans `reviewed_at` bloque l'envoi, exactement
  comme un libellé client « à relire » bloque la publication d'un rapport
  (règle 1 de `decisions.md`). La règle existe ; on l'applique.
- Les clauses approuvées de l'agence (`locked_by_agency` dans le modèle)
  ne passent jamais par l'IA : elles se copient, point.

### 3.3 Deux totaux, une remise, des coûts externes

Une proposition qui vend Croissance Digitale (ponctuel) et Croissance SEO
(mensuel) doit afficher « Investissement initial » et « Mensuel ».
`offer.billing` et `catalog_item.billing` le savent, mais `quote_line`
porte seulement quantité et prix unitaire : une fois la ligne écrite,
l'information est perdue.

- Ajouter `quote_line.billing` (`public.billing_period`), copié de
  l'article ou de l'offre à la création, modifiable pour une ligne libre.
  `quote_total` se dédouble en deux sous-totaux avant taxes.
- Ajouter une ligne de remise négative plutôt qu'un pourcentage sur le
  document — elle se voit sur le document et se justifie ; la contrainte
  `quote_line_amounts_positive` doit alors admettre un montant négatif
  pour une ligne marquée remise. **Une adaptation commerciale est
  explicite et validée** ; le catalogue reste la seule source des prix.
- Les **coûts externes** ne sont pas des lignes : ils ne se facturent pas.
  C'est une section narrative (`key = 'couts_externes'`) dont le texte par
  défaut vit dans le modèle, à jour une fois par an quand Webflow change
  ses prix. Pas de table.

### 3.4 L'appel découverte : transcription, puis brief révisable

La demande : importer la transcription (ou le résumé) de l'appel
découverte dans la fiche, pour qu'elle serve de matière à la proposition.

**On ne fait pas passer une transcription brute dans une génération de
proposition.** Entre les deux, HuntPilote montre ce qu'il a compris, ce
qui reste incertain, et ce qui justifie ses recommandations. C'est le
**brief de découverte**, et il a une valeur commerciale propre : il évite
une proposition bien écrite sur une mauvaise compréhension, et il garde la
trace de trois choses distinctes — **ce que le client a demandé** (le
brief), **ce que l'agence recommande** (la suggestion, 3.5), **ce qui sera
vendu** (les lignes du document).

Ce qui existe : `communication` avec les canaux `appel` et `reunion`,
rattachée à un contact, jamais visible du client. C'est le bon foyer — un
appel découverte *est* une communication. Ce qui manque : le contenu long,
son rattachement à l'opportunité, et ce qu'on en tire.

```
communication
  + deal_id (nullable)   -- l'appel appartient à l'opportunité qu'il prépare

communication_transcript
  communication_id (unique),
  kind ('transcription' | 'resume'),   -- un résumé importé n'est jamais cité
  source ('collé', 'fichier', 'integration'),
  format ('texte', 'vtt', 'srt'), language, duration_seconds,
  body text, storage_path (le fichier d'origine), imported_by, created_at

discovery_brief
  id, client_id, deal_id, created_from (jsonb : les communication_id lus),
  problemes jsonb, objectifs jsonb, perimetre jsonb, budget_evoque_cents,
  echeance_evoquee date, contraintes jsonb, decideurs jsonb,
  points_a_clarifier jsonb,
  ai_generated boolean, reviewed_at, reviewed_by, created_at, updated_at
```

Chaque élément du brief (un problème, un objectif, une contrainte) porte
sa **source** : l'identifiant de la communication et, pour une
transcription, le passage (décalage ou horodatage) d'où il vient. Le
brief se lit avec le passage en regard. Pour un résumé importé, la source
est le résumé, présenté comme tel — jamais comme une citation de l'appel.

Le brief peut se rédiger **à la main**, sans transcription ni IA : c'est
le même objet, `ai_generated = false`. Un brief se construit depuis un ou
plusieurs appels de la même opportunité.

Dans l'écran : « Consigner l'échange » (panneau de deal et onglet
Communications) accepte une transcription — collée ou en fichier `.txt`,
`.vtt`, `.srt`, avec une limite de taille dite à l'écran. Un geste violet
**« Extraire le brief »** produit un `discovery_brief` à relire. Le brief
s'affiche en carte dans le panneau de deal et dans l'Aperçu de la fiche ;
il est le point d'entrée de la proposition.

Conservation (règle 3) : la transcription d'un prospect suit le sort de
l'instantané SEO — purgée quand le deal est perdu, après un délai réglé
dans `agency_settings` (le même que `deal_seo_snapshot`, ou le sien). Le
brief relu, lui, reste : c'est de la connaissance client, pas une donnée
brute. Un mot dans l'écran rappelle que l'interlocuteur doit être informé
de l'enregistrement. **Une source interne ne se retrouve jamais dans un
document client** parce qu'elle a servi à le rédiger : le rendu ne lit
que `document_section` et les lignes, jamais le brief ni la transcription.

Intégrations d'enregistrement (Google Meet, Fireflies, tl;dv) : plus tard,
par une intégration de Paramètres qui écrit dans `communication_transcript`
avec `source = 'integration'`. Le modèle ne change pas.

### 3.5 Le modèle de langage : analyste et assistant de rédaction, jamais décideur

Trois usages, trois routes serveur (`app/api/ia/*`), chacun marqué violet
dans l'interface et chacun produisant quelque chose **à relire** :

1. **Extraire le brief** d'une transcription (3.4). Entrée : la
   transcription, la fiche (secteur, domaine, contexte), le catalogue.
   Sortie : le `discovery_brief` structuré, avec ses sources et ses points
   à clarifier.
2. **Suggérer l'offre.** Entrée : le brief validé, les offres avec leurs
   segments « idéal pour », leurs bénéfices, leurs lignes, leurs prix.
   Sortie, pour chaque offre envisagée : **les besoins couverts, les
   besoins non couverts, les options à trancher, les incertitudes**, et
   une justification en trois phrases. Le modèle **peut conclure qu'aucune
   offre ne convient entièrement** — c'est une sortie valide, qui mène à
   des lignes libres. C'est une présélection dans le générateur, pas une
   décision.
3. **Rédiger les sections** narratives d'une proposition à partir du
   brief, de l'offre choisie et du texte par défaut du modèle (qui donne le
   ton). Sortie : `document_section` avec `ai_generated = true`, sauf les
   sections `locked_by_agency`.

Règles d'implémentation :

- **Sortie structurée, jamais du texte libre à parser** : un schéma par
  usage, validé côté serveur avant d'écrire en base.
- **Le catalogue est la seule source des offres et des prix.** Le modèle
  choisit parmi ce qui existe ; il n'invente ni un forfait ni un montant ni
  une échéance de paiement. Les calculs restent dans `quote_total`.
- **Sous RLS, avec le client de la session** — jamais la clé de service,
  qui contourne les politiques. La clé du fournisseur d'IA reste côté
  serveur.
- **Reprenable** : une extraction est une tâche avec un état (`en_cours`,
  `terminee`, `echouee`), relançable, pour qu'un délai dépassé sur une
  longue transcription ne laisse rien à moitié écrit.
- **Chaque appel se compte** : une table `ai_usage` (agence, usage,
  jetons entrés et sortis, coût estimé, objet concerné, date), pour
  l'écran Consommation (brief 2.6) et pour le jour où HuntPilote facture
  des agences. `automation_rule.uses_ai` existe déjà pour les règles ; ceci
  est son pendant pour les gestes manuels.

### 3.6 Figer une version, c'est figer ses données, pas seulement son HTML

La passation prévoit `rendered_html` figé à l'envoi. Ça ne suffit pas :
`quote_total` et `invoice_total` (migrations 0004 et 0013) calculent les
taxes avec `agency_settings.tps_rate` et `tvq_rate` **courants**. Un
changement de taux réécrirait le total de tous les documents passés, alors
que le PDF envoyé, lui, ne bouge pas. Le document historique doit rester
cohérent avec lui-même.

- Ajouter `tps_rate` et `tvq_rate` sur `quote` et `invoice`, posés à
  l'envoi ; les vues calculent avec `coalesce(document.rate,
  settings.rate)`. Un brouillon suit les réglages, un document envoyé
  garde les siens.
- `quote_version.content` (jsonb, existant) est le bon endroit pour
  l'instantané complet d'une version : lignes, récurrence, remise, taux,
  totaux, sections, contact destinataire, modèle et sa version. Il faut
  **en définir le schéma** plutôt que d'en ajouter un autre. Le
  `rendered_html` et le PDF s'y rattachent.
- Les événements restent distincts et datés : **envoyé, ouvert, accepté,
  signé, payé** ne veulent pas dire la même chose. Un envoi identifie
  exactement la version transmise et son destinataire ; une demande de
  signature porte sur cette version ; une correction après envoi crée une
  version et garde l'ancienne.

### 3.7 Les tâches doivent suivre la vente concernée

`task_from_template_once` (migration 0012) est unique sur
(`client_id`, `offer_template_id`, `period_month`). La règle empêche de
créer deux fois la tâche d'octobre — bien pour un abonnement — mais deux
mandats distincts du même client avec le même gabarit le même mois
entreraient en collision. `client_subscription_active_unique` pare le cas
pour les abonnements (jamais deux fois la même offre active) ; il reste
ouvert pour deux mandats ponctuels, et il le sera davantage quand le
générateur créera le mandat depuis la proposition acceptée.

Avant d'automatiser cette création : rattacher explicitement la tâche à
ce qui l'a engendrée (`task.subscription_id` ou `task.contract_id`), et
faire porter l'unicité sur cette origine plutôt que sur le client. Une
migration et son test, à faire **avant** l'étape « Créer la suite » du
brief 9.4.

### 3.8 Signature et envoi

Le brief 9.4 a déjà tranché : signature simple dans le portail (nom tapé,
date, adresse IP), pas de signature électronique certifiée au départ. Ce
qui reste à écrire pour que ce soit vrai :

```
document_signature
  quote_id ou contract_id, version, contact_id, typed_name, signed_at, ip,
  user_agent, rendered_html_sha256   -- ce qui a été signé, prouvable
```

Le courriel d'envoi porte un lien à jeton vers le document rendu (même
mécanisme que `/r/[token]` pour les rapports), avec le PDF en pièce jointe
quand le rendu serveur existera. Le geste « Accepter » ou « Signer » depuis
ce lien écrit la signature et fait passer le statut. La demande de signature
n'est donc pas un troisième canal : c'est l'envoi, avec un geste au bout.

Le PDF : impression navigateur en v1 (le CSS d'impression de Docus-Gen
montre que ça suffit pour un rendu propre au format lettre). En v2, un
rendu Chromium côté serveur (Playwright `page.pdf()`, ou
`@sparticuz/chromium` sur Vercel) pour joindre le PDF au courriel — du
vrai texte, pas une image. **Un seul rendu** : l'aperçu, le PDF et la page
que le client consulte sortent du même HTML approuvé.

---

## 4. Le parcours cible, de bout en bout

```
Fiche client → Opportunité → Appels (transcriptions, résumés)
                                 → Brief de découverte validé
Catalogue de l'Agence hub ──────┐
                                 ├→ Proposition révisable (sections, lignes)
Brief validé ───────────────────┘
                                 → Version approuvée, envoyée, PDF
                                 → Acceptation / signature  ─┬→ à modifier : nouvelle version
                                                             └→ accord : contrat et mandat
                                                                    → livrables, tâches, échéancier
```

1. Appel découverte avec le prospect, enregistré.
2. Dans le panneau de deal : « Consigner l'échange », canal Appel, on
   joint la transcription. « Extraire le brief » (violet). On relit le
   brief avec ses passages sources, on corrige, on valide.
3. Le deal passe en étape Proposition. « Nouveau document » → sorte
   Proposition, modèle par défaut présélectionné. Le panneau latéral du
   brief 9.4 sert à ça : choisir la sorte, créer le brouillon.
4. **L'espace de composition**, `/documents/[id]`, en pleine page : le
   document dans la zone principale, un panneau contextuel à droite avec
   le brief, la transcription, les suggestions. Le panneau latéral ne
   suffit pas pour comparer un passage d'appel, vérifier une
   recommandation et relire dix sections — c'est le rendu deux colonnes
   (`.client-doc` + `.col-side`) déjà prévu pour le document, enrichi
   d'un panneau de sources tant que le document est un brouillon.
5. Source **« Depuis le brief de découverte »** : l'offre suggérée est
   présélectionnée avec sa justification, ses besoins couverts et non
   couverts, ses options tranchées ; les lignes arrivent avec `billing`.
   On ajuste, on ajoute une ligne libre, une remise explicite.
6. Sections : les textes du modèle sont copiés et remplis ; « Rédiger
   avec le brief » (violet) propose les sections personnalisées, une à
   une, à côté du texte courant. On retient, on corrige, on verrouille.
7. Particularités : contact destinataire, date d'expiration.
8. Aperçu, balises vides signalées. « Envoyer » — verrouillé tant qu'une
   section reste à relire ou que les numéros de taxes manquent. Courriel
   avec lien à jeton ; `quote_version.content` et `rendered_html` figés,
   taux figés.
9. Le prospect ouvre, accepte ou signe. Le journal le consigne, événement
   par événement.
10. « Créer la suite » : le contrat depuis la proposition acceptée
    (`contract.source_quote_id`), ses livrables, ses tâches rattachées au
    mandat, la facture d'acompte. « Marquer gagné » sur le deal, le client
    naît.

Chaque étape existe dans un brief, sauf 2, 4, 5 (la source « brief ») et 6.

---

## 5. Ce que ça change au plan de la phase 9

Amender plutôt qu'ajouter, là où c'est possible :

| Brief | Amendement |
|---|---|
| 9.3 Modèles | Les modèles de sorte `proposition` et `contrat` portent des **sections** avec un texte par défaut, un indicateur « l'IA peut proposer » et un verrou « clause approuvée » ; le dictionnaire gagne `{{#sections}}` / `{{section.*}}`. |
| 9.4 Générateur | Panneau latéral pour créer le brouillon ; **espace de composition** en pleine page pour la proposition ; source « depuis le brief de découverte » ; sections révisables une à une ; deux sous-totaux ; envoi verrouillé tant qu'une section est à relire ; `quote.kind`, `quote.deal_id` ; journal d'événements distincts. |
| **9.5 Appel découverte** (nouveau) | Un brief de conception : transcription ou résumé joint à une communication d'une opportunité, geste d'extraction, écran du brief avec passages sources et points à clarifier, saisie manuelle, carte « Brief de découverte » dans le panneau de deal et dans l'Aperçu, états (sans transcription · en extraction · échec relançable · à relire · relu · purgé). Une session Claude Design, deux écrans. |

Migrations, dans l'ordre où elles débloquent quelque chose :

1. `quote.kind`, `quote.deal_id`, `quote_line.billing`, ligne de remise,
   `contract.source_quote_id`, `communication.deal_id` — petite, avec
   test. Débloque 9.4.
2. `quote.tps_rate` / `tvq_rate`, `invoice` idem, vues avec `coalesce` ;
   schéma de `quote_version.content` documenté — petite. À faire avant le
   premier envoi réel.
3. `document_template_section`, `document_section` — moyenne. Débloque le
   modèle de proposition.
4. `communication_transcript`, `discovery_brief`, purge à la perte du deal,
   délai dans `agency_settings` — moyenne. Débloque 9.5.
5. `task.subscription_id` / `contract_id` et unicité par origine —
   petite. Avant « Créer la suite ».
6. `document_signature`, jeton d'accès au document — petite. Débloque
   l'acceptation en ligne.
7. `ai_usage`, état des extractions — petite. Avant le premier appel au
   modèle.

Et l'ordre de travail, révisé par rapport à la section 5 de la passation.
L'étape « brancher `/clients` et `/pipeline` sur la base » y était
indépendante et dernière ; elle passe **en premier**, parce que le
générateur n'a de sens qu'avec de vrais prospects et de vraies
opportunités sous la main :

| # | Étape | Taille |
|---|---|---|
| 1 | Brancher clients et opportunités réels ; catalogue et offres modifiables (9.1, 9.2) | grande |
| 2 | Importer les appels, extraire ou saisir un brief, le valider (9.5, migration 4) | moyenne |
| 3 | Créer et sauvegarder une proposition éditable depuis le brief et le catalogue, sections comprises, sans IA (9.3, 9.4, migrations 1 à 3) | grande |
| 4 | Suggestions IA : offre avec justification, sections à côté du texte courant, validation par section (migration 7) | moyenne |
| 5 | Versions figées, PDF serveur, envoi, acceptation et signature (migrations 2, 6) | moyenne |
| 6 | Transformer l'accord en mandat : contrat, livrables, tâches rattachées, échéancier, depuis le périmètre accepté (migration 5) | grande |

L'IA se branche **après** que le générateur fonctionne sans elle (étape
3 avant 4) : un générateur qui remplit un modèle depuis le catalogue et le
brief est déjà utile, et c'est lui qui fixe les schémas que le modèle de
langage devra respecter.

**Le premier parcours à valider**, avant de généraliser les automatismes :
une fiche prospect réelle, un appel importé, un brief corrigé, une offre
sélectionnée, une proposition sauvegardée, un PDF révisé. Si ce parcours
tient, le module a sa valeur ; sinon, ce n'est pas la peine d'aller plus
loin.

---

## 6. Le passage au SaaS

Ce qui est déjà en place : chaque objet porte `agency_id`, chaque table
ses politiques RLS. Ce qu'il faut vérifier sur ce qui s'ajoute :

- **Chaque nouvelle table** (transcriptions, briefs, sections, signatures,
  consommation) a sa politique, testée comme les autres (`supabase/tests`).
- **Les fichiers** (transcriptions d'origine, PDF) dans un bucket cloisonné
  par agence, avec une politique de Storage, pas un bucket public.
- **Les routes serveur** (IA, rendu PDF, envoi) s'exécutent avec le client
  de la session, jamais la clé de service. La passation le dit déjà pour
  les écritures ; ça vaut aussi pour les lectures qui alimentent un
  modèle de langage.
- **Par agence** : catalogue, modèles, identité, permissions, conservation
  des transcriptions, plafond de consommation IA. Rien de global.

---

## 7. Ce que la seconde analyse a apporté, et où elle se nuance

Une analyse parallèle, produite avec un autre assistant, a été relue et
intégrée. Elle converge sur le fond : module natif plutôt que greffe,
brief de découverte révisable entre l'appel et la proposition, IA comme
analyste et rédactrice sous validation, chaîne jusqu'au mandat. Ce qu'elle
a ajouté à ce document, vérifié dans le schéma :

- **La proposition appartient à une opportunité**, et `quote` n'avait
  pas de `deal_id` (3.1). Vérifié dans la migration 0004.
- **Les taux de taxe courants réécriraient les totaux passés** (3.6).
  Vérifié : `quote_total` et `invoice_total` joignent `agency_settings`.
- **L'unicité des tâches par client et par mois** peut confondre deux
  mandats (3.7). Vérifié dans la migration 0012 — avec une nuance : les
  abonnements sont déjà protégés par `client_subscription_active_unique`,
  le cas ouvert est celui de deux mandats ponctuels.
- **Trois couches distinctes** : demandé, recommandé, vendu (3.4).
- **Un résumé importé n'est pas une transcription** et ne se cite pas
  (3.4) ; chaque élément du brief porte sa source.
- **La recommandation dit ce qu'elle ne couvre pas**, et peut conclure
  qu'aucune offre ne convient (3.5).
- **Comparer une suggestion avant de la retenir**, verrouiller un
  paragraphe validé, ne jamais réécrire une clause approuvée (3.2).
- **Un espace de composition** en pleine page plutôt que le seul panneau
  latéral (4).
- **Les événements sont distincts** : envoyé, accepté, signé, payé (3.6).
- Limite de taille des imports, traitements reprenables, conservation
  configurable, sources internes jamais dans le document client (3.4, 3.5).
- **Brancher les clients réels en premier** (5).

Deux points où ce document reste sur sa position :

- **Pas de table `document` générique** pour l'instant : `quote.kind`
  suffit tant que la proposition et le devis partagent lignes, totaux,
  statuts et versions. On y reviendra si l'annexe ou l'avenant l'exigent.
- **Pas de nouvelle table d'instantané** : `quote_version.content` existe
  et fait ce travail ; il lui manque un schéma défini, pas une table.

---

## 8. Ce qu'il faut à la prochaine session

- Le **HTML actuel** du modèle de proposition de l'agence, avec ses
  balises, et la liste de ses sections narratives dans l'ordre. Idéalement
  **une proposition récente, anonymisée, avec le contrat et l'Annexe A**
  qui l'ont suivie : c'est ce qui permet de vérifier que la chaîne
  proposition → contrat → annexe tient sur un cas réel.
- Une **transcription réelle** d'appel découverte (anonymisée), pour
  concevoir l'écran 9.5 et calibrer l'extraction sur un vrai cas.
- La décision sur `quote.kind` (section 3.1) — c'est le seul point de ce
  document qui tranche une question de structure et non d'ajout.
