/* HuntPilote — Détail d'un deal : panneau latéral ouvert depuis une carte du Kanban. */
const { useState: useDL, useEffect: useDLE } = React;

const DI = {
  X: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Phone: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" /></svg>,
  Mail: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2 7 12 13 22 7" /></svg>,
  Users: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
  Note: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  Doc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Chart: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Trophy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17M14 14.66V17" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
};
const DL_CH_ICON = { appel: DI.Phone, courriel: DI.Mail, reunion: DI.Users, note: DI.Note };
const D_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const DPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = D_TONE[tone]; return <span className="dl-pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const dlFmt = n => n.toLocaleString('fr-CA').replace(/\u202f|\u00a0/g, ' ');

const DSec = ({ title, sub, right, children }) => (
  <div className="dl-sec">
    <div className="dl-sec-h">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lbl">{title}</div>
        {sub && <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      {right}
    </div>
    {children}
  </div>);

const Field = ({ l, children }) => (
  <div className="dl-field"><span className="dl-field-l">{l}</span><span className="dl-field-v">{children}</span></div>);

/* ── CONSIGNER UN ÉCHANGE ── */
const LogExchange = ({ onAdd, onCancel }) => {
  const [ch, setCh] = useDL('appel');
  const [text, setText] = useDL('');
  return (
    <div className="dl-form">
      <div className="dl-chips" style={{ marginBottom: 7 }}>
        {Object.entries(window.DL_CHANNELS).map(([id, [lbl]]) =>
          <button key={id} type="button" className={`dl-chip${ch === id ? ' on' : ''}`} onClick={() => setCh(id)}>{lbl}</button>)}
      </div>
      <textarea className="dl-ta" value={text} onChange={e => setText(e.target.value)} rows="3" placeholder="Ce qui s’est dit, et ce qui bloque encore." aria-label="Contenu de l’échange"></textarea>
      <div style={{ display: 'flex', gap: 7, marginTop: 7, justifyContent: 'flex-end' }}>
        <button className="btn-out" style={{ fontSize: '0.625rem' }} onClick={onCancel}>Annuler</button>
        <button className="btn-out" style={{ fontSize: '0.625rem' }} disabled={!text.trim()} onClick={() => onAdd({ ch, text: text.trim() })}>Consigner l’échange</button>
      </div>
    </div>);
};

/* ── CONFIRMATION « GAGNÉ » ── */
const WonConfirm = ({ deal, onCancel, onConfirm }) => (
  <div className="dl-confirm">
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 9 }}>
      <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><DI.Trophy /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 3 }}>Marquer « {deal.company} » comme gagné</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>Ce geste ne change pas seulement l’étape du Kanban. Voici ce qui sera créé immédiatement :</div>
      </div>
    </div>
    <ul className="dl-effects">
      {window.DL_WON_EFFECTS.map(([what, how]) => <li key={what}><DI.Check /><span><b>{what}</b> — {how}</span></li>)}
    </ul>
    <div style={{ display: 'flex', gap: 7, marginTop: 11, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      <button className="btn-out" onClick={onCancel}>Annuler</button>
      <button className="btn-pri dl-green" onClick={onConfirm}><DI.Trophy />Créer le client et lancer l’onboarding</button>
    </div>
  </div>);

/* ── CONFIRMATION « PERDU » ── */
const LostConfirm = ({ deal, onCancel, onConfirm }) => {
  const [reason, setReason] = useDL('');
  const [note, setNote] = useDL('');
  return (
    <div className="dl-confirm lost">
      <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 9 }}>
        <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0, marginTop: 1 }}><DI.Warn /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 3 }}>Marquer « {deal.company} » comme perdu</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>Le motif est obligatoire — c’est lui qui alimente le taux de conversion par cause. L’instantané SEO du prospect sera purgé {window.DL_SNAPSHOT_DAYS} jours après la perte, conformément à la politique de conservation.</div>
        </div>
      </div>
      <div className="dl-chips">
        {window.DL_LOST_REASONS.map(r => <button key={r} type="button" className={`dl-chip${reason === r ? ' on' : ''}`} onClick={() => setReason(r)}>{r}</button>)}
      </div>
      <textarea className="dl-ta" style={{ marginTop: 8 }} rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="Précision facultative — ce qui aurait pu changer l’issue." aria-label="Précision sur la perte"></textarea>
      <div style={{ display: 'flex', gap: 7, marginTop: 9, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn-out" onClick={onCancel}>Annuler</button>
        <button className="btn-out dl-red" disabled={!reason} onClick={() => onConfirm(reason, note)}>Marquer perdu</button>
      </div>
    </div>);
};

Object.assign(window, { DI, DL_CH_ICON, D_TONE, DPill, dlFmt, DSec, Field, LogExchange, WonConfirm, LostConfirm });
