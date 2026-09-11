'use client';

/**
 * Agenda — écran cockpit, portée sur tout le portefeuille (pas de sélecteur
 * de client). Quatre natures d'événements réels : échéances de tâches,
 * envois de rapports programmés, rendez-vous clients, exécutions planifiées.
 * Aucun événement générique n'est inventé pour remplir la grille.
 */
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { AgLegend, DayPanel, MonthView, NewRdvModal, RecapLine, WeekView } from '@/components/agenda/Panels';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoChevL, IcoChevR, IcoPlus } from '@/components/ui/Icons';
import {
  AGENDA_SCENARIOS,
  AGENDA_TODAY,
  AGENDA_TYPES,
  type AgendaEvent,
  type AgendaScenario,
  addDays,
  agendaScenario,
  capFirst,
  clientName,
  conflictSet,
  fmtDM,
  fmtLong,
  M_LONG,
  monthGrid,
  parseD,
  weekDays,
} from '@/lib/data/agenda';

export function AgendaView() {
  const [scenario, setScenario] = useState<AgendaScenario>('normal');
  const [view, setView] = useState<'semaine' | 'mois'>('semaine');
  const [weekStart, setWeekStart] = useState('2026-09-07');
  const [ym, setYm] = useState('2026-09');
  const [selected, setSelected] = useState(AGENDA_TODAY);
  const [moved, setMoved] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<AgendaEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(t);
  }, [toast]);

  const setSc = (s: AgendaScenario) => {
    setScenario(s);
    setMoved({});
    setCreated([]);
    setSelected(AGENDA_TODAY);
    setWeekStart('2026-09-07');
    setYm('2026-09');
  };

  const evs = useMemo(
    () => agendaScenario(scenario).map((e) => (moved[e.id] ? { ...e, date: moved[e.id] } : e)).concat(created),
    [scenario, moved, created],
  );
  const conflicts = useMemo(() => conflictSet(evs), [evs]);
  const range = view === 'semaine' ? weekDays(weekStart) : monthGrid(ym).filter((d) => Number(d.split('-')[1]) === Number(ym.split('-')[1]));
  const rangeLabel =
    view === 'semaine'
      ? `Semaine du ${parseD(weekStart).getDate()} au ${fmtDM(addDays(weekStart, 6))}`
      : `${capFirst(M_LONG[Number(ym.split('-')[1]) - 1])} ${ym.split('-')[0]}`;

  const onMove = (id: string, date: string) => {
    if (!id || !date) return;
    const ev = evs.find((x) => x.id === id);
    if (!ev || ev.date === date || !AGENDA_TYPES[ev.type].movable) return;
    setMoved((m) => ({ ...m, [id]: date }));
    setSelected(date);
    setToast(`Échéance déplacée au ${fmtLong(date)} — ${ev.ref ? `la ${ev.ref}` : 'la tâche liée'} a été mise à jour dans le plan d’action.`);
  };

  const onCreate = (f: { date: string; time: string; dur: number; clientId: string; title: string }) => {
    const id = `N${created.length + 1}`;
    setCreated((c) => [...c, { id, type: 'rdv', date: f.date, time: f.time, dur: f.dur, title: f.title.trim(), clientId: f.clientId }]);
    setSelected(f.date);
    setModalDate(null);
    setToast(`Rendez-vous créé le ${fmtLong(f.date)} avec ${clientName(f.clientId).replace(/\.$/, '')}.`);
  };

  const shift = (n: number) =>
    view === 'semaine'
      ? setWeekStart((w) => addDays(w, 7 * n))
      : setYm((v) => {
          const [y, m] = v.split('-').map(Number);
          const d = new Date(y, m - 1 + n, 1);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        });
  const goToday = () => {
    setWeekStart('2026-09-07');
    setYm('2026-09');
    setSelected(AGENDA_TODAY);
  };

  const header = (
    <CRMHeader
      title="Agenda"
      subtitle="Échéances de tâches, envois de rapports, rendez-vous clients et exécutions planifiées"
      period=""
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <div className="seg" role="group" aria-label="Vue de l’agenda">
          <button type="button" data-on={view === 'semaine'} onClick={() => setView('semaine')}>
            Semaine
          </button>
          <button type="button" data-on={view === 'mois'} onClick={() => setView('mois')}>
            Mois
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button type="button" className="btn-icon" onClick={() => shift(-1)} aria-label={view === 'semaine' ? 'Semaine précédente' : 'Mois précédent'}>
            <IcoChevL />
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 150, textAlign: 'center' }}>{rangeLabel}</span>
          <button type="button" className="btn-icon" onClick={() => shift(1)} aria-label={view === 'semaine' ? 'Semaine suivante' : 'Mois suivant'}>
            <IcoChevR />
          </button>
          <button type="button" className="btn-out" style={{ fontSize: '0.6875rem' }} onClick={goToday}>
            Aujourd’hui
          </button>
        </div>
        <button type="button" className="btn-main" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setModalDate(selected)}>
          <IcoPlus size={12} />
          Créer un rendez-vous
        </button>
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="lbl">Démo · état</span>
            <select className="state-sel" value={scenario} onChange={(e) => setSc(e.target.value as AgendaScenario)} aria-label="État de démonstration">
              {AGENDA_SCENARIOS.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.125rem 0' }}>
          <RecapLine range={range} evs={evs} label={rangeLabel} conflicts={conflicts} />
        </div>
        <div className="detail-row" style={{ paddingTop: 0 }}>
          <div className="col-main">
            <AgLegend />
            {view === 'semaine' ? (
              <WeekView start={weekStart} evs={evs} selected={selected} onSelect={setSelected} onMove={onMove} conflicts={conflicts} />
            ) : (
              <MonthView ym={ym} evs={evs} selected={selected} onSelect={setSelected} onMove={onMove} conflicts={conflicts} />
            )}
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
              Seules les échéances de tâches se déplacent : glissez-les vers une autre journée, ou utilisez « Déplacer au » dans le détail. Les envois de
              rapports suivent la date promise au client, les exécutions suivent leur planification.
            </div>
          </div>
          <div className="col-side">
            <DayPanel date={selected} evs={evs} conflicts={conflicts} onMove={onMove} onNew={setModalDate} />
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 18,
            zIndex: 80,
            background: 'var(--fg1)',
            color: 'var(--bg-solid)',
            padding: '9px 14px',
            borderRadius: 10,
            fontSize: '0.6875rem',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
            maxWidth: 'min(600px,92vw)',
            lineHeight: 1.45,
          }}
        >
          {toast}
        </div>
      )}
      {modalDate && <NewRdvModal date={modalDate} evs={evs} onClose={() => setModalDate(null)} onCreate={onCreate} />}
    </AppShell>
  );
}
