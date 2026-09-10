/* HuntPilote — Éditeur d'automatisation : atomes, sélecteurs Quand / Si / Alors et aperçu en langage naturel. */
const { useState: useAR } = React;

const RI = {
  Chart: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
  Warn: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Link: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
  Star: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Cal: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Trophy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17M14 14.66V17" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Bill: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  Pin: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Task: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12.5l2.5 2.5L16 9" /></svg>,
  Bell: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  Send: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Doc: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Search: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Play: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3" /></svg>,
  Redo: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Pause: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="4" x2="9" y2="20" /><line x1="15" y1="4" x2="15" y2="20" /></svg>,
};
const R_GLYPH = { chart: RI.Chart, warn: RI.Warn, link: RI.Link, star: RI.Star, cal: RI.Cal, trophy: RI.Trophy, bill: RI.Bill, pin: RI.Pin, task: RI.Task, bell: RI.Bell, send: RI.Send, doc: RI.Doc, search: RI.Search };

const R_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const RPill2 = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = R_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };

const AR_STATUS = {
  active: ['Active', 'green', RI.Check], pause: ['En pause', 'yellow', RI.Pause],
  echec: ['En échec répété', 'red', RI.Warn], brouillon: ['Brouillon — jamais activée', 'neutral', RI.Doc],
};

/* ── SECTION ── */
const RSection = ({ step, title, sub, right, children, tone = 'neutral' }) => {
  const [bg, bd, fg] = R_TONE[tone];
  return (
    <div className="card ar-sec">
      <div className="ar-sec-h">
        <span className="ar-step" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>{step}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>
          {sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>);
};

/* ── QUAND ── */
const TriggerPicker = ({ rule, set }) => {
  const t = rule.trigger ? window.AR_TRIGGERS[rule.trigger] : null;
  const p = t && t.param;
  const val = p ? (rule.params[p.key] !== undefined ? rule.params[p.key] : p.def) : null;
  return (
    <RSection step="1" tone="blue" title="Quand" sub="Un seul déclencheur par règle, choisi parmi ce que l’application sait produire.">
      <div className="ar-grid">
        {Object.entries(window.AR_TRIGGERS).map(([id, tr]) => {
          const G = R_GLYPH[tr.icon], on = rule.trigger === id;
          return (
            <button key={id} type="button" className={`ar-opt${on ? ' on' : ''}`} onClick={() => set(r => ({ ...r, trigger: id, params: { [tr.param.key]: tr.param.def }, conds: window.arPruneConds(r.conds, id) }))} aria-pressed={on}>
              <span className="ar-opt-i"><G /></span><span className="ar-opt-t">{tr.label}</span>
              {on && <span className="ar-opt-c"><RI.Check /></span>}
            </button>);
        })}
      </div>
      {t && p && (
        <div className="ar-param">
          <label htmlFor="ar-p">{p.label}</label>
          {p.options
            ? <select id="ar-p" className="sel" value={val} onChange={e => set(r => ({ ...r, params: { ...r.params, [p.key]: e.target.value } }))}>{p.options.map(o => <option key={o} value={o}>{o}</option>)}</select>
            : <React.Fragment>
                <input id="ar-p" type="range" min={p.min} max={p.max} value={val} onChange={e => set(r => ({ ...r, params: { ...r.params, [p.key]: Number(e.target.value) } }))} style={{ flex: 1, minWidth: 120, accentColor: 'var(--accent)' }} />
                <span className="ar-param-v">{val} {p.unit}</span>
              </React.Fragment>}
        </div>)}
      {!rule.trigger && <div className="ar-todo">Choisissez un déclencheur pour continuer.</div>}
    </RSection>);
};

/* ── SI ── */
const CondEditor = ({ rule, set }) => {
  const [adding, setAdding] = useAR(false);
  const used = rule.conds.map(c => c.kind);
  const add = kind => {
    const k = window.AR_COND_KINDS[kind];
    const value = k.kind === 'clients' ? [] : k.kind === 'forfait' ? [] : k.kind === 'dim' ? window.AR_DIMS[1] : k.kind === 'nombre' ? k.def : true;
    set(r => ({ ...r, conds: [...r.conds, { kind, value }] })); setAdding(false);
  };
  const upd = (i, value) => set(r => ({ ...r, conds: r.conds.map((c, j) => j === i ? { ...c, value } : c) }));
  const del = i => set(r => ({ ...r, conds: r.conds.filter((_, j) => j !== i) }));
  return (
    <RSection step="2" tone="neutral" title="Si" sub="Facultatif. Chaque condition restreint le déclencheur — elles s’additionnent, jamais elles ne s’excluent."
      right={<span className="lbl">{rule.conds.length} condition{rule.conds.length > 1 ? 's' : ''}</span>}>
      {rule.conds.length === 0 && <div className="ar-todo">Aucune condition : la règle s’applique à tout le portefeuille.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rule.conds.map((c, i) => {
          const k = window.AR_COND_KINDS[c.kind];
          return (
            <div key={c.kind} className="ar-cond">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 5 }}>{k.label}</div>
                {(k.kind === 'clients' || k.kind === 'forfait') && (
                  <div className="chips">
                    {(k.kind === 'clients' ? window.AR_CLIENTS : window.AR_FORFAITS).map(o => {
                      const on = c.value.includes(o);
                      return <button key={o} type="button" className={`chip${on ? ' on' : ''}`} onClick={() => upd(i, on ? c.value.filter(x => x !== o) : [...c.value, o])}>{o}</button>;
                    })}
                  </div>)}
                {k.kind === 'dim' && <select className="sel" value={c.value} onChange={e => upd(i, e.target.value)}>{window.AR_DIMS.map(d => <option key={d} value={d}>{d}</option>)}</select>}
                {k.kind === 'nombre' && (
                  <div className="ar-param" style={{ marginTop: 0, background: 'transparent', border: 0, padding: 0 }}>
                    <input type="range" min="100" max="5000" step="100" value={c.value} onChange={e => upd(i, Number(e.target.value))} style={{ flex: 1, minWidth: 110, accentColor: 'var(--accent)' }} aria-label="Volume de recherche minimal" />
                    <span className="ar-param-v">{c.value} rech./mois</span>
                  </div>)}
                {k.kind === 'bool' && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{k.phrase()}</div>}
              </div>
              <button className="btn-icon" onClick={() => del(i)} aria-label={`Retirer la condition ${k.label}`}><RI.X /></button>
            </div>);
        })}
      </div>
      {adding ? (
        <div className="ar-add">
          {Object.entries(window.AR_COND_KINDS).filter(([id]) => !used.includes(id) && window.arCondAllowed(id, rule.trigger)).map(([id, k]) =>
            <button key={id} type="button" className="chip" onClick={() => add(id)}>{k.label}</button>)}
          <button className="btn-out" style={{ fontSize: '0.625rem' }} onClick={() => setAdding(false)}>Annuler</button>
        </div>
      ) : (
        <button className="btn-out" style={{ marginTop: 9, fontSize: '0.6875rem' }} onClick={() => setAdding(true)} disabled={Object.keys(window.AR_COND_KINDS).filter(id => !used.includes(id) && window.arCondAllowed(id, rule.trigger)).length === 0}><RI.Plus />Ajouter une condition</button>)}
    </RSection>);
};

/* ── ALORS ── */
const ActionPicker = ({ rule, set }) => {
  const a = rule.action ? window.AR_ACTIONS[rule.action] : null;
  const ap = rule.actionParams;
  const setAp = (k, v) => set(r => ({ ...r, actionParams: { ...r.actionParams, [k]: v } }));
  return (
    <RSection step="3" tone="green" title="Alors" sub="Une action par règle. Pour en enchaîner deux, écrivez deux règles — une phrase reste lisible.">
      <div className="ar-grid">
        {Object.entries(window.AR_ACTIONS).map(([id, ac]) => {
          const G = R_GLYPH[ac.icon], on = rule.action === id;
          return (
            <button key={id} type="button" className={`ar-opt${on ? ' on' : ''}`} onClick={() => set(r => ({ ...r, action: id }))} aria-pressed={on}>
              <span className="ar-opt-i"><G /></span><span className="ar-opt-t">{ac.label}</span>
              {on && <span className="ar-opt-c"><RI.Check /></span>}
            </button>);
        })}
      </div>
      {a && (
        <div className="ar-param" style={{ flexWrap: 'wrap', gap: 10 }}>
          {rule.action === 'priorite' && <React.Fragment>
            <label htmlFor="ar-sev">Sévérité</label><select id="ar-sev" className="sel" value={ap.sev} onChange={e => setAp('sev', e.target.value)}>{window.AR_SEVS.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <label htmlFor="ar-dim">Dimension</label><select id="ar-dim" className="sel" value={ap.dim} onChange={e => setAp('dim', e.target.value)}>{window.AR_DIMS.map(d => <option key={d} value={d}>{d}</option>)}</select>
          </React.Fragment>}
          {rule.action === 'tache' && <React.Fragment>
            <label htmlFor="ar-as">Assignée à</label><select id="ar-as" className="sel" value={ap.assignee} onChange={e => setAp('assignee', e.target.value)}>{window.AR_TEAM.map(m => <option key={m} value={m}>{m}</option>)}</select>
            <label htmlFor="ar-ef">Effort estimé</label><select id="ar-ef" className="sel" value={ap.effort} onChange={e => setAp('effort', Number(e.target.value))}>{[1, 2, 4, 8].map(h => <option key={h} value={h}>{h} h</option>)}</select>
          </React.Fragment>}
          {rule.action === 'notifier' && <React.Fragment>
            <label htmlFor="ar-no">Destinataire</label><select id="ar-no" className="sel" value={ap.assignee} onChange={e => setAp('assignee', e.target.value)}>{[...window.AR_TEAM, 'toute l’équipe'].map(m => <option key={m} value={m}>{m}</option>)}</select>
          </React.Fragment>}
          {rule.action === 'courriel' && <React.Fragment>
            <label htmlFor="ar-de">Destinataire</label><select id="ar-de" className="sel" value={ap.dest} onChange={e => setAp('dest', e.target.value)}><option value="client">client</option><option value="chargé de compte">chargé de compte</option><option value="responsable de la facturation">responsable de la facturation</option></select>
          </React.Fragment>}
          {rule.action === 'audit' && <React.Fragment>
            <label htmlFor="ar-au">Portée de l’audit</label><select id="ar-au" className="sel" value={ap.dim} onChange={e => setAp('dim', e.target.value)}>{['Toutes', ...window.AR_DIMS].map(d => <option key={d} value={d}>{d}</option>)}</select>
          </React.Fragment>}
          {rule.action === 'rapport' && <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Le brouillon reste invisible du client jusqu’à publication.</span>}
          <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>Produit : {a.creates}</span>
        </div>)}
      {!rule.action && <div className="ar-todo">Choisissez une action pour continuer.</div>}
    </RSection>);
};

/* ── APERÇU EN LANGAGE NATUREL ── */
const arSentence = rule => {
  const t = rule.trigger ? window.AR_TRIGGERS[rule.trigger] : null;
  const p = t && t.param;
  const tv = p ? (rule.params[p.key] !== undefined ? rule.params[p.key] : p.def) : null;
  const a = rule.action ? window.AR_ACTIONS[rule.action] : null;
  return {
    when: t ? t.phrase(tv) : null,
    ifs: rule.conds.map(c => window.AR_COND_KINDS[c.kind].phrase(c.value)),
    then: a ? a.phrase(rule.actionParams) : null,
  };
};

const NaturalPreview = ({ rule }) => {
  const s = arSentence(rule);
  const done = s.when && s.then;
  return (
    <div className="ar-preview">
      <div className="lbl" style={{ marginBottom: 6 }}>La règle, en une phrase</div>
      {done ? (
        <p className="ar-phrase">
          <b>Quand</b> {s.when}
          {s.ifs.map((x, i) => <React.Fragment key={i}>, <b>{i === 0 ? 'si' : 'et si'}</b> {x}</React.Fragment>)}
          , <b>alors</b> {s.then}.
        </p>
      ) : (
        <p className="ar-phrase incomplete">
          <b>Quand</b> {s.when || <span className="ar-blank">choisissez un déclencheur</span>}
          , <b>alors</b> {s.then || <span className="ar-blank">choisissez une action</span>}.
        </p>)}
      {done && s.ifs.some(x => x.includes('aucun')) && <div className="ar-todo" style={{ marginTop: 8 }}>Une condition est vide : elle bloquerait toutes les exécutions. Complétez-la ou retirez-la.</div>}
    </div>);
};

Object.assign(window, { RI, R_GLYPH, R_TONE, RPill2, AR_STATUS, RSection, TriggerPicker, CondEditor, ActionPicker, arSentence, NaturalPreview });
