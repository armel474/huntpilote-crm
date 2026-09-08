# Séquence de conception — 21 sessions Claude Design

Un fichier par session. Ouvre le fichier, copie tout son contenu, colle-le dans
une session Claude Design du projet *HuntPilote - CRM SEO*. Chaque brief est
autonome : il rappelle le contexte nécessaire, tu n'as rien à ajouter.

**Une session = un prompt = un ou deux écrans.** Ne fusionne pas deux briefs dans
la même session : au-delà de deux écrans, la qualité du détail chute et le shell
commence à dériver d'un écran à l'autre.

Le cadrage de fond — les treize décisions et les trois règles spécifiées — vit
dans [`../decisions.md`](../decisions.md). Les briefs en reprennent ce qui les
concerne ; en cas de doute, `decisions.md` fait foi.

---

## L'ordre, et pourquoi

La séquence n'est pas arbitraire. Chaque phase produit les objets dont la
suivante a besoin.

### Phase 1 — Fermer la boucle de livraison

Rien ne sert d'ajouter des outils tant que le cockpit ne sait pas transformer une
donnée en travail. Ces quatre sessions relient audit, priorité, tâche, preuve et
rapport.

| Session | Écrans | Fichier |
|---|---|---|
| 1.1 | Détail d'une priorité | [`1-1-detail-priorite.md`](1-1-detail-priorite.md) |
| 1.2 | Détail d'une tâche | [`1-2-detail-tache.md`](1-2-detail-tache.md) |
| 1.3 | Éditeur de rapport · rapport partageable | [`1-3-rapport.md`](1-3-rapport.md) |
| 1.4 | Détail d'audit · comparaison d'audits | [`1-4-audits.md`](1-4-audits.md) |

> **Commence par 1.1 seule.** C'est l'écran le plus chargé en logique et celui
> dont les deux suivants héritent. Valide-le avant d'enchaîner.

### Phase 2 — Les outils

La valeur ajoutée du produit. La session 2.1 est la plus importante de toute la
séquence : elle définit un cadre réutilisé par sept écrans.

| Session | Écrans | Fichier |
|---|---|---|
| 2.1 | Cadre commun des outils | [`2-1-cadre-outils.md`](2-1-cadre-outils.md) |
| 2.2 | Site Audit | [`2-2-site-audit.md`](2-2-site-audit.md) |
| 2.3 | Position Tracking · Backlink Analyse | [`2-3-positions-backlinks.md`](2-3-positions-backlinks.md) |
| 2.4 | Keyword Hunter · Keyword Gap | [`2-4-mots-cles.md`](2-4-mots-cles.md) |
| 2.5 | Organic Research · Domain Overview | [`2-5-prospection.md`](2-5-prospection.md) |
| 2.6 | Suivi de consommation | [`2-6-consommation.md`](2-6-consommation.md) |

> **2.1 avant tout le reste**, sans exception. Si le cadre change après avoir
> dessiné trois outils, tu redessines trois outils.

### Phase 3 — SEO local

Une section complète, au même niveau que les outils.

| Session | Écrans | Fichier |
|---|---|---|
| 3.1 | Vue d'ensemble · fiche d'établissement | [`3-1-local-etablissement.md`](3-1-local-etablissement.md) |
| 3.2 | Avis · citations et annuaires | [`3-2-avis-citations.md`](3-2-avis-citations.md) |
| 3.3 | Positions locales · concurrence locale | [`3-3-positions-locales.md`](3-3-positions-locales.md) |

### Phase 4 — Le quotidien de l'agence

Les vues transversales, et les éditeurs manquants des écrans déjà livrés.

| Session | Écrans | Fichier |
|---|---|---|
| 4.1 | Mon plan de travail · priorités transversales | [`4-1-vues-transversales.md`](4-1-vues-transversales.md) |
| 4.2 | Agenda · rapports à produire | [`4-2-agenda-rapports.md`](4-2-agenda-rapports.md) |
| 4.3 | Recherche globale · notifications | [`4-3-recherche-notifications.md`](4-3-recherche-notifications.md) |
| 4.4 | Détail de deal · éditeur d'automatisation | [`4-4-deal-automatisation.md`](4-4-deal-automatisation.md) |

### Phase 5 — Le portail client

Ce que voit le client. Dépend du rapport conçu en 1.3.

| Session | Écrans | Fichier |
|---|---|---|
| 5.1 | Connexion · tableau de bord client | [`5-1-portail-accueil.md`](5-1-portail-accueil.md) |
| 5.2 | Ses rapports · échanges | [`5-2-portail-rapports.md`](5-2-portail-rapports.md) |

### Phase 6 — Contenu et socle

| Session | Écrans | Fichier |
|---|---|---|
| 6.1 | Calendrier éditorial · brief d'article | [`6-1-contenu.md`](6-1-contenu.md) |
| 6.2 | Connexion agence · états système | [`6-2-socle.md`](6-2-socle.md) |

---

## Comment travailler chaque session

1. **Colle le brief** dans une session Claude Design du projet.
2. **Laisse-le produire**, puis regarde d'abord si le shell est intact — barre
   latérale, header, palette. Une dérive du shell se corrige tout de suite, pas
   trois écrans plus tard.
3. **Vérifie les états** listés en fin de brief. C'est là que les maquettes sont
   habituellement incomplètes, et c'est ce qui coûte le plus cher à rattraper.
4. **Reviens me voir** avec le fichier HTML : j'implémente, je vérifie au
   navigateur en thème clair et sombre, je commite.

## Quand un brief ne suffit plus

Si en cours de session tu découvres qu'une décision manque — un état non prévu,
une interaction ambiguë —, ne laisse pas Claude Design trancher seul. Note la
question, termine l'écran sans elle, et remonte-la : elle a probablement des
conséquences sur d'autres écrans que celui en cours.
