'use client';

/**
 * L'Agence hub — session 9.1.
 *
 * Qui vous êtes (Profil), qui y travaille (Équipe), ce que vous vendez
 * (Catalogue, Offres), comment vous le vendez (Modèles de documents,
 * Documents). Une navigation par section à gauche, une page d'accueil en
 * cartes qui disent ce qui manque, pas ce qui décore.
 *
 * Profil, Équipe et Catalogue viennent tels quels de `/parametres`, qui ne
 * garde que ce qui est réglage. Catalogue et Offres s'éditent (session 9.2).
 * Modèles (9.3) s'éditent ici ; Documents (9.4) liste tout ce qui a été
 * produit — la création part d'une fiche client ou d'une opportunité.
 *
 * L'adresse porte l'état : `?section=offres&offre=<id>` ouvre le
 * constructeur, `?section=catalogue&article=<id>` ouvre un article,
 * `?section=modeles&modele=<id>` ouvre un modèle de document dans l'éditeur.
 */
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AgencePanel } from '@/app/agence/AgencePanel';
import { CataloguePanel } from '@/app/agence/CataloguePanel';
import { EquipePanel } from '@/app/agence/EquipePanel';
import { DocumentsPanel } from '@/app/agence/DocumentsPanel';
import { ModelesPanel } from '@/app/agence/ModelesPanel';
import { OffresPanel } from '@/app/agence/OffresPanel';
import { SectionHead } from '@/app/agence/bits';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  IcoArrowR,
  IcoBuilding,
  IcoCheck,
  IcoDoc,
  IcoTag,
  IcoUsers,
  IcoWarn,
  type IconProps,
} from '@/components/ui/Icons';
import type { Session } from '@/lib/auth';
import type { DocumentsList } from '@/lib/queries/documents';
import type { ModelesData } from '@/lib/queries/modeles';
import { ROLE_LABEL } from '@/lib/format';
import { permissionsOf, type AgencyData } from '@/lib/queries/agence';
import { routes } from '@/lib/routes';

export type HubSectionId = 'profil' | 'equipe' | 'catalogue' | 'offres' | 'modeles' | 'documents';

const SECTIONS: { id: HubSectionId; label: string; Icon: (p: IconProps) => React.ReactElement }[] = [
  { id: 'profil', label: 'Profil', Icon: IcoBuilding },
  { id: 'equipe', label: 'Équipe', Icon: IcoUsers },
  { id: 'catalogue', label: 'Catalogue', Icon: IcoTag },
  { id: 'offres', label: 'Offres', Icon: IcoTag },
  { id: 'modeles', label: 'Modèles de documents', Icon: IcoDoc },
  { id: 'documents', label: 'Documents', Icon: IcoDoc },
];

const KIND_LABEL: Record<string, string> = {
  proposition: 'proposition',
  devis: 'devis',
  contrat: 'contrat',
  annexe: 'annexe',
  avenant: 'avenant',
  facture: 'facture',
};
const ALL_KINDS = Object.keys(KIND_LABEL);

type HubQuery = { section: HubSectionId | null; offre: string | null; article: string | null; modele: string | null };

/** Lit `?section=`, `?offre=`, `?article=` et `?modele=` et suit leurs changements — un lien de la barre latérale ou d'une carte y mène. */
function SectionFromQuery({ onQuery }: { onQuery: (q: HubQuery) => void }) {
  const searchParams = useSearchParams();
  const requested = searchParams.get('section');
  const offre = searchParams.get('offre');
  const article = searchParams.get('article');
  const modele = searchParams.get('modele');
  useEffect(() => {
    onQuery({
      section: requested && SECTIONS.some((s) => s.id === requested) ? (requested as HubSectionId) : null,
      offre,
      article,
      modele,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, offre, article, modele]);
  return null;
}

type CardState = 'ok' | 'warn' | 'critical' | 'neutral';

function HubCard({
  id,
  label,
  state,
  text,
  onOpen,
}: {
  id: HubSectionId;
  label: string;
  state: CardState;
  text: string;
  onOpen: (id: HubSectionId) => void;
}) {
  const { Icon } = SECTIONS.find((s) => s.id === id)!;
  const color =
    state === 'critical' ? 'var(--red)' : state === 'warn' ? 'var(--yellow-fg)' : state === 'ok' ? 'var(--green-fg)' : 'var(--fg3)';
  return (
    <div className="card" style={{ padding: '1.125rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: 'var(--bg-muted)',
            color: 'var(--fg2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={17} />
        </div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{label}</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.75rem', color, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
        {state === 'ok' ? (
          <span style={{ marginTop: 1, flexShrink: 0, display: 'flex' }}><IcoCheck size={12} /></span>
        ) : state !== 'neutral' ? (
          <span style={{ marginTop: 1, flexShrink: 0, display: 'flex' }}><IcoWarn size={13} /></span>
        ) : null}
        <span>{text}</span>
      </div>
      <button className="btn-out" type="button" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => onOpen(id)}>
        Ouvrir
        <IcoArrowR size={12} />
      </button>
    </div>
  );
}

function HubHome({ agency, onOpen }: { agency: AgencyData; onOpen: (id: HubSectionId) => void }) {
  const a = agency.agency;
  const missing: string[] = [];
  if (a && !a.gstNumber) missing.push('TPS');
  if (a && !a.qstNumber) missing.push('TVQ');
  if (a && !a.neq) missing.push('NEQ');
  if (a && !a.logoUrl) missing.push('logo');
  const active = agency.members.filter((m) => m.active && !m.pending).length;
  const pending = agency.members.filter((m) => m.active && m.pending).length;
  const kindsMissing = ALL_KINDS.filter((k) => !agency.hub.templateKinds.includes(k));
  const plural = (n: number, s: string) => `${n} ${s}${n > 1 ? 's' : ''}`;

  const cards: { id: HubSectionId; label: string; state: CardState; text: string }[] = [
    {
      id: 'profil',
      label: 'Profil',
      state: !a ? 'neutral' : missing.length ? 'warn' : 'ok',
      text: !a
        ? 'Connectez-vous pour voir le profil.'
        : missing.length
          ? `${plural(missing.length, 'champ')} manquant${missing.length > 1 ? 's' : ''} : ${missing.join(', ')}`
          : 'Complet',
    },
    {
      id: 'equipe',
      label: 'Équipe',
      state: pending ? 'warn' : 'neutral',
      text: `${plural(active, 'membre')} actif${active > 1 ? 's' : ''}${pending ? ` · ${plural(pending, 'invitation')} en attente` : ''}`,
    },
    {
      id: 'catalogue',
      label: 'Catalogue',
      state: agency.hub.itemsWithoutPrice ? 'warn' : 'neutral',
      text: `${plural(agency.items.length, 'article')}${agency.hub.itemsWithoutPrice ? ` · ${agency.hub.itemsWithoutPrice} sans prix unitaire` : ''}`,
    },
    {
      id: 'offres',
      label: 'Offres',
      state: agency.offers.some((o) => o.billing !== 'ponctuel' && o.introPriceCents == null) ? 'warn' : 'neutral',
      text: `${plural(agency.offers.length, 'offre')}${
        agency.offers.some((o) => o.billing !== 'ponctuel' && o.introPriceCents == null)
          ? ' · tarif d’entrée des packs mensuels non renseigné'
          : ''
      }`,
    },
    {
      id: 'modeles',
      label: 'Modèles de documents',
      state: kindsMissing.length ? 'warn' : 'ok',
      text: `${agency.hub.templateKinds.length} sorte${agency.hub.templateKinds.length > 1 ? 's' : ''} couverte${agency.hub.templateKinds.length > 1 ? 's' : ''} sur 6${
        kindsMissing.length ? ` · aucun modèle de ${kindsMissing.map((k) => KIND_LABEL[k]).join(', ')}` : ''
      }`,
    },
    {
      id: 'documents',
      label: 'Documents',
      state: agency.hub.invoicesLate ? 'critical' : agency.hub.quotesPending ? 'warn' : 'neutral',
      text:
        agency.hub.quotesPending || agency.hub.invoicesLate
          ? [
              agency.hub.quotesPending ? `${plural(agency.hub.quotesPending, 'devis')} en attente` : null,
              agency.hub.invoicesLate ? `${plural(agency.hub.invoicesLate, 'facture')} en retard` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Rien en attente',
    },
  ];

  return (
    <div>
      <SectionHead title="Agence hub" sub="Qui vous êtes, qui y travaille, ce que vous vendez — en un coup d’œil." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {cards.map((c) => (
          <HubCard key={c.id} {...c} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export function AgenceHubView({ session, agency, modeles, documents }: { session: Session | null; agency: AgencyData; modeles: ModelesData; documents: DocumentsList }) {
  const [query, setQuery] = useState<HubQuery>({ section: null, offre: null, article: null, modele: null });
  const section = query.section;
  const mine = permissionsOf(agency.members, session?.memberId);
  const activeLabel = SECTIONS.find((s) => s.id === section)?.label;
  const wide = section === 'catalogue' || section === 'offres' || section === 'modeles' || section === 'documents';
  const openedOffer = section === 'offres' && query.offre ? agency.offers.find((o) => o.id === query.offre) : undefined;
  const openedModel = section === 'modeles' && query.modele ? modeles.templates.find((t) => t.id === query.modele) : undefined;

  /** Change de section ou d'objet ouvert, et l'écrit dans l'adresse sans recharger. */
  const go = (next: Partial<HubQuery> & { section: HubSectionId | null }) => {
    const q: HubQuery = { section: next.section, offre: next.offre ?? null, article: next.article ?? null, modele: next.modele ?? null };
    setQuery(q);
    try {
      const u = new URL(window.location.href);
      for (const [k, v] of Object.entries(q)) {
        if (v) u.searchParams.set(k, v);
        else u.searchParams.delete(k);
      }
      window.history.pushState(null, '', u);
    } catch {
      // Pas de navigateur : rien à mémoriser.
    }
  };

  return (
    <AppShell
      header={
        <CRMHeader
          title="Agence hub"
          period=""
          subtitle={agency.agency?.name ?? 'Votre agence'}
        />
      }
    >
      <Suspense fallback={null}>
        <SectionFromQuery onQuery={setQuery} />
      </Suspense>
      <div className="ag-layout">
        <nav className="ag-nav" aria-label="Sections de l’Agence hub">
          <button
            type="button"
            className="lbl"
            onClick={() => go({ section: null })}
            style={{ padding: '0 0.7rem', marginBottom: 10, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            Agence hub
          </button>
          <div className="ag-nav-list">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`set-nav${section === s.id ? ' on' : ''}`}
                onClick={() => go({ section: s.id })}
                aria-current={section === s.id ? 'page' : undefined}
              >
                <s.Icon size={15} />
                {s.label}
              </button>
            ))}
          </div>
          <div className="ag-nav-foot">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                }}
              >
                {session?.initials ?? '—'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.fullName ?? 'Personne connectée'}
                </div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>
                  {session?.role ? ROLE_LABEL[session.role] : 'Aucune session'}
                </div>
              </div>
            </div>
            <Link
              href={routes.parametres()}
              className="btn-out"
              style={{ width: '100%', justifyContent: 'center', padding: '0.35rem', fontSize: '0.6875rem', textDecoration: 'none' }}
            >
              Paramètres de l&apos;application
            </Link>
          </div>
        </nav>
        <div className="sc ag-main">
          <div style={{ maxWidth: wide ? 1320 : 900, margin: '0 auto' }}>
            <div className="crumb">
              <span>HuntPilote</span>
              <span>›</span>
              <button type="button" onClick={() => go({ section: null })}>Agence hub</button>
              {activeLabel && (
                <>
                  <span>›</span>
                  {(section === 'offres' && query.offre) || (section === 'modeles' && openedModel) ? (
                    <button type="button" onClick={() => go({ section })}>{activeLabel}</button>
                  ) : (
                    <span>{activeLabel}</span>
                  )}
                </>
              )}
              {section === 'offres' && query.offre && (
                <>
                  <span>›</span>
                  <span>{openedOffer?.name ?? 'Nouvelle offre'}</span>
                </>
              )}
              {section === 'modeles' && openedModel && (
                <>
                  <span>›</span>
                  <span>{openedModel.name}</span>
                </>
              )}
            </div>
            {!section && <HubHome agency={agency} onOpen={(id) => go({ section: id })} />}
            {section === 'profil' && <AgencePanel agency={agency.agency} canEdit={mine.includes('manage_agency')} />}
            {section === 'equipe' && (
              <EquipePanel
                members={agency.members}
                session={session}
                roleDefaults={agency.roleDefaults}
                canManage={mine.includes('manage_team')}
              />
            )}
            {section === 'catalogue' && (
              <CataloguePanel
                items={agency.items}
                offers={agency.offers}
                canManage={mine.includes('manage_catalogue')}
                openArticleId={query.article}
                onOpenOffer={(id) => go({ section: 'offres', offre: id })}
              />
            )}
            {section === 'offres' && (
              <OffresPanel
                offers={agency.offers}
                items={agency.items}
                canManage={mine.includes('manage_catalogue')}
                openId={query.offre}
                onOpen={(id) => go({ section: 'offres', offre: id })}
                onOpenArticle={(id) => go({ section: 'catalogue', article: id })}
              />
            )}
            {section === 'modeles' && (
              <ModelesPanel
                data={modeles}
                canManage={mine.includes('manage_catalogue')}
                openId={query.modele}
                onOpen={(id) => go({ section: 'modeles', modele: id })}
              />
            )}
            {section === 'documents' && <DocumentsPanel data={documents} signedIn={session?.kind === 'membre'} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
