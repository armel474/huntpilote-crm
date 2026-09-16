/**
 * Ce que la section « Modèles de documents » lit dans la base — session 9.3 :
 * les modèles avec leur corps et leurs sections, ce qu'ils ont déjà produit,
 * et les données d'exemple réelles de l'aperçu (le client SHGM et son contrat
 * n° 2026-007, une offre du catalogue, l'identité de l'agence).
 *
 * Fonctions serveur : elles reçoivent le client de la requête, donc les
 * droits de la personne connectée.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocData, DocValue } from '@/lib/documents/balises';
import { money } from '@/lib/format';
import type { Database } from '@/lib/supabase/database.types';

type Db = SupabaseClient<Database>;

export type DocKind = Database['public']['Enums']['document_kind'];

export const DOC_KINDS: { id: DocKind; label: string; plural: string }[] = [
  { id: 'proposition', label: 'Proposition', plural: 'propositions' },
  { id: 'devis', label: 'Devis', plural: 'devis' },
  { id: 'contrat', label: 'Contrat', plural: 'contrats' },
  { id: 'annexe', label: 'Annexe', plural: 'annexes' },
  { id: 'avenant', label: 'Avenant', plural: 'avenants' },
  { id: 'facture', label: 'Facture', plural: 'factures' },
];

export type TemplateSection = {
  id: string | null;
  key: string;
  title: string;
  position: number;
  defaultBody: string;
  optional: boolean;
  aiAssist: boolean;
  lockedByAgency: boolean;
  maxChars: number | null;
};

export type DocTemplate = {
  id: string;
  kind: DocKind;
  name: string;
  isDefault: boolean;
  prefix: string | null;
  includeYear: boolean;
  numberPadding: number;
  paymentTermsDays: number;
  intro: string | null;
  legalMentions: string | null;
  footer: string | null;
  paymentInstructions: string | null;
  bodyHtml: string | null;
  active: boolean;
  updatedAt: string;
  sections: TemplateSection[];
  /** Devis et factures déjà produits avec ce modèle. */
  documentsCount: number;
};

/** Un jeu de données d'exemple pour l'aperçu : un client, son contrat, une offre. */
export type SampleDoc = {
  id: string;
  label: string;
  data: DocData;
};

export type ModelesData = {
  templates: DocTemplate[];
  samples: SampleDoc[];
};

const EMPTY: ModelesData = { templates: [], samples: [] };

/** « DV-2026-018 » : ce que le prochain document produira, d'après ce qui l'a été. */
export function nextRef(t: Pick<DocTemplate, 'prefix' | 'includeYear' | 'numberPadding' | 'documentsCount'>, year = new Date().getFullYear()): string {
  return [t.prefix || null, t.includeYear ? String(year) : null, String(t.documentsCount + 1).padStart(t.numberPadding, '0')]
    .filter(Boolean)
    .join('-');
}

const fmtDate = (d: string | null | undefined) =>
  d ? new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${d}T12:00:00`)) : '';

/** « 9 000 » — un montant entier sans symbole, pour les prix affichés en gros. */
const plain = (cents: number | null | undefined) =>
  cents === null || cents === undefined ? '' : new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 }).format(cents / 100);

const exact = (cents: number | null | undefined) => (cents === null || cents === undefined ? '' : money(cents, { exact: true }));

const TPS = 0.05;
const TVQ = 0.09975;

export async function loadModelesData(db: Db): Promise<ModelesData> {
  const [templates, sections, quotes, invoices] = await Promise.all([
    db.from('document_template').select('*').order('kind').order('name'),
    db.from('document_template_section').select('*').order('position'),
    db.from('quote').select('template_id'),
    db.from('invoice').select('template_id'),
  ]);
  if (!templates.data) return EMPTY;

  const counts = new Map<string, number>();
  for (const r of [...(quotes.data ?? []), ...(invoices.data ?? [])]) {
    if (r.template_id) counts.set(r.template_id, (counts.get(r.template_id) ?? 0) + 1);
  }
  const sectionsBy = new Map<string, TemplateSection[]>();
  for (const s of sections.data ?? []) {
    sectionsBy.set(s.template_id, [
      ...(sectionsBy.get(s.template_id) ?? []),
      {
        id: s.id,
        key: s.key,
        title: s.title,
        position: s.position,
        defaultBody: s.default_body ?? '',
        optional: s.optional,
        aiAssist: s.ai_assist,
        lockedByAgency: s.locked_by_agency,
        maxChars: s.max_chars,
      },
    ]);
  }

  return {
    templates: templates.data.map((t) => ({
      id: t.id,
      kind: t.kind,
      name: t.name,
      isDefault: t.is_default,
      prefix: t.prefix,
      includeYear: t.include_year,
      numberPadding: t.number_padding,
      paymentTermsDays: t.payment_terms_days,
      intro: t.intro,
      legalMentions: t.legal_mentions,
      footer: t.footer,
      paymentInstructions: t.payment_instructions,
      bodyHtml: t.body_html,
      active: t.active,
      updatedAt: t.updated_at,
      sections: sectionsBy.get(t.id) ?? [],
      documentsCount: counts.get(t.id) ?? 0,
    })),
    samples: await loadSamples(db),
  };
}

/**
 * Les données d'exemple de l'aperçu, lues dans la base : l'agence, le premier
 * client qui a un contrat signé (la SHGM dans le semis) avec ses livrables,
 * jalons, exclusions, paiements et contenu attendu ; le dernier devis envoyé
 * pour les lignes ; les offres du catalogue. Puis la même chose avec un nom
 * et une adresse longs, pour voir ce qu'un cas extrême fait à la mise en page.
 */
async function loadSamples(db: Db): Promise<SampleDoc[]> {
  const [agency, contract, offersRes, offerLines, benefits, segments, items, quoteRes] = await Promise.all([
    db.from('agency').select('*').maybeSingle(),
    db
      .from('contract')
      .select('*, client:client_id(*), contact:signed_by_contact_id(*)')
      .order('signed_on', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    db.from('offer').select('*').eq('active', true).order('position'),
    db.from('offer_line').select('offer_id, quantity, position, label, catalog_item_id, included_offer_id').order('position'),
    db.from('offer_benefit').select('offer_id, position, label').order('position'),
    db.from('offer_segment').select('offer_id, position, label').order('position'),
    db.from('catalog_item').select('id, code, name'),
    db
      .from('quote')
      .select('*, lines:quote_line(*)')
      .order('issued_on', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const a = agency.data;
  const agence: DocData = {
    nom: a?.name ?? 'Votre agence',
    raison_sociale: a?.legal_name ?? a?.name ?? '',
    adresse: [a?.address, [a?.city, a?.province].filter(Boolean).join(' ('), a?.postal_code].filter(Boolean).join(', ').replace(' (', ' (').replace(/\((\w[^,]*)$/, '($1)'),
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
    l.label ?? (l.included_offer_id ? `Tout ce qui est dans « ${offerName.get(l.included_offer_id) ?? '…'} »` : `${Number(l.quantity) !== 1 ? `${Number(l.quantity)} × ` : ''}${itemName.get(l.catalog_item_id ?? '') ?? ''}`);
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

  const offresWeb: DocValue[] = offers
    .filter((o) => o.billing === 'ponctuel')
    .map((o) => ({
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
  const maintenance = offers.filter((o) => o.billing !== 'ponctuel' && o.code.startsWith('maintenance'));
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
  const recommended = offers.find((o) => o.billing === 'ponctuel' && o.is_popular) ?? offers.find((o) => o.billing === 'ponctuel');
  const recommendedMaintenance = maintenance.find((o) => o.is_popular) ?? maintenance[0];

  // Les lignes du dernier devis, sinon l'offre recommandée seule.
  const q = quoteRes.data;
  const rawLines = (q?.lines ?? []).sort((x, y) => x.position - y.position);
  const lignes = rawLines.length
    ? rawLines.map((l) => ({
        description: l.description,
        quantite: Number(l.quantity),
        prix: exact(l.unit_price_cents),
        montant: exact(Math.round(Number(l.quantity) * l.unit_price_cents)),
        recurrence: 'paiement unique',
      }))
    : recommended
      ? [{ description: `Forfait ${recommended.name}`, quantite: 1, prix: exact(recommended.price_cents), montant: exact(recommended.price_cents), recurrence: 'paiement unique' }]
      : [];
  const ht = rawLines.length ? rawLines.reduce((s, l) => s + Math.round(Number(l.quantity) * l.unit_price_cents), 0) : (recommended?.price_cents ?? 0);
  const tps = Math.round(ht * TPS);
  const tvq = Math.round(ht * TVQ);
  const ttc = ht + tps + tvq;
  const monthly = recommendedMaintenance?.price_cents ?? 0;
  const engagement = 3;

  const c = contract.data;
  const client = c?.client;
  const contact = c?.contact;
  const [prenom, ...reste] = (contact?.full_name ?? '').split(' ');

  let jalons: DocValue[] = [];
  let livrables: DocValue[] = [];
  let exclusions: DocValue[] = [];
  let paiements: DocValue[] = [];
  let attendus: DocValue[] = [];
  if (c) {
    const [schedule, dels, excl, pays, inputs] = await Promise.all([
      db.from('contract_schedule').select('*').eq('contract_id', c.id).order('position'),
      db.from('deliverable').select('*').eq('contract_id', c.id).order('position'),
      db.from('contract_exclusion').select('*').eq('contract_id', c.id).order('position'),
      db.from('payment_milestone').select('*').eq('contract_id', c.id).order('position'),
      db.from('client_input_item').select('*').eq('contract_id', c.id).order('position'),
    ]);
    const plannedBy = new Map((schedule.data ?? []).map((m) => [m.milestone_id as string, m.planned_on as string | null]));
    const OWNER: Record<string, string> = { client: 'Client', prestataire: 'Prestataire', les_deux: 'Les deux Parties' };
    jalons = (schedule.data ?? []).map((m) => ({
      code: m.code ?? '',
      titre: m.description ?? '',
      responsable: OWNER[m.owner ?? ''] ?? m.owner ?? '',
      date: fmtDate(m.planned_on) || 'À confirmer',
    }));
    livrables = (dels.data ?? []).map((d) => ({
      code: d.code,
      titre: d.title,
      description: d.description ?? '',
      rondes: d.included_rounds === null ? 'S.O.' : `${d.included_rounds} ronde${d.included_rounds > 1 ? 's' : ''}`,
      echeance: '',
    }));
    exclusions = (excl.data ?? []).map((e) => ({ texte: e.label, detail: e.detail ?? '' }));
    const fee = c.fee_cents ?? ht;
    paiements = (pays.data ?? []).map((p) => {
      const partHt = p.percentage !== null ? Math.round(fee * Number(p.percentage) / 100) : (p.amount_cents ?? 0);
      return {
        titre: p.label,
        pourcentage: p.percentage !== null ? `${Number(p.percentage)} %` : '',
        montant_ht: exact(partHt),
        montant_ttc: exact(partHt + Math.round(partHt * TPS) + Math.round(partHt * TVQ)),
        echeance: fmtDate(p.due_on ?? (p.milestone_id ? plannedBy.get(p.milestone_id) : null)) || 'À la signature',
        declencheur: p.trigger === 'signature' ? 'À la signature du contrat' : p.trigger === 'jalon' ? 'Au jalon atteint' : 'À date fixe',
      };
    });
    attendus = (inputs.data ?? []).map((i) => ({ texte: i.label, format: i.expected_format ?? '', note: i.note ?? '' }));
  }
  const feeHt = c?.fee_cents ?? ht;
  const acompteHt = Math.round(feeHt * 0.5);
  const soldeHt = feeHt - acompteHt;
  const withTaxes = (v: number) => v + Math.round(v * TPS) + Math.round(v * TVQ);

  const base: DocData = {
    agence,
    client: {
      nom: client?.name ?? 'Client d’exemple',
      raison_sociale: client?.name ?? 'Client d’exemple',
      forme_juridique: null,
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
    },
    document: {
      date: fmtDate(new Date().toISOString().slice(0, 10)),
      echeance: fmtDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)),
      objet: c?.title ?? q?.subject ?? 'Refonte du site web',
      engagement_mois: engagement,
    },
    proposition: { reference: q?.ref ?? '', date: fmtDate(q?.issued_on) },
    contrat: {
      reference: c?.ref ?? '',
      titre: c?.title ?? '',
      date_debut: fmtDate(c?.started_on),
      taux_horaire: plain(c?.hourly_rate_cents ?? 10000),
      nombre_pages: '12',
      collections_cms: '7',
      solution_paiement: 'Zeffy',
    },
    brief: {
      date_appel: fmtDate(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
      atout_principal: 'une expertise reconnue dans la région',
      probleme_cardinal: 'un site désuet qui ne génère aucune demande',
      objectif_principal: 'générer des demandes de soumission en ligne',
      resultat_vise: '+30 % de demandes en 6 mois',
      canal_actuel: 'les messages privés Facebook',
      canal_publicitaire: 'Meta (Facebook et Instagram)',
      taux_annulation: '25 %',
      coeur_metier: 'votre métier',
      offre_specialisee: 'votre offre phare',
      atout_concurrentiel: 'un savoir-faire reconnu',
      systeme_reservation: '',
      zone_secondaire: '',
    },
    offre_recommandee: recommended ? { nom: recommended.name, prix: plain(recommended.price_cents), delai: delai(recommended) } : null,
    maintenance_recommandee: recommendedMaintenance ? { nom: recommendedMaintenance.name, prix_mensuel: plain(recommendedMaintenance.price_cents) } : null,
    offres: offresWeb,
    offres_maintenance: offresMaintenance,
    lignes,
    lignes_ponctuelles: lignes,
    lignes_recurrentes: recommendedMaintenance ? [{ description: recommendedMaintenance.name, montant: exact(monthly), recurrence: '/ mois' }] : [],
    lignes_offertes: [],
    lignes_informatives: [],
    total: {
      ht: exact(ht),
      tps: exact(tps),
      tvq: exact(tvq),
      ttc: exact(ttc),
      ponctuel_ht: exact(ht),
      mensuel_ht: monthly ? exact(monthly) : '',
      recurrent_engagement: monthly ? exact(monthly * engagement) : '',
      avant_remise: exact(ht),
      global_estime: exact(ht + monthly * engagement),
    },
    remise: null,
    acompte: { pourcentage: 50, montant_ht: exact(acompteHt), montant_ttc: exact(withTaxes(acompteHt)) },
    solde: { pourcentage: 50, montant_ht: exact(soldeHt), montant_ttc: exact(withTaxes(soldeHt)) },
    budget: null,
    signature: {
      agence: [agence.representant, agence.representant_titre].filter(Boolean).join(', '),
      client: [contact?.full_name, contact?.role].filter(Boolean).join(', '),
      date: '___________________',
    },
    livrables,
    jalons,
    exclusions,
    paiements,
    attendus_client: attendus,
  };

  const long: DocData = {
    ...base,
    client: {
      ...(base.client as DocData),
      nom: 'Coop. BSL',
      raison_sociale: 'Coopérative de solidarité en aménagement forestier, développement communautaire et transition énergétique du Bas-Saint-Laurent',
      adresse: '1425, boulevard de l’Industrie, bureau 300, secteur Notre-Dame-du-Portage, Rivière-du-Loup (Québec) G5R 5X4',
      ville: 'Rivière-du-Loup',
      contact: {
        nom: 'Jean-Sébastien Ouellet-Tremblay',
        prenom: 'Jean-Sébastien',
        nom_famille: 'Ouellet-Tremblay',
        titre: 'Directeur général adjoint aux partenariats et au développement',
        courriel: 'js.ouellet-tremblay@cooperative-bsl.qc.ca',
      },
    },
  };

  return [
    { id: 'reel', label: client ? `${client.name}${c?.ref ? ` — contrat ${c.ref}` : ''}` : 'Client d’exemple', data: base },
    { id: 'long', label: 'Coopérative BSL — nom et adresse longs', data: long },
  ];
}
