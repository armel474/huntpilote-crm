# Session 7.2 — Communications

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre. Le shell CRM — barre
latérale de navigation et header contextuel — existe déjà et se conserve tel
quel.

**Colle aussi [`socle-partage.md`](socle-partage.md) et
[`7-1-contact.md`](7-1-contact.md) dans la session.** Cette session dépend du
contact : un échange se rattache à une personne précise, pas seulement à un
client.

Règles de fond, valables sur tous les écrans : interface dense mais lisible ;
aucune métrique décorative ; les statuts ne reposent jamais uniquement sur la
couleur ; libellés de boutons concrets en français ; **une seule action
principale verte par écran**, tout le reste en contour.

> **Ce qui existe déjà et qu'il ne faut pas redessiner.** Le panneau de détail
> d'un deal (session 4.4) a déjà un mini-historique d'échanges avec un
> sélecteur de canal (appel, courriel, réunion, note) et un geste « Consigner
> l'échange ». Le portail client (session 5.2, route `/portail/echanges`) a
> déjà un fil de conversation avec le client, avec pièces jointes et état de
> lecture. **Cette session unifie les deux** dans un seul écran côté agence,
> avec plus de canaux.

---

## Un écran

**Communications**, nouvel onglet de la fiche client — placé après « Rapports
client », avant « Contrat & facturation ».

---

## Ce qu'il doit montrer

### Un seul fil chronologique, tous canaux confondus

Courriels, appels, réunions, notes internes, Slack, WhatsApp, Messenger, **et**
les messages du portail client — dans un seul fil, du plus récent au plus
ancien. C'est le point le plus important de l'écran : aujourd'hui ces traces
sont éparpillées (le portail a son fil, le deal a le sien, rien n'existe pour
un client déjà signé), et rien ne les réunit.

### La distinction visible/interne, jamais ambiguë

Certains canaux sont vus par le client (les messages du portail, un courriel
envoyé depuis l'écran), d'autres ne le sont jamais (note interne, appel
consigné, message Slack de l'équipe). **La différence doit se voir au premier
coup d'œil sur chaque ligne du fil** — pas seulement au clic. Un message
composé depuis cet écran sur un canal visible du client doit demander une
confirmation explicite avant l'envoi ; il n'y a pas de brouillon silencieux qui
pourrait partir par erreur.

### Composer un message

- Choisir un canal — les canaux visibles du client (courriel, portail) sont
  distingués visuellement des canaux internes (note, Slack interne).
- **Rattacher le message à un élément précis** — une priorité, un rapport, une
  facture, un contact précis (session 7.1). C'est ce qui évite les « c'est quoi
  ce chiffre ? » sans contexte, déjà identifié comme un besoin en session 5.2.
- Pièces jointes dans les deux sens.
- Si le canal choisi n'est pas connecté (Slack, WhatsApp — voir Paramètres),
  le geste d'envoi doit le dire clairement plutôt que d'échouer en silence.

### Filtrer et retrouver

Par canal, par contact, par période. Un client suivi depuis plusieurs années
avec un rédacteur assidu peut accumuler des centaines d'entrées — le fil doit
rester utilisable, pas seulement complet.

## La frontière avec le portail

Les messages échangés sur le portail (`/portail/echanges`) apparaissent tels
quels dans ce fil — **ce n'est pas une copie, c'est la même donnée vue des deux
côtés**. Une réponse composée ici sur le canal « portail » doit apparaître côté
client sans ressaisie. Ne redessine pas le fil du portail : cet écran en est le
sur-ensemble, côté agence.

## États

Aucune communication — client tout juste signé · fil actif normal · message
client en attente de réponse de l'agence, mis en évidence · long historique,
groupé par mois · canal non connecté (Slack, WhatsApp) avec geste vers
Paramètres pour le connecter.

## Ce qu'il ne faut pas faire

- Ne pas transformer ça en messagerie instantanée — même principe que le
  portail (session 5.2) : un rythme professionnel, pas un chat en direct.
- Ne pas permettre l'envoi d'un message visible du client sans confirmation.
- Ne pas dupliquer le fil du portail : une seule source de vérité.
