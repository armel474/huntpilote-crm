# Session 8.1 — Dashboard : le portefeuille en un coup d'œil

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel
quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.**

Règles de fond : interface dense mais lisible ; aucune métrique décorative ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une mesure ne s'affiche jamais sans son seuil**.

> **Ce n'est pas un nouvel écran.** Le Dashboard existe déjà (trafic,
> performance client, revenu, tâches). Cette session lui ajoute cinq blocs qui
> manquent aujourd'hui à un écran censé donner une vue d'ensemble de l'agence —
> à l'heure actuelle, il ne dit rien de ce qui est urgent, de ce qui est dû, ni
> de ce qui avance commercialement.

---

## Un seul écran, cinq ajouts

Toujours `/dashboard`. Les blocs ci-dessous s'ajoutent à ce qui existe déjà
(carte trafic, carte performance client, graphique revenu, panneau de tâches) —
n'y touche pas, sauf pour leur faire de la place dans la mise en page.

### 1. Priorités critiques du portefeuille

Les priorités marquées *critique*, tous clients confondus, en aperçu — pas
l'inventaire complet (c'est le rôle de l'écran Priorités transversales, déjà
en ligne). Trois à cinq lignes maximum : client, libellé, dimension (présence
en ligne / SEO / design), âge. Un lien « Voir toutes les priorités critiques »
vers cet écran existant.

### 2. Rapports à produire ce mois

Un résumé de portefeuille, pas la liste complète (déjà en ligne, écran
Rapports à produire) : combien de rapports sont dus ce mois, combien sont
publiés, combien sont en retard sur leur date d'envoi. Le retard doit être
visible sans ambiguïté — c'est le signal le plus commercialement sensible de
ce bloc. Lien vers l'écran complet.

### 3. Aperçu du pipeline

Valeur totale des deals en négociation (MRR proposé cumulé), et les deals qui
approchent d'une clôture — étape avancée, ou beaucoup de jours dans l'étape
courante. Pas un board complet, un résumé de quelques lignes avec lien vers le
Pipeline.

### 4. Devis en attente et communications non lues

Deux compteurs, portefeuille complet : combien de devis envoyés attendent une
réponse client, combien de fils de communication ont un message non lu côté
agence. Chacun avec un lien vers l'endroit concerné (l'onglet Contrat &
facturation ou Communications du client concerné).

> Ce bloc s'appuie sur un résumé agrégé léger par client (nom, montant ou
> compteur) — pas sur une fiche client complète par compte. Les seules données
> détaillées existantes aujourd'hui sont celles d'Acme Corp. ; ce bloc doit
> pouvoir montrer plusieurs clients sans que chacun ait une fiche aussi riche
> derrière.

### 5. Intégrations déconnectées — en permanence, pas en démo

L'agence connaît déjà la liste de ses intégrations (Google Analytics 4,
Search Console, Semrush, Google Business Profile, PageSpeed, Stripe) et
lesquelles sont connectées. Ce qui manque : le rendre visible en permanence
sur le Dashboard, pas seulement dans un scénario de démonstration. Si une
intégration utilisée par des comptes clients est déconnectée, ça doit se voir
dès l'ouverture de l'écran — c'est exactement le principe déjà écrit pour les
états système : « une intégration déconnectée est le cas le plus fréquent en
production, et celui qui dégrade silencieusement les rapports — il doit être
bruyant. »

## Comment les cinq blocs s'organisent

Le Dashboard a aujourd'hui deux colonnes (contenu principal + panneau de
tâches en barre latérale droite). Décide de la disposition la plus lisible :
ces cinq blocs ne doivent pas noyer les cartes existantes ni obliger à
défiler longuement avant de voir l'essentiel. Une agence qui ouvre l'écran le
matin doit repérer en quelques secondes s'il y a un incendie à éteindre.

## États à prévoir

- Portefeuille sain sur les cinq blocs (aucune priorité critique, aucun
  rapport en retard, aucun devis en attente, aucune intégration déconnectée)
  — à traiter comme une bonne nouvelle, pas une absence.
- Un seul bloc en alerte pendant que les autres sont calmes — les blocs ne
  doivent pas dépendre les uns des autres visuellement.
- Portefeuille chargé (plusieurs priorités critiques, plusieurs rapports en
  retard en même temps) — l'écran ne doit pas devenir illisible.

## Ce qu'il ne faut pas faire

- Ne pas dupliquer les écrans complets (Priorités transversales, Rapports à
  produire, Pipeline) — chaque bloc est un résumé avec un lien de sortie,
  jamais une seconde version de la liste.
- Ne pas construire un système d'alerte différent de celui déjà en place
  (`components/ui/States.tsx` — erreur d'intégration, texte qui dit quoi faire,
  pas un point de couleur vague).
- Ne pas surcharger l'écran au point qu'il faille défiler avant de voir le
  premier signal utile.
