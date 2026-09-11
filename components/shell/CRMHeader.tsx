'use client';

import Link from 'next/link';
import { useTheme } from '@/components/shell/ThemeProvider';
import { HP_KEYHINT, useOverlays } from '@/components/shell/Overlays';
import { IcoBell, IcoChevD, IcoCog, IcoMoon, IcoSrch, IcoSun } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';

export type Crumb = { label: string; href?: string };

type Props = {
  /** Titre principal de la page (ex. « Acme Corp. » ou « Dashboard »). */
  title: string;
  /** Fil d'Ariane affiché sous le titre, à la place de `subtitle`. */
  crumbs?: Crumb[];
  /** Sous-titre simple, si aucun fil d'Ariane n'est fourni. */
  subtitle?: string;
  /** Libellé de la pastille de période. Masquée si absent. */
  period?: string;
  /** Contenu additionnel inséré avant les icônes d'action. */
  children?: React.ReactNode;
};

export function CRMHeader({ title, crumbs, subtitle, period = 'Mai 2026', children }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { openSearch, openNotif, unreadCount } = useOverlays();

  return (
    <header className="crm-header">
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: '1.0625rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--fg1)',
            lineHeight: 1,
          }}
        >
          {title}
        </h1>

        {crumbs ? (
          <nav
            aria-label="Fil d'Ariane"
            style={{
              fontSize: '0.6875rem',
              color: 'var(--fg3)',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexWrap: 'wrap',
            }}
          >
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {i > 0 && <span style={{ color: 'var(--bd-strong)' }}>›</span>}
                {c.href ? (
                  <Link href={c.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {c.label}
                  </Link>
                ) : (
                  <span style={{ color: i === crumbs.length - 1 ? 'var(--fg2)' : undefined }}>
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : subtitle ? (
          <p style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 2 }}>{subtitle}</p>
        ) : null}
      </div>

      {children}

      <div className="search-wrap">
        <span className="search-ico">
          <IcoSrch />
        </span>
        <input
          className="search-inp"
          placeholder="Rechercher…"
          aria-label={`Recherche globale (${HP_KEYHINT})`}
          title={`Recherche globale (${HP_KEYHINT})`}
          readOnly
          onFocus={(e) => {
            e.target.blur();
            openSearch();
          }}
          onClick={openSearch}
          style={{ paddingRight: 42 }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 7,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 5px',
            borderRadius: 5,
            background: 'var(--bg-muted)',
            border: '1px solid var(--bd-solid)',
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--fg3)',
            whiteSpace: 'nowrap',
            lineHeight: 1.6,
          }}
        >
          {HP_KEYHINT}
        </span>
      </div>

      {period && (
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '0.325rem 0.7rem',
            borderRadius: 999,
            border: '1px solid var(--bd-solid)',
            background: 'var(--bg-solid)',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--fg2)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font)',
          }}
        >
          {period} <IcoChevD />
        </button>
      )}

      <button className="btn-icon" type="button" aria-label="Notifications" onClick={openNotif}>
        <IcoBell />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
              width: 6,
              height: 6,
              background: 'var(--red)',
              borderRadius: '50%',
              border: '1.5px solid var(--bg-base)',
            }}
          />
        )}
      </button>

      <button
        className="btn-icon"
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
      >
        {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
      </button>

      <div
        aria-label="Marie Chen"
        title="Marie Chen"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--green-m)',
          color: 'var(--green-fg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.625rem',
          fontWeight: 700,
          flexShrink: 0,
          border: '1.5px solid var(--green-b)',
        }}
      >
        MC
      </div>

      <Link className="btn-icon" href={routes.parametres()} aria-label="Paramètres">
        <IcoCog />
      </Link>
    </header>
  );
}
