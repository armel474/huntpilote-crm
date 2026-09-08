# Session 2.2 — Site Audit

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français.

L'application repose sur une boucle : **Audit → Priorité → Tâche → Preuve de
valeur → Rapport client**. L'audit couvre trois dimensions — présence en ligne,
SEO, design. Une priorité appartient toujours à l'une des trois.

> **Cet outil s'inscrit dans le cadre commun conçu en session 2.1.** Reprends-le
> à l'identique : sélecteur de client en tête, sélecteur de période, les deux
> actions constantes (enregistrer dans la fiche, transformer une ligne en
> priorité), et le marqueur qui distingue les données conservées des données
> éphémères. Ne redessine pas le cadre — dessine ce qui vit dedans.

---

## L'écran à concevoir

**Site Audit**, route `/outils/site-audit`. C'est l'outil qui alimente le plus la
fiche client : il produit la dimension SEO et une partie de la dimension design de
l'audit.

## Ce qu'il doit montrer

### Le résumé de crawl

Pages explorées, pages en erreur, profondeur moyenne, date du dernier passage.
Comparaison avec le crawl précédent : ce qui est apparu, ce qui a disparu.

### Les problèmes, groupés par famille

- **Indexation** — pages bloquées, canoniques incohérentes, pagination
- **Erreurs** — 404, redirections en chaîne, liens brisés
- **On-page** — titres et méta manquants ou dupliqués, H1 absents, alt d'images
- **Performance** — Core Web Vitals par gabarit de page, pas seulement l'accueil
- **Structure** — pages orphelines, maillage interne, profondeur excessive

Chaque famille affiche son nombre de pages touchées et sa sévérité. Chaque ligne
se déplie sur la liste des pages concernées, avec la mesure relevée.

### L'action qui compte

Depuis n'importe quelle ligne : **créer la priorité**. Le geste doit être aussi
accessible sur une famille entière (« les 23 liens brisés ») que sur une page
isolée. Signale les lignes qui ont déjà généré une priorité ouverte, pour ne pas
créer de doublon.

## États à prévoir

- Crawl jamais lancé sur ce domaine
- Crawl en cours, avec progression
- Crawl terminé sans problème détecté
- Crawl partiel — le site a bloqué l'exploration
- Site trop volumineux pour le quota disponible

## Ce qu'il ne faut pas faire

- Ne pas produire une liste plate de centaines de lignes : le groupement par
  famille est ce qui rend l'outil utilisable.
- Ne pas afficher un score global sans les mesures qui le composent.
