'use client';

/**
 * Mon plan de travail — écran 4.1a.
 *
 * Premier écran transversal du cockpit : toutes les tâches assignées à
 * l'utilisateur courant, tous clients confondus, groupées par échéance
 * plutôt que par compte. Le sélecteur « Démo · état » rejoue les scénarios
 * du brief faute de backend réel — mêmes conventions que les écrans de
 * détail (`PrioriteDetailView`, `TacheDetailView`).
 */
import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { GroupSection, TravailEmpty, WeekLoadCard } from '@/components/travail/Panels';
import { Lbl } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import {
  PT_ME,
  PT_SCENARIOS,
  ptScenario,
  type PtScenarioId,
  type TacheBucket,
  type TaskSummary,
} from '@/lib/data/plan-travail';

const BUCKET_ORDER: TacheBucket[] = ['retard', 'aujourdhui', 'semaine', 'plustard'];

type Override = Partial<Pick<TaskSummary, 'status' | 'due' | 'bucket' | 'assignee'>>;

/**
 * `tasks` et `me` viennent du serveur quand la base est branchée ; sans eux,
 * l'écran rejoue les scénarios de démonstration comme avant.
 */
export function TravailView({ tasks: real, me }: { tasks?: TaskSummary[]; me?: string } = {}) {
  const live = real !== undefined;
  const mine = me ?? PT_ME.initials;
  const [scenario, setScenario] = useState<PtScenarioId>('normal');
  const [overrides, setOverrides] = useState<Record<string, Override>>({});

  const setSc = (s: PtScenarioId) => {
    setScenario(s);
    setOverrides({});
  };

  const base = live ? real : ptScenario(scenario);
  const tasks = base
    .map((t) => ({ ...t, ...(overrides[t.id] ?? {}) }))
    // En direct : les miennes, plus celles que personne n'a encore prises.
    .filter((t) => t.assignee === mine || (live && t.assignee === ''));

  const onToggle = (id: string) =>
    setOverrides((o) => {
      const cur = o[id] ?? {};
      const source = base.find((t) => t.id === id);
      const wasDone = (cur.status ?? source?.status) === 'termine';
      return { ...o, [id]: { ...cur, status: wasDone ? 'afaire' : 'termine' } };
    });
  const onReport = (id: string, due: string, bucket: TacheBucket) =>
    setOverrides((o) => ({ ...o, [id]: { ...(o[id] ?? {}), due, bucket } }));
  const onReassign = (id: string, assignee: string) =>
    setOverrides((o) => ({ ...o, [id]: { ...(o[id] ?? {}), assignee } }));

  const header = (
    <CRMHeader
      title="Mon plan de travail"
      subtitle={`${tasks.length} tâche${tasks.length > 1 ? 's' : ''} · tous clients confondus`}
      period=""
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
          Groupées par échéance · les tâches en retard passent devant tout
        </span>
        {!live && <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lbl>
              <label htmlFor="etat-demo-travail">Démo · état</label>
            </Lbl>
            <select
              id="etat-demo-travail"
              className="state-sel"
              value={scenario}
              onChange={(e) => setSc(e.target.value as PtScenarioId)}
            >
              {PT_SCENARIOS.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>}
      </div>

      <div className="content" style={{ maxWidth: 920 }}>
        <WeekLoadCard tasks={tasks} />
        {tasks.length === 0 ? (
          <TravailEmpty />
        ) : (
          BUCKET_ORDER.map((b) => (
            <GroupSection
              key={b}
              bucket={b}
              tasks={tasks.filter((t) => t.bucket === b)}
              onToggle={onToggle}
              onReport={onReport}
              onReassign={onReassign}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
