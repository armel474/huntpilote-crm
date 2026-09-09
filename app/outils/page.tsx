import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  IcoChevR,
  IcoDoc,
  IcoFork,
  IcoGlobe,
  IcoIndex,
  IcoLink,
  IcoSrch,
  IcoUp,
  type IconProps,
} from '@/components/ui/Icons';
import { routes } from '@/lib/routes';

const TOOLS: { slug: string; label: string; desc: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  {
    slug: 'site-audit',
    label: 'Site Audit',
    desc: 'Crawl technique — indexation, erreurs, on-page, performance, structure.',
    Icon: IcoIndex,
  },
  {
    slug: 'position-tracking',
    label: 'Position Tracking',
    desc: "Suivi hebdomadaire de l'évolution des positions d'un client.",
    Icon: IcoUp,
  },
  {
    slug: 'backlink-analyse',
    label: 'Backlink Analyse',
    desc: 'Profil de liens entrants — gains et pertes récents.',
    Icon: IcoLink,
  },
  {
    slug: 'keyword-hunter',
    label: 'Keyword Hunter',
    desc: 'Explore des requêtes à cibler autour d’un mot-clé de départ.',
    Icon: IcoSrch,
  },
  {
    slug: 'keyword-gap',
    label: 'Keyword Gap',
    desc: 'Compare un client à ses concurrents, requête par requête.',
    Icon: IcoFork,
  },
  {
    slug: 'domain-overview',
    label: 'Domain Overview',
    desc: 'Qualifie vite un prospect, en un coup d’œil.',
    Icon: IcoGlobe,
  },
  {
    slug: 'organic-research',
    label: 'Organic Research',
    desc: 'Creuse le trafic et les positions d’un domaine avant de proposer.',
    Icon: IcoDoc,
  },
];

export const metadata: Metadata = { title: 'Outils SEO — HuntPilote' };

export default function OutilsPage() {
  return (
    <AppShell
      header={
        <CRMHeader
          title="Outils"
          subtitle="Les sept outils SEO du cabinet — tous rattachés à un compte."
          period=""
        />
      }
    >
      <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={routes.outil(t.slug)}
              className="card"
              style={{
                padding: '1.125rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: 'var(--bg-muted)',
                    color: 'var(--fg2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <t.Icon size={15} />
                </div>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, flex: 1 }}>{t.label}</h2>
                <span aria-hidden="true" style={{ color: 'var(--fg4)' }}>
                  <IcoChevR size={11} />
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', lineHeight: 1.5 }}>{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
