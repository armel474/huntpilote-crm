'use client';

/**
 * Atomes visuels partagés — badges, jauges, sparklines, tags de statut.
 * Marqués client : `Spark` s'appuie sur `useId` pour générer un identifiant
 * de gradient stable entre le rendu serveur et l'hydratation.
 */
import { useId } from 'react';
import { IcoCheck, IcoDoc, IcoDown, IcoLink, IcoUp, IcoZap } from '@/components/ui/Icons';

/* ── Palette de tons ── */

export type Tone = 'green' | 'yellow' | 'blue' | 'red' | 'violet' | 'neutral';

/** [fond, bordure, texte] pour chaque ton. */
const TONE_MAP: Record<Tone, readonly [string, string, string]> = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'],
  yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
  red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'],
  violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'],
  neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg3)'],
};

export function toneColors(tone: Tone = 'neutral') {
  const [bg, border, fg] = TONE_MAP[tone] ?? TONE_MAP.neutral;
  return { bg, border, fg };
}

/* ── Avatar ── */

export function Avatar({
  initials,
  size = 50,
  radius = 12,
}: {
  initials: string;
  size?: number;
  radius?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: 'linear-gradient(140deg,#d4edda,#e3ddd1)',
        border: '1.5px solid var(--bd-solid)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.29,
        fontWeight: 800,
        color: 'var(--green-fg)',
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  );
}

/* ── Badge ── */

export function Badge({
  label,
  tone = 'green',
  large,
}: {
  label: React.ReactNode;
  tone?: Tone;
  large?: boolean;
}) {
  const { bg, border, fg } = toneColors(tone);
  return (
    <span
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: fg,
        padding: large ? '3px 11px' : '2px 7px',
        borderRadius: 999,
        fontSize: large ? '0.6875rem' : '0.5625rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/** Tag de statut — même forme que Badge, sans variante large. */
export function StatusTag({ status, tone }: { status: React.ReactNode; tone?: Tone }) {
  const { bg, border, fg } = toneColors(tone);
  return (
    <span
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: fg,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: '0.5625rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

/* ── Jauges ── */

/** Couleur d'un score : vert ≥ seuil haut, jaune ≥ seuil bas, rouge en dessous. */
function scoreColor(value: number, high: number, mid: number) {
  if (value >= high) return 'var(--green)';
  if (value >= mid) return 'var(--yellow)';
  return 'var(--red)';
}

export function Gauge({ value, size = 84 }: { value: number; size?: number }) {
  const r = size / 2 - 7;
  const circumference = 2 * Math.PI * r;
  const color = scoreColor(value, 85, 70);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score ${value} sur 100`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFamily: 'var(--font)', fontSize: size * 0.235, fontWeight: 800, fill: color }}
      >
        {value}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.2}
        textAnchor="middle"
        style={{ fontFamily: 'var(--font)', fontSize: size * 0.115, fill: 'var(--fg4)' }}
      >
        /100
      </text>
    </svg>
  );
}

export function MiniGauge({
  score,
  label,
  size = 68,
}: {
  score: number;
  label: string;
  size?: number;
}) {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const color = scoreColor(score, 80, 60);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label} : ${score} sur 100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-muted)"
          strokeWidth="5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: 'var(--font)', fontSize: size * 0.265, fontWeight: 800, fill: color }}
        >
          {score}
        </text>
      </svg>
      <span
        style={{
          fontSize: '0.625rem',
          fontWeight: 600,
          color: 'var(--fg3)',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Sparkline ── */

export function Spark({ data, height = 60 }: { data: readonly number[]; height?: number }) {
  // Plusieurs sparklines coexistent sur une même page : un id de gradient
  // dupliqué ferait pointer toutes les aires sur la même définition.
  const gradientId = useId();
  const W = 400;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const px = (i: number) => (i / (data.length - 1)) * W;
  const py = (v: number) => height - 4 - ((v - min) / range) * (height - 8);
  const points = data.map((v, i) => ({ x: px(i), y: py(v) }));
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1];

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
          <stop offset="0%" stopColor="var(--green)" stopOpacity=".2" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} ${line.slice(1)} L${W},${height} Z`} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--green)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3.5" fill="var(--green)" />
    </svg>
  );
}

/* ── Variation ── */

export function Delta({ value }: { value: number }) {
  const color = value > 0 ? 'var(--green)' : value < 0 ? 'var(--red)' : 'var(--fg4)';
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontSize: '0.625rem',
        fontWeight: 600,
        color,
      }}
    >
      {value > 0 ? <IcoUp /> : value < 0 ? <IcoDown /> : '—'}
      {value !== 0 && Math.abs(value)}
    </span>
  );
}

/* ── Fil d'activité ── */

export type FeedItem = { icon: 'zap' | 'link' | 'doc' | 'check'; label: string; date: string };

const FEED_ICONS = {
  zap: IcoZap,
  link: IcoLink,
  doc: IcoDoc,
  check: IcoCheck,
} as const;

export function Feed({ items }: { items: readonly FeedItem[] }) {
  return (
    <div>
      {items.map((item, i) => {
        const Icon = FEED_ICONS[item.icon] ?? IcoCheck;
        return (
          <div
            key={`${item.label}-${i}`}
            style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'var(--bg-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--fg3)',
              }}
            >
              <Icon />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--fg2)',
                  lineHeight: 1.35,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
                {item.date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Barre comparative concurrent ── */

export function CompBar({
  name,
  sessions,
  label,
  clientSessions,
}: {
  name: string;
  sessions: number;
  label: string;
  /** Trafic du client, matérialisé par le repère vertical vert. */
  clientSessions: number;
}) {
  const max = Math.max(sessions, clientSessions) * 1.2;
  const compPct = (sessions / max) * 100;
  const clientPct = (clientSessions / max) * 100;
  const higher = sessions > clientSessions;
  const delta = Math.abs(sessions - clientSessions);
  const deltaLabel = delta >= 1000 ? `${(delta / 1000).toFixed(1)}k` : String(delta);

  return (
    <div style={{ marginBottom: 11 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg1)' }}>{name}</span>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: higher ? 'var(--red)' : 'var(--green)',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 5,
          background: 'var(--bg-muted)',
          borderRadius: 999,
          overflow: 'visible',
          marginBottom: 2,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${compPct}%`,
            background: higher ? 'rgba(196,69,69,0.55)' : 'rgba(22,163,74,0.55)',
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${clientPct}%`,
            top: -1,
            height: 7,
            width: 2,
            background: 'var(--green)',
            borderRadius: 1,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '0.5625rem',
          fontWeight: 600,
          color: higher ? 'var(--red)' : 'var(--green)',
        }}
      >
        {higher ? '+' : '-'}
        {deltaLabel} vs vous
      </div>
    </div>
  );
}

/* ── Barre de progression ── */

export function ProgressBar({
  value,
  color = 'var(--green)',
  height = 5,
}: {
  /** Pourcentage 0–100. */
  value: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        height,
        background: 'var(--bg-muted)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

/* ── Libellé de section ── */

export function Lbl({ children }: { children: React.ReactNode }) {
  return <div className="lbl">{children}</div>;
}
