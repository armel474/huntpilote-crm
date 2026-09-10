/* HuntPilote — SEO local · Positions locales : panneaux (carte de zone, tableau de requêtes, lecture par secteur). */
const { AIco: ZAI, APill: ZAP, ASec: ZAS, ALbl: ZAL, LOI: ZLOI } = window;

const posTone = pos => pos == null ? ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg4)', 'absent'] : pos <= 3 ? ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)', 'fort'] : pos <= 7 ? ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)', 'moyen'] : ['var(--red-m)', 'var(--red-b)', 'var(--red)', 'faible'];

/* ── ZONE NON CONFIGURÉE ── */
const ZoneNotConfiguredCard = ({ estId }) => (
  <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
    <div className="empty" style={{ border: 'none', padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--yellow-fg)', marginBottom: 8 }}><ZLOI.Layers /></div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 6 }}>Zone desservie jamais configurée</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.6, maxWidth: '28rem', margin: '0 auto' }}>Sans zone, impossible de savoir où mesurer le pack local. Configurez-la depuis la fiche de l’établissement — l’écran des positions s’activera dès qu’un mode sera choisi.</div>
      <a href={`Fiche Etablissement.html?id=${estId}#zone-editor`} className="btn-pri" style={{ textDecoration: 'none', marginTop: 14, display: 'inline-flex' }}><ZAI.Plus />Configurer la zone desservie</a>
    </div>
  </div>);

/* ── CARTE DE LA ZONE — grille de points ── */
const ZoneMapGrid = ({ data }) => (
  <div style={{ display: 'inline-grid', gap: 5, gridTemplateColumns: `repeat(${data.cols},1fr)` }}>
    {data.grid.flat().map((pos, i) => { const [bg, bd, fg, lab] = posTone(pos); return (
      <div key={i} title={pos == null ? 'Absent du pack local' : `Position ${pos}`} style={{ width: 40, height: 40, borderRadius: 9, background: bg, border: `1.5px solid ${bd}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: fg }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>{pos == null ? '—' : pos}</span>
      </div>); })}
  </div>);

/* ── CARTE DE LA ZONE — secteurs ── */
const ZoneMapSecteurs = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {data.secteurs.map(s => { const [bg, bd, fg, lab] = posTone(s.pos); return (
      <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ flex: '0 0 9rem', fontSize: '0.75rem', fontWeight: 600 }}>{s.nom}</span>
        <div style={{ flex: 1, height: 20, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${Math.max(8, 100 - (s.pos - 1) * 12)}%`, background: bg, border: `1px solid ${bd}` }}></div>
        </div>
        <span style={{ flex: '0 0 3rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: fg }}>{s.pos}</span>
      </div>); })}
  </div>);

const ZoneMapCard = ({ data, estId }) => (
  <div className="card" style={{ padding: '1rem 1.125rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>Carte de la zone — position du pack local</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.5 }}>Chaque point porte la position relevée à cet endroit — en couleur et en chiffre. {window.POS_THRESHOLD}</div>
      </div>
      <a href={`Fiche Etablissement.html?id=${estId}#zone-editor`} className="btn-out" style={{ textDecoration: 'none', fontSize: '0.625rem' }}><ZLOI.Layers />Modifier la zone</a>
    </div>
    {data.mode === 'grille' ? <ZoneMapGrid data={data} /> : <ZoneMapSecteurs data={data} />}
    <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: '0.5625rem', color: 'var(--fg3)', flexWrap: 'wrap' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--green-m)', border: '1px solid var(--green-b)' }}></span>1 à 3 · dans le pack</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)' }}></span>4 à 7</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--red-m)', border: '1px solid var(--red-b)' }}></span>8 et plus</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)' }}></span>absent du pack</span>
    </div>
  </div>);

/* ── TABLEAU REQUÊTE PAR REQUÊTE ── */
const KeywordTable = ({ keywords }) => (
  <ZAS title="Positions par requête" sub={`${keywords.length} requêtes suivies sur la zone · ${window.POS_THRESHOLD}`}>
    <div className="hp-table hp-cols-5" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr', gap: '0 10px', alignItems: 'center' }}>
      {['Requête', 'Moyenne sur la zone', 'Meilleure', 'Pire', 'Évolution'].map(h => <div key={h} className="lbl" style={{ padding: '8px 0', borderBottom: '1px solid var(--bd-solid)' }}>{h}</div>)}
      {keywords.map(k => { const delta = k.prevMoy - k.posMoy; const [, , fg] = posTone(k.posMoy); return (
        <React.Fragment key={k.q}>
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.75rem', fontWeight: 700 }}>{k.q}</div>
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.8125rem', fontWeight: 800, color: fg, fontVariantNumeric: 'tabular-nums' }}>{k.posMoy.toLocaleString('fr-CA', { minimumFractionDigits: 1 })}</div>
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{k.posMin}</div>
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{k.posMax}</div>
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.75rem', fontWeight: 700, color: delta > 0 ? 'var(--green-fg)' : delta < 0 ? 'var(--red)' : 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>{delta !== 0 && (delta > 0 ? <ZAI.Up /> : <ZAI.Down />)}{delta === 0 ? 'Stable' : `${Math.abs(delta).toFixed(1)} pts`}</div>
        </React.Fragment>); })}
    </div>
  </ZAS>);

/* ── LECTURE PAR ZONE ── */
const ZoneReadCard = ({ read }) => (
  <ZAS title="Lecture par zone" sub="Ce qui oriente le travail — et ce qui parle au client">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div>
        <ZAL mb={6}>Secteurs forts</ZAL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{read.forts.map(s => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}><span style={{ color: 'var(--green-fg)', display: 'flex' }}><ZAI.Check /></span>{s}</div>)}</div>
      </div>
      <div>
        <ZAL mb={6}>Secteurs faibles ou absents</ZAL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{read.faibles.map(s => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}><span style={{ color: 'var(--red)', display: 'flex' }}><ZAI.Warn /></span>{s}</div>)}</div>
      </div>
    </div>
  </ZAS>);

Object.assign(window, { posTone, ZoneNotConfiguredCard, ZoneMapCard, KeywordTable, ZoneReadCard });
