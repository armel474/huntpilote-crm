'use client';

import { Badge, CompBar, Feed, Gauge, Lbl } from '@/components/ui/Atoms';
import {
  IcoCal,
  IcoCheck,
  IcoDoc,
  IcoGlobe,
  IcoMail,
  IcoPhone,
  IcoPin,
  IcoPlus,
  IcoSrch,
  IcoUser,
  IcoZap,
} from '@/components/ui/Icons';
import {
  ACTIVITY,
  CLIENT,
  CLIENT_SESSIONS,
  COMPETITORS,
  type UxState,
} from '@/lib/data/fiche-client';

/* ── Colonne gauche : contexte client ── */

const STATUS_BY_STATE: Record<UxState, { tone: 'green' | 'blue' | 'yellow'; label: string }> = {
  active: { tone: 'green', label: 'Actif' },
  onboarding: { tone: 'blue', label: 'Onboarding' },
  nodata: { tone: 'yellow', label: 'Sans intégrations' },
  audit: { tone: 'blue', label: 'Audit en cours' },
  stale: { tone: 'yellow', label: 'Données obsolètes' },
  nocritical: { tone: 'green', label: 'Actif' },
  error: { tone: 'yellow', label: 'Erreur partielle' },
};

/** Encadré chaud repris de la v2 (contexte projet, score de santé). */
const boxStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderRadius: 10,
  background: 'var(--bg-muted)',
  marginBottom: '1rem',
};

export function LeftPanel({
  uxState,
  onLaunchAudit,
  auditRunning,
}: {
  uxState: UxState;
  onLaunchAudit: () => void;
  auditRunning: boolean;
}) {
  const status = STATUS_BY_STATE[uxState];
  const contacts: [React.ReactNode, string][] = [
    [<IcoMail key="m" />, CLIENT.email],
    [<IcoPhone key="p" />, CLIENT.phone],
    [<IcoGlobe key="g" />, CLIENT.website],
    [<IcoPin key="a" />, CLIENT.address],
  ];
  const account: [React.ReactNode, string, string][] = [
    [<IcoUser key="u" />, 'Chef de projet', CLIENT.pm],
    [<IcoCal key="c" />, 'Client depuis', CLIENT.since],
    [<IcoSrch key="s" />, 'Dernier audit', CLIENT.lastAudit],
  ];

  return (
    <aside
      className="sc"
      style={{
        width: 250,
        flexShrink: 0,
        borderRight: '1px solid var(--bd-solid)',
        background: 'var(--bg-solid)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '1rem 0.875rem',
      }}
      aria-label="Contexte client"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--bd-solid)',
          marginBottom: '1rem',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: 13,
            background: 'linear-gradient(140deg,#d4edda,#e3ddd1)',
            border: '1.5px solid var(--bd-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            color: 'var(--green-fg)',
            letterSpacing: '-0.02em',
          }}
        >
          {CLIENT.initials}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {CLIENT.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2 }}>
            {CLIENT.sector}
          </div>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 7 }}>
            <Badge label={status.label} tone={status.tone} />
            <Badge label="Client" tone="neutral" />
          </div>
        </div>
      </div>

      <Lbl>Contact</Lbl>
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        {contacts.map(([icon, value]) => (
          <div
            key={value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: 6,
              color: 'var(--fg3)',
              fontSize: '0.6875rem',
            }}
          >
            <span style={{ color: 'var(--fg4)', flexShrink: 0, display: 'flex' }}>{icon}</span>
            {value}
          </div>
        ))}
      </div>

      <Lbl>Services actifs</Lbl>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '8px 0 1rem' }}>
        {CLIENT.services.map((s) => (
          <span
            key={s}
            style={{
              fontSize: '0.5625rem',
              fontWeight: 600,
              padding: '3px 8px',
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

      {/* Contexte & objectif — apport de la v2, essentiel pour cadrer la mission */}
      <div style={boxStyle}>
        <div className="lbl" style={{ marginBottom: 6, color: 'var(--fg1)' }}>
          Contexte &amp; Objectif
        </div>
        <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.65 }}>
          {CLIENT.context}
        </p>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {CLIENT.contextTags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.5rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'rgba(22,163,74,0.12)',
                color: 'var(--green-fg)',
                border: '1px solid var(--green-b)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          ...boxStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div className="lbl" style={{ marginBottom: 4, color: 'var(--fg1)' }}>
          Score Santé SEO
        </div>
        <Gauge value={CLIENT.score} size={76} />
        <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Excellent · +5 pts vs mars</div>
      </div>

      {account.map(([icon, label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 7, marginBottom: 9, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--fg4)', flexShrink: 0, marginTop: 1, display: 'flex' }}>
            {icon}
          </span>
          <div>
            <div className="lbl" style={{ marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg1)', fontWeight: 600 }}>
              {value}
            </div>
          </div>
        </div>
      ))}

      {/* Point d'entrée principal : une fiche neuve se remplit en lançant un audit. */}
      <button
        className="btn-pri"
        type="button"
        onClick={onLaunchAudit}
        disabled={auditRunning}
        style={{
          width: '100%',
          justifyContent: 'center',
          marginTop: 6,
          padding: '0.55rem',
          fontSize: '0.75rem',
        }}
      >
        <IcoZap size={13} />
        {auditRunning ? 'Audit en cours…' : 'Lancer un audit'}
      </button>
    </aside>
  );
}

/* ── Colonne droite : intelligence continue ── */

const COMM_ICON = { cal: IcoCal, mail: IcoMail, phone: IcoPhone } as const;

export function RightPanel({ onGenerateReport }: { onGenerateReport: () => void }) {
  const maxCompetitor = Math.max(...COMPETITORS.map((c) => c.sessions), CLIENT_SESSIONS) * 1.2;
  const myPct = (CLIENT_SESSIONS / maxCompetitor) * 100;

  return (
    <aside
      className="sc"
      style={{
        width: 232,
        flexShrink: 0,
        borderLeft: '1px solid var(--bd-solid)',
        background: 'var(--bg-solid)',
        overflowY: 'auto',
        padding: '1rem 0.875rem',
      }}
      aria-label="Contexte et intelligence continue"
    >
      {/* Prochaine action — pastille de la v2, avec le rappel du dernier envoi */}
      <Lbl>Prochaine action</Lbl>
      <div
        className="card"
        style={{ padding: '11px 12px', margin: '8px 0 14px', boxShadow: 'none' }}
      >
        <div
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: 'var(--yellow-fg)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 4,
          }}
        >
          Rapport mensuel · 2 juin
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)', marginBottom: 3 }}>
          Générer le rapport client
        </div>
        <div
          style={{
            fontSize: '0.5625rem',
            color: 'var(--fg3)',
            lineHeight: 1.4,
            marginBottom: 8,
          }}
        >
          Dernier : 2 mai · 8 sections · Envoyé
        </div>
        <button
          className="btn-sm"
          type="button"
          onClick={onGenerateReport}
          style={{
            background: 'var(--green-m)',
            border: '1px solid var(--green-b)',
            color: 'var(--green-fg)',
          }}
        >
          <IcoDoc size={11} />
          Générer le rapport
        </button>
      </div>

      {/* Modules inclus — apport de la v2 */}
      <Lbl>Modules inclus</Lbl>
      <div style={{ marginTop: 8 }}>
        {CLIENT.services.map((m) => (
          <div
            key={m}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: 7,
              fontSize: '0.6875rem',
              color: 'var(--fg2)',
            }}
          >
            <span style={{ color: 'var(--green)', display: 'flex' }}>
              <IcoCheck />
            </span>
            {m}
          </div>
        ))}
      </div>
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginTop: 6,
          marginBottom: '1rem',
          fontSize: '0.6875rem',
          color: 'var(--fg4)',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontFamily: 'var(--font)',
        }}
      >
        <IcoPlus size={11} />
        Ajouter un module
      </button>

      <div style={{ height: 1, background: 'var(--bd-solid)', marginBottom: '1rem' }} />

      <Lbl>Concurrence</Lbl>
      <div style={{ marginTop: 8, marginBottom: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--green-fg)' }}>
            {CLIENT.name} <span style={{ fontSize: '0.5625rem', fontWeight: 600 }}>(vous)</span>
          </span>
          <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--green)' }}>
            34,8k/mois
          </span>
        </div>
        <div
          style={{
            height: 5,
            background: 'var(--green-m)',
            border: '1px solid var(--green-b)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${myPct}%`,
              background: 'var(--green)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>
      {COMPETITORS.map((c) => (
        <CompBar
          key={c.name}
          name={c.name}
          sessions={c.sessions}
          label={c.label}
          clientSessions={CLIENT_SESSIONS}
        />
      ))}
      <div
        style={{
          fontSize: '0.5625rem',
          color: 'var(--fg4)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 10,
            height: 2,
            background: 'var(--green)',
            display: 'inline-block',
            borderRadius: 1,
          }}
        />
        = votre trafic
      </div>

      <div style={{ height: 1, background: 'var(--bd-solid)', marginBottom: '1rem' }} />

      <Lbl>Activité récente</Lbl>
      <div style={{ marginTop: 8 }}>
        <Feed items={ACTIVITY} />
      </div>
    </aside>
  );
}

export { COMM_ICON };
