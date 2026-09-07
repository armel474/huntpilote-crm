'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  PerfClientCard,
  TasksPanel,
  TrafficCard,
} from '@/components/dashboard/DashboardCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

export function DashboardView() {
  const [showForecast, setShowForecast] = useState(true);

  return (
    <AppShell header={<CRMHeader title="Dashboard" subtitle="Vue d'ensemble de l'agence" />}>
      <div className="content content-row">
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem' }}>
            <TrafficCard />
            <PerfClientCard />
          </div>

          <section className="card-glass card-pad" aria-labelledby="revenue-title">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '0.875rem',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  id="revenue-title"
                  style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-1)' }}
                >
                  Revenu · Prévision
                </h2>
                <p style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: 2 }}>
                  Chiffre d&apos;affaires mensuel 2026 · en k$ CA
                </p>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.6875rem',
                    color: 'var(--fg-3)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{ width: 18, height: 2.5, borderRadius: 9999, background: 'var(--accent)' }}
                  />
                  Réalisé
                </div>

                {/* La prévision est masquable : c'était un réglage du prototype,
                    remonté ici en contrôle direct de la carte. */}
                <button
                  type="button"
                  onClick={() => setShowForecast((v) => !v)}
                  aria-pressed={showForecast}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.6875rem',
                    color: showForecast ? 'var(--fg-3)' : 'var(--fg-4)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    padding: 0,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 18,
                      height: 2.5,
                      borderRadius: 9999,
                      background: 'var(--warm)',
                      opacity: showForecast ? 0.8 : 0.3,
                    }}
                  />
                  Prévision
                </button>
              </div>
            </div>

            <RevenueChart showForecast={showForecast} />
          </section>
        </div>

        <div
          style={{
            width: 272,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
          }}
        >
          <TasksPanel />
        </div>
      </div>
    </AppShell>
  );
}
