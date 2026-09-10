'use client';

/**
 * Rapports à produire — progression du cycle, filtres, ligne client et blocs
 * de déblocage. Les libellés et tons d'état viennent de `RQ_STATES`, lui-même
 * construit sur `ED_STATES`/`BANNER` de l'éditeur (session 1.3) : rien n'est
 * reformulé ici.
 */
import Link from 'next/link';
import { Pill, ProgressBar } from '@/components/ui/Atoms';
import { EmptyFilter } from '@/components/ui/States';
import {
  IcoBell,
  IcoCheck,
  IcoClock,
  IcoDoc,
  IcoLock,
  IcoMoon,
  IcoPen,
  IcoSend,
  IcoTrophy,
  IcoWarn,
} from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  RQ_GROUPS,
  RQ_PROOF_MIN,
  RQ_SENT,
  RQ_STATES,
  clientName,
  clientPlan,
  rqGroup,
  rqLate,
  rqReportSlug,
  type RqCycle,
  type RqGroupId,
  type RqRow,
  type RqState,
} from '@/lib/data/rapports-a-produire';

const STATE_ICON: Record<RqState, (p: { size?: number }) => React.ReactElement> = {
  apreparer: IcoDoc,
  brouillon: IcoPen,
  bloque: IcoLock,
  pret: IcoSend,
  publie: IcoCheck,
  corrige: IcoCheck,
  sanspreuve: IcoWarn,
};

const ordDay = (d: number) => (d === 1 ? '1er' : String(d));

/* ── Progression du cycle ── */

export function CycleCard({ rows, cycle }: { rows: RqRow[]; cycle: RqCycle }) {
  const sent = rows.filter((r) => RQ_SENT.includes(r.state)).length;
  const total = rows.length;
  const late = rows.filter((r) => rqLate(r, cycle)).length;
  const blocked = rows.filter((r) => r.state === 'bloque').length;
  const noProof = rows.filter((r) => r.proofs < RQ_PROOF_MIN).length;
  const toUnblock = rows.filter((r) => rqGroup(r, cycle) === 'debloquer').length;
  const pct = total ? Math.round((sent / total) * 100) : 0;
  const behind = cycle.today > cycle.targetDay && sent < total;
  const color = sent === total ? 'var(--green-fg)' : behind ? 'var(--red)' : 'var(--yellow-fg)';

  return (
    <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Progression du cycle — {cycle.period}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>
            Période close le {cycle.closedOn} · envoi par défaut {cycle.defaultDue} · cible : tous partis le {cycle.targetLabel} · nous sommes le{' '}
            {cycle.todayLabel}
          </div>
        </div>
        {behind && <Pill label={`${cycle.today - cycle.targetDay} jour${cycle.today - cycle.targetDay > 1 ? 's' : ''} de retard sur la cible`} tone="red" icon={<IcoWarn size={11} />} />}
        {sent === total && total > 0 && <Pill label="Cycle terminé" tone="green" icon={<IcoCheck size={11} />} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color, fontVariantNumeric: 'tabular-nums' }}>
          {sent} sur {total}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>rapports partis sur {total} attendus</span>
      </div>
      <ProgressBar value={pct} color={color} height={8} />

      <div style={{ marginTop: 7, display: 'flex', gap: 4, flexDirection: 'column', fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, color: toUnblock > 0 ? 'var(--red)' : 'var(--fg3)' }}>
          {toUnblock === 0 ? 'Rien à débloquer' : `${toUnblock} à débloquer · ${late} en retard sur la date promise, ${blocked} bloqué${blocked > 1 ? 's' : ''} par une relecture`}
        </span>
        <span style={{ fontWeight: 700, color: noProof > 0 ? 'var(--yellow-fg)' : 'var(--fg3)' }}>
          {noProof === 0 ? 'Tous les comptes ont au moins une preuve' : `${noProof} client${noProof > 1 ? 's' : ''} sans preuve ce mois-ci (seuil : ${RQ_PROOF_MIN} preuve minimum)`}
        </span>
      </div>
    </div>
  );
}

/* ── Filtres ── */

export function RqFilter({
  f,
  setF,
  counts,
  noProofOnly,
  setNoProofOnly,
  shown,
  total,
}: {
  f: RqGroupId | 'tout';
  setF: (v: RqGroupId | 'tout') => void;
  counts: Partial<Record<RqGroupId, number>>;
  noProofOnly: boolean;
  setNoProofOnly: (v: boolean) => void;
  shown: number;
  total: number;
}) {
  return (
    <div className="card" style={{ padding: '0.7rem 0.875rem', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="chips">
        <button type="button" className="chip" data-on={f === 'tout'} onClick={() => setF('tout')}>
          Tout le portefeuille
        </button>
        {RQ_GROUPS.map(([id, label]) => (
          <button key={id} type="button" className="chip" data-on={f === id} onClick={() => setF(id)}>
            {label} · {counts[id] || 0}
          </button>
        ))}
      </div>
      <button type="button" className="chip" data-on={noProofOnly} onClick={() => setNoProofOnly(!noProofOnly)}>
        Sans preuve seulement
      </button>
      <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>
        {shown} sur {total} clients
      </span>
    </div>
  );
}

/* ── Ligne client ── */

export function RqRowLine({ r, cycle, onNudge }: { r: RqRow; cycle: RqCycle; onNudge: (r: RqRow) => void }) {
  const st = RQ_STATES[r.state];
  const Icon = STATE_ICON[r.state];
  const late = rqLate(r, cycle);
  const noProof = r.proofs < RQ_PROOF_MIN;
  const blockers = r.blockers ?? [];
  /** Chaque ligne calcule son propre lien vers l'éditeur — jamais une constante partagée. */
  const href = routes.rapport(r.clientId, rqReportSlug(cycle));

  return (
    <div className="rq-row" style={late ? { borderColor: 'var(--red-b)' } : undefined}>
      <div className="rq-main">
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={routes.client(r.clientId)} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{clientName(r.clientId)}</span>
          </Link>
          <span className="lbl">{clientPlan(r.clientId)}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
          <Pill label={st.label} tone={st.tone} sm icon={<Icon size={11} />} />
          {late && <Pill label={`En retard de ${cycle.today - r.due} jour${cycle.today - r.due > 1 ? 's' : ''}`} tone="red" sm icon={<IcoWarn size={11} />} />}
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
            {r.sentOn ? `Envoyé le ${r.sentOn} · ${r.version} en ligne` : `Promis le ${ordDay(r.due)} · seuil : ${cycle.defaultDue}`}
          </span>
        </div>

        {blockers.length > 0 && (
          <div className="blk-row" style={{ marginTop: 9 }}>
            <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
              <IcoLock size={12} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 3 }}>
                {blockers.length} libellé{blockers.length > 1 ? 's' : ''} client à relire avant publication
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {blockers.map((b, i) => (
                  <li key={i} style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.4 }}>
                    « {b.label} » — {b.who}
                  </li>
                ))}
              </ul>
              <div className="blk-act" style={{ marginTop: 8 }}>
                <Link href={href} className="btn-out" style={{ textDecoration: 'none' }}>
                  <IcoPen size={11} />
                  Relire les {blockers.length} libellé{blockers.length > 1 ? 's' : ''}
                </Link>
                <button type="button" className="btn-out" onClick={() => onNudge(r)}>
                  <IcoBell size={11} />
                  Relancer {blockers[0].who.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rq-side">
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: noProof ? 'var(--yellow-fg)' : 'var(--fg2)',
            fontVariantNumeric: 'tabular-nums',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {noProof && <IcoWarn size={11} />}
          {r.proofs === 0 ? 'Aucune preuve' : `${r.proofs} preuve${r.proofs > 1 ? 's' : ''}`}
        </span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>{noProof ? `seuil : ${RQ_PROOF_MIN} minimum` : 'disponibles ce mois-ci'}</span>
      </div>

      <div className="rq-act">
        <Link href={href} className="btn-out" style={{ textDecoration: 'none' }}>
          {RQ_SENT.includes(r.state) ? 'Ouvrir le rapport' : 'Ouvrir l’éditeur'}
        </Link>
      </div>
    </div>
  );
}

/* ── Section de groupe ── */

export function RqGroupSection({
  id,
  title,
  sub,
  rows,
  cycle,
  onNudge,
}: {
  id: RqGroupId;
  title: string;
  sub: string;
  rows: RqRow[];
  cycle: RqCycle;
  onNudge: (r: RqRow) => void;
}) {
  if (rows.length === 0) return null;
  const isDeb = id === 'debloquer';
  const body = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span
          aria-hidden="true"
          style={{ width: 8, height: 8, borderRadius: '50%', background: isDeb ? 'var(--red)' : id === 'partis' ? 'var(--green-fg)' : 'var(--fg4)', flexShrink: 0 }}
        />
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h2>
        <span className="lbl">
          {rows.length} client{rows.length > 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginBottom: 8, lineHeight: 1.5 }}>{sub}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r) => (
          <RqRowLine key={r.clientId} r={r} cycle={cycle} onNudge={onNudge} />
        ))}
      </div>
    </>
  );
  return isDeb ? (
    <div style={{ padding: '0.75rem 0.875rem', borderRadius: 12, background: 'var(--red-m)', border: '1px solid var(--red-b)', marginBottom: 16 }}>{body}</div>
  ) : (
    <div style={{ marginBottom: 16 }}>{body}</div>
  );
}

/* ── Bannières d'état ── */

export function DebutBanner({ n, cycle }: { n: number; cycle: RqCycle }) {
  return (
    <div className="banner" data-tone="blue" style={{ marginBottom: 12 }}>
      <span className="banner-ico">
        <IcoMoon size={12} />
      </span>
      <div style={{ flex: 1, minWidth: '14rem' }}>
        <b>La période vient de se clore.</b> Les {n} rapports de {cycle.period.toLowerCase()} sont à préparer, aucun n’est commencé — c’est normal le
        lendemain de la clôture. Les envois sont promis {cycle.defaultDue}.
      </div>
    </div>
  );
}

export function PicBanner({ n, jours }: { n: number; jours: number }) {
  return (
    <div className="banner" data-tone="yellow" style={{ marginBottom: 12 }}>
      <span className="banner-ico">
        <IcoClock size={12} />
      </span>
      <div style={{ flex: 1, minWidth: '14rem' }}>
        <b>
          {n} rapports à sortir en {jours} jour{jours > 1 ? 's' : ''}
        </b>
        , aucun n’est encore parti. Commencez par les relectures : c’est ce qui bloque la publication, pas la rédaction.
      </div>
    </div>
  );
}

export function FiniBanner() {
  return (
    <div className="banner" data-tone="green" style={{ marginBottom: 12 }}>
      <span className="banner-ico">
        <IcoTrophy size={12} />
      </span>
      <div style={{ flex: 1, minWidth: '14rem' }}>
        <b>Tous les rapports du cycle sont partis.</b> Rien n’attend de relecture, rien n’a dépassé sa date promise.
      </div>
    </div>
  );
}

export function RqEmpty({ onReset }: { onReset: () => void }) {
  return (
    <EmptyFilter
      title="Aucun client pour ce filtre"
      text="Revenez à « Tout le portefeuille » pour revoir le cycle complet."
      onReset={onReset}
    />
  );
}
