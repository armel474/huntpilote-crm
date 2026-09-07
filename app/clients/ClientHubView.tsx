'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ClientCard, ProspectCard, type CardView } from '@/components/clients/ClientCards';
import { CLIENTS, HUB_KPIS } from '@/lib/data/clients';
import { IcoDl, IcoDown, IcoGrid, IcoList, IcoPlus, IcoUp } from '@/components/ui/Icons';

type Filter = 'all' | 'client' | 'prospect';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'client', label: 'Clients' },
  { value: 'prospect', label: 'Prospects' },
];

/** Style commun aux segments de bascule (filtres, vue grille/liste). */
function segmentStyle(active: boolean): React.CSSProperties {
  return {
    border: 'none',
    cursor: 'pointer',
    transition: 'all 140ms',
    fontFamily: 'var(--font)',
    background: active ? 'var(--bg-surface-solid)' : 'transparent',
    color: active ? 'var(--fg-1)' : 'var(--fg-4)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  };
}

export function ClientHubView() {
  const [view, setView] = useState<CardView>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      if (filter !== 'all' && c.type !== filter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, search]);

  return (
    <AppShell
      header={
        <CRMHeader
          title="Client Hub"
          subtitle="12 clients · 8 prospects · mai 2026"
          period=""
        />
      }
    >
      {/* Barre d'outils : KPIs, filtres, bascule de vue, actions */}
      <div
        style={{
          padding: '0.625rem 1.125rem',
          borderBottom: '1px solid var(--border-solid)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          background: 'var(--bg-base)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 460, flexWrap: 'wrap' }}>
          {HUB_KPIS.map((k) => (
            <div
              key={k.label}
              className="card"
              style={{
                padding: '0.625rem 0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flex: '1 1 140px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'var(--fg-4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 3,
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--fg-1)',
                    letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {k.value}
                </div>
              </div>
              {k.up === null ? (
                <div style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--fg-4)' }}>
                  {k.sub}
                </div>
              ) : (
                <div
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: k.up ? 'var(--accent)' : 'var(--error)',
                    background: k.up ? 'var(--accent-muted)' : 'var(--error-bg)',
                    padding: '2px 7px',
                    borderRadius: 9999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {k.up ? <IcoUp size={10} /> : <IcoDown size={10} />}
                  {k.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recherche */}
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder="Rechercher un client…"
            aria-label="Rechercher un client"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200, fontSize: '0.75rem' }}
          />
        </div>

        {/* Filtres */}
        <div
          role="tablist"
          aria-label="Filtrer par type"
          style={{
            display: 'flex',
            gap: 3,
            background: 'var(--bg-muted)',
            padding: 3,
            borderRadius: 'var(--radius-full)',
          }}
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              style={{
                ...segmentStyle(filter === value),
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bascule grille / liste */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            background: 'var(--bg-muted)',
            padding: 3,
            borderRadius: 8,
          }}
        >
          {([
            { value: 'grid' as const, Icon: IcoGrid, label: 'Vue grille' },
            { value: 'list' as const, Icon: IcoList, label: 'Vue liste' },
          ]).map(({ value, Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-label={label}
              aria-pressed={view === value}
              style={{
                ...segmentStyle(view === value),
                width: 28,
                height: 26,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        <Link className="btn-primary" href="/onboarding">
          <IcoPlus size={13} />
          Ajouter
        </Link>
        <button className="btn-outline" type="button">
          <IcoDl size={13} />
          Export CSV
        </button>
      </div>

      <div className="content">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-4)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg-2)' }}>
              Aucun résultat
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: 6 }}>
              Aucun client ou prospect ne correspond à cette recherche.
            </p>
          </div>
        ) : (
          <div className={view === 'grid' ? 'cards-grid' : 'cards-list'}>
            {filtered.map((c) =>
              c.type === 'client' ? (
                <ClientCard key={c.id} c={c} view={view} />
              ) : (
                <ProspectCard key={c.id} c={c} view={view} />
              ),
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
