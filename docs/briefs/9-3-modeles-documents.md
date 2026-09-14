# Session 9.3 — Les modèles de documents et leurs balises

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) dans la session.** Il liste
les classes déjà implémentées et réutilisables. Trente-huit écrans existent —
n'en redessine aucun morceau.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative — chaque bloc aide à comprendre, prioriser ou agir ;
les statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français ; **une seule action principale verte par écran**, tout le
reste en contour ; **un message d'erreur dit quoi faire**.

> **Prérequis :** la session 9.1 (cadre de l'Agence hub) validée. Cette
> session est indépendante de la 9.2 et peut se concevoir en parallèle.
> **Colle aussi dans la session le HTML d'un vrai modèle de l'agence** (le
> contrat de services ou la proposition) : l'éditeur doit être conçu autour
> d'un document réel, pas d'un lorem ipsum.

---

## Le point structurant

L'agence a déjà ses documents, dessinés avec soin : une proposition de
services, un contrat de services professionnels, une Annexe A qui détaille
livrables et échéancier, un devis, une facture. Ils ont été produits comme
pages HTML et portent des **balises** aux endroits qui changent d'un client à
l'autre — le nom, le montant, la date, les lignes.

Le principe de cette section : **le modèle est du contenu de l'agence, pas du
code**. Il vit dans la base, se modifie ici sans déploiement, et c'est le
générateur (session 9.4) qui le remplit avec les données d'un client.

Six **sortes** de documents existent dans la base : devis, facture,
proposition, contrat, annexe, avenant. Chaque sorte a un ou plusieurs
modèles, dont un par défaut. Un modèle porte déjà : son nom, son préfixe de
numérotation (« DV » + année + numéro sur 3 chiffres donne `DV-2026-017`),
le délai de paiement par défaut, un texte d'introduction, les mentions
légales, le pied de page, les instructions de paiement. Ce qui lui manque,
et que cette session dessine : **son corps HTML et le dictionnaire des
balises**.

## Deux écrans

1. **Modèles de documents**, route `/agence/modeles` — la liste, par sorte.
2. **Éditeur d'un modèle**, route `/agence/modeles/[id]` — le HTML, les
   balises, l'aperçu.

---

## La liste

Six groupes, un par sorte, dans l'ordre du cycle de vente : proposition,
devis, contrat, annexe, avenant, facture. Dans chaque groupe, ses modèles :
nom, préfixe et exemple de numéro qu'il produira (« DV-2026-018 sera le
prochain »), délai de paiement, **modèle par défaut** (un seul par sorte,
marqué, changeable d'un geste), nombre de documents déjà produits avec lui,
dernière modification.

Une sorte sans aucun modèle se voit : « Aucun modèle d'annexe. Les annexes
ne pourront pas être générées. » avec le geste pour en créer un.

L'action principale verte : **« Nouveau modèle »**, qui demande d'abord la
sorte, puis propose de **partir d'un modèle existant** (copie) ou d'une page
vierge.

---

## L'éditeur — l'écran important

Trois zones, de gauche à droite :

### 1. Les réglages (colonne étroite)

Nom, sorte (figée après création), préfixe, année incluse ou non, largeur de
numéro, délai de paiement, modèle par défaut. Les quatre textes courts
(introduction, mentions légales, pied de page, instructions de paiement)
sont ici aussi : ce sont des balises comme les autres, mais qui ont leur
valeur dans le modèle plutôt que dans le client.

### 2. Le corps (colonne principale)

Le HTML du modèle. **Pas un éditeur visuel** : l'agence produit ses modèles
ailleurs (Claude Design) et les colle ici. Une zone de code avec numéros de
ligne, monospace système, coloration légère si c'est peu coûteux, et un
geste « Coller un fichier HTML » qui remplace tout.

Au-dessus, une barre qui dit ce que l'analyse du HTML a trouvé :

- « 14 balises reconnues » ;
- « 2 balises inconnues : `{{client.nom_commercial}}`, `{{total.tvh}}` » —
  chacune cliquable, avec la balise la plus proche proposée
  (`{{client.nom}}`, `{{total.tvq}}`) ;
- « 1 bloc répété : `{{#lignes}} … {{/lignes}}` ».

Une balise inconnue n'empêche pas d'enregistrer, mais le modèle est marqué
**incomplet** et le générateur refusera de l'utiliser tant qu'elle n'est
pas résolue.

### 3. L'aperçu (colonne large, dépliable en plein écran)

Le modèle rempli avec **des données d'exemple réelles** : le client SHGM, le
contrat n° 2026-007, ses onze livrables, son échéancier, ses montants. Rendu
dans `.client-doc` — blanc même en thème sombre, c'est le document du
client. Un sélecteur permet de changer de client d'exemple pour vérifier
qu'un nom long ou une adresse sur trois lignes ne casse rien.

Un geste « Aperçu impression » ouvre le rendu seul, au format lettre, tel
qu'il partira en PDF.

### Le dictionnaire des balises

Un panneau dépliable à droite de l'éditeur, ou une page à part reliée depuis
la barre : **toutes les balises disponibles**, groupées, avec un exemple de
valeur et un geste « copier ». La syntaxe de référence :

| Groupe | Balises | Exemple |
|---|---|---|
| Agence | `{{agence.nom}}` `{{agence.raison_sociale}}` `{{agence.adresse}}` `{{agence.telephone}}` `{{agence.courriel}}` `{{agence.site}}` `{{agence.tps}}` `{{agence.tvq}}` `{{agence.neq}}` `{{agence.logo}}` | Agence DigiHunt |
| Client | `{{client.nom}}` `{{client.raison_sociale}}` `{{client.adresse}}` `{{client.contact.nom}}` `{{client.contact.courriel}}` `{{client.contact.titre}}` | Société d'histoire… |
| Document | `{{document.reference}}` `{{document.date}}` `{{document.echeance}}` `{{document.objet}}` `{{document.introduction}}` `{{document.mentions}}` `{{document.pied}}` `{{document.paiement}}` | DV-2026-017 |
| Lignes | `{{#lignes}}` … `{{/lignes}}` avec `{{ligne.description}}` `{{ligne.quantite}}` `{{ligne.prix}}` `{{ligne.montant}}` | bloc répété |
| Totaux | `{{total.ht}}` `{{total.tps}}` `{{total.tvq}}` `{{total.ttc}}` | 11 210,06 $ |
| Contrat | `{{#livrables}}` `{{#jalons}}` `{{#exclusions}}` `{{#paiements}}` `{{#attendus_client}}` et leurs champs | blocs répétés |
| Signature | `{{signature.agence}}` `{{signature.client}}` `{{signature.date}}` | zone de signature |

**Si les modèles réels de l'agence utilisent une autre syntaxe**, c'est elle
qui gagne : l'écran affiche celle qui a été retenue. Ne tranche pas dans la
maquette, laisse une note.

### L'action principale

**« Enregistrer le modèle »**. Enregistrer un modèle **ne change aucun
document déjà produit** : un devis envoyé garde le rendu qu'il avait. Une
ligne le rappelle près du bouton quand le modèle a déjà servi.

### Le droit

« Gérer le catalogue » (les modèles de documents en font partie). Sans lui :
lecture, aperçu, dictionnaire — pas d'écriture.

## États

Liste : complète · sorte sans modèle · un seul modèle par sorte. Éditeur :
vierge · HTML collé et analysé · balises inconnues (incomplet) · aperçu avec
un client d'exemple · aperçu impression · modifications non enregistrées ·
lecture seule · modèle déjà utilisé (avertissement) · erreur d'enregistrement.

## Ce qu'il ne faut pas faire

- Ne pas dessiner un éditeur visuel de mise en page : le HTML vient de
  l'extérieur, l'écran le reçoit, l'analyse et le montre.
- Ne pas mettre l'aperçu dans l'interface beige : c'est `.client-doc`, blanc.
- Ne pas laisser un modèle incomplet servir au générateur sans le dire.
- Ne pas laisser croire qu'un modèle modifié réécrit les documents envoyés.

---

## Amendements du 14 septembre 2026 — modèles à sections, blocs conditionnels, montants, versions

Issus de la mission 001 (`../orchestration/analyses/001-reconciliation-catalogue.md`)
et de l'analyse générale du générateur (sections 3 et 4). Tout ce qui précède
reste valable ; ce qui suit le précise ou le remplace point par point. Les
décisions notées `D-nn` ne sont pas prises : la maquette montre les deux
hypothèses ou laisse une note, elle ne tranche pas.

### Ce qui change

1. **Le modèle de proposition de la maquette est remplacé par le gabarit réel.**
   `PROP_HTML` de `hp-tpl-data.jsx` est un devis d'une page ; la proposition de
   l'agence a onze sections sur seize pages. Colle dans la session le HTML de
   `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html`
   et celui du contrat : l'éditeur se conçoit autour d'eux.
   Leur page « Légende d'utilisation » n'existe plus dans le modèle ; son
   contenu, c'est le dictionnaire des balises.

2. **Un modèle a des sections, en plus de son HTML.** Une colonne ou un
   panneau « Sections » à côté du code liste, dans l'ordre du document :
   clé (`resume`, `besoins`, `objectifs`, `recommandation`, `preuve`,
   `plan_action`, `gestion_projet`, `modalites`, `couts_externes`, `accord`),
   titre, texte par défaut (le guide « [Compléter : …] » du gabarit, qui
   devient ce que l'agence ou l'IA remplit), et quatre drapeaux : optionnelle
   (se retire si vide), IA autorisée, verrouillée par l'agence (clause
   approuvée, jamais réécrite), longueur indicative. Éditer une section, c'est
   éditer son texte par défaut et ses drapeaux ; la mise en page reste dans le
   HTML, où `{{section.besoins}}` place le texte. Un modèle de devis ou de
   facture peut n'avoir aucune section : la colonne le dit.

3. **Les blocs conditionnels.** Le gabarit réel porte des commentaires
   « masquer si aucun bonus », « maintenance optionnelle », « phase 2
   optionnelle ». Ils deviennent des blocs `{{#si nom}} … {{/si}}` ; un bloc
   répété sur une liste vide ne se rend pas non plus. Cas à montrer : ligne
   bonus, maintenance recommandée, phase récurrente, section « Preuve »,
   section « Accord et signature » (D-14), exclusion SEO de l'annexe. La barre
   d'analyse compte trois choses : balises, blocs répétés, blocs
   conditionnels. Dans l'aperçu, un interrupteur par condition permet de
   vérifier les deux états sans changer de jeu d'exemple.

4. **Les groupes de balises s'étendent.** Le dictionnaire de l'écran reprend
   les groupes de la section 5 de l'analyse 001 : `brief.` (conclusions de
   l'appel découverte), `offres` et `offre.` (cartes d'offres présentées),
   `offre_recommandee.`, `maintenance_recommandee.`, `seo_recommande.`,
   lignes par nature (`lignes_offertes`, `lignes_remises`,
   `lignes_informatives`) et par récurrence (`lignes_ponctuelles`,
   `lignes_recurrentes`), `total.ponctuel_*`, `total.mensuel_*`,
   `total.informatif`, `total.estime`, `paiements`, `accompagnement`,
   `signataire.`, `contrat.personne_contact.`, `facture.echeance`. Deux
   corrections de sens : `document.echeance` est scindé en
   `document.expire_le` (fin de validité d'une offre) et `facture.echeance`
   (date de paiement) ; `client.contact.nom` devient `nom_complet`, avec
   `prenom` et `nom_famille` à part. Chaque balise garde un exemple de valeur,
   fictif.

5. **La syntaxe héritée est reconnue, pas rendue.** Quand le HTML collé
   contient des balises `[EN MAJUSCULES ENTRE CROCHETS]` ou `{{EN_MAJUSCULES}}`,
   un bandeau dit « Modèle hérité : 22 balises convertibles, 2 sans
   correspondance » et propose la conversion en un geste, d'après la table de
   l'analyse 001. Les balises sans correspondance restent inconnues, avec la
   suggestion la plus proche. Sous réserve de D-13 (syntaxe canonique) : laisse
   une note dans la maquette, comme le brief le demandait déjà.

6. **Montants ponctuels et récurrents.** L'aperçu d'une proposition rend
   deux totaux, « Total de l'investissement initial » et « par mois + taxes »,
   plus un bloc « Budget média » quand une ligne informative existe
   (« non facturé par l'agence »). Le dictionnaire montre les balises des deux
   sous-totaux et celles des remises (`total.avant_remise`, `total.remise`).

7. **Versions figées.** « Enregistrer le modèle » crée la version N du
   modèle ; la ligne près du bouton devient « 14 documents rendus avec les
   versions 1 à 3 ; ils gardent leur rendu. Enregistrer crée la version 4. »
   Un document envoyé cite la version du modèle qui l'a rendu ; le modèle ne
   sait rien des documents, il ne les touche jamais.

8. **Format et pagination.** L'aperçu impression a un sélecteur Lettre / A4
   (D-13 : ne tranche pas). Plus de page à hauteur fixe : le rendu est en
   flux, l'aperçu montre les sauts de page calculés, et une section rédigée
   trop longue pousse la suite au lieu d'être coupée. La longueur indicative
   d'une section s'affiche sous son texte (« 640 / 900 caractères »).

9. **Données d'exemple fictives.** Le brief demandait « le client SHGM, le
   contrat 2026-007 » : ce n'est plus le cas. Les jeux d'exemple sont
   inventés et le disent (« Exemple — Boulangerie Fictive »). Trois jeux :
   proposition web (forfait, pack SEO de démarrage, maintenance, bonus),
   proposition acquisition (phase ponctuelle, phase mensuelle avec engagement,
   escompte, budget média), contrat et annexe (livrables, jalons, attendus,
   exclusions, accompagnement). Le sélecteur de client d'exemple devient un
   sélecteur de jeu d'exemple ; le cas « nom et adresse longs » reste.

10. **Textes courts.** Introduction, mentions, pied de page et instructions
    de paiement restent des réglages du modèle. `document.paiement` se
    préremplit avec les instructions de paiement du profil de l'agence
    (session 9.1) et peut être surchargé ici ; l'écran montre d'où vient la
    valeur.

### États à ajouter

Modèle hérité détecté (bandeau, conversion proposée) · conversion faite, N
balises sans correspondance · bloc conditionnel jamais vrai dans le jeu
d'exemple (avertissement, interrupteur) · section sans texte par défaut ·
section verrouillée par l'agence (cadenas et raison) · modèle incomplet pour
sa sorte (une proposition sans bloc `{{#paiements}}`, une facture sans
`{{agence.tps}}`) · enregistrement en cours · enregistré, « version N » ·
erreur d'enregistrement (le message dit quoi faire) · modifications non
enregistrées, confirmation à la sortie qui dit que le texte sera perdu (pas
de brouillon local) · lecture seule sans « Gérer le catalogue ».

### Données lues et écrites

Lues : le modèle et ses sections, le dictionnaire, les jeux d'exemple, le
profil de l'agence (pour les valeurs par défaut), le nombre de documents
rendus par version. Écrites : nom, réglages, corps HTML, sections et leurs
drapeaux, version du modèle. Jamais : un document déjà produit.

### Ce qu'il ne faut pas faire — compléments

- Ne pas mettre la liste des sections dans le HTML : elle vit à côté.
- Ne pas rendre une balise héritée : la convertir ou la signaler.
- Ne pas utiliser un vrai client, un vrai contact ni un vrai contrat comme
  exemple dans la maquette.
- Ne pas dessiner un éditeur de texte riche pour les sections : un champ long
  par section, avec sa longueur indicative.
