/* HuntPilote — Agence hub : données du catalogue et des offres. */
const CAT_ARTICLES = [
  { id:'PRD-01', code:'PRD-01', nom:'Site vitrine (5 pages)', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:3200, description:'Site vitrine responsive, jusqu\u2019à 5 pages, structure et intégration incluses.', actif:true },
  { id:'PRD-02', code:'PRD-02', nom:'Site vitrine (10 pages)', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:5200, description:'Site vitrine responsive, jusqu\u2019à 10 pages.', actif:true },
  { id:'PRD-03', code:'PRD-03', nom:'Site vitrine sur mesure', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:null, description:'Site vitrine avec besoins particuliers — prix établi au cas par cas.', actif:true },
  { id:'PRD-04', code:'PRD-04', nom:'Boutique en ligne (jusqu\u2019à 50 produits)', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:8500, description:'Boutique transactionnelle, catalogue jusqu\u2019à 50 produits, paiement intégré.', actif:true },
  { id:'PRD-05', code:'PRD-05', nom:'Boutique en ligne (catalogue étendu)', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:null, description:'Boutique transactionnelle pour catalogue étendu — prix établi au cas par cas.', actif:true },
  { id:'PRD-06', code:'PRD-06', nom:'Landing page additionnelle', sorte:'produit', recurrence:'ponctuel', unite:'page', prixUnitaire:650, description:'Une page de destination supplémentaire, alignée sur le gabarit existant.', actif:true },
  { id:'PRD-07', code:'PRD-07', nom:'Logo et identité visuelle', sorte:'produit', recurrence:'ponctuel', unite:'projet', prixUnitaire:1800, description:'Conception de logo et déclinaisons de base.', actif:true },
  { id:'PRD-08', code:'PRD-08', nom:'Charte graphique complète', sorte:'produit', recurrence:'ponctuel', unite:'projet', prixUnitaire:2600, description:'Charte graphique complète : couleurs, typographies, gabarits.', actif:true },
  { id:'PRD-09', code:'PRD-09', nom:'Migration d\u2019hébergement', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:450, description:'Transfert d\u2019un site existant vers un nouvel hébergement.', actif:true },
  { id:'PRD-10', code:'PRD-10', nom:'Audit technique initial', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:900, description:'Audit technique complet avant le début d\u2019un mandat.', actif:true },
  { id:'PRD-11', code:'PRD-11', nom:'Shooting photo produit (demi-journée)', sorte:'produit', recurrence:'ponctuel', unite:'séance', prixUnitaire:550, description:'Séance photo pour fiches produits ou site.', actif:true },
  { id:'PRD-12', code:'PRD-12', nom:'Rédaction de contenu — page', sorte:'produit', recurrence:'ponctuel', unite:'page', prixUnitaire:120, description:'Rédaction d\u2019une page de contenu optimisée.', actif:true },
  { id:'PRD-13', code:'PRD-13', nom:'Formation à la gestion du site (2 h)', sorte:'produit', recurrence:'ponctuel', unite:'séance', prixUnitaire:240, description:'Formation pratique pour autonomiser le client sur son site.', actif:true },
  { id:'PRD-14', code:'PRD-14', nom:'Intégration CRM / paiement', sorte:'produit', recurrence:'ponctuel', unite:'projet', prixUnitaire:null, description:'Intégration sur mesure à un CRM ou un système de paiement tiers.', actif:true },
  { id:'PRD-15', code:'PRD-15', nom:'Application web sur mesure', sorte:'produit', recurrence:'ponctuel', unite:'projet', prixUnitaire:null, description:'Développement d\u2019un module ou d\u2019une application sur mesure.', actif:true },
  { id:'PRD-16', code:'PRD-16', nom:'Refonte UX d\u2019un site existant', sorte:'produit', recurrence:'ponctuel', unite:'site', prixUnitaire:null, description:'Refonte de l\u2019expérience d\u2019un site déjà en ligne — prix établi après audit.', actif:true },
  { id:'SRV-01', code:'SRV-01', nom:'Hébergement web géré', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:35, description:'Hébergement, nom de domaine et sauvegardes gérés par l\u2019agence.', actif:true },
  { id:'SRV-02', code:'SRV-02', nom:'Hébergement chez le client', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:null, description:'Le client garde son hébergement existant — coût variable selon le fournisseur.', actif:true },
  { id:'SRV-03', code:'SRV-03', nom:'Suivi de positions', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:160, description:'Suivi mensuel des positions sur les mots-clés prioritaires.', actif:true },
  { id:'SRV-04', code:'SRV-04', nom:'SEO technique — corrections mensuelles', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:220, description:'Corrections techniques SEO récurrentes.', actif:true },
  { id:'SRV-05', code:'SRV-05', nom:'Netlinking', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:260, description:'Acquisition de liens entrants de qualité.', actif:true },
  { id:'SRV-06', code:'SRV-06', nom:'Gestion Google Business Profile', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:130, description:'Mise à jour et optimisation de la fiche d\u2019établissement.', actif:true },
  { id:'SRV-07', code:'SRV-07', nom:'Rédaction d\u2019articles de blog', sorte:'service', recurrence:'mensuel', unite:'article', prixUnitaire:95, description:'Rédaction d\u2019articles de blog optimisés SEO.', actif:true },
  { id:'SRV-08', code:'SRV-08', nom:'Rapport mensuel de performance', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:60, description:'Rapport mensuel synthétique envoyé au client.', actif:true },
  { id:'SRV-09', code:'SRV-09', nom:'Gestion des avis clients', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:70, description:'Suivi et réponse aux avis clients.', actif:true },
  { id:'SRV-10', code:'SRV-10', nom:'Veille concurrentielle', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:null, description:'Suivi des mouvements de la concurrence — portée variable.', actif:true },
  { id:'SRV-11', code:'SRV-11', nom:'Optimisation Core Web Vitals', sorte:'service', recurrence:'trimestriel', unite:'trimestre', prixUnitaire:480, description:'Optimisation des performances techniques du site.', actif:true },
  { id:'SRV-12', code:'SRV-12', nom:'Audit SEO trimestriel', sorte:'service', recurrence:'trimestriel', unite:'trimestre', prixUnitaire:650, description:'Audit SEO complet à chaque trimestre.', actif:true },
  { id:'SRV-13', code:'SRV-13', nom:'Stratégie de contenu annuelle', sorte:'service', recurrence:'annuel', unite:'année', prixUnitaire:1400, description:'Planification éditoriale pour l\u2019année.', actif:true },
  { id:'SRV-14', code:'SRV-14', nom:'Formation équipe client (annuel)', sorte:'service', recurrence:'annuel', unite:'année', prixUnitaire:null, description:'Formation annuelle — portée variable selon l\u2019équipe.', actif:true },
  { id:'SRV-15', code:'SRV-15', nom:'Support technique prioritaire', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:90, description:'Accès prioritaire au support technique.', actif:true },
  { id:'SRV-16', code:'SRV-16', nom:'Gestion des réseaux sociaux', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:null, description:'Publication et animation des réseaux sociaux — portée variable.', actif:true },
  { id:'SRV-17', code:'SRV-17', nom:'Infolettre mensuelle', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:null, description:'Conception et envoi d\u2019une infolettre — portée variable.', actif:true },
  { id:'SRV-18', code:'SRV-18', nom:'Consultation stratégique', sorte:'service', recurrence:'ponctuel', unite:'heure', prixUnitaire:145, description:'Consultation ponctuelle à l\u2019heure.', actif:true },
  { id:'SRV-19', code:'SRV-19', nom:'Audit d\u2019accessibilité', sorte:'service', recurrence:'ponctuel', unite:'site', prixUnitaire:700, description:'Audit d\u2019accessibilité numérique du site.', actif:true },
  { id:'SRV-20', code:'SRV-20', nom:'Traduction de contenu', sorte:'service', recurrence:'ponctuel', unite:'mot', prixUnitaire:null, description:'Traduction facturée au mot — devis selon le volume.', actif:true },
  { id:'SRV-21', code:'SRV-21', nom:'Gestion de campagnes Google Ads', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:null, description:'Gestion de campagnes publicitaires — budget et frais variables.', actif:true },
  { id:'SRV-22', code:'SRV-22', nom:'Suivi analytics et tableau de bord', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:55, description:'Tableau de bord et suivi des indicateurs clés.', actif:true },
  { id:'SRV-23', code:'SRV-23', nom:'Maintenance et mises à jour techniques', sorte:'service', recurrence:'mensuel', unite:'mois', prixUnitaire:40, description:'Mises à jour techniques régulières du site.', actif:true },
];

const CAT_TASK_ROLES = ['Admin', 'Chef de projet', 'Spécialiste SEO', 'Rédacteur'];

const CAT_OFFERS = [
  { id:'off-presence', code:'OFF-01', nom:'Présence Digitale', accroche:'Un site professionnel, prêt à convaincre.', categorie:'web', recurrence:'ponctuel',
    segments:['PME de services','Professionnels','Artisans'], populaire:false, active:true,
    prix:4500, prixType:'apartir', tarifEntree:null, delaiSemaines:{ min:3, max:5 }, consultationGratuiteMin:30,
    lignes:[
      { type:'article', articleId:'PRD-01', qte:1 },
      { type:'groupe', nom:'Hébergement', defaultIndex:0, options:[{ articleId:'SRV-01', qte:1, libelle:'Hébergement chez nous' },{ articleId:'SRV-02', qte:1, libelle:'Hébergement chez vous' }] },
      { type:'article', articleId:'PRD-07', qte:1 },
      { type:'article', articleId:'PRD-12', qte:5, libelle:'5 pages rédigées' },
      { type:'article', articleId:'SRV-19', qte:1 },
    ],
    benefices:['Présence professionnelle en ligne dès le premier mois','Un seul interlocuteur, du logo au site','Hébergement et nom de domaine pris en charge'],
    taches:[
      { titre:'Envoyer le contrat et la facture initiale', role:'Admin', echeance:'Jour 0' },
      { titre:'Tenir le rendez-vous de démarrage', role:'Chef de projet', echeance:'Jour 2' },
      { titre:'Collecter le contenu et les accès du client', role:'Chef de projet', echeance:'Jour 5' },
      { titre:'Rédiger les pages du site', role:'Rédacteur', echeance:'Jour 12' },
      { titre:'Configurer l\u2019hébergement chez nous', role:'Chef de projet', echeance:'Jour 14', optionTrigger:'Hébergement chez nous' },
      { titre:'Récupérer les accès d\u2019hébergement du client', role:'Chef de projet', echeance:'Jour 14', optionTrigger:'Hébergement chez vous' },
      { titre:'Livrer le site et former le client', role:'Chef de projet', echeance:'Jour 28' },
    ],
    livrables:[{ code:'L-01', titre:'Maquette du site', rondes:2, ordre:1 },{ code:'L-02', titre:'Site vitrine complet', rondes:2, ordre:2 },{ code:'L-03', titre:'Logo final', rondes:1, ordre:3 }],
    recommandeeEnsuiteId:'off-visibilite' },

  { id:'off-croissance', code:'OFF-02', nom:'Croissance Digitale', accroche:'Vendez en ligne, avec le SEO qui suit.', categorie:'web', recurrence:'ponctuel',
    segments:['Commerces en croissance','PME établies'], populaire:true, active:true,
    prix:9000, prixType:'apartir', tarifEntree:null, delaiSemaines:{ min:6, max:9 }, consultationGratuiteMin:45,
    lignes:[
      { type:'offre', offreId:'off-presence' },
      { type:'article', articleId:'PRD-04', qte:1 },
      { type:'article', articleId:'SRV-03', qte:3, libelle:'3 mois inclus' },
      { type:'article', articleId:'SRV-09', qte:3, libelle:'3 mois inclus' },
    ],
    benefices:['Boutique en ligne prête à vendre','Trois mois de suivi SEO offerts pour démarrer','Réputation en ligne surveillée dès le lancement'],
    taches:[
      { titre:'Envoyer le contrat et la facture initiale', role:'Admin', echeance:'Jour 0' },
      { titre:'Tenir le rendez-vous de démarrage', role:'Chef de projet', echeance:'Jour 2' },
      { titre:'Collecter le contenu, catalogue et accès', role:'Chef de projet', echeance:'Jour 5' },
      { titre:'Rédiger les pages du site', role:'Rédacteur', echeance:'Jour 14' },
      { titre:'Configurer le catalogue et les paiements', role:'Chef de projet', echeance:'Jour 20' },
      { titre:'Tester le parcours d\u2019achat', role:'Chef de projet', echeance:'Jour 30' },
      { titre:'Configurer le suivi de positions initial', role:'Spécialiste SEO', echeance:'Jour 32' },
      { titre:'Livrer, former le client et lancer la boutique', role:'Chef de projet', echeance:'Jour 45' },
    ],
    livrables:[{ code:'L-01', titre:'Maquette du site', rondes:2, ordre:1 },{ code:'L-02', titre:'Boutique en ligne complète', rondes:2, ordre:2 },{ code:'L-03', titre:'Logo final', rondes:1, ordre:3 },{ code:'L-04', titre:'Rapport de lancement SEO', rondes:1, ordre:4 }],
    recommandeeEnsuiteId:'off-croissance-seo' },

  { id:'off-commerce', code:'OFF-03', nom:'Commerce Digital', accroche:'Une boutique complète, pensée pour durer.', categorie:'web', recurrence:'ponctuel',
    segments:['Détaillants','Marques avec volume de vente en ligne'], populaire:false, active:true,
    prix:13000, prixType:'apartir', tarifEntree:null, delaiSemaines:{ min:8, max:12 }, consultationGratuiteMin:60,
    lignes:[
      { type:'offre', offreId:'off-croissance' },
      { type:'article', articleId:'PRD-15', qte:1, libelle:'Module de fidélité client' },
      { type:'article', articleId:'SRV-05', qte:3, libelle:'Lancement du netlinking, 3 mois' },
    ],
    benefices:['Écosystème e-commerce et fidélisation réunis','Netlinking lancé dès le premier trimestre','Un plan de croissance qui suit chaque mandat'],
    taches:[
      { titre:'Envoyer le contrat et la facture initiale', role:'Admin', echeance:'Jour 0' },
      { titre:'Tenir le rendez-vous de démarrage', role:'Chef de projet', echeance:'Jour 2' },
      { titre:'Collecter le contenu, catalogue et accès', role:'Chef de projet', echeance:'Jour 5' },
      { titre:'Rédiger les pages du site', role:'Rédacteur', echeance:'Jour 16' },
      { titre:'Configurer le catalogue et les paiements', role:'Chef de projet', echeance:'Jour 24' },
      { titre:'Développer le module de fidélité', role:'Chef de projet', echeance:'Jour 38' },
      { titre:'Tester le parcours d\u2019achat et de fidélité', role:'Chef de projet', echeance:'Jour 46' },
      { titre:'Lancer la première vague de netlinking', role:'Spécialiste SEO', echeance:'Jour 50' },
      { titre:'Livrer, former le client et lancer la boutique', role:'Chef de projet', echeance:'Jour 60' },
    ],
    livrables:[{ code:'L-01', titre:'Maquette du site', rondes:2, ordre:1 },{ code:'L-02', titre:'Boutique en ligne complète', rondes:2, ordre:2 },{ code:'L-03', titre:'Logo final', rondes:1, ordre:3 },{ code:'L-04', titre:'Module de fidélité', rondes:2, ordre:4 },{ code:'L-05', titre:'Rapport de lancement SEO', rondes:1, ordre:5 }],
    recommandeeEnsuiteId:'off-croissance-seo' },

  { id:'off-visibilite', code:'OFF-04', nom:'Visibilité Locale', accroche:'Être trouvé, près de chez vous.', categorie:'seo', recurrence:'mensuel',
    segments:['Commerces de proximité','Professionnels locaux'], populaire:false, active:true,
    prix:400, prixType:'fixe', tarifEntree:null, delaiSemaines:null, consultationGratuiteMin:20, abonnementsActifs:6,
    lignes:[
      { type:'article', articleId:'SRV-03', qte:1 },
      { type:'article', articleId:'SRV-06', qte:1 },
      { type:'article', articleId:'SRV-08', qte:1 },
      { type:'article', articleId:'SRV-22', qte:1 },
    ],
    benefices:['Visible sur Google Maps et les recherches locales','Fiche Google Business Profile tenue à jour','Un rapport clair chaque mois'],
    taches:[
      { titre:'Mettre à jour les positions suivies', role:'Spécialiste SEO', echeance:'Chaque mois, jour 3' },
      { titre:'Optimiser la fiche Google Business Profile', role:'Spécialiste SEO', echeance:'Chaque mois, jour 10' },
      { titre:'Produire le rapport mensuel', role:'Admin', echeance:'Chaque mois, jour 28' },
      { titre:'Appel de suivi avec le client', role:'Chef de projet', echeance:'Chaque mois, jour 25' },
    ],
    livrables:[{ code:'L-01', titre:'Rapport mensuel de performance', rondes:1, ordre:1 }],
    recommandeeEnsuiteId:'off-croissance-seo' },

  { id:'off-croissance-seo', code:'OFF-05', nom:'Croissance SEO', accroche:'Du trafic organique qui grandit chaque mois.', categorie:'seo', recurrence:'mensuel',
    segments:['PME en croissance organique'], populaire:true, active:true,
    prix:700, prixType:'fixe', tarifEntree:{ montant:525, periodes:3 }, delaiSemaines:null, consultationGratuiteMin:30, abonnementsActifs:4,
    lignes:[
      { type:'offre', offreId:'off-visibilite' },
      { type:'article', articleId:'SRV-04', qte:1 },
      { type:'article', articleId:'SRV-07', qte:2, libelle:'2 articles par mois' },
      { type:'article', articleId:'SRV-05', qte:1 },
    ],
    benefices:['Tout ce qui est dans Visibilité Locale','Du nouveau contenu chaque mois pour attirer du trafic','Les problèmes techniques corrigés avant qu\u2019ils ne coûtent des positions'],
    taches:[
      { titre:'Mettre à jour les positions suivies', role:'Spécialiste SEO', echeance:'Chaque mois, jour 3' },
      { titre:'Optimiser la fiche Google Business Profile', role:'Spécialiste SEO', echeance:'Chaque mois, jour 10' },
      { titre:'Produire le rapport mensuel', role:'Admin', echeance:'Chaque mois, jour 28' },
      { titre:'Appel de suivi avec le client', role:'Chef de projet', echeance:'Chaque mois, jour 25' },
      { titre:'Rédiger les articles de blog du mois', role:'Rédacteur', echeance:'Chaque mois, jour 15' },
      { titre:'Corriger les éléments techniques identifiés', role:'Spécialiste SEO', echeance:'Chaque mois, jour 20' },
    ],
    livrables:[{ code:'L-01', titre:'Rapport mensuel de performance', rondes:1, ordre:1 },{ code:'L-02', titre:'Articles de blog publiés', rondes:1, ordre:2 }],
    recommandeeEnsuiteId:'off-domination' },

  { id:'off-domination', code:'OFF-06', nom:'Domination SEO', accroche:'Prendre toute la place dans les résultats.', categorie:'seo', recurrence:'mensuel',
    segments:['Entreprises multi-succursales','Marchés concurrentiels'], populaire:false, active:true,
    prix:1100, prixType:'fixe', tarifEntree:null, delaiSemaines:null, consultationGratuiteMin:30, abonnementsActifs:2,
    lignes:[
      { type:'offre', offreId:'off-croissance-seo' },
      { type:'article', articleId:'SRV-05', qte:2, libelle:'Netlinking renforcé, 2× le volume' },
      { type:'article', articleId:'SRV-16', qte:1 },
      { type:'article', articleId:'SRV-21', qte:1 },
    ],
    benefices:['Tout ce qui est dans Croissance SEO','Netlinking renforcé pour dominer la concurrence','Présence active sur les réseaux sociaux et en publicité'],
    taches:[
      { titre:'Mettre à jour les positions suivies', role:'Spécialiste SEO', echeance:'Chaque mois, jour 3' },
      { titre:'Optimiser la fiche Google Business Profile', role:'Spécialiste SEO', echeance:'Chaque mois, jour 10' },
      { titre:'Produire le rapport mensuel', role:'Admin', echeance:'Chaque mois, jour 28' },
      { titre:'Appel de suivi avec le client', role:'Chef de projet', echeance:'Chaque mois, jour 25' },
      { titre:'Rédiger les articles de blog du mois', role:'Rédacteur', echeance:'Chaque mois, jour 15' },
      { titre:'Corriger les éléments techniques identifiés', role:'Spécialiste SEO', echeance:'Chaque mois, jour 20' },
      { titre:'Publier sur les réseaux sociaux', role:'Rédacteur', echeance:'Chaque mois, jours 7 et 21' },
      { titre:'Optimiser les campagnes Google Ads', role:'Spécialiste SEO', echeance:'Chaque mois, jour 14' },
    ],
    livrables:[{ code:'L-01', titre:'Rapport mensuel de performance', rondes:1, ordre:1 },{ code:'L-02', titre:'Articles de blog publiés', rondes:1, ordre:2 },{ code:'L-03', titre:'Bilan trimestriel de campagnes', rondes:1, ordre:3 }],
    recommandeeEnsuiteId:null },
];

const catFmt = (n) => n == null ? '—' : `${n.toLocaleString('fr-CA')} $`;
const catRecLabel = (r) => ({ ponctuel:'Ponctuel', mensuel:'Mensuel', trimestriel:'Trimestriel', annuel:'Annuel' }[r] || r);
const catArticle = (id) => CAT_ARTICLES.find(a => a.id === id);
const catOffer = (id, offers) => (offers || CAT_OFFERS).find(o => o.id === id);

const catLineValue = (line, offers) => {
  if (line.type === 'article') { const a = catArticle(line.articleId); if (!a || a.prixUnitaire == null) return null; return a.prixUnitaire * (line.qte || 1); }
  if (line.type === 'offre') { const o = catOffer(line.offreId, offers); return o ? o.prix : null; }
  if (line.type === 'groupe') { const opt = line.options[line.defaultIndex] || line.options[0]; if (!opt) return 0; const a = catArticle(opt.articleId); if (!a || a.prixUnitaire == null) return null; return a.prixUnitaire * (opt.qte || 1); }
  return 0;
};
const catValeur = (offer, offers) => {
  let total = 0; const missing = [];
  (offer.lignes || []).forEach(l => {
    const v = catLineValue(l, offers);
    if (v == null) { if (l.type === 'article') missing.push(catArticle(l.articleId)); else if (l.type === 'groupe') { const opt = l.options[l.defaultIndex] || l.options[0]; if (opt) missing.push(catArticle(opt.articleId)); } }
    else total += v;
  });
  return { total, missing };
};
const catArticleUsedIn = (articleId, offers) => (offers || CAT_OFFERS).filter(o => (o.lignes || []).some(l => (l.type === 'article' && l.articleId === articleId) || (l.type === 'groupe' && l.options.some(op => op.articleId === articleId))));
const catCanInclude = (offers, currentId, candidateId) => { if (candidateId === currentId) return false; const cand = catOffer(candidateId, offers); if (!cand) return false; return !(cand.lignes || []).some(l => l.type === 'offre' && l.offreId === currentId); };

Object.assign(window, { CAT_ARTICLES, CAT_OFFERS, CAT_TASK_ROLES, catFmt, catRecLabel, catArticle, catOffer, catLineValue, catValeur, catArticleUsedIn, catCanInclude });
