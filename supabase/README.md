# Base de données

Le schéma PostgreSQL qui remplacera les constantes de `lib/data/*.ts`.

- **Le raisonnement** : [`docs/modele-donnees.md`](../docs/modele-donnees.md)
- **Les arbitrages en attente** : [`docs/reconciliation-donnees.md`](../docs/reconciliation-donnees.md)
- **Les règles produit appliquées** : [`docs/decisions.md`](../docs/decisions.md)

## État

| Migration | Contenu | État |
|---|---|---|
| `0001_fondations.sql` | Agence, membres, vocabulaires, garde-fous RLS | ✅ appliquée |
| `0002_comptes.sql` | Clients, prospects, services, contacts, établissements | ✅ appliquée |
| `0003_boucle_livraison.sql` | Audit, priorité, tâche, preuve, rapport, versions publiées | ✅ appliquée |
| `0004_crm.sql` | Pipeline, devis, factures, fil de communications | ✅ appliquée |
| `0005_vues_security_invoker.sql` | Les vues respectent le RLS de leur appelant | ✅ appliquée |
| `0006_index_cles_etrangeres.sql` | Index sur les 22 clés étrangères non couvertes | ✅ appliquée |
| `0007_seo_local.sql` | Fiche Google Business, avis, citations, positions, concurrence | ✅ appliquée |
| `0008_outils_series.sql` | Suivi de positions, profil de liens, gains et pertes | ✅ appliquée |
| `0009_analyses_et_conservation.sql` | Analyses ponctuelles, cache, quota, **règle 3 exécutée** | ✅ appliquée |
| `0010_search_path_declencheur.sql` | Chemin de recherche figé sur le dernier déclencheur | ✅ appliquée |
| `0011_contenu_automatisations_agenda.sql` | Contenu éditorial, briefs, règles Quand/Alors, notifications, agenda | ✅ appliquée |
| `0012_catalogue_agence.sql` | Produits, services, offres, abonnements, tâches engagées | ✅ appliquée |
| `0013_documents_agence.sql` | Identité de facturation, modèles, numérotation, lignes de facture | ✅ appliquée |
| `0014_offre_reelle.sql` | Offres emboîtées, prix plancher, tarif d'entrée, alternatives | ✅ appliquée |
| `0015a` + `0015b` | Contrat, livrables, jalons, exclusions, échéancier de paiement | ✅ appliquée |
| `0016_equipe_et_permissions.sql` | Profils d'équipe et onze permissions appliquées | ✅ appliquée |
| `0017_membre_avant_connexion.sql` | Inviter avant de connecter ; `user_profile` disparaît | ✅ appliquée |
| `0018_connexion.sql` | `whoami()` et `accept_my_invitation()`, les deux points d'entrée publics de la connexion | ✅ appliquée |
| `0019_ecriture_profil.sql` | Le profil de l'agence s'écrit avec `manage_agency` ; chacun corrige le sien sans se promouvoir | ✅ appliquée |
| `seed.sql` — l'agence, son catalogue, son portefeuille | ✅ passé |

**Le modèle est complet, la base est peuplée, et l'application y est
branchée.** Le projet Supabase `huntpilote` (région `ca-central-1`) porte les
vingt migrations et le semis. Côté application : `lib/supabase/` (clients
serveur et navigateur, middleware de session), `lib/auth.ts` (la session en
un aller-retour), `lib/queries/` (les lectures, par écran), et
`lib/supabase/database.types.ts`, généré depuis le schéma — à régénérer
après chaque migration. `/parametres` est le premier écran lu dans la base ;
`docs/mise-en-service.md` liste les quatre réglages de console qui restent. Le schéma en ligne correspond exactement à celui validé en local, sur
les huit compteurs : 109 tables, 134 politiques, 23 vues — toutes en
`security_invoker` —, 178 contraintes de vérification, 46 déclencheurs, 50
vocabulaires, 37 fonctions, aucune table sans RLS.

L'audit de sécurité ne remonte qu'une information : `number_counter` a RLS
sans aucune politique. C'est voulu — personne n'y touche depuis
l'application, seule `app.next_number()` y accède avec ses propres droits. Y
ajouter une politique affaiblirait la garantie. Il signale aussi que la
protection contre les mots de passe divulgués est désactivée : c'est un
réglage de console (Authentication → Sign In / Providers → Password), pas une
migration ; `docs/mise-en-service.md` le mentionne.

### Le semis

`seed.sql` pose des **données**, pas du schéma : une révision de tarifs ou un
nouveau client ne demande aucune migration. Il contient l'agence DigiHunt et
son identité de facturation, les six offres telles qu'elles sont vendues, le
mandat SHGM (contrat n° 2026-007 avec ses onze livrables, ses douze jalons et
ses treize exclusions), et un portefeuille de huit comptes — quatre clients,
quatre prospects, fictifs et assumés comme tels.

Trois mandats mensuels y génèrent **115 tâches** sans que personne les écrive :
c'est l'offre qui dit ce qu'elle engage. Le revenu récurrent s'élève à
2 200 $ par mois, calculé sur les abonnements actifs.

Un garde-fou empêche de le rejouer sur une base déjà peuplée.

**Il reste deux valeurs à saisir**, signalées dans le fichier :
les numéros d'inscription à la TPS et à la TVQ de l'agence, et le tarif
préférentiel des trois premiers mois de chaque pack SEO.

Il reste **quatre réglages manuels** côté plateforme, listés dans
`docs/modele-donnees.md` : les deux fournisseurs d'authentification, la
**désactivation des inscriptions publiques**, les URL de redirection, et les
trois variables d'environnement côté Vercel.

## Vérifier les migrations en local

Pas besoin de Supabase ni de Docker — un PostgreSQL nu suffit, avec la doublure
de plateforme fournie. `initdb` refuse de tourner sous `root` : on passe donc
par le compte `postgres`.

```bash
export PATH=/usr/lib/postgresql/16/bin:$PATH
mkdir -p /tmp/hp-pgdata && chown postgres:postgres /tmp/hp-pgdata && chmod 700 /tmp/hp-pgdata
su postgres -c "initdb -D /tmp/hp-pgdata -U postgres --auth=trust"
su postgres -c "pg_ctl -D /tmp/hp-pgdata -o '-p 55432 -k /tmp' -l /tmp/hp-pg.log start"

export PGHOST=/tmp PGPORT=55432 PGUSER=postgres
createdb hp_test

psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/00_stub_supabase.sql
for f in supabase/migrations/*.sql; do
  psql -q -d hp_test -v ON_ERROR_STOP=1 -f "$f"
done

psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/01_regles.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/02_regles_crm.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/03_regles_vues.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/04_regles_local.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/05_regles_outils.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/06_regles_conservation.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/07_regles_automatisations.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/08_regles_catalogue.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/09_regles_documents.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/10_regles_offre_reelle.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/11_regles_contrat.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/12_regles_permissions.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/13_regles_profil.sql
```

Les treize fichiers s'enchaînent sur **la même base** : tous réutilisent le jeu
d'essai monté par `01` (agence HuntPilote, agence rivale, compte Acme, contact
Sophie). **159 assertions** au total.

Les trois derniers montent des données réelles — les six offres telles
qu'elles sont vendues, et le mandat SHGM tel qu'il est signé — parce que c'est
la seule façon de vérifier que le modèle les décrit sans rien perdre.

`00_stub_supabase.sql` recrée le strict nécessaire de ce que Supabase fournit
(`auth.users`, `auth.uid()`, le rôle `authenticated`). Il n'est jamais appliqué
en ligne.

## Ce que `01_regles.sql` vérifie

Les règles de `decisions.md` sont appliquées par le moteur, pas par
l'interface — une règle qui protège ce qui sort de l'agence ne peut pas
dépendre d'un bouton désactivé côté navigateur.

- Une priorité visible du client **sans libellé client** est refusée (règle 1).
- Un libellé client **sans état de relecture** est refusé.
- Assigner une tâche fait passer une priorité *annoncée* en *en traitement*.
- Publier un rapport dont un libellé **attend une relecture** est refusé, et
  passe une fois la relecture faite.
- Un **deuxième contact principal** sur le même compte est refusé (session 7.1).
- Un critère **mesuré sans seuil** est refusé (convention figée en phase 1).
- Un membre ne voit **que les comptes de son agence**.
- Un contact du portail **n'atteint pas** la table des priorités, et ne voit que
  son propre compte (règle 1, appliquée en RLS).

Et côté CRM (`02_regles_crm.sql`) :

- Marquer un deal perdu **sans motif** est refusé — c'est le motif qui déclenche
  la purge de l'instantané du prospect (règle 3).
- Le sous-total, les taxes et le total d'un devis **se calculent** depuis ses
  lignes ; la somme des parties affichées fait le total affiché, au cent près.
- Une note interne **ne peut pas** devenir visible du client : la colonne est
  dérivée du canal, pas saisie.
- Le contact du portail ne lit **que** le fil du portail, ne peut écrire que
  sur ce canal, et peut répondre dans son propre fil.

Et côté vues (`03_regles_vues.sql`) :

- `review_queue` ne montre **que** les relectures de sa propre agence.
- `quote_total` ne montre **que** les devis de sa propre agence.
- Un contact du portail n'atteint **ni l'une ni l'autre**.

Et côté SEO local (`04_regles_local.sql`) :

- « 6 champs sur 9 », « 12 annuaires sur 20 », « 3 incohérences », « +6 »,
  « −4 », la moyenne, l'étendue et le relevé précédent d'une requête : tous
  **se retrouvent** sans avoir été stockés une seule fois.
- Les quatre alertes d'Acme se déduisent de ses données — le code n'en
  affichait qu'une —, et **répondre à l'avis négatif fait tomber la sienne**,
  sans intervention.
- Une réponse à un avis **ne part pas sans relecture** : « à relire » porte un
  brouillon, jamais un texte en ligne ; signaler un avis exige un motif.
- Une citation incohérente **nomme** le champ fautif, et seule une citation
  incohérente en porte.
- La valeur attendue d'un champ de référence **ne se recopie pas** dans l'écart
  qu'elle sert à constater.
- Le portail voit sa fiche et ses relevés, **jamais l'inventaire** des
  incohérences ni l'analyse de ses rivaux.

Et côté outils (`05_regles_outils.sql`, `06_regles_conservation.sql`) :

- Le tableau `history` devient une série datée : « 7, précédemment 9 » se lit
  entre deux lignes, et le relevé précédent **a enfin une date**.
- « Sorti du classement », « premier relevé » et « cannibalisation » se
  déduisent de la série. Le test a d'ailleurs trouvé une contradiction dans le
  jeu de démonstration : un mot-clé affiche « précédemment 34 » alors que son
  propre historique donne `null` aux trois derniers relevés.
- Un gain de lien **nomme la page** qu'il pointe, une perte **dit pourquoi**,
  un lien « désavoué » **porte la date** de son désaveu.
- Le marqueur de conservation (règle 3) ne se déclare pas : un appel qui se
  prétend historisé alors qu'il est du cache **est corrigé, pas cru**.
- Les quatre catégories du Keyword Gap sont quatre comparaisons, pas quatre
  listes à tenir — et un concurrent sans données **ne compte pas** : ne pas
  savoir n'est pas être absent.
- Perdre un deal **purge l'instantané** du prospect, sur-le-champ.
- La dilution n'est plus un vœu de document : 14 relevés quotidiens vieux de
  plus de 90 jours deviennent 3 relevés hebdomadaires, le relevé récent reste
  intact, et le cache périmé disparaît.

Et côté contenu et automatisations (`07_regles_automatisations.sql`) :

- Une condition qui **ne parle pas de son déclencheur** est refusée, et
  changer de déclencheur **emporte** les conditions devenues fausses. Le code
  nettoyait après coup ; la base refuse d'abord.
- Trois échecs **consécutifs** arrêtent une règle — et une réussite au milieu
  casse la série. Une exécution qui échoue **dit pourquoi**.
- « 24 exécutions, dernière il y a 2 j, 100 % de réussite » se comptent sur le
  journal d'exécution, qui n'existait pas.
- « Publié » veut dire qu'il y a **une page et une date** ; « en rédaction »
  veut dire que **quelqu'un le rédige** ; une longueur cible porte **la raison
  qui l'explique** ; un plan d'article n'a que des H2 et des H3.
- Un événement d'agenda **ouvre une chose, pas deux, et jamais rien** — et
  seule une échéance se coche.
- Un bouton **sans destination** ne se propose pas, et quand l'objet pointé
  disparaît, **le lien disparaît avec lui**.
- Chacun ne lit que **ses** notifications, plus celles de l'agence.

Ce troisième fichier existe parce que les deux premiers avaient un trou : ils
vérifiaient les politiques des *tables*, jamais ce que renvoient les *vues*. Or
une vue PostgreSQL s'exécute par défaut avec les droits de son créateur et
contourne RLS — c'est l'audit Supabase qui l'a trouvé, pas ces tests. Le
correctif est la migration `0005`, et rejouer `03` sur un schéma privé de cette
migration échoue bien à la première assertion : le test attrape la faille qu'il
prétend couvrir.
