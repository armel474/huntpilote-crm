'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import {
  CLIENT_PERF,
  TODAY_TASKS,
  TRAFFIC_SPARKLINE,
  TRAFFIC_STATS,
  WEEK_TASKS,
  type Task,
} from '@/lib/data/dashboard';
import { IcoCheck, IcoDown, IcoTarget, IcoUp } from '@/components/ui/Icons';
import { SkelLine, SkelList } from '@/components/ui/States';
import { routes } from '@/lib/routes';

/* ── Squelettes de chargement — même charpente que le contenu réel ── */

export function TrafficCardSkeleton() {
  return (
    <section className="card-glass card-pad" aria-hidden="true">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '0.625rem',
        }}
      >
        <div>
          <SkelLine w={128} h={13} style={{ marginBottom: 6 }} />
          <SkelLine w={92} h={9} />
        </div>
        <SkelLine w={58} h={20} style={{ borderRadius: 999 }} />
      </div>
      <SkelLine w={140} h={34} style={{ marginBottom: '0.875rem' }} />
      <SkelLine w="100%" h={72} style={{ marginBottom: '0.875rem' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--border-solid)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <SkelLine w="70%" h={8} style={{ marginBottom: 5 }} />
            <SkelLine w="45%" h={14} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PerfClientCardSkeleton() {
  return (
    <section className="card-glass card-pad" aria-hidden="true">
      <SkelLine w={132} h={13} style={{ marginBottom: '0.75rem' }} />
      <SkelList n={4} />
    </section>
  );
}

export function TasksPanelSkeleton() {
  return (
    <section className="card-glass card-pad" aria-hidden="true">
      <SkelLine w={150} h={15} style={{ marginBottom: '1rem' }} />
      <SkelLine w={78} h={9} style={{ marginBottom: 8 }} />
      <SkelList n={4} />
      <div style={{ height: 1, background: 'var(--border-solid)', margin: '1rem 0' }} />
      <SkelLine w={168} h={9} style={{ marginBottom: 8 }} />
      <SkelList n={4} />
    </section>
  );
}

/* ── Sparkline du trafic ── */

function Sparkline({ data, height = 72 }: { data: readonly number[]; height?: number }) {
  const gradientId = useId();
  const W = 240;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const px = (i: number) => (i / (data.length - 1)) * W;
  const py = (v: number) => height - 6 - ((v - min) / range) * (height - 12);
  const pts = data.map((v, i) => ({ x: px(i), y: py(v) }));
  const line = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const last = pts[pts.length - 1];

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${height} ${line.slice(1)} L ${W},${height} Z`} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3.5" fill="var(--accent)" />
    </svg>
  );
}

/* ── Carte trafic organique ── */

export function TrafficCard() {
  return (
    <section
      className="card-glass card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
      aria-labelledby="traffic-title"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '0.625rem',
        }}
      >
        <div>
          <h2 id="traffic-title" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-1)' }}>
            Trafic organique
          </h2>
          <p style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: 2 }}>
            Sessions SEO · mai 2026
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--success)',
            background: 'var(--success-bg)',
            padding: '2px 8px',
            borderRadius: 9999,
          }}
        >
          <IcoUp />
          +8,7 %
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: '0.875rem' }}>
        <div
          style={{
            fontSize: '2.125rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--fg-1)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          34 820
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--fg-3)', fontWeight: 500 }}>sessions</div>
      </div>

      <div style={{ flex: 1 }}>
        <Sparkline data={TRAFFIC_SPARKLINE} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginTop: '0.875rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--border-solid)',
        }}
      >
        {TRAFFIC_STATS.map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontSize: '0.625rem',
                color: 'var(--fg-4)',
                marginBottom: 3,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--fg-1)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Carte performance client ── */

const scoreColor = (s: number) =>
  s >= 85 ? 'var(--accent)' : s >= 70 ? 'var(--warm)' : 'var(--error)';

export function PerfClientCard() {
  return (
    <section
      className="card-glass card-pad"
      style={{ display: 'flex', flexDirection: 'column' }}
      aria-labelledby="perf-title"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <h2 id="perf-title" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-1)' }}>
          Performance client
        </h2>
        <Link
          href={routes.clients()}
          style={{
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: 'var(--accent)',
            textDecoration: 'none',
          }}
        >
          Voir tout
        </Link>
      </div>

      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          listStyle: 'none',
        }}
      >
        {CLIENT_PERF.map((c, i) => (
          <li
            key={c.name}
            style={{
              borderBottom:
                i < CLIENT_PERF.length - 1 ? '1px solid var(--border-solid)' : 'none',
            }}
          >
            <Link
              href={routes.client(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 4px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--bg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: 'var(--fg-3)',
                }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--fg-1)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--fg-4)',
                    marginTop: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {c.sessions} sessions
                </div>
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: scoreColor(c.score),
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {c.score}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: c.delta >= 0 ? 'var(--success)' : 'var(--error)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  minWidth: 30,
                }}
              >
                {c.delta >= 0 ? <IcoUp size={11} /> : <IcoDown size={11} />}
                {c.delta > 0 ? `+${c.delta}` : c.delta}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Légende : les seuils ne reposent pas uniquement sur la couleur. */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          paddingTop: '0.75rem',
          marginTop: '0.25rem',
          borderTop: '1px solid var(--border-solid)',
        }}
      >
        {[
          { c: 'var(--accent)', l: '85+' },
          { c: 'var(--warm)', l: '70–84' },
          { c: 'var(--error)', l: '<70' },
        ].map(({ c, l }) => (
          <div
            key={l}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.6875rem',
              color: 'var(--fg-4)',
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }}
            />
            {l}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Panneau des tâches ── */

function TaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 2px',
        cursor: 'pointer',
      }}
    >
      {/* Case native masquée : le focus clavier et l'annonce lecteur d'écran
          restent corrects, l'apparence est portée par la pastille ci-dessous. */}
      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          flexShrink: 0,
          transition: 'all 150ms',
          border: `1.5px solid ${task.done ? 'var(--success)' : 'var(--border-strong)'}`,
          background: task.done ? 'var(--success)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {task.done && <IcoCheck size={8} />}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--fg-1)',
          lineHeight: 1.35,
          textDecoration: task.done ? 'line-through' : 'none',
          opacity: task.done ? 0.45 : 1,
          transition: 'opacity 200ms',
        }}
      >
        {task.text}
      </span>
    </label>
  );
}

function SectionHead({
  label,
  done,
  total,
  color,
}: {
  label: string;
  done: number;
  total: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.375rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-1)' }}>{label}</h3>
        <span
          style={{
            fontSize: '0.625rem',
            color: 'var(--fg-4)',
            background: 'var(--bg-muted)',
            padding: '1px 6px',
            borderRadius: 9999,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {done}/{total}
        </span>
      </div>
      <div
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        <IcoCheck size={8} />
      </div>
    </div>
  );
}

export function TasksPanel() {
  const [today, setToday] = useState<Task[]>([...TODAY_TASKS]);
  const [week, setWeek] = useState<Task[]>([...WEEK_TASKS]);

  const toggle = (setter: typeof setToday, id: number) =>
    setter((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const todayDone = today.filter((t) => t.done).length;
  const weekDone = week.filter((t) => t.done).length;

  return (
    <section
      className="card-glass card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
      aria-labelledby="tasks-title"
    >
      <h2
        id="tasks-title"
        style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: 'var(--fg-1)',
          letterSpacing: '-0.01em',
          marginBottom: '1rem',
        }}
      >
        Tableau des tâches
      </h2>

      <SectionHead
        label="Aujourd'hui"
        done={todayDone}
        total={today.length}
        color="var(--accent)"
      />
      <div style={{ marginBottom: '1rem' }}>
        {today.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={() => toggle(setToday, t.id)} />
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border-solid)', margin: '0 0 1rem' }} />

      <SectionHead
        label="Important de la semaine"
        done={weekDone}
        total={week.length}
        color="var(--warm)"
      />
      <div style={{ marginBottom: '1rem' }}>
        {week.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={() => toggle(setWeek, t.id)} />
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border-solid)', margin: '0 0 1rem' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.625rem' }}>
        <IcoTarget size={13} />
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-1)' }}>Objectif</h3>
      </div>
      <div style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: '0.625rem 0.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--fg-2)' }}>
            Sessions organiques
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            87 %
          </div>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={87}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression vers l'objectif de sessions organiques"
        >
          <div className="progress-fill" style={{ width: '87%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <div
            style={{ fontSize: '0.625rem', color: 'var(--fg-4)', fontVariantNumeric: 'tabular-nums' }}
          >
            34 820 réalisées
          </div>
          <div
            style={{ fontSize: '0.625rem', color: 'var(--fg-4)', fontVariantNumeric: 'tabular-nums' }}
          >
            Cible : 40 000
          </div>
        </div>
      </div>
    </section>
  );
}
