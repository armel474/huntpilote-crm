'use client';

/**
 * Domain Overview — qualifier vite (session 2.5).
 *
 * L'écran d'un coup d'œil : ce prospect vaut-il un rendez-vous ? Six cartes
 * denses tiennent sans défilement. Le geste qui compte n'est pas
 * « enregistrer dans la fiche » mais « créer un prospect » ou « rattacher à
 * un prospect existant » — l'outil alimente le pipeline commercial.
 */
import { useRef, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { CostCard, KeepCard } from '@/components/outils/SideCards';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoCheck, IcoUserPlus, IcoWarn } from '@/components/ui/Icons';
import { writeLastAccount, TOOL_ACCOUNTS, NORMAL_QUOTA, type AccountFilter } from '@/lib/data/outils';
import { routes } from '@/lib/routes';
import {
  AuthorityCard,
  GeoCard,
  KeywordsCard,
  TopPagesCard,
  TopQueriesCard,
  TrafficCard,
} from '@/components/outils/domain-overview/Panels';
import { CHUTE_DATE, CHUTE_HISTORY, DO_COST, DO_PERIODS, DO_STATES, OVERVIEW, type DoState } from '@/lib/data/domain-overview';

const DEFAULT_ACCOUNT = 'quincaillerie-fortin';

export function DomainOverviewView() {
  const [state, setStateRaw] = useState<DoState>('ok');
  const [acctId, setAcctId] = useState<string>('');
  const [filter, setFilter] = useState<AccountFilter>('prospects');
  const [domain, setDomain] = useState('fortin-quincaillerie.ca');
  const [created, setCreated] = useState(false);
  const [attached, setAttached] = useState<string | null>(null);
  const selRef = useRef<HTMLSelectElement>(null);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;

  const pickState = (s: DoState) => {
    setStateRaw(s);
    setCreated(false);
    setAttached(null);
    if (s === 'pipeline' || s === 'prospect') {
      setAcctId('spa-nordik-estrie');
      setDomain('spanordik-estrie.ca');
    } else if (s === 'nosel') {
      setAcctId('');
      setDomain('');
    } else {
      setAcctId('');
      setDomain('fortin-quincaillerie.ca');
    }
  };
  const pickAcct = (id: string) => {
    setAcctId(id);
    const a = TOOL_ACCOUNTS.find((x) => x.id === id);
    setDomain(a ? a.domain : domain);
    if (id) writeLastAccount(id);
    if (id && state === 'nosel') setStateRaw('ok');
    if (!id) setStateRaw('nosel');
  };

  const chute = state === 'chute';
  const sansdonnees = state === 'sansdonnees';
  const prospect = !!acct && acct.type === 'prospect';
  const alreadyPipeline = prospect && domain === acct!.domain;
  const prospectAccounts = TOOL_ACCOUNTS.filter((a) => a.type === 'prospect');
  const bannerKind: BannerKind | null = !acct && !domain ? 'nosel' : null;
  const cost = DO_COST;

  const action = alreadyPipeline ? (
    <Link href={routes.pipeline()} style={{ textDecoration: 'none' }}>
      <span className="btn-out">
        <IcoCheck />
        Déjà au pipeline
      </span>
    </Link>
  ) : created ? (
    <Link href={routes.pipeline()} style={{ textDecoration: 'none' }}>
      <span className="btn-out">
        <IcoCheck />
        Prospect créé · voir le pipeline
      </span>
    </Link>
  ) : (
    <button type="button" className="btn-go" onClick={() => setCreated(true)} disabled={!domain || sansdonnees}>
      <IcoUserPlus />
      Créer un prospect
    </button>
  );

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Domain Overview' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const header = (
    <CRMHeader title="Domain Overview" period="" crumbs={crumbs}>
      <DemoOnly>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="do-etat">Démo · état</label>
          </Lbl>
          <select id="do-etat" className="state-sel" value={state} onChange={(e) => pickState(e.target.value as DoState)}>
            {DO_STATES.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </DemoOnly>
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
        period={DO_PERIODS[0]}
        onPeriod={() => {}}
        periods={DO_PERIODS}
        periodLabel="Analyse"
        cost={cost}
        saved={false}
        onSave={() => {}}
        canSave={false}
        action={action}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || chute || attached) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && <Banner kind={bannerKind} quota={NORMAL_QUOTA} onFocusAcct={() => selRef.current?.focus()} />}
            {chute && !bannerKind && (
              <div className="banner" data-tone="red">
                <span className="banner-ico">
                  <IcoWarn size={12} />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>Chute de 65 % du trafic estimé, datée du {CHUTE_DATE}.</b> C’est un signal à exploiter en
                  prospection : un décrochage aussi net évoque une migration ratée, une pénalité ou un problème
                  technique majeur — pas une erreur de mesure.
                </div>
              </div>
            )}
            {attached && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill label={`Rattaché à ${attached}`} tone="blue" sm icon={<IcoCheck />} />
                <Link href={routes.pipeline()} style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
                  Voir le pipeline
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="detail-row">
          <div className="col-main" style={{ gap: 10 }}>
            {!domain && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 5 }}>Entrez un domaine à qualifier</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '28rem', margin: '0 auto' }}>
                    Tapez un domaine dans le champ ci-dessus, ou choisissez un compte existant.
                  </div>
                </div>
              </div>
            )}

            {domain && sansdonnees && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 5 }}>Aucune donnée pour {domain}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55, maxWidth: '30rem', margin: '0 auto' }}>
                    Site neuf ou trop petit pour être mesuré par le fournisseur. Ce n’est pas nécessairement un mauvais
                    prospect — revenez dans quelques mois, ou qualifiez-le par un autre canal.
                  </div>
                </div>
              </div>
            )}

            {domain && !sansdonnees && (
              <div className="do-grid">
                <TrafficCard
                  traffic={chute ? CHUTE_HISTORY[CHUTE_HISTORY.length - 1] : OVERVIEW.traffic}
                  prev={OVERVIEW.trafficPrev}
                  history={chute ? CHUTE_HISTORY : OVERVIEW.trafficHistory}
                  chute={chute}
                  chuteDate={CHUTE_DATE}
                />
                <KeywordsCard n={OVERVIEW.keywords} buckets={OVERVIEW.buckets} />
                <AuthorityCard authority={OVERVIEW.authority} refDomains={OVERVIEW.refDomains} />
                <TopPagesCard rows={OVERVIEW.topPages} />
                <TopQueriesCard rows={OVERVIEW.topQueries} />
                <GeoCard rows={OVERVIEW.geo} />
              </div>
            )}

            {domain && !sansdonnees && !alreadyPipeline && !created && (
              <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--fg2)' }}>Déjà en discussion avec ce domaine ?</span>
                <select
                  className="attach-sel"
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const a = TOOL_ACCOUNTS.find((x) => x.id === val);
                      if (a) setAttached(a.name);
                      e.target.value = '';
                    }
                  }}
                  aria-label="Rattacher à un prospect existant"
                >
                  <option value="" disabled>
                    Rattacher à un prospect existant…
                  </option>
                  {prospectAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="col-side">
            <KeepCard prospect={prospect} />
            <CostCard cost={cost} quota={NORMAL_QUOTA} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
