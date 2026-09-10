/* HuntPilote — corps du rapport client publié (session 1.3).
   Conçu une fois, réutilisé tel quel par la page publique et par le portail client. */
const ReportDoc = ({ R, first, theme, proofs, Delta, RIco, prevLabel = 'août', nextLabel = 'octobre', afterNextLabel = 'novembre' }) => (
  <div className="doc">
    {/* En-tête */}
    <div className="doc-head">
      <div className="brand">
        <span className="brand-mark"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#18181B' : '#fff'} strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></span>
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>HuntPilote</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--fg3)' }}>Publié le {R.publish}</span>
      </div>
      <div className="eyebrow">Votre rapport mensuel</div>
      <h1>{R.period} — ce qui a changé sur votre site</h1>
      <p style={{ marginTop: 12, fontSize: '0.9375rem' }}>Préparé pour <b style={{ color: 'var(--fg1)' }}>{R.client}</b> par {R.pm}, votre responsable de compte.</p>
    </div>

    {/* 1 — Où on en est */}
    <div className="sect">
      <div className="sect-head"><span className="step">1</span><h2>Où on en est</h2></div>
      <p className="lead" style={{ marginBottom: 18 }}>{first ? 'Voici le premier état des lieux de votre site. Il servira de point de comparaison pour les mois suivants.' : R.objective.sentence}</p>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--green-d)' }}>{R.score.now}</span>
          <span style={{ fontSize: '1rem', color: 'var(--fg3)', fontWeight: 600 }}>/ 100</span>
        </div>
        <div style={{ minWidth: 0, flex: '1 1 14rem' }}>
          <h3 style={{ marginBottom: 3 }}>Santé générale de votre site</h3>
          <p style={{ fontSize: '0.9375rem', margin: 0 }}>{first ? 'Note de départ, calculée sur votre présence en ligne, votre référencement et votre design.' : `En hausse de ${R.score.now - R.score.prev} points depuis ${prevLabel}. Cette note combine votre présence en ligne, votre référencement et votre design.`}</p>
        </div>
      </div>
      {!first && (
        <div style={{ padding: '1.125rem 1.25rem', borderRadius: 12, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)' }}>
          <h3 style={{ marginBottom: 8 }}>Votre objectif : {R.objective.label}</h3>
          <div className="track" style={{ marginBottom: 7 }}><div className="fill" style={{ width: `${R.objective.pct}%` }}></div></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--fg2)', fontWeight: 600 }}><span>{R.objective.pct} % atteint</span><span style={{ color: 'var(--green-fg)' }}>+{R.objective.pct - R.objective.prevPct} points ce mois</span></div>
        </div>)}
    </div>

    {/* 2 — Ce qui a bougé */}
    <div className="sect">
      <div className="sect-head"><span className="step">2</span><h2>Ce qui a bougé</h2></div>
      <p style={{ marginBottom: 16 }}>{first ? 'Ce sont vos chiffres de départ. Le mois prochain, vous verrez l’évolution.' : `Comparé au mois de ${prevLabel}.`}</p>
      <div>
        {R.kpis.map(k => (
          <div className="kpi" key={k.label}>
            <div className="kpi-val" style={{ color: 'var(--fg1)' }}>{k.value}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 3 }}>
                <h3>{k.label}</h3>
                {first ? <span className="tag" style={{ background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', color: 'var(--fg3)' }}>Point de départ</span> : <Delta d={k.delta} up={k.up} />}
              </div>
              <p style={{ fontSize: '0.9375rem', margin: 0 }}>{k.sentence}{!first && <span style={{ color: 'var(--fg3)' }}> ({prevLabel} : {k.prev})</span>}</p>
            </div>
          </div>))}
      </div>
    </div>

    {/* 3 — Ce qu'on a fait */}
    <div className="sect">
      <div className="sect-head"><span className="step">3</span><h2>Ce qu’on a fait</h2></div>
      {proofs.length === 0
        ? <p>{first ? 'Le travail commence ce mois-ci : les premiers résultats apparaîtront dans le rapport du mois prochain.' : 'Aucun chantier n’a été terminé ce mois-ci. Deux chantiers demandent plus d’un mois de travail, et nous avons préféré les finir proprement plutôt que d’annoncer des résultats partiels — ils sont détaillés juste en dessous.'}</p>
        : <React.Fragment>
            <p style={{ marginBottom: 16 }}>{proofs.length} chantiers terminés et vérifiés ce mois-ci.</p>
            {proofs.map(p => (
              <div className="proof" key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><RIco.Check /></span>
                  <h3 style={{ color: 'var(--fg1)' }}>{p.title}</h3>
                </div>
                {p.before && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 7 }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--fg3)', textDecoration: 'line-through' }}>{p.before}</span>
                    <span style={{ color: 'var(--fg3)', display: 'flex' }}><RIco.Arrow /></span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-fg)', letterSpacing: '-0.03em' }}>{p.after}</span>
                  </div>)}
                <p style={{ fontSize: '0.9375rem', margin: 0 }}>{p.text}</p>
              </div>))}
          </React.Fragment>}
    </div>

    {/* 4 — Ce sur quoi on travaille */}
    <div className="sect">
      <div className="sect-head"><span className="step">4</span><h2>Ce sur quoi on travaille</h2></div>
      <p style={{ marginBottom: 16 }}>Les points connus, et où nous en sommes.</p>
      {R.priorities.map(p => (
        <div className="workitem" key={p.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7, flexWrap: 'wrap' }}>
            <h3>{p.title}</h3>
            <span className="tag" style={p.state === 'traitement' ? { background: 'var(--blue-m)', border: '1px solid var(--blue-b)', color: 'var(--blue-fg)' } : { background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)', color: 'var(--yellow-fg)' }}>{p.state === 'traitement' ? 'En cours de correction' : 'Repéré, pas encore planifié'}</span>
          </div>
          <p style={{ fontSize: '0.9375rem', marginBottom: p.doing ? 12 : 0 }}>{p.text}</p>
          {p.doing && (
            <div>
              <div className="track" style={{ marginBottom: 6 }}><div className="fill" style={{ width: `${p.pct}%`, background: 'var(--blue-fg)' }}></div></div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--fg2)' }}><b>{p.pct} % fait</b> — {p.doing}</div>
            </div>)}
        </div>))}
    </div>

    {/* 5 — La suite */}
    <div className="sect">
      <div className="sect-head"><span className="step">5</span><h2>La suite</h2></div>
      <p style={{ marginBottom: 16 }}>Ce qui est prévu en {nextLabel}.</p>
      {R.next.map(([t, d]) => (
        <div className="nextitem" key={t}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 8 }}></span>
          <div style={{ minWidth: 0 }}><h3 style={{ marginBottom: 2 }}>{t}</h3><p style={{ fontSize: '0.9375rem', margin: 0 }}>{d}</p></div>
        </div>))}
    </div>

    {/* Pied */}
    <div className="foot">
      <h3 style={{ marginBottom: 6 }}>Une question sur ce rapport ?</h3>
      <p style={{ fontSize: '0.9375rem', marginBottom: 14 }}>Écrivez à {R.pm} — elle répond en général dans la journée.</p>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <a href="mailto:marie@huntpilote.ca" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.1rem', borderRadius: 999, background: '#15803D', color: '#fff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}><RIco.Send />Écrire à {R.pm}</a>
        <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.1rem', borderRadius: 999, background: 'transparent', border: '1px solid var(--bd-strong)', color: 'var(--fg2)', fontFamily: 'var(--font)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}><RIco.Doc />Enregistrer en PDF</button>
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bd)', fontSize: '0.75rem', color: 'var(--fg3)' }}>Rapport {R.period} · version {first ? 'v1' : R.versions[0].v} · publié le {R.publish}. Ce document ne change plus ; le prochain rapport arrivera début {afterNextLabel}.</div>
    </div>
  </div>
);

Object.assign(window, { ReportDoc });
