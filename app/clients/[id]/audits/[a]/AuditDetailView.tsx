'use client';

/**
 * Détail d'un audit — écran 1.4.
 *
 * Trois dimensions pondérées, chacune détaillée en critères qui affichent la
 * mesure relevée et le seuil retenu. Un critère sous le seuil se transforme
 * en priorité d'un geste : c'est l'entrée de la boucle de livraison.
 */
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  AuditMetaCard,
  CharacterCard,
  DimCard,
  HistoryCard,
  RunningCard,
  ScoreCard,
  type ShownDim,
} from '@/components/audit/Panels';
import { Lbl, Pill } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoArrowL, IcoCompare } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { AUDIT, AU_STATES, type AuditState } from '@/lib/data/audit';

export function AuditDetailView({ clientId }: { clientId: string }) {
  const [state, setState] = useState<AuditState>('termine');
  /** Priorités ouvertes depuis cet écran, par nom de critère. */
  const [created, setCreated] = useState<Record<string, string>>({});

  const running = state === 'encours';
  const partial = state === 'partiel';
  const first = state === 'premier';
  const stale = state === 'ancien';

  // En mode « ancien », c'est un audit antérieur qui est affiché, avec ses
  // propres identifiant, date et scores.
  const shown = stale
    ? AUDIT.staleShown
    : { id: AUDIT.id, date: AUDIT.date, duration: AUDIT.duration };
  const staleDims = stale ? AUDIT.staleShown.dims : null;

  const shownDim = (
    id: 'presence' | 'seo' | 'design',
    name: string,
    weight: number,
    score: number,
    prev: number,
  ): ShownDim => ({
    id,
    name,
    weight,
    score: staleDims ? staleDims[id][0] : score,
    prev: first ? null : staleDims ? staleDims[id][1] : prev,
  });

  const [presence, seo] = AUDIT.dims;
  const dims: ShownDim[] = [
    { ...shownDim('presence', presence.name, presence.weight, presence.score, presence.prev ?? 0), na: partial },
    { ...shownDim('seo', seo.name, seo.weight, seo.score, seo.prev ?? 0), na: running },
    {
      ...shownDim('design', 'Design', AUDIT.design.weight, AUDIT.design.score, AUDIT.design.prev),
      na: running,
    },
  ];

  /** Créer une priorité depuis un constat lui attribue un identifiant. */
  const onCreate = (criterion: string) =>
    setCreated((m) => ({
      ...m,
      [criterion]: `P-05${String(Object.keys(m).length + 1).padStart(2, '0')}`,
    }));

  const nCreated = Object.keys(created).length;
  const prioHref = (prio: string) => routes.priorite(clientId, prio.toLowerCase());
  const compareHref = routes.auditComparaison(clientId, AUDIT.slug);

  const header = (
    <CRMHeader
      title={`Audit ${shown.id} — ${shown.date}`}
      period=""
      crumbs={[
        { label: 'Client hub', href: routes.clients() },
        { label: AUDIT.client, href: routes.client(clientId) },
        { label: 'Audits', href: routes.client(clientId) },
        { label: shown.id },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Link
          href={routes.client(clientId)}
          className="btn-out"
          style={{ textDecoration: 'none', fontSize: '0.6875rem', padding: '0.3rem 0.75rem' }}
        >
          <IcoArrowL />
          Tous les audits
        </Link>
        <Link
          href={compareHref}
          className="btn-out"
          style={{ textDecoration: 'none', fontSize: '0.6875rem', padding: '0.3rem 0.75rem' }}
        >
          <IcoCompare />
          Comparer deux audits
        </Link>
        {nCreated > 0 && (
          <Pill
            label={`${nCreated} priorité${nCreated > 1 ? 's' : ''} créée${nCreated > 1 ? 's' : ''} depuis cet audit`}
            tone="blue"
            sm
          />
        )}
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lbl>
              <label htmlFor="au-etat">Démo · état</label>
            </Lbl>
            <select
              id="au-etat"
              className="state-sel"
              value={state}
              onChange={(e) => {
                setState(e.target.value as AuditState);
                setCreated({});
              }}
            >
              {AU_STATES.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.125rem 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {running && <RunningCard progress={AUDIT.running} />}
          <ScoreCard
            dims={dims}
            running={running}
            failedDim={partial ? 'présence en ligne' : null}
            stale={stale}
            first={first}
            settingsHref="/parametres"
          />
        </div>

        <div className="detail-row">
          <div className="col-main">
            <DimCard
              dim={presence}
              items={presence.items}
              score={dims[0].score}
              created={created}
              onCreate={onCreate}
              partial={partial}
              prioHref={prioHref}
              settingsHref="/parametres"
            />
            {!running && (
              <>
                <DimCard
                  dim={seo}
                  items={seo.items}
                  score={dims[1].score}
                  created={created}
                  onCreate={onCreate}
                  partial={false}
                  prioHref={prioHref}
                  settingsHref="/parametres"
                />
                <DimCard
                  dim={{
                    id: 'design',
                    name: 'Design — ce qui est mesuré',
                    weight: AUDIT.design.weight,
                    sub: 'Cinq critères vérifiables. Chacun affiche la mesure relevée et le seuil, jamais une note seule.',
                  }}
                  items={AUDIT.design.items}
                  score={dims[2].score}
                  created={created}
                  onCreate={onCreate}
                  partial={false}
                  prioHref={prioHref}
                  settingsHref="/parametres"
                />
                <CharacterCard />
              </>
            )}
            {running && (
              <div
                className="card"
                style={{
                  padding: '0.875rem 1rem',
                  fontSize: '0.6875rem',
                  color: 'var(--fg2)',
                  lineHeight: 1.5,
                }}
              >
                Les constats SEO et design apparaîtront ici dès que ces dimensions seront terminées.
                La présence en ligne est déjà exploitable : ses critères sous le seuil peuvent
                devenir des priorités maintenant.
              </div>
            )}
          </div>

          <div className="col-side narrow">
            <AuditMetaCard state={state} shown={shown} compareHref={compareHref} />
            <HistoryCard first={first} shownId={shown.id} compareHref={compareHref} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
