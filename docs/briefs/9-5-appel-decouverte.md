# Session 9.5 — L'appel découverte : transcription, brief, informations à confirmer

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

> **Prérequis :** la fiche client, le panneau de deal (session 4.4) et le fil
> de communications (session 7.2) existent. La session 9.4 amendée consomme ce
> que cette session produit (source « Depuis le brief »). Cette session est
> indépendante de 9.3 et peut se concevoir en parallèle.
>
> **Donnée d'exemple :** aucune transcription réelle n'est dans le dépôt.
> Invente un échange fictif court (une PME de services, un objectif, un
> problème, un chiffre), et signale-le comme fictif. Une transcription réelle
> anonymisée sera fournie plus tard pour vérifier la maquette.

---

## Le point structurant

La proposition ne part pas d'un formulaire vide : elle part de ce que le
client a dit. Entre l'appel découverte et la proposition, HuntPilote garde
trois choses distinctes : **ce que le client a demandé** (le brief), **ce que
l'agence recommande** (la suggestion, session 9.4), **ce qui sera vendu** (les
lignes). Cette session dessine la première.

Le brief de découverte est **révisable et corrigeable par une personne**, qu'il
ait été extrait par l'IA ou saisi à la main. Chaque élément dit d'où il vient.
Une transcription brute ne passe jamais dans un document client, et n'est
jamais une instruction pour l'agent : c'est une source de contenu.

**Le parcours doit fonctionner sans IA** : sans extraction, le brief se remplit
à la main depuis la même fiche, avec les mêmes champs, et alimente la
proposition de la même façon.

## Deux écrans

1. **Consigner l'échange**, enrichi — le geste existant du fil de
   communications et du panneau de deal, qui accepte maintenant une
   transcription ou un résumé.
2. **Le brief de découverte**, route `/clients/[slug]/decouverte`, ouvert
   depuis le panneau de deal, l'onglet Communications ou l'Aperçu de la fiche.

Plus deux **cartes** de résumé qui s'insèrent dans des écrans existants : dans
le panneau de deal (`DealPanel`, section « Le deal ») et dans l'Aperçu de la
fiche client. Ne redessine pas ces écrans : ajoute la carte.

---

## Écran 1 — Consigner l'échange

Le geste existe (session 7.2) : canal, direction, date, contact, corps. Il
gagne, pour les canaux **Appel** et **Réunion**, une zone « Source de
l'échange » :

- **Type de source** : *transcription* (verbatim) ou *résumé* (notes ou
  compte rendu). La différence compte : un résumé importé ne donne jamais de
  passage cité, seulement une provenance.
- **Provenance** : collé dans le champ, fichier téléversé (`.txt`, `.vtt`,
  `.srt` ; limite de taille dite à l'écran), ou importé d'une intégration
  (grisé, « bientôt »). Le nom du fichier et la personne qui l'a importé
  s'affichent après l'import.
- **Date et durée de l'appel**, **participants** (contact du client, membre
  de l'agence), **langue**.
- **Opportunité rattachée** : l'appel appartient à une opportunité ; quand
  il est consigné depuis le panneau de deal, c'est prérempli ; depuis la
  fiche, un sélecteur des opportunités ouvertes du client, ou « aucune ».
- **Rappel de consentement**, une ligne discrète : « Assurez-vous que
  l'interlocuteur a été informé de l'enregistrement. » Pas une case à cocher
  qui bloque, une information.
- **Conservation** : « Cette transcription sera purgée 90 jours après la
  perte de l'opportunité (réglage de l'agence). Le brief relu est conservé. »
  Le délai est un réglage ; la valeur est un exemple.

L'action principale verte reste **« Consigner »**. Après consignation, une
ligne du fil montre la communication avec une pastille « transcription » ou
« résumé », et un geste en contour **« Extraire le brief »** (violet, IA) et
**« Rédiger le brief »** (sans IA), qui mènent à l'écran 2.

## Écran 2 — Le brief de découverte

### La structure

En tête : le client, l'opportunité, les échanges sources (une puce par
communication consignée, avec type et date ; un brief peut lire plusieurs
appels), l'état du brief, la personne qui l'a relu et quand.

Deux colonnes (`.detail-row`) :

**À gauche, le brief, corrigeable.** Des champs longs, groupés :

| Groupe | Champs | Où ça sert |
|---|---|---|
| L'essentiel | atout principal · problème cardinal · objectif principal · résultat visé (chiffré si possible) · zone cible · secteur | Balises `brief.*` de la proposition (résumé analytique, recommandation) |
| Besoins et objectifs | besoins (liste) · objectifs secondaires (liste) · périmètre évoqué (pages, fonctionnalités, langues) | Sections « Compréhension de vos besoins » et « Objectifs » |
| Contraintes | budget évoqué · échéance évoquée · contraintes (liste) · décideurs (liste) · outils en place (site, réservation, canal actuel) | Suggestion d'offre, prochaines étapes |
| Propre à l'acquisition | canal publicitaire · canal de contact actuel · taux d'annulation · cœur de métier · offre spécialisée · système de réservation | Modèle Meta Ads |
| Informations à confirmer | liste de questions ouvertes, chacune avec son origine | Bloquent ou non l'envoi selon la section (9.4) |

Chaque champ porte, en petit sous sa valeur, **sa provenance** : « extrait de
l'appel du 12 sept., 14:32 » (cliquable, ouvre le passage à droite), « saisi
par Julien », « depuis le résumé du 12 sept. » (sans passage), ou « à
confirmer ». Un champ extrait par l'IA et non encore relu est marqué en violet
« à relire » ; le corriger ou le confirmer le fait passer en état relu.

Un groupe qui ne s'applique pas (acquisition pour un projet web) se replie et
le dit ; il ne se remplit pas de vide.

**À droite, les passages sources.** La transcription, lisible, avec les
horodatages ; le passage cité par le champ sélectionné est surligné, et un
geste **« Utiliser ce passage »** sur une sélection de texte remplit ou
complète le champ actif. Pour un résumé importé, la colonne montre le résumé
et dit qu'aucun passage ne peut être cité. Sans source (brief rédigé à la
main), la colonne montre un état vide qui explique comment consigner un appel.

### Les gestes

- **« Extraire le brief »** (violet, IA) : lance l'extraction depuis les
  échanges sources sélectionnés. L'extraction est un traitement qui peut
  durer et échouer : état en cours (silhouette sur les champs, pas de
  bloqueur de page), échec relançable avec la raison, résultat « proposé, à
  relire ». Relancer l'extraction **ne réécrit pas un champ modifié à la
  main ni un champ confirmé** : elle propose, à côté, et la personne retient
  ou ignore, comme pour les sections de la 9.4.
- **« Rédiger le brief »** sans IA : les mêmes champs, vides, avec le guide.
- **« Marquer confirmé »** sur une information à confirmer ; **« Poser la
  question »** crée une communication sortante préremplie vers le contact
  (session 7.2), sans quitter l'écran.
- L'action principale verte : **« Valider le brief »**. Verrouillée tant
  qu'un champ de l'essentiel est vide ou à relire ; la raison est dite.
  Un brief validé peut être rouvert : toute modification le repasse « à
  revalider », et la proposition déjà créée depuis lui ne change pas (elle
  le dit dans ses éléments manquants : « le brief a changé depuis la création
  du brouillon »).
- Depuis un brief validé : **« Créer la proposition »** en contour, qui ouvre
  le panneau de la session 9.4 avec la source « Depuis le brief ».

### Les cartes

Dans le panneau de deal et dans l'Aperçu de la fiche : une carte « Brief de
découverte » avec l'état (aucun · à relire · validé le … · à revalider), les
quatre champs de l'essentiel en une ligne chacun, le nombre d'informations à
confirmer, et un geste vers l'écran. Sans échange consigné : « Aucun appel
consigné. Consignez l'appel découverte pour préparer la proposition. »

## Les droits

| Droit | Ce qu'il ouvre |
|---|---|
| Gérer les comptes | Consigner un échange, rédiger, corriger, valider le brief |
| Déclencher un appel facturé au fournisseur | Lancer l'extraction par l'IA (usage compté dans Consommation) ; laisse une note : ce rattachement est une proposition |
| Aucun des deux | Lecture du brief et des sources ; boutons verrouillés avec leur raison |

Un contact du portail ne voit jamais rien de cette section.

## États

Consigner : appel sans source · transcription collée · fichier téléversé (en
cours, réussi, refusé pour format ou taille avec la contrainte rappelée) ·
résumé importé · opportunité non rattachée (avertissement, pas de blocage).
Brief : aucun brief, aucun échange · échange consigné, brief non commencé
(deux gestes : extraire, rédiger) · extraction en cours · extraction échouée
(raison, relancer, ou rédiger à la main) · proposé, à relire · en cours de
saisie manuelle · partiellement confirmé · validé · à revalider après
modification · depuis un résumé (sans passages) · plusieurs sources ·
IA non configurée (gestes violets absents ou verrouillés) · plafond d'IA
atteint · lecture seule sans droit · transcription purgée (le brief reste, la
colonne de droite le dit) · enregistrement automatique, enregistré,
non enregistré (connexion perdue), conflit d'édition, reprise après
rechargement.

## Transitions

| De | Geste ou événement | Vers |
|---|---|---|
| aucun échange | Consigner (avec source) | échange consigné, brief non commencé |
| échange consigné | Extraire le brief | extraction en cours → proposé, à relire ; ou échec relançable |
| échange consigné | Rédiger le brief | saisie manuelle |
| proposé, à relire | corriger ou confirmer chaque champ | partiellement confirmé → prêt à valider |
| prêt à valider | Valider le brief | validé (la source « Depuis le brief » de 9.4 s'active) |
| validé | modifier un champ | à revalider (les propositions créées ne changent pas) |
| validé ou à revalider | nouvel appel consigné, Extraire | propositions à côté des champs, rien d'écrasé |
| opportunité perdue + délai | purge | transcription purgée, brief conservé |

## Données lues et écrites

Lues : client, contacts, opportunités ouvertes, communications avec leur
source, brief existant, réglage de conservation, droits, disponibilité de
l'IA et plafond. Écrites : communication avec sa source (type, provenance,
fichier, date, durée, participants, langue, opportunité), brief (champs,
provenance de chaque champ, état, relecture), informations à confirmer,
communication sortante « Poser la question », usage IA compté. Jamais :
rien n'est écrit dans un document client depuis cet écran.

## Ce qu'il ne faut pas faire

- Ne pas faire passer une transcription brute dans une proposition, ni
  l'afficher dans le portail.
- Ne pas écraser un champ corrigé à la main ou confirmé par une nouvelle
  extraction.
- Ne pas laisser croire qu'un résumé importé cite l'interlocuteur.
- Ne pas bloquer la consignation d'un appel parce que l'IA est absente : le
  brief se rédige à la main.
- Ne pas redessiner le panneau de deal, le fil de communications ni l'Aperçu :
  une zone de plus dans le premier, une carte dans les deux autres.
- Ne pas utiliser de vraie transcription ni de vrai client dans la maquette.
