'use server';

/**
 * Ce que le Catalogue et le constructeur d'offres écrivent dans la base
 * (session 9.2) : les articles, leur ordre, et une offre entière — sa ligne,
 * son contenu, ses segments, ses bénéfices, les tâches qu'elle engage et les
 * livrables qu'elle promet.
 *
 * Tout passe par le client de la requête, donc par les politiques RLS de la
 * personne connectée : sans « Gérer le catalogue », la base refuse. Un
 * `update` refusé ne lève pas, il ne touche aucune ligne ; on lit ce qui
 * revient et zéro ligne veut dire « pas le droit ».
 *
 * Une offre s'enregistre en plusieurs requêtes — PostgREST n'offre pas de
 * transaction. Les tâches et les livrables se rapprochent par identifiant
 * (modifier, ajouter, retirer) plutôt que d'être effacés puis recréés : une
 * tâche déjà engendrée chez un client garde son modèle, et le mois prochain
 * n'en produit pas une deuxième. Si une écriture échoue en route, le message
 * dit laquelle, et la page recharge ce qui est réellement enregistré.
 */
import { cents, done, explain, fail, memberSession, revalidateAgency, text, type ActionState } from '@/app/agence/action-base';
import { linesToRows, parseDraft, slugify } from '@/lib/data/offres';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

const KINDS = ['produit', 'service'] as const;
const BILLINGS = ['ponctuel', 'mensuel', 'trimestriel', 'annuel'] as const;
type Kind = (typeof KINDS)[number];
type Billing = (typeof BILLINGS)[number];

/** Créer un article, ou en modifier un : nom, code, sorte, récurrence, unité, prix, description, actif. */
export async function saveCatalogItem(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');

  const name = text(fd, 'name');
  if (!name) return fail('Le nom de l’article est obligatoire.');
  const code = slugify(text(fd, 'code') ?? name);
  if (!code) return fail('Le code de l’article est obligatoire.');
  const kind = text(fd, 'kind') as Kind | null;
  if (!kind || !KINDS.includes(kind)) return fail('Choisissez une sorte : produit ou service.');
  // Un produit se vend une fois ; un service se reconduit. La base le refuse
  // autrement, l'écran l'empêche avant : ici on ne laisse rien passer.
  const billing = kind === 'produit' ? 'ponctuel' : (text(fd, 'billing') as Billing | null);
  if (!billing || !BILLINGS.includes(billing)) return fail('Choisissez une récurrence.');
  if (kind === 'service' && billing === 'ponctuel') {
    return fail('Un service se reconduit : choisissez mensuel, trimestriel ou annuel, ou faites-en un produit.');
  }
  const priceCents = cents(text(fd, 'price'));
  if (priceCents === undefined) return fail('Le prix unitaire doit être un montant positif, ou rester vide.');

  const row = {
    name,
    code,
    kind,
    billing,
    unit: text(fd, 'unit'),
    price_cents: priceCents,
    description: text(fd, 'description'),
    active: fd.get('active') === '1',
  };

  const supabase = await createClient();
  const itemId = text(fd, 'item_id');
  if (itemId) {
    const { data, error } = await supabase.from('catalog_item').update(row).eq('id', itemId).select('id');
    if (error) return fail(explain(error.code, 'L’article n’a pas pu être enregistré.'));
    if (!data?.length) return fail('Vous n’avez pas le droit de modifier le catalogue.');
  } else {
    const position = Number(text(fd, 'position') ?? '0');
    const { error } = await supabase
      .from('catalog_item')
      .insert({ ...row, agency_id: session.agencyId, position: Number.isFinite(position) ? position : 0 });
    if (error) return fail(explain(error.code, 'L’article n’a pas pu être créé.'));
  }
  revalidateAgency();
  return done(itemId ? 'Article enregistré.' : 'Article ajouté au catalogue.');
}

/** Le nouvel ordre d'un tableau d'articles : les identifiants, dans l'ordre voulu. */
export async function reorderCatalogItems(ids: string[]): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) return fail('Ordre illisible.');

  const supabase = await createClient();
  const results = await Promise.all(
    ids.map((id, i) => supabase.from('catalog_item').update({ position: i + 1 }).eq('id', id).select('id')),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return fail(explain(failed.error.code, 'L’ordre n’a pas pu être enregistré.'));
  if (results.some((r) => !r.data?.length)) return fail('Vous n’avez pas le droit de réordonner le catalogue.');
  revalidateAgency();
  return done('Ordre enregistré.');
}

/** Activer ou retirer une offre depuis la liste, sans ouvrir la page. */
export async function setOfferActive(id: string, active: boolean): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');
  if (typeof id !== 'string' || !id) return fail('Offre inconnue.');

  const supabase = await createClient();
  const { data, error } = await supabase.from('offer').update({ active: active === true }).eq('id', id).select('id');
  if (error) return fail(explain(error.code, 'L’offre n’a pas pu être modifiée.'));
  if (!data?.length) return fail('Vous n’avez pas le droit de modifier les offres.');
  revalidateAgency();
  return done(active ? 'Offre activée.' : 'Offre retirée de la vente. Les abonnements en cours continuent.');
}

type Db = Awaited<ReturnType<typeof createClient>>;

/**
 * Le même rapprochement sert trois tables filles : le client typé n'accepte
 * pas une table choisie à l'exécution, alors on lui parle sans son typage.
 * Les colonnes écrites viennent de `draft`, déjà validé par `parseDraft`.
 */
const loose = (db: Db) => db as unknown as SupabaseClient;

/**
 * Rapproche les lignes d'une table fille de ce que le brouillon contient :
 * retire ce qui a disparu, modifie ce qui existe, ajoute le reste. Rend le
 * message d'erreur de la première écriture refusée, ou null.
 */
async function syncChildren(
  db: Db,
  table: 'offer_line' | 'offer_task_template' | 'offer_deliverable_template',
  offerId: string,
  rows: ({ id: string | null } & Record<string, unknown>)[],
  label: string,
): Promise<string | null> {
  const existing = await loose(db).from(table).select('id').eq('offer_id', offerId);
  if (existing.error) return explain(existing.error.code, `${label} n’ont pas pu être relus.`);
  const known = new Set((existing.data ?? []).map((r) => r.id as string));
  const keep = new Set(rows.map((r) => r.id).filter((id): id is string => !!id && known.has(id)));
  const gone = [...known].filter((id) => !keep.has(id));

  // Retirer d'abord : une ligne qui change d'article ne doit pas buter sur
  // celle qu'on retire au même moment.
  if (gone.length) {
    const { error } = await loose(db).from(table).delete().eq('offer_id', offerId).in('id', gone);
    if (error) return explain(error.code, `${label} n’ont pas pu être retirés.`);
  }
  for (const row of rows) {
    const { id, ...values } = row;
    if (id && keep.has(id)) {
      const { data, error } = await loose(db).from(table).update(values).eq('id', id).select('id');
      if (error) return explain(error.code, `${label} n’ont pas pu être modifiés.`);
      if (!data?.length) return `Vous n’avez pas le droit de modifier ${label.toLowerCase()}.`;
    } else {
      const { error } = await loose(db).from(table).insert({ ...values, offer_id: offerId });
      if (error) return explain(error.code, `${label} n’ont pas pu être ajoutés.`);
    }
  }
  return null;
}

/** Remplace en bloc une table fille sans dépendance (segments, bénéfices). */
async function replaceChildren(
  db: Db,
  table: 'offer_segment' | 'offer_benefit',
  offerId: string,
  rows: { label: string; position: number }[],
  label: string,
): Promise<string | null> {
  const { error: e1 } = await db.from(table).delete().eq('offer_id', offerId);
  if (e1) return explain(e1.code, `${label} n’ont pas pu être remplacés.`);
  if (rows.length) {
    const { error: e2 } = await db.from(table).insert(rows.map((r) => ({ ...r, offer_id: offerId })));
    if (e2) return explain(e2.code, `${label} n’ont pas pu être enregistrés.`);
  }
  return null;
}

/**
 * Enregistre une offre entière depuis le brouillon du constructeur, passé en
 * JSON dans le champ `payload`. Une offre nouvelle est créée d'abord ; ses
 * lignes, segments, bénéfices, tâches et livrables suivent.
 */
export async function saveOffer(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');

  let raw: unknown;
  try {
    raw = JSON.parse(text(fd, 'payload') ?? '');
  } catch {
    return fail('Le brouillon n’a pas pu être lu. Rechargez la page et réessayez.');
  }
  const draft = parseDraft(raw);
  if (typeof draft === 'string') return fail(draft);

  const supabase = await createClient();
  const offerRow = {
    code: draft.code,
    name: draft.name,
    tagline: draft.tagline || null,
    description: draft.description || null,
    billing: draft.billing,
    price_cents: draft.priceCents,
    price_is_from: draft.priceIsFrom,
    intro_price_cents: draft.introPriceCents,
    intro_periods: draft.introPeriods,
    delivery_weeks_min: draft.deliveryWeeksMin,
    delivery_weeks_max: draft.deliveryWeeksMax,
    free_consult_minutes: draft.freeConsultMinutes,
    overage_hourly_rate_cents: draft.overageHourlyRateCents,
    is_popular: draft.isPopular,
    active: draft.active,
    recommended_offer_id: draft.recommendedOfferId,
  };

  let offerId = draft.id;
  if (offerId) {
    const { data, error } = await supabase.from('offer').update(offerRow).eq('id', offerId).select('id');
    if (error) return fail(explain(error.code, 'L’offre n’a pas pu être enregistrée.'));
    if (!data?.length) return fail('Vous n’avez pas le droit de modifier les offres.');
  } else {
    const position = Number(text(fd, 'position') ?? '0');
    const { data, error } = await supabase
      .from('offer')
      .insert({ ...offerRow, agency_id: session.agencyId, position: Number.isFinite(position) ? position : 0 })
      .select('id')
      .single();
    if (error || !data) return fail(explain(error?.code, 'L’offre n’a pas pu être créée.'));
    offerId = data.id;
  }

  const partial = (what: string) =>
    fail(`L’offre est enregistrée, mais ${what} La page recharge ce qui a réellement été retenu : vérifiez et reprenez.`);

  // Le contenu, avant les tâches : une tâche peut désigner une option.
  let err = await syncChildren(supabase, 'offer_line', offerId, linesToRows(draft.lines), 'Les lignes');
  if (err) {
    revalidateAgency();
    return partial(`son contenu ne l’est pas entièrement : ${err}`);
  }
  err = await replaceChildren(
    supabase,
    'offer_segment',
    offerId,
    draft.segments.map((label, i) => ({ label, position: i + 1 })),
    'Les segments',
  );
  if (err) {
    revalidateAgency();
    return partial(`ses segments ne le sont pas : ${err}`);
  }
  err = await replaceChildren(
    supabase,
    'offer_benefit',
    offerId,
    draft.benefits.map((label, i) => ({ label, position: i + 1 })),
    'Les bénéfices',
  );
  if (err) {
    revalidateAgency();
    return partial(`ses bénéfices ne le sont pas : ${err}`);
  }
  err = await syncChildren(
    supabase,
    'offer_task_template',
    offerId,
    draft.tasks.map((t, i) => ({
      id: t.id,
      title: t.title,
      kind: t.kind,
      cadence: t.cadence,
      due_day: t.dueDay,
      default_role: t.defaultRole,
      estimate_hours: t.estimateHours,
      option_group: t.optionGroup,
      option_key: t.optionKey,
      position: i + 1,
    })),
    'Les tâches',
  );
  if (err) {
    revalidateAgency();
    return partial(`les tâches qu’elle engage ne le sont pas entièrement : ${err}`);
  }
  err = await syncChildren(
    supabase,
    'offer_deliverable_template',
    offerId,
    draft.deliverables.map((d, i) => ({
      id: d.id,
      code: d.code,
      title: d.title,
      description: d.description || null,
      included_rounds: d.includedRounds,
      position: i + 1,
    })),
    'Les livrables',
  );
  if (err) {
    revalidateAgency();
    return partial(`les livrables qu’elle promet ne le sont pas entièrement : ${err}`);
  }

  revalidateAgency();
  return done(draft.id ? 'Offre enregistrée.' : 'Offre créée.');
}
