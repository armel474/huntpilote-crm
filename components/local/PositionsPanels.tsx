'use client';

/**
 * SEO local · Positions locales — carte de zone (grille ou secteurs),
 * tableau requête par requête, lecture par secteur (session 3.3).
 *
 * La position se lit toujours en couleur ET en chiffre — jamais la seule
 * couleur — et chaque mesure porte le seuil du pack local.
 */
import Link from 'next/link';
import { Lbl, Sec } from '@/components/ui/Atoms';
import { IcoCheck, IcoDown, IcoLayers, IcoPlus, IcoUp, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { POS_THRESHOLD, type KeywordPos, type PositionsData, type ZoneRead } from '@/lib/data/local-positions';

/** [fond, bordure, texte, libellé] selon la position relevée à un point ou un secteur. */
export function posTone(pos: number | null): [string, string, string, string] {
  if (pos == null) return ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg4)', 'absent'];
  if (pos <= 3) return ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)', 'fort'];
  if (pos <= 7) return ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)', 'moyen'];
  return ['var(--red-m)', 'var(--red-b)', 'var(--red)', 'faible'];
}

/* ── ZONE NON CONFIGURÉE ── */

export function ZoneNotConfiguredCard({ estId }: { estId: string }) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
      <div className="empty" style={{ border: 'none', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--yellow-fg)', marginBottom: 8 }}>
          <IcoLayers />
        </div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 6 }}>Zone desservie jamais configurée</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.6, maxWidth: '28rem', margin: '0 auto' }}>
          Sans zone, impossible de savoir où mesurer le pack local. Configurez-la depuis la fiche de l’établissement — l’écran des positions
          s’activera dès qu’un mode sera choisi.
        </div>
        <Link href={`${routes.etablissement(estId)}#zone-editor`} className="btn-pri" style={{ textDecoration: 'none', marginTop: 14, display: 'inline-flex' }}>
          <IcoPlus />
          Configurer la zone desservie
        </Link>
      </div>
    </div>
  );
}

/* ── CARTE DE LA ZONE — grille de points ── */

function ZoneMapGrid({ data }: { data: Extract<PositionsData, { mode: 'grille' }> }) {
  return (
    <div style={{ display: 'inline-grid', gap: 5, gridTemplateColumns: `repeat(${data.cols},1fr)` }}>
      {data.grid.flat().map((pos, i) => {
        const [bg, bd, fg] = posTone(pos);
        return (
          <div
            key={i}
            title={pos == null ? 'Absent du pack local' : `Position ${pos}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              background: bg,
              border: `1.5px solid ${bd}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: fg,
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, lineHeight: 1 }}>{pos == null ? '—' : pos}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── CARTE DE LA ZONE — secteurs ── */

function ZoneMapSecteurs({ data }: { data: Extract<PositionsData, { mode: 'secteurs' }> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.secteurs.map((s) => {
        const [bg, bd, fg] = posTone(s.pos);
        return (
          <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ flex: '0 0 9rem', fontSize: '0.75rem', fontWeight: 600 }}>{s.nom}</span>
            <div style={{ flex: 1, height: 20, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${s.pos == null ? 0 : Math.max(8, 100 - (s.pos - 1) * 12)}%`,
                  background: bg,
                  border: `1px solid ${bd}`,
                }}
              />
            </div>
            <span style={{ flex: '0 0 3rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: fg }}>{s.pos ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ZoneMapCard({ data, estId }: { data: PositionsData; estId: string }) {
  return (
    <div className="card" style={{ padding: '1rem 1.125rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>Carte de la zone — position du pack local</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.5 }}>
            Chaque point porte la position relevée à cet endroit — en couleur et en chiffre. {POS_THRESHOLD}
          </div>
        </div>
        <Link href={`${routes.etablissement(estId)}#zone-editor`} className="btn-out" style={{ textDecoration: 'none', fontSize: '0.625rem' }}>
          <IcoLayers />
          Modifier la zone
        </Link>
      </div>
      {data.mode === 'grille' ? <ZoneMapGrid data={data} /> : <ZoneMapSecteurs data={data} />}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: '0.5625rem', color: 'var(--fg3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--green-m)', border: '1px solid var(--green-b)' }} />1 à 3 · dans le pack
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)' }} />4 à 7
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--red-m)', border: '1px solid var(--red-b)' }} />8 et plus
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)' }} />absent du pack
        </span>
      </div>
    </div>
  );
}

/* ── TABLEAU REQUÊTE PAR REQUÊTE ── */

export function KeywordTable({ keywords }: { keywords: KeywordPos[] }) {
  return (
    <Sec title="Positions par requête" sub={`${keywords.length} requêtes suivies sur la zone · ${POS_THRESHOLD}`}>
      <div className="tbl" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr', gap: '0 10px' }}>
        {['Requête', 'Moyenne sur la zone', 'Meilleure', 'Pire', 'Évolution'].map((h) => (
          <div key={h} className="lbl" style={{ padding: '8px 0', borderBottom: '1px solid var(--bd-solid)' }}>
            {h}
          </div>
        ))}
        {keywords.map((k) => {
          const delta = k.prevMoy - k.posMoy;
          const [, , fg] = posTone(k.posMoy);
          return (
            <div key={k.q} style={{ display: 'contents' }}>
              <div className="td" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {k.q}
              </div>
              <div className="td" style={{ fontSize: '0.8125rem', fontWeight: 800, color: fg, fontVariantNumeric: 'tabular-nums' }}>
                {k.posMoy.toLocaleString('fr-CA', { minimumFractionDigits: 1 })}
              </div>
              <div className="td" style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>
                {k.posMin}
              </div>
              <div className="td" style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>
                {k.posMax}
              </div>
              <div
                className="td"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: delta > 0 ? 'var(--green-fg)' : delta < 0 ? 'var(--red)' : 'var(--fg3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {delta !== 0 && (delta > 0 ? <IcoUp /> : <IcoDown />)}
                {delta === 0 ? 'Stable' : `${Math.abs(delta).toFixed(1)} pts`}
              </div>
            </div>
          );
        })}
      </div>
    </Sec>
  );
}

/* ── LECTURE PAR ZONE ── */

export function ZoneReadCard({ read }: { read: ZoneRead }) {
  return (
    <Sec title="Lecture par zone" sub="Ce qui oriente le travail — et ce qui parle au client">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Lbl mb={6}>Secteurs forts</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {read.forts.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--green-fg)', display: 'flex' }}>
                  <IcoCheck />
                </span>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div>
          <Lbl mb={6}>Secteurs faibles ou absents</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {read.faibles.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--red)', display: 'flex' }}>
                  <IcoWarn />
                </span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sec>
  );
}
