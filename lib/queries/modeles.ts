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
import type { DocData } from '@/lib/documents/balises';
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
  totalsToBlocks,
  type DocLine,
} from '@/lib/documents/donnees';
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
 * Les blocs se construisent avec `lib/documents/donnees.ts`, comme un vrai document.
 */
async function loadSamples(db: Db): Promise<SampleDoc[]> {
  const [agency, contract, catalogue, quoteRes] = await Promise.all([
    db.from('agency').select('*').maybeSingle(),
    db
      .from('contract')
      .select('*, client:client_id(*), contact:signed_by_contact_id(*)')
      .order('signed_on', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    loadCatalogueBlocks(db),
    db
      .from('quote')
      .select('*, lines:quote_line(*)')
      .order('issued_on', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const c = contract.data;
  const blocks = await loadContractBlocks(db, c);
  const q = quoteRes.data;
  const rawLines = (q?.lines ?? []).sort((x, y) => x.position - y.position);
  const recommended = catalogue.recommended(rawLines.find((l) => l.offer_id)?.offer_id);
  const maintenance = catalogue.recommendedMaintenance();
  const popularWeb = catalogue.popularWebId ? catalogue.offerById.get(catalogue.popularWebId) : undefined;
  const popularMaintenance = catalogue.popularMaintenanceId ? catalogue.offerById.get(catalogue.popularMaintenanceId) : undefined;
  const lines: DocLine[] = rawLines.length
    ? rawLines.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unitPriceCents: l.unit_price_cents,
        kind: l.kind,
        billing: l.billing,
      }))
    : popularWeb
      ? [{ description: `Forfait ${popularWeb.name}`, quantity: 1, unitPriceCents: popularWeb.priceCents ?? 0, kind: 'facturable', billing: 'ponctuel' }]
      : [];
  if (popularMaintenance?.priceCents && !lines.some((l) => l.billing !== 'ponctuel')) {
    lines.push({ description: popularMaintenance.name, quantity: 1, unitPriceCents: popularMaintenance.priceCents, kind: 'facturable', billing: 'mensuel' });
  }
  const totals = computeTotals(lines, DEFAULT_RATES);
  const agence = agencyBlock(agency.data);
  const contact = c?.contact ?? null;

  const base: DocData = {
    agence,
    client: clientBlock(c?.client ?? null, contact),
    document: documentBlock({
      reference: q?.ref ?? 'PR-2026-001',
      date: new Date().toISOString().slice(0, 10),
      echeance: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      objet: c?.title ?? q?.subject ?? 'Refonte du site web',
      template: null,
    }),
    proposition: { reference: q?.ref ?? '', date: fmtDate(q?.issued_on) },
    ...blocks,
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
    offre_recommandee: recommended,
    maintenance_recommandee: maintenance,
    offres: catalogue.offres,
    offres_maintenance: catalogue.offres_maintenance,
    ...linesToBlocks(lines),
    ...totalsToBlocks(totals),
    signature: {
      agence: [agence.representant, agence.representant_titre].filter(Boolean).join(', '),
      client: [contact?.full_name, contact?.role].filter(Boolean).join(', '),
      date: '___________________',
    },
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
    { id: 'reel', label: c?.client ? `${c.client.name}${c.ref ? ` — contrat ${c.ref}` : ''}` : 'Client d’exemple', data: base },
    { id: 'long', label: 'Coopérative BSL — nom et adresse longs', data: long },
  ];
}
