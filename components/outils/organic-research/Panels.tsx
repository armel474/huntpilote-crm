'use client';

/**
 * Organic Research — blocs propres à l'outil : évolution datée, requêtes
 * positionnées filtrables, pages qui bougent, potentiel chiffré.
 *
 * Réutilise `.card`, `.lbl`, `.pill`, `.empty`, `.res-bar`, `.note-box`,
 * `Sec` du reste de l'application. Le cadre commun vient de
 * `components/outils/*`.
 */
import { Pill, Sec } from '@/components/ui/Atoms';
import { IcoDown, IcoUp, IcoWarn } from '@/components/ui/Icons';
import { computePotentialGain, type OrDrop, type OrPageMove, type OrQuery } from '@/lib/data/organic-research';

function path(pts: readonly number[], W: number, H: number, invert?: boolean) {
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => (invert ? ((v - min) / Math.max(max - min, 1)) * H : H - ((v - min) / Math.max(max - min, 1)) * H);
  return pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ');
}

/* ── Évolution du trafic et des positions, avec décrochage daté ── */

export function EvolutionCard({
  traffic,
  pos,
  drop,
  months,
}: {
  traffic: readonly number[];
  pos: readonly number[];
  drop: OrDrop | null;
  months: number;
}) {
  const W = 640;
  const H = 130;
  const dropX = drop ? (drop.month / (traffic.length - 1)) * W : null;
  return (
    <Sec title="Évolution du trafic et des positions" sub={`${months} mois · une chute datée est un argument de vente, pas une erreur`}>
      <svg
        className="or-chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Évolution du trafic organique et de la position moyenne"
      >
        {dropX !== null && <line x1={dropX} y1="0" x2={dropX} y2={H} stroke="var(--red)" strokeWidth={1.5} strokeDasharray="4 3" />}
        <path d={path(traffic, W, H, false)} fill="none" stroke="var(--green-fg)" strokeWidth={2.2} strokeLinecap="round" />
        <path d={path(pos, W, H, true)} fill="none" stroke="var(--blue-fg)" strokeWidth={1.8} strokeLinecap="round" opacity={0.75} />
      </svg>
      <div className="or-legend">
        <span>
          <span className="or-dot" style={{ background: 'var(--green-fg)' }} />
          Trafic organique estimé
        </span>
        <span>
          <span className="or-dot" style={{ background: 'var(--blue-fg)' }} />
          Position moyenne (inversée · haut = meilleur)
        </span>
        {drop && (
          <span style={{ color: 'var(--red)' }}>
            <span className="or-dot" style={{ background: 'var(--red)' }} />
            Décrochage du {drop.date}
          </span>
        )}
      </div>
      {drop && (
        <div className="note-box" style={{ background: 'var(--red-m)', borderColor: 'var(--red-b)' }}>
          <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
            <IcoWarn size={12} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>
              {drop.label}, daté du {drop.date}.
            </b>{' '}
            Le trafic n’est jamais revenu au niveau d’avant. C’est l’argument d’ouverture d’une proposition
            commerciale : le problème est identifié et daté.
          </div>
        </div>
      )}
    </Sec>
  );
}

/* ── Requêtes positionnées, filtrables ── */

export function QueriesTable({ rows, q, onQ }: { rows: readonly OrQuery[]; q: string; onQ: (v: string) => void }) {
  return (
    <div className="card" style={{ padding: '0.875rem 1rem' }}>
      <div className="res-bar" style={{ marginBottom: 8 }}>
        <span className="lbl" style={{ marginBottom: 0 }}>
          Requêtes positionnées
        </span>
        <input
          className="inp"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Filtrer les requêtes…"
          aria-label="Filtrer les requêtes"
          style={{ width: '12rem', marginLeft: 'auto' }}
        />
      </div>
      <div className="or-q-table">
        <div className="or-q-head">
          <span className="lbl" style={{ marginBottom: 0 }}>
            Requête
          </span>
          <span className="lbl" style={{ marginBottom: 0 }}>
            Volume
          </span>
          <span className="lbl" style={{ marginBottom: 0 }}>
            Position
            <span style={{ display: 'block', fontSize: '0.5rem' }}>seuil ≤ 10</span>
          </span>
          <span className="lbl" style={{ marginBottom: 0 }}>
            Page positionnée
          </span>
        </div>
        {rows.length === 0 && (
          <div className="empty" style={{ marginTop: 6 }}>
            <span style={{ fontSize: '0.6875rem' }}>Aucune requête pour ce filtre</span>
          </div>
        )}
        {rows.map((r) => (
          <div className="or-q-row" key={r.c}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.c}</span>
            <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', color: 'var(--fg2)' }}>
              {r.vol.toLocaleString('fr-CA')}
            </span>
            <Pill label={`Pos. ${r.pos}`} tone={r.pos <= 10 ? 'green' : r.pos <= 30 ? 'yellow' : 'red'} sm />
            <span className="or-q-url" title={r.page}>
              {r.page}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pages qui performent / qui reculent ── */

export function PagesCard({ up, down }: { up: readonly OrPageMove[]; down: readonly OrPageMove[] }) {
  return (
    <Sec title="Pages qui performent et pages qui reculent" sub="Sur la période affichée">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ color: 'var(--green-fg)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.625rem', fontWeight: 700, marginBottom: 6 }}>
            <IcoUp />
            Progressent
          </div>
          {up.map((p) => (
            <div className="page-row" key={p.url}>
              <span className="page-u" title={p.url}>
                {p.url}
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--green-fg)' }}>+{p.delta} %</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.625rem', fontWeight: 700, marginBottom: 6 }}>
            <IcoDown />
            Reculent
          </div>
          {down.map((p) => (
            <div className="page-row" key={p.url}>
              <span className="page-u" title={p.url}>
                {p.url}
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--red)' }}>{p.delta} %</span>
            </div>
          ))}
        </div>
      </div>
    </Sec>
  );
}

/* ── Potentiel estimé — le chiffre qui va dans la proposition ── */

export function PotentialCard({ rows, mult }: { rows: readonly OrQuery[]; mult: number }) {
  const gain = computePotentialGain(rows, mult);
  return (
    <div className="pot-card">
      <div className="lbl" style={{ marginBottom: 4, color: 'var(--green-fg)' }}>
        Potentiel estimé
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span className="pot-num">+{gain.toLocaleString('fr-CA')}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--fg2)', fontWeight: 600 }}>visites/mois estimées</span>
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 6 }}>
        Si les {rows.length} requêtes actuellement en position 4 à 10 passaient en top 3 (courbe de clics approximative
        × {mult}). C’est le chiffre à mettre dans la proposition commerciale.
      </div>
    </div>
  );
}
