'use client';

/**
 * En-tête de compte et navigation du portail client — partagé par les trois
 * écrans authentifiés (`/portail`, `/portail/rapports`, `/portail/echanges`).
 * Pas de `.app-shell` ni de `NavSidebar` : c'est un espace séparé du cockpit.
 */
import { useTheme } from '@/components/shell/ThemeProvider';
import { IcoCal, IcoDoc, IcoLogo, IcoMoon, IcoMsg, IcoOut, IcoSun } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';

type Tab = 'tableau' | 'rapports' | 'echanges';

const TABS: readonly { id: Tab; label: string; href: string; Icon: typeof IcoCal }[] = [
  { id: 'tableau', label: 'Votre mois', href: routes.portail(), Icon: IcoCal },
  { id: 'rapports', label: 'Vos rapports', href: routes.portailRapports(), Icon: IcoDoc },
  { id: 'echanges', label: 'Échanges', href: routes.portailEchanges(), Icon: IcoMsg },
];

export function PortalHeader({
  active,
  client,
  person,
  initials,
  pm,
  unread = 0,
}: {
  active: Tab;
  client: string;
  person: string;
  initials: string;
  pm: string;
  unread?: number;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="pc-top">
      <div className="pc-top-in">
        <div className="pc-brand">
          <span className="pc-mark" aria-hidden="true">
            <IcoLogo size={17} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {client}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>Votre espace client · suivi par {pm}</div>
          </div>
        </div>
        <div className="pc-acct">
          <button
            type="button"
            className="pc-icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            aria-label="Changer de thème"
          >
            {theme === 'dark' ? <IcoSun size={14} /> : <IcoMoon size={14} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pc-avatar">{initials}</span>
            <div style={{ minWidth: 0 }}>
              <div className="pc-acct-n">{person}</div>
              <div className="pc-acct-m">Client HuntPilote</div>
            </div>
          </div>
          <a href={routes.portailConnexion()} className="pc-icon" title="Se déconnecter" aria-label="Se déconnecter">
            <IcoOut size={14} />
          </a>
        </div>
      </div>
      <nav className="pc-tabs" aria-label="Navigation de votre espace">
        <div className="pc-tabs-in">
          {TABS.map((t) => (
            <a key={t.id} href={t.href} className={`pc-tab${t.id === active ? ' on' : ''}`} aria-current={t.id === active ? 'page' : undefined}>
              <t.Icon size={14} />
              {t.label}
              {t.id === 'echanges' && unread > 0 && <span className="pc-badge">{unread}</span>}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
