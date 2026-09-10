/* HuntPilote — Agenda : légende, vue semaine, vue mois, panneau de journée, création de rendez-vous. */
const { useState: useAG } = React;

const AI = {
  Task: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12.5l2.5 2.5L16 9" /></svg>,
  Send: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Users: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /></svg>,
  Rep: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Prev: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  Next: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Grip: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>,
  Smile: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9" y2="9.01" /><line x1="15" y1="9" x2="15" y2="9.01" /></svg>,
};

const AG_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const AGPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = AG_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const AG_ICON = { echeance: AI.Task, rapport: AI.Send, rdv: AI.Users, exec: AI.Rep };

const D_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const D_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const M_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const isoD = dt => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return isoD(d); };
const fmtLong = s => { const d = parseD(s); return `${D_LONG[d.getDay()]} ${d.getDate()} ${M_LONG[d.getMonth()]}`; };
const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDM = s => { const d = parseD(s); return `${d.getDate()} ${M_LONG[d.getMonth()]}`; };
const fmtHour = t => t.replace(':', ' h ').replace(' h 00', ' h');
const toMin = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const weekDays = start => [...Array(7)].map((_, i) => addDays(start, i));
const monthGrid = ym => { const [y, m] = ym.split('-').map(Number); const off = (new Date(y, m - 1, 1).getDay() + 6) % 7; const n = new Date(y, m, 0).getDate(); const rows = Math.ceil((off + n) / 7); return [...Array(rows * 7)].map((_, i) => { const d = new Date(y, m - 1, 1 - off + i); return isoD(d); }); };

const isLate = e => e.type === 'echeance' && !e.done && e.date < window.AG_TODAY;
function conflictSet(evs) {
  const out = new Set(), byDay = {};
  evs.filter(e => e.type === 'rdv' && e.time).forEach(e => { (byDay[e.date] = byDay[e.date] || []).push(e); });
  Object.values(byDay).forEach(list => list.forEach((a, i) => list.forEach((b, j) => {
    if (i >= j) return;
    const as = toMin(a.time), ae = as + (a.dur || 60), bs = toMin(b.time), be = bs + (b.dur || 60);
    if (as < be && bs < ae) { out.add(a.id); out.add(b.id); }
  })));
  return out;
}

/* ── LÉGENDE ── */
const AgLegend = () => (
  <div className="ag-legend">
    <span className="lbl">Ce que l’agenda montre</span>
    {Object.entries(window.AG_TYPES).map(([id, t]) => { const Icon = AG_ICON[id]; const [bg, bd, fg] = AG_TONE[t.tone]; return (
      <span key={id} className="ag-lg"><span className="ag-lg-i" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}><Icon /></span>{t.label}</span>); })}
  </div>);

/* ── LIGNE DE CONSTAT ── */
const RecapLine = ({ range, evs, label, conflicts }) => {
  const inR = evs.filter(e => range.includes(e.date));
  const n = t => inR.filter(e => e.type === t).length;
  const late = inR.filter(isLate);
  const conf = inR.filter(e => conflicts.has(e.id));
  const heavy = range.map(d => [d, inR.filter(e => e.date === d && e.type === 'echeance' && !e.done).length]).filter(([, c]) => c > window.AG_DAY_MAX);
  const parts = [[n('echeance'), 'échéance', 'échéances'], [n('rdv'), 'rendez-vous', 'rendez-vous'], [n('rapport'), 'envoi de rapport', 'envois de rapport'], [n('exec'), 'exécution', 'exécutions']]
    .filter(([c]) => c > 0).map(([c, s, p]) => `${c} ${c > 1 ? p : s}`);
  const alerts = [];
  if (late.length) alerts.push(`${late.length} échéance${late.length > 1 ? 's' : ''} dépassée${late.length > 1 ? 's' : ''}`);
  if (conf.length) alerts.push(`${conf.length / 2 >= 1 ? Math.round(conf.length / 2) : 1} conflit de rendez-vous`);
  heavy.forEach(([d, c]) => alerts.push(`${fmtLong(d)} : ${c} échéances, au-delà du seuil de ${window.AG_DAY_MAX} par jour`));
  return (
    <div className="note-box" style={{ marginBottom: 10, alignItems: 'center', ...(alerts.length ? { background: 'var(--red-m)', borderColor: 'var(--red-b)' } : {}) }}>
      <span style={{ color: alerts.length ? 'var(--red)' : 'var(--fg3)', display: 'flex', flexShrink: 0 }}>{alerts.length ? <AI.Warn /> : <AI.Rep />}</span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
        <b>{label}</b> · {parts.length ? parts.join(', ') : 'aucun événement produit par l’application'}
        {alerts.length > 0 && <div style={{ marginTop: 3, color: 'var(--red)', fontWeight: 700 }}>{alerts.join(' · ')}</div>}
      </div>
    </div>);
};

/* ── BLOC D'ÉVÉNEMENT ── */
const EventBlock = ({ e, late, conflict, onOpen, drag }) => {
  const Icon = AG_ICON[e.type], t = window.AG_TYPES[e.type];
  return (
    <button type="button" className={`ag-ev${late ? ' is-late' : ''}${conflict ? ' is-conflict' : ''}${e.done ? ' is-done' : ''}`} data-type={e.type}
      draggable={drag || undefined} onDragStart={drag ? ev => { ev.dataTransfer.setData('text/plain', e.id); ev.dataTransfer.effectAllowed = 'move'; } : undefined}
      onClick={() => onOpen(e.date)} title={`${t.label}${drag ? ' — glissez pour déplacer l’échéance' : ''}`}>
      <span className="ag-ev-ico"><Icon /></span>
      <span className="ag-ev-b">
        <span className="ag-ev-t">{e.time && <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHour(e.time)} · </b>}{e.title}</span>
        <span className="ag-ev-m">{t.short}{e.client ? ` · ${window.AG_CLIENTS[e.client]}` : ''}{e.ref ? ` · ${e.ref}` : ''}</span>
        {late && <span className="ag-tag">Dépassée</span>}
        {conflict && <span className="ag-tag">Conflit</span>}
        {e.done && <span className="ag-tag ok">Terminée</span>}
      </span>
      {drag && <span className="ag-ev-grip" aria-hidden="true"><AI.Grip /></span>}    </button>);
};

/* ── VUE SEMAINE ── */
const WeekView = ({ start, evs, selected, onSelect, onMove, conflicts }) => {
  const [over, setOver] = useAG(null);
  return (
    <div className="ag-week">
      {weekDays(start).map(d => {
        const list = evs.filter(e => e.date === d);
        const allday = list.filter(e => !e.time), timed = list.filter(e => e.time).sort((a, b) => toMin(a.time) - toMin(b.time));
        const ech = allday.filter(e => e.type === 'echeance' && !e.done).length;
        const dt = parseD(d), we = dt.getDay() === 0 || dt.getDay() === 6;
        return (
          <div key={d} className={`ag-day${d === window.AG_TODAY ? ' is-today' : ''}${d === selected ? ' is-sel' : ''}${we ? ' is-we' : ''}${over === d ? ' drop-on' : ''}`}
            onDragOver={e => { e.preventDefault(); setOver(d); }} onDragLeave={() => setOver(o => o === d ? null : o)}
            onDrop={e => { e.preventDefault(); setOver(null); onMove(e.dataTransfer.getData('text/plain'), d); }}>
            <button type="button" className="ag-dayhead" onClick={() => onSelect(d)} aria-pressed={d === selected}>
              <span className="ag-dn">{D_SHORT[dt.getDay()]}</span><span className="ag-dd">{dt.getDate()}</span>
              {d === window.AG_TODAY && <span className="ag-todaytag">Aujourd’hui</span>}
              {ech > window.AG_DAY_MAX && <span className="ag-tag">{ech} échéances</span>}
            </button>
            <div className="ag-slots">
              {list.length === 0 && <span className="ag-none">Rien de prévu</span>}
              {allday.map(e => <EventBlock key={e.id} e={e} late={isLate(e)} conflict={false} onOpen={onSelect} drag={window.AG_TYPES[e.type].movable && !e.done} />)}
              {allday.length > 0 && timed.length > 0 && <span className="ag-div"></span>}
              {timed.map(e => <EventBlock key={e.id} e={e} late={false} conflict={conflicts.has(e.id)} onOpen={onSelect} />)}
            </div>
          </div>);
      })}
    </div>);
};

/* ── VUE MOIS ── */
const MonthView = ({ ym, evs, selected, onSelect, onMove, conflicts }) => {
  const [over, setOver] = useAG(null);
  const cur = Number(ym.split('-')[1]);
  return (
    <div>
      <div className="ag-month" style={{ marginBottom: 4 }}>{['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map(d => <div key={d} className="ag-mhead">{d}</div>)}</div>
      <div className="ag-month">
        {monthGrid(ym).map(d => {
          const list = evs.filter(e => e.date === d).sort((a, b) => (a.time ? 1 : 0) - (b.time ? 1 : 0));
          const out = parseD(d).getMonth() + 1 !== cur;
          const flag = list.some(isLate) || list.some(e => conflicts.has(e.id));
          return (
            <button type="button" key={d} className={`ag-cell${out ? ' out' : ''}${d === window.AG_TODAY ? ' is-today' : ''}${d === selected ? ' is-sel' : ''}${over === d ? ' drop-on' : ''}`}
              onClick={() => onSelect(d)} onDragOver={e => { e.preventDefault(); setOver(d); }} onDragLeave={() => setOver(o => o === d ? null : o)}
              onDrop={e => { e.preventDefault(); setOver(null); onMove(e.dataTransfer.getData('text/plain'), d); }}>
              <span className="ag-cd">{parseD(d).getDate()}{d === window.AG_TODAY && <span className="ag-todaytag">Auj.</span>}{flag && <span className="ag-tag" style={{ marginLeft: 'auto' }}><AI.Warn /></span>}</span>
              <span className="ag-dots">{list.slice(0, 6).map(e => { const [bg, bd] = AG_TONE[window.AG_TYPES[e.type].tone]; return <span key={e.id} className="ag-dot" style={{ background: bg, border: `1px solid ${bd}` }} title={`${window.AG_TYPES[e.type].short} — ${e.title}`}></span>; })}</span>
              {list.slice(0, 2).map(e => <span key={e.id} className="ag-mini" data-type={e.type}>{e.time ? `${fmtHour(e.time)} ` : ''}{e.title}</span>)}
              {list.length > 2 && <span className="ag-more">+{list.length - 2} autre{list.length - 2 > 1 ? 's' : ''}</span>}
            </button>);
        })}
      </div>
    </div>);
};

/* ── PANNEAU DE JOURNÉE ── */
const DayPanel = ({ date, evs, conflicts, onMove, onNew }) => {
  const list = evs.filter(e => e.date === date).sort((a, b) => (a.time ? toMin(a.time) : -1) - (b.time ? toMin(b.time) : -1));
  const opts = [...Array(8)].map((_, i) => addDays(date, i - 2)).filter(d => d !== date);
  return (
    <div className="ag-panel">
      <div className="ag-panel-head">
        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <div className="lbl" style={{ marginBottom: 3 }}>Détail de la journée</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{capFirst(fmtLong(date))}</div>
        </div>
        {date === window.AG_TODAY && <AGPill label="Aujourd’hui" tone="green" sm />}
      </div>
      {list.length === 0 ? (
        <div className="empty">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: 'var(--green-fg)' }}><AI.Smile /></div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Journée vide</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5, marginBottom: 9 }}>Aucune échéance, aucun rendez-vous, aucun envoi programmé.</div>
          <button className="btn-out" style={{ fontSize: '0.6875rem' }} onClick={() => onNew(date)}><AI.Plus />Créer un rendez-vous</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map(e => {
            const t = window.AG_TYPES[e.type], Icon = AG_ICON[e.type], late = isLate(e), conf = conflicts.has(e.id);
            return (
              <div key={e.id} className="ag-det" style={late || conf ? { borderColor: 'var(--red-b)', background: 'var(--red-m)' } : undefined}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                  <AGPill label={t.short} tone={t.tone} sm icon={<Icon />} />
                  {e.time && <span style={{ fontSize: '0.625rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmtHour(e.time)}{e.dur ? ` → ${fmtHour(`${String(Math.floor((toMin(e.time) + e.dur) / 60)).padStart(2, '0')}:${String((toMin(e.time) + e.dur) % 60).padStart(2, '0')}`)}` : ''}</span>}
                  {late && <span className="ag-tag">Dépassée</span>}
                  {conf && <span className="ag-tag">Conflit</span>}
                  {e.done && <span className="ag-tag ok">Terminée</span>}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35, textWrap: 'pretty' }}>{e.title}</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{e.client ? window.AG_CLIENTS[e.client] : 'Tous clients'}{e.ref ? ` · ${e.ref}` : ''}</div>
                {conf && <div style={{ marginTop: 5, fontSize: '0.625rem', color: 'var(--red)', fontWeight: 600, lineHeight: 1.4 }}>Deux rendez-vous se chevauchent sur cette plage. Déplacez-en un.</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a href={e.link || t.link} className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.6rem', textDecoration: 'none' }}>{t.linkLabel}<AI.Arrow /></a>
                  {t.movable && !e.done && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.5625rem', color: 'var(--fg3)' }}>
                      Déplacer au
                      <select className="sel" style={{ padding: '0.25rem 0.4rem', minHeight: 28, fontSize: '0.625rem' }} value="" onChange={ev => ev.target.value && onMove(e.id, ev.target.value)} aria-label={`Déplacer l’échéance ${e.title}`}>
                        <option value="">choisir…</option>{opts.map(d => <option key={d} value={d}>{fmtLong(d)}</option>)}
                      </select>
                    </label>)}
                </div>
              </div>);
          })}
          <button className="btn-out" style={{ fontSize: '0.6875rem', justifyContent: 'center' }} onClick={() => onNew(date)}><AI.Plus />Créer un rendez-vous ce jour</button>
        </div>)}
      <div style={{ marginTop: 10, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Une échéance déplacée depuis l’agenda met à jour la tâche correspondante dans le plan d’action.</div>
    </div>);
};

/* ── CRÉATION DE RENDEZ-VOUS ── */
const NewRdvModal = ({ date, evs, onClose, onCreate }) => {
  const [f, setF] = useAG({ date, time: '10:00', dur: 60, client: 'AC', title: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const clash = evs.filter(e => e.type === 'rdv' && e.date === f.date && e.time).find(e => {
    const as = toMin(f.time), ae = as + Number(f.dur), bs = toMin(e.time), be = bs + (e.dur || 60);
    return as < be && bs < ae;
  });
  const days = [...Array(14)].map((_, i) => addDays(date, i - 3));
  const hours = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  return (
    <div className="ovl" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Créer un rendez-vous">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 800 }}>Créer un rendez-vous</div>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer"><AI.X /></button>
        </div>
        <div className="fld"><label htmlFor="nr-c">Client</label><select id="nr-c" value={f.client} onChange={e => set('client', e.target.value)}>{Object.entries(window.AG_CLIENTS).map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select></div>
        <div className="fld"><label htmlFor="nr-t">Objet du rendez-vous</label><input id="nr-t" value={f.title} onChange={e => set('title', e.target.value)} placeholder="Point mensuel, présentation d’audit…" /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="fld" style={{ flex: 2 }}><label htmlFor="nr-d">Jour</label><select id="nr-d" value={f.date} onChange={e => set('date', e.target.value)}>{days.map(d => <option key={d} value={d}>{fmtLong(d)}</option>)}</select></div>
          <div className="fld" style={{ flex: 1 }}><label htmlFor="nr-h">Heure</label><select id="nr-h" value={f.time} onChange={e => set('time', e.target.value)}>{hours.map(h => <option key={h} value={h}>{fmtHour(h)}</option>)}</select></div>
          <div className="fld" style={{ flex: 1 }}><label htmlFor="nr-u">Durée</label><select id="nr-u" value={f.dur} onChange={e => set('dur', e.target.value)}><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 h</option><option value="90">1 h 30</option></select></div>
        </div>
        {clash && <div className="note-box" style={{ background: 'var(--red-m)', borderColor: 'var(--red-b)', marginBottom: 10 }}><span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0 }}><AI.Warn /></span><div><b>Conflit d’horaire</b> avec « {clash.title} » ({fmtHour(clash.time)}). Vous pouvez enregistrer quand même — le conflit sera signalé dans l’agenda.</div></div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn-out" onClick={onClose}>Annuler</button>
          <button className="btn-pri" style={{ background: '#15803D', color: '#fff' }} disabled={!f.title.trim()} onClick={() => onCreate({ ...f, dur: Number(f.dur) })}>Enregistrer le rendez-vous</button>
        </div>
      </div>
    </div>);
};

Object.assign(window, { AI, AGPill, AG_TONE, AG_ICON, D_LONG, D_SHORT, M_LONG, parseD, isoD, addDays, fmtLong, fmtDM, fmtHour, capFirst, toMin, weekDays, monthGrid, isLate, conflictSet, AgLegend, RecapLine, EventBlock, WeekView, MonthView, DayPanel, NewRdvModal });
