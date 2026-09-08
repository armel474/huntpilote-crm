repo: armel474/huntpilote-crm
branch: main

## Last sync
date: 2026-09-08T03:40:00Z

### Updated in this project
- Nouvel écran « Détail d'une priorité » (Priorite Detail.html) bâti sur les tokens de app/globals.css et le brief docs/briefs/1-1-detail-priorite.md
- Shell (nav compacte + header) aligné sur components/shell/NavSidebar.tsx et CRMHeader.tsx
- Données de la priorité dérivées de lib/data/fiche-client.ts (PRIORITIES, CLIENT)
- Nouvel écran « Détail d'une tâche » (Tache Detail.html) — brief docs/briefs/1-2-detail-tache.md, lien remontant vers la priorité
- Barre latérale rétractable partagée (hp-sidebar.jsx / hp-shell.css) portée depuis components/shell/NavSidebar.tsx

## Screen map
| Écran (projet) | Fichiers du dépôt |
|---|---|
| Tache Detail.html, td-panels.jsx, td-closure.jsx | docs/briefs/1-2-detail-tache.md, docs/decisions.md, app/globals.css, components/fiche/PanelPlan.tsx, lib/data/fiche-client.ts (TASKS, PROOFS) |
| hp-sidebar.jsx, hp-shell.css | components/shell/NavSidebar.tsx, app/globals.css |
| Priorite Detail.html, pd-panels.jsx, pd-visibility.jsx | docs/briefs/1-1-detail-priorite.md, docs/decisions.md, app/globals.css, components/shell/NavSidebar.tsx, components/shell/CRMHeader.tsx, components/ui/Atoms.tsx, components/fiche/PanelPriorites.tsx, lib/data/fiche-client.ts |
| Fiche Client v4.html, fc3-atoms.jsx, fc3-panels.jsx, fc4-panels.jsx | components/fiche/*, lib/data/fiche-client.ts |
| Workflow.html | app/workflow/WorkflowView.tsx, lib/data/workflow.ts |
| Pipeline.html | app/pipeline/PipelineView.tsx, components/pipeline/Board.tsx, lib/data/pipeline.ts |
| Dashboard.html | app/dashboard/DashboardView.tsx, components/dashboard/*, lib/data/dashboard.ts |
| Client Hub.html | app/clients/ClientHubView.tsx, components/clients/ClientCards.tsx, lib/data/clients.ts |
| Onboarding.html | app/onboarding/OnboardingView.tsx, lib/data/onboarding.ts |
| Parametres.html | app/parametres/ParametresView.tsx, lib/data/settings.ts |
