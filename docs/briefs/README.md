# Séquence de conception — 25 sessions Claude Design

Un fichier par session. Ouvre le fichier, copie tout son contenu, colle-le dans
une session Claude Design du projet *HuntPilote - CRM SEO*.

**Depuis la phase 2, colle deux fichiers : le brief et
[`socle-partage.md`](socle-partage.md).** Ce second fichier liste ce qui est déjà
implémenté et se réutilise. Sans lui, chaque session redessine ce qui existe sous
un nouveau nom — c'est arrivé trois fois en phase 1.

**Une session = un prompt = un ou deux écrans.** Ne fusionne pas deux briefs dans
la même session : au-delà de deux écrans, la qualité du détail chute et le shell
commence à dériver d'un écran à l'autre.

Le cadrage de fond — les treize décisions, les trois règles spécifiées et les
cinq conventions d'interface — vit
dans [`../decisions.md`](../decisions.md). Les briefs en reprennent ce qui les
concerne ; en cas de doute, `decisions.md` fait foi.

---

## Où on en est

**Les sept premières phases sont conçues, intégrées et en ligne.** La séquence
initiale — 37 écrans, de la boucle de livraison au portail client en passant
par les outils, le SEO local, le quotidien de l'agence et le contenu — est
construite dans l'application réelle. La phase 7 l'a rejointe : le socle CRM
est renforcé, en s'inspirant de ce que des CRM comme Twenty font bien (contact
comme objet à part du client, fil de communication unifié, cycle de devis),
sans en reprendre l'architecture. La phase 8 l'a rejointe à son tour, née d'un
audit de cohérence de la navigation : le Dashboard, resté figé depuis la
phase 1, ne disait rien de ce qui est urgent à l'échelle du portefeuille.

| Phase | Écrans | État |
|---|---|---|
| 1 — Boucle de livraison | 6 | ✅ intégrée |
| 2 — Les outils | 9 | ✅ intégrée |
| 3 — SEO local | 6 | ✅ intégrée |
| 4 — Le quotidien de l'agence | 8 | ✅ intégrée |
| 5 — Le portail client | 4 | ✅ intégrée |
| 6 — Contenu et socle | 4 | ✅ intégrée |
| 7 — CRM avancé | 5 | ✅ intégrée |
| 8 — Dashboard enrichi | 1 | ✅ intégrée |

---

## L'ordre, et pourquoi

La séquence n'est pas arbitraire. Chaque phase produit les objets dont la
suivante a besoin.

### Phase 1 — Fermer la boucle de livraison

Rien ne sert d'ajouter des outils tant que le cockpit ne sait pas transformer une
donnée en travail. Ces quatre sessions relient audit, priorité, tâche, preuve et
rapport.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 1.1 | Détail d'une priorité | [`1-1-detail-priorite.md`](1-1-detail-priorite.md) | ✅ intégré |
| 1.2 | Détail d'une tâche | [`1-2-detail-tache.md`](1-2-detail-tache.md) | ✅ intégré |
| 1.3 | Éditeur de rapport · rapport partageable | [`1-3-rapport.md`](1-3-rapport.md) | ✅ intégré |
| 1.4 | Détail d'audit · comparaison d'audits | [`1-4-audits.md`](1-4-audits.md) | ✅ intégré |

> **Commence par 1.1 seule.** C'est l'écran le plus chargé en logique et celui
> dont les deux suivants héritent. Valide-le avant d'enchaîner.

**Phase 1 terminée et intégrée.** Les six écrans sont en ligne dans
l'application, reliés à la fiche client : le bouton « Détail » d'une priorité,
« Voir détail » d'une tâche, « Ouvrir l'éditeur » d'un rapport et « Voir le
détail » d'un audit mènent désormais quelque part. Deux conventions nées de cette
phase ont été promues dans [`../decisions.md`](../decisions.md) : *une seule
action principale par écran, en vert plein* et *une mesure s'affiche toujours
avec son seuil*.

### Phase 2 — Les outils

La valeur ajoutée du produit. La session 2.1 est la plus importante de toute la
séquence : elle définit un cadre réutilisé par sept écrans.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 2.1 | Cadre commun des outils | [`2-1-cadre-outils.md`](2-1-cadre-outils.md) | ✅ intégré |
| 2.2 | Site Audit | [`2-2-site-audit.md`](2-2-site-audit.md) | ✅ intégré |
| 2.3 | Position Tracking · Backlink Analyse | [`2-3-positions-backlinks.md`](2-3-positions-backlinks.md) | ✅ intégré |
| 2.4 | Keyword Hunter · Keyword Gap | [`2-4-mots-cles.md`](2-4-mots-cles.md) | ✅ intégré |
| 2.5 | Organic Research · Domain Overview | [`2-5-prospection.md`](2-5-prospection.md) | ✅ intégré |
| 2.6 | Suivi de consommation | [`2-6-consommation.md`](2-6-consommation.md) | ✅ intégré |

> **2.1 avant tout le reste**, sans exception. Si le cadre change après avoir
> dessiné trois outils, tu redessines trois outils.

**Phase 2 close.** Le cadre commun (`ContextBar`, `Banner`, cartes de côté) est
réutilisé à l'identique par les 7 outils : Site Audit, Position Tracking,
Backlink Analyse, Keyword Hunter, Keyword Gap, Domain Overview et Organic
Research. Un bug hérité de la phase 1 a été corrigé au passage : `prioHref`
était une string constante partagée par toutes les lignes d'un tableau au lieu
d'une fonction par ligne — corrigé dans le détail et la comparaison d'audits
aussi, puis reproduit correctement (une fonction par ligne) dans les sept
outils. Ce point est maintenant dans [`socle-partage.md`](socle-partage.md)
pour ne pas revenir en phase 3. Les comptes fictifs des outils (Boréal
Immobilier, Clinique Lavoie, Spa Nordik Estrie, Quincaillerie Fortin) sont de
vrais enregistrements `CLIENTS` avec un domaine, pour que « Enregistrer dans
la fiche » résolve vraiment quelque part.

La Consommation (2.6) vit dans Paramètres — 6ᵉ onglet, fil d'Ariane
« HuntPilote › Paramètres › Consommation », hors du cadre commun et de la
barre latérale « Outil ». L'Audit Prospect ferme la boucle commerciale
d'Organic Research : route à jeton `/audit-prospect/[token]`, hors du shell
CRM, dans l'esprit du rapport client partageable (session 1.3) mais plus léger
— sa démo réutilise le calcul réel du potentiel d'Organic Research plutôt
qu'un chiffre figé dans le prototype, pour que le document envoyé au prospect
et l'écran vu en direct ne puissent pas se contredire. L'index `/outils` — la
page derrière le libellé « Outil » de la barre latérale, avant qu'un outil
précis soit choisi — a aussi été refait : il montrait encore le placeholder
d'avant la phase 2.

[`socle-partage.md`](socle-partage.md) documente maintenant le cadre commun
des outils comme brique réutilisable pour la phase 3 : un écran neuf rattaché
à un client (fiche d'établissement, positions locales, avis) en hérite
probablement, au lieu d'en redessiner un.

### Phase 3 — SEO local

Une section complète, au même niveau que les outils.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 3.1 | Vue d'ensemble · fiche d'établissement | [`3-1-local-etablissement.md`](3-1-local-etablissement.md) | ✅ intégré |
| 3.2 | Avis · citations et annuaires | [`3-2-avis-citations.md`](3-2-avis-citations.md) | ✅ intégré |
| 3.3 | Positions locales · concurrence locale | [`3-3-positions-locales.md`](3-3-positions-locales.md) | ✅ intégré |

**Phase 3 close.** Six écrans en ligne : vue d'ensemble et fiche d'établissement,
avis et citations/annuaires, positions locales et concurrence locale, tous
rattachés à de vrais enregistrements `CLIENTS` (Boréal Immobilier, Clinique
Lavoie — deux établissements —, Spa Nordik Estrie, Quincaillerie Fortin, Le
Marché Bio). Le cadre commun des outils (session 2.1) s'est effectivement
réutilisé pour ces écrans, comme anticipé dans `socle-partage.md`.

### Phase 4 — Le quotidien de l'agence

Les vues transversales, et les éditeurs manquants des écrans déjà livrés.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 4.1 | Mon plan de travail · priorités transversales | [`4-1-vues-transversales.md`](4-1-vues-transversales.md) | ✅ intégré |
| 4.2 | Agenda · rapports à produire | [`4-2-agenda-rapports.md`](4-2-agenda-rapports.md) | ✅ intégré |
| 4.3 | Recherche globale · notifications | [`4-3-recherche-notifications.md`](4-3-recherche-notifications.md) | ✅ intégré |
| 4.4 | Détail de deal · éditeur d'automatisation | [`4-4-deal-automatisation.md`](4-4-deal-automatisation.md) | ✅ intégré |

**Phase 4 close.** Le plan de travail et les priorités transversales listent et
filtrent les objets déjà livrés en phase 1 ; l'agenda et les rapports à
produire (portefeuille de l'éditeur de rapport, session 1.3) sont en ligne ; la
recherche globale et les notifications vivent dans un `OverlayProvider`
transversal monté une fois dans `AppShell`, plutôt que de reproduire
l'accrochage DOM de la maquette ; le détail de deal et l'éditeur
d'automatisation (Quand → Si → Alors) complètent le pipeline et le workflow
déjà livrés.

### Phase 5 — Le portail client

Ce que voit le client. Dépend du rapport conçu en 1.3.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 5.1 | Connexion · tableau de bord client | [`5-1-portail-accueil.md`](5-1-portail-accueil.md) | ✅ intégré |
| 5.2 | Ses rapports · échanges | [`5-2-portail-rapports.md`](5-2-portail-rapports.md) | ✅ intégré |

**Phase 5 close.** Quatre écrans hors du shell cockpit : connexion par lien
magique, tableau de bord figé à la publication (ne montrant jamais que les
priorités *annoncé*/*en traitement*), historique des rapports avec la courbe
de score sur douze mois, et les échanges. Le tableau de bord reprend les
données réelles du rapport publié (`REPORT`, le même qu'en `/r/[token]`) plutôt
que d'en inventer un second, avec un lien vers le document tel qu'envoyé.

### Phase 6 — Contenu et socle

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 6.1 | Calendrier éditorial · brief d'article | [`6-1-contenu.md`](6-1-contenu.md) | ✅ intégré |
| 6.2 | Connexion agence · états système | [`6-2-socle.md`](6-2-socle.md) | ✅ intégré |

**Phase 6 close, et la séquence des 37 écrans avec elle.** Le calendrier
éditorial et le brief d'article closent l'onglet « Contenu » de la fiche
client (câblé depuis la phase 4, en attente de cette route). La connexion
agence est en ligne. Les états système (`components/ui/States.tsx` — silhouettes
de chargement, trois vides distincts, erreurs actionnables, permission) sont
appliqués aux écrans qui en manquaient : plan de travail, priorités, agenda,
rapports à produire, tableau de bord, pipeline, workflow, clients, SEO local.

### Phase 7 — CRM avancé

Le contact, la communication et le devis n'ont jamais eu leur propre écran :
un contact est un champ texte, les échanges sont éparpillés entre le portail
et le panneau de deal, et un devis à un client déjà signé n'a pas de gabarit.
Trois briefs, inspirés de ce qu'un CRM comme Twenty fait de solide sur ces
points précis — sans reprendre son modèle d'objets personnalisables, qui
serait disproportionné ici.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 7.1 | Les contacts d'un client · fiche d'un contact | [`7-1-contact.md`](7-1-contact.md) | ✅ intégré |
| 7.2 | Communications | [`7-2-communications.md`](7-2-communications.md) | ✅ intégré |
| 7.3 | Devis | [`7-3-devis.md`](7-3-devis.md) | ✅ intégré |

> **L'ordre importe ici aussi.** 7.1 avant 7.2 : le fil de communication se
> rattache à un contact précis, pas seulement à un client. 7.3 est indépendante
> des deux autres et peut se concevoir en parallèle.

Le panneau latéral de détail (session 4.4) et la bibliothèque d'états système
(session 6.2) sont maintenant documentés dans
[`socle-partage.md`](socle-partage.md) — ces trois briefs s'appuient dessus au
lieu d'en redessiner une variante.

**Phase 7 close.** Les trois sessions vivaient sur un seul écran hôte — la
fiche client — et ont donc été intégrées ensemble plutôt qu'en parallèle, pour
éviter des conflits de fusion sur les mêmes fichiers. Les panneaux latéraux de
contact et de devis réutilisent `.dl-scrim`/`.dl-sheet` du panneau de deal
(session 4.4) au lieu d'un second système ; le document de devis repose sur
`.client-doc`, déjà utilisé pour le rapport et la clôture de tâche. Le fil de
communications fusionne réellement `PORTAL_THREAD` (session 5.2, importé,
jamais dupliqué) avec les nouveaux canaux internes — l'ancien tableau
« Historique des communications » de l'onglet Rapports est devenu un simple
renvoi vers ce nouvel onglet, une seule source de vérité.

### Phase 8 — Dashboard enrichi

Née d'un audit de cohérence de la navigation, pas de la séquence initiale.
Le Dashboard n'avait pas bougé depuis la phase 1 : ni les priorités critiques
du portefeuille, ni les rapports en retard, ni le pipeline, ni les devis en
attente, ni les intégrations déconnectées n'y étaient visibles — pour un écran
d'entrée d'agence, un vrai manque.

| Session | Écrans | Fichier | État |
|---|---|---|---|
| 8.1 | Dashboard : le portefeuille en un coup d'œil | [`8-1-dashboard.md`](8-1-dashboard.md) | ✅ intégré |

Cinq blocs de résumé, chacun avec un lien vers l'écran complet déjà en ligne
(Priorités transversales, Rapports à produire, Pipeline, onglets Contrat &
facturation/Communications de la fiche client, Paramètres) — jamais une
seconde version de ces listes. Quatre des cinq s'appuient sur des données déjà
portefeuille-complet (`ALL_PRIORITIES`, les rapports à produire, `DEALS`,
`AGENCY_INTEGRATIONS`) ; seul le bloc devis/communications a besoin d'un
résumé agrégé léger, les données détaillées de la phase 7 n'existant
aujourd'hui que pour Acme Corp. — voir la note de décision ci-dessous.

**Phase 8 close.** La maquette avait aussi remarqué, en marge du brief, que
`Client Hub.html` et `Fiche Client v4.html` avaient dérivé vers leur propre
barre latérale plutôt que la partagée — un drift propre aux prototypes HTML
statiques, sans équivalent dans l'application réelle : `AppShell` rend déjà
`NavSidebar` une seule fois pour tout le cockpit, ces deux fichiers de
maquette ont donc été ignorés à l'intégration. Le panneau de tâches du
Dashboard a aussi été rebranché sur `ALL_TASKS` (`/travail`) à cette occasion,
un correctif de cohérence trouvé pendant l'audit plutôt qu'un point du brief.

> **Une décision prise pendant l'audit, à retenir pour la suite.** La fiche
> client affiche en réalité toujours les données d'Acme Corp., quel que soit
> le client dans l'URL — un raccourci de la phase 1 jamais corrigé depuis.
> Décidé de ne **pas** construire neuf jeux de données mock complets pour
> corriger ça : ce sera le rôle naturel du modèle de données réel, au
> branchement de Supabase. Ce choix s'applique à tout brief futur qui
> dépendrait de données riches par client.

---

## Ce que la phase 1 a changé dans la suite du plan

Six écrans livrés, et trois conséquences sur les briefs qui restent.

**Des sessions sont devenues plus légères.** Elles gardent leur place dans la
séquence, mais une partie de leur contenu est déjà acquise :

| Session | Ce qui n'est plus à concevoir |
|---|---|
| 2.2 Site Audit | Le score pondéré appartient à l'écran d'audit ; la ligne de constat existe |
| 4.1 Vues transversales | Les détails de tâche et de priorité existent — ce sont deux listes filtrantes |
| 4.2 Rapports à produire | L'éditeur et ses six états existent — c'est la liste du portefeuille |
| 5.1 Portail · tableau de bord | Le corps du rapport existe et se reprend tel quel |
| 5.2 Portail · ses rapports | « Ouvrir un rapport » réutilise la même page |

**Des frontières ont été écrites** là où deux écrans risquaient de raconter la
même chose avec un vocabulaire différent : Site Audit contre détail d'audit,
section locale contre dimension *présence en ligne*, portail contre rapport
publié. Chaque brief concerné porte maintenant sa section « frontière ».

**Deux conventions se sont imposées** et sont remontées dans `decisions.md` :
une seule action principale verte par écran, et une mesure ne s'affiche jamais
sans son seuil.

**La 4.1 reste à sa place.** Elle est devenue moins chère à concevoir — ses deux
écrans n'ont plus qu'à lister, trier et filtrer des objets qui existent déjà —
mais ça ne suffit pas à justifier de la devancer : pas de client local en
attente, et l'ordre du plan reste le bon.

---

## Comment travailler chaque session

1. **Colle le brief et `socle-partage.md`** dans une session Claude Design du
   projet.
2. **Laisse-le produire**, puis regarde d'abord si le shell est intact — barre
   latérale, header, palette — et si les classes du socle ont été reprises plutôt
   que recréées sous un nouveau nom. Une dérive se corrige tout de suite, pas
   trois écrans plus tard.
3. **Vérifie les états** listés en fin de brief. C'est là que les maquettes sont
   habituellement incomplètes, et c'est ce qui coûte le plus cher à rattraper.
4. **Reviens me voir** avec le fichier HTML : j'implémente, je vérifie au
   navigateur en thème clair et sombre, je commite.

## Quand un brief ne suffit plus

Si en cours de session tu découvres qu'une décision manque — un état non prévu,
une interaction ambiguë —, ne laisse pas Claude Design trancher seul. Note la
question, termine l'écran sans elle, et remonte-la : elle a probablement des
conséquences sur d'autres écrans que celui en cours.
