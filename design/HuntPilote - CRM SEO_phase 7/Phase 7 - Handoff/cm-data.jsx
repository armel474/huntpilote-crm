/* HuntPilote — Communications (7.2) : canaux, ancres de contexte, fil agence.
   Les messages du canal « portail » ne sont PAS dupliqués ici — cm-panels.jsx les lit
   directement depuis pc-thread-data.jsx (peScenario / peAnchor), même donnée des deux côtés. */

const CM_CHANNELS = {
  courriel:  { label:'Courriel',         visible:true,  connected:true,  tone:'blue' },
  portail:   { label:'Portail client',   visible:true,  connected:true,  tone:'green' },
  whatsapp:  { label:'WhatsApp',         visible:true,  connected:false, tone:'green' },
  messenger: { label:'Messenger',        visible:true,  connected:false, tone:'blue' },
  appel:     { label:'Appel',            visible:false, connected:true,  tone:'neutral' },
  reunion:   { label:'Réunion',          visible:false, connected:true,  tone:'violet' },
  note:      { label:'Note interne',     visible:false, connected:true,  tone:'yellow' },
  slack:     { label:'Slack (interne)',  visible:false, connected:false, tone:'neutral' },
};

const CM_CTX_KINDS = {
  priorite: { label:'Priorité', tone:'blue' },
  rapport:  { label:'Rapport',  tone:'neutral' },
  facture:  { label:'Facture',  tone:'yellow' },
  contact:  { label:'Contact',  tone:'violet' },
};

const CM_ANCHORS = [
  { id:'x0', kind:null,       label:'Aucun élément particulier' },
  { id:'x1', kind:'rapport',  label:'Rapport SEO · Avril 2026' },
  { id:'x2', kind:'priorite', label:'Vitesse mobile insuffisante (LCP 4,2 s)' },
  { id:'x3', kind:'priorite', label:'23 liens brisés détectés' },
  { id:'x4', kind:'facture',  label:'Facture · Mars 2026' },
  { id:'x5', kind:'contact',  label:'Julie Paquette · Responsable comptabilité' },
];
const cmAnchor = id => CM_ANCHORS.find(a => a.id === id);

/* Fil agence : appels, réunions, notes internes, courriels — hors messages du portail (fusionnés à l'affichage). */
const CM_AGENCY_ENTRIES = [
  { id:'g0', channel:'courriel', contact:'c1', dir:'out', who:'Automatique', day:'2 mai 2026',   at:'08 h 30', ts:20260502.08, text:'Rapport SEO · Avril 2026 envoyé à Marie Tremblay — généré et distribué automatiquement.', ctx:'x1', files:[{ name:'Rapport-avril-2026.pdf', size:'1,4 Mo' }] },
  { id:'g1', channel:'reunion',  contact:'c1', dir:'out', who:'Marie Chen',  day:'16 avril 2026', at:'10 h 00', ts:20260416.10, text:'Restitution de l’audit complet Q2 avec Marie Tremblay — 45 minutes en visio. Plan d’action validé pour les 3 priorités critiques.', ctx:'x2' },
  { id:'g2', channel:'courriel', contact:'c4', dir:'out', who:'Marie Chen',  day:'18 avril 2026', at:'09 h 40', ts:20260418.09, text:'Envoi du brief « Guide achat printemps » à David pour validation avant publication.', ctx:null },
  { id:'g3', channel:'appel',    contact:'c2', dir:'out', who:'Marie Chen',  day:'14 avril 2026', at:'11 h 20', ts:20260414.11, text:'Appel avec Marc-André pour obtenir l’accès Search Console — accordé en direct, confirmé par courriel le même jour.', ctx:null },
  { id:'g4', channel:'note',     contact:'c1', dir:'out', who:'Marie Chen',  day:'12 avril 2026', at:'09 h 15', ts:20260412.09, text:'Marie a mentionné en aparté qu’un directeur régional pousse pour des résultats visibles avant le prochain trimestre — à garder en tête pour le ton du prochain rapport.', ctx:null },
  { id:'g5', channel:'note',     contact:'c3', dir:'out', who:'Marie Chen',  day:'3 avril 2026',  at:'14 h 02', ts:20260403.14, text:'Julie confirme que les factures doivent être envoyées en Cc à comptes-payables@acmecorp.fr à partir de mai.', ctx:'x4' },
];

/* Historique plus ancien — utilisé pour l'état « long historique, groupé par mois ». */
const CM_OLD_ENTRIES = [
  { id:'o1', channel:'reunion',  contact:'c1', dir:'out', who:'Marie Chen', day:'12 décembre 2025', at:'14 h 00', ts:20251212.14, text:'Bilan annuel 2025 avec Marie Tremblay — reconduction du mandat confirmée pour 2026.', ctx:null },
  { id:'o2', channel:'courriel', contact:'c3', dir:'out', who:'Automatique', day:'3 novembre 2025', at:'08 h 10', ts:20251103.08, text:'Facture · Octobre 2025 envoyée à Julie.', ctx:'x4' },
  { id:'o3', channel:'note',     contact:'c2', dir:'out', who:'Marie Chen', day:'20 septembre 2025', at:'16 h 30', ts:20250920.16, text:'Marc-André signale une refonte du CMS prévue en 2026 — à surveiller pour la compatibilité SEO.', ctx:null },
];

/* Correspondance des id du fil portail (pc-thread-data.jsx) vers un horodatage triable et le kind d'ancre. */
const CM_PORTAL_TS = { m1:20261002.08, m2:20261003.14, m3:20261003.15, m4:20261006.09, m5:20261006.11, m6:20261009.08 };
const CM_PE_KIND_MAP = { preuve:'rapport', priorite:'priorite', kpi:'rapport', rapport:'rapport' };

Object.assign(window, { CM_CHANNELS, CM_CTX_KINDS, CM_ANCHORS, cmAnchor, CM_AGENCY_ENTRIES, CM_OLD_ENTRIES, CM_PORTAL_TS, CM_PE_KIND_MAP });
