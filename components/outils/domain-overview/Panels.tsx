'use client';

/**
 * Domain Overview — blocs propres à l'outil : six cartes denses, tenant sans
 * défilement, pour qualifier un prospect en un coup d'œil.
 *
 * Réutilise `.card`, `.lbl`, `.pill`, `.track`, `.fill` du reste de
 * l'application. Le cadre commun (barre de contexte, bandeaux, coût,
 * conservation) vient de `components/outils/*`.
 */
import { Pill } from '@/components/ui/Atoms';
import { IcoDown, IcoFile, IcoMap, IcoShield, IcoSrch, IcoTrend, IcoUp } from '@/components/ui/Icons';
import { DO_BUCKET_ROWS, type DoGeo, type DoTopPage, type DoTopQuery } from '@/lib/data/domain-overview';

function spark(pts: readonly number[], W = 260, H = 44) {
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / Math.max(max - min, 1)) * H;
  return pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ');
}

/* ── Trafic organique estimé ── */

export function TrafficCard({
  traffic,
  prev,
  history,
  chute,
  chuteDate,
}: {
  traffic: number;
  prev: number;
  history: readonly number[];
  chute: boolean;
  chuteDate: string;
}) {
  const delta = Math.round(((traffic - prev) / prev) * 100);
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IcoTrend size={13} />
        Trafic organique estimé
      </div>
      <div className="do-big">
        <span className="do-num">{traffic.toLocaleString('fr-CA')}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>visites/mois</span>
        <span className="delta" style={{ color: chute ? 'var(--red)' : delta >= 0 ? 'var(--green-fg)' : 'var(--red)' }}>
          {delta >= 0 && !chute ? <IcoUp /> : <IcoDown />}
          <span>{chute ? '−65 %' : `${delta >= 0 ? '+' : ''}${delta} %`}</span>
        </span>
      </div>
      <svg className="spark" viewBox="0 0 260 44" preserveAspectRatio="none">
        <path d={spark(history)} fill="none" stroke={chute ? 'var(--red)' : 'var(--green-fg)'} strokeWidth={2} />
      </svg>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
        {chute ? `Décrochage daté du ${chuteDate}` : 'Sur 12 mois · seuil de qualification : ≥ 500 visites/mois'}
      </div>
    </div>
  );
}

/* ── Mots-clés positionnés ── */

export function KeywordsCard({ n, buckets }: { n: number; buckets: Record<string, number> }) {
  const total = n || 1;
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IcoSrch size={13} />
        Mots-clés positionnés
      </div>
      <div className="do-big">
        <span className="do-num">{n}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>requêtes suivies chez le fournisseur</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {DO_BUCKET_ROWS.map(([id, label, col]) => (
          <div className="bkt-row" key={id}>
            <span style={{ width: '5.5rem', color: 'var(--fg2)' }}>{label}</span>
            <span className="bkt-bar">
              <span style={{ width: `${(buckets[id] / total) * 100}%`, background: col }} />
            </span>
            <span style={{ width: '2rem', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {buckets[id]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Autorité du domaine ── */

export function AuthorityCard({ authority, refDomains }: { authority: number; refDomains: number }) {
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IcoShield size={13} />
        Autorité du domaine
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        <div>
          <div className="do-num" style={{ fontSize: '1.75rem' }}>
            {authority}
          </div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>/ 100 · autorité</div>
        </div>
        <div>
          <div className="do-num" style={{ fontSize: '1.75rem' }}>
            {refDomains}
          </div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>domaines référents</div>
        </div>
      </div>
      <div className="track">
        <div
          className="fill"
          style={{ width: `${authority}%`, background: authority >= 40 ? 'var(--green)' : authority >= 20 ? 'var(--yellow-b)' : 'var(--red)' }}
        />
      </div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Repère agence : autorité ≥ 40 = profil déjà solide</div>
    </div>
  );
}

/* ── Top 5 pages / requêtes ── */

export function TopPagesCard({ rows }: { rows: readonly DoTopPage[] }) {
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IcoFile size={11} />
        Top 5 des pages
      </div>
      {rows.map((r) => (
        <div className="top-row" key={r.url}>
          <span className="u" title={r.url}>
            {r.url}
          </span>
          <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.vol}</span>
          <span style={{ color: 'var(--fg3)' }}>visites/mois</span>
        </div>
      ))}
    </div>
  );
}

export function TopQueriesCard({ rows }: { rows: readonly DoTopQuery[] }) {
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IcoSrch size={13} />
        Top 5 des requêtes
      </div>
      {rows.map((r) => (
        <div className="top-row" key={r.q}>
          <span className="u" style={{ fontFamily: 'var(--font)', fontSize: '0.6875rem', fontWeight: 600 }} title={r.q}>
            {r.q}
          </span>
          <Pill label={`Pos. ${r.pos}`} tone={r.pos <= 10 ? 'green' : 'yellow'} sm />
          <span style={{ color: 'var(--fg3)' }}>{r.vol}/mois</span>
        </div>
      ))}
    </div>
  );
}

/* ── Répartition géographique ── */

export function GeoCard({ rows }: { rows: readonly DoGeo[] }) {
  return (
    <div className="card do-card">
      <div className="lbl" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <IcoMap size={13} />
        Répartition géographique du trafic
      </div>
      {rows.map((r) => (
        <div className="geo-row" key={r.region}>
          <span>{r.region}</span>
          <span className="geo-bar">
            <span style={{ width: `${r.pct}%` }} />
          </span>
          <span style={{ fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.pct} %</span>
        </div>
      ))}
    </div>
  );
}
