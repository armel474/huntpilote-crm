'use client';

/**
 * Site Audit — outil de crawl technique (session 2.2).
 *
 * L'outil qui alimente le plus la fiche client : il produit la dimension SEO
 * et une partie de la dimension design de l'audit mensuel. Cinq familles de
 * constats, groupées, chacune transformable en priorité à trois échelles —
 * la famille entière, un constat, ou une page isolée.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { CostCard, SavesCard } from '@/components/outils/SideCards';
import { EmptyBlock } from '@/components/outils/Empty';
import { CrawlRunning, CrawlSummary, FamilyGroup, FeedsCard, SaKeepCard } from '@/components/outils/site-audit/Panels';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { IcoCoin, IcoDl, IcoPlay, IcoSpin, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  NEAR_LIMIT_QUOTA,
  NORMAL_QUOTA,
  readLastAccount,
  writeLastAccount,
  TOOL_ACCOUNTS,
  type AccountFilter,
} from '@/lib/data/outils';
import { FAMILIES, SA_COSTS, SA_SAVES, SA_SCOPES, SA_STATES, type SaState } from '@/lib/data/site-audit';

const DEFAULT_ACCOUNT = 'acme-corp';

export function SiteAuditView() {
  const [state, setStateRaw] = useState<SaState>('ok');
  const [acctId, setAcctId] = useState<string>(() => readLastAccount() || DEFAULT_ACCOUNT);
  const [filter, setFilter] = useState<AccountFilter>('tous');
  const [scope, setScope] = useState<(typeof SA_SCOPES)[number]>(SA_SCOPES[0]);
  const [domain, setDomain] = useState('');
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('toutes');
  const [open, setOpen] = useState<Record<string, boolean>>({
    indexation: false,
    erreurs: true,
    onpage: false,
    perf: true,
    structure: false,
  });
  const [created, setCreated] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pct, setPct] = useState(18);
  const selRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (state !== 'encours') return;
    const t = setInterval(() => setPct((p) => (p >= 96 ? 18 : p + 2)), 900);
    return () => clearInterval(t);
  }, [state]);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;
  useEffect(() => {
    setDomain(acct ? acct.domain : '');
    setSaved(false);
  }, [acct]);

  const pickState = (s: SaState) => {
    setStateRaw(s);
    setSaved(false);
    setCreated({});
    setQ('');
    setSev('toutes');
    setPct(18);
    if (s === 'nosel') setAcctId('');
    else if (s === 'prospect') setAcctId('spa-nordik-estrie');
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

  const term = q.trim().toLowerCase();
  const fams = useMemo(
    () =>
      FAMILIES.map((f) => ({
        fam: f,
        rows: f.rows.filter(
          (r) =>
            (sev === 'toutes' || f.sev === sev) &&
            (!term || r.c.toLowerCase().includes(term) || r.pgs.some((p) => p[0].toLowerCase().includes(term))),
        ),
      })).filter((g) => g.rows.length > 0),
    [term, sev],
  );

  const nRows = fams.reduce((n, g) => n + g.rows.length, 0);
  const nPages = fams.reduce((n, g) => n + g.rows.reduce((s, r) => s + r.n, 0), 0);
  const prospect = !!acct && acct.type === 'prospect';
  const running = state === 'encours';
  const partial = state === 'partiel';
  const noCrawl = state === 'jamais' || state === 'volumineux';
  const showFams = (state === 'ok' || state === 'partiel' || state === 'prospect') && !!acct;
  const bannerKind: BannerKind | null = prospect ? 'prospect' : !acct ? 'nosel' : null;
  const cost = SA_COSTS[scope];
  const quota = state === 'volumineux' ? NEAR_LIMIT_QUOTA : NORMAL_QUOTA;
  const canSave = (state === 'ok' || state === 'sain' || state === 'prospect') && !!acct;
  const saveHint = partial
    ? 'Relevé partiel : relancez une exploration complète avant d’enregistrer'
    : running
      ? 'Exploration en cours'
      : 'Aucun relevé complet à enregistrer';
  const nCreated = Object.keys(created).length;
  const allOpen = fams.length > 0 && fams.every((g) => open[g.fam.id]);

  const prioHref = (prio: string) => routes.priorite(acctId || DEFAULT_ACCOUNT, prio.toLowerCase());
  const auditHref = routes.audit(acctId || DEFAULT_ACCOUNT, 'a-0142');
  const ficheHref = routes.client(acctId || DEFAULT_ACCOUNT);

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Site Audit' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const header = (
    <CRMHeader title="Site Audit" period="" crumbs={crumbs}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lbl>
          <label htmlFor="sa-etat">Démo · état</label>
        </Lbl>
        <select
          id="sa-etat"
          className="state-sel"
          value={state}
          onChange={(e) => pickState(e.target.value as SaState)}
        >
          {SA_STATES.map(([id, label]) => (
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
        onPeriod={(v) => setScope(v as (typeof SA_SCOPES)[number])}
        periods={SA_SCOPES}
        periodLabel="Portée de l’exploration"
        cost={cost}
        saved={saved}
        onSave={() => setSaved(true)}
        canSave={canSave}
        saveHint={saveHint}
        fichenHref={ficheHref}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || partial || state === 'volumineux' || nCreated > 0) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && (
              <Banner
                kind={bannerKind}
                quota={quota}
                onFocusAcct={() => selRef.current?.focus()}
                onRetry={() => pickState('encours')}
              />
            )}
            {partial && !bannerKind && (
              <div className="banner" data-tone="yellow">
                <span className="banner-ico">
                  <IcoWarn size={12} />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>Le site a interrompu l’exploration après 128 pages (HTTP 429).</b> Les constats
                  sont réels mais incomplets — ils ne peuvent pas être versés à la fiche comme un
                  relevé du site entier.
                </div>
                <div className="banner-act">
                  <button type="button" className="btn-out" onClick={() => pickState('encours')}>
                    <IcoSpin />
                    Relancer plus lentement
                  </button>
                </div>
              </div>
            )}
            {state === 'volumineux' && !bannerKind && (
              <div className="banner" data-tone="yellow">
                <span className="banner-ico">
                  <IcoCoin />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>
                    Site estimé à 4 100 pages — au-delà du quota disponible (
                    {(quota.max - quota.used).toLocaleString('fr-CA')} crédits restants).
                  </b>{' '}
                  Réduisez la portée ou attendez le renouvellement du 1<sup>er</sup> octobre.
                </div>
                <div className="banner-act">
                  <a href={routes.parametres()} className="btn-out" style={{ textDecoration: 'none' }}>
                    Voir la consommation
                  </a>
                </div>
              </div>
            )}
            {nCreated > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill
                  label={`${nCreated} priorité${nCreated > 1 ? 's' : ''} créée${nCreated > 1 ? 's' : ''} depuis ce crawl`}
                  tone="blue"
                  sm
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
            {running && <CrawlRunning pct={pct} onStop={() => pickState('ok')} />}
            {(state === 'ok' || state === 'sain' || state === 'partiel' || state === 'prospect') && acct && (
              <CrawlSummary partial={partial} onRelaunch={() => pickState('encours')} auditHref={auditHref} />
            )}

            {noCrawl && acct && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 5 }}>
                    {state === 'jamais' ? `Aucune exploration de ${domain || 'ce domaine'}` : 'Site trop volumineux pour une exploration complète'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55, maxWidth: '34rem', margin: '0 auto 12px' }}>
                    {state === 'jamais'
                      ? 'Le premier passage découvre les URL, relève les réponses HTTP, les balises on-page et les Core Web Vitals par gabarit. Comptez une dizaine de minutes pour un site de cette taille.'
                      : 'Une exploration complète des 4 100 pages estimées dépasse le quota restant. Limitez la portée à 3 ou 5 niveaux de profondeur : les gabarits et les erreurs structurelles ressortent dès les premiers niveaux.'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-go"
                      onClick={() => pickState('encours')}
                      disabled={state === 'volumineux' && scope === SA_SCOPES[0]}
                    >
                      <IcoPlay />
                      {state === 'jamais' ? 'Lancer la première exploration' : 'Lancer avec la portée réduite'}
                    </button>
                    {state === 'volumineux' && (
                      <button type="button" className="btn-out" onClick={() => setScope(SA_SCOPES[2])}>
                        Limiter à 3 niveaux · {SA_COSTS[SA_SCOPES[2]].credits} crédits
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 9 }}>
                    Portée choisie : {scope} · {cost.credits} crédits · {cost.dollars}
                  </div>
                </div>
              </div>
            )}

            {state === 'sain' && (
              <EmptyBlock title="Aucun problème détecté sur les 412 pages" tone="sain">
                Les cinq familles sont au seuil : indexation, erreurs, on-page, performance,
                structure. Rien à transformer en priorité — à verser au prochain rapport client
                comme preuve de valeur.
              </EmptyBlock>
            )}

            {!acct && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 5 }}>
                    Choisissez un compte pour explorer son site
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 11px' }}>
                    Le compte pré-remplit le domaine, fournit le crawl précédent comme référence et
                    reçoit le relevé enregistré.
                  </div>
                  <button type="button" className="btn-out" onClick={() => selRef.current?.focus()}>
                    Choisir un compte
                  </button>
                </div>
              </div>
            )}

            {showFams && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="res-bar">
                  <input
                    className="inp"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Filtrer un constat ou une URL…"
                    aria-label="Filtrer les constats"
                    style={{ width: '13rem' }}
                  />
                  <select className="inp" value={sev} onChange={(e) => setSev(e.target.value)} aria-label="Filtrer par sévérité">
                    <option value="toutes">Toutes les sévérités</option>
                    <option value="critique">Critique</option>
                    <option value="important">Important</option>
                    <option value="opportunite">Opportunité</option>
                  </select>
                  <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>
                    {nRows} constats · {nPages} pages touchées
                  </span>
                  <button
                    type="button"
                    className="btn-out"
                    onClick={() => setOpen(FAMILIES.reduce((m, f) => ({ ...m, [f.id]: !allOpen }), {}))}
                  >
                    {allOpen ? 'Tout replier' : 'Tout déplier'}
                  </button>
                  <button type="button" className="btn-out" style={{ marginLeft: 'auto' }}>
                    <IcoDl />
                    Exporter en CSV
                  </button>
                </div>

                {fams.length === 0 ? (
                  <EmptyBlock
                    title="Aucun constat pour ces filtres"
                    actions={
                      <button
                        type="button"
                        className="btn-out"
                        onClick={() => {
                          setQ('');
                          setSev('toutes');
                        }}
                      >
                        <IcoSpin />
                        Élargir la recherche
                      </button>
                    }
                  >
                    17 constats existent sur ce crawl, aucun ne correspond à la combinaison actuelle.
                  </EmptyBlock>
                ) : (
                  fams.map((g) => (
                    <FamilyGroup
                      key={g.fam.id}
                      fam={g.fam}
                      rows={g.rows}
                      open={!!open[g.fam.id]}
                      onToggle={() => setOpen((m) => ({ ...m, [g.fam.id]: !m[g.fam.id] }))}
                      created={created}
                      onCreate={create}
                      onCreatePage={create}
                      prioHref={prioHref}
                    />
                  ))
                )}

                <div className="note-box" style={{ marginTop: 0 }}>
                  <span style={{ color: 'var(--fg3)', display: 'flex', marginTop: 1 }}>
                    <IcoDl />
                  </span>
                  <span>
                    <b>Créer la priorité</b> existe à trois échelles : la famille entière, un constat
                    (« les 23 liens brisés »), ou une page isolée. Les lignes déjà reprises affichent
                    leur priorité ouverte plutôt qu’un bouton, pour éviter les doublons.{' '}
                    <b>Enregistrer dans la fiche</b>, en haut, verse le relevé complet — c’est la
                    seule action principale de l’écran.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="col-side">
            <FeedsCard />
            <SaKeepCard prospect={prospect} />
            <CostCard cost={cost} quota={quota} />
            <SavesCard
              acct={acct}
              justSaved={saved}
              prospect={prospect}
              items={SA_SAVES}
              toolName="Site Audit"
              savedWhat={`412 pages · ${nRows} constats · dimension SEO`}
              ficheHref={ficheHref}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
