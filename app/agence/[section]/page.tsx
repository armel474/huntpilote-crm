import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AgencePanel } from '@/app/parametres/AgencePanel';
import { EquipePanel } from '@/app/parametres/EquipePanel';
import { CataloguePanel } from '@/app/parametres/CataloguePanel';
import { Notice, SectionHead } from '@/app/parametres/bits';
import { loadAgencyScreen } from '@/lib/queries/agence-screen';
import { permissionsOf } from '@/lib/queries/agence';
import { routes } from '@/lib/routes';
import { AgencyAccess } from '../AgencyAccess';
import { AGENCY_SECTIONS } from '../sections';

export const dynamic = 'force-dynamic';

export default async function AgencySectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const selected = AGENCY_SECTIONS.find((s) => s.id === section);
  if (!selected) notFound();
  if (!selected.available) return <>
    <SectionHead title={selected.label} sub="Cette section sera réalisée dans une prochaine étape." />
    <Notice tone="warn">{section === 'offres'
      ? 'Le constructeur d’offres n’est pas encore disponible. Les offres existantes restent consultables dans le catalogue.'
      : 'La gestion des modèles, la liste et la génération documentaire ne sont pas encore disponibles dans l’Agence hub.'}</Notice>
    <Link className="btn-out" href={routes.agence(section === 'offres' ? 'catalogue' : undefined)}>{section === 'offres' ? 'Consulter le catalogue et les offres' : 'Retour à l’accueil du hub'}</Link>
  </>;
  const { session, data, configured } = await loadAgencyScreen();
  const mine = permissionsOf(data.members, session?.memberId);
  return <>
    <AgencyAccess configured={configured} session={session} />
    {section === 'profil' && <AgencePanel agency={data.agency} canEdit={mine.includes('manage_agency')} />}
    {section === 'equipe' && <EquipePanel members={data.members} session={session} roleDefaults={data.roleDefaults} canManage={mine.includes('manage_team')} />}
    {section === 'catalogue' && <><Notice tone="warn">Catalogue existant en lecture seule, offres comprises. Son édition et le constructeur d’offres viendront dans une prochaine étape.</Notice><CataloguePanel items={data.items} offers={data.offers} /></>}
  </>;
}
