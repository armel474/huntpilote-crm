/**
 * Rapports à produire — vue agence du cycle mensuel : où en est le rapport
 * de chaque client du portefeuille.
 *
 * Vocabulaire d'état strictement identique à l'éditeur de rapport (session
 * 1.3, `lib/data/rapport.ts`) : les libellés et les tons viennent de
 * `ED_STATES`/`BANNER`, pas d'une recopie. Cet écran ajoute un seul état que
 * l'éditeur ne connaît pas — « à préparer » — pour le rapport qui n'existe
 * encore pas du tout.
 *
 * Les cinq clients cités sont les cinq comptes réels de `CLIENTS`, dans la
 * même rotation que `search.ts` / `notifications.ts` / `agenda.ts`.
 */

import type { Tone } from '@/components/ui/Atoms';
import { CLIENTS } from '@/lib/data/clients';
import { BANNER, ED_STATES, type EditorState } from '@/lib/data/rapport';

const CLIENT_IDS = CLIENTS.filter((c) => c.type === 'client').map((c) => c.id);
const [C1, C2, C3, C4, C5] = CLIENT_IDS;
export const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id;
export const clientPlan = (id: string) => CLIENTS.find((c) => c.id === id)?.badge ?? '';

/* ── Vocabulaire d'état — repris de l'éditeur, jamais reformulé ── */

export type RqState = EditorState | 'apreparer';

const HINT: Record<RqState, string> = {
  apreparer: 'La période est close, rien n’est commencé',
  brouillon: 'Un brouillon est ouvert',
  bloque: 'Des libellés client attendent une relecture',
  pret: 'Tous les libellés client sont relus',
  publie: 'Envoyé au client',
  corrige: 'Une correction a été publiée après l’envoi',
  sanspreuve: 'Aucune tâche clôturée sur la période',
};

export const RQ_STATES: Record<RqState, { label: string; tone: Tone; hint: string }> = {
  apreparer: { label: 'À préparer', tone: 'neutral', hint: HINT.apreparer },
  ...(Object.fromEntries(
    ED_STATES.map(([id, label]) => [id, { label, tone: BANNER[id].tone, hint: HINT[id] }]),
  ) as Record<EditorState, { label: string; tone: Tone; hint: string }>),
};

/** États considérés « partis » — au client, même corrigés depuis. */
export const RQ_SENT: RqState[] = ['publie', 'corrige'];

/** Seuil : un rapport sous ce nombre de preuves de valeur n'a rien à montrer que des chiffres. */
export const RQ_PROOF_MIN = 1;

export type Blocker = { label: string; who: string };

export type RqRow = {
  clientId: string;
  state: RqState;
  /** Jour du mois où l'envoi est promis. */
  due: number;
  proofs: number;
  sentOn?: string;
  version?: 'v1' | 'v2';
  blockers?: Blocker[];
};

/* ── Portefeuille au repos — cycle d'août, un scénario par état ── */
const BASE: RqRow[] = [
  { clientId: C1, state: 'publie', due: 2, sentOn: '2 septembre', version: 'v1', proofs: 4 },
  {
    clientId: C2,
    state: 'bloque',
    due: 2,
    proofs: 3,
    blockers: [
      { label: 'Note Google en baisse : 4,1 vs 4,6 il y a 6 mois', who: 'Julie Bergeron' },
      { label: 'Fiche Google Maps incomplète (horaires, photos)', who: 'Julie Bergeron' },
    ],
  },
  {
    clientId: C3,
    state: 'bloque',
    due: 10,
    proofs: 1,
    blockers: [{ label: '48 pages en 404 depuis la refonte de mai', who: 'Marc Tremblay' }],
  },
  { clientId: C4, state: 'brouillon', due: 10, proofs: 2 },
  { clientId: C5, state: 'pret', due: 10, proofs: 5 },
];

export type RqCycle = {
  period: string;
  closedOn: string;
  defaultDue: string;
  today: number;
  todayLabel: string;
  targetDay: number;
  targetLabel: string;
};

const CYCLE_AOUT: RqCycle = {
  period: 'Août 2026',
  closedOn: '31 août',
  defaultDue: 'le 2 de chaque mois',
  today: 9,
  todayLabel: '9 septembre 2026',
  targetDay: 5,
  targetLabel: '5 septembre',
};
const CYCLE_SEPT: RqCycle = {
  period: 'Septembre 2026',
  closedOn: '30 septembre',
  defaultDue: 'le 2 de chaque mois',
  today: 1,
  todayLabel: '1er octobre 2026',
  targetDay: 5,
  targetLabel: '5 octobre',
};

/** En retard = la date d'envoi promise est passée et le rapport n'est pas parti.
 *  Ce n'est pas un état de l'éditeur : c'est un dépassement signalé par-dessus l'état réel. */
export const rqLate = (r: RqRow, cycle: RqCycle) => !RQ_SENT.includes(r.state) && r.due < cycle.today;

export type RqScenario = 'normal' | 'debut' | 'pic' | 'sanspreuve' | 'retard';

export const RQ_SCENARIOS: [RqScenario, string][] = [
  ['normal', 'Vue normale'],
  ['debut', 'Début de mois, rien à faire'],
  ['pic', 'Pic de fin de mois'],
  ['sanspreuve', 'Clients sans preuve'],
  ['retard', 'Rapports en retard'],
];

export function rqScenario(key: RqScenario): { cycle: RqCycle; rows: RqRow[] } {
  let cycle = { ...CYCLE_AOUT };
  let rows = BASE.map((r) => ({ ...r }));

  if (key === 'debut') {
    cycle = { ...CYCLE_SEPT };
    rows = rows.map((r) => ({
      ...r,
      state: 'apreparer',
      due: 2,
      sentOn: undefined,
      version: undefined,
      blockers: undefined,
      proofs: Math.max(r.proofs, 1),
    }));
  }
  if (key === 'pic') {
    cycle = { ...CYCLE_SEPT };
    const plan: Record<string, RqState> = { [C1]: 'pret', [C2]: 'bloque', [C3]: 'bloque', [C4]: 'brouillon', [C5]: 'brouillon' };
    rows = rows.map((r) => ({
      ...r,
      state: plan[r.clientId],
      due: 2,
      sentOn: undefined,
      version: undefined,
      blockers: plan[r.clientId] === 'bloque' ? r.blockers ?? [{ label: 'Synthèse du mois non relue', who: 'Marc Tremblay' }] : undefined,
    }));
  }
  if (key === 'sanspreuve') {
    const zero = [C4, C5];
    rows = rows.map((r) =>
      zero.includes(r.clientId)
        ? { ...r, proofs: 0, state: RQ_SENT.includes(r.state) ? r.state : ('sanspreuve' as RqState), blockers: undefined }
        : r,
    );
  }
  if (key === 'retard') {
    rows = rows.map((r) => (RQ_SENT.includes(r.state) ? r : { ...r, due: 2 }));
  }

  return { cycle, rows };
}

export type RqGroupId = 'debloquer' | 'preparation' | 'partis';

export function rqGroup(r: RqRow, cycle: RqCycle): RqGroupId {
  if (rqLate(r, cycle) || r.state === 'bloque') return 'debloquer';
  if (RQ_SENT.includes(r.state)) return 'partis';
  return 'preparation';
}

export const RQ_GROUPS: [RqGroupId, string, string][] = [
  ['debloquer', 'À débloquer', 'Les rapports en retard et bloqués par une relecture passent devant : c’est là que le cycle se grippe.'],
  ['preparation', 'En préparation', 'Dans les délais promis.'],
  ['partis', 'Partis', 'Publiés et lisibles par le client.'],
];

/** Slug du rapport visé par une ligne — le mois qui vient de se clore. */
export const rqReportSlug = (cycle: RqCycle) => (cycle.period.startsWith('Sept') ? '2026-09' : '2026-08');
