/* HuntPilote — Éditeur d'automatisation : bandeau d'état, test à blanc, journal d'exécution, zone de danger. */
const { useState: useARL } = React;
const AR_DRY_MAX = 20; // seuil : au-delà de 20 objets créés sur un mois, la règle est probablement trop large

const StatusBanner = ({ rule, log, tested }) => {
  const [label, tone, Icon] = window.AR_STATUS[rule.status];
  const fails = log.filter(x => !x.ok).length;
  const consec = (() => { let n = 0; for (const x of log) { if (x.ok) break; n += 1; } return n; })();
  const [bg, bd, fg] = window.R_TONE[tone];
  let msg = null;
  if (rule.status === 'echec') msg = <React.Fragment><b>{consec} échecs consécutifs</b> — au-delà du seuil de {window.AR_FAIL_MAX}, HuntPilote a suspendu les exécutions. Corrigez la cause puis rejouez la dernière exécution.</React.Fragment>;
  else if (rule.status === 'pause') msg = <React.Fragment>Les déclenchements sont ignorés. Le journal est conservé — {log.length} exécutions passées, {fails} en échec.</React.Fragment>;
  else if (rule.status === 'brouillon') msg = <React.Fragment>Cette règle n’a jamais été activée. Un test à blanc est exigé avant activation.</React.Fragment>;
  else if (log.length === 0) msg = <React.Fragment><b>Jamais déclenchée depuis sa création.</b> Soit le déclencheur ne s’est pas produit, soit une condition est trop restrictive — le test à blanc le dira.</React.Fragment>;
  else msg = <React.Fragment>{log.length} exécutions au journal, dont {fails} en échec. Dernière : {log[0].at}.</React.Fragment>;
  return (
    <div className="note-box ar-banner" style={{ background: bg, borderColor: bd }}>
      <span style={{ color: fg, display: 'flex', flexShrink: 0, marginTop: 1 }}><Icon /></span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>{label}.</b> {msg}</div>
      {!tested && rule.status !== 'active' && <span className="ar-tag">Test à blanc requis</span>}
    </div>);
};

/* ── TEST À BLANC ── */
const DryRun = ({ rule, open, onRun, result }) => {
  const s = window.arSentence(rule);
  const ready = s.when && s.then;
  if (!open) return null;
  const over = result && result.length > AR_DRY_MAX;
  return (
    <div className="card ar-sec">
      <div className="ar-sec-h">
        <span className="ar-step" style={{ background: 'var(--violet-m)', border: '1px solid var(--violet-b)', color: 'var(--violet-fg)' }}><window.RI.Play /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Test à blanc — qu’aurait fait cette règle le mois dernier ?</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.45 }}>Rien n’est créé. Le test rejoue les données réelles du 12 août au 9 septembre avec les réglages actuels.</div>
        </div>
        <button className="btn-out" onClick={onRun} disabled={!ready} style={{ fontSize: '0.6875rem' }}><window.RI.Play />{result ? 'Relancer le test' : 'Lancer le test'}</button>
      </div>
      {!ready && <div className="ar-todo">Complétez le déclencheur et l’action avant de tester.</div>}
      {result && (
        <React.Fragment>
          <div className="note-box" style={{ marginBottom: 9, background: over ? 'var(--red-m)' : 'var(--green-m)', borderColor: over ? 'var(--red-b)' : 'var(--green-b)' }}>
            <span style={{ color: over ? 'var(--red)' : 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>{over ? <window.RI.Warn /> : <window.RI.Check />}</span>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
              <b>{result.length} objet{result.length > 1 ? 's' : ''} {result.length > 1 ? 'auraient été créés' : 'aurait été créé'}</b> sur les 4 dernières semaines · seuil de vigilance : {AR_DRY_MAX} par mois.
              {over ? ' La règle est trop large — resserrez une condition avant de l’activer.' : ' Volume raisonnable : la règle peut être activée.'}
            </div>
          </div>
          {result.length === 0
            ? <div className="ar-todo">Aucune donnée du mois dernier ne déclenchait cette règle. Elle serait active mais silencieuse — vérifiez le seuil du déclencheur et les conditions.</div>
            : <div className="ar-log">
                {result.map((r, i) => (
                  <div key={i} className="ar-log-row">
                    <span className="ar-log-d">{r.date}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{r.client}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.4 }}>{r.detail}</div>
                    </div>
                    <window.RPill2 label={r.would} tone="violet" sm />
                  </div>))}
              </div>}
        </React.Fragment>)}
    </div>);
};

/* ── JOURNAL D'EXÉCUTION ── */
const ExecLog = ({ log, onReplay, replayed }) => (
  <div className="card ar-sec">
    <div className="ar-sec-h">
      <span className="ar-step" style={{ background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', color: 'var(--fg2)' }}><window.RI.Redo /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Journal d’exécution</div>
        <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>Ce que chaque exécution a réellement produit. Les échecs sont rejouables.</div>
      </div>
      <span className="lbl">{log.length} exécution{log.length > 1 ? 's' : ''}</span>
    </div>
    {log.length === 0
      ? <div className="empty"><div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucune exécution</div><div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>La règle n’a jamais été déclenchée depuis sa création. Le test à blanc dira si c’est le déclencheur ou une condition qui bloque.</div></div>
      : <div className="ar-log">
          {log.map(x => (
            <div key={x.id} className="ar-log-row" style={x.err ? { background: 'var(--red-m)', borderColor: 'var(--red-b)' } : undefined}>
              <span className="ar-log-d">{x.at}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                  {x.ok
                    ? <window.RPill2 label={x.matched > 0 ? `${x.matched} objet${x.matched > 1 ? 's' : ''} créé${x.matched > 1 ? 's' : ''}` : 'Aucun objet créé'} tone={x.matched > 0 ? 'green' : 'neutral'} sm icon={<window.RI.Check />} />
                    : <window.RPill2 label="Échec" tone="red" sm icon={<window.RI.Warn />} />}
                  <span style={{ fontSize: '0.5rem', color: 'var(--fg4)', fontWeight: 700 }}>{x.id}</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: x.err ? 'var(--red)' : 'var(--fg2)', lineHeight: 1.4 }}>{x.produced}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                {x.href && <a href={x.href} className="btn-out" style={{ fontSize: '0.625rem', padding: '0.25rem 0.6rem', textDecoration: 'none' }}>{x.err ? 'Corriger la cause' : 'Ouvrir'}<window.RI.Arrow /></a>}
                {!x.ok && <button className="btn-out" style={{ fontSize: '0.625rem', padding: '0.25rem 0.6rem' }} onClick={() => onReplay(x.id)} disabled={replayed.includes(x.id)}><window.RI.Redo />{replayed.includes(x.id) ? 'Rejouée' : 'Rejouer'}</button>}
              </div>
            </div>))}
        </div>}
  </div>);

/* ── ZONE DE DANGER ── */
const DangerZone = ({ rule, tested, onDelete }) => (
  <div className="ar-danger">
    <div className="lbl" style={{ color: 'var(--red)', marginBottom: 6 }}>Zone de danger</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55, marginBottom: 10 }}>
      Une règle mal réglée peut créer une centaine de tâches en une nuit. {tested ? 'Le test à blanc a été fait — vous savez ce que cette règle produit.' : 'Aucun test à blanc n’a encore été fait sur ces réglages : l’activation reste bloquée.'}
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button className="btn-out ar-del" onClick={onDelete}><window.RI.X />Supprimer la règle</button>
      <a href="Workflow.html" className="btn-out" style={{ textDecoration: 'none' }}>Revenir aux automatisations</a>
    </div>
  </div>);

Object.assign(window, { AR_DRY_MAX, StatusBanner, DryRun, ExecLog, DangerZone });
