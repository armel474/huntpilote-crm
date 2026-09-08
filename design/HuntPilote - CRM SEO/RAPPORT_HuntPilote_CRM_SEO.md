# RAPPORT COMPLET — HuntPilote CRM SEO
## Application de Gestion Client et Audit Automatisé

**Date du rapport:** 4 juin 2026  
**Statut du projet:** En phase de conception (1/5 pages complétées)  
**Thème:** Moderne, épuré, professionnel | Mode clair & sombre supporté

---

## 📋 SOMMAIRE EXÉCUTIF

**HuntPilote** est une plateforme CRM spécialisée pour les agences SEO. Son objectif principal est de **centraliser la gestion des clients, automatiser les audits SEO, et fournir une visibilité complète** sur les performances et objectifs de chaque compte. L'application combine une interface intuitive avec des workflows intelligents alimentés par un agent IA.

**Phase actuelle :** Conception de l'interface utilisateur  
**Pages conçues :** 1 (Onboarding client)  
**Pages planifiées :** 5 (Dashboard, Client Hub, Pipeline, Workflow, Outil + Paramètres)

---

## 🎯 OBJECTIFS PRINCIPAUX DE L'APPLICATION

1. **Automatiser l'onboarding client** — Réduire le temps de mise en place d'un nouveau compte et centraliser les informations clients

2. **Fournir une visibilité sur la performance SEO** — Tableaux de bord en temps réel avec tracking des KPIs (trafic, mots-clés, positions)

3. **Organiser le pipeline commercial** — Vue pipeline pour suivre les prospects, hub centralisé pour les clients actifs

4. **Faciliter la collaboration d'équipe** — Workflows assignables, notes visibles par tous, agent IA pour suggestions

5. **Intégrer les sources de données clés** — Google Analytics 4, Google Search Console, Google Business Profile, Semrush

---

## 🏗️ ARCHITECTURE DE L'APPLICATION

### Structure de navigation
```
HuntPilote
├── 📊 Dashboard (accueil, vue globale)
├── 👥 Client Hub (gestion clients)
│   ├── Fiche Client (détail + audit)
│   └── Onboarding (création nouveau client) ✓ CONÇU
├── 📈 Pipeline (prospects → clients)
├── ⚡ Workflow (tâches & automations)
├── 🔧 Outil (suite d'outils SEO intégrés)
└── ⚙️ Paramètres (config compte & intégrations)
```

### Sidebar de navigation
- **Largeur fixe :** 58px (icones uniquement avec tooltips au survol)
- **Contenu :** 6 items de navigation + 1 settings
- **Design :** Épuré, minimaliste, respecte la hiérarchie visuelle
- **Thème :** Support natif du mode clair/sombre avec transitions fluides

---

## 🎨 SYSTÈME DE DESIGN ACTUEL

### Palette de couleurs — Mode Clair

| Élément | Valeur | Utilisation |
|---------|--------|------------|
| Fond principal | #F2EFEA | Arrière-plan de page |
| Fond solide | #FFFFFF | Cards, sections |
| Texte primaire | #18181B | Titres, texte fort |
| Texte secondaire | #3F3F46 | Texte moyen |
| Texte tertiaire | #71717A | Labels, hints |
| Accent primaire | #1F1F1F | Boutons, navigation active |
| Accent vert | #16A34A | Success, sélections |
| Accent bleu | #3B82F6 | Informations, secondaire |
| Accent jaune | #E5C66B | Avertissements |
| Accent rouge | #C44545 | Erreurs, danger |
| Accent violet | #7C3AED | Informations IA |

### Typographie
- **Famille :** Noto Sans (Google Font, variable 100-900)
- **Hiérarchie :** 5-6 tailles (0.5625rem à 1.75rem)

### Composants clés
- **Boutons :** btn-pri (noir), btn-out (outline), btn-icon (circulaire)
- **Inputs :** Bordure grise, focus vert, placeholder léger
- **Cards :** Fond blanc, bordure grise, ombre soft, border-radius 14px
- **Options/Toggles :** Bordure animée, état `.on` = vert
- **Labels :** Petit texte, majuscules, letter-spacing

### Effets spéciaux
- **Glassmorphism :** backdrop-filter blur(22px)
- **Gradients :** 2 blobs radiales (vert + violet)
- **Ombres :** Inset blanc + externe légère
- **Transitions :** 150-420ms selon élément

---

## 📄 PAGE CONÇUE : ONBOARDING CLIENT

### Vue d'ensemble
Formulaire wizard de **5 étapes** pour créer et configurer un nouveau compte client. C'est le point d'entrée principal pour toute nouvelle relation client.

### Layout
```
┌─────────────────────────────────────────────┐
│ Header (58px)                               │
├──────────┬────────────────────────────────┤
│ Sidebar  │ Step Rail (264px) + Contenu     │
│ (58px)   │ Footer Navigation               │
└──────────┴────────────────────────────────┘
```

### **Étape 1 : Informations de l'entreprise**
Collecte des coordonnées de base : nom, secteur, website, contact, email, téléphone, adresse.
- **Validation :** company, sector, website, contact, email requis

### **Étape 2 : Services & forfait**
Sélection des 5 modules (SEO Tech, Contenu, SEO Local, Audits, Backlinks).
- **Calcul automatique :** MRR affiché en temps réel
- **Tarifs :** 400$ à 450$/mois par service
- **Validation :** Au moins 1 service requis

### **Étape 3 : Objectifs & contexte**
- Multi-select de 6 objectifs (doubler trafic, top 3, CTR, vitesse, notoriété, leads)
- KPIs mesurables : trafic cible, mots-clés top 3, échéance (T3 2026 → T2 2027)
- Contexte & notes (textarea)

### **Étape 4 : Accès & intégrations**
Connexion optionnelle des 4 sources de données :
- Google Analytics 4 (orange #E8710A)
- Google Search Console (bleu #4285F4)
- Google Business Profile (vert #34A853)
- Semrush (orange #FF642D)

### **Étape 5 : Récapitulatif**
Vérification complète avant création :
- Carte client (initiales avatar, secteur, MRR)
- Coordonnées et prestation
- Intégrations connectées
- Info AI (audit auto lancé, fiche générée)

### Écran de succès
- Icon check vert
- Message confirmation + lancement audit IA
- CTAs : retour Client Hub ou ouvrir fiche client

---

## 🔧 COMPOSANTS TECHNIQUES INTÉGRÉS

### Stack
- React 18.3.1, ReactDOM 18.3.1, Babel 7.29.0
- CSS personnalisé (variables CSS, flexbox, grid)

### Fonctionnalités JS
- **Theme switcher** : localStorage persistence
- **Form validation** : progression par étape
- **Calculs temps réel** : MRR automatique
- **Navigation wizard** : step tracking, maxReached logic
- **Navigation inter-pages** : liens Dashboard, Client Hub

### État form
```javascript
{
  company: '', sector: '', website: '', contact: '', email: '',
  phone: '', address: '',
  services: [], goals: [], kpiTraffic: '', kpiKeywords: '', 
  deadline: '', context: '', integrations: []
}
```

---

## 🎬 PAGES PLANIFIÉES

### 1. **Dashboard** — Accueil principal
- KPIs globaux (MRR total, # clients, trafic moyen, leads)
- Clients récents
- Audits en cours
- Alerts & actions
- Graphiques (trafic vs objectif, évolution MRR, distribution secteurs)

### 2. **Client Hub** — Gestion centralisée
- Barre recherche + filtres (secteur, MRR, status, objectifs)
- List/Grid view (toggleable)
- Tableau : Nom | Secteur | MRR | Status | KPIs | Dernière modif | Actions
- Fiche client détaillée (sous-page)

### 3. **Pipeline** — Prospects → Clients (Kanban)
- Colonnes : À contacter | Devis envoyé | Négociation | Signé | Perdu
- Drag-drop entre colonnes
- Actions : édition inline, quick-add

### 4. **Workflow** — Automations & tâches
- Mes tâches (assignées + due date)
- Workflows templates (audits, alertes, rapports)
- Builder simple (trigger → action → cible)
- Historique exécutions + logs IA

### 5. **Outil** — Suite d'outils SEO
- Analyse technique (crawl, Core Web Vitals, indexation)
- Tracking positions (suivi mots-clés)
- Competitor spy (Semrush API)
- Report builder (générer PDF)
- AI Assistant (chat analyses ad-hoc)

### 6. **Paramètres** — Configuration compte
- Profil agence (nom, logo, spécialisations)
- Équipe (ajouter/gérer users, roles)
- Intégrations (connecter sources)
- Facuration (plan, historique, paiements)
- Préférences (langue, timezone, notifications, theme)

---

## 💡 SUGGESTIONS POUR LA SUITE

### Phase 1 (Court terme)
1. **Finir Dashboard** — Wireframe KPIs, intégrer Chart.js/Recharts, créer composants réutilisables
2. **Designer Client Hub** — Tableau clients, filtres/recherche, drawer détails rapides
3. **Créer Fiche Client détaillée** — Infos, audit dernier, KPIs tracking, timeline, actions
4. **Intégrer Pipeline (Kanban)** — Colonnes d'étapes, cards drag-drop

### Phase 2 (Moyen terme)
5. **Builder Workflow** — Drag-drop interface, conditions, actions
6. **Outil Suite** — Commencer par "Analyse technique", intégrer GSC API
7. **Paramètres complets** — Gestion équipe (roles), intégrations (OAuth), facturation

### Phase 3 (Long terme)
8. **Agent IA avancé** — Chat contextuel, suggestions optimisations, rapports auto
9. **Mobile responsiveness** — Collapse sidebar tablette, app mobile si besoin
10. **Export & intégrations** — PDF rapports, Slack notifications, Zapier

---

## 📐 COMPOSANTS RÉUTILISABLES À CRÉER

Extraire en composants React pour cohérence et productivité :

```
components/
├── Button.jsx          // btn-pri, btn-out, btn-icon variants
├── Input.jsx           // label, hint, validation states
├── Card.jsx            // card base (light/dark aware)
├── Select.jsx          // dropdown avec option groups
├── Checkbox.jsx        // toggle checkbox
├── Badge.jsx           // status badges (actif, pause, etc)
├── Avatar.jsx          // initials + couleur
├── KPICard.jsx         // métrique + trend
├── ClientCard.jsx      // mini fiche client
├── Modal.jsx           // dialogue réutilisable
├── Stepper.jsx         // wizard navigation
└── ThemeToggle.jsx     // light/dark switcher
```

---

## 🎨 SYSTÈME DE DESIGN À ENRICHIR

### Harmonisation couleurs
- Créer 3-4 variations de couleurs pour chaque secteur (tech, e-commerce, santé, etc)
- Utiliser okLCh pour harmonies de couleurs cohérentes
- Documenter palette pour chaque status client

### Typographie enrichie
- Créer des styles `.headline-1` à `.body-3` réutilisables
- Ajouter `.mono` pour données chiffrées
- Tailles réactives (clamp) pour mobile

### Système d'espacement
- Créer scale : 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- Utiliser `gap` flex/grid systématiquement (pas de margins)

### Iconographie
- Créer set 40+ icones cohérentes (HeroIcons ou Feather)
- Standardiser tailles : 16px (small), 20px (default), 24px (large)

### États d'interaction
- Hover, focus, active, disabled, loading pour tous les composants
- Documenter dans Storybook ou design system wiki

---

## 📊 DONNÉES & INTÉGRATIONS

### Structure client
```javascript
{
  id, name, sector, website, contact, email, phone, address,
  mrr, services[], goals[], kpiTraffic, kpiKeywords, deadline,
  context, integrations[], status, createdAt, updatedAt,
  auditStatus, lastAuditDate, auditResults {}
}
```

### Intégrations à implémenter
- **Google APIs :** OAuth 2.0, Analytics Reporting API v4, Search Console API
- **Semrush :** API REST pour positions, domaines, concurrence
- **Zapier/Make :** Webhooks pour automations externes
- **Stripe :** Facturation & abonnements

---

## 🚀 PROCHAINES ÉTAPES RECOMMANDÉES

1. **Valider le wireframe global** — Montrer architecture à clients/stakeholders
2. **Créer design system complet** — Composants UI, tokens, documentation
3. **Builder Dashboard** — Point d'entrée principal, définit tone & rhythm
4. **Prototyper interactions clés** — Navigation, filtres, drag-drop
5. **Documenter API contracts** — Décider backend structure, formats de réponse
6. **Setup infrastructure frontend** — Project structure, build process, tests

---

## 📝 NOTES FINALES

**Force du projet :** Design épuré, système cohérent, focus sur UX. Onboarding wizard bien pensé avec étapes logiques et validation progressive.

**Points à surveiller :**
- Éviter surcharge d'informations sur Dashboard
- Tester usabilité pipeline Kanban sur larges datasets (100+ prospects)
- Assurer performance chargement données client (lazy loading si besoin)
- Planifier mobile early (responsive design dès le début)

**À discuter :**
- Budget pour intégrations API (GSC, Analytics, Semrush)
- Équipe backend (Node/Python pour agent IA)
- Infrastructure (hosting, DB, cache)
- Roadmap priorités : MVP minimal ou features complètes dès v1

---

**Rapport généré le:** 4 juin 2026  
**Auteur:** Design Team  
**Version:** 1.0