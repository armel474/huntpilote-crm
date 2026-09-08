'use client';

/**
 * Comparaison de deux audits.
 *
 * Les régressions viennent en premier, puis les constats nouveaux, puis les
 * améliorations : un score qui monte peut cacher des critères qui se sont
 * dégradés, et c'est ce qu'il faut traiter d'abord.
 */
import Link from 'next/link';
import { Lbl, Pill, Sec } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCompare,
  IcoDown,
  IcoPlus,
  IcoSpin,
  IcoUp,
  IcoWarn,
  type IconProps,
} from '@/components/ui/Icons';
import { DIM_ICON } from '@/components/audit/Panels';
import { CMP, KIND, type ChangeKind, type CmpRowData } from '@/lib/data/audit';

const KIND_ICON: Record<ChangeKind, (p: IconProps) => React.ReactElement> = {
  regress: IcoDown,
  improve: IcoUp,
  new: IcoWarn,
};

const KIND_TONE: Record<ChangeKind, readonly [string, string, string]> = {
  regress: ['var(--red-m)', 'var(--red-b)', 'var(--red)'],
  improve: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'],
  new: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
};

function CmpRow({
  r,
  created,
  onCreate,
  prioHref,
}: {
  r: CmpRowData;
  created: Record<string, string>;
  onCreate: (criterion: string) => void;
  prioHref: string;
}) {
  const k = KIND[r.kind];
  const Icon = KIND_ICON[r.kind];
  const prio = r.prio ?? created[r.c];

  return (
    <div className="cmp-row" data-kind={r.kind}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.c}</span>
          <Pill label={k.label} tone={k.tone} sm icon={<Icon size={10} />} />
        </div>
        <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{r.dim}</div>
        {r.note && (
          <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>
            {r.note}
          </p>
        )}
      </div>
      <div>
        <Lbl mb={2}>1 sept.</Lbl>
        <div className="cmp-val" data-dim="old">
          {r.a ?? 'non détecté'}
        </div>
      </div>
      <div>
        <Lbl mb={2}>1 oct.</Lbl>
        <div className="cmp-val">{r.b}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {prio ? (
          <Link href={prioHref} style={{ textDecoration: 'none' }}>
            <Pill label={`Priorité ${prio}`} tone="blue" sm icon={<IcoArrowR />} />
          </Link>
        ) : (
          <button type="button" className="btn-out" onClick={() => onCreate(r.c)}>
            <IcoPlus size={11} />
            Créer la priorité
          </button>
        )}
      </div>
    </div>
  );
}

export function CmpGroup({
  kind,
  rows,
  created,
  onCreate,
  prioHref,
}: {
  kind: ChangeKind;
  rows: readonly CmpRowData[];
  created: Record<string, string>;
  onCreate: (criterion: string) => void;
  prioHref: string;
}) {
  const k = KIND[kind];
  const Icon = KIND_ICON[kind];
  const [bg, bd, fg] = KIND_TONE[kind];

  return (
    <Sec
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span className="grp-ico" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>
            <Icon size={12} />
          </span>
          {k.title}
        </span>
      }
      sub={k.desc}
      right={<Pill label={`${rows.length} critère${rows.length > 1 ? 's' : ''}`} tone={k.tone} sm />}
    >
      <div className="cmp-head" aria-hidden="true">
        <Lbl mb={0}>Critère</Lbl>
        <Lbl mb={0}>Audit du 1 sept.</Lbl>
        <Lbl mb={0}>Audit du 1 oct.</Lbl>
        <span />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {rows.map((r) => (
          <CmpRow key={r.c} r={r} created={created} onCreate={onCreate} prioHref={prioHref} />
        ))}
      </div>
    </Sec>
  );
}

export function CmpSummary() {
  const count = (k: ChangeKind) => CMP.rows.filter((r) => r.kind === k).length;

  return (
    <Sec
      title="Ce qui a changé entre les deux audits"
      sub={`${CMP.a.date} → ${CMP.b.date} · même pondération des trois dimensions`}
      right={
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--fg3)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {CMP.a.score}
          </span>
          <span aria-hidden="true" style={{ color: 'var(--fg4)', display: 'flex' }}>
            <IcoArrowR />
          </span>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {CMP.b.score}
          </span>
          <Pill label={`+${CMP.b.score - CMP.a.score} pts`} tone="green" sm icon={<IcoUp />} />
        </div>
      }
    >
      <div className="weight-grid" style={{ marginBottom: 10 }}>
        {CMP.dims.map((d) => {
          const Icon = DIM_ICON[d.id];
          const up = d.b >= d.a;
          return (
            <div key={d.id} className="weight-cell">
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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--fg3)',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d.a}
                </span>
                <span aria-hidden="true" style={{ color: 'var(--fg4)', display: 'flex' }}>
                  <IcoArrowR />
                </span>
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d.b}
                </span>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    color: up ? 'var(--green-fg)' : 'var(--red)',
                  }}
                >
                  {up ? '+' : '−'}
                  {Math.abs(d.b - d.a)} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Pill label={`${count('regress')} critères dégradés`} tone="red" icon={<IcoDown />} />
        <Pill label={`${count('improve')} critères améliorés`} tone="green" icon={<IcoUp />} />
        <Pill label={`${count('new')} nouveaux constats`} tone="yellow" icon={<IcoWarn size={12} />} />
      </div>

      <div className="note-box">
        <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoWarn size={12} />
        </span>
        <div style={{ flex: 1 }}>
          <b>Le score monte, et pourtant quatre critères ont régressé.</b> La progression vient
          surtout de la vitesse mobile, qui pèse lourd dans le SEO. Les régressions restent à
          traiter : elles sont listées en premier ci-dessous.
        </div>
      </div>
    </Sec>
  );
}

export function CmpEmpty({ auditHref }: { auditHref: string }) {
  return (
    <Sec title="Rien à comparer" sub="Premier audit de ce client">
      <div className="empty">
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--fg3)', marginBottom: 6 }}>
          <IcoCompare />
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>
          Un seul audit existe pour ce client
        </div>
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--fg2)',
            lineHeight: 1.5,
            maxWidth: '30rem',
            margin: '0 auto',
          }}
        >
          L’audit du 1 octobre 2026 est le premier. Ses mesures servent de point de départ : la
          comparaison sera possible dès le prochain audit, prévu le 1 novembre.
        </p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          <Link href={auditHref} className="btn-pri" style={{ textDecoration: 'none' }}>
            Voir l’audit du 1 octobre
            <IcoArrowR />
          </Link>
          <button type="button" className="btn-out">
            <IcoSpin />
            Relancer un audit maintenant
          </button>
        </div>
      </div>
    </Sec>
  );
}
