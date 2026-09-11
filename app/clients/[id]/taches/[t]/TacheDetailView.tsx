'use client';

/**
 * Détail d'une tâche du plan d'action — écran 1.2.
 *
 * Deux sélecteurs de démonstration : la nature du livrable (correctif
 * technique mesurable ou contenu publié) et l'état d'avancement, qui
 * change l'action offerte dans l'en-tête.
 */
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { CloseFlow, type Destination } from '@/components/tache/CloseFlow';
import { PrioLink, StepsCard, ThreadCard, TimeCard } from '@/components/tache/Panels';
import { TaskHeader } from '@/components/tache/TaskHeader';
import { Lbl, Sec } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoArrowL } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  TASK_CONTENT,
  TASK_TECH,
  T_CLIENT,
  T_STATES,
  type TacheState,
} from '@/lib/data/tache';

export function TacheDetailView({ clientId }: { clientId: string }) {
  const [state, setStateRaw] = useState<TacheState>('encours');
  const [kind, setKind] = useState<'technique' | 'contenu'>('technique');
  const [closing, setClosing] = useState(false);

  const task = kind === 'contenu' ? TASK_CONTENT : TASK_TECH;
  const orphan = state === 'sansprio';
  const blocked = state === 'bloquee';
  const done = state === 'terminee' || state === 'publiee';

  const setState = (s: TacheState) => {
    setStateRaw(s);
    setClosing(false);
  };

  const setKindReset = (k: 'technique' | 'contenu') => {
    setKind(k);
    setClosing(false);
  };

  /** La destination choisie décide si la preuve atteint le rapport. */
  const finishClosing = (dest: Destination) => {
    setStateRaw(dest === 'rapport' ? 'publiee' : 'terminee');
    setClosing(false);
  };

  const header = (
    <CRMHeader
      title={T_CLIENT.name}
      period=""
      crumbs={[
        { label: 'Client Hub', href: routes.clients() },
        { label: T_CLIENT.name, href: routes.client(clientId) },
        { label: 'Plan d’action', href: routes.client(clientId) },
        { label: `Tâche ${task.id}` },
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
          Plan d’action
        </Link>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
          Rapport de septembre · publication le 2 octobre
        </span>
        <DemoOnly>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <Lbl>Démo</Lbl>
            <select
              className="state-sel"
              aria-label="Type de tâche"
              value={kind}
              onChange={(e) => setKindReset(e.target.value as 'technique' | 'contenu')}
            >
              <option value="technique">Correctif technique</option>
              <option value="contenu">Contenu publié</option>
            </select>
            <select
              className="state-sel"
              aria-label="État de la tâche"
              value={state}
              onChange={(e) => setState(e.target.value as TacheState)}
            >
              {T_STATES.map(([id, l]) => (
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
          <TaskHeader
            task={task}
            state={state}
            orphan={orphan}
            blocked={blocked}
            onStart={() => setState('encours')}
            onOpenClose={() => setClosing(true)}
            reportHref={routes.rapport(clientId, '2026-09')}
          />
          {closing && (
            <CloseFlow task={task} onCancel={() => setClosing(false)} onDone={finishClosing} />
          )}
        </div>

        <div className="detail-row">
          <div className="col-main">
            {/* Remonter les sous-étapes à zéro quand la tâche change de nature. */}
            <StepsCard key={`${kind}-${state}`} task={task} done={done} />
            <ThreadCard task={task} />
          </div>
          <div className="col-side narrow">
            <Sec title="Origine" sub="Ce que le rapport pourra raconter">
              <PrioLink
                task={task}
                orphan={orphan}
                href={routes.priorite(clientId, task.prio.slug)}
              />
              {!orphan && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: '0.5625rem',
                    color: 'var(--fg3)',
                    lineHeight: 1.5,
                  }}
                >
                  La preuve produite à la clôture sera rattachée à cette priorité — c’est ce lien qui
                  permet de dire au client ce qui n’allait pas, puis ce qui a été fait.
                </p>
              )}
            </Sec>
            <TimeCard task={task} done={done} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
