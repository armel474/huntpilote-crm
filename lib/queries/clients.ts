/**
 * Le Client hub lu dans la base — les comptes de l'agence, clients et
 * prospects, mis à la forme que les cartes attendent déjà (`Entry`).
 *
 * Ce que le fichier de démonstration figeait se calcule ici : le revenu
 * récurrent (`client_mrr`), les services souscrits, la courbe des scores
 * d'audit, l'avancement des tâches du mois, et pour un prospect ce que son
 * opportunité dit — budget, probabilité, prochaine action.
 *
 * Les mesures d'analytique (sessions, CTR, rebond) ne sont pas encore en
 * base : la carte affiche un tiret, pas un chiffre inventé.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { STAGES, STAGE_PROBABILITY, type StageId } from '@/lib/data/pipeline';
import type { ClientRecord, Entry, HubKpi, ProspectRecord } from '@/lib/data/clients';

type Db = SupabaseClient<Database>;

export type ClientHubData = { entries: Entry[]; kpis: HubKpi[]; subtitle: string };

const fmtMoney = (cents: number) => `${Math.round(cents / 100).toLocaleString('fr-CA')} $ CA`;
const fmtDay = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'short' });
const fmtMonth = new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric' });
const dateOf = (d: string) => new Date(d.includes('T') ? d : `${d}T00:00:00`);

const QUOTE_LABEL: Record<Database['public']['Enums']['quote_status'], string> = {
  brouillon: 'Devis en préparation',
  envoye: 'Devis envoyé',
  accepte: 'Devis accepté',
  refuse: 'Devis refusé',
  expire: 'Devis expiré',
};

const NONE = '—';

export async function loadClientHub(db: Db): Promise<ClientHubData> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthIso = monthStart.toISOString().slice(0, 10);

  const [clients, mrr, subs, audits, tasks, deals, quotes, snaps] = await Promise.all([
    db
      .from('client')
      .select('id, slug, name, initials, type, sector, domain, context, plan, since, created_at, health_score, health_score_prev')
      .is('archived_at', null)
      .order('name'),
    db.from('client_mrr').select('client_id, mrr_cents'),
    db.from('client_subscription').select('client_id, offer:offer_id(name)').is('ended_on', null),
    db.from('audit').select('client_id, score, run_at').eq('state', 'termine').not('score', 'is', null).order('run_at'),
    db.from('task').select('client_id, status').eq('period_month', monthIso),
    db
      .from('deal')
      .select('id, client_id, stage, mrr_cents, probability, next_action, next_action_on, created_at')
      .neq('stage', 'perdu')
      .order('created_at', { ascending: false }),
    db.from('quote').select('client_id, status, issued_on, created_at').order('created_at', { ascending: false }),
    db.from('deal_seo_snapshot').select('deal_id, monthly_visits'),
  ]);

  const mrrBy = new Map((mrr.data ?? []).map((m) => [m.client_id as string, Number(m.mrr_cents ?? 0)]));
  const servicesBy = new Map<string, string[]>();
  for (const s of subs.data ?? []) {
    if (!s.offer?.name) continue;
    servicesBy.set(s.client_id, [...(servicesBy.get(s.client_id) ?? []), s.offer.name]);
  }
  const scoresBy = new Map<string, number[]>();
  for (const a of audits.data ?? []) {
    if (a.score == null) continue;
    scoresBy.set(a.client_id, [...(scoresBy.get(a.client_id) ?? []), a.score]);
  }
  const tasksBy = new Map<string, { done: number; total: number }>();
  for (const t of tasks.data ?? []) {
    const cur = tasksBy.get(t.client_id) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (t.status === 'terminee') cur.done += 1;
    tasksBy.set(t.client_id, cur);
  }
  const dealBy = new Map<string, NonNullable<typeof deals.data>[number]>();
  for (const d of deals.data ?? []) if (!dealBy.has(d.client_id)) dealBy.set(d.client_id, d);
  const quoteBy = new Map<string, NonNullable<typeof quotes.data>[number]>();
  for (const q of quotes.data ?? []) if (!quoteBy.has(q.client_id)) quoteBy.set(q.client_id, q);
  const visitsByDeal = new Map((snaps.data ?? []).map((s) => [s.deal_id, s.monthly_visits]));

  const entries: Entry[] = [];
  let newThisMonth = 0;
  let quotesSent = 0;
  let totalMrr = 0;

  for (const c of clients.data ?? []) {
    if (c.type === 'client') {
      const cents = mrrBy.get(c.id) ?? 0;
      totalMrr += cents;
      const since = c.since ?? c.created_at;
      if (since && dateOf(since) >= monthStart) newThisMonth += 1;
      const services = servicesBy.get(c.id) ?? [];
      const scores = (scoresBy.get(c.id) ?? []).slice(-8);
      const score = c.health_score ?? scores[scores.length - 1] ?? 0;
      const prev = c.health_score_prev ?? scores[scores.length - 2] ?? score;
      const t = tasksBy.get(c.id);
      const record: ClientRecord = {
        id: c.slug,
        domain: c.domain ?? '',
        type: 'client',
        name: c.name,
        initials: c.initials,
        sector: c.sector ?? '',
        badge: c.plan ?? services[0] ?? 'Client',
        badgeType: 'accent',
        services,
        score,
        scoreDelta: score - prev,
        mrr: fmtMoney(cents),
        servicesCount: services.length,
        progress: t && t.total > 0 ? Math.round((t.done / t.total) * 100) : 0,
        sparkData: scores.length >= 2 ? scores : [score, score],
        kw: NONE,
        sessions: NONE,
        ctr: NONE,
        visibility: NONE,
        pages: NONE,
        bounce: NONE,
      };
      entries.push(record);
    } else {
      const deal = dealBy.get(c.id);
      const quote = quoteBy.get(c.id);
      if (quote?.status === 'envoye') quotesSent += 1;
      const stage = (deal?.stage ?? 'prospect') as StageId;
      const stageLabel = STAGES.find((s) => s.id === stage)?.label ?? 'Prospect';
      const visits = deal ? visitsByDeal.get(deal.id) : null;
      const record: ProspectRecord = {
        id: c.slug,
        domain: c.domain ?? '',
        type: 'prospect',
        name: c.name,
        initials: c.initials,
        sector: c.sector ?? '',
        badge: stageLabel,
        badgeType: stage === 'negociation' || stage === 'proposition' ? 'warm' : 'info',
        devis: quote
          ? `${QUOTE_LABEL[quote.status]}${quote.issued_on ? ` · ${fmtDay.format(dateOf(quote.issued_on))}` : ''}`
          : 'Aucun devis pour l’instant',
        resume: c.context ?? 'Résumé du projet à renseigner.',
        budget: deal ? `${fmtMoney(deal.mrr_cents)}` : NONE,
        servicesCount: c.plan ? 1 : 0,
        convProb: deal ? (deal.probability ?? STAGE_PROBABILITY[stage] ?? 0) : 0,
        nextAction: deal?.next_action
          ? `${deal.next_action}${deal.next_action_on ? ` · ${fmtDay.format(dateOf(deal.next_action_on))}` : ''}`
          : 'À planifier',
        trafficPotential: visits != null ? `~${visits.toLocaleString('fr-CA')} sessions` : NONE,
      };
      entries.push(record);
    }
  }

  const nClients = entries.filter((e) => e.type === 'client').length;
  const nProspects = entries.length - nClients;

  return {
    entries,
    kpis: [
      {
        label: 'Clients actifs',
        value: String(nClients),
        sub: newThisMonth > 0 ? `+${newThisMonth} ce mois` : 'aucun nouveau ce mois',
        up: newThisMonth > 0 ? true : null,
      },
      {
        label: 'Prospects en cours',
        value: String(nProspects),
        sub: `${quotesSent} devis envoyé${quotesSent > 1 ? 's' : ''}`,
        up: null,
      },
      { label: 'MRR total', value: fmtMoney(totalMrr), sub: 'abonnements actifs', up: null },
    ],
    subtitle: `${nClients} client${nClients > 1 ? 's' : ''} · ${nProspects} prospect${nProspects > 1 ? 's' : ''} · ${fmtMonth.format(new Date())}`,
  };
}
