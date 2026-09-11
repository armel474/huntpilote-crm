# Réconciliation des données avant le semis

Le relevé exhaustif de `lib/data/` a remonté une quarantaine d'incohérences
entre fichiers. C'est normal : vingt fichiers écrits par des agents différents
sur huit phases, chacun scopé à son écran, sans qu'aucun ne voie l'ensemble.
Tant que tout était figé côté affichage, ça ne se voyait pas.

Une base de données ne le permet plus. Une clé étrangère ne peut pas pointer
vers un nom d'entreprise qui n'existe nulle part, et le même identifiant de
priorité ne peut pas désigner quatre constats différents.

Ce document sépare ce que j'ai tranché de ce qui demande une réponse.

---

## Tranché — dis-moi si tu n'es pas d'accord

Ces choix-là n'engagent que la forme. Je les ai faits pour pouvoir écrire le
schéma ; ils se défont facilement.

| Sujet | Le désordre actuel | Ce que j'ai retenu |
|---|---|---|
| **Identifiants** | Une priorité a `id: 'P-0431'` et `slug: 'p-0426'` — désynchronisés. Une tâche a `id: '#142'` et `slug: '142'`. Un audit en a trois. | `id uuid` interne, `slug` pour l'URL, `ref` pour l'affichage (`P-0418`, `#142`). Les trois dérivent l'un de l'autre au semis, plus jamais à la main. |
| **Argent** | `mrr: '1 200 $ CA'` en chaîne ici, `mrr: 1200` en nombre là. Le code reparse avec `replace(/[^\d]/g,'')`. | Des cents, en entier (`mrr_cents`). Le formatage est un travail d'affichage. |
| **Dates** | Quatre conventions : ISO, « 15 avr. 2026 », « 8 sept., 14 h 00 », et des phrases (« En retard depuis 4 jours »). | `date` et `timestamptz`. « En retard depuis 4 jours » se calcule, ne se stocke pas. |
| **Métriques** | `kw: '142'`, `sessions: '34,8k'`, `ctr: '3,4 %'` — inagrégeables. | Des nombres. Les séries mesurées quittent la fiche client pour des tables datées (règle 3). |
| **Champs dérivés figés** | `servicesCount`, `overdueDays`, `TacheBucket`, `Integration.accounts`, `TEAM.clients` sont écrits en dur. | Calculés. Un compteur stocké finit toujours par mentir. |
| **Canaux** | Trois énumérations, dont `'email'` et `'courriel'` pour la même chose. | Un seul type `communication_channel` (8 valeurs, migration 0002). |
| **Dimensions d'audit** | Codes (`'presence'`) et libellés (`'Présence en ligne'`) mélangés selon le fichier. | Le code en base, le libellé à l'affichage. |
| **Présentation dans la donnée** | `color`, `tone`, `badgeType`, `icon`, `sparkData` vivent dans les objets métier. | Sortis du schéma. Une couleur est une décision d'interface, pas un fait. |
| **Critères d'audit** | Le libellé français sert de clé ; renommer un critère casserait la comparaison de deux audits. | Un référentiel `criterion_definition` avec un `code` stable. |
| **Rôles d'équipe** | `'Administratrice'` sert de clé — une graphie féminine figée dans la donnée. | Codes stables (`admin`, `chef_projet`…), libellés à l'affichage. |

---

## À trancher — j'ai besoin de toi

Ces cinq-là touchent à ton activité réelle, pas à la forme. Je ne peux pas
deviner.

### 1. Le domaine d'Acme Corp. : `.ca` ou `.fr` ?

Les deux circulent. `clients.ts` et les citations locales disent
**`acmecorp.ca`** ; la fiche client, les courriels des contacts, les URL de
contenu et l'adresse d'envoi du rapport disent **`acmecorp.fr`**.

Pour une agence québécoise avec un client montréalais, `.ca` paraît juste —
mais c'est ton jeu de démonstration, et il sert aussi à montrer le produit.

### 2. Le pipeline ne connaît aucun de tes clients

C'est l'incohérence la plus lourde. Les treize deals (`Immobilier Vista`,
`Studio Pixel`…) **n'existent dans aucun autre fichier**, et les cinq prospects
du Client Hub (`Novatech`, `Paris Médias`, `Vélo Urbain`, `Spa Nordik`,
`Quincaillerie Fortin`) **n'apparaissent dans aucun deal**. Deux univers
parallèles.

Or le produit repose sur l'inverse : « Marquer gagné » crée le client et lance
l'onboarding. Dans le schéma, un deal pointe vers un compte prospect.

Trois sorties possibles :
- **rattacher les treize deals à de nouveaux comptes prospects** — le
  portefeuille passe de 10 à 23 comptes, le Client Hub devient chargé ;
- **remapper les deals sur les cinq prospects existants** — cohérent, mais huit
  deals disparaissent ;
- **garder les deux et l'assumer** — quelques deals sur des prospects du hub,
  d'autres sur des comptes créés pour l'occasion.

Je pencherais pour la deuxième, quitte à garder trois ou quatre deals
supplémentaires pour que le Kanban reste vivant. Mais c'est ta démonstration
commerciale.

### 3. Tes forfaits, pour de vrai

Quatre vocabulaires cohabitent : `badge` vaut `Croissance`/`Stable` sur un
client, `workflow.FORFAITS` dit `Essentiel`/`Croissance`/`Sur mesure`,
`CLIENT.plan` dit `Croissance SEO`, et `onboarding.SERVICES` liste cinq
services avec des prix (`seotech`, `contenu`, `seolocal`, `audit`,
`backlinks`).

**Quels forfaits vends-tu réellement, et à quels prix ?** Le schéma a une table
`service` avec un prix : autant y mettre tes vrais paliers. C'est aussi ce qui
alimentera la facturation plus tard.

Note au passage : `badge` sert à deux choses incompatibles — le forfait pour un
client, l'étape commerciale pour un prospect. Je les sépare de toute façon.

### 4. Ton équipe

`TEAM` compte quatre membres (Marie Chen, Julien Dubois, plus deux). Mais des
tâches, des commentaires et des blocages citent **Jules Rivard**, **Sofia
Nadeau**, **Julie Bergeron**, **Marc Tremblay** — absents de `TEAM`. Et le
pipeline a son propre trio d'initiales (`MC`, `JD`, `AL`).

**Qui existe vraiment ?** Réponse simple si l'agence, c'est toi : un seul
membre réel, et le reste devient du décor assumé dans le semis.

### 5. Novatech : client ou prospect ?

`clients.ts` en fait un **prospect** (donc sans score de santé). Le dashboard
lui donne un **score de 85** comme à un client. Même genre d'écart pour Le
Marché Bio : score 71 au dashboard, 85 au Client Hub.

---

## Ce que ça change pour le semis

Le semis (`supabase/seed.sql`, à écrire) ne sera pas une traduction mécanique
de `lib/data/`. C'est une reprise : un portefeuille cohérent, dérivé de
l'existant, où chaque référence pointe quelque part.

Bonne nouvelle au passage — ça règle un problème connu sans effort
supplémentaire : aujourd'hui `/clients/dupont-sas` affiche la fiche d'Acme,
parce qu'il n'existe qu'un seul jeu de données détaillé. Avec un semis par
compte, chaque client a enfin le sien.
