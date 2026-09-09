'use client';

/**
 * Panneaux du détail d'un audit : score pondéré, exécution en cours,
 * constats par dimension, design mesuré puis design caractérisé.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Lbl, Pill, Sec } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoClock,
  IcoCompare,
  IcoDown,
  IcoGlobe,
  IcoPen,
  IcoPlug,
  IcoPlus,
  IcoSpin,
  IcoSrch,
  IcoUp,
  IcoWarn,
  IcoX,
  type IconProps,
} from '@/components/ui/Icons';
import {
  AUDIT,
  A_STATUS,
  type AuditState,
  type Criterion,
  type CritStatus,
  type DimensionId,
  weightedScore,
} from '@/lib/data/audit';

export const DIM_ICON: Record<DimensionId, (p: IconProps) => React.ReactElement> = {
  presence: IcoGlobe,
  seo: IcoSrch,
  design: IcoPen,
};

const STATUS_ICON: Record<CritStatus, (p: IconProps) => React.ReactElement> = {
  ok: IcoCheck,
  warn: IcoWarn,
  fail: IcoX,
  na: IcoPlug,
};

/** Une dimension telle qu'affichée : score éventuellement absent. */
export type ShownDim = {
  id: DimensionId;
  name: string;
  weight: number;
  score: number;
  prev: number | null;
  /** Dimension non analysée : elle sort du calcul et le dit. */
  na?: boolean;
};

/** Couleur de la jauge d'une dimension selon son score. */
function scoreFill(score: number): string {
  return score >= 75 ? 'var(--green)' : score >= 60 ? 'var(--yellow-b)' : 'var(--red)';
}

/* ── Score global et pondération ── */

export function ScoreCard({
  dims,
  running,
  failedDim,
  stale,
  first,
  settingsHref,
}: {
  dims: readonly ShownDim[];
  running: boolean;
  /** Nom de la dimension qui n'a pas pu être analysée, le cas échéant. */
  failedDim: string | null;
  stale: boolean;
  first: boolean;
  settingsHref: string;
}) {
  const usable = dims.filter((d) => !d.na);
  const total = usable.reduce((s, d) => s + d.weight, 0);
  const score = usable.length ? weightedScore(usable) : null;
  // Référence : l'audit qui précède celui affiché. Aucun delta si rien n'est
  // comparable — audit partiel, premier audit, ou exécution en cours.
  const ref = stale ? AUDIT.history[3] : AUDIT.history[1];
  const delta = score === null || running || first || failedDim ? null : score - ref.score;

  return (
    <Sec
      title="Score global de l’audit"
      sub={
        score === null
          ? 'Aucune dimension analysée'
          : `Moyenne des dimensions analysées, pondérée · ${total} % de la pondération couverte`
      }
      right={
        stale ? (
          <Pill label="Données de plus de 60 jours" tone="yellow" sm icon={<IcoClock />} />
        ) : null
      }
    >
      <div className="score-row">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: score === null ? 'var(--fg4)' : 'var(--fg1)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {score === null ? '—' : score}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--fg3)', fontWeight: 600 }}>/ 100</span>
          {delta !== null && (
            <Pill
              label={`${delta >= 0 ? '+' : '−'}${Math.abs(delta)} pts depuis le ${ref.date}`}
              tone={delta >= 0 ? 'green' : 'red'}
              sm
              icon={delta >= 0 ? <IcoUp /> : <IcoDown />}
            />
          )}
          {first && <Pill label="Premier audit · rien à comparer" sm />}
          {failedDim && !running && (
            <Pill
              label="Non comparable aux audits précédents"
              tone="yellow"
              sm
              icon={<IcoWarn size={12} />}
            />
          )}
        </div>

        <div className="weight-grid">
          {dims.map((d) => {
            const Icon = DIM_ICON[d.id];
            return (
              <div key={d.id} className="weight-cell" data-na={!!d.na}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--fg3)', display: 'flex' }}>
                    <Icon />
                  </span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, flex: 1, minWidth: 0 }}>
                    {d.name}
                  </span>
                  <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', fontWeight: 700 }}>
                    × {d.weight} %
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      fontVariantNumeric: 'tabular-nums',
                      color: d.na ? 'var(--fg4)' : 'var(--fg1)',
                    }}
                  >
                    {d.na ? '—' : d.score}
                  </span>
                  {d.na ? (
                    <span style={{ fontSize: '0.5625rem', color: 'var(--yellow-fg)', fontWeight: 700 }}>
                      non analysée
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
                      {d.prev !== null
                        ? `${d.score - d.prev >= 0 ? '+' : '−'}${Math.abs(d.score - d.prev)} pts`
                        : 'premier relevé'}
                    </span>
                  )}
                </div>
                <div className="track" style={{ marginTop: 6 }}>
                  <div
                    className="fill"
                    style={{ width: d.na ? 0 : `${d.score}%`, background: scoreFill(d.score) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {failedDim && (
        <div className="note-box" style={{ background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
          <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
            <IcoWarn size={12} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>La dimension {failedDim} n’a pas pu être analysée.</b> Google Business Profile n’est
            pas connecté pour ce client : le score global est calculé sur {total} % de la
            pondération et n’est pas comparable aux audits précédents.
          </div>
          <Link
            href={settingsHref}
            className="btn-out"
            style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}
          >
            <IcoPlug />
            Connecter
          </Link>
        </div>
      )}

      {stale && !failedDim && (
        <div className="note-box">
          <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
            <IcoClock />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>Relevé du {AUDIT.staleShown.date}.</b> Les mesures ont plus de 60 jours : le site a
            probablement changé depuis. Relancez l’audit avant d’en tirer des priorités.
          </div>
          <button type="button" className="btn-pri" style={{ fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}>
            <IcoSpin />
            Relancer
          </button>
        </div>
      )}
    </Sec>
  );
}

/* ── Audit en cours ── */

const RUNNING_ROWS: readonly (readonly [DimensionId, string, string])[] = [
  ['presence', 'Présence en ligne', '14 sources vérifiées sur 14'],
  ['seo', 'SEO', '256 pages explorées sur 412'],
  ['design', 'Design', 'En attente : démarre après le SEO'],
];

export function RunningCard({ progress }: { progress: Record<DimensionId, number> }) {
  return (
    <Sec
      title="Audit en cours d’exécution"
      sub={`Lancé à ${AUDIT.hour} · ${AUDIT.pages} pages à explorer · progression par dimension`}
      accent="var(--blue-b)"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {RUNNING_ROWS.map(([id, name, detail]) => {
          const pct = progress[id];
          return (
            <div key={id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{name}</span>
                {pct === 100 ? (
                  <Pill label="Terminée" tone="green" sm icon={<IcoCheck />} />
                ) : pct > 0 ? (
                  <Pill label="En cours" tone="blue" sm />
                ) : (
                  <Pill label="En attente" sm />
                )}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.5625rem',
                    color: 'var(--fg3)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {pct} %
                </span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--blue-fg)' }}
                />
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3 }}>{detail}</div>
            </div>
          );
        })}
      </div>
      <div className="note-box">
        <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoClock />
        </span>
        <div style={{ flex: 1 }}>
          Les constats de la présence en ligne sont déjà consultables ci-dessous. Le score global
          n’apparaît qu’une fois les trois dimensions terminées.
        </div>
      </div>
    </Sec>
  );
}

/* ── Ligne de constat ── */

export function CritRow({
  it,
  created,
  onCreate,
  prioHref,
}: {
  it: Criterion;
  created: Record<string, string>;
  onCreate: (criterion: string) => void;
  /** Reçoit l'identifiant de la priorité de la ligne (ex. « P-0421 ») — chaque ligne mène à sa propre priorité, pas à une seule constante. */
  prioHref: (prio: string) => string;
}) {
  const s = A_STATUS[it.st];
  const Icon = STATUS_ICON[it.st];
  const prio = it.prio ?? created[it.c];
  const actionable = it.st !== 'ok' && it.st !== 'na';

  return (
    <div className="crit" data-st={it.st}>
      <span className="crit-ico" data-st={it.st}>
        <Icon size={11} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{it.c}</span>
          <Pill label={s.label} tone={s.tone} sm icon={<Icon size={10} />} />
        </div>
        <div className="crit-meas">
          <span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{it.measure}</span>
          <span style={{ color: 'var(--fg3)' }}>{it.threshold}</span>
        </div>
        {it.note && (
          <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>
            {it.note}
          </p>
        )}
      </div>
      <div className="crit-act">
        {prio ? (
          <Link href={prioHref(prio)} style={{ textDecoration: 'none' }}>
            <Pill label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<IcoArrowR />} />
          </Link>
        ) : actionable ? (
          <button type="button" className="btn-out" onClick={() => onCreate(it.c)}>
            <IcoPlus size={11} />
            Créer la priorité
          </button>
        ) : (
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>Rien à corriger</span>
        )}
      </div>
    </div>
  );
}

/* ── Une dimension ── */

export function DimCard({
  dim,
  items,
  score,
  created,
  onCreate,
  partial,
  prioHref,
  settingsHref,
}: {
  dim: { id: DimensionId; name: string; weight: number; sub: string };
  items: readonly Criterion[];
  score: number;
  created: Record<string, string>;
  onCreate: (criterion: string) => void;
  partial: boolean;
  prioHref: (prio: string) => string;
  settingsHref: string;
}) {
  const Icon = DIM_ICON[dim.id];
  const bad = items.filter((i) => i.st === 'fail' || i.st === 'warn').length;

  return (
    <Sec
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: 'var(--fg3)', display: 'flex' }}>
            <Icon size={14} />
          </span>
          {dim.name}
        </span>
      }
      sub={dim.sub}
      right={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <Pill label={`${dim.weight} % du score`} sm />
          {partial ? (
            <Pill label="Non analysée" tone="yellow" sm icon={<IcoWarn size={12} />} />
          ) : (
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {score}
              <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontWeight: 600 }}> / 100</span>
            </span>
          )}
        </div>
      }
    >
      {partial ? (
        <div className="empty">
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--yellow-fg)', marginBottom: 6 }}>
            <IcoPlug />
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>
            Dimension non analysée
          </div>
          <p
            style={{
              fontSize: '0.6875rem',
              color: 'var(--fg2)',
              lineHeight: 1.5,
              maxWidth: '28rem',
              margin: '0 auto',
            }}
          >
            L’accès à Google Business Profile a expiré le 22 septembre. Sans lui, ni la fiche ni les
            avis ne peuvent être relevés — les autres sources seules donneraient un score trompeur.
          </p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <Link href={settingsHref} className="btn-pri" style={{ textDecoration: 'none' }}>
              <IcoPlug />
              Reconnecter l’accès
            </Link>
            <button type="button" className="btn-out">
              <IcoSpin />
              Relancer cette dimension
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((it) => (
              <CritRow key={it.c} it={it} created={created} onCreate={onCreate} prioHref={prioHref} />
            ))}
          </div>
          <p style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)' }}>
            {bad} critère{bad > 1 ? 's' : ''} sous le seuil sur {items.length}. Chaque critère
            affiche la mesure relevée et le seuil retenu.
          </p>
        </>
      )}
    </Sec>
  );
}

/* ── Design : ce qui est caractérisé, jamais noté ── */

export function CharacterCard() {
  const { style, modern } = AUDIT.design;
  const [open, setOpen] = useState(true);
  const dated = modern.signals.filter((s) => s[2] === 'daté').length;

  return (
    <div className="charac">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, margin: 0 }}>
              Design — ce qui est caractérisé
            </h2>
            <span
              className="pill"
              style={{
                background: 'transparent',
                border: '1px dashed var(--bd-strong)',
                color: 'var(--fg3)',
                fontSize: '0.5625rem',
              }}
            >
              Description · hors score
            </span>
          </div>
          <p style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.5 }}>
            Le style et l’âge apparent s’apprécient, ils ne se notent pas. Rien de ce bloc n’entre
            dans le score de l’audit.
          </p>
        </div>
        <button
          type="button"
          className="btn-out"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{ fontSize: '0.625rem' }}
        >
          {open ? 'Réduire' : 'Détailler les signaux'}
        </button>
      </div>

      <div className="charac-grid">
        <div>
          <Lbl mb={7}>Style dominant</Lbl>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
            {style.all.map((s) => (
              <span key={s} className="style-chip" data-on={s === style.dominant}>
                {s}
                {s === style.dominant && (
                  <span style={{ display: 'flex' }}>
                    <IcoCheck />
                  </span>
                )}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55 }}>{style.note}</p>
        </div>

        <div>
          <Lbl mb={7}>Axe de modernité</Lbl>
          <div className="axis-line">
            <span className="axis-mark" style={{ left: `${modern.pos}%` }} />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.5625rem',
              color: 'var(--fg3)',
              marginTop: 5,
              fontWeight: 600,
            }}
          >
            <span>Daté</span>
            <span>Actuel</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 7 }}>{modern.label}</div>
          <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 3 }}>
            Position justifiée par {dated} signaux datés sur {modern.signals.length}. Un site daté
            peut rester parfaitement utilisable : voyez les critères mesurés ci-dessus pour
            l’utilisabilité.
          </p>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <Lbl mb={7}>Signaux relevés</Lbl>
          <div className="sig-grid">
            {modern.signals.map(([name, txt, tag]) => (
              <div key={name} className="sig">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{name}</span>
                  <span className="sig-tag" data-tag={tag}>
                    {tag === 'daté' ? 'signal daté' : 'signal actuel'}
                  </span>
                </div>
                <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>{txt}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
            Une refonte visuelle se discute avec le client à partir de ces signaux — elle ne se
            déduit pas d’une note.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Métadonnées et historique ── */

export function AuditMetaCard({
  state,
  shown,
  compareHref,
}: {
  state: AuditState;
  shown: { id: string; date: string; duration: string };
  compareHref: string;
}) {
  const rows: readonly (readonly [string, string])[] = [
    ['Identifiant', shown.id],
    ['Lancé le', `${shown.date} à ${AUDIT.hour}`],
    ['Déclencheur', 'Automatique · 1er du mois'],
    ['Pages explorées', `${AUDIT.pages} pages`],
    ['Durée', state === 'encours' ? 'en cours…' : shown.duration],
  ];

  return (
    <Sec
      title="Cet audit"
      right={
        state === 'encours' ? (
          <Pill label="En cours" tone="blue" sm />
        ) : state === 'partiel' ? (
          <Pill label="Partiellement échoué" tone="yellow" sm icon={<IcoWarn size={12} />} />
        ) : (
          <Pill label="Terminé" tone="green" sm icon={<IcoCheck />} />
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <Lbl mb={0} style={{ flex: '0 0 7rem' }}>
              {label}
            </Lbl>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, flex: 1, minWidth: 0 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn-out" style={{ flex: 1, justifyContent: 'center' }}>
          <IcoSpin />
          Relancer
        </button>
        <Link
          href={compareHref}
          className="btn-out"
          style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
        >
          <IcoCompare />
          Comparer
        </Link>
      </div>
    </Sec>
  );
}

export function HistoryCard({
  first,
  shownId,
  compareHref,
}: {
  first: boolean;
  shownId: string;
  compareHref: string;
}) {
  return (
    <Sec
      title="Audits précédents"
      sub={
        first
          ? 'Aucun audit antérieur'
          : `${AUDIT.history.length} audits · le score suit la même pondération`
      }
    >
      {first ? (
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
          C’est le premier audit de ce client. Il n’y a rien à comparer : ces mesures serviront de
          point de départ au mois prochain.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {AUDIT.history.map((h) => (
            <div key={h.id} className="hist-row">
              <span
                style={{ fontSize: '0.6875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
              >
                {h.score}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{h.date}</div>
                <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{h.id}</div>
              </div>
              {h.id === shownId ? (
                <Pill label="Affiché" tone="green" sm />
              ) : (
                <Link
                  href={compareHref}
                  className="btn-out"
                  style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.2rem 0.6rem' }}
                >
                  Comparer
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </Sec>
  );
}
