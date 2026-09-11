'use client';

/**
 * Communications — session 7.2.
 *
 * Un seul fil chronologique, tous canaux confondus, qui fusionne les
 * échanges agence avec `PORTAL_THREAD` (session 5.2) — voir
 * `lib/data/communications.ts`. La distinction visible / interne se voit sur
 * chaque ligne, pas seulement au clic ; un message composé sur un canal
 * visible du client exige une confirmation avant l'envoi.
 */
import { useMemo, useState } from 'react';
import { Badge, Dot, StatusTag } from '@/components/ui/Atoms';
import { EmptyFilter, EmptyInitial } from '@/components/ui/States';
import { IcoCheck, IcoClip, IcoDoc, IcoSend, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  ANCHORS,
  CHANNELS,
  CHANNEL_IDS,
  CTX_KINDS,
  anchor,
  commFeed,
  type ChannelId,
  type CommRow,
} from '@/lib/data/communications';
import type { Contact } from '@/lib/data/fiche-client';

function ctxColor(tone: string) {
  return tone === 'neutral' ? 'var(--fg3)' : `var(--${tone}-fg)`;
}

function monthLabel(ts: number): string {
  const label = new Date(ts).toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupByMonth(rows: CommRow[]): [string, CommRow[]][] {
  const order: string[] = [];
  const map = new Map<string, CommRow[]>();
  for (const r of rows) {
    const key = monthLabel(r.ts);
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(r);
  }
  return order.map((k) => [k, map.get(k)!]);
}

/* ── Une ligne du fil ── */

function ThreadRow({
  e,
  contactsById,
  pending,
  onOpenContact,
}: {
  e: CommRow;
  contactsById: Record<string, Contact>;
  pending: boolean;
  onOpenContact: (id: string) => void;
}) {
  const cfg = CHANNELS[e.channel];
  const c = contactsById[e.contactId];
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: pending ? '11px 10px' : '11px 4px',
        borderRadius: pending ? 9 : 0,
        background: pending ? 'var(--yellow-m)' : 'transparent',
        borderBottom: pending ? 'none' : '1px solid var(--bd)',
        margin: pending ? '2px 0' : 0,
      }}
    >
      <Dot tone={cfg.tone} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 2 }}>
          <Badge label={cfg.label} tone={cfg.tone} />
          <StatusTag status={cfg.visible ? 'Visible du client' : 'Interne'} tone={cfg.visible ? 'green' : 'neutral'} />
          {pending && <Badge label="En attente de réponse" tone="yellow" />}
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
            {e.who}
            {c && c.name !== e.who ? (
              <>
                {' '}
                · avec{' '}
                <button
                  type="button"
                  onClick={() => onOpenContact(e.contactId)}
                  style={{
                    color: 'var(--green-fg)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontFamily: 'var(--font)',
                    fontSize: '0.625rem',
                  }}
                >
                  {c.name}
                </button>
              </>
            ) : null}
          </span>
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {e.day} · {e.at}
          </span>
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55, margin: 0 }}>{e.text}</p>
        {e.ctx && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px 3px 3px',
              borderRadius: 999,
              fontSize: '0.5625rem',
              marginTop: 6,
              border: '1px solid var(--bd-solid)',
              background: 'var(--bg-muted)',
              maxWidth: '100%',
            }}
          >
            <b style={{ fontWeight: 700, flexShrink: 0, color: ctxColor(CTX_KINDS[e.ctx.kind].tone) }}>
              {CTX_KINDS[e.ctx.kind].label}
            </b>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg2)' }}>
              {e.ctx.label}
            </span>
          </div>
        )}
        {e.files.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {e.files.map((f, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  color: 'var(--fg2)',
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--bd-solid)',
                  borderRadius: 7,
                  padding: '4px 9px',
                  marginRight: 6,
                }}
              >
                <IcoDoc size={10} />
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Composer ── */

function Composer({
  contacts,
  onAdd,
}: {
  contacts: Contact[];
  onAdd: (row: CommRow) => void;
}) {
  const [contact, setContact] = useState(contacts[0]?.id ?? '');
  const [channel, setChannel] = useState<ChannelId>('courriel');
  const [ctxId, setCtxId] = useState('x0');
  const [text, setText] = useState('');
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [confirming, setConfirming] = useState(false);
  const cfg = CHANNELS[channel];
  const contactObj = contacts.find((c) => c.id === contact);

  const addFile = () => setFiles((f) => [...f, { name: `Document-${f.length + 1}.pdf`, size: '280 Ko' }]);
  const reset = () => {
    setText('');
    setFiles([]);
    setCtxId('x0');
    setConfirming(false);
  };
  const send = () => {
    if (!text.trim() || !cfg.connected) return;
    if (cfg.visible && !confirming) {
      setConfirming(true);
      return;
    }
    const a = ctxId !== 'x0' ? anchor(ctxId) : null;
    onAdd({
      id: `u${Date.now()}`,
      channel,
      contactId: contact,
      dir: 'out',
      who: 'Vous',
      day: 'Aujourd’hui',
      at: 'à l’instant',
      ts: Date.now(),
      text: text.trim(),
      files,
      ctx: a && a.kind ? { kind: a.kind, label: a.label } : null,
    });
    reset();
  };

  return (
    <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span className="lbl">Nouveau message</span>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
            Avec
          </span>
          <select
            className="fld"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setConfirming(false);
            }}
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.role}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
            Canal
          </span>
          <select
            className="fld"
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value as ChannelId);
              setConfirming(false);
            }}
          >
            <optgroup label="Visible du client">
              {CHANNEL_IDS.filter((id) => CHANNELS[id].visible).map((id) => (
                <option key={id} value={id}>
                  {CHANNELS[id].label}
                  {!CHANNELS[id].connected ? ' (non connecté)' : ''}
                </option>
              ))}
            </optgroup>
            <optgroup label="Interne — jamais visible du client">
              {CHANNEL_IDS.filter((id) => !CHANNELS[id].visible).map((id) => (
                <option key={id} value={id}>
                  {CHANNELS[id].label}
                  {!CHANNELS[id].connected ? ' (non connecté)' : ''}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
            Rattaché à
          </span>
          <select className="fld" value={ctxId} onChange={(e) => setCtxId(e.target.value)}>
            {ANCHORS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.kind ? `${CTX_KINDS[a.kind].label} — ${a.label}` : a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!cfg.connected && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 8,
            background: 'var(--yellow-m)',
            border: '1px solid var(--yellow-b)',
            color: 'var(--fg2)',
            fontSize: '0.6875rem',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: 'var(--yellow-fg)', flexShrink: 0, display: 'flex' }}>
            <IcoWarn size={13} />
          </span>
          <span>
            {cfg.label} n’est pas encore connecté à HuntPilote — le message ne pourra pas partir.{' '}
            <a href={routes.parametres('integrations')} style={{ color: 'var(--yellow-fg)', fontWeight: 700 }}>
              Connecter dans Paramètres →
            </a>
          </span>
        </div>
      )}

      <textarea
        className="fld"
        rows={3}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setConfirming(false);
        }}
        placeholder={cfg.visible ? 'Votre message — visible par le contact choisi.' : 'Note interne — jamais visible du client.'}
      />

      {files.length > 0 && (
        <div>
          {files.map((f, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.5625rem',
                fontWeight: 600,
                color: 'var(--fg2)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--bd-solid)',
                borderRadius: 7,
                padding: '4px 9px',
                marginRight: 6,
              }}
            >
              <IcoDoc size={10} />
              {f.name}
            </span>
          ))}
        </div>
      )}

      {confirming ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 9,
            background: 'var(--green-m)',
            border: '1px solid var(--green-b)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'var(--green-fg)', display: 'flex' }}>
            <IcoWarn size={13} />
          </span>
          <span style={{ flex: '1 1 200px', fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
            Ce message sera <b>visible par {contactObj ? contactObj.name : 'ce contact'}</b> sur {cfg.label}. Confirmer
            l’envoi ?
          </span>
          <button className="btn-out" type="button" onClick={() => setConfirming(false)}>
            Annuler
          </button>
          <button className="btn-pri" type="button" onClick={send}>
            <IcoCheck size={12} />
            Confirmer l’envoi
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-pri" type="button" disabled={!text.trim() || !cfg.connected} onClick={send}>
            <IcoSend size={12} />
            {cfg.visible ? 'Envoyer' : 'Consigner'}
          </button>
          <button className="btn-out" type="button" onClick={addFile}>
            <IcoClip size={12} />
            Joindre un fichier
          </button>
          {cfg.visible && (
            <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', flex: '1 1 140px' }}>
              Une confirmation sera demandée avant l’envoi.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Panneau principal ── */

export function PanelCommunications({
  contacts,
  initialContactFilter,
  onOpenContact,
}: {
  contacts: Contact[];
  initialContactFilter: string | null;
  onOpenContact: (id: string) => void;
}) {
  const [included, setIncluded] = useState<ChannelId[]>(CHANNEL_IDS);
  const [contactFilter, setContactFilter] = useState(initialContactFilter ?? 'tous');
  const [period, setPeriod] = useState<'tout' | '2026' | '2025'>('tout');
  const [extra, setExtra] = useState<CommRow[]>([]);

  const contactsById = useMemo(() => Object.fromEntries(contacts.map((c) => [c.id, c])), [contacts]);
  const base = useMemo(() => commFeed(), []);
  const feed = [...extra, ...base].sort((a, b) => b.ts - a.ts);
  const pendingId = feed.length && feed[0].dir === 'in' ? feed[0].id : null;

  const toggleChannel = (ch: ChannelId) =>
    setIncluded((inc) => (inc.includes(ch) ? inc.filter((x) => x !== ch) : [...inc, ch]));
  const resetFilters = () => {
    setIncluded(CHANNEL_IDS);
    setContactFilter('tous');
    setPeriod('tout');
  };

  const filtered = feed.filter(
    (e) =>
      included.includes(e.channel) &&
      (contactFilter === 'tous' || e.contactId === contactFilter) &&
      (period === 'tout' || new Date(e.ts).getFullYear() === Number(period)),
  );
  const onlyOneUnconnected = included.length === 1 && !CHANNELS[included[0]].connected;
  const distinctMonths = new Set(filtered.map((e) => monthLabel(e.ts))).size;
  const grouped = distinctMonths > 1 ? groupByMonth(filtered) : null;
  const activeContacts = contacts.filter((c) => c.status === 'actif');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)' }}>Communications</div>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>
          {feed.length} échange{feed.length > 1 ? 's' : ''} · tous canaux
        </span>
      </div>

      {feed.length > 0 && <Composer contacts={activeContacts} onAdd={(m) => setExtra((x) => [m, ...x])} />}

      {feed.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="chips">
            {CHANNEL_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className="chip"
                data-on={included.includes(id)}
                onClick={() => toggleChannel(id)}
              >
                {CHANNELS[id].label}
              </button>
            ))}
          </div>
          <select className="fld" style={{ width: 'auto' }} value={contactFilter} onChange={(e) => setContactFilter(e.target.value)}>
            <option value="tous">Tous les contacts</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="seg" role="group" aria-label="Période">
            {(['tout', '2026', '2025'] as const).map((v) => (
              <button key={v} type="button" data-on={period === v} onClick={() => setPeriod(v)}>
                {v === 'tout' ? 'Tout' : v}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: feed.length === 0 || filtered.length === 0 ? 0 : '4px 14px 8px' }}>
        {feed.length === 0 ? (
          <EmptyInitial
            icon={<IcoDoc size={20} />}
            title="Aucune communication pour l’instant"
            text="Client tout juste signé — le fil se remplira au fil des échanges, tous canaux confondus, dès le premier message."
          />
        ) : onlyOneUnconnected && filtered.length === 0 ? (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--yellow-fg)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <IcoWarn size={18} />
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg1)', marginBottom: 4 }}>
              {CHANNELS[included[0]].label} n’est pas connecté
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', maxWidth: 320, margin: '0 auto 10px', lineHeight: 1.5 }}>
              Connectez ce canal pour voir apparaître les échanges ici.
            </div>
            <a href={routes.parametres('integrations')} className="btn-pri" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Connecter dans Paramètres
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyFilter onReset={resetFilters} />
        ) : grouped ? (
          grouped.map(([month, rows]) => (
            <div key={month}>
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  background: 'var(--bg-solid)',
                  padding: '10px 2px 6px',
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  color: 'var(--fg4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid var(--bd)',
                }}
              >
                {month}
              </div>
              {rows.map((e) => (
                <ThreadRow key={e.id} e={e} contactsById={contactsById} pending={e.id === pendingId} onOpenContact={onOpenContact} />
              ))}
            </div>
          ))
        ) : (
          filtered.map((e) => (
            <ThreadRow key={e.id} e={e} contactsById={contactsById} pending={e.id === pendingId} onOpenContact={onOpenContact} />
          ))
        )}
      </div>
    </div>
  );
}
