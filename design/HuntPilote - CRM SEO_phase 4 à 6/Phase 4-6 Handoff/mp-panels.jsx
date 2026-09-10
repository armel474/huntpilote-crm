/* HuntPilote — Mon plan de travail : atomes, carte de charge, groupes et lignes de tâche. */
const { useState: useMP, useEffect: useMPE } = React;

const MI = {
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Lock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  User: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Chev: ({ deg = 0 }) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: `rotate(${deg}deg)` }}><polyline points="6 9 12 15 18 9" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Smile: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9" y2="9.01" /><line x1="15" y1="9" x2="15" y2="9.01" /></svg>,
};

const MP_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const MPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = MP_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const fmtEffort = h => (h % 1 === 0 ? `${h} h` : `${String(h).replace('.', ',')} h`);
const SEV_TONE = { critique: 'red', important: 'yellow', opportunite: 'green' };

const ClientTag = ({ client }) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', fontWeight: 700, color: 'var(--fg3)' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fg4)', display: 'inline-block' }}></span>{window.MP_CLIENTS[client]}</span>;

const PrioTag = ({ prio }) => {
  if (!prio) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.5625rem', fontWeight: 600, color: 'var(--fg4)', border: '1px dashed var(--bd-strong)', borderRadius: 999, padding: '1px 7px' }}><MI.Warn />Sans priorité source</span>;
  return <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><MPill label={prio.label} tone={SEV_TONE[prio.sev]} sm icon={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>} /></a>;
};

/* ── CHARGE DE LA SEMAINE ── */
const WeekLoadCard = ({ tasks }) => {
  const open = tasks.filter(t => t.status !== 'termine');
  const sum = open.reduce((s, t) => s + t.effort, 0);
  const pct = Math.min(sum / window.MP_CAPACITY * 100, 130);
  const over = sum > window.MP_CAPACITY;
  const tone = over ? 'var(--red)' : sum / window.MP_CAPACITY > 0.8 ? 'var(--yellow-fg)' : 'var(--green-fg)';
  return (
    <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Charge de la semaine</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>Somme des efforts estimés · seuil : {window.MP_CAPACITY} h disponibles cette semaine</div>
        </div>
        {over && <MPill label="Semaine surchargée" tone="red" icon={<MI.Warn />} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: tone, fontVariantNumeric: 'tabular-nums' }}>{fmtEffort(sum)}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>sur {window.MP_CAPACITY} h disponibles</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: tone, borderRadius: 999 }}></div>
        <span style={{ position: 'absolute', left: `${100 / 1.3}%`, top: -2, bottom: -2, width: 2, background: 'var(--fg1)', opacity: 0.5 }} title={`Seuil ${window.MP_CAPACITY} h`}></span>
      </div>
      <div style={{ marginTop: 6, fontSize: '0.5625rem', color: 'var(--fg3)' }}>{open.length} tâche{open.length > 1 ? 's' : ''} ouverte{open.length > 1 ? 's' : ''}{over && <span style={{ color: 'var(--red)', fontWeight: 700 }}> · {fmtEffort(sum - window.MP_CAPACITY)} au-delà de la capacité — reportez ou réassignez avant vendredi</span>}</div>
    </div>);
};

/* ── LIGNE DE TÂCHE ── */
const REPORT_OPTS = [['Demain', 'semaine'], ['Vendredi 11 sept.', 'semaine'], ['Semaine du 14 sept.', 'plustard']];

const TaskRow = ({ task, onToggle, onReport, onReassign }) => {
  const [menu, setMenu] = useMP(null); // 'report' | 'assign'
  useMPE(() => { const h = () => setMenu(null); if (menu) { document.addEventListener('click', h); return () => document.removeEventListener('click', h); } }, [menu]);
  const done = task.status === 'termine', blocked = task.status === 'bloquee', late = task.status === 'retard';
  const assignee = window.MP_TEAM.find(m => m.init === task.assignee);
  return (
    <div className="mp-row" style={late ? { borderColor: 'var(--red-b)' } : undefined}>
      {blocked ? (
        <span title={task.blockedReason} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)', color: 'var(--fg4)', marginTop: 1 }}><MI.Lock /></span>
      ) : (
        <button type="button" aria-pressed={done} onClick={() => onToggle(task.id)} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--green)' : 'transparent', border: `1.5px solid ${done ? 'var(--green)' : 'var(--bd-strong)'}`, color: '#fff', cursor: 'pointer', marginTop: 1 }}>{done && <MI.Check />}</button>
      )}
      <div className="mp-main">
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.35, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--fg3)' : 'var(--fg1)', textWrap: 'pretty' }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 5 }}>
          <PrioTag prio={task.prio} /><ClientTag client={task.client} />
        </div>
        {blocked && <div style={{ marginTop: 6, display: 'flex', gap: 5, alignItems: 'flex-start', fontSize: '0.625rem', color: 'var(--yellow-fg)', lineHeight: 1.4 }}><MI.Warn />Bloquée — {task.blockedReason}</div>}
      </div>
      <div className="mp-side">
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: late ? 'var(--red)' : 'var(--fg2)', whiteSpace: 'nowrap' }}>{task.due}</span>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{fmtEffort(task.effort)} estimées</span>
      </div>
      <div className="mp-actions">
        <div style={{ position: 'relative' }}>
          <button className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.6rem' }} onClick={e => { e.stopPropagation(); setMenu(m => m === 'report' ? null : 'report'); }}><MI.Clock />Reporter</button>
          {menu === 'report' && (
            <div className="menu" onClick={e => e.stopPropagation()}>
              {REPORT_OPTS.map(([lbl, bucket]) => <button key={lbl} onClick={() => { onReport(task.id, lbl, bucket); setMenu(null); }}>{lbl}</button>)}
            </div>)}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.5rem' }} onClick={e => { e.stopPropagation(); setMenu(m => m === 'assign' ? null : 'assign'); }} title="Réassigner">
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', fontSize: '0.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{assignee ? assignee.init : task.assignee}</span>
            <MI.Chev deg={menu === 'assign' ? 180 : 0} />
          </button>
          {menu === 'assign' && (
            <div className="menu" onClick={e => e.stopPropagation()}>
              {window.MP_TEAM.map(m => <button key={m.init} onClick={() => { onReassign(task.id, m.init); setMenu(null); }}><MI.User />{m.name}</button>)}
            </div>)}
        </div>
        <a href="Tache Detail.html" className="btn-icon" title="Ouvrir la tâche" style={{ textDecoration: 'none' }}><MI.Arrow /></a>
      </div>
    </div>);
};

/* ── GROUPE PAR ÉCHÉANCE ── */
const GROUP_META = { retard: ['En retard', 'red'], aujourdhui: ['Aujourd’hui', 'blue'], semaine: ['Cette semaine', 'neutral'], plustard: ['Plus tard', 'neutral'] };

const GroupSection = ({ bucket, tasks, ...handlers }) => {
  if (tasks.length === 0) return null;
  const [title, tone] = GROUP_META[bucket];
  const [, , fg] = MP_TONE[tone];
  const sum = tasks.reduce((s, t) => s + t.effort, 0);
  const isRetard = bucket === 'retard';
  const body = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: fg, flexShrink: 0 }}></span>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h2>
        <span className="lbl">{tasks.length} tâche{tasks.length > 1 ? 's' : ''}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>{fmtEffort(sum)} estimées</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{tasks.map(t => <TaskRow key={t.id} task={t} {...handlers} />)}</div>
    </React.Fragment>);
  return isRetard ? <div style={{ padding: '0.75rem 0.875rem', borderRadius: 12, background: 'var(--red-m)', border: '1px solid var(--red-b)', marginBottom: 16 }}>{body}</div> : <div style={{ marginBottom: 16 }}>{body}</div>;
};

const MpEmpty = () => (
  <div className="empty">
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: 'var(--green-fg)' }}><MI.Smile /></div>
    <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucune tâche planifiée</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>Rien ne vous est assigné pour l’instant, tous clients confondus.</div>
  </div>);

Object.assign(window, { MI, MPill, fmtEffort, ClientTag, PrioTag, WeekLoadCard, GroupSection, TaskRow, MpEmpty, GROUP_META });
