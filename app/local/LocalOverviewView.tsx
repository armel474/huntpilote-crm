'use client';

/**
 * SEO local — vue d'ensemble (session 3.1).
 *
 * Portefeuille d'établissements : ce qui demande une action en tête, la
 * liste filtrable et triable, et le rappel des clients suivis sans
 * établissement local rattaché.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ActionQueueCard, EstabRow, PortfolioKpis } from '@/components/local/Panels';
import { Lbl, Sec } from '@/components/ui/Atoms';
import { EmptyFilter, SkelKpiRow, SkelList } from '@/components/ui/States';
import { IcoPlus, IcoSrch } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { CLIENTS_SANS_ETAB, ESTABS } from '@/lib/data/local';

const SORTS = [
  ['urgence', 'Urgence d’abord'],
  ['score_asc', 'Score le plus bas'],
  ['score_desc', 'Score le plus élevé'],
  ['note_asc', 'Note la plus basse'],
] as const;

/* ── Démo · état ── */

type LocalScenarioId = 'normal' | 'chargement';

const LOCAL_SCENARIOS: [LocalScenarioId, string][] = [
  ['normal', 'Normal'],
  ['chargement', 'Chargement'],
];

export function LocalOverviewView() {
  const [scenario, setScenario] = useState<LocalScenarioId>('normal');
  const [client, setClient] = useState('tous');
  const [sortBy, setSortBy] = useState<(typeof SORTS)[number][0]>('urgence');
  const [q, setQ] = useState('');
  const loading = scenario === 'chargement';

  const clients = useMemo(() => [...new Set(ESTABS.map((e) => e.client))], []);
  const term = q.trim().toLowerCase();
  const list = useMemo(() => {
    let rows = ESTABS.filter(
      (e) => (client === 'tous' || e.client === client) && (!term || e.name.toLowerCase().includes(term) || e.client.toLowerCase().includes(term)),
    );
    const scoreOf = (e: (typeof ESTABS)[number]) => (e.scoreLocal == null ? -1 : e.scoreLocal);
    if (sortBy === 'score_asc') rows = [...rows].sort((a, b) => scoreOf(a) - scoreOf(b));
    else if (sortBy === 'score_desc') rows = [...rows].sort((a, b) => scoreOf(b) - scoreOf(a));
    else if (sortBy === 'note_asc') rows = [...rows].sort((a, b) => (a.note ?? 99) - (b.note ?? 99));
    else rows = [...rows].sort((a, b) => b.alerts.length - a.alerts.length || scoreOf(a) - scoreOf(b));
    return rows;
  }, [client, sortBy, term]);

  const header = <CRMHeader title="SEO local" period="" crumbs={[{ label: 'HuntPilote', href: '/dashboard' }, { label: 'SEO local' }]} />;

  return (
    <AppShell header={header}>
      <div className="subbar">
        <div className="dom-field" style={{ borderStyle: 'solid' }}>
          <span style={{ color: 'var(--fg3)', display: 'flex' }}>
            <IcoSrch />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrer un établissement…"
            aria-label="Filtrer les établissements"
            style={{ width: '12rem' }}
          />
        </div>
        <div className="ctx-g">
          <Lbl>
            <label htmlFor="local-client">Client</label>
          </Lbl>
          <select id="local-client" className="date-sel" value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="tous">Tous les clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="ctx-g">
          <Lbl>
            <label htmlFor="local-tri">Tri</label>
          </Lbl>
          <select id="local-tri" className="date-sel" value={sortBy} onChange={(e) => setSortBy(e.target.value as (typeof SORTS)[number][0])}>
            {SORTS.map(([id, l]) => (
              <option key={id} value={id}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="ctx-g" style={{ marginLeft: 'auto' }}>
          <Lbl>
            <label htmlFor="etat-demo-local">Démo · état</label>
          </Lbl>
          <select
            id="etat-demo-local"
            className="state-sel"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as LocalScenarioId)}
          >
            {LOCAL_SCENARIOS.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
          {list.length} établissement{list.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail-row">
          <div className="col-main">
            {loading ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <SkelKpiRow n={4} />
                </div>
                <Sec title="Ce qui demande une action">
                  <SkelList n={3} />
                </Sec>
                <Sec title="Établissements suivis" sub="Client rattaché, score local, avis, citations et position moyenne dans le pack local">
                  <SkelList n={5} />
                </Sec>
              </>
            ) : (
              <>
                <PortfolioKpis estabs={ESTABS} nSansEtab={CLIENTS_SANS_ETAB.length} />
                <ActionQueueCard estabs={ESTABS} />
                <Sec title="Établissements suivis" sub="Client rattaché, score local, avis, citations et position moyenne dans le pack local">
                  {list.length === 0 ? (
                    <EmptyFilter
                      title="Aucun établissement pour ces filtres"
                      text="Élargissez la recherche ou revenez à tous les clients pour revoir le portefeuille complet."
                      onReset={() => {
                        setQ('');
                        setClient('tous');
                        setSortBy('urgence');
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {list.map((e) => (
                        <EstabRow key={e.id} est={e} />
                      ))}
                    </div>
                  )}
                </Sec>
              </>
            )}
          </div>
          <div className="col-side">
            <Sec title="Clients sans établissement local" sub="Aucune fiche Google Business suivie pour ces comptes">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CLIENTS_SANS_ETAB.map((c) => (
                  <div key={c.id} className="loc-link-row">
                    <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg1)' }}>{c.name}</span>
                    <Link href={routes.client(c.id)} className="btn-out" style={{ textDecoration: 'none' }}>
                      <IcoPlus />
                      Ajouter
                    </Link>
                  </div>
                ))}
              </div>
            </Sec>
            <Sec title="Frontière avec l’audit" sub="Rappel utile en cas de doute">
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.6 }}>
                Les quatre critères de présence en ligne relevés par l’audit mensuel — complétude Google Business, cohérence
                nom·adresse·téléphone, citations, avis sans réponse — sont les mêmes ici, vus de plus près. C’est ici qu’on les corrige.
              </div>
            </Sec>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
