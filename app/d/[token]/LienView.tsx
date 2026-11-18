'use client';

import { useState, useTransition } from 'react';
import { decideByToken } from '@/app/documents/actions';
import { DocFrame, openDocumentWindow } from '@/components/documents/DocFrame';
import { IcoCheck, IcoWarn } from '@/components/ui/Icons';

export type LienDoc = {
  kind: string;
  ref: string;
  status: string;
  subject: string | null;
  clientName: string;
  contactName: string | null;
  agencyName: string;
  renderedHtml: string;
  expiresOn: string | null;
  dueOn: string | null;
  decidedOn: string | null;
  totalCents: number | null;
  canDecide: boolean;
};

const KIND_LABEL: Record<string, string> = { proposition: 'Proposition', devis: 'Devis', facture: 'Facture', contrat: 'Contrat', annexe: 'Annexe', avenant: 'Avenant' };
const fmtDay = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
const day = (iso: string | null) => (iso ? fmtDay.format(new Date(`${iso.slice(0, 10)}T00:00:00`)) : '');
const money = (cents: number | null) => (cents == null ? '' : new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100));

export function LienView({ token, doc }: { token: string; doc: LienDoc }) {
  const [mode, setMode] = useState<null | 'accept' | 'refuse'>(null);
  const [name, setName] = useState(doc.contactName ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | 'accepte' | 'refuse'>(null);
  const [pending, startTransition] = useTransition();

  const isInvoice = doc.kind === 'facture';
  const kindLabel = KIND_LABEL[doc.kind] ?? 'Document';
  const feminine = doc.kind === 'proposition' || doc.kind === 'facture' || doc.kind === 'annexe';
  const status = done ?? doc.status;
  const expired = !isInvoice && doc.status === 'envoye' && !!doc.expiresOn && doc.expiresOn < new Date().toISOString().slice(0, 10);

  const lead = isInvoice
    ? doc.status === 'payee'
      ? 'Cette facture est réglée. Merci !'
      : `Voici votre facture${doc.dueOn ? `, payable au plus tard le ${day(doc.dueOn)}` : ''}. Les instructions de paiement sont dans le document.`
    : status === 'accepte'
      ? `Vous avez accepté ${feminine ? 'cette' : 'ce'} ${kindLabel.toLowerCase()}. ${doc.agencyName} vous revient avec la suite.`
      : status === 'refuse'
        ? `Vous avez décliné ${feminine ? 'cette' : 'ce'} ${kindLabel.toLowerCase()}. Merci de nous l’avoir dit.`
        : expired
          ? `${feminine ? 'Cette' : 'Ce'} ${kindLabel.toLowerCase()} a expiré le ${day(doc.expiresOn)}. Écrivez-nous pour le remettre à jour.`
          : `Relisez ${feminine ? 'la' : 'le'} ${kindLabel.toLowerCase()} ci-dessous. Vous pouvez l’accepter directement depuis cette page${doc.expiresOn ? `, jusqu’au ${day(doc.expiresOn)}` : ''}.`;

  const decide = (accept: boolean) =>
    startTransition(async () => {
      const r = await decideByToken(token, accept, name, reason);
      if (r.ok) {
        setDone(accept ? 'accepte' : 'refuse');
        setMode(null);
        setError('');
      } else setError(r.message);
    });

  return (
    <div className="lien">
      <header className="lien-top">
        <div className="lien-top-in">
          <div className="lien-brand">
            {doc.agencyName}
            <small>{kindLabel} {doc.ref} · pour {doc.clientName}</small>
          </div>
          <button type="button" className="lien-btn" onClick={() => openDocumentWindow(doc.renderedHtml, true)}>Imprimer / PDF</button>
        </div>
      </header>
      <main className="lien-wrap">
        <div className="lien-eyebrow">{kindLabel} · {doc.ref}{doc.totalCents != null ? ` · ${money(doc.totalCents)} toutes taxes` : ''}</div>
        <h1>{doc.subject ?? kindLabel}</h1>
        <p className="lien-lead">{lead}</p>

        <div className="lien-doc">
          <DocFrame html={doc.renderedHtml} title={`${kindLabel} ${doc.ref}`} minHeight={600} />
        </div>

        <div className="lien-bar">
          {status === 'accepte' && (
            <div className="lien-done"><IcoCheck size={16} />Accepté{doc.decidedOn && !done ? ` le ${day(doc.decidedOn)}` : ''}{name && done ? ` par ${name}` : ''}.</div>
          )}
          {status === 'refuse' && <div className="lien-muted">Refusé{doc.decidedOn && !done ? ` le ${day(doc.decidedOn)}` : ''}. Rien d&apos;autre à faire de votre côté.</div>}
          {isInvoice && <div className="lien-muted">{doc.status === 'payee' ? 'Payée — rien à faire.' : 'Rien à signer : cette facture se règle selon les instructions du document.'}</div>}
          {!isInvoice && status !== 'accepte' && status !== 'refuse' && (expired || !doc.canDecide) && (
            <div className="lien-muted">{expired ? 'Ce document a expiré : il ne peut plus être accepté ici.' : 'Ce document ne demande aucun geste de votre part pour le moment.'}</div>
          )}
          {!isInvoice && status !== 'accepte' && status !== 'refuse' && doc.canDecide && !expired && (
            <>
              {error && <div className="lien-err"><span style={{ display: 'flex', marginTop: 3 }}><IcoWarn size={14} /></span><span>{error}</span></div>}
              {mode === null && (
                <>
                  <div className="lien-bar-t">Votre réponse</div>
                  <div className="lien-actions">
                    <button type="button" className="lien-btn solid" onClick={() => setMode('accept')}>Accepter {feminine ? 'cette' : 'ce'} {kindLabel.toLowerCase()}</button>
                    <button type="button" className="lien-btn" onClick={() => setMode('refuse')}>Décliner</button>
                  </div>
                </>
              )}
              {mode === 'accept' && (
                <>
                  <div className="lien-field">
                    <label htmlFor="lien-name">Tapez votre nom complet pour accepter</label>
                    <input id="lien-name" className="lien-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={doc.contactName ?? 'Prénom Nom'} autoFocus />
                  </div>
                  <p className="lien-hint">
                    Signature simple : votre nom tapé, la date et l&apos;adresse IP de cet appareil sont consignés avec le document. Ce n&apos;est pas une signature électronique certifiée.
                  </p>
                  <div className="lien-actions">
                    <button type="button" className="lien-btn" onClick={() => setMode(null)} disabled={pending}>Annuler</button>
                    <button type="button" className="lien-btn solid" disabled={pending || name.trim().length < 2} onClick={() => decide(true)}>{pending ? 'Un instant…' : 'Confirmer l’acceptation'}</button>
                  </div>
                </>
              )}
              {mode === 'refuse' && (
                <>
                  <div className="lien-field">
                    <label htmlFor="lien-reason">Dites-nous en un mot pourquoi (facultatif)</label>
                    <textarea id="lien-reason" className="lien-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. Le budget est reporté au prochain exercice." />
                  </div>
                  <div className="lien-actions">
                    <button type="button" className="lien-btn" onClick={() => setMode(null)} disabled={pending}>Annuler</button>
                    <button type="button" className="lien-btn" disabled={pending} onClick={() => decide(false)}>{pending ? 'Un instant…' : 'Confirmer le refus'}</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <p className="lien-foot">Une question ? Répondez au courriel qui vous a remis ce lien, ou écrivez à {doc.agencyName}.</p>
      </main>
    </div>
  );
}
