/* HuntPilote — états système : composants React partagés (squelettes, vide, erreur, permission).
   Aucune donnée : chaque écran passe ses propres textes, seuils et gestes. */
const HSI = {
  Doc: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Trophy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17M14 14.66V17" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Warn: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Plug: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v6M15 2v6" /><path d="M6 8h12v3a6 6 0 01-12 0V8z" /><line x1="12" y1="17" x2="12" y2="22" /></svg>,
  Clock: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Retry: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

/* ── SQUELETTES : la forme du contenu attendu, pas un tourniquet ── */
const SkelLine = ({ w = '100%', h = 11, style }) => <div className="hs-skel hs-line" style={{ width: w, height: h, ...style }}></div>;
const SkelCircle = ({ s = 28 }) => <div className="hs-skel hs-circle" style={{ width: s, height: s }}></div>;

const SkelRow = () => (
  <div className="hs-row">
    <SkelCircle />
    <div className="hs-row-b">
      <SkelLine w="46%" />
      <SkelLine w="72%" h={9} />
    </div>
    <SkelLine w={60} h={20} style={{ borderRadius: 999, flexShrink: 0 }} />
  </div>);
const SkelList = ({ n = 4 }) => <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{[...Array(n)].map((_, i) => <SkelRow key={i} />)}</div>;

const SkelKpiCard = () => (
  <div className="hs-card hs-kpi">
    <SkelLine w="55%" h={9} />
    <SkelLine w="35%" h={22} />
    <SkelLine w="80%" h={9} />
  </div>);
const SkelKpiRow = ({ n = 3 }) => <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n},minmax(0,1fr))`, gap: 8 }}>{[...Array(n)].map((_, i) => <SkelKpiCard key={i} />)}</div>;

const SkelTable = ({ rows = 5, cols = 4 }) => (
  <div className="hs-card" style={{ padding: '0.5rem 1rem 0.875rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`, gap: '8px 14px' }}>
      {[...Array(rows * cols)].map((_, i) => <SkelLine key={i} w={i % cols === 0 ? '85%' : '55%'} style={{ margin: '9px 0' }} />)}
    </div>
  </div>);

/* ── VIDE : trois traitements, jamais le même vide ── */
const EmptyInitial = ({ icon = <HSI.Doc />, title, text, primaryLabel, onPrimary, secondaryLabel, onSecondary }) => (
  <div className="hs-empty">
    <div className="hs-empty-ico">{icon}</div>
    <div className="hs-empty-t">{title}</div>
    {text && <div className="hs-empty-s">{text}</div>}
    <div className="hs-empty-actions">
      {primaryLabel && <button className="btn-pri" style={{ background: '#15803D', color: '#fff' }} onClick={onPrimary}>{primaryLabel}</button>}
      {secondaryLabel && <button className="btn-out" onClick={onSecondary}>{secondaryLabel}</button>}
    </div>
  </div>);

const EmptyFilter = ({ title = 'Aucun résultat pour ces filtres', text, onReset }) => (
  <div className="hs-emptyfilter">
    <span className="hs-emptyfilter-ico"><HSI.Search /></span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="hs-emptyfilter-t">{title}</div>
      {text && <div className="hs-emptyfilter-s">{text}</div>}
    </div>
    {onReset && <button className="btn-out" style={{ fontSize: '0.6875rem', flexShrink: 0 }} onClick={onReset}>Élargir les filtres</button>}
  </div>);

const EmptyHealthy = ({ icon = <HSI.Trophy />, title, text }) => (
  <div className="hs-healthy">
    <span className="hs-healthy-ico">{icon}</span>
    <div>
      <div className="hs-healthy-t">{title}</div>
      {text && <div className="hs-healthy-s">{text}</div>}
    </div>
  </div>);

/* ── ERREUR : ce qui s'est passé, comment le réparer ── */
const ErrorLoad = ({ what, why, onRetry, retrying }) => (
  <div className="hs-err">
    <span className="hs-err-ico"><HSI.Warn /></span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="hs-err-t">Impossible de charger {what}</div>
      <div className="hs-err-s">{why}</div>
      <div className="hs-err-actions">
        <button className="btn-out" onClick={onRetry} disabled={retrying}><HSI.Retry />{retrying ? 'Nouvelle tentative…' : 'Réessayer'}</button>
      </div>
    </div>
  </div>);

const ErrorPartial = ({ available, missing, why }) => (
  <div className="hs-partial">
    <span className="hs-partial-ico"><HSI.Warn /></span>
    <div style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.55 }}>
      <b>{available}</b> affiché ci-dessous. <b>{missing}</b> indisponible — {why}
    </div>
  </div>);

const ErrorIntegration = ({ service, client, onReconnect }) => (
  <div className="hs-integ">
    <span className="hs-integ-ico"><HSI.Plug /></span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
        <span className="hs-integ-t" style={{ marginBottom: 0 }}>{service} n’est plus connecté{client ? ` — ${client}` : ''}</span>
        <span className="hs-integ-tag">Silencieux sinon</span>
      </div>
      <div className="hs-integ-s">Le jeton d’accès a expiré. Tant qu’il n’est pas reconnecté, les chiffres qui en dépendent restent figés à leur dernière valeur connue — sans le dire.</div>
      <div className="hs-err-actions"><a href="Parametres.html" className="btn-out" style={{ textDecoration: 'none', background: 'var(--bg-solid)' }} onClick={onReconnect}>Reconnecter {service}</a></div>
    </div>
  </div>);

const ErrorStale = ({ at, ageLabel, thresholdLabel, onRefresh, refreshing }) => (
  <div className="hs-stale">
    <span className="hs-stale-ico"><HSI.Clock /></span>
    <div style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', color: 'var(--fg2)' }}>
      <b>Données du {at}</b> — {ageLabel}, seuil de fraîcheur : {thresholdLabel}.
    </div>
    <button className="btn-out" style={{ fontSize: '0.6875rem', flexShrink: 0 }} onClick={onRefresh} disabled={refreshing}><HSI.Refresh />{refreshing ? 'Actualisation…' : 'Actualiser'}</button>
  </div>);

/* ── PERMISSION ── */
const PermissionBlocked = ({ action, allowedRoles = [], onAsk }) => (
  <div className="hs-perm">
    <div className="hs-perm-ico"><HSI.Lock /></div>
    <div className="hs-perm-t">Accès restreint</div>
    <div className="hs-perm-s">Votre rôle ne permet pas de {action}. Cette action est réservée à :</div>
    <div className="hs-perm-roles">{allowedRoles.map(r => <span key={r} className="hs-perm-role">{r}</span>)}</div>
    <button className="btn-out" onClick={onAsk}>Demander l’accès</button>
  </div>);

Object.assign(window, { HSI, SkelLine, SkelCircle, SkelRow, SkelList, SkelKpiCard, SkelKpiRow, SkelTable, EmptyInitial, EmptyFilter, EmptyHealthy, ErrorLoad, ErrorPartial, ErrorIntegration, ErrorStale, PermissionBlocked });
