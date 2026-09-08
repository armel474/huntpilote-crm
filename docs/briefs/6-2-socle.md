# Session 6.2 — Connexion agence et états système

## Contexte — à conserver tel quel dans le prompt

Projet **HuntPilote** : cockpit de livraison client pour une agence web et SEO
québécoise. Interface en français, montants en dollars canadiens.

Reprends le design system existant du projet, sans le réinventer : base beige
`#F2EFEA`, accent vert `#16A34A`, violet `#7C3AED` réservé à l'IA, sévérités
critique / important / opportunité, thème clair et sombre.

Règles de fond : interface dense mais lisible ; aucune métrique décorative ; les
statuts ne reposent jamais uniquement sur la couleur ; libellés de boutons
concrets en français.

---

## Deux sujets

1. **Connexion agence**, route `/connexion`
2. **Les états système**, transversaux à toute l'application

---

## Connexion agence

Aucune authentification n'existe aujourd'hui. L'agence est mono-utilisateur pour
l'instant, mais les quatre rôles sont déjà nommés dans les paramètres et un
deuxième utilisateur arrivera.

À concevoir : connexion par courriel et mot de passe, mot de passe oublié,
invitation d'un membre — l'écran que reçoit quelqu'un d'invité —, et la première
connexion d'un membre invité.

Reste sobre : c'est un outil interne, pas un produit grand public. Pas d'argumentaire
de vente sur une page de connexion.

---

## Les états système

C'est le sujet le plus important de cette session, et le plus négligé. La fiche
client a ses sept états UX ; **les autres écrans n'en ont aucun**.

Conçois un jeu cohérent, réutilisable partout :

### Chargement

Des silhouettes qui respectent la forme du contenu attendu, pas un tourniquet
centré. L'utilisateur doit voir se dessiner ce qui arrive.

### Vide

Trois vides différents, qui ne se ressemblent pas :

- **Vide initial** — rien n'a encore été créé. Explique et propose le premier
  geste.
- **Vide de filtre** — il y a des données, mais pas avec ces critères. Propose
  d'élargir.
- **Vide sain** — aucune priorité critique, aucune facture en retard. C'est une
  bonne nouvelle, pas une absence : le ton doit le refléter.

### Erreur

- **Erreur de chargement** — avec un bouton réessayer qui fonctionne.
- **Chargement partiel** — une source a répondu, l'autre non. Montre ce qui est
  disponible plutôt que de tout masquer.
- **Intégration déconnectée** — le cas le plus fréquent en production, et celui qui
  dégrade silencieusement les rapports. Il doit être bruyant.
- **Données périmées** — avec l'âge des données et le geste pour rafraîchir.

### Permission

Ce à quoi un rôle n'a pas accès. Utile même avec un seul utilisateur : ça évite de
reconcevoir tous les écrans le jour du deuxième.

### Le principe

Un message d'erreur dit **ce qui s'est passé** et **comment le réparer**. Pas
d'excuse, pas de vague. « Impossible de charger les positions : Search Console
n'est plus connecté. Reconnecter. » vaut mieux que « une erreur est survenue ».

## Ce qu'il ne faut pas faire

- Ne pas concevoir un seul état vide générique pour toute l'application.
- Ne pas traiter un vide sain comme un échec.
