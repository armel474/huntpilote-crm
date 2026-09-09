'use client';

/**
 * Organic Research — creuser avant de proposer (session 2.5).
 *
 * Plus profond que Domain Overview : évolution datée sur 12 à 24 mois,
 * requêtes filtrables, pages qui bougent, potentiel chiffré. La sortie n'est
 * pas « enregistrer dans la fiche » mais « générer un audit de prospect » —
 * un document partageable, plus léger que le rapport client mensuel.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { KeepCard, SavesCard } from '@/components/outils/SideCards';
import { Lbl } from '@/components/ui/Atoms';
import { IcoCheck, IcoDoc } from '@/components/ui/Icons';
import { NEAR_LIMIT_QUOTA, readLastAccount, writeLastAccount, TOOL_ACCOUNTS, type AccountFilter } from '@/lib/data/outils';
import { AUDIT_PROSPECT } from '@/lib/data/audit-prospect';
import { routes } from '@/lib/routes';
import { EvolutionCard, PagesCard, PotentialCard, QueriesTable } from '@/components/outils/organic-research/Panels';
import {
  CTR_MULT,
  OR_COST,
  OR_DROP,
  OR_PERIODS,
  OR_POS,
  OR_POS_OK,
  OR_SAVES,
  OR_STATES,
  OR_TRAFFIC,
  OR_TRAFFIC_OK,
  PAGES_DOWN,
  PAGES_UP,
  POTENTIAL_ROWS,
  QUERIES,
  type OrState,
} from '@/lib/data/organic-research';

const DEFAULT_ACCOUNT = 'spa-nordik-estrie';

export function OrganicResearchView() {
  const [state, setStateRaw] = useState<OrState>('chute');
  const [acctId, setAcctId] = useState<string>(DEFAULT_ACCOUNT);
  const [filter, setFilter] = useState<AccountFilter>('prospects');
  const [domain, setDomain] = useState('spanordik-estrie.ca');
  const [q, setQ] = useState('');
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState(false);
  const selRef = useRef<HTMLSelectElement>(null);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;
  useEffect(() => {
    setDomain(acct ? acct.domain : '');
    setSaved(false);
  }, [acct]);

  const pickState = (s: OrState) => {
    setStateRaw(s);
    setSaved(false);
    setGenerated(false);
    setQ('');
    if (s === 'nosel') setAcctId('');
    else setAcctId(readLastAccount() || DEFAULT_ACCOUNT);
  };
  const pickAcct = (id: string) => {
    setAcctId(id);
    setSaved(false);
    if (id) {
      writeLastAccount(id);
      if (state === 'nosel') setStateRaw('chute');
    } else {
      setStateRaw('nosel');
    }
  };

  const chute = state === 'chute';
  const quotaBas = state === 'quota';
  const prospect = !!acct && acct.type === 'prospect';
  const alreadyPipeline = prospect && domain === acct!.domain && state === 'pipeline';
  const term = q.trim().toLowerCase();
  const rows = useMemo(() => QUERIES.filter((r) => !term || r.c.toLowerCase().includes(term)), [term]);
  const bannerKind: BannerKind | null = prospect ? 'prospect' : !acct ? 'nosel' : null;
  const canSave = !!acct && state !== 'nosel' && !quotaBas;

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Organic Research' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const action = generated ? (
    <Link
      href={routes.auditProspect(AUDIT_PROSPECT.token)}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <span className="btn-out">
        <IcoCheck />
        Audit généré · voir le document
      </span>
    </Link>
  ) : (
    <button
      type="button"
      className="btn-go"
      onClick={() => setGenerated(true)}
      disabled={!canSave}
      title={canSave ? 'Produit un document partageable, plus léger que le rapport mensuel' : 'Choisissez un compte pour générer l’audit'}
    >
      <IcoDoc size={12} />
      Générer un audit de prospect
    </button>
  );

  const header = (
    <CRMHeader title="Organic Research" period="" crumbs={crumbs}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lbl>
          <label htmlFor="or-etat">Démo · état</label>
        </Lbl>
        <select id="or-etat" className="state-sel" value={state} onChange={(e) => pickState(e.target.value as OrState)}>
          {OR_STATES.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </CRMHeader>
  );

  return (
    <AppShell header={header}>
      <ContextBar
        acct={acct}
        onAcct={pickAcct}
        filter={filter}
        onFilter={setFilter}
        domain={domain}
        onDomain={setDomain}
        period={OR_PERIODS[0]}
        onPeriod={() => {}}
        periods={OR_PERIODS}
        periodLabel="Période d’analyse"
        cost={OR_COST}
        saved={saved}
        onSave={() => setSaved(true)}
        canSave={canSave}
        action={action}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || alreadyPipeline || quotaBas) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && <Banner kind={bannerKind} quota={NEAR_LIMIT_QUOTA} onFocusAcct={() => selRef.current?.focus()} />}
            {alreadyPipeline && !bannerKind && (
              <div className="banner" data-tone="blue">
                <span className="banner-ico">
                  <IcoCheck />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>{acct!.name} est déjà au pipeline.</b> Cette analyse approfondie nourrit directement la
                  proposition en cours.
                </div>
                <div className="banner-act">
                  <Link href={routes.pipeline()} className="btn-out" style={{ textDecoration: 'none' }}>
                    Voir le pipeline
                  </Link>
                </div>
              </div>
            )}
            {quotaBas && (
              <div className="banner" data-tone="yellow">
                <span className="banner-ico">
                  <IcoDoc size={12} />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>Quota insuffisant pour l’analyse profonde ce mois-ci.</b> L’aperçu ci-dessous reste disponible,
                  mais l’historique complet sur 24 mois et le potentiel chiffré demandent plus de crédits que ceux
                  restants.
                </div>
                <div className="banner-act">
                  <Link href={routes.parametres()} className="btn-out" style={{ textDecoration: 'none' }}>
                    Voir la consommation
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="detail-row">
          <div className="col-main">
            {!acct && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 5 }}>
                    Choisissez un compte à explorer en profondeur
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 11px' }}>
                    Idéal après un Domain Overview prometteur, avant de chiffrer une proposition.
                  </div>
                  <button type="button" className="btn-out" onClick={() => selRef.current?.focus()}>
                    Choisir un compte
                  </button>
                </div>
              </div>
            )}

            {acct && (
              <EvolutionCard
                traffic={chute ? OR_TRAFFIC : OR_TRAFFIC_OK}
                pos={chute ? OR_POS : OR_POS_OK}
                drop={chute ? OR_DROP : null}
                months={24}
              />
            )}

            {acct && !quotaBas && (
              <>
                <PotentialCard rows={POTENTIAL_ROWS} mult={CTR_MULT} />
                <QueriesTable rows={rows} q={q} onQ={setQ} />
                <PagesCard up={PAGES_UP} down={PAGES_DOWN} />
              </>
            )}

            {acct && quotaBas && (
              <div className="empty">
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>
                  Le détail des requêtes et le potentiel chiffré demandent un quota plus large
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
                  Revenez au renouvellement mensuel, ou limitez l’analyse à Domain Overview pour ce prospect en
                  attendant.
                </div>
              </div>
            )}
          </div>
          <div className="col-side">
            <KeepCard prospect={prospect} />
            <SavesCard
              acct={acct}
              justSaved={saved}
              prospect={prospect}
              items={OR_SAVES}
              toolName="Organic Research"
              savedWhat="Audit de prospect généré"
              ficheHref={acct ? routes.client(acct.id) : routes.clients()}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
