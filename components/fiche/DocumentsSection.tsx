'use client';

/**
 * Les documents d'un compte — session 9.4 : ce que le générateur a produit
 * pour ce client (propositions, devis, factures), et le geste « Nouveau
 * document » qui remplace « Nouveau devis » quand la base est branchée.
 * Le devis de démonstration (7.3) reste tel quel hors ligne.
 */
import Link from 'next/link';
import { Badge } from '@/components/ui/Atoms';
import { IcoPlus } from '@/components/ui/Icons';
import { money } from '@/lib/format';
import { GEN_KIND_LABEL, STATUS_META, type DocumentRow } from '@/lib/queries/documents';
import { routes } from '@/lib/routes';

export function DocumentsSection({ documents, onNew }: { documents: DocumentRow[]; onNew: () => void }) {
  return (
    <section className="card" style={{ padding: '0.875rem 1rem' }} aria-labelledby="documents-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 id="documents-title" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Documents</h2>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
            Propositions, devis et factures produits pour ce compte — depuis une offre du catalogue, un document existant ou des lignes libres.
          </div>
        </div>
        <button className="btn-pri" type="button" onClick={onNew}>
          <IcoPlus size={12} />
          Nouveau document
        </button>
      </div>
      {documents.length === 0 ? (
        <div className="empty">Aucun document pour ce compte. Le premier arrive avec « Nouveau document ».</div>
      ) : (
        <div className="docl" style={{ padding: 0, '--docl-cols': '110px 88px minmax(0, 1fr) 100px 96px 100px' } as React.CSSProperties}>
          <div className="docl-head">
            {['Référence', 'Sorte', 'Objet', 'Montant', 'Statut', 'Date'].map((h) => <div key={h} className="lbl">{h}</div>)}
          </div>
          {documents.map((r) => (
            <Link key={r.id} href={routes.document(r.id)} className="docl-row" style={{ margin: 0, padding: '8px 0' }}>
              <span style={{ fontWeight: 700 }}>{r.ref}</span>
              <span style={{ color: 'var(--fg3)' }}>{GEN_KIND_LABEL[r.kind]}</span>
              <span className="ell" style={{ color: 'var(--fg2)' }}>{r.subject}</span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(r.totalCents, { exact: true })}</span>
              <span><Badge label={STATUS_META[r.status].label} tone={STATUS_META[r.status].tone} /></span>
              <span style={{ color: 'var(--fg3)' }}>{r.dateLabel}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
