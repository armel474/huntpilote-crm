/* HuntPilote — SEO local · Concurrence locale : panneaux (concurrents rencontrés, recoupement, écarts actionnables). */
const { AIco: XAI, APill: XAP, ASec: XAS, ALbl: XAL } = window;

const CompetitorRow = ({ c, rank, onCreatePrio, created }) => (
  <div className="card" style={{ padding: '0.875rem 1rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 9 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--fg3)', flexShrink: 0 }}>{rank}</div>
      <div style={{ flex: 1, minWidth: '10rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>{c.name}</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>{c.categories.map(cat => <span key={cat} style={{ fontSize: '0.5625rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--bg-muted)', color: 'var(--fg3)', border: '1px solid var(--bd-solid)' }}>{cat}</span>)}</div>
      </div>
      <XAP label={`Rencontré ${c.freq}/${c.freqTotal} points`} tone="blue" sm />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, marginBottom: 10 }}>
      {[['Note moyenne', `${c.note}/5`], ['Avis', c.nbAvis], ['Complétude apparente', `${c.completude} %`]].map(([l, v]) => (
        <div key={l} style={{ background: 'var(--bg-muted)', borderRadius: 9, padding: '0.5rem 0.65rem' }}><div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginBottom: 2 }}>{l}</div><div style={{ fontSize: '0.9375rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{v}</div></div>))}
    </div>
    <div style={{ marginBottom: 10 }}>
      <XAL mb={5}>Recoupement</XAL>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.6 }}>Vous devance sur <b>{c.recoupement.requetes.join(', ')}</b> — dans les secteurs <b>{c.recoupement.secteurs.join(', ')}</b>.</div>
    </div>
    <div>
      <XAL mb={5}>Écart actionnable</XAL>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {c.ecarts.map((e, i) => {
          const key = c.name + i; const done = created[key]; const neutral = e.action.startsWith('Aucune');
          return (
            <div key={key} className="crit" data-st={neutral ? 'ok' : 'warn'}>
              <span className="crit-ico" data-st={neutral ? 'ok' : 'warn'}>{neutral ? <XAI.Check /> : <XAI.Warn />}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 3 }}>{e.levier}</div>
                <div className="crit-meas"><span style={{ color: 'var(--fg2)' }}>Vous : <b style={{ color: 'var(--fg1)' }}>{e.vous}</b></span><span style={{ color: 'var(--fg3)' }}>{c.name} : {e.concurrent}</span></div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{e.action}</div>
              </div>
              {!neutral && (done ? <span className="crit-act"><XAP label={`Priorité ${done} ouverte`} tone="blue" sm /></span> : <span className="crit-act"><button className="btn-out" onClick={() => onCreatePrio(key)}><XAI.Plus />Créer la priorité</button></span>)}
            </div>);
        })}
      </div>
    </div>
  </div>);

Object.assign(window, { CompetitorRow });
