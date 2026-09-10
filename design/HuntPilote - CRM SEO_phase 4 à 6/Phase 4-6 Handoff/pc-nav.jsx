/* HuntPilote — portail client : en-tête de compte et navigation, partagés par les trois écrans du portail. */
const { useState: usePN } = React;

const PNI = {
  Logo: ({ dark }) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={dark ? '#18181B' : '#fff'} strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  Out: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Lock: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Doc: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Chat: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  Home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>,
  Clip: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Check2: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 13 5 17 13 7" /><polyline points="10 15 12 17 22 6" /></svg>,
  Clock: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
};

const PC_TABS = [
  { id: 'tableau', label: 'Votre mois', href: 'Portail.html', Icon: PNI.Home },
  { id: 'rapports', label: 'Vos rapports', href: 'Portail Rapports.html', Icon: PNI.Doc },
  { id: 'echanges', label: 'Échanges', href: 'Portail Echanges.html', Icon: PNI.Chat },
];

const PortalHeader = ({ theme, onToggleTheme, active, unread = 0 }) => {
  const A = window.PC_ACCOUNT;
  return (
    <div className="pc-top">
      <div className="pc-top-in">
        <div className="pc-brand">
          <span className="pc-mark" style={{ width: 32, height: 32, borderRadius: 9 }}><PNI.Logo dark={theme === 'dark'} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{A.client}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>Votre espace client · suivi par {A.pm}</div>
          </div>
        </div>
        <div className="pc-acct">
          <button className="pc-icon" onClick={onToggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'} aria-label="Changer de thème">{theme === 'dark' ? '☀' : '☾'}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pc-avatar">{A.initials}</span>
            <div style={{ minWidth: 0 }}>
              <div className="pc-acct-n">{A.person}</div>
              <div className="pc-acct-m">Cliente depuis {A.since}</div>
            </div>
          </div>
          <a href="Portail Connexion.html" className="pc-icon" title="Se déconnecter" aria-label="Se déconnecter"><PNI.Out /></a>
        </div>
      </div>
      <nav className="pc-tabs" aria-label="Navigation de votre espace">
        <div className="pc-tabs-in">
          {PC_TABS.map(t => (
            <a key={t.id} href={t.href} className={`pc-tab${t.id === active ? ' on' : ''}`} aria-current={t.id === active ? 'page' : undefined}>
              <t.Icon />{t.label}
              {t.id === 'echanges' && unread > 0 && <span className="pc-badge">{unread}</span>}
            </a>))}
        </div>
      </nav>
    </div>);
};

Object.assign(window, { PNI, PC_TABS, PortalHeader });
