/* HuntPilote — Domain Overview : blocs de l'outil. Dashboard dense, un coup d'œil. */
const AI9 = window.AIco, AP9 = window.APill, AS9 = window.ASec, DI9 = window.DOI;

const spark = (pts, W = 260, H = 44) => {
  const max = Math.max(...pts), min = Math.min(...pts);
  const x = i => (i / (pts.length - 1)) * W, y = v => H - ((v - min) / Math.max(max - min, 1)) * H;
  return pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ');
};

/* ── TRAFIC ORGANIQUE ── */
const TrafficCard = ({ traffic, prev, history, chute }) => {
  const delta = Math.round((traffic - prev) / prev * 100);
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DI9.Traf />Trafic organique estimé</div>
      <div className="do-big">
        <span className="do-num">{traffic.toLocaleString('fr-CA')}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>visites/mois</span>
        <span className="delta" style={{ color: chute ? 'var(--red)' : delta >= 0 ? 'var(--green-fg)' : 'var(--red)' }}>{delta >= 0 && !chute ? <DI9.Up /> : <DI9.Down />}<span>{chute ? '−65 %' : `${delta >= 0 ? '+' : ''}${delta} %`}</span></span>
      </div>
      <svg className="spark" viewBox="0 0 260 44" preserveAspectRatio="none"><path d={spark(history)} fill="none" stroke={chute ? 'var(--red)' : 'var(--green-fg)'} strokeWidth="2" /></svg>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{chute ? `Décrochage daté du ${window.CHUTE_DATE}` : 'Sur 12 mois · seuil de qualification : ≥ 500 visites/mois'}</div>
    </div>);
};

/* ── MOTS-CLÉS POSITIONNÉS ── */
const KeywordsCard = ({ n, buckets }) => {
  const total = n || 1;
  const rows = [['top3', 'Top 3', 'var(--green)'], ['top10', 'Top 4–10', 'var(--green-b)'], ['top30', 'Top 11–30', 'var(--yellow-b)'], ['hors', 'Au-delà', 'var(--bd-strong)']];
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DI9.Kw />Mots-clés positionnés</div>
      <div className="do-big"><span className="do-num">{n}</span><span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>requêtes suivies chez le fournisseur</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rows.map(([id, label, col]) => (
          <div className="bkt-row" key={id}><span style={{ width: '5.5rem', color: 'var(--fg2)' }}>{label}</span><span className="bkt-bar"><span style={{ width: `${buckets[id] / total * 100}%`, background: col }}></span></span><span style={{ width: '2rem', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{buckets[id]}</span></div>))}
      </div>
    </div>);
};

/* ── AUTORITÉ ── */
const AuthorityCard = ({ authority, refDomains }) => (
  <div className="card do-card">
    <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DI9.Auth />Autorité du domaine</div>
    <div style={{ display: 'flex', gap: 18 }}>
      <div><div className="do-num" style={{ fontSize: '1.75rem' }}>{authority}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>/ 100 · autorité</div></div>
      <div><div className="do-num" style={{ fontSize: '1.75rem' }}>{refDomains}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>domaines référents</div></div>
    </div>
    <div className="track"><div className="fill" style={{ width: `${authority}%`, background: authority >= 40 ? 'var(--green)' : authority >= 20 ? 'var(--yellow-b)' : 'var(--red)' }}></div></div>
    <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Repère agence : autorité ≥ 40 = profil déjà solide</div>
  </div>);

/* ── TOP 5 PAGES / REQUÊTES ── */
const TopPagesCard = ({ rows }) => (
  <div className="card do-card">
    <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DI9.Page />Top 5 des pages</div>
    {rows.map(r => <div className="top-row" key={r.url}><span className="u" title={r.url}>{r.url}</span><span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.vol}</span><span style={{ color: 'var(--fg3)' }}>visites/mois</span></div>)}
  </div>);
const TopQueriesCard = ({ rows }) => (
  <div className="card do-card">
    <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DI9.Kw />Top 5 des requêtes</div>
    {rows.map(r => (
      <div className="top-row" key={r.q}>
        <span className="u" style={{ fontFamily: 'var(--font)', fontSize: '0.6875rem', fontWeight: 600 }} title={r.q}>{r.q}</span>
        <AP9 label={`Pos. ${r.pos}`} tone={r.pos <= 10 ? 'green' : 'yellow'} sm />
        <span style={{ color: 'var(--fg3)' }}>{r.vol}/mois</span>
      </div>))}
  </div>);

/* ── RÉPARTITION GÉOGRAPHIQUE ── */
const GeoCard = ({ rows }) => (
  <div className="card do-card">
    <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}><DI9.Map />Répartition géographique du trafic</div>
    {rows.map(r => <div className="geo-row" key={r.region}><span>{r.region}</span><span className="geo-bar"><span style={{ width: `${r.pct}%` }}></span></span><span style={{ fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.pct} %</span></div>)}
  </div>);

/* ── CONSERVATION — instantané, spécialement pour un prospect ── */
const DoKeepCard = ({ prospect }) => (
  <AS9 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?" accent="var(--yellow-b)">
    <div style={{ marginBottom: 9 }}><AP9 label={prospect ? 'Instantané prospect · purgé si le deal est perdu' : 'Éphémère · purgé après 30 jours'} tone="yellow" icon={<AI9.Clock />} /></div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>{prospect ? 'Cette vue sert à qualifier un prospect. Si l’opportunité est perdue, l’instantané disparaît avec la fiche.' : 'Cette exploration n’est jamais historisée. Créez un prospect ou enregistrez dans la fiche pour en garder une trace.'}</div>
  </AS9>);

Object.assign(window, { TrafficCard, KeywordsCard, AuthorityCard, TopPagesCard, TopQueriesCard, GeoCard, DoKeepCard });
