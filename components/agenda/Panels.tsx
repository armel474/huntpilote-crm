'use client';

/**
 * Agenda — légende, vue semaine, vue mois, panneau de journée, création de
 * rendez-vous. Les quatre natures d'événements restent visuellement
 * distinctes partout (icône + ton), jamais réduites à un point générique.
 */
import { useState } from 'react';
import { EmptyInitial } from '@/components/ui/States';
import { Pill, toneColors } from '@/components/ui/Atoms';
import { IcoArrowR, IcoCal, IcoPlus, IcoRepeat, IcoSend, IcoTask, IcoUsers, IcoWarn, IcoX } from '@/components/ui/Icons';
import {
  AGENDA_CLIENT_OPTIONS,
  AGENDA_DAY_MAX,
  AGENDA_TODAY,
  AGENDA_TYPES,
  type AgendaEvent,
  type AgendaEventType,
  addDays,
  agendaHref,
  agendaTitle,
  capFirst,
  clientName,
  fmtHour,
  fmtLong,
  isLate,
  monthGrid,
  parseD,
  toMin,
  weekDays,
} from '@/lib/data/agenda';

const AG_ICON: Record<AgendaEventType, (p: { size?: number }) => React.ReactElement> = {
  echeance: IcoTask,
  rapport: IcoSend,
  rdv: IcoUsers,
  exec: IcoRepeat,
};

/* ── Légende ── */

export function AgLegend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
      <span className="lbl">Ce que l’agenda montre</span>
      {(Object.entries(AGENDA_TYPES) as [AgendaEventType, (typeof AGENDA_TYPES)[AgendaEventType]][]).map(([id, t]) => {
        const Icon = AG_ICON[id];
        const { bg, border, fg } = toneColors(t.tone);
        return (
          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.625rem', fontWeight: 600, color: 'var(--fg2)' }}>
            <span style={{ width: 19, height: 19, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg, border: `1px solid ${border}`, color: fg }}>
              <Icon size={12} />
            </span>
            {t.label}
          </span>
        );
      })}
    </div>
  );
}

/* ── Ligne de constat : ce que couvre la période affichée, et l'alerte si le seuil est dépassé ── */

export function RecapLine({
  range,
  evs,
  label,
  conflicts,
}: {
  range: string[];
  evs: AgendaEvent[];
  label: string;
  conflicts: Set<string>;
}) {
  const inR = evs.filter((e) => range.includes(e.date));
  const n = (t: AgendaEventType) => inR.filter((e) => e.type === t).length;
  const late = inR.filter(isLate);
  const conf = inR.filter((e) => conflicts.has(e.id));
  const heavy = range
    .map((d): [string, number] => [d, inR.filter((e) => e.date === d && e.type === 'echeance' && !e.done).length])
    .filter(([, c]) => c > AGENDA_DAY_MAX);
  const parts = (
    [
      [n('echeance'), 'échéance', 'échéances'],
      [n('rdv'), 'rendez-vous', 'rendez-vous'],
      [n('rapport'), 'envoi de rapport', 'envois de rapport'],
      [n('exec'), 'exécution', 'exécutions'],
    ] as [number, string, string][]
  )
    .filter(([c]) => c > 0)
    .map(([c, s, p]) => `${c} ${c > 1 ? p : s}`);
  const alerts: string[] = [];
  if (late.length) alerts.push(`${late.length} échéance${late.length > 1 ? 's' : ''} dépassée${late.length > 1 ? 's' : ''}`);
  if (conf.length) alerts.push(`${Math.max(Math.round(conf.length / 2), 1)} conflit de rendez-vous`);
  heavy.forEach(([d, c]) => alerts.push(`${fmtLong(d)} : ${c} échéances, au-delà du seuil de ${AGENDA_DAY_MAX} par jour`));

  return (
    <div
      className="note-box"
      style={{
        marginTop: 0,
        marginBottom: 10,
        alignItems: 'center',
        ...(alerts.length ? { background: 'var(--red-m)', borderColor: 'var(--red-b)' } : {}),
      }}
    >
      <span style={{ color: alerts.length ? 'var(--red)' : 'var(--fg3)', display: 'flex', flexShrink: 0 }}>
        {alerts.length ? <IcoWarn /> : <IcoRepeat />}
      </span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
        <b>{label}</b> · {parts.length ? parts.join(', ') : 'aucun événement produit par l’application'}
        {alerts.length > 0 && <div style={{ marginTop: 3, color: 'var(--red)', fontWeight: 700 }}>{alerts.join(' · ')}</div>}
      </div>
    </div>
  );
}

/* ── Bloc d'événement ── */

function EventBlock({
  e,
  late,
  conflict,
  onOpen,
  drag,
}: {
  e: AgendaEvent;
  late: boolean;
  conflict: boolean;
  onOpen: (date: string) => void;
  drag?: boolean;
}) {
  const Icon = AG_ICON[e.type];
  const t = AGENDA_TYPES[e.type];
  return (
    <button
      type="button"
      className={`ag-ev${late ? ' is-late' : ''}${conflict ? ' is-conflict' : ''}${e.done ? ' is-done' : ''}`}
      data-type={e.type}
      draggable={drag || undefined}
      onDragStart={
        drag
          ? (ev) => {
              ev.dataTransfer.setData('text/plain', e.id);
              ev.dataTransfer.effectAllowed = 'move';
            }
          : undefined
      }
      onClick={() => onOpen(e.date)}
      title={`${t.label}${drag ? ' — glissez pour déplacer l’échéance' : ''}`}
    >
      <span className="ag-ev-ico">
        <Icon size={12} />
      </span>
      <span className="ag-ev-b">
        <span className="ag-ev-t">
          {e.time && <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHour(e.time)} · </b>}
          {agendaTitle(e)}
        </span>
        <span className="ag-ev-m">
          {t.short}
          {e.clientId ? ` · ${clientName(e.clientId)}` : ''}
          {e.ref ? ` · ${e.ref}` : ''}
        </span>
        {late && <span className="ag-tag">Dépassée</span>}
        {conflict && <span className="ag-tag">Conflit</span>}
        {e.done && <span className="ag-tag ok">Terminée</span>}
      </span>
    </button>
  );
}

/* ── Vue semaine — celle qu'on utilise ── */

export function WeekView({
  start,
  evs,
  selected,
  onSelect,
  onMove,
  conflicts,
}: {
  start: string;
  evs: AgendaEvent[];
  selected: string;
  onSelect: (d: string) => void;
  onMove: (id: string, date: string) => void;
  conflicts: Set<string>;
}) {
  const [over, setOver] = useState<string | null>(null);
  return (
    <div className="ag-week">
      {weekDays(start).map((d) => {
        const list = evs.filter((e) => e.date === d);
        const allday = list.filter((e) => !e.time);
        const timed = list.filter((e) => e.time).sort((a, b) => toMin(a.time!) - toMin(b.time!));
        const ech = allday.filter((e) => e.type === 'echeance' && !e.done).length;
        const dt = parseD(d);
        const we = dt.getDay() === 0 || dt.getDay() === 6;
        return (
          <div
            key={d}
            className={`ag-day${d === AGENDA_TODAY ? ' is-today' : ''}${d === selected ? ' is-sel' : ''}${we ? ' is-we' : ''}${over === d ? ' drop-on' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(d);
            }}
            onDragLeave={() => setOver((o) => (o === d ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              onMove(e.dataTransfer.getData('text/plain'), d);
            }}
          >
            <button type="button" className="ag-dayhead" onClick={() => onSelect(d)} aria-pressed={d === selected}>
              <span className="ag-dn">{D_SHORT_LOCAL[dt.getDay()]}</span>
              <span className="ag-dd">{dt.getDate()}</span>
              {d === AGENDA_TODAY && <span className="ag-todaytag">Aujourd’hui</span>}
              {ech > AGENDA_DAY_MAX && <span className="ag-tag">{ech} échéances</span>}
            </button>
            <div className="ag-slots">
              {list.length === 0 && <span className="ag-none">Rien de prévu</span>}
              {allday.map((e) => (
                <EventBlock key={e.id} e={e} late={isLate(e)} conflict={false} onOpen={onSelect} drag={AGENDA_TYPES[e.type].movable && !e.done} />
              ))}
              {allday.length > 0 && timed.length > 0 && <span className="ag-div" />}
              {timed.map((e) => (
                <EventBlock key={e.id} e={e} late={false} conflict={conflicts.has(e.id)} onOpen={onSelect} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const D_SHORT_LOCAL = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

/* ── Vue mois ── */

export function MonthView({
  ym,
  evs,
  selected,
  onSelect,
  onMove,
  conflicts,
}: {
  ym: string;
  evs: AgendaEvent[];
  selected: string;
  onSelect: (d: string) => void;
  onMove: (id: string, date: string) => void;
  conflicts: Set<string>;
}) {
  const [over, setOver] = useState<string | null>(null);
  const cur = Number(ym.split('-')[1]);
  return (
    <div>
      <div className="ag-month" style={{ marginBottom: 4 }}>
        {['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map((d) => (
          <div key={d} className="ag-mhead">
            {d}
          </div>
        ))}
      </div>
      <div className="ag-month">
        {monthGrid(ym).map((d) => {
          const list = evs.filter((e) => e.date === d).sort((a, b) => (a.time ? 1 : 0) - (b.time ? 1 : 0));
          const out = parseD(d).getMonth() + 1 !== cur;
          const flag = list.some(isLate) || list.some((e) => conflicts.has(e.id));
          return (
            <button
              type="button"
              key={d}
              className={`ag-cell${out ? ' out' : ''}${d === AGENDA_TODAY ? ' is-today' : ''}${d === selected ? ' is-sel' : ''}${over === d ? ' drop-on' : ''}`}
              onClick={() => onSelect(d)}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(d);
              }}
              onDragLeave={() => setOver((o) => (o === d ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                onMove(e.dataTransfer.getData('text/plain'), d);
              }}
            >
              <span className="ag-cd">
                {parseD(d).getDate()}
                {d === AGENDA_TODAY && <span className="ag-todaytag">Auj.</span>}
                {flag && (
                  <span className="ag-tag" style={{ marginLeft: 'auto' }}>
                    <IcoWarn size={10} />
                  </span>
                )}
              </span>
              <span className="ag-dots">
                {list.slice(0, 6).map((e) => {
                  const { bg, border } = toneColors(AGENDA_TYPES[e.type].tone);
                  return (
                    <span
                      key={e.id}
                      className="ag-dot"
                      style={{ background: bg, border: `1px solid ${border}` }}
                      title={`${AGENDA_TYPES[e.type].short} — ${e.title}`}
                    />
                  );
                })}
              </span>
              {list.slice(0, 2).map((e) => (
                <span key={e.id} className="ag-mini" data-type={e.type}>
                  {e.time ? `${fmtHour(e.time)} ` : ''}
                  {agendaTitle(e)}
                </span>
              ))}
              {list.length > 2 && (
                <span className="ag-more">
                  +{list.length - 2} autre{list.length - 2 > 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Panneau de journée ── */

export function DayPanel({
  date,
  evs,
  conflicts,
  onMove,
  onNew,
}: {
  date: string;
  evs: AgendaEvent[];
  conflicts: Set<string>;
  onMove: (id: string, date: string) => void;
  onNew: (date: string) => void;
}) {
  const list = evs
    .filter((e) => e.date === date)
    .sort((a, b) => (a.time ? toMin(a.time) : -1) - (b.time ? toMin(b.time) : -1));
  const opts = [...Array(8)].map((_, i) => addDays(date, i - 2)).filter((d) => d !== date);

  return (
    <div className="ag-panel">
      <div className="ag-panel-head">
        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <div className="lbl" style={{ marginBottom: 3 }}>
            Détail de la journée
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{capFirst(fmtLong(date))}</div>
        </div>
        {date === AGENDA_TODAY && <Pill label="Aujourd’hui" tone="green" sm />}
      </div>

      {list.length === 0 ? (
        <EmptyInitial
          icon={<IcoCal size={20} />}
          title="Journée vide"
          text="Aucune échéance, aucun rendez-vous, aucun envoi programmé."
          secondaryLabel="Créer un rendez-vous"
          onSecondary={() => onNew(date)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((e) => {
            const t = AGENDA_TYPES[e.type];
            const Icon = AG_ICON[e.type];
            const late = isLate(e);
            const conf = conflicts.has(e.id);
            return (
              <div key={e.id} className="ag-det" style={late || conf ? { borderColor: 'var(--red-b)', background: 'var(--red-m)' } : undefined}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                  <Pill label={t.short} tone={t.tone} sm icon={<Icon size={11} />} />
                  {e.time && (
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {fmtHour(e.time)}
                      {e.dur ? ` → ${fmtHour(minutesToHour(toMin(e.time) + e.dur))}` : ''}
                    </span>
                  )}
                  {late && <span className="ag-tag">Dépassée</span>}
                  {conf && <span className="ag-tag">Conflit</span>}
                  {e.done && <span className="ag-tag ok">Terminée</span>}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35 }}>{agendaTitle(e)}</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>
                  {e.clientId ? clientName(e.clientId) : 'Tous clients'}
                  {e.ref ? ` · ${e.ref}` : ''}
                </div>
                {conf && (
                  <div style={{ marginTop: 5, fontSize: '0.625rem', color: 'var(--red)', fontWeight: 600, lineHeight: 1.4 }}>
                    Deux rendez-vous se chevauchent sur cette plage. Déplacez-en un.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a href={agendaHref(e)} className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.6rem', textDecoration: 'none' }}>
                    {t.linkLabel}
                    <IcoArrowR size={11} />
                  </a>
                  {t.movable && !e.done && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.5625rem', color: 'var(--fg3)' }}>
                      Déplacer au
                      <select
                        className="sel"
                        style={{ padding: '0.25rem 0.4rem', minHeight: 28, fontSize: '0.625rem', width: 'auto' }}
                        value=""
                        onChange={(ev) => ev.target.value && onMove(e.id, ev.target.value)}
                        aria-label={`Déplacer l’échéance ${e.title}`}
                      >
                        <option value="">choisir…</option>
                        {opts.map((d) => (
                          <option key={d} value={d}>
                            {fmtLong(d)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
          <button className="btn-out" style={{ fontSize: '0.6875rem', justifyContent: 'center' }} onClick={() => onNew(date)}>
            <IcoPlus size={11} />
            Créer un rendez-vous ce jour
          </button>
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
        Une échéance déplacée depuis l’agenda met à jour la tâche correspondante dans le plan d’action.
      </div>
    </div>
  );
}

function minutesToHour(total: number) {
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/* ── Création de rendez-vous ── */

export function NewRdvModal({
  date,
  evs,
  onClose,
  onCreate,
}: {
  date: string;
  evs: AgendaEvent[];
  onClose: () => void;
  onCreate: (f: { date: string; time: string; dur: number; clientId: string; title: string }) => void;
}) {
  const [f, setF] = useState({ date, time: '10:00', dur: 60, clientId: AGENDA_CLIENT_OPTIONS[0].id, title: '' });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const clash = evs
    .filter((e) => e.type === 'rdv' && e.date === f.date && e.time)
    .find((e) => {
      const as = toMin(f.time);
      const ae = as + Number(f.dur);
      const bs = toMin(e.time!);
      const be = bs + (e.dur || 60);
      return as < be && bs < ae;
    });
  const days = [...Array(14)].map((_, i) => addDays(date, i - 3));
  const hours = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  return (
    <div
      role="presentation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Créer un rendez-vous"
        style={{ width: 'min(430px,100%)', padding: '1rem 1.125rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 800 }}>Créer un rendez-vous</div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Fermer">
            <IcoX />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 9 }}>
          <label htmlFor="nr-c" className="lbl">
            Client
          </label>
          <select id="nr-c" className="fld" value={f.clientId} onChange={(e) => set('clientId', e.target.value)}>
            {AGENDA_CLIENT_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 9 }}>
          <label htmlFor="nr-t" className="lbl">
            Objet du rendez-vous
          </label>
          <input id="nr-t" className="fld" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Point mensuel, présentation d’audit…" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 9, flex: 2 }}>
            <label htmlFor="nr-d" className="lbl">
              Jour
            </label>
            <select id="nr-d" className="fld" value={f.date} onChange={(e) => set('date', e.target.value)}>
              {days.map((d) => (
                <option key={d} value={d}>
                  {fmtLong(d)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 9, flex: 1 }}>
            <label htmlFor="nr-h" className="lbl">
              Heure
            </label>
            <select id="nr-h" className="fld" value={f.time} onChange={(e) => set('time', e.target.value)}>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {fmtHour(h)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 9, flex: 1 }}>
            <label htmlFor="nr-u" className="lbl">
              Durée
            </label>
            <select id="nr-u" className="fld" value={f.dur} onChange={(e) => set('dur', Number(e.target.value))}>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 h</option>
              <option value={90}>1 h 30</option>
            </select>
          </div>
        </div>

        {clash && (
          <div className="note-box" style={{ background: 'var(--red-m)', borderColor: 'var(--red-b)', marginBottom: 10 }}>
            <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0 }}>
              <IcoWarn />
            </span>
            <div>
              <b>Conflit d’horaire</b> avec « {clash.title} » ({fmtHour(clash.time!)}). Vous pouvez enregistrer quand même — le conflit sera signalé dans l’agenda.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn-out" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn-pri" disabled={!f.title.trim()} onClick={() => onCreate(f)}>
            Enregistrer le rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
}
