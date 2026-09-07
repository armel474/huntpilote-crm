'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  IcoCal,
  IcoCheck,
  IcoClock,
  IcoDoc,
  IcoLink,
  IcoMail,
  IcoPlus,
  IcoTarget,
  IcoWarn,
  IcoZap,
  type IconProps,
} from '@/components/ui/Icons';
import {
  AUTOMATIONS,
  CATEGORIES,
  CATEGORY_FILTERS,
  TEMPLATES,
  type Automation,
  type CatId,
  type GlyphName,
} from '@/lib/data/workflow';

const GLYPHS: Record<GlyphName, (p: IconProps) => React.ReactElement> = {
  warn: IcoWarn,
  cal: IcoCal,
  clock: IcoClock,
  trophy: IcoTarget,
  link: IcoLink,
  bolt: IcoZap,
  task: IcoCheck,
  doc: IcoDoc,
  mail: IcoMail,
};

function Glyph({ name, size = 12 }: { name: GlyphName; size?: number }) {
  const C = GLYPHS[name] ?? IcoZap;
  return <C size={size} />;
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className="tgl"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      style={{ background: on ? 'var(--green)' : 'var(--bd-strong)' }}
    >
      <span className="tgl-knob" style={{ left: on ? 18 : 2 }} />
    </button>
  );
}

/** Maillon « Quand » ou « Alors » de la règle. */
function FlowChip({
  kind,
  label,
  icon,
  color,
  bg,
  border,
}: {
  kind: 'when' | 'then';
  label: string;
  icon: GlyphName;
  color?: string;
  bg?: string;
  border?: string;
}) {
  const isWhen = kind === 'when';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '0.4rem 0.7rem',
        borderRadius: 9,
        background: isWhen ? 'var(--bg-muted)' : bg,
        border: `1px solid ${isWhen ? 'var(--bd-solid)' : border}`,
        minWidth: 0,
      }}
    >
      <span style={{ color: isWhen ? 'var(--fg3)' : color, flexShrink: 0, display: 'flex' }}>
        <Glyph name={icon} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div className="lbl" style={{ color: isWhen ? 'var(--fg4)' : color, marginBottom: 1 }}>
          {isWhen ? 'Quand' : 'Alors'}
        </div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg1)', lineHeight: 1.25 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function AutomationRow({ a, onToggle }: { a: Automation; onToggle: (id: number) => void }) {
  const cat = CATEGORIES[a.cat];
  return (
    <article
      className="card auto-row"
      style={{
        padding: '0.875rem 1rem',
        opacity: a.active ? 1 : 0.72,
        borderLeft: a.ai ? '3px solid var(--violet)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, flexWrap: 'wrap' }}>
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            background: cat.bg,
            border: `1px solid ${cat.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cat.color,
          }}
        >
          <Glyph name={a.icon} size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)' }}>{a.name}</h3>
            {a.ai && (
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  color: 'var(--violet-fg)',
                  background: 'var(--violet-m)',
                  border: '1px solid var(--violet-b)',
                  borderRadius: 999,
                  padding: '1px 7px',
                }}
              >
                ✦ IA
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>{a.desc}</p>
        </div>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background: cat.bg,
            border: `1px solid ${cat.border}`,
            color: cat.color,
            flexShrink: 0,
          }}
        >
          {cat.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              color: a.active ? 'var(--green-fg)' : 'var(--fg4)',
              minWidth: 46,
              textAlign: 'right',
            }}
          >
            {a.active ? 'Active' : 'En pause'}
          </span>
          <Toggle
            on={a.active}
            onClick={() => onToggle(a.id)}
            label={`${a.active ? 'Désactiver' : 'Activer'} : ${a.name}`}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 9,
          marginTop: 11,
          paddingLeft: 45,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <FlowChip kind="when" label={a.trigger} icon={a.icon} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--fg4)', flexShrink: 0 }}>
          <Arrow />
        </div>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <FlowChip
            kind="then"
            label={a.action}
            icon={a.actionIcon}
            color={cat.color}
            bg={cat.bg}
            border={cat.border}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 10,
          paddingLeft: 45,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.5625rem',
            color: 'var(--fg4)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <IcoZap size={11} />
          {a.runs} exécutions
        </span>
        <span
          style={{
            fontSize: '0.5625rem',
            color: 'var(--fg4)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <IcoClock size={11} />
          Dernière : {a.last}
        </span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>
          Succès :{' '}
          <b style={{ color: a.success >= 98 ? 'var(--green-fg)' : 'var(--yellow-fg)' }}>
            {a.success} %
          </b>
        </span>
        <button
          className="btn-out"
          type="button"
          style={{ marginLeft: 'auto', padding: '0.25rem 0.7rem', fontSize: '0.625rem' }}
        >
          Modifier
        </button>
      </div>
    </article>
  );
}

function StatStrip({ autos }: { autos: Automation[] }) {
  const activeCount = autos.filter((a) => a.active).length;
  const stats = [
    {
      label: 'Automatisations actives',
      value: `${activeCount}`,
      sub: `sur ${autos.length} configurées`,
      color: 'var(--fg1)',
    },
    { label: 'Exécutions ce mois', value: '348', sub: '+62 vs mois dernier', color: 'var(--fg1)' },
    { label: 'Temps économisé', value: '42 h', sub: 'estimé ce mois-ci', color: 'var(--green)' },
    { label: 'Taux de succès', value: '98,6 %', sub: 'sur 30 jours', color: 'var(--fg1)' },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
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

function TemplateCard({ t }: { t: (typeof TEMPLATES)[number] }) {
  const cat = CATEGORIES[t.cat];
  return (
    <article
      className="card auto-row"
      style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: 9 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            background: cat.bg,
            border: `1px solid ${cat.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: cat.color,
          }}
        >
          <Glyph name={t.icon} />
        </div>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.name}
          {t.ai && (
            <span
              style={{
                fontSize: '0.5rem',
                fontWeight: 700,
                color: 'var(--violet-fg)',
                background: 'var(--violet-m)',
                border: '1px solid var(--violet-b)',
                borderRadius: 999,
                padding: '0 5px',
              }}
            >
              ✦
            </span>
          )}
        </h3>
      </div>
      <p style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5, flex: 1 }}>{t.desc}</p>
      <button
        className="btn-out"
        type="button"
        style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', fontSize: '0.6875rem' }}
      >
        <IcoPlus size={12} />
        Utiliser ce modèle
      </button>
    </article>
  );
}

export function WorkflowView() {
  const [autos, setAutos] = useState<Automation[]>(AUTOMATIONS);
  const [tab, setTab] = useState<'actives' | 'modeles'>('actives');
  const [filter, setFilter] = useState<'tous' | CatId>('tous');

  const toggle = (id: number) =>
    setAutos((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));

  const activeCount = autos.filter((a) => a.active).length;
  const shown = filter === 'tous' ? autos : autos.filter((a) => a.cat === filter);

  return (
    <AppShell
      header={
        <CRMHeader
          title="Workflow & Automatisations"
          subtitle={`${activeCount} automatisations actives · 42 h économisées ce mois`}
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
          aria-label="Sections du workflow"
          style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 999, background: 'var(--bg-muted)' }}
        >
          {([
            { value: 'actives' as const, label: 'Mes automatisations' },
            { value: 'modeles' as const, label: 'Modèles' },
          ]).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`tab${tab === value ? ' on' : ''}`}
              onClick={() => setTab(value)}
              style={{ padding: '0.3rem 0.85rem' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.625rem',
              color: 'var(--fg4)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--green)',
                display: 'inline-block',
              }}
            />
            Agent HuntPilote en service
          </span>
          <button className="btn-pri" type="button">
            <IcoPlus size={12} />
            Créer une automatisation
          </button>
        </div>
      </div>

      {tab === 'actives' && <StatStrip autos={autos} />}

      <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.125rem 1.5rem' }}>
        {tab === 'actives' ? (
          <>
            <div
              role="tablist"
              aria-label="Filtrer par catégorie"
              style={{
                display: 'flex',
                gap: 4,
                padding: 4,
                borderRadius: 999,
                background: 'var(--bg-muted)',
                width: 'fit-content',
                marginBottom: 14,
                flexWrap: 'wrap',
              }}
            >
              {CATEGORY_FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  className={`tab${filter === id ? ' on' : ''}`}
                  onClick={() => setFilter(id)}
                  style={{ fontSize: '0.6875rem', padding: '0.32rem 0.75rem' }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {shown.map((a) => (
                <AutomationRow key={a.id} a={a} onToggle={toggle} />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>
              Modèles prêts à l&apos;emploi
            </h2>
            <p style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginBottom: 14 }}>
              Ajoutez une automatisation en un clic, puis personnalisez-la.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(248px,1fr))',
                gap: 10,
              }}
            >
              {TEMPLATES.map((t) => (
                <TemplateCard key={t.name} t={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
