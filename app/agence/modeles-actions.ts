'use server';

/**
 * Ce que la section « Modèles de documents » écrit dans la base (session
 * 9.3) : un modèle — réglages, textes courts, corps HTML, sections — ou le
 * choix du modèle par défaut d'une sorte, ou un modèle nouveau, vierge ou
 * copié d'un autre.
 *
 * Tout passe par le client de la requête, sous RLS : sans « Gérer le
 * catalogue », la base refuse et zéro ligne revient. Enregistrer un modèle
 * ne touche aucun document déjà produit : les documents gardent leur rendu.
 */
import { done, explain, fail, memberSession, revalidateAgency, text, type ActionState } from '@/app/agence/action-base';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type DocKind = Database['public']['Enums']['document_kind'];
const KINDS: DocKind[] = ['proposition', 'devis', 'contrat', 'annexe', 'avenant', 'facture'];

type SectionInput = {
  id: string | null;
  key: string;
  title: string;
  defaultBody: string;
  optional: boolean;
  aiAssist: boolean;
  lockedByAgency: boolean;
  maxChars: number | null;
};

/** Relit les sections envoyées par l'éditeur. Rend la liste nettoyée, ou le message d'erreur. */
function parseSections(raw: string | null): SectionInput[] | string {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return 'Les sections n’ont pas pu être lues. Rechargez la page et réessayez.';
  }
  if (!Array.isArray(parsed)) return 'Les sections sont illisibles.';
  const out: SectionInput[] = [];
  for (const s of parsed as unknown[]) {
    if (!s || typeof s !== 'object') return 'Une section est illisible.';
    const x = s as Record<string, unknown>;
    const key = typeof x.key === 'string' ? x.key.trim() : '';
    if (!/^[a-z][a-z0-9_]*$/.test(key)) return `La clé « ${key || '(vide)'} » d’une section doit être en minuscules, sans espace ni accent.`;
    const title = typeof x.title === 'string' ? x.title.trim() : '';
    if (!title) return `La section « ${key} » n’a pas de titre.`;
    const maxChars = x.maxChars === null || x.maxChars === undefined || x.maxChars === '' ? null : Number(x.maxChars);
    if (maxChars !== null && (!Number.isFinite(maxChars) || maxChars <= 0)) return `La longueur de « ${title} » doit être un nombre positif.`;
    const locked = x.lockedByAgency === true;
    out.push({
      id: typeof x.id === 'string' && x.id ? x.id : null,
      key,
      title,
      defaultBody: typeof x.defaultBody === 'string' ? x.defaultBody : '',
      optional: x.optional === true,
      // Une clause verrouillée n'est pas un endroit où l'IA écrit : la base le refuse, on l'applique avant.
      aiAssist: locked ? false : x.aiAssist !== false,
      lockedByAgency: locked,
      maxChars,
    });
  }
  if (new Set(out.map((s) => s.key)).size !== out.length) return 'Deux sections portent la même clé.';
  return out;
}

/** Enregistrer un modèle : réglages, textes, corps, sections. */
export async function saveTemplate(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');
  const id = text(fd, 'template_id');
  if (!id) return fail('Modèle inconnu.');
  const name = text(fd, 'name');
  if (!name) return fail('Le nom du modèle est obligatoire.');
  const padding = Number(text(fd, 'number_padding') ?? '3');
  if (!Number.isInteger(padding) || padding < 1 || padding > 8) return fail('La largeur du numéro va de 1 à 8 chiffres.');
  const terms = Number(text(fd, 'payment_terms_days') ?? '0');
  if (!Number.isInteger(terms) || terms < 0) return fail('Le délai de paiement est un nombre de jours, zéro ou plus.');
  const sections = parseSections(text(fd, 'sections'));
  if (typeof sections === 'string') return fail(sections);
  const body = fd.get('body_html');
  const bodyHtml = typeof body === 'string' && body.trim() ? body : null;
  const isDefault = fd.get('is_default') === '1';

  const supabase = await createClient();

  // Un seul modèle par défaut par sorte : l'index unique le garantit, et il
  // faut donc retirer l'ancien avant de poser le nouveau.
  if (isDefault) {
    const current = await supabase.from('document_template').select('kind').eq('id', id).maybeSingle();
    if (current.error || !current.data) return fail('Modèle introuvable.');
    const { error } = await supabase
      .from('document_template')
      .update({ is_default: false })
      .eq('agency_id', session.agencyId)
      .eq('kind', current.data.kind)
      .eq('is_default', true)
      .neq('id', id);
    if (error) return fail(explain(error.code, 'Le modèle par défaut n’a pas pu être changé.'));
  }

  const { data, error } = await supabase
    .from('document_template')
    .update({
      name,
      prefix: text(fd, 'prefix')?.toUpperCase() ?? null,
      include_year: fd.get('include_year') === '1',
      number_padding: padding,
      payment_terms_days: terms,
      is_default: isDefault,
      intro: text(fd, 'intro'),
      legal_mentions: text(fd, 'legal_mentions'),
      footer: text(fd, 'footer'),
      payment_instructions: text(fd, 'payment_instructions'),
      body_html: bodyHtml,
    })
    .eq('id', id)
    .select('id');
  if (error) return fail(explain(error.code, 'Le modèle n’a pas pu être enregistré.'));
  if (!data?.length) return fail('Vous n’avez pas le droit de modifier les modèles de documents.');

  // Les sections, rapprochées par identifiant : modifier, retirer, ajouter.
  const existing = await supabase.from('document_template_section').select('id').eq('template_id', id);
  if (existing.error) {
    revalidateAgency();
    return fail('Le modèle est enregistré, mais ses sections n’ont pas pu être relues. Rechargez la page.');
  }
  const known = new Set((existing.data ?? []).map((s) => s.id));
  const keep = new Set(sections.map((s) => s.id).filter((x): x is string => !!x && known.has(x)));
  const gone = [...known].filter((x) => !keep.has(x));
  if (gone.length) {
    const { error: e } = await supabase.from('document_template_section').delete().eq('template_id', id).in('id', gone);
    if (e) {
      revalidateAgency();
      return fail(`Le modèle est enregistré, mais des sections n’ont pas pu être retirées : ${explain(e.code, e.message)}`);
    }
  }
  for (const [i, s] of sections.entries()) {
    const row = {
      key: s.key,
      title: s.title,
      position: i + 1,
      default_body: s.defaultBody || null,
      optional: s.optional,
      ai_assist: s.aiAssist,
      locked_by_agency: s.lockedByAgency,
      max_chars: s.maxChars,
    };
    const result = s.id && keep.has(s.id)
      ? await supabase.from('document_template_section').update(row).eq('id', s.id).select('id')
      : await supabase.from('document_template_section').insert({ ...row, template_id: id }).select('id');
    if (result.error) {
      revalidateAgency();
      return fail(`Le modèle est enregistré, mais la section « ${s.title} » ne l’est pas : ${explain(result.error.code, result.error.message)}`);
    }
  }

  revalidateAgency();
  return done('Modèle enregistré. Les documents déjà produits gardent leur rendu.');
}

/** Rendre un modèle « par défaut » pour sa sorte, depuis la liste. */
export async function setDefaultTemplate(id: string): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');
  if (typeof id !== 'string' || !id) return fail('Modèle inconnu.');
  const supabase = await createClient();
  const current = await supabase.from('document_template').select('kind').eq('id', id).maybeSingle();
  if (current.error || !current.data) return fail('Modèle introuvable.');
  const off = await supabase
    .from('document_template')
    .update({ is_default: false })
    .eq('agency_id', session.agencyId)
    .eq('kind', current.data.kind)
    .eq('is_default', true)
    .neq('id', id)
    .select('id');
  if (off.error) return fail(explain(off.error.code, 'Le modèle par défaut n’a pas pu être changé.'));
  const { data, error } = await supabase.from('document_template').update({ is_default: true }).eq('id', id).select('id');
  if (error) return fail(explain(error.code, 'Le modèle par défaut n’a pas pu être changé.'));
  if (!data?.length) return fail('Vous n’avez pas le droit de modifier les modèles de documents.');
  revalidateAgency();
  return done('Ce modèle servira par défaut pour cette sorte de document.');
}

export type CreateResult = { ok: true; id: string; message: string } | { ok: false; message: string };

/** Créer un modèle d'une sorte, vierge ou copié d'un modèle existant — sections comprises. */
export async function createTemplate(kind: string, fromId: string | null): Promise<CreateResult> {
  const session = await memberSession();
  if (!session) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  if (!KINDS.includes(kind as DocKind)) return { ok: false, message: 'Choisissez une sorte de document.' };
  const supabase = await createClient();

  const siblings = await supabase.from('document_template').select('id, is_default').eq('kind', kind as DocKind);
  const hasDefault = (siblings.data ?? []).some((t) => t.is_default);

  let base: Database['public']['Tables']['document_template']['Row'] | null = null;
  if (fromId) {
    const from = await supabase.from('document_template').select('*').eq('id', fromId).maybeSingle();
    if (from.error || !from.data) return { ok: false, message: 'Le modèle à copier est introuvable.' };
    if (from.data.kind !== kind) return { ok: false, message: 'On ne copie qu’un modèle de la même sorte.' };
    base = from.data;
  }
  const { data, error } = await supabase
    .from('document_template')
    .insert({
      agency_id: session.agencyId,
      kind: kind as DocKind,
      name: base ? `${base.name} (copie)` : 'Nouveau modèle',
      is_default: !hasDefault,
      prefix: base?.prefix ?? kind.slice(0, 2).toUpperCase(),
      include_year: base?.include_year ?? true,
      number_padding: base?.number_padding ?? 3,
      payment_terms_days: base?.payment_terms_days ?? 30,
      intro: base?.intro ?? null,
      legal_mentions: base?.legal_mentions ?? null,
      footer: base?.footer ?? null,
      payment_instructions: base?.payment_instructions ?? null,
      body_html: base?.body_html ?? null,
    })
    .select('id')
    .single();
  if (error || !data) return { ok: false, message: explain(error?.code, 'Le modèle n’a pas pu être créé.') };

  if (base) {
    const sections = await supabase.from('document_template_section').select('*').eq('template_id', base.id);
    if (sections.data?.length) {
      const { error: e } = await supabase.from('document_template_section').insert(
        sections.data.map((s) => ({
          template_id: data.id,
          key: s.key,
          title: s.title,
          position: s.position,
          default_body: s.default_body,
          optional: s.optional,
          ai_assist: s.ai_assist,
          locked_by_agency: s.locked_by_agency,
          max_chars: s.max_chars,
        })),
      );
      if (e) {
        revalidateAgency();
        return { ok: true, id: data.id, message: `Modèle créé, mais ses sections n’ont pas été copiées : ${explain(e.code, e.message)}` };
      }
    }
  }
  revalidateAgency();
  return { ok: true, id: data.id, message: base ? 'Copie créée.' : 'Modèle créé.' };
}
