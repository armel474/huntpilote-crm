/**
 * Ce que le générateur de documents lit dans la base — session 9.4 : la
 * liste de tout ce qui a été produit, un document avec ses lignes, ses
 * sections, ses versions et son journal, les données de son rendu, et ce
 * que le panneau « Nouveau document » propose (modèles, offres, articles,
 * contacts, documents sources).
 *
 * Fonctions serveur : elles reçoivent le client de la requête, donc les
 * droits de la personne connectée.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocData } from '@/lib/documents/balises';
import { renderTemplate, unfilledTags } from '@/lib/documents/balises';
import { previewDocument } from '@/lib/documents/apercu';
import {
  DEFAULT_RATES,
  agencyBlock,
  clientBlock,
  computeTotals,
  documentBlock,
  fmtDate,
  linesToBlocks,
  loadCatalogueBlocks,
  loadContractBlocks,
  sectionsBlock,
  totalsToBlocks,
  type Billing,
  type DocLine,
  type LineKind,
  type Rates,
  type Totals,
} from '@/lib/documents/donnees';
import type { Database } from '@/lib/supabase/database.types';

type Db = SupabaseClient<Database>;

/** Les sortes que le générateur produit à cette étape ; contrat, annexe et avenant viennent avec « Créer la suite ». */
export type GenKind = 'devis' | 'proposition' | 'facture';
export const GEN_KIND_LABEL: Record<GenKind, string> = { proposition: 'Proposition', devis: 'Devis', facture: 'Facture' };

/** L'état d'un document tel qu'on l'affiche — calculé, jamais stocké tel quel. */
export type DocStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire' | 'payee' | 'retard' | 'annule';

export const STATUS_META: Record<DocStatus, { label: string; tone: 'neutral' | 'blue' | 'green' | 'red' | 'yellow' }> = {
  brouillon: { label: 'Brouillon', tone: 'neutral' },
  envoye: { label: 'Envoyé', tone: 'blue' },
  accepte: { label: 'Accepté', tone: 'green' },
  refuse: { label: 'Refusé', tone: 'red' },
  expire: { label: 'Expiré', tone: 'yellow' },
  payee: { label: 'Payée', tone: 'green' },
  retard: { label: 'En retard', tone: 'red' },
  annule: { label: 'Annulée', tone: 'neutral' },
};

const today = () => new Date().toISOString().slice(0, 10);

function quoteStatus(q: { status: Database['public']['Enums']['quote_status']; expires_on: string | null }): DocStatus {
  if (q.status === 'envoye' && q.expires_on && q.expires_on < today()) return 'expire';
  return q.status;
}

function invoiceStatus(i: { status: Database['public']['Enums']['invoice_status']; sent_at: string | null; due_on: string | null }): DocStatus {
  if (i.status === 'annulee') return 'annule';
  if (i.status === 'payee') return 'payee';
  if (!i.sent_at) return 'brouillon';
  if (i.status === 'en_retard' || (i.due_on && i.due_on < today())) return 'retard';
  return 'envoye';
}

/* ── La liste ─────────────────────────────────────────────────────────── */

export type DocumentRow = {
  id: string;
  kind: GenKind;
  ref: string;
  clientId: string;
  clientName: string;
  subject: string;
  totalCents: number;
  status: DocStatus;
  /** La date qui compte à l'écran : émission, sinon création. */
  dateIso: string;
  dateLabel: string;
  person: string;
  dealId: string | null;
};

export type DocumentSummary = { tone: 'yellow' | 'red'; text: string; ids: string[] };

export type DocumentsList = { rows: DocumentRow[]; summaries: DocumentSummary[] };

const fmtShort = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDate = (iso: string | null | undefined) => (iso ? fmtShort.format(new Date(iso.includes('T') ? iso : `${iso}T00:00:00`)) : '—');

export async function loadDocumentsList(db: Db): Promise<DocumentsList> {
  const [quotes, invoices, qTotals, iTotals, events] = await Promise.all([
    db.from('quote').select('id, kind, ref, subject, status, issued_on, expires_on, created_at, deal_id, client:client_id(id, name)').order('created_at', { ascending: false }),
    db.from('invoice').select('id, ref, status, issued_on, due_on, sent_at, created_at, client:client_id(id, name), lines:invoice_line(description)').order('created_at', { ascending: false }),
    db.from('quote_total').select('quote_id, total_cents'),
    db.from('invoice_total').select('invoice_id, total_cents'),
    db.from('document_event').select('quote_id, invoice_id, occurred_at, member:member_id(full_name), contact:contact_id(full_name)').order('occurred_at', { ascending: false }),
  ]);
  const qTotal = new Map((qTotals.data ?? []).map((t) => [t.quote_id, t.total_cents ?? 0]));
  const iTotal = new Map((iTotals.data ?? []).map((t) => [t.invoice_id, t.total_cents ?? 0]));
  const lastPerson = new Map<string, string>();
  for (const e of events.data ?? []) {
    const key = e.quote_id ?? e.invoice_id;
    if (key && !lastPerson.has(key)) lastPerson.set(key, e.member?.full_name ?? e.contact?.full_name ?? '—');
  }

  const rows: DocumentRow[] = [];
  for (const q of quotes.data ?? []) {
    if (!q.client) continue;
    rows.push({
      id: q.id,
      kind: q.kind,
      ref: q.ref,
      clientId: q.client.id,
      clientName: q.client.name,
      subject: q.subject,
      totalCents: qTotal.get(q.id) ?? 0,
      status: quoteStatus(q),
      dateIso: q.issued_on ?? q.created_at,
      dateLabel: shortDate(q.issued_on ?? q.created_at),
      person: lastPerson.get(q.id) ?? '—',
      dealId: q.deal_id,
    });
  }
  for (const i of invoices.data ?? []) {
    if (!i.client) continue;
    rows.push({
      id: i.id,
      kind: 'facture',
      ref: i.ref,
      clientId: i.client.id,
      clientName: i.client.name,
      subject: i.lines?.[0]?.description ?? 'Facture',
      totalCents: iTotal.get(i.id) ?? 0,
      status: invoiceStatus(i),
      dateIso: i.issued_on ?? i.created_at,
      dateLabel: shortDate(i.issued_on ?? i.created_at),
      person: lastPerson.get(i.id) ?? '—',
      dealId: null,
    });
  }
  rows.sort((a, b) => (b.dateIso > a.dateIso ? 1 : b.dateIso < a.dateIso ? -1 : 0));

  // Les résumés sont des manques, pas des décorations.
  const now = today();
  const inAWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
  const expiring = (quotes.data ?? []).filter((q) => q.status === 'envoye' && q.expires_on && q.expires_on >= now && q.expires_on <= inAWeek);
  const late = rows.filter((r) => r.status === 'retard');
  const unanswered = (quotes.data ?? []).filter((q) => q.kind === 'proposition' && q.status === 'envoye' && q.issued_on && q.issued_on <= tenDaysAgo && !(q.expires_on && q.expires_on < now));
  const summaries: DocumentSummary[] = [];
  if (expiring.length) summaries.push({ tone: 'yellow', text: `${expiring.length} devis expire${expiring.length > 1 ? 'nt' : ''} cette semaine`, ids: expiring.map((q) => q.id) });
  if (late.length) {
    const worst = Math.max(...late.map((r) => Math.round((Date.now() - new Date(`${(invoices.data ?? []).find((i) => i.id === r.id)?.due_on ?? now}T00:00:00`).getTime()) / 86400000)));
    summaries.push({ tone: 'red', text: `${late.length} facture${late.length > 1 ? 's' : ''} en retard${late.length === 1 && worst > 0 ? ` de ${worst} jour${worst > 1 ? 's' : ''}` : ''}`, ids: late.map((r) => r.id) });
  }
  if (unanswered.length) summaries.push({ tone: 'yellow', text: `${unanswered.length} proposition${unanswered.length > 1 ? 's' : ''} sans réponse depuis plus de 10 jours`, ids: unanswered.map((q) => q.id) });
  return { rows, summaries };
}

/* ── Un document ──────────────────────────────────────────────────────── */

export type DocLineRow = DocLine & { id: string; position: number; catalogItemId: string | null; offerId: string | null };

export type DocSection = {
  id: string;
  key: string;
  title: string;
  position: number;
  body: string;
  optional: boolean;
  enabled: boolean;
  locked: boolean;
  aiGenerated: boolean;
  reviewedAt: string | null;
  maxChars: number | null;
};

export type DocVersion = { version: number; at: string; who: string; note: string | null; renderedHtml: string | null };
export type DocEvent = { kind: Database['public']['Enums']['document_event_kind']; at: string; who: string; note: string | null; version: number | null };

export type DocumentDetail = {
  id: string;
  kind: GenKind;
  ref: string;
  status: DocStatus;
  subject: string;
  client: { id: string; name: string; slug: string; address: string | null; sector: string | null };
  contact: { id: string; name: string; role: string | null; email: string | null; phone: string | null } | null;
  contacts: { id: string; name: string; role: string | null; email: string | null }[];
  dealId: string | null;
  template: { id: string; name: string; bodyHtml: string | null; intro: string | null; legalMentions: string | null; footer: string | null; paymentInstructions: string | null } | null;
  issuedOn: string | null;
  expiresOn: string | null;
  dueOn: string | null;
  paymentTermsDays: number | null;
  sentAt: string | null;
  acceptedOn: string | null;
  refusedOn: string | null;
  refusalNote: string | null;
  paidOn: string | null;
  rates: Rates;
  /** Les taux sont figés sur le document (envoyé) ou suivent l'agence (brouillon). */
  ratesFrozen: boolean;
  lines: DocLineRow[];
  sections: DocSection[];
  extras: Record<string, string>;
  versions: DocVersion[];
  events: DocEvent[];
  signature: { typedName: string; at: string; ip: string | null } | null;
  accessToken: string | null;
  renderedHtml: string | null;
  totals: Totals;
  /** Les numéros de TPS et de TVQ de l'agence manquent : rien ne peut partir. */
  taxNumbersMissing: boolean;
  /** Ce que ce document a produit, et d'où il vient. */
  chain: { from: { id: string; ref: string; kind: string } | null; produced: { id: string; ref: string; kind: string }[] };
};

const fmtLongDate = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const stamp = (iso: string) => fmtLongDate.format(new Date(iso)).replace(' h ', ' h ');

export async function loadDocumentDetail(db: Db, id: string): Promise<DocumentDetail | null> {
  const [agency, quoteRes] = await Promise.all([
    db.from('agency').select('gst_number, qst_number').maybeSingle(),
    db
      .from('quote')
      .select('*, client:client_id(id, name, slug, address, sector), contact:contact_id(id, full_name, role, email, phone), template:template_id(id, name, body_html, intro, legal_mentions, footer, payment_instructions), lines:quote_line(*), sections:document_section(*), versions:quote_version(version, created_at, note, content, author:created_by(full_name))')
      .eq('id', id)
      .maybeSingle(),
  ]);
  const taxNumbersMissing = !agency.data?.gst_number?.trim() || !agency.data?.qst_number?.trim();

  const q = quoteRes.data;
  if (q && q.client) {
    const [totals, events, signature, contacts, contracts] = await Promise.all([
      db.from('quote_total').select('*').eq('quote_id', id).maybeSingle(),
      db.from('document_event').select('kind, occurred_at, note, version, member:member_id(full_name), contact:contact_id(full_name)').eq('quote_id', id).order('occurred_at'),
      db.from('document_signature').select('typed_name, signed_at, ip').eq('quote_id', id).order('signed_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('contact').select('id, full_name, role, email').eq('client_id', q.client.id).is('archived_at', null).order('is_primary', { ascending: false }),
      db.from('contract').select('id, ref, title').eq('source_quote_id', id),
    ]);
    const rates: Rates = q.tps_rate !== null && q.tvq_rate !== null ? { tps: Number(q.tps_rate), tvq: Number(q.tvq_rate) } : DEFAULT_RATES;
    const lines: DocLineRow[] = [...(q.lines ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((l) => ({
        id: l.id,
        position: l.position,
        description: l.description,
        quantity: Number(l.quantity),
        unitPriceCents: l.unit_price_cents,
        kind: l.kind,
        billing: l.billing,
        catalogItemId: l.catalog_item_id,
        offerId: l.offer_id,
      }));
    const t = totals.data;
    return {
      id: q.id,
      kind: q.kind,
      ref: q.ref,
      status: quoteStatus(q),
      subject: q.subject,
      client: q.client,
      contact: q.contact ? { id: q.contact.id, name: q.contact.full_name, role: q.contact.role, email: q.contact.email, phone: q.contact.phone } : null,
      contacts: (contacts.data ?? []).map((c) => ({ id: c.id, name: c.full_name, role: c.role, email: c.email })),
      dealId: q.deal_id,
      template: q.template
        ? { id: q.template.id, name: q.template.name, bodyHtml: q.template.body_html, intro: q.template.intro, legalMentions: q.template.legal_mentions, footer: q.template.footer, paymentInstructions: q.template.payment_instructions }
        : null,
      issuedOn: q.issued_on,
      expiresOn: q.expires_on,
      dueOn: null,
      paymentTermsDays: q.payment_terms_days,
      sentAt: q.sent_at,
      acceptedOn: q.accepted_on,
      refusedOn: q.refused_on,
      refusalNote: q.refusal_note,
      paidOn: null,
      rates,
      ratesFrozen: q.tps_rate !== null,
      lines,
      sections: [...(q.sections ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((s) => ({
          id: s.id,
          key: s.key,
          title: s.title,
          position: s.position,
          body: s.body ?? '',
          optional: s.optional,
          enabled: s.enabled,
          locked: s.locked,
          aiGenerated: s.ai_generated,
          reviewedAt: s.reviewed_at,
          maxChars: s.max_chars,
        })),
      extras: (q.extras && typeof q.extras === 'object' && !Array.isArray(q.extras) ? (q.extras as Record<string, string>) : {}),
      versions: [...(q.versions ?? [])]
        .sort((a, b) => a.version - b.version)
        .map((v) => ({
          version: v.version,
          at: stamp(v.created_at),
          who: v.author?.full_name ?? '—',
          note: v.note,
          renderedHtml: typeof (v.content as { rendered_html?: unknown })?.rendered_html === 'string' ? ((v.content as { rendered_html: string }).rendered_html) : null,
        })),
      events: (events.data ?? []).map((e) => ({ kind: e.kind, at: stamp(e.occurred_at), who: e.member?.full_name ?? e.contact?.full_name ?? '—', note: e.note, version: e.version })),
      signature: signature.data ? { typedName: signature.data.typed_name, at: stamp(signature.data.signed_at), ip: signature.data.ip } : null,
      accessToken: q.access_token,
      renderedHtml: q.rendered_html,
      totals: t
        ? { ht: t.subtotal_cents ?? 0, tps: t.tps_cents ?? 0, tvq: t.tvq_cents ?? 0, ttc: t.total_cents ?? 0, ponctuel: t.ponctuel_cents ?? 0, recurrent: t.recurrent_cents ?? 0, remise: computeTotals(lines, rates).remise, informatif: computeTotals(lines, rates).informatif }
        : computeTotals(lines, rates),
      taxNumbersMissing,
      chain: { from: null, produced: (contracts.data ?? []).map((c) => ({ id: c.id, ref: c.ref, kind: 'contrat' })) },
    };
  }

  const invRes = await db
    .from('invoice')
    .select('*, client:client_id(id, name, slug, address, sector), template:template_id(id, name, body_html, intro, legal_mentions, footer, payment_instructions), lines:invoice_line(*)')
    .eq('id', id)
    .maybeSingle();
  const i = invRes.data;
  if (!i || !i.client) return null;
  const [totals, events, contacts] = await Promise.all([
    db.from('invoice_total').select('*').eq('invoice_id', id).maybeSingle(),
    db.from('document_event').select('kind, occurred_at, note, version, member:member_id(full_name), contact:contact_id(full_name)').eq('invoice_id', id).order('occurred_at'),
    db.from('contact').select('id, full_name, role, email').eq('client_id', i.client.id).is('archived_at', null).order('is_primary', { ascending: false }),
  ]);
  const rates: Rates = i.tps_rate !== null && i.tvq_rate !== null ? { tps: Number(i.tps_rate), tvq: Number(i.tvq_rate) } : DEFAULT_RATES;
  const lines: DocLineRow[] = [...(i.lines ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((l) => ({
      id: l.id,
      position: l.position,
      description: l.description,
      quantity: Number(l.quantity),
      unitPriceCents: l.unit_price_cents,
      kind: 'facturable' as LineKind,
      billing: 'ponctuel' as Billing,
      catalogItemId: l.catalog_item_id,
      offerId: l.offer_id,
    }));
  const t = totals.data;
  const primary = (contacts.data ?? [])[0];
  return {
    id: i.id,
    kind: 'facture',
    ref: i.ref,
    status: invoiceStatus(i),
    subject: lines[0]?.description ?? 'Facture',
    client: i.client,
    contact: primary ? { id: primary.id, name: primary.full_name, role: primary.role, email: primary.email, phone: null } : null,
    contacts: (contacts.data ?? []).map((c) => ({ id: c.id, name: c.full_name, role: c.role, email: c.email })),
    dealId: null,
    template: i.template
      ? { id: i.template.id, name: i.template.name, bodyHtml: i.template.body_html, intro: i.template.intro, legalMentions: i.template.legal_mentions, footer: i.template.footer, paymentInstructions: i.template.payment_instructions }
      : null,
    issuedOn: i.issued_on,
    expiresOn: null,
    dueOn: i.due_on,
    paymentTermsDays: null,
    sentAt: i.sent_at,
    acceptedOn: null,
    refusedOn: null,
    refusalNote: null,
    paidOn: i.paid_on,
    rates,
    ratesFrozen: i.tps_rate !== null,
    lines,
    sections: [],
    extras: {},
    versions: [],
    events: (events.data ?? []).map((e) => ({ kind: e.kind, at: stamp(e.occurred_at), who: e.member?.full_name ?? e.contact?.full_name ?? '—', note: e.note, version: e.version })),
    signature: null,
    accessToken: i.access_token,
    renderedHtml: i.rendered_html,
    totals: t ? { ht: t.subtotal_cents ?? 0, tps: t.tps_cents ?? 0, tvq: t.tvq_cents ?? 0, ttc: t.total_cents ?? 0, ponctuel: t.subtotal_cents ?? 0, recurrent: 0, remise: 0, informatif: 0 } : computeTotals(lines, rates),
    taxNumbersMissing,
    chain: { from: null, produced: [] },
  };
}

/* ── Le rendu ─────────────────────────────────────────────────────────── */

/** Pose une valeur sur un chemin `groupe.champ` d'un jeu de données. */
function setPath(data: DocData, path: string, value: string) {
  const parts = path.split('.');
  let cur: DocData = data;
  for (const p of parts.slice(0, -1)) {
    const next = cur[p];
    if (!next || typeof next !== 'object' || Array.isArray(next)) cur[p] = {};
    cur = cur[p] as DocData;
  }
  cur[parts[parts.length - 1]] = value;
}

/** Les données complètes d'un document, prêtes pour `renderTemplate`. */
export async function buildDocumentData(db: Db, d: DocumentDetail): Promise<DocData> {
  const [agency, catalogue] = await Promise.all([db.from('agency').select('*').maybeSingle(), loadCatalogueBlocks(db)]);
  const agence = agencyBlock(agency.data);
  const totals = computeTotals(d.lines, d.rates);
  const firstOffer = d.lines.find((l) => l.offerId)?.offerId ?? null;
  const offerInfo = firstOffer ? catalogue.offerById.get(firstOffer) : undefined;
  const maintenanceId = offerInfo?.billing !== 'ponctuel' && firstOffer ? firstOffer : (d.lines.find((l) => l.offerId && catalogue.offerById.get(l.offerId)?.billing !== 'ponctuel')?.offerId ?? null);
  const contract = d.chain.produced.length ? null : null;
  const blocks = await loadContractBlocks(db, contract);
  const data: DocData = {
    agence,
    client: clientBlock(d.client, d.contact ? { full_name: d.contact.name, role: d.contact.role, email: d.contact.email, phone: d.contact.phone } : null),
    document: documentBlock({
      reference: d.ref,
      date: d.issuedOn,
      echeance: d.kind === 'facture' ? d.dueOn : d.expiresOn,
      objet: d.subject,
      template: d.template ? { intro: d.template.intro, legal_mentions: d.template.legalMentions, footer: d.template.footer, payment_instructions: d.template.paymentInstructions } : null,
    }),
    proposition: { reference: d.ref, date: fmtDate(d.issuedOn) },
    ...blocks,
    offre_recommandee: catalogue.recommended(offerInfo?.billing === 'ponctuel' ? firstOffer : null),
    maintenance_recommandee: catalogue.recommendedMaintenance(maintenanceId),
    offres: catalogue.offres,
    offres_maintenance: catalogue.offres_maintenance,
    ...linesToBlocks(d.lines),
    ...totalsToBlocks(totals),
    section: sectionsBlock(d.sections),
    signature: {
      agence: [agence.representant, agence.representant_titre].filter(Boolean).join(', '),
      client: [d.contact?.name, d.contact?.role].filter(Boolean).join(', '),
      date: d.acceptedOn ? fmtDate(d.acceptedOn) : '___________________',
    },
  };
  for (const [k, v] of Object.entries(d.extras)) if (/^[a-z][a-z0-9_.]*$/.test(k) && typeof v === 'string' && v.trim()) setPath(data, k, v);
  return data;
}

export type Rendered = { html: string; page: string; unfilled: string[] };

/** Le corps du modèle rempli : le HTML seul, la page complète, et les balises restées vides. */
export async function renderDocument(db: Db, d: DocumentDetail, { highlightUnfilled = true } = {}): Promise<Rendered | null> {
  if (!d.template?.bodyHtml) return null;
  const data = await buildDocumentData(db, d);
  const html = renderTemplate(d.template.bodyHtml, data);
  return {
    html,
    page: previewDocument(d.template.bodyHtml, data, { highlightUnfilled, fit: true, title: `${d.ref} — ${d.client.name}` }),
    unfilled: unfilledTags(html),
  };
}

/* ── Ce que le panneau « Nouveau document » propose ───────────────────── */

export type GenTemplate = { id: string; kind: GenKind; name: string; isDefault: boolean; paymentTermsDays: number; hasBody: boolean };
export type GenOffer = {
  id: string;
  name: string;
  code: string;
  priceCents: number | null;
  priceIsFrom: boolean;
  billing: Billing;
  /** Ce que l'offre contient, à plat, pour l'afficher. */
  contents: string[];
  /** Les groupes au choix du client : à trancher dans le panneau. */
  groups: { group: string; options: { key: string; label: string }[] }[];
};
export type GenItem = { id: string; name: string; priceCents: number | null; billing: Billing; kind: 'service' | 'produit' };
export type GenSource = { id: string; kind: GenKind; ref: string; subject: string; status: DocStatus; totalCents: number; htCents: number; lines: (DocLine & { catalogItemId: string | null; offerId: string | null })[] };

export type GeneratorOptions = {
  client: { id: string; name: string };
  contacts: { id: string; name: string; role: string | null; email: string | null; isPrimary: boolean }[];
  templates: GenTemplate[];
  offers: GenOffer[];
  items: GenItem[];
  sources: GenSource[];
  taxNumbersMissing: boolean;
};

export async function loadGeneratorOptions(db: Db, clientId: string): Promise<GeneratorOptions | null> {
  const [client, contacts, templates, offers, offerLines, items, quotes, totals, agency] = await Promise.all([
    db.from('client').select('id, name').eq('id', clientId).maybeSingle(),
    db.from('contact').select('id, full_name, role, email, is_primary').eq('client_id', clientId).is('archived_at', null).order('is_primary', { ascending: false }),
    db.from('document_template').select('id, kind, name, is_default, payment_terms_days, body_html').eq('active', true).order('kind').order('name'),
    db.from('offer').select('id, name, code, price_cents, price_is_from, billing').eq('active', true).order('position'),
    db.from('offer_line').select('offer_id, quantity, position, option_group, option_key, label, catalog_item_id, included_offer_id, catalog_item:catalog_item_id(name), included:included_offer_id(name)').order('position'),
    db.from('catalog_item').select('id, name, price_cents, billing, kind').eq('active', true).order('position'),
    db.from('quote').select('id, kind, ref, subject, status, expires_on, lines:quote_line(description, quantity, unit_price_cents, kind, billing, position, catalog_item_id, offer_id)').eq('client_id', clientId).order('created_at', { ascending: false }),
    db.from('quote_total').select('quote_id, total_cents, subtotal_cents'),
    db.from('agency').select('gst_number, qst_number').maybeSingle(),
  ]);
  if (!client.data) return null;
  const linesBy = new Map<string, NonNullable<typeof offerLines.data>>();
  for (const l of offerLines.data ?? []) linesBy.set(l.offer_id, [...(linesBy.get(l.offer_id) ?? []), l]);
  const contentsOf = (offerId: string, seen = new Set<string>()): string[] => {
    if (seen.has(offerId)) return [];
    seen.add(offerId);
    const out: string[] = [];
    for (const l of linesBy.get(offerId) ?? []) {
      if (l.option_group) continue;
      if (l.included_offer_id) out.push(...contentsOf(l.included_offer_id, seen));
      else out.push(l.label ?? `${Number(l.quantity) !== 1 ? `${Number(l.quantity)} × ` : ''}${l.catalog_item?.name ?? ''}`);
    }
    return out;
  };
  const totalBy = new Map((totals.data ?? []).map((t) => [t.quote_id, t.total_cents ?? 0]));
  const htBy = new Map((totals.data ?? []).map((t) => [t.quote_id, t.subtotal_cents ?? 0]));
  return {
    client: client.data,
    contacts: (contacts.data ?? []).map((c) => ({ id: c.id, name: c.full_name, role: c.role, email: c.email, isPrimary: c.is_primary })),
    templates: (templates.data ?? [])
      .filter((t): t is typeof t & { kind: GenKind } => t.kind === 'devis' || t.kind === 'proposition' || t.kind === 'facture')
      .map((t) => ({ id: t.id, kind: t.kind, name: t.name, isDefault: t.is_default, paymentTermsDays: t.payment_terms_days, hasBody: !!t.body_html })),
    offers: (offers.data ?? []).map((o) => {
      const groups = new Map<string, { key: string; label: string }[]>();
      for (const l of linesBy.get(o.id) ?? []) {
        if (!l.option_group) continue;
        groups.set(l.option_group, [...(groups.get(l.option_group) ?? []), { key: l.option_key ?? String(l.position), label: l.label ?? l.catalog_item?.name ?? '' }]);
      }
      return {
        id: o.id,
        name: o.name,
        code: o.code,
        priceCents: o.price_cents,
        priceIsFrom: o.price_is_from,
        billing: o.billing,
        contents: contentsOf(o.id),
        groups: [...groups.entries()].map(([group, options]) => ({ group, options })),
      };
    }),
    items: (items.data ?? []).map((i) => ({ id: i.id, name: i.name, priceCents: i.price_cents, billing: i.billing, kind: i.kind })),
    sources: (quotes.data ?? []).map((q) => ({
      id: q.id,
      kind: q.kind,
      ref: q.ref,
      subject: q.subject,
      status: quoteStatus(q),
      totalCents: totalBy.get(q.id) ?? 0,
      htCents: htBy.get(q.id) ?? 0,
      lines: [...(q.lines ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((l) => ({ description: l.description, quantity: Number(l.quantity), unitPriceCents: l.unit_price_cents, kind: l.kind, billing: l.billing, catalogItemId: l.catalog_item_id, offerId: l.offer_id })),
    })),
    taxNumbersMissing: !agency.data?.gst_number?.trim() || !agency.data?.qst_number?.trim(),
  };
}

/* ── Les droits de la personne connectée ──────────────────────────────── */

export type Permission = Database['public']['Enums']['permission'];

export async function loadMyPermissions(db: Db, memberId: string | null): Promise<Permission[]> {
  if (!memberId) return [];
  const { data } = await db.from('member_effective_permission').select('permission, granted').eq('member_id', memberId);
  return (data ?? []).filter((p) => p.granted).map((p) => p.permission as Permission);
}
