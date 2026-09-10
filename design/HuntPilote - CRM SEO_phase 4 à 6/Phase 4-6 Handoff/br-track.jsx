/* HuntPilote — Brief d'article : colonne de suivi et clôture en preuve de valeur. */
const { useState: useBRT } = React;

/* ── SUIVI ── */
const TrackSide = ({ b, onAdvance, onPublish }) => {
  const { BI, BR_STAGES } = window;
  const idx = BR_STAGES.findIndex(([id]) => id === b.stage);
  const next = BR_STAGES[idx + 1];
  return (
    <div className="card br-sec" style={{ marginBottom: 0 }}>
      <div className="lbl" style={{ marginBottom: 10 }}>Suivi</div>
      <div className="br-steps">
        {BR_STAGES.map(([id, label, hint], i) => (
          <div key={id} className="br-step">
            <span className={`br-dot${i < idx ? ' done' : i === idx ? ' now' : ''}`}>{i < idx ? <BI.Check /> : i === idx ? '•' : ''}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: i === idx ? 800 : 600, color: i > idx ? 'var(--fg4)' : 'var(--fg1)' }}>{label}</div>
              {i === idx && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.45, marginTop: 2 }}>{hint}</div>}
            </div>
          </div>))}
      </div>
      <div style={{ marginTop: 4, paddingTop: 11, borderTop: '1px solid var(--bd)' }}>
        <div className="br-field" style={{ paddingTop: 0 }}><span className="br-field-l">Rédacteur</span><span className="br-field-v">{b.writer || <span style={{ color: 'var(--fg4)', fontStyle: 'italic' }}>Pas encore assigné</span>}</span></div>
        <div className="br-field"><span className="br-field-l">Relecture</span><span className="br-field-v">{b.track.reviewer}</span></div>
        <div className="br-field"><span className="br-field-l">Échéance</span><span className="br-field-v">{b.due}</span></div>
        <div className="br-field"><span className="br-field-l">Publication</span><span className="br-field-v">{b.track.pubAt || <span style={{ color: 'var(--fg4)', fontStyle: 'italic' }}>Non publié</span>}</span></div>
        <div className="br-field"><span className="br-field-l">Adresse en ligne</span><span className="br-field-v">{b.track.url
          ? <a href={`https://${b.track.url}`} target="_blank" rel="noopener" style={{ overflowWrap: 'anywhere' }}>{b.track.url}</a>
          : <span style={{ color: 'var(--fg4)', fontStyle: 'italic' }}>Disponible à la publication</span>}</span></div>
      </div>
      {next && (
        <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {next[0] === 'publie'
            ? <button className="btn-pri" style={{ background: '#15803D', color: '#fff', justifyContent: 'center' }} onClick={onPublish}><window.BI.Check />Marquer publié</button>
            : <button className="btn-out" style={{ justifyContent: 'center' }} onClick={() => onAdvance(next[0])}>Passer à « {next[1].toLowerCase()} »<window.BI.Arrow /></button>}
          <a href="Calendrier Editorial.html" className="btn-out" style={{ justifyContent: 'center', fontSize: '0.6875rem', textDecoration: 'none' }}>Revenir au calendrier</a>
        </div>)}
      {!next && <div style={{ marginTop: 11 }}><a href="Editeur Rapport.html" className="btn-out" style={{ justifyContent: 'center', width: '100%', textDecoration: 'none' }}><window.BI.Trophy />Voir au rapport du mois</a></div>}
    </div>);
};

/* ── PERFORMANCE UNE FOIS MESURÉE ── */
const PerfSide = ({ b }) => {
  if (!b.perf) return null;
  const { BI } = window;
  return (
    <div className="card br-sec" style={{ marginBottom: 0 }}>
      <div className="lbl" style={{ marginBottom: 9 }}>Performance mesurée</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--green-fg)', fontVariantNumeric: 'tabular-nums' }}>{b.perf.visits}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>visites par mois depuis Google</span>
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55 }}>
        Position <b>{b.perf.pos}</b> sur « {b.kw.term} » · seuil utile : première page, soit position 10.
        {b.perf.top10 > 0 && <React.Fragment> {b.perf.top10} requêtes secondaires sont aussi en première page.</React.Fragment>}
      </div>
      <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Mesuré {window.ED_MEASURE_DAYS} jours après publication — avant ce délai, un chiffre n’est pas interprétable.</div>
    </div>);
};

/* ── CLÔTURE EN PREUVE DE VALEUR ── */
const ProofClose = ({ b, onDone, onSkip }) => {
  const [text, setText] = useBRT(b.proofDraft);
  const { BI } = window;
  return (
    <div className="br-proof">
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9 }}>
        <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><BI.Trophy /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 3 }}>Article publié — en faire une preuve de valeur ?</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55 }}>Un article publié ne compte pour le client que s’il est raconté dans son rapport. Voici le libellé proposé par l’agent — relisez-le : c’est ce texte que le client lira, pas le titre de l’article.</div>
        </div>
      </div>
      <label className="lbl" htmlFor="br-proof-t" style={{ display: 'block', marginBottom: 5 }}>Libellé client</label>
      <textarea id="br-proof-t" className="br-ta" rows="3" value={text} onChange={e => setText(e.target.value)}></textarea>
      <div className="br-ai" style={{ marginTop: 9 }}>
        <span><BI.Sparkle /></span>
        <div style={{ flex: 1, minWidth: 0 }}>Rédigé par l’agent à partir du brief. <b>La performance n’y figure pas</b> : elle sera ajoutée au rapport du mois suivant, quand les {window.ED_MEASURE_DAYS} jours de mesure seront écoulés.</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 11, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button className="btn-out" onClick={onSkip}>Pas de preuve pour cet article</button>
        <button className="btn-pri" style={{ background: '#15803D', color: '#fff' }} disabled={!text.trim()} onClick={() => onDone(text.trim())}><BI.Check />Créer la preuve de valeur</button>
      </div>
    </div>);
};

Object.assign(window, { TrackSide, PerfSide, ProofClose });
