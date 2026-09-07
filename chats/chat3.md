# Fiche client HuntPilot

_Started 2026-05-27 03:00 UTC_

---

## User

La capture d'écran ici, c'est l'une des inspirations que j'ai trouvées sur ce à quoi pourrait ressembler une fiche client. C'est l'un des points les plus essentiels de ce CRM aussi. L'image de référence me permet de visualiser un petit peu la disposition des différentes informations. Certes, ça a inspiré un CRM existant qui s'appelle Bloom, mais je voudrais l'adapter pour HuntPilot.

Ici, il faudra certainement rajouter des éléments SEO pour notre fiche client. Une autre des particularités que nous n'avons pas encore abordées est le fait que notre CRM nous permettrait de faire des audits. Il faudra certainement inclure un bouton qui dirigerait vers les audits.
Bref, dis-moi ce que tu penses de cette idée et propose-moi quelque chose, ou propose-moi plusieurs modèles, et je verrai ce qui me correspond le mieux.

## Assistant

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: view_image]_

_[tool: read_file]_

_[tool: read_file]_

Laisse-moi d'abord finir de lire le code existant pour bien suivre le vocabulaire visuel, puis je te proposerai plusieurs variations de fiche client.

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: update_todos]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: write_file]_

OK — j'ai tout ce qu'il me faut. Je construis maintenant 3 directions de fiche client, chacune dans un artboard côte à côte.

_[tool: done]_

_[tool: fork_verifier_agent]_

Voilà — **3 directions de fiche client** pour HuntPilot, toutes interactives. Tu peux cliquer sur les onglets et la navigation latérale dans chaque artboard. Double-clique sur un artboard pour le voir en plein écran.

---

**A — Trois colonnes · Bloom-inspired**
La plus proche de ta référence. Infos client à gauche, contenu tabué au centre (Aperçu / Tâches / Audits / Rapports / Facturation), modules + activité à droite. Le bouton **Lancer un Audit** ancré en bas du panneau gauche.

**B — Hero panoramique + 2 colonnes**
Header sombre pleine largeur avec le nom, le statut et le bouton **Lancer un Audit** bien visible. Strip de 6 KPIs SEO en dessous. En bas : infos + score SEO à gauche, contenu tabué à droite. Plus impactant visuellement.

**C — Sidebar minimaliste + Centre plein**
Sidebar gauche avec identité, score SEO circulaire et navigation par section (SEO / Audits / Tâches / Backlinks / Facturation). Centre entier dédié au contenu. **Lancer un Audit** dans la barre de titre. Plus moderne et orienté "outil" plutôt que CRM.

---

Dans les 3 cas, tu retrouves :
- Le **Score Santé SEO** en jauge circulaire
- Les **KPIs SEO** (mots-clés, sessions, CTR, visibilité, pages, backlinks)
- Le **tableau de top mots-clés** avec positions et deltas
- Le **graphique de trafic** organique
- Les **audits** avec historique + bouton de lancement
- Les **tâches** et l'**activité** récente

Dis-moi quelle direction te parle le plus — on peut ensuite mixer des éléments, pousser le détail, ou attaquer l'écran suivant.

## User

<system-info comment="Only acknowledge these if relevant">
User is viewing file: Fiche Client.html
Current date is now May 27, 2026
</system-info>

<attached_files>
- uploads/20260527_003655.jpg
</attached_files>

<pasted_text name="Pasted text (20 lines)">
Pour approfondir un peu plus notre design, d'abord, c'est l'option A qui m'intéresse le plus. Je le trouve beaucoup plus adapté pour ce que j'essaie de faire.
Comme tu peux le voir dans le croquis que je viens de t'envoyer, je voudrais ajouter certains éléments et certains KPI pour te donner plus de contexte.
Mon CRM va inclure des LLM et des agents IA. L'objectif de ces agents IA va être de faire des audits et faire de la veille sur le site des clients. Ces agents IA pourront voir tout ce qui va bien sur le site (les performances et tout le reste) et tout ce qui ne va pas, comme :
- la perte de position
- les liens brisés
- un SEO technique défaillant
- tous les autres défauts qu'il pourra trouver
- les baisses de performance
L'agent IA viendra faire ce travail-là en arrière-plan. Ce que j'essaie d'ajouter, c'est une manière de visualiser tout le travail qui va être fait en arrière-plan.
Comme tu peux le voir déjà sur la première colonne, j'ai rajouté un emplacement pour le contexte et l'objectif du projet. Ici, on retrouve bien sûr le contexte du projet : quels sont les objectifs du client, ce genre de choses.
Dans la troisième colonne, j'ai rajouté un espace pour que nous puissions garder quelques informations sur les concurrents directs du client. Ici, j'ai arbitrairement décidé qu'on n'afficherait que trois concurrents. On pourrait avoir une barre en dessous du nom de chacun des concurrents qui montre leur trafic comparé à celui du client.
L'ajout majeur se trouve dans la colonne du milieu. Déjà, on peut voir qu'il y a une grande carte pour l'analyse et le rapport IA. C'est ici que notre agent nous fera un rapport de ce qui se passe avec le site du client. Il listera les points positifs et les points négatifs, et juste à côté, nous avons une carte pour les prochaines actions à effectuer.
Ici, je veux trois niveaux :
- les actions critiques
- les actions importantes
- les opportunités
Idéalement, il faudrait peut-être ajouter des petits boutons pour permettre de développer chacune des actions. On pourrait avoir un indicateur du nombre de tâches à faire dans chacune des prochaines actions et avoir un petit bouton qui nous mènerait vers une page qui détaille toutes ces actions. Peut-être que ça pourrait juste être un seul bouton qui nous amènerait vers une page qui détaille toutes les actions, que ce soit critiques, importantes ou des opportunités.
En dessous, j'ai inclus une carte qui fait la charge complète de la colonne du milieu. Ici, nous avons la santé technique du site, donc un peu comme les données que nous pouvons avoir avec Google PageSpeed Inside. Ici, sera affichée la santé technique du site. Si tu as besoin de plus de contexte, tu peux me poser des questions à ce niveau-là.
Une fois que nous aurons rajouté ça, tu peux rajouter les KPIs que tu as déjà proposés dans l'option A. Je pense qu'avec ça, nous aurons une fiche client des plus merveilleuse.
Ah, j'allais oublier : dans la petite barre des tâches en haut, où tu as mis « Aperçu », « Tâche », « Audit », « Rapport » et « Facturation », je voudrais rajouter un onglet « Problèmes ». On pourrait directement cliquer ici pour accéder aux différentes choses qui ne fonctionnent pas sur le site, un petit peu comme un raccourci pour accéder aux prochaines actions pratiques qui montrent ce qui ne marche pas et ce que nous pouvons améliorer.
</pasted_text>

## Assistant

_[tool: update_todos]_

Excellent croquis, très clair. Je vois exactement la structure. Je vais créer une **v2 standalone** de la direction A avec toutes tes additions :

- Colonne gauche : **Contexte & Objectif**
- Centre : **Rapport IA** + **Prochaines Actions** côte à côte, puis **Santé Technique**, puis les KPIs
- Colonne droite : **Concurrence** avec barres comparatives
- Nouvel onglet **Problèmes**

_[tool: write_file]_

Je construis maintenant la version finale de la fiche client A avec toutes tes additions.

_[tool: done]_

_[tool: fork_verifier_agent]_

Voici ce qui a été livré dans la **Fiche Client v2** :

---

**Colonne gauche**
- Identité, contact, services actifs
- **Contexte & Objectif** — texte de mission + 3 objectifs en badges (Trafic ×2, Top 3 KW, CTR +50%)
- Score Santé SEO (jauge circulaire)
- Bouton **Lancer un Audit** ancré en bas

**Centre — onglet Aperçu**
- **Rapport IA** (accent violet) — résumé + "Ce qui va bien" (vert) / "Ce qui va mal" (rouge), côte à côte avec les **Prochaines Actions** (Critique / Important / Opportunité) — cliquables pour déplier, bouton → vers l'onglet Problèmes
- **Santé Technique** — 4 mini-jauges : Vitesse (56), On-page (85), Backlinks (71), SEO Tech. (100)
- KPIs SEO, graphique trafic, tableau mots-clés

**Centre — onglet Problèmes** *(nouveau)*
- Header agent IA actif avec badge de surveillance
- Filtre : Tous / Critique / Important / Opportunité
- Liste de tous les problèmes avec niveau de sévérité, statut et bouton "Assigner"
- Badge rouge sur l'onglet indique les **3 critiques** non résolus

**Colonne droite**
- Modules inclus
- **Concurrence** — 3 compétiteurs avec barre comparative et ligne de référence verte (votre trafic)
- Activité récente, prochaine action

---

Dis-moi ce que tu voudrais ajuster ou quelle section approfondir ensuite.

