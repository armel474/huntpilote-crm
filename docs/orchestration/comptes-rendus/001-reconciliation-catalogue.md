# Compte rendu — Mission 001

- Date : 14 septembre 2026
- Auteur / rôle : Claude Code, préparation métier et briefs de conception
- Statut réel : prête pour revue (Codex), puis arbitrages d'Armel
- Branche : `claude/laughing-fermat-bd7riu`, créée depuis `origin/docs/orchestration-huntpilote` (commit `62b858f`) ; la pull request nº 1 était ouverte en brouillon, non fusionnée
- Commit livré ou examiné : base applicative `main` à `ada3eb2` ; livraison au commit indiqué dans la pull request
- Pull request : brouillon, cible `docs/orchestration-huntpilote`

## Résultat

Analyse documentaire, sans code ni donnée modifiés. La mission 001 est exécutée : la matrice des écarts entre catalogue, semis, maquettes de la phase 9 et gabarits réels est écrite, sourcée ligne par ligne, avec faits, recommandations et décisions séparés ; le dictionnaire des variables distingue agence, client, contact, signataire, personne-contact, opportunité, brief, offre et document, et corrige les correspondances ambiguës. À la demande d'Armel, le périmètre documentaire a été étendu : amendements des briefs 9.3 et 9.4, nouveau brief 9.5, mission 002 avec le message de lancement pour Claude Design.

Rien de ce qui est décrit n'est une fonctionnalité connectée : les maquettes de la phase 9 restent des exports HTML, et les gabarits réels ne sont pas convertis.

Points saillants de l'analyse (détail dans `../analyses/001-reconciliation-catalogue.md`) :

- Le catalogue de la maquette 9.2 est fictif ; celui du semis reprend mot pour mot les listes du gabarit d'offre. Délais, consultations, option « hébergement » et tarif d'entrée de 525 $ de la maquette ne sont pas des décisions.
- Les limites des forfaits (10 / 20 pages, 1 / 5 collections, 100 produits) vivent dans des libellés ; le contrat réel du semis (12 pages, 7 collections, 9 750 $) montre qu'elles se négocient.
- Le « pack SEO de démarrage » promis par chaque forfait web n'existe ni au catalogue ni au semis, et l'annexe réelle exclut les prestations SEO.
- Les trois packs de maintenance du gabarit (200 / 450 / 750 $ par mois, heures incluses, taux de dépassement 95 / 90 / 85 $/h) sont absents de la base, qui porte trois packs SEO ; l'exclusion « maintenance » du contrat du semis pointe vers un pack SEO ; le contrat facture les dépassements 100 $/h.
- L'acquisition Meta n'a pas d'offre ; sa structure en deux phases (ponctuelle puis mensuelle avec engagement) ne rentre pas dans une offre à récurrence unique ; le budget média doit être une ligne informative hors totaux.
- Échéances de paiement : « 50 % à la livraison » ne dit pas la même chose dans la proposition et dans l'annexe ; délais de règlement 14, 15 ou 30 jours selon la source ; modes de paiement différents entre proposition et contrat ; remboursabilité de l'acompte contradictoire.
- Validité : 10, 14 ou 30 jours selon la source ; date et durée confondues dans une même balise.
- Variables : `NOM_CLIENT` désigne le nom de famille dans le gabarit d'offre et le nom complet dans le gabarit Meta ; `VILLE` est une zone cible, pas une adresse ; `document.echeance` servait à la fois à l'expiration d'une offre et à l'échéance d'une facture ; le représentant du client, le signataire et la personne-contact du mandat sont trois rôles.
- Identité de l'agence : deux adresses d'établissement selon la source, deux titres pour le représentant, numéros de TPS et TVQ absents.

## Modifications

| Fichiers | Raison |
|---|---|
| `docs/orchestration/analyses/001-reconciliation-catalogue.md` | Livrable de la mission : matrices W, M, P ; dictionnaire ; décisions D-01 à D-15 ; corrections à reporter ; vérifications |
| `docs/orchestration/comptes-rendus/001-reconciliation-catalogue.md` | Ce compte rendu |
| `docs/orchestration/missions/001-reconciliation-catalogue.md` | Statut de la mission |
| `docs/briefs/9-3-modeles-documents.md` | Section « Amendements du 14 septembre 2026 » : sections de modèle, blocs conditionnels, groupes de balises, syntaxe héritée, montants, versions, format, données fictives, états |
| `docs/briefs/9-4-generateur-documents.md` | Section « Amendements » : source « Depuis le brief », atelier de composition, états des sections, natures et récurrences des lignes, éléments manquants, version figée, journal, « Créer la suite », états, transitions, données |
| `docs/briefs/9-5-appel-decouverte.md` | Nouveau brief : consigner l'échange avec source et provenance, brief corrigeable avec passages sources et informations à confirmer, cartes, droits, états, transitions |
| `docs/orchestration/missions/002-conception-propositions-claude-design.md` | Mission pour Claude Design : périmètre, critères, fichiers exacts à transmettre, message de lancement |
| `docs/briefs/README.md` | Ligne 9.5 et état de la phase 9 |
| `docs/orchestration/etat-projet.md`, `docs/orchestration/feuille-de-route.md` | Faits vérifiés de cette mission ; renvoi vers les compléments préparés |

Aucune modification de code, de migration, de semis ni d'export de design.

## Vérifications

- Relecture intégrale des sources listées à la section 1 de l'analyse (documentation, semis, migrations 0012 à 0015b pour les colonnes citées, briefs 9.1 à 9.4 et socle, trois fichiers de données de la phase 9, quatre gabarits).
- Extraction des balises des quatre gabarits par script : 19 balises moustaches dans l'offre, 37 dans le gabarit Meta, 22 balises entre crochets dans le contrat, 10 dans l'annexe ; comparées à l'annexe A de l'analyse générale.
- Contrôle des calculs cités : taxes du contrat du semis (9 750 $ → 487,50 / 972,56 / 11 210,06), taxes de la maquette (8 740 $ → 437,00 / 871,82 / 10 048,82), récapitulatif Meta (900, 885, 1 785, 1 800, 3 585, 600 = 20 × 30), enchaînement des jalons de l'annexe (58 jours de J-03 à J-06), comptes d'articles (39 et 39, contenus différents).
- Contrôle des liens relatifs des documents créés vers les fichiers existants.
- Non exécuté : tests applicatifs (mission documentaire), rendu des maquettes dans un navigateur (non nécessaire à la comparaison des données).

## Revue

À faire par Codex. Points à vérifier en priorité : la lecture des jalons de l'annexe (W12), la proposition de deux recommandations typées par offre (M3), la scission de `document.echeance`, et le rattachement de l'extraction IA au droit « Déclencher un appel facturé au fournisseur » (brief 9.5), qui est une proposition.

Limites connues : l'analyse ne constitue pas une validation juridique des clauses (P4, D-07) ; aucune transcription réelle n'a été lue, le brief 9.5 a été écrit depuis les balises des gabarits et l'analyse générale ; le brief 9.2 n'est pas amendé, ses corrections dépendent des décisions D-01 à D-05.

## Décisions et prochaine action

Décisions prises : aucune valeur commerciale n'a été fixée. Les quinze décisions attendues d'Armel sont à la section 6 de l'analyse, chacune avec une recommandation et ce qu'elle bloque. Les cinq qui pèsent le plus sur la suite : D-01 (maintenance et packs SEO), D-02 (pack SEO de démarrage), D-07 (échéances de paiement), D-08 (acquisition Meta), D-13 (syntaxe, format, flux).

Prochaine action : transmettre la mission 002 à Claude Design (sessions 9.5, 9.3 amendée, 9.4 amendée) ; en parallèle, Codex sur le cadre applicatif de l'Agence hub. Après les décisions : corriger le semis et le brief 9.2, convertir les gabarits, consigner les décisions dans `docs/decisions.md`.
