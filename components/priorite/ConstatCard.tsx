'use client';

/**
 * En-tête du constat et zone d'action principale du détail d'une priorité.
 *
 * L'action offerte dépend de l'état : une priorité neuve s'assigne, une
 * priorité assignée renvoie vers sa tâche, une priorité résolue montre sa
 * preuve de valeur, une priorité close se réactive.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lbl, Pill, SevDot } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoChevD,
  IcoClock,
  IcoDb,
  IcoEye,
  IcoEyeOff,
  IcoPlus,
  IcoSpin,
  IcoTask,
  IcoTrophy,
  IcoWarn,
} from '@/components/ui/Icons';
import { MOTIFS, PD, SEV, STATUS, type PrioriteState } from '@/lib/data/priorite';

/** Formulaire secondaire ouvert sous le constat. */
type FormKind = 'reporter' | 'ignorer' | 'faux';

const FORM_TITLE: Record<FormKind, string> = {
  reporter: 'Reporter jusqu’à',
  ignorer: 'Motif d’abandon',
  faux: 'Pourquoi est-ce un faux positif ?',
};

const FORM_CONFIRM: Record<FormKind, string> = {
  reporter: 'Confirmer le report',
  ignorer: 'Ignorer cette priorité',
  faux: 'Marquer faux positif',
};

export function ConstatCard({
  state,
  deferred,
  onAssign,
  onClose,
  onReactivate,
  onDefer,
  taskHref,
  previousTaskHref,
  reportHref,
}: {
  state: PrioriteState;
  deferred: boolean;
  onAssign: () => void;
  onClose: (s: 'ignoree' | 'fauxpositif') => void;
  onReactivate: () => void;
  onDefer: () => void;
  taskHref: string;
  previousTaskHref: string;
  reportHref: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<FormKind | null>(null);
  const [motif, setMotif] = useState('');

  const sev = SEV[PD.sev];
  const status = STATUS[state];
  const closed = state === 'ignoree' || state === 'fauxpositif';
  const assigned = state === 'assignee';
  const resolved = state === 'resolue';
  const recurrent = state === 'recurrente';
  const actionable = state === 'neuve' || state === 'arelire' || recurrent;

  // Le menu « Autres actions » se referme au premier clic ailleurs.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const openForm = (kind: FormKind) => {
    setForm(kind);
    setMotif(MOTIFS[kind][0]);
    setMenuOpen(false);
  };

  const submitForm = () => {
    if (form === 'reporter') onDefer();
    else if (form) onClose(form === 'ignorer' ? 'ignoree' : 'fauxpositif');
    setForm(null);
  };

  return (
    <div className="card" style={{ padding: '1rem 1.125rem', borderLeft: `3px solid ${sev.color}` }}>
      <div className="constat-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            <Pill label={sev.label} tone={sev.tone} icon={<SevDot color={sev.color} />} />
            <Pill label={`${PD.dim} · ${PD.sub}`} />
            <Pill
              label={status.label}
              tone={status.tone}
              icon={recurrent ? <IcoSpin /> : resolved ? <IcoCheck /> : null}
            />
            {deferred && <Pill label="Reportée à octobre" tone="yellow" icon={<IcoClock />} />}
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.5625rem',
                color: 'var(--fg4)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {PD.id}
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              margin: 0,
              textWrap: 'balance',
              textDecoration: closed ? 'line-through' : 'none',
              color: closed ? 'var(--fg3)' : 'var(--fg1)',
            }}
          >
            {PD.internal}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 8,
              fontSize: '0.625rem',
              color: 'var(--fg3)',
            }}
          >
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IcoClock />
              {recurrent
                ? 'Première détection 18 nov. 2025 · revenue 25 mars 2026'
                : `Détectée le ${PD.firstSeen} · existe depuis ${PD.ageDays} jours`}
            </span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IcoDb />
              {PD.prov.audit} · {PD.prov.date} · CrUX + PageSpeed
            </span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IcoWarn size={12} />6 pages · 18 270 sessions/mois
            </span>
          </div>
        </div>

        <div
          className="action-zone"
          style={{ flexShrink: 0, width: 300, display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          {actionable && (
            <>
              <button type="button" className="btn-pri btn-main" onClick={onAssign}>
                <IcoPlus />
                Assigner au plan d’action
              </button>
              <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', textAlign: 'center' }}>
                Crée une tâche et passe la priorité <b>en traitement</b>.
              </p>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 6 }}>
                {recurrent && (
                  <Link
                    href={previousTaskHref}
                    className="btn-out"
                    style={{ fontSize: '0.6875rem', textDecoration: 'none' }}
                  >
                    <IcoTask />
                    Tâche #97
                  </Link>
                )}
                <button
                  type="button"
                  className="btn-out"
                  aria-expanded={menuOpen}
                  style={{ fontSize: '0.6875rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((m) => !m);
                  }}
                >
                  Autres actions
                  <span
                    style={{
                      display: 'flex',
                      transform: menuOpen ? 'rotate(180deg)' : undefined,
                      transition: 'transform 160ms',
                    }}
                  >
                    <IcoChevD />
                  </span>
                </button>
                {menuOpen && (
                  <div className="menu" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => openForm('reporter')}>
                      <IcoClock />
                      Reporter la priorité
                    </button>
                    <button type="button" onClick={() => openForm('ignorer')}>
                      <IcoEyeOff />
                      Ignorer (avec motif)
                    </button>
                    <button type="button" onClick={() => openForm('faux')}>
                      <IcoWarn size={12} />
                      Marquer comme faux positif
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {assigned && <TaskBox taskHref={taskHref} />}
          {resolved && <ProofBox reportHref={reportHref} />}
          {closed && <ClosedBox state={state} onReactivate={onReactivate} />}
        </div>
      </div>

      {form && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--bg-muted)',
            border: '1px solid var(--bd-solid)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <Lbl mb={4}>
              <label htmlFor="motif-priorite">{FORM_TITLE[form]}</label>
            </Lbl>
            <select
              id="motif-priorite"
              className="sel"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            >
              {MOTIFS[form].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          {form === 'faux' && (
            <p
              style={{
                flex: '1 1 100%',
                fontSize: '0.5625rem',
                color: 'var(--violet-fg)',
                display: 'flex',
                gap: 5,
              }}
            >
              <span aria-hidden="true">✦</span>Ce motif alimente le réglage de l’agent : il ajustera
              ses seuils pour ce client.
            </p>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn-out"
              style={{ fontSize: '0.6875rem' }}
              onClick={() => setForm(null)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn-pri"
              style={{ fontSize: '0.6875rem' }}
              onClick={submitForm}
            >
              {FORM_CONFIRM[form]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Zones d'action ── */

function TaskBox({ taskHref }: { taskHref: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--blue-m)',
        border: '1px solid var(--blue-b)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={{ color: 'var(--blue-fg)', display: 'flex' }}>
          <IcoTask />
        </span>
        <Lbl style={{ color: 'var(--blue-fg)' }}>Tâche créée</Lbl>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.5625rem',
            color: 'var(--fg3)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {PD.task.id}
        </span>
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{PD.task.title}</div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>
        {PD.task.who} · {PD.task.status} · échéance {PD.task.due}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
        <div
          style={{
            flex: 1,
            height: 5,
            borderRadius: 999,
            background: 'var(--bg-muted)',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: `${PD.task.pct}%`, height: '100%', background: 'var(--blue)' }} />
        </div>
        <span style={{ fontSize: '0.625rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {PD.task.pct} %
        </span>
      </div>
      <Link
        href={taskHref}
        className="btn-pri"
        style={{
          marginTop: 9,
          width: '100%',
          justifyContent: 'center',
          textDecoration: 'none',
          fontSize: '0.6875rem',
        }}
      >
        Ouvrir la tâche
        <IcoArrowR />
      </Link>
    </div>
  );
}

function ProofBox({ reportHref }: { reportHref: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--green-m)',
        border: '1px solid var(--green-b)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color: 'var(--green-fg)', display: 'flex' }}>
          <IcoTrophy />
        </span>
        <Lbl style={{ color: 'var(--green-fg)' }}>Preuve de valeur</Lbl>
        <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>
          {PD.proof.date}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'var(--fg3)',
            textDecoration: 'line-through',
            letterSpacing: '-0.02em',
          }}
        >
          {PD.proof.before}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--fg4)', display: 'flex' }}>
          <IcoArrowR />
        </span>
        <span
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            color: 'var(--green-fg)',
            letterSpacing: '-0.03em',
          }}
        >
          {PD.proof.after}
        </span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>LCP p75</span>
      </div>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginTop: 3 }}>
        {PD.proof.sessions}
      </div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>
        Tâche {PD.task.id} · incluse au {PD.proof.report}
      </div>
      <Link
        href={reportHref}
        className="btn-out"
        style={{
          marginTop: 9,
          width: '100%',
          justifyContent: 'center',
          textDecoration: 'none',
          fontSize: '0.6875rem',
        }}
      >
        <IcoEye />
        Voir dans le rapport
      </Link>
    </div>
  );
}

function ClosedBox({
  state,
  onReactivate,
}: {
  state: 'ignoree' | 'fauxpositif';
  onReactivate: () => void;
}) {
  const ignored = state === 'ignoree';
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--bg-muted)',
        border: '1px solid var(--bd-solid)',
      }}
    >
      <Lbl mb={4}>
        {ignored ? 'Ignorée le 3 sept. 2026 · Marie Chen' : 'Faux positif · 3 sept. 2026 · Marie Chen'}
      </Lbl>
      <div style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
        Motif :{' '}
        {ignored ? 'refonte du site prévue au T4' : 'mesure lab non confirmée sur le terrain'}
      </div>
      {!ignored && (
        <p
          style={{
            marginTop: 6,
            display: 'flex',
            gap: 5,
            alignItems: 'flex-start',
            fontSize: '0.5625rem',
            color: 'var(--violet-fg)',
            lineHeight: 1.4,
          }}
        >
          <span aria-hidden="true">✦</span>L’agent en tient compte : seuil LCP recalibré pour ce
          client, mesure terrain exigée avant détection.
        </p>
      )}
      <button
        type="button"
        className="btn-out"
        style={{ marginTop: 9, width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }}
        onClick={onReactivate}
      >
        <IcoSpin />
        Réactiver la priorité
      </button>
    </div>
  );
}
