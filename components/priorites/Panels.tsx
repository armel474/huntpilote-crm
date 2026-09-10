'use client';

/**
 * Priorités transversales — filtres, bannières d'état, ligne de priorité,
 * barre d'assignation en lot. Même logique de nouvelle ligne que
 * `components/travail/Panels.tsx` (`.prio-row`, `app/globals.css`).
 */
import Link from 'next/link';
import { Pill } from '@/components/ui/Atoms';
import { IcoArrowR, IcoCheck, IcoEye, IcoEyeOff, IcoPlus, IcoTask, IcoWarn } from '@/components/ui/Icons';
import { CLIENTS } from '@/lib/data/clients';
import type { Severity, Visibility } from '@/lib/data/priorite';
import {
  AUDIT_DIMENSIONS,
  XP_AGE_OLD,
  XP_AGE_WARN,
  type AuditDimension,
  type CrossPriority,
} from '@/lib/data/priorites-transversales';
import { routes } from '@/lib/routes';

const SEV_META: Record<Severity, { label: string; tone: 'red' | 'yellow' | 'green' }> = {
  critique: { label: 'Critique', tone: 'red' },
  important: { label: 'Important', tone: 'yellow' },
  opportunite: { label: 'Opportunité', tone: 'green' },
};

const VIS_META: Record<Visibility, { label: string; tone: 'neutral' | 'blue' | 'green'; Icon: typeof IcoEye }> = {
  interne: { label: 'Interne', tone: 'neutral', Icon: IcoEyeOff },
  annonce: { label: 'Annoncé', tone: 'blue', Icon: IcoEye },
  traitement: { label: 'En traitement', tone: 'green', Icon: IcoTask },
};

function clientName(clientId: string) {
  return CLIENTS.find((c) => c.id === clientId)?.name ?? clientId;
}

/** Une priorité assignée ne compte plus vraiment son ancienneté — le seuil ne s'applique qu'aux non assignées. */
function ageTone(age: number, assigned: boolean): 'green' | 'red' | 'yellow' | 'neutral' {
  if (assigned) return 'green';
  if (age >= XP_AGE_OLD) return 'red';
  if (age >= XP_AGE_WARN) return 'yellow';
  return 'neutral';
}

function ageLabel(age: number) {
  return age <= 1 ? 'Depuis hier' : `Depuis ${age} jours`;
}

/* ── Barre de filtres ── */

export type PrioFilters = {
  sev: Severity | 'toutes';
  dim: AuditDimension | 'toutes';
  clientId: string | 'tous';
  vis: Visibility[];
  nonAssignees: boolean;
};

export const FILTERS_0: PrioFilters = { sev: 'toutes', dim: 'toutes', clientId: 'tous', vis: [], nonAssignees: false };

export function FilterBar({
  f,
  setF,
  count,
  total,
  clientIds,
}: {
  f: PrioFilters;
  setF: (updater: (prev: PrioFilters) => PrioFilters) => void;
  count: number;
  total: number;
  clientIds: string[];
}) {
  const set = <K extends keyof PrioFilters>(k: K, v: PrioFilters[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="card" style={{ padding: '0.75rem 0.875rem', marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <select
        className="sel"
        style={{ width: 140 }}
        value={f.sev}
        onChange={(e) => set('sev', e.target.value as PrioFilters['sev'])}
        aria-label="Filtrer par sévérité"
      >
        <option value="toutes">Toutes sévérités</option>
        <option value="critique">Critique</option>
        <option value="important">Important</option>
        <option value="opportunite">Opportunité</option>
      </select>
      <select
        className="sel"
        style={{ width: 160 }}
        value={f.dim}
        onChange={(e) => set('dim', e.target.value as PrioFilters['dim'])}
        aria-label="Filtrer par dimension"
      >
        <option value="toutes">Toutes dimensions</option>
        {AUDIT_DIMENSIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        className="sel"
        style={{ width: 180 }}
        value={f.clientId}
        onChange={(e) => set('clientId', e.target.value)}
        aria-label="Filtrer par client"
      >
        <option value="tous">Tous les clients</option>
        {clientIds.map((id) => (
          <option key={id} value={id}>
            {clientName(id)}
          </option>
        ))}
      </select>
      <div className="chips">
        {(Object.entries(VIS_META) as [Visibility, (typeof VIS_META)[Visibility]][]).map(([id, meta]) => (
          <button
            key={id}
            type="button"
            className="chip"
            data-on={f.vis.includes(id) || undefined}
            onClick={() => set('vis', f.vis.includes(id) ? f.vis.filter((v) => v !== id) : [...f.vis, id])}
          >
            {meta.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="chip"
        data-on={f.nonAssignees || undefined}
        onClick={() => set('nonAssignees', !f.nonAssignees)}
      >
        Non assignées seulement
      </button>
      <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>
        {count} sur {total} priorités
      </span>
    </div>
  );
}

/* ── Bannières d'état ── */

export function AffluxBanner({ n, crit }: { n: number; crit: number }) {
  return (
    <div className="note-box" style={{ background: 'var(--blue-m)', borderColor: 'var(--blue-b)', marginTop: 0, marginBottom: 12 }}>
      <span style={{ color: 'var(--blue-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
        <IcoWarn size={12} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{n} nouvelles priorités détectées</b> dans les derniers audits, dont {crit} critique{crit > 1 ? 's' : ''}.
        Triez et assignez avant qu&apos;elles ne vieillissent.
      </div>
    </div>
  );
}

export function AnciennesBanner({ n, oldest }: { n: number; oldest: number }) {
  return (
    <div className="note-box" style={{ background: 'var(--red-m)', borderColor: 'var(--red-b)', marginTop: 0, marginBottom: 12 }}>
      <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
        <IcoWarn size={12} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{n} priorités non assignées depuis plus d&apos;un mois</b> (seuil : {XP_AGE_OLD} jours), dont une depuis{' '}
        {oldest} jours. C&apos;est un problème d&apos;agence, pas de client.
      </div>
    </div>
  );
}

/* ── Ligne de priorité ── */

export function PrioRow({
  p,
  checked,
  onCheck,
  onAssignOne,
}: {
  p: CrossPriority;
  checked: boolean;
  onCheck: (id: string) => void;
  onAssignOne: (id: string) => void;
}) {
  const sevMeta = SEV_META[p.sev];
  const visMeta = VIS_META[p.vis];
  const at = ageTone(p.age, p.assigned);
  const atColor =
    at === 'neutral' ? 'var(--fg3)' : at === 'red' ? 'var(--red)' : at === 'yellow' ? 'var(--yellow-fg)' : 'var(--green-fg)';
  const href = routes.priorite(p.clientId, p.slug);

  return (
    <div className="prio-row">
      <button
        type="button"
        aria-pressed={checked}
        disabled={p.assigned}
        title={p.assigned ? 'Déjà assignée' : 'Sélectionner'}
        className="task-check"
        data-done={checked || undefined}
        onClick={() => onCheck(p.id)}
        style={{ opacity: p.assigned ? 0.35 : 1 }}
      >
        {checked && <IcoCheck size={11} />}
      </button>

      <div className="prio-main">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
          <Pill
            label={sevMeta.label}
            tone={sevMeta.tone}
            sm
            icon={<span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
          />
          <Pill label={p.dim} tone="neutral" sm />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', fontWeight: 700, color: 'var(--fg3)' }}>
            <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fg4)' }} />
            {clientName(p.clientId)}
          </span>
          {p.age <= 6 && <Pill label="Nouvelle" tone="blue" sm />}
        </div>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.35 }}>{p.label}</div>
        </Link>
        <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 2 }}>{p.id}</div>
      </div>

      <div className="prio-side">
        <Pill label={visMeta.label} tone={visMeta.tone} sm icon={<visMeta.Icon size={11} />} />
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: atColor }}>
          {ageLabel(p.age)} · seuil {XP_AGE_WARN} j
        </span>
        {p.assigned ? (
          <span style={{ fontSize: '0.5625rem', color: 'var(--green-fg)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <IcoTask size={10} />
            Tâche #{p.taskSlug}
          </span>
        ) : (
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>Non assignée</span>
        )}
      </div>

      <div className="prio-actions">
        {!p.assigned && (
          <button
            type="button"
            className="btn-out"
            style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem' }}
            onClick={() => onAssignOne(p.id)}
          >
            <IcoPlus size={11} />
            Assigner
          </button>
        )}
        <Link href={href} className="btn-icon" title="Ouvrir la priorité">
          <IcoArrowR size={12} />
        </Link>
      </div>
    </div>
  );
}

/* ── Section par sévérité (critiques d'abord) ── */

export function SevSection({
  sev,
  items,
  selected,
  onCheck,
  onAssignOne,
}: {
  sev: Severity;
  items: CrossPriority[];
  selected: Set<string>;
  onCheck: (id: string) => void;
  onAssignOne: (id: string) => void;
}) {
  if (items.length === 0) return null;
  const meta = SEV_META[sev];
  const dotColor = meta.tone === 'red' ? 'var(--red)' : meta.tone === 'yellow' ? 'var(--yellow-fg)' : 'var(--green-fg)';
  const sorted = [...items].sort((a, b) => b.age - a.age);
  const isCrit = sev === 'critique';

  const rows = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {sorted.map((p) => (
        <PrioRow key={p.id} p={p} checked={selected.has(p.id)} onCheck={onCheck} onAssignOne={onAssignOne} />
      ))}
    </div>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{meta.label}</h2>
        <span className="lbl">{items.length}</span>
      </div>
      {isCrit ? <div className="crit-group">{rows}</div> : rows}
    </div>
  );
}

/* ── Barre d'assignation en lot ── */

export function BulkBar({
  count,
  critCount,
  onAssign,
  onCancel,
}: {
  count: number;
  critCount: number;
  onAssign: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bulk-bar">
      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
        {count} priorité{count > 1 ? 's' : ''} sélectionnée{count > 1 ? 's' : ''}
        {critCount > 0 && (
          <span style={{ color: 'var(--red)' }}>
            {' '}
            · {critCount} critique{critCount > 1 ? 's' : ''}
          </span>
        )}
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button type="button" className="btn-out" style={{ fontSize: '0.75rem' }} onClick={onCancel}>
          Annuler
        </button>
        <button type="button" className="btn-main" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={onAssign}>
          <IcoPlus size={12} />
          Assigner en lot au plan d&apos;action
        </button>
      </div>
    </div>
  );
}
