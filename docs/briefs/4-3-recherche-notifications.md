# Session 4.3 — Recherche globale et notifications

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

> Ce sont deux **superpositions**, pas des pages. Elles s'ouvrent par-dessus
> l'écran courant et se ferment sans le quitter.

---

## Recherche globale

Le champ de recherche existe dans le header de tous les écrans livrés et **ne fait
rien**. Cette session lui donne un comportement.

### Ce qu'elle doit chercher

Clients et prospects · tâches · priorités · mots-clés suivis · rapports ·
établissements · factures.

### La conception

- **Ouverture au clavier** — un raccourci, affiché dans le champ.
- **Résultats groupés par type**, avec le type lisible sur chaque ligne.
- **Navigation entièrement au clavier** : flèches, entrée, échap. C'est un outil
  d'usage quotidien, la souris est un aller-retour de trop.
- **Les récents à l'ouverture**, avant toute frappe. Un champ vide qui ne propose
  rien est une occasion perdue.
- **Des actions rapides** : « nouveau client », « lancer un audit sur… », « aller
  aux priorités critiques ». La recherche devient un lanceur de commandes, ce qui
  est le meilleur usage de ce composant.

### États

Champ vide avec récents · frappe en cours · aucun résultat · beaucoup de résultats
dans un type.

---

## Panneau de notifications

La cloche du header porte une pastille rouge et **rien derrière**.

### Ce qu'il doit montrer

Les notifications produites par les automatisations et l'agent :

- Chute de position détectée
- Score de santé passé sous le seuil
- Liens brisés découverts
- Nouvel avis, surtout négatif
- Rapport généré ou envoyé
- Deal gagné
- Facture en retard
- Intégration déconnectée ou jeton expiré — souvent la plus urgente et la plus
  silencieuse

### La conception

- **Groupées par jour**, non lues distinguées.
- **Chaque notification mène quelque part** — sinon elle n'a pas lieu d'exister.
- **Tout marquer comme lu**, et le lien vers les réglages de notification qui
  existent déjà dans les paramètres.
- Les notifications critiques se distinguent sans dépendre uniquement de la
  couleur.

### États

Aucune notification · non lues · afflux après un audit · notification dont l'objet
a été supprimé.

## Ce qu'il ne faut pas faire

- Ne pas concevoir la recherche comme un formulaire : c'est un lanceur.
- Ne pas produire un flux de notifications sans action possible.
