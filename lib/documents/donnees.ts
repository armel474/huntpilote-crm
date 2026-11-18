/**
 * Les données d'un document — ce que le rendu d'un modèle reçoit.
 *
 * Deux moitiés. La première est pure et testable : les totaux d'un jeu de
 * lignes selon leur nature et leur récurrence, et les blocs de lignes que
 * les modèles parcourent (`{{#lignes}}`, `{{#lignes_offertes}}`…). La
 * seconde lit la base : l'identité de l'agence, le catalogue rendu en blocs
 * `{{#offres}}` et `{{#offres_maintenance}}`, et ce qu'un contrat porte.
 *
 * L'aperçu des modèles (9.3) et le générateur (9.4) construisent leurs
 * données ici, avec les mêmes fonctions : un seul rendu, pas deux.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocData, DocValue } from '@/lib/documents/balises';
import { money } from '@/lib/format';
import type { Database } from '@/lib/supabase/database.types';

type Db = SupabaseClient<Database>;

export type LineKind = Database['public']['Enums']['line_kind'];
export type Billing = Database['public']['Enums']['billing_period'];

export const LINE_KIND_LABEL: Record<LineKind, string> = {
  facturable: 'Facturable',
  offert: 'Offert',
  remise: 'Remise',
  informatif: 'Informatif',
};

export const BILLING_SUFFIX: Record<Billing, string> = {
  ponctuel: 'paiement unique',
  mensuel: '/ mois',
  trimestriel: '/ trimestre',
  annuel: '/ an',
};

/** Une ligne telle que le document la porte. */
export type DocLine = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  kind: LineKind;
  billing: Billing;
};

export type Rates = { tps: number; tvq: number };
export const DEFAULT_RATES: Rates = { tps: 0.05, tvq: 0.09975 };

export type Totals = {
  /** Hors taxes, facturable et remises comprises — l'offert et l'informatif n'y sont pas. */
  ht: number;
  tps: number;
  tvq: number;
  ttc: number;
  /** Hors taxes, par récurrence. */
  ponctuel: number;
  recurrent: number;
  /** Ce que les remises retirent, en positif. */
  remise: number;
  /** Ce que les lignes informatives affichent, hors totaux. */
  informatif: number;
};

/** « Amount » d'une ligne, arrondi au cent : ce que le tableau affiche. */
export const lineAmount = (l: Pick<DocLine, 'quantity' | 'unitPriceCents'>) => Math.round(l.quantity * l.unitPriceCents);

/**
 * Les totaux, avec la même convention que la vue `quote_total` : la TPS et la
 * TVQ s'arrondissent chacune, puis s'additionnent — la somme des lignes
 * affichées fait le total affiché.
 */
export function computeTotals(lines: DocLine[], rates: Rates = DEFAULT_RATES): Totals {
  let ht = 0;
  let ponctuel = 0;
  let recurrent = 0;
  let remise = 0;
  let informatif = 0;
  for (const l of lines) {
    const amount = lineAmount(l);
    if (l.kind === 'facturable' || l.kind === 'remise') {
      ht += amount;
      if (l.billing === 'ponctuel') ponctuel += amount;
      else recurrent += amount;
      if (l.kind === 'remise') remise -= amount;
    } else if (l.kind === 'informatif') {
      informatif += amount;
    }
  }
  const tps = Math.round(ht * rates.tps);
  const tvq = Math.round(ht * rates.tvq);
  return { ht, tps, tvq, ttc: ht + tps + tvq, ponctuel, recurrent, remise, informatif };
}

/** « 9 000 » — un montant entier sans symbole, pour les prix affichés en gros. */
export const plain = (cents: number | null | undefined) =>
  cents === null || cents === undefined ? '' : new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 }).format(cents / 100);
export const exact = (cents: number | null | undefined) => (cents === null || cents === undefined ? '' : money(cents, { exact: true }));

const fmtLong = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
/** « 16 septembre 2026 », depuis une date ISO ; vide sans date. */
export const fmtDate = (d: string | null | undefined) => {
  if (!d) return '';
  const date = new Date(d.includes('T') ? d : `${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '' : fmtLong.format(date);
};

/** Les blocs de lignes qu'un modèle parcourt, prêts à rendre. */
export function linesToBlocks(lines: DocLine[]) {
  const one = (l: DocLine) => ({
    description: l.description,
    quantite: l.quantity,
    prix: l.kind === 'offert' ? 'Offert' : exact(l.unitPriceCents),
    montant: l.kind === 'offert' ? 'Offert' : exact(lineAmount(l)),
    recurrence: BILLING_SUFFIX[l.billing],
    nature: LINE_KIND_LABEL[l.kind],
  });
  return {
    lignes: lines.map(one),
    lignes_ponctuelles: lines.filter((l) => l.billing === 'ponctuel' && (l.kind === 'facturable' || l.kind === 'remise')).map(one),
    lignes_recurrentes: lines.filter((l) => l.billing !== 'ponctuel' && (l.kind === 'facturable' || l.kind === 'remise')).map(one),
    lignes_offertes: lines.filter((l) => l.kind === 'offert').map(one),
    lignes_informatives: lines.filter((l) => l.kind === 'informatif').map(one),
  };
}

/** Le bloc `total` d'un document, avec l'acompte et le solde à parts égales. */
export function totalsToBlocks(t: Totals, engagementMois = 3) {
  const withTaxes = (v: number, r: Rates) => v + Math.round(v * r.tps) + Math.round(v * r.tvq);
  const rates: Rates = t.ht > 0 ? { tps: t.tps / t.ht, tvq: t.tvq / t.ht } : DEFAULT_RATES;
  const acompteHt = Math.round(t.ponctuel * 0.5);
  const soldeHt = t.ponctuel - acompteHt;
  return {
    total: {
      ht: exact(t.ht),
      tps: exact(t.tps),
      tvq: exact(t.tvq),
      ttc: exact(t.ttc),
      ponctuel_ht: exact(t.ponctuel),
      mensuel_ht: t.recurrent ? exact(t.recurrent) : '',
      recurrent_engagement: t.recurrent ? exact(t.recurrent * engagementMois) : '',
      avant_remise: exact(t.ponctuel + t.remise),
      global_estime: exact(t.ponctuel + t.recurrent * engagementMois + t.informatif * engagementMois),
    },
    remise: t.remise > 0 ? { montant: exact(t.remise), pourcentage: t.ponctuel + t.remise > 0 ? Math.round((t.remise / (t.ponctuel + t.remise)) * 100) : 0 } : null,
    acompte: { pourcentage: 50, montant_ht: exact(acompteHt), montant_ttc: exact(withTaxes(acompteHt, rates)) },
    solde: { pourcentage: 50, montant_ht: exact(soldeHt), montant_ttc: exact(withTaxes(soldeHt, rates)) },
    budget: t.informatif > 0 ? { mensuel: exact(t.informatif), quotidien: exact(Math.round(t.informatif / 30)), total: exact(t.informatif * engagementMois) } : null,
  };
}

/* ── Ce que la base fournit ─────────────────────────────────────────────── */

type AgencyRow = Database['public']['Tables']['agency']['Row'];

/** Le bloc `agence`, depuis la ligne de l'agence. */
export function agencyBlock(a: AgencyRow | null): DocData {
  const cityPart = [a?.city, a?.province ? `(${a.province})` : ''].filter(Boolean).join(' ');
  return {
    nom: a?.name ?? 'Votre agence',
    raison_sociale: a?.legal_name ?? a?.name ?? '',
    adresse: [a?.address, cityPart, a?.postal_code].filter(Boolean).join(', '),
    ville: a?.city ?? '',
    telephone: a?.phone ?? '',
    courriel: a?.email ?? '',
    site: a?.website ?? '',
    tps: a?.gst_number ?? '',
    tvq: a?.qst_number ?? '',
    neq: a?.neq ?? '',
    logo: a?.logo_url ?? '',
    representant: a?.representative_name ?? '',
    representant_titre: a?.representative_title ?? '',
    district_judiciaire: a?.judicial_district ?? '',
  };
}

export type CatalogueBlocks = {
  offres: DocValue[];
  offres_maintenance: DocValue[];
  /** Le bloc `offre_recommandee` d'une offre donnée, ou de la plus populaire. */
  recommended: (offerId?: string | null) => DocData | null;
  /** Le bloc `maintenance_recommandee` d'un pack donné, ou du plus populaire. */
  recommendedMaintenance: (offerId?: string | null) => DocData | null;
  /** Le nom et le prix d'une offre, pour libeller une ligne. */
  offerById: Map<string, { name: string; priceCents: number | null; billing: Billing; recommendedOfferId: string | null }>;
  /** Le forfait web mis en avant et le pack de maintenance mis en avant, s'ils existent. */
  popularWebId: string | null;
  popularMaintenanceId: string | null;
};

/** Le catalogue actif rendu en blocs `{{#offres}}` et `{{#offres_maintenance}}`. */
export async function loadCatalogueBlocks(db: Db): Promise<CatalogueBlocks> {
  const [offersRes, offerLines, benefits, segments, items] = await Promise.all([
    db.from('offer').select('*').eq('active', true).order('position'),
    db.from('offer_line').select('offer_id, quantity, position, label, catalog_item_id, included_offer_id').order('position'),
    db.from('offer_benefit').select('offer_id, position, label').order('position'),
    db.from('offer_segment').select('offer_id, position, label').order('position'),
    db.from('catalog_item').select('id, code, name'),
  ]);
  const itemName = new Map((items.data ?? []).map((i) => [i.id, i.name]));
  const itemCode = new Map((items.data ?? []).map((i) => [i.id, i.code]));
  const offers = offersRes.data ?? [];
  const offerName = new Map(offers.map((o) => [o.id, o.name]));
  const linesBy = new Map<string, NonNullable<typeof offerLines.data>>();
  for (const l of offerLines.data ?? []) linesBy.set(l.offer_id, [...(linesBy.get(l.offer_id) ?? []), l]);
  const benefitsBy = new Map<string, string[]>();
  for (const b of benefits.data ?? []) benefitsBy.set(b.offer_id, [...(benefitsBy.get(b.offer_id) ?? []), b.label]);
  const segmentsBy = new Map<string, string[]>();
  for (const s of segments.data ?? []) segmentsBy.set(s.offer_id, [...(segmentsBy.get(s.offer_id) ?? []), s.label]);
  const lineText = (l: { label: string | null; catalog_item_id: string | null; included_offer_id: string | null; quantity: number }) =>
    l.label ??
    (l.included_offer_id
      ? `Tout ce qui est dans « ${offerName.get(l.included_offer_id) ?? '…'} »`
      : `${Number(l.quantity) !== 1 ? `${Number(l.quantity)} × ` : ''}${itemName.get(l.catalog_item_id ?? '') ?? ''}`);
  const hoursOf = (offerId: string, seen = new Set<string>()): number => {
    if (seen.has(offerId)) return 0;
    seen.add(offerId);
    let h = 0;
    for (const l of linesBy.get(offerId) ?? []) {
      if (l.catalog_item_id && itemCode.get(l.catalog_item_id) === 'maintenance-heures') h += Number(l.quantity);
      if (l.included_offer_id) h += hoursOf(l.included_offer_id, seen);
    }
    return h;
  };
  const delai = (o: (typeof offers)[number]) =>
    o.delivery_weeks_min === null
      ? ''
      : o.delivery_weeks_max && o.delivery_weeks_max !== o.delivery_weeks_min
        ? `${o.delivery_weeks_min} à ${o.delivery_weeks_max} semaines`
        : `${o.delivery_weeks_min} semaine${o.delivery_weeks_min > 1 ? 's' : ''}`;

  const web = offers.filter((o) => o.billing === 'ponctuel');
  const maintenance = offers.filter((o) => o.billing !== 'ponctuel' && o.code.startsWith('maintenance'));

  const offresWeb: DocValue[] = web.map((o) => ({
    nom: o.name,
    accroche: o.tagline ?? '',
    description: o.description ?? '',
    prix: plain(o.price_cents),
    prix_prefixe: o.price_is_from ? 'À partir de · ' : '',
    delai: delai(o),
    consultation: o.free_consult_minutes ?? '',
    populaire: o.is_popular,
    lignes: (linesBy.get(o.id) ?? []).map((l) => ({ texte: lineText(l) })),
    benefices: (benefitsBy.get(o.id) ?? []).map((b) => ({ texte: b })),
    segments: (segmentsBy.get(o.id) ?? []).map((s) => ({ nom: s })),
  }));
  const offresMaintenance: DocValue[] = maintenance.map((o) => ({
    nom: o.name,
    prix_mensuel: plain(o.price_cents),
    heures: hoursOf(o.id) || '',
    taux_depassement: o.overage_hourly_rate_cents === null ? '' : plain(o.overage_hourly_rate_cents),
    ideal_avec: o.recommended_offer_id ? (offerName.get(o.recommended_offer_id) ?? '') : '',
    lignes: (linesBy.get(o.id) ?? [])
      .filter((l) => !(l.catalog_item_id && itemCode.get(l.catalog_item_id) === 'maintenance-heures'))
      .map((l) => ({ texte: lineText(l) })),
  }));

  const popularWeb = web.find((o) => o.is_popular) ?? web[0];
  const popularMaintenance = maintenance.find((o) => o.is_popular) ?? maintenance[0];
  return {
    offres: offresWeb,
    offres_maintenance: offresMaintenance,
    recommended: (offerId) => {
      const o = (offerId && offers.find((x) => x.id === offerId)) || popularWeb;
      return o ? { nom: o.name, prix: plain(o.price_cents), delai: delai(o) } : null;
    },
    recommendedMaintenance: (offerId) => {
      const o = (offerId && offers.find((x) => x.id === offerId)) || popularMaintenance;
      return o ? { nom: o.name, prix_mensuel: plain(o.price_cents) } : null;
    },
    offerById: new Map(offers.map((o) => [o.id, { name: o.name, priceCents: o.price_cents, billing: o.billing, recommendedOfferId: o.recommended_offer_id }])),
    popularWebId: popularWeb?.id ?? null,
    popularMaintenanceId: popularMaintenance?.id ?? null,
  };
}

export type ContractBlocks = {
  contrat: DocData;
  livrables: DocValue[];
  jalons: DocValue[];
  exclusions: DocValue[];
  paiements: DocValue[];
  attendus_client: DocValue[];
};

/** Ce qu'un contrat signé apporte à un rendu : ses clauses chiffrées et ses tableaux. */
export async function loadContractBlocks(
  db: Db,
  c: { id: string; ref: string; title: string; started_on: string | null; hourly_rate_cents: number | null; fee_cents: number | null } | null,
  rates: Rates = DEFAULT_RATES,
): Promise<ContractBlocks> {
  const empty: ContractBlocks = {
    contrat: { reference: '', titre: '', date_debut: '', taux_horaire: '', nombre_pages: '', collections_cms: '', solution_paiement: '' },
    livrables: [],
    jalons: [],
    exclusions: [],
    paiements: [],
    attendus_client: [],
  };
  if (!c) return empty;
  const [schedule, dels, excl, pays, inputs] = await Promise.all([
    db.from('contract_schedule').select('*').eq('contract_id', c.id).order('position'),
    db.from('deliverable').select('*').eq('contract_id', c.id).order('position'),
    db.from('contract_exclusion').select('*').eq('contract_id', c.id).order('position'),
    db.from('payment_milestone').select('*').eq('contract_id', c.id).order('position'),
    db.from('client_input_item').select('*').eq('contract_id', c.id).order('position'),
  ]);
  const plannedBy = new Map((schedule.data ?? []).map((m) => [m.milestone_id as string, m.planned_on as string | null]));
  const OWNER: Record<string, string> = { client: 'Client', prestataire: 'Prestataire', les_deux: 'Les deux Parties' };
  const fee = c.fee_cents ?? 0;
  const withTaxes = (v: number) => v + Math.round(v * rates.tps) + Math.round(v * rates.tvq);
  return {
    contrat: {
      reference: c.ref,
      titre: c.title,
      date_debut: fmtDate(c.started_on),
      taux_horaire: plain(c.hourly_rate_cents ?? 10000),
      nombre_pages: '12',
      collections_cms: '7',
      solution_paiement: 'Zeffy',
    },
    jalons: (schedule.data ?? []).map((m) => ({
      code: m.code ?? '',
      titre: m.description ?? '',
      responsable: OWNER[m.owner ?? ''] ?? m.owner ?? '',
      date: fmtDate(m.planned_on) || 'À confirmer',
    })),
    livrables: (dels.data ?? []).map((d) => ({
      code: d.code,
      titre: d.title,
      description: d.description ?? '',
      rondes: d.included_rounds === null ? 'S.O.' : `${d.included_rounds} ronde${d.included_rounds > 1 ? 's' : ''}`,
      echeance: '',
    })),
    exclusions: (excl.data ?? []).map((e) => ({ texte: e.label, detail: e.detail ?? '' })),
    paiements: (pays.data ?? []).map((p) => {
      const partHt = p.percentage !== null ? Math.round((fee * Number(p.percentage)) / 100) : (p.amount_cents ?? 0);
      return {
        titre: p.label,
        pourcentage: p.percentage !== null ? `${Number(p.percentage)} %` : '',
        montant_ht: exact(partHt),
        montant_ttc: exact(withTaxes(partHt)),
        echeance: fmtDate(p.due_on ?? (p.milestone_id ? plannedBy.get(p.milestone_id) : null)) || 'À la signature',
        declencheur: p.trigger === 'signature' ? 'À la signature du contrat' : p.trigger === 'jalon' ? 'Au jalon atteint' : 'À date fixe',
      };
    }),
    attendus_client: (inputs.data ?? []).map((i) => ({ texte: i.label, format: i.expected_format ?? '', note: i.note ?? '' })),
  };
}

/** Le bloc `client`, depuis le compte et son contact. */
export function clientBlock(
  client: { name: string; address?: string | null; sector?: string | null; legal_form?: string | null } | null,
  contact: { full_name: string; role: string | null; email: string | null; phone: string | null } | null,
): DocData {
  const [prenom, ...reste] = (contact?.full_name ?? '').split(' ');
  return {
    nom: client?.name ?? '',
    raison_sociale: client?.name ?? '',
    forme_juridique: client?.legal_form ?? null,
    adresse: client?.address ?? '',
    ville: (client?.address ?? '').match(/,\s*([^,(]+?)\s*\(/)?.[1]?.trim() ?? '',
    secteur: client?.sector ?? '',
    courriel: contact?.email ?? '',
    telephone: contact?.phone ?? '',
    contact: {
      nom: contact?.full_name ?? '',
      prenom,
      nom_famille: reste.join(' '),
      titre: contact?.role ?? '',
      courriel: contact?.email ?? '',
    },
  };
}

/** Le bloc `document`, ses textes venant du modèle. */
export function documentBlock(input: {
  reference: string;
  date: string | null;
  echeance: string | null;
  objet: string;
  engagementMois?: number;
  template: { intro: string | null; legal_mentions: string | null; footer: string | null; payment_instructions: string | null } | null;
}): DocData {
  return {
    reference: input.reference,
    date: fmtDate(input.date) || fmtDate(new Date().toISOString().slice(0, 10)),
    echeance: fmtDate(input.echeance),
    objet: input.objet,
    engagement_mois: input.engagementMois ?? 3,
    introduction: input.template?.intro ?? '',
    mentions: input.template?.legal_mentions ?? '',
    pied: input.template?.footer ?? '',
    paiement: input.template?.payment_instructions ?? '',
  };
}

/** Les sections d'un document, en bloc `section` : la clé → le corps, vide quand la section est retirée. */
export function sectionsBlock(sections: { key: string; body: string | null; enabled: boolean }[]): DocData {
  const out: DocData = {};
  for (const s of sections) out[s.key] = s.enabled ? (s.body ?? '') : '';
  return out;
}
