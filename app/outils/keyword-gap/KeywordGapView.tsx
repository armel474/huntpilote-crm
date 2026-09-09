'use client';

/**
 * Keyword Gap — outil de comparaison concurrentielle (session 2.4).
 *
 * Compare le client à jusqu'à trois concurrents sur quatre catégories :
 * manquants, faibles, forts, uniques. Les manquants à fort volume sont ce
 * qu'on vient chercher. Alimente la carte Concurrence de la fiche. Résultat
 * éphémère — cache 30 jours.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { SavesCard } from '@/components/outils/SideCards';
import { CatGroup, CompManage, GapKeepCard } from '@/components/outils/keyword-gap/Panels';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { IcoPlus, IcoWarn } from '@/components/ui/Icons';
import { readLastAccount, writeLastAccount, TOOL_ACCOUNTS, type AccountFilter } from '@/lib/data/outils';
import { routes } from '@/lib/routes';
import {
  DEFAULT_COMPETITORS,
  KG_CATEGORIES,
  KG_ROWS,
  KG_SAVES,
  KG_STATES,
  type KgCompetitor,
  type KgState,
} from '@/lib/data/keyword-gap';

const DEFAULT_ACCOUNT = 'acme-corp';

export function KeywordGapView() {
  const [state, setStateRaw] = useState<KgState>('ok');
  const [acctId, setAcctId] = useState<string>(() => readLastAccount() || DEFAULT_ACCOUNT);
  const [filter, setFilter] = useState<AccountFilter>('tous');
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState<readonly KgCompetitor[]>(DEFAULT_COMPETITORS);
  const [open, setOpen] = useState<Record<string, boolean>>({ manquants: true, faibles: true, forts: false, uniques: false });
  const [created, setCreated] = useState<Record<string, string>>({});
  const [tracked, setTracked] = useState(0);
  const [saved, setSaved] = useState(false);
  const selRef = useRef<HTMLSelectElement>(null);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;
  useEffect(() => {
    setDomain(acct ? acct.domain : '');
    setSaved(false);
  }, [acct]);

  const pickState = (s: KgState) => {
    setStateRaw(s);
    setSaved(false);
    setCreated({});
    setTracked(0);
    if (s === 'aucun') setCompetitors([]);
    else if (s === 'sansdonnees') setCompetitors(DEFAULT_COMPETITORS.map((c, i) => (i === 1 ? { ...c, noData: true } : c)));
    else setCompetitors(DEFAULT_COMPETITORS);
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
  const removeComp = (d: string) => setCompetitors((cs) => cs.filter((c) => c.domain !== d));
  const addComp = (d: string) => competitors.length < 3 && setCompetitors((cs) => [...cs, { domain: d, name: d }]);
  const create = (c: string) => setCreated((m) => ({ ...m, [c]: `P-05${String(Object.keys(m).length + 1).padStart(2, '0')}` }));
  const track = () => setTracked((t) => t + 1);

  const recoupementNul = state === 'recoupement';
  const cats = useMemo(
    () => KG_CATEGORIES.map((cat) => ({ cat, rows: recoupementNul ? [] : KG_ROWS[cat.id] })),
    [recoupementNul],
  );
  const totalRows = cats.reduce((n, g) => n + g.rows.length, 0);
  const prospect = !!acct && acct.type === 'prospect';
  const bannerKind: BannerKind | null = prospect ? 'prospect' : !acct ? 'nosel' : null;
  const canSave = !!acct && competitors.length > 0 && state !== 'aucun';
  const nCreated = Object.keys(created).length;
  const ficheHref = routes.client(acctId || DEFAULT_ACCOUNT);
  const prioHref = (prio: string) => routes.priorite(acctId || DEFAULT_ACCOUNT, prio.toLowerCase());

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Keyword Gap' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const header = (
    <CRMHeader title="Keyword Gap" period="" crumbs={crumbs}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lbl>
          <label htmlFor="kg-etat">Démo · état</label>
        </Lbl>
        <select id="kg-etat" className="state-sel" value={state} onChange={(e) => pickState(e.target.value as KgState)}>
          {KG_STATES.map(([id, label]) => (
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
        period="Comparaison"
        onPeriod={() => {}}
        periods={['Comparaison']}
        periodLabel="Comparaison"
        cost={{ credits: 0, dollars: '0,00 $', weight: 'Requête légère' }}
        costText={`${competitors.length} concurrent${competitors.length > 1 ? 's' : ''} comparé${competitors.length > 1 ? 's' : ''}`}
        costTitle="Nombre de concurrents inclus dans la comparaison"
        saved={saved}
        onSave={() => setSaved(true)}
        canSave={canSave}
        saveHint="Renseignez au moins un concurrent"
        fichenHref={ficheHref}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || (state === 'sansdonnees' && competitors.some((c) => c.noData)) || nCreated > 0 || tracked > 0) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && <Banner kind={bannerKind} onFocusAcct={() => selRef.current?.focus()} />}
            {state === 'sansdonnees' &&
              !bannerKind &&
              competitors
                .filter((c) => c.noData)
                .map((c) => (
                  <div className="banner" data-tone="yellow" key={c.domain}>
                    <span className="banner-ico">
                      <IcoWarn />
                    </span>
                    <div style={{ flex: 1, minWidth: '14rem' }}>
                      <b>{c.name} n’a renvoyé aucune donnée.</b> Le fournisseur n’a pas pu analyser ce domaine —
                      vérifiez qu’il est bien orthographié, ou réessayez plus tard. Les autres colonnes restent
                      fiables.
                    </div>
                  </div>
                ))}
            {nCreated > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill
                  label={`${nCreated} priorité${nCreated > 1 ? 's' : ''} créée${nCreated > 1 ? 's' : ''} depuis cet outil`}
                  tone="blue"
                  sm
                  icon={<IcoPlus />}
                />
                <a href={ficheHref} style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
                  Voir le plan d’action
                </a>
              </div>
            )}
            {tracked > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill
                  label={`${tracked} mot${tracked > 1 ? 's' : ''}-clé${tracked > 1 ? 's' : ''} ajouté${tracked > 1 ? 's' : ''} au suivi`}
                  tone="blue"
                  sm
                  icon={<IcoPlus />}
                />
                <a href="/outils/position-tracking" style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
                  Voir le suivi
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
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 5 }}>Choisissez un compte pour le comparer</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 11px' }}>
                    Le compte fournit le domaine client et reçoit la mise à jour de la carte Concurrence.
                  </div>
                  <button type="button" className="btn-out" onClick={() => selRef.current?.focus()}>
                    Choisir un compte
                  </button>
                </div>
              </div>
            )}

            {acct && <CompManage clientName={acct.name} competitors={competitors} onRemove={removeComp} onAdd={addComp} />}

            {acct && competitors.length === 0 && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 5 }}>Aucun concurrent renseigné</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55, maxWidth: '30rem', margin: '0 auto' }}>
                    Ajoutez jusqu’à trois domaines concurrents ci-dessus pour voir les requêtes manquantes, faibles,
                    fortes et uniques.
                  </div>
                </div>
              </div>
            )}

            {acct && competitors.length > 0 && recoupementNul && (
              <div className="empty">
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Recoupement nul</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
                  Aucune requête commune entre {acct.name} et les concurrents comparés — les thématiques ne se
                  recoupent pas assez pour être comparées utilement.
                </div>
              </div>
            )}

            {acct &&
              competitors.length > 0 &&
              !recoupementNul &&
              totalRows > 0 &&
              cats.map(
                ({ cat, rows }) =>
                  rows.length > 0 && (
                    <CatGroup
                      key={cat.id}
                      cat={cat}
                      rows={rows}
                      competitors={competitors}
                      open={!!open[cat.id]}
                      onToggle={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                      created={created}
                      onCreate={create}
                      onTrack={track}
                      prioHref={prioHref}
                    />
                  ),
              )}
          </div>

          <div className="col-side">
            <GapKeepCard prospect={prospect} />
            <SavesCard
              acct={acct}
              justSaved={saved}
              prospect={prospect}
              items={KG_SAVES}
              toolName="Keyword Gap"
              savedWhat={`${competitors.length} concurrents comparés`}
              ficheHref={ficheHref}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
