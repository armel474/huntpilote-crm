'use client';

/**
 * En-tête d'une tâche et preuve de valeur produite.
 *
 * L'action principale n'est pas « marquer comme terminée » mais « terminer et
 * produire la preuve » : une tâche close sans preuve laisse un trou dans le
 * rapport du mois, et l'écran le dit.
 */
import Link from 'next/link';
import { Lbl, Pill } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoClock,
  IcoDoc,
  IcoEye,
  IcoTrophy,
  IcoWarn,
} from '@/components/ui/Icons';
import { T_CLIENT, T_STATUS, type Tache, type TacheState } from '@/lib/data/tache';

export function TaskHeader({
  task,
  state,
  orphan,
  blocked,
  onStart,
  onOpenClose,
  reportHref,
}: {
  task: Tache;
  state: TacheState;
  orphan: boolean;
  blocked: boolean;
  onStart: () => void;
  onOpenClose: () => void;
  reportHref: string;
}) {
  const status = T_STATUS[state];
  const done = state === 'terminee' || state === 'publiee';
  const late = state === 'retard';

  const meta: readonly (readonly [string, string])[] = [
    ['Responsable', task.who],
    ['Échéance', task.due],
    ['Effort estimé', task.effort],
    ['Créée le', task.created],
  ];

  return (
    <div className="card" style={{ padding: '1rem 1.125rem' }}>
      <div className="t-head" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
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
            <Pill
              label={status.label}
              tone={status.tone}
              icon={
                done ? <IcoCheck /> : late || blocked ? <IcoWarn size={12} /> : <IcoClock />
              }
            />
            <Pill
              label={task.typeLabel}
              tone={task.type === 'contenu' ? 'violet' : 'neutral'}
              icon={task.type === 'contenu' ? <IcoDoc /> : null}
            />
            {orphan && <Pill label="Sans priorité source" tone="yellow" icon={<IcoWarn size={12} />} />}
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.5625rem',
                color: 'var(--fg3)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Tâche {task.id}
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
              color: done ? 'var(--fg3)' : 'var(--fg1)',
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </h1>

          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--fg2)',
              lineHeight: 1.6,
              margin: '8px 0 0',
              textWrap: 'pretty',
            }}
          >
            {task.desc}
          </p>

          <div className="t-meta">
            {meta.map(([label, value]) => {
              const overdue = label === 'Échéance' && late;
              return (
                <div key={label}>
                  <Lbl mb={2}>{label}</Lbl>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: overdue ? 'var(--red)' : 'var(--fg1)',
                    }}
                  >
                    {value}
                    {overdue && ' · 3 j de retard'}
                  </div>
                </div>
              );
            })}
          </div>

          {blocked && (
            <div
              style={{
                marginTop: 10,
                padding: '9px 11px',
                borderRadius: 10,
                background: 'var(--yellow-m)',
                border: '1px solid var(--yellow-b)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--yellow-fg)',
                }}
              >
                <IcoWarn size={12} />
                Bloquée depuis le 6 septembre
              </div>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--fg2)',
                  marginTop: 3,
                  marginLeft: 18,
                  lineHeight: 1.45,
                }}
              >
                Motif : accès FTP en attente chez l’hébergeur du client. Relance envoyée le
                7 septembre à contact@acmecorp.fr.
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, marginLeft: 18, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-pri"
                  style={{ fontSize: '0.6875rem' }}
                  onClick={onStart}
                >
                  Débloquer et reprendre
                </button>
                <button type="button" className="btn-out" style={{ fontSize: '0.6875rem' }}>
                  Relancer le client
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="t-action">
          {!done && (
            <>
              <button
                type="button"
                className="btn-pri btn-main"
                onClick={onOpenClose}
                disabled={blocked}
                style={{ opacity: blocked ? 0.45 : 1, cursor: blocked ? 'not-allowed' : 'pointer' }}
              >
                <IcoTrophy />
                Terminer et produire la preuve
              </button>
              <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', textAlign: 'center' }}>
                {blocked
                  ? 'Débloquez la tâche pour pouvoir la clôturer.'
                  : 'Terminer une tâche, c’est produire la preuve de valeur qui ira au rapport.'}
              </p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn-out" style={{ fontSize: '0.6875rem' }}>
                  <IcoClock />
                  Reporter l’échéance
                </button>
                <button type="button" className="btn-out" style={{ fontSize: '0.6875rem' }}>
                  <IcoWarn size={12} />
                  Signaler un blocage
                </button>
              </div>
            </>
          )}

          {state === 'terminee' && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--yellow-m)',
                border: '1px solid var(--yellow-b)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: 'var(--yellow-fg)', display: 'flex' }}>
                  <IcoWarn size={12} />
                </span>
                <Lbl mb={0} style={{ color: 'var(--yellow-fg)' }}>
                  Preuve non produite
                </Lbl>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.45 }}>
                Le travail est fait, mais rien ne le montre au client. La preuve manquera au rapport
                de septembre.
              </p>
              <button
                type="button"
                className="btn-pri btn-main"
                style={{ marginTop: 9 }}
                onClick={onOpenClose}
              >
                <IcoTrophy />
                Produire la preuve
              </button>
            </div>
          )}

          {state === 'publiee' && <ProofCard task={task} reportHref={reportHref} />}
        </div>
      </div>
    </div>
  );
}

/* ── Preuve de valeur produite ── */

export function ProofCard({ task, reportHref }: { task: Tache; reportHref: string }) {
  return (
    <div
      style={{
        padding: '11px 13px',
        borderRadius: 10,
        background: 'var(--green-m)',
        border: '1px solid var(--green-b)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
        <span style={{ color: 'var(--green-fg)', display: 'flex' }}>
          <IcoTrophy />
        </span>
        <Lbl mb={0} style={{ color: 'var(--green-fg)' }}>
          Preuve de valeur
        </Lbl>
        <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--fg3)' }}>
          8 sept. 2026
        </span>
      </div>

      {task.measure ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 4 }}>
          <span
            style={{
              fontSize: '1.0625rem',
              fontWeight: 800,
              color: 'var(--fg3)',
              textDecoration: 'line-through',
            }}
          >
            {task.measure.before}
          </span>
          <span aria-hidden="true" style={{ color: 'var(--fg3)', display: 'flex' }}>
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
            {task.measure.after}
          </span>
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{task.measure.label}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 5 }}>
          {task.delivered?.map(([url, meta]) => (
            <div key={url}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{url}</div>
              <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{meta}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 7 }}>{task.secondary}</div>
      <p
        style={{
          paddingTop: 7,
          borderTop: '1px solid var(--green-b)',
          fontSize: '0.625rem',
          color: 'var(--fg2)',
          lineHeight: 1.5,
        }}
      >
        « {task.proofLabel} »
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 7,
          fontSize: '0.5rem',
          color: 'var(--fg3)',
        }}
      >
        <span style={{ color: 'var(--green)', display: 'flex' }}>
          <IcoCheck />
        </span>
        Libellé validé par {T_CLIENT.pm} · publié dans le rapport de septembre
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
        Voir dans le rapport publié
      </Link>
    </div>
  );
}
