# Analyse — du générateur Docus-Gen au générateur de propositions de HuntPilote

Rédigé le 13 septembre 2026, à partir des dépôts `Docus-Gen_first` (le
prototype), `Docus-Gen_second` (vide : un README d'AI Studio, rien d'autre)
et de HuntPilote. Révisé le même jour trois fois : pour intégrer une
seconde analyse, convergente (section 8) ; puis pour tenir compte des
**gabarits réels de l'agence** et des **maquettes de la phase 9**, déposés
dans `design/` (section 3). Version finale.

Ce document dit quatre choses : ce que Docus-Gen est et ce qu'il vaut ; ce
que HuntPilote sait déjà faire ; ce que les gabarits réels imposent ; et
ce qu'il faut ajouter au plan de la phase 9 pour obtenir le générateur
voulu — celui qui part de la fiche client et de l'appel découverte, pas
d'un formulaire.

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
champs. Le catalogue (packs Éclaireur, Traqueur, Chasseur ; trois services
ponctuels ; trois packs de maintenance) et l'identité de l'agence sont des
constantes. Les textes par défaut sont des fonctions paramétrées par le
nom du contact, de l'entreprise, du projet.

### Ce qui vaut la peine d'être gardé

1. **Le parcours guidé** : contexte, besoins, forfait et options,
   récapitulatif, révision avant export. C'est l'ordre d'une conversation
   de vente.
2. **Une proposition est un document narratif qui contient un tableau de
   prix**, pas l'inverse. Le gabarit réel de l'agence le confirme : seize
   pages, onze sections, un seul tableau (section 3.2).
3. **Chaque section a un texte par défaut et une version propre au
   document.** Le modèle fournit la base, le document la possède ensuite.
4. **Deux totaux, pas un** : investissement initial et mensuel. Le gabarit
   réel fait exactement ça (page 13 : « Total de l'investissement initial »,
   puis « Maintenance mensuelle · par mois + taxes »).
5. **Les coûts externes à la charge du client**, listés à part, hors
   totaux. Le gabarit réel les met dans « Modalités & conditions ».

### Ce qui ne tient pas

- **Les textes modifiés sont écrasés.** L'effet dans `App.tsx` (lignes 71
  à 85) régénère la lettre, le résumé, la communication et l'accord dès
  qu'un champ de contexte change. Corriger la lettre puis retoucher le nom
  du projet efface la correction. C'est la leçon la plus utile du
  prototype : **un texte généré appartient au document dès qu'il est créé ;
  le contexte ne le réécrit plus.**
- **Rien n'est paramétrable.** Catalogue, identité, textes sont du code.
- **Le document mélange trois choses** : l'argumentaire, les modalités du
  projet et l'accord signé. Dans HuntPilote, la proposition porte
  l'argumentaire ; les modalités et l'accord vivent dans le contrat et
  l'Annexe A, dont le modèle de données existe (`contract`,
  `contract_document`, `deliverable`, `milestone`).
- **Le PDF est une image** (`html2pdf.js` passe par un canevas).
- **Aucune persistance, aucun cycle de vie, aucune signature.**
- **Prix hors taxes en flottants**, une section = un champ (dix-sept
  champs `custom*` cités dans quatre fichiers), fournisseur saisi à chaque
  fois, échappements doublés dans `Step3` qui cassent les sauts de ligne.

**Conclusion sur le code :** rien à réutiliser. Ce qui se transfère, c'est
la structure et les cinq idées ci-dessus — et elles sont déjà dans le
gabarit réel.

---

## 2. Ce que HuntPilote sait déjà faire

Presque tout le socle existe, et la phase 9 est maintenant **conçue** :
les maquettes des sessions 9.1 à 9.4 sont dans `design/HuntPilote - CRM
SEO_phase 9/`. Correspondance point par point :

| Docus-Gen | HuntPilote (base) | Maquette phase 9 |
|---|---|---|
| Client, contact, projet saisis | `client`, `contact`, `deal` | Panneau « Nouveau document » ouvert depuis la fiche ou le deal, contexte prérempli |
| Fournisseur saisi | `agency` : raison sociale, adresse, TPS, TVQ, logo | 9.1 Profil |
| Constantes de forfaits | `offer` (6), `offer_line`, `offer_benefit`, `offer_segment` | 9.2 Constructeur d'offres, `hp-cat-data.jsx` |
| Services optionnels, lignes libres | `catalog_item` (39), `quote_line` | 9.4 « Depuis une offre / un document / lignes libres » |
| Textes par défaut | `document_template.intro`, `legal_mentions`, `footer`, `payment_instructions` | 9.3 Réglages du modèle |
| Aperçu page par page | `.client-doc`, rendu serveur | 9.3 Aperçu · 9.4 `Document.html` |
| Export PDF | Impression navigateur, puis PDF serveur | « Télécharger en PDF » = `window.print()` |
| Dates, expiration | `quote.issued_on`, `expires_on` | 9.4 « Particularités » |
| Signature imprimée | — | `Portail Document.html` : acceptation d'un geste, signature simple (nom tapé, date, IP) |
| Envoi | `communication` canal courriel | 9.4 « Envoyer » |
| Statuts, versions | `quote_status`, `quote_version.content` | 9.4 colonne latérale : statut, chaîne, versions, journal |

**Docus-Gen est la v0 du générateur de la session 9.4.** La demande
nouvelle enrichit **l'amont** (découverte, recommandation, rédaction
assistée) et exige quelques corrections que les gabarits réels rendent
visibles. Le reste de ce document ne concerne que ça.

---

## 3. Ce que les gabarits réels imposent

Quatre gabarits sont dans `design/` : **Offre de service** (16 pages),
**Acquisition Meta Ads** (une seconde proposition, à deux phases),
**Contrat de services professionnels**, **Annexe A**. Les lire change
plusieurs recommandations. Dans l'ordre d'importance.

### 3.1 Trois syntaxes de balises coexistent — il faut n'en garder qu'une

| Où | Syntaxe | Exemple |
|---|---|---|
| Contrat, Annexe A | Crochets majuscules, dans un `<span data-todo>` ; les valeurs fixes de l'agence dans un `<span data-token>` | `[NOM DU CLIENT]`, `[MONTANT ACOMPTE TTC]` |
| Offre de service, Meta Ads | Moustaches majuscules plates | `{{ENTREPRISE_CLIENT}}`, `{{PRIX_FORFAIT}}` |
| Maquettes 9.3 / 9.4 (`hp-tpl-data.jsx`) | Moustaches minuscules à espace de noms, blocs répétés | `{{client.raison_sociale}}`, `{{#lignes}}…{{/lignes}}` |

Le brief 9.3 disait : « si les modèles réels utilisent une autre syntaxe,
c'est elle qui gagne ». Ils en utilisent deux, différentes entre elles, et
aucune ne sait dire un bloc répété (les onze livrables de l'annexe sont
écrits en dur). **Décision proposée : la syntaxe des maquettes est la
syntaxe canonique**, parce qu'elle est nommée par espace (`client.`,
`document.`, `total.`), qu'elle a déjà un analyseur, un dictionnaire et un
correcteur de balise inconnue (`docParseTags`, `docClosestTag`), et qu'elle
sait répéter. Les quatre gabarits sont **convertis une fois**, à l'import,
par une table de correspondance (annexe A de ce document). L'éditeur de
modèles reconnaît les deux formes héritées (`[…]` et `{{MAJUSCULES}}`) et
propose la conversion en un geste ; il ne les rend pas.

Ce que la syntaxe canonique doit gagner, parce que les gabarits réels
l'exigent :

- **Un bloc conditionnel.** « Ligne bonus — masquer si aucun bonus »,
  « Maintenance — optionnelle », « Phase 2 optionnelle » sont des
  commentaires HTML aujourd'hui. Il faut `{{#si bonus}}…{{/si}}` (ou la
  convention moustache : un bloc sur une valeur vide ne se rend pas). Le
  rendu des maquettes ne sait répéter que des tableaux ; il faut lui
  apprendre le vide.
- **Un groupe `brief.`** — voir 3.3.
- **Un bloc `{{#offres}}`** sur les offres du catalogue — voir 3.4.
- **`{{agence.logo}}`** à la place de `assets/logo-black.png`, et
  `{{agence.representant}}` / `{{agence.representant_titre}}` à la place
  du nom en dur (il figure six fois dans l'offre, deux dans le contrat).

### 3.2 Le gabarit d'offre est un document à sections — la maquette 9.3 ne l'est pas

Le `PROP_HTML` de la maquette est un devis d'une page : en-tête, objet,
tableau de lignes, totaux, conditions. Le gabarit réel a **onze
sections** :

| # | Section | Ce qui la remplit |
|---|---|---|
| — | Couverture, lettre d'accompagnement, table des matières | Balises client et agence ; la lettre est un texte fixe avec `{{PRENOM_CLIENT}}` |
| 01 | Résumé analytique | `ATOUT_PRINCIPAL`, `PROBLEME_CARDINAL`, `OBJECTIF_PRINCIPAL`, `RESULTAT_CHIFFRE`, `DUREE`, `PRIX_FORFAIT` |
| 02 | Compréhension de vos besoins | Neuf puces **« [Compléter : …] »** à rédiger par client |
| 03 | Objectifs du projet | Dix puces « [Compléter : …] » |
| 04 | Nos forfaits | **Trois cartes statiques** : prix, délai, services inclus, segments, bénéfices — recopiés du catalogue |
| 05 | Forfait recommandé | `FORFAIT_RECOMMANDE`, justification ; tableau de maintenance (Essentiel 200 $, Croissance 450 $, Partenaire Stratégique 750 $) |
| 06 | Plan d'action | Sept phases, texte fixe ; `DUREE` |
| 07 | Preuve & résultats | **Section optionnelle**, à retirer si vide |
| 08 | Récapitulatif financier | Forfait, bonus optionnel « Offert », total initial, maintenance mensuelle « par mois + taxes » |
| 09 | Gestion de projet | Texte fixe |
| 10 | Modalités & conditions | Texte fixe : paiement, récurrent, coûts externes, valeurs |
| 11 | Accord & signature | Texte fixe (Loi 25, Loi 96, droit applicable), tableau de signature |

Trois natures de contenu, donc trois traitements :

1. **Le texte fixe du modèle** (lettre, plan d'action, gestion de projet,
   modalités, accord) : dans `body_html`, balises remplies. Rien à
   ajouter.
2. **Les sections à rédiger par client** (02, 03, la justification de 05,
   07) : ce sont les `document_section` de la section 4.2. Les puces
   « [Compléter : …] » du gabarit *sont* le texte par défaut de chaque
   section — un guide de rédaction, exactement ce que l'IA doit remplir
   et qu'un humain relit.
3. **Le contenu qui vient du catalogue** (04, le tableau de maintenance de
   05, la ligne du forfait en 08) : aujourd'hui recopié à la main dans le
   HTML. Il doit se rendre depuis `offer`, sinon un changement de prix
   dans le catalogue laisse la proposition mentir — c'est la maladie que
   le schéma soigne partout ailleurs. Voir 3.4.

**Conséquence sur la maquette 9.3 :** son modèle de proposition est à
remplacer par le gabarit réel converti, et l'éditeur doit montrer la
liste des sections du modèle à côté du code.

### 3.3 Les balises du résumé analytique sont les champs du brief de découverte

`ATOUT_PRINCIPAL`, `PROBLEME_CARDINAL`, `OBJECTIF_PRINCIPAL`,
`RESULTAT_CHIFFRE` reviennent dix-neuf fois dans l'offre, dans cinq
sections. Ce ne sont ni des champs du client ni des champs du document :
ce sont **des conclusions de l'appel découverte**. Le gabarit réel donne
donc, sans le savoir, le schéma minimal du `discovery_brief` (section
4.4) : atout principal, problème cardinal, objectif principal, résultat
visé chiffré, zone géographique (`VILLE`), secteur. Le Meta Ads en ajoute :
`CANAL_ACTUEL`, `TAUX_ANNULATION`, `COEUR_METIER`, `OFFRE_SPECIALISEE`.

Un groupe de balises **`brief.`** dans le dictionnaire, et une règle :
une proposition créée depuis un brief validé a ces balises remplies ;
créée sans brief, elles sont signalées vides à l'aperçu, comme les autres.

### 3.4 La section « Nos forfaits » doit sortir du catalogue, et le catalogue a un trou

Les trois cartes de la page 7 à 9 recopient `offer` : nom, accroche,
segments (`offer_segment`), prix « à partir de », délai
(`delivery_weeks`), consultation gratuite (`free_consult_minutes`),
lignes incluses, « Tout ce qui est dans Présence Digitale » (`offer_line`
vers une offre), bénéfices (`offer_benefit`). Tout existe en base. Un
bloc `{{#offres}} … {{/offres}}` sur les offres actives d'une catégorie,
avec `{{offre.nom}}`, `{{offre.prix}}`, `{{offre.delai}}`,
`{{#offre.lignes}}`, `{{#offre.benefices}}`, `{{#offre.segments}}`, et
la carte se rend seule. La `card-dark` « Le plus populaire » est
`offer.is_popular`.

Le trou : le gabarit d'offre et l'Annexe A vendent trois **packs de
maintenance** — Essentiel 200 $/mois (2 h), Croissance 450 $/mois (4 h),
Partenaire Stratégique 750 $/mois (8 h), avec un taux horaire au-delà et
« Idéal avec » tel forfait web. Le semis de la base (`0014`, `seed.sql`)
porte trois **packs SEO** — Visibilité Locale 400 $, Croissance SEO 700 $,
Domination SEO 1 100 $. Ce ne sont pas les mêmes produits. L'exclusion de
l'Annexe A cite « Pack Croissance, 450 $/mois ». **À trancher avec
Armel** : les packs de maintenance entrent au catalogue (trois offres
mensuelles, avec heures incluses et taux de dépassement — deux colonnes
à ajouter sur `offer`, ou deux lignes de catalogue), et les packs SEO
restent s'ils se vendent encore. Le générateur ne peut pas proposer une
maintenance qui n'existe pas en base.

### 3.5 Le contrat et l'annexe sont déjà modélisés — presque

La migration `0015b` a été écrite depuis ces deux documents, et ça se
voit : livrables L-01 à L-11 avec rondes incluses → `deliverable` ;
jalons J-01 à J-12 en dates relatives → `milestone` ; contenu à fournir
→ `client_input_item` ; exclusions avec l'offre qui les couvrirait →
`contract_exclusion` ; 50 % / 50 % → `payment_milestone` ; 4 à 6 h par
mois pendant 3 mois → `support_period` ; article 1.2 (ordre de priorité)
→ `contract_document.precedence`. L'annexe se rend donc entièrement en
blocs de données : `{{#livrables}}`, `{{#jalons}}`, `{{#attendus_client}}`,
`{{#exclusions}}`.

Ce que les balises réclament et que la base n'a pas :

| Balise | Manque | Proposition |
|---|---|---|
| `[NUMÉRO DE PROPOSITION]`, `[DATE DE LA PROPOSITION]` | Le contrat ne connaît pas la proposition dont il sort | `contract.source_quote_id` (section 4.1) |
| `[FORME JURIDIQUE DU CLIENT]` | `client` n'a pas de forme juridique | `client.legal_form` |
| `[DISTRICT JUDICIAIRE]` | Réglage de l'agence absent | `agency.judicial_district`, ou une balise de modèle (`document_template` porte déjà les mentions) |
| `[NOMBRE DE PAGES]`, `[NOMBRE DE COLLECTIONS CMS]`, `[SOLUTION DE PAIEMENT]` | Des paramètres *du livrable* pour ce contrat | Ils vivent dans `deliverable.description`, éditée par contrat ; pas de colonne. À la création depuis une offre, la description du gabarit de livrable porte la balise, et l'écran demande la valeur |
| `[MONTANT ACOMPTE TTC]`, `[MONTANT SOLDE TTC]` | Calculés | Depuis `payment_milestone` et `contract_financials` (vue existante) |
| `Armel Junior Nguimbi`, `Propriétaire` en `data-token` | Le représentant de l'agence | `{{agence.representant}}`, `{{agence.representant_titre}}` — deux colonnes sur `agency` ou le membre `owner` |

Détail à noter : l'article 6.2 du contrat dit « les taux de taxes
applicables sont ceux en vigueur à la date de facturation ». Ça confirme
la règle de la section 4.6 : les taux se figent sur la facture, pas sur le
contrat.

### 3.6 La mise en page : deux choix à faire avant le rendu serveur

- **Format.** Les quatre gabarits sont en **A4** (`size: A4`, `.page` de
  210 × 297 mm). Docus-Gen, le brief 9.3 et l'imprimante d'un client
  québécois sont en **Lettre**. Un A4 imprimé sur Lettre perd 2 cm en bas.
  À trancher, une fois, dans le CSS des modèles.
- **Pagination.** Le contrat et l'annexe sont en **flux** avec `@page`,
  `break-inside: avoid`, `counter(page)` et le polyfill Paged.js : un
  paragraphe qui s'allonge repousse la suite. L'offre est en **pages
  fixes** (`.page { height: 297mm; overflow: hidden }`) avec « Page 4 /
  16 » écrit en dur : une section « Compréhension de vos besoins » plus
  longue que prévue est **coupée en silence**. Pour un document dont les
  sections seront rédigées par client, c'est la mise en page du contrat
  qu'il faut, pas celle de l'offre. La conversion du gabarit d'offre
  passe en flux ; les sections narratives gagnent une longueur indicative
  dans le modèle (`max_chars`) pour que l'IA et l'humain sachent où
  s'arrêter.
- **Polices et images.** Archivo vient de Google Fonts, Noto Sans et
  Consolas sont des fichiers locaux ; le logo est un chemin relatif. Le
  rendu serveur (Playwright) doit avoir les polices sous la main :
  auto-hébergées dans `public/`, ou déclarées dans le modèle par une URL
  stable. Consolas est propriétaire (le README du dépôt le dit déjà) : la
  pile mono système la remplace dans les modèles.
- **La page interne « Légende d'utilisation »** (`screen-only`,
  `legend-page-inner`) est retirée à l'import : le dictionnaire des
  balises vit dans l'éditeur 9.3, pas dans le document.

### 3.7 Ce que les maquettes 9.4 n'ont pas encore

Elles sont bonnes et proches de l'intégration. Trois manques, tous
attendus :

- **Un brouillon ne s'édite pas.** `Document.html` rend, envoie, marque,
  versionne — mais rien ne permet de modifier les lignes ou un texte
  après « Créer le brouillon ». « Corriger » crée une version sans
  éditeur. Le brouillon doit s'ouvrir en **mode composition** (section
  5) : c'est là que les sections se rédigent, que l'IA propose, que les
  lignes s'ajustent.
- **« Depuis une offre » produit une seule ligne** (`offer.nom`, prix).
  Suffisant pour un devis ; pour une proposition, l'offre doit alimenter
  aussi la carte de la section 04 et la recommandation de la 05 — c'est le
  bloc `{{#offres}}` et une balise `{{offre_recommandee.*}}`.
- **Pas de sections, pas de brief, pas de récurrence par ligne**, taxes
  en constantes. Attendu à ce stade ; c'est la section 4.

Un point où les maquettes ont raison contre ce document dans sa version
précédente : le panneau latéral en quatre étapes est le bon geste pour
*créer* le brouillon. La composition vient après, en pleine page.

---

## 4. Ce qui manque au modèle, et qu'il faut ajouter

Huit écarts. Chaque proposition ci-dessous a été confrontée aux gabarits
réels ; les références renvoient à la section 3.

### 4.1 Une proposition doit avoir un foyer, et appartenir à une opportunité

`document_kind` connaît `proposition` (0015a), mais aucune table ne la
porte, et `quote` n'a ni `kind` ni `deal_id`. Le contrat, lui, connaît son
deal (`contract.deal_id`) mais pas sa proposition — alors que son
préambule la cite par numéro (3.5).

**Proposition :** la proposition *est* un devis au sens de la base —
lignes, totaux, statuts, versions — avec deux différences : des sections
narratives (4.2) et un contrat qui en découle. Trois colonnes :

- `quote.kind` (`devis` | `proposition`), contrainte : `template_id` de
  même sorte ;
- `quote.deal_id`, nullable (un devis à un client signé n'a pas
  d'opportunité) ;
- `contract.source_quote_id`.

Pas de table `document` générique tant que trois tables typées font le
travail. L'Annexe A se rend depuis `contract` : elle n'a pas besoin de
table à elle, seulement d'une ligne `contract_document` de sorte `annexe`.

### 4.2 Les sections narratives, révisables une à une

L'ajout le plus important aux briefs 9.3 et 9.4, confirmé par les onze
sections du gabarit (3.2).

```
document_template_section
  template_id, key ('resume', 'besoins', 'objectifs', 'recommandation',
  'preuve', 'couts_externes'…), title, position,
  default_body        -- le guide « [Compléter : …] » du gabarit
  optional boolean    -- section 07 : se retire si vide
  ai_assist boolean   -- l'IA peut proposer un texte
  locked_by_agency    -- clause approuvée : jamais réécrite par l'IA
  max_chars           -- longueur indicative, pour la mise en page (3.6)

document_section
  quote_id (ou contract_id), key, title, body, position,
  enabled boolean,     -- section optionnelle retirée pour ce document
  locked boolean,      -- paragraphe validé : plus touché par une régénération
  ai_generated boolean, reviewed_at, reviewed_by
```

Dans le modèle : `{{section.besoins}}` là où la mise en page est propre à
la section (c'est le cas de l'offre : chaque section a son gabarit
visuel), ou `{{#sections}}` quand elles s'enchaînent.

Règles :

- À la création du brouillon, les sections sont **copiées** depuis le
  modèle, puis appartiennent au document. Modifier le modèle, le contact
  ou le forfait ne les réécrit pas. C'est la correction du défaut de
  Docus-Gen.
- **Révision section par section.** Une section verrouillée ne bouge
  plus. Une suggestion de l'IA s'affiche **à côté** du texte courant et
  n'est écrite qu'au geste « Retenir ».
- Une section `ai_generated` sans `reviewed_at` bloque l'envoi — règle 1
  de `decisions.md`, appliquée.
- Les sections `locked_by_agency` (modalités, accord, gestion de projet)
  se copient, point.

### 4.3 Les lignes : récurrence, nature, deux totaux

Le récapitulatif réel (3.2, section 08) a quatre sortes de lignes : le
forfait (facturable, ponctuel), le bonus (« Offert »), le total initial,
la maintenance (facturable, mensuelle, « par mois + taxes »). Le Meta Ads
en ajoute une cinquième : le budget média, « distinct de ces honoraires »,
affiché mais jamais facturé. `quote_line` ne sait dire aucune de ces
distinctions.

- `quote_line.billing` (`public.billing_period`), copié de l'article ou
  de l'offre. `quote_total` rend deux sous-totaux : ponctuel et récurrent.
- `quote_line.kind` : `facturable` | `offert` | `remise` | `informatif`.
  Une remise est une ligne négative *visible* (la contrainte
  `amounts_positive` s'assouplit pour `remise`) ; un bonus est une ligne
  à zéro libellée « Offert » ; un budget média est `informatif`, hors
  totaux. **Une adaptation commerciale est explicite** ; le catalogue
  reste la seule source des prix.
- Les coûts externes ne sont pas des lignes : section narrative
  `couts_externes`, texte du modèle.

### 4.4 L'appel découverte : transcription, puis brief révisable

**On ne fait pas passer une transcription brute dans une génération.**
Entre les deux, le **brief de découverte** : ce que HuntPilote a compris,
ce qui reste incertain, ce qui justifie la recommandation. Il garde la
trace de trois choses distinctes — **ce que le client a demandé** (le
brief), **ce que l'agence recommande** (la suggestion, 4.5), **ce qui sera
vendu** (les lignes).

Le gabarit d'offre en donne les champs (3.3). Ce qui existe :
`communication` avec les canaux `appel` et `reunion`, rattachée à un
contact. Ce qui manque :

```
communication
  + deal_id (nullable)   -- l'appel appartient à l'opportunité qu'il prépare

communication_transcript
  communication_id (unique),
  kind ('transcription' | 'resume'),   -- un résumé importé n'est jamais cité
  source ('collé', 'fichier', 'integration'),
  format ('texte', 'vtt', 'srt'), language, duration_seconds,
  body text, storage_path, imported_by, created_at

discovery_brief
  id, client_id, deal_id, created_from (jsonb : les communication_id lus),
  -- les balises du gabarit :
  atout_principal, probleme_cardinal, objectif_principal, resultat_vise,
  -- le reste du brief :
  problemes jsonb, objectifs jsonb, perimetre jsonb, budget_evoque_cents,
  echeance_evoquee date, contraintes jsonb, decideurs jsonb,
  points_a_clarifier jsonb,
  ai_generated boolean, reviewed_at, reviewed_by, created_at, updated_at
```

Chaque élément du brief porte sa **source** (identifiant de la
communication et passage, horodatage ou décalage). Pour un résumé importé,
la source est le résumé, présenté comme tel. Le brief se rédige aussi **à
la main** (`ai_generated = false`), et depuis plusieurs appels de la même
opportunité.

Écran : « Consigner l'échange » accepte une transcription (collée ou
fichier `.txt`, `.vtt`, `.srt`, limite dite à l'écran). Geste violet
**« Extraire le brief »**. Carte « Brief de découverte » dans le panneau
de deal et l'Aperçu de la fiche.

Conservation (règle 3) : la transcription d'un prospect est purgée quand
le deal est perdu, après un délai réglé dans `agency_settings` ; le brief
relu reste. L'écran rappelle que l'interlocuteur doit être informé de
l'enregistrement. **Une source interne ne se retrouve jamais dans un
document client** : le rendu ne lit que les sections, les lignes et les
balises `brief.*` validées, jamais la transcription.

### 4.5 Le modèle de langage : analyste et assistant de rédaction, jamais décideur

Trois usages, trois routes serveur (`app/api/ia/*`), chacun violet,
chacun produisant quelque chose **à relire** :

1. **Extraire le brief** d'une transcription. Entrée : transcription,
   fiche, catalogue. Sortie : le `discovery_brief`, sources et points à
   clarifier compris.
2. **Suggérer l'offre.** Entrée : brief validé, offres avec segments,
   bénéfices, lignes, prix. Sortie, par offre envisagée : **besoins
   couverts, non couverts, options à trancher, incertitudes**, trois
   phrases de justification — c'est le texte de la section 05 du gabarit.
   Le modèle **peut conclure qu'aucune offre ne convient** : sortie valide,
   qui mène à des lignes libres.
3. **Rédiger les sections** `ai_assist` (02, 03, 05, 07) depuis le brief,
   l'offre choisie et le guide « [Compléter : …] » du modèle, dans la
   longueur `max_chars`. Jamais les sections `locked_by_agency`.

Règles : sortie structurée validée côté serveur ; le catalogue seule
source des offres et des prix, calculs dans `quote_total` ; client de la
session sous RLS, jamais la clé de service ; extraction reprenable (état
`en_cours` / `terminee` / `echouee`) ; chaque appel compté dans `ai_usage`
(agence, usage, jetons, coût, objet) pour l'écran Consommation.

### 4.6 Figer une version, c'est figer ses données

`quote_total` et `invoice_total` calculent les taxes avec les taux
**courants** de `agency_settings` ; un changement de taux réécrirait les
totaux passés. L'article 6.2 du contrat réel dit d'ailleurs que les taux
sont ceux « en vigueur à la date de facturation ».

- `tps_rate`, `tvq_rate` sur `quote` et `invoice`, posés à l'envoi ; les
  vues font `coalesce(document.rate, settings.rate)`.
- `quote_version.content` (jsonb, existant) reçoit l'instantané complet :
  lignes avec récurrence et nature, sections, balises `brief.*`, taux,
  totaux, contact, modèle et sa version, `rendered_html`. **Définir ce
  schéma**, pas ajouter une table.
- Événements distincts et datés : envoyé, ouvert, accepté, signé, payé.
  Un envoi identifie la version et le destinataire ; une correction après
  envoi crée une version.

### 4.7 Les tâches suivent la vente concernée

`task_from_template_once` est unique sur (client, gabarit, mois). Deux
mandats ponctuels du même client avec le même gabarit le même mois
entreraient en collision (`client_subscription_active_unique` protège les
abonnements, pas ça). Avant « Créer la suite » : `task.contract_id` /
`subscription_id`, et l'unicité sur l'origine.

### 4.8 Signature et envoi

Le brief 9.4 et `Portail Document.html` ont tranché : signature simple
(nom tapé, date, IP). La clause 18.5 du contrat réel l'autorise. Reste à
l'écrire :

```
document_signature
  quote_id ou contract_id, version, contact_id, typed_name, signed_at, ip,
  user_agent, rendered_html_sha256
```

Courriel avec lien à jeton (même mécanisme que `/r/[token]`), PDF joint
quand le rendu serveur existera. « Accepter » ou « Signer » depuis ce lien
écrit la signature et fait passer le statut. PDF : impression navigateur
en v1 ; Playwright `page.pdf()` en v2, avec les polices auto-hébergées
(3.6). **Un seul rendu** pour l'aperçu, le PDF et le portail.

---

## 5. Le parcours cible, de bout en bout

```
Fiche client → Opportunité → Appels (transcriptions, résumés)
                                 → Brief de découverte validé
Catalogue de l'Agence hub ──────┐
                                 ├→ Proposition : brouillon composé (sections, lignes)
Brief validé ───────────────────┘
                                 → Version envoyée, figée, PDF
                                 → Acceptation / signature ─┬→ à modifier : nouvelle version
                                                            └→ accord : contrat + annexe → mandat
                                                                   → livrables, tâches, échéancier
```

1. Appel découverte, enregistré.
2. Panneau de deal : « Consigner l'échange », canal Appel, transcription
   jointe. « Extraire le brief ». Relecture avec passages sources,
   validation.
3. Deal en étape Proposition. « Nouveau document » — le panneau des
   maquettes 9.4 : sorte, contenu, particularités, aperçu, **« Créer le
   brouillon »**. Nouvelle source à l'étape 2 : **« Depuis le brief »**
   (offre suggérée présélectionnée, justification, options tranchées,
   balises `brief.*` remplies).
4. **Composition**, `/documents/[id]` en mode brouillon : le document dans
   la zone principale (`.client-doc`), un panneau contextuel à droite
   (`.col-side`) avec le brief, la transcription, les suggestions, la
   liste des sections avec leur état (à rédiger · proposée · à relire ·
   relue · verrouillée · retirée). « Rédiger avec le brief » section par
   section, à côté du texte courant.
5. Lignes : ajustement, ligne libre, remise explicite, maintenance
   recommandée (offre mensuelle du catalogue).
6. Aperçu, balises vides signalées. **« Envoyer »** — verrouillé tant
   qu'une section est à relire, qu'une balise `brief.*` est vide dans une
   section activée, ou que les numéros de taxes manquent. Version figée.
7. Le prospect ouvre, accepte. Journal.
8. **« Créer la suite »** : contrat depuis la proposition acceptée
   (`source_quote_id`), Annexe A depuis le contrat (livrables, jalons,
   attendus, exclusions depuis l'offre), facture d'acompte
   (`payment_milestone`), tâches rattachées au mandat. « Marquer gagné ».

---

## 6. Ce que ça change au plan de la phase 9

Les maquettes 9.1 à 9.4 existent : on ne les redessine pas, on les
**amende** à l'intégration, et on conçoit un brief de plus.

| Brief | Amendement à l'intégration |
|---|---|
| 9.3 Modèles | Syntaxe canonique + conversion des formes héritées à l'import (3.1) ; blocs conditionnels ; groupes `brief.` et `offres` ; liste des **sections** du modèle avec texte par défaut, optionnelle, IA, verrou, longueur ; format Lettre ; polices auto-hébergées ; retrait de la page « Légende ». Le `PROP_HTML` de la maquette est remplacé par le gabarit réel converti. |
| 9.4 Générateur | `quote.kind`, `deal_id` ; source « Depuis le brief » ; lignes avec récurrence et nature, deux sous-totaux ; **mode composition** du brouillon sur `/documents/[id]` ; envoi verrouillé tant qu'une section est à relire ; taux figés ; journal d'événements distincts. |
| **9.5 Appel découverte** (nouveau) | Un brief de conception : transcription ou résumé joint à une communication d'une opportunité, geste d'extraction, écran du brief avec passages sources et points à clarifier, saisie manuelle, carte dans le panneau de deal et l'Aperçu, états (sans transcription · en extraction · échec relançable · à relire · relu · purgé). Une session Claude Design, deux écrans. |

Migrations, dans l'ordre où elles débloquent quelque chose :

1. `quote.kind`, `quote.deal_id`, `quote_line.billing`, `quote_line.kind`,
   `contract.source_quote_id`, `communication.deal_id`, `client.legal_form`,
   `agency.representative*`, `agency.judicial_district` — petite, un test.
2. `quote.tps_rate` / `tvq_rate`, `invoice` idem, vues avec `coalesce` ;
   schéma de `quote_version.content` documenté — petite.
3. `document_template.body_html` (déjà prévu), `document_template_section`,
   `document_section` — moyenne. Puis **semis des quatre gabarits
   convertis**, sections comprises.
4. Catalogue : les trois packs de maintenance, et la décision sur les
   packs SEO (3.4) — semis.
5. `communication_transcript`, `discovery_brief`, purge, délai dans
   `agency_settings` — moyenne.
6. `task.contract_id` / `subscription_id`, unicité par origine — petite.
7. `document_signature`, jeton d'accès — petite.
8. `ai_usage`, état des extractions — petite.

Ordre de travail, révisé par rapport à la passation (section 5) : brancher
les clients et opportunités réels **en premier**, parce que le générateur
n'a de sens qu'avec de vrais prospects ; l'IA **après** que le générateur
fonctionne sans elle.

| # | Étape | Taille |
|---|---|---|
| 1 | Clients et opportunités réels ; intégrer 9.1 et 9.2 (catalogue et offres modifiables, packs de maintenance ajoutés) | grande |
| 2 | Intégrer 9.3 avec sections et syntaxe canonique ; convertir et semer les quatre gabarits (migrations 1 à 3) | grande |
| 3 | Intégrer 9.4 avec composition : créer, composer, envoyer une proposition depuis le catalogue, **sans IA** (migration 2) | grande |
| 4 | Concevoir puis intégrer 9.5 : appels, brief manuel ou extrait, source « Depuis le brief » (migration 5) | moyenne |
| 5 | Suggestions IA : offre justifiée, sections à côté du texte courant (migration 8) | moyenne |
| 6 | Versions figées, PDF serveur, envoi, acceptation et signature dans le portail (migration 7) | moyenne |
| 7 | « Créer la suite » : contrat, Annexe A, facture d'acompte, tâches rattachées (migration 6) | grande |

**Le premier parcours à valider**, à l'étape 3 : une fiche prospect
réelle, une offre choisie, une proposition composée depuis le gabarit
réel, envoyée, acceptée dans le portail. Puis à l'étape 4, la même avec un
appel importé et un brief corrigé. Si ces deux parcours tiennent, le
module a sa valeur.

---

## 7. Le passage au SaaS

Chaque nouvelle table (transcriptions, briefs, sections, signatures,
consommation) a sa politique RLS, testée comme les autres. Les fichiers
(transcriptions, PDF, logos) vont dans un bucket cloisonné par agence. Les
routes serveur (IA, rendu, envoi) s'exécutent avec le client de la
session, jamais la clé de service. Par agence : catalogue, modèles,
identité, permissions, conservation, plafond de consommation IA. Rien de
global — et les gabarits de DigiHunt deviennent des lignes de
`document_template` de l'agence DigiHunt, pas du code de HuntPilote.

---

## 8. Ce que la seconde analyse a apporté, et où elle se nuance

Une analyse parallèle, produite avec un autre assistant, a été relue et
intégrée. Elle converge sur le fond : module natif, brief révisable entre
l'appel et la proposition, IA analyste et rédactrice sous validation,
chaîne jusqu'au mandat. Ce qu'elle a ajouté, vérifié dans le schéma :

- **La proposition appartient à une opportunité** ; `quote` n'avait pas
  de `deal_id` (4.1). Vérifié dans la migration 0004.
- **Les taux courants réécriraient les totaux passés** (4.6). Vérifié :
  `quote_total` et `invoice_total` joignent `agency_settings`.
- **L'unicité des tâches par client et par mois** peut confondre deux
  mandats (4.7). Vérifié dans 0012 — avec une nuance : les abonnements
  sont déjà protégés, le cas ouvert est celui de deux mandats ponctuels.
- Trois couches distinctes (demandé, recommandé, vendu) ; un résumé
  importé ne se cite pas ; chaque élément du brief porte sa source ; la
  recommandation dit ce qu'elle ne couvre pas et peut ne rien
  recommander ; comparer une suggestion avant de la retenir, verrouiller
  un paragraphe, ne jamais réécrire une clause approuvée ; un espace de
  composition en pleine page ; événements distincts ; limite d'import,
  traitements reprenables, conservation configurable ; clients réels en
  premier.

Deux points où ce document reste sur sa position : pas de table `document`
générique (`quote.kind` suffit) ; pas de nouvelle table d'instantané
(`quote_version.content` existe, il lui manque un schéma).

---

## 9. Décisions prises, et ce qu'il reste à fournir

Les cinq décisions ont été tranchées par Armel le 14 septembre 2026,
toutes dans le sens proposé :

1. **La syntaxe** des maquettes devient canonique ; les gabarits sont
   convertis à l'import selon l'annexe A (3.1).
2. **Le format** est Lettre (3.6).
3. **`quote.kind`** plutôt qu'une table `document` (4.1).
4. **Les packs de maintenance** entrent au catalogue ; les packs SEO du
   semis restent (3.4).
5. **Le gabarit d'offre passe en flux paginé** (3.6).

Le brief de la session 9.5 est écrit :
[`briefs/9-5-appel-decouverte.md`](briefs/9-5-appel-decouverte.md). La
passation (`passation-agence-hub.md`, sections 4 et 5) et le README des
briefs portent ces décisions et l'ordre de travail révisé.

Ce qui reste à fournir : **une transcription réelle** d'appel découverte,
anonymisée, pour concevoir 9.5 ; et, quand ils existeront, les gabarits
de **devis** et de **facture** de l'agence (ceux des maquettes 9.3 servent
en attendant).

---

## Annexe A — Correspondance des balises héritées

Table de conversion à appliquer à l'import des quatre gabarits. Une
balise sans correspondance devient une balise inconnue signalée par
l'éditeur, comme le brief 9.3 le prévoit.

| Gabarit | Balise héritée | Balise canonique |
|---|---|---|
| Offre, Meta Ads | `{{ENTREPRISE_CLIENT}}` | `{{client.nom}}` |
| | `{{PRENOM_CLIENT}}` `{{NOM_CLIENT}}` | `{{client.contact.prenom}}` `{{client.contact.nom}}` |
| | `{{TITRE_CLIENT}}` | `{{client.contact.titre}}` |
| | `{{VILLE}}` `{{SECTEUR}}` `{{ADRESSE_CLIENT}}` `{{COURRIEL_CLIENT}}` `{{TEL_CLIENT}}` | `{{client.ville}}` `{{client.secteur}}` `{{client.adresse}}` `{{client.courriel}}` `{{client.telephone}}` |
| | `{{DATE}}` `{{DATE_EXPIRATION}}` `{{VALIDITE}}` | `{{document.date}}` `{{document.echeance}}` |
| | `{{DATE_RENCONTRE}}` | `{{brief.date_appel}}` |
| | `{{ATOUT_PRINCIPAL}}` `{{PROBLEME_CARDINAL}}` `{{OBJECTIF_PRINCIPAL}}` `{{RESULTAT_CHIFFRE}}` | `{{brief.atout_principal}}` `{{brief.probleme_cardinal}}` `{{brief.objectif_principal}}` `{{brief.resultat_vise}}` |
| | `{{CANAL_ACTUEL}}` `{{TAUX_ANNULATION}}` `{{COEUR_METIER}}` `{{OFFRE_SPECIALISEE}}` `{{ATOUT_CONCURRENTIEL}}` | `{{brief.*}}` — champs du brief propres à l'acquisition |
| | `{{FORFAIT_RECOMMANDE}}` `{{PRIX_FORFAIT}}` `{{DUREE}}` | `{{offre_recommandee.nom}}` `{{offre_recommandee.prix}}` `{{offre_recommandee.delai}}` |
| | `{{FORFAIT_MAINTENANCE}}` `{{PRIX_MAINTENANCE}}` | `{{maintenance_recommandee.nom}}` `{{maintenance_recommandee.prix_mensuel}}` |
| | `{{BONUS_SIGNATURE}}` | ligne `kind = offert` : `{{#lignes_offertes}}` |
| | Cartes des trois forfaits (texte en dur) | `{{#offres}} … {{/offres}}` sur la catégorie web |
| | `{{PRIX_LANDING}}` `{{PRIX_META_CONFIG}}` `{{PRIX_PHASE1}}` … | `{{#lignes}}` ponctuelles, `{{total.ponctuel_ht}}` |
| | `{{PRIX_MENSUEL}}` `{{ENGAGEMENT_MOIS}}` `{{TOTAL_PHASE2}}` | `{{#lignes}}` récurrentes, `{{total.mensuel_ht}}`, `{{document.engagement_mois}}` |
| | `{{ESCOMPTE_PCT}}` `{{MONTANT_ESCOMPTE}}` `{{PRIX_PHASE1_BARRE}}` | ligne `kind = remise` ; `{{total.avant_remise}}` |
| | `{{ACOMPTE}}` `{{SOLDE}}` | `{{#paiements}}` (échéancier de paiement) |
| | `{{BUDGET_META_TOTAL}}` `{{BUDGET_MENSUEL}}` `{{BUDGET_JOUR}}` | ligne `kind = informatif` |
| | Nom, titre, adresse, téléphone, courriel de l'agence en dur | `{{agence.representant}}` `{{agence.representant_titre}}` `{{agence.adresse}}` `{{agence.telephone}}` `{{agence.courriel}}` |
| | `assets/logo-black.png` | `{{agence.logo}}` |
| Contrat, Annexe | `[NOM DU CLIENT]` `[FORME JURIDIQUE DU CLIENT]` `[ADRESSE DU CLIENT]` | `{{client.raison_sociale}}` `{{client.forme_juridique}}` `{{client.adresse}}` |
| | `[NOM DU REPRÉSENTANT]` `[TITRE DU REPRÉSENTANT]` `[NOM DU SIGNATAIRE CLIENT]` `[TITRE DU SIGNATAIRE CLIENT]` `[NOM DU CONTACT CLIENT]` `[TITRE DU CONTACT CLIENT]` | `{{client.contact.nom}}` `{{client.contact.titre}}` |
| | `[NUMÉRO DE PROPOSITION]` `[DATE DE LA PROPOSITION]` | `{{proposition.reference}}` `{{proposition.date}}` (via `source_quote_id`) |
| | `[NUMÉRO DU CONTRAT]` `[DATE DU DOCUMENT]` | `{{document.reference}}` `{{document.date}}` |
| | `[MONTANT DES HONORAIRES]` `[MONTANT TPS]` `[MONTANT TVQ]` `[MONTANT TOTAL TTC]` | `{{total.ht}}` `{{total.tps}}` `{{total.tvq}}` `{{total.ttc}}` |
| | `[MONTANT ACOMPTE TTC]` `[MONTANT SOLDE TTC]` `[MONTANT SOLDE HT]` | `{{#paiements}} {{paiement.montant_ttc}} {{paiement.montant_ht}} {{/paiements}}` |
| | `[DISTRICT JUDICIAIRE]` `[ADRESSE DU PRESTATAIRE]` | `{{agence.district_judiciaire}}` `{{agence.adresse}}` |
| | `100` $/h en `data-token` | `{{contrat.taux_horaire}}` (`contract.hourly_rate_cents`) |
| | L-01 … L-11, J-01 … J-12, contenu à fournir, exclusions (en dur) | `{{#livrables}}` `{{#jalons}}` `{{#attendus_client}}` `{{#exclusions}}` |
| | `[NOMBRE DE PAGES]` `[NOMBRE DE COLLECTIONS CMS]` `[SOLUTION DE PAIEMENT]` `[DATE DE DÉBUT PRÉVUE]` | dans `livrable.description` et `{{jalons}}` — valeurs demandées à la création du contrat |
