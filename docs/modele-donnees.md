# Le modèle de données — HuntPilote sur Supabase

Ce document explique **les choix de structure** derrière les migrations de
`supabase/migrations/`. Le schéma lui-même est commenté table par table ; ce
qui suit couvre les décisions qu'on ne lit pas dans du SQL, et celles qui
restent ouvertes.

Il prolonge [`decisions.md`](decisions.md) : les treize décisions et les trois
règles spécifiées y font foi. Plusieurs d'entre elles ne sont pas des
préférences d'interface mais des contraintes de base de données — c'est
l'objet de la moitié de ce document.

---

## Le point de départ

Quarante écrans sont en ligne, alimentés par une vingtaine de fichiers
`lib/data/*.ts` : des constantes TypeScript, fidèles aux maquettes, cohérentes
entre elles (les mêmes dix clients réels circulent partout), mais figées — rien
n'est persisté, recharger la page réinitialise tout.

Ces fichiers sont une bonne matière première : ils décrivent déjà, en types
TypeScript, à peu près toutes les entités du produit et leurs relations. Le
schéma ci-dessous en est la traduction en PostgreSQL, pas une reconception.

---

## Les huit décisions de structure

### 1. `agency_id` sur toutes les tables métier, dès maintenant

La décision 12 dit « mono-utilisateur pour l'instant, multi à trois ans », et
surtout : *chaque objet porte dès maintenant un responsable, pour ne pas avoir
à tout reprendre le jour où un deuxième utilisateur arrive*.

La même logique vaut un cran au-dessus. Ajouter la colonne de cloisonnement
aujourd'hui coûte une colonne et un index par table. L'ajouter plus tard coûte
une migration de données, la réécriture de **toutes** les politiques RLS, et
la relecture de chaque requête de l'application. On la met tout de suite,
quitte à ce qu'elle ne contienne qu'une seule valeur pendant trois ans.

### 2. `uuid` en clé primaire, `slug` en clé publique

Les routes de l'application exposent des identifiants lisibles :
`/clients/acme-corp`, `/clients/acme-corp/priorites/p-0418`,
`/clients/acme-corp/rapports/2026-09`. Ces chaînes doivent survivre.

Mais un slug change — un client se renomme, une période se corrige. Les clés
étrangères ne doivent pas en dépendre. Donc : `id uuid primary key`, plus
`slug text not null` avec une contrainte d'unicité **par agence**. Les routes
continuent de résoudre par slug, les jointures par uuid.

### 3. La règle de visibilité client vit dans RLS, pas dans l'interface

La règle 1 est formelle : le client ne voit que les priorités *annoncé* ou *en
traitement*, jamais l'inventaire complet de ses défauts.

Aujourd'hui, c'est un `.filter()` dans un composant React. Demain, le portail
interroge une API : si la règle reste dans l'interface, **l'inventaire complet
transite quand même**, et il suffit d'ouvrir l'onglet réseau pour le lire. Une
règle qui protège ce que le client n'est pas censé voir n'est pas une règle
d'affichage, c'est une règle d'accès.

Elle est donc écrite comme politique RLS sur `priority`, avec le rôle du
demandeur pour discriminant. Le `.filter()` de l'interface reste, mais comme
confort d'affichage, plus comme garde-fou.

Le même raisonnement vaut pour le double libellé : le portail ne doit jamais
pouvoir lire le libellé **interne** d'une priorité. Les deux libellés vivent
sur la même ligne, mais la politique du portail n'expose que les colonnes
client — d'où une vue dédiée plutôt qu'un accès direct à la table.

### 4. Un rapport publié est un instantané figé, pas une vue sur la base vivante

La décision 6 dit que le portail est figé à la publication, et la session 5.2
que *un rapport publié ne bouge plus : c'est un document daté*. Une correction
crée une v2, la v1 reste consultable.

Deux tables, donc, et pas une :

- `report` — le brouillon de travail, modifiable, avec son état d'éditeur
  (brouillon, bloqué, prêt, publié, corrigé, sans preuve) ;
- `report_version` — l'instantané immuable produit à la publication : le
  contenu rendu, sa date, son jeton public, son numéro de version.

Le portail et la page publique `/r/[token]` lisent `report_version`. Rien de ce
qui bouge en base après l'envoi ne peut modifier ce que le client a reçu.

### 5. Deux identités distinctes, un seul `auth.users`

Deux populations se connectent, avec des droits sans rapport :

- les **membres de l'agence** — courriel et mot de passe, route `/connexion`,
  accès au cockpit complet ;
- les **contacts client** — lien magique, route `/portail/connexion`, accès à
  leur seul portail, sous la règle de visibilité ci-dessus.

Les deux passent par `auth.users` de Supabase. Ce qui les sépare est une ligne
de profil : `agency_member` d'un côté, `client_contact` de l'autre. Toutes les
politiques RLS partent de là. Un contact client ne doit jamais pouvoir
atteindre une table du cockpit, même en devinant son nom.

### 6. Types énumérés pour les vocabulaires figés, contrainte `check` ailleurs

Les sévérités (`critique`, `important`, `opportunite`), les trois dimensions
d'audit (`presence`, `seo`, `design`) et les trois états de visibilité
(`interne`, `annonce`, `traitement`) sont des invariants du produit, écrits
dans `decisions.md`. Ils deviennent des types énumérés PostgreSQL : le moteur
refuse alors une valeur hors vocabulaire, et les types TypeScript générés
collent exactement aux unions de chaînes existantes.

Les statuts plus mouvants — étapes du pipeline, états d'une tâche, statuts de
devis — restent du `text` avec une contrainte `check`. Ajouter une étape au
pipeline ne doit pas demander un `alter type`.

### 7. L'état « à relire » est une colonne, pas une table polymorphe

La règle 1 impose une relecture humaine sur tout texte rédigé par l'agent et
destiné à sortir de l'agence : libellé client d'une priorité, libellé client
d'une preuve de valeur, réponse à un avis Google. Partout le même état « à
relire », partout le même blocage de publication.

Trois entités, trois colonnes `client_label_review_state`. Une table générique
de « textes générés » avec propriétaire polymorphe serait plus courte à écrire
et bien plus pénible à interroger — pas de clé étrangère réelle, pas de
contrainte, une jointure conditionnelle à chaque lecture. Pour trois cas, la
colonne gagne.

La file de relecture — *tout ce qui attend une relecture, tous clients
confondus* — est une **vue** qui rassemble les trois, pas une table.

### 8. La politique de conservation façonne les tables, elle ne s'y ajoute pas

> **Depuis :** la règle 3 ne façonne plus seulement les tables, elle s'exécute.
> `app.purge_expired_data()` périme le cache et dilue les séries avec les
> seuils de chaque agence ; un déclencheur pose le régime de conservation à
> l'insertion pour qu'un appel ne puisse pas se déclarer conservé alors qu'il
> ne l'est pas ; et perdre un deal purge l'instantané du prospect sur-le-champ.
> La table des deltas de liens s'appelle `backlink_event` et non
> `backlink_change`, mais la thèse est la même : pas de table `backlink`.

La règle 3 distingue ce qui est historisé de ce qui est éphémère. Ça se traduit
directement :

- **Séries temporelles en append-only** : scores d'audit, Lighthouse/CWV,
  positions SERP, positions locales. Une ligne par mesure datée, jamais de
  mise à jour. La dilution (quotidien 90 j → hebdo 12 mois → mensuel) devient
  une tâche planifiée qui agrège et purge.
- **Delta seul** : les backlinks. On enregistre les gains et les pertes, jamais
  le corpus complet — la table s'appelle `backlink_change`, pas `backlink`.
- **Cache avec expiration** : l'exploration de mots-clés. Table à part, avec
  `expires_at`, purgée au-delà de 30 jours. Ce n'est pas une entité du
  domaine, c'est un cache d'appels DataForSEO facturés.
- **Instantané purgeable** : les données d'un prospect. La suppression d'un
  deal perdu doit emporter son instantané SEO — `on delete cascade`.

Les seuils (90 jours, 12 mois, 30 jours) sont des **réglages d'agence**, pas
des constantes : ils vivent dans `agency_settings`, comme le dit la règle 3.

---

## Ce que le schéma règle au passage

**La fiche client ne montrera plus Acme Corp. pour tout le monde.** Aujourd'hui
`/clients/dupont-sas` affiche les données d'Acme : le composant lit une
constante unique et ignore l'identifiant de l'URL. Ce n'est pas un bug
d'affichage à corriger écran par écran, c'est l'absence de source de données
par client. Le semis (`supabase/seed.sql`) donne à chacun des dix comptes ses
propres lignes, et le problème disparaît de lui-même.

**Les jeux de données parallèles fusionnent.** Plusieurs écrans ont construit
leur propre copie d'un même concept (les tâches du dashboard contre celles du
plan de travail, corrigé récemment ; les échanges du portail contre ceux du
cockpit, unifiés en phase 7). Une table unique par concept rend ces
divergences impossibles.

---

## Ce qui reste à décider — et qui ne m'appartient pas

### ~~Quel projet Supabase~~ — tranché

Un projet neuf, `huntpilote` (région `ca-central-1`), a été créé le
11 septembre plutôt que de réutiliser l'un des trois projets en pause dont on
ignorait le contenu. Les onze migrations y sont appliquées ; l'audit de
sécurité est vide.

**Quatre réglages restent manuels**, parce qu'ils passent par la console et
qu'aucun outil ne les pose à distance :

1. **Authentification** — activer les fournisseurs « courriel » et « lien
   magique » (*Authentication → Providers*).
2. **Désactiver les inscriptions publiques** (*Authentication → Sign Up*).
   Sans ça, n'importe qui crée un compte sur le CRM d'une agence. C'est le
   seul des quatre qui soit une faille tant qu'il n'est pas fait.
3. **URL de redirection** — l'URL du site et les URL de retour autorisées
   (*Authentication → URL Configuration*), sinon le lien magique renvoie vers
   `localhost`.
4. **Trois variables d'environnement côté Vercel** —
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et
   `SUPABASE_SERVICE_ROLE_KEY` (celle-ci jamais préfixée `NEXT_PUBLIC_` :
   elle contourne RLS et n'a rien à faire dans un paquet navigateur).

### ~~Comment les écrans liront la base~~ — tranché : composants serveur

Décision prise le 12 septembre, écran par écran. `page.tsx` charge la session
et les données avec les droits de la personne connectée (donc sous RLS) et
les passe en props à la vue. Premier écran migré : `/parametres`. Tant que
Vercel n'est pas configuré, `supabaseConfigured()` fait rendre chaque écran
comme avant la base — sans session, sans données, sans planter.

Ce qui suit est le raisonnement d'origine, conservé pour mémoire.

Les quarante vues sont des composants clients (`'use client'`) qui importent
directement leurs constantes. Avec une vraie base, trois chemins :

| Approche | Ce que ça donne | Ce que ça coûte |
|---|---|---|
| **Composants serveur** — `page.tsx` interroge, passe en props | La bonne pratique App Router : pas de cascade de requêtes, rien qui fuit au navigateur | Toucher les 40 écrans, une fois |
| **Client Supabase au navigateur** — RLS en garde-fou | Refactorisation plus mécanique, temps réel offert | Chaque écran attend son chargement ; tout repose sur des politiques RLS sans faille |
| **Mixte** — le serveur charge l'initial, le client recharge | Le meilleur des deux | Deux chemins de données à maintenir par écran |

Je recommande le premier, écran par écran plutôt qu'en une fois. Mais c'est un
chantier de plusieurs jours qui change l'architecture de toute l'application :
il mérite une décision explicite, pas d'être entamé de nuit.

### L'authentification réelle

L'écran `/connexion` existe, joli et sans backend. Le brancher sur Supabase
Auth veut dire : choisir si on garde le mot de passe ou si on passe l'agence au
lien magique elle aussi, décider du sort de l'application sans session (tout
est public aujourd'hui), et protéger les routes. C'est un chantier en soi.
