'use client';

/**
 * Clôture d'une tâche en trois temps : ce qui a changé, où va la preuve,
 * et le libellé que lira le client.
 *
 * Le formulaire refuse d'aboutir tant qu'un humain n'a pas validé le libellé
 * (règle 1 de `docs/decisions.md`) : une preuve non relue bloque la
 * publication du rapport plutôt que d'y entrer en l'état.
 */
import { useState } from 'react';
import { Lbl, Pill } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoEyeOff,
  IcoLink,
  IcoSend,
  IcoTrophy,
  IcoWarn,
} from '@/components/ui/Icons';
import type { Tache } from '@/lib/data/tache';

/** Nature de la preuve produite. */
type Mode = 'mesure' | 'note' | 'livre';

/** Destination de la preuve : le rapport client, ou l'historique interne. */
export type Destination = 'rapport' | 'interne';

const STEPS = [
  { n: 1, label: 'Ce qui a changé' },
  { n: 2, label: 'Destination' },
  { n: 3, label: 'Libellé client' },
] as const;

const DESTINATIONS: readonly { id: Destination; title: string; desc: string }[] = [
  {
    id: 'rapport',
    title: 'Au prochain rapport client',
    desc: 'Rapport de septembre · publication le 2 octobre. Le client verra la preuve avec son libellé.',
  },
  {
    id: 'interne',
    title: 'Reste interne',
    desc: 'La preuve alimente l’historique de l’agence, mais n’apparaît dans aucun rapport.',
  },
];

export function CloseFlow({
  task,
  onCancel,
  onDone,
}: {
  task: Tache;
  onCancel: () => void;
  onDone: (dest: Destination) => void;
}) {
  const isContent = task.type === 'contenu';
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<Mode>(isContent ? 'livre' : 'mesure');
  const [before, setBefore] = useState(task.measure?.before ?? '');
  const [after, setAfter] = useState(task.measure?.after ?? '');
  const [note, setNote] = useState(isContent ? task.secondary : '');
  const [dest, setDest] = useState<Destination>('rapport');
  const [label, setLabel] = useState(task.proofLabel);
  const [validated, setValidated] = useState(false);

  const canContinue =
    step === 1
      ? mode === 'mesure'
        ? before.trim() !== '' && after.trim() !== ''
        : note.trim() !== ''
      : step === 2
        ? true
        : validated;

  return (
    <div className="card close-flow">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: 'var(--green-m)',
            border: '1px solid var(--green-b)',
            color: 'var(--green-fg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IcoTrophy />
        </span>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0 }}>
            Clôturer la tâche {task.id}
          </h2>
          <p style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>
            Trois questions, puis la preuve part au rapport.
          </p>
        </div>
        <ol className="steps-ind">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="step-ind"
              data-on={step === s.n}
              data-done={step > s.n}
              aria-current={step === s.n ? 'step' : undefined}
            >
              <span className="step-num">{step > s.n ? <IcoCheck strokeWidth={3} /> : s.n}</span>
              <span className="step-lab">{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {step === 1 && (
        <div>
          <div className="seg" role="group" aria-label="Type de preuve">
            <button
              type="button"
              className={mode === 'mesure' ? 'on' : ''}
              onClick={() => setMode('mesure')}
            >
              Une mesure a changé
            </button>
            <button
              type="button"
              className={mode === 'note' ? 'on' : ''}
              onClick={() => setMode('note')}
            >
              Pas de mesure — une note
            </button>
            {isContent && (
              <button
                type="button"
                className={mode === 'livre' ? 'on' : ''}
                onClick={() => setMode('livre')}
              >
                Contenu publié
              </button>
            )}
          </div>

          {mode === 'mesure' && (
            <div className="close-body">
              <div className="measure-row">
                <div>
                  <Lbl mb={4}>
                    <label htmlFor="cl-mesure">Mesure suivie</label>
                  </Lbl>
                  <input
                    id="cl-mesure"
                    className="fld-t"
                    value={task.measure?.label ?? 'LCP mobile (p75)'}
                    readOnly
                  />
                </div>
                <div>
                  <Lbl mb={4}>
                    <label htmlFor="cl-avant">Avant</label>
                  </Lbl>
                  <input
                    id="cl-avant"
                    className="fld-t"
                    value={before}
                    onChange={(e) => setBefore(e.target.value)}
                    placeholder="4,2 s"
                  />
                </div>
                <div
                  className="measure-arrow"
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 9,
                    color: 'var(--fg3)',
                  }}
                >
                  <IcoArrowR />
                </div>
                <div>
                  <Lbl mb={4}>
                    <label htmlFor="cl-apres">Après</label>
                  </Lbl>
                  <input
                    id="cl-apres"
                    className="fld-t"
                    value={after}
                    onChange={(e) => setAfter(e.target.value)}
                    placeholder="2,1 s"
                    style={{ borderColor: 'var(--green-b)', fontWeight: 700 }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 6 }}>
                Source : {task.measure?.source ?? 'CrUX · fenêtre 28 j'} · objectif{' '}
                {task.measure?.target ?? '< 2,5 s'} — la mesure avant vient de la priorité source,
                elle n’est pas ressaisie.
              </p>
              <div style={{ marginTop: 10 }}>
                <Lbl mb={4}>
                  <label htmlFor="cl-effet">Effet secondaire observé (optionnel)</label>
                </Lbl>
                <input
                  id="cl-effet"
                  className="fld-t"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="+14 % de sessions mobiles sur 28 jours"
                />
              </div>
            </div>
          )}

          {mode === 'note' && (
            <div className="close-body">
              <Lbl mb={4}>
                <label htmlFor="cl-note">Ce qui a changé</label>
              </Lbl>
              <textarea
                id="cl-note"
                className="fld-t"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Décrivez ce qui a été fait et ce que ça change, sans chiffre."
              />
              <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 6 }}>
                Une preuve sans mesure reste une preuve — elle sera présentée comme un constat, pas
                comme un résultat chiffré.
              </p>
            </div>
          )}

          {mode === 'livre' && (
            <div className="close-body">
              <Lbl mb={6}>Contenu publié</Lbl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {task.delivered?.map(([url, meta]) => (
                  <div
                    key={url}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '8px 10px',
                      borderRadius: 9,
                      background: 'var(--bg-muted)',
                      border: '1px solid var(--bd)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: 5,
                        background: 'var(--green)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IcoCheck strokeWidth={3} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {url}
                      </div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{meta}</div>
                    </div>
                    <span style={{ color: 'var(--fg3)', display: 'flex' }}>
                      <IcoLink />
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <Lbl mb={4}>
                  <label htmlFor="cl-apport">Ce que ça apporte</label>
                </Lbl>
                <input
                  id="cl-apport"
                  className="fld-t"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 6 }}>
                Un article publié compte comme preuve au même titre qu’un correctif technique.
              </p>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="close-body">
          <Lbl mb={6}>Où va cette preuve ?</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {DESTINATIONS.map((d) => {
              const on = dest === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  className="vis-row"
                  aria-pressed={on}
                  onClick={() => setDest(d.id)}
                  style={{
                    borderColor: on ? 'var(--fg1)' : 'var(--bd-solid)',
                    boxShadow: on ? '0 0 0 1px var(--fg1)' : 'none',
                    background: on ? 'var(--bg-solid)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `1.5px solid ${on ? 'var(--fg1)' : 'var(--bd-strong)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {on && (
                      <span
                        style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fg1)' }}
                      />
                    )}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {d.id === 'rapport' ? <IcoSend /> : <IcoEyeOff />}
                      {d.title}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.625rem',
                        color: 'var(--fg2)',
                        marginTop: 3,
                        lineHeight: 1.45,
                      }}
                    >
                      {d.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {dest === 'rapport' && (
            <p
              style={{
                marginTop: 10,
                padding: '8px 10px',
                borderRadius: 9,
                background: 'var(--blue-m)',
                border: '1px solid var(--blue-b)',
                fontSize: '0.625rem',
                color: 'var(--fg2)',
                lineHeight: 1.5,
              }}
            >
              La priorité <b>{task.prio.id}</b> passera en <b>résolue</b> et le rapport pourra dire :
              voici ce qui n’allait pas, voici ce qu’on a fait.
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="close-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <Lbl mb={0}>
              <label htmlFor="cl-libelle">Libellé client de la preuve</label>
            </Lbl>
            <Pill label="✦ Rédigé par l’agent" tone="violet" sm />
            {validated ? (
              <Pill label="Validé" tone="green" sm icon={<IcoCheck />} />
            ) : (
              <Pill label="À relire" tone="yellow" sm icon={<IcoWarn size={12} />} />
            )}
          </div>
          <textarea
            id="cl-libelle"
            className="fld-t"
            rows={4}
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setValidated(false);
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-out"
              style={{ fontSize: '0.6875rem', color: 'var(--violet-fg)', borderColor: 'var(--violet-b)' }}
              onClick={() => setLabel(task.proofLabel)}
            >
              ✦ Régénérer
            </button>
            <button
              type="button"
              className="btn-pri"
              style={{ fontSize: '0.6875rem' }}
              onClick={() => setValidated(true)}
              disabled={validated}
            >
              <IcoCheck />
              Valider le libellé
            </button>
            {!validated && (
              <span
                style={{
                  fontSize: '0.5625rem',
                  color: 'var(--yellow-fg)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <IcoWarn size={12} />
                Tant qu’il est à relire, la preuve bloque la publication du rapport.
              </span>
            )}
          </div>

          {dest === 'rapport' && (
            <div style={{ marginTop: 12 }}>
              <Lbl mb={6}>Aperçu — dans le rapport de septembre</Lbl>
              <ProofPreview
                mode={mode}
                before={before}
                after={after}
                label={label}
                note={note}
                validated={validated}
              />
            </div>
          )}
        </div>
      )}

      <div className="close-foot">
        <button
          type="button"
          className="btn-out"
          style={{ fontSize: '0.6875rem' }}
          onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
        >
          {step === 1 ? 'Annuler' : 'Retour'}
        </button>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Étape {step} sur 3</span>
        {step < 3 ? (
          <button
            type="button"
            className="btn-pri"
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.45, cursor: canContinue ? 'pointer' : 'not-allowed' }}
            onClick={() => setStep((s) => s + 1)}
          >
            Continuer
            <IcoArrowR />
          </button>
        ) : (
          <button
            type="button"
            className="btn-pri btn-main"
            disabled={!validated}
            style={{
              width: 'auto',
              opacity: validated ? 1 : 0.45,
              cursor: validated ? 'pointer' : 'not-allowed',
            }}
            onClick={() => onDone(dest)}
          >
            <IcoTrophy />
            {dest === 'rapport' ? 'Clôturer et envoyer au rapport' : 'Clôturer — preuve interne'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Aperçu du bloc tel qu'il apparaîtra dans le rapport. Couleurs en dur :
 * le document client reste blanc quel que soit le thème de l'agence.
 */
function ProofPreview({
  mode,
  before,
  after,
  label,
  note,
  validated,
}: {
  mode: Mode;
  before: string;
  after: string;
  label: string;
  note: string;
  validated: boolean;
}) {
  return (
    <div className="client-doc">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
        <span
          aria-hidden="true"
          style={{
            width: 15,
            height: 15,
            background: '#16A34A',
            color: '#fff',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IcoCheck size={9} strokeWidth={3} />
        </span>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: '#2D5A27',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          Ce qui a été réglé ce mois-ci
        </span>
      </div>

      {mode === 'mesure' && before && after && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 800,
              color: '#A1A1AA',
              textDecoration: 'line-through',
            }}
          >
            {before}
          </span>
          <span aria-hidden="true" style={{ color: '#A1A1AA', display: 'flex' }}>
            <IcoArrowR />
          </span>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#16A34A',
              letterSpacing: '-0.03em',
            }}
          >
            {after}
          </span>
        </div>
      )}

      <p style={{ fontSize: '0.6875rem', lineHeight: 1.55, color: '#3F3F46', margin: 0, textWrap: 'pretty' }}>
        {label}
      </p>
      {note && (
        <div style={{ fontSize: '0.5625rem', color: '#3F3F46', marginTop: 6, fontWeight: 700 }}>
          {note}
        </div>
      )}
      {!validated && (
        <div style={{ marginTop: 7, fontSize: '0.5rem', fontWeight: 700, color: '#7A5D14' }}>
          Texte non validé — ne sera pas publié en l’état.
        </div>
      )}
    </div>
  );
}
