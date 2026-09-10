/**
 * Agenda — les quatre natures d'événements que l'application produit.
 * Aucun événement générique : tout ce qui apparaît ici vient d'un objet réel
 * du cockpit (tâche, rapport, rendez-vous, exécution planifiée).
 *
 * Les cinq comptes cités reprennent la même rotation que `search.ts` et
 * `notifications.ts` — les cinq clients réels de `CLIENTS`, jamais un nom
 * inventé : acme-corp, dupont-sas, le-marche-bio, boreal-immobilier,
 * clinique-lavoie.
 */

import type { Tone } from '@/components/ui/Atoms';
import { CLIENTS } from '@/lib/data/clients';
import { routes } from '@/lib/routes';

const CLIENT_IDS = CLIENTS.filter((c) => c.type === 'client').map((c) => c.id);
const [C1, C2, C3, C4, C5] = CLIENT_IDS;
export const clientName = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id;

/** « Aujourd'hui » du jeu de démonstration — même semaine que `notifications.ts` (mercredi 9 septembre 2026). */
export const AGENDA_TODAY = '2026-09-09';

/** Seuil : au-delà de 4 échéances non terminées sur une même journée, la journée est signalée chargée. */
export const AGENDA_DAY_MAX = 4;

export type AgendaEventType = 'echeance' | 'rapport' | 'rdv' | 'exec';

export const AGENDA_TYPES: Record<
  AgendaEventType,
  { label: string; short: string; tone: Tone; linkLabel: string; movable?: boolean }
> = {
  echeance: { label: 'Échéance de tâche', short: 'Échéance', tone: 'blue', linkLabel: 'Ouvrir la tâche', movable: true },
  rapport: { label: 'Envoi de rapport programmé', short: 'Envoi de rapport', tone: 'yellow', linkLabel: 'Ouvrir le rapport' },
  rdv: { label: 'Rendez-vous client', short: 'Rendez-vous', tone: 'green', linkLabel: 'Ouvrir la fiche client' },
  exec: { label: 'Exécution planifiée', short: 'Exécution', tone: 'neutral', linkLabel: 'Ouvrir l’exécution' },
};

export type AgendaEvent = {
  id: string;
  type: AgendaEventType;
  date: string;
  /** Titre neutre : le nom du client, s'il y en a un, est ajouté à l'affichage — jamais figé dans le texte. */
  title: string;
  clientId?: string;
  ref?: string;
  time?: string;
  dur?: number;
  done?: boolean;
};

/** Titre affiché : les rendez-vous portent le nom du client, les autres natures le montrent dans leur repère. */
export function agendaTitle(e: AgendaEvent): string {
  if (e.type === 'rdv' && e.clientId) return `${e.title} — ${clientName(e.clientId)}`;
  return e.title;
}

/** Le lien « ouvrir l'objet lié » d'un événement est une fonction de l'événement, jamais une constante. */
export function agendaHref(e: AgendaEvent): string {
  if (e.type === 'echeance' && e.clientId && e.ref) {
    const num = e.ref.replace(/\D/g, '');
    return routes.tache(e.clientId, num);
  }
  if (e.type === 'rapport') {
    return e.clientId ? routes.rapport(e.clientId, e.date < '2026-10' ? '2026-08' : '2026-09') : routes.rapportsAProduire();
  }
  if (e.type === 'rdv' && e.clientId) return routes.client(e.clientId);
  if (e.type === 'exec') return e.clientId ? routes.audit(e.clientId, 'tech-q2') : routes.outil('position-tracking');
  return routes.agenda();
}

/* ── Semaine du 7 au 13 septembre — la semaine de travail ── */
const WEEK: AgendaEvent[] = [
  { id: 'E1', type: 'exec', date: '2026-09-07', title: 'Relevé de positions hebdomadaire', ref: '5 clients' },
  { id: 'E2', type: 'echeance', date: '2026-09-07', title: 'Corriger les 23 liens brisés', clientId: C1, ref: 'tâche #142', done: true },
  { id: 'E3', type: 'echeance', date: '2026-09-08', title: 'Renouveler le certificat SSL expiré', clientId: C3, ref: 'tâche #171' },
  { id: 'E4', type: 'echeance', date: '2026-09-08', title: 'Débloquer robots.txt à l’indexation', clientId: C4, ref: 'tâche #169', done: true },
  { id: 'E5', type: 'rdv', date: '2026-09-09', time: '10:00', dur: 60, title: 'Point mensuel', clientId: C1 },
  { id: 'E6', type: 'rdv', date: '2026-09-09', time: '14:00', dur: 45, title: 'Présentation d’audit', clientId: C3 },
  { id: 'E7', type: 'echeance', date: '2026-09-09', title: 'Relire les 2 libellés du rapport d’août', clientId: C2, ref: 'tâche #174' },
  { id: 'E8', type: 'echeance', date: '2026-09-10', title: 'Rendre les 23 pages orphelines accessibles', clientId: C1, ref: 'tâche #143' },
  { id: 'E9', type: 'exec', date: '2026-09-10', title: 'Audit trimestriel', clientId: C4 },
  { id: 'E10', type: 'rapport', date: '2026-09-10', title: 'Rapport d’août', clientId: C2 },
  { id: 'E11', type: 'echeance', date: '2026-09-11', title: 'Publier le troisième guide longue traîne', clientId: C5, ref: 'tâche #158' },
  { id: 'E12', type: 'rapport', date: '2026-09-11', title: 'Rapport d’août', clientId: C5 },
  { id: 'E13', type: 'rdv', date: '2026-09-11', time: '09:30', dur: 30, title: 'Appel de cadrage', clientId: C4 },
];

/* ── Reste du mois ── */
const REST: AgendaEvent[] = [
  { id: 'E20', type: 'rapport', date: '2026-09-02', title: 'Rapports d’août — 5 clients', ref: 'envoi groupé' },
  { id: 'E21', type: 'echeance', date: '2026-09-03', title: 'Corriger les 12 balises title dupliquées', clientId: C4, ref: 'tâche #165', done: true },
  { id: 'E22', type: 'rdv', date: '2026-09-04', time: '11:00', dur: 60, title: 'Point mensuel', clientId: C2 },
  { id: 'E23', type: 'echeance', date: '2026-09-15', title: 'Mettre en ligne les redirections', clientId: C1, ref: 'tâche #142' },
  { id: 'E24', type: 'exec', date: '2026-09-15', title: 'Relevé de positions hebdomadaire', ref: '5 clients' },
  { id: 'E25', type: 'rdv', date: '2026-09-16', time: '14:00', dur: 60, title: 'Point mensuel', clientId: C5 },
  { id: 'E26', type: 'echeance', date: '2026-09-17', title: 'Réécrire les métadonnées de 18 pages', clientId: C2, ref: 'tâche #177' },
  { id: 'E27', type: 'echeance', date: '2026-09-18', title: 'Corriger le formulaire de contact mobile', clientId: C5, ref: 'tâche #181' },
  { id: 'E28', type: 'exec', date: '2026-09-22', title: 'Relevé de positions hebdomadaire', ref: '5 clients' },
  { id: 'E29', type: 'rdv', date: '2026-09-23', time: '10:00', dur: 45, title: 'Présentation d’audit', clientId: C4 },
  { id: 'E30', type: 'echeance', date: '2026-09-24', title: 'Livrer la refonte des pages quartiers', clientId: C5, ref: 'tâche #186' },
  { id: 'E31', type: 'echeance', date: '2026-09-29', title: 'Clôturer les preuves de valeur de septembre', ref: 'tâche #190' },
  { id: 'E32', type: 'exec', date: '2026-09-29', title: 'Relevé de positions hebdomadaire', ref: '5 clients' },
  { id: 'E33', type: 'rapport', date: '2026-10-02', title: 'Rapports de septembre — 5 clients', ref: 'envoi groupé' },
  { id: 'E34', type: 'echeance', date: '2026-08-31', title: 'Clôturer les preuves de valeur d’août', ref: 'tâche #140', done: true },
];

export const AGENDA_EVENTS: AgendaEvent[] = [...WEEK, ...REST];

/** Semaine chargée : le jeudi 10 passe à 5 échéances, au-delà du seuil. */
const EXTRA_EVENTS: AgendaEvent[] = [
  { id: 'X1', type: 'echeance', date: '2026-09-10', title: 'Fusionner les 4 pages qui se font concurrence', clientId: C1, ref: 'tâche #145' },
  { id: 'X2', type: 'echeance', date: '2026-09-10', title: 'Corriger la note Google de la fiche', clientId: C2, ref: 'tâche #172' },
  { id: 'X3', type: 'echeance', date: '2026-09-10', title: 'Reprendre le maillage des pages quartiers', clientId: C5, ref: 'tâche #180' },
  { id: 'X4', type: 'echeance', date: '2026-09-10', title: 'Rétablir le responsive tablette', clientId: C3, ref: 'tâche #176' },
  { id: 'X5', type: 'echeance', date: '2026-09-09', title: 'Inscrire l’établissement aux répertoires locaux', clientId: C3, ref: 'tâche #183' },
  { id: 'X6', type: 'echeance', date: '2026-09-09', title: 'Corriger le contraste des boutons d’action', clientId: C1, ref: 'tâche #148' },
  { id: 'X7', type: 'rdv', date: '2026-09-09', time: '16:00', dur: 45, title: 'Appel de suivi', clientId: C5 },
];

/** Journée vide de démonstration : on retire la journée du 9-10 septembre. */
const CREUSE_OUT = ['E5', 'E6', 'E7', 'E8', 'E9', 'E10'];

export type AgendaScenario = 'normal' | 'chargee' | 'depassee' | 'conflit' | 'creuse';

export const AGENDA_SCENARIOS: [AgendaScenario, string][] = [
  ['normal', 'Vue normale'],
  ['chargee', 'Semaine chargée'],
  ['depassee', 'Échéances dépassées'],
  ['conflit', 'Conflit de rendez-vous'],
  ['creuse', 'Journée vide'],
];

export function agendaScenario(key: AgendaScenario): AgendaEvent[] {
  let evs = AGENDA_EVENTS.map((e) => ({ ...e }));
  if (key === 'conflit') evs = evs.map((e) => (e.id === 'E6' ? { ...e, time: '10:30' } : e));
  if (key === 'depassee') evs = evs.map((e) => (e.id === 'E2' || e.id === 'E4' ? { ...e, done: false } : e));
  if (key === 'chargee') evs = evs.concat(EXTRA_EVENTS.map((e) => ({ ...e })));
  if (key === 'creuse') evs = evs.filter((e) => !CREUSE_OUT.includes(e.id));
  return evs;
}

/* ── Dates ── */

export const D_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const D_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
export const M_LONG = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export const parseD = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const isoD = (dt: Date) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
export const addDays = (s: string, n: number) => {
  const d = parseD(s);
  d.setDate(d.getDate() + n);
  return isoD(d);
};
export const fmtLong = (s: string) => {
  const d = parseD(s);
  return `${D_LONG[d.getDay()]} ${d.getDate()} ${M_LONG[d.getMonth()]}`;
};
export const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmtDM = (s: string) => {
  const d = parseD(s);
  return `${d.getDate()} ${M_LONG[d.getMonth()]}`;
};
export const fmtHour = (t: string) => t.replace(':', ' h ').replace(' h 00', ' h');
export const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
export const weekDays = (start: string) => [...Array(7)].map((_, i) => addDays(start, i));
export const monthGrid = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  const off = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const n = new Date(y, m, 0).getDate();
  const rows = Math.ceil((off + n) / 7);
  return [...Array(rows * 7)].map((_, i) => isoD(new Date(y, m - 1, 1 - off + i)));
};

export const isLate = (e: AgendaEvent) => e.type === 'echeance' && !e.done && e.date < AGENDA_TODAY;

/** Deux rendez-vous du même jour dont les plages se chevauchent. */
export function conflictSet(evs: AgendaEvent[]): Set<string> {
  const out = new Set<string>();
  const byDay: Record<string, AgendaEvent[]> = {};
  evs.filter((e) => e.type === 'rdv' && e.time).forEach((e) => {
    (byDay[e.date] = byDay[e.date] || []).push(e);
  });
  Object.values(byDay).forEach((list) =>
    list.forEach((a, i) =>
      list.forEach((b, j) => {
        if (i >= j) return;
        const as = toMin(a.time!);
        const ae = as + (a.dur || 60);
        const bs = toMin(b.time!);
        const be = bs + (b.dur || 60);
        if (as < be && bs < ae) {
          out.add(a.id);
          out.add(b.id);
        }
      }),
    ),
  );
  return out;
}

/** Sélecteur « créer un rendez-vous » — les cinq clients réels seulement. */
export const AGENDA_CLIENT_OPTIONS = CLIENT_IDS.map((id) => ({ id, name: clientName(id) }));
