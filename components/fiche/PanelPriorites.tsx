'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Atoms';
import { routes } from '@/lib/routes';
import { PRIORITIES, type Severity } from '@/lib/data/fiche-client';

const SEV_CONF: Record<
  Severity,
  { label: string; bg: string; border: string; color: string; tone: 'red' | 'yellow' | 'green' }
> = {
  critique: {
    label: 'Critique',
    bg: 'var(--red-m)',
    border: 'var(--red-b)',
    color: 'var(--red)',
    tone: 'red',
  },
  important: {
    label: 'Important',
    bg: 'var(--yellow-m)',
    border: 'var(--yellow-b)',
    color: 'var(--yellow-fg)',
    tone: 'yellow',
  },
  opportunite: {
    label: 'Opportunité',
    bg: 'var(--green-m)',
    border: 'var(--green-b)',
    color: 'var(--green-fg)',
    tone: 'green',
  },
};

type Filter = 'tous' | Severity;

export function PanelPriorites({ clientId }: { clientId: string }) {
  const [filter, setFilter] = useState<Filter>('tous');

  const counts: Record<Severity, number> = {
    critique: PRIORITIES.filter((p) => p.sev === 'critique').length,
    important: PRIORITIES.filter((p) => p.sev === 'important').length,
    opportunite: PRIORITIES.filter((p) => p.sev === 'opportunite').length,
  };

  const shown = filter === 'tous' ? PRIORITIES : PRIORITIES.filter((p) => p.sev === filter);

  const filters: { id: Filter; label: string; count: number | null }[] = [
    { id: 'tous', label: 'Tous', count: null },
    { id: 'critique', label: 'Critique', count: counts.critique },
    { id: 'important', label: 'Important', count: counts.important },
    { id: 'opportunite', label: 'Opportunité', count: counts.opportunite },
  ];

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* L'agent IA alimente cette liste en continu. */}
      <div
        style={{
          background: 'var(--violet-m)',
          border: '1px solid var(--violet-b)',
          borderRadius: 10,
          padding: '11px 14px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span aria-hidden="true" style={{ color: 'var(--violet-fg)', fontSize: 14, flexShrink: 0 }}>
          ✦
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--violet-fg)' }}>
            Agent IA actif — surveillance continue
          </div>
          <div style={{ fontSize: '0.5rem', color: 'var(--fg3)', marginTop: 1 }}>
            Dernière analyse : 27 mai 2026 · Prochaine dans 6 h
          </div>
        </div>
        <Badge label={`${PRIORITIES.length} priorités`} tone="violet" />
      </div>

      <div role="tablist" aria-label="Filtrer les priorités" style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {filters.map(({ id, label, count }) => {
          const on = filter === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(id)}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                background: on ? 'var(--bg-solid)' : 'transparent',
                border: `1px solid ${on ? 'var(--bd-solid)' : 'transparent'}`,
                color: on ? 'var(--fg1)' : 'var(--fg3)',
                fontSize: '0.6875rem',
                fontWeight: on ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {label}
              {count !== null && (
                <span
                  style={{
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 999,
                    background: on ? 'var(--bg-muted)' : 'transparent',
                    color: on ? 'var(--fg2)' : 'var(--fg4)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {shown.map((p) => {
          const conf = SEV_CONF[p.sev];
          return (
            <article
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '11px 14px',
                borderRadius: 9,
                background: conf.bg,
                border: `1px solid ${conf.border}`,
                flexWrap: 'wrap',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: conf.color,
                  flexShrink: 0,
                  marginTop: 5,
                }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--fg1)',
                    lineHeight: 1.3,
                    marginBottom: 3,
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginBottom: 5, lineHeight: 1.45 }}>
                  {p.desc}
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge label={conf.label} tone={conf.tone} />
                  <Badge label={p.status} tone="neutral" />
                  <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{p.source}</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>Impact : {p.impact}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <Link
                  className="btn-sm"
                  href={routes.priorite(clientId, p.id)}
                  style={{ border: '1px solid var(--bd-solid)', textDecoration: 'none' }}
                >
                  Détail
                </Link>
                {/* Une priorité doit pouvoir devenir une tâche du plan d'action. */}
                <button
                  className="btn-sm"
                  type="button"
                  style={{
                    background: 'var(--green-m)',
                    border: '1px solid var(--green-b)',
                    color: 'var(--green-fg)',
                  }}
                >
                  Assigner au plan d&apos;action
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
