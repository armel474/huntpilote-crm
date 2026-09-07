# Chat

_Started 2026-06-13 01:58 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "HuntPilote - CRM SEO"
Project currently has 13 file(s)
User is viewing file: RAPPORT_HuntPilote_CRM_SEO.md
Current date is now June 12, 2026
</system-info>

<default aesthetic_system_instructions>
The user has not attached a design system. If they have ALSO not attached references or art direction, and the project is empty, you must ASK the user what visual aesthetic they want. Use the questions_v2 tool to ask about preferred vibe, audience, colors, type, mood, etc. Do NOT just pick your own visual aesthetic without getting the user's aesthetic input -- this is how you get slop!

Once answered, use this guidance when creating designs:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic_system_instructions>

<attached_files>
- uploads/PRD UX - Fiche Client HuntPilote V0.1
</attached_files>

<pasted_text name="Pasted text (38 lines)">
Tu vas concevoir uniquement l’interface utilisateur de la page **Fiche Client HuntPilote V0.1** pour une application desktop de type cockpit d’agence web/SEO.

Important : tu ne dois pas générer de backend, de schéma de base de données, de logique API, de code métier, de modèle de données technique ni d’architecture logicielle. Ton rôle est uniquement de concevoir des écrans, des composants d’interface, des variantes d’états UX, une hiérarchie visuelle claire et une expérience utilisateur cohérente.

HuntPilote est un outil interne qui centralise la gestion client, les diagnostics SEO, les priorités, les tâches, les rapports et le suivi commercial léger. L’objectif de cette page n’est pas de créer un CRM générique, mais un cockpit de livraison client qui permet à DigiHunt de comprendre rapidement l’état d’un client, de voir les priorités SEO, de suivre les actions en cours et de préparer les rapports client.

Conserve la direction visuelle existante : interface sombre, premium, dense, professionnelle, avec accent vert, panneaux latéraux et logique cockpit. Améliore cependant la hiérarchie, la lisibilité et la clarté métier. Ne surcharge pas la page avec des métriques décoratives. Chaque bloc affiché doit aider l’utilisateur à comprendre, prioriser ou agir.

La fiche client doit être structurée visuellement en trois zones :

1. Une colonne gauche de contexte client ;
2. Une zone centrale avec navigation par onglets ;
3. Un panneau droit d’intelligence continue et de contexte.

Les onglets à prévoir dans l’interface sont : **Aperçu**, **Priorités SEO**, **Plan d’action**, **Diagnostics**, **Rapports client**, **Contrat**.

Pour cette itération, concentre-toi principalement sur **l’architecture complète de la fiche client** et sur le design détaillé de l’onglet **Aperçu**. Les autres onglets doivent être visibles dans la navigation, mais ne doivent pas tous être développés en profondeur maintenant.

L’onglet **Aperçu** doit permettre de comprendre l’état du client en moins de 30 secondes. Il doit afficher une synthèse courte, un score de santé client, l’objectif principal, quelques KPIs essentiels, les priorités ouvertes, le plan d’action en cours, les dernières preuves de valeur et une tendance de trafic simple.

Prévois aussi des actions visibles dans l’interface, sous forme de boutons ou raccourcis UX : **lancer un diagnostic**, **assigner une priorité**, **créer une tâche**, **générer le rapport client**. Ces actions doivent être représentées visuellement, mais ne nécessitent aucune logique fonctionnelle réelle.

Prévois des variantes ou annotations UX pour les états suivants : client actif complet, client en onboarding, client sans intégrations SEO, audit en cours, données obsolètes, aucune priorité critique, erreur partielle de chargement. Ces états servent uniquement à guider le design d’interface, pas à définir une logique backend.

Respecte les règles UX suivantes :

- Une priorité doit sembler pouvoir être transformée en tâche dans l’interface ;
- Une tâche terminée doit pouvoir être valorisée comme preuve de travail ;
- Un rapport client doit sembler pouvoir réutiliser les actions et preuves visibles ;
- Les synthèses assistées par IA doivent rester courtes, crédibles et liées aux signaux affichés ;
- Les boutons doivent utiliser des libellés concrets en français ;
- L’interface doit être dense mais lisible ;
- Les statuts ne doivent pas dépendre uniquement de la couleur.

Évite absolument : la facturation avancée, le builder d’automatisations complet, les permissions complexes, les écrans de configuration technique, les schémas de données, les API, le code, les structures backend et les effets visuels décoratifs.

Le résultat attendu est une interface desktop claire, premium et exploitable, qui donne envie de gérer réellement des clients SEO au quotidien. Elle doit être belle, mais surtout crédible comme outil de travail.

</pasted_text>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: read_skill_prompt]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: update_todos]_

_[tool: write_file]_

Je commence la construction ! J'ai tout le contexte nécessaire du PRD et des fichiers existants.

_[tool: update_todos]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: save_screenshot]_

_[tool: multi_screenshot]_

L'interface est en ligne et fonctionne parfaitement. Laissez-moi capturer quelques états supplémentaires pour vous montrer l'ensemble des variations.

_[tool: update_todos]_

_[tool: snip]_

La **Fiche Client HuntPilote V0.1** est livrée — `Fiche Client v3.html`. Voici ce qui a été construit :

---

**Architecture 3 colonnes**
- **Gauche** — identité client, contact, modules actifs, contrat léger
- **Centre** — barre d'actions persistante + 6 onglets + contenu scrollable
- **Droite** — prochaine action, concurrents, activité récente

**Onglet Aperçu (détaillé)**
- Bannière IA violette (Synthèse HuntPilote + 3 signaux)
- Jauge de santé + objectif principal + progression + modules actifs
- 5 KPIs essentiels (sessions, top 10, CTR, indexation, backlinks)
- Priorités ouvertes actionnables + plan en cours côte à côte
- Preuves de valeur + sparkline trafic

**4 actions persistantes**
`Lancer un diagnostic` · `Assigner une priorité` · `Créer une tâche` · `Générer le rapport client`

**7 états UX** (sélecteur en haut à droite)
Client actif · Onboarding · Sans intégrations · Audit en cours · Données obsolètes · Aucune priorité critique · Erreur partielle

**Autres onglets** fonctionnels : Priorités SEO (avec filtres + "Assigner au plan d'action"), Plan d'action, Diagnostics, Rapports client, Contrat.

---

**Prochaines itérations possibles (selon PRD section 23)**
- V0.2 : Priorités SEO + Plan d'action approfondis — lien problème → tâche → preuve
- V0.3 : Diagnostics avec comparaison historique + Rapports avec sections éditables + Contrat

