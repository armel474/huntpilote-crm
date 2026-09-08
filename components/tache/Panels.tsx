'use client';

/**
 * Panneaux du détail d'une tâche : lien vers la priorité source,
 * sous-étapes, fil de discussion et temps passé.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Lbl, Pill, Sec, SevDot } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoClip,
  IcoDoc,
  IcoLink,
  IcoPause,
  IcoPlay,
  IcoPlus,
  IcoSend,
  IcoWarn,
} from '@/components/ui/Icons';
import { T_SEV, formatHours, type Tache } from '@/lib/data/tache';

/* ── Priorité source ── */

export function PrioLink({
  task,
  orphan,
  href,
}: {
  task: Tache;
  /** Tâche créée à la main, sans constat d'origine. */
  orphan: boolean;
  href: string;
}) {
  if (orphan) {
    return (
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1.5px dashed var(--bd-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ color: 'var(--fg4)', display: 'flex' }}>
            <IcoWarn size={12} />
          </span>
          <Lbl mb={0}>Aucune priorité source</Lbl>
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.45 }}>
          Tâche créée à la main. Sans priorité source, le rapport ne pourra pas dire ce qui n’allait
          pas — seulement ce qui a été fait.
        </p>
        <button
          type="button"
          className="btn-out"
          style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }}
        >
          <IcoLink />
          Rattacher une priorité
        </button>
      </div>
    );
  }

  const sev = T_SEV[task.prio.sev];
  return (
    <Link href={href} className="prio-link">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Lbl mb={0}>Priorité source</Lbl>
        <span
          style={{ fontSize: '0.5625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}
        >
          {task.prio.id}
        </span>
        <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--fg3)', display: 'flex' }}>
          <IcoArrowR />
        </span>
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>
        {task.prio.label}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill label={sev.label} tone={sev.tone} sm icon={<SevDot color={sev.color} />} />
        <Pill label={task.prio.dim} sm />
        <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{task.prio.audit}</span>
      </div>
    </Link>
  );
}

/* ── Sous-étapes ── */

export function StepsCard({ task, done }: { task: Tache; done: boolean }) {
  const [checked, setChecked] = useState(() => task.steps.map((s) => done || s.done));
  const n = checked.filter(Boolean).length;
  const pct = (n / checked.length) * 100;

  return (
    <Sec
      title="Sous-étapes"
      sub={`${n} sur ${checked.length} terminées`}
      right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 76,
              height: 5,
              borderRadius: 999,
              background: 'var(--bg-muted)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: n === checked.length ? 'var(--green)' : 'var(--blue)',
                borderRadius: 999,
                transition: 'width 250ms',
              }}
            />
          </div>
          <span
            style={{ fontSize: '0.625rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
          >
            {Math.round(pct)} %
          </span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {task.steps.map((s, i) => (
          <button
            key={s.t}
            type="button"
            className="step-row"
            aria-pressed={checked[i]}
            onClick={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          >
            <span
              aria-hidden="true"
              style={{
                width: 17,
                height: 17,
                borderRadius: 5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: checked[i] ? 'var(--green)' : 'transparent',
                border: `1.5px solid ${checked[i] ? 'var(--green)' : 'var(--bd-strong)'}`,
                color: '#fff',
              }}
            >
              {checked[i] && <IcoCheck strokeWidth={3} />}
            </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: checked[i] ? 'var(--fg3)' : 'var(--fg1)',
                textDecoration: checked[i] ? 'line-through' : 'none',
                lineHeight: 1.4,
              }}
            >
              {s.t}
            </span>
            {s.gain && (
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  color: 'var(--green-fg)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.gain}
              </span>
            )}
            <span
              title={s.who}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'var(--bg-muted)',
                border: '1px solid var(--bd-solid)',
                fontSize: '0.5rem',
                fontWeight: 700,
                color: 'var(--fg3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {s.who}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-out"
        style={{
          marginTop: 8,
          width: '100%',
          justifyContent: 'center',
          fontSize: '0.6875rem',
          borderStyle: 'dashed',
        }}
      >
        <IcoPlus />
        Ajouter une sous-étape
      </button>
    </Sec>
  );
}

/* ── Fil de la tâche ── */

export function ThreadCard({ task }: { task: Tache }) {
  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0;

  return (
    <Sec
      title="Fil de la tâche"
      sub={`${task.comments.length} commentaires · ${task.files.length} pièces jointes`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {task.comments.map((c) => (
          <div key={c.date} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span
              aria-hidden="true"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.5625rem',
                fontWeight: 700,
                background: c.ai ? 'var(--violet-m)' : 'var(--green-m)',
                border: `1px solid ${c.ai ? 'var(--violet-b)' : 'var(--green-b)'}`,
                color: c.ai ? 'var(--violet-fg)' : 'var(--green-fg)',
              }}
            >
              {c.init}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 2,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{c.who}</span>
                {c.ai && <Pill label="✦ IA" tone="violet" sm />}
                <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{c.date}</span>
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--fg2)',
                  lineHeight: 1.55,
                  textWrap: 'pretty',
                }}
              >
                {c.txt}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {task.files.map(([name, meta, size]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 10px',
              borderRadius: 9,
              background: 'var(--bg-muted)',
              border: '1px solid var(--bd)',
            }}
          >
            <span style={{ color: 'var(--fg3)', display: 'flex' }}>
              <IcoDoc />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{meta}</div>
            </div>
            <span style={{ fontSize: '0.5rem', color: 'var(--fg3)', whiteSpace: 'nowrap' }}>
              {size}
            </span>
          </div>
        ))}
        <button
          type="button"
          className="btn-out"
          style={{ justifyContent: 'center', fontSize: '0.6875rem', borderStyle: 'dashed' }}
        >
          <IcoClip />
          Joindre un fichier
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          className="fld-t"
          rows={2}
          placeholder="Écrire un commentaire…"
          aria-label="Nouveau commentaire"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          className="btn-pri"
          disabled={!canSend}
          style={{ flexShrink: 0, opacity: canSend ? 1 : 0.45, cursor: canSend ? 'pointer' : 'not-allowed' }}
          onClick={() => setDraft('')}
        >
          <IcoSend />
          Commenter
        </button>
      </div>
    </Sec>
  );
}

/* ── Temps passé ── */

export function TimeCard({ task, done }: { task: Tache; done: boolean }) {
  const [running, setRunning] = useState(false);
  const pct = Math.min((task.spent / task.estimate) * 100, 100);

  return (
    <Sec title="Temps passé" sub={`Estimé : ${task.effort}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatHours(task.spent)}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
          sur {task.estimate} h estimées
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: 'var(--bg-muted)',
          overflow: 'hidden',
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: pct >= 100 ? 'var(--red)' : 'var(--green)',
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginBottom: 10 }}>
        {Math.round(pct)} % du temps estimé consommé
      </div>

      {task.timeLog.map(([date, hours, who, note]) => (
        <div
          key={date}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            paddingTop: 8,
            borderTop: '1px solid var(--bd)',
          }}
        >
          <span
            style={{
              fontSize: '0.625rem',
              color: 'var(--fg3)',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
              minWidth: 44,
            }}
          >
            {date}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700 }}>
              {hours} · {who}
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.4 }}>{note}</div>
          </div>
        </div>
      ))}

      {!done && (
        <button
          type="button"
          className="btn-out"
          style={{
            marginTop: 10,
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.6875rem',
            color: running ? 'var(--red)' : 'var(--fg2)',
            borderColor: running ? 'var(--red-b)' : 'var(--bd-strong)',
          }}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? (
            <>
              <IcoPause />
              Arrêter le chronomètre
            </>
          ) : (
            <>
              <IcoPlay />
              Démarrer le chronomètre
            </>
          )}
        </button>
      )}
    </Sec>
  );
}
