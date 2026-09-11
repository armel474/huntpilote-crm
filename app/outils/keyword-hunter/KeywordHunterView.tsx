'use client';

/**
 * Keyword Hunter — outil d'exploration de mots-clés (session 2.4).
 *
 * Trouve des requêtes à cibler à partir d'un mot-clé racine, d'une URL ou
 * d'un thème, regroupées par thème pour rester exploitables. Alimente le
 * plan éditorial : ajout au suivi de positions, brief d'article par thème,
 * sélection enregistrée dans la fiche. Résultat éphémère — cache 30 jours.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContextBar } from '@/components/outils/ContextBar';
import { Banner, type BannerKind } from '@/components/outils/Banner';
import { SavesCard } from '@/components/outils/SideCards';
import { KhKeepCard, SeedFilters, ThemeGroup } from '@/components/outils/keyword-hunter/Panels';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoCheck, IcoPlus, IcoRepeat, IcoSrch } from '@/components/ui/Icons';
import { readLastAccount, writeLastAccount, TOOL_ACCOUNTS, type AccountFilter } from '@/lib/data/outils';
import { routes } from '@/lib/routes';
import {
  KH_FILTERS_DEFAULT,
  KH_SAVES,
  KH_STATES,
  SUGGESTIONS,
  type KhFilters,
  type KhState,
} from '@/lib/data/keyword-hunter';

const DEFAULT_ACCOUNT = 'acme-corp';

function wordCount(c: string) {
  return c.trim().split(/\s+/).length;
}

export function KeywordHunterView() {
  const [state, setStateRaw] = useState<KhState>('ok');
  const [acctId, setAcctId] = useState<string>(() => readLastAccount() || DEFAULT_ACCOUNT);
  const [filter, setFilter] = useState<AccountFilter>('tous');
  const [domain, setDomain] = useState('');
  const [seed, setSeed] = useState('toiture montréal');
  const [f, setF] = useState<KhFilters>(KH_FILTERS_DEFAULT);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [sel, setSel] = useState<Set<string>>(() => new Set());
  const [briefs, setBriefs] = useState<Record<string, string>>({});
  const [tracked, setTracked] = useState(0);
  const [saved, setSaved] = useState(false);
  const selRef = useRef<HTMLSelectElement>(null);

  const acct = TOOL_ACCOUNTS.find((a) => a.id === acctId) || null;
  useEffect(() => {
    setDomain(acct ? acct.domain : '');
    setSaved(false);
  }, [acct]);

  const pickState = (s: KhState) => {
    setStateRaw(s);
    setSaved(false);
    setSel(new Set());
    setBriefs({});
    setTracked(0);
    // Combinaison qui vide réellement la liste : le seul résultat à volume ≥ 1000
    // ("combien coûte une toiture", 1 400/mois) a une difficulté de 52 — au-dessus de 20.
    setF(s === 'vide' ? { ...KH_FILTERS_DEFAULT, volMin: 1000, diffMax: 20 } : KH_FILTERS_DEFAULT);
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

  const filtered = useMemo(
    () =>
      SUGGESTIONS.filter(
        (r) =>
          r.vol >= f.volMin &&
          r.diff <= f.diffMax &&
          (f.intent === 'toutes' || r.intent === f.intent) &&
          (f.length === 'toutes' || (f.length === 'courte' ? wordCount(r.c) <= 3 : wordCount(r.c) >= 5)) &&
          (!f.question || r.question),
      ),
    [f],
  );
  const themes = useMemo(() => [...new Set(filtered.map((r) => r.theme))], [filtered]);

  const toggleRow = (c: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  const toggleAll = (rows: readonly { c: string }[], on: boolean) =>
    setSel((s) => {
      const n = new Set(s);
      rows.forEach((r) => (on ? n.add(r.c) : n.delete(r.c)));
      return n;
    });
  const makeBrief = (theme: string) => setBriefs((m) => ({ ...m, [theme]: `B-021${Object.keys(m).length + 1}` }));
  const addTracking = () => {
    setTracked((t) => t + sel.size);
    setSel(new Set());
  };

  const prospect = !!acct && acct.type === 'prospect';
  const bannerKind: BannerKind | null = prospect ? 'prospect' : !acct ? 'nosel' : null;
  const canSave = !!acct && sel.size > 0;
  const ficheHref = `/clients/${acctId || DEFAULT_ACCOUNT}`;

  const crumbs = [
    { label: 'HuntPilote', href: '/dashboard' },
    { label: 'Outils', href: '/outils' },
    { label: 'Keyword Hunter' },
    ...(acct ? [{ label: acct.name }] : []),
  ];

  const header = (
    <CRMHeader title="Keyword Hunter" period="" crumbs={crumbs}>
      <DemoOnly>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="kh-etat">Démo · état</label>
          </Lbl>
          <select id="kh-etat" className="state-sel" value={state} onChange={(e) => pickState(e.target.value as KhState)}>
            {KH_STATES.map(([id, label]) => (
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
        period={seed}
        onPeriod={() => {}}
        periods={[seed]}
        periodLabel="Point de départ"
        cost={{ credits: 0, dollars: '0,00 $', weight: 'Requête légère' }}
        costText={`${filtered.length} suggestion${filtered.length > 1 ? 's' : ''}`}
        costTitle="Nombre de suggestions après filtrage"
        saved={saved}
        onSave={() => setSaved(true)}
        canSave={canSave}
        saveHint="Sélectionnez au moins une requête"
        fichenHref={ficheHref}
        selRef={selRef}
      />

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        {(bannerKind || tracked > 0) && (
          <div style={{ padding: '0.75rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bannerKind && <Banner kind={bannerKind} onFocusAcct={() => selRef.current?.focus()} />}
            {tracked > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill
                  label={`${tracked} mot${tracked > 1 ? 's' : ''}-clé${tracked > 1 ? 's' : ''} ajouté${tracked > 1 ? 's' : ''} au suivi de positions`}
                  tone="blue"
                  sm
                  icon={<IcoPlus />}
                />
                <a href={routes.outil('position-tracking')} style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
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
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 5 }}>
                    Choisissez un compte pour lancer une exploration
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 11px' }}>
                    Le compte reçoit la sélection enregistrée et le suivi de positions ajouté.
                  </div>
                  <button type="button" className="btn-out" onClick={() => selRef.current?.focus()}>
                    Choisir un compte
                  </button>
                </div>
              </div>
            )}

            {acct && <SeedFilters seed={seed} onSeed={setSeed} onExplore={() => pickState('recherche')} f={f} onF={setF} />}

            {acct && state === 'recherche' && (
              <div className="card" style={{ padding: '0.875rem 1rem' }} aria-live="polite">
                <div className="lbl" style={{ marginBottom: 6 }}>
                  Exploration de « {seed} »…
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skel" style={{ height: 40, opacity: 1 - i * 0.22 }} />
                  ))}
                </div>
              </div>
            )}

            {acct && state !== 'recherche' && (
              <>
                {sel.size > 0 && (
                  <div className="sel-bar">
                    <IcoCheck />
                    <b style={{ fontSize: '0.75rem' }}>
                      {sel.size} requête{sel.size > 1 ? 's' : ''} sélectionnée{sel.size > 1 ? 's' : ''}
                    </b>
                    <button type="button" className="btn-out" onClick={addTracking}>
                      <IcoSrch />
                      Ajouter au suivi de positions
                    </button>
                    <span style={{ fontSize: '0.625rem', color: 'var(--fg2)' }}>
                      ou enregistrez la sélection dans la fiche, en haut
                    </span>
                  </div>
                )}

                {themes.length === 0 ? (
                  <div className="empty">
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>
                      Aucune suggestion pour « {seed} »
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 10 }}>
                      Les filtres actifs excluent tous les résultats, ou ce départ n’a rien renvoyé chez le fournisseur.
                    </div>
                    <button type="button" className="btn-out" onClick={() => setF(KH_FILTERS_DEFAULT)}>
                      <IcoRepeat />
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  themes.map((th) => {
                    const rows = filtered.filter((r) => r.theme === th);
                    return (
                      <ThemeGroup
                        key={th}
                        theme={th}
                        rows={rows}
                        open={open[th] !== false}
                        onToggle={() => setOpen((o) => ({ ...o, [th]: o[th] === false }))}
                        sel={sel}
                        onToggleRow={toggleRow}
                        onToggleAll={toggleAll}
                        brief={briefs[th]}
                        onBrief={makeBrief}
                        f={f}
                      />
                    );
                  })
                )}
              </>
            )}
          </div>

          <div className="col-side">
            <KhKeepCard prospect={prospect} />
            <SavesCard
              acct={acct}
              justSaved={saved}
              prospect={prospect}
              items={KH_SAVES}
              toolName="Keyword Hunter"
              savedWhat={`${sel.size || 8} requêtes sélectionnées`}
              ficheHref={ficheHref}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
