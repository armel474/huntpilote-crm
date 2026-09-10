/* HuntPilote — superpositions partagées : recherche globale (lanceur de commandes) et panneau de notifications.
   S'auto-montent sur tout écran portant le shell CRM : ⌘K / Ctrl K, le champ du header, la cloche. */
const { useState: useOv, useEffect: useOvE, useMemo: useOvM, useRef: useOvR } = React;

const OI = {
  Srch: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Bolt: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  User: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Task: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12.5l2.5 2.5L16 9" /></svg>,
  Alert: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Key: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 11l8-8 4 4-8 8H3z" /><circle cx="17.5" cy="6.5" r="2.5" /><line x1="7" y1="13" x2="11" y2="17" /></svg>,
  Doc: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Pin: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Bill: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  Clock: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Chart: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>,
  Star: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Plug: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v6M15 2v6" /><path d="M6 8h12v3a6 6 0 01-12 0V8z" /><line x1="12" y1="17" x2="12" y2="22" /></svg>,
  Send: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Trophy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17M14 14.66V17" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Spark: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  X: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Cog: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></svg>,
  CheckAll: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 13 5 17 13 7" /><polyline points="10 15 12 17 22 6" /></svg>,
  Bell: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
};

const O_TONE = { red: ['var(--o-red-m)', 'var(--o-red-b)', 'var(--o-red)'], yellow: ['var(--o-yellow-m)', 'var(--o-yellow-b)', 'var(--o-yellow)'], green: ['var(--o-green-m)', 'var(--o-green-b)', 'var(--o-green)'], blue: ['var(--o-blue-m)', 'var(--o-blue-b)', 'var(--o-blue)'], violet: ['var(--o-violet-m)', 'var(--o-violet-b)', 'var(--o-violet)'], neutral: ['var(--o-muted)', 'var(--o-bds)', 'var(--o-fg2)'] };
const S_ICON = { action: OI.Bolt, client: OI.User, prospect: OI.User, tache: OI.Task, priorite: OI.Alert, motcle: OI.Key, rapport: OI.Doc, etab: OI.Pin, facture: OI.Bill };
const N_ICON = { integration: OI.Plug, position: OI.Chart, sante: OI.Alert, facture: OI.Bill, liens: OI.Alert, avis: OI.Star, rapport: OI.Send, deal: OI.Trophy, agent: OI.Spark };
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const HP_KEYHINT = IS_MAC ? '⌘ K' : 'Ctrl K';
const GRP_CAP = 4;

const Mark = ({ text, q }) => {
  const n = (q || '').trim();
  if (!n) return text;
  const i = window.hsNorm(text).indexOf(window.hsNorm(n));
  if (i < 0) return text;
  return <React.Fragment>{text.slice(0, i)}<mark>{text.slice(i, i + n.length)}</mark>{text.slice(i + n.length)}</React.Fragment>;
};

/* ── RECHERCHE GLOBALE ── */
const GlobalSearch = ({ onClose }) => {
  const [q, setQ] = useOv('');
  const [idx, setIdx] = useOv(0);
  const [open, setOpen] = useOv({});
  const listRef = useOvR(null), inpRef = useOvR(null);
  useOvE(() => { inpRef.current && inpRef.current.focus(); }, []);

  const { groups, flat, hidden } = useOvM(() => {
    const hits = q.trim() ? window.hsSearch(q) : [];
    const byGrp = {};
    (q.trim() ? hits : []).forEach(it => { const g = window.HS_GROUP_OF(it.type); (byGrp[g] = byGrp[g] || []).push(it); });
    let gs = [];
    if (!q.trim()) {
      gs = [
        { key: 'recent', label: 'Consultés récemment', all: window.hsRecents() },
        { key: 'action', label: 'Actions rapides', all: window.HS_ACTIONS },
      ];
    } else {
      gs = window.HS_GROUPS.filter(g => byGrp[g] && byGrp[g].length).map(g => ({ key: g, label: window.HS_GROUP_LABEL[g], all: byGrp[g] }));
    }
    const out = gs.map(g => ({ ...g, items: open[g.key] ? g.all : g.all.slice(0, GRP_CAP) }));
    return { groups: out, flat: out.flatMap(g => g.items), hidden: out.reduce((a, g) => a + (g.all.length - g.items.length), 0) };
  }, [q, open]);

  useOvE(() => { setIdx(0); }, [q]);
  useOvE(() => {
    const c = listRef.current; if (!c) return;
    const el = c.querySelector(`[data-idx="${idx}"]`); if (!el) return;
    const top = el.offsetTop, bot = top + el.offsetHeight;
    if (top < c.scrollTop) c.scrollTop = top - 28; else if (bot > c.scrollTop + c.clientHeight) c.scrollTop = bot - c.clientHeight + 8;
  }, [idx, groups]);

  const go = it => { if (it && it.href) window.location.href = it.href; };
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(flat[idx]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  let k = -1;
  return (
    <div className="hp-ovl" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="hp-cmd" role="dialog" aria-modal="true" aria-label="Recherche globale">
        <div className="hp-cmd-top">
          <OI.Srch />
          <input ref={inpRef} className="hp-cmd-inp" value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Chercher un client, une tâche, un mot-clé — ou lancer une action" aria-label="Recherche globale" role="combobox" aria-expanded="true" aria-controls="hp-cmd-results" autoComplete="off" />
          <button className="hp-kbd" onClick={onClose} style={{ cursor: 'pointer' }}>Échap</button>
        </div>
        <div className="hp-cmd-list" id="hp-cmd-results" ref={listRef} style={{ position: 'relative' }} role="listbox">
          {flat.length === 0 ? (
            <div className="hp-none">
              <div className="hp-none-t">Aucun résultat pour « {q.trim()} »</div>
              <div className="hp-none-s">Rien dans les clients, les tâches, les priorités, les mots-clés suivis, les rapports, les établissements ni les factures.</div>
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="Onboarding.html" className="hp-btn" >Créer un client « {q.trim()} »</a>
                <a href="Audit Prospect.html" className="hp-btn" >Lancer un audit de prospection</a>
              </div>
            </div>
          ) : groups.map(g => (
            <div key={g.key}>
              <div className="hp-grp"><span className="hp-lbl">{g.label}</span><span className="hp-grp-n">{g.all.length}</span></div>
              {g.items.map(it => {
                k += 1; const my = k;
                const t = window.HS_TYPES[it.type], Icon = S_ICON[it.type], [bg, bd, fg] = O_TONE[t.tone];
                return (
                  <button key={it.id} type="button" className="hp-row" data-idx={my} role="option" aria-selected={my === idx}
                    onMouseMove={() => setIdx(my)} onClick={() => go(it)}>
                    <span className="hp-row-ico" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}><Icon /></span>
                    <span className="hp-row-b">
                      <span className="hp-row-t"><Mark text={it.label} q={q} /></span>
                      {it.sub && <span className="hp-row-m">{it.sub}</span>}
                    </span>
                    <span className="hp-row-type">{t.label}</span>
                    <span className="hp-row-go"><OI.Arrow /></span>
                  </button>);
              })}
              {g.all.length > g.items.length && (
                <button type="button" className="hp-more" onClick={() => setOpen(o => ({ ...o, [g.key]: true }))}>
                  <OI.Arrow />Voir les {g.all.length - g.items.length} autres résultats dans « {g.label} »
                </button>)}
            </div>))}
        </div>
        <div className="hp-cmd-foot">
          <span className="hp-hint"><span className="hp-kbd">↑ ↓</span> naviguer</span>
          <span className="hp-hint"><span className="hp-kbd">⏎</span> ouvrir</span>
          <span className="hp-hint"><span className="hp-kbd">Échap</span> fermer</span>
          <span style={{ marginLeft: 'auto' }}>{q.trim() ? `${flat.length + hidden} résultat${flat.length + hidden > 1 ? 's' : ''}` : `${flat.length} suggestions`}</span>
        </div>
      </div>
    </div>);
};

/* ── PANNEAU DE NOTIFICATIONS ── */
const N_SCENARIOS = [['normal', 'Vue normale'], ['afflux', 'Afflux après un audit'], ['lues', 'Tout est lu'], ['supprime', 'Objet supprimé'], ['vide', 'Aucune notification']];

const NotifPanel = ({ onClose, onUnread }) => {
  const [scenario, setScenario] = useOv(() => { try { return localStorage.getItem('hp-nf-scenario') || 'normal'; } catch { return 'normal'; } });
  const [items, setItems] = useOv(() => window.hnScenario(scenario));
  const [hiddenIds, setHidden] = useOv([]);
  const setSc = s => { setScenario(s); setItems(window.hnScenario(s)); setHidden([]); try { localStorage.setItem('hp-nf-scenario', s); } catch {} };
  const list = items.filter(n => !hiddenIds.includes(n.id));
  const unread = list.filter(n => n.unread).length;
  useOvE(() => { onUnread(unread); }, [unread]);
  const markAll = () => setItems(is => is.map(n => ({ ...n, unread: false })));
  const openOne = n => { if (n.gone) return; setItems(is => is.map(x => x.id === n.id ? { ...x, unread: false } : x)); if (n.href) window.location.href = n.href; };

  return (
    <div className="hp-ovl top-right" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="hp-notif" role="dialog" aria-modal="true" aria-label="Notifications">
        <div className="hp-nf-top">
          <span className="hp-nf-title">Notifications</span>
          {unread > 0 && <span className="hp-nf-count">{unread > window.HN_UNREAD_MAX ? `${window.HN_UNREAD_MAX}+` : unread} non lue{unread > 1 ? 's' : ''}</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <select className="hp-sel" value={scenario} onChange={e => setSc(e.target.value)} aria-label="État de démonstration">{N_SCENARIOS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
            <button className="hp-x" onClick={onClose} aria-label="Fermer les notifications"><OI.X /></button>
          </div>
        </div>
        {list.length > 0 && (
          <div className="hp-nf-bar">
            <button className="hp-btn"  onClick={markAll} disabled={unread === 0}><OI.CheckAll />Tout marquer comme lu</button>
            <a href="Parametres.html" className="hp-btn"><OI.Cog />Réglages des notifications</a>
          </div>)}
        <div className="hp-nf-list">
          {list.length === 0 ? (
            <div className="hp-none">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'var(--o-fg4)' }}><OI.Bell /></div>
              <div className="hp-none-t">Aucune notification</div>
              <div className="hp-none-s">Les automatisations et l’agent n’ont rien signalé. Les chutes de position, les liens brisés, les avis négatifs et les jetons expirés arrivent ici.</div>
              <a href="Parametres.html" className="hp-btn" ><OI.Cog />Réglages des notifications</a>
            </div>
          ) : window.HN_DAYS.map(([day, label]) => {
            const group = list.filter(n => n.day === day);
            if (!group.length) return null;
            const un = group.filter(n => n.unread).length;
            return (
              <div key={day}>
                <div className="hp-nf-day"><span className="hp-lbl">{label}</span><span className="hp-grp-n">{group.length}{un > 0 ? ` · ${un} non lue${un > 1 ? 's' : ''}` : ''}</span></div>
                {group.map(n => {
                  const kd = window.HN_KINDS[n.kind], Icon = N_ICON[n.kind], [bg, bd, fg] = O_TONE[kd.tone];
                  const crit = !!kd.crit && n.unread;
                  return (
                    <div key={n.id} className={`hp-nf${n.unread ? ' unread' : ''}${crit ? ' crit' : ''}${n.gone ? ' gone' : ''}`}
                      role={n.gone ? undefined : 'button'} tabIndex={n.gone ? undefined : 0}
                      onClick={() => openOne(n)} onKeyDown={e => { if (!n.gone && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openOne(n); } }}>
                      <span className="hp-nf-ico" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}><Icon /></span>
                      <div className="hp-nf-b">
                        <div className="hp-nf-t">{n.title}</div>
                        <div className="hp-nf-x">{n.gone ? n.goneNote : n.body}</div>
                        <div className="hp-nf-meta">
                          {crit && <span className="hp-nf-tag"><OI.Alert />Critique</span>}
                          <span style={{ fontWeight: 700 }}>{kd.label}</span><span>·</span><span>{kd.source}</span><span>·</span><span>{n.at}</span>
                        </div>
                        {n.gone
                          ? <button className="hp-btn" style={{ marginTop: 7 }} onClick={e => { e.stopPropagation(); setHidden(h => [...h, n.id]); }}>Masquer cette notification</button>
                          : <span className="hp-nf-cta">{n.cta}<OI.Arrow /></span>}
                      </div>
                      {n.unread && <span className="hp-nf-dot" aria-label="Non lue"></span>}
                    </div>);
                })}
              </div>);
          })}
        </div>
        {list.length > 0 && <div className="hp-nf-foot"><span style={{ fontSize: '0.5625rem', color: 'var(--o-fg3)', lineHeight: 1.6 }}>Chaque notification mène à son objet. Les critiques portent une étiquette, pas seulement une couleur.</span></div>}
      </div>
    </div>);
};

/* ── HÔTE ET MONTAGE AUTOMATIQUE ── */
/* Deux générations de header cohabitent dans le projet : la cloche porte parfois title="Notifications",
   parfois rien du tout — on la reconnaît alors à son tracé. Le champ de recherche, à son placeholder. */
const BELL_PATH = 'svg path[d^="M18 8A6 6"]';
const SEARCH_SEL = '.search-inp,input[aria-label="Rechercher"],input[placeholder^="Rechercher"]';
const bellOf = t => {
  const b = t && t.closest && t.closest('button');
  if (!b) return null;
  return (b.getAttribute('title') === 'Notifications' || b.querySelector(BELL_PATH)) ? b : null;
};
const allBells = () => [...document.querySelectorAll('button')].filter(b => b.getAttribute('title') === 'Notifications' || b.querySelector(BELL_PATH));

const OverlayHost = () => {
  const [open, setOpenOv] = useOv(null);
  useOvE(() => {
    const onKey = e => {
      const k = (e.key || '').toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); setOpenOv(o => o === 'search' ? null : 'search'); }
      else if (k === 'escape') setOpenOv(null);
    };
    const onFocus = e => {
      const t = e.target;
      if (t && t.matches && t.matches(SEARCH_SEL)) { t.blur(); setOpenOv('search'); }
    };
    const onClick = e => {
      if (e.target.closest && e.target.closest('#hp-overlay-root')) return;
      if (bellOf(e.target)) { e.preventDefault(); e.stopPropagation(); setOpenOv(o => o === 'notif' ? null : 'notif'); return; }
      if (e.target.matches && e.target.matches(SEARCH_SEL)) { e.preventDefault(); setOpenOv('search'); }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('click', onClick, true);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('focusin', onFocus); document.removeEventListener('click', onClick, true); };
  }, []);
  useOvE(() => {
    const hint = () => document.querySelectorAll(SEARCH_SEL).forEach(i => {
      const w = i.parentElement; if (!w || w.querySelector('.hp-kbd')) return;
      if (getComputedStyle(w).position === 'static') w.style.position = 'relative';
      const s = document.createElement('span');
      s.className = 'hp-kbd'; s.textContent = HP_KEYHINT;
      s.style.cssText = 'position:absolute;right:7px;top:50%;transform:translateY(-50%);pointer-events:none;z-index:2';
      w.appendChild(s);
      i.style.paddingRight = IS_MAC ? '42px' : '50px';
      i.setAttribute('title', `Recherche globale (${HP_KEYHINT})`);
    });
    hint(); const t = setTimeout(hint, 800); return () => clearTimeout(t);
  }, []);
  const onUnread = n => { allBells().forEach(b => b.querySelectorAll(':scope > span').forEach(s => { s.style.display = n === 0 ? 'none' : ''; })); };
  return (
    <React.Fragment>
      {open === 'search' && <GlobalSearch onClose={() => setOpenOv(null)} />}
      {open === 'notif' && <NotifPanel onClose={() => setOpenOv(null)} onUnread={onUnread} />}
    </React.Fragment>);
};

(function mountHpOverlays() {
  if (document.getElementById('hp-overlay-root')) return;
  const el = document.createElement('div');
  el.id = 'hp-overlay-root';
  document.body.appendChild(el);
  ReactDOM.createRoot(el).render(<OverlayHost />);
})();

Object.assign(window, { OI, O_TONE, GlobalSearch, NotifPanel, OverlayHost, HP_KEYHINT });
