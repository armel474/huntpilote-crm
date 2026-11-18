'use client';

/**
 * Documents — session 9.4 : tout ce que l'agence a produit, toutes sortes
 * confondues. En tête, les manques (devis qui expirent, factures en retard,
 * propositions sans réponse) — cliquables, ils filtrent la liste. Pas
 * d'action principale : un document se crée depuis une fiche client ou une
 * opportunité, là où sont les données ; l'état vide le dit.
 */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SectionHead } from '@/app/agence/bits';
import { Badge } from '@/components/ui/Atoms';
import { IcoDoc, IcoWarn } from '@/components/ui/Icons';
import { money } from '@/lib/format';
import { GEN_KIND_LABEL, STATUS_META, type DocStatus, type DocumentsList, type GenKind } from '@/lib/queries/documents';
import { routes } from '@/lib/routes';

const KINDS = Object.keys(GEN_KIND_LABEL) as GenKind[];
const STATUSES = Object.keys(STATUS_META) as DocStatus[];

export function DocumentsPanel({ data, signedIn }: { data: DocumentsList; signedIn: boolean }) {
  const [kind, setKind] = useState<'' | GenKind>('');
  const [status, setStatus] = useState<'' | DocStatus>('');
  const [q, setQ] = useState('');
  const [summary, setSummary] = useState<number | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const ids = summary != null ? new Set(data.summaries[summary]?.ids ?? []) : null;
    return data.rows.filter(
      (r) =>
        (!kind || r.kind === kind) &&
        (!status || r.status === status) &&
        (!ids || ids.has(r.id)) &&
        (!needle || r.clientName.toLowerCase().includes(needle) || r.subject.toLowerCase().includes(needle) || r.ref.toLowerCase().includes(needle)),
    );
  }, [data, kind, status, q, summary]);

  if (data.rows.length === 0) {
    return (
      <div>
        <SectionHead title="Documents" sub="Tout ce qui a été produit, toutes sortes confondues : référence, client, montant, statut." />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: 11, background: 'var(--bg-muted)', color: 'var(--fg3)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <IcoDoc size={17} />
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>Aucun document</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 6, lineHeight: 1.5 }}>
            {signedIn ? (
              <>
                Créez-en un depuis une <Link href={routes.clients()}>fiche client</Link> ou une <Link href={routes.pipeline()}>opportunité du pipeline</Link> — il n&apos;y a pas de création directe ici.
              </>
            ) : (
              'Connectez-vous avec un compte rattaché à l’agence pour voir ses documents.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="Documents" sub="Tout ce qui a été produit, toutes sortes confondues. Un document se crée depuis une fiche client ou une opportunité." />
      {data.summaries.length > 0 && (
        <div className="gen-summary-row">
          {data.summaries.map((s, i) => (
            <button key={i} type="button" className={`gen-chip ${s.tone}${summary === i ? ' on' : ''}`} onClick={() => setSummary(summary === i ? null : i)} aria-pressed={summary === i}>
              <IcoWarn size={13} />
              {s.text}
            </button>
          ))}
        </div>
      )}
      <div className="gen-filters">
        <select className="sel" value={kind} onChange={(e) => setKind(e.target.value as '' | GenKind)} aria-label="Sorte">
          <option value="">Toutes les sortes</option>
          {KINDS.map((k) => <option key={k} value={k}>{GEN_KIND_LABEL[k]}</option>)}
        </select>
        <select className="sel" value={status} onChange={(e) => setStatus(e.target.value as '' | DocStatus)} aria-label="Statut">
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <input className="fld" style={{ flex: 1, minWidth: 180 }} placeholder="Client, objet ou référence" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
      </div>
      <div className="card docl">
        <div className="docl-head">
          {['Référence', 'Sorte', 'Client', 'Objet', 'Montant', 'Statut', 'Date', 'Personne'].map((h) => <div key={h} className="lbl">{h}</div>)}
        </div>
        {rows.map((r) => (
          <Link key={r.id} href={routes.document(r.id)} className="docl-row">
            <span style={{ fontWeight: 700 }}>{r.ref}</span>
            <span style={{ color: 'var(--fg3)' }}>{GEN_KIND_LABEL[r.kind]}</span>
            <span className="ell" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{r.clientName}</span>
            <span className="ell" style={{ color: 'var(--fg3)' }}>{r.subject}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(r.totalCents, { exact: true })}</span>
            <span><Badge label={STATUS_META[r.status].label} tone={STATUS_META[r.status].tone} /></span>
            <span style={{ color: 'var(--fg3)' }}>{r.dateLabel}</span>
            <span className="ell" style={{ color: 'var(--fg3)' }}>{r.person}</span>
          </Link>
        ))}
        {rows.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--fg4)', fontSize: '0.8125rem' }}>Aucun document ne correspond à ces filtres.</div>}
      </div>
    </div>
  );
}
