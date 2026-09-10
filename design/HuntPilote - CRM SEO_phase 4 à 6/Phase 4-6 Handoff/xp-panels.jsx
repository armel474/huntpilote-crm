/* HuntPilote — Priorités transversales : atomes, filtres, lignes et barre d'assignation en lot. */
const { useState: useXP } = React;

const XI = {
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Eye: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  EyeOff: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  Task: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Trophy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Sparkle: () => <span style={{ fontSize: 11 }}>✦</span>,
};

const XP_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const XPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = XP_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };

const SEV_META = { critique: ['Critique', 'red'], important: ['Important', 'yellow'], opportunite: ['Opportunité', 'green'] };
const VIS_META = { interne: ['Interne', 'neutral', XI.EyeOff], annonce: ['Annoncé', 'blue', XI.Eye], traitement: ['En traitement', 'green', XI.Task] };
const DIMS = ['Présence en ligne', 'SEO', 'Design'];

const ageTone = (age, assigned) => assigned ? 'green' : age >= window.XP_AGE_OLD ? 'red' : age >= window.XP_AGE_WARN ? 'yellow' : 'neutral';
const ageLabel = age => age <= 1 ? 'Depuis hier' : `Depuis ${age} jours`;

/* ── BARRE DE FILTRES ── */
const FilterBar = ({ f, setF, count, total }) => {
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="card" style={{ padding: '0.75rem 0.875rem', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <select className="sel" style={{ width: 140 }} value={f.sev} onChange={e => set('sev', e.target.value)} aria-label="Filtrer par sévérité">
        <option value="toutes">Toutes sévérités</option><option value="critique">Critique</option><option value="important">Important</option><option value="opportunite">Opportunité</option>
      </select>
      <select className="sel" style={{ width: 150 }} value={f.dim} onChange={e => set('dim', e.target.value)} aria-label="Filtrer par dimension">
        <option value="toutes">Toutes dimensions</option>{DIMS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="sel" style={{ width: 170 }} value={f.client} onChange={e => set('client', e.target.value)} aria-label="Filtrer par client">
        <option value="tous">Tous les clients</option>{Object.entries(window.XP_CLIENTS).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
      </select>
      <div className="chips">
        {Object.entries(VIS_META).map(([id, [lbl]]) => <button key={id} type="button" className={`chip${f.vis.includes(id) ? ' on' : ''}`} onClick={() => set('vis', f.vis.includes(id) ? f.vis.filter(v => v !== id) : [...f.vis, id])}>{lbl}</button>)}
      </div>
      <button type="button" className={`chip${f.nonAssignees ? ' on' : ''}`} onClick={() => set('nonAssignees', !f.nonAssignees)}>Non assignées seulement</button>
      <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>{count} sur {total} priorités</span>
    </div>);
};

/* ── BANNIÈRES D'ÉTAT ── */
const SainBanner = () => (
  <div className="note-box" style={{ background: 'var(--green-m)', borderColor: 'var(--green-b)', marginTop: 0, marginBottom: 12 }}>
    <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><XI.Trophy /></span>
    <div style={{ flex: 1, minWidth: 0 }}><b>Aucune priorité critique ouverte</b>, tous clients confondus. Le portefeuille reste à surveiller — mais rien n’exige d’attention immédiate.</div>
  </div>);
const AffluxBanner = ({ n, crit }) => (
  <div className="note-box" style={{ background: 'var(--blue-m)', borderColor: 'var(--blue-b)', marginTop: 0, marginBottom: 12 }}>
    <span style={{ color: 'var(--blue-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><XI.Warn /></span>
    <div style={{ flex: 1, minWidth: 0 }}><b>{n} nouvelles priorités détectées</b> dans les derniers audits, dont {crit} critiques. Triez et assignez avant qu’elles ne vieillissent.</div>
  </div>);
const AnciennesBanner = ({ n, oldest }) => (
  <div className="note-box" style={{ background: 'var(--red-m)', borderColor: 'var(--red-b)', marginTop: 0, marginBottom: 12 }}>
    <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0, marginTop: 1 }}><XI.Warn /></span>
    <div style={{ flex: 1, minWidth: 0 }}><b>{n} priorités non assignées depuis plus d’un mois</b>, dont une depuis {oldest} jours. C’est un problème d’agence, pas de client.</div>
  </div>);

/* ── LIGNE DE PRIORITÉ ── */
const PrioRow = ({ p, checked, onCheck, onAssignOne }) => {
  const [sevLabel, sevTone] = SEV_META[p.sev];
  const [visLabel, visTone, VisIcon] = VIS_META[p.vis];
  const at = ageTone(p.age, p.assigned);
  return (
    <div className="xp-row">
      <button type="button" aria-pressed={checked} disabled={p.assigned} title={p.assigned ? 'Déjà assignée' : 'Sélectionner'} onClick={() => onCheck(p.id)} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: checked ? 'var(--green)' : 'transparent', border: `1.5px solid ${checked ? 'var(--green)' : 'var(--bd-strong)'}`, color: '#fff', cursor: p.assigned ? 'not-allowed' : 'pointer', opacity: p.assigned ? 0.35 : 1, marginTop: 1 }}>{checked && <XI.Check />}</button>
      <div className="xp-main">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
          <XPill label={sevLabel} tone={sevTone} sm icon={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>} />
          <XPill label={p.dim} tone="neutral" sm />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', fontWeight: 700, color: 'var(--fg3)' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fg4)', display: 'inline-block' }}></span>{window.XP_CLIENTS[p.client]}</span>
          {p.age <= 6 && <XPill label="Nouvelle" tone="blue" sm />}
        </div>
        <a href="Priorite Detail.html" style={{ textDecoration: 'none', color: 'inherit' }}><div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.35, textWrap: 'pretty' }}>{p.label}</div></a>
        <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 2 }}>{p.id}</div>
      </div>
      <div className="xp-side">
        <XPill label={visLabel} tone={visTone} sm icon={<VisIcon />} />
        {(() => { const [, , fg] = XP_TONE[at]; return <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: at === 'neutral' ? 'var(--fg3)' : fg }}>{ageLabel(p.age)}</span>; })()}
        {p.assigned ? <span style={{ fontSize: '0.5625rem', color: 'var(--green-fg)', display: 'flex', alignItems: 'center', gap: 3 }}><XI.Task />Tâche {p.task}</span> : <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>Non assignée</span>}
      </div>
      <div className="xp-actions">
        {!p.assigned && <button className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem' }} onClick={() => onAssignOne(p.id)}><XI.Plus />Assigner</button>}
        <a href="Priorite Detail.html" className="btn-icon" title="Ouvrir la priorité" style={{ textDecoration: 'none' }}><XI.Arrow /></a>
      </div>
    </div>);
};

/* ── SECTION PAR SÉVÉRITÉ (critiques d'abord) ── */
const SevSection = ({ sev, items, ...rowHandlers }) => {
  if (items.length === 0) return null;
  const [title, tone] = SEV_META[sev];
  const [, , fg] = XP_TONE[tone];
  const sorted = [...items].sort((a, b) => b.age - a.age);
  const isCrit = sev === 'critique';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: fg, flexShrink: 0 }}></span>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</h2>
        <span className="lbl">{items.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...(isCrit ? { padding: 8, borderRadius: 12, background: 'var(--red-m)', border: '1px solid var(--red-b)' } : {}) }}>
        {sorted.map(p => <PrioRow key={p.id} p={p} checked={rowHandlers.selected.has(p.id)} onCheck={rowHandlers.onCheck} onAssignOne={rowHandlers.onAssignOne} />)}
      </div>
    </div>);
};

/* ── BARRE D'ASSIGNATION EN LOT ── */
const BulkBar = ({ count, critCount, onAssign, onCancel }) => (
  <div style={{ position: 'sticky', bottom: 12, marginTop: 4, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-solid)', border: '1px solid var(--bd-solid)', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', zIndex: 20 }}>
    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{count} priorité{count > 1 ? 's' : ''} sélectionnée{count > 1 ? 's' : ''}{critCount > 0 && <span style={{ color: 'var(--red)' }}> · {critCount} critique{critCount > 1 ? 's' : ''}</span>}</span>
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
      <button className="btn-out" style={{ fontSize: '0.75rem' }} onClick={onCancel}>Annuler</button>
      <button className="btn-pri" style={{ background: '#15803D', color: '#fff', fontSize: '0.75rem' }} onClick={onAssign}><XI.Plus />Assigner en lot au plan d’action</button>
    </div>
  </div>);

const XpEmpty = () => (
  <div className="empty">
    <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucune priorité pour ces filtres</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>Élargissez les filtres pour revoir le portefeuille complet.</div>
  </div>);

Object.assign(window, { XI, XPill, SEV_META, VIS_META, DIMS, ageTone, ageLabel, FilterBar, SainBanner, AffluxBanner, AnciennesBanner, PrioRow, SevSection, BulkBar, XpEmpty });
