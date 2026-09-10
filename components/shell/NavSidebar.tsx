'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  IcoAlert,
  IcoCal,
  IcoCog,
  IcoDash,
  IcoDoc,
  IcoLogo,
  IcoPin,
  IcoPipe,
  IcoTaskCheck,
  IcoTool,
  IcoUsers,
  IcoZap,
  type IconProps,
} from '@/components/ui/Icons';

const COMPACT_STORAGE_KEY = 'huntpilote-sidebar-compact';

type NavItem = {
  href: string;
  label: string;
  Icon: (p: IconProps) => React.ReactElement;
  /** Préfixes d'URL qui allument aussi cette entrée (ex. la fiche client sous Client Hub). */
  match?: string[];
};

/** Ordre validé en revue de design, phases 1 à 4. */
const TOP_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: IcoDash },
  { href: '/travail', label: 'Mon plan de travail', Icon: IcoTaskCheck },
  { href: '/priorites', label: 'Priorités transversales', Icon: IcoAlert },
  { href: '/agenda', label: 'Agenda', Icon: IcoCal },
  { href: '/rapports', label: 'Rapports à produire', Icon: IcoDoc },
  { href: '/clients', label: 'Client hub', Icon: IcoUsers, match: ['/clients', '/onboarding'] },
  { href: '/pipeline', label: 'Pipeline', Icon: IcoPipe },
  { href: '/workflow', label: 'Workflow', Icon: IcoZap },
];

/** Section complète, au même niveau que les outils (décision 8) — session 3.1. */
const LOCAL_ITEM: NavItem = { href: '/local', label: 'SEO local', Icon: IcoPin };

/** Les sept outils du cadre commun (session 2.1) — ordre validé en revue de design. */
const TOOLS: { label: string; slug: string }[] = [
  { label: 'Keyword Hunter', slug: 'keyword-hunter' },
  { label: 'Domain Overview', slug: 'domain-overview' },
  { label: 'Organic Research', slug: 'organic-research' },
  { label: 'Keyword Gap', slug: 'keyword-gap' },
  { label: 'Position Tracking', slug: 'position-tracking' },
  { label: 'Site Audit', slug: 'site-audit' },
  { label: 'Backlink Analyse', slug: 'backlink-analyse' },
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

function IcoChevron({ deg = 0 }: { deg?: number }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ transform: `rotate(${deg}deg)`, transition: 'transform 200ms' }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IcoCollapse() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="15 9 12 12 15 15" />
    </svg>
  );
}

function IcoExpand() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="12 9 15 12 12 15" />
    </svg>
  );
}

function IcoArrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function NavSidebar() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);

  useEffect(() => {
    try {
      setCompact(localStorage.getItem(COMPACT_STORAGE_KEY) === '1');
    } catch {
      /* stockage indisponible : la sidebar reste dépliée */
    }
  }, []);

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COMPACT_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* la bascule reste effective pour la session en cours */
      }
      return next;
    });
  };

  const isActive = (item: Pick<NavItem, 'href' | 'match'>) =>
    (item.match ?? [item.href]).some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

  const settingsActive = pathname.startsWith('/parametres');
  const toolsActive = pathname.startsWith('/outils');

  /* ── Vue compacte : icônes seules + tooltips ── */
  if (compact) {
    const items: NavItem[] = [...TOP_NAV, LOCAL_ITEM, { href: '/outils', label: 'Outil', Icon: IcoTool }];
    return (
      <nav className="sidebar compact" aria-label="Navigation principale">
        <div className="sidebar-head">
          <Link href="/dashboard" aria-label="HuntPilote — accueil">
            <LogoMark />
          </Link>
        </div>

        <div className="sidebar-body">
          {items.map((item) => {
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
                <item.Icon size={15} />
              </Link>
            );
          })}
        </div>

        <div className="sidebar-foot">
          <Link
            href="/parametres"
            className={`nav-cpt${settingsActive ? ' active' : ''}`}
            data-label="Paramètres"
            aria-label="Paramètres"
          >
            <IcoCog size={15} />
          </Link>
          <button
            type="button"
            className="nav-cpt side-toggle"
            data-label="Agrandir"
            aria-label="Agrandir la barre latérale"
            aria-expanded={false}
            onClick={toggleCompact}
          >
            <IcoExpand />
          </button>
        </div>
      </nav>
    );
  }

  /* ── Vue dépliée ── */
  return (
    <nav className="sidebar" aria-label="Navigation principale">
      <div className="sidebar-head">
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
          }}
        >
          <LogoMark />
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--fg-1)',
              letterSpacing: '-0.025em',
            }}
          >
            HuntPilote
          </span>
        </Link>
      </div>

      <div className="sidebar-body">
        {TOP_NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <item.Icon size={15} />
              {item.label}
            </Link>
          );
        })}

        <Link
          href={LOCAL_ITEM.href}
          className={`nav-item${isActive(LOCAL_ITEM) ? ' active' : ''}`}
          aria-current={isActive(LOCAL_ITEM) ? 'page' : undefined}
        >
          <LOCAL_ITEM.Icon size={15} />
          {LOCAL_ITEM.label}
        </Link>

        <button
          type="button"
          className={`nav-item${toolsActive ? ' active' : ''}`}
          style={{ marginTop: '0.25rem' }}
          onClick={() => setToolsOpen((o) => !o)}
          aria-expanded={toolsOpen}
        >
          <IcoTool size={15} />
          Outil
          <span className="nav-trail" style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}>
            <IcoChevron deg={toolsOpen ? 180 : 0} />
          </span>
        </button>

        {toolsOpen && (
          <div>
            {TOOLS.map((tool) => {
              const active = pathname.startsWith(`/outils/${tool.slug}`);
              return (
                <Link
                  key={tool.slug}
                  href={`/outils/${tool.slug}`}
                  className={`nav-sub-item${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: active ? 'var(--green-fg)' : 'var(--fg-4)',
                      flexShrink: 0,
                    }}
                  />
                  {tool.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="sidebar-foot">
        <Link
          href="/parametres"
          className={`nav-item${settingsActive ? ' active' : ''}`}
          aria-current={settingsActive ? 'page' : undefined}
        >
          <IcoCog size={15} />
          Paramètres
          <span className="nav-trail" style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}>
            <IcoArrow />
          </span>
        </Link>
        <button
          type="button"
          className="nav-item side-toggle"
          style={{ color: 'var(--fg-4)' }}
          onClick={toggleCompact}
          aria-label="Réduire la barre latérale"
          aria-expanded
        >
          <IcoCollapse />
          <span style={{ fontSize: '0.8125rem' }}>Réduire</span>
        </button>
      </div>
    </nav>
  );
}
