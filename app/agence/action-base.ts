/**
 * Ce que les actions serveur de l'Agence hub partagent : la garde de session,
 * le résultat rendu au formulaire, la traduction des codes d'erreur de la
 * base. Pas une action en soi — un module ordinaire que les fichiers
 * `'use server'` importent.
 */
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/supabase/config';

export type ActionState = { ok: boolean; message: string; at: number } | null;

export const fail = (message: string): ActionState => ({ ok: false, message, at: Date.now() });
export const done = (message: string): ActionState => ({ ok: true, message, at: Date.now() });

/** Un champ texte, vide devient null. */
export function text(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t === '' ? null : t;
}

/** Un montant en dollars saisi à l'écran, rendu en cents ; null si vide, undefined s'il est illisible. */
export function cents(raw: string | null): number | null | undefined {
  if (raw === null) return null;
  const n = Math.round(Number(raw.replace(/\s/g, '').replace(',', '.')) * 100);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Ce que la base répond, dit en français. */
export function explain(code: string | undefined, fallback: string): string {
  switch (code) {
    case '23505':
      return 'Ce code est déjà pris : choisissez-en un autre.';
    case '42501':
      return 'Vous n’avez pas ce droit.';
    case '23514':
      return 'Une valeur ne respecte pas les règles du catalogue : vérifiez la récurrence et les montants.';
    case '23503':
      return 'Une ligne renvoie à un article ou une offre qui n’existe plus.';
    case 'P0001':
      return 'Cette offre est déjà contenue dans celle que vous voulez y inclure : le catalogue tournerait en rond.';
    default:
      return fallback;
  }
}

/** La session d'un membre, ou null : sans base configurée ou sans membre, aucune action n'écrit. */
export async function memberSession() {
  if (!supabaseConfigured()) return null;
  const session = await getSession();
  if (!session || session.kind !== 'membre' || !session.memberId) return null;
  return session;
}

/** L'Agence hub et l'ancien écran lisent les mêmes lignes : les deux se rafraîchissent. */
export function revalidateAgency() {
  for (const path of ['/agence', '/parametres']) revalidatePath(path);
}
