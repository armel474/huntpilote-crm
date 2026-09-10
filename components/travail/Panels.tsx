'use client';

/**
 * Mon plan de travail — carte de charge, groupes par échéance, ligne de
 * tâche. Nouveau vocabulaire propre à cet écran (`.task-row` et alentours,
 * `app/globals.css`) : aucune ligne existante ne porte échéance, client et
 * gestes de report/réassignation en une fois.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pill } from '@/components/ui/Atoms';
import { EmptyHealthy } from '@/components/ui/States';
import {
  IcoArrowR,
  IcoChevD,
  IcoClock,
  IcoLock,
  IcoTaskCheck,
  IcoUser,
  IcoWarn,
} from '@/components/ui/Icons';
import { CLIENTS } from '@/lib/data/clients';
import type { Severity } from '@/lib/data/priorite';
import {
  BUCKET_META,
  PT_CAPACITY,
  PT_TEAM,
  fmtEffort,
  type TacheBucket,
  type TaskPrioRef,
  type TaskSummary,
} from '@/lib/data/plan-travail';
import { routes } from '@/lib/routes';

const SEV_TONE: Record<Severity, 'red' | 'yellow' | 'green'> = {
  critique: 'red',
  important: 'yellow',
  opportunite: 'green',
};

function clientName(clientId: string) {
  return CLIENTS.find((c) => c.id === clientId)?.name ?? clientId;
}

export function ClientTag({ clientId }: { clientId: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.625rem',
        fontWeight: 700,
        color: 'var(--fg3)',
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fg4)' }}
      />
      {clientName(clientId)}
    </span>
  );
}

export function PrioTag({ prio, clientId }: { prio: TaskPrioRef | null; clientId: string }) {
  if (!prio) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.5625rem',
          fontWeight: 600,
          color: 'var(--fg4)',
          border: '1px dashed var(--bd-strong)',
          borderRadius: 999,
          padding: '1px 7px',
        }}
      >
        <IcoWarn size={10} />
        Sans priorité source
      </span>
    );
  }
  return (
    <Link href={routes.priorite(clientId, prio.slug)} style={{ textDecoration: 'none' }}>
      <Pill
        label={prio.label}
        tone={SEV_TONE[prio.sev]}
        sm
        icon={
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}
          />
        }
      />
    </Link>
  );
}

/* ── Charge de la semaine ── */

export function WeekLoadCard({ tasks }: { tasks: TaskSummary[] }) {
  const open = tasks.filter((t) => t.status !== 'termine');
  const sum = open.reduce((s, t) => s + t.effort, 0);
  const pct = Math.min((sum / PT_CAPACITY) * 100, 130);
  const over = sum > PT_CAPACITY;
  const tone = over ? 'var(--red)' : sum / PT_CAPACITY > 0.8 ? 'var(--yellow-fg)' : 'var(--green-fg)';

  return (
    <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Charge de la semaine</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>
            Somme des efforts estimés · seuil : {PT_CAPACITY} h disponibles cette semaine
          </div>
        </div>
        {over && <Pill label="Semaine surchargée" tone="red" icon={<IcoWarn size={11} />} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: tone,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmtEffort(sum)}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>sur {PT_CAPACITY} h disponibles</span>
      </div>
      <div className="load-track">
        <div className="load-fill" style={{ width: `${Math.min(pct, 100)}%`, background: tone }} />
        <span className="load-thresh" style={{ left: `${100 / 1.3}%` }} title={`Seuil ${PT_CAPACITY} h`} />
      </div>
      <div style={{ marginTop: 6, fontSize: '0.5625rem', color: 'var(--fg3)' }}>
        {open.length} tâche{open.length > 1 ? 's' : ''} ouverte{open.length > 1 ? 's' : ''}
        {over && (
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>
            {' '}
            · {fmtEffort(sum - PT_CAPACITY)} au-delà de la capacité — reportez ou réassignez avant vendredi
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Ligne de tâche ── */

const REPORT_OPTS: [string, TacheBucket][] = [
  ['Demain', 'semaine'],
  ['Vendredi 11 sept.', 'semaine'],
  ['Semaine du 14 sept.', 'plustard'],
];

export function TaskRow({
  task,
  onToggle,
  onReport,
  onReassign,
}: {
  task: TaskSummary;
  onToggle: (id: string) => void;
  onReport: (id: string, due: string, bucket: TacheBucket) => void;
  onReassign: (id: string, assignee: string) => void;
}) {
  const [menu, setMenu] = useState<'report' | 'assign' | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menu]);

  const done = task.status === 'termine';
  const blocked = task.status === 'bloquee';
  const late = task.status === 'retard';
  const assignee = PT_TEAM.find((m) => m.initials === task.assignee);

  return (
    <div className="task-row" data-late={late || undefined}>
      {blocked ? (
        <span
          title={task.blockedReason}
          className="task-check"
          data-locked="true"
          aria-label={`Bloquée — ${task.blockedReason ?? ''}`}
        >
          <IcoLock size={11} />
        </span>
      ) : (
        <button
          type="button"
          aria-pressed={done}
          className="task-check"
          data-done={done || undefined}
          onClick={() => onToggle(task.id)}
        >
          {done && <IcoTaskCheck size={12} />}
        </button>
      )}

      <div className="task-main">
        <div
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            lineHeight: 1.35,
            textDecoration: done ? 'line-through' : 'none',
            color: done ? 'var(--fg3)' : 'var(--fg1)',
          }}
        >
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 5 }}>
          <PrioTag prio={task.prio} clientId={task.clientId} />
          <ClientTag clientId={task.clientId} />
        </div>
        {blocked && (
          <div
            style={{
              marginTop: 6,
              display: 'flex',
              gap: 5,
              alignItems: 'flex-start',
              fontSize: '0.625rem',
              color: 'var(--yellow-fg)',
              lineHeight: 1.4,
            }}
          >
            <IcoWarn size={11} />
            Bloquée — {task.blockedReason}
          </div>
        )}
      </div>

      <div className="task-side">
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: late ? 'var(--red)' : 'var(--fg2)',
            whiteSpace: 'nowrap',
          }}
        >
          {task.due}
        </span>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>
          {fmtEffort(task.effort)} estimées
        </span>
      </div>

      <div className="task-actions">
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-out"
            style={{ fontSize: '0.625rem', padding: '0.3rem 0.6rem' }}
            onClick={(e) => {
              e.stopPropagation();
              setMenu((m) => (m === 'report' ? null : 'report'));
            }}
          >
            <IcoClock size={11} />
            Reporter
          </button>
          {menu === 'report' && (
            <div className="menu" onClick={(e) => e.stopPropagation()}>
              {REPORT_OPTS.map(([lbl, bucket]) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => {
                    onReport(task.id, lbl, bucket);
                    setMenu(null);
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-out"
            style={{ fontSize: '0.625rem', padding: '0.3rem 0.5rem' }}
            title="Réassigner"
            aria-expanded={menu === 'assign'}
            onClick={(e) => {
              e.stopPropagation();
              setMenu((m) => (m === 'assign' ? null : 'assign'));
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'var(--bg-muted)',
                border: '1px solid var(--bd-solid)',
                fontSize: '0.5rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {assignee ? assignee.initials : task.assignee}
            </span>
            <IcoChevD size={9} style={{ transform: menu === 'assign' ? 'rotate(180deg)' : undefined }} />
          </button>
          {menu === 'assign' && (
            <div className="menu" onClick={(e) => e.stopPropagation()}>
              {PT_TEAM.map((m) => (
                <button
                  key={m.initials}
                  type="button"
                  onClick={() => {
                    onReassign(task.id, m.initials);
                    setMenu(null);
                  }}
                >
                  <IcoUser size={11} />
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link href={routes.tache(task.clientId, task.slug)} className="btn-icon" title="Ouvrir la tâche">
          <IcoArrowR size={12} />
        </Link>
      </div>
    </div>
  );
}

/* ── Groupe par échéance ── */

type Handlers = {
  onToggle: (id: string) => void;
  onReport: (id: string, due: string, bucket: TacheBucket) => void;
  onReassign: (id: string, assignee: string) => void;
};

export function GroupSection({
  bucket,
  tasks,
  ...handlers
}: { bucket: TacheBucket; tasks: TaskSummary[] } & Handlers) {
  if (tasks.length === 0) return null;
  const { label, tone } = BUCKET_META[bucket];
  const dotColor =
    tone === 'red' ? 'var(--red)' : tone === 'blue' ? 'var(--blue-fg)' : 'var(--fg3)';
  const sum = tasks.reduce((s, t) => s + t.effort, 0);
  const isRetard = bucket === 'retard';

  const body = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{label}</h2>
        <span className="lbl">
          {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>
          {fmtEffort(sum)} estimées
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} {...handlers} />
        ))}
      </div>
    </>
  );

  return isRetard ? (
    <div className="retard-group" style={{ marginBottom: 16 }}>
      {body}
    </div>
  ) : (
    <div style={{ marginBottom: 16 }}>{body}</div>
  );
}

export function TravailEmpty() {
  return (
    <EmptyHealthy
      icon={<IcoTaskCheck size={18} />}
      title="Aucune tâche planifiée"
      text="Rien ne vous est assigné pour l’instant, tous clients confondus."
    />
  );
}
