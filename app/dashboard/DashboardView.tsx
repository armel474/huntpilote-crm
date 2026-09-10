'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  PerfClientCard,
  PerfClientCardSkeleton,
  TasksPanel,
  TasksPanelSkeleton,
  TrafficCard,
  TrafficCardSkeleton,
} from '@/components/dashboard/DashboardCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { Lbl } from '@/components/ui/Atoms';
import { EmptyHealthy, ErrorIntegration, SkelLine } from '@/components/ui/States';
import { IcoTrophy } from '@/components/ui/Icons';

/**
 * Sélecteur de démo « État » — même mécanisme que `PrioritesView` et
 * `TravailView` : aucun état système n'a encore été appliqué à cet écran
 * d'entrée, alors qu'il concentre les deux cas cités par le brief (chargement
 * en silhouettes, intégration déconnectée « bruyante »).
 */
type DashScenarioId = 'normal' | 'chargement' | 'sain' | 'integration';

const DASH_SCENARIOS: [DashScenarioId, string][] = [
  ['normal', 'Normal'],
  ['chargement', 'Chargement'],
  ['sain', 'Vide sain — portefeuille'],
  ['integration', 'Intégration déconnectée'],
];

export function DashboardView() {
  const [showForecast, setShowForecast] = useState(true);
  const [scenario, setScenario] = useState<DashScenarioId>('normal');
  const loading = scenario === 'chargement';

  return (
    <AppShell header={<CRMHeader title="Dashboard" subtitle="Vue d'ensemble de l'agence" />}>
      <div className="subbar">
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
          Vue d’ensemble de l’agence · portefeuille complet
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="etat-demo-dashboard">Démo · état</label>
          </Lbl>
          <select
            id="etat-demo-dashboard"
            className="state-sel"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as DashScenarioId)}
          >
            {DASH_SCENARIOS.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          {scenario === 'sain' && (
            <EmptyHealthy
              icon={<IcoTrophy size={18} />}
              title="Aucune priorité critique ouverte, aucune facture en retard"
              text="Le portefeuille de l’agence est sain aujourd’hui — rien n’exige d’attention immédiate."
            />
          )}
          {scenario === 'integration' && (
            <ErrorIntegration service="Google Search Console" client="8 comptes suivis" />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem' }}>
            {loading ? <TrafficCardSkeleton /> : <TrafficCard />}
            {loading ? <PerfClientCardSkeleton /> : <PerfClientCard />}
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

            {loading ? <SkelLine w="100%" h={220} /> : <RevenueChart showForecast={showForecast} />}
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
          {loading ? <TasksPanelSkeleton /> : <TasksPanel />}
        </div>
      </div>
    </AppShell>
  );
}
