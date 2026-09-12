# Mise en service — ce qui reste entre vos mains

Le schéma, le semis et le code de connexion sont en place. Quatre réglages
passent par des consoles auxquelles aucun outil n'accède à distance. Dans
l'ordre, et rien d'autre à faire ensuite.

## 1. Supabase → Authentication → Providers (2 min)

Projet `huntpilote` (`ncifsjflgwoemtputqpc`).

- **Email** : activé. Laisser « Confirm email » activé.
- **Google** : activer, puis coller le *Client ID* et le *Client Secret* d'un
  projet Google Cloud (OAuth 2.0 → type « Application Web »). Dans Google,
  l'URI de redirection autorisée est celle que Supabase affiche sous le
  fournisseur (`https://ncifsjflgwoemtputqpc.supabase.co/auth/v1/callback`).

Le lien magique n'a pas de réglage propre : il passe par le fournisseur
Email.

## 2. Supabase → Authentication → Sign In / Providers → « Allow new users to sign up » (30 s)

**Désactiver.** C'est le seul réglage qui soit une faille tant qu'il n'est pas
fait : sans ça, n'importe qui crée un compte sur le CRM. Un compte créé sans
invitation ne verrait rien (RLS), mais il n'a aucune raison d'exister.

Une fois désactivé, seules les personnes **invitées** — dont le courriel
figure dans `agency_member` — peuvent entrer. Le vôtre y est déjà :
`armel.nguimbi47@gmail.com`, en administration. À la première connexion,
votre compte se rattache à cette invitation automatiquement.

## 3. Supabase → Authentication → URL Configuration (1 min)

- **Site URL** : `https://huntpilote-crm.vercel.app` — le domaine stable de
  production (ou votre propre domaine, le jour où il y en a un).
- **Redirect URLs** : ajouter `https://huntpilote-crm.vercel.app/api/auth/callback`
  et, pour travailler en local, `http://localhost:3000/api/auth/callback`.

Sans ça, le lien magique et Google reviennent vers `localhost` et la
connexion échoue avec « Ce lien n'est plus valide ».

## 4. Vercel → Projet → Settings → Environments → **Production** (2 min)

Les variables ne sont plus une entrée du menu : elles vivent dans chaque
environnement. Cliquer sur la ligne **Production**, puis la section
**Environment Variables**. La boîte d'ajout permet de cocher plusieurs
environnements à la fois.

| Variable | Valeur | Portée |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ncifsjflgwoemtputqpc.supabase.co` | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_e74_sXUg7lUNTXx6EThuig_swTLmsfD` | Production + Preview |
| `AUTH_REQUIRED` | `on` | Production **seulement**, et **après** les étapes 1 à 3 |

Les deux premières sont publiques par conception : elles identifient le
projet, et c'est RLS qui protège les données. La troisième active la
redirection vers `/connexion` pour toute page non publique. L'activer avant
que les fournisseurs soient prêts enfermerait tout le monde dehors — d'où
l'ordre.

Puis **Redeploy** depuis l'onglet Deployments : les variables ne s'appliquent
qu'au prochain build.

## Ensuite

1. Ouvrir `/connexion`, choisir **Continuer avec Google** avec le compte
   `armel.nguimbi47@gmail.com` — ou demander un lien magique à cette adresse.
2. Ouvrir `/parametres` → **Catalogue** : vos six offres, lues dans la base.

## Deux valeurs encore vides dans la base

Signalées dans `supabase/seed.sql`, à saisir quand vous les avez :

- les numéros d'inscription à la **TPS** et à la **TVQ** de l'agence (table
  `agency`, colonnes `gst_number` et `qst_number`) ;
- le **tarif préférentiel des trois premiers mois** de chaque pack SEO (table
  `offer`, colonnes `intro_price_cents` et `intro_periods`). L'écran Catalogue
  le signale en attendant.
