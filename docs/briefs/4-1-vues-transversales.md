# Session 4.1 — Mon plan de travail et priorités transversales

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

> **Le changement d'axe.** Jusqu'ici tout est organisé par client. Ces deux écrans
> sont organisés par **urgence**, tous comptes confondus. C'est ce qu'on ouvre le
> matin, avant de savoir de quel client on va s'occuper.

---

## Deux écrans

1. **Mon plan de travail**, route `/travail`
2. **Priorités transversales**, route `/priorites`

---

## Mon plan de travail

Toutes mes tâches, tous clients confondus.

### Ce qu'il doit montrer

- **Aujourd'hui, cette semaine, plus tard, en retard** — le regroupement par
  échéance est le bon axe. Les tâches en retard passent devant tout.
- Pour chaque tâche : titre, client, échéance, priorité source, effort estimé.
- **Le client est un contexte, pas un titre de section** : il doit se lire d'un
  coup d'œil sans structurer la page.
- **La charge de la semaine** — somme des efforts estimés, pour voir si la semaine
  tient debout.

### Les gestes

Cocher, reporter, réassigner, ouvrir la tâche. Tout doit se faire sans quitter
l'écran — c'est un poste de travail, pas une table des matières.

### États

Aucune tâche · semaine surchargée · tâches en retard · tâches bloquées.

---

## Priorités transversales

Les priorités ouvertes de tout le portefeuille, triées par urgence réelle.

> **Ces deux vues n'ouvrent aucun écran nouveau.** Une tâche mène au détail de
> tâche livré en 1.2, une priorité au détail de priorité livré en 1.1. Ce sont
> des listes filtrantes : leur valeur est dans le tri, les filtres et les gestes
> en lot, pas dans un nouvel affichage du même objet. Les filtres de visibilité
> reprennent les trois états existants — *interne*, *annoncé*, *en traitement*.

### Ce qu'il doit montrer

- **Toutes les critiques d'abord**, tous clients confondus. C'est la vue qui évite
  qu'un problème grave dorme chez un petit compte.
- Filtres par sévérité, par dimension d'audit, par client, par état de visibilité.
- **Depuis quand chaque priorité est ouverte** — une critique de six semaines est
  un problème d'agence, pas de client.
- **Les priorités non assignées** : celles détectées mais jamais traitées.

### Le geste

Assigner en lot. Sélectionner plusieurs priorités et les verser au plan d'action
d'un coup — sinon la vue transversale ne fait gagner du temps qu'à moitié.

### États

Aucune priorité critique — état sain, à célébrer sobrement · afflux après un
audit · priorités anciennes non traitées.

## Ce qu'il ne faut pas faire

- Ne pas reproduire le Client Hub avec un autre tri : ici le client s'efface
  derrière le travail.
- Ne pas obliger à ouvrir une fiche pour agir.
