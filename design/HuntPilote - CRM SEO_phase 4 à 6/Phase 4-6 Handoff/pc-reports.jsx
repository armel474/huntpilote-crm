/* HuntPilote — portail client : courbe du score sur douze mois et lignes de l'historique des rapports. */
const { useState: usePR } = React;

/* ── TRAJECTOIRE DU SCORE ── */
const ScoreCurve = ({ months }) => {
  const T = window.PR_TARGET;
  if (months.length < 2) return null;
  const W = 620, H = 150, PADX = 8, PADY = 16;
  const vals = months.map(m => m.score);
  const lo = Math.min(...vals, T) - 8, hi = Math.max(...vals, T) + 6;
  const x = i => PADX + i * ((W - PADX * 2) / (months.length - 1));
  const y = v => PADY + (1 - (v - lo) / (hi - lo)) * (H - PADY * 2);
  const line = months.map((m, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(m.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(months.length - 1).toFixed(1)},${H - PADY} L${x(0).toFixed(1)},${H - PADY} Z`;
  const last = months[months.length - 1], firstM = months[0];
  const gain = last.score - firstM.score;
  const overIdx = months.findIndex(m => m.score >= T);
  return (
    <div className="pr-curve-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ flex: '1 1 14rem', minWidth: 0 }}>
          <h2 style={{ marginBottom: 4 }}>Votre trajectoire sur {months.length} mois</h2>
          <p style={{ fontSize: '0.9375rem', margin: 0 }}>La santé de votre site est passée de <b style={{ color: 'var(--fg1)' }}>{firstM.score}</b> en {firstM.short} {firstM.label.slice(-4)} à <b style={{ color: 'var(--fg1)' }}>{last.score}</b> en {last.short} {last.label.slice(-4)}, soit <b style={{ color: 'var(--green-fg)' }}>{gain > 0 ? `+${gain}` : gain} points</b>. L’objectif inscrit à votre mandat est de {T}{overIdx >= 0 ? `, dépassé depuis ${months[overIdx].short} ${months[overIdx].label.slice(-4)}` : ' — pas encore atteint'}.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--green-d)' }}>{last.score}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', fontWeight: 600 }}>sur 100 · objectif {T}</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="pr-svg" role="img"
        aria-label={`Score de santé de ${firstM.score} en ${firstM.label} à ${last.score} en ${last.label}, objectif ${T}`}>
        <defs><linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity="0.22" /><stop offset="100%" stopColor="var(--green)" stopOpacity="0" /></linearGradient></defs>
        <line x1={PADX} y1={y(T)} x2={W - PADX} y2={y(T)} stroke="var(--bd-strong)" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={W - PADX} y={y(T) - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--fg3)">Objectif {T}</text>
        <path d={area} fill="url(#prGrad)" />
        <path d={line} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {months.map((m, i) => (
          <g key={m.id}>
            <circle cx={x(i)} cy={y(m.score)} r={i === months.length - 1 ? 5 : 3.2} fill="var(--bg-solid)" stroke="var(--green)" strokeWidth={i === months.length - 1 ? 3 : 2} />
            <text x={x(i)} y={H - 3} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fg4)">{m.short}</text>
          </g>))}
      </svg>
      <div className="pr-legend">
        <span><span className="pr-key line"></span>Score de santé, mois par mois</span>
        <span><span className="pr-key dash"></span>Objectif du mandat : {T} / 100</span>
      </div>
    </div>);
};

/* ── UNE PÉRIODE ── */
const ReportRow = ({ m, prev, onDownload }) => {
  const [open, setOpen] = usePR(false);
  const delta = prev ? m.score - prev.score : null;
  const corrected = m.v > 1;
  return (
    <div className={`pr-row${corrected ? ' corrected' : ''}`}>
      <div className="pr-score">
        <span className="pr-score-v">{m.score}</span>
        {delta === null
          ? <span className="pr-tag neutral">Point de départ</span>
          : <span className={`pr-tag ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? '▲' : '▼'} {delta >= 0 ? `+${delta}` : delta}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3>{m.label}</h3>
          {corrected && <span className="pr-tag ver">Corrigé — version {m.v}</span>}
        </div>
        <p style={{ fontSize: '0.875rem', margin: '3px 0 0' }}>
          Données au {m.dataAt}, publié le {m.publish}. {m.proofs > 0 ? `${m.proofs} chantier${m.proofs > 1 ? 's' : ''} terminé${m.proofs > 1 ? 's' : ''} ce mois-là.` : 'Aucun chantier terminé ce mois-là — le travail en cours était détaillé dans le rapport.'}
        </p>
        {corrected && (
          <React.Fragment>
            <button className="pr-vtoggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>{open ? 'Masquer' : 'Voir'} les {m.versions.length} versions de cette période</button>
            {open && (
              <ul className="pr-versions">
                {m.versions.map(v => (
                  <li key={v.v}>
                    <span className={`pr-vdot${v.current ? ' cur' : ''}`}>v{v.v}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Version {v.v}{v.current ? ' — celle que vous lisez' : ' — remplacée'}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)', lineHeight: 1.5 }}>{v.at} · {v.note}</div>
                    </div>
                    <a href="Rapport Client.html" className="pc-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', flexShrink: 0 }}>Ouvrir</a>
                  </li>))}
              </ul>)}
          </React.Fragment>)}
      </div>
      <div className="pr-actions">
        <a href="Rapport Client.html" className="pc-btn solid" style={{ padding: '0.5rem 0.95rem', fontSize: '0.875rem' }}>Ouvrir<window.PNI.Arrow /></a>
        <button className="pc-btn" style={{ padding: '0.5rem 0.95rem', fontSize: '0.875rem' }} onClick={() => onDownload(m)}><window.PNI.Doc />PDF</button>
      </div>
    </div>);
};

const PrEmpty = () => (
  <div className="pc-wait-card">
    <div className="pc-sent warn" style={{ marginBottom: '1.25rem' }}><window.PNI.Doc /></div>
    <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Aucun rapport publié pour l’instant</h1>
    <p className="lead">Votre premier rapport sera publié le 2 octobre, et rejoindra cette page. Ensuite, un rapport par mois s’y ajoutera — vous pourrez les rouvrir ou les télécharger à tout moment.</p>
    <div className="pc-frozen-in" style={{ marginTop: '1.25rem' }}>
      <span><window.PNI.Lock /></span>
      <div>Un rapport publié <b>ne change plus</b>. Chacun reste consultable dans la version envoyée ce mois-là.</div>
    </div>
  </div>);

const PrSingle = () => (
  <div className="pc-frozen-in" style={{ marginBottom: '1.25rem' }}>
    <span><window.PNI.Clock /></span>
    <div><b>Un seul rapport pour l’instant.</b> La trajectoire de votre score apparaîtra ici dès le deuxième — il faut deux points pour tracer une progression.</div>
  </div>);

Object.assign(window, { ScoreCurve, ReportRow, PrEmpty, PrSingle });
