'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { routes } from '@/lib/routes';
import {
  IcoCheck,
  IcoChevL,
  IcoChevR,
  IcoPipe,
  IcoTool,
  IcoUsers,
  IcoZap,
  type IconProps,
} from '@/components/ui/Icons';
import {
  DEADLINES,
  GOALS,
  INITIAL_DATA,
  INTEGRATIONS,
  SECTORS,
  SERVICES,
  STEP_SUBS,
  STEP_TITLES,
  type OnboardingData,
} from '@/lib/data/onboarding';
import { fmt } from '@/lib/data/pipeline';

const STEPS: { id: number; label: string; sub: string; Icon: (p: IconProps) => React.ReactElement }[] =
  [
    { id: 0, label: 'Informations', sub: "Coordonnées de l'entreprise", Icon: IcoUsers },
    { id: 1, label: 'Services', sub: 'Modules & forfait', Icon: IcoPipe },
    { id: 2, label: 'Objectifs', sub: 'Cibles & contexte', Icon: IcoZap },
    { id: 3, label: 'Accès', sub: 'Intégrations data', Icon: IcoTool },
    { id: 4, label: 'Récapitulatif', sub: 'Vérifier & créer', Icon: IcoCheck },
  ];

function Field({
  label,
  children,
  hint,
  required,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}
      >
        <span className="lbl">{label}</span>
        {required && (
          <span style={{ color: 'var(--red)', fontSize: '0.625rem', fontWeight: 700 }} aria-label="obligatoire">
            *
          </span>
        )}
        {hint && (
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', fontWeight: 500 }}>{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

/* ── Rail de progression ── */

function StepRail({
  step,
  setStep,
  maxReached,
}: {
  step: number;
  setStep: (n: number) => void;
  maxReached: number;
}) {
  return (
    <aside
      style={{
        width: 264,
        flexShrink: 0,
        borderRight: '1px solid var(--bd-solid)',
        background: 'var(--bg-solid)',
        padding: '1.5rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
      }}
      aria-label="Progression"
    >
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--green-m)',
            border: '1px solid var(--green-b)',
            marginBottom: 12,
            color: 'var(--green-fg)',
          }}
        >
          <IcoZap size={12} />
          <span style={{ fontSize: '0.625rem', fontWeight: 700 }}>Nouveau client</span>
        </div>
        <h1 style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Configurons le compte ensemble
        </h1>
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 5, lineHeight: 1.5 }}>
          {STEPS.length} étapes · environ 3 minutes
        </p>
      </div>

      <ol style={{ position: 'relative', flex: 1, listStyle: 'none' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 15,
            top: 14,
            bottom: 28,
            width: 2,
            background: 'var(--bd-solid)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 15,
            top: 14,
            width: 2,
            background: 'var(--accent)',
            height: `${(step / (STEPS.length - 1)) * 100}%`,
            maxHeight: 'calc(100% - 42px)',
            transition: 'height 300ms',
          }}
        />
        {STEPS.map((s) => {
          const done = s.id < step;
          const current = s.id === step;
          const reachable = s.id <= maxReached;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => reachable && setStep(s.id)}
                disabled={!reachable}
                aria-current={current ? 'step' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 18,
                  cursor: reachable ? 'pointer' : 'default',
                  position: 'relative',
                  opacity: reachable ? 1 : 0.5,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  textAlign: 'left',
                  fontFamily: 'var(--font)',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: done ? 'var(--accent)' : current ? 'var(--primary)' : 'var(--bg-base)',
                    border: `2px solid ${done ? 'var(--accent)' : current ? 'var(--primary)' : 'var(--bd-solid)'}`,
                    color: done ? '#fff' : current ? 'var(--primary-fg)' : 'var(--fg4)',
                    transition: 'all 200ms',
                    zIndex: 1,
                  }}
                >
                  {done ? <IcoCheck size={13} /> : <s.Icon size={14} />}
                </span>
                <span style={{ paddingTop: 3 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: current ? 'var(--fg1)' : done ? 'var(--fg2)' : 'var(--fg3)',
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{ display: 'block', fontSize: '0.625rem', color: 'var(--fg4)', marginTop: 1 }}
                  >
                    {s.sub}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        style={{
          padding: '0.75rem 0.875rem',
          borderRadius: 10,
          background: 'var(--violet-m)',
          border: '1px solid var(--violet-b)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span aria-hidden="true" style={{ color: 'var(--violet-fg)', fontSize: 13, lineHeight: 1, marginTop: 1 }}>
          ✦
        </span>
        <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
          L&apos;agent IA lancera un <b>premier audit automatique</b> dès la création du compte.
        </p>
      </div>
    </aside>
  );
}

/* ── Étapes ── */

function Step0({
  d,
  set,
}: {
  d: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Nom de l'entreprise" required htmlFor="ob-company">
        <input
          id="ob-company"
          className="fld"
          value={d.company}
          onChange={(e) => set('company', e.target.value)}
          placeholder="ex. Boutique Lumière"
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Secteur d'activité" required htmlFor="ob-sector">
          <select
            id="ob-sector"
            className="fld"
            value={d.sector}
            onChange={(e) => set('sector', e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Site web" required htmlFor="ob-website">
          <input
            id="ob-website"
            className="fld"
            value={d.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="exemple.ca"
          />
        </Field>
      </div>
      <div style={{ height: 1, background: 'var(--bd)', margin: '2px 0' }} />
      <Field label="Personne contact" required htmlFor="ob-contact">
        <input
          id="ob-contact"
          className="fld"
          value={d.contact}
          onChange={(e) => set('contact', e.target.value)}
          placeholder="Prénom Nom"
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Courriel" required htmlFor="ob-email">
          <input
            id="ob-email"
            className="fld"
            type="email"
            value={d.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="contact@exemple.ca"
          />
        </Field>
        <Field label="Téléphone" htmlFor="ob-phone">
          <input
            id="ob-phone"
            className="fld"
            value={d.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="(514) 555-0000"
          />
        </Field>
      </div>
      <Field label="Adresse" hint="(optionnel)" htmlFor="ob-address">
        <input
          id="ob-address"
          className="fld"
          value={d.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="Ville, Province"
        />
      </Field>
    </div>
  );
}

function Step1({ d, toggleService }: { d: OnboardingData; toggleService: (id: string) => void }) {
  const total = SERVICES.filter((s) => d.services.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
        Sélectionnez les modules inclus dans le forfait. Le MRR se calcule automatiquement.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {SERVICES.map((s) => {
          const on = d.services.includes(s.id);
          return (
            <label
              key={s.id}
              className={`opt${on ? ' on' : ''}`}
              style={{
                border: '1px solid var(--bd-solid)',
                borderRadius: 11,
                padding: '0.875rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggleService(s.id)}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
              />
              <span
                aria-hidden="true"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  flexShrink: 0,
                  marginTop: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: on ? 'var(--accent)' : 'transparent',
                  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--bd-strong)'}`,
                  color: '#fff',
                }}
              >
                {on && <IcoCheck size={12} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{s.name}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: on ? 'var(--green-fg)' : 'var(--fg3)',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.price} $
                  </span>
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.625rem',
                    color: 'var(--fg3)',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {s.desc}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0.875rem 1rem',
          borderRadius: 11,
          background: 'var(--primary)',
          color: 'var(--primary-fg)',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '0.625rem',
              opacity: 0.7,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              fontWeight: 700,
            }}
          >
            MRR mensuel récurrent
          </div>
          <div style={{ fontSize: '0.625rem', opacity: 0.7, marginTop: 2 }}>
            {d.services.length} module{d.services.length > 1 ? 's' : ''} sélectionné
            {d.services.length > 1 ? 's' : ''}
          </div>
        </div>
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(total)} $
          <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.7 }}>/mois</span>
        </div>
      </div>
    </div>
  );
}

function Step2({
  d,
  set,
  toggleGoal,
}: {
  d: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  toggleGoal: (g: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Objectifs principaux" hint="(plusieurs choix possibles)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 2 }}>
          {GOALS.map((g) => {
            const on = d.goals.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                aria-pressed={on}
                style={{
                  fontFamily: 'var(--font)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.85rem',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  background: on ? 'var(--green-m)' : 'var(--bg-base)',
                  border: `1px solid ${on ? 'var(--green-b)' : 'var(--bd-solid)'}`,
                  color: on ? 'var(--green-fg)' : 'var(--fg2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {on && <IcoCheck size={11} />}
                {g}
              </button>
            );
          })}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Field label="Trafic cible" hint="/ mois" htmlFor="ob-traffic">
          <input
            id="ob-traffic"
            className="fld"
            value={d.kpiTraffic}
            onChange={(e) => set('kpiTraffic', e.target.value)}
            placeholder="ex. 60 000"
          />
        </Field>
        <Field label="Mots-clés top 3" hint="objectif" htmlFor="ob-kw">
          <input
            id="ob-kw"
            className="fld"
            value={d.kpiKeywords}
            onChange={(e) => set('kpiKeywords', e.target.value)}
            placeholder="ex. 25"
          />
        </Field>
        <Field label="Échéance" htmlFor="ob-deadline">
          <select
            id="ob-deadline"
            className="fld"
            value={d.deadline}
            onChange={(e) => set('deadline', e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {DEADLINES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Contexte & notes" hint="(visible par toute l'équipe)" htmlFor="ob-context">
        <textarea
          id="ob-context"
          className="fld"
          rows={4}
          value={d.context}
          onChange={(e) => set('context', e.target.value)}
          placeholder="Historique, contraintes, attentes particulières du client…"
        />
      </Field>
    </div>
  );
}

function Step3({
  d,
  toggleIntegration,
}: {
  d: OnboardingData;
  toggleIntegration: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
        Connectez les sources de données pour alimenter les rapports et l&apos;agent IA. Vous pourrez
        les ajouter plus tard.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {INTEGRATIONS.map((it) => {
          const on = d.integrations.includes(it.id);
          return (
            <div
              key={it.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: it.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                {it.letter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{it.name}</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>{it.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => toggleIntegration(it.id)}
                className={on ? 'btn-out' : 'btn-pri'}
                style={
                  on
                    ? {
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.75rem',
                        color: 'var(--green-fg)',
                        borderColor: 'var(--green-b)',
                        background: 'var(--green-m)',
                      }
                    : { padding: '0.4rem 0.85rem', fontSize: '0.75rem' }
                }
              >
                {on ? (
                  <>
                    <IcoCheck size={12} />
                    Connecté
                  </>
                ) : (
                  'Connecter'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, ok = true }: { label: string; value: string; ok?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--bd)',
      }}
    >
      <span className="lbl" style={{ width: 120, flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: ok && value ? 'var(--fg1)' : 'var(--fg4)',
          flex: 1,
        }}
      >
        {value || '—'}
      </span>
    </div>
  );
}

function Step4({ d }: { d: OnboardingData }) {
  const chosen = SERVICES.filter((s) => d.services.includes(s.id));
  const total = chosen.reduce((sum, s) => sum + s.price, 0);
  const svcNames = chosen.map((s) => s.name).join(', ');
  const intNames = INTEGRATIONS.filter((it) => d.integrations.includes(it.id))
    .map((it) => it.name)
    .join(', ');
  const initials = (d.company || 'NC')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '1rem',
          borderRadius: 12,
          background: 'var(--green-m)',
          border: '1px solid var(--green-b)',
          flexWrap: 'wrap',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            flexShrink: 0,
            background: 'linear-gradient(140deg,#d4edda,#e3ddd1)',
            border: '1.5px solid var(--green-b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--green-fg)',
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {d.company || 'Nouveau client'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--green-fg)' }}>
            {d.sector || 'Secteur non défini'} · {fmt(total)} $/mois
          </div>
        </div>
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            padding: '3px 11px',
            borderRadius: 999,
            background: 'var(--bg-solid)',
            color: 'var(--green-fg)',
            border: '1px solid var(--green-b)',
          }}
        >
          Prêt à créer
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="lbl" style={{ marginBottom: 4, color: 'var(--fg2)' }}>
            Coordonnées
          </div>
          <SummaryRow label="Contact" value={d.contact} />
          <SummaryRow label="Courriel" value={d.email} />
          <SummaryRow label="Téléphone" value={d.phone} />
          <SummaryRow label="Site web" value={d.website} />
        </div>
        <div>
          <div className="lbl" style={{ marginBottom: 4, color: 'var(--fg2)' }}>
            Prestation
          </div>
          <SummaryRow label="Services" value={svcNames} ok={!!svcNames} />
          <SummaryRow label="MRR" value={`${fmt(total)} $ / mois`} />
          <SummaryRow
            label="Objectifs"
            value={d.goals.length ? `${d.goals.length} défini(s)` : ''}
            ok={d.goals.length > 0}
          />
          <SummaryRow label="Échéance" value={d.deadline} ok={!!d.deadline} />
        </div>
      </div>

      <div>
        <div className="lbl" style={{ marginBottom: 6, color: 'var(--fg2)' }}>
          Intégrations connectées
        </div>
        {intNames ? (
          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{intNames}</div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>
            Aucune — à configurer plus tard
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          padding: '0.75rem 0.875rem',
          borderRadius: 10,
          background: 'var(--violet-m)',
          border: '1px solid var(--violet-b)',
        }}
      >
        <span aria-hidden="true" style={{ color: 'var(--violet-fg)', fontSize: 13, lineHeight: 1, marginTop: 1 }}>
          ✦
        </span>
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
          Dès la création : la fiche client sera générée, l&apos;agent IA lancera un{' '}
          <b>premier audit</b>, et une checklist d&apos;onboarding sera créée automatiquement.
        </p>
      </div>
    </div>
  );
}

function Done({ company }: { company: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--green-m)',
          border: '2px solid var(--green-b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--green-fg)',
          marginBottom: 20,
        }}
      >
        <IcoCheck size={34} />
      </div>
      <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Compte créé avec succès
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--fg3)',
          maxWidth: 380,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        <b style={{ color: 'var(--fg1)' }}>{company || 'Le nouveau client'}</b> a été ajouté.
        L&apos;agent IA a lancé le premier audit — les résultats seront prêts dans quelques minutes.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link className="btn-out" href={routes.clients()}>
          Retour au Client Hub
        </Link>
        <Link className="btn-pri" href={routes.client('acme-corp')}>
          Ouvrir la fiche client <IcoChevR />
        </Link>
      </div>
    </div>
  );
}

/* ── Assistant ── */

export function OnboardingView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [created, setCreated] = useState(false);
  const [d, setD] = useState<OnboardingData>(INITIAL_DATA);

  const set = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  /** Ajoute ou retire une valeur d'un champ multi-sélection. */
  const toggleIn = (key: 'services' | 'goals' | 'integrations') => (value: string) =>
    setD((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((x) => x !== value) : [...p[key], value],
    }));

  const goStep = (n: number) => {
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
  };

  const canNext =
    step === 0
      ? Boolean(d.company && d.sector && d.website && d.contact && d.email)
      : step === 1
        ? d.services.length > 0
        : true;

  return (
    <AppShell
      header={
        <CRMHeader
          title="Onboarding client"
          subtitle="Création d'un nouveau compte"
          period=""
        />
      }
    >
      {created ? (
        <Done company={d.company} />
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <StepRail step={step} setStep={goStep} maxReached={maxReached} />

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ marginBottom: 22 }}>
                  <div
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 5,
                    }}
                  >
                    Étape {step + 1} sur {STEPS.length}
                  </div>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                    {STEP_TITLES[step]}
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 4 }}>
                    {STEP_SUBS[step]}
                  </p>
                </div>

                {step === 0 && <Step0 d={d} set={set} />}
                {step === 1 && <Step1 d={d} toggleService={toggleIn('services')} />}
                {step === 2 && <Step2 d={d} set={set} toggleGoal={toggleIn('goals')} />}
                {step === 3 && <Step3 d={d} toggleIntegration={toggleIn('integrations')} />}
                {step === 4 && <Step4 d={d} />}
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                borderTop: '1px solid var(--bd-solid)',
                background: 'var(--bg-solid)',
                padding: '0.875rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <button
                className="btn-out"
                type="button"
                onClick={() => (step === 0 ? router.push(routes.clients()) : goStep(step - 1))}
              >
                <IcoChevL />
                {step === 0 ? 'Annuler' : 'Précédent'}
              </button>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {STEPS.map((s) => (
                  <span
                    key={s.id}
                    aria-hidden="true"
                    style={{
                      width: step === s.id ? 22 : 7,
                      height: 7,
                      borderRadius: 999,
                      background: s.id <= step ? 'var(--accent)' : 'var(--bd-solid)',
                      transition: 'all 250ms',
                    }}
                  />
                ))}
              </div>

              {step < STEPS.length - 1 ? (
                <button
                  className="btn-pri"
                  type="button"
                  disabled={!canNext}
                  onClick={() => goStep(step + 1)}
                >
                  Continuer <IcoChevR />
                </button>
              ) : (
                <button className="btn-pri" type="button" onClick={() => setCreated(true)}>
                  <IcoCheck size={12} />
                  Créer le compte
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
