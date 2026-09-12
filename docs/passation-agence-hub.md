# Passation — l'Agence hub

Document de passation pour la prochaine session de travail sur HuntPilote.
Il dit où en est le projet, ce que la base sait déjà faire, ce que l'Agence
hub doit devenir, et par quoi commencer. Il se lit seul : la session qui
le reçoit n'a pas l'historique de celle qui l'a écrit.

Rédigé le 12 septembre 2026, après le déploiement `2aba965`.

---

## 1. Où en est le projet

**HuntPilote** est le CRM SEO de l'agence DigiHunt (Amqui, Québec).
Next.js 15 (App Router), React 19, TypeScript, déployé sur Vercel à
`huntpilote-crm.vercel.app`, base Supabase `huntpilote`
(id `ncifsjflgwoemtputqpc`, région `ca-central-1`). Tout est en français :
interface, documentation, commentaires, messages de commit.

| Couche | État |
|---|---|
| Modèle de données | Complet : 20 migrations, 109 tables, 23 vues, 134 politiques RLS, 159 assertions de test. Voir `supabase/README.md` et `docs/modele-donnees.md`. |
| Semis | `supabase/seed.sql` : l'agence, 39 articles de catalogue, 6 offres réelles, 4 clients et 4 prospects fictifs, 3 abonnements qui engendrent 115 tâches, le contrat SHGM n° 2026-007 avec livrables, jalons, exclusions. |
| Connexion | Mot de passe, lien magique et Google fonctionnent en production. Rattachement d'une invitation à la première connexion, par courriel. |
| Écrans lus dans la base | `/parametres` (profil, catalogue, équipe) et `/travail`. **Tous les autres écrans tournent encore sur les fichiers de démonstration** de `lib/data/`. |
| Écrans qui écrivent dans la base | `/parametres` seulement : profil de l'agence, invitation, fiche membre, droits nominatifs (`app/parametres/actions.ts`). |
| Verrou d'accès | `AUTH_REQUIRED=on` n'est pas encore posé sur Vercel. Tant qu'il ne l'est pas, les pages restent visibles sans connexion (vides, mais visibles). |

Deux valeurs restent à saisir dans l'écran Profil : les numéros de TPS et
de TVQ. Les tarifs d'entrée des packs SEO (« 3 premiers mois à tarif
préférentiel ») ne sont pas connus non plus (`offer.intro_price_cents`).

## 2. Conventions à respecter

Elles viennent de l'expérience de la session précédente ; chacune a coûté
quelque chose la première fois.

- **Français partout**, messages de commit compris. Pas d'identifiant de
  modèle dans le dépôt (commits, commentaires, documents).
- **Git** : jamais de `push --force`, jamais d'`amend` sur un commit poussé.
  Relire le diff avant de committer. Ne jamais committer `.env.local` ni
  une clé de service.
- **Une migration ne se modifie pas une fois appliquée en production** : on
  en écrit une nouvelle. `alter type … add value` va dans une migration à
  part de celle qui utilise la valeur (voir 0015a / 0015b).
- **Toute migration se valide en local avant d'être appliquée en ligne.**
  Procédure dans `supabase/README.md` (grappe PostgreSQL 16 dans
  `/tmp/hp-pgdata`, port 55432, socket `/tmp`, lancée via `su postgres`).
  Le fichier `supabase/tests/00_stub_supabase.sql` simule `auth.users`,
  `auth.uid()` et `auth.jwt()`. Un test par migration, huit à vingt
  assertions, qui s'exécutent tous sur la même base dans l'ordre.
- **Après chaque migration qui change le schéma**, régénérer
  `lib/supabase/database.types.ts` (outil MCP `generate_typescript_types`)
  en conservant l'en-tête de quatre lignes du fichier. Une migration qui ne
  touche que des politiques ou des déclencheurs ne change pas les types.
- **Vérifier l'audit Supabase** (`get_advisors`, type `security`) après
  chaque migration. Ce qui reste et qui est voulu : `number_counter` a RLS
  sans politique ; la protection contre les mots de passe divulgués est un
  réglage de console.
- **Règles produit** que le moteur applique et que l'interface ne doit pas
  contourner : « ce qui se compte n'est pas stocké » (dérivés → vues) ;
  règle 1 (rien n'est visible du client sans publication explicite) ;
  règle 3 (conservation, purge, dilution) ; une facture envoyée est
  immuable ; un audit de prospect est immuable ; une offre vendue engendre
  ses tâches (`app.apply_offer_tasks`, idempotente).
- **Composants serveur, écran par écran** : `page.tsx` charge la session
  (`getSession()`) et les données (`lib/queries/<écran>.ts`), les passe en
  props à une vue cliente. `export const dynamic = 'force-dynamic'`. Un
  `select` PostgREST avec jointures s'écrit en **un seul littéral** de
  chaîne, sinon le typage se perd.
- **Sans variables d'environnement, rien ne doit lever** :
  `supabaseConfigured()` garde chaque point d'entrée. C'est ce qui a
  provoqué la seule panne de production à ce jour.
- **Écriture = action serveur** (`'use server'`, `useActionState` côté vue),
  via le client de la requête, donc sous RLS. Un `update` refusé par RLS ne
  lève pas : il ne touche aucune ligne. On lit le `select` de retour, et
  zéro ligne veut dire « pas le droit ».
- **Le bac à sable ne joint pas `*.supabase.co`** : impossible d'appeler
  l'API depuis le terminal. Les outils MCP Supabase (SQL, migrations,
  audit) et Vercel (déploiements, journaux) fonctionnent. Les vérifications
  d'écran en production passent par la personne.
- Le fichier `.claude/settings.json` (autorisations d'outils) est ignoré
  par Git : il faut le recréer dans un nouvel environnement.

## 3. Ce que la base sait déjà faire pour l'Agence hub

L'essentiel du modèle existe. La nouvelle session doit **construire des
écrans sur ces tables, pas de nouvelles tables** — sauf là où la section 4
le dit.

| Besoin exprimé | Ce qui existe | Manque |
|---|---|---|
| Profil de l'agence, coordonnées, TPS/TVQ | `agency` : `legal_name, address, city, province, postal_code, country, phone, email, website, logo_url, gst_number, qst_number`. Écran et action serveur faits. | Numéro d'entreprise du Québec (NEQ), IBAN / instructions de paiement par défaut. Une migration de trois colonnes. |
| Logo, photos des membres | `agency.logo_url`, `agency_member.avatar_url` (adresses d'image). | Un bucket Supabase Storage `public-assets` et le téléversement depuis l'écran. |
| Membres, rôles, droits | `agency_member`, `permission` (11), `role_permission`, `member_permission`, vue `member_effective_permission`. Écran fait. | Rien. |
| Produits et services | `catalog_item` : `kind` (produit / service), `billing` (mensuel, trimestriel, annuel, ponctuel), `unit`, `price_cents`, `active`, `position`. Un produit facturé au mois est refusé. | L'écran d'édition (lecture seule aujourd'hui). |
| Offres récurrentes ou ponctuelles | `offer` : `billing`, `price_cents`, `price_is_from`, `intro_price_cents`, `intro_periods`, `delivery_weeks_min/max`, `free_consult_minutes`, `is_popular`, `recommended_offer_id`. | L'écran de construction. |
| Contenu d'une offre | `offer_line` : un article du catalogue **ou une autre offre incluse**, quantité, groupes d'options « au choix du client ». `offer_benefit` (ce que le client y gagne), `offer_segment` (idéal pour). Vue `offer_value` (valeur catalogue et remise). | Idem. |
| Livrables d'une offre | `offer_task_template` : les tâches que la vente engendre, avec rôle et échéance relative. C'est ce qui produit les 115 tâches du semis. | Le lien explicite offre → `deliverable` (le livrable contractuel soumis à approbation, distinct de la tâche). Voir section 4. |
| Devis | `quote`, `quote_line` (`catalog_item_id`, `offer_id`), statuts, `template_id`. Numérotation `app.next_document_ref(template)` → `DV-2026-017`. | Écran de préparation et rendu. |
| Contrats, annexes | `contract`, `contract_document` (rang de priorité), `deliverable`, `revision_round`, `milestone` (dates relatives recalculées), `client_input_item`, `contract_exclusion`, `payment_milestone`, `support_period`. Vues `contract_schedule`, `contract_financials`. | Écran, rendu, et la génération depuis une offre. |
| Factures | `invoice`, `invoice_line`, vue `invoice_total`, immuable une fois envoyée, `invoice_portal_read`. | Écran et rendu. |
| Modèles de documents | `document_template` : `kind` (devis, facture, proposition, contrat, annexe, avenant), préfixe et numérotation, délai de paiement, `intro`, `legal_mentions`, `footer`, `payment_instructions`, un modèle par défaut par sorte. | **Le corps HTML du modèle et ses balises.** C'est la vraie nouveauté. Voir section 4. |

## 4. L'Agence hub : ce qu'il doit devenir

### Nom et place

**« Agence hub »**, en miroir de « Client hub » qui existe déjà dans le
menu. Route `/agence`. Une entrée de premier niveau dans la barre latérale,
juste au-dessus de Paramètres. Les sections Profil, Catalogue et Équipe
quittent `/parametres`, qui ne garde que ce qui est réglage : intégrations,
notifications, abonnement, consommation.

### Sections

1. **Profil** — identité, coordonnées, logo (téléversement), TPS, TVQ,
   NEQ, instructions de paiement par défaut. Existe, à déplacer et compléter.
2. **Équipe** — membres avec photo (téléversement), rôles, droits. Existe,
   à déplacer.
3. **Catalogue** — produits et services : créer, modifier, archiver,
   réordonner, prix unitaire. Lecture seule aujourd'hui.
4. **Offres** — le constructeur : nom, accroche, prix (fixe ou « à partir
   de »), récurrence, tarif d'entrée, délai, lignes (articles, offres
   incluses, options au choix), bénéfices, segments, **tâches engendrées**
   et **livrables contractuels**. Lecture seule aujourd'hui.
5. **Modèles de documents** — un modèle par sorte, avec son HTML et ses
   balises, un aperçu rendu sur des données d'exemple, le choix du modèle
   par défaut.
6. **Documents** — la liste de ce qui a été produit (devis, propositions,
   contrats, annexes, factures), avec statut, client, montant. La
   *création* d'un document part d'un client ou d'une opportunité (c'est
   là que sont les données), mais la liste et les modèles vivent ici.

### Les livrables d'une offre

Aujourd'hui une offre engendre des **tâches** (`offer_task_template`). Le
contrat SHGM montre qu'un mandat porte aussi des **livrables** soumis à
approbation, avec rondes de révision (`deliverable`). Les deux ne sont pas
la même chose : la tâche est du travail interne, le livrable est ce que le
client approuve. Proposition : une table `offer_deliverable_template`
(offre, code, nom, rondes incluses, ordre) qui, à la vente, produit les
lignes `deliverable` du contrat comme `apply_offer_tasks` produit les
tâches. Une migration, un test, une section dans le constructeur d'offres.

### Le générateur de documents

C'est le cœur de la demande, et ce qui rapproche le produit d'un logiciel
en ligne plus que d'un CRM. Ce qui est décidé et ce qui reste à décider.

**Décidé par ce qui existe déjà :**

- Une sorte de document = une valeur de `document_kind`. Un modèle =
  une ligne de `document_template`. Un document produit = une ligne de
  `quote`, `contract` (+ `contract_document`) ou `invoice`, avec son
  `template_id` et sa référence numérotée par `app.next_document_ref`.
- Le HTML d'un modèle est du contenu de l'agence : il vit dans la base
  (`document_template.body_html`, à ajouter), pas dans le code. Un modèle
  se modifie sans déploiement.
- Le rendu se fait **côté serveur** : une route `/documents/[id]` qui
  charge le document et ses données sous RLS, remplace les balises,
  renvoie le HTML. Le PDF s'obtient par l'impression du navigateur au
  départ (le CSS d'impression fait le travail) ; un rendu PDF serveur
  viendra si l'envoi automatique par courriel le demande.
- Un document **envoyé** se fige : le HTML rendu est conservé tel quel
  (`rendered_html`, à ajouter sur `quote`, `contract_document`, `invoice`)
  pour qu'une modification ultérieure du modèle ne réécrive pas ce que le
  client a reçu. Même logique que l'immuabilité des factures.

**À décider avec Armel, en début de session :**

- **La syntaxe des balises.** Les modèles construits avec Claude Design en
  portent déjà : il faut les voir avant de trancher. Proposition par
  défaut : `{{agence.nom}}`, `{{client.raison_sociale}}`,
  `{{document.reference}}`, `{{lignes}}` (bloc répété), `{{total.ttc}}`,
  avec un dictionnaire des balises publié dans l'écran des modèles. Si les
  modèles existants utilisent une autre forme, on l'adopte.
- **Le HTML des modèles.** Armel fournit le HTML de ses modèles (offre de
  service, contrat, annexe A, devis, facture). Ils deviennent les lignes
  `document_template` de l'agence, HTML compris, via une migration de
  semis ou directement dans l'écran une fois construit.
- **Ce que produit une vente.** Une offre acceptée engendre un contrat,
  ses livrables, ses tâches, une première facture (acompte selon
  `payment_milestone`). Ce chaînage n'est pas écrit ; il est le sujet
  d'une migration à part quand le générateur existe.

## 5. Ordre de travail proposé

Chaque étape se livre seule, déployée, vérifiable en production.

| # | Étape | Taille | Dépend de |
|---|---|---|---|
| 0 | `AUTH_REQUIRED=on` sur Vercel (Armel). Bucket Storage `public-assets` (migration + politique). | petite | — |
| 1 | Créer `/agence` avec sa navigation ; y déplacer Profil, Équipe, Catalogue ; alléger `/parametres`. Téléversement du logo et des photos. | moyenne | 0 |
| 2 | Catalogue modifiable : actions serveur créer / modifier / archiver / réordonner. | moyenne | 1 |
| 3 | Constructeur d'offres : édition complète de `offer`, `offer_line`, `offer_benefit`, `offer_segment`, `offer_task_template`. Migration `offer_deliverable_template`. | grande | 2 |
| 4 | Modèles de documents : `body_html` + balises, écran d'édition, aperçu sur données d'exemple, semis des modèles réels d'Armel. | grande | HTML fourni |
| 5 | Générateur : devis depuis un client ou une opportunité, à partir d'une offre ou de lignes libres ; rendu `/documents/[id]` ; envoi = figeage. Puis contrat et annexe, puis facture. | grande | 3, 4 |
| 6 | Brancher `/clients` et `/pipeline` sur la base (semer opportunités et mesures pour les 8 comptes fictifs). Indépendant de l'Agence hub, mais nécessaire pour que le générateur ait des clients réels sous la main. | grande | — |

Le reste de l'arriéré, pour mémoire : contrat à l'écran (livrables, jalons,
exclusions), automatisation de rappel d'acceptation tacite, migration des
autres écrans (fiche client, rapports, agenda, SEO local, outils), champs
figés encore présents sur `client` (`health_score_prev` et semblables).

## 6. À apporter à la nouvelle session

- Le **HTML des modèles** produits avec Claude Design, un fichier par
  document, et la **liste des balises** qu'ils contiennent.
- Les numéros de **TPS, TVQ et NEQ** (ou les saisir dans Profil avant).
- Le **logo** de l'agence et les **photos** des membres réels.
- Les **tarifs d'entrée** des packs SEO, s'ils existent.
- Le **plan d'amélioration** issu des tests (voir section 7).

## 7. Format suggéré pour le plan d'amélioration

Une ligne par constat, dans un fichier `docs/plan-amelioration.md` ou un
message. Le format qui se transforme le plus vite en travail :

```
- [écran ou route] ce qui s'est passé → ce qui était attendu. (gravité : bloque / gêne / détail)
```

Exemple : `- [/pipeline] déplacer une carte vers Gagné ne crée pas de client → un client devrait apparaître dans Client hub avec l'offre vendue. (bloque)`

Pas besoin de proposer la solution : le constat suffit, et un constat
précis vaut mieux qu'une liste de souhaits.

## 8. Message de démarrage pour la nouvelle session

À coller tel quel dans la première invite :

> Lis `docs/passation-agence-hub.md` en entier, puis `supabase/README.md`
> et `docs/modele-donnees.md`. Respecte les conventions de la section 2
> sans exception. Commence par l'étape 1 de la section 5 : créer
> `/agence` (« Agence hub »), y déplacer Profil, Équipe et Catalogue depuis
> `/parametres`, ajouter le téléversement du logo et des photos via
> Supabase Storage. Valide toute migration en local avant de l'appliquer
> en ligne, déploie, et dis-moi ce que je dois vérifier en production
> avant de passer à l'étape suivante. Ne me demande pas de permission pour
> les actions réversibles : le mode automatique est activé.
