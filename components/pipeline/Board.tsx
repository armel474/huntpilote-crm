'use client';

import { useState } from 'react';
import { IcoClock, IcoPlus } from '@/components/ui/Icons';
import {
  OWNERS,
  STAGES,
  STAGE_PROBABILITY,
  fmt,
  initials,
  probColor,
  type Deal,
  type StageId,
} from '@/lib/data/pipeline';

function Flame() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}

/** Bouton discret de passage à l'étape précédente / suivante. */
const stepBtn: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 5,
  border: '1px solid var(--bd-solid)',
  background: 'transparent',
  color: 'var(--fg4)',
  fontSize: '0.6875rem',
  lineHeight: 1,
  cursor: 'pointer',
  fontFamily: 'var(--font)',
  padding: 0,
};

function DealCard({
  deal,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
  onOpen,
}: {
  deal: Deal;
  dragging: boolean;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragEnd: () => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onOpen: (id: number) => void;
}) {
  const owner = OWNERS[deal.owner];
  const hot = deal.prob >= 70;
  const stageIndex = STAGES.findIndex((s) => s.id === deal.stage);

  return (
    <article
      className={`card deal-card${dragging ? ' dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(deal.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(deal.id);
        }
      }}
      aria-label={`Voir le détail de ${deal.company}`}
      style={{ padding: '0.75rem', borderRadius: 11 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9 }}>
        <div
          aria-hidden="true"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            background: 'linear-gradient(140deg,var(--bg-muted),var(--bg-base))',
            border: '1px solid var(--bd-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: 'var(--fg2)',
          }}
        >
          {initials(deal.company)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--fg1)',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {deal.company}
          </h3>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 2 }}>
            {deal.sector}
          </div>
        </div>
        {hot && (
          <span title="Opportunité chaude" style={{ color: 'var(--red)', flexShrink: 0 }}>
            <Flame />
            <span
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
              }}
            >
              Opportunité chaude
            </span>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 9 }}>
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--fg1)',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(deal.mrr)} $
        </span>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg4)', fontWeight: 500 }}>/mois</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {deal.services.map((s) => (
          <span
            key={s}
            style={{
              fontSize: '0.5rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 999,
              background: 'var(--bg-muted)',
              color: 'var(--fg2)',
              border: '1px solid var(--bd-solid)',
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--bd)', marginBottom: 9 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div
          title={owner.name}
          aria-label={`Responsable : ${owner.name}`}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: owner.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.5rem',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {deal.owner}
        </div>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: '0.5625rem',
            color: 'var(--fg4)',
          }}
        >
          <IcoClock size={11} />
          {deal.days} j
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.625rem',
            fontWeight: 800,
            color: probColor(deal.prob),
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {deal.prob} %
        </span>

        {/* Alternative clavier au glisser-déposer, discrète pour ne pas
            alourdir la carte. */}
        <span style={{ display: 'flex', gap: 2 }}>
          <button
            type="button"
            style={stepBtn}
            onClick={(e) => {
              e.stopPropagation();
              onMove(deal.id, -1);
            }}
            disabled={stageIndex === 0}
            aria-label={`Reculer ${deal.company} d'une étape`}
          >
            ‹
          </button>
          <button
            type="button"
            style={stepBtn}
            onClick={(e) => {
              e.stopPropagation();
              onMove(deal.id, 1);
            }}
            disabled={stageIndex === STAGES.length - 1}
            aria-label={`Avancer ${deal.company} d'une étape`}
          >
            ›
          </button>
        </span>
      </div>
    </article>
  );
}

export function Board({
  deals,
  setDeals,
  onOpen,
}: {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  onOpen: (id: number) => void;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<StageId | null>(null);

  /** Déplace une opportunité vers une étape et recale sa probabilité. */
  const moveTo = (id: number, stage: StageId) =>
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id && d.stage !== stage
          ? { ...d, stage, days: 0, prob: STAGE_PROBABILITY[stage] }
          : d,
      ),
    );

  const moveByStep = (id: number, direction: -1 | 1) =>
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const i = STAGES.findIndex((s) => s.id === d.stage);
        const next = STAGES[i + direction];
        if (!next) return d;
        return { ...d, stage: next.id, days: 0, prob: STAGE_PROBABILITY[next.id] };
      }),
    );

  return (
    <div
      className="sc"
      style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '0.875rem 1.125rem 1.125rem',
      }}
    >
      <div style={{ display: 'flex', gap: 12, height: '100%', minWidth: 'min-content' }}>
        {STAGES.map((st) => {
          const cards = deals.filter((d) => d.stage === st.id);
          const sum = cards.reduce((s, d) => s + d.mrr, 0);
          return (
            <section
              key={st.id}
              style={{
                width: 244,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
              aria-label={`${st.label} — ${cards.length} opportunités`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 4px 9px' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: st.accent,
                    flexShrink: 0,
                  }}
                />
                <h2 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--fg1)' }}>
                  {st.label}
                </h2>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 800,
                    color: 'var(--fg3)',
                    background: 'var(--bg-muted)',
                    borderRadius: 999,
                    padding: '1px 7px',
                  }}
                >
                  {cards.length}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: 'var(--fg3)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fmt(sum)} $
                </span>
              </div>
              <div
                aria-hidden="true"
                style={{
                  height: 2,
                  background: st.accent,
                  opacity: 0.35,
                  borderRadius: 999,
                  marginBottom: 9,
                }}
              />
              <div
                className={`col-body sc${overCol === st.id ? ' over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(st.id);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setOverCol(null);
                }}
                onDrop={() => {
                  if (dragId !== null) moveTo(dragId, st.id);
                  setDragId(null);
                  setOverCol(null);
                }}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 4,
                  borderRadius: 12,
                  transition: 'background 140ms',
                }}
              >
                {cards.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    dragging={dragId === d.id}
                    onDragStart={(e, id) => {
                      setDragId(id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    onMove={moveByStep}
                    onOpen={onOpen}
                  />
                ))}
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '0.5rem',
                    borderRadius: 10,
                    border: '1px dashed var(--bd-strong)',
                    background: 'transparent',
                    color: 'var(--fg4)',
                    fontFamily: 'var(--font)',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <IcoPlus size={12} />
                  Ajouter
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
