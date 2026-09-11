/* HuntPilote — Contacts d'un client : données de démonstration (Acme Corp.) */
const CT_CONTACTS = [
  { id:'c1', name:'Marie Tremblay', role:'Directrice marketing', initials:'MT', principal:true,
    email:'marie.tremblay@acmecorp.fr', phone:'(514) 555-0182', channel:'email', establishment:null, status:'actif',
    notes:'Décideuse finale sur le budget SEO. Préfère les échanges écrits — résume toujours l’appel par courriel après coup. Titulaire du compte portail client.' },
  { id:'c2', name:'Marc-André Bissonnette', role:'Responsable TI', initials:'MB', principal:false,
    email:'ma.bissonnette@acmecorp.fr', phone:null, channel:'email', establishment:null, status:'actif',
    notes:'Point de contact pour tout accès technique (DNS, serveur, GA4). Répond lentement le lundi.' },
  { id:'c3', name:'Julie Paquette', role:'Responsable comptabilité', initials:'JP', principal:false,
    email:'j.paquette@acmecorp.fr', phone:'(514) 555-0199', channel:'phone', establishment:null, status:'actif',
    notes:'Contact facturation uniquement — ne pas inclure dans les communications SEO.' },
  { id:'c4', name:'David Lemieux', role:'Coordonnateur contenu', initials:'DL', principal:false,
    email:null, phone:'(514) 555-0140', channel:'phone', establishment:null, status:'actif',
    notes:'Valide les briefs d’articles avant publication. Courriel professionnel pas encore renseigné.' },
  { id:'c5', name:'Éric Fontaine', role:'Ancien directeur marketing', initials:'EF', principal:false,
    email:'e.fontaine@acmecorp.fr', phone:'(514) 555-0107', channel:'email', establishment:null, status:'archive',
    notes:'A quitté l’entreprise en mars 2026 — conservé pour l’historique des échanges.' },
];

const CT_ECHANGES = {
  c1: [
    { type:'Email', subject:'Rapport SEO · Avril 2026 envoyé', date:'2 mai 2026', state:'Ouvert le 2 mai' },
    { type:'Appel', subject:'Point mensuel — priorités T2', date:'28 avr. 2026', state:'32 min' },
    { type:'Email', subject:'Validation du plan éditorial (5 articles)', date:'21 avr. 2026', state:'Répondu' },
  ],
  c2: [
    { type:'Email', subject:'Accès Google Search Console demandé', date:'14 avr. 2026', state:'Répondu' },
    { type:'Email', subject:'Migration DNS — fenêtre de maintenance', date:'2 avr. 2026', state:'Répondu' },
  ],
  c3: [
    { type:'Email', subject:'Facture · Mars 2026', date:'3 avr. 2026', state:'Payée' },
  ],
  c4: [
    { type:'Appel', subject:'Brief article « Guide achat printemps »', date:'18 avr. 2026', state:'22 min' },
  ],
  c5: [
    { type:'Réunion', subject:'Bilan annuel 2025', date:'12 déc. 2025', state:'Visio · 40 min' },
  ],
};

Object.assign(window, { CT_CONTACTS, CT_ECHANGES });
