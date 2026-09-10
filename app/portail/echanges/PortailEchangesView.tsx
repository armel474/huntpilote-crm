'use client';

/**
 * Échanges — session 5.2.
 *
 * Un fil de correspondance daté, pas une messagerie instantanée : on écrit,
 * on reçoit une réponse dans la journée. Chaque message peut porter le
 * contexte d'où il a été posé (une preuve, une priorité, un indicateur du
 * rapport de septembre) — ce qui alimente le même historique que le cockpit
 * (session 4.2 : agenda et rapports à produire y renvoient déjà).
 */
import { useState } from 'react';
import { IcoCheckAll, IcoClip, IcoClock, IcoMsg, IcoSend } from '@/components/ui/Icons';
import { PortalHeader } from '@/app/portail/PortalHeader';
import { REPORT } from '@/lib/data/rapport';
import {
  PORTAL_ACCOUNT,
  PORTAL_ANCHORS,
  PORTAL_CTX_LABEL,
  PORTAL_PENDING,
  PORTAL_SLA_DAYS,
  PORTAL_THREAD,
  portalAnchor,
  type CtxKind,
  type PortalFile,
  type PortalMessage,
} from '@/lib/data/portail';

type Scenario = 'nonlue' | 'attente' | 'longue' | 'aucun';

const SCENARIOS: readonly [Scenario, string][] = [
  ['nonlue', 'Réponse reçue non lue'],
  ['attente', 'Question en attente de réponse'],
  ['longue', 'Conversation longue'],
  ['aucun', 'Aucun échange'],
];

const TONE: Record<CtxKind, { bg: string; bd: string; fg: string }> = {
  preuve: { bg: 'var(--green-m)', bd: 'var(--green-b)', fg: 'var(--green-fg)' },
  priorite: { bg: 'var(--blue-m)', bd: 'var(--blue-b)', fg: 'var(--blue-fg)' },
  kpi: { bg: 'var(--bg-muted)', bd: 'var(--bd-solid)', fg: 'var(--fg2)' },
  rapport: { bg: 'var(--bg-muted)', bd: 'var(--bd-solid)', fg: 'var(--fg2)' },
};

function scenarioThread(scenario: Scenario): { thread: readonly PortalMessage[]; waiting: boolean; long: boolean } {
  if (scenario === 'aucun') return { thread: [], waiting: false, long: false };
  if (scenario === 'attente') return { thread: PORTAL_PENDING, waiting: true, long: false };
  if (scenario === 'longue') return { thread: [...PORTAL_THREAD, ...PORTAL_PENDING.slice(4)].map((m) => ({ ...m, read: true })), waiting: false, long: true };
  return { thread: PORTAL_THREAD, waiting: false, long: false };
}

function CtxChip({ id, onClear }: { id: string; onClear?: () => void }) {
  const a = portalAnchor(id);
  if (!a || !a.kind) return null;
  const tone = TONE[a.kind];
  return (
    <div className="pe-ctx" style={{ background: tone.bg, borderColor: tone.bd }}>
      <span className="pe-ctx-k" style={{ color: tone.fg }}>
        {PORTAL_CTX_LABEL[a.kind]}
      </span>
      <span className="pe-ctx-l">{a.label}</span>
      {a.from && a.from !== a.label && <span className="pe-ctx-f">{a.from}</span>}
      {onClear && (
        <button type="button" className="pe-ctx-x" onClick={onClear} aria-label="Retirer le contexte">
          ×
        </button>
      )}
    </div>
  );
}

function FileRow({ f }: { f: PortalFile }) {
  return (
    <a href={`/${REPORT.token}`} className="pe-file">
      <span className="pe-file-i">
        <IcoClip size={13} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="pe-file-n">{f.name}</span>
        <span className="pe-file-s">{f.size}</span>
      </span>
    </a>
  );
}

function Message({ m, isLast, waiting }: { m: PortalMessage; isLast: boolean; waiting: boolean }) {
  const mine = m.from === 'client';
  return (
    <article className={`pe-msg${mine ? ' mine' : ''}${!m.read && !mine ? ' unread' : ''}`}>
      <header className="pe-msg-h">
        <span
          className="pc-avatar"
          style={{ width: 32, height: 32, fontSize: '0.75rem', ...(mine ? {} : { background: 'var(--bg-muted)', borderColor: 'var(--bd-solid)', color: 'var(--fg2)' }) }}
        >
          {mine ? PORTAL_ACCOUNT.initials : PORTAL_ACCOUNT.pmInit}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.3 }}>
            {mine ? 'Vous' : PORTAL_ACCOUNT.pm}
            <span style={{ fontWeight: 500, color: 'var(--fg3)' }}>{mine ? '' : ' · votre responsable de compte'}</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)' }}>{m.at}</div>
        </div>
        {!m.read && !mine && <span className="pe-new">Non lu</span>}
      </header>
      {m.ctx && <CtxChip id={m.ctx} />}
      <p style={{ fontSize: '1rem', marginTop: 10, color: 'var(--fg1)' }}>{m.text}</p>
      {m.files && m.files.length > 0 && (
        <div className="pe-files">
          <span className="pc-hint" style={{ width: '100%', marginBottom: 2 }}>
            {m.files.length} pièce{m.files.length > 1 ? 's' : ''} jointe{m.files.length > 1 ? 's' : ''}
          </span>
          {m.files.map((f) => (
            <FileRow key={f.name} f={f} />
          ))}
        </div>
      )}
      {mine && (
        <footer className="pe-state">
          <IcoCheckAll size={13} />
          {m.sent && isLast && waiting ? (
            <span>
              Reçu par {PORTAL_ACCOUNT.pm}. <b>Réponse attendue d’ici demain</b> — le mandat prévoit une réponse
              sous {PORTAL_SLA_DAYS} jour ouvrable.
            </span>
          ) : (
            <span>
              Lu par {PORTAL_ACCOUNT.pm}
              {isLast ? '' : ' · une réponse a suivi'}
            </span>
          )}
        </footer>
      )}
    </article>
  );
}

function Composer({ onSend }: { onSend: (m: { text: string; ctx: string; files: readonly PortalFile[] }) => void }) {
  const [text, setText] = useState('');
  const [ctx, setCtx] = useState('a0');
  const [files, setFiles] = useState<PortalFile[]>([]);

  const add = () => setFiles((f) => [...f, { name: `Document-${f.length + 1}.pdf`, size: '320 Ko' }]);

  return (
    <div className="pe-composer">
      <h2 style={{ marginBottom: 4, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Écrire à {PORTAL_ACCOUNT.pm}</h2>
      <p style={{ fontSize: '0.9375rem', marginBottom: 14, color: 'var(--fg2)' }}>
        Rattachez votre question à l’élément dont elle parle : {PORTAL_ACCOUNT.pm} voit tout de suite de quel chiffre
        ou de quel chantier il s’agit.
      </p>
      <div className="pc-field">
        <label htmlFor="pe-ctx">À propos de</label>
        <select id="pe-ctx" className="pc-input" value={ctx} onChange={(e) => setCtx(e.target.value)}>
          {PORTAL_ANCHORS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.kind ? `${PORTAL_CTX_LABEL[a.kind]} — ${a.label}` : a.label}
            </option>
          ))}
        </select>
      </div>
      {ctx !== 'a0' && (
        <div style={{ marginBottom: 12 }}>
          <CtxChip id={ctx} onClear={() => setCtx('a0')} />
        </div>
      )}
      <div className="pc-field">
        <label htmlFor="pe-txt">Votre message</label>
        <textarea
          id="pe-txt"
          className="pc-input"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Posez votre question — pas besoin de vocabulaire technique."
          style={{ resize: 'vertical', fontSize: '1rem' }}
        />
      </div>
      {files.length > 0 && (
        <div className="pe-files" style={{ marginBottom: 12 }}>
          {files.map((f) => (
            <FileRow key={f.name} f={f} />
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          className="pc-btn solid"
          disabled={!text.trim()}
          onClick={() => {
            onSend({ text: text.trim(), ctx, files });
            setText('');
            setCtx('a0');
            setFiles([]);
          }}
        >
          <IcoSend size={14} />
          Envoyer
        </button>
        <button type="button" className="pc-btn" onClick={add}>
          <IcoClip size={13} />
          Joindre un fichier
        </button>
        <span className="pc-hint" style={{ flex: '1 1 12rem' }}>
          Réponse sous {PORTAL_SLA_DAYS} jour ouvrable. Ce n’est pas une messagerie instantanée — inutile de rester
          sur la page.
        </span>
      </div>
    </div>
  );
}

function PeEmpty() {
  return (
    <div className="pc-wait-card">
      <div className="pc-sent" aria-hidden="true">
        <IcoMsg size={20} />
      </div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Aucun échange pour l’instant</h1>
      <p className="pc-lead">
        C’est ici que vous posez vos questions à {PORTAL_ACCOUNT.pm}, et que vous retrouvez ses réponses. Écrivez
        votre premier message juste en dessous — le fil restera, mois après mois.
      </p>
      <div className="pc-frozen-in" style={{ marginTop: '1.25rem' }}>
        <span>
          <IcoClock size={14} />
        </span>
        <div>
          Le mandat prévoit une réponse sous <b>{PORTAL_SLA_DAYS} jour ouvrable</b>. Pour une urgence, appelez
          directement le {PORTAL_ACCOUNT.phone}.
        </div>
      </div>
    </div>
  );
}

let extraSeq = 0;

export function PortailEchangesView() {
  const [scenario, setScenario] = useState<Scenario>('nonlue');
  const [extra, setExtra] = useState<PortalMessage[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const setSc = (s: Scenario) => {
    setScenario(s);
    setExtra([]);
  };

  const sc = scenarioThread(scenario);
  const thread = [...sc.thread, ...extra];
  const waiting = sc.waiting || extra.length > 0;
  const unread = thread.filter((m) => !m.read && m.from === 'pm').length;

  const send = ({ text, ctx, files }: { text: string; ctx: string; files: readonly PortalFile[] }) => {
    extraSeq += 1;
    setExtra((e) => [
      ...e,
      { id: `n${extraSeq}`, from: 'client', day: '9 octobre 2026', at: 'à l’instant', read: true, sent: true, text, ctx: ctx === 'a0' ? '' : ctx, files },
    ]);
    setToast(`Message envoyé à ${PORTAL_ACCOUNT.pm}. Elle répond en général le jour ouvrable suivant — vous recevrez un courriel.`);
  };

  const days: { day: string; msgs: PortalMessage[] }[] = [];
  thread.forEach((m) => {
    const last = days[days.length - 1];
    if (last && last.day === m.day) last.msgs.push(m);
    else days.push({ day: m.day, msgs: [m] });
  });

  return (
    <div className="pc-root page-scroll">
      <div className="pc-demo">
        <select value={scenario} onChange={(e) => setSc(e.target.value as Scenario)} aria-label="État de démonstration">
          {SCENARIOS.map(([id, l]) => (
            <option key={id} value={id}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <PortalHeader active="echanges" client={PORTAL_ACCOUNT.client} person={PORTAL_ACCOUNT.person} initials={PORTAL_ACCOUNT.initials} pm={PORTAL_ACCOUNT.pm} unread={unread} />

      <div className="pe-wrap">
        {thread.length === 0 ? (
          <>
            <PeEmpty />
            <Composer onSend={send} />
          </>
        ) : (
          <>
            <div className="pc-eyebrow">Échanges</div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 10, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Vos questions, et les réponses de {PORTAL_ACCOUNT.pm}
            </h1>
            <p className="pc-lead" style={{ marginBottom: '1.25rem' }}>
              Un seul fil, du plus ancien au plus récent. {PORTAL_ACCOUNT.pm} voit la même conversation de son côté,
              avec votre dossier sous les yeux.
            </p>

            {unread > 0 && (
              <div className="pc-frozen-in" style={{ background: 'var(--green-m)', borderColor: 'var(--green-b)', marginBottom: 4 }}>
                <span style={{ color: 'var(--green-fg)' }}>
                  <IcoMsg size={14} />
                </span>
                <div>
                  <b>
                    {unread} réponse{unread > 1 ? 's' : ''} non lue{unread > 1 ? 's' : ''}
                  </b>{' '}
                  de {PORTAL_ACCOUNT.pm}, plus bas dans le fil.
                </div>
              </div>
            )}
            {waiting && unread === 0 && (
              <div className="pc-frozen-in" style={{ marginBottom: 4 }}>
                <span>
                  <IcoClock size={14} />
                </span>
                <div>
                  <b>Votre question est arrivée.</b> {PORTAL_ACCOUNT.pm} répond sous {PORTAL_SLA_DAYS} jour ouvrable
                  — c’est le délai inscrit à votre mandat. Vous recevrez un courriel, rien à surveiller ici.
                </div>
              </div>
            )}
            {sc.long && (
              <div className="pc-frozen-in" style={{ marginBottom: 4 }}>
                <span>
                  <IcoMsg size={14} />
                </span>
                <div>
                  {thread.length} messages depuis le début du mandat. Le fil complet est conservé — utilisez la
                  recherche de votre navigateur pour retrouver un sujet précis.
                </div>
              </div>
            )}

            {days.map((d) => (
              <section key={d.day}>
                <div className="pe-day">
                  <span>{d.day}</span>
                </div>
                {d.msgs.map((m) => (
                  <Message key={m.id} m={m} isLast={m === thread[thread.length - 1]} waiting={waiting} />
                ))}
              </section>
            ))}

            <Composer onSend={send} />

            <p className="pc-hint" style={{ marginTop: '1.25rem' }}>
              Pour une urgence — site en panne, erreur visible par vos clients — appelez le {PORTAL_ACCOUNT.phone}{' '}
              plutôt que d’écrire ici.
            </p>
          </>
        )}
      </div>

      {toast && (
        <div className="pc-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
