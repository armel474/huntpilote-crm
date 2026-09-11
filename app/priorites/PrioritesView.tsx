'use client';

/**
 * Priorités transversales — écran 4.1b.
 *
 * Toutes les priorités ouvertes du portefeuille, triées par sévérité puis
 * par ancienneté — jamais par client. N'ouvre aucun écran nouveau : une
 * ligne mène au détail de priorité livré en session 1.1 (`routes.priorite`).
 * Même convention de scénario de démonstration que l'écran voisin
 * `/travail` et que les écrans de détail existants.
 */
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  AffluxBanner,
  AnciennesBanner,
  BulkBar,
  FILTERS_0,
  FilterBar,
  SevSection,
  type PrioFilters,
} from '@/components/priorites/Panels';
import { Lbl } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { EmptyFilter, EmptyHealthy } from '@/components/ui/States';
import { IcoTrophy } from '@/components/ui/Icons';
import type { Severity } from '@/lib/data/priorite';
import {
  ALL_PRIORITIES,
  XP_AGE_OLD,
  XP_SCENARIOS,
  xpScenario,
  type CrossPriority,
  type XpScenarioId,
} from '@/lib/data/priorites-transversales';

const SEV_ORDER: Severity[] = ['critique', 'important', 'opportunite'];

type Override = Partial<Pick<CrossPriority, 'assigned' | 'vis' | 'taskSlug'>>;

const CLIENT_IDS = [...new Set(ALL_PRIORITIES.map((p) => p.clientId))];

export function PrioritesView() {
  const [scenario, setScenarioRaw] = useState<XpScenarioId>('normal');
  const [f, setF] = useState<PrioFilters>(FILTERS_0);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const setScenario = (s: XpScenarioId) => {
    setScenarioRaw(s);
    setF(FILTERS_0);
    setOverrides({});
    setSelected(new Set());
  };

  const base = xpScenario(scenario).map((p) => ({ ...p, ...(overrides[p.id] ?? {}) }));
  const filtered = useMemo(
    () =>
      base.filter(
        (p) =>
          (f.sev === 'toutes' || p.sev === f.sev) &&
          (f.dim === 'toutes' || p.dim === f.dim) &&
          (f.clientId === 'tous' || p.clientId === f.clientId) &&
          (f.vis.length === 0 || f.vis.includes(p.vis)) &&
          (!f.nonAssignees || !p.assigned),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, f],
  );

  const onCheck = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const assignIds = (ids: string[]) =>
    setOverrides((o) => {
      const next = { ...o };
      ids.forEach((id, i) => {
        next[id] = { ...(next[id] ?? {}), assigned: true, vis: 'traitement', taskSlug: `${190 + i}` };
      });
      return next;
    });
  const onAssignOne = (id: string) => assignIds([id]);
  const onBulkAssign = () => {
    assignIds([...selected]);
    setSelected(new Set());
  };

  const critCount = [...selected].filter((id) => base.find((p) => p.id === id)?.sev === 'critique').length;
  const fresh = base.filter((p) => p.age <= 6);
  const stale = base.filter((p) => p.age >= XP_AGE_OLD && !p.assigned);

  const header = (
    <CRMHeader
      title="Priorités transversales"
      subtitle={`${filtered.length} priorité${filtered.length > 1 ? 's' : ''} affichée${filtered.length > 1 ? 's' : ''} · portefeuille complet`}
      period=""
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
          Portefeuille complet · triées par sévérité puis par ancienneté
        </span>
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lbl>
              <label htmlFor="etat-demo-priorites">Démo · état</label>
            </Lbl>
            <select
              id="etat-demo-priorites"
              className="state-sel"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as XpScenarioId)}
            >
              {XP_SCENARIOS.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="content" style={{ maxWidth: 980 }}>
        {scenario === 'sain' && (
          <div style={{ marginBottom: 12 }}>
            <EmptyHealthy
              icon={<IcoTrophy size={18} />}
              title="Aucune priorité critique ouverte, tous clients confondus"
              text="Le portefeuille reste à surveiller — mais rien n’exige d’attention immédiate."
            />
          </div>
        )}
        {scenario === 'afflux' && <AffluxBanner n={fresh.length} crit={fresh.filter((p) => p.sev === 'critique').length} />}
        {scenario === 'anciennes' && stale.length > 0 && (
          <AnciennesBanner n={stale.length} oldest={Math.max(...stale.map((p) => p.age))} />
        )}

        <FilterBar f={f} setF={setF} count={filtered.length} total={base.length} clientIds={CLIENT_IDS} />

        {filtered.length === 0 ? (
          <EmptyFilter
            title="Aucune priorité pour ces filtres"
            text="Élargissez les filtres pour revoir le portefeuille complet."
            onReset={() => setF(FILTERS_0)}
          />
        ) : (
          SEV_ORDER.map((sev) => (
            <SevSection
              key={sev}
              sev={sev}
              items={filtered.filter((p) => p.sev === sev)}
              selected={selected}
              onCheck={onCheck}
              onAssignOne={onAssignOne}
            />
          ))
        )}
      </div>

      {selected.size > 0 && (
        <div style={{ padding: '0 1.125rem 12px' }}>
          <BulkBar count={selected.size} critCount={critCount} onAssign={onBulkAssign} onCancel={() => setSelected(new Set())} />
        </div>
      )}
    </AppShell>
  );
}
