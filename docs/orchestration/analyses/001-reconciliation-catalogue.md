# Analyse 001 — Réconciliation des offres et des documents

Mission : `../missions/001-reconciliation-catalogue.md`. Rédigée le 14 septembre 2026 sur la branche `claude/laughing-fermat-bd7riu`, créée depuis `docs/orchestration-huntpilote` (commit `62b858f`). Base applicative examinée : `main` au commit `ada3eb2`. Complète [l'analyse générale](https://github.com/armel474/huntpilote-crm/blob/0e46e4bb56eb24f0734aca84ef6d57604e2e59e8/docs/analyse-generateur-propositions.md) de la branche `claude/huntpilote-proposal-generator-5cc3id` sans la réécrire : ses sections 3 et 4 et son annexe A restent la référence pour la syntaxe des balises, le modèle de sections et le parcours cible.

Ce document ne fixe aucune valeur commerciale. Il distingue trois choses, signalées par une étiquette dans chaque ligne :

- **Fait** : ce qu'une source dit, avec son chemin.
- **Recommandation** : ce que l'analyse propose, à confirmer.
- **Décision** : un choix qui revient à Armel ; numéroté `D-nn`, repris à la section 6.

## 1. Sources et abréviations

| Code | Source | Nature |
|---|---|---|
| CAT | `docs/catalogue-agence.md` | Documentation du modèle |
| SEED | `supabase/seed.sql` | Données réelles déclarées (six offres, contrat SHGM) |
| SCH | `supabase/migrations/0012` à `0015b` | Schéma |
| B9.2, B9.3, B9.4 | `docs/briefs/9-2-catalogue-offres.md`, `9-3-modeles-documents.md`, `9-4-generateur-documents.md` | Briefs de conception |
| MK-CAT | `design/HuntPilote - CRM SEO_phase 9/Phase 9 - Agence Hub/hp-cat-data.jsx` | Maquette 9.2 (données de démonstration) |
| MK-TPL | même dossier, `hp-tpl-data.jsx` | Maquette 9.3 |
| MK-GEN | même dossier, `hp-doc-gen-data.jsx`, `hp-doc-gen-panels.jsx` | Maquette 9.4 |
| G-OFF | `design/Documentations DigiHunt/export/Gabarits-DigiHunt/Gabarit Offre de Service.dc.html` | Gabarit réel, proposition web (16 pages) |
| G-META | même dossier, `Gabarit Acquisition Meta Ads.dc.html` | Gabarit réel, proposition acquisition (8 pages) |
| G-CT | `design/Modèle de contrat DigiHunt/Gabarits DigiHunt/GABARIT - Contrat de services DigiHunt.html` | Gabarit réel, contrat |
| G-AN | même dossier, `GABARIT - Annexe A DigiHunt.html` | Gabarit réel, Annexe A |
| AN | `docs/analyse-generateur-propositions.md` (branche citée en tête) | Analyse générale existante |

Deux constats préalables qui expliquent une partie des écarts :

- **MK-CAT n'est pas le catalogue réel.** Ses 39 articles (`PRD-01` à `PRD-16`, `SRV-01` à `SRV-23`) portent des prix unitaires et des libellés qui n'existent nulle part ailleurs ; les 39 articles de SEED (`sitemap-archi`, `pages-10`, `netlinking-3`…) reprennent mot pour mot les listes de G-OFF et n'ont pas de prix. Les deux jeux ont le même nombre d'articles, ce qui a pu masquer la différence. Les valeurs de MK-CAT sont donc des illustrations d'interface, comme `CLAUDE.md` le rappelle pour toutes les maquettes.
- **Le contrat SHGM du semis est un mandat négocié, pas un forfait.** Honoraires 9 750 $, 12 pages statiques, 7 collections CMS, accompagnement 4 à 6 h par mois : aucun des trois forfaits web ne correspond à ces limites. Il sert de vérification des calculs et des jalons, pas de référence tarifaire.

## 2. Matrice des écarts — forfaits web

| # | Champ métier | Sources et valeurs | Impact | Recommandation | Statut |
|---|---|---|---|---|---|
| W1 | Prix plancher des forfaits | SEED `offer.price_cents` 450 000 / 900 000 / 1 300 000, `price_is_from = true` · G-OFF p. 7 à 9 « 4 500 $ / 9 000 $ / 13 000 $, à partir de, paiement unique » · MK-CAT idem · B9.2 idem | Aucun : convergent | Conserver | Fait |
| W2 | Délai de livraison annoncé | SEED `delivery_weeks_min/max` 4–4 / 5–6 / 6–8 · G-OFF « 4 semaines / 5–6 semaines / 6–8 semaines » · MK-CAT 3–5 / 6–9 / 8–12 | La maquette affiche des délais qui ne sont pas ceux vendus | Prendre SEED = G-OFF ; MK-CAT est illustratif | Fait ; voir W12 pour la cohérence avec l'annexe |
| W3 | Consultation gratuite | SEED `free_consult_minutes` 30 pour les trois · G-OFF p. 7 « tous incluent une consultation gratuite de 30 min » · MK-CAT 30 / 45 / 60 | Idem W2 | Prendre SEED = G-OFF | Fait |
| W4 | Forfait « le plus populaire » | SEED `is_popular` Croissance Digitale · G-OFF p. 8 badge sur Croissance · MK-CAT idem | Aucun | Conserver ; rendu par `{{offre.populaire}}` | Fait |
| W5 | Contenu des forfaits (lignes) | SEED : 9 / 7 (+ offre incluse) / 6 (+ offre incluse) articles, identiques aux listes « Services inclus » de G-OFF · MK-CAT : articles différents, dont un groupe d'options « Hébergement chez nous / chez vous » et « Logo et identité visuelle » | Le constructeur d'offres a été dessiné sur un catalogue fictif ; la seule option réelle est « Espace membres *ou* réservation avancée » (SEED `option_group = 'espace-ou-reservation'`, G-OFF p. 8) | À l'intégration, remplacer les données de MK-CAT par SEED ; conserver le mécanisme de groupe d'options, qui est juste | Fait |
| W6 | Hébergement | G-OFF p. 15 « frais d'hébergement, licences tierces (MemberStack, Acuity, Shopify…), domaines… à la charge du client » · G-CT art. 9 idem · G-AN exclusion « Frais récurrents externes » · MK-CAT `SRV-01` « Hébergement web géré 35 $/mois » inclus dans Présence Digitale, bénéfice « Hébergement et nom de domaine pris en charge » | La maquette contredit les trois documents réels | L'hébergement n'est pas une ligne d'offre ; il relève de la section narrative « Coûts externes » et, au besoin, d'une ligne `informatif` (voir L3) | Fait |
| W7 | Limites des forfaits (pages, collections, produits) | G-OFF : Présence « max. 10 pages », « jusqu'à 10 pages + 1 collection CMS » ; Croissance « jusqu'à 20 pages + 5 collections » ; Commerce « jusqu'à 100 produits » · SEED : mêmes valeurs, mais **dans le libellé** des articles `pages-10`, `pages-20`, `produits-100` (unité `lot`, quantité 1) · G-AN L-03 `[NOMBRE DE PAGES]`, L-04 `[NOMBRE DE COLLECTIONS CMS]` : paramètres par mandat · SEED contrat SHGM : 12 pages, 7 collections pour 9 750 $ | Une limite enfermée dans un libellé ne se compare pas, ne se rend pas dans l'annexe et ne signale pas un dépassement. Le mandat réel prouve que la limite se négocie | Typer les limites (pages, collections, produits) comme quantités de l'offre, reprises par le livrable du contrat avec surcharge par mandat ; le composeur signale « 12 pages demandées, forfait à 10 » | **D-04** |
| W8 | Pack SEO de démarrage | G-OFF p. 7 à 9 : chaque forfait inclut un « Pack SEO de démarrage » (Présence : 10 mots-clés, GBP, indexation, 1 article 800 mots, rapport initial ; Croissance : 20 mots-clés, SEO local + 5 citations, GBP + Bing, 2 articles 1 000 mots, rapport ; Commerce : 30 mots-clés, 10 citations, 3 articles 1 200 mots, white hat, rapport complet) ; p. 4 et 13 le répètent · SEED : aucun article, aucune ligne · MK-CAT : « suivi de positions 3 mois inclus », notion différente · G-AN exclusion « Prestation SEO » : audit, mots-clés, GBP et suivi de positionnement **non inclus** | Un client qui lit la proposition attend du SEO ; un client qui lit l'annexe n'en a pas. Le générateur ne peut rendre la section 04 depuis la base | Trois articles « Pack SEO de démarrage » (S, M, L) au catalogue, en ligne de chaque forfait ; l'exclusion SEO de l'annexe devient conditionnelle (rendue seulement si aucun pack n'est vendu) | **D-02** |
| W9 | Suivi et accompagnement après livraison | G-OFF p. 11 phase 6 « Suivi & Maintenance 3 mois » pour tous les forfaits · G-AN L-11 « 4 à 6 h par mois pendant 3 mois », non cumulables, dépassement 100 $/h · SEED `support_period` sur le contrat SHGM seulement ; rien sur `offer` · CAT « ni un abonnement ni une tâche » · G-CT 10.3 « au-delà de [30 jours], maintenance distincte » | On ne sait pas si l'accompagnement 3 mois est standard ni combien d'heures chaque forfait inclut | Attribut de l'offre (mois, heures min et max, taux de dépassement) ou article « Accompagnement post-lancement » ; rendu par un bloc `{{#accompagnement}}` dans la proposition et l'annexe | **D-03** |
| W10 | Rondes de révision | G-AN : L-01 1 ronde, L-02 2 rondes, L-03 à L-08 1 ronde, L-09 incluse dans L-03/L-04, L-10 et L-11 sans objet ; au-delà 100 $/h · SEED `deliverable.included_rounds` identiques · MK-CAT livrables fictifs (2 / 2 / 1) · G-OFF : aucune mention des rondes · B9.2 section 5 prévoit les livrables d'une offre avec rondes ; la passation (§3) note que le lien offre → livrable n'existe pas en base | La proposition promet des livrables sans dire combien de rondes ; le contrat le dit. Rien ne relie l'offre vendue aux livrables L-nn | Gabarits de livrables par offre (comme B9.2 le demande) ; la proposition les rend en section 06 ou 09 ; le contrat les copie | Fait ; modélisation aux missions de code |
| W11 | Garantie, acceptation tacite, date butoir de contenu | G-CT 10.1 : 30 jours · 4.3 : 5 jours ouvrables · G-AN §4 : 60 jours · SEED `warranty_days 30`, `acceptance_business_days 5`, `content_deadline_days 60` · G-META : livrables client attendus sous 48 h | Convergent pour le web ; le régime Meta est différent | Valeurs par défaut sur le modèle de contrat, surchargeables par contrat | Fait |
| W12 | Délai de livraison et jalons de l'annexe | G-OFF « 4 semaines » (Présence) · G-AN : J-03 = J-01 + 14 j, J-04 = J-03 + 7, J-05 = J-04 + 21, J-06 = J-05 + 30, J-07 = J-06 + 7, solde payable sous 15 j, J-10 = J-09 + 7 · Calcul : du contenu reçu (J-03) au site livré (J-06) : 58 jours, soit un peu plus de 8 semaines ; de la signature à la mise en ligne : environ 101 jours | Le délai vendu et l'échéancier contractuel ne mesurent pas la même chose, et même la mesure la plus favorable dépasse le délai annoncé | Définir ce que compte `delivery_weeks` (recommandation : temps prestataire entre J-03 et J-06) et réviser soit les délais annoncés, soit les décalages des jalons | **D-05** |
| W13 | Migration WordPress → Webflow | G-OFF légende : « service autonome, ajouter si une migration est nécessaire » · SEED : absent · MK-CAT `PRD-09` « Migration d'hébergement 450 $ » (autre chose) | Un service vendu n'a pas d'article | Créer l'article (prix à fournir) | Absence de donnée ; prix **D-13** |
| W14 | Trois cartes ou une seule dans la proposition | G-OFF légende : « gardez uniquement la page du forfait choisi et retirez les deux autres » · AN 3.4 propose un bloc `{{#offres}}` sur toutes les offres actives | Deux lectures du gabarit | Bloc `{{#offres}}` sur les **offres présentées**, choisies dans le composeur ; par défaut la seule offre recommandée, comme la légende ; option « comparer les trois » | **D-06** |
| W15 | Remise catalogue et remise commerciale | CAT et B9.2 : « valeur catalogue 1 240 $ · remise 540 $ » = somme des lignes moins prix du forfait · G-META : « escompte de bienvenue −25 % » sur un document · SEED : prix unitaires vides, donc valeur incalculable | Le mot « remise » désigne deux choses | Réserver « remise » à la ligne de document (nature `remise`) ; appeler « économie par rapport à la valeur catalogue » l'écart d'une offre | Recommandation |

## 3. Matrice des écarts — maintenance, packs SEO, acquisition

| # | Champ métier | Sources et valeurs | Impact | Recommandation | Statut |
|---|---|---|---|---|---|
| M1 | Packs de maintenance | G-OFF p. 10 : Essentiel 200 $/mois (2 h, 95 $/h au-delà, maintenance technique et mises à jour Webflow, suivi SEO de base, rapport mensuel, sauvegardes, « idéal avec Présence Digitale ») ; Croissance 450 $/mois (4 h, 90 $/h, tout Essentiel + 1 page/mois, Clarity, suivi et formation 30 min/mois, idéal avec Croissance Digitale) ; Partenaire Stratégique 750 $/mois (8 h, 85 $/h, support prioritaire < 24 h, audit SEO trimestriel, redesign 2 sections/mois, point stratégique bimensuel, idéal avec Commerce Digital) ; « sans engagement, 30 jours de préavis » ; p. 7, 9, 15 « à partir de 200 $/mois » · G-AN exclusion 13 : « Pack Croissance, 450 $/mois » · SEED : aucune offre de maintenance ; `contract_exclusion` 13 pointe vers **Visibilité Locale** (pack SEO) · MK-CAT : `SRV-23` « Maintenance et mises à jour 40 $/mois », `SRV-15` « Support prioritaire 90 $ », pas de pack · AN 3.4 | Le générateur ne peut pas recommander une maintenance absente de la base ; le semis renvoie l'exclusion vers un produit qui n'est pas de la maintenance | Trois offres mensuelles de maintenance au catalogue, avec heures incluses et taux de dépassement ; corriger l'exclusion 13 du semis vers l'offre de maintenance | **D-01** |
| M2 | Taux horaire de dépassement | G-OFF : 95 / 90 / 85 $/h selon le pack · G-AN 2.1 et 3.4, SEED `hourly_rate_cents 10000` : 100 $/h · MK-CAT `SRV-18` consultation 145 $/h | Quatre taux pour une même notion | Un taux par offre ou par contrat, jamais global ; choisir la grille | **D-01** |
| M3 | Ce que « recommandé ensuite » désigne | SEED `recommended_offer_id` : Présence → Visibilité Locale, Croissance → Croissance SEO, Commerce → Domination SEO (et retour) · G-OFF : « idéal avec » **un pack de maintenance** · MK-CAT idem SEED · B9.2 « une seule » | Un seul emplacement pour deux familles (maintenance, SEO) | Deux recommandations typées par offre : maintenance recommandée et pack SEO recommandé ; balises `{{maintenance_recommandee.*}}` et `{{seo_recommande.*}}` | **D-01** |
| M4 | Prix des packs SEO : fixe ou plancher | SEED `price_is_from = true` sur Visibilité Locale, Croissance SEO, Domination SEO · MK-CAT `prixType: 'fixe'` · B9.2 « 400 $, 700 $, 1 100 $ » sans « à partir de » · CAT réserve « à partir de » aux forfaits web | Un abonnement à prix plancher n'a pas de mensualité déterminée | Prix fixes pour les packs mensuels ; le tarif d'entrée couvre la promotion | **D-09** |
| M5 | Tarif d'entrée des packs SEO | SEED `intro_price_cents null`, commentaire « à compléter » · CAT et passation : « 3 premiers mois à tarif préférentiel », montant inconnu · MK-CAT Croissance SEO 525 $ × 3 (soit 75 % de 700 $) · B9.2 exemple « 525 $ les 3 premiers mois » | La valeur 525 circule dans deux documents sans avoir été décidée | Ne rien semer tant que le montant n'est pas fourni ; le brief 9.2 doit dire que 525 est un exemple | **D-09** |
| M6 | Contenu des packs SEO | SEED Visibilité Locale : suivi mots-clés locaux, GBP, 2 posts GBP, 3 citations, rapport local, Search Console ; Croissance SEO : + stratégie, 2 articles 1 000 mots, on-page, rapport complet, 6 citations ; Domination : + 4 articles 1 200 mots, white hat, audit trimestriel, analyse concurrentielle, 10 citations, point stratégique · Tâches SEED : Croissance « 3 citations supplémentaires » (3 + 3 = 6, cohérent) ; Domination « 4 citations supplémentaires » (6 + 4 = 10, cohérent) ; Domination « 2 articles supplémentaires (1 200 mots) » alors que l'article dit « 4 articles (1 200 mots) » : 2 × 1 000 + 2 × 1 200 · Recoupement avec G-OFF : « audit SEO trimestriel » est aussi dans le pack de maintenance Partenaire Stratégique ; « suivi SEO de base » dans Essentiel · MK-CAT : contenu différent (Google Ads et réseaux sociaux dans Domination) | Deux familles récurrentes se recouvrent partiellement ; un client qui prend les deux paierait deux fois l'audit trimestriel | Clarifier la frontière maintenance / SEO ; corriger le libellé « 4 articles » ou la tâche ; les recouvrements sont un argument de plus pour D-01 | **D-01** |
| M7 | Acquisition Meta : structure | G-META : Phase 1 ponctuelle (landing page 700 $ + configuration Meta 500 $ = 1 200 $, escompte 25 % = −300 $, soit 900 $) ; Phase 2 mensuelle optionnelle 295 $/mois, engagement 3 mois = 885 $ ; total honoraires 1 785 $ · La légende présente ces montants comme des « valeurs exemple » · SEED : aucune offre ni article · MK-CAT `SRV-21` « Google Ads, prix variable », `PRD-06` « Landing page 650 $ » · `decisions.md` nº 7 : publicités « à l'horizon, à ne pas rendre impossible » · SCH `offer.billing` a une seule valeur : une offre ne peut pas être à la fois ponctuelle et mensuelle | Il n'y a pas d'offre à recommander ; la structure en deux phases ne rentre pas dans une offre | Deux offres liées : « Acquisition Meta — Mise en place » (ponctuelle, deux articles) et « Acquisition Meta — Gestion mensuelle » (mensuelle, engagement minimal) ; la seconde est la recommandée de la première ; l'engagement minimal est un attribut à ajouter | **D-08** |
| M8 | Budget média externe | G-META p. 5 : budget Meta 1 800 $ sur 3 mois (600 $/mois, 20 $/jour), « distinct de ces honoraires… facturé directement sur votre carte par Meta », affiché dans « Investissement total estimé » 3 585 $ · Aucune autre source · AN 4.3 : nature `informatif` | Un montant affiché, jamais facturé ni taxé, qui doit pourtant apparaître dans un total « estimé » | Ligne de nature `informatif` : hors sous-totaux, hors taxes, rendue dans un bloc « Budget média » et dans un total « estimé » libellé « non facturé par l'agence » | Recommandation |
| M9 | Escompte de bienvenue | G-META : −25 % sur la Phase 1, ligne « optionnelle » · G-OFF : pas d'escompte, mais un « bonus à la signature » offert (W-B1) · SEED, MK : rien | On ne sait pas si l'escompte est standard, plafonné ou libre | Ligne de nature `remise`, saisie en pourcentage ou en montant, visible avec le prix avant remise ; règle d'autorisation à définir | **D-08** |
| M10 | Bonus à la signature | G-OFF p. 13 : `{{BONUS_SIGNATURE}}` « Offert », « valide si la proposition est acceptée avant {{DATE_EXPIRATION}} » ; légende : « masquer si aucun bonus » · Aucune liste de bonus possibles | Le composeur doit pouvoir ajouter une ligne offerte, conditionnée à l'acceptation avant expiration | Ligne de nature `offert` (montant affiché à zéro, article facultatif), bloc conditionnel `{{#si lignes_offertes}}` | Recommandation ; liste des bonus = absence de donnée |
| M11 | Engagement et résiliation des récurrents | G-OFF p. 10 et 13 : maintenance « sans engagement, résiliable avec 30 jours de préavis, facturation mensuelle » · G-META : Phase 2 « engagement initial de 3 mois » · Packs SEO : rien dans SEED ni G-OFF · SCH : aucun attribut d'engagement | Le générateur ne sait pas quoi écrire sous une ligne récurrente | Attribut par offre : engagement minimal en périodes, préavis en jours ; balises `{{offre.engagement_mois}}`, `{{offre.preavis_jours}}` | **D-08** pour Meta, **D-09** pour les packs SEO |
| M12 | Facturation des récurrents | G-META : « facturée au début de chaque mois, dès le lancement » · G-OFF : « facturation mensuelle » · SEED `invoice.period_month` · Packs SEO : non dit | Convergent sur le principe | Facture au début de la période ; le tarif d'entrée s'applique aux `intro_periods` premières factures | Fait |

## 4. Matrice des écarts — documents, paiement, identité

| # | Champ métier | Sources et valeurs | Impact | Recommandation | Statut |
|---|---|---|---|---|---|
| P1 | Échéancier de paiement des forfaits | G-OFF p. 7, 13, 15 : « 50 % à la signature, 50 % à la livraison » · G-CT 6.2 : acompte 50 % « à la signature… avant le début des travaux » ; solde 50 % « facturé à la livraison finale… payable dans les 15 jours » · G-AN J-07 → J-08 → J-09 → J-10 : le solde est facturé à l'approbation finale et **la mise en ligne suit le paiement** (art. 8.2) · G-META : solde « à la livraison et mise en ligne » · SEED `payment_milestone` : acompte à la signature (0 j), solde au jalon J-08 (15 j) · MK-TPL `tpl-prop` : « 50 % à l'**acceptation**, solde à la livraison » · B9.4 : « facture d'acompte depuis le contrat (50 % à la signature, lu dans l'échéancier) » | « À la livraison » ne dit pas la même chose dans la proposition (site en ligne) et dans l'annexe (avant mise en ligne). « À l'acceptation » de la maquette n'est ni l'un ni l'autre | L'échéancier est une donnée de l'offre, rendue par `{{#paiements}}` dans les trois documents avec le même libellé ; recommandation de libellé : « 50 % à la signature du contrat, 50 % à l'approbation finale, avant mise en ligne » | **D-07** |
| P2 | Délai de règlement du solde | G-OFF p. 15 : « à régler dans les 15 jours, factures payables sous 15 jours » · G-CT 6.2 : 15 jours · SEED `payment_milestone.terms_days 15`, mais `document_template` facture `payment_terms_days 30` et devis 30 · G-META : « dans un délai de 14 jours suivant la livraison » · MK-TPL facture 15 j, devis 30 j · MK-GEN facture d'acompte 15 j | Trois délais (14, 15, 30) | 15 jours partout pour le web ; aligner G-META ; le modèle de facture du semis passe à 15 ou reste 30 pour les factures récurrentes seulement | **D-07** |
| P3 | Modes de paiement | G-OFF p. 15 : « virement bancaire, Interac » · G-CT 6.3 : « virement bancaire ou carte de crédit (QuickBooks ou Stripe) » · SEED `payment_instructions` : virement ou carte (QuickBooks ou Stripe) · MK-TPL : « virement Interac ou carte via Stripe » | Deux listes différentes dans deux documents signés ensemble | Une seule source : `agence.instructions_paiement` (B9.1) reprise par les trois modèles | **D-07** |
| P4 | Remboursement de l'acompte | G-OFF p. 15 : « non remboursable **après le début du développement** » · G-CT 7.1 : non remboursable **même avant** le début des travaux · G-META : rien | Contradiction entre la proposition et le contrat qu'elle prépare ; en cas de conflit, le contrat prévaut (art. 1.2), mais le client a lu autre chose | Aligner la phrase de la proposition sur le contrat, ou l'inverse ; validation juridique hors périmètre de cette mission | **D-07** |
| P5 | Montants d'acompte : HT ou TTC | G-CT 6.2 : montants « taxes incluses » avec l'équivalent HT entre parenthèses · G-OFF, G-META : montants HT, « + taxes » · MK-GEN : facture d'acompte = 50 % du sous-total HT, taxes ajoutées ensuite (4 370 $ → 5 024,41 $) | Cohérent si le moteur calcule les deux | Balises `{{paiement.montant_ht}}` et `{{paiement.montant_ttc}}` ; la proposition affiche HT, le contrat TTC | Fait |
| P6 | Validité de la proposition | G-OFF légende : `{{DATE_EXPIRATION}}` = date + **10 jours** · G-META : `{{VALIDITE}}` « durée, ex. 14 jours » · SEED `document_template` proposition : « valide 30 jours » ; devis « valide 30 jours » · MK-GEN : propositions à 30 jours, devis à 18 jours (`DV-2026-015`, `DV-2026-013`) · B9.4 : « date d'expiration (devis, proposition) » | Trois durées ; une date et une durée pour la même notion | `validite_jours` par défaut sur le modèle, date calculée et surchargeable par document ; deux balises distinctes (voir dictionnaire) | **D-10** |
| P7 | Taux de taxes | G-CT 6.1 : TPS 5 %, TVQ 9,975 % ; 6.2 : « taux en vigueur à la date de facturation » · SEED `agency_settings.tps_rate/tvq_rate` · MK-GEN constantes · CAT : formule vérifiée sur 9 750 $ (487,50 / 972,56 / 11 210,06) ; contrôle refait ici, exact ; contrôle de MK-GEN sur 8 740 $ : 437,00 / 871,82 / 10 048,82, exact | Convergent ; le gel des taux par document est traité dans AN 4.6 | Conserver | Fait |
| P8 | Numéros de TPS et TVQ de l'agence | SEED : absents (« à compléter ») · passation §1 · B9.4 : envoi verrouillé sans eux · G-CT : n'affiche pas les numéros | Aucun document taxé ne peut partir | Saisir dans Profil ; hors périmètre documentaire | **D-12** (donnée à fournir) |
| P9 | Numérotation | G-CT, G-AN, SEED : contrat « 2026-007 » sans préfixe ; l'annexe « doit correspondre à celui du contrat » ; la proposition a son propre numéro cité par le contrat · SEED `document_template` : devis `DV`-année-3 chiffres, facture `FA`-année-**4** chiffres, proposition et contrat sans préfixe · MK-TPL : `PR`, `DV`, `CT`, `AN`, `FA`, tous à 3 chiffres · MK-GEN : `FA-2026-0031` (4 chiffres), contradictoire avec MK-TPL | L'annexe n'a pas de compteur propre ; le préfixe du contrat n'est pas décidé | Annexe = référence du contrat, sans compteur ; proposition `PR-AAAA-NNN` ; contrat avec ou sans préfixe (`2026-007` existe déjà) | **D-11** |
| P10 | Acceptation ou signature de la proposition | G-OFF p. 16 : section « Accord de projet & signature » avec tableau de signature des deux parties, puis un contrat séparé · G-META p. 8 : « en signant ci-dessous, les deux parties acceptent… » ; aucun contrat prévu · G-CT préambule : proposition « acceptée » · B9.4 et `Portail Document.html` : proposition acceptée d'un geste, contrat signé (nom tapé, date, IP) | Pour le web, deux signatures pour une même vente ; pour Meta, la proposition tient lieu de contrat | Section « accord et signature » **conditionnelle** dans le modèle de proposition : désactivée quand un contrat suit, activée pour une proposition qui vaut entente ; l'acceptation dans le portail reste un geste unique | **D-14** |
| P11 | Vente d'un récurrent | G-CT 6.1 : honoraires du mandat « tel que détaillé dans la Proposition », un seul montant ; 10.3 : la maintenance relève d'une « entente distincte » · G-OFF : proposition avec forfait ponctuel + maintenance mensuelle · SEED : `client_subscription` distinct de `contract` | Le contrat ne porte que le ponctuel ; le récurrent accepté dans la proposition n'a pas de document d'engagement | « Créer la suite » depuis une proposition mixte crée un contrat (ponctuel) **et** un abonnement (récurrent) ; décider si l'abonnement demande une entente signée | **D-15** |
| P12 | Identité de l'agence | SEED `agency` : adresse à Amqui, code postal, téléphone et courriel vides · G-OFF p. 1 et 16 : adresse à Québec (G1E), téléphone et courriel · G-META : « Québec, QC » · G-CT : `[ADRESSE DU PRESTATAIRE]` · passation §1 : « DigiHunt (Amqui, Québec) » | Deux adresses d'établissement | Une seule source, le Profil de l'agence (B9.1) ; les gabarits ne portent plus d'adresse en dur | **D-12** |
| P13 | Représentant de l'agence | G-OFF : « Armel Junior Nguimbi, fondateur » (six occurrences) · G-CT : « Propriétaire, Agence DigiHunt » · G-META : « Armel Junior » · SEED `agency_member.job_title` « Fondateur » · MK : « Marie Chen, Fondatrice & directrice » (fiction) | Titre différent selon le document | `agence.representant` et `agence.representant_titre` (AN 3.5), un seul titre | **D-12** |
| P14 | Dénomination de l'agence | SEED `legal_name` = G-CT « faisant affaire sous le nom d'« Agence DigiHunt » » · G-OFF « DigiHunt — Agence Webflow & SEO » · G-META « DigiHunt — Agence Webflow & Acquisition » | La signature de marque varie par gabarit | Texte fixe du modèle, pas une balise | Fait |
| P15 | District judiciaire | G-CT art. 17 `[DISTRICT JUDICIAIRE]` · Aucune autre source | Balise sans source | Réglage de l'agence (AN 3.5) | **D-12** (valeur à fournir) |
| P16 | Données d'exemple de l'aperçu | B9.3 : « des données d'exemple réelles : le client SHGM, le contrat 2026-007 » · MK-TPL et MK-GEN : SHGM avec un nom d'organisme, un contact et des montants inventés · SEED : le vrai contrat, avec la personne-contact réelle · `AGENTS.md` : « les données de découverte client restent dans le stockage privé ; exemples fictifs dans ce dépôt » | Le brief demande ce que la consigne interdit | Jeux d'exemple fictifs dans les maquettes et le code ; en production, l'aperçu utilise les vraies données du client sélectionné | Recommandation ; amendement B9.3 |
| P17 | Fragments propres au mandat SHGM dans les gabarits | G-AN §1 « organisme », « public moins à l'aise » ; L-05 adhésion ; L-06 dons ; L-07 publications et Zotero ; §5 « Centre de recherche », « conseil d'administration » ; exclusions Zotero, recherche généalogique · G-CT : générique (à part le titre du représentant) · G-OFF, G-META : génériques, exemples de secteur dans la légende seulement | Le gabarit d'annexe est un document rempli, pas un modèle | Modèle d'annexe = texte fixe générique + blocs de données ; les livrables, attendus et exclusions viennent de l'offre puis du contrat ; les éléments SHGM restent dans les données du contrat 2026-007 du semis | Fait |
| P18 | Sorte « avenant » | SCH `document_kind` : six sortes · MK-TPL : cinq modèles, pas d'avenant · G-CT 2.2, 2.3 : « avenant écrit » | Une sorte prévue sans modèle | Prévu par B9.3 (« sorte sans modèle se voit ») ; modèle à produire plus tard | Fait |
| P19 | Format et pagination | G-OFF, G-META, G-CT, G-AN : A4 ; G-OFF et G-META en pages fixes (`overflow: hidden`, « Page 4 / 16 » en dur) ; G-CT et G-AN en flux · B9.3 : « format lettre » · AN 3.6 | Une section rédigée plus longue est coupée en silence | Décision déjà posée par AN §9 : Lettre ou A4 ; flux paginé pour tous | **D-13** |
| P20 | Valeur d'une opportunité | SCH `deal.mrr_cents` seulement · Un forfait web est ponctuel (CAT) | Le pipeline ne peut pas porter la valeur d'une vente ponctuelle | À traiter dans la mission Agence hub et contexte client (Codex) | Fait ; hors périmètre |

## 5. Dictionnaire des variables

Syntaxe canonique : celle des maquettes 9.3 (`{{groupe.champ}}`, blocs `{{#bloc}}…{{/bloc}}`), retenue par AN 3.1 sous réserve de la décision D-13. Ce dictionnaire complète et corrige l'annexe A de AN ; en cas d'écart, ce dictionnaire prévaut.

Conventions :

- **Type** : texte · texte long · nombre · montant · date · booléen · image · bloc (liste).
- **Requis** : obligatoire pour envoyer (O), facultatif (F), calculé (C). Une balise requise vide bloque l'envoi (B9.4) ; une balise facultative vide se rend vide, et un bloc conditionnel sur une valeur vide ne se rend pas.
- **Source** : table ou objet d'où vient la valeur ; « à ajouter » quand la colonne n'existe pas au commit examiné.
- Un montant se rend formaté en français canadien avec le symbole (« 8 740,00 $ ») ; la variante `_nombre` rend le nombre seul quand le modèle place lui-même le symbole, comme G-OFF et G-CT le font.

### 5.1 Agence

| Balise | Sens | Type | Requis | Source | Héritées |
|---|---|---|---|---|---|
| `agence.nom` | Nom commercial | texte | O | `agency.name` | texte en dur des quatre gabarits |
| `agence.raison_sociale` | Dénomination légale | texte | O contrat | `agency.legal_name` | idem |
| `agence.adresse`, `agence.ville`, `agence.province`, `agence.code_postal` | Établissement | texte | O | `agency.address, city, province, postal_code` | `[ADRESSE DU PRESTATAIRE]`, pied de page G-OFF |
| `agence.telephone`, `agence.courriel`, `agence.site` | Coordonnées | texte | F | `agency.phone, email, website` | en dur |
| `agence.neq` | Numéro d'entreprise du Québec | texte | O contrat | à ajouter (B9.1) | en dur G-CT |
| `agence.tps`, `agence.tvq` | Numéros d'inscription | texte | O document taxé | `agency.gst_number, qst_number` | absents des gabarits |
| `agence.logo` | Logo | image | F | `agency.logo_url` | `assets/logo-*.png` |
| `agence.representant`, `agence.representant_titre` | Personne qui signe pour l'agence | texte | O signature | à ajouter (AN 3.5) | nom et titre en dur, P13 |
| `agence.district_judiciaire` | Art. 17 du contrat | texte | O contrat | à ajouter | `[DISTRICT JUDICIAIRE]` |
| `agence.instructions_paiement` | Modes et instructions par défaut | texte long | F | à ajouter (B9.1) ; `document_template.payment_instructions` surcharge | P3 |

### 5.2 Client, contact, signataire

Trois personnes peuvent différer sur un même mandat : le **destinataire** de la proposition (G-OFF « Bonjour {{PRENOM_CLIENT}} »), le **signataire** du contrat (G-CT « représentée par… dûment autorisée ») et la **personne-contact unique** du mandat (G-AN 5.1). Le dictionnaire les sépare ; par défaut le composeur propose la même personne pour les trois.

| Balise | Sens | Type | Requis | Source | Héritées et ambiguïtés |
|---|---|---|---|---|---|
| `client.nom` | Nom commercial | texte | O | `client.name` | `{{ENTREPRISE_CLIENT}}` |
| `client.raison_sociale` | Nom légal complet | texte | O contrat | à ajouter (`client.legal_name`) ; repli sur `client.name` | `[NOM DU CLIENT]` : la légende G-CT dit « nom légal », pas le nom commercial |
| `client.forme_juridique` | Statut juridique | texte | O contrat | à ajouter (AN 3.5) | `[FORME JURIDIQUE DU CLIENT]` |
| `client.adresse`, `client.ville`, `client.province`, `client.code_postal` | Adresse postale | texte | O contrat, F proposition | `client.address` (un seul champ aujourd'hui) ; structuration à ajouter | `[ADRESSE DU CLIENT]`, `{{ADRESSE_CLIENT}}` (rue) + `{{VILLE_CLIENT}}` (ville, province, code postal). **Ne pas confondre avec `{{VILLE}}` de G-OFF**, qui est la zone ciblée (→ `brief.zone_cible`) |
| `client.secteur` | Secteur d'activité | texte | F | `client.sector` | `{{SECTEUR}}`, `{{SECTEUR_CLIENT}}` |
| `client.site` | Domaine | texte | F | `client.domain` | — |
| `client.contact.prenom` | Prénom du destinataire | texte | O proposition | à ajouter (`contact.first_name`) ; `contact.full_name` n'est pas découpable de façon sûre | `{{PRENOM_CLIENT}}` |
| `client.contact.nom_famille` | Nom de famille | texte | F | à ajouter (`contact.last_name`) | `{{NOM_CLIENT}}` **dans G-OFF** : la couverture imprime « {{PRENOM_CLIENT}} {{NOM_CLIENT}} », donc nom de famille, alors que la légende le définit comme « nom complet » |
| `client.contact.nom_complet` | Nom complet | texte | O | `contact.full_name` | `{{NOM_CLIENT}}` **dans G-META** (utilisé seul) ; `client.contact.nom` de MK-TPL |
| `client.contact.titre` | Fonction | texte | F | `contact.role` | `{{TITRE_CLIENT}}`, `[TITRE DU CONTACT CLIENT]` |
| `client.contact.courriel`, `client.contact.telephone` | Coordonnées | texte | O envoi courriel | `contact.email, phone` | `{{COURRIEL_CLIENT}}`, `{{TEL_CLIENT}}` |
| `signataire.nom_complet`, `signataire.titre` | Personne qui signe pour le client | texte | O contrat | `quote.contact_id` ou `contract.signed_by_contact_id` | `[NOM DU REPRÉSENTANT DU CLIENT]`, `[NOM DU SIGNATAIRE CLIENT]` : même personne dans G-CT (préambule et signatures) |
| `contrat.personne_contact.nom_complet`, `.titre` | Personne-contact unique du mandat (art. 4.1) | texte | O annexe | à ajouter sur `contract` | `[NOM DU CONTACT CLIENT]`, `[TITRE DU CONTACT CLIENT]` de G-AN 5.1 |

### 5.3 Opportunité et brief de découverte

| Balise | Sens | Type | Requis | Source | Héritées |
|---|---|---|---|---|---|
| `opportunite.reference`, `opportunite.objet` | L'opportunité d'où part la proposition | texte | F | `deal` (colonnes à préciser) ; rarement rendu | — |
| `brief.date_appel` | Date de l'échange source | date | F | brief de découverte (à créer, AN 4.4) | `{{DATE_RENCONTRE}}` |
| `brief.atout_principal` | Force actuelle du client | texte | O proposition web | brief | `{{ATOUT_PRINCIPAL}}` (G-OFF), `{{ATOUT_CONCURRENTIEL}}` (G-META) : même notion, une seule balise |
| `brief.probleme_cardinal` | Problème principal, une phrase | texte | O proposition | brief | `{{PROBLEME_CARDINAL}}` |
| `brief.objectif_principal` | Objectif nº 1 | texte | O proposition | brief | `{{OBJECTIF_PRINCIPAL}}` (les deux gabarits) |
| `brief.resultat_vise` | Résultat mesurable | texte | F | brief | `{{RESULTAT_CHIFFRE}}` |
| `brief.zone_cible` | Ville ou zone visée | texte | F | brief ; repli `client.ville` | `{{VILLE}}` de G-OFF (« ville ou zone géographique ciblée ») |
| `brief.coeur_metier`, `brief.offre_specialisee` | Cœur de métier, spécialités | texte | F | brief | `{{COEUR_METIER}}`, `{{OFFRE_SPECIALISEE}}` |
| `brief.canal_actuel`, `brief.canal_pub`, `brief.taux_annulation`, `brief.systeme_reservation` | Champs propres à l'acquisition | texte | F | brief | `{{CANAL_ACTUEL}}`, `{{CANAL_PUB}}`, `{{TAUX_ANNULATION}}`, `{{SYSTEME_RESERVATION}}` |

### 5.4 Document, sections, versions

| Balise | Sens | Type | Requis | Source | Héritées |
|---|---|---|---|---|---|
| `document.reference` | Numéro | texte | C | `app.next_document_ref` | `[NUMÉRO DU CONTRAT]`, `[NUMÉRO DE PROPOSITION]` selon la sorte |
| `document.date` | Date d'émission | date | C à l'envoi | `quote.issued_on` | `{{DATE}}`, `[DATE DU DOCUMENT]` |
| `document.expire_le` | Date limite d'acceptation | date | O devis et proposition | `quote.expires_on` | `{{DATE_EXPIRATION}}` |
| `document.validite_jours` | Durée de validité | nombre | C | `expire_le − date` ; défaut du modèle (D-10) | `{{VALIDITE}}` : durée, pas date |
| `facture.echeance`, `facture.delai_jours` | Échéance de paiement d'une facture | date, nombre | O facture | `invoice.due_on`, `document_template.payment_terms_days` | `document.echeance` de MK-TPL servait aux deux sens ; scindé |
| `document.objet` | Objet | texte | O | `quote.subject` | — |
| `document.introduction`, `document.mentions`, `document.pied`, `document.paiement` | Textes du modèle | texte long | F | `document_template.intro, legal_mentions, footer, payment_instructions` | — |
| `document.engagement_mois` | Engagement initial des récurrents | nombre | F | ligne récurrente ou offre (M11) | `{{ENGAGEMENT_MOIS}}` |
| `document.version` | Numéro de version figée | nombre | C | `quote_version` | — |
| `section.<cle>` | Texte d'une section narrative | texte long | O si la section est activée | `document_section` (AN 4.2) ; clés prévues : `resume`, `besoins`, `objectifs`, `recommandation`, `preuve`, `plan_action`, `gestion_projet`, `modalites`, `couts_externes`, `accord` | puces « [Compléter : …] » de G-OFF |
| `proposition.reference`, `proposition.date` | Proposition source d'un contrat | texte, date | O contrat | `contract.source_quote_id` (à ajouter, AN 4.1) | `[NUMÉRO DE PROPOSITION]`, `[DATE DE LA PROPOSITION]` |

### 5.5 Offres présentées et recommandées

| Balise | Sens | Type | Requis | Source | Héritées |
|---|---|---|---|---|---|
| `{{#offres}}…{{/offres}}` | Offres présentées dans le document (D-06) | bloc | F | sélection du composeur parmi `offer` | cartes en dur de G-OFF p. 7 à 9 |
| `offre.nom`, `offre.accroche` | | texte | O | `offer.name, tagline` | — |
| `offre.prix`, `offre.prix_a_partir` | Prix et indicateur « à partir de » | montant, booléen | O | `offer.price_cents, price_is_from` | `{{PRIX_FORFAIT}}` |
| `offre.recurrence` | ponctuel, mensuel… | texte | O | `offer.billing` | « Paiement unique » |
| `offre.delai` | « 4 semaines » ou « 5–6 semaines » | texte | F | `delivery_weeks_min/max` | `{{DUREE}}` |
| `offre.consultation_min` | Consultation offerte | nombre | F | `free_consult_minutes` | « 30 min » |
| `offre.populaire` | Badge | booléen | F | `is_popular` | `card-dark` |
| `{{#offre.segments}}`, `{{#offre.lignes}}`, `{{#offre.benefices}}` | Listes de la carte | bloc | F | `offer_segment`, `offer_line` (offres incluses dépliées ou « Tout ce qui est dans… »), `offer_benefit` | listes en dur |
| `offre.limites.pages`, `.collections`, `.produits` | Limites typées (D-04) | nombre | F | à ajouter | « max. 10 pages », `[NOMBRE DE PAGES]` |
| `offre.engagement_mois`, `offre.preavis_jours` | Engagement et préavis (M11) | nombre | F | à ajouter | « sans engagement, 30 jours » |
| `offre_recommandee.*` | Mêmes champs, pour l'offre retenue | | O proposition | choix du composeur | `{{FORFAIT_RECOMMANDE}}`, `{{PRIX_FORFAIT}}`, `{{DUREE}}` |
| `maintenance_recommandee.nom`, `.prix_mensuel`, `.heures_incluses`, `.taux_depassement` | Maintenance proposée (M1, M3) | texte, montant, nombre, montant | F | offre de maintenance (D-01) | `{{FORFAIT_MAINTENANCE}}`, `{{PRIX_MAINTENANCE}}` |
| `seo_recommande.*` | Pack SEO proposé (M3) | | F | offre SEO | légende « Module SEO mensuel » |

### 5.6 Lignes, totaux, paiements

| Balise | Sens | Type | Requis | Source | Héritées |
|---|---|---|---|---|---|
| `{{#lignes}}` | Toutes les lignes | bloc | O | `quote_line` | tableau MK-TPL |
| `{{#lignes_ponctuelles}}`, `{{#lignes_recurrentes}}` | Par récurrence | bloc | F | `quote_line.billing` (à ajouter, AN 4.3) | « Phase 1 · frais unique », « Phase 2 · mensualité » |
| `{{#lignes_offertes}}`, `{{#lignes_remises}}`, `{{#lignes_informatives}}` | Par nature | bloc | F | `quote_line.kind` (à ajouter) | `{{BONUS_SIGNATURE}}`, escompte, budget Meta |
| `ligne.description`, `ligne.quantite`, `ligne.unite`, `ligne.prix`, `ligne.montant`, `ligne.recurrence`, `ligne.nature` | Champs d'une ligne | | | `quote_line` | `{{PRIX_LANDING}}`, `{{PRIX_META_CONFIG}}` deviennent deux lignes |
| `total.ponctuel_ht`, `total.ponctuel_tps`, `total.ponctuel_tvq`, `total.ponctuel_ttc` | Investissement initial | montant | C | vue `quote_total` (à étendre) | « Total de l'investissement initial », `{{PRIX_PHASE1}}` |
| `total.mensuel_ht`, `total.mensuel_ttc` | Par période | montant | C | idem | `{{PRIX_MENSUEL}}`, « par mois + taxes » |
| `total.engagement_ht` | Mensuel × engagement | montant | C | idem | `{{TOTAL_PHASE2}}` |
| `total.avant_remise`, `total.remise` | Avant et montant des remises | montant | C | lignes `remise` | `{{PRIX_PHASE1_BARRE}}`, `{{MONTANT_ESCOMPTE}}`, `{{ESCOMPTE_PCT}}` |
| `total.honoraires_ht` | Ponctuel + engagement | montant | C | | `{{TOTAL_HONORAIRES}}` |
| `total.informatif` | Somme des lignes informatives, hors taxes et hors facturation | montant | C | | `{{BUDGET_META_TOTAL}}` |
| `total.estime` | Honoraires + informatif, libellé « non facturé par l'agence » pour la part informative | montant | C | | `{{TOTAL_GLOBAL}}` |
| `total.ht`, `total.tps`, `total.tvq`, `total.ttc` | Totaux du document taxé (devis, facture, contrat) | montant | C | `quote_total`, `invoice_total` | `[MONTANT DES HONORAIRES]`, `[MONTANT HONORAIRES]` (doublon), `[MONTANT TPS]`, `[MONTANT TVQ]`, `[MONTANT TOTAL TTC]` |
| `{{#paiements}}` | Échéancier | bloc | O contrat et proposition | `payment_milestone` ou échéancier de l'offre (P1) | tableau G-META p. 6, 6.2 de G-CT |
| `paiement.titre`, `paiement.pourcentage`, `paiement.montant_ht`, `paiement.montant_ttc`, `paiement.declencheur`, `paiement.echeance`, `paiement.delai_jours` | Champs d'un versement | | | idem | `{{ACOMPTE}}`, `{{SOLDE}}`, `[MONTANT ACOMPTE TTC]`, `[MONTANT ACOMPTE HT]`, `[MONTANT SOLDE TTC]`, `[MONTANT SOLDE HT]` |

### 5.7 Contrat, annexe, signature

| Balise | Sens | Type | Requis | Source | Héritées |
|---|---|---|---|---|---|
| `contrat.reference`, `contrat.date` | | texte, date | O | `contract.ref`, `signed_on` ou émission | `[NUMÉRO DU CONTRAT]`, `[DATE DU DOCUMENT]` |
| `contrat.titre` | Objet du mandat | texte | O | `contract.title` | §1 de G-AN |
| `contrat.taux_horaire` | Dépassement de rondes et d'heures | montant | O annexe | `contract.hourly_rate_cents` | « 100 $/h » en `data-token` |
| `contrat.garantie_jours`, `contrat.delai_acceptation_jours`, `contrat.delai_contenu_jours` | Art. 10.1, 4.3, §4 | nombre | O | `contract.warranty_days, acceptance_business_days, content_deadline_days` | « 30 jours », « 5 jours ouvrables », « 60 jours » en dur |
| `contrat.date_debut_prevue` | Période ou saison annoncée (§4, texte) | texte | F | à ajouter ou texte de section | `[DATE DE DÉBUT PRÉVUE]` |
| `contrat.date_debut` | Date du jalon J-01 | date | O | `milestone.fixed_on` du premier jalon | `[DATE DE DÉBUT — À CONFIRMER]` : ce sont deux balises, pas une |
| `{{#livrables}}` : `livrable.code`, `.titre`, `.description`, `.rondes`, `.echeance`, `.inclus_dans` | | bloc | O annexe | `deliverable`, `deliverable_inclusion` | L-01 à L-11 en dur ; `[NOMBRE DE PAGES]`, `[NOMBRE DE COLLECTIONS CMS]`, `[SOLUTION DE PAIEMENT]` sont des valeurs **dans** la description du livrable, demandées à la création (AN 3.5) |
| `{{#jalons}}` : `jalon.code`, `.titre`, `.responsable`, `.date`, `.regle` | Date calculée et règle relative (« dans les 7 jours suivant J-03 ») | bloc | O annexe | `milestone`, vue `contract_schedule` | J-01 à J-12 en dur |
| `{{#attendus_client}}` : `attendu.libelle`, `.format`, `.remarque`, `.jalon` | | bloc | F | `client_input_item` | tableau §5 |
| `{{#exclusions}}` : `exclusion.libelle`, `.precision`, `.offre_suggeree` | | bloc | F | `contract_exclusion` ; **conditionnelles selon les lignes vendues** (W8) | tableau §6 |
| `{{#accompagnement}}` : `accompagnement.mois`, `.heures_min`, `.heures_max`, `.taux_depassement`, `.debut`, `.fin` | L-11 et §3 | bloc | F | `support_period` | texte en dur §3 |
| `signature.agence`, `signature.agence_titre`, `signature.client`, `signature.client_titre`, `signature.date` | Tableau de signature | texte | O contrat ; conditionnel proposition (D-14) | `agence.representant*`, `signataire.*`, `document_signature` (AN 4.8) | tableaux de G-OFF p. 16, G-META p. 8, G-CT |

### 5.8 Balises héritées sans correspondance

`{{TOKEN}}` (exemple de la légende), `[Nom · Secteur]`, `[Prénom Nom]`, `[Fonction · Entreprise]`, `[Citation courte…]`, « Logo 1 » à « Logo 4 » (section 07 de G-OFF) : contenu de la section optionnelle `preuve`, saisi dans le composeur, pas des balises. `{{DELAI_LANCEMENT}}` (G-META) : texte de la section « prochaines étapes », ou `offre.delai` de l'offre Meta si D-08 la crée. Les pages « Légende d'utilisation » des quatre gabarits sont retirées à l'import (AN 3.6).

## 6. Décisions à prendre

Chaque décision indique ce qui reste possible sans elle. Les recommandations sont celles des matrices ; aucune valeur n'est inventée.

| Nº | Décision | Recommandation | Bloque | Ne bloque pas |
|---|---|---|---|---|
| D-01 | Les trois packs de maintenance entrent-ils au catalogue, avec quelles heures et quel taux de dépassement (95/90/85 ou 100 $/h) ? Que deviennent les packs SEO du semis, et où passe la frontière entre les deux familles ? Chaque forfait web recommande-t-il une maintenance, un pack SEO, ou les deux ? | Trois offres de maintenance mensuelles ; conserver les packs SEO s'ils se vendent ; deux recommandations typées par offre ; un taux par offre | Semis des offres de maintenance ; rendu de la section 05 depuis la base | Le modèle de sections, le composeur, le brief 9.5 |
| D-02 | Le pack SEO de démarrage est-il inclus dans chaque forfait web (contenu tel que G-OFF) ? | Oui, en trois articles ; exclusion SEO de l'annexe conditionnelle | Semis ; exclusions conditionnelles | Le reste |
| D-03 | L'accompagnement post-lancement (3 mois, heures) est-il standard par forfait ? | Attribut de l'offre avec heures min et max | Semis ; bloc `{{#accompagnement}}` | Le reste |
| D-04 | Les limites (pages, collections, produits) deviennent-elles des quantités typées, surchargeables par mandat ? | Oui | Schéma des offres et livrables | Les maquettes peuvent déjà afficher la limite et son dépassement |
| D-05 | Que compte le délai de livraison, et quelles valeurs ? | Temps prestataire J-03 → J-06 ; revoir 4 / 5–6 / 6–8 ou les décalages | Semis ; texte de la section 06 | Le reste |
| D-06 | La proposition présente-t-elle une offre ou les trois ? | Par défaut la recommandée, option « comparer » | Rien : le bloc `{{#offres}}` couvre les deux | — |
| D-07 | Échéancier : libellé du second versement, délai 15 jours, modes de paiement (Interac, carte), remboursabilité de l'acompte | Libellé unique rendu par `{{#paiements}}` ; 15 jours ; une seule source de modes ; alignement sur le contrat, à faire valider juridiquement | Textes fixes des modèles convertis | Le mécanisme |
| D-08 | Acquisition Meta : deux offres au catalogue ? Les montants d'exemple sont-ils le tarif ? L'escompte de bienvenue est-il standard ? Engagement 3 mois ? | Deux offres liées ; ne rien semer sans tarif confirmé ; remise en ligne explicite | Semis Meta ; recommandation IA pour l'acquisition | Le modèle Meta converti (balises, sections) |
| D-09 | Packs SEO : prix fixe ; montant du tarif d'entrée ; engagement | Fixe ; ne pas semer 525 $ ; préciser l'engagement | Correction du semis | Le reste |
| D-10 | Validité par défaut : 10, 14 ou 30 jours, par sorte | `validite_jours` sur le modèle, valeur à choisir | Valeur du semis | Le mécanisme |
| D-11 | Préfixe du contrat ; annexe sans compteur ; largeur des numéros de facture | Annexe = numéro du contrat ; `PR-` pour la proposition ; contrat à choisir | Semis des modèles | Le reste |
| D-12 | Identité de l'agence : adresse d'établissement, titre du représentant, district judiciaire, numéros de TPS et TVQ | Saisir dans le Profil ; une seule source | Tout envoi de document taxé | La conception |
| D-13 | Syntaxe canonique, format Lettre ou A4, flux paginé (AN §9, décisions 1, 2, 5) | Oui, Lettre, flux | Conversion des gabarits | Les briefs peuvent poser les deux hypothèses |
| D-14 | La proposition web est-elle acceptée ou signée ? La proposition Meta vaut-elle entente sans contrat ? | Acceptation ; section de signature conditionnelle | Modèle de proposition ; portail | Le reste |
| D-15 | Un récurrent vendu par proposition demande-t-il une entente signée, ou l'acceptation suffit-elle avant l'abonnement ? | Acceptation + première facture ; contrat pour le ponctuel seulement | « Créer la suite » | Le reste |

Décisions déjà prises que cette analyse ne rouvre pas : `quote.kind` plutôt qu'une table générique (AN §9.3) ; signature simple (B9.4) ; le devis de la session 7.3 n'est pas redessiné (B9.4).

## 7. Corrections à reporter une fois les valeurs actées

Ces corrections ne sont pas faites ici : la mission exclut le code, le semis et les gabarits.

| Cible | Correction | Dépend de |
|---|---|---|
| `supabase/seed.sql` | Exclusion 13 du contrat SHGM → offre de maintenance ; `price_is_from` des packs SEO ; libellé « 4 articles » ou tâche de Domination SEO ; offres de maintenance, articles de pack SEO de démarrage, article de migration, offres Meta ; `intro_price_cents` ; `payment_terms_days` de la facture | D-01, D-02, D-05, D-08, D-09, D-07 |
| `docs/briefs/9-2-catalogue-offres.md` | Dire que les délais, consultations, options « hébergement » et 525 $ de la maquette sont des exemples ; ajouter les limites typées, l'engagement et le préavis, les deux recommandations, les livrables par offre | D-01, D-04, M11 |
| `docs/briefs/9-3-modeles-documents.md` | Amendé dans cette mission (sections, blocs conditionnels, groupes de balises, données fictives) | — |
| `docs/briefs/9-4-generateur-documents.md` | Amendé dans cette mission (composition, natures et récurrences, versions figées, états) | — |
| Gabarits convertis (`document_template.body_html`) | Balises canoniques ; retrait des adresses, noms et prix en dur ; sections conditionnelles ; flux paginé ; page « Légende » retirée | D-13, D-07, D-12 |
| `docs/catalogue-agence.md` | Ajouter les packs de maintenance, l'accompagnement, les limites et l'engagement une fois décidés | D-01 à D-05 |
| `docs/decisions.md` | Consigner D-01 à D-15 avec la date et ce qu'elles remplacent | Arbitrages d'Armel |

## 8. Vérifications effectuées

- Relecture intégrale des dix sources listées en section 1 ; extraction des balises des quatre gabarits par script (19 moustaches dans G-OFF, 37 dans G-META, 22 crochets dans G-CT, 10 dans G-AN) ; le résultat a été comparé à l'annexe A de AN.
- Contrôle des calculs cités : taxes du contrat SHGM (9 750 $ → 487,50 / 972,56 / 11 210,06) ; taxes de la maquette (8 740 $ → 437,00 / 871,82 / 10 048,82) ; récapitulatif Meta (1 200 − 300 = 900 ; 295 × 3 = 885 ; 900 + 885 = 1 785 ; 600 × 3 = 1 800 ; 1 785 + 1 800 = 3 585 ; 20 $ × 30 j = 600 $ ; 450 + 450 = 900) ; enchaînement des jalons de G-AN (58 jours de J-03 à J-06) ; comptes d'articles (39 dans SEED, 39 dans MK-CAT, contenus différents).
- Aucun test applicatif : mission documentaire.
