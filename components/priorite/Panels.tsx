/**
 * Panneaux de la colonne principale du détail d'une priorité :
 * pages touchées, recommandation de l'agent, historique et provenance.
 */
import { Lbl, Pill, Sec, toneColors } from '@/components/ui/Atoms';
import { IcoDb, IcoSpin, IcoTask, IcoWarn } from '@/components/ui/Icons';
import { PD, fr1, frInt, lcpTone } from '@/lib/data/priorite';

/* ── Pages touchées ── */

/** Repère du seuil « bon » de Google sur une échelle de 0 à 6 s. */
const LCP_SCALE_MAX = 6;
const LCP_GOOD = 2.5;

export function PagesCard({ resolved }: { resolved: boolean }) {
  // Après correction, les mesures affichées sont celles d'après livraison.
  const pages = resolved
    ? PD.pages.map((p) => ({ ...p, lcp: +(p.lcp - 2.1).toFixed(1), d: -(p.lcp - 2.1) }))
    : PD.pages;
  const total = pages.reduce((s, p) => s + p.sessions, 0);

  return (
    <Sec
      title={`Pages touchées · ${pages.length}`}
      sub={`${frInt(total)} sessions/mois concernées · seuil Google : 2,5 s`}
      right={<Pill label="CrUX p75 · 28 j" sm />}
    >
      <div
        className="tbl tbl-4"
        style={{ gridTemplateColumns: '1fr 150px 110px 64px', gap: '0 10px' }}
      >
        {['Page', 'LCP mobile mesuré', 'Sessions / mois', 'Δ 30 j'].map((h, i) => (
          <div
            key={h}
            className="lbl"
            style={{
              paddingBottom: 6,
              borderBottom: '1px solid var(--bd-solid)',
              textAlign: i > 1 ? 'right' : 'left',
            }}
          >
            {h}
          </div>
        ))}

        {pages.map((p) => {
          const { fg } = toneColors(lcpTone(p.lcp));
          return (
            <PageRow key={p.url} url={p.url} lcp={p.lcp} sessions={p.sessions} d={p.d} fg={fg} />
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          marginTop: 9,
          fontSize: '0.5625rem',
          color: 'var(--fg3)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            aria-hidden="true"
            style={{
              width: 2,
              height: 9,
              background: 'var(--fg1)',
              opacity: 0.55,
              display: 'inline-block',
            }}
          />
          Seuil « bon » Google (2,5 s)
        </span>
        <span>Δ 30 j : rouge = s’aggrave, vert = s’améliore</span>
      </div>
    </Sec>
  );
}

function PageRow({
  url,
  lcp,
  sessions,
  d,
  fg,
}: {
  url: string;
  lcp: number;
  sessions: number;
  d: number;
  fg: string;
}) {
  return (
    <>
      <div
        className="td"
        style={{
          fontWeight: 600,
          fontSize: '0.75rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {url}
      </div>

      <div className="td" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 800,
            fontSize: '0.75rem',
            color: fg,
            minWidth: 34,
          }}
        >
          {fr1(lcp)} s
        </span>
        <span
          style={{
            flex: 1,
            height: 5,
            borderRadius: 999,
            background: 'var(--bg-muted)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: '0 auto 0 0',
              width: `${Math.min((lcp / LCP_SCALE_MAX) * 100, 100)}%`,
              background: fg,
              borderRadius: 999,
            }}
          />
          <span
            title="Seuil 2,5 s"
            style={{
              position: 'absolute',
              left: `${(LCP_GOOD / LCP_SCALE_MAX) * 100}%`,
              top: -2,
              bottom: -2,
              width: 2,
              background: 'var(--fg1)',
              opacity: 0.55,
            }}
          />
        </span>
      </div>

      <div
        className="td"
        style={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.75rem',
          color: 'var(--fg2)',
        }}
      >
        {frInt(sessions)}
      </div>

      <div
        className="td"
        style={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: d > 0 ? 'var(--red)' : d < 0 ? 'var(--green-fg)' : 'var(--fg4)',
        }}
      >
        {d === 0 ? '=' : `${d > 0 ? '+' : '−'}${fr1(Math.abs(d))} s`}
      </div>
    </>
  );
}

/* ── Recommandation de l'agent ── */

const IMPACTS: readonly { label: string; value: string; sub: string; good?: boolean }[] = [
  { label: 'Effort estimé', value: PD.effort, sub: PD.effortLevel },
  {
    label: 'Impact technique attendu',
    value: PD.impactTech,
    sub: 'Sous le seuil sur 6 pages',
    good: true,
  },
  { label: 'Impact d’affaires attendu', value: PD.impactBiz, sub: PD.impactCad, good: true },
];

export function RecoCard() {
  return (
    <Sec
      title="Recommandation de l’agent"
      sub="Rédigée à partir des mesures ci-dessus · relue par personne pour l’instant"
      accent="var(--violet)"
      right={<Pill label="✦ IA" tone="violet" sm />}
    >
      <p
        style={{
          fontSize: '0.75rem',
          lineHeight: 1.6,
          color: 'var(--fg2)',
          margin: '0 0 10px',
          textWrap: 'pretty',
        }}
      >
        {PD.reco}
      </p>

      <ol
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          marginBottom: 12,
          listStyle: 'none',
          padding: 0,
        }}
      >
        {PD.steps.map(([step, gain], i) => (
          <li
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 10px',
              borderRadius: 9,
              background: 'var(--bg-muted)',
              border: '1px solid var(--bd)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: 'var(--violet)',
                color: '#fff',
                fontSize: '0.5625rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, fontSize: '0.6875rem', fontWeight: 600, minWidth: 0 }}>
              {step}
            </span>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'var(--green-fg)',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {gain}
            </span>
          </li>
        ))}
      </ol>

      <div className="keep-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {IMPACTS.map((im) => (
          <div
            key={im.label}
            style={{
              padding: '8px 10px',
              borderRadius: 9,
              border: '1px solid var(--bd)',
              background: 'var(--bg-surface)',
            }}
          >
            <Lbl mb={4}>{im.label}</Lbl>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: im.good ? 'var(--green-fg)' : 'var(--fg1)',
              }}
            >
              {im.value}
            </div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{im.sub}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)' }}>
        Confiance de l’estimation : <b style={{ color: 'var(--fg2)' }}>{PD.confidence}</b> — 6 pages,
        mesures terrain concordantes avec le lab.
      </p>
    </Sec>
  );
}

/* ── Historique ── */

export function HistoryCard({ recurrent, resolved }: { recurrent: boolean; resolved: boolean }) {
  let entries = recurrent ? PD.historyRecurrent : PD.history;
  if (resolved) {
    entries = [
      ...PD.history.slice(0, 3),
      {
        date: '2 sept. 2026',
        lcp: 2.1,
        ev: 'Résolue — tâche #142 livrée, preuve de valeur produite',
        tone: 'green',
      },
    ];
  }
  const first = entries[0];
  const last = entries[entries.length - 1];
  const worse = last.lcp > first.lcp;

  const sub = recurrent
    ? 'Existe depuis 293 jours · déjà corrigée une fois · revenue'
    : resolved
      ? 'A existé 161 jours · corrigée'
      : `Existe depuis ${PD.ageDays} jours · ${worse ? 's’aggrave' : 'stable'} (${fr1(first.lcp)} s → ${fr1(last.lcp)} s)`;

  return (
    <Sec
      title="Historique"
      sub={sub}
      right={
        recurrent ? (
          <Pill label="Récurrente" tone="red" icon={<IcoSpin />} />
        ) : worse && !resolved ? (
          <Pill label="S’aggrave" tone="red" icon={<IcoWarn size={12} />} />
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {entries.map((e, i) => {
          const { fg } = toneColors(e.tone);
          const muted = e.tone === 'neutral';
          return (
            <div
              key={e.date}
              style={{
                display: 'grid',
                gridTemplateColumns: '92px 14px 1fr 48px',
                gap: '0 8px',
                alignItems: 'start',
                minHeight: 34,
              }}
            >
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--fg3)',
                  fontVariantNumeric: 'tabular-nums',
                  paddingTop: 1,
                }}
              >
                {e.date}
              </div>
              <div
                aria-hidden="true"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: muted ? 'var(--bg-muted)' : fg,
                    border: `2px solid ${muted ? 'var(--bd-strong)' : fg}`,
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                />
                {i < entries.length - 1 && (
                  <span style={{ flex: 1, width: 1, background: 'var(--bd-solid)', marginTop: 3 }} />
                )}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: muted ? 500 : 600,
                  color: muted ? 'var(--fg3)' : 'var(--fg1)',
                  paddingBottom: 10,
                  paddingTop: 1,
                }}
              >
                {e.ev}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                  color: toneColors(lcpTone(e.lcp)).fg,
                }}
              >
                {fr1(e.lcp)} s
              </div>
            </div>
          );
        })}
      </div>

      {recurrent && (
        <p
          style={{
            marginTop: 6,
            padding: '8px 10px',
            borderRadius: 9,
            background: 'var(--red-m)',
            border: '1px solid var(--red-b)',
            fontSize: '0.6875rem',
            color: 'var(--fg2)',
            lineHeight: 1.5,
          }}
        >
          <b style={{ color: 'var(--red)' }}>Signal différent d’une priorité neuve.</b> La correction
          de février n’a pas tenu : cherchez la cause de la régression (déploiement, nouveau script)
          avant de rejouer la même tâche.
        </p>
      )}
    </Sec>
  );
}

/* ── Provenance ── */

export function ProvCard({ auditHref }: { auditHref: string }) {
  return (
    <Sec title="Provenance" sub="D’où vient chaque affirmation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--fg4)', display: 'flex' }}>
            <IcoTask />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{PD.prov.audit}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
              {PD.prov.date} · {PD.prov.crawl}
            </div>
          </div>
          <a
            href={auditHref}
            className="btn-out"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.625rem', textDecoration: 'none' }}
          >
            Voir l’audit
          </a>
        </div>

        {PD.prov.sources.map(([name, detail]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--fg4)', display: 'flex' }}>
              <IcoDb />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{detail}</div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ color: 'var(--violet-fg)', display: 'flex', fontSize: 12 }}>
            ✦
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{PD.prov.agent}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
              Recommandation et libellé client · 27 mai 2026, 06 h 12
            </div>
          </div>
        </div>
      </div>
    </Sec>
  );
}
