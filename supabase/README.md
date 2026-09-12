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
| Outils SEO (séries de positions, backlinks, cache de mots-clés) | — | ⬜ à écrire |
| Contenu, automatisations, notifications, agenda | — | ⬜ à écrire |
| `seed.sql` — le portefeuille de démonstration | — | ⬜ bloqué par la réconciliation |

Le projet Supabase `huntpilote` (région `ca-central-1`) porte les sept
migrations. Le schéma en ligne correspond exactement à celui validé en local :
49 tables, 58 politiques, 6 vues — toutes en `security_invoker` —, 64
contraintes de vérification, 23 déclencheurs, 24 vocabulaires, aucune table
sans RLS. L'audit de sécurité ne remonte rien.

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
```

Les quatre fichiers s'enchaînent sur **la même base** : `02`, `03` et `04`
réutilisent le jeu d'essai monté par `01` (agence HuntPilote, agence rivale,
compte Acme, contact Sophie). 38 assertions au total.

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

Ce troisième fichier existe parce que les deux premiers avaient un trou : ils
vérifiaient les politiques des *tables*, jamais ce que renvoient les *vues*. Or
une vue PostgreSQL s'exécute par défaut avec les droits de son créateur et
contourne RLS — c'est l'audit Supabase qui l'a trouvé, pas ces tests. Le
correctif est la migration `0005`, et rejouer `03` sur un schéma privé de cette
migration échoue bien à la première assertion : le test attrape la faille qu'il
prétend couvrir.
