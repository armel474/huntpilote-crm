# Protocole de vérification — étapes 1 à 4 de l'Agence hub

> **Pour Armel, avant l'étape 5.** Tout ce qui a été livré jusqu'ici (Client
> hub et pipeline sur la base, Agence hub avec profil, équipe, catalogue,
> offres et modèles de documents) a été vérifié en local avec des données
> semées et des tests automatiques, jamais en production par une personne
> connectée. Ce protocole fait cette vérification-là. Fais-le **sur la
> production** (`huntpilote-crm.vercel.app`), après fusion de la PR nº 5.
>
> **Comment consigner.** Pour chaque test, note dans la colonne « Résultat »
> : `OK`, `KO` ou `?` (pas sûr), et en cas de `KO` ou `?`, ce que tu as vu —
> le message exact, une capture d'écran, l'adresse de la page. Le plus utile
> pour moi : **le texte des messages d'erreur tel quel**, et **ce que la base
> contient après l'action** (Supabase → Table Editor), pas seulement ce que
> l'écran montre. Renvoie-moi ce fichier rempli, ou la liste des `KO` et `?`
> avec leurs notes.
>
> **Ordre.** Les sections se suivent : A prépare, B connecte, C à H
> parcourent les écrans, I vérifie la base, J teste les refus avec un second
> compte, K le rendu, L la mise en service. Compte environ deux heures.

---

## A. Préparation

| # | Action | Attendu | Résultat |
|---|---|---|---|
| A1 | Fusionner la [PR nº 5](https://github.com/armel474/huntpilote-crm/pull/5) sur `main`, attendre que Vercel affiche le déploiement de production **Ready**. | Le commit de production est celui de la fusion. | |
| A2 | Supabase → Table Editor → `document_template` : compter les lignes et vérifier que `body_html` est rempli pour chacune. | **6 lignes**, aucune avec `body_html` vide. | |
| A3 | Supabase → Table Editor → `document_template_section` : compter. | **9 lignes** (8 pour « Proposition de services », 1 pour l'Annexe A). | |
| A4 | Supabase → Database → Migrations (ou Table Editor → `supabase_migrations.schema_migrations`) : la dernière migration. | `0023_corps_des_modeles` est présente. | |
| A5 | Préparer **un second compte** de test : une adresse courriel à toi que tu n'utilises pas encore dans HuntPilote (ex. un alias `+test`). Il servira à la section J. | Adresse notée ici : ______ | |
| A6 | Noter le navigateur et la version utilisés, et si tu testes aussi sur téléphone, lequel. | Navigateur : ______ · Téléphone : ______ | |

## B. Connexion

| # | Action | Attendu | Résultat |
|---|---|---|---|
| B1 | Ouvrir `/connexion` dans une fenêtre privée. Se connecter par **mot de passe**. | Tu arrives sur le tableau de bord, ton nom apparaît en bas de la barre latérale. | |
| B2 | Se déconnecter. Se reconnecter par **lien magique** : demander le lien, l'ouvrir depuis le courriel. | Même résultat. Le courriel arrive en moins de deux minutes. | |
| B3 | Se déconnecter. Se reconnecter par **Google**. | Même résultat, sans écran d'erreur Supabase entre les deux. | |
| B4 | Une fois connecté, ouvrir `/parametres?section=profil` (ancienne adresse). | Redirigé vers `/agence?section=profil`. | |
| B5 | Fermer l'onglet, rouvrir `huntpilote-crm.vercel.app`. | Toujours connecté, sans repasser par `/connexion`. | |

## C. Agence hub — accueil, profil, équipe

| # | Action | Attendu | Résultat |
|---|---|---|---|
| C1 | Ouvrir `/agence`. Lire les six cartes de l'accueil. | Chaque carte porte un état (vert, jaune, rouge ou neutre) et un texte chiffré qui correspond à ce que tu sais de la base : nombre de membres, d'articles, d'offres, sortes de documents couvertes (**6 sur 6**), devis en attente, factures en retard. | |
| C2 | Cliquer chaque carte. | Chacune ouvre sa section ; l'adresse devient `/agence?section=…` ; le bouton « Retour » du navigateur ramène à l'accueil. | |
| C3 | **Profil** : modifier un champ anodin (le site web, ou le poste du représentant), enregistrer, recharger la page. | Message « enregistré », la valeur tient au rechargement. Supabase → `agency` : la colonne a changé. | |
| C4 | **Profil** : vider le champ NEQ, enregistrer, puis remettre un NEQ à **9 chiffres**. | Le vide est accepté ; le NEQ à 9 chiffres est **refusé** avec un message clair (il en faut 10). Remettre le bon NEQ ensuite. | |
| C5 | **Profil** : téléverser un logo (PNG ou JPG, moins de 2 Mo), enregistrer, recharger. | Le logo s'affiche dans le profil. Supabase → Storage → `public-assets` : le fichier est là, dans un dossier au nom de l'agence. | |
| C6 | **Équipe** : ta ligne porte la mention **VOUS**. Ouvrir ta fiche, changer ton poste, enregistrer. | Enregistré. La case « Compte actif » et le droit « Gérer l'équipe » sont **verrouillés** sur ta propre fiche. | |
| C7 | **Équipe** : sur ta propre fiche, tenter de changer ton rôle vers **Rédaction**. | Refusé avec un message qui explique que tu perdrais la gestion d'équipe. Ton rôle n'a pas changé (recharger pour le confirmer). | |
| C8 | **Équipe** : **Inviter** le second compte de A5, rôle **Rédaction**, aucun droit coché en plus. | La ligne apparaît avec la mention « invitation en attente ». Supabase → `member` : une ligne avec `accepted_at` vide et ton courriel de test. | |
| C9 | **Équipe** : ouvrir la fiche de l'invité, cocher le droit **« Gérer le catalogue »**, enregistrer, puis le décocher et enregistrer. | Les deux enregistrements passent. Supabase → `member_permission` : une ligne apparaît puis disparaît (ou passe à refusé). | |
| C10 | **Équipe** : téléverser une photo sur ta fiche. | La photo s'affiche dans la liste et dans la barre latérale (après rechargement). | |

## D. Catalogue

| # | Action | Attendu | Résultat |
|---|---|---|---|
| D1 | **Catalogue** : compter les lignes des deux tableaux. | **49 articles** au total (services et produits), dont les dix services de maintenance ajoutés le 16 septembre. | |
| D2 | Créer un **service** « Test protocole » à 100 $, actif. | Il apparaît en bas de son tableau, avec un code généré depuis le nom. Le champ « facturation » est forcé à *reconduit* pour un service. | |
| D3 | Créer un **produit** « Produit test », sans prix. | Créé. La carte d'accueil « Catalogue » compte maintenant un article sans prix de plus. | |
| D4 | Ouvrir « Test protocole », changer le prix à 120 $, enregistrer. | La ligne montre 120 $. | |
| D5 | Glisser « Test protocole » d'une position vers le haut, recharger la page. | L'ordre tient au rechargement. | |
| D6 | Ouvrir un article utilisé par une offre (ex. un service du forfait Présence Digitale) : lire « Où cet article est utilisé ». | La liste des offres qui l'utilisent est exacte. Cliquer une offre ouvre le constructeur. | |
| D7 | Sur ce même article, cocher **Archiver** sans enregistrer. | Un avertissement dit qu'il est utilisé par N offres actives et qu'il y restera. **Ne pas enregistrer** : fermer le panneau. | |
| D8 | Archiver « Produit test » (non utilisé), enregistrer. | La ligne passe en grisé « archivé ». Supabase → `catalog_item` : `active = false`. | |
| D9 | Sur téléphone ou fenêtre étroite : le tableau reste lisible, le panneau latéral s'ouvre en plein écran. | Aucun débordement horizontal. | |

## E. Offres

| # | Action | Attendu | Résultat |
|---|---|---|---|
| E1 | **Offres** : compter les cartes. | **9 offres** : 3 forfaits web, 3 packs SEO, 3 packs de maintenance. Les trois maintenances portent 200, 450 et 750 $/mois. | |
| E2 | Ouvrir **Maintenance Essentiel** : lire les prix, heures incluses, taux de dépassement, « Idéal avec ». | 200 $/mois, 2 h, 95 $/h au-delà, idéal avec Présence Digitale. L'aperçu à droite montre la même chose. | |
| E3 | Dans **Présence Digitale**, changer l'accroche, observer l'aperçu, puis **quitter sans enregistrer** (bouton Retour). | L'aperçu suit chaque frappe ; une confirmation demande si tu veux quitter sans enregistrer. Annuler. | |
| E4 | Enregistrer ce changement d'accroche, recharger. | « Enregistrer l'offre » était grisé avant la modification, actif après ; la nouvelle accroche tient au rechargement. Supabase → `offer.tagline` a changé. | |
| E5 | Dans la même offre : ajouter l'article « Test protocole » aux lignes, enregistrer, recharger. | La ligne est là. Supabase → `offer_line` : une ligne de plus pour cette offre. | |
| E6 | Ajouter un **livrable promis** (« Livrable test », 1 ronde) et une **tâche engagée** (« Tâche test »), enregistrer, recharger. | Les deux tiennent. Supabase → `offer_deliverable_template` et `offer_task_template` : une ligne chacune. | |
| E7 | Retirer « Livrable test » et « Tâche test », enregistrer. | Retirés à l'écran et dans la base. Les autres tâches de l'offre ont gardé **le même identifiant** (Supabase : la colonne `id` n'a pas changé pour les tâches existantes). | |
| E8 | **Nouvelle offre** : nom « Offre test », prix 1 000 $, une ligne, un bénéfice ; enregistrer. | Elle apparaît dans la liste, inactive ou active selon l'interrupteur. L'adresse porte son identifiant. | |
| E9 | Désactiver « Offre test » avec l'interrupteur de sa carte. | La carte passe en inactif immédiatement, tient au rechargement. | |
| E10 | Dans une offre, essayer d'inclure une offre qui l'inclut déjà (boucle) — par exemple inclure un forfait web dans un pack qui y renvoie. | Le choix est absent ou refusé avec un message ; aucune boucle possible. | |

## F. Modèles de documents

| # | Action | Attendu | Résultat |
|---|---|---|---|
| F1 | **Modèles de documents** : compter. | **6 modèles**, un par sorte sauf *Proposition* qui en a deux ; tous « Par défaut » sauf « Proposition — Acquisition Meta Ads » ; aucun badge « Sans corps » ni « Incomplet » ; *Avenant* dit « aucun modèle ». | |
| F2 | Ouvrir **Proposition de services**. Lire la barre d'analyse. | « 68 balises reconnues », 17 blocs, « Complet — prêt pour le générateur ». Colonne de gauche : 8 sections. | |
| F3 | L'aperçu à droite : le logo de l'agence (C5), le nom SHGM, la date du jour, les offres du catalogue dans « Nos forfaits » (F1 → page 4), les packs de maintenance dans le tableau de la page 5. | Rien de « {{…}} » surligné en jaune, sauf éventuellement `brief.*` si le contrat semé n'a pas de brief. Noter ce qui est surligné : ______ | |
| F4 | Changer le client d'exemple pour « nom long ». | La couverture et les signatures restent lisibles avec le nom long. | |
| F5 | Cliquer **Aperçu impression**, puis Ctrl+P dans la nouvelle fenêtre (sans imprimer) : regarder l'aperçu d'impression du navigateur. | Format Lettre, pages qui se suivent sans contenu coupé au milieu d'une carte. Noter le nombre de pages : ______ | |
| F6 | Cliquer **Dictionnaire des balises**, cliquer une balise. | Le panneau s'ouvre à droite ; le clic copie la balise dans le presse-papiers (coller dans un champ pour vérifier). | |
| F7 | Dans le corps, ajouter à la fin `<p>{{client.nom_commercial}} {{ENTREPRISE_CLIENT}} [VILLE]</p>`. | La barre d'analyse signale **1 balise inconnue** avec la suggestion `{{client.nom}}`, et **2 formes héritées** avec le bouton « Convertir en balises canoniques ». Le statut passe à « Incomplet ». | |
| F8 | Cliquer **Convertir en balises canoniques**. | Les deux formes héritées deviennent `{{client.nom}}` et `{{client.ville}}` ; il reste la balise inconnue. Retirer la ligne ajoutée. | |
| F9 | Modifier le texte **Mentions légales** (onglet « Textes du modèle »), enregistrer, recharger. | « Modèle enregistré » ; la valeur tient. Supabase → `document_template.legal_mentions` a changé. | |
| F10 | Ajouter une **section** « Test » (clé `test`, titre « Section test »), enregistrer. | L'analyse signale une **section non placée** (`{{section.test}}` absent du corps) tant qu'elle n'est pas dans le corps. Supabase → `document_template_section` : 10 lignes. | |
| F11 | Cocher **Clause verrouillée** sur cette section. | La case **IA** se décoche d'elle-même et se grise. Enregistrer : passe. | |
| F12 | Retirer la section « Test », enregistrer. | Supabase : retour à 9 lignes. | |
| F13 | **Nouveau modèle** → sorte *Devis*, « Copie de Devis standard ». | La copie s'ouvre, nommée « Devis standard (copie) », avec le même corps ; elle n'est **pas** par défaut. | |
| F14 | Depuis la liste, **Rendre par défaut** la copie, puis remettre « Devis standard » par défaut. | Un seul « Par défaut » à la fois dans la sorte *Devis*. | |
| F15 | **Nouveau modèle** → sorte *Avenant*, page vierge. | Créé, nommé « Nouveau modèle », **par défaut** (première de sa sorte), badge « Sans corps ». La carte d'accueil dit maintenant **6 sortes sur 6**. | |
| F16 | Ouvrir **Contrat de services professionnels** : aperçu. | Montant, TPS, TVQ, total, acompte et solde du contrat SHGM apparaissent ; les articles 1 à 18 se suivent ; aucune page « Dictionnaire des tokens ». | |
| F17 | Ouvrir **Annexe A** : aperçu. | Les tableaux Livrables, Jalons, Contenu à fournir et Exclusions sont remplis avec les lignes du contrat SHGM. | |
| F18 | Ouvrir **Devis standard** et **Facture standard** : aperçu. | Lignes du dernier devis, sous-total, TPS 5 %, TVQ 9,975 %, total. | |

## G. Client hub

| # | Action | Attendu | Résultat |
|---|---|---|---|
| G1 | Ouvrir `/clients`. Compter. | **9 comptes** : 4 clients, 4 prospects du semis, plus Ébénisterie Rivard (prospect). Les filtres Tous / Clients / Prospects donnent 9 / 4 / 5. | |
| G2 | Basculer grille / liste, chercher « SHGM ». | La recherche filtre ; les deux vues montrent les mêmes comptes. | |
| G3 | Ouvrir la fiche d'un client. | La fiche s'ouvre. **Attendu et connu** : cette fiche tourne encore sur les données de démonstration de `lib/data/`, pas sur la base — c'est la prochaine migration d'écran. Noter simplement si elle s'ouvre sans erreur. | |

## H. Pipeline

| # | Action | Attendu | Résultat |
|---|---|---|---|
| H1 | Ouvrir `/pipeline`. | Les opportunités du semis, réparties par étape ; Ébénisterie Rivard est en découverte avec un score d'audit. | |
| H2 | Glisser une opportunité vers l'étape suivante, recharger. | Elle y reste. Supabase → `deal.stage` et `stage_since` (date du jour) ont changé. | |
| H3 | Ouvrir une opportunité, **Consigner un échange** (type appel, un résumé). | L'échange apparaît dans le fil. Supabase → `communication` : une ligne de plus. | |
| H4 | **Marquer perdu** une opportunité de test, **sans motif**. | Refusé : « Le motif de la perte est obligatoire. » | |
| H5 | Marquer perdu **avec motif**. | Passe à l'étape Perdu. Supabase → `deal.lost_reason` rempli. | |
| H6 | **Marquer gagné** une autre opportunité de test. | Passe à Gagné, probabilité 100, `won_at` rempli, prochaine action « Onboarding lancé ». | |

## I. Vérifications dans la base (Supabase → SQL Editor)

Copier-coller chaque requête ; noter le résultat.

| # | Requête | Attendu | Résultat |
|---|---|---|---|
| I1 | `select kind, name, is_default, length(body_html) from document_template order by kind, name;` | 6 lignes (7 après F15), longueurs entre 3 000 et 57 000. | |
| I2 | `select count(*) from document_template where is_default and kind = 'devis';` | **1**, même après F14. | |
| I3 | `select code, name, active from catalog_item order by position;` | « Test protocole » actif, « Produit test » inactif. | |
| I4 | `select name, price_cents, overage_hourly_rate_cents from offer where billing = 'mensuel' order by price_cents;` | Maintenance 20000 / 9500, 45000 / 9000, 75000 / 8500 (+ les packs SEO). | |
| I5 | `select count(*) from offer_deliverable_template;` | Au moins 20 (les livrables promis des neuf offres), sans « Livrable test » après E7. | |
| I6 | `select email, role, accepted_at from member order by created_at;` | Ta ligne avec `accepted_at` rempli ; l'invité avec `accepted_at` vide (avant J). | |
| I7 | `select count(*) from communication where created_at::date = current_date;` | Au moins 1 (H3). | |

## J. Refus et droits — avec le second compte

| # | Action | Attendu | Résultat |
|---|---|---|---|
| J1 | Dans une **fenêtre privée**, se connecter avec le second compte (A5) par lien magique, **avec la même adresse que l'invitation** (C8). | La connexion rattache l'invitation : `/agence` → Équipe montre cette personne comme membre actif, rôle Rédaction. Supabase → `member.accepted_at` rempli. | |
| J2 | Toujours avec ce compte : `/agence?section=profil`. | Lecture seule : les champs sont grisés ou le bouton Enregistrer est verrouillé avec sa raison (« Gérer l'agence » requis). | |
| J3 | `/agence?section=equipe`. | Aucun bouton Inviter actif ; sa propre fiche modifiable (poste, photo), rien d'autre. | |
| J4 | `/agence?section=catalogue` et `?section=offres`. | Lecture seule, bandeau qui le dit ; les boutons verrouillés portent « Gérer le catalogue requis ». | |
| J5 | `/agence?section=modeles`, ouvrir un modèle. | Lecture seule ; « Nouveau modèle » et « Enregistrer » verrouillés ; le corps n'est pas éditable ; l'aperçu et le dictionnaire fonctionnent. | |
| J6 | **Contournement** : avec ce compte, ouvrir le constructeur d'une offre et, dans les outils de développement du navigateur (F12 → Console), taper `document.querySelector('button[type=submit]').disabled = false` puis cliquer Enregistrer. | Le serveur **refuse** : message « Vous n'avez pas le droit… ». Rien n'a changé dans la base. **C'est le test le plus important de cette section.** | |
| J7 | Se déconnecter du second compte. Avec ton compte principal : Équipe → fiche de l'invité → cocher **Gérer le catalogue**, enregistrer. Se reconnecter avec le second compte, ouvrir le catalogue. | Les boutons sont maintenant actifs pour lui ; créer un article passe. | |
| J8 | Avec ton compte principal : **désactiver** le compte de l'invité (case « Compte actif »). Avec le second compte, recharger. | Il ne voit plus l'agence (écrans vides ou message), ou est renvoyé à la connexion. | |
| J9 | Nettoyage : laisser le compte désactivé ou le supprimer dans Supabase → Authentication → Users ; supprimer « Test protocole », « Produit test » et « Offre test » depuis Supabase si tu veux une base propre (ou les laisser archivés). | Base propre ou état noté ici : ______ | |

## K. Rendu — thèmes et petit écran

| # | Action | Attendu | Résultat |
|---|---|---|---|
| K1 | Basculer en **thème sombre** (icône lune en haut à droite), parcourir accueil, catalogue, une offre, un modèle avec son aperçu. | Tout lisible ; l'aperçu du document reste **blanc** (c'est voulu, c'est le papier) ; aucun texte noir sur fond sombre. | |
| K2 | Sur **téléphone** (ou fenêtre à 390 px) : `/agence`, catalogue, une offre, la liste des modèles, l'éditeur d'un modèle. | La navigation du hub est un bandeau horizontal ; aucune page ne défile horizontalement ; les boutons des lignes de la liste des modèles passent à la ligne. | |
| K3 | Sur téléphone : le panneau latéral d'un article et la boîte « Nouveau modèle ». | S'ouvrent en plein écran, se ferment avec la croix. | |
| K4 | Console du navigateur (F12) ouverte pendant K1 : noter toute ligne rouge. | Aucune erreur, hormis d'éventuelles polices bloquées. Coller ici ce qui apparaît : ______ | |

## L. Mise en service (à faire seulement si tout ce qui précède est OK)

| # | Action | Attendu | Résultat |
|---|---|---|---|
| L1 | Vercel → Project → Settings → Environments → Production → ajouter `AUTH_REQUIRED` = `on` (Production seulement), puis **Redeploy**. | Déploiement Ready. | |
| L2 | En fenêtre privée, ouvrir `huntpilote-crm.vercel.app/agence`. | Redirigé vers `/connexion`. | |
| L3 | Se connecter : tout fonctionne comme avant. | Si tu te retrouves enfermé dehors : supprimer la variable et redéployer. | |
| L4 | Supabase → Authentication → Providers → Password → activer **Leaked password protection**. | Activé (l'audit de sécurité ne le signalera plus). | |
| L5 | Remplacer les numéros de **TPS et TVQ** de démonstration par les vrais (Profil), et vérifier qu'ils apparaissent dans l'aperçu du devis (F18). | Les vrais numéros dans l'aperçu. | |

---

## Ce que j'attends en retour

1. Ce fichier avec la colonne Résultat remplie, ou seulement la liste des tests `KO` et `?` avec leurs notes et captures.
2. Les réponses aux blancs : A5, A6, F3, F5, K4, J9.
3. Toute chose qui t'a paru **étrange sans être fausse** : un libellé qui ne dit pas ce que tu attendais, un geste qui demande un clic de trop, un message qui ne t'aide pas. Ce sont ces remarques-là qui améliorent le plus l'étape suivante.

Je continue l'étape 5 (le générateur de documents, maquette 9.4) pendant ce temps ; ce que tu trouveras sera corrigé avant ou avec elle, selon la gravité.
