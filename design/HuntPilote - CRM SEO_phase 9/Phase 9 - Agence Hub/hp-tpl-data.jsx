/* HuntPilote — Agence hub : modèles de documents, dictionnaire de balises, données d'exemple. */
const DOC_KINDS = [
  { id: 'proposition', label: 'Proposition' },
  { id: 'devis', label: 'Devis' },
  { id: 'contrat', label: 'Contrat' },
  { id: 'annexe', label: 'Annexe' },
  { id: 'avenant', label: 'Avenant' },
  { id: 'facture', label: 'Facture' },
];

const DOC_TAG_GROUPS = [
  { id: 'agence', label: 'Agence', tags: [['agence.nom', 'HuntPilote'], ['agence.raison_sociale', 'HuntPilote inc.'], ['agence.adresse', '1200 av. McGill College, Montréal, QC'], ['agence.telephone', '(514) 555-0100'], ['agence.courriel', 'bonjour@huntpilote.ca'], ['agence.site', 'huntpilote.ca'], ['agence.tps', '123456789 RT0001'], ['agence.tvq', '1234567890 TQ0001'], ['agence.neq', '1148236704'], ['agence.logo', '(image)']] },
  { id: 'client', label: 'Client', tags: [['client.nom', 'SHGM'], ['client.raison_sociale', 'Société d\u2019histoire de la Grande Montée'], ['client.adresse', '482 rue Principale, Rivière-du-Loup, QC'], ['client.contact.nom', 'Hélène Bouchard'], ['client.contact.courriel', 'h.bouchard@shgm.org'], ['client.contact.titre', 'Directrice générale']] },
  { id: 'document', label: 'Document', tags: [['document.reference', 'DV-2026-017'], ['document.date', '12 septembre 2026'], ['document.echeance', '12 octobre 2026'], ['document.objet', 'Refonte du site web'], ['document.introduction', '(texte du modèle)'], ['document.mentions', '(texte du modèle)'], ['document.pied', '(texte du modèle)'], ['document.paiement', '(texte du modèle)']] },
  { id: 'lignes', label: 'Lignes', block: 'lignes', tags: [['ligne.description', 'Conception du site'], ['ligne.quantite', '1'], ['ligne.prix', '6 400,00 $'], ['ligne.montant', '6 400,00 $']] },
  { id: 'totaux', label: 'Totaux', tags: [['total.ht', '8 740,00 $'], ['total.tps', '437,00 $'], ['total.tvq', '871,82 $'], ['total.ttc', '10 048,82 $']] },
  { id: 'contrat', label: 'Contrat', tags: [['livrables (bloc)', '{{#livrables}} {{livrable.code}} {{livrable.titre}} {{livrable.echeance}} {{/livrables}}'], ['jalons (bloc)', '{{#jalons}} {{jalon.titre}} {{jalon.date}} {{/jalons}}'], ['exclusions (bloc)', '{{#exclusions}} {{exclusion.texte}} {{/exclusions}}'], ['paiements (bloc)', '{{#paiements}} {{paiement.titre}} {{paiement.montant}} {{paiement.echeance}} {{/paiements}}'], ['attendus_client (bloc)', '{{#attendus_client}} {{attendu.texte}} {{/attendus_client}}']] },
  { id: 'signature', label: 'Signature', tags: [['signature.agence', 'Marie Chen, Fondatrice & directrice'], ['signature.client', 'Hélène Bouchard, Directrice générale'], ['signature.date', '___________________']] },
];
const DOC_KNOWN_BLOCKS = ['lignes', 'livrables', 'jalons', 'exclusions', 'paiements', 'attendus_client'];
const DOC_BLOCK_PREFIX = { lignes: 'ligne', livrables: 'livrable', jalons: 'jalon', exclusions: 'exclusion', paiements: 'paiement', attendus_client: 'attendu' };
const DOC_KNOWN_TAGS = DOC_TAG_GROUPS.flatMap(g => g.tags.map(([t]) => t)).filter(t => !t.includes('('));

/* ── Corps HTML des modèles réels de l'agence (collés depuis Claude Design) ── */
const PROP_HTML = `<div class="cdoc">
  <div class="cdoc-head">
    <div><div class="cdoc-title">Proposition de services</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div>
    <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px;margin-bottom:2px">{{agence.nom}}</div>{{agence.adresse}}<br>{{agence.telephone}} · {{agence.courriel}}</div>
  </div>
  <div class="cdoc-section-t">Préparée pour</div>
  <div class="cdoc-p"><b>{{client.raison_sociale}}</b><br>{{client.adresse}}<br>À l\u2019attention de {{client.contact.nom}}, {{client.contact.titre}}</div>
  <div class="cdoc-section-t">Objet</div>
  <div class="cdoc-p">{{document.objet}}</div>
  <div class="cdoc-p">{{document.introduction}}</div>
  <div class="cdoc-section-t">Portée des travaux</div>
  <table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead><tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.quantite}}</td><td class="num">{{ligne.prix}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>
  <div class="cdoc-totals"><div class="cdoc-totals-row"><span>Sous-total</span><span>{{total.ht}}</span></div><div class="cdoc-totals-row"><span>TPS</span><span>{{total.tps}}</span></div><div class="cdoc-totals-row"><span>TVQ</span><span>{{total.tvq}}</span></div><div class="cdoc-totals-row ttc"><span>Total</span><span>{{total.ttc}}</span></div></div>
  <div class="cdoc-section-t">Conditions</div>
  <div class="cdoc-p">{{document.paiement}}</div>
  <div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>
</div>`;

const DEVIS_STD_HTML = `<div class="cdoc">
  <div class="cdoc-head">
    <div><div class="cdoc-title">Devis</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div>
    <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px">{{agence.nom}}</div>{{agence.adresse}}<br>{{agence.tps}} · {{agence.tvq}}</div>
  </div>
  <div class="cdoc-p">Préparé pour <b>{{client.raison_sociale}}</b>, à l\u2019attention de {{client.contact.nom}}.<br>Nom commercial : {{client.nom_commercial}}</div>
  <div class="cdoc-p">{{document.objet}}</div>
  <table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead><tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.quantite}}</td><td class="num">{{ligne.prix}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>
  <div class="cdoc-totals"><div class="cdoc-totals-row"><span>Sous-total</span><span>{{total.ht}}</span></div><div class="cdoc-totals-row"><span>TPS</span><span>{{total.tps}}</span></div><div class="cdoc-totals-row"><span>TVQ</span><span>{{total.tvq}}</span></div><div class="cdoc-totals-row"><span>TVH (ancienne)</span><span>{{total.tvh}}</span></div><div class="cdoc-totals-row ttc"><span>Total</span><span>{{total.ttc}}</span></div></div>
  <div class="cdoc-p">Ce devis est valide jusqu\u2019au {{document.echeance}}. {{document.paiement}}</div>
  <div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>
</div>`;

const DEVIS_SIMPLE_HTML = `<div class="cdoc">
  <div class="cdoc-head"><div><div class="cdoc-title">Devis</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div><div class="cdoc-agence">{{agence.nom}}</div></div>
  <div class="cdoc-p">Pour {{client.raison_sociale}} — {{document.objet}}</div>
  <table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Montant</th></tr></thead><tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>
  <div class="cdoc-totals"><div class="cdoc-totals-row ttc"><span>Total (taxes incluses)</span><span>{{total.ttc}}</span></div></div>
  <div class="cdoc-foot">Valide jusqu\u2019au {{document.echeance}}. {{document.pied}}</div>
</div>`;

const CONTRAT_HTML = `<div class="cdoc">
  <div class="cdoc-head"><div><div class="cdoc-title">Contrat de services professionnels</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div>
  <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px">{{agence.nom}}</div>{{agence.raison_sociale}}<br>{{agence.adresse}}<br>NEQ {{agence.neq}}</div></div>
  <div class="cdoc-p">Entre <b>{{agence.raison_sociale}}</b> (« l\u2019Agence ») et <b>{{client.raison_sociale}}</b> (« le Client »), représenté par {{client.contact.nom}}, {{client.contact.titre}}.</div>
  <div class="cdoc-section-t">Objet du contrat</div>
  <div class="cdoc-p">{{document.objet}}. Les livrables et l\u2019échéancier détaillés sont présentés à l\u2019Annexe A du présent contrat.</div>
  <div class="cdoc-section-t">Durée et jalons</div>
  <table class="cdoc-table"><thead><tr><th>Jalon</th><th class="num">Échéance</th></tr></thead><tbody>{{#jalons}}<tr><td>{{jalon.titre}}</td><td class="num">{{jalon.date}}</td></tr>{{/jalons}}</tbody></table>
  <div class="cdoc-section-t">Modalités de paiement</div>
  <table class="cdoc-table"><thead><tr><th>Versement</th><th class="num">Montant</th><th class="num">Échéance</th></tr></thead><tbody>{{#paiements}}<tr><td>{{paiement.titre}}</td><td class="num">{{paiement.montant}}</td><td class="num">{{paiement.echeance}}</td></tr>{{/paiements}}</tbody></table>
  <div class="cdoc-section-t">Ce qui est exclu</div>
  <ul class="cdoc-list">{{#exclusions}}<li>{{exclusion.texte}}</li>{{/exclusions}}</ul>
  <div class="cdoc-section-t">Attendus du Client</div>
  <ul class="cdoc-list">{{#attendus_client}}<li>{{attendu.texte}}</li>{{/attendus_client}}</ul>
  <div class="cdoc-p">{{document.mentions}}</div>
  <div class="cdoc-sign"><div>{{signature.agence}}<div class="cdoc-sign-line">Pour l\u2019Agence — {{signature.date}}</div></div><div>{{signature.client}}<div class="cdoc-sign-line">Pour le Client — {{signature.date}}</div></div></div>
  <div class="cdoc-foot">{{document.pied}}</div>
</div>`;

const ANNEXE_HTML = `<div class="cdoc">
  <div class="cdoc-head"><div><div class="cdoc-title">Annexe A — Livrables et échéancier</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div><div class="cdoc-agence">{{agence.nom}}</div></div>
  <div class="cdoc-p">Annexe au contrat conclu avec <b>{{client.raison_sociale}}</b>.</div>
  <div class="cdoc-section-t">Livrables</div>
  <table class="cdoc-table"><thead><tr><th>Livrable</th><th>Description</th><th class="num">Échéance</th></tr></thead><tbody>{{#livrables}}<tr><td>{{livrable.code}}</td><td>{{livrable.titre}}</td><td class="num">{{livrable.echeance}}</td></tr>{{/livrables}}</tbody></table>
  <div class="cdoc-section-t">Jalons</div>
  <table class="cdoc-table"><thead><tr><th>Jalon</th><th class="num">Date</th></tr></thead><tbody>{{#jalons}}<tr><td>{{jalon.titre}}</td><td class="num">{{jalon.date}}</td></tr>{{/jalons}}</tbody></table>
  <div class="cdoc-foot">{{document.pied}}</div>
</div>`;

const FACTURE_HTML = `<div class="cdoc">
  <div class="cdoc-head"><div><div class="cdoc-title">Facture</div><div class="cdoc-ref">{{document.reference}} · {{document.date}}</div></div>
  <div class="cdoc-agence"><div style="font-weight:700;color:#18181B;font-size:13px">{{agence.nom}}</div>{{agence.adresse}}<br>TPS {{agence.tps}} · TVQ {{agence.tvq}}</div></div>
  <div class="cdoc-p">Facturé à <b>{{client.raison_sociale}}</b><br>{{client.adresse}}</div>
  <table class="cdoc-table"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead><tbody>{{#lignes}}<tr><td>{{ligne.description}}</td><td class="num">{{ligne.quantite}}</td><td class="num">{{ligne.prix}}</td><td class="num">{{ligne.montant}}</td></tr>{{/lignes}}</tbody></table>
  <div class="cdoc-totals"><div class="cdoc-totals-row"><span>Sous-total</span><span>{{total.ht}}</span></div><div class="cdoc-totals-row"><span>TPS</span><span>{{total.tps}}</span></div><div class="cdoc-totals-row"><span>TVQ</span><span>{{total.tvq}}</span></div><div class="cdoc-totals-row ttc"><span>Total dû</span><span>{{total.ttc}}</span></div></div>
  <div class="cdoc-p">Échéance de paiement : {{document.echeance}}. {{document.paiement}}</div>
  <div class="cdoc-foot">{{document.mentions}}<br>{{document.pied}}</div>
</div>`;

const DOC_TEMPLATES = [
  { id: 'tpl-prop', kind: 'proposition', nom: 'Proposition de services', prefixe: 'PR', includeYear: true, numWidth: 3, delaiPaiementJours: 15, isDefault: true, nbDocuments: 14, lastModified: '28 août 2026', html: PROP_HTML, introduction: 'Nous sommes heureux de vous présenter cette proposition, préparée spécifiquement pour vos objectifs.', mentions: 'Cette proposition est confidentielle et destinée exclusivement au destinataire nommé ci-dessus.', pied: 'HuntPilote inc. · 1200 av. McGill College, Montréal, QC H3B 4G7 · huntpilote.ca', paiement: '50 % à l\u2019acceptation, solde à la livraison. Virement Interac ou carte via le lien Stripe joint.' },
  { id: 'tpl-dv-std', kind: 'devis', nom: 'Devis standard', prefixe: 'DV', includeYear: true, numWidth: 3, delaiPaiementJours: 30, isDefault: true, nbDocuments: 17, lastModified: '2 septembre 2026', html: DEVIS_STD_HTML, introduction: '', mentions: 'Devis valide 30 jours à compter de la date d\u2019émission.', pied: 'HuntPilote inc. · huntpilote.ca', paiement: 'Paiement à la commande ou selon les modalités convenues.' },
  { id: 'tpl-dv-simple', kind: 'devis', nom: 'Devis simplifié', prefixe: 'DV', includeYear: true, numWidth: 3, delaiPaiementJours: 30, isDefault: false, nbDocuments: 3, lastModified: '14 juillet 2026', html: DEVIS_SIMPLE_HTML, introduction: '', mentions: '', pied: 'huntpilote.ca', paiement: 'Paiement à la commande.' },
  { id: 'tpl-ct', kind: 'contrat', nom: 'Contrat de services professionnels', prefixe: 'CT', includeYear: true, numWidth: 3, delaiPaiementJours: 0, isDefault: true, nbDocuments: 9, lastModified: '19 août 2026', html: CONTRAT_HTML, introduction: '', mentions: 'Ce contrat est régi par les lois de la province de Québec.', pied: 'HuntPilote inc. · NEQ 1148236704', paiement: '' },
  { id: 'tpl-an', kind: 'annexe', nom: 'Annexe A — Livrables et échéancier', prefixe: 'AN', includeYear: true, numWidth: 3, delaiPaiementJours: 0, isDefault: true, nbDocuments: 9, lastModified: '19 août 2026', html: ANNEXE_HTML, introduction: '', mentions: '', pied: 'HuntPilote inc.', paiement: '' },
  { id: 'tpl-fa', kind: 'facture', nom: 'Facture standard', prefixe: 'FA', includeYear: true, numWidth: 3, delaiPaiementJours: 15, isDefault: true, nbDocuments: 52, lastModified: '5 septembre 2026', html: FACTURE_HTML, introduction: '', mentions: 'Taxes incluses au calcul ci-dessus. TPS/TVQ nos 123456789 RT0001 / 1234567890 TQ0001.', pied: 'HuntPilote inc. · huntpilote.ca · Merci de votre confiance.', paiement: 'Paiement dû dans les 15 jours suivant réception. Virement Interac à paiements@huntpilote.ca.' },
];

/* ── Données d'exemple pour l'aperçu ── */
const DOC_AGENCE = { nom: 'HuntPilote', raison_sociale: 'HuntPilote inc.', adresse: '1200 av. McGill College, Montréal, QC H3B 4G7', telephone: '(514) 555-0100', courriel: 'bonjour@huntpilote.ca', site: 'huntpilote.ca', tps: '123456789 RT0001', tvq: '1234567890 TQ0001', neq: '1148236704' };
const DOC_LIGNES = [
  { description: 'Audit et stratégie initiale', quantite: 1, prix: '900,00 $', montant: '900,00 $' },
  { description: 'Conception et développement du site (8 gabarits)', quantite: 1, prix: '6 400,00 $', montant: '6 400,00 $' },
  { description: 'Rédaction de contenu (8 pages)', quantite: 8, prix: '120,00 $', montant: '960,00 $' },
  { description: 'Suivi SEO local, 3 mois inclus', quantite: 3, prix: '160,00 $', montant: '480,00 $' },
];
const DOC_TOTAL = { ht: '8 740,00 $', tps: '437,00 $', tvq: '871,82 $', ttc: '10 048,82 $' };
const DOC_LIVRABLES = [
  { code: 'L-01', titre: 'Audit du site actuel', echeance: 'Semaine 1' }, { code: 'L-02', titre: 'Architecture de l\u2019information', echeance: 'Semaine 2' },
  { code: 'L-03', titre: 'Maquettes des gabarits principaux', echeance: 'Semaine 3' }, { code: 'L-04', titre: 'Charte graphique adaptée', echeance: 'Semaine 3' },
  { code: 'L-05', titre: 'Développement du gabarit d\u2019accueil', echeance: 'Semaine 5' }, { code: 'L-06', titre: 'Développement des pages intérieures', echeance: 'Semaine 6' },
  { code: 'L-07', titre: 'Intégration du contenu et des archives historiques', echeance: 'Semaine 7' }, { code: 'L-08', titre: 'Formulaire de dons et d\u2019adhésion', echeance: 'Semaine 8' },
  { code: 'L-09', titre: 'Rédaction des pages (8 pages)', echeance: 'Semaine 8' }, { code: 'L-10', titre: 'Tests et corrections', echeance: 'Semaine 9' },
  { code: 'L-11', titre: 'Formation et mise en ligne', echeance: 'Semaine 10' },
];
const DOC_JALONS = [{ titre: 'Signature du contrat', date: '1 septembre 2026' }, { titre: 'Livraison des maquettes', date: '22 septembre 2026' }, { titre: 'Recette du site', date: '10 novembre 2026' }, { titre: 'Mise en ligne', date: '17 novembre 2026' }];
const DOC_EXCLUSIONS = [{ texte: 'Rédaction de contenu au-delà des 8 pages prévues' }, { texte: 'Traduction anglaise du site' }, { texte: 'Hébergement au-delà de la première année' }];
const DOC_PAIEMENTS = [{ titre: 'À la signature', montant: '50 %', echeance: '12 septembre 2026' }, { titre: 'À la livraison', montant: '50 %', echeance: '17 novembre 2026' }];
const DOC_ATTENDUS = [{ texte: 'Fournir les textes et photos d\u2019archives dans les 10 jours suivant la signature' }, { texte: 'Désigner une personne responsable des approbations' }, { texte: 'Valider chaque livrable dans un délai de 5 jours ouvrables' }];

const DOC_SAMPLE_CLIENTS = [
  { id: 'shgm', label: 'SHGM — contrat 2026-007', client: { nom: 'SHGM', raison_sociale: 'Société d\u2019histoire de la Grande Montée', adresse: '482 rue Principale, Rivière-du-Loup, QC G5R 1K2', contact: { nom: 'Hélène Bouchard', courriel: 'h.bouchard@shgm.org', titre: 'Directrice générale' } }, reference: 'CT-2026-007', objet: 'Refonte du site web et mise en valeur numérique du patrimoine de la SHGM' },
  { id: 'long', label: 'Coopérative BSL — nom et adresse longs', client: { nom: 'Coop. BSL', raison_sociale: 'Coopérative de solidarité en aménagement forestier, développement communautaire et transition énergétique du Bas-Saint-Laurent', adresse: '1425, boulevard de l\u2019Industrie, bureau 300<br>Secteur Notre-Dame-du-Portage<br>Rivière-du-Loup, QC G5R 5X4', contact: { nom: 'Jean-Sébastien Ouellet-Tremblay', courriel: 'js.ouellet-tremblay@cooperative-bsl.qc.ca', titre: 'Directeur général adjoint aux partenariats et au développement' } }, reference: 'CT-2026-011', objet: 'Refonte du site web et stratégie de visibilité numérique' },
];

const docBuildData = (template, sample) => ({
  agence: DOC_AGENCE,
  client: sample.client,
  document: { reference: sample.reference, date: '12 septembre 2026', echeance: '12 octobre 2026', objet: sample.objet, introduction: template.introduction, mentions: template.mentions, pied: template.pied, paiement: template.paiement },
  lignes: DOC_LIGNES, total: DOC_TOTAL, livrables: DOC_LIVRABLES, jalons: DOC_JALONS, exclusions: DOC_EXCLUSIONS, paiements: DOC_PAIEMENTS, attendus_client: DOC_ATTENDUS,
  signature: { agence: 'Marie Chen, Fondatrice & directrice', client: `${sample.client.contact.nom}, ${sample.client.contact.titre}`, date: '___________________' },
});

/* ── Rendu mustache minimal ── */
const docRender = (html, data) => {
  let out = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (m, block, inner) => {
    const arr = data[block] || []; const prefix = DOC_BLOCK_PREFIX[block] || block.replace(/s$/, '');
    return arr.map((item) => inner.replace(/\{\{(\w+)\.(\w+)\}\}/g, (mm, p, f) => p === prefix ? (item[f] != null ? item[f] : '') : mm)).join('');
  });
  out = out.replace(/\{\{([\w.]+)\}\}/g, (m, path) => {
    const parts = path.split('.'); let v = data;
    for (const p of parts) v = v && v[p] !== undefined ? v[p] : undefined;
    return v != null ? v : m;
  });
  return out;
};

/* ── Analyse : balises reconnues / inconnues / blocs ── */
const docLevenshtein = (a, b) => { const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 0; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]); return d[m][n]; };
const docClosestTag = (tag) => { let best = null, bestD = Infinity; DOC_KNOWN_TAGS.forEach((k) => { const dist = docLevenshtein(tag, k); if (dist < bestD) { bestD = dist; best = k; } }); return bestD <= 6 ? best : null; };

const docParseTags = (html) => {
  const blockNames = new Set(); const re1 = /\{\{#(\w+)\}\}/g; let mm; while ((mm = re1.exec(html))) blockNames.add(mm[1]);
  const tagRe = /\{\{(\/?#?[\w.]+)\}\}/g; let m; const seen = new Set(); let knownCount = 0; const unknown = [];
  while ((m = tagRe.exec(html))) {
    let raw = m[1]; if (raw.startsWith('/')) continue;
    if (raw.startsWith('#')) continue;
    if (seen.has(raw)) continue; seen.add(raw);
    if (DOC_KNOWN_TAGS.includes(raw)) knownCount++;
    else unknown.push({ tag: raw, suggestion: docClosestTag(raw) });
  }
  return { knownCount, unknown, blocks: [...blockNames] };
};

const docNextRef = (t, year) => `${t.prefixe}-${t.includeYear ? year + '-' : ''}${(t.nbDocuments + 1).toString().padStart(t.numWidth, '0')}`;

Object.assign(window, { DOC_KINDS, DOC_TAG_GROUPS, DOC_KNOWN_BLOCKS, DOC_TEMPLATES, DOC_SAMPLE_CLIENTS, docBuildData, docRender, docParseTags, docNextRef, docClosestTag });
