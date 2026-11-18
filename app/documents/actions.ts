'use server';

/**
 * Ce que le générateur de documents écrit dans la base (session 9.4) : un
 * brouillon depuis une offre, un document existant ou des lignes libres ;
 * les retouches du brouillon (lignes, sections, compléments) ; l'envoi qui
 * rend, fige et numérote une version ; le sort d'un document envoyé ; la
 * correction qui rouvre un brouillon ; et, par le lien du client, la décision.
 *
 * Tout passe par le client de la requête, sous RLS. Les règles qui comptent
 * — le droit d'envoyer, les numéros de taxes, le gel après envoi — sont
 * tenues par la base (migration 0024) ; ici, on les dit avant qu'elle ne
 * les refuse, et on ne prend jamais zéro ligne pour une réussite.
 */
import { randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { explain, memberSession } from '@/app/agence/action-base';
import { computeTotals, type Billing, type LineKind } from '@/lib/documents/donnees';
import { loadDocumentDetail, loadGeneratorOptions, renderDocument, type DocumentDetail, type GenKind, type GeneratorOptions } from '@/lib/queries/documents';
import { routes } from '@/lib/routes';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export type Result<T = object> = ({ ok: true; message: string } & T) | { ok: false; message: string };

const KINDS: GenKind[] = ['devis', 'proposition', 'facture'];
const LINE_KINDS: LineKind[] = ['facturable', 'offert', 'remise', 'informatif'];
const BILLINGS: Billing[] = ['ponctuel', 'mensuel', 'trimestriel', 'annuel'];

export type LineInput = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  kind: LineKind;
  billing: Billing;
  catalogItemId?: string | null;
  offerId?: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Relit des lignes envoyées par l'écran ; rend la liste nettoyée ou le message d'erreur. */
function parseLines(raw: unknown): LineInput[] | string {
  if (!Array.isArray(raw)) return 'Les lignes sont illisibles.';
  const out: LineInput[] = [];
  for (const x of raw as Record<string, unknown>[]) {
    if (!x || typeof x !== 'object') return 'Une ligne est illisible.';
    const description = typeof x.description === 'string' ? x.description.trim() : '';
    if (!description) continue;
    const quantity = Number(x.quantity);
    const unitPriceCents = Math.round(Number(x.unitPriceCents));
    const kind = LINE_KINDS.includes(x.kind as LineKind) ? (x.kind as LineKind) : 'facturable';
    const billing = BILLINGS.includes(x.billing as Billing) ? (x.billing as Billing) : 'ponctuel';
    if (!Number.isFinite(quantity) || quantity <= 0) return `La quantité de « ${description} » doit être supérieure à zéro.`;
    if (!Number.isFinite(unitPriceCents)) return `Le prix de « ${description} » est illisible.`;
    if (kind === 'offert' && unitPriceCents !== 0) return `Une ligne offerte est à zéro : « ${description} ».`;
    if (kind !== 'remise' && unitPriceCents < 0) return `Seule une remise porte un montant négatif : « ${description} ».`;
    if (kind === 'remise' && unitPriceCents > 0) return `Une remise se saisit en négatif : « ${description} ».`;
    out.push({
      description,
      quantity,
      unitPriceCents,
      kind,
      billing,
      catalogItemId: typeof x.catalogItemId === 'string' && x.catalogItemId ? x.catalogItemId : null,
      offerId: typeof x.offerId === 'string' && x.offerId ? x.offerId : null,
    });
  }
  return out;
}

async function session() {
  const s = await memberSession();
  if (!s) return null;
  return s;
}

/** Ce que le panneau « Nouveau document » a besoin de savoir sur un compte. */
export async function getGeneratorOptions(clientId: string): Promise<GeneratorOptions | null> {
  const s = await session();
  if (!s || typeof clientId !== 'string' || !clientId) return null;
  const supabase = await createClient();
  return loadGeneratorOptions(supabase, clientId);
}

export type CreateInput = {
  kind: GenKind;
  templateId: string;
  clientId: string;
  contactId: string | null;
  dealId: string | null;
  subject: string;
  expiresOn: string | null;
  paymentTermsDays: number | null;
  lines: LineInput[];
  /** Le document dont celui-ci est issu, pour la chaîne et le journal. */
  sourceQuoteId: string | null;
};

/** Créer un brouillon : rien n'est envoyé. */
export async function createDocument(input: CreateInput): Promise<Result<{ id: string }>> {
  const s = await session();
  if (!s) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (!input || typeof input !== 'object') return { ok: false, message: 'Demande illisible.' };
  if (!KINDS.includes(input.kind)) return { ok: false, message: 'Choisissez une sorte de document.' };
  if (typeof input.templateId !== 'string' || !input.templateId) return { ok: false, message: 'Choisissez un modèle.' };
  if (typeof input.clientId !== 'string' || !input.clientId) return { ok: false, message: 'Le document doit appartenir à un compte.' };
  const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
  if (!subject) return { ok: false, message: 'L’objet du document est obligatoire.' };
  const lines = parseLines(input.lines);
  if (typeof lines === 'string') return { ok: false, message: lines };
  if (lines.length === 0) return { ok: false, message: 'Un document a au moins une ligne.' };
  if (input.expiresOn !== null && !isDate(input.expiresOn)) return { ok: false, message: 'La date d’expiration est illisible.' };
  const terms = input.paymentTermsDays === null ? null : Number(input.paymentTermsDays);
  if (terms !== null && (!Number.isInteger(terms) || terms < 0)) return { ok: false, message: 'Le délai de paiement est un nombre de jours, zéro ou plus.' };

  const supabase = await createClient();
  const template = await supabase.from('document_template').select('id, kind, payment_terms_days').eq('id', input.templateId).maybeSingle();
  if (template.error || !template.data) return { ok: false, message: 'Modèle introuvable.' };
  if (template.data.kind !== input.kind) return { ok: false, message: `Ce modèle est un modèle de ${template.data.kind}, pas de ${input.kind}.` };

  const refRes = await supabase.rpc('next_document_ref', { p_template: input.templateId });
  if (refRes.error || !refRes.data) return { ok: false, message: explain(refRes.error?.code, 'La numérotation du document a échoué.') };
  const ref = refRes.data;

  if (input.kind === 'facture') {
    const days = terms ?? template.data.payment_terms_days;
    const { data, error } = await supabase
      .from('invoice')
      .insert({
        agency_id: s.agencyId,
        client_id: input.clientId,
        template_id: input.templateId,
        ref,
        period_month: `${today().slice(0, 7)}-01`,
        issued_on: today(),
        due_on: plusDays(days),
        status: 'en_attente',
      })
      .select('id')
      .single();
    if (error || !data) return { ok: false, message: explain(error?.code, 'La facture n’a pas pu être créée.') };
    const { error: le } = await supabase.from('invoice_line').insert(
      lines.map((l, i) => ({
        invoice_id: data.id,
        position: i + 1,
        description: l.description,
        quantity: l.quantity,
        unit_price_cents: Math.max(0, l.unitPriceCents),
        catalog_item_id: l.catalogItemId ?? null,
        offer_id: l.catalogItemId ? null : (l.offerId ?? null),
      })),
    );
    if (le) return { ok: false, message: `Facture créée, mais ses lignes ont été refusées : ${explain(le.code, le.message)}` };
    await supabase.from('document_event').insert({
      agency_id: s.agencyId,
      invoice_id: data.id,
      kind: 'cree',
      member_id: s.memberId,
      note: input.sourceQuoteId ? `Créée depuis ${subject}` : null,
    });
    revalidate(data.id);
    return { ok: true, id: data.id, message: `Brouillon ${ref} créé.` };
  }

  const { data, error } = await supabase
    .from('quote')
    .insert({
      agency_id: s.agencyId,
      client_id: input.clientId,
      contact_id: input.contactId || null,
      deal_id: input.dealId || null,
      ref,
      subject,
      kind: input.kind,
      template_id: input.templateId,
      status: 'brouillon',
      expires_on: input.expiresOn,
      payment_terms_days: terms ?? template.data.payment_terms_days,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, message: explain(error?.code, 'Le document n’a pas pu être créé.') };

  const { error: le } = await supabase.from('quote_line').insert(
    lines.map((l, i) => ({
      quote_id: data.id,
      position: i + 1,
      description: l.description,
      quantity: l.quantity,
      unit_price_cents: l.unitPriceCents,
      kind: l.kind,
      billing: l.billing,
      catalog_item_id: l.catalogItemId ?? null,
      offer_id: l.catalogItemId ? null : (l.offerId ?? null),
    })),
  );
  if (le) return { ok: false, message: `Document créé, mais ses lignes ont été refusées : ${explain(le.code, le.message)}` };

  // Les sections du modèle deviennent celles du document.
  const sections = await supabase.from('document_template_section').select('*').eq('template_id', input.templateId).order('position');
  if (sections.data?.length) {
    await supabase.from('document_section').insert(
      sections.data.map((x) => ({
        quote_id: data.id,
        key: x.key,
        title: x.title,
        position: x.position,
        body: x.default_body,
        optional: x.optional,
        enabled: true,
        locked: x.locked_by_agency,
        max_chars: x.max_chars,
      })),
    );
  }
  let sourceNote: string | null = null;
  if (input.sourceQuoteId) {
    const src = await supabase.from('quote').select('ref').eq('id', input.sourceQuoteId).maybeSingle();
    sourceNote = src.data ? `Créé depuis ${src.data.ref}` : null;
  }
  await supabase.from('document_event').insert({ agency_id: s.agencyId, quote_id: data.id, kind: 'cree', member_id: s.memberId, note: sourceNote });
  revalidate(data.id);
  return { ok: true, id: data.id, message: `Brouillon ${ref} créé.` };
}


/**
 * L'aperçu d'un brouillon qui n'existe pas encore : le même rendu que la
 * page du document, sur les lignes du panneau, pour voir les balises
 * restées vides avant de créer.
 */
export async function previewNewDocument(input: CreateInput): Promise<Result<{ page: string; unfilled: string[] }>> {
  const s = await session();
  if (!s) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (!input || typeof input !== 'object' || !KINDS.includes(input.kind)) return { ok: false, message: 'Demande illisible.' };
  if (typeof input.templateId !== 'string' || !input.templateId) return { ok: false, message: 'Choisissez un modèle.' };
  if (typeof input.clientId !== 'string' || !input.clientId) return { ok: false, message: 'Le document doit appartenir à un compte.' };
  const lines = parseLines(input.lines);
  if (typeof lines === 'string') return { ok: false, message: lines };
  const supabase = await createClient();
  const [template, client, contact, sections, agency] = await Promise.all([
    supabase.from('document_template').select('id, name, kind, body_html, intro, legal_mentions, footer, payment_instructions').eq('id', input.templateId).maybeSingle(),
    supabase.from('client').select('id, name, slug, address, sector').eq('id', input.clientId).maybeSingle(),
    input.contactId ? supabase.from('contact').select('id, full_name, role, email, phone').eq('id', input.contactId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('document_template_section').select('*').eq('template_id', input.templateId).order('position'),
    supabase.from('agency').select('gst_number, qst_number').maybeSingle(),
  ]);
  if (!template.data) return { ok: false, message: 'Modèle introuvable.' };
  if (!template.data.body_html) return { ok: false, message: 'Ce modèle n’a pas de corps : complétez-le dans Modèles de documents.' };
  if (!client.data) return { ok: false, message: 'Compte introuvable.' };
  const t = template.data;
  const c = contact.data;
  const d: DocumentDetail = {
    id: 'apercu',
    kind: input.kind,
    ref: '(brouillon)',
    status: 'brouillon',
    subject: typeof input.subject === 'string' ? input.subject : '',
    client: client.data,
    contact: c ? { id: c.id, name: c.full_name, role: c.role, email: c.email, phone: c.phone } : null,
    contacts: [],
    dealId: input.dealId ?? null,
    template: { id: t.id, name: t.name, bodyHtml: t.body_html, intro: t.intro, legalMentions: t.legal_mentions, footer: t.footer, paymentInstructions: t.payment_instructions },
    issuedOn: today(),
    expiresOn: input.kind === 'facture' ? null : (isDate(input.expiresOn) ? input.expiresOn : plusDays(30)),
    dueOn: input.kind === 'facture' ? plusDays(Number(input.paymentTermsDays ?? 30) || 30) : null,
    paymentTermsDays: input.paymentTermsDays ?? null,
    sentAt: null,
    acceptedOn: null,
    refusedOn: null,
    refusalNote: null,
    paidOn: null,
    rates: { tps: 0.05, tvq: 0.09975 },
    ratesFrozen: false,
    lines: lines.map((l, i) => ({ ...l, id: `l${i}`, position: i + 1, catalogItemId: l.catalogItemId ?? null, offerId: l.offerId ?? null })),
    sections: (sections.data ?? []).map((x) => ({
      id: x.id,
      key: x.key,
      title: x.title,
      position: x.position,
      body: x.default_body ?? '',
      optional: x.optional,
      enabled: true,
      locked: x.locked_by_agency,
      aiGenerated: false,
      reviewedAt: null,
      maxChars: x.max_chars,
    })),
    extras: {},
    versions: [],
    events: [],
    signature: null,
    accessToken: null,
    renderedHtml: null,
    totals: computeTotals(lines),
    taxNumbersMissing: !agency.data?.gst_number?.trim() || !agency.data?.qst_number?.trim(),
    chain: { from: null, produced: [] },
  };
  const rendered = await renderDocument(supabase, d, { highlightUnfilled: true });
  if (!rendered) return { ok: false, message: 'Le rendu a échoué.' };
  return { ok: true, message: 'Aperçu rendu.', page: rendered.page, unfilled: rendered.unfilled };
}

export type DraftPatch = {
  subject?: string;
  contactId?: string | null;
  expiresOn?: string | null;
  dueOn?: string | null;
  paymentTermsDays?: number | null;
  lines?: LineInput[];
  sections?: { id: string; body: string; enabled: boolean; locked: boolean }[];
  extras?: Record<string, string>;
};

/** Retoucher un brouillon : objet, contact, dates, lignes, sections, compléments. */
export async function saveDraft(id: string, patch: DraftPatch): Promise<Result> {
  const s = await session();
  if (!s) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (typeof id !== 'string' || !id || !patch || typeof patch !== 'object') return { ok: false, message: 'Demande illisible.' };
  const supabase = await createClient();
  const d = await loadDocumentDetail(supabase, id);
  if (!d) return { ok: false, message: 'Document introuvable.' };
  if (d.status !== 'brouillon') return { ok: false, message: 'Ce document est parti chez le client : corrigez-le dans une nouvelle version.' };

  const lines = patch.lines === undefined ? null : parseLines(patch.lines);
  if (typeof lines === 'string') return { ok: false, message: lines };
  if (lines && lines.length === 0) return { ok: false, message: 'Un document a au moins une ligne.' };
  if (patch.expiresOn !== undefined && patch.expiresOn !== null && !isDate(patch.expiresOn)) return { ok: false, message: 'La date d’expiration est illisible.' };
  if (patch.dueOn !== undefined && patch.dueOn !== null && !isDate(patch.dueOn)) return { ok: false, message: 'L’échéance est illisible.' };
  const subject = patch.subject === undefined ? undefined : patch.subject.trim();
  if (subject !== undefined && !subject) return { ok: false, message: 'L’objet du document est obligatoire.' };

  if (d.kind === 'facture') {
    const upd: Database['public']['Tables']['invoice']['Update'] = {};
    if (patch.dueOn !== undefined) upd.due_on = patch.dueOn;
    if (Object.keys(upd).length) {
      const { data, error } = await supabase.from('invoice').update(upd).eq('id', id).select('id');
      if (error) return { ok: false, message: explain(error.code, 'La facture n’a pas pu être enregistrée.') };
      if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit de modifier les factures (« Facturer » requis).' };
    }
    if (lines) {
      const del = await supabase.from('invoice_line').delete().eq('invoice_id', id);
      if (del.error) return { ok: false, message: explain(del.error.code, 'Les lignes n’ont pas pu être remplacées.') };
      const ins = await supabase.from('invoice_line').insert(
        lines.map((l, i) => ({ invoice_id: id, position: i + 1, description: l.description, quantity: l.quantity, unit_price_cents: Math.max(0, l.unitPriceCents), catalog_item_id: l.catalogItemId ?? null, offer_id: l.catalogItemId ? null : (l.offerId ?? null) })),
      );
      if (ins.error) return { ok: false, message: explain(ins.error.code, 'Les lignes ont été refusées.') };
    }
    revalidate(id);
    return { ok: true, message: 'Brouillon enregistré.' };
  }

  const upd: Database['public']['Tables']['quote']['Update'] = {};
  if (subject !== undefined) upd.subject = subject;
  if (patch.contactId !== undefined) upd.contact_id = patch.contactId || null;
  if (patch.expiresOn !== undefined) upd.expires_on = patch.expiresOn;
  if (patch.paymentTermsDays !== undefined) {
    const t = patch.paymentTermsDays === null ? null : Number(patch.paymentTermsDays);
    if (t !== null && (!Number.isInteger(t) || t < 0)) return { ok: false, message: 'Le délai de paiement est un nombre de jours, zéro ou plus.' };
    upd.payment_terms_days = t;
  }
  if (patch.extras !== undefined) {
    if (!patch.extras || typeof patch.extras !== 'object' || Array.isArray(patch.extras)) return { ok: false, message: 'Les compléments sont illisibles.' };
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(patch.extras)) if (/^[a-z][a-z0-9_.]*$/.test(k) && typeof v === 'string' && v.trim()) clean[k] = v.trim();
    upd.extras = clean;
  }
  if (Object.keys(upd).length) {
    const { data, error } = await supabase.from('quote').update(upd).eq('id', id).select('id');
    if (error) return { ok: false, message: explain(error.code, 'Le document n’a pas pu être enregistré.') };
    if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit de modifier ce document.' };
  }
  if (lines) {
    const del = await supabase.from('quote_line').delete().eq('quote_id', id);
    if (del.error) return { ok: false, message: explain(del.error.code, 'Les lignes n’ont pas pu être remplacées.') };
    const ins = await supabase.from('quote_line').insert(
      lines.map((l, i) => ({ quote_id: id, position: i + 1, description: l.description, quantity: l.quantity, unit_price_cents: l.unitPriceCents, kind: l.kind, billing: l.billing, catalog_item_id: l.catalogItemId ?? null, offer_id: l.catalogItemId ? null : (l.offerId ?? null) })),
    );
    if (ins.error) return { ok: false, message: explain(ins.error.code, 'Les lignes ont été refusées.') };
  }
  if (patch.sections) {
    for (const x of patch.sections) {
      if (!x || typeof x.id !== 'string') continue;
      const { error } = await supabase
        .from('document_section')
        .update({ body: typeof x.body === 'string' ? x.body : null, enabled: x.enabled !== false, locked: x.locked === true })
        .eq('id', x.id)
        .eq('quote_id', id);
      if (error) return { ok: false, message: explain(error.code, 'Une section n’a pas pu être enregistrée.') };
    }
  }
  await supabase.from('document_event').insert({ agency_id: s.agencyId, quote_id: id, kind: 'modifie', member_id: s.memberId });
  revalidate(id);
  return { ok: true, message: 'Brouillon enregistré.' };
}

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

const newToken = () => randomBytes(24).toString('hex');

export type SendChannel = 'fil' | 'courriel';

/**
 * Envoyer : rendre, figer, numéroter une version, et remettre le lien — dans
 * le fil du portail ou à copier dans un courriel. La base refuse sans le
 * droit ou sans les numéros de taxes ; on le dit avant.
 */
export async function sendDocument(id: string, channel: SendChannel): Promise<Result<{ link: string; mailto: string | null }>> {
  const s = await session();
  if (!s) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (typeof id !== 'string' || !id) return { ok: false, message: 'Document introuvable.' };
  const supabase = await createClient();
  const d = await loadDocumentDetail(supabase, id);
  if (!d) return { ok: false, message: 'Document introuvable.' };
  if (d.status !== 'brouillon') return { ok: false, message: 'Ce document est déjà parti.' };
  if (d.taxNumbersMissing) return { ok: false, message: 'Ce document réclame les taxes : renseignez les numéros de TPS et de TVQ dans le profil de l’agence avant de l’envoyer.' };
  if (!d.template?.bodyHtml) return { ok: false, message: 'Le modèle de ce document n’a pas de corps : complétez-le dans Modèles de documents.' };
  if (d.lines.length === 0) return { ok: false, message: 'Un document a au moins une ligne.' };
  if (!d.contact && d.kind !== 'facture') return { ok: false, message: 'Choisissez le contact destinataire avant d’envoyer.' };
  const pending = d.sections.filter((x) => x.enabled && x.aiGenerated && !x.reviewedAt);
  if (pending.length) return { ok: false, message: `${pending.length} section${pending.length > 1 ? 's' : ''} écrite${pending.length > 1 ? 's' : ''} par l’IA attend${pending.length > 1 ? 'ent' : ''} une relecture.` };

  const settings = await supabase.from('agency_settings').select('tps_rate, tvq_rate').eq('agency_id', s.agencyId).maybeSingle();
  const rates = { tps: Number(settings.data?.tps_rate ?? 0.05), tvq: Number(settings.data?.tvq_rate ?? 0.09975) };
  const frozen: DocumentDetail = { ...d, rates, issuedOn: d.issuedOn ?? today(), expiresOn: d.kind === 'facture' ? null : (d.expiresOn ?? plusDays(30)) };
  const rendered = await renderDocument(supabase, frozen, { highlightUnfilled: false });
  if (!rendered) return { ok: false, message: 'Le rendu a échoué.' };
  if (rendered.unfilled.length) {
    return {
      ok: false,
      message: `${rendered.unfilled.length} balise${rendered.unfilled.length > 1 ? 's' : ''} restent sans valeur : ${rendered.unfilled.map((t) => `{{${t}}}`).join(', ')}. Complétez-les dans le brouillon ou retirez-les du modèle.`,
    };
  }
  const token = d.accessToken ?? newToken();
  const link = `${await origin()}${routes.documentLien(token)}`;
  const totals = computeTotals(d.lines, rates);

  if (d.kind === 'facture') {
    const { data, error } = await supabase
      .from('invoice')
      .update({ sent_at: new Date().toISOString(), tps_rate: rates.tps, tvq_rate: rates.tvq, rendered_html: rendered.page, access_token: token })
      .eq('id', id)
      .select('id');
    if (error) return { ok: false, message: explain(error.code, error.message) };
    if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit d’envoyer une facture (« Facturer » requis).' };
    await supabase.from('document_event').insert({ agency_id: s.agencyId, invoice_id: id, kind: 'envoye', member_id: s.memberId, version: 1, note: channel === 'fil' ? 'Déposée dans le fil du portail' : 'Par courriel' });
  } else {
    const version = d.versions.length + 1;
    const { data, error } = await supabase
      .from('quote')
      .update({
        status: 'envoye',
        sent_at: new Date().toISOString(),
        issued_on: frozen.issuedOn,
        expires_on: frozen.expiresOn,
        tps_rate: rates.tps,
        tvq_rate: rates.tvq,
        rendered_html: rendered.page,
        access_token: token,
      })
      .eq('id', id)
      .select('id');
    if (error) return { ok: false, message: explain(error.code, error.message) };
    if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit d’envoyer ce document (« Envoyer des documents » requis).' };
    await supabase.from('quote_version').insert({
      quote_id: id,
      version,
      created_by: s.memberId,
      note: version === 1 ? `Version envoyée (${channel === 'fil' ? 'fil du portail' : 'courriel'}).` : `Correction — version ${version} envoyée.`,
      content: {
        rendered_html: rendered.page,
        lines: d.lines,
        sections: d.sections,
        extras: d.extras,
        rates,
        totals,
        contact: d.contact,
        template_id: d.template.id,
        sent_at: new Date().toISOString(),
      },
    });
    await supabase.from('document_event').insert({ agency_id: s.agencyId, quote_id: id, kind: 'envoye', member_id: s.memberId, version, note: channel === 'fil' ? 'Déposé dans le fil du portail' : 'Par courriel' });
  }

  if (channel === 'fil') {
    const label = d.kind === 'facture' ? 'Votre facture' : d.kind === 'proposition' ? 'Votre proposition' : 'Votre devis';
    await supabase.from('communication').insert({
      agency_id: s.agencyId,
      client_id: d.client.id,
      contact_id: d.contact?.id ?? null,
      channel: 'portail',
      direction: 'out',
      author_id: s.memberId,
      body: `${label} ${d.ref} est prêt${d.kind === 'facture' || d.kind === 'proposition' ? 'e' : ''} : ${link}`,
      ...(d.kind === 'facture' ? { context_invoice_id: id } : {}),
    });
  }
  const mailto =
    d.contact?.email
      ? `mailto:${encodeURIComponent(d.contact.email)}?subject=${encodeURIComponent(`${d.ref} — ${d.subject}`)}&body=${encodeURIComponent(`Bonjour,\n\nVoici ${d.kind === 'facture' ? 'votre facture' : d.kind === 'proposition' ? 'notre proposition' : 'notre devis'} ${d.ref} : ${link}\n\n`)}`
      : null;
  revalidate(id);
  return { ok: true, message: channel === 'fil' ? 'Envoyé : déposé dans le fil du portail du client.' : 'Prêt à envoyer : le lien est copié dans votre courriel.', link, mailto };
}

export type Decision = 'accepte' | 'refuse' | 'payee' | 'annule' | 'relance';

/** Le sort d'un document envoyé, constaté par l'agence. */
export async function decideDocument(id: string, decision: Decision, note: string | null): Promise<Result> {
  const s = await session();
  if (!s) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (typeof id !== 'string' || !id) return { ok: false, message: 'Document introuvable.' };
  const supabase = await createClient();
  const d = await loadDocumentDetail(supabase, id);
  if (!d) return { ok: false, message: 'Document introuvable.' };
  const clean = typeof note === 'string' && note.trim() ? note.trim() : null;

  if (decision === 'relance') {
    if (!['envoye', 'retard', 'expire'].includes(d.status)) return { ok: false, message: 'Rien à relancer : ce document n’attend pas de réponse.' };
    await supabase.from('document_event').insert({ agency_id: s.agencyId, ...(d.kind === 'facture' ? { invoice_id: id } : { quote_id: id }), kind: 'relance', member_id: s.memberId, note: clean });
    if (d.accessToken) {
      await supabase.from('communication').insert({
        agency_id: s.agencyId,
        client_id: d.client.id,
        contact_id: d.contact?.id ?? null,
        channel: 'portail',
        direction: 'out',
        author_id: s.memberId,
        body: `${clean ?? `Petit rappel : ${d.ref} attend votre réponse.`} ${await origin()}${routes.documentLien(d.accessToken)}`,
      });
    }
    revalidate(id);
    return { ok: true, message: 'Relance consignée et déposée dans le fil.' };
  }

  if (d.kind === 'facture') {
    if (decision === 'payee') {
      if (d.status !== 'envoye' && d.status !== 'retard') return { ok: false, message: 'Seule une facture envoyée se marque payée.' };
      const { data, error } = await supabase.from('invoice').update({ status: 'payee', paid_on: today() }).eq('id', id).select('id');
      if (error) return { ok: false, message: explain(error.code, error.message) };
      if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit de marquer une facture payée (« Facturer » requis).' };
      await supabase.from('document_event').insert({ agency_id: s.agencyId, invoice_id: id, kind: 'paye', member_id: s.memberId, note: clean });
      revalidate(id);
      return { ok: true, message: 'Facture marquée payée.' };
    }
    if (decision === 'annule') {
      const { data, error } = await supabase.from('invoice').update({ status: 'annulee' }).eq('id', id).select('id');
      if (error) return { ok: false, message: explain(error.code, error.message) };
      if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit d’annuler une facture.' };
      await supabase.from('document_event').insert({ agency_id: s.agencyId, invoice_id: id, kind: 'annule', member_id: s.memberId, note: clean });
      revalidate(id);
      return { ok: true, message: 'Facture annulée.' };
    }
    return { ok: false, message: 'Ce geste ne s’applique pas à une facture.' };
  }

  if (decision === 'accepte' || decision === 'refuse') {
    if (d.status !== 'envoye' && d.status !== 'expire') return { ok: false, message: 'Seul un document envoyé reçoit une réponse.' };
    const upd = decision === 'accepte' ? { status: 'accepte' as const, accepted_on: today() } : { status: 'refuse' as const, refused_on: today(), refusal_note: clean };
    const { data, error } = await supabase.from('quote').update(upd).eq('id', id).select('id');
    if (error) return { ok: false, message: explain(error.code, error.message) };
    if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit de modifier ce document.' };
    await supabase.from('document_event').insert({ agency_id: s.agencyId, quote_id: id, kind: decision, member_id: s.memberId, note: clean ?? (decision === 'accepte' ? 'Accepté, constaté par l’agence' : null) });
    revalidate(id);
    return { ok: true, message: decision === 'accepte' ? 'Marqué accepté.' : 'Marqué refusé.' };
  }
  return { ok: false, message: 'Ce geste ne s’applique pas à ce document.' };
}

/** Corriger un document parti : il redevient un brouillon, la version envoyée reste consultable. */
export async function newVersion(id: string): Promise<Result> {
  const s = await session();
  if (!s) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (typeof id !== 'string' || !id) return { ok: false, message: 'Document introuvable.' };
  const supabase = await createClient();
  const d = await loadDocumentDetail(supabase, id);
  if (!d) return { ok: false, message: 'Document introuvable.' };
  if (d.kind === 'facture') return { ok: false, message: 'Une facture partie ne se corrige pas : annulez-la et émettez-en une autre.' };
  if (d.status === 'brouillon') return { ok: false, message: 'Ce document est déjà un brouillon.' };
  if (d.status === 'accepte') return { ok: false, message: 'Un document accepté ne se corrige plus : créez-en un nouveau.' };
  const { data, error } = await supabase.from('quote').update({ status: 'brouillon' }).eq('id', id).select('id');
  if (error) return { ok: false, message: explain(error.code, error.message) };
  if (!data?.length) return { ok: false, message: 'Vous n’avez pas le droit de modifier ce document.' };
  await supabase.from('document_event').insert({ agency_id: s.agencyId, quote_id: id, kind: 'corrige', member_id: s.memberId, version: d.versions.length + 1, note: `La version ${d.versions.length} reste consultable.` });
  revalidate(id);
  return { ok: true, message: `Version ${d.versions.length + 1} en préparation. La version ${d.versions.length} reste consultable.` };
}

/** Depuis le lien du client : accepter ou refuser, sans compte. */
export async function decideByToken(token: string, accept: boolean, typedName: string, reason: string): Promise<Result> {
  if (typeof token !== 'string' || token.length < 24) return { ok: false, message: 'Lien invalide.' };
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? '').split(',')[0].trim() || null;
  const ua = h.get('user-agent');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('decide_document_by_token', {
    p_token: token,
    p_accept: accept === true,
    p_typed_name: typeof typedName === 'string' ? typedName : '',
    p_reason: typeof reason === 'string' ? reason : '',
    // Les deux derniers acceptent NULL en base ; le type généré ne le dit pas.
    p_ip: ip as unknown as string,
    p_user_agent: (ua ? ua.slice(0, 300) : null) as unknown as string,
  });
  if (error) return { ok: false, message: error.message.replace(/^.*?:\s*/, '') || 'La réponse n’a pas pu être enregistrée.' };
  revalidatePath(routes.documentLien(token));
  return { ok: true, message: data === 'accepte' ? 'Merci ! Votre acceptation est enregistrée.' : 'Votre réponse est enregistrée.' };
}

function revalidate(id: string) {
  for (const p of [routes.document(id), '/agence', '/pipeline', '/clients']) revalidatePath(p);
}
