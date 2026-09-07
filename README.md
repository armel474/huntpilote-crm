# HuntPilote — CRM SEO

Cockpit de livraison client pour agence web et SEO : gestion client,
diagnostics, priorités, plan d'action, rapports et suivi commercial.

Implémentation des maquettes conçues dans Claude Design. Le bundle de handoff
d'origine est conservé sous `project/` (prototypes HTML) et `chats/`
(transcriptions des sessions de design) comme référence visuelle.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- CSS en variables natives — aucun framework utilitaire, pour rester fidèle
  au rendu des maquettes
- `output: 'standalone'` : le build produit un serveur Node autonome,
  déployable sur un VPS sans dépendance à Vercel

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

Autres scripts : `npm run build`, `npm start`, `npm run lint`,
`npm run typecheck`.

## Écrans

| Route | Écran |
|---|---|
| `/dashboard` | Vue d'ensemble : trafic, performance client, revenu, tâches |
| `/clients` | Client Hub — cartes client et prospect, grille ou liste |
| `/clients/[id]` | Fiche client — 6 onglets, colonnes contexte et intelligence |
| `/pipeline` | Kanban commercial à 5 étapes, glisser-déposer |
| `/workflow` | Automatisations « Quand → Alors » |
| `/onboarding` | Assistant de création client en 5 étapes |
| `/parametres` | Agence, équipe, intégrations, notifications, abonnement |
| `/agenda`, `/outils` | Non encore conçus — écrans d'attente |

## Structure

```
app/                 routes et vues de page
components/
  shell/             sidebar, header, thème, coquille applicative
  ui/                icônes et atomes partagés (jauges, badges, sparkline)
  dashboard/ clients/ fiche/ pipeline/   composants par écran
lib/data/            données de démonstration, une source par écran
```

## Design system

Les tokens sont définis dans `app/globals.css`, en deux thèmes (clair et
sombre) pilotés par l'attribut `data-theme` sur `<html>`. Le thème est
persisté dans `localStorage` et appliqué avant le premier paint pour éviter
tout flash.

Deux points hérités des maquettes valent d'être connus :

- Le `backdrop-filter` est toujours porté par un pseudo-élément `::before`
  placé derrière le contenu, jamais par le conteneur lui-même — sinon le
  compositing GPU rend le texte flou.
- Les transitions de couleur ne sont actives que pendant la bascule de
  thème, via un attribut temporaire, pour ne pas interférer avec les autres
  animations de l'interface.

La police Consolas présente dans le bundle de handoff n'est pas redistribuée
(licence propriétaire) : la pile mono système la remplace.

## Données

Les écrans consomment des données de démonstration typées, regroupées dans
`lib/data/`. Aucun backend n'est branché à ce stade — c'est le périmètre
retenu pour cette itération.

Les intégrations prévues (DataForSEO, Google Analytics 4, Search Console,
Business Profile) passeront par des Route Handlers sous `app/api/`, afin que
les clés d'API et les jetons OAuth restent côté serveur.

## Déploiement sur VPS

```bash
npm ci
npm run build
```

Le build écrit un serveur autonome dans `.next/standalone`. Copier sur le
serveur `.next/standalone`, `.next/static` (vers `.next/standalone/.next/static`)
et `public`, puis lancer :

```bash
node .next/standalone/server.js   # écoute sur PORT, 3000 par défaut
```

À placer derrière Nginx en proxy inverse, avec PM2 ou une unité systemd pour
la supervision.
