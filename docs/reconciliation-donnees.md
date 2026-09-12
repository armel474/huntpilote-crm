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

## Tranché avec toi — 12 septembre

Les cinq questions ont leur réponse. Elles sont reportées ici pour que le
document cesse d'être une question ouverte.

### 1. Le domaine d'Acme Corp. → `.ca`

`acmecorp.ca` partout. Le `.fr` de la fiche client, des courriels de contact,
des URL de contenu et de l'adresse d'envoi du rapport disparaît. C'est le
domaine cohérent avec une clientèle québécoise.

### 2. Le pipeline → remappé sur les comptes existants

Les treize deals du Kanban ne pointaient vers aucun compte. Ils sont remappés
sur les comptes du portefeuille ; huit disparaissent, et **c'est sans
importance**. Le portefeuille de démonstration n'a pas besoin d'être gros, il
a besoin d'être cohérent : un deal pointe vers un compte, « Marquer gagné »
crée le client, et chaque référence mène quelque part.

Ces comptes sont **fictifs**, même quand le nom et le domaine d'une entreprise
sont réels — ils viennent de données de prospection, pas d'un mandat. Ils
seront remplacés par de vrais comptes.

### 3. Les forfaits → un chantier, pas une valeur à saisir

C'est la réponse qui a changé le projet. La question « quels forfaits vends-tu
et à quels prix ? » n'appelait pas trois lignes dans une table : elle a révélé
que **l'agence ne peut pas paramétrer ce qu'elle vend**. Or sans ça, pas de
devis, pas de facture, et chaque tâche d'un mandat doit être créée à la main.

Un onglet **Agence** pilote donc le catalogue : produits, services, offres,
modèles de devis et de factures. Et une offre ne se contente pas d'un prix —
elle **décrit le travail qu'elle engage**. Vendre le forfait Croissance à un
compte crée les tâches de ce forfait, sans que personne les invente et sans
qu'un modèle de langage ait à les deviner.

Voir `docs/catalogue-agence.md` pour le détail du modèle.

Les offres réellement vendues restent à saisir — ce sont des **données**, pas
un changement de schéma. Le semis part des forfaits de démonstration
(`Essentiel`, `Croissance`, `Sur mesure`) et des cinq services de
`onboarding.ts` avec leurs prix.

### 4. L'équipe → un membre réel, trois de décor

L'agence, c'est une personne. Le semis garde **Marie Chen** en administratrice
et ajoute trois membres fictifs avec des rôles distincts, pour que les
assignations, les relectures et les permissions se testent vraiment.

Au passage : le panneau d'équipe existant ne portait qu'un nom, un courriel et
un rôle. Il lui manquait de quoi identifier une personne — prénom et nom
séparés, photo, téléphone, adresse — et de quoi dire ce qu'un rôle **autorise**.
Les deux sont ajoutés.

### 5. Novatech et les autres → répartis, sans état d'âme

Aucun compte n'est réel aujourd'hui. Le semis pose **quatre clients** et le
reste en prospects, de façon à ce que les deux régimes de conservation
(règle 3) et les deux parcours (portail, pipeline) soient tous les deux
exerçables.

Les vrais comptes viendront ensuite : le site de l'agence en client, un
prospect déjà signé en second client, puis les prospects réellement visés.

---

## Ce que ça change pour le semis

Le semis (`supabase/seed.sql`, à écrire) ne sera pas une traduction mécanique
de `lib/data/`. C'est une reprise : un portefeuille cohérent, dérivé de
l'existant, où chaque référence pointe quelque part.

Bonne nouvelle au passage — ça règle un problème connu sans effort
supplémentaire : aujourd'hui `/clients/dupont-sas` affiche la fiche d'Acme,
parce qu'il n'existe qu'un seul jeu de données détaillé. Avec un semis par
compte, chaque client a enfin le sien.
