'use server';

/**
 * Ce que le pipeline écrit dans la base : le changement d'étape, la
 * victoire, la perte, l'échange consigné.
 *
 * Chaque action passe par le client de la requête, donc par les politiques
 * RLS de la personne connectée. Un `update` refusé ne lève pas : il ne
 * touche aucune ligne. On lit ce qui revient, et zéro ligne veut dire « pas
 * le droit » — ou un deal qui n'existe plus.
 */
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { STAGE_PROBABILITY, type ExchangeChannel, type StageId } from '@/lib/data/pipeline';
import { createClient } from '@/lib/supabase/server';

export type PipelineResult = { ok: true } | { ok: false; message: string };

const today = () => new Date().toISOString().slice(0, 10);

async function memberSession() {
  const session = await getSession();
  if (!session || session.kind !== 'membre') return null;
  return session;
}

/** Une carte glissée vers une autre étape : « Gagné » passe par la victoire, avec ses effets. */
export async function moveDeal(id: string, stage: StageId): Promise<PipelineResult> {
  if (stage === 'gagne') return winDeal(id);
  const session = await memberSession();
  if (!session) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deal')
    .update({ stage, stage_since: today(), probability: STAGE_PROBABILITY[stage], won_at: null })
    .eq('id', id)
    .select('id');
  if (error) return { ok: false, message: error.message };
  if (!data?.length) return { ok: false, message: 'Ce deal n’a pas pu être déplacé.' };
  revalidatePath('/pipeline');
  return { ok: true };
}

/**
 * « Marquer gagné » : le deal passe à l'étape finale et le prospect devient
 * client — c'est la conséquence annoncée avant confirmation. L'onboarding
 * et le premier audit viendront avec leurs propres écrans.
 */
export async function winDeal(id: string): Promise<PipelineResult> {
  const session = await memberSession();
  if (!session) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('deal')
    .update({ stage: 'gagne', won_at: now, stage_since: today(), probability: 100, next_action: 'Onboarding lancé' })
    .eq('id', id)
    .select('id, client_id');
  if (error) return { ok: false, message: error.message };
  const deal = data?.[0];
  if (!deal) return { ok: false, message: 'Ce deal n’a pas pu être marqué gagné.' };

  const { error: clientError } = await supabase
    .from('client')
    .update({ type: 'client', since: today() })
    .eq('id', deal.client_id)
    .eq('type', 'prospect');
  if (clientError) return { ok: false, message: clientError.message };

  revalidatePath('/pipeline');
  revalidatePath('/clients');
  return { ok: true };
}

/** « Marquer perdu » : le motif est obligatoire, c'est lui qui déclenche la purge de l'instantané (règle 3). */
export async function loseDeal(id: string, reason: string, note: string): Promise<PipelineResult> {
  const session = await memberSession();
  if (!session) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  const motif = reason.trim();
  if (!motif) return { ok: false, message: 'Le motif de la perte est obligatoire.' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deal')
    .update({
      stage: 'perdu',
      lost_at: new Date().toISOString(),
      lost_reason: motif,
      lost_note: note.trim() || null,
      probability: 0,
      stage_since: today(),
    })
    .eq('id', id)
    .select('id');
  if (error) return { ok: false, message: error.message };
  if (!data?.length) return { ok: false, message: 'Ce deal n’a pas pu être marqué perdu.' };
  revalidatePath('/pipeline');
  return { ok: true };
}

/** Un échange consigné depuis le panneau : une ligne du fil de communications du compte, jamais visible du client. */
export async function logExchange(
  clientId: string,
  channel: ExchangeChannel,
  text: string,
): Promise<PipelineResult> {
  const session = await memberSession();
  if (!session) return { ok: false, message: 'Connectez-vous avec un compte de l’agence.' };
  const body = text.trim();
  if (!body) return { ok: false, message: 'Rien à consigner.' };

  const supabase = await createClient();
  const { error } = await supabase.from('communication').insert({
    agency_id: session.agencyId,
    client_id: clientId,
    channel,
    direction: 'out',
    body,
    author_id: session.memberId,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/pipeline');
  return { ok: true };
}
