# Base de données

Le schéma PostgreSQL qui remplacera les constantes de `lib/data/*.ts`.

- **Le raisonnement** : [`docs/modele-donnees.md`](../docs/modele-donnees.md)
- **Les arbitrages en attente** : [`docs/reconciliation-donnees.md`](../docs/reconciliation-donnees.md)
- **Les règles produit appliquées** : [`docs/decisions.md`](../docs/decisions.md)

## État

| Migration | Contenu | État |
|---|---|---|
| `0001_fondations.sql` | Agence, membres, vocabulaires, garde-fous RLS | ✅ écrite et vérifiée |
| `0002_comptes.sql` | Clients, prospects, services, contacts, établissements | ✅ écrite et vérifiée |
| `0003_boucle_livraison.sql` | Audit, priorité, tâche, preuve, rapport, versions publiées | ✅ écrite et vérifiée |
| `0004_crm.sql` | Pipeline, devis, factures, fil de communications | ✅ écrite et vérifiée |
| SEO local (avis, citations, positions, concurrence) | — | ⬜ à écrire |
| Outils SEO (séries de positions, backlinks, cache de mots-clés) | — | ⬜ à écrire |
| Contenu, automatisations, notifications, agenda | — | ⬜ à écrire |
| `seed.sql` — le portefeuille de démonstration | — | ⬜ bloqué par la réconciliation |

**Rien n'est encore appliqué sur un projet Supabase** : lequel utiliser reste à
décider (voir `docs/modele-donnees.md`, dernière section).

## Vérifier les migrations en local

Pas besoin de Supabase ni de Docker — un PostgreSQL nu suffit, avec la doublure
de plateforme fournie.

```bash
export PATH=/usr/lib/postgresql/16/bin:$PATH
initdb -D /tmp/hp-pgdata -U postgres --auth=trust
pg_ctl -D /tmp/hp-pgdata -o '-p 55432 -k /tmp' -l /tmp/hp-pg.log start

export PGHOST=/tmp PGPORT=55432 PGUSER=postgres
createdb hp_test

psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/00_stub_supabase.sql
for f in supabase/migrations/*.sql; do
  psql -q -d hp_test -v ON_ERROR_STOP=1 -f "$f"
done

psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/01_regles.sql
psql -q -d hp_test -v ON_ERROR_STOP=1 -f supabase/tests/02_regles_crm.sql
```

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
