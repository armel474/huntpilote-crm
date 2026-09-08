# Session 2.3 — Position Tracking et Backlink Analyse

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

## Deux écrans

1. **Position Tracking**, route `/outils/positions`
2. **Backlink Analyse**, route `/outils/backlinks`

Tous deux produisent des données **historisées** — le marqueur de conservation
doit l'indiquer.

---

## Position Tracking

Suivi des mots-clés d'un client dans le temps. Relevé hebdomadaire.

### Ce qu'il doit montrer

- **Le tableau des mots-clés suivis** : requête, position actuelle, variation sur
  la période, volume de recherche, URL positionnée, intention.
- **La courbe d'évolution** d'un mot-clé sélectionné, sur la période choisie.
- **La répartition par tranche** — top 3, top 10, top 30, au-delà — et son
  évolution. C'est l'indicateur qui parle au client.
- **Les mouvements notables** en tête : les plus fortes hausses et baisses de la
  période. C'est ce qu'on regarde en premier.

### La gestion de la liste suivie

Ajouter des mots-clés, en retirer, les grouper par thème. Le nombre de mots-clés
suivis détermine le coût mensuel du compte — affiche-le.

### États

Aucun mot-clé suivi · premier relevé (pas de comparaison) · relevé en cours ·
mot-clé sorti du classement · cannibalisation détectée (deux URLs sur la même
requête).

---

## Backlink Analyse

### Ce qu'il doit montrer

- **Le profil** : nombre de domaines référents, autorité moyenne, répartition
  suivi / non suivi, ancres les plus fréquentes.
- **Les gains et les pertes de la période** — c'est le cœur de l'écran, et la
  seule chose historisée. Le corpus complet des liens n'est pas conservé.
- **Les liens toxiques ou suspects**, avec le geste pour les désavouer.
- **La comparaison avec les concurrents** du client, s'ils sont renseignés.

Un backlink gagné est une **preuve de valeur** potentielle : prévois le geste qui
le verse au prochain rapport.

### États

Aucun backlink · profil en cours d'analyse · perte importante détectée · données
du fournisseur incomplètes.

## Ce qu'il ne faut pas faire

- Ne pas afficher la liste complète des backlinks comme vue principale : ce sont
  les mouvements qui informent.
- Ne pas confondre variation de position et variation de trafic.
