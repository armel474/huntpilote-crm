/**
 * Un signe de vie — `GET /api/sante`.
 *
 * Deux usages. Une tâche planifiée Vercel (`vercel.json`) l'appelle chaque
 * jour : la requête qu'elle fait à la base suffit à empêcher Supabase de
 * mettre le projet en pause après sept jours sans activité (forfait
 * gratuit). Et n'importe qui peut l'ouvrir pour savoir si la base répond.
 *
 * Elle ne révèle rien : la lecture passe par le client anonyme, sous RLS,
 * et seul le fait que la base ait répondu est rendu.
 */
import { NextResponse } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const at = new Date().toISOString();
  if (!supabaseConfigured()) return NextResponse.json({ ok: true, base: 'non configurée', at });
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('agency').select('id', { count: 'exact', head: true });
    if (error) return NextResponse.json({ ok: false, base: 'erreur', detail: error.message, at }, { status: 503 });
    return NextResponse.json({ ok: true, base: 'jointe', at });
  } catch (e) {
    return NextResponse.json({ ok: false, base: 'injoignable', detail: e instanceof Error ? e.message : String(e), at }, { status: 503 });
  }
}
