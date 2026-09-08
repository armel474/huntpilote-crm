# Session 2.4 — Keyword Hunter et Keyword Gap

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.** Il liste
les classes déjà implémentées et réutilisables : la ligne de constat, les
tableaux en grille, le document client, la sous-barre, les deux colonnes d'un
écran de détail. Six écrans existent déjà — n'en redessine aucun morceau.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une mesure ne s'affiche jamais sans son seuil** ; **une
seule action principale verte par écran**, tout le reste en contour.

L'application repose sur une boucle : **Audit → Priorité → Tâche → Preuve de
valeur → Rapport client**. L'audit couvre trois dimensions — présence en ligne,
SEO, design. Une priorité appartient toujours à l'une des trois.

> **Cet outil s'inscrit dans le cadre commun conçu en session 2.1.** Reprends-le
> à l'identique : sélecteur de client en tête, sélecteur de période, les deux
> actions constantes (enregistrer dans la fiche, transformer une ligne en
> priorité), et le marqueur qui distingue les données conservées des données
> éphémères. Ne redessine pas le cadre — dessine ce qui vit dedans.

---

## Deux écrans d'exploration

1. **Keyword Hunter**, route `/outils/keyword-hunter`
2. **Keyword Gap**, route `/outils/keyword-gap`

**Ces deux outils produisent des données éphémères** — cache 30 jours puis purge.
Le marqueur de conservation doit être explicite, et le geste « enregistrer dans la
fiche » d'autant plus visible : c'est le seul moyen de garder un résultat.

---

## Keyword Hunter

Trouver des requêtes à cibler. Alimente le plan éditorial.

### Ce qu'il doit montrer

- Un **champ de départ** — un mot-clé racine, une URL, ou un thème.
- Les **suggestions** : requête, volume, difficulté estimée, intention
  (informationnelle, commerciale, transactionnelle), tendance saisonnière.
- Des **filtres qui servent vraiment** : volume minimum, difficulté maximum,
  intention, longueur de la requête, présence de question.
- Le **regroupement par thème** — c'est ce qui transforme une liste de 400
  requêtes en trois sujets d'articles.

### Les gestes de sortie

- **Ajouter au suivi de positions** — une ou plusieurs requêtes.
- **Créer un brief d'article** — sur un groupe thématique. Le module contenu
  arrive plus tard, mais le geste doit exister dès maintenant.
- **Enregistrer la sélection dans la fiche.**

---

## Keyword Gap

Comparer le client à ses concurrents. Alimente la carte Concurrence de la fiche.

### Ce qu'il doit montrer

- Le **client et jusqu'à trois concurrents**, pré-remplis depuis la fiche si
  renseignés.
- Une lecture en quatre catégories, qui est la vraie valeur de l'outil :
  - **Manquants** — les concurrents se positionnent, pas vous
  - **Faibles** — vous êtes présent mais derrière
  - **Forts** — vous devancez
  - **Uniques** — vous seul êtes positionné
- Pour chaque requête : volume, votre position, celle de chaque concurrent.

Les **manquants à fort volume** sont ce qu'on vient chercher — mets-les en avant.

### États

Aucun concurrent renseigné · concurrent sans données · recoupement nul.

## Ce qu'il ne faut pas faire

- Ne pas livrer un tableau brut de plusieurs centaines de lignes sans regroupement.
- Ne pas laisser croire qu'un résultat exploré est conservé.
