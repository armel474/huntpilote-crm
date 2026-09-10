'use client';

/**
 * SEO local — concurrence locale (session 3.3).
 *
 * Concurrents rencontrés dans le pack local classés par fréquence
 * d'apparition, leviers concrets, recoupement par requête et par secteur,
 * écarts actionnables avec création de priorité.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { BlockingCard } from '@/components/local/Panels';
import { CompetitorRow } from '@/components/local/ConcurrencePanels';
import { Lbl } from '@/components/ui/Atoms';
import { IcoArrowL } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { ESTABS, findEstab, isBlocked } from '@/lib/data/local';
import { CONCURRENCE_BY_ETAB } from '@/lib/data/local-concurrence';

export function ConcurrenceView({ etabId }: { etabId: string }) {
  const router = useRouter();
  const est = findEstab(etabId);
  const data = CONCURRENCE_BY_ETAB[est.id];
  const [created, setCreated] = useState<Record<string, string>>({});

  useEffect(() => setCreated({}), [est.id]);

  const blocked = isBlocked(est);
  const competitors = useMemo(() => (data ? [...data.competitors].sort((a, b) => b.freq / b.freqTotal - a.freq / a.freqTotal) : []), [data]);
  const create = (key: string) => setCreated((m) => ({ ...m, [key]: `P-05${String(Object.keys(m).length + 1).padStart(2, '0')}` }));
  const prioHref = (id: string) => routes.priorite(est.clientId, id.toLowerCase());

  const header = (
    <CRMHeader
      title={`Concurrence locale — ${est.name}`}
      period=""
      crumbs={[
        { label: 'HuntPilote', href: '/dashboard' },
        { label: 'SEO local', href: routes.local() },
        { label: est.name, href: routes.etablissement(est.id) },
        { label: 'Concurrence' },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Link href={routes.etablissement(est.id)} className="btn-out" style={{ textDecoration: 'none' }}>
          <IcoArrowL />
          Fiche de l’établissement
        </Link>
        <div className="ctx-g">
          <Lbl>
            <label htmlFor="cnc-etab-sel">Établissement</label>
          </Lbl>
          <select
            id="cnc-etab-sel"
            className="acct-sel"
            value={est.id}
            onChange={(e) => router.push(routes.etablissementConcurrence(e.target.value))}
          >
            {ESTABS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        {!blocked && data && (
          <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>
            {competitors.length} concurrent{competitors.length > 1 ? 's' : ''} rencontré{competitors.length > 1 ? 's' : ''} dans le pack local
          </span>
        )}
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.125rem 1.5rem' }}>
          {blocked ? (
            <BlockingCard est={est} />
          ) : !data || competitors.length === 0 ? (
            <div className="empty">Pas assez de relevés du pack local pour identifier des concurrents récurrents.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {competitors.map((c, i) => (
                <CompetitorRow key={c.name} c={c} rank={i + 1} created={created} onCreatePrio={create} prioHref={prioHref} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
