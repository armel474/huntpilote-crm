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
