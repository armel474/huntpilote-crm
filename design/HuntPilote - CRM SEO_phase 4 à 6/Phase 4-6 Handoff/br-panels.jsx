/* HuntPilote — Brief d'article : sections du brief, suivi et clôture en preuve de valeur. */
const { useState: useBR } = React;

const BI = {
  Key: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 11l8-8 4 4-8 8H3z" /><circle cx="17.5" cy="6.5" r="2.5" /><line x1="7" y1="13" x2="11" y2="17" /></svg>,
  Eye: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  List: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  Users: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  Rule: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16v4H4zM4 12h10v4H4z" /></svg>,
  Sparkle: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>,
  Trophy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17M14 14.66V17" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Link: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Chart: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
  Copy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>,
};

const BSec = ({ icon, title, sub, right, children }) => (
  <div className="card br-sec">
    <div className="br-sec-h">
      <span className="ar-step" style={{ background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', color: 'var(--fg2)' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>
        {sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      {right}
    </div>
    {children}
  </div>);

const IntentPill = ({ id, sm }) => { const i = window.BR_INTENTS[id]; return <window.EPill label={i.label} tone={i.tone} sm={sm} />; };

/* ── MOT-CLÉ ET REQUÊTES SECONDAIRES ── */
const KeywordSection = ({ b }) => (
  <BSec icon={<BI.Key />} title="Mot-clé cible et requêtes secondaires" sub="Volumes relevés au 28 août 2026 · seuil de sélection : 150 recherches par mois minimum">
    <div className="br-kw">
      <span className="br-kw-t">{b.kw.term}</span>
      <IntentPill id={b.kw.intent} sm />
      <span className="br-num">{b.kw.vol} rech./mois</span>
      <span className="br-num" style={{ color: 'var(--fg3)' }}>difficulté {b.kw.difficulty} / 100 · seuil de faisabilité : 45</span>
      {b.kw.pos && <window.EPill label={`Position ${b.kw.pos} atteinte`} tone="green" sm icon={<BI.Check />} />}
    </div>
    {b.fromKw && (
      <div className="br-ai" style={{ marginTop: 9, background: 'var(--bg-muted)', borderColor: 'var(--bd-solid)' }}>
        <span style={{ color: 'var(--fg3)' }}><BI.Key /></span>
        <div style={{ flex: 1, minWidth: 0 }}>{b.fromKwNote} <a href="Keyword Hunter.html">Revoir l’opportunité</a></div>
      </div>)}
    <div className="lbl" style={{ margin: '13px 0 6px' }}>Requêtes secondaires à couvrir</div>
    <div className="br-table">
      {b.secondary.map(s => (
        <div key={s.term} className="br-trow">
          <span className="br-trow-k">{s.term}</span>
          <IntentPill id={s.intent} sm />
          <span className="br-num">{s.vol} rech./mois</span>
        </div>))}
    </div>
    <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Ces requêtes se traitent dans le corps du texte, pas en les répétant : chacune correspond à une question à laquelle une section doit répondre.</div>
  </BSec>);

/* ── INTENTION DE RECHERCHE ── */
const IntentSection = ({ b }) => (
  <BSec icon={<BI.Eye />} title="Intention de recherche" sub="Ce que cherche vraiment la personne qui tape cette requête — la partie que les briefs oublient">
    <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', lineHeight: 1.65, textWrap: 'pretty' }}>{b.intentText}</p>
    <div className="br-ai" style={{ marginTop: 10 }}>
      <span><BI.Sparkle /></span>
      <div style={{ flex: 1, minWidth: 0 }}><b>Vérification faite par l’agent.</b> {b.intentProof}</div>
    </div>
  </BSec>);

/* ── PLAN PROPOSÉ ── */
const OutlineSection = ({ b }) => {
  const [rows, setRows] = useBR(b.outline);
  const [dirty, setDirty] = useBR(false);
  const upd = (i, t) => { setRows(r => r.map((x, j) => j === i ? { ...x, t } : x)); setDirty(true); };
  const del = i => { setRows(r => r.filter((_, j) => j !== i)); setDirty(true); };
  const add = h => { setRows(r => [...r, { h, t: '' }]); setDirty(true); };
  return (
    <BSec icon={<BI.List />} title="Plan proposé" sub={`${rows.length} titres · proposé par l’agent, à vous de le corriger avant de remettre le brief`}
      right={dirty ? <window.EPill label="Modifié" tone="yellow" sm /> : <window.EPill label="Proposition de l’agent" tone="violet" sm icon={<BI.Sparkle />} />}>
      <div className="br-outline">
        {rows.map((r, i) => (
          <div key={i} className={`br-h${r.h === 3 ? ' h3' : ''}`}>
            <span className="br-h-tag">H{r.h}</span>
            <input className="br-h-in" value={r.t} onChange={e => upd(i, e.target.value)} placeholder="Titre de section" aria-label={`Titre de niveau ${r.h}`} />
            <button className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => del(i)} aria-label="Retirer ce titre">×</button>
          </div>))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
        <button className="btn-out" style={{ fontSize: '0.625rem' }} onClick={() => add(2)}><BI.Plus />Ajouter un H2</button>
        <button className="btn-out" style={{ fontSize: '0.625rem' }} onClick={() => add(3)}><BI.Plus />Ajouter un H3</button>
      </div>
    </BSec>);
};

/* ── CONCURRENTS À BATTRE ── */
const CompetitorSection = ({ b }) => (
  <BSec icon={<BI.Users />} title="Concurrents à battre" sub="Qui occupe la première page aujourd’hui, et par quel angle">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {b.competitors.map(c => (
        <div key={c.domain} className="br-comp">
          <span className="br-rank">{c.rank}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.domain}</span>
              <span className="br-num" style={{ color: 'var(--fg3)' }}>{c.words} mots</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 3 }}>{c.angle}</div>
          </div>
        </div>))}
    </div>
    <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Le plus long ne gagne pas : le premier résultat date de 2023 et montre une interface disparue. L’angle à prendre est la fraîcheur, avec des captures de l’interface actuelle.</div>
  </BSec>);

/* ── CONSIGNES ── */
const RulesSection = ({ b }) => (
  <BSec icon={<BI.Rule />} title="Consignes de rédaction" sub="Ce que le rédacteur doit respecter, et pourquoi">
    <div>
      <div className="br-field"><span className="br-field-l">Longueur visée</span><span className="br-field-v"><b>{b.rules.length}</b><div style={{ color: 'var(--fg3)', fontWeight: 400, marginTop: 2 }}>{b.rules.lengthWhy}</div></span></div>
      <div className="br-field"><span className="br-field-l">Ton</span><span className="br-field-v">{b.rules.tone}</span></div>
      <div className="br-field"><span className="br-field-l">Liens internes à placer</span><span className="br-field-v">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {b.rules.links.map(([t, u]) => <span key={u} style={{ display: 'inline-flex', gap: 5, alignItems: 'baseline' }}><span style={{ color: 'var(--fg3)', display: 'inline-flex', marginTop: 2 }}><BI.Link /></span><span>{t} <span style={{ color: 'var(--fg3)', fontSize: '0.625rem' }}>— {u}</span></span></span>)}
        </div></span></div>
      <div className="br-field"><span className="br-field-l">Appel à l’action</span><span className="br-field-v">{b.rules.cta}</span></div>
      <div className="br-field"><span className="br-field-l">Illustrations</span><span className="br-field-v">{b.rules.images}</span></div>
    </div>
  </BSec>);

Object.assign(window, { BI, BSec, IntentPill, KeywordSection, IntentSection, OutlineSection, CompetitorSection, RulesSection });
