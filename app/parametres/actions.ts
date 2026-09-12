'use server';

/**
 * Ce que l'onglet Agence écrit dans la base : le profil de l'agence, les
 * invitations, les profils et les droits des membres.
 *
 * Chaque action passe par le client de la requête, donc par les politiques
 * RLS de la personne connectée. Quand une politique refuse, PostgREST ne lève
 * pas d'erreur sur un `update` : il ne touche aucune ligne. On lit donc ce qui
 * revient, et zéro ligne veut dire « pas le droit ».
 */
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/format';
import type { Permission, Role } from '@/lib/queries/agence';
import { createClient } from '@/lib/supabase/server';

export type ActionState = { ok: boolean; message: string; at: number } | null;

const ROLES: Role[] = ['admin', 'chef_projet', 'specialiste_seo', 'redacteur'];

const fail = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
const done = (message: string): ActionState => ({ ok: true, message, at: Date.now() });

/** Un champ texte, vide devient null. */
function text(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t === '' ? null : t;
}

/** Ce que la base répond, dit en français. */
function explain(code: string | undefined, fallback: string): string {
  switch (code) {
    case '23505':
      return 'Un membre porte déjà ce courriel.';
    case '42501':
      return 'Vous n’avez pas ce droit.';
    case '23514':
      return 'Une valeur ne respecte pas les règles : vérifiez les champs.';
    default:
      return fallback;
  }
}

function initialsOf(first: string | null, last: string | null): string {
  const a = (first ?? '').trim();
  const b = (last ?? '').trim();
  const s = a && b ? `${a[0]}${b[0]}` : (a || b).slice(0, 2);
  return s.toUpperCase() || '??';
}

async function memberSession() {
  const session = await getSession();
  if (!session || session.kind !== 'membre' || !session.memberId) return null;
  return session;
}

export async function saveAgencyProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');
  const name = text(fd, 'name');
  if (!name) return fail('Le nom de l’agence est obligatoire.');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agency')
    .update({
      name,
      legal_name: text(fd, 'legal_name'),
      website: text(fd, 'website'),
      email: text(fd, 'email'),
      phone: text(fd, 'phone'),
      address: text(fd, 'address'),
      city: text(fd, 'city'),
      province: text(fd, 'province'),
      postal_code: text(fd, 'postal_code'),
      gst_number: text(fd, 'gst_number'),
      qst_number: text(fd, 'qst_number'),
    })
    .eq('id', session.agencyId)
    .select('id');

  if (error) return fail(explain(error.code, 'Le profil n’a pas pu être enregistré.'));
  if (!data?.length) return fail('Vous n’avez pas le droit de modifier le profil de l’agence.');
  revalidatePath('/parametres');
  return done('Profil enregistré.');
}

export async function inviteMember(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');

  const first = text(fd, 'first_name');
  const last = text(fd, 'last_name');
  const email = text(fd, 'email')?.toLowerCase() ?? null;
  const role = text(fd, 'role') as Role | null;
  if (!first && !last) return fail('Un prénom ou un nom est nécessaire.');
  if (!email || !email.includes('@')) return fail('Le courriel sert à rattacher la personne à son compte : il est obligatoire.');
  if (!role || !ROLES.includes(role)) return fail('Choisissez un rôle.');

  const supabase = await createClient();
  const { error } = await supabase.from('agency_member').insert({
    agency_id: session.agencyId,
    role,
    initials: initialsOf(first, last),
    first_name: first,
    last_name: last,
    email,
    job_title: text(fd, 'job_title'),
    phone: text(fd, 'phone'),
    invited_at: new Date().toISOString(),
  });

  if (error) return fail(explain(error.code, 'L’invitation n’a pas pu être créée.'));
  revalidatePath('/parametres');
  return done(`${[first, last].filter(Boolean).join(' ')} fait partie de l’équipe. Son compte se rattachera à sa première connexion avec ${email}.`);
}

export async function updateMember(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await memberSession();
  if (!session) return fail('Connectez-vous avec un compte de l’agence.');
  const memberId = text(fd, 'member_id');
  if (!memberId) return fail('Membre inconnu.');

  const first = text(fd, 'first_name');
  const last = text(fd, 'last_name');
  if (!first && !last) return fail('Un prénom ou un nom est nécessaire.');

  const supabase = await createClient();

  // Ce que tout le monde peut corriger sur sa propre ligne.
  const identity = {
    first_name: first,
    last_name: last,
    initials: initialsOf(first, last),
    phone: text(fd, 'phone'),
    address: text(fd, 'address'),
    city: text(fd, 'city'),
    province: text(fd, 'province'),
    postal_code: text(fd, 'postal_code'),
    avatar_url: text(fd, 'avatar_url'),
  };

  // Ce qui engage l'agence, réservé à la gestion d'équipe. Le formulaire ne
  // l'envoie que dans ce cas ; la base le vérifie de son côté.
  const managing = fd.get('manage') === '1';
  let engagement = {};
  if (managing) {
    const role = text(fd, 'role') as Role | null;
    if (!role || !ROLES.includes(role)) return fail('Choisissez un rôle.');
    const rate = text(fd, 'hourly_rate');
    const rateCents = rate === null ? null : Math.round(Number(rate.replace(',', '.')) * 100);
    if (rateCents !== null && (!Number.isFinite(rateCents) || rateCents < 0)) {
      return fail('Le taux horaire doit être un montant positif.');
    }
    if (memberId === session.memberId && fd.get('active') !== '1') {
      return fail('Vous ne pouvez pas désactiver votre propre compte.');
    }
    engagement = {
      role,
      job_title: text(fd, 'job_title'),
      started_on: text(fd, 'started_on'),
      hourly_rate_cents: rateCents,
      active: fd.get('active') === '1',
    };
  }

  const { data, error } = await supabase
    .from('agency_member')
    .update({ ...identity, ...engagement })
    .eq('id', memberId)
    .select('id, role');
  if (error) return fail(explain(error.code, 'Le profil n’a pas pu être enregistré.'));
  if (!data?.length) return fail('Vous n’avez pas le droit de modifier ce profil.');

  if (managing) {
    const wanted = new Set(fd.getAll('permission').filter((p): p is Permission => typeof p === 'string'));
    if (memberId === session.memberId && !wanted.has('manage_team')) {
      return fail('Vous ne pouvez pas vous retirer la gestion de l’équipe : personne d’autre ne pourrait vous la rendre.');
    }
    const { data: defaults } = await supabase.from('role_permission').select('permission').eq('role', data[0].role);
    const byRole = new Set((defaults ?? []).map((d) => d.permission));

    const toDelete: Permission[] = [];
    const toUpsert: { member_id: string; permission: Permission; granted: boolean }[] = [];
    for (const p of PERMISSIONS) {
      const want = wanted.has(p);
      if (want === byRole.has(p)) toDelete.push(p);
      else toUpsert.push({ member_id: memberId, permission: p, granted: want });
    }
    if (toDelete.length) {
      const { error: e } = await supabase
        .from('member_permission')
        .delete()
        .eq('member_id', memberId)
        .in('permission', toDelete);
      if (e) return fail(explain(e.code, 'Les droits n’ont pas pu être enregistrés.'));
    }
    if (toUpsert.length) {
      const { error: e } = await supabase
        .from('member_permission')
        .upsert(toUpsert, { onConflict: 'member_id,permission' });
      if (e) return fail(explain(e.code, 'Les droits n’ont pas pu être enregistrés.'));
    }
  }

  revalidatePath('/parametres');
  return done('Profil enregistré.');
}
