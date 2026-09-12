/**
 * Le plan de travail lu dans la base — les tâches ouvertes de l'agence,
 * mises à la forme que l'écran attend déjà (`TaskSummary`).
 *
 * Tout ce que le fichier de démonstration figeait se calcule ici : le groupe
 * d'échéance, les jours de retard, l'effort restant.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { TacheBucket, TaskRowStatus, TaskSummary } from '@/lib/data/plan-travail';

type Db = SupabaseClient<Database>;

const fmtDue = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short' });

function bucketFor(due: Date | null, today: Date): { bucket: TacheBucket; overdueDays?: number } {
  if (!due) return { bucket: 'plustard' };
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return { bucket: 'retard', overdueDays: -days };
  if (days === 0) return { bucket: 'aujourdhui' };
  if (days <= 7) return { bucket: 'semaine' };
  return { bucket: 'plustard' };
}

const STATUS: Record<Database['public']['Enums']['task_status'], TaskRowStatus> = {
  afaire: 'afaire',
  encours: 'encours',
  bloquee: 'bloquee',
  terminee: 'termine',
};

export async function loadOpenTasks(db: Db): Promise<TaskSummary[]> {
  const { data } = await db
    .from('task')
    // Une seule chaîne littérale : le typage de PostgREST lit la requête au
    // niveau du type, et ne sait pas suivre une concaténation.
    .select(
      'id, ref, slug, title, status, due_on, estimate_hours, spent_hours, blocked_reason, client:client_id(slug), assignee:assignee_id(initials), priority:priority_id(ref, slug, internal_label, severity)',
    )
    .neq('status', 'terminee')
    .order('due_on', { ascending: true, nullsFirst: false });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (data ?? []).map((t) => {
    const due = t.due_on ? new Date(`${t.due_on}T00:00:00`) : null;
    const { bucket, overdueDays } = bucketFor(due, today);
    const remaining = Math.max(0, Number(t.estimate_hours ?? 0) - Number(t.spent_hours ?? 0));
    return {
      id: t.ref,
      slug: t.slug,
      title: t.title,
      clientId: t.client?.slug ?? '',
      prio: t.priority
        ? { id: t.priority.ref, slug: t.priority.slug, label: t.priority.internal_label, sev: t.priority.severity }
        : null,
      due: due ? fmtDue.format(due) : '—',
      bucket,
      ...(overdueDays !== undefined ? { overdueDays } : {}),
      effort: remaining,
      // Une tâche sans responsable reste visible : c'est justement celle
      // qu'il faut prendre.
      assignee: t.assignee?.initials ?? '',
      status: bucket === 'retard' && STATUS[t.status] === 'afaire' ? 'retard' : STATUS[t.status],
      ...(t.blocked_reason ? { blockedReason: t.blocked_reason } : {}),
    };
  });
}
