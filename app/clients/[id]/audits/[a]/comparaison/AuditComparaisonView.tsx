'use client';

/**
 * Comparaison de deux audits — écran 1.4, second volet.
 *
 * Un score qui monte peut masquer des critères qui se sont dégradés : les
 * régressions passent donc avant tout le reste, et le résumé le dit
 * explicitement plutôt que de laisser le chiffre parler seul.
 */
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { CmpEmpty, CmpGroup, CmpSummary } from '@/components/audit/Compare';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { IcoArrowL, IcoArrowR } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { AUDIT, CMP, type ChangeKind } from '@/lib/data/audit';

export function AuditComparaisonView({ clientId }: { clientId: string }) {
  const [a, setA] = useState(CMP.a.id);
  const [b, setB] = useState(CMP.b.id);
  const [first, setFirst] = useState(false);
  const [created, setCreated] = useState<Record<string, string>>({});

  const onCreate = (criterion: string) =>
    setCreated((m) => ({
      ...m,
      [criterion]: `P-05${String(Object.keys(m).length + 1).padStart(2, '0')}`,
    }));

  const rows = (kind: ChangeKind) => CMP.rows.filter((r) => r.kind === kind);
  const nCreated = Object.keys(created).length;
  const auditHref = routes.audit(clientId, AUDIT.slug);
  const prioHref = (prio: string) => routes.priorite(clientId, prio.toLowerCase());

  const header = (
    <CRMHeader
      title="Comparer deux audits"
      period=""
      crumbs={[
        { label: 'Client hub', href: routes.clients() },
        { label: AUDIT.client, href: routes.client(clientId) },
        { label: 'Audits', href: routes.client(clientId) },
        { label: 'Comparaison' },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Link
          href={auditHref}
          className="btn-out"
          style={{ textDecoration: 'none', padding: '0.3rem 0.75rem' }}
        >
          <IcoArrowL />
          Audit du 1 octobre
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Lbl>Comparer</Lbl>
          <select
            className="date-sel"
            aria-label="Audit de référence"
            value={a}
            onChange={(e) => setA(e.target.value)}
            disabled={first}
          >
            {AUDIT.history.slice(1).map((h) => (
              <option key={h.id} value={h.id}>
                {h.date} · {h.score}/100
              </option>
            ))}
          </select>
          <span aria-hidden="true" style={{ color: 'var(--fg3)', display: 'flex' }}>
            <IcoArrowR />
          </span>
          <select
            className="date-sel"
            aria-label="Audit comparé"
            value={b}
            onChange={(e) => setB(e.target.value)}
            disabled={first}
          >
            {AUDIT.history.map((h) => (
              <option key={h.id} value={h.id}>
                {h.date} · {h.score}/100
              </option>
            ))}
          </select>
        </div>
        {nCreated > 0 && (
          <Pill
            label={`${nCreated} priorité${nCreated > 1 ? 's' : ''} créée${nCreated > 1 ? 's' : ''}`}
            tone="blue"
            sm
          />
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="cmp-etat">Démo · état</label>
          </Lbl>
          <select
            id="cmp-etat"
            className="state-sel"
            value={first ? 'premier' : 'normal'}
            onChange={(e) => {
              setFirst(e.target.value === 'premier');
              setCreated({});
            }}
          >
            <option value="normal">Deux audits comparables</option>
            <option value="premier">Premier audit · rien à comparer</option>
          </select>
        </div>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail-row" style={{ flexDirection: 'column' }}>
          {first ? (
            <CmpEmpty auditHref={auditHref} />
          ) : (
            <>
              <CmpSummary />
              {(['regress', 'new', 'improve'] as const).map((kind) => (
                <CmpGroup
                  key={kind}
                  kind={kind}
                  rows={rows(kind)}
                  created={created}
                  onCreate={onCreate}
                  prioHref={prioHref}
                />
              ))}
              <div
                className="card"
                style={{
                  padding: '0.875rem 1rem',
                  fontSize: '0.625rem',
                  color: 'var(--fg3)',
                  lineHeight: 1.6,
                }}
              >
                Le style dominant et l’axe de modernité ne figurent pas dans cette comparaison : ce
                sont des descriptions, pas des mesures — elles se lisent sur l’écran de l’audit.
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
