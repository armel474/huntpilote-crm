'use client';

/**
 * Détail d'une priorité SEO — écran 1.1.
 *
 * Le sélecteur « Démo · état » de la sous-barre rejoue les sept situations
 * du cycle de vie d'une priorité sur le même constat, faute de données
 * réelles : chaque état impose sa visibilité et son statut de libellé.
 */
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ConstatCard } from '@/components/priorite/ConstatCard';
import { HistoryCard, PagesCard, ProvCard, RecoCard } from '@/components/priorite/Panels';
import { LabelCard, VisibilityCard } from '@/components/priorite/Visibility';
import { Lbl } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoArrowL } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  PD,
  PD_CLIENT,
  STATE_DEFAULTS,
  UX_STATES,
  type PrioriteState,
  type Visibility,
} from '@/lib/data/priorite';

export function PrioriteDetailView({ clientId }: { clientId: string }) {
  const [state, setStateRaw] = useState<PrioriteState>('neuve');
  const [vis, setVis] = useState<Visibility>(STATE_DEFAULTS.neuve.vis);
  const [labelOk, setLabelOk] = useState(STATE_DEFAULTS.neuve.labelOk);
  const [label, setLabel] = useState<string>(PD.clientLabel);
  const [deferred, setDeferred] = useState(false);

  const assigned = state === 'assignee' || state === 'resolue';
  const closed = state === 'ignoree' || state === 'fauxpositif';

  /** Changer d'état de démonstration réaligne visibilité et libellé. */
  const setState = (s: PrioriteState) => {
    setStateRaw(s);
    setVis(STATE_DEFAULTS[s].vis);
    setLabelOk(STATE_DEFAULTS[s].labelOk);
    setDeferred(false);
  };

  /** Assigner crée la tâche : la priorité devient visible « en traitement ». */
  const onAssign = () => {
    setStateRaw('assignee');
    setVis('traitement');
    setDeferred(false);
  };

  const header = (
    <CRMHeader
      title={PD_CLIENT.name}
      period=""
      crumbs={[
        { label: 'Client Hub', href: routes.clients() },
        { label: PD_CLIENT.name, href: routes.client(clientId) },
        { label: 'Priorités SEO', href: routes.client(clientId) },
        { label: PD.id },
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
          Toutes les priorités SEO
        </Link>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
          3 critiques · 5 importantes · 8 opportunités
        </span>
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lbl>
              <label htmlFor="etat-demo">Démo · état</label>
            </Lbl>
            <select
              id="etat-demo"
              className="state-sel"
              value={state}
              onChange={(e) => setState(e.target.value as PrioriteState)}
            >
              {UX_STATES.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.125rem 0' }}>
          <ConstatCard
            state={state}
            deferred={deferred}
            onAssign={onAssign}
            onClose={setState}
            onReactivate={() => setState('neuve')}
            onDefer={() => setDeferred(true)}
            taskHref={routes.tache(clientId, PD.task.slug)}
            previousTaskHref={routes.tache(clientId, '97')}
            reportHref={routes.rapport(clientId, '2026-09')}
          />
        </div>

        <div className="detail-row">
          <div className="col-main">
            <PagesCard resolved={state === 'resolue'} />
            <RecoCard />
            <HistoryCard recurrent={state === 'recurrente'} resolved={state === 'resolue'} />
          </div>
          <div className="col-side">
            <VisibilityCard
              vis={vis}
              setVis={setVis}
              assigned={assigned}
              closed={closed}
              labelOk={labelOk}
              label={label}
            />
            <LabelCard
              label={label}
              setLabel={setLabel}
              labelOk={labelOk}
              setLabelOk={setLabelOk}
              vis={vis}
            />
            <ProvCard auditHref={routes.audit(clientId, 'tech-q2')} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
