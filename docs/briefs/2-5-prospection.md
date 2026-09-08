# Session 2.5 — Organic Research et Domain Overview

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

## Deux écrans tournés vers la prospection

1. **Domain Overview**, route `/outils/domain-overview` — qualifier vite
2. **Organic Research**, route `/outils/organic-research` — creuser avant de
   proposer

Ces deux outils s'utilisent surtout sur des **prospects**. Le sélecteur doit donc
les proposer aussi naturellement que les clients, et signaler que les données d'un
prospect ne sont qu'un instantané, purgé si le deal est perdu.

---

## Domain Overview

L'écran d'un coup d'œil : *ce prospect vaut-il un rendez-vous ?*

### Ce qu'il doit montrer, en une vue sans défilement

- Trafic organique estimé et sa tendance sur douze mois
- Nombre de mots-clés positionnés, répartition par tranche
- Autorité du domaine, nombre de domaines référents
- Top 5 des pages et des requêtes
- Répartition géographique du trafic — utile au Québec pour distinguer un site
  local d'un site pancanadien

### Le geste qui compte

**« Créer un prospect »** ou **« Rattacher à un prospect existant »** — l'outil
doit alimenter le pipeline commercial, sinon l'analyse se perd.

---

## Organic Research

Plus profond : ce qu'on regarde avant de chiffrer une proposition.

### Ce qu'il doit montrer

- **L'évolution du trafic et des positions** sur douze à vingt-quatre mois, avec
  les décrochages visibles — une chute datée est un argument de vente.
- **Les requêtes positionnées**, filtrables, avec la page qui se positionne.
- **Les pages qui performent** et celles qui ont perdu du terrain.
- **Le potentiel estimé** : ce que vaudrait le passage en top 3 des requêtes déjà
  en position 4 à 10. C'est le chiffre qui va dans la proposition commerciale.

### La sortie

**Générer un audit de prospect** — un document partageable, plus léger que le
rapport client mensuel, qui sert d'argument commercial. Réutilise la mise en page
du rapport partageable conçu en session 1.3.

## États à prévoir

- Domaine sans données — site neuf ou trop petit
- Domaine avec chute brutale détectée : c'est un signal, pas une erreur
- Prospect déjà présent au pipeline
- Quota insuffisant pour l'analyse profonde

## Ce qu'il ne faut pas faire

- Ne pas concevoir Domain Overview comme une version réduite d'Organic Research :
  l'un se lit en dix secondes, l'autre s'explore.
- Ne pas oublier que ces écrans servent à vendre : le potentiel chiffré compte
  plus que l'exhaustivité.
