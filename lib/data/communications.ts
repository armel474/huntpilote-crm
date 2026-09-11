/**
 * Communications — session 7.2.
 *
 * Un seul fil chronologique, tous canaux confondus : les entrées « agence »
 * ci-dessous (courriels, appels, réunions, notes internes) fusionnées avec
 * `PORTAL_THREAD` (session 5.2, `lib/data/portail.ts`) — importé, jamais
 * recopié, pour rester la même donnée des deux côtés (agence et portail).
 */

import type { Tone } from '@/components/ui/Atoms';
import { AGENCY_INTEGRATIONS } from '@/lib/data/settings';
import { CLIENT, CONTACTS, INVOICES, PRIORITIES, REPORTS } from '@/lib/data/fiche-client';
import { PORTAL_ACCOUNT, PORTAL_THREAD, portalAnchor } from '@/lib/data/portail';

/* ── Canaux ── */

export type ChannelId = 'courriel' | 'portail' | 'whatsapp' | 'messenger' | 'appel' | 'reunion' | 'note' | 'slack';

export type CommChannel = {
  id: ChannelId;
  label: string;
  /** Vu par le client, ou jamais — la distinction affichée sur chaque ligne du fil. */
  visible: boolean;
  connected: boolean;
  tone: Tone;
};

const integConnected = (id: string) => AGENCY_INTEGRATIONS.find((i) => i.id === id)?.connected ?? false;

export const CHANNELS: Record<ChannelId, CommChannel> = {
  courriel: { id: 'courriel', label: 'Courriel', visible: true, connected: true, tone: 'blue' },
  portail: { id: 'portail', label: 'Portail client', visible: true, connected: true, tone: 'green' },
  whatsapp: { id: 'whatsapp', label: 'WhatsApp', visible: true, connected: integConnected('whatsapp'), tone: 'green' },
  messenger: { id: 'messenger', label: 'Messenger', visible: true, connected: integConnected('messenger'), tone: 'blue' },
  appel: { id: 'appel', label: 'Appel', visible: false, connected: true, tone: 'neutral' },
  reunion: { id: 'reunion', label: 'Réunion', visible: false, connected: true, tone: 'violet' },
  note: { id: 'note', label: 'Note interne', visible: false, connected: true, tone: 'yellow' },
  slack: { id: 'slack', label: 'Slack (interne)', visible: false, connected: integConnected('slack'), tone: 'neutral' },
};

export const CHANNEL_IDS = Object.keys(CHANNELS) as ChannelId[];

/* ── Rattachement à un élément précis (priorité, rapport, facture, contact) ── */

export type CtxKind = 'priorite' | 'rapport' | 'facture' | 'contact';

export const CTX_KINDS: Record<CtxKind, { label: string; tone: Tone }> = {
  priorite: { label: 'Priorité', tone: 'blue' },
  rapport: { label: 'Rapport', tone: 'neutral' },
  facture: { label: 'Facture', tone: 'yellow' },
  contact: { label: 'Contact', tone: 'violet' },
};

export type Anchor = { id: string; kind: CtxKind | null; label: string };

const reportRef = REPORTS[0];
const invoiceRef = INVOICES.find((i) => i.status === 'Payée' && i.period === 'Mars 2026') ?? INVOICES[2];
const prioA = PRIORITIES[0];
const prioB = PRIORITIES[1];
const contactRef = CONTACTS.find((c) => c.id === 'c3')!;

/** Ancres réelles — jamais une liste inventée sans lien avec le reste de la fiche. */
export const ANCHORS: Anchor[] = [
  { id: 'x0', kind: null, label: 'Aucun élément particulier' },
  { id: 'x1', kind: 'rapport', label: `Rapport SEO · ${reportRef.period}` },
  { id: 'x2', kind: 'priorite', label: prioA.title },
  { id: 'x3', kind: 'priorite', label: prioB.title },
  { id: 'x4', kind: 'facture', label: `Facture · ${invoiceRef.period}` },
  { id: 'x5', kind: 'contact', label: `${contactRef.name} · ${contactRef.role}` },
];

export const anchor = (id: string): Anchor | undefined => ANCHORS.find((a) => a.id === id);

/* ── Fil agence : appels, réunions, notes internes, courriels ── */

export type CommFile = { name: string; size: string };

export type AgencyEntry = {
  id: string;
  channel: ChannelId;
  contactId: string;
  dir: 'in' | 'out';
  who: string;
  day: string;
  at: string;
  text: string;
  ctxId: string | null;
  files?: CommFile[];
};

export const AGENCY_ENTRIES: AgencyEntry[] = [
  {
    id: 'g0',
    channel: 'courriel',
    contactId: 'c1',
    dir: 'out',
    who: 'Automatique',
    day: '2 mai 2026',
    at: '08 h 30',
    text: 'Rapport SEO · Avril 2026 envoyé à Marie Tremblay — généré et distribué automatiquement.',
    ctxId: 'x1',
    files: [{ name: 'Rapport-avril-2026.pdf', size: '1,4 Mo' }],
  },
  {
    id: 'g1',
    channel: 'reunion',
    contactId: 'c1',
    dir: 'out',
    who: CLIENT.pm,
    day: '16 avril 2026',
    at: '10 h 00',
    text: 'Restitution de l’audit complet Q2 avec Marie Tremblay — 45 minutes en visio. Plan d’action validé pour les 3 priorités critiques.',
    ctxId: 'x2',
  },
  {
    id: 'g2',
    channel: 'courriel',
    contactId: 'c4',
    dir: 'out',
    who: CLIENT.pm,
    day: '18 avril 2026',
    at: '09 h 40',
    text: 'Envoi du brief « Guide achat printemps » à David pour validation avant publication.',
    ctxId: null,
  },
  {
    id: 'g3',
    channel: 'appel',
    contactId: 'c2',
    dir: 'out',
    who: CLIENT.pm,
    day: '14 avril 2026',
    at: '11 h 20',
    text: 'Appel avec Marc-André pour obtenir l’accès Search Console — accordé en direct, confirmé par courriel le même jour.',
    ctxId: null,
  },
  {
    id: 'g4',
    channel: 'note',
    contactId: 'c1',
    dir: 'out',
    who: CLIENT.pm,
    day: '12 avril 2026',
    at: '09 h 15',
    text: 'Marie a mentionné en aparté qu’un directeur régional pousse pour des résultats visibles avant le prochain trimestre — à garder en tête pour le ton du prochain rapport.',
    ctxId: null,
  },
  {
    id: 'g5',
    channel: 'note',
    contactId: 'c3',
    dir: 'out',
    who: CLIENT.pm,
    day: '3 avril 2026',
    at: '14 h 02',
    text: 'Julie confirme que les factures doivent être envoyées en Cc à comptes-payables@acmecorp.fr à partir de mai.',
    ctxId: 'x4',
  },
  {
    id: 'o1',
    channel: 'reunion',
    contactId: 'c1',
    dir: 'out',
    who: CLIENT.pm,
    day: '12 décembre 2025',
    at: '14 h 00',
    text: 'Bilan annuel 2025 avec Marie Tremblay — reconduction du mandat confirmée pour 2026.',
    ctxId: null,
  },
  {
    id: 'o2',
    channel: 'courriel',
    contactId: 'c3',
    dir: 'out',
    who: 'Automatique',
    day: '3 novembre 2025',
    at: '08 h 10',
    text: 'Facture · Octobre 2025 envoyée à Julie.',
    ctxId: 'x4',
  },
  {
    id: 'o3',
    channel: 'note',
    contactId: 'c2',
    dir: 'out',
    who: CLIENT.pm,
    day: '20 septembre 2025',
    at: '16 h 30',
    text: 'Marc-André signale une refonte du CMS prévue en 2026 — à surveiller pour la compatibilité SEO.',
    ctxId: null,
  },
];

/* ── Fusion en un seul fil ── */

export type CommRow = {
  id: string;
  channel: ChannelId;
  contactId: string;
  dir: 'in' | 'out';
  who: string;
  day: string;
  at: string;
  ts: number;
  text: string;
  files: CommFile[];
  ctx: { kind: CtxKind; label: string } | null;
};

const FR_MONTHS: Record<string, number> = {
  janvier: 0,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  décembre: 11,
};

/** Convertit « 2 mai 2026 » + « 08 h 30 » en horodatage triable. */
export function dateKey(day: string, at: string): number {
  if (/aujourd/i.test(day)) return Date.now();
  const dayMatch = day.match(/(\d{1,2})\s+([^\d]+?)\s+(\d{4})/);
  if (!dayMatch) return 0;
  const d = Number(dayMatch[1]);
  const monthName = dayMatch[2].trim().toLowerCase();
  const y = Number(dayMatch[3]);
  const m = FR_MONTHS[monthName] ?? 0;
  const atMatch = at.match(/(\d{1,2})\s*h\s*(\d{1,2})?/);
  const hh = atMatch ? Number(atMatch[1]) : 0;
  const mm = atMatch && atMatch[2] ? Number(atMatch[2]) : 0;
  return new Date(y, m, d, hh, mm).getTime();
}

/** Le compte connecté au portail est toujours le contact principal (session 7.1 ↔ 5.2). */
export const PORTAL_CONTACT_ID = 'c1';

const PORTAL_KIND_MAP: Record<string, CtxKind> = {
  preuve: 'rapport',
  priorite: 'priorite',
  kpi: 'rapport',
  rapport: 'rapport',
};

function agencyRows(): CommRow[] {
  return AGENCY_ENTRIES.map((e) => {
    const a = e.ctxId ? anchor(e.ctxId) : null;
    return {
      id: e.id,
      channel: e.channel,
      contactId: e.contactId,
      dir: e.dir,
      who: e.who,
      day: e.day,
      at: e.at,
      ts: dateKey(e.day, e.at),
      text: e.text,
      files: e.files ?? [],
      ctx: a && a.kind ? { kind: a.kind, label: a.label } : null,
    };
  });
}

/** Les messages du portail (`/portail/echanges`), tels quels — même donnée, pas une copie. */
function portalRows(): CommRow[] {
  return PORTAL_THREAD.map((m) => {
    const a = portalAnchor(m.ctx);
    const kind = a?.kind ? PORTAL_KIND_MAP[a.kind] : undefined;
    return {
      id: `pe-${m.id}`,
      channel: 'portail',
      contactId: PORTAL_CONTACT_ID,
      dir: m.from === 'client' ? 'in' : 'out',
      who: m.from === 'client' ? PORTAL_ACCOUNT.person : CLIENT.pm,
      day: m.day,
      at: m.at,
      ts: dateKey(m.day, m.at),
      text: m.text,
      files: (m.files ?? []).map((f) => ({ name: f.name, size: f.size })),
      ctx: kind && a ? { kind, label: a.label } : null,
    };
  });
}

/** Le fil unifié, du plus récent au plus ancien. */
export function commFeed(): CommRow[] {
  return [...agencyRows(), ...portalRows()].sort((a, b) => b.ts - a.ts);
}
