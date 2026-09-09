/* HuntPilote — NavSidebar rétractable partagée. <NavSidebar active="clienthub" /> — exporté sur window. */
const { useState: useSbState } = React;
const SB_KEY = 'huntpilote-sidebar-compact';
const SbI = {
  Logo: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  Dash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  Users: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  Pipe: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  Zap: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Cal: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Tool: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>,
  Cog: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></svg>,
  Chev: ({ deg = 0 }) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: `rotate(${deg}deg)`, transition: 'transform 200ms' }} aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>,
  Collapse: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><polyline points="15 9 12 12 15 15" /></svg>,
  Expand: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><polyline points="12 9 15 12 12 15" /></svg>,
  Arrow: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};
const SB_NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: SbI.Dash, href: 'Dashboard.html' },
  { id: 'clienthub', label: 'Client hub', Icon: SbI.Users, href: 'Client Hub.html' },
  { id: 'pipeline', label: 'Pipeline', Icon: SbI.Pipe, href: 'Pipeline.html' },
  { id: 'workflow', label: 'Workflow', Icon: SbI.Zap, href: 'Workflow.html' },
  { id: 'agenda', label: 'Agenda', Icon: SbI.Cal },
];
const SB_TOOLS = [{ l: 'Keyword Hunter' }, { l: 'Domain Overview' }, { l: 'Organic Research' }, { l: 'Keyword Gap' }, { l: 'Position Tracking', href: 'Position Tracking.html' }, { l: 'Site Audit', href: 'Site Audit.html' }, { l: 'Backlink Analyse', href: 'Backlink Analyse.html' }];

const NavSidebar = ({ active, activeTool }) => {
  const [compact, setCompact] = useSbState(() => { try { return localStorage.getItem(SB_KEY) === '1'; } catch { return false; } });
  const [toolsOpen, setToolsOpen] = useSbState(true);
  const toggle = () => setCompact(c => { const n = !c; try { localStorage.setItem(SB_KEY, n ? '1' : '0'); } catch {} return n; });
  const go = href => href && (window.location.href = href);
  const Logo = () => <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary-fg)' }}><SbI.Logo /></div>;

  if (compact) return (
    <nav className="sidebar compact" aria-label="Navigation principale">
      <div className="sidebar-head"><a href="Dashboard.html" aria-label="HuntPilote — accueil"><Logo /></a></div>
      <div className="sidebar-body">
        {[...SB_NAV, { id: 'outil', label: 'Outil', Icon: SbI.Tool }].map(it => <button key={it.id} type="button" className={`nav-cpt${it.id === active ? ' active' : ''}`} data-label={it.label} aria-label={it.label} aria-current={it.id === active ? 'page' : undefined} onClick={() => go(it.href)}><it.Icon /></button>)}
      </div>
      <div className="sidebar-foot">
        <button type="button" className={`nav-cpt${active === 'parametres' ? ' active' : ''}`} data-label="Paramètres" aria-label="Paramètres" onClick={() => go('Parametres.html')}><SbI.Cog /></button>
        <button type="button" className="nav-cpt side-toggle" data-label="Agrandir le menu" aria-label="Agrandir la barre latérale" aria-expanded={false} onClick={toggle}><SbI.Expand /></button>
      </div>
    </nav>);

  return (
    <nav className="sidebar" aria-label="Navigation principale">
      <div className="sidebar-head">
        <a href="Dashboard.html" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}><Logo /><span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--fg1)', letterSpacing: '-0.025em' }}>HuntPilote</span></a>
      </div>
      <div className="sidebar-body">
        {SB_NAV.map(it => <button key={it.id} type="button" className={`nav-item${it.id === active ? ' active' : ''}`} aria-current={it.id === active ? 'page' : undefined} onClick={() => go(it.href)}><it.Icon />{it.label}</button>)}
        <button type="button" className={`nav-item${active === 'outil' ? ' active' : ''}`} style={{ marginTop: '0.25rem' }} onClick={() => setToolsOpen(o => !o)} aria-expanded={toolsOpen}><SbI.Tool />Outil<span style={{ marginLeft: 'auto', color: 'var(--fg4)', display: 'flex' }}><SbI.Chev deg={toolsOpen ? 180 : 0} /></span></button>
        {toolsOpen && <div>{SB_TOOLS.map(t => <button key={t.l} type="button" className={`nav-sub-item${t.l === activeTool ? ' active' : ''}`} aria-current={t.l === activeTool ? 'page' : undefined} onClick={() => go(t.href)}><span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: '50%', background: t.l === activeTool ? 'var(--green-fg)' : 'var(--fg4)', flexShrink: 0 }}></span>{t.l}</button>)}</div>}
      </div>
      <div className="sidebar-foot">
        <button type="button" className={`nav-item${active === 'parametres' ? ' active' : ''}`} onClick={() => go('Parametres.html')}><SbI.Cog />Paramètres<span style={{ marginLeft: 'auto', color: 'var(--fg4)', display: 'flex' }}><SbI.Arrow /></span></button>
        <button type="button" className="nav-item side-toggle" onClick={toggle} aria-label="Réduire la barre latérale" aria-expanded={true}><SbI.Collapse /><span style={{ fontSize: '0.8125rem' }}>Réduire</span></button>
      </div>
    </nav>);
};

Object.assign(window, { NavSidebar, SbI });
