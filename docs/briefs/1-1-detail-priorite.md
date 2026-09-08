# Session 1.1 — Détail d'une priorité

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

---

## L'écran à concevoir

**Détail d'une priorité SEO**, route `/clients/[id]/priorites/[p]`.

C'est l'écran le plus chargé en logique de toute l'application, et celui dont
dépendent les suivants. Il répond à une question : *ce problème mérite-t-il qu'on
s'en occupe ce mois-ci, et si oui, comment le transformer en travail ?*

## Ce qu'il doit montrer

- **Le constat** — libellé technique, sévérité, et la dimension d'audit qui l'a
  produit (présence, SEO ou design).
- **Les pages touchées** — une liste, avec la mesure relevée sur chacune. C'est ce
  qui rend le constat vérifiable plutôt qu'affirmé.
- **La recommandation** — ce qu'il faut faire, rédigé par l'agent, avec l'effort
  estimé et l'impact attendu.
- **La provenance** — quel audit, quelle date, quelle source de données. Chaque
  affirmation de l'agent doit pouvoir remonter à la donnée qui la fonde.
- **L'historique** — depuis quand le problème existe, s'il s'aggrave, s'il avait
  déjà été traité puis est revenu.

## Les trois états de visibilité client

Une priorité porte trois états, pas deux. L'écran doit les afficher, les expliquer
et permettre d'en changer.

| État | Déclenché par | Ce que le client voit |
|---|---|---|
| **Interne** | Par défaut, à la détection | Rien. Reste dans le cockpit de l'agence. |
| **Annoncé** | Interrupteur manuel | Le constat, sans échéance. Prépare une vente ou documente. |
| **En traitement** | Automatique, à l'entrée au plan d'action | Le constat, ce qui est fait, l'avancement. |

L'utilisateur doit comprendre d'un coup d'œil ce que le client verra dans l'état
courant. Prévois un aperçu de la version client.

## Le double libellé

Une priorité visible doit être écrite dans la langue du client. « LCP à 4,2 s » ne
lui dit rien ; « vos pages mettent trop de temps à s'afficher sur mobile » oui.

- Le **libellé interne**, technique, pour l'équipe.
- Le **libellé client**, rédigé par l'agent, éditable en ligne.

Le libellé client porte un état **« à relire »** tant qu'un humain ne l'a pas
validé. Cet état bloque la publication du rapport — l'écran doit le dire, pas le
suggérer.

## L'action principale

**« Assigner au plan d'action »** crée une tâche et fait basculer la priorité en
*en traitement*. C'est le geste central de l'écran : il doit être évident, et une
fois fait, la tâche créée doit apparaître avec un lien vers elle.

Actions secondaires : ignorer la priorité (avec motif), la reporter, la marquer
comme faux positif — ce dernier point alimente le réglage de l'agent.

## États à prévoir

- Priorité neuve, non traitée
- Priorité déjà assignée — la tâche liée est visible
- Priorité résolue — avec la preuve de valeur produite
- Priorité récurrente — revenue après correction, c'est un signal différent
- Libellé client encore à relire
- Priorité ignorée ou marquée faux positif

## Ce qu'il ne faut pas faire

- Pas de nouveau vocabulaire visuel : réutilise cartes, badges, jauges et
  sévérités existants.
- Ne pas traiter la visibilité client comme une case à cocher discrète : c'est une
  décision éditoriale, elle mérite sa place.
- Ne pas noyer l'action principale sous les actions secondaires.
