'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { AgencePanel } from '@/app/parametres/AgencePanel';
import { CataloguePanel } from '@/app/parametres/CataloguePanel';
import { EquipePanel } from '@/app/parametres/EquipePanel';
import { Field, SectionHead } from '@/app/parametres/bits';
import type { Session } from '@/lib/auth';
import { permissionsOf, type AgencyData } from '@/lib/queries/agence';
import { ROLE_LABEL } from '@/lib/format';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { Badge } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import {
  IcoBell,
  IcoCard,
  IcoCheck,
  IcoCoin,
  IcoTool,
  IcoUsers,
  IcoWarn,
  type IconProps,
} from '@/components/ui/Icons';
import {
  AGENCY_INTEGRATIONS,
  CONSO_BUDGET,
  CONSO_BASE_USED,
  CONSO_CLIENT_COSTS,
  CONSO_SCENARIOS,
  CONSO_SETTINGS,
  CONSO_STATES,
  CONSO_TYPES,
  NOTIFICATIONS,
  PLAN_USAGE,
  fmt$,
  resolveConsoClient,
  type ConsoStateId,
  type Integration,
  type Notification,
  type SectionId,
} from '@/lib/data/settings';

function IcoBuilding(p: IconProps) {
  return (
    <svg
      width={p.size ?? 15}
      height={p.size ?? 15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="9" x2="9" y2="9.01" />
      <line x1="15" y1="9" x2="15" y2="9.01" />
      <line x1="9" y1="13" x2="9" y2="13.01" />
      <line x1="15" y1="13" x2="15" y2="13.01" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}


function IcoTag(p: IconProps) {
  return (
    <svg
      width={p.size ?? 15}
      height={p.size ?? 15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

/**
 * Lit `?section=` une fois au montage et applique la section demandée —
 * utilisé par le geste « Connecter » de Communications (session 7.2), qui
 * doit ouvrir directement l'onglet Intégrations. `useSearchParams` exige une
 * frontière `<Suspense>` au-dessus de lui pour ne pas casser le rendu
 * statique (`next build`) : seul ce petit composant, sans rendu propre, en
 * dépend — le reste de la page s'affiche immédiatement.
 */
function SectionFromQuery({ onSection }: { onSection: (s: SectionId) => void }) {
  const searchParams = useSearchParams();
  const requested = searchParams.get('section');
  useEffect(() => {
    if (requested && SECTIONS.some((s) => s.id === requested)) {
      onSection(requested as SectionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);
  return null;
}

const SECTIONS: { id: SectionId; label: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  { id: 'agence', label: "Profil de l'agence", Icon: IcoBuilding },
  { id: 'catalogue', label: 'Catalogue', Icon: IcoTag },
  { id: 'equipe', label: "Membres d'équipe", Icon: IcoUsers },
  { id: 'integrations', label: 'Intégrations', Icon: IcoTool },
  { id: 'notifications', label: 'Notifications', Icon: IcoBell },
  { id: 'facturation', label: 'Abonnement', Icon: IcoCard },
  { id: 'consommation', label: 'Consommation', Icon: IcoCoin },
];

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

/* ── Sections ── */

function IntegrationsPanel({
  ints,
  onToggle,
}: {
  ints: Integration[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="Intégrations"
        sub="Connectez vos outils pour alimenter les rapports et l'agent IA."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {ints.map((it) => (
          <div
            key={it.id}
            className="card"
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: it.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                }}
              >
                {it.letter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{it.name}</h3>
                <p style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>{it.desc}</p>
              </div>
              {it.connected && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingTop: 11,
                borderTop: '1px solid var(--bd)',
              }}
            >
              {it.connected ? (
                <>
                  <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', flex: 1 }}>
                    Connecté · <b style={{ color: 'var(--green-fg)' }}>{it.accounts} comptes</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggle(it.id)}
                    className="btn-out"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.6875rem' }}
                  >
                    Déconnecter
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.625rem', color: 'var(--fg4)', flex: 1 }}>
                    Non connecté
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggle(it.id)}
                    className="btn-pri"
                    style={{ padding: '0.3rem 0.85rem', fontSize: '0.6875rem' }}
                  >
                    Connecter
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel({
  notifs,
  onToggle,
}: {
  notifs: Notification[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <SectionHead
        title="Notifications"
        sub="Choisissez les événements qui déclenchent une alerte."
      />
      <div className="card" style={{ padding: '0.5rem 1.125rem' }}>
        {notifs.map((n, i) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0.875rem 0',
              borderBottom: i < notifs.length - 1 ? '1px solid var(--bd)' : 'none',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg1)' }}>
                {n.label}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>{n.desc}</div>
            </div>
            <Toggle
              on={n.on}
              onClick={() => onToggle(n.id)}
              label={`${n.on ? 'Désactiver' : 'Activer'} : ${n.label}`}
            />
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          marginTop: 14,
          padding: '0.875rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 180 }}>
          <label htmlFor="st-channel" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            Canal de réception
          </label>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>
            Où envoyer les alertes
          </div>
        </div>
        <select id="st-channel" className="fld" style={{ width: 200 }} defaultValue="both">
          <option value="both">Courriel + dans l&apos;app</option>
          <option value="email">Courriel seulement</option>
          <option value="app">Dans l&apos;app seulement</option>
        </select>
      </div>
    </div>
  );
}

function FacturationPanel() {
  return (
    <div>
      <SectionHead
        title="Abonnement"
        sub="Gérez le forfait de votre agence et le mode de paiement."
      />

      <div
        className="card"
        style={{ padding: '1.25rem', marginBottom: 14, borderTop: '3px solid var(--green)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Forfait Croissance
              </h3>
              <Badge label="Actif" tone="green" />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 4 }}>
              Jusqu&apos;à 15 clients · 5 sièges · rapports illimités · agent IA inclus
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              149 $
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--fg4)' }}>/mois</span>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>
              Prochain prélèvement : 1 juil. 2026
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--bd)',
          }}
        >
          <button className="btn-pri" type="button">
            Passer à Studio
          </button>
          <button className="btn-out" type="button">
            Gérer le forfait
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {PLAN_USAGE.map(([label, value, max, unit]) => {
          const ratio = value / max;
          return (
            <div key={label} className="card" style={{ padding: '0.875rem 1rem' }}>
              <div className="lbl" style={{ marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                  {value}
                  {unit}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>
                  / {max}
                  {unit}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(ratio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label} : ${value}${unit} sur ${max}${unit}`}
                style={{
                  height: 5,
                  background: 'var(--bg-muted)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${ratio * 100}%`,
                    background: ratio > 0.8 ? 'var(--yellow)' : 'var(--green)',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="card"
        style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 30,
            borderRadius: 6,
            background: 'var(--primary)',
            color: 'var(--primary-fg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '0.5625rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          VISA
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em' }}>
            •••• 4242
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>Expire 08/27 · Marie Chen</div>
        </div>
        <button className="btn-out" type="button">
          Mettre à jour
        </button>
      </div>
    </div>
  );
}

function ConsommationPanel({
  state,
  onState,
  freq,
  onFreq,
  kw,
  onKw,
  zones,
  onZones,
  saved,
  onSave,
}: {
  state: ConsoStateId;
  onState: (s: ConsoStateId) => void;
  freq: (typeof CONSO_SETTINGS.freq.options)[number];
  onFreq: (v: (typeof CONSO_SETTINGS.freq.options)[number]) => void;
  kw: number;
  onKw: (v: number) => void;
  zones: (typeof CONSO_SETTINGS.zones.options)[number];
  onZones: (v: (typeof CONSO_SETTINGS.zones.options)[number]) => void;
  saved: boolean;
  onSave: () => void;
}) {
  const scen = CONSO_SCENARIOS[state];
  const scale = scen.used / CONSO_BASE_USED;
  const clients = CONSO_CLIENT_COSTS.map((c) => {
    const info = resolveConsoClient(c.clientId);
    let cost = Math.round(c.base * scale);
    if (state === 'clientover' && info.name === 'Boréal Immobilier') cost = Math.round(cost * 3.2);
    return { ...info, cost };
  });
  const types = CONSO_TYPES.map((t) => ({ ...t, cost: Math.round(t.base * scale) }));
  const totalTypes = types.reduce((s, t) => s + t.cost, 0);
  const projection = Math.round((scen.used / scen.day) * 30);
  const pct = Math.round((scen.used / CONSO_BUDGET) * 100);
  const overClient = clients.find((c) => c.mrr > 0 && c.cost >= c.mrr);
  const S = CONSO_SETTINGS;
  const impactFreq = Math.round(
    CONSO_TYPES.find((t) => t.id === 'crawl')!.base *
      (S.freq.mult[S.freq.options.indexOf(freq)] - S.freq.mult[1]),
  );
  const impactKw = Math.round(CONSO_TYPES.find((t) => t.id === 'positions')!.base * ((kw - 30) / 30));
  const impactZones = Math.round(
    CONSO_TYPES.find((t) => t.id === 'serp')!.base *
      (S.zones.mult[S.zones.options.indexOf(zones)] - S.zones.mult[1]),
  );
  const impact = impactFreq + impactKw + impactZones;
  const alert: 'red' | 'yellow' | null =
    state === 'depasse' ? 'red' : state === 'approche' ? 'yellow' : overClient ? 'red' : null;

  return (
    <div>
      <SectionHead
        title="Consommation"
        sub="Où part l'argent, et est-ce que ça vaut le coup ?"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DemoOnly>
              <select
                className="fld"
                style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                value={state}
                onChange={(e) => onState(e.target.value as ConsoStateId)}
                aria-label="État de démonstration"
              >
                {CONSO_STATES.map(([id, l]) => (
                  <option key={id} value={id}>
                    {l}
                  </option>
                ))}
              </select>
            </DemoOnly>
            {saved ? (
              <Badge label="Réglages à jour" tone="green" />
            ) : (
              <button className="btn-pri" type="button" onClick={onSave}>
                <IcoCheck size={12} />
                Enregistrer les réglages
              </button>
            )}
          </div>
        }
      />

      {alert && (
        <div
          className="card"
          style={{
            padding: '1rem 1.125rem',
            marginBottom: 14,
            borderTop: `3px solid ${alert === 'red' ? 'var(--red-b)' : 'var(--yellow-b)'}`,
            background: alert === 'red' ? 'var(--red-m)' : 'var(--yellow-m)',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span
              aria-hidden="true"
              style={{ color: alert === 'red' ? 'var(--red)' : 'var(--yellow-fg)', flexShrink: 0, marginTop: 1 }}
            >
              <IcoWarn />
            </span>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.55 }}>
              {state === 'depasse' && (
                <span>
                  <b>
                    Budget mensuel dépassé — {fmt$(scen.used)} sur {fmt$(CONSO_BUDGET)}.
                  </b>{' '}
                  Les requêtes lourdes (crawl complet, analyse approfondie) sont mises en file
                  d&apos;attente jusqu&apos;au renouvellement du 1<sup>er</sup> octobre. Les
                  requêtes légères continuent normalement.
                </span>
              )}
              {state === 'approche' && (
                <span>
                  <b>Approche du budget mensuel — {pct} % consommé.</b> Au rythme actuel, le budget
                  sera atteint avant la fin du mois.
                </span>
              )}
              {state !== 'depasse' && state !== 'approche' && overClient && (
                <span>
                  <b>
                    {overClient.name} coûte {fmt$(overClient.cost)} ce mois, pour{' '}
                    {fmt$(overClient.mrr)} de MRR.
                  </b>{' '}
                  Ce compte consomme plus qu&apos;il ne rapporte — vérifiez le nombre de
                  mots-clés suivis ou la densité des zones locales pour ce client.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ padding: '0.875rem 1rem' }}>
          <div className="lbl" style={{ marginBottom: 8 }}>
            Consommation du mois
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$(scen.used)}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>/ {fmt$(CONSO_BUDGET)}</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.min(pct, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Consommation du mois : ${pct} % du budget`}
            style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 999, overflow: 'hidden' }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(pct, 100)}%`,
                background: pct > 100 ? 'var(--red)' : pct > 85 ? 'var(--yellow)' : 'var(--green)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
        <div className="card" style={{ padding: '0.875rem 1rem' }}>
          <div className="lbl" style={{ marginBottom: 8 }}>
            Projection fin de mois
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {fmt$(projection)}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>/ {fmt$(CONSO_BUDGET)}</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.min(Math.round((projection / CONSO_BUDGET) * 100), 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Projection de fin de mois : ${fmt$(projection)} sur ${fmt$(CONSO_BUDGET)}`}
            style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 999, overflow: 'hidden' }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min((projection / CONSO_BUDGET) * 100, 100)}%`,
                background: projection > CONSO_BUDGET ? 'var(--red)' : 'var(--green)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
        <div className="card" style={{ padding: '0.875rem 1rem' }}>
          <div className="lbl" style={{ marginBottom: 8 }}>
            Jour du mois
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {scen.day}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>/ 30</span>
          </div>
          <div style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(scen.day / 30) * 100}%`,
                background: 'var(--fg4)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 3 }}>
        Répartition par client
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginBottom: 10 }}>
        Coût du mois rapporté au MRR — un compte qui coûte plus qu&apos;il ne rapporte doit sauter
        aux yeux.
      </p>
      <div className="card" style={{ padding: '0.5rem 1.125rem 0.875rem', marginBottom: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              {['Compte', 'Coût du mois', 'Coût / MRR', 'MRR'].map((h) => (
                <th
                  key={h}
                  className="lbl"
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--bd-solid)', textAlign: 'left' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const ratio = c.mrr > 0 ? c.cost / c.mrr : null;
              const over = ratio !== null && ratio >= 1;
              return (
                <tr key={c.name}>
                  <td
                    style={{
                      padding: '9px 0',
                      borderBottom: '1px solid var(--bd)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      flexWrap: 'wrap',
                    }}
                  >
                    {c.name}
                    {c.type === 'prospect' && <Badge label="Prospect" tone="yellow" />}
                    {over && <Badge label="Coûte plus qu'il ne rapporte" tone="red" />}
                  </td>
                  <td
                    style={{
                      padding: '9px 0',
                      borderBottom: '1px solid var(--bd)',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmt$(c.cost)}
                  </td>
                  <td style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
                    {ratio !== null ? (
                      <div
                        role="progressbar"
                        aria-valuenow={Math.min(Math.round(ratio * 100), 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${c.name} : coût à ${Math.round(ratio * 100)} % du MRR`}
                        style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 999, overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(ratio * 100, 100)}%`,
                            background: over ? 'var(--red)' : 'var(--green)',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>
                        Sans MRR · prospection
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '9px 0',
                      borderBottom: '1px solid var(--bd)',
                      fontSize: '0.8125rem',
                      color: 'var(--fg2)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {c.mrr > 0 ? fmt$(c.mrr) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ padding: '0.875rem 1rem' }}>
          <div className="lbl" style={{ marginBottom: 10 }}>
            Répartition par type d&apos;appel
          </div>
          {types.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', marginBottom: 7 }}>
              <span style={{ width: '7.5rem', color: 'var(--fg2)', fontWeight: 600, flexShrink: 0 }}>
                {t.label}
              </span>
              <div style={{ flex: 1, height: 6, background: 'var(--bg-muted)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(t.cost / totalTypes) * 100}%`,
                    background: 'var(--blue-fg)',
                    borderRadius: 999,
                  }}
                />
              </div>
              <span style={{ width: '3.2rem', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {fmt$(t.cost)}
              </span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '0.875rem 1rem' }}>
          <div className="lbl" style={{ marginBottom: 10 }}>
            Historique · 12 mois
          </div>
          {scen.history.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--fg4)', padding: '18px 0', textAlign: 'center' }}>
              Premier mois d&apos;utilisation · aucun historique encore
            </p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {scen.history.map((h) => (
                <div
                  key={h.m}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 3,
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '3px 3px 0 0',
                      background: h.used > CONSO_BUDGET ? 'var(--red)' : 'var(--green-b)',
                      height: `${Math.min((h.used / (CONSO_BUDGET * 1.3)) * 100, 100)}%`,
                    }}
                  />
                  <span style={{ fontSize: '0.4375rem', color: 'var(--fg4)' }}>{h.m}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 3 }}>
        Réglages qui pilotent le coût
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginBottom: 10 }}>
        Ces seuils se règlent au niveau de l&apos;agence, pas dans le code.
      </p>
      <div className="card" style={{ padding: '1rem 1.125rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 14 }}>
          <Field label="Fréquence des relevés (crawl)" htmlFor="conso-freq">
            <select
              id="conso-freq"
              className="fld"
              value={freq}
              onChange={(e) => onFreq(e.target.value as typeof freq)}
            >
              {CONSO_SETTINGS.freq.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Densité des zones locales (SERP)" htmlFor="conso-zones">
            <select
              id="conso-zones"
              className="fld"
              value={zones}
              onChange={(e) => onZones(e.target.value as typeof zones)}
            >
              {CONSO_SETTINGS.zones.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={`Mots-clés suivis par client (défaut) · ${kw}`} htmlFor="conso-kw">
          <input
            id="conso-kw"
            type="range"
            min={CONSO_SETTINGS.kw.min}
            max={CONSO_SETTINGS.kw.max}
            step={CONSO_SETTINGS.kw.step}
            value={kw}
            onChange={(e) => onKw(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }}
          />
        </Field>
        <div
          style={{
            marginTop: 14,
            padding: '0.6rem 0.875rem',
            borderRadius: 9,
            background: impact >= 0 ? 'var(--yellow-m)' : 'var(--green-m)',
            fontSize: '0.75rem',
          }}
        >
          <b>
            {impact >= 0 ? '+' : ''}
            {impact} $/mois estimé
          </b>{' '}
          avec ces réglages, par rapport à la configuration actuelle.
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */

export function ParametresView({
  session,
  agency,
}: {
  session: Session | null;
  agency: AgencyData;
}) {
  const [section, setSection] = useState<SectionId>('agence');
  const mine = permissionsOf(agency.members, session?.memberId);
  const [ints, setInts] = useState<Integration[]>(AGENCY_INTEGRATIONS);
  const [notifs, setNotifs] = useState<Notification[]>(NOTIFICATIONS);
  const [consoState, setConsoState] = useState<ConsoStateId>('ok');
  const [freq, setFreq] = useState<(typeof CONSO_SETTINGS.freq.options)[number]>('Bihebdomadaire');
  const [kw, setKw] = useState(30);
  const [zones, setZones] = useState<(typeof CONSO_SETTINGS.zones.options)[number]>('3 zones');
  const [consoSaved, setConsoSaved] = useState(true);

  const pickConsoState = (s: ConsoStateId) => {
    setConsoState(s);
    setFreq('Bihebdomadaire');
    setKw(30);
    setZones('3 zones');
    setConsoSaved(true);
  };

  const toggleInt = (id: string) =>
    setInts((p) =>
      p.map((it) =>
        it.id === id
          ? { ...it, connected: !it.connected, accounts: it.connected ? undefined : 8 }
          : it,
      ),
    );

  const toggleNotif = (id: string) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, on: !n.on } : n)));

  return (
    <AppShell
      header={
        <CRMHeader
          title="Paramètres"
          period=""
          subtitle={section === 'consommation' ? undefined : "Configuration de l'agence"}
          crumbs={
            section === 'consommation'
              ? [
                  { label: 'HuntPilote', href: '/dashboard' },
                  { label: 'Paramètres', href: '/parametres' },
                  { label: 'Consommation' },
                ]
              : undefined
          }
        />
      }
    >
      <Suspense fallback={null}>
        <SectionFromQuery onSection={setSection} />
      </Suspense>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <nav
          style={{
            width: 230,
            flexShrink: 0,
            borderRight: '1px solid var(--bd-solid)',
            background: 'var(--bg-solid)',
            padding: '1.25rem 0.875rem',
            display: 'flex',
            flexDirection: 'column',
          }}
          aria-label="Sections des paramètres"
        >
          <div className="lbl" style={{ padding: '0 0.7rem', marginBottom: 10 }}>
            Réglages
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`set-nav${section === s.id ? ' on' : ''}`}
                onClick={() => setSection(s.id)}
                aria-current={section === s.id ? 'page' : undefined}
              >
                <s.Icon size={15} />
                {s.label}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '0.875rem',
              borderRadius: 12,
              background: 'var(--bg-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                }}
              >
                {session?.initials ?? '—'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {session?.fullName ?? 'Personne connectée'}
                </div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>
                  {session?.role ? ROLE_LABEL[session.role] : 'Aucune session'}
                </div>
              </div>
            </div>
            {session ? (
              <form method="post" action="/api/auth/deconnexion">
                <button
                  className="btn-out"
                  type="submit"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.35rem', fontSize: '0.6875rem' }}
                >
                  Se déconnecter
                </button>
              </form>
            ) : (
              <a
                href="/connexion?suite=/parametres"
                className="btn-out"
                style={{ width: '100%', justifyContent: 'center', padding: '0.35rem', fontSize: '0.6875rem', textDecoration: 'none' }}
              >
                Se connecter
              </a>
            )}
          </div>
        </nav>

        <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {section === 'agence' && (
              <AgencePanel agency={agency.agency} canEdit={mine.includes('manage_agency')} />
            )}
            {section === 'catalogue' && <CataloguePanel items={agency.items} offers={agency.offers} />}
            {section === 'equipe' && (
              <EquipePanel
                members={agency.members}
                session={session}
                roleDefaults={agency.roleDefaults}
                canManage={mine.includes('manage_team')}
              />
            )}
            {section === 'integrations' && <IntegrationsPanel ints={ints} onToggle={toggleInt} />}
            {section === 'notifications' && (
              <NotificationsPanel notifs={notifs} onToggle={toggleNotif} />
            )}
            {section === 'facturation' && <FacturationPanel />}
            {section === 'consommation' && (
              <ConsommationPanel
                state={consoState}
                onState={pickConsoState}
                freq={freq}
                onFreq={(v) => {
                  setFreq(v);
                  setConsoSaved(false);
                }}
                kw={kw}
                onKw={(v) => {
                  setKw(v);
                  setConsoSaved(false);
                }}
                zones={zones}
                onZones={(v) => {
                  setZones(v);
                  setConsoSaved(false);
                }}
                saved={consoSaved}
                onSave={() => setConsoSaved(true)}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
