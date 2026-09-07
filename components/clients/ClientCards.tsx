'use client';

import Link from 'next/link';
import { useId } from 'react';
import type { BadgeType, ClientRecord, ProspectRecord } from '@/lib/data/clients';
import { IcoDoc, IcoDown, IcoUp } from '@/components/ui/Icons';

export type CardView = 'grid' | 'list';

/* ── Sparkline compacte ── */

function MiniSparkline({
  data,
  color = 'var(--accent)',
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const gradientId = useId();
  const W = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: height - 4 - ((v - min) / range) * (height - 8),
  }));
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
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${height} ${line.slice(1)} L ${W},${height} Z`} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3" fill={color} />
    </svg>
  );
}

/* ── Badge d'état ── */

const BADGE_STYLES: Record<BadgeType, { bg: string; border: string; color: string }> = {
  accent: { bg: 'var(--accent-muted)', border: 'var(--accent-border)', color: 'var(--accent-fg)' },
  warm: { bg: 'var(--warm-muted)', border: 'var(--warm-border)', color: 'var(--warm-fg)' },
  info: { bg: 'var(--info-muted)', border: 'var(--info-border)', color: 'var(--info-fg)' },
};

function Badge({ label, type = 'accent' }: { label: string; type?: BadgeType }) {
  const s = BADGE_STYLES[type] ?? BADGE_STYLES.accent;
  return (
    <span
      style={{
        fontSize: '0.625rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 9999,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function Logo({ initials, size = 38 }: { initials: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        flexShrink: 0,
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-solid)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size < 36 ? '0.625rem' : '0.75rem',
        fontWeight: 800,
        color: 'var(--fg-3)',
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  );
}

function ServiceTag({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <span
      style={{
        fontSize: '0.625rem',
        padding: compact ? '2px 7px' : '3px 9px',
        borderRadius: 9999,
        background: 'var(--bg-muted)',
        color: 'var(--fg-3)',
        border: '1px solid var(--border-solid)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

const scoreColor = (s: number) =>
  s >= 85 ? 'var(--accent)' : s >= 70 ? 'var(--warm)' : 'var(--error)';

function ScoreDelta({ delta, align = 'flex-end' }: { delta: number; align?: string }) {
  return (
    <div
      style={{
        fontSize: '0.625rem',
        color: delta > 0 ? 'var(--accent)' : 'var(--error)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align,
        gap: 2,
      }}
    >
      {delta > 0 ? <IcoUp size={10} /> : <IcoDown size={10} />}
      {delta > 0 ? '+' : ''}
      {delta}
    </div>
  );
}

/* ── Carte client ── */

export function ClientCard({ c, view }: { c: ClientRecord; view: CardView }) {
  const href = `/clients/${c.id}`;

  if (view === 'list') {
    return (
      <article
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.75rem 1rem',
          borderTop: '3px solid var(--accent)',
        }}
      >
        <Logo initials={c.initials} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-1)' }}>
              {c.name}
            </h3>
            <Badge label={c.badge} type={c.badgeType} />
            <span className="card-type-label client">Client</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: 1 }}>{c.sector}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {c.services.map((s) => (
            <ServiceTag key={s} label={s} compact />
          ))}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 800,
              color: scoreColor(c.score),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {c.score}
          </div>
          <ScoreDelta delta={c.scoreDelta} />
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 60 }}>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--fg-1)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {c.mrr}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>/mois</div>
        </div>
        <Link className="btn-outline" href={href} style={{ flexShrink: 0 }}>
          Voir fiche
        </Link>
      </article>
    );
  }

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0.9375rem',
        borderTop: '3px solid var(--accent)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem' }}>
        <Logo initials={c.initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: 'var(--fg-1)',
                letterSpacing: '-0.02em',
              }}
            >
              {c.name}
            </h3>
            <Badge label={c.badge} type={c.badgeType} />
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: 2 }}>{c.sector}</div>
        </div>
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}
        >
          <span className="card-type-label client">Client</span>
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: scoreColor(c.score),
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {c.score}
          </div>
          <ScoreDelta delta={c.scoreDelta} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {c.services.map((s) => (
          <ServiceTag key={s} label={s} />
        ))}
      </div>

      <div
        style={{
          background: 'var(--bg-muted)',
          borderRadius: 10,
          padding: '0.6rem 0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <h4
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--fg-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 6,
          }}
        >
          Performance du site
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem 0.25rem',
          }}
        >
          {[
            { l: 'Positions', v: c.kw },
            { l: 'Sessions', v: c.sessions },
            { l: 'CTR', v: c.ctr },
            { l: 'Visibilité', v: c.visibility },
            { l: 'Indexées', v: c.pages },
            { l: 'Rebond', v: c.bounce },
          ].map(({ l, v }) => (
            <div key={l}>
              <div
                style={{
                  fontSize: '0.5625rem',
                  color: 'var(--fg-4)',
                  marginBottom: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--fg-1)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '0.875rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              color: 'var(--fg-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Progrès objectif
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {c.progress} %
          </span>
        </div>
        <div
          className="progress-track"
          style={{ marginBottom: 8 }}
          role="progressbar"
          aria-valuenow={c.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progrès vers l'objectif de ${c.name}`}
        >
          <div className="progress-fill" style={{ width: `${c.progress}%` }} />
        </div>
        <MiniSparkline data={c.sparkData} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-solid)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--fg-1)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            {c.mrr}
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: 'var(--fg-4)',
                marginLeft: 3,
              }}
            >
              /mois
            </span>
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>
            {c.servicesCount} service{c.servicesCount > 1 ? 's' : ''}
          </div>
        </div>
        <Link className="btn-outline" href={href}>
          Voir fiche
        </Link>
      </div>
    </article>
  );
}

/* ── Carte prospect ── */

const convColor = (p: number) =>
  p >= 65 ? 'var(--accent)' : p >= 45 ? 'var(--warm)' : 'var(--error)';

export function ProspectCard({ c, view }: { c: ProspectRecord; view: CardView }) {
  const href = `/clients/${c.id}`;

  if (view === 'list') {
    return (
      <article
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.75rem 1rem',
          borderTop: '3px solid var(--warm)',
        }}
      >
        <Logo initials={c.initials} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-1)' }}>
              {c.name}
            </h3>
            <Badge label={c.badge} type={c.badgeType} />
            <span className="card-type-label prospect">Prospect</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: 1 }}>{c.sector}</div>
        </div>
        <p
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: '0.75rem',
            color: 'var(--fg-3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {c.resume}
        </p>
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--fg-4)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {c.devis}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 60 }}>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--fg-1)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {c.budget}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>
            {c.servicesCount} services
          </div>
        </div>
        <Link className="btn-primary" href={href} style={{ flexShrink: 0 }}>
          Voir infos
        </Link>
      </article>
    );
  }

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0.9375rem',
        borderTop: '3px solid var(--warm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.875rem' }}>
        <Logo initials={c.initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: 'var(--fg-1)',
                letterSpacing: '-0.02em',
              }}
            >
              {c.name}
            </h3>
            <Badge label={c.badge} type={c.badgeType} />
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: 2 }}>{c.sector}</div>
        </div>
        <span className="card-type-label prospect">Prospect</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0.5rem 0.75rem',
          borderRadius: 8,
          background: 'var(--warm-muted)',
          border: '1px solid var(--warm-border)',
          marginBottom: '0.875rem',
          color: 'var(--warm-fg)',
        }}
      >
        <IcoDoc size={11} />
        <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{c.devis}</span>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <h4
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--fg-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 6,
          }}
        >
          Résumé projet
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--fg-2)', lineHeight: 1.55 }}>{c.resume}</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '0.5rem 0.625rem' }}>
          <div
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              color: 'var(--fg-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Conversion
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              color: convColor(c.convProb),
            }}
          >
            {c.convProb} %
          </div>
          <div style={{ marginTop: 5 }}>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={c.convProb}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Probabilité de conversion de ${c.name}`}
            >
              <div
                className="progress-fill"
                style={{ width: `${c.convProb}%`, background: convColor(c.convProb) }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '0.5rem 0.625rem' }}>
          <div
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              color: 'var(--fg-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Trafic estimé
          </div>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              color: 'var(--fg-1)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.2,
            }}
          >
            {c.trafficPotential}
          </div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg-4)', marginTop: 2 }}>
            après audit SEO
          </div>
        </div>

        <div style={{ background: 'var(--bg-muted)', borderRadius: 8, padding: '0.5rem 0.625rem' }}>
          <div
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              color: 'var(--fg-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Prochaine action
          </div>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--fg-1)',
              lineHeight: 1.35,
            }}
          >
            {c.nextAction}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-solid)', margin: '0 0 0.75rem' }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--fg-1)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            {c.budget}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>
            {c.servicesCount} service{c.servicesCount > 1 ? 's' : ''}
          </div>
        </div>
        <Link className="btn-primary" href={href}>
          Voir infos
        </Link>
      </div>
    </article>
  );
}
