'use client';

import { Badge, Gauge } from '@/components/ui/Atoms';
import { IcoCheck, IcoPlus, IcoZap } from '@/components/ui/Icons';
import { AUDITS, TASKS } from '@/lib/data/fiche-client';

const STATUS_TONE = { 'En cours': 'yellow', 'À faire': 'blue', Terminé: 'green' } as const;

export function PanelPlan() {
  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="btn-pri" type="button">
          <IcoPlus size={12} />
          Créer une tâche
        </button>
      </div>

      {TASKS.map((t) => (
        <article key={t.title} className="card" style={{ padding: '13px 16px', marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                {t.title}
              </h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge label={t.status} tone={STATUS_TONE[t.status]} />
                <Badge label={`Priorité ${t.prio}`} tone="neutral" />
                <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>Source : {t.source}</span>
                <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>Échéance : {t.due}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <button className="btn-sm" type="button" style={{ border: '1px solid var(--bd-solid)' }}>
                Voir détail
              </button>
              {/* Une tâche terminée alimente les preuves de valeur du rapport client. */}
              <button
                className="btn-sm"
                type="button"
                style={{
                  background: 'var(--green-m)',
                  border: '1px solid var(--green-b)',
                  color: 'var(--green-fg)',
                }}
              >
                <IcoCheck />
                Marquer terminé
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PanelDiagnostics({ onLaunchAudit }: { onLaunchAudit: () => void }) {
  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="btn-pri" type="button" onClick={onLaunchAudit}>
          <IcoZap size={12} />
          Lancer un diagnostic
        </button>
      </div>

      {AUDITS.map((a) => (
        <article
          key={a.name}
          className="card"
          style={{
            padding: '13px 16px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <Gauge value={a.score} size={54} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              {a.name}
            </h3>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge label={a.type} tone="neutral" />
              <Badge label="Terminé" tone="green" />
              <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{a.date}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button className="btn-sm" type="button" style={{ border: '1px solid var(--bd-solid)' }}>
              Comparer
            </button>
            <button className="btn-sm" type="button" style={{ border: '1px solid var(--bd-solid)' }}>
              Voir le détail
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
