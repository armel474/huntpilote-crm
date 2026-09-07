'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IcoCog,
  IcoDash,
  IcoLogo,
  IcoPipe,
  IcoTool,
  IcoUsers,
  IcoZap,
  type IconProps,
} from '@/components/ui/Icons';

type NavItem = {
  href: string;
  label: string;
  Icon: (p: IconProps) => React.ReactElement;
  /** Préfixes d'URL qui allument aussi cette entrée (ex. la fiche client sous Client Hub). */
  match?: string[];
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: IcoDash },
  { href: '/clients', label: 'Client Hub', Icon: IcoUsers, match: ['/clients', '/onboarding'] },
  { href: '/pipeline', label: 'Pipeline', Icon: IcoPipe },
  { href: '/workflow', label: 'Workflow', Icon: IcoZap },
  { href: '/outils', label: 'Outil', Icon: IcoTool },
];

function LogoMark() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        background: 'var(--primary)',
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--primary-fg)',
      }}
    >
      <IcoLogo />
    </div>
  );
}

export function NavSidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    (item.match ?? [item.href]).some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

  return (
    <nav className="nav-sidebar" aria-label="Navigation principale">
      <div
        style={{
          padding: '15px 0 13px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Link href="/dashboard" aria-label="HuntPilote — accueil">
          <LogoMark />
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-cpt${active ? ' active' : ''}`}
              data-label={item.label}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <item.Icon />
            </Link>
          );
        })}
      </div>

      <div
        style={{
          padding: '8px 0',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Link
          href="/parametres"
          className={`nav-cpt${pathname.startsWith('/parametres') ? ' active' : ''}`}
          data-label="Paramètres"
          aria-label="Paramètres"
        >
          <IcoCog />
        </Link>
      </div>
    </nav>
  );
}
