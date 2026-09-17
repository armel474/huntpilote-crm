'use client';

/**
 * Un document produit — session 9.4. Deux colonnes : le rendu à gauche
 * (`.client-doc`, toujours blanc ; figé dès l'envoi), la colonne latérale à
 * droite — statut, le geste qui compte, la chaîne, les versions, le journal.
 *
 * Un brouillon se compose ici : objet, contact, dates, lignes, sections du
 * modèle et compléments (les balises restées vides). Un document envoyé ne
 * se modifie pas : « Corriger » rouvre un brouillon, la version envoyée
 * reste consultable.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Dialog, Notice } from '@/app/agence/bits';
import type { ActionState } from '@/app/agence/action-base';
import { decideDocument, newVersion, saveDraft, sendDocument, type Decision, type LineInput, type SendChannel } from '@/app/documents/actions';
import { DocFrame, openDocumentWindow } from '@/components/documents/DocFrame';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { Badge } from '@/components/ui/Atoms';
import { IcoCheck, IcoLink, IcoLock, IcoPlus, IcoSend, IcoWarn, IcoX } from '@/components/ui/Icons';
import { BILLING_SUFFIX, LINE_KIND_LABEL, computeTotals, type Billing, type LineKind } from '@/lib/documents/donnees';
import { PERMISSION_LABEL, money } from '@/lib/format';
import { GEN_KIND_LABEL, STATUS_META, type DocumentDetail, type Permission, type Rendered } from '@/lib/queries/documents';
import { routes } from '@/lib/routes';

const EVENT_LABEL: Record<DocumentDetail['events'][number]['kind'], string> = {
  cree: 'Créé',
  modifie: 'Brouillon modifié',
  envoye: 'Envoyé',
  relance: 'Relance',
  ouvert: 'Ouvert par le client',
  accepte: 'Accepté',
  refuse: 'Refusé',
  signe: 'Signé',
  paye: 'Payé',
  corrige: 'Corrigé — nouvelle version',
  annule: 'Annulé',
};

const LINE_KINDS: LineKind[] = ['facturable', 'offert', 'remise', 'informatif'];
const BILLINGS: Billing[] = ['ponctuel', 'mensuel', 'trimestriel', 'annuel'];

const fmtDay = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
const day = (iso: string | null) => (iso ? fmtDay.format(new Date(`${iso.slice(0, 10)}T00:00:00`)) : '—');
const toCents = (v: string) => Math.round(Number(String(v).replace(/\s/g, '').replace(',', '.')) * 100);
const fromCents = (c: number) => (c / 100).toFixed(2);

type EditLine = { description: string; quantity: string; unitPrice: string; kind: LineKind; billing: Billing; catalogItemId: string | null; offerId: string | null };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cs-block">
      <div className="cs-block-h">{title}</div>
      {children}
    </div>
  );
}

/* ── Le brouillon se compose ── */

function ComposeForm({ doc, unfilled, canEdit, onSaved }: { doc: DocumentDetail; unfilled: string[]; canEdit: boolean; onSaved: (s: ActionState) => void }) {
  const router = useRouter();
  const [subject, setSubject] = useState(doc.subject);
  const [contactId, setContactId] = useState(doc.contact?.id ?? '');
  const [expiresOn, setExpiresOn] = useState(doc.expiresOn ?? '');
  const [dueOn, setDueOn] = useState(doc.dueOn ?? '');
  const [terms, setTerms] = useState(doc.paymentTermsDays != null ? String(doc.paymentTermsDays) : '');
  const [lines, setLines] = useState<EditLine[]>(
    doc.lines.map((l) => ({ description: l.description, quantity: String(l.quantity), unitPrice: fromCents(l.unitPriceCents), kind: l.kind, billing: l.billing, catalogItemId: l.catalogItemId, offerId: l.offerId })),
  );
  const [sections, setSections] = useState(doc.sections.map((s) => ({ id: s.id, body: s.body, enabled: s.enabled, locked: s.locked })));
  const [extras, setExtras] = useState<Record<string, string>>(doc.extras);
  const [pending, startTransition] = useTransition();
  const isInvoice = doc.kind === 'facture';

  const parsed = useMemo<LineInput[]>(
    () =>
      lines
        .filter((l) => l.description.trim())
        .map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity), unitPriceCents: toCents(l.unitPrice) || 0, kind: l.kind, billing: l.billing, catalogItemId: l.catalogItemId, offerId: l.offerId })),
    [lines],
  );
  const totals = useMemo(() => computeTotals(parsed, doc.rates), [parsed, doc.rates]);
  const extraTags = useMemo(() => [...new Set([...unfilled.filter((t) => !t.startsWith('section.')), ...Object.keys(doc.extras)])], [unfilled, doc.extras]);
  const setLine = (i: number, patch: Partial<EditLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const save = () =>
    startTransition(async () => {
      const r = await saveDraft(doc.id, {
        subject,
        contactId: contactId || null,
        ...(isInvoice ? { dueOn: dueOn || null } : { expiresOn: expiresOn || null, paymentTermsDays: terms.trim() === '' ? null : Number(terms) }),
        lines: parsed,
        sections,
        extras,
      });
      onSaved({ ...r, at: Date.now() });
      if (r.ok) router.refresh();
    });

  return (
    <div className="card docg-compose" style={{ padding: '1rem 1.125rem' }}>
      {!canEdit && <Notice tone="warn">Lecture seule : le droit « Gérer les comptes » ou « Envoyer des documents » est requis pour modifier un brouillon.</Notice>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {!isInvoice && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="lbl" htmlFor="dc-subject" style={{ display: 'block', marginBottom: 4 }}>Objet</label>
            <input id="dc-subject" className="fld" value={subject} disabled={!canEdit} onChange={(e) => setSubject(e.target.value)} />
          </div>
        )}
        {!isInvoice && (
          <div>
            <label className="lbl" htmlFor="dc-contact" style={{ display: 'block', marginBottom: 4 }}>Contact destinataire</label>
            <select id="dc-contact" className="sel" style={{ fontSize: '0.8125rem' }} value={contactId} disabled={!canEdit} onChange={(e) => setContactId(e.target.value)}>
              <option value="">— Aucun —</option>
              {doc.contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.role ? ` · ${c.role}` : ''}</option>)}
            </select>
          </div>
        )}
        {isInvoice ? (
          <div>
            <label className="lbl" htmlFor="dc-due" style={{ display: 'block', marginBottom: 4 }}>Échéance de paiement</label>
            <input id="dc-due" className="fld" type="date" value={dueOn} disabled={!canEdit} onChange={(e) => setDueOn(e.target.value)} />
          </div>
        ) : (
          <>
            <div>
              <label className="lbl" htmlFor="dc-exp" style={{ display: 'block', marginBottom: 4 }}>Date d&apos;expiration</label>
              <input id="dc-exp" className="fld" type="date" value={expiresOn} disabled={!canEdit} onChange={(e) => setExpiresOn(e.target.value)} />
            </div>
            <div>
              <label className="lbl" htmlFor="dc-terms" style={{ display: 'block', marginBottom: 4 }}>Délai de paiement (jours)</label>
              <input id="dc-terms" className="fld" inputMode="numeric" value={terms} disabled={!canEdit} onChange={(e) => setTerms(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div>
        <div className="lbl" style={{ marginBottom: 6 }}>Lignes</div>
        <div className="docg-lines">
          {lines.map((l, i) => (
            <div key={i} className="docg-line">
              <input className="fld" aria-label="Description" placeholder="Description" value={l.description} disabled={!canEdit} onChange={(e) => setLine(i, { description: e.target.value })} />
              <input className="fld" aria-label="Quantité" inputMode="decimal" value={l.quantity} disabled={!canEdit} onChange={(e) => setLine(i, { quantity: e.target.value })} />
              <input className="fld" aria-label="Prix unitaire" inputMode="decimal" value={l.unitPrice} disabled={!canEdit || l.kind === 'offert' || l.kind === 'informatif'} onChange={(e) => setLine(i, { unitPrice: e.target.value })} />
              <select className="sel docg-line-kind" aria-label="Nature" style={{ fontSize: '0.75rem' }} value={l.kind} disabled={!canEdit || isInvoice} onChange={(e) => setLine(i, { kind: e.target.value as LineKind, unitPrice: e.target.value === 'offert' || e.target.value === 'informatif' ? '0' : l.unitPrice })}>
                {LINE_KINDS.map((k) => <option key={k} value={k}>{LINE_KIND_LABEL[k]}</option>)}
              </select>
              <select className="sel docg-line-billing" aria-label="Récurrence" style={{ fontSize: '0.75rem' }} value={l.billing} disabled={!canEdit || isInvoice} onChange={(e) => setLine(i, { billing: e.target.value as Billing })}>
                {BILLINGS.map((b) => <option key={b} value={b}>{b === 'ponctuel' ? 'Ponctuel' : BILLING_SUFFIX[b]}</option>)}
              </select>
              <button className="btn-icon" type="button" aria-label="Retirer la ligne" disabled={!canEdit} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}><IcoX size={11} /></button>
            </div>
          ))}
        </div>
        {canEdit && (
          <button className="btn-out" type="button" style={{ marginTop: 8 }} onClick={() => setLines((ls) => [...ls, { description: '', quantity: '1', unitPrice: '0', kind: 'facturable', billing: 'ponctuel', catalogItemId: null, offerId: null }])}>
            <IcoPlus size={11} />Ajouter une ligne
          </button>
        )}
        <div className="ndp-tot">
          {totals.recurrent > 0 && <div className="ndp-tot-row muted"><span>Dont récurrent (hors taxes)</span><span>{money(totals.recurrent, { exact: true })}</span></div>}
          <div className="ndp-tot-row"><span>Sous-total</span><span>{money(totals.ht, { exact: true })}</span></div>
          <div className="ndp-tot-row"><span>TPS ({(doc.rates.tps * 100).toLocaleString('fr-CA')} %)</span><span>{money(totals.tps, { exact: true })}</span></div>
          <div className="ndp-tot-row"><span>TVQ ({(doc.rates.tvq * 100).toLocaleString('fr-CA')} %)</span><span>{money(totals.tvq, { exact: true })}</span></div>
          <div className="ndp-tot-row ttc"><span>Total</span><span>{money(totals.ttc, { exact: true })}</span></div>
        </div>
      </div>

      {doc.sections.length > 0 && (
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Sections du modèle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doc.sections.map((s, i) => {
              const st = sections[i];
              return (
                <div key={s.id} className="docg-section" style={{ opacity: st.enabled ? 1 : 0.6 }}>
                  <div className="docg-section-h">
                    <b>{s.title}</b>
                    <code>{`{{section.${s.key}}}`}</code>
                    {s.optional && (
                      <label style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input type="checkbox" checked={st.enabled} disabled={!canEdit} onChange={(e) => setSections((xs) => xs.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)))} />
                        Incluse
                      </label>
                    )}
                    <label style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: 4 }} title="Une section verrouillée ne sera pas réécrite par l’assistant, plus tard.">
                      <input type="checkbox" checked={st.locked} disabled={!canEdit} onChange={(e) => setSections((xs) => xs.map((x, j) => (j === i ? { ...x, locked: e.target.checked } : x)))} />
                      Verrouillée
                    </label>
                  </div>
                  <textarea className="docg-ta" value={st.body} disabled={!canEdit || !st.enabled} maxLength={s.maxChars ?? undefined} onChange={(e) => setSections((xs) => xs.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
                  {s.maxChars && <div style={{ fontSize: '0.625rem', color: 'var(--fg4)', marginTop: 3 }}>{st.body.length} / {s.maxChars} caractères</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {extraTags.length > 0 && (
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Compléments — les balises que le modèle attend encore</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
            {extraTags.map((t) => (
              <div key={t}>
                <label className="lbl" htmlFor={`x-${t}`} style={{ display: 'block', marginBottom: 4, textTransform: 'none', letterSpacing: 0, fontFamily: 'ui-monospace, monospace' }}>{`{{${t}}}`}</label>
                <input id={`x-${t}`} className="fld" value={extras[t] ?? ''} disabled={!canEdit} onChange={(e) => setExtras((x) => ({ ...x, [t]: e.target.value }))} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 6 }}>
            Une balise du contact ou de l&apos;agence se remplit mieux à la source (fiche contact, profil de l&apos;agence) ; une balise propre à ce document se saisit ici.
          </p>
        </div>
      )}

      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-pri" type="button" disabled={pending || parsed.length === 0} onClick={save}>
            <IcoCheck size={12} />{pending ? 'Enregistrement…' : 'Enregistrer le brouillon'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Les dialogues des gestes ── */

function SendDialog({ doc, onClose, onDone }: { doc: DocumentDetail; onClose: () => void; onDone: (s: ActionState) => void }) {
  const [channel, setChannel] = useState<SendChannel>('fil');
  const [result, setResult] = useState<{ link: string; mailto: string | null; message: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const send = () =>
    startTransition(async () => {
      const r = await sendDocument(doc.id, channel);
      if (r.ok) {
        setResult({ link: r.link, mailto: r.mailto, message: r.message });
        onDone({ ok: true, message: r.message, at: Date.now() });
      } else setError(r.message);
    });
  const copy = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result.link).then(() => setCopied(true)).catch(() => {});
  };
  return (
    <Dialog title={`Envoyer ${doc.ref}`} onClose={onClose}>
      {error && <Notice tone="err">{error}</Notice>}
      {!result ? (
        <>
          <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', marginBottom: 12, lineHeight: 1.5 }}>
            Le document est rendu et figé tel quel, numéroté version {doc.versions.length + 1}. Le client le lit par un lien qui lui est propre
            {doc.kind !== 'facture' ? ' et peut y répondre' : ''}.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(
              [
                ['fil', 'Déposer dans le fil du portail', `Le lien est publié dans les échanges de ${doc.client.name} ; le contact le voit à sa prochaine visite.`],
                ['courriel', 'Par courriel', doc.contact?.email ? `Ouvre votre messagerie avec le lien, à ${doc.contact.email}.` : 'Le contact n’a pas de courriel : vous copierez le lien.'],
              ] as [SendChannel, string, string][]
            ).map(([id, label, hint]) => (
              <label key={id} className="vis-row" style={{ borderColor: channel === id ? 'var(--green)' : 'var(--bd-solid)', cursor: 'pointer' }}>
                <input type="radio" name="channel" checked={channel === id} onChange={() => setChannel(id)} />
                <span>
                  <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700 }}>{label}</span>
                  <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 2 }}>{hint}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="st-dlg-actions">
            <button className="btn-out" type="button" onClick={onClose}>Annuler</button>
            <button className="btn-pri" type="button" disabled={pending} onClick={send}><IcoSend size={12} />{pending ? 'Envoi…' : 'Envoyer'}</button>
          </div>
        </>
      ) : (
        <>
          <Notice tone="ok">{result.message}</Notice>
          <div className="lbl" style={{ marginBottom: 4 }}>Lien du client</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input className="fld" readOnly value={result.link} onFocus={(e) => e.target.select()} />
            <button className="btn-out" type="button" onClick={copy}><IcoLink size={11} />{copied ? 'Copié' : 'Copier'}</button>
          </div>
          <div className="st-dlg-actions">
            {result.mailto && <a className="btn-pri" href={result.mailto} style={{ textDecoration: 'none' }}><IcoSend size={12} />Ouvrir mon courriel</a>}
            <button className="btn-out" type="button" onClick={onClose}>Fermer</button>
          </div>
        </>
      )}
    </Dialog>
  );
}

function DecisionDialog({ doc, decision, onClose, onDone }: { doc: DocumentDetail; decision: Decision; onClose: () => void; onDone: (s: ActionState) => void }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const meta: Record<Decision, { title: string; text: string; noteLabel: string | null; button: string }> = {
    relance: { title: `Relancer ${doc.ref}`, text: 'La relance est consignée au journal et déposée dans le fil du portail, avec le lien du document.', noteLabel: 'Message (facultatif)', button: 'Relancer' },
    accepte: { title: 'Marquer accepté', text: 'Le client a dit oui hors du portail : on le consigne, avec la date du jour.', noteLabel: 'Note (facultatif)', button: 'Marquer accepté' },
    refuse: { title: 'Marquer refusé', text: 'Le motif reste sur le document ; il aide à comprendre ce qui n’a pas convaincu.', noteLabel: 'Motif', button: 'Marquer refusé' },
    payee: { title: 'Marquer payée', text: 'La facture est payée à la date du jour.', noteLabel: 'Note (facultatif)', button: 'Marquer payée' },
    annule: { title: 'Annuler la facture', text: 'Une facture émise ne se supprime pas : elle s’annule et le dit. Émettez-en une autre si besoin.', noteLabel: 'Motif (facultatif)', button: 'Annuler la facture' },
  };
  const m = meta[decision];
  const go = () =>
    startTransition(async () => {
      const r = await decideDocument(doc.id, decision, note);
      if (r.ok) {
        onDone({ ...r, at: Date.now() });
        onClose();
      } else setError(r.message);
    });
  return (
    <Dialog title={m.title} onClose={onClose}>
      {error && <Notice tone="err">{error}</Notice>}
      <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', marginBottom: 12, lineHeight: 1.5 }}>{m.text}</p>
      {m.noteLabel && (
        <>
          <label className="lbl" htmlFor="dd-note" style={{ display: 'block', marginBottom: 4 }}>{m.noteLabel}</label>
          <textarea id="dd-note" className="docg-ta" style={{ minHeight: 70 }} value={note} onChange={(e) => setNote(e.target.value)} />
        </>
      )}
      <div className="st-dlg-actions">
        <button className="btn-out" type="button" onClick={onClose}>Retour</button>
        <button className="btn-pri" type="button" disabled={pending || (decision === 'refuse' && !note.trim())} onClick={go}>{pending ? 'Un instant…' : m.button}</button>
      </div>
    </Dialog>
  );
}

/* ── La page ── */

export function DocumentView({ doc, rendered, permissions, signedIn }: { doc: DocumentDetail; rendered: Rendered | null; permissions: Permission[]; signedIn: boolean }) {
  const router = useRouter();
  const [notice, setNotice] = useState<ActionState>(null);
  const [mode, setMode] = useState<'apercu' | 'composer'>('apercu');
  const [viewVersion, setViewVersion] = useState<number | null>(null);
  const [dialog, setDialog] = useState<null | 'send' | 'corriger' | Decision>(null);
  const [pending, startTransition] = useTransition();
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  const has = (p: Permission) => permissions.includes(p);
  const isInvoice = doc.kind === 'facture';
  const sendRight: Permission = isInvoice ? 'manage_billing' : 'send_documents';
  const canSend = has(sendRight);
  const canEdit = isInvoice ? has('manage_billing') : has('manage_clients') || has('send_documents');
  const isDraft = doc.status === 'brouillon';
  const unfilled = rendered?.unfilled ?? [];
  const version = viewVersion != null ? doc.versions.find((v) => v.version === viewVersion) : null;
  const frozen = !isDraft && doc.renderedHtml ? doc.renderedHtml : null;
  const shownHtml = version?.renderedHtml ?? frozen ?? rendered?.page ?? null;
  const kindLabel = GEN_KIND_LABEL[doc.kind];
  const status = STATUS_META[doc.status];

  const sendBlockers: string[] = [];
  if (!canSend) sendBlockers.push(`Le droit « ${PERMISSION_LABEL[sendRight].label} » est requis pour envoyer.`);
  if (doc.taxNumbersMissing) sendBlockers.push('Les numéros de TPS et de TVQ de l’agence manquent.');
  if (!doc.template?.bodyHtml) sendBlockers.push('Le modèle n’a pas de corps.');
  if (!isInvoice && !doc.contact) sendBlockers.push('Aucun contact destinataire.');
  if (unfilled.length) sendBlockers.push(`${unfilled.length} balise${unfilled.length > 1 ? 's' : ''} sans valeur : ${unfilled.map((t) => `{{${t}}}`).join(', ')}.`);
  if (doc.lines.length === 0) sendBlockers.push('Aucune ligne.');

  const correct = () =>
    startTransition(async () => {
      const r = await newVersion(doc.id);
      setNotice({ ...r, at: Date.now() });
      setDialog(null);
      if (r.ok) {
        setViewVersion(null);
        router.refresh();
      }
    });

  const printIt = (print: boolean) => {
    if (!shownHtml) return;
    if (!openDocumentWindow(shownHtml, print)) setNotice({ ok: false, message: 'Le navigateur a bloqué l’ouverture : autorisez les fenêtres surgissantes pour ce site.', at: Date.now() });
  };

  return (
    <AppShell
      header={
        <CRMHeader
          title={doc.ref}
          period=""
          subtitle={`${kindLabel} · ${doc.client.name}`}
          crumbs={[{ label: 'Agence hub', href: routes.agence() }, { label: 'Documents', href: routes.documents() }, { label: doc.ref }]}
        />
      }
    >
      <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.125rem 2rem' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Notice state={notice} />
          {!signedIn && <Notice tone="warn">Connectez-vous avec un compte de l&apos;agence pour agir sur ce document.</Notice>}
          <div className="docg-wrap">
            <div style={{ minWidth: 0 }}>
              {isDraft && (
                <div className="docg-modes" role="tablist" aria-label="Aperçu ou composition">
                  {(['apercu', 'composer'] as const).map((m) => (
                    <button key={m} type="button" role="tab" aria-selected={mode === m} className={`tab${mode === m ? ' on' : ''}`} style={{ padding: '0.3rem 0.8rem' }} onClick={() => setMode(m)}>
                      {m === 'apercu' ? 'Aperçu' : 'Composer'}
                    </button>
                  ))}
                </div>
              )}
              {version && (
                <div className="dl-banner" style={{ marginBottom: 10 }}>
                  <span><IcoWarn size={13} /></span>
                  <span>
                    Version {version.version}, envoyée le {version.at} — telle que le client l&apos;a reçue.{' '}
                    <button type="button" className="cs-link" onClick={() => setViewVersion(null)}>Revenir au document actuel</button>
                  </span>
                </div>
              )}
              {isDraft && mode === 'composer' && !version ? (
                <ComposeForm key={doc.events.length} doc={doc} unfilled={unfilled} canEdit={canEdit && signedIn} onSaved={setNotice} />
              ) : shownHtml ? (
                <div className="client-doc" style={{ padding: 0, overflow: 'hidden' }}>
                  <DocFrame html={shownHtml} title={`Document ${doc.ref}`} className="docg-frame" />
                </div>
              ) : (
                <div className="client-doc" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#71717A', fontSize: '0.8125rem' }}>
                  Rien à rendre : le modèle « {doc.template?.name ?? '—'} » n&apos;a pas de corps.{' '}
                  {doc.template && <Link href={routes.modele(doc.template.id)}>Complétez-le</Link>}
                </div>
              )}
              {shownHtml && (mode === 'apercu' || !isDraft) && (
                <div className="docg-doc-actions">
                  <button className="btn-out" type="button" onClick={() => printIt(true)}>Imprimer</button>
                  <button className="btn-out" type="button" onClick={() => printIt(false)}>Télécharger en PDF</button>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)', alignSelf: 'center' }}>Le PDF se produit par l&apos;impression du navigateur (« Enregistrer en PDF »).</span>
                </div>
              )}
            </div>

            <div>
              <Block title="Statut">
                <div style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge label={status.label} tone={status.tone} large />
                  {doc.versions.length > 0 && isDraft && <Badge label={`Version ${doc.versions.length + 1} en préparation`} tone="neutral" />}
                </div>
                <div className="cs-row"><span>Référence</span><span>{doc.ref}</span></div>
                <div className="cs-row"><span>Sorte</span><span>{kindLabel}</span></div>
                <div className="cs-row"><span>Client</span><span><Link href={routes.client(doc.client.slug)}>{doc.client.name}</Link></span></div>
                <div className="cs-row"><span>Contact</span><span>{doc.contact ? `${doc.contact.name}${doc.contact.role ? ` · ${doc.contact.role}` : ''}` : '—'}</span></div>
                <div className="cs-row"><span>Montant TTC</span><span>{money(doc.totals.ttc, { exact: true })}</span></div>
                {doc.totals.recurrent > 0 && <div className="cs-row"><span>Dont récurrent HT</span><span>{money(doc.totals.recurrent, { exact: true })}</span></div>}
                <div className="cs-row"><span>Émis</span><span>{doc.issuedOn ? day(doc.issuedOn) : 'Non émis'}</span></div>
                {!isInvoice && <div className="cs-row"><span>Expire</span><span>{day(doc.expiresOn)}</span></div>}
                {isInvoice && <div className="cs-row"><span>Échéance</span><span>{day(doc.dueOn)}</span></div>}
                {doc.acceptedOn && <div className="cs-row"><span>Accepté le</span><span>{day(doc.acceptedOn)}</span></div>}
                {doc.refusedOn && <div className="cs-row"><span>Refusé le</span><span>{day(doc.refusedOn)}</span></div>}
                {doc.paidOn && <div className="cs-row"><span>Payée le</span><span>{day(doc.paidOn)}</span></div>}
                {doc.signature && <div className="cs-row"><span>Signature</span><span>{doc.signature.typedName} · {doc.signature.at}{doc.signature.ip ? ` · ${doc.signature.ip}` : ''}</span></div>}
                <div style={{ fontSize: '0.625rem', color: 'var(--fg4)', marginTop: 6 }}>
                  {doc.ratesFrozen ? `Taux figés à l’envoi : TPS ${(doc.rates.tps * 100).toLocaleString('fr-CA')} % · TVQ ${(doc.rates.tvq * 100).toLocaleString('fr-CA')} %.` : 'Les taux de taxes suivent le profil de l’agence jusqu’à l’envoi.'}
                </div>
              </Block>

              <Block title="Action">
                {!canEdit && !canSend && signedIn && (
                  <div className="dl-note" style={{ marginBottom: 10 }}>
                    Lecture seule — le droit « {PERMISSION_LABEL[sendRight].label} » {isInvoice ? '' : 'ou « Gérer les comptes » '}n&apos;est pas accordé à votre compte.
                  </div>
                )}
                {isDraft && (
                  <div className="cs-actions">
                    {doc.taxNumbersMissing && (
                      <div className="dl-banner yellow">
                        <span><IcoWarn size={13} /></span>
                        <span>Numéros de TPS et de TVQ manquants : <Link href={routes.agence('profil')}>complétez le profil de l&apos;agence</Link> avant d&apos;envoyer. C&apos;est une règle fiscale, pas une préférence.</span>
                      </div>
                    )}
                    {sendBlockers.length > 0 && !doc.taxNumbersMissing && (
                      <div className="dl-note" style={{ fontSize: '0.75rem' }}>
                        {sendBlockers.map((b) => <div key={b}>{b}</div>)}
                        {unfilled.length > 0 && canEdit && <button type="button" className="cs-link" style={{ marginTop: 4 }} onClick={() => setMode('composer')}>Compléter dans « Composer »</button>}
                      </div>
                    )}
                    {sendBlockers.length > 0 && doc.taxNumbersMissing && sendBlockers.length > 1 && (
                      <div className="dl-note" style={{ fontSize: '0.75rem' }}>{sendBlockers.filter((b) => !b.startsWith('Les numéros')).map((b) => <div key={b}>{b}</div>)}</div>
                    )}
                    <button className="btn-pri" type="button" disabled={sendBlockers.length > 0 || !signedIn} onClick={() => setDialog('send')} title={sendBlockers[0]}>
                      {sendBlockers.length ? <IcoLock size={12} /> : <IcoSend size={12} />}
                      Envoyer
                    </button>
                  </div>
                )}
                {(doc.status === 'envoye' || doc.status === 'expire') && (
                  <div className="cs-actions">
                    <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginBottom: 4 }}>
                      {doc.status === 'expire' ? 'Expiré sans réponse. Relancez, ou corrigez la date dans une nouvelle version.' : `En attente de réponse${doc.expiresOn && !isInvoice ? ` jusqu’au ${day(doc.expiresOn)}` : ''}.`}
                    </div>
                    <button className="btn-out" type="button" disabled={!canEdit} onClick={() => setDialog('relance')}>Relancer</button>
                    {!isInvoice && <button className="btn-out" type="button" disabled={!canEdit} onClick={() => setDialog('accepte')}>Marquer accepté</button>}
                    {!isInvoice && <button className="btn-out" type="button" disabled={!canEdit} onClick={() => setDialog('refuse')}>Marquer refusé</button>}
                    {isInvoice && <button className="btn-out" type="button" disabled={!canSend} onClick={() => setDialog('payee')}>Marquer payée</button>}
                    {isInvoice && <button className="btn-out" type="button" disabled={!canSend} onClick={() => setDialog('annule')}>Annuler la facture</button>}
                    {!isInvoice && <button className="btn-out" type="button" disabled={!canEdit || pending} onClick={() => setDialog('corriger')}>Corriger — nouvelle version</button>}
                  </div>
                )}
                {doc.status === 'retard' && (
                  <div className="cs-actions">
                    <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginBottom: 4 }}>Échéance dépassée le {day(doc.dueOn)}.</div>
                    <button className="btn-out" type="button" disabled={!canEdit} onClick={() => setDialog('relance')}>Relancer</button>
                    <button className="btn-out" type="button" disabled={!canSend} onClick={() => setDialog('payee')}>Marquer payée</button>
                    <button className="btn-out" type="button" disabled={!canSend} onClick={() => setDialog('annule')}>Annuler la facture</button>
                  </div>
                )}
                {doc.status === 'accepte' && (
                  <div className="cs-actions">
                    <div style={{ fontSize: '0.75rem', color: 'var(--green-fg)', marginBottom: 4 }}>Accepté le {day(doc.acceptedOn)}{doc.signature ? ` par ${doc.signature.typedName}` : ''}.</div>
                    <button className="btn-pri" type="button" disabled title="Le contrat depuis la proposition acceptée arrive à l’étape suivante.">
                      <IcoLock size={12} />Créer la suite
                    </button>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>Le contrat, la facture d&apos;acompte et le mandat se créent depuis ce document à l&apos;étape suivante.</div>
                  </div>
                )}
                {doc.status === 'refuse' && (
                  <div className="cs-actions">
                    <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginBottom: 4 }}>Refusé le {day(doc.refusedOn)}{doc.refusalNote ? ` — ${doc.refusalNote}` : ''}.</div>
                    <button className="btn-out" type="button" disabled={!canEdit || pending} onClick={() => setDialog('corriger')}>Corriger — nouvelle version</button>
                  </div>
                )}
                {doc.status === 'payee' && <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)' }}>Payée le {day(doc.paidOn)} — rien à faire.</div>}
                {doc.status === 'annule' && <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)' }}>Annulée.</div>}
              </Block>

              {doc.accessToken && !isDraft && (
                <Block title="Lien du client">
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input className="fld" readOnly value={`${origin}${routes.documentLien(doc.accessToken)}`} onFocus={(e) => e.target.select()} style={{ fontSize: '0.6875rem' }} />
                    <a className="btn-out" href={routes.documentLien(doc.accessToken)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}><IcoLink size={11} />Ouvrir</a>
                  </div>
                </Block>
              )}

              {(doc.chain.from || doc.chain.produced.length > 0) && (
                <Block title="Chaîne">
                  <div className="cs-chain">
                    {doc.chain.from && <div><div className="cs-chain-lbl">Depuis</div><Link href={routes.document(doc.chain.from.id)}>{doc.chain.from.kind} {doc.chain.from.ref}</Link></div>}
                    {doc.chain.produced.map((p) => <div key={p.id}><div className="cs-chain-lbl">A produit</div><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.kind} {p.ref}</span></div>)}
                  </div>
                </Block>
              )}

              <Block title={`Versions${doc.versions.length ? ` · ${doc.versions.length}` : ''}`}>
                {doc.versions.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>Pas encore envoyé — aucune version n&apos;existe.</div>
                ) : (
                  [...doc.versions].reverse().map((v, i) => {
                    const current = i === 0 && !isDraft;
                    return (
                      <div key={v.version} className="cs-version-row">
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>{current ? `v${v.version}` : <s style={{ color: 'var(--fg4)' }}>v{v.version}</s>}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)' }}>{v.note ?? 'Version envoyée.'}{!current && ' Remplacée.'}</div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>{v.at} · {v.who}</div>
                        </div>
                        {v.renderedHtml && (viewVersion === v.version ? <span style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>Affichée</span> : <button type="button" className="cs-link" onClick={() => setViewVersion(v.version)}>Voir</button>)}
                      </div>
                    );
                  })
                )}
              </Block>

              <Block title="Journal">
                {doc.events.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--fg4)' }}>Rien encore.</div>
                ) : (
                  <div className="cs-journal">
                    {doc.events.map((e, i) => (
                      <div key={i} className="cs-journal-row">
                        <span className={`cs-journal-dot${e.kind === 'refuse' || e.kind === 'annule' ? ' red' : e.kind === 'modifie' || e.kind === 'cree' ? ' muted' : ''}`} />
                        <div>
                          <div className="cs-journal-t">{EVENT_LABEL[e.kind]}{e.version ? ` (v${e.version})` : ''}{e.note ? ` — ${e.note}` : ''}</div>
                          <div className="cs-journal-m">{e.at} · {e.who}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Block>
            </div>
          </div>
        </div>
      </div>

      {dialog === 'send' && (
        <SendDialog
          doc={doc}
          onClose={() => {
            setDialog(null);
            router.refresh();
          }}
          onDone={setNotice}
        />
      )}
      {dialog === 'corriger' && (
        <Dialog title="Corriger — nouvelle version" onClose={() => setDialog(null)}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
            Le document redevient un brouillon : lignes, sections et compléments se modifient, puis un nouvel envoi produit la version {doc.versions.length + 1}. La version {doc.versions.length} reste consultable ici, marquée remplacée.
          </p>
          <div className="st-dlg-actions">
            <button className="btn-out" type="button" onClick={() => setDialog(null)}>Retour</button>
            <button className="btn-pri" type="button" disabled={pending} onClick={correct}>{pending ? 'Un instant…' : 'Rouvrir en brouillon'}</button>
          </div>
        </Dialog>
      )}
      {dialog && dialog !== 'send' && dialog !== 'corriger' && (
        <DecisionDialog
          doc={doc}
          decision={dialog}
          onClose={() => setDialog(null)}
          onDone={(s) => {
            setNotice(s);
            router.refresh();
          }}
        />
      )}
    </AppShell>
  );
}
