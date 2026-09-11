'use client';

/**
 * Les contacts d'un client — session 7.1.
 *
 * Remplace l'ancien bloc « Contact » unique du panneau de gauche (coordonnées
 * de l'entreprise) par de vraies personnes. Panneau latéral, même mécanique
 * que `DealPanel` (session 4.4) : `.dl-scrim` / `.dl-sheet` et les classes
 * `.dl-*` sont réutilisées telles quelles, pas redessinées.
 */
import { useEffect, useState } from 'react';
import { Badge, Dot } from '@/components/ui/Atoms';
import { IcoCheck, IcoChevR, IcoPlus, IcoWarn, IcoX } from '@/components/ui/Icons';
import { CHANNELS, commFeed } from '@/lib/data/communications';
import { CLIENT, type Contact, type ContactChannel } from '@/lib/data/fiche-client';

const CHANNEL_LABEL: Record<ContactChannel, string> = {
  email: 'Courriel',
  phone: 'Téléphone',
  sms: 'Texto',
};

export type NewContactData = {
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  channel: ContactChannel;
  establishment: string | null;
  notes: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dl-field">
      <span className="dl-field-l">{label}</span>
      <span className="dl-field-v">{children}</span>
    </div>
  );
}

function Section({
  title,
  sub,
  right,
  children,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dl-sec">
      <div className="dl-sec-h">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lbl">{title}</div>
          {sub && (
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.45 }}>{sub}</div>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
}

/* ── Ligne compacte (panneau gauche) ── */

function ContactRow({ c, onClick }: { c: Contact; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 7px',
        borderRadius: 8,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'var(--font)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--bg-muted)',
          border: '1px solid var(--bd-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.5625rem',
          fontWeight: 700,
          color: 'var(--fg2)',
          flexShrink: 0,
        }}
      >
        {c.initials}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--fg1)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {c.name}
          </span>
          {c.principal && <Badge label="Principal" tone="green" />}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: '0.5625rem',
            color: 'var(--fg3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {c.role}
        </span>
      </span>
      <span style={{ color: 'var(--fg4)', flexShrink: 0, display: 'flex' }}>
        <IcoChevR />
      </span>
    </button>
  );
}

/* ── Ligne détaillée (panneau « tous les contacts ») ── */

function ContactRowFull({ c, onClick }: { c: Contact; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 9,
        cursor: 'pointer',
        opacity: c.status === 'archive' ? 0.6 : 1,
        background: 'transparent',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'var(--font)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--bg-muted)',
          border: '1px solid var(--bd-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.625rem',
          fontWeight: 700,
          color: 'var(--fg2)',
          flexShrink: 0,
        }}
      >
        {c.initials}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>{c.name}</span>
          {c.principal && <Badge label="Principal" tone="green" />}
          {c.status === 'archive' && <Badge label="Archivé" tone="neutral" />}
        </span>
        <span style={{ display: 'block', fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>
          {c.role}
          {c.establishment ? ` · ${c.establishment}` : ''}
        </span>
      </span>
      <span style={{ color: 'var(--fg4)', flexShrink: 0, display: 'flex' }}>
        <IcoChevR />
      </span>
    </button>
  );
}

/* ── Bloc « Contacts » du panneau gauche (remplace l'ancien bloc « Contact » unique) ── */

export function ContactsBlock({
  contacts,
  onOpen,
  onOpenAll,
  onAdd,
}: {
  contacts: Contact[];
  onOpen: (id: string) => void;
  onOpenAll: () => void;
  onAdd: () => void;
}) {
  const active = contacts.filter((c) => c.status === 'actif');
  const shown = active.slice(0, 3);
  const rest = active.length - shown.length;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="lbl">Contacts</span>
        <button
          type="button"
          onClick={onAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: 'var(--fg3)',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font)',
          }}
        >
          <IcoPlus size={10} />
          Ajouter
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: rest > 0 ? 4 : 12 }}>
        {shown.length === 0 ? (
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginBottom: 12 }}>Aucun contact renseigné.</div>
        ) : (
          shown.map((c) => <ContactRow key={c.id} c={c} onClick={() => onOpen(c.id)} />)
        )}
      </div>
      {rest > 0 && (
        <button
          type="button"
          onClick={onOpenAll}
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--green-fg)',
            cursor: 'pointer',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 7px',
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font)',
          }}
        >
          Voir tous les contacts ({active.length})
          <IcoChevR />
        </button>
      )}
    </>
  );
}

/* ── Panneau latéral : tous les contacts ── */

export function ContactsAllSheet({
  contacts,
  onClose,
  onOpen,
  onAdd,
}: {
  contacts: Contact[];
  onClose: () => void;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  useEscape(onClose);
  const active = contacts.filter((c) => c.status === 'actif');
  const archived = contacts.filter((c) => c.status === 'archive');
  return (
    <>
      <div className="dl-scrim" onClick={onClose} />
      <aside className="dl-sheet" role="dialog" aria-modal="true" aria-label="Tous les contacts">
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Contacts</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>
              {CLIENT.name} · {active.length} contact{active.length > 1 ? 's' : ''} actif
              {active.length > 1 ? 's' : ''}
            </div>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer le panneau">
            <IcoX size={13} />
          </button>
        </div>
        <div className="dl-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {active.map((c) => (
              <ContactRowFull key={c.id} c={c} onClick={() => onOpen(c.id)} />
            ))}
          </div>
          {archived.length > 0 && (
            <>
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 6,
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  color: 'var(--fg4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Anciens contacts ({archived.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {archived.map((c) => (
                  <ContactRowFull key={c.id} c={c} onClick={() => onOpen(c.id)} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="dl-foot">
          <button className="btn-pri" type="button" style={{ width: '100%', justifyContent: 'center' }} onClick={onAdd}>
            <IcoPlus size={12} />
            Ajouter un contact
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Panneau latéral : fiche d'un contact (vue + création) ── */

export function ContactSheet({
  contact,
  isCreate,
  onClose,
  onSetPrincipal,
  onArchive,
  onUnarchive,
  onSave,
  onGoThread,
}: {
  contact: Contact | null;
  isCreate: boolean;
  onClose: () => void;
  onSetPrincipal: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onSave: (data: NewContactData) => void;
  onGoThread: (contactId: string) => void;
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<ContactChannel>('email');
  const [establishment, setEstablishment] = useState('');
  const [notes, setNotes] = useState('');
  useEscape(onClose);

  if (!isCreate && !contact) return null;

  const archived = !isCreate && contact?.status === 'archive';
  const echanges = !isCreate && contact ? commFeed().filter((r) => r.contactId === contact.id).slice(0, 4) : [];

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      role: role.trim() || 'Contact',
      email: email.trim() || null,
      phone: phone.trim() || null,
      channel,
      establishment: establishment.trim() || null,
      notes: notes.trim(),
    });
  };

  return (
    <>
      <div className="dl-scrim" onClick={onClose} />
      <aside
        className="dl-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? 'Ajouter un contact' : `Fiche de ${contact?.name}`}
      >
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              {isCreate ? 'Ajouter un contact' : contact?.name}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>
              {isCreate
                ? CLIENT.name
                : `${contact?.role} · ${CLIENT.name}${contact?.establishment ? ` · ${contact.establishment}` : ''}`}
            </div>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer le panneau">
            <IcoX size={13} />
          </button>
        </div>

        <div className="dl-body">
          {!isCreate && contact?.principal && (
            <div className="dl-banner green">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoCheck />
              </span>
              <div>
                Contact principal — reçoit le rapport mensuel et les communications par défaut, sauf précision
                contraire.
              </div>
            </div>
          )}
          {archived && (
            <div className="dl-banner yellow">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoWarn />
              </span>
              <div>A quitté l’entreprise — contact archivé. Conservé pour que l’historique des échanges reste lisible.</div>
            </div>
          )}

          {isCreate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Nom complet
                </span>
                <input className="fld" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Sophie Tremblay" />
              </div>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Rôle
                </span>
                <input className="fld" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. Directrice marketing" />
              </div>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Courriel
                </span>
                <input className="fld" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@client.com" />
              </div>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Téléphone
                </span>
                <input className="fld" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(514) 555-0100" />
              </div>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Canal de communication préféré
                </span>
                <select className="fld" value={channel} onChange={(e) => setChannel(e.target.value as ContactChannel)}>
                  <option value="email">Courriel</option>
                  <option value="phone">Téléphone</option>
                  <option value="sms">Texto</option>
                </select>
              </div>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Établissement rattaché (optionnel)
                </span>
                <input
                  className="fld"
                  value={establishment}
                  onChange={(e) => setEstablishment(e.target.value)}
                  placeholder="Laisser vide pour le siège"
                />
              </div>
              <div>
                <span className="lbl" style={{ display: 'block', marginBottom: 5 }}>
                  Notes internes
                </span>
                <textarea
                  className="fld"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jamais visible du client…"
                />
              </div>
            </div>
          ) : (
            contact && (
              <>
                <Section title="Coordonnées">
                  <div className="dl-fields">
                    <Field label="Courriel">{contact.email || <span style={{ color: 'var(--fg3)' }}>Non renseigné</span>}</Field>
                    <Field label="Téléphone">{contact.phone || <span style={{ color: 'var(--fg3)' }}>Non renseigné</span>}</Field>
                    <Field label="Canal préféré">
                      <Badge label={CHANNEL_LABEL[contact.channel]} tone="blue" />
                    </Field>
                  </div>
                </Section>

                <Section title="Notes internes · jamais visible du client">
                  {contact.notes ? (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{contact.notes}</p>
                  ) : (
                    <div className="empty">Aucune note.</div>
                  )}
                </Section>

                <Section title={`Derniers échanges${echanges.length ? ` · ${echanges.length}` : ''}`}>
                  {echanges.length === 0 ? (
                    <div className="empty">Aucun échange consigné avec ce contact.</div>
                  ) : (
                    <>
                      <div className="dl-timeline">
                        {echanges.map((e) => {
                          const cfg = CHANNELS[e.channel];
                          return (
                            <div key={e.id} className="dl-tl-row">
                              <Dot tone={cfg.tone} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.625rem', fontWeight: 800 }}>{cfg.label}</span>
                                  <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
                                    {e.day} · {e.at}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: 'var(--fg2)',
                                    lineHeight: 1.5,
                                    marginTop: 2,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {e.text}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => onGoThread(contact.id)}
                        style={{
                          marginTop: 8,
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          color: 'var(--green-fg)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          background: 'transparent',
                          border: 'none',
                          fontFamily: 'var(--font)',
                        }}
                      >
                        Voir le fil complet
                        <IcoChevR />
                      </button>
                    </>
                  )}
                </Section>
              </>
            )
          )}
        </div>

        <div className="dl-foot" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {isCreate ? (
            <>
              <button className="btn-out" type="button" onClick={onClose}>
                Annuler
              </button>
              <button className="btn-pri" type="button" disabled={!name.trim()} onClick={submit}>
                <IcoCheck size={12} />
                Ajouter le contact
              </button>
            </>
          ) : archived ? (
            <button className="btn-out" type="button" onClick={() => onUnarchive(contact!.id)}>
              Désarchiver ce contact
            </button>
          ) : contact?.principal ? (
            <button className="btn-out" type="button" onClick={() => onArchive(contact.id)}>
              Archiver ce contact
            </button>
          ) : (
            contact && (
              <>
                <button className="btn-pri" type="button" onClick={() => onSetPrincipal(contact.id)}>
                  <IcoCheck size={12} />
                  Marquer comme contact principal
                </button>
                <button className="btn-out" type="button" onClick={() => onArchive(contact.id)}>
                  Archiver ce contact
                </button>
              </>
            )
          )}
        </div>
      </aside>
    </>
  );
}
