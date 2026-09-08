# Décisions de conception — HuntPilote

Source de vérité pour toute session de design ou de développement sur ce projet.
Treize arbitrages tranchés, plus trois règles qui demandent une spécification.

Le plan complet — inventaire des écrans, boucles métier, modèle de données et
feuille de route — vit dans un artifact séparé et reste la vue d'ensemble.

---

## Cadre du produit

HuntPilote est un **cockpit de livraison client** pour une agence web et SEO
québécoise, pas un CRM générique. Interface en français, montants en dollars
canadiens. L'application sert d'abord l'agence ; le portail sert le client final.

**La thèse du produit est la boucle de livraison :**

```
Audit → Priorité → Tâche → Preuve de valeur → Rapport client → (audit suivant)
```

Chaque étape produit la matière de la suivante. Le rapport mensuel n'est pas un
document à rédiger : c'est la sortie naturelle du travail déjà fait. Tant que ces
cinq objets ne se référencent pas réellement, la fiche client reste un tableau de
bord au lieu d'être un outil de travail.

---

## Les treize décisions

### 1. Stack et déploiement

Next.js 15 (App Router) + TypeScript, `output: 'standalone'`. Déploiement sur VPS
privé derrière Nginx, pas sur Vercel. Les intégrations passent par des Route
Handlers pour que les clés et les jetons OAuth restent côté serveur.

### 2. Un seul design system, clair et sombre

La palette de la maquette *Fiche Client v2* fait référence pour toute
l'application : base beige `#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED`
réservé à l'IA, et le langage de sévérité critique / important / opportunité. La
direction sombre-only de la v3 n'est pas retenue — elle aurait isolé un écran dans
une autre famille visuelle et fait perdre la bascule de thème.

### 3. Les outils sont rattachés à un client, avec sélecteur

Le cadre commun des outils porte un sélecteur en tête, qui pré-remplit le domaine
et mémorise le dernier compte consulté. **Les prospects doivent y figurer**, sinon
Domain Overview et Organic Research perdent leur usage commercial. Chaque résultat
peut être enregistré dans la fiche, et chaque ligne transformée en priorité.

### 4. Le portail client est au périmètre

Le rapport se conçoit donc comme une **page web dès le départ**, jamais comme un
PDF qu'on adapterait après coup. Le lien partageable arrive tôt et sert de galop
d'essai ; le portail complet suit.

### 5. Le portail montre les problèmes, sous contrôle

Le client voit ce sur quoi on travaille, pas l'inventaire de ses défauts.
Voir la règle 1 ci-dessous.

### 6. Le portail est figé à la publication du rapport

Pas de direct au départ. Le portail lit une **version publiée** du rapport, pas la
base vivante — c'est ce qui rendra le passage en direct possible plus tard sans
tout reprendre. Le rapport publié est donc un instantané versionné.

### 7. Le contenu est un livrable, le module vient plus tard

Les articles de blog sont déjà vendus dans le forfait : les tâches de type contenu
sont traçables dès maintenant et les articles publiés comptent comme preuves de
valeur. Le calendrier éditorial et les briefs attendent. Les publicités Google et
Meta Ads sont à l'horizon, hors périmètre actuel — à ne pas rendre impossible.

### 8. Le SEO local est une section complète

Six écrans, sa propre entrée de navigation, ses propres déclencheurs
d'automatisation et ses propres KPIs dans le rapport. Aussi important que les
outils SEO. Google Business Profile devient une intégration centrale.

### 9. La zone géographique se règle par client

Elle dépend de ce que l'établissement dessert et d'où il se trouve — aucun réglage
global ne tiendrait. La fiche d'établissement porte un éditeur de zone : point et
rayon, liste de secteurs, ou grille de points selon le cas. Le coût DataForSEO
varie donc par compte, et l'écran de consommation doit ventiler par client.

### 10. On note ce qui se mesure, on caractérise ce qui s'apprécie

Voir la règle 2 ci-dessous.

### 11. La conservation des données est sélective

Voir la règle 3 ci-dessous.

### 12. Mono-utilisateur pour l'instant, multi à trois ans

L'équipe et les rôles des paramètres sont du décor. L'authentification et les
permissions attendent — mais **chaque objet porte dès maintenant un responsable**,
pour ne pas avoir à tout reprendre le jour où un deuxième utilisateur arrive.

### 13. Une fiche vide se remplit par import puis par audit

L'import de l'onboarding n'apporte que l'identité : nom, entreprise, téléphone,
adresse, description. Tout le reste — présence en ligne, SEO, design — vient de
l'audit. Une fiche fraîchement créée a donc un état propre : identité renseignée,
zéro donnée d'analyse, un seul appel à l'action.

**Corollaire important :** l'audit n'est pas un audit SEO. Il couvre **trois
dimensions — présence en ligne, SEO, design**. Il produit donc trois familles de
priorités, et le score de santé affiché sur la fiche est une moyenne pondérée de
trois scores.

---

## Règle 1 — La visibilité client d'une priorité

Une priorité porte **trois états de visibilité**, pas deux :

| État | Déclenché par | Ce que le client voit |
|---|---|---|
| **Interne** | Par défaut, à la détection | Rien. Reste dans le cockpit de l'agence. |
| **Annoncé** | Interrupteur manuel | Le constat, sans échéance. Prépare une vente ou documente. |
| **En traitement** | Automatique, à l'entrée au plan d'action | Le constat, ce qui est fait, l'avancement. Devient une preuve à la clôture. |

La régulation par défaut est donc gratuite : **une priorité devient visible quand
elle entre au plan d'action de la période.** L'interrupteur manuel sert aux
exceptions, dans les deux sens.

### Le double libellé

Une priorité visible doit être écrite dans la langue du client. « LCP à 4,2 s » ne
lui dit rien ; « vos pages mettent trop de temps à s'afficher sur mobile » oui.

Chaque priorité porte donc **deux libellés** :

- le **libellé interne**, technique, pour l'équipe ;
- le **libellé client**, rédigé par le rôle Rédacteur de l'agent.

Le libellé client **passe par une relecture humaine** avant publication. L'écran de
détail affiche les deux côte à côte, avec un état « à relire » qui bloque la
publication du rapport tant qu'il subsiste.

**La règle est générale, pas propre aux priorités.** Tout texte rédigé par l'agent
et destiné à sortir de l'agence passe par une relecture avant publication :

- le libellé client d'une **priorité** ;
- le libellé client d'une **preuve de valeur**, produit à la clôture d'une tâche ;
- la **réponse à un avis** Google — une réponse publiée engage la marque du client,
  elle ne part jamais sans validation humaine.

Partout, le même état « à relire » et le même blocage. Une relecture systématique
est une corvée assumée tant qu'il s'agit de vrais clients : elle sert aussi à
calibrer l'agent.

---

## Règle 2 — La grille d'audit design

L'expérience utilisateur se mesure, le style s'apprécie. Deux sorties séparées :
**un score bâti uniquement sur du vérifiable, une caractérisation jamais notée.**
Un client peut contester une note de goût ; il ne peut pas contester un contraste
sous le seuil.

### Ce qui entre dans le score

| Critère | Ce qui est vérifié | Source |
|---|---|---|
| **Mobile** | Viewport déclaré, cibles tactiles ≥ 44 px, aucun débordement horizontal, taille de police non réduite | Lighthouse + crawl |
| **Lisibilité** | Contraste au seuil WCAG AA, corps ≥ 16 px, longueur de ligne, hiérarchie des titres réellement présente | crawl + analyse DOM |
| **Parcours** | Profondeur de navigation, présence et position des appels à l'action, étapes jusqu'à la conversion | crawl |
| **Conversion** | Champs par formulaire, libellés explicites, gestion des erreurs, preuves sociales, clarté de la proposition | crawl |
| **Cohérence de marque** | Nombre de familles typographiques, étendue de la palette, réutilisation des composants | analyse CSS |

### Ce qui est caractérisé, jamais noté

- **Style dominant** — éditorial, minimaliste, tech, corporate ou artisanal. Sert à
  cadrer une refonte : on ne propose pas la même chose à un cabinet d'avocats et à
  une boutique de vélos.
- **Axe de modernité** — de daté à actuel, justifié par des signaux nommés :
  densité, ombres, dégradés, largeur des conteneurs, choix typographiques,
  traitement des images.

> Un site peut être daté et parfaitement utilisable. Ce sont deux constats
> séparés, et les confondre est la meilleure façon de vendre une refonte inutile.

---

## Règle 3 — Ce que la base conserve

Liste blanche historisée automatiquement ; le reste éphémère, enregistrable sur
action explicite. Les prospects n'ont droit qu'à un instantané, purgé si le deal
est perdu.

| Donnée | Client | Prospect | Fréquence | Dilution |
|---|---|---|---|---|
| Scores d'audit | Historisé | Instantané | À chaque audit | Aucune — léger, c'est la courbe de progression |
| Lighthouse / CWV | Historisé | Instantané | Mensuel | Détail 12 mois, puis moyenne mensuelle |
| Positions SERP suivies | Historisé | Non | Hebdomadaire | Quotidien 90 j → hebdo 12 mois → mensuel |
| Positions locales | Historisé | Non | Mensuel | Même dilution que les positions SERP |
| Backlinks | Historisé en delta | Volumétrie seule | Mensuel | Gains et pertes seulement, jamais le corpus |
| Exploration de mots-clés | Éphémère | Éphémère | À la demande | Cache 30 jours puis purge |

Les seuils sont des **réglages d'agence, pas des constantes** — ils se révisent
quand la facture DataForSEO parlera.

### Le marqueur de conservation

**Le cadre commun des outils doit distinguer visuellement ce qui sera conservé de
ce qui ne l'est pas.** Sans ce marqueur, l'utilisateur ne sait jamais si un
résultat qu'il consulte existera encore demain — et il enregistre tout par
précaution, ce qui annule la politique.

Le marqueur signale aussi le cas du prospect, qui n'a droit qu'à un instantané.

**Seconde conséquence :** l'écran de consommation ventile par client. Les zones
locales et le nombre de mots-clés suivis varient d'un compte à l'autre, et un
client peut coûter cinq fois plus qu'un autre.

---

## Conventions d'interface

Ces conventions traversent tous les écrans. Elles sont apparues en écrivant les
briefs de conception, quand une décision manquait manifestement.

### Trois états vides, pas un

Un écran sans contenu n'a pas toujours la même signification, et un état vide
générique les confond :

| Vide | Ce que ça veut dire | Ce que l'écran doit faire |
|---|---|---|
| **Initial** | Rien n'a encore été créé | Expliquer, proposer le premier geste |
| **De filtre** | Il y a des données, mais pas avec ces critères | Proposer d'élargir la recherche |
| **Sain** | Aucune priorité critique, aucune facture en retard | Le dire comme une bonne nouvelle |

Le vide sain est le plus souvent raté : ce n'est pas une absence de données, c'est
un résultat. Le ton doit le refléter.

### Un test à blanc avant d'activer une automatisation

Une règle mal réglée peut créer cent tâches d'un coup. Avant activation,
l'automatisation doit pouvoir répondre à : **« qu'aurait fait cette règle le mois
dernier ? »**

Sans cette simulation, une automatisation puissante ne sera jamais activée avec
confiance — et une automatisation qu'on n'ose pas activer ne sert à rien.

### Un message d'erreur dit quoi faire

Il nomme ce qui s'est passé **et** comment le réparer. Pas d'excuse, pas de vague.

> « Impossible de charger les positions : Search Console n'est plus connecté.
> Reconnecter. »

vaut mieux que « une erreur est survenue ». Le cas le plus fréquent en production
est l'intégration déconnectée : elle dégrade les rapports silencieusement, elle
doit donc être bruyante.

---

## Règles UX héritées du PRD

À tenir sur tous les écrans :

- Une priorité doit **sembler pouvoir devenir une tâche** dans l'interface.
- Une tâche terminée doit **pouvoir être valorisée comme preuve de travail**.
- Un rapport doit **sembler réutiliser** les actions et preuves visibles ailleurs.
- Les synthèses de l'agent restent **courtes, crédibles et rattachées aux signaux
  affichés** — chaque affirmation doit pouvoir remonter à la donnée qui la fonde.
- Les boutons portent des **libellés concrets en français**.
- L'interface est **dense mais lisible**.
- Les statuts ne dépendent **jamais uniquement de la couleur**.
