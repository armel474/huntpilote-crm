/* HuntPilote — Backlink Analyse : données de démonstration. Corpus non conservé : seuls gains et pertes s'historisent.
   Exporté sur window. */
const BLI = {
  Link: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.49-1.49" /></svg>,
  Domain: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" /></svg>,
  Skull: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="11" r="7" /><line x1="9" y1="11" x2="9.01" y2="11" strokeWidth="3" /><line x1="15" y1="11" x2="15.01" y2="11" strokeWidth="3" /><path d="M10 19l-1 3M14 19l1 3" /></svg>,
  Bar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  Doc: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Ban: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="5.5" y1="18.5" x2="18.5" y2="5.5" /></svg>,
};

const BL_SCOPES = ['Analyse standard', 'Analyse approfondie + toxicité', 'Analyse + concurrents'];
const BL_COSTS = { 'Analyse standard': { credits: 34, dollars: '0,17 $', weight: 'Requête légère' }, 'Analyse approfondie + toxicité': { credits: 88, dollars: '0,44 $', weight: 'Requête moyenne' }, 'Analyse + concurrents': { credits: 156, dollars: '0,78 $', weight: 'Requête lourde' } };

const PROFILE = { domains: 214, domainsPrev: 198, authority: 34, authorityPrev: 31, followed: 71, date: '4 sept. 2026' };
const ANCHORS = [{ t: 'acmecorp.ca', n: 44 }, { t: 'toiture montréal', n: 18 }, { t: 'cliquez ici', n: 9 }, { t: 'couvreur rive-sud', n: 6 }];

const GAINS = [
  { domain: 'batirenoquebec.ca', authority: 58, anchor: 'toiture montréal', url: '/services/toiture-plate', date: '3 sept. 2026' },
  { domain: 'lapresse-partenaires.ca', authority: 71, anchor: 'Acme Corp.', url: '/', date: '1 sept. 2026' },
  { domain: 'quincaillerie-fortin.ca', authority: 22, anchor: 'couvreur rive-sud', url: '/services/', date: '30 août 2026' },
  { domain: 'blogue-habitation.ca', authority: 40, anchor: 'inspection toiture drone', url: '/services/inspection-drone', date: '28 août 2026' },
];
const LOSSES = [
  { domain: 'annuaire-construction.ca', authority: 33, anchor: 'toiture rive-sud', reason: 'page supprimée', date: '2 sept. 2026' },
  { domain: 'partenaire-immo-estrie.ca', authority: 52, anchor: 'Acme Corp.', reason: 'lien retiré', date: '31 août 2026' },
  { domain: 'forum-renovation.ca', authority: 19, anchor: 'réparation toiture', reason: 'page 404', date: '29 août 2026' },
];

const TOXIC = [
  { domain: 'liens-gratuits-fr.ru', authority: 4, spam: 91, reason: 'réseau PBN suspecté', status: 'a-desavouer' },
  { domain: 'annuaire-2009-seo.com', authority: 2, spam: 84, reason: 'ferme à liens automatisée', status: 'a-desavouer' },
  { domain: 'casino-promo-xyz.net', authority: 1, spam: 97, reason: 'thématique sans rapport, ancre exacte', status: 'a-desavouer' },
];

const COMPETITORS = [
  { name: 'Acme Corp. (client)', domains: 214, self: true },
  { name: 'Couvreur Rive-Sud Inc.', domains: 340 },
  { name: 'Toitures Estrie', domains: 190 },
  { name: 'Réno-Toit Longueuil', domains: 128 },
];

const BL_SAVES = [
  { d: '28 août 2026', t: 'Backlink Analyse', w: '+18 domaines référents (delta) · 3 versés au rapport' },
  { d: '31 juil. 2026', t: 'Backlink Analyse', w: '+9 domaines référents (delta)' },
];

Object.assign(window, { BLI, BL_SCOPES, BL_COSTS, PROFILE, ANCHORS, GAINS, LOSSES, TOXIC, COMPETITORS, BL_SAVES });
