'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { Board } from '@/components/pipeline/Board';
import { IcoFilter, IcoGrid, IcoList, IcoPlus } from '@/components/ui/Icons';
import {
  DEALS,
  OWNERS,
  STAGES,
  fmt,
  initials,
  probColor,
  type Deal,
} from '@/lib/data/pipeline';

/* ── Bandeau de statistiques, recalculé à chaque déplacement ── */

function StatStrip({ deals }: { deals: Deal[] }) {
  const active = deals.filter((d) => d.stage !== 'gagne');
  const totalMrr = active.reduce((s, d) => s + d.mrr, 0);
  const weighted = Math.round(deals.reduce((s, d) => s + (d.mrr * d.prob) / 100, 0));
  const won = deals.filter((d) => d.stage === 'gagne');
  const wonMrr = won.reduce((s, d) => s + d.mrr, 0);

  const stats = [
    {
      label: 'Pipeline actif',
      value: `${fmt(totalMrr)} $`,
      sub: `${active.length} opportunités · MRR/mois`,
      color: 'var(--fg1)',
    },
    {
      label: 'Prévision pondérée',
      value: `${fmt(weighted)} $`,
      sub: 'MRR ajusté par probabilité',
      color: 'var(--blue-fg)',
    },
    {
      label: 'Gagné ce trimestre',
      value: `${fmt(wonMrr)} $`,
      sub: `${won.length} nouveaux clients`,
      color: 'var(--green)',
    },
    { label: 'Taux de conversion', value: '28 %', sub: '+4 pts vs T1', color: 'var(--fg1)' },
    {
      label: 'Cycle de vente moyen',
      value: '34 j',
      sub: 'Prospect → signature',
      color: 'var(--fg1)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5,1fr)',
        gap: 8,
        padding: '0.875rem 1.125rem 0',
        flexShrink: 0,
      }}
    >
      {stats.map((s) => (
        <div key={s.label} className="card" style={{ padding: '0.75rem 0.875rem' }}>
          <div className="lbl" style={{ marginBottom: 5 }}>
            {s.label}
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: s.color,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {s.value}
          </div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 5 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Vue liste ── */

function ListView({ deals }: { deals: Deal[] }) {
  const stageMap = Object.fromEntries(STAGES.map((s) => [s.id, s]));
  const ordered = [...deals].sort(
    (a, b) =>
      STAGES.findIndex((s) => s.id === a.stage) - STAGES.findIndex((s) => s.id === b.stage) ||
      b.mrr - a.mrr,
  );

  const cell: React.CSSProperties = { padding: '11px 0', borderBottom: '1px solid var(--bd)' };

  return (
    <div className="card" style={{ padding: '0.5rem 1rem 0.875rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            {['Entreprise', 'Étape', 'Services', 'MRR/mois', 'Resp.', 'Prob.'].map((h) => (
              <th
                key={h}
                className="lbl"
                style={{ padding: '8px 0', borderBottom: '1px solid var(--bd-solid)', textAlign: 'left' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ordered.map((d) => {
            const st = stageMap[d.stage];
            const owner = OWNERS[d.owner];
            return (
              <tr key={d.id}>
                <td style={cell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        flexShrink: 0,
                        background: 'linear-gradient(140deg,var(--bg-muted),var(--bg-base))',
                        border: '1px solid var(--bd-solid)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.5625rem',
                        fontWeight: 800,
                        color: 'var(--fg2)',
                      }}
                    >
                      {initials(d.company)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.company}</div>
                      <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>{d.sector}</div>
                    </div>
                  </div>
                </td>
                <td style={cell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      aria-hidden="true"
                      style={{ width: 7, height: 7, borderRadius: '50%', background: st.accent }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg2)' }}>
                      {st.label}
                    </span>
                  </div>
                </td>
                <td style={cell}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {d.services.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: '0.5rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: 'var(--bg-muted)',
                          color: 'var(--fg2)',
                          border: '1px solid var(--bd-solid)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td
                  style={{ ...cell, fontSize: '0.8125rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmt(d.mrr)} $
                </td>
                <td style={cell}>
                  <div
                    title={owner.name}
                    aria-label={owner.name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: owner.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.5rem',
                      fontWeight: 800,
                    }}
                  >
                    {d.owner}
                  </div>
                </td>
                <td
                  style={{
                    ...cell,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: probColor(d.prob),
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d.prob} %
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Page ── */

export function PipelineView() {
  const [deals, setDeals] = useState<Deal[]>(DEALS);
  const [view, setView] = useState<'kanban' | 'liste'>('kanban');

  const active = deals.filter((d) => d.stage !== 'gagne');
  const totalMrr = active.reduce((s, d) => s + d.mrr, 0);

  return (
    <AppShell
      header={
        <CRMHeader
          title="Pipeline commercial"
          subtitle={`${active.length} opportunités actives · ${fmt(totalMrr)} $ de MRR potentiel`}
          period=""
        />
      }
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0.75rem 1.125rem',
          borderBottom: '1px solid var(--bd-solid)',
          background: 'var(--bg-base)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <div
          role="tablist"
          aria-label="Mode d'affichage"
          style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 999, background: 'var(--bg-muted)' }}
        >
          {([
            { value: 'kanban' as const, label: 'Kanban', Icon: IcoGrid },
            { value: 'liste' as const, label: 'Liste', Icon: IcoList },
          ]).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              className={`tab${view === value ? ' on' : ''}`}
              onClick={() => setView(value)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.3rem 0.7rem' }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        <button className="btn-out" type="button" style={{ padding: '0.4rem 0.75rem' }}>
          <IcoFilter size={11} />
          Filtres
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
          <span className="lbl">Équipe</span>
          <div style={{ display: 'flex' }}>
            {Object.entries(OWNERS).map(([k, o], i) => (
              <div
                key={k}
                title={o.name}
                aria-label={o.name}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: o.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5rem',
                  fontWeight: 800,
                  border: '2px solid var(--bg-base)',
                  marginLeft: i ? -7 : 0,
                }}
              >
                {k}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {view === 'kanban' && (
            <span style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>
              Glissez les cartes entre les étapes, ou utilisez les flèches
            </span>
          )}
          <Link className="btn-primary" href="/onboarding">
            <IcoPlus size={12} />
            Nouveau prospect
          </Link>
        </div>
      </div>

      <StatStrip deals={deals} />

      {view === 'kanban' ? (
        <Board deals={deals} setDeals={setDeals} />
      ) : (
        <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.125rem' }}>
          <ListView deals={deals} />
        </div>
      )}
    </AppShell>
  );
}
