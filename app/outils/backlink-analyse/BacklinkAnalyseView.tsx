'use client';

/**
 * Backlink Analyse — profil de liens entrants d'un client (session 2.3).
 * S'inscrit dans le cadre commun conçu en session 2.1 : sélecteur de
 * compte, filtre, domaine, période, et l'unique action principale
 * « Enregistrer dans la fiche ».
 *
 * Le corpus complet des backlinks n'est jamais la vue principale — ce sont
 * les gains et les pertes qui informent (voir `GainsLossesCard`).
 */
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { CostCard, SavesCard } from '@/components/outils/SideCards';
import { EmptyBlock } from '@/components/outils/Empty';
import {
  BlKeepCard,
  CompetitorsCard,
  GainsLossesCard,
  ProfileCard,
  ToxicCard,
} from '@/components/outils/backlink-analyse/Panels';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { IcoGlobe, IcoPlay, IcoPlus, IcoSpin, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { NORMAL_QUOTA, readLastAccount, writeLastAccount, TOOL_ACCOUNTS, type AccountFilter } from '@/lib/data/outils';
import {
  ANCHORS,
  BL_COSTS,
  BL_SAVES,
  BL_SCOPES,
  BL_STATES,
  COMPETITORS,
  GAINS,
  LOSSES,
  PROFILE,
  TOXIC,
  type BlState,
  type BlToxic,
} from '@/lib/data/backlink-analyse';

const DEFAULT_ACCOUNT = 'acme-corp';
const PROSPECT_ACCOUNT = 'spa-nordik-estrie';

export function BacklinkAnalyseView() {
  const [state, setStateRaw] = useState<BlState>('ok');
  const [acctId, setAcctId] = useState<string>(() => readLastAccount() || DEFAULT_ACCOUNT);
  const [filter, setFilter] = useState<AccountFilter>('tous');
  const [scope, setScope] = useState<(typeof BL_SCOPES)[number]>(BL_SCOPES[0]);
  const [domain, setDomain] = useState('');
  const [created, setCreated] = useState<Record<string, string>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [toxic, setToxic] = useState<BlToxic[]>([...TOXIC]);
  const [saved, setSaved] = useState(false);
  const [pct, setPct] = useState(24);
  const selRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (state !== 'encours') return;
    const t = setInterval(() => setPct((p) => (p >= 96 ? 24 : p + 6)), 650);
    return () => clearInterval(t);
  }, [state]);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;
  useEffect(() => {
    setDomain(acct ? acct.domain : '');
    setSaved(false);
  }, [acct]);

  const pickState = (s: BlState) => {
    setStateRaw(s);
    setSaved(false);
    setCreated({});
    setReported({});
    setToxic([...TOXIC]);
    setPct(24);
    if (s === 'nosel') setAcctId('');
    else if (s === 'prospect') setAcctId(PROSPECT_ACCOUNT);
    else setAcctId(readLastAccount() || DEFAULT_ACCOUNT);
  };
  const pickAcct = (id: string) => {
    setAcctId(id);
    setSaved(false);
    if (id) {
      writeLastAccount(id);
      if (state === 'nosel') setStateRaw('ok');
    } else {
      setStateRaw('nosel');
    }
  };
  const create = (key: string) =>
    setCreated((m) => ({ ...m, [key]: `P-05${String(Object.keys(m).length + 1).padStart(2, '0')}` }));
  const report = (gainDomain: string) => setReported((m) => ({ ...m, [gainDomain]: true }));
  const disavow = (toxicDomain: string) =>
    setToxic((rs) => rs.map((r) => (r.domain === toxicDomain ? { ...r, status: 'desavoue' as const } : r)));

  const prospect = !!acct && acct.type === 'prospect';
  const incomplet = state === 'incomplet';
  const aucun = state === 'aucun';
  const bannerKind: BannerKind | null = prospect ? 'prospect' : !acct ? 'nosel' : null;
  const cost = BL_COSTS[scope];
  const canSave = !!acct && (state === 'ok' || state === 'perte' || state === 'incomplet' || state === 'prospect');
  const nCreated = Object.keys(created).length + Object.keys(reported).length;
  const bigLoss = LOSSES.find((l) => l.authority >= 50);

  const prioHref = (prio: string) => routes.priorite(acctId || DEFAULT_ACCOUNT, prio.toLowerCase());
  const ficheHref = routes.client(acctId || DEFAULT_ACCOUNT);

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Backlink Analyse' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const header = (
    <CRMHeader title="Backlink Analyse" period="" crumbs={crumbs}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lbl>
          <label htmlFor="bl-etat">Démo · état</label>
        </Lbl>
        <select id="bl-etat" className="state-sel" value={state} onChange={(e) => pickState(e.target.value as BlState)}>
          {BL_STATES.map(([id, label]) => (
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
        period={scope}
        onPeriod={(v) => setScope(v as (typeof BL_SCOPES)[number])}
        periods={BL_SCOPES}
        periodLabel="Portée de l’analyse"
        cost={cost}
        saved={saved}
        onSave={() => setSaved(true)}
        canSave={canSave}
        saveHint="Aucun profil exploitable à enregistrer"
        fichenHref={ficheHref}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || state === 'perte' || incomplet || nCreated > 0) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && <Banner kind={bannerKind} onFocusAcct={() => selRef.current?.focus()} />}
            {state === 'perte' && !bannerKind && bigLoss && (
              <div className="banner" data-tone="red">
                <span className="banner-ico">
                  <IcoWarn size={12} />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>
                    Perte importante — {bigLoss.domain} (autorité {bigLoss.authority}) a retiré son lien.
                  </b>{' '}
                  {LOSSES.length} domaines référents perdus cette période, dont un au-dessus du seuil d’alerte
                  (autorité ≥ 50).
                </div>
                <div className="banner-act">
                  <button type="button" className="btn-out" onClick={() => create(bigLoss.domain)}>
                    <IcoPlus />
                    Créer la priorité
                  </button>
                </div>
              </div>
            )}
            {incomplet && !bannerKind && (
              <div className="banner" data-tone="yellow">
                <span className="banner-ico">
                  <IcoGlobe />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>Données partielles du fournisseur.</b> Les ancres et la comparaison concurrentielle n’ont pas
                  pu être récupérées pour ce relevé — le reste du profil est fiable.
                </div>
                <div className="banner-act">
                  <button type="button" className="btn-out" onClick={() => pickState('encours')}>
                    <IcoSpin />
                    Relancer l’analyse
                  </button>
                </div>
              </div>
            )}
            {nCreated > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill
                  label={`${nCreated} action${nCreated > 1 ? 's' : ''} enregistrée${nCreated > 1 ? 's' : ''} depuis cet outil`}
                  tone="blue"
                  sm
                  icon={<IcoPlus />}
                />
                <a href={routes.client(acctId)} style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
                  Voir le plan d’action
                </a>
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
                    Choisissez un compte pour analyser son profil
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 11px' }}>
                    Le compte pré-remplit le domaine et reçoit les gains, pertes et désaveux enregistrés.
                  </div>
                  <button type="button" className="btn-out" onClick={() => selRef.current?.focus()}>
                    Choisir un compte
                  </button>
                </div>
              </div>
            )}

            {acct && state === 'encours' && (
              <div className="card" style={{ padding: '0.875rem 1rem' }}>
                <div className="lbl" style={{ marginBottom: 6 }}>
                  Analyse du profil en cours
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginBottom: 7 }}>
                  Interrogation du fournisseur de données de liens entrants…
                </div>
                <div className="track">
                  <div className="fill" style={{ width: `${pct}%`, background: 'var(--blue-fg)' }} />
                </div>
              </div>
            )}

            {acct && aucun && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <EmptyBlock title={`Aucun backlink détecté pour ${domain || 'ce domaine'}`}>
                  Normal pour un site récent ou jamais promu hors de ses propres canaux. Relancez l’analyse après
                  une première campagne de visibilité.
                </EmptyBlock>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                  <button type="button" className="btn-go" onClick={() => pickState('encours')}>
                    <IcoPlay />
                    Lancer une analyse
                  </button>
                </div>
              </div>
            )}

            {acct && !aucun && state !== 'encours' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ProfileCard p={PROFILE} anchors={ANCHORS} incomplet={incomplet} />
                <GainsLossesCard
                  gains={GAINS}
                  losses={LOSSES}
                  reported={reported}
                  onReport={report}
                  onCreate={create}
                  created={created}
                  prioHref={prioHref}
                />
                <ToxicCard rows={toxic} onDisavow={disavow} onCreate={create} created={created} prioHref={prioHref} />
                <CompetitorsCard rows={COMPETITORS} incomplet={incomplet} />
              </div>
            )}
          </div>

          <div className="col-side">
            <BlKeepCard prospect={prospect} />
            <CostCard cost={cost} quota={NORMAL_QUOTA} />
            <SavesCard
              acct={acct}
              justSaved={saved}
              prospect={prospect}
              items={BL_SAVES}
              toolName="Backlink Analyse"
              savedWhat={`${PROFILE.domains} domaines référents · profil complet`}
              ficheHref={ficheHref}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
