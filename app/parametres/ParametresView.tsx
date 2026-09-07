'use client';

import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { Badge } from '@/components/ui/Atoms';
import {
  IcoBell,
  IcoCard,
  IcoCheck,
  IcoLogo,
  IcoMore,
  IcoPlus,
  IcoTool,
  IcoUsers,
  type IconProps,
} from '@/components/ui/Icons';
import {
  AGENCY_INTEGRATIONS,
  NOTIFICATIONS,
  PLAN_USAGE,
  ROLE_TONES,
  TEAM,
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

const SECTIONS: { id: SectionId; label: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  { id: 'agence', label: "Profil de l'agence", Icon: IcoBuilding },
  { id: 'equipe', label: "Membres d'équipe", Icon: IcoUsers },
  { id: 'integrations', label: 'Intégrations', Icon: IcoTool },
  { id: 'notifications', label: 'Notifications', Icon: IcoBell },
  { id: 'facturation', label: 'Abonnement', Icon: IcoCard },
];

function Field({
  label,
  children,
  span,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
  htmlFor?: string;
}) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : 'auto' }}>
      <label htmlFor={htmlFor} className="lbl" style={{ display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{title}</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 3 }}>{sub}</p>
      </div>
      {action}
    </div>
  );
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

/* ── Sections ── */

function AgencePanel() {
  return (
    <div>
      <SectionHead
        title="Profil de l'agence"
        sub="Ces informations apparaissent sur les rapports envoyés aux clients."
        action={
          <button className="btn-pri" type="button">
            <IcoCheck size={12} />
            Enregistrer
          </button>
        }
      />
      <div className="card" style={{ padding: '1.25rem', marginBottom: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            paddingBottom: 18,
            borderBottom: '1px solid var(--bd)',
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'var(--primary)',
              color: 'var(--primary-fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IcoLogo size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              HuntPilote
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2 }}>
              Logo affiché sur les rapports · PNG ou SVG, 512×512 px
            </p>
            <button
              className="btn-out"
              type="button"
              style={{ marginTop: 8, padding: '0.3rem 0.75rem', fontSize: '0.6875rem' }}
            >
              Changer le logo
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Nom de l'agence" htmlFor="st-name">
            <input id="st-name" className="fld" defaultValue="HuntPilote" />
          </Field>
          <Field label="Site web" htmlFor="st-web">
            <input id="st-web" className="fld" defaultValue="huntpilote.ca" />
          </Field>
          <Field label="Courriel de contact" htmlFor="st-mail">
            <input id="st-mail" className="fld" defaultValue="bonjour@huntpilote.ca" />
          </Field>
          <Field label="Téléphone" htmlFor="st-tel">
            <input id="st-tel" className="fld" defaultValue="(514) 555-0100" />
          </Field>
          <Field label="Adresse" span htmlFor="st-adr">
            <input
              id="st-adr"
              className="fld"
              defaultValue="1200 av. McGill College, Montréal, QC H3B 4G7"
            />
          </Field>
          <Field label="Fuseau horaire" htmlFor="st-tz">
            <select id="st-tz" className="fld" defaultValue="et">
              <option value="et">(GMT-5) Heure de l&apos;Est — Montréal</option>
              <option value="pt">(GMT-8) Heure du Pacifique</option>
              <option value="ce">(GMT+1) Europe centrale</option>
            </select>
          </Field>
          <Field label="Devise" htmlFor="st-cur">
            <select id="st-cur" className="fld" defaultValue="cad">
              <option value="cad">CAD — Dollar canadien ($)</option>
              <option value="usd">USD — Dollar américain ($)</option>
              <option value="eur">EUR — Euro (€)</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}

function EquipePanel() {
  const cell: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid var(--bd)' };
  return (
    <div>
      <SectionHead
        title="Membres d'équipe"
        sub="4 membres · 4 sièges utilisés sur 5 inclus dans votre forfait."
        action={
          <button className="btn-pri" type="button">
            <IcoPlus size={12} />
            Inviter un membre
          </button>
        }
      />
      <div className="card" style={{ padding: '0.5rem 1.125rem 0.875rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              {['Membre', 'Rôle', 'Clients', ''].map((h, i) => (
                <th
                  key={h || 'actions'}
                  className="lbl"
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--bd-solid)',
                    textAlign: i === 3 ? 'right' : 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m) => (
              <tr key={m.email}>
                <td style={cell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: m.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {m.name}
                        {'you' in m && m.you && (
                          <span
                            style={{
                              fontSize: '0.5rem',
                              fontWeight: 700,
                              color: 'var(--fg4)',
                              background: 'var(--bg-muted)',
                              borderRadius: 999,
                              padding: '1px 6px',
                            }}
                          >
                            VOUS
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td style={cell}>
                  <Badge label={m.role} tone={ROLE_TONES[m.role] ?? 'neutral'} />
                </td>
                <td
                  style={{
                    ...cell,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--fg2)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {m.clients}
                </td>
                <td style={{ ...cell, textAlign: 'right' }}>
                  <button className="btn-icon" type="button" aria-label={`Actions pour ${m.name}`}>
                    <IcoMore />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 12,
          padding: '0.875rem 1rem',
          borderRadius: 12,
          background: 'var(--yellow-m)',
          border: '1px solid var(--yellow-b)',
          flexWrap: 'wrap',
        }}
      >
        <p style={{ fontSize: '0.75rem', color: 'var(--yellow-fg)', flex: 1, fontWeight: 500, minWidth: 240 }}>
          Vous approchez de la limite de sièges. Passez au forfait Studio pour ajouter des membres
          illimités.
        </p>
        <button
          className="btn-out"
          type="button"
          style={{ borderColor: 'var(--yellow-b)', color: 'var(--yellow-fg)' }}
        >
          Voir les forfaits
        </button>
      </div>
    </div>
  );
}

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

/* ── Page ── */

export function ParametresView() {
  const [section, setSection] = useState<SectionId>('agence');
  const [ints, setInts] = useState<Integration[]>(AGENCY_INTEGRATIONS);
  const [notifs, setNotifs] = useState<Notification[]>(NOTIFICATIONS);

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
      header={<CRMHeader title="Paramètres" subtitle="Configuration de l'agence" period="" />}
    >
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
                MC
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
                  Marie Chen
                </div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>Administratrice</div>
              </div>
            </div>
            <button
              className="btn-out"
              type="button"
              style={{ width: '100%', justifyContent: 'center', padding: '0.35rem', fontSize: '0.6875rem' }}
            >
              Se déconnecter
            </button>
          </div>
        </nav>

        <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {section === 'agence' && <AgencePanel />}
            {section === 'equipe' && <EquipePanel />}
            {section === 'integrations' && <IntegrationsPanel ints={ints} onToggle={toggleInt} />}
            {section === 'notifications' && (
              <NotificationsPanel notifs={notifs} onToggle={toggleNotif} />
            )}
            {section === 'facturation' && <FacturationPanel />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
