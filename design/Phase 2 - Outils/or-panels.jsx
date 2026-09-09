/* HuntPilote — Organic Research : blocs de l'outil. Exploration approfondie, potentiel chiffré. */
const { useState: uOR } = React;
const AI10 = window.AIco, AP10 = window.APill, AS10 = window.ASec, OI10 = window.ORI;

const path = (pts, W, H, invert) => {
  const max = Math.max(...pts), min = Math.min(...pts);
  const x = i => (i / (pts.length - 1)) * W;
  const y = v => invert ? ((v - min) / Math.max(max - min, 1)) * H : H - ((v - min) / Math.max(max - min, 1)) * H;
  return pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ');
};

/* ── ÉVOLUTION TRAFIC + POSITIONS, avec décrochage daté ── */
const EvolutionCard = ({ traffic, pos, drop, months }) => {
  const W = 640, H = 130;
  const dropX = drop ? (drop.month / (traffic.length - 1)) * W : null;
  return (
    <AS10 title="Évolution du trafic et des positions" sub={`${months} mois · une chute datée est un argument de vente, pas une erreur`}>
      <svg className="or-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Évolution du trafic organique et de la position moyenne">
        {dropX !== null && <line x1={dropX} y1="0" x2={dropX} y2={H} stroke="var(--red)" strokeWidth="1.5" strokeDasharray="4 3" />}
        <path d={path(traffic, W, H, false)} fill="none" stroke="var(--green-fg)" strokeWidth="2.2" strokeLinecap="round" />
        <path d={path(pos, W, H, true)} fill="none" stroke="var(--blue-fg)" strokeWidth="1.8" strokeDasharray="1 0" strokeLinecap="round" opacity="0.75" />
      </svg>
      <div className="or-legend">
        <span><span className="or-dot" style={{ background: 'var(--green-fg)' }}></span>Trafic organique estimé</span>
        <span><span className="or-dot" style={{ background: 'var(--blue-fg)' }}></span>Position moyenne (inversée · haut = meilleur)</span>
        {drop && <span style={{ color: 'var(--red)' }}><span className="or-dot" style={{ background: 'var(--red)' }}></span>Décrochage du {drop.date}</span>}
      </div>
      {drop && (
        <div className="note-box" style={{ background: 'var(--red-m)', borderColor: 'var(--red-b)' }}>
          <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0, marginTop: 1 }}><AI10.Warn /></span>
          <div style={{ flex: 1, minWidth: 0 }}><b>{drop.label}, daté du {drop.date}.</b> Le trafic n’est jamais revenu au niveau d’avant. C’est l’argument d’ouverture d’une proposition commerciale : le problème est identifié et daté.</div>
        </div>)}
    </AS10>);
};

/* ── REQUÊTES POSITIONNÉES, FILTRABLES ── */
const QueriesTable = ({ rows, q, onQ }) => (
  <div className="card" style={{ padding: '0.875rem 1rem' }}>
    <div className="res-bar" style={{ marginBottom: 8 }}>
      <span className="lbl" style={{ marginBottom: 0 }}>Requêtes positionnées</span>
      <input className="inp" value={q} onChange={e => onQ(e.target.value)} placeholder="Filtrer les requêtes…" aria-label="Filtrer les requêtes" style={{ width: '12rem', marginLeft: 'auto' }} />
    </div>
    <div className="or-q-table">
      <div className="or-q-head"><span className="lbl" style={{ marginBottom: 0 }}>Requête</span><span className="lbl" style={{ marginBottom: 0 }}>Volume</span><span className="lbl" style={{ marginBottom: 0 }}>Position<span style={{ display: 'block', fontSize: '0.5rem' }}>seuil ≤ 10</span></span><span className="lbl" style={{ marginBottom: 0 }}>Page positionnée</span></div>
      {rows.length === 0 && <div className="empty" style={{ marginTop: 6 }}><span style={{ fontSize: '0.6875rem' }}>Aucune requête pour ce filtre</span></div>}
      {rows.map(r => (
        <div className="or-q-row" key={r.c}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.c}</span>
          <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', color: 'var(--fg2)' }}>{r.vol.toLocaleString('fr-CA')}</span>
          <AP10 label={`Pos. ${r.pos}`} tone={r.pos <= 10 ? 'green' : r.pos <= 30 ? 'yellow' : 'red'} sm />
          <span className="or-q-url" title={r.page}>{r.page}</span>
        </div>))}
    </div>
  </div>);

/* ── PAGES QUI PERFORMENT / QUI RECULENT ── */
const PagesCard = ({ up, down }) => (
  <AS10 title="Pages qui performent et pages qui reculent" sub="Sur la période affichée">
    <div className="mov-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div>
        <div className="mov-col-head" style={{ color: 'var(--green-fg)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.625rem', fontWeight: 700, marginBottom: 6 }}><OI10.Up />Progressent</div>
        {up.map(p => <div className="page-row" key={p.url}><span className="page-u" title={p.url}>{p.url}</span><span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--green-fg)' }}>+{p.delta} %</span></div>)}
      </div>
      <div>
        <div className="mov-col-head" style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.625rem', fontWeight: 700, marginBottom: 6 }}><OI10.Down />Reculent</div>
        {down.map(p => <div className="page-row" key={p.url}><span className="page-u" title={p.url}>{p.url}</span><span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--red)' }}>{p.delta} %</span></div>)}
      </div>
    </div>
  </AS10>);

/* ── POTENTIEL ESTIMÉ — le chiffre qui va dans la proposition ── */
const PotentialCard = ({ rows, mult }) => {
  const gain = Math.round(rows.reduce((s, r) => s + r.vol * 0.06 * (mult - 1), 0));
  return (
    <div className="pot-card">
      <div className="lbl" style={{ marginBottom: 4, color: 'var(--green-fg)' }}>Potentiel estimé</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span className="pot-num">+{gain.toLocaleString('fr-CA')}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--fg2)', fontWeight: 600 }}>visites/mois estimées</span>
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 6 }}>Si les {rows.length} requêtes actuellement en position 4 à 10 passaient en top 3 (courbe de clics approximative × {mult}). C’est le chiffre à mettre dans la proposition commerciale.</div>
    </div>);
};

/* ── CONSERVATION — instantané, spécialement pour un prospect ── */
const OrKeepCard = ({ prospect }) => (
  <AS10 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?" accent="var(--yellow-b)">
    <div style={{ marginBottom: 9 }}><AP10 label={prospect ? 'Instantané prospect · purgé si le deal est perdu' : 'Éphémère · purgé après 30 jours'} tone="yellow" icon={<AI10.Clock />} /></div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>Cette exploration n’est jamais historisée. <b>Générer un audit de prospect</b> produit un document séparé, partageable, qui lui reste accessible.</div>
  </AS10>);

Object.assign(window, { EvolutionCard, QueriesTable, PagesCard, PotentialCard, OrKeepCard });
