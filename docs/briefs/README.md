# Séquence de conception — 21 sessions Claude Design

Un fichier par session. Ouvre le fichier, copie tout son contenu, colle-le dans
une session Claude Design du projet *HuntPilote - CRM SEO*.

**Depuis la phase 2, colle deux fichiers : le brief et
[`socle-partage.md`](socle-partage.md).** Ce second fichier liste ce qui est déjà
implémenté et se réutilise. Sans lui, chaque session redessine ce qui existe sous
un nouveau nom — c'est arrivé trois fois en phase 1.

**Une session = un prompt = un ou deux écrans.** Ne fusionne pas deux briefs dans
la même session : au-delà de deux écrans, la qualité du détail chute et le shell
commence à dériver d'un écran à l'autre.

Le cadrage de fond — les treize décisions, les trois règles spécifiées et les
cinq conventions d'interface — vit
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

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 1.1 | Détail d'une priorité | [`1-1-detail-priorite.md`](1-1-detail-priorite.md) | ✅ intégré |
| 1.2 | Détail d'une tâche | [`1-2-detail-tache.md`](1-2-detail-tache.md) | ✅ intégré |
| 1.3 | Éditeur de rapport · rapport partageable | [`1-3-rapport.md`](1-3-rapport.md) | ✅ intégré |
| 1.4 | Détail d'audit · comparaison d'audits | [`1-4-audits.md`](1-4-audits.md) | ✅ intégré |

> **Commence par 1.1 seule.** C'est l'écran le plus chargé en logique et celui
> dont les deux suivants héritent. Valide-le avant d'enchaîner.

**Phase 1 terminée et intégrée.** Les six écrans sont en ligne dans
l'application, reliés à la fiche client : le bouton « Détail » d'une priorité,
« Voir détail » d'une tâche, « Ouvrir l'éditeur » d'un rapport et « Voir le
détail » d'un audit mènent désormais quelque part. Deux conventions nées de cette
phase ont été promues dans [`../decisions.md`](../decisions.md) : *une seule
action principale par écran, en vert plein* et *une mesure s'affiche toujours
avec son seuil*.

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

## Ce que la phase 1 a changé dans la suite du plan

Six écrans livrés, et trois conséquences sur les briefs qui restent.

**Des sessions sont devenues plus légères.** Elles gardent leur place dans la
séquence, mais une partie de leur contenu est déjà acquise :

| Session | Ce qui n'est plus à concevoir |
|---|---|
| 2.2 Site Audit | Le score pondéré appartient à l'écran d'audit ; la ligne de constat existe |
| 4.1 Vues transversales | Les détails de tâche et de priorité existent — ce sont deux listes filtrantes |
| 4.2 Rapports à produire | L'éditeur et ses six états existent — c'est la liste du portefeuille |
| 5.1 Portail · tableau de bord | Le corps du rapport existe et se reprend tel quel |
| 5.2 Portail · ses rapports | « Ouvrir un rapport » réutilise la même page |

**Des frontières ont été écrites** là où deux écrans risquaient de raconter la
même chose avec un vocabulaire différent : Site Audit contre détail d'audit,
section locale contre dimension *présence en ligne*, portail contre rapport
publié. Chaque brief concerné porte maintenant sa section « frontière ».

**Deux conventions se sont imposées** et sont remontées dans `decisions.md` :
une seule action principale verte par écran, et une mesure ne s'affiche jamais
sans son seuil.

### Un arbitrage à faire, si tu veux

La 4.1 — *mon plan de travail* et *priorités transversales* — est devenue bien
moins chère qu'au moment où le plan a été écrit : ses deux écrans n'ont plus qu'à
lister, trier et filtrer des objets qui existent tous. Ce sont aussi les écrans
qu'on ouvre le matin.

La remonter juste après la phase 2 donnerait un cockpit utilisable au quotidien
plus tôt, au prix de repousser le SEO local d'une phase. À toi de voir selon
qu'un client local est en attente ou non — ce n'est pas une question de
conception.

---

## Comment travailler chaque session

1. **Colle le brief et `socle-partage.md`** dans une session Claude Design du
   projet.
2. **Laisse-le produire**, puis regarde d'abord si le shell est intact — barre
   latérale, header, palette — et si les classes du socle ont été reprises plutôt
   que recréées sous un nouveau nom. Une dérive se corrige tout de suite, pas
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
