import Link from 'next/link';
import { SectionHead } from '@/app/parametres/bits';
import { loadAgencyScreen } from '@/lib/queries/agence-screen';
import { routes } from '@/lib/routes';
import { AgencyAccess } from './AgencyAccess';
import { AGENCY_SECTIONS, type AgencySection } from './sections';

export const dynamic = 'force-dynamic';

export default async function AgencePage() {
  const { session, data, configured } = await loadAgencyScreen();
  const profile = data.agency;
  const missing = profile ? [
    ['Nom', profile.name], ['Raison sociale', profile.legalName], ['Courriel', profile.email],
    ['Téléphone', profile.phone], ['Adresse', profile.address], ['Ville', profile.city],
    ['Province', profile.province], ['Code postal', profile.postalCode], ['Site web', profile.website],
    ['TPS', profile.gstNumber], ['TVQ', profile.qstNumber],
  ].filter(([, value]) => !value?.trim()).map(([label]) => label) : [];
  const activeMembers = data.members.filter((m) => m.active && !m.pending).length;
  const invitations = data.members.filter((m) => m.active && m.pending).length;
  const items = data.items.filter((i) => i.active);
  const available = configured && session?.kind === 'membre' && profile !== null;
  const summaries: Record<AgencySection, string> = {
    profil: available ? (missing.length ? `À compléter — ${missing.length} champ(s) manquant(s) : ${missing.join(', ')}.` : 'Champs du profil actuel renseignés.') : 'Profil indisponible.',
    equipe: available ? `${activeMembers} membre(s) actif(s) · ${invitations} invitation(s) en attente.` : 'Équipe indisponible.',
    catalogue: available ? `${items.length} article(s) actif(s) · ${items.filter((i) => i.priceCents === null).length} sans prix unitaire. Articles et offres consultables.` : 'Catalogue indisponible.',
    offres: 'Le constructeur d’offres viendra dans une prochaine étape. Les offres existantes se consultent dans le catalogue.',
    modeles: 'La gestion des modèles de documents sera ajoutée dans une prochaine étape.',
    documents: 'La liste et le générateur de documents seront ajoutés dans une prochaine étape.',
  };
  return <>
    <SectionHead title="Agence hub" sub="Qui vous êtes, qui y travaille, ce que vous vendez — en un coup d’œil." />
    <AgencyAccess configured={configured} session={session} />
    <div className="ag-cards">
      {AGENCY_SECTIONS.map((s) => <section className="card ag-card" key={s.id}>
        <h3>{s.label}</h3>
        <span className="ag-card-status">{s.available ? (s.id === 'catalogue' ? 'Consultation' : 'Données de l’agence') : 'À venir'}</span>
        <p>{summaries[s.id]}</p>
        <Link className="btn-out" href={routes.agence(s.id)}>{s.available ? `Ouvrir : ${s.label}` : `Voir le périmètre : ${s.label}`}<span aria-hidden="true">→</span></Link>
      </section>)}
    </div>
  </>;
}
