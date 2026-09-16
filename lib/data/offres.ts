/**
 * Le brouillon d'une offre — ce que le constructeur (session 9.2) manipule à
 * l'écran et envoie tel quel à l'action serveur.
 *
 * La base range le contenu d'une offre en lignes plates (`offer_line`) où un
 * groupe d'options « au choix du client » est une suite de lignes qui
 * partagent `option_group`. Le brouillon les regroupe, parce que c'est ainsi
 * qu'on les édite ; `toDraft` et `linesToRows` font la traduction dans les
 * deux sens. Rien ici ne touche à la base : ces fonctions se testent seules.
 */
import type { Offer } from '@/lib/queries/agence';

export type Billing = 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel';
export type TaskCadence = 'signature' | 'mensuel' | 'trimestriel' | 'annuel';
export type TaskRole = 'admin' | 'chef_projet' | 'specialiste_seo' | 'redacteur';

export const BILLINGS: Billing[] = ['ponctuel', 'mensuel', 'trimestriel', 'annuel'];
export const CADENCES: TaskCadence[] = ['signature', 'mensuel', 'trimestriel', 'annuel'];
export const TASK_ROLES: TaskRole[] = ['admin', 'chef_projet', 'specialiste_seo', 'redacteur'];

export const CADENCE_LABEL: Record<TaskCadence, string> = {
  signature: 'À la vente',
  mensuel: 'Chaque mois',
  trimestriel: 'Chaque trimestre',
  annuel: 'Chaque année',
};

export type DraftOption = {
  /** Clé d'affichage, stable le temps de l'édition. */
  key: string;
  /** L'identifiant de la ligne en base, null tant qu'elle n'est pas enregistrée. */
  id: string | null;
  catalogItemId: string;
  quantity: number;
  label: string;
  /** Ce qui distingue l'alternative dans la base, et que les tâches désignent. */
  optionKey: string;
};

export type DraftLine =
  | { key: string; kind: 'article'; id: string | null; catalogItemId: string; quantity: number; label: string }
  | { key: string; kind: 'offre'; id: string | null; includedOfferId: string }
  | { key: string; kind: 'groupe'; group: string; options: DraftOption[] };

export type DraftTask = {
  key: string;
  id: string | null;
  title: string;
  kind: 'technique' | 'contenu';
  cadence: TaskCadence;
  dueDay: number | null;
  defaultRole: TaskRole | null;
  estimateHours: number | null;
  optionGroup: string | null;
  optionKey: string | null;
};

export type DraftDeliverable = {
  key: string;
  id: string | null;
  code: string;
  title: string;
  description: string;
  includedRounds: number | null;
};

export type OfferDraft = {
  id: string | null;
  code: string;
  name: string;
  tagline: string;
  description: string;
  billing: Billing;
  priceCents: number | null;
  priceIsFrom: boolean;
  introPriceCents: number | null;
  introPeriods: number | null;
  deliveryWeeksMin: number | null;
  deliveryWeeksMax: number | null;
  freeConsultMinutes: number | null;
  overageHourlyRateCents: number | null;
  isPopular: boolean;
  active: boolean;
  recommendedOfferId: string | null;
  segments: string[];
  benefits: string[];
  lines: DraftLine[];
  tasks: DraftTask[];
  deliverables: DraftDeliverable[];
};

let counter = 0;
/** Une clé d'affichage : unique dans la page, sans prétention au-delà. */
export function uid(): string {
  counter += 1;
  return `k${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Un code lisible à partir d'un nom : « Maintenance Essentiel » → `maintenance-essentiel`. */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Une offre telle que la base la donne, ramenée à un brouillon éditable. */
export function toDraft(offer: Offer): OfferDraft {
  const lines: DraftLine[] = [];
  const groups = new Map<string, DraftLine & { kind: 'groupe' }>();
  for (const l of offer.lines) {
    if (l.optionGroup && l.catalogItemId) {
      let g = groups.get(l.optionGroup);
      if (!g) {
        g = { key: uid(), kind: 'groupe', group: l.optionGroup, options: [] };
        groups.set(l.optionGroup, g);
        lines.push(g);
      }
      g.options.push({
        key: uid(),
        id: l.id,
        catalogItemId: l.catalogItemId,
        quantity: l.quantity,
        label: l.customLabel ?? '',
        optionKey: l.optionKey ?? slugify(l.label),
      });
    } else if (l.includedOfferId) {
      lines.push({ key: uid(), kind: 'offre', id: l.id, includedOfferId: l.includedOfferId });
    } else if (l.catalogItemId) {
      lines.push({
        key: uid(),
        kind: 'article',
        id: l.id,
        catalogItemId: l.catalogItemId,
        quantity: l.quantity,
        label: l.customLabel ?? '',
      });
    }
  }
  return {
    id: offer.id,
    code: offer.code,
    name: offer.name,
    tagline: offer.tagline ?? '',
    description: offer.description ?? '',
    billing: offer.billing,
    priceCents: offer.priceCents,
    priceIsFrom: offer.priceIsFrom,
    introPriceCents: offer.introPriceCents,
    introPeriods: offer.introPeriods,
    deliveryWeeksMin: offer.deliveryWeeksMin,
    deliveryWeeksMax: offer.deliveryWeeksMax,
    freeConsultMinutes: offer.freeConsultMinutes,
    overageHourlyRateCents: offer.overageHourlyRateCents,
    isPopular: offer.isPopular,
    active: offer.active,
    recommendedOfferId: offer.recommendedOfferId,
    segments: [...offer.segments],
    benefits: [...offer.benefits],
    lines,
    tasks: offer.tasks.map((t) => ({ key: uid(), ...t })),
    deliverables: offer.deliverables.map((d) => ({ key: uid(), ...d, description: d.description ?? '' })),
  };
}

/** Une offre vierge : ponctuelle, active, sans contenu. */
export function emptyDraft(code: string): OfferDraft {
  return {
    id: null,
    code,
    name: '',
    tagline: '',
    description: '',
    billing: 'ponctuel',
    priceCents: null,
    priceIsFrom: false,
    introPriceCents: null,
    introPeriods: null,
    deliveryWeeksMin: null,
    deliveryWeeksMax: null,
    freeConsultMinutes: null,
    overageHourlyRateCents: null,
    isPopular: false,
    active: true,
    recommendedOfferId: null,
    segments: [],
    benefits: [],
    lines: [],
    tasks: [],
    deliverables: [],
  };
}

/** Ce que la base attend pour une ligne de `offer_line`, hors `offer_id`. */
export type LineRow = {
  id: string | null;
  catalog_item_id: string | null;
  included_offer_id: string | null;
  quantity: number;
  position: number;
  option_group: string | null;
  option_key: string | null;
  label: string | null;
};

/** Le contenu du brouillon, à plat, dans l'ordre d'affichage. */
export function linesToRows(lines: DraftLine[]): LineRow[] {
  const rows: LineRow[] = [];
  let position = 0;
  for (const l of lines) {
    if (l.kind === 'article') {
      rows.push({
        id: l.id,
        catalog_item_id: l.catalogItemId,
        included_offer_id: null,
        quantity: l.quantity,
        position: position++,
        option_group: null,
        option_key: null,
        label: l.label.trim() || null,
      });
    } else if (l.kind === 'offre') {
      rows.push({
        id: l.id,
        catalog_item_id: null,
        included_offer_id: l.includedOfferId,
        quantity: 1,
        position: position++,
        option_group: null,
        option_key: null,
        label: null,
      });
    } else {
      for (const o of l.options) {
        rows.push({
          id: o.id,
          catalog_item_id: o.catalogItemId,
          included_offer_id: null,
          quantity: o.quantity,
          position: position++,
          option_group: l.group.trim(),
          option_key: o.optionKey,
          label: o.label.trim() || null,
        });
      }
    }
  }
  return rows;
}

export type ValueContext = {
  /** Le prix unitaire de chaque article, null quand il n'en a pas. */
  priceOf: (catalogItemId: string) => number | null | undefined;
  /** Les offres connues, pour suivre celles qui sont incluses. */
  offerById: (id: string) => Offer | undefined;
};

export type OfferValue = {
  totalCents: number;
  /** Les articles sans prix rencontrés — ils rendent la valeur incalculable. */
  missing: string[];
};

/**
 * La valeur catalogue d'un brouillon : la somme des prix de ses articles, en
 * suivant les offres incluses, et en ne comptant que la première option de
 * chaque groupe — celle proposée par défaut. C'est le pendant, à l'écran, de
 * la vue `offer_value`.
 */
export function offerValue(draft: OfferDraft, ctx: ValueContext, seen: Set<string> = new Set()): OfferValue {
  let totalCents = 0;
  const missing: string[] = [];
  const count = (itemId: string, quantity: number) => {
    const price = ctx.priceOf(itemId);
    if (price === null || price === undefined) missing.push(itemId);
    else totalCents += price * quantity;
  };
  for (const l of draft.lines) {
    if (l.kind === 'article') count(l.catalogItemId, l.quantity);
    else if (l.kind === 'groupe') {
      const first = l.options[0];
      if (first) count(first.catalogItemId, first.quantity);
    } else {
      if (seen.has(l.includedOfferId)) continue;
      const included = ctx.offerById(l.includedOfferId);
      if (!included) continue;
      const sub = offerValue(toDraft(included), ctx, new Set([...seen, l.includedOfferId]));
      totalCents += sub.totalCents;
      missing.push(...sub.missing);
    }
  }
  return { totalCents, missing: [...new Set(missing)] };
}

/** Vrai si `candidate` contient `target`, directement ou par ses offres incluses. */
export function offerContains(offers: Offer[], candidateId: string, targetId: string, seen: Set<string> = new Set()): boolean {
  if (seen.has(candidateId)) return false;
  const candidate = offers.find((o) => o.id === candidateId);
  if (!candidate) return false;
  for (const l of candidate.lines) {
    if (!l.includedOfferId) continue;
    if (l.includedOfferId === targetId) return true;
    if (offerContains(offers, l.includedOfferId, targetId, new Set([...seen, candidateId]))) return true;
  }
  return false;
}

/** Les offres qu'un brouillon peut inclure sans se contenir lui-même. */
export function includableOffers(offers: Offer[], draft: OfferDraft): Offer[] {
  return offers.filter((o) => {
    if (draft.id && o.id === draft.id) return false;
    if (draft.id && offerContains(offers, o.id, draft.id)) return false;
    return true;
  });
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const numOrNull = (v: unknown): number | null | undefined => (v === null ? null : isNum(v) ? v : undefined);
const strOrNull = (v: unknown): string | null | undefined => (v === null ? null : isStr(v) ? v : undefined);

/**
 * Relit un brouillon reçu du navigateur. Ce qui arrive par le réseau n'est
 * pas de confiance : chaque champ est vérifié, et la première anomalie est
 * dite en clair. Rend le brouillon nettoyé, ou le message d'erreur.
 */
export function parseDraft(raw: unknown): OfferDraft | string {
  if (!raw || typeof raw !== 'object') return 'Le brouillon est illisible.';
  const r = raw as Record<string, unknown>;
  const name = isStr(r.name) ? r.name.trim() : '';
  if (!name) return 'Le nom de l’offre est obligatoire.';
  const code = isStr(r.code) ? slugify(r.code) : '';
  if (!code) return 'Le code de l’offre est obligatoire.';
  if (!isStr(r.billing) || !BILLINGS.includes(r.billing as Billing)) return 'Choisissez une récurrence.';
  const billing = r.billing as Billing;
  const priceCents = numOrNull(r.priceCents);
  if (priceCents === undefined || (priceCents !== null && priceCents < 0)) return 'Le prix doit être un montant positif.';
  const introPriceCents = numOrNull(r.introPriceCents);
  const introPeriods = numOrNull(r.introPeriods);
  if (introPriceCents === undefined || introPeriods === undefined) return 'Le tarif d’entrée est illisible.';
  if ((introPriceCents === null) !== (introPeriods === null)) return 'Un tarif d’entrée va avec un nombre de périodes.';
  if (introPriceCents !== null && (introPriceCents < 0 || (introPeriods as number) < 1)) {
    return 'Le tarif d’entrée doit être positif et courir sur au moins une période.';
  }
  const deliveryWeeksMin = numOrNull(r.deliveryWeeksMin);
  const deliveryWeeksMax = numOrNull(r.deliveryWeeksMax);
  if (deliveryWeeksMin === undefined || deliveryWeeksMax === undefined) return 'Le délai de livraison est illisible.';
  if (deliveryWeeksMin !== null && deliveryWeeksMax !== null && deliveryWeeksMax < deliveryWeeksMin) {
    return 'Le délai maximal ne peut pas être plus court que le délai minimal.';
  }
  const freeConsultMinutes = numOrNull(r.freeConsultMinutes);
  const overageHourlyRateCents = numOrNull(r.overageHourlyRateCents);
  if (freeConsultMinutes === undefined || overageHourlyRateCents === undefined) return 'Un champ numérique est illisible.';
  if (overageHourlyRateCents !== null && overageHourlyRateCents < 0) return 'Le taux de dépassement doit être positif.';
  const recommendedOfferId = strOrNull(r.recommendedOfferId);
  if (recommendedOfferId === undefined) return 'L’offre recommandée est illisible.';
  const id = strOrNull(r.id);
  if (id === undefined) return 'L’identifiant de l’offre est illisible.';
  if (id && recommendedOfferId === id) return 'Une offre ne peut pas se recommander elle-même.';

  const strings = (v: unknown): string[] | undefined =>
    Array.isArray(v) && v.every(isStr) ? v.map((s) => s.trim()).filter(Boolean) : undefined;
  const segments = strings(r.segments);
  const benefits = strings(r.benefits);
  if (!segments || !benefits) return 'Les segments ou les bénéfices sont illisibles.';
  if (new Set(segments).size !== segments.length) return 'Un segment apparaît deux fois.';

  if (!Array.isArray(r.lines)) return 'Le contenu de l’offre est illisible.';
  const lines: DraftLine[] = [];
  for (const l of r.lines as unknown[]) {
    if (!l || typeof l !== 'object') return 'Une ligne est illisible.';
    const x = l as Record<string, unknown>;
    const lineId = strOrNull(x.id ?? null);
    if (x.kind === 'article') {
      if (!isStr(x.catalogItemId) || !x.catalogItemId) return 'Une ligne ne désigne aucun article.';
      if (!isNum(x.quantity) || x.quantity <= 0) return 'Une quantité doit être supérieure à zéro.';
      lines.push({ key: '', kind: 'article', id: lineId ?? null, catalogItemId: x.catalogItemId, quantity: x.quantity, label: isStr(x.label) ? x.label : '' });
    } else if (x.kind === 'offre') {
      if (!isStr(x.includedOfferId) || !x.includedOfferId) return 'Une ligne ne désigne aucune offre incluse.';
      if (id && x.includedOfferId === id) return 'Une offre ne peut pas s’inclure elle-même.';
      lines.push({ key: '', kind: 'offre', id: lineId ?? null, includedOfferId: x.includedOfferId });
    } else if (x.kind === 'groupe') {
      const group = isStr(x.group) ? x.group.trim() : '';
      if (!group) return 'Un groupe d’options doit porter un nom.';
      if (!Array.isArray(x.options) || x.options.length < 2) return `Le groupe « ${group} » doit proposer au moins deux options.`;
      const options: DraftOption[] = [];
      for (const o of x.options as unknown[]) {
        if (!o || typeof o !== 'object') return 'Une option est illisible.';
        const y = o as Record<string, unknown>;
        if (!isStr(y.catalogItemId) || !y.catalogItemId) return `Une option du groupe « ${group} » ne désigne aucun article.`;
        if (!isNum(y.quantity) || y.quantity <= 0) return 'Une quantité doit être supérieure à zéro.';
        const optionKey = isStr(y.optionKey) ? slugify(y.optionKey) : '';
        if (!optionKey) return `Une option du groupe « ${group} » n’a pas de clé.`;
        options.push({ key: '', id: strOrNull(y.id ?? null) ?? null, catalogItemId: y.catalogItemId, quantity: y.quantity, label: isStr(y.label) ? y.label : '', optionKey });
      }
      if (new Set(options.map((o) => o.optionKey)).size !== options.length) return `Deux options du groupe « ${group} » portent la même clé.`;
      lines.push({ key: '', kind: 'groupe', group, options });
    } else return 'Une ligne est d’une sorte inconnue.';
  }
  const groups = lines.filter((l): l is DraftLine & { kind: 'groupe' } => l.kind === 'groupe');
  if (new Set(groups.map((g) => g.group)).size !== groups.length) return 'Deux groupes d’options portent le même nom.';

  if (!Array.isArray(r.tasks)) return 'Les tâches sont illisibles.';
  const tasks: DraftTask[] = [];
  for (const t of r.tasks as unknown[]) {
    if (!t || typeof t !== 'object') return 'Une tâche est illisible.';
    const x = t as Record<string, unknown>;
    const title = isStr(x.title) ? x.title.trim() : '';
    if (!title) return 'Une tâche n’a pas de titre.';
    if (x.kind !== 'technique' && x.kind !== 'contenu') return `La tâche « ${title} » est d’une sorte inconnue.`;
    if (!isStr(x.cadence) || !CADENCES.includes(x.cadence as TaskCadence)) return `La tâche « ${title} » n’a pas de cadence.`;
    const dueDay = numOrNull(x.dueDay ?? null);
    if (dueDay === undefined || (dueDay !== null && (dueDay < 1 || dueDay > 28))) return `L’échéance de « ${title} » doit être un jour entre 1 et 28.`;
    const defaultRole = strOrNull(x.defaultRole ?? null);
    if (defaultRole === undefined || (defaultRole !== null && !TASK_ROLES.includes(defaultRole as TaskRole))) return `Le rôle de « ${title} » est inconnu.`;
    const estimateHours = numOrNull(x.estimateHours ?? null);
    if (estimateHours === undefined || (estimateHours !== null && estimateHours <= 0)) return `L’estimation de « ${title} » doit être positive.`;
    const optionGroup = strOrNull(x.optionGroup ?? null);
    const optionKey = strOrNull(x.optionKey ?? null);
    if (optionGroup === undefined || optionKey === undefined || (optionGroup === null) !== (optionKey === null)) return `L’option qui déclenche « ${title} » est illisible.`;
    if (optionGroup && !groups.some((g) => g.group === optionGroup && g.options.some((o) => o.optionKey === optionKey))) {
      return `La tâche « ${title} » dépend d’une option qui n’existe plus.`;
    }
    tasks.push({ key: '', id: strOrNull(x.id ?? null) ?? null, title, kind: x.kind, cadence: x.cadence as TaskCadence, dueDay, defaultRole: defaultRole as TaskRole | null, estimateHours, optionGroup, optionKey });
  }

  if (!Array.isArray(r.deliverables)) return 'Les livrables sont illisibles.';
  const deliverables: DraftDeliverable[] = [];
  for (const d of r.deliverables as unknown[]) {
    if (!d || typeof d !== 'object') return 'Un livrable est illisible.';
    const x = d as Record<string, unknown>;
    const dCode = isStr(x.code) ? x.code.trim() : '';
    const title = isStr(x.title) ? x.title.trim() : '';
    if (!dCode || !title) return 'Un livrable doit avoir un code et un titre.';
    const includedRounds = numOrNull(x.includedRounds ?? null);
    if (includedRounds === undefined || (includedRounds !== null && includedRounds < 0)) return `Les rondes de « ${title} » ne peuvent pas être négatives.`;
    deliverables.push({ key: '', id: strOrNull(x.id ?? null) ?? null, code: dCode, title, description: isStr(x.description) ? x.description.trim() : '', includedRounds });
  }
  if (new Set(deliverables.map((d) => d.code)).size !== deliverables.length) return 'Deux livrables portent le même code.';

  return {
    id: id ?? null,
    code,
    name,
    tagline: isStr(r.tagline) ? r.tagline.trim() : '',
    description: isStr(r.description) ? r.description.trim() : '',
    billing,
    priceCents,
    priceIsFrom: r.priceIsFrom === true,
    introPriceCents: billing === 'ponctuel' ? null : introPriceCents,
    introPeriods: billing === 'ponctuel' ? null : introPeriods,
    deliveryWeeksMin: billing === 'ponctuel' ? deliveryWeeksMin : null,
    deliveryWeeksMax: billing === 'ponctuel' ? deliveryWeeksMax : null,
    freeConsultMinutes,
    overageHourlyRateCents: billing === 'ponctuel' ? null : overageHourlyRateCents,
    isPopular: r.isPopular === true,
    active: r.active !== false,
    recommendedOfferId: recommendedOfferId || null,
    segments,
    benefits,
    lines,
    tasks,
    deliverables,
  };
}

/** « Jour 7 », « Chaque mois, jour 3 » — l'échéance relative d'une tâche, en clair. */
export function dueLabel(t: Pick<DraftTask, 'cadence' | 'dueDay'>): string {
  const day = t.dueDay ? `jour ${t.dueDay}` : 'fin de période';
  if (t.cadence === 'signature') return t.dueDay ? `Jour ${t.dueDay}` : 'Au démarrage';
  return `${CADENCE_LABEL[t.cadence]}, ${day}`;
}
