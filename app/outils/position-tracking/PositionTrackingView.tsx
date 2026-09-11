'use client';

/**
 * Position Tracking — suivi hebdomadaire des mots-clés d'un client
 * (session 2.3). S'inscrit dans le cadre commun conçu en session 2.1 :
 * sélecteur de compte, filtre, domaine, période, et l'unique action
 * principale « Enregistrer dans la fiche ».
 *
 * Le coût n'est pas facturé à la requête comme les autres outils : il
 * dépend du nombre de mots-clés suivis (voir `PtPlanCard`), d'où l'usage de
 * `costText`/`costTitle` plutôt que `cost` sur `ContextBar`.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { SavesCard } from '@/components/outils/SideCards';
import { EmptyBlock } from '@/components/outils/Empty';
import {
  DistributionCard,
  KeywordTable,
  MoversCard,
  PtKeepCard,
  PtPlanCard,
  TrendCard,
} from '@/components/outils/position-tracking/Panels';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoFork, IcoPlus, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { readLastAccount, writeLastAccount, TOOL_ACCOUNTS, type AccountFilter } from '@/lib/data/outils';
import {
  KEYWORDS,
  PT_PERIODS,
  PT_SAVES,
  PT_STATES,
  type PtKeyword,
  type PtState,
} from '@/lib/data/position-tracking';

const DEFAULT_ACCOUNT = 'acme-corp';
const PROSPECT_ACCOUNT = 'spa-nordik-estrie';

/** Le premier relevé n'a rien à comparer : un seul point d'historique, aucune position précédente. */
function toPremierRelevé(rows: readonly PtKeyword[]): PtKeyword[] {
  return rows.map((r) => ({ ...r, prev: null, isNew: true, history: [r.history[r.history.length - 1]] }));
}

export function PositionTrackingView() {
  const [state, setStateRaw] = useState<PtState>('ok');
  const [acctId, setAcctId] = useState<string>(() => readLastAccount() || DEFAULT_ACCOUNT);
  const [filter, setFilter] = useState<AccountFilter>('tous');
  const [period, setPeriod] = useState<(typeof PT_PERIODS)[number]>(PT_PERIODS[0]);
  const [domain, setDomain] = useState('');
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('tous');
  const [created, setCreated] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pct, setPct] = useState(30);
  const [rows, setRows] = useState<PtKeyword[]>([...KEYWORDS]);
  const [selC, setSelC] = useState<string | null>(KEYWORDS[0].c);
  const selRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (state !== 'encours') return;
    const t = setInterval(() => setPct((p) => (p >= 98 ? 30 : p + 4)), 700);
    return () => clearInterval(t);
  }, [state]);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;
  useEffect(() => {
    setDomain(acct ? acct.domain : '');
    setSaved(false);
  }, [acct]);

  const pickState = (s: PtState) => {
    setStateRaw(s);
    setSaved(false);
    setCreated({});
    setQ('');
    setGroup('tous');
    setPct(30);
    if (s === 'vide') setRows([]);
    else if (s === 'premier') setRows(toPremierRelevé(KEYWORDS));
    else setRows([...KEYWORDS]);
    setSelC(KEYWORDS[0].c);
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
  const remove = (c: string) => {
    setRows((rs) => rs.filter((r) => r.c !== c));
    if (selC === c) setSelC(null);
  };
  const add = (c: string) => {
    const nr: PtKeyword = {
      c,
      group: 'Non classé',
      intent: 'Transactionnelle',
      pos: null,
      prev: null,
      vol: 0,
      urls: [],
      history: [],
      isNew: true,
    };
    setRows((rs) => [nr, ...rs]);
    setSelC(c);
  };

  const term = q.trim().toLowerCase();
  const filtered = useMemo(
    () => rows.filter((r) => (group === 'tous' || r.group === group) && (!term || r.c.toLowerCase().includes(term))),
    [rows, group, term],
  );
  const sel = rows.find((r) => r.c === selC) || rows[0] || null;
  const prospect = !!acct && acct.type === 'prospect';
  const premier = state === 'premier';
  const bannerKind: BannerKind | null = prospect ? 'prospect' : !acct ? 'nosel' : null;
  const dropped = rows.find((r) => r.dropped);
  const cannibRow = rows.find((r) => r.cannib);
  const nCreated = Object.keys(created).length;
  const canSave = !!acct && state !== 'encours' && state !== 'vide' && rows.length > 0;
  const saveHint =
    state === 'vide' ? 'Ajoutez au moins un mot-clé au suivi' : state === 'encours' ? 'Relevé en cours' : 'Un relevé est requis';

  const prioHref = (prio: string) => routes.priorite(acctId || DEFAULT_ACCOUNT, prio.toLowerCase());
  const ficheHref = routes.client(acctId || DEFAULT_ACCOUNT);

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Position Tracking' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const header = (
    <CRMHeader title="Position Tracking" period="" crumbs={crumbs}>
      <DemoOnly>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="pt-etat">Démo · état</label>
          </Lbl>
          <select id="pt-etat" className="state-sel" value={state} onChange={(e) => pickState(e.target.value as PtState)}>
            {PT_STATES.map(([id, label]) => (
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
        period={period}
        onPeriod={(v) => setPeriod(v as (typeof PT_PERIODS)[number])}
        periods={PT_PERIODS}
        periodLabel="Fenêtre de comparaison"
        cost={{ credits: rows.length, dollars: '', weight: 'Requête légère' }}
        costText={`${rows.length} mots-clés suivis`}
        costTitle="Le nombre de mots-clés suivis détermine le coût mensuel du compte"
        saved={saved}
        onSave={() => setSaved(true)}
        canSave={canSave}
        saveHint={saveHint}
        fichenHref={ficheHref}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || (state === 'sorti' && dropped) || (state === 'cannib' && cannibRow) || nCreated > 0) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && <Banner kind={bannerKind} onFocusAcct={() => selRef.current?.focus()} />}
            {state === 'sorti' && dropped && !bannerKind && (
              <div className="banner" data-tone="red">
                <span className="banner-ico">
                  <IcoWarn size={12} />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>« {dropped.c} » est sorti du top 100</b> — il était en position {dropped.prev} au relevé
                  précédent. Vérifiez qu’aucune page ciblant cette requête n’a été dépubliée ou bloquée.
                </div>
                <div className="banner-act">
                  <button type="button" className="btn-out" onClick={() => create(dropped.c)}>
                    <IcoPlus />
                    Créer la priorité
                  </button>
                </div>
              </div>
            )}
            {state === 'cannib' && cannibRow && !bannerKind && (
              <div className="banner" data-tone="yellow">
                <span className="banner-ico">
                  <IcoFork />
                </span>
                <div style={{ flex: 1, minWidth: '14rem' }}>
                  <b>Cannibalisation sur « {cannibRow.c} »</b> — {cannibRow.urls.length} pages du site ciblent la
                  même requête ({cannibRow.urls.join(' · ')}). Elles se concurrencent au lieu de se renforcer.
                </div>
                <div className="banner-act">
                  <button type="button" className="btn-out" onClick={() => create(cannibRow.c)}>
                    <IcoPlus />
                    Créer la priorité
                  </button>
                </div>
              </div>
            )}
            {nCreated > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill
                  label={`${nCreated} priorité${nCreated > 1 ? 's' : ''} créée${nCreated > 1 ? 's' : ''} depuis cet outil`}
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
                    Choisissez un compte pour suivre ses mots-clés
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 11px' }}>
                    Le compte détermine la liste suivie, le domaine pré-rempli et le coût mensuel affiché.
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
                  Relevé hebdomadaire en cours
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginBottom: 7 }}>
                  {Math.round((pct / 100) * rows.length)} sur {rows.length} mots-clés interrogés chez le fournisseur…
                </div>
                <div className="track">
                  <div className="fill" style={{ width: `${pct}%`, background: 'var(--blue-fg)' }} />
                </div>
              </div>
            )}

            {acct && state === 'vide' && (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <EmptyBlock title={`Aucun mot-clé suivi pour ${acct.name}`}>
                  Ajoutez les requêtes à suivre chaque semaine. Le coût mensuel du compte dépend du nombre de
                  mots-clés ajoutés.
                </EmptyBlock>
                <div className="add-row" style={{ justifyContent: 'center', marginTop: 12 }}>
                  <input
                    className="inp"
                    placeholder="Ajouter un mot-clé à suivre…"
                    aria-label="Nouveau mot-clé"
                    style={{ width: '16rem' }}
                    onKeyDown={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (e.key === 'Enter' && target.value.trim()) {
                        add(target.value.trim());
                        target.value = '';
                      }
                    }}
                  />
                  <button type="button" className="btn-go" onClick={() => add('nouveau mot-clé')}>
                    <IcoPlus />
                    Ajouter au suivi
                  </button>
                </div>
              </div>
            )}

            {acct && state !== 'encours' && state !== 'vide' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MoversCard rows={rows} premier={premier} />
                <DistributionCard rows={rows} premier={premier} />
                {sel && <TrendCard sel={sel} period={period} />}
                <KeywordTable
                  rows={filtered}
                  allRows={rows}
                  sel={sel}
                  onSel={(r) => setSelC(r.c)}
                  q={q}
                  onQ={setQ}
                  group={group}
                  onGroup={setGroup}
                  created={created}
                  onCreate={create}
                  onRemove={remove}
                  onAdd={add}
                  prioHref={prioHref}
                />
              </div>
            )}
          </div>

          <div className="col-side">
            <PtPlanCard n={rows.length} />
            <PtKeepCard prospect={prospect} />
            <SavesCard
              acct={acct}
              justSaved={saved}
              prospect={prospect}
              items={PT_SAVES}
              toolName="Position Tracking"
              savedWhat={`${rows.length} mots-clés · relevé ${period.toLowerCase()}`}
              ficheHref={ficheHref}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
