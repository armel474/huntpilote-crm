'use client';

/**
 * Devis à un client déjà signé — session 7.3.
 *
 * Le panneau latéral reprend `.dl-scrim` / `.dl-sheet` (variante large
 * `.dl-wide`) du panneau de deal (session 4.4). Le document lui-même repose
 * sur `.client-doc` — le même rendu toujours blanc, même en thème sombre,
 * déjà utilisé pour le rapport client et la clôture de tâche (pas une classe
 * parallèle). Un devis envoyé se verrouille ; une correction crée une
 * nouvelle version, même mécanique que le rapport client.
 */
import { useEffect, useState } from 'react';
import { toneColors } from '@/components/ui/Atoms';
import {
  IcoCheck,
  IcoClock,
  IcoEye,
  IcoPen,
  IcoPlus,
  IcoSend,
  IcoX,
  type IconProps,
} from '@/components/ui/Icons';
import {
  QUOTE_STATUSES,
  fmtMoney,
  quoteSubtotal,
  quoteTaxes,
  type Quote,
  type QuoteLine,
  type QuoteStatus,
} from '@/lib/data/devis';
import type { Contact } from '@/lib/data/fiche-client';

const IcoXSm = (p: IconProps) => <IcoX size={11} {...p} />;

const STATUS_ICON: Record<QuoteStatus, (p: IconProps) => React.ReactElement> = {
  brouillon: (p) => <IcoPen {...p} />,
  envoye: (p) => <IcoSend {...p} />,
  accepte: (p) => <IcoCheck {...p} />,
  refuse: (p) => <IcoXSm {...p} />,
  expire: (p) => <IcoClock {...p} />,
};

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
}

function StatusPill({ statut }: { statut: QuoteStatus }) {
  const st = QUOTE_STATUSES[statut];
  const Icon = STATUS_ICON[statut];
  const { bg, border, fg } = toneColors(st.tone);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: bg,
        border: `1px solid ${border}`,
        color: fg,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: '0.5625rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={9} />
      {st.label}
    </span>
  );
}

/* ── Ligne de la liste des devis ── */

function QuoteRow({ q, contactsById, onOpen }: { q: Quote; contactsById: Record<string, Contact>; onOpen: (id: string) => void }) {
  const c = contactsById[q.contactId];
  const sub = quoteSubtotal(q);
  return (
    <button
      type="button"
      onClick={() => onOpen(q.id)}
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr 100px 100px 120px 100px',
        gap: '0 12px',
        alignItems: 'center',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        fontFamily: 'var(--font)',
        borderBottom: '1px solid var(--bd)',
      }}
    >
      <span style={{ padding: '10px 0', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--fg1)', fontVariantNumeric: 'tabular-nums' }}>
        {q.id}
      </span>
      <span style={{ padding: '10px 0', minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--fg1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {q.objet}
        </span>
        {c && <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 1 }}>{c.name}</span>}
      </span>
      <span style={{ padding: '10px 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)', fontVariantNumeric: 'tabular-nums' }}>
        {fmtMoney(sub)}
      </span>
      <span style={{ padding: '10px 0', fontSize: '0.625rem', color: 'var(--fg3)' }}>{q.emis || '—'}</span>
      <span style={{ padding: '10px 0' }}>
        <StatusPill statut={q.statut} />
      </span>
      <span style={{ padding: '10px 0', fontSize: '0.625rem', color: 'var(--fg3)' }}>{q.expire || '—'}</span>
    </button>
  );
}

/* ── Section « Devis » de l'onglet Contrat & facturation ── */

export function QuotesSection({
  quotes,
  contactsById,
  onOpen,
  onNew,
}: {
  quotes: Quote[];
  contactsById: Record<string, Contact>;
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <section className="card" style={{ padding: '0.875rem 1rem' }} aria-labelledby="quotes-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 id="quotes-title" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Devis
          </h2>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
            Services additionnels, avenants et renouvellements à ce client déjà signé.
          </div>
        </div>
        <button className="btn-pri" type="button" onClick={onNew}>
          <IcoPlus size={12} />
          Nouveau devis
        </button>
      </div>
      {quotes.length === 0 ? (
        <div className="empty">Aucun devis émis pour l’instant.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 620 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 100px 120px 100px', gap: '0 12px' }}>
              {['Numéro', 'Objet', 'Montant', 'Émis le', 'Statut', 'Expire le'].map((h) => (
                <div
                  key={h}
                  className="lbl"
                  style={{ paddingBottom: 7, borderBottom: '1px solid var(--bd-solid)' }}
                >
                  {h}
                </div>
              ))}
            </div>
            <div>
              {quotes.map((q) => (
                <QuoteRow key={q.id} q={q} contactsById={contactsById} onOpen={onOpen} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Le document lui-même — `.client-doc` : toujours blanc, même en thème sombre ── */

export function QuoteDoc({ q, contact }: { q: Quote; contact: Contact | undefined }) {
  const sub = quoteSubtotal(q);
  const { tps, tvq, total } = quoteTaxes(sub);
  const lbl: React.CSSProperties = { fontSize: '0.5625rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 };
  const val: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 700, color: '#18181B' };
  const sec: React.CSSProperties = { padding: '16px 4px', borderBottom: '1px solid #E4E4E7' };

  return (
    <div className="client-doc" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <span
              aria-hidden="true"
              style={{ width: 22, height: 22, background: '#16A34A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#18181B' }}>HuntPilote</span>
          </div>
          <div style={lbl}>Devis</div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#18181B' }}>{q.objet}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={lbl}>Numéro</div>
          <div style={{ ...val, marginBottom: 8 }}>{q.id}</div>
          <div style={lbl}>Émis le</div>
          <div style={{ ...val, marginBottom: 8 }}>{q.emis || 'Non émis'}</div>
          <div style={lbl}>Expire le</div>
          <div style={val}>{q.expire || '—'}</div>
        </div>
      </div>

      <div style={{ padding: '16px 18px', borderBottom: '1px solid #E4E4E7' }}>
        <div style={lbl}>Client</div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#18181B' }}>Acme Corp.</div>
        <div style={{ fontSize: '0.75rem', color: '#3F3F46', marginTop: 2 }}>
          À l’attention de {contact ? `${contact.name} · ${contact.role}` : 'contact non renseigné'}
        </div>
      </div>

      <div style={{ padding: '16px 18px', borderBottom: '1px solid #E4E4E7' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 50px 90px 90px',
            gap: 8,
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: '#71717A',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            paddingBottom: 7,
            borderBottom: '1px solid #D0CBBF',
          }}
        >
          <span>Description</span>
          <span>Qté</span>
          <span>Prix</span>
          <span>Montant</span>
        </div>
        {q.lignes.map((l, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 50px 90px 90px',
              gap: 8,
              padding: '9px 0',
              borderBottom: i < q.lignes.length - 1 ? '1px solid #F0F0F2' : 'none',
              fontSize: '0.75rem',
              color: '#18181B',
              alignItems: 'baseline',
            }}
          >
            <span>{l.desc}</span>
            <span>{l.qte}</span>
            <span>{fmtMoney(l.prix)}</span>
            <span style={{ fontWeight: 700 }}>{fmtMoney(l.qte * l.prix)}</span>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#3F3F46', padding: '4px 0' }}>
            <span>Sous-total</span>
            <span>{fmtMoney(sub)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#3F3F46', padding: '4px 0' }}>
            <span>TPS (5 %)</span>
            <span>{fmtMoney(tps)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#3F3F46', padding: '4px 0' }}>
            <span>TVQ (9,975 %)</span>
            <span>{fmtMoney(tvq)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#18181B',
              borderTop: '1px solid #E4E4E7',
              marginTop: 6,
              paddingTop: 10,
            }}
          >
            <span>Total</span>
            <span>{fmtMoney(total)}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div style={lbl}>Conditions</div>
        <p style={{ fontSize: '0.75rem', color: '#3F3F46', lineHeight: 1.6, margin: 0 }}>{q.conditions}</p>
      </div>
    </div>
  );
}

/* ── Formulaire : nouveau devis, ou correction d'un devis envoyé (nouvelle version) ── */

export function QuoteForm({
  contacts,
  initial,
  onCancel,
  onSave,
}: {
  contacts: Contact[];
  initial: Quote | null;
  onCancel: () => void;
  onSave: (data: { objet: string; contactId: string; lignes: QuoteLine[]; conditions: string; expire: string | null }) => void;
}) {
  const [objet, setObjet] = useState(initial?.objet ?? '');
  const [contactId, setContactId] = useState(initial?.contactId ?? contacts[0]?.id ?? '');
  const [lignes, setLignes] = useState<QuoteLine[]>(initial ? initial.lignes.map((l) => ({ ...l })) : [{ desc: '', qte: 1, prix: 0 }]);
  const [conditions, setConditions] = useState(
    initial?.conditions ?? '50 % à la commande, 50 % à la livraison. Offre valide 30 jours à partir de l’envoi.',
  );
  const [expire, setExpire] = useState(initial?.expire ?? '');

  const setLigne = (i: number, field: keyof QuoteLine, v: string) =>
    setLignes((ls) => ls.map((l, j) => (j === i ? { ...l, [field]: field === 'desc' ? v : Number(v) } : l)));
  const addLigne = () => setLignes((ls) => [...ls, { desc: '', qte: 1, prix: 0 }]);
  const removeLigne = (i: number) => setLignes((ls) => ls.filter((_, j) => j !== i));
  const sub = lignes.reduce((s, l) => s + (Number(l.qte) || 0) * (Number(l.prix) || 0), 0);
  const valid = objet.trim() && contactId && lignes.some((l) => l.desc.trim() && l.prix > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
          Objet du devis
        </span>
        <input className="fld" value={objet} onChange={(e) => setObjet(e.target.value)} placeholder="Ex. Ajout d’une seconde langue au site" />
      </div>
      <div>
        <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
          Destinataire
        </span>
        <select className="fld" value={contactId} onChange={(e) => setContactId(e.target.value)}>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.role}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
          Lignes de service
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lignes.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                className="fld"
                style={{ flex: '1 1 auto' }}
                value={l.desc}
                onChange={(e) => setLigne(i, 'desc', e.target.value)}
                placeholder="Description du service"
              />
              <input
                className="fld"
                style={{ flex: '0 0 56px' }}
                type="number"
                min={1}
                value={l.qte}
                onChange={(e) => setLigne(i, 'qte', e.target.value)}
                title="Quantité"
                aria-label="Quantité"
              />
              <input
                className="fld"
                style={{ flex: '0 0 92px' }}
                type="number"
                min={0}
                step={0.01}
                value={l.prix}
                onChange={(e) => setLigne(i, 'prix', e.target.value)}
                title="Prix unitaire ($)"
                aria-label="Prix unitaire"
              />
              <button
                className="btn-icon"
                type="button"
                onClick={() => removeLigne(i)}
                disabled={lignes.length === 1}
                aria-label="Retirer la ligne"
              >
                <IcoX size={11} />
              </button>
            </div>
          ))}
        </div>
        <button className="btn-out" type="button" style={{ marginTop: 8 }} onClick={addLigne}>
          <IcoPlus size={11} />
          Ajouter une ligne
        </button>
        <div style={{ marginTop: 8, fontSize: '0.6875rem', color: 'var(--fg3)' }}>
          Sous-total : <b style={{ color: 'var(--fg1)' }}>{fmtMoney(sub)}</b> — taxes calculées automatiquement sur le document.
        </div>
      </div>
      <div>
        <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
          Date d’expiration de l’offre (optionnel)
        </span>
        <input className="fld" value={expire} onChange={(e) => setExpire(e.target.value)} placeholder="Ex. 28 mai 2026" />
      </div>
      <div>
        <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
          Conditions
        </span>
        <textarea className="fld" rows={3} value={conditions} onChange={(e) => setConditions(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-out" type="button" onClick={onCancel}>
          Annuler
        </button>
        <button
          className="btn-pri"
          type="button"
          disabled={!valid}
          onClick={() =>
            onSave({
              objet: objet.trim(),
              contactId,
              lignes: lignes.filter((l) => l.desc.trim() && l.prix > 0).map((l) => ({ desc: l.desc.trim(), qte: Number(l.qte) || 1, prix: Number(l.prix) || 0 })),
              conditions: conditions.trim(),
              expire: expire.trim() || null,
            })
          }
        >
          <IcoCheck size={12} />
          Enregistrer le brouillon
        </button>
      </div>
    </div>
  );
}

/* ── Panneau latéral : nouveau devis, ou correction (`initial` renseigné) ── */

export function QuoteFormSheet({
  contacts,
  initial,
  onClose,
  onSave,
}: {
  contacts: Contact[];
  initial: Quote | null;
  onClose: () => void;
  onSave: (data: { objet: string; contactId: string; lignes: QuoteLine[]; conditions: string; expire: string | null }) => void;
}) {
  useEscape(onClose);
  return (
    <>
      <div className="dl-scrim" onClick={onClose} />
      <aside className="dl-sheet" role="dialog" aria-modal="true" aria-label={initial ? `Corriger ${initial.id}` : 'Nouveau devis'}>
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {initial ? `Corriger ${initial.id}` : 'Nouveau devis'}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>Acme Corp.</div>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer le panneau">
            <IcoX size={13} />
          </button>
        </div>
        <div className="dl-body">
          <QuoteForm contacts={contacts} initial={initial} onCancel={onClose} onSave={onSave} />
        </div>
      </aside>
    </>
  );
}

/* ── Panneau latéral : détail d'un devis ── */

export function QuoteSheet({
  quote,
  contacts,
  onClose,
  onSend,
  onNewVersion,
  onGoThread,
  onGoContract,
}: {
  quote: Quote;
  contacts: Contact[];
  onClose: () => void;
  onSend: (id: string) => void;
  onNewVersion: (id: string) => void;
  onGoThread: (contactId: string) => void;
  onGoContract: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  useEscape(onClose);
  const contact = contacts.find((c) => c.id === quote.contactId);

  return (
    <>
      <div className="dl-scrim" onClick={onClose} />
      <aside className="dl-sheet dl-wide" role="dialog" aria-modal="true" aria-label={`Devis ${quote.id}`}>
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{quote.id}</span>
              <StatusPill statut={quote.statut} />
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{quote.objet}</div>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer le panneau">
            <IcoX size={13} />
          </button>
        </div>

        <div className="dl-body">
          {quote.statut === 'accepte' && quote.contratRef && (
            <div className="dl-banner green">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoCheck />
              </span>
              <div>
                Accepté — <b>{quote.contratRef}</b>. Visible dans le contrat actif ci-dessus.
              </div>
            </div>
          )}
          {quote.statut === 'refuse' && (
            <div className="dl-banner">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1, color: 'var(--fg3)' }}>
                <IcoX size={13} />
              </span>
              <div>Refusé{quote.motifRefus ? ` — ${quote.motifRefus}` : ', sans motif consigné.'}</div>
            </div>
          )}
          {quote.statut === 'expire' && (
            <div className="dl-banner yellow">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoClock size={13} />
              </span>
              <div>Expiré sans réponse le {quote.expire}. Dupliquez son contenu pour émettre un nouveau devis si l’offre tient toujours.</div>
            </div>
          )}
          {quote.statut === 'envoye' && (
            <div className="dl-banner">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1, color: 'var(--blue-fg)' }}>
                <IcoSend size={13} />
              </span>
              <div>
                En attente de réponse du client — envoyé le {quote.emis}, expire le {quote.expire || '—'}. Document verrouillé :
                une correction crée une nouvelle version.
              </div>
            </div>
          )}

          <QuoteDoc q={quote} contact={contact} />

          <div className="dl-sec" style={{ marginTop: 16 }}>
            <div className="dl-sec-h">
              <span className="lbl">Versions{quote.versions.length ? ` · ${quote.versions.length}` : ''}</span>
            </div>
            {quote.versions.length === 0 ? (
              <div className="empty">Pas encore envoyé — aucune version n’existe.</div>
            ) : (
              <div className="dl-timeline">
                {[...quote.versions].reverse().map((v, i) => (
                  <div key={v.v} className="dl-tl-row">
                    <span
                      aria-hidden="true"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: i === 0 ? 'var(--green-fg)' : 'var(--fg4)',
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>Version {v.v}</span>
                        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
                          {v.at} · {v.who}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginTop: 1, lineHeight: 1.4 }}>{v.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dl-foot" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {quote.statut === 'brouillon' &&
            (confirming ? (
              <>
                <span style={{ flex: '1 1 200px', fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
                  Envoyer à <b>{contact ? contact.name : 'ce contact'}</b> ? Le document sera verrouillé — une correction créera
                  une nouvelle version.
                </span>
                <button className="btn-out" type="button" onClick={() => setConfirming(false)}>
                  Annuler
                </button>
                <button
                  className="btn-pri"
                  type="button"
                  onClick={() => {
                    onSend(quote.id);
                    setConfirming(false);
                  }}
                >
                  <IcoCheck size={12} />
                  Confirmer l’envoi
                </button>
              </>
            ) : (
              <>
                <button className="btn-pri" type="button" onClick={() => setConfirming(true)}>
                  <IcoSend size={12} />
                  Envoyer au client
                </button>
                <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', flex: '1 1 140px' }}>
                  Par courriel, ou déposé dans le fil de communications.
                </span>
              </>
            ))}
          {quote.statut === 'envoye' && (
            <>
              <button className="btn-out" type="button" onClick={() => onGoThread(quote.contactId)}>
                <IcoSend size={12} />
                Relancer via le fil de communications
              </button>
              <button className="btn-out" type="button" onClick={() => onNewVersion(quote.id)}>
                <IcoPen size={11} />
                Corriger — créer une nouvelle version
              </button>
            </>
          )}
          {quote.statut === 'accepte' && (
            <button className="btn-out" type="button" onClick={onGoContract}>
              <IcoEye size={12} />
              Voir le contrat actif
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
