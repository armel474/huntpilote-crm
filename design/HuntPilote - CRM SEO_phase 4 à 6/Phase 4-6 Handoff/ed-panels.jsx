/* HuntPilote — Calendrier éditorial : quota du forfait, vue mois, vue liste, ligne de contenu. */
const { useState: useED } = React;

const EI = {
  Doc: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Key: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 11l8-8 4 4-8 8H3z" /><circle cx="17.5" cy="6.5" r="2.5" /><line x1="7" y1="13" x2="11" y2="17" /></svg>,
  Trophy: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17M14 14.66V17" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Chart: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
  Link: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Prev: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  Next: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

const E_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const EPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = E_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };

const M_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const edParse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const edDay = s => { const d = edParse(s); return `${d.getDate()} ${M_FR[d.getMonth()].slice(0, 4)}.`; };
const edLong = s => { const d = edParse(s); return `${d.getDate()} ${M_FR[d.getMonth()]}`; };
const edMonthLabel = ym => { const [y, m] = ym.split('-').map(Number); return `${M_FR[m - 1].replace(/^./, c => c.toUpperCase())} ${y}`; };

/* ── QUOTA DU FORFAIT ── */
const QuotaCard = ({ content, month }) => {
  const C = window.ED_CLIENT;
  const inMonth = content.filter(c => window.edMonth(c) === month);
  const done = inMonth.filter(c => window.ED_DONE.includes(c.state)).length;
  const planned = inMonth.length;
  const late = inMonth.filter(window.edLate).length;
  const short = planned < C.quota;
  const pct = Math.min(done / C.quota * 100, 100);
  const tone = done >= C.quota ? 'var(--green-fg)' : late > 0 || short ? 'var(--red)' : 'var(--yellow-fg)';
  return (
    <div className="card ed-quota">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Quota du forfait — {edMonthLabel(month)}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>Forfait {C.plan} · {C.quotaLabel} inclus au contrat · seuil : {C.quota} livrés pour tenir l’engagement</div>
        </div>
        {done >= C.quota && <EPill label="Quota tenu" tone="green" icon={<EI.Trophy />} />}
        {short && <EPill label={`${C.quota - planned} article${C.quota - planned > 1 ? 's' : ''} non planifié${C.quota - planned > 1 ? 's' : ''}`} tone="red" icon={<EI.Warn />} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: tone, fontVariantNumeric: 'tabular-nums' }}>{done} sur {C.quota}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>articles livrés ce mois · {planned} planifiés</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }} role="img" aria-label={`${done} articles livrés sur ${C.quota} au contrat`}>
        <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 999 }}></div>
      </div>
      <div style={{ marginTop: 7, fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
        {done >= C.quota
          ? 'L’engagement du mois est rempli. Les articles au-delà du quota sont offerts en avance sur le mois suivant.'
          : short
            ? <span style={{ color: 'var(--red)', fontWeight: 700 }}>{planned === 0 ? 'Aucun article n’est au calendrier' : planned === 1 ? 'Un seul article est au calendrier' : `Seuls ${planned} articles sont au calendrier`} pour un forfait qui en inclut {window.ED_CLIENT.quota} : c’est un manquement au contrat avant d’être un retard éditorial.</span>
            : <React.Fragment>{C.quota - done} article{C.quota - done > 1 ? 's' : ''} encore à livrer d’ici la fin du mois{late > 0 && <span style={{ color: 'var(--red)', fontWeight: 700 }}> · {late} en retard sur {late > 1 ? 'leur' : 'son'} échéance</span>}.</React.Fragment>}
      </div>
    </div>);
};

/* ── LIGNE DE CONTENU ── */
const ContentRow = ({ c }) => {
  const st = window.ED_STATES[c.state];
  const late = window.edLate(c);
  const done = window.ED_DONE.includes(c.state);
  const w = c.writer ? window.ED_WRITERS[c.writer] : null;
  const measurable = c.state === 'mesure' && c.perf;
  return (
    <div className="ed-row" style={late ? { borderColor: 'var(--red-b)', background: 'var(--red-m)' } : undefined}>
      <div className="ed-main">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <EPill label={st.label} tone={st.tone} sm icon={done ? <EI.Doc /> : undefined} />
          {late && <EPill label={`Échéance dépassée du ${edLong(c.due)}`} tone="red" sm icon={<EI.Warn />} />}
          {c.fromKw && <a href="Keyword Hunter.html" style={{ textDecoration: 'none' }}><EPill label="Repéré par Keyword Hunter" tone="violet" sm icon={<EI.Key />} /></a>}
          {c.proof && <a href="Editeur Rapport.html" style={{ textDecoration: 'none' }}><EPill label={`Preuve de valeur ${c.proof}`} tone="green" sm icon={<EI.Trophy />} /></a>}
        </div>
        <a href="Brief Article.html" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.35, textWrap: 'pretty' }}>{c.title}</div>
        </a>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4, fontSize: '0.625rem', color: 'var(--fg3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><EI.Key /><b style={{ color: 'var(--fg2)' }}>{c.kw}</b> · {c.vol} rech./mois</span>
          <span>{c.id}</span>
        </div>
        {done && (
          <div className="ed-perf">
            {measurable
              ? <React.Fragment>
                  <span className="ed-perf-i"><EI.Chart /></span>
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                    <b>{c.perf.visits} visites par mois</b> depuis Google, position {c.perf.pos} sur « {c.kw} »{c.perf.prevPos ? ` (${c.perf.prevPos} au départ)` : ''}. Publié le {c.pubAt}.
                  </div>
                  <a href={`https://${c.url}`} className="btn-out" style={{ fontSize: '0.5625rem', padding: '0.2rem 0.55rem', textDecoration: 'none' }} target="_blank" rel="noopener"><EI.Link />Voir en ligne</a>
                </React.Fragment>
              : <React.Fragment>
                  <span className="ed-perf-i"><EI.Clock /></span>
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                    Publié le {c.pubAt} — <b>performance pas encore mesurable</b> : il faut {window.ED_MEASURE_DAYS} jours d’indexation avant qu’un chiffre veuille dire quelque chose.
                  </div>
                </React.Fragment>}
          </div>)}
      </div>
      <div className="ed-side">
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: late ? 'var(--red)' : 'var(--fg2)', whiteSpace: 'nowrap' }}>{done ? `Publié ${c.pubAt !== '—' ? 'le ' + c.pubAt : ''}` : edLong(c.due)}</span>
        {w ? <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{w}</span> : <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', fontStyle: 'italic' }}>Pas de rédacteur assigné</span>}
      </div>
      <div className="ed-actions">
        <a href="Brief Article.html" className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem', textDecoration: 'none' }}>{done ? 'Ouvrir le brief' : 'Ouvrir le brief'}<EI.Arrow /></a>
      </div>
    </div>);
};

Object.assign(window, { EI, EPill, E_TONE, M_FR, edParse, edDay, edLong, edMonthLabel, QuotaCard, ContentRow });
