# Le catalogue et les documents de l'agence

Ce document couvre ce que l'agence **vend**, ce qu'elle **signe**, et ce que
tout cela **engage comme travail**. Il est né d'une question de réconciliation
qui paraissait mineure — « quels forfaits vends-tu, et à quels prix ? » — et
qui a révélé que rien de tout ça n'existait dans le produit.

- Migrations : `0012_catalogue_agence.sql`, `0013_documents_agence.sql`,
  `0014_offre_reelle.sql`
- Tests : `08_regles_catalogue.sql`, `09_regles_documents.sql`,
  `10_regles_offre_reelle.sql`

---

## Ce que l'agence vend

Trois notions, deux tables. Une ligne de devis ou de facture doit pouvoir
pointer vers n'importe laquelle sans se demander dans quelle table chercher.

| Notion | Table | Ce que c'est |
|---|---|---|
| **Produit** | `catalog_item` (`kind = 'produit'`) | Se vend une fois, se livre une fois. Une maquette, un développement, une boutique. |
| **Service** | `catalog_item` (`kind = 'service'`) | Se reconduit au mois. Gestion GMB, articles de blogue, netlinking. |
| **Offre** | `offer` + `offer_line` | Le forfait : un assemblage nommé, avec son propre prix. |

Un produit facturé au mois est refusé par le moteur : les deux notions ne se
confondent pas.

### L'offre porte cinq choses que le prix ne dit pas

Les offres réelles de l'agence l'ont imposé — le modèle avait d'abord été
écrit sans les avoir vues.

1. **Une offre en contient une autre.** « Tout ce qui est dans Présence
   Digitale » est une inclusion, pas une recopie. La valeur catalogue se
   calcule en cascade, et un cycle d'inclusion est refusé.
2. **« À partir de » est un plancher.** `price_is_from` : un devis à 6 200 $
   ne contredit pas un catalogue qui annonce 4 500 $.
3. **Le tarif d'entrée n'est pas le prix courant.** « 3 premiers mois à tarif
   préférentiel » : le revenu récurrent affiche ce qui rentre aujourd'hui.
4. **Chaque offre désigne celle qui la prolonge.** « Idéal pour : Croissance
   Digitale » — le chemin commercial (vendre un site, puis l'accompagnement)
   vit dans la base, pas dans une tête.
5. **Une alternative attend le choix du client.** « Espace membres *ou*
   réservation avancée » : le choix retenu décide du travail créé.

S'y ajoutent l'accroche, les segments visés, ce que le client y gagne, le délai
de livraison annoncé et la consultation offerte — la différence entre un
catalogue et une ligne de prix.

### Une conséquence à connaître

Les forfaits web sont des **paiements uniques**. Le CRM ne les compte donc pas
dans le revenu récurrent : 9 000 $ de site ne sont pas 9 000 $ par mois. Seuls
les packs mensuels alimentent le MRR, et c'est la lecture honnête de l'activité.

---

## Ce que l'offre engage comme travail

C'est le point qui change le produit. Une offre ne dit pas seulement combien
elle coûte, elle dit **ce qu'on s'est engagé à faire**, et à quel rythme.

`offer_task_template` porte un titre, une cadence (`signature`, `mensuel`,
`trimestriel`, `annuel`), une estimation, un jour d'échéance et un rôle par
défaut. Souscrire crée les tâches — y compris celles des offres incluses.

`app.apply_offer_tasks(abonnement, période)` est **idempotente** : rejouer un
mois déjà traité ne crée rien, et ne consomme même pas de numéro de tâche.
Elle se planifie mensuellement sans risque et se rejoue après un incident.

Personne n'a plus à se souvenir que « Croissance » implique un audit
trimestriel, et aucun modèle de langage n'a à le deviner.

---

## Ce que l'agence signe

`document_template` porte ce qui entoure les lignes : conditions de paiement,
mentions légales, pied de page, préfixe de numérotation. Un seul modèle par
défaut par type — « lequel s'applique ? » ne doit jamais être une question.

`app.next_document_ref()` fabrique `DV-2026-017` à partir du modèle, sur un
compteur atomique par agence, par type et par année. Deux documents ne
partagent jamais un numéro : pour une facture, c'est une obligation.

### Une facture envoyée ne se modifie plus

On ne corrige pas une facture partie chez le client : on en émet une autre, ou
on l'annule. Une fois `sent_at` posé, le numéro, le compte, la période et les
lignes sont gelés. Seuls le paiement, l'échéance et l'annulation peuvent
encore bouger. Le client voit ses factures envoyées, jamais les brouillons.

### La formule de taxes, vérifiée sur un vrai contrat

Le contrat SHGM annonce 9 750,00 $ d'honoraires, 487,50 $ de TPS, 972,56 $ de
TVQ, 11 210,06 $ au total. `invoice_total` additionne les parties **arrondies**
plutôt que d'arrondir le produit — et retombe exactement sur ces chiffres. La
somme des lignes affichées fait le total affiché, au cent près.

---

## Ce qui reste à modéliser : le contrat

Les documents réels (`Contrat de services professionnels n° 2026-007`,
`Annexe A`) portent des notions que le schéma ne sait pas encore dire. Elles
sont réelles, pas décoratives — un mandat signé les oppose au client.

### La chaîne documentaire, et son ordre de priorité

Un mandat, c'est **trois documents liés et hiérarchisés** : le corps du
contrat, l'Annexe A, la proposition acceptée. L'article 1.2 le dit
explicitement : en cas de conflit, cet ordre prévaut. Le modèle doit donc
porter le lien **et** le rang, pas trois fichiers côte à côte.

`document_kind` ne connaît aujourd'hui que `devis` et `facture`. Il lui manque
`proposition`, `contrat`, `annexe` et `avenant`.

### Le livrable, distinct de la tâche

`L-01` à `L-11` ne sont pas des tâches : ce sont des **livrables soumis à
approbation**, avec un nombre de **rondes de révision incluses** et un tarif
au-delà (100 $/h). Une ronde est « un ensemble de commentaires consolidés
transmis en une seule fois » — et des commentaires fragmentés après clôture
comptent pour une nouvelle ronde. C'est une règle facturable : elle doit être
comptée par le moteur, pas de mémoire.

### Le jalon, et la date qui se calcule

`J-01` à `J-12` forment un enchaînement à **dates relatives** (« dans les 7
jours suivant J-03 »), chacun avec un **responsable** : le Client, le
Prestataire, ou les deux. Un retard du Client reporte les jalons suivants
« sans pénalité pour le Prestataire ». Une date d'échéancier ne se saisit donc
pas : elle se recalcule à chaque glissement.

### L'acceptation tacite

« En l'absence de retour dans les 5 jours ouvrables, le livrable est réputé
accepté. » Avec, en contrepartie, un engagement : « le Prestataire s'engage à
transmettre un rappel avant l'échéance ». C'est exactement une automatisation
de la migration 0011 — déclencheur de date, action de notification.

### Ce que le client doit fournir

Une liste d'éléments attendus, avec format et remarques, due au jalon J-03, et
une **date butoir à 60 jours** au-delà de laquelle le mandat peut être
suspendu. Un mandat bloqué faute de contenu est la première cause de dérive
d'un projet web : le CRM doit le voir venir.

### Les exclusions

« Boutique en ligne », « espace membre », « version anglaise », « prestation
SEO »… chacune assortie d'une précision et de la mention « fera l'objet d'une
offre de service distincte ». Une exclusion n'est pas une note en bas de page :
c'est **la prochaine vente**, écrite noir sur blanc dans le contrat signé.

### L'échéancier de paiement

50 % à la signature, 50 % à la livraison, payable sous 15 jours. Une facture
n'est pas mensuelle par nature : elle suit des jalons de paiement.

### La banque d'heures

L'accompagnement post-lancement (L-11) : 4 à 6 h par mois pendant 3 mois, non
cumulables, non reportables, et les correctifs sous garantie ne s'en déduisent
pas. Ce n'est ni un abonnement ni une tâche — c'est un crédit d'heures qui se
remet à zéro.

---

## Ce qu'il reste à saisir, et qui n'est pas du schéma

Le catalogue réel — les six offres, leurs livrables et leurs prix — est de la
**donnée**. Le semis le posera ; le remplacer par une révision de tarifs ne
demandera aucune migration.

Deux valeurs manquent encore pour que le semis soit exact :

1. **Le tarif préférentiel des trois premiers mois** de chaque pack SEO. Les
   captures annoncent « 3 premiers mois à tarif préférentiel » sans le chiffre.
2. **Les numéros d'inscription TPS et TVQ.** Le contrat porte le NEQ
   (2272419658) et réclame les deux taxes, mais n'affiche pas les numéros
   d'inscription correspondants. S'ils existent, ils doivent figurer sur les
   factures ; sinon c'est la facturation des taxes qui est à revoir.
