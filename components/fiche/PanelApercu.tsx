'use client';

import { useState } from 'react';
import { Badge, Delta, Gauge, Lbl, MiniGauge, Spark } from '@/components/ui/Atoms';
import {
  IcoCheck,
  IcoChevD,
  IcoChevR,
  IcoChevU,
  IcoDoc,
  IcoLink,
  IcoPlus,
  IcoSpin,
  IcoUp,
  IcoWarn,
  IcoZap,
} from '@/components/ui/Icons';
import {
  ACTION_LEVELS,
  AI_NEGATIVE,
  AI_POSITIVE,
  AI_SUMMARY,
  AI_SUMMARY_CLEAN,
  CLIENT,
  KEYWORDS,
  KPIS,
  PRIORITIES,
  PROOFS,
  TASKS,
  TECH_HEALTH,
  TRAFFIC_SPARK,
  type Severity,
  type UxState,
} from '@/lib/data/fiche-client';
import type { FicheTab } from '@/components/fiche/tabs';

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

const STATUS_TONE = { 'En cours': 'yellow', 'À faire': 'blue', Terminé: 'green' } as const;

/* ── Carte Analyse + Rapport IA (v2) ── */

function AIReportCard({ clean }: { clean: boolean }) {
  return (
    <section
      className="card"
      style={{
        padding: '1rem',
        flex: '0 0 58%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderTop: '3px solid var(--violet)',
      }}
      aria-labelledby="ai-report-title"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'var(--violet-m)',
            border: '1px solid var(--violet-b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--violet-fg)',
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
        <div style={{ flex: 1 }}>
          <h2 id="ai-report-title" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Analyse + Rapport IA
          </h2>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
            Agent HuntPilote · analysé le 27 mai 2026
          </div>
        </div>
        <Badge label="✦ IA" tone="violet" />
        <button
          className="btn-sm"
          type="button"
          style={{
            background: 'var(--bg-muted)',
            color: 'var(--fg3)',
            border: '1px solid var(--bd-solid)',
          }}
        >
          <IcoSpin size={11} />
          Relancer
        </button>
      </div>

      <p
        style={{
          padding: '0.625rem 0.75rem',
          borderRadius: 8,
          background: 'var(--violet-m)',
          border: '1px solid var(--violet-b)',
          marginBottom: 10,
          fontSize: '0.6875rem',
          lineHeight: 1.65,
          color: 'var(--fg2)',
        }}
      >
        {clean ? AI_SUMMARY_CLEAN : AI_SUMMARY}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
        <div
          style={{
            background: 'var(--green-m)',
            border: '1px solid var(--green-b)',
            borderRadius: 10,
            padding: '0.625rem 0.75rem',
          }}
        >
          <h3 className="lbl" style={{ color: 'var(--green-fg)', marginBottom: 8 }}>
            Ce qui va bien
          </h3>
          {AI_POSITIVE.map((item, i) => (
            <div
              key={item}
              style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  background: 'var(--green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  color: '#fff',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--green-fg)', lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--red-m)',
            border: '1px solid var(--red-b)',
            borderRadius: 10,
            padding: '0.625rem 0.75rem',
          }}
        >
          <h3 className="lbl" style={{ color: 'var(--red)', marginBottom: 8 }}>
            Ce qui va mal
          </h3>
          {AI_NEGATIVE.map((item, i) => (
            <div
              key={item}
              style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  background: 'var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  color: '#fff',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Carte Prochaines actions (v2) ── */

function NextActionsCard({ setTab }: { setTab: (t: FicheTab) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      className="card"
      style={{
        padding: '1rem',
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
      aria-labelledby="next-actions-title"
    >
      <h2 id="next-actions-title" style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 12 }}>
        Prochaines Actions
      </h2>

      {ACTION_LEVELS.map((lv) => {
        const open = expanded === lv.id;
        return (
          <div key={lv.id} style={{ marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => setExpanded(open ? null : lv.id)}
              aria-expanded={open}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.5rem 0.625rem',
                borderRadius: 8,
                background: lv.bg,
                border: `1px solid ${lv.border}`,
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'var(--font)',
                textAlign: 'left',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: lv.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: lv.color, flex: 1 }}>
                {lv.label}
              </span>
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: 'var(--bg-solid)',
                  color: lv.color,
                }}
              >
                {lv.count}
              </span>
              {open ? <IcoChevU /> : <IcoChevD />}
            </button>

            {open && (
              <div
                style={{
                  padding: '0.5rem 0.75rem 0.25rem 1.375rem',
                  borderRadius: '0 0 8px 8px',
                  background: lv.bg,
                  borderLeft: `1px solid ${lv.border}`,
                  borderRight: `1px solid ${lv.border}`,
                  borderBottom: `1px solid ${lv.border}`,
                  marginTop: -2,
                }}
              >
                {lv.items.map((it) => (
                  <div
                    key={it}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 5 }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: lv.color,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.4 }}>
                      {it}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--bd-solid)' }}>
        <button
          type="button"
          onClick={() => setTab('priorites')}
          className="btn-out"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }}
        >
          Voir toutes les actions <IcoChevR />
        </button>
      </div>
    </section>
  );
}

/* ── Carte Santé technique (v2) ── */

function TechHealthCard() {
  return (
    <section className="card" style={{ padding: '0.875rem 1rem' }} aria-labelledby="tech-title">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <h2 id="tech-title" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Santé technique du site
          </h2>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
            via PageSpeed Insights · 27 mai 2026
          </div>
        </div>
        <button
          className="btn-sm"
          type="button"
          style={{
            background: 'var(--bg-muted)',
            color: 'var(--fg3)',
            border: '1px solid var(--bd-solid)',
          }}
        >
          <IcoSpin size={11} />
          Actualiser
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {TECH_HEALTH.map((t) => (
          <MiniGauge key={t.label} score={t.score} label={t.label} size={68} />
        ))}
      </div>
    </section>
  );
}

/* ── États vides ── */

function NoIntegrationsState({ onLaunchAudit }: { onLaunchAudit: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 420,
        gap: 16,
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'var(--yellow-m)',
          border: '1px solid var(--yellow-b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--yellow-fg)',
        }}
      >
        <IcoZap size={22} />
      </div>
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg1)', marginBottom: 6 }}>
          Connecter les sources SEO
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', maxWidth: 380, lineHeight: 1.65 }}>
          Aucune intégration active. Connectez Google Search Console et Analytics pour activer le
          suivi des performances, ou lancez un premier audit pour amorcer la fiche.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Google Search Console', 'Google Analytics 4', 'Semrush / Ahrefs'].map((src) => (
          <button key={src} className="btn-out" type="button">
            <IcoPlus size={12} />
            {src}
          </button>
        ))}
      </div>
      <button className="btn-pri" type="button" onClick={onLaunchAudit}>
        <IcoZap size={13} />
        Lancer un audit
      </button>
    </div>
  );
}

function OnboardingState() {
  const steps = [
    { done: true, label: 'Fiche client créée' },
    { done: true, label: 'Contact principal ajouté' },
    { done: false, label: 'Connecter Google Search Console' },
    { done: false, label: 'Connecter Google Analytics 4' },
    { done: false, label: 'Lancer le premier diagnostic' },
    { done: false, label: "Définir l'objectif principal" },
  ];

  return (
    <div style={{ padding: '4px 0 24px' }}>
      <div
        style={{
          background: 'var(--blue-m)',
          border: '1px solid var(--blue-b)',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--blue-fg)', marginBottom: 4 }}>
          Onboarding en cours
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
          Complétez les étapes ci-dessous pour activer le pilotage SEO de ce client.
        </p>
      </div>
      <ol style={{ display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 500, listStyle: 'none' }}>
        {steps.map((s, i) => (
          <li
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 14px',
              borderRadius: 9,
              background: s.done ? 'var(--green-m)' : 'var(--bg-solid)',
              border: `1px solid ${s.done ? 'var(--green-b)' : 'var(--bd-solid)'}`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: s.done ? 'var(--green)' : 'var(--bg-muted)',
                border: `2px solid ${s.done ? 'var(--green)' : 'var(--bd-strong)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: s.done ? '#fff' : 'var(--fg3)',
              }}
            >
              {s.done ? <IcoCheck /> : <span style={{ fontSize: '0.5625rem', fontWeight: 800 }}>{i + 1}</span>}
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: s.done ? 400 : 600,
                color: s.done ? 'var(--green-fg)' : 'var(--fg1)',
                textDecoration: s.done ? 'line-through' : undefined,
                flex: 1,
              }}
            >
              {s.label}
            </span>
            {!s.done && (
              <button className="btn-out" type="button" style={{ fontSize: '0.625rem', padding: '0.3rem 0.7rem' }}>
                Configurer
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Bannières contextuelles ── */

function Banner({
  tone,
  children,
}: {
  tone: 'blue' | 'yellow' | 'red';
  children: React.ReactNode;
}) {
  const map = {
    blue: ['var(--blue-m)', 'var(--blue-b)'],
    yellow: ['var(--yellow-m)', 'var(--yellow-b)'],
    red: ['var(--red-m)', 'var(--red-b)'],
  }[tone];
  return (
    <div
      role="status"
      style={{
        background: map[0],
        border: `1px solid ${map[1]}`,
        borderRadius: 9,
        padding: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ── Panneau Aperçu ── */

export function PanelApercu({
  uxState,
  setTab,
  onLaunchAudit,
}: {
  uxState: UxState;
  setTab: (t: FicheTab) => void;
  onLaunchAudit: () => void;
}) {
  if (uxState === 'nodata') return <NoIntegrationsState onLaunchAudit={onLaunchAudit} />;
  if (uxState === 'onboarding') return <OnboardingState />;

  const clean = uxState === 'nocritical';
  const topPriorities = clean
    ? []
    : [
        ...PRIORITIES.filter((p) => p.sev === 'critique').slice(0, 3),
        ...PRIORITIES.filter((p) => p.sev === 'important').slice(0, 1),
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {uxState === 'audit' && (
        <Banner tone="blue">
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--blue)',
              flexShrink: 0,
              animation: 'hp-pulse 1.5s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue-fg)', flex: 1 }}>
            Diagnostic complet en cours — résultats estimés dans ≈ 8 min
          </span>
          <Badge label="En traitement" tone="blue" />
        </Banner>
      )}

      {uxState === 'stale' && (
        <Banner tone="yellow">
          <span style={{ color: 'var(--yellow-fg)', display: 'flex' }}>
            <IcoWarn />
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--yellow-fg)', flex: 1 }}>
            Données non actualisées depuis 18 jours
          </span>
          <button className="btn-sm" type="button" style={{ color: 'var(--yellow-fg)', border: '1px solid var(--yellow-b)' }}>
            <IcoSpin size={11} />
            Actualiser
          </button>
        </Banner>
      )}

      {uxState === 'error' && (
        <Banner tone="red">
          <span style={{ color: 'var(--red)', display: 'flex' }}>
            <IcoWarn />
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--red)', flex: 1 }}>
            Chargement partiel — données de backlinks indisponibles
          </span>
          <button className="btn-sm" type="button" style={{ color: 'var(--red)', border: '1px solid var(--red-b)' }}>
            <IcoSpin size={11} />
            Réessayer
          </button>
        </Banner>
      )}

      {/* 1 — Rapport IA + Prochaines actions, en tête de l'aperçu */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <AIReportCard clean={clean} />
        <NextActionsCard setTab={setTab} />
      </div>

      {/* 2 — Santé, objectif, modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 10 }}>
        <section
          className="card"
          style={{
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Gauge value={clean ? 96 : CLIENT.score} size={82} />
          <span
            style={{
              fontSize: '0.5rem',
              fontWeight: 700,
              color: 'var(--fg4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 2,
            }}
          >
            Score de santé
          </span>
          <span style={{ fontSize: '0.5625rem', color: 'var(--green-fg)', fontWeight: 600 }}>
            ↑ {clean ? '+8' : '+4'} pts ce mois
          </span>
        </section>

        <section
          className="card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Lbl>Objectif principal</Lbl>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--fg1)',
              lineHeight: 1.35,
              margin: '6px 0 8px',
            }}
          >
            {CLIENT.objective}
          </div>
          <div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={clean ? 78 : CLIENT.objectiveProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progression de l'objectif principal"
              style={{ height: 5, marginBottom: 4 }}
            >
              <div
                className="progress-fill"
                style={{ width: `${clean ? 78 : CLIENT.objectiveProgress}%` }}
              />
            </div>
            <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>
              {clean ? 78 : CLIENT.objectiveProgress} % atteint
            </span>
          </div>
        </section>

        <section className="card" style={{ padding: '14px 16px' }}>
          <Lbl>Modules actifs</Lbl>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '6px 0 8px' }}>
            {CLIENT.services.map((s) => (
              <span
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 5,
                  background: 'var(--green-m)',
                  border: '1px solid var(--green-b)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'var(--green)',
                  }}
                />
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--green-fg)' }}>
                  {s}
                </span>
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>
            {CLIENT.plan} · {CLIENT.mrr}/m
          </div>
        </section>
      </div>

      {/* 3 — KPIs SEO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
        {KPIS.map((k) => (
          <div key={k.label} className="card" style={{ padding: '12px 13px' }}>
            <Lbl>{k.label}</Lbl>
            <div
              style={{
                fontSize: '1.375rem',
                fontWeight: 800,
                color: 'var(--fg1)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.035em',
                lineHeight: 1,
                margin: '4px 0',
              }}
            >
              {k.value}
            </div>
            <div
              style={{
                fontSize: '0.5rem',
                color: 'var(--green-fg)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <IcoUp size={8} />
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 4 — Santé technique */}
      <TechHealthCard />

      {/* 5 — Priorités ouvertes + plan en cours */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 10 }}>
        <section className="card" style={{ padding: '14px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 11,
            }}
          >
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)' }}>
              Priorités ouvertes
            </h2>
            <button
              type="button"
              onClick={() => setTab('priorites')}
              className="btn-sm"
              style={{ color: 'var(--fg3)' }}
            >
              Voir toutes <IcoChevR />
            </button>
          </div>

          {clean ? (
            <div style={{ textAlign: 'center', padding: '18px 0' }}>
              <div style={{ fontWeight: 700, color: 'var(--green-fg)', fontSize: '0.875rem', marginBottom: 4 }}>
                Aucune priorité critique
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>
                8 opportunités disponibles à exploiter
              </div>
              <button
                type="button"
                onClick={() => setTab('priorites')}
                className="btn-sm"
                style={{
                  marginTop: 12,
                  background: 'var(--green-m)',
                  border: '1px solid var(--green-b)',
                  color: 'var(--green-fg)',
                }}
              >
                Voir les opportunités <IcoChevR />
              </button>
            </div>
          ) : (
            topPriorities.map((p) => {
              const conf = SEV_CONF[p.sev];
              return (
                <div
                  key={p.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '9px 10px',
                    borderRadius: 8,
                    background: conf.bg,
                    border: `1px solid ${conf.border}`,
                    marginBottom: 6,
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
                      marginTop: 4,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--fg1)',
                        lineHeight: 1.3,
                        marginBottom: 2,
                      }}
                    >
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>
                      {p.source} · Impact : {p.impact}
                    </div>
                  </div>
                  <button className="btn-sm" type="button" style={{ flexShrink: 0, border: '1px solid var(--bd-solid)' }}>
                    Assigner
                  </button>
                </div>
              );
            })
          )}
        </section>

        <section className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 11,
            }}
          >
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)' }}>
              Plan en cours
            </h2>
            <button
              type="button"
              onClick={() => setTab('plan')}
              className="btn-sm"
              style={{ color: 'var(--fg3)' }}
            >
              Voir tout <IcoChevR />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {TASKS.map((t) => (
              <div
                key={t.title}
                style={{
                  padding: '9px 10px',
                  borderRadius: 8,
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--bd-solid)',
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg1)', lineHeight: 1.3 }}>
                    {t.title}
                  </div>
                  <Badge label={t.status} tone={STATUS_TONE[t.status]} />
                </div>
                <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>Échéance : {t.due}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTab('plan')}
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px dashed var(--bd-strong)',
              color: 'var(--fg3)',
              fontSize: '0.6875rem',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              marginTop: 4,
            }}
          >
            <IcoPlus size={12} />
            Créer une tâche
          </button>
        </section>
      </div>

      {/* 6 — Preuves de valeur + trafic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <section className="card" style={{ padding: '14px 16px' }}>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)', marginBottom: 12 }}>
            Dernières preuves de valeur
          </h2>
          {PROOFS.map((vp) => (
            <div
              key={vp.label}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9 }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: 'var(--green-m)',
                  border: '1px solid var(--green-b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--green-fg)',
                }}
              >
                {vp.icon === 'link' ? <IcoLink size={11} /> : vp.icon === 'doc' ? <IcoDoc size={11} /> : <IcoCheck />}
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--fg2)', lineHeight: 1.35 }}>
                  {vp.label}
                </div>
                <div style={{ fontSize: '0.5rem', color: 'var(--fg4)', marginTop: 1 }}>{vp.date}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)', marginBottom: 1 }}>
                Trafic organique
              </h2>
              <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>Sessions · 20 semaines</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                +72 %
              </div>
              <div style={{ fontSize: '0.5rem', color: 'var(--green-fg)', marginTop: 2 }}>
                vs il y a 20 sem.
              </div>
            </div>
          </div>
          <Spark data={TRAFFIC_SPARK} height={60} />
        </section>
      </div>

      {/* 7 — Top mots-clés */}
      <section className="card" style={{ padding: '0.875rem 1rem' }}>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)', marginBottom: 12 }}>
          Top mots-clés
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Mot-clé', 'Position', 'Volume/mois', 'Évolution'].map((h, i) => (
                <th
                  key={h}
                  className="lbl"
                  style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--bd-solid)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KEYWORDS.map((k) => (
              <tr key={k.kw}>
                <td
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--fg1)',
                    padding: '9px 0',
                    borderBottom: '1px solid var(--bd)',
                  }}
                >
                  {k.kw}
                </td>
                <td
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: k.pos <= 3 ? 'var(--green)' : k.pos <= 10 ? 'var(--fg1)' : 'var(--fg3)',
                    padding: '9px 0',
                    borderBottom: '1px solid var(--bd)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  #{k.pos}
                </td>
                <td
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--fg3)',
                    padding: '9px 0',
                    borderBottom: '1px solid var(--bd)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {k.vol}
                </td>
                <td style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Delta value={k.delta} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
