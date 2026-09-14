'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { IcoBuilding, IcoUsers, IcoDoc, IcoFolder, IcoCard, IcoTool } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { AGENCY_SECTIONS } from './sections';

const ICONS = { profil: IcoBuilding, equipe: IcoUsers, catalogue: IcoTool, offres: IcoCard, modeles: IcoDoc, documents: IcoFolder };

export function AgenceFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const section = AGENCY_SECTIONS.find((s) => pathname === routes.agence(s.id));
  return (
    <AppShell header={<CRMHeader title="Agence hub" period="" crumbs={[
      { label: 'HuntPilote', href: routes.dashboard() },
      { label: 'Agence hub', ...(section ? { href: routes.agence() } : {}) },
      ...(section ? [{ label: section.label }] : []),
    ]} />}>
      <div className="ag-layout">
        <nav className="ag-nav" aria-label="Sections de l’Agence hub">
          <Link href={routes.agence()} className="set-nav ag-home" aria-current={!section ? 'page' : undefined}>Accueil du hub</Link>
          <div className="lbl ag-nav-label">Agence</div>
          {AGENCY_SECTIONS.map((s) => {
            const Icon = ICONS[s.id];
            return <Link key={s.id} href={routes.agence(s.id)} className={`set-nav${section?.id === s.id ? ' on' : ''}`} aria-current={section?.id === s.id ? 'page' : undefined}>
              <Icon size={15} /><span>{s.label}{!s.available && <small className="ag-soon">À venir</small>}</span>
            </Link>;
          })}
          <Link className="set-nav ag-settings" href={routes.parametres()}>Paramètres de l’application</Link>
        </nav>
        <div className="sc ag-content"><div className="ag-inner">{children}</div></div>
      </div>
    </AppShell>
  );
}
