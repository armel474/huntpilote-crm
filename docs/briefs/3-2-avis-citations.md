# Session 3.2 — Avis et citations

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

## Deux écrans

1. **Avis**, route `/local/[etab]/avis`
2. **Citations et annuaires**, route `/local/[etab]/citations`

---

## Avis

### Ce qu'il doit montrer

- **La note moyenne et sa tendance**, avec la répartition par étoile.
- **Le flux d'avis**, filtrable par note, par période, par état de réponse.
- **Les avis sans réponse en tête** — c'est le travail à faire.
- **L'analyse de tonalité par l'agent** : les thèmes qui reviennent dans les avis
  positifs et négatifs. Un commerce qui se fait reprocher trois fois l'attente a un
  problème d'exploitation, pas de SEO — et ça vaut la peine de le dire au client.

### Répondre

L'agent propose un brouillon de réponse, **relu avant publication** — même
principe que les libellés client des priorités.

> **Ce mécanisme est déjà dessiné et implémenté.** Va le voir sur le détail d'une
> priorité (carte « Libellé client ») et sur la clôture d'une tâche (étape 3) :
> pastille *à relire* en jaune ou *validé* en vert, texte éditable, bouton
> « ✦ Régénérer » en violet à côté du bouton de validation, et l'aperçu de ce que
> verra le lecteur cerné d'un pointillé tant que rien n'est validé. Reprends-le à
> l'identique plutôt que d'en inventer une troisième forme. Une réponse publiée engage la
marque du client : elle ne part jamais sans validation humaine.

Prévois les cas délicats : avis manifestement faux (avec le geste de signalement),
avis très négatif justifié, avis sans texte.

### États

Aucun avis · avis en attente de réponse · réponse rédigée à relire · réponse
publiée · avis signalé, en cours de traitement par Google.

---

## Citations et annuaires

*Le nom, l'adresse et le téléphone du client sont-ils cohérents partout ?*

### Ce qu'il doit montrer

- **La référence** — les informations officielles de l'établissement, telles
  qu'elles devraient apparaître.
- **La liste des annuaires** où le commerce est présent, avec pour chacun l'état :
  conforme, incohérent, absent, doublon.
- **Le détail de chaque incohérence** : ce qui est publié face à ce qui devrait
  l'être, champ par champ. Un numéro de téléphone périmé sur un annuaire à forte
  autorité compte plus qu'une virgule d'écart sur un annuaire obscur — l'écran doit
  hiérarchiser.
- **Les doublons de fiche**, qui sont le problème le plus coûteux et le plus
  fréquent.

### Le geste

Chaque incohérence peut devenir une **priorité** ou une **tâche** — la correction
est souvent manuelle, annuaire par annuaire.

### États

Analyse jamais lancée · en cours · tout conforme · doublon détecté · annuaire
inaccessible.

## Ce qu'il ne faut pas faire

- Ne pas traiter tous les annuaires à égalité : l'autorité de la source change la
  priorité.
- Ne pas laisser publier une réponse à un avis sans relecture.
