'use client';

/**
 * Rapports à produire — écran cockpit, portée sur tout le portefeuille.
 * Où en est-on des livrables du mois ? Cet écran ne compose ni ne publie
 * aucun rapport : il liste où en est chaque rapport et mène à l'éditeur
 * (session 1.3) pour agir.
 */
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  CycleCard,
  DebutBanner,
  FiniBanner,
  PicBanner,
  RqEmpty,
  RqFilter,
  RqGroupSection,
} from '@/components/rapports-a-produire/Panels';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoBell } from '@/components/ui/Icons';
import {
  RQ_GROUPS,
  RQ_SCENARIOS,
  RQ_SENT,
  clientName,
  rqGroup,
  rqScenario,
  type RqGroupId,
  type RqRow,
  type RqScenario,
} from '@/lib/data/rapports-a-produire';

export function RapportsAProduireView() {
  const [scenario, setScenario] = useState<RqScenario>('normal');
  const [filter, setFilter] = useState<RqGroupId | 'tout'>('tout');
  const [noProofOnly, setNoProofOnly] = useState(false);
  const [nudged, setNudged] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(t);
  }, [toast]);

  const setSc = (s: RqScenario) => {
    setScenario(s);
    setFilter('tout');
    setNoProofOnly(false);
    setNudged([]);
  };

  const { cycle, rows } = useMemo(() => rqScenario(scenario), [scenario]);
  const counts = useMemo(() => {
    const c: Partial<Record<RqGroupId, number>> = {};
    rows.forEach((r) => {
      const g = rqGroup(r, cycle);
      c[g] = (c[g] || 0) + 1;
    });
    return c;
  }, [rows, cycle]);
  const shown = rows.filter((r) => (filter === 'tout' || rqGroup(r, cycle) === filter) && (!noProofOnly || r.proofs < 1));

  const reviewers = useMemo(
    () => [...new Set(rows.filter((r) => r.state === 'bloque').flatMap((r) => (r.blockers ?? []).map((b) => b.who)))],
    [rows],
  );
  const blockedLabels = rows.filter((r) => r.state === 'bloque').reduce((n, r) => n + (r.blockers ?? []).length, 0);

  const nudgeAll = () => {
    setNudged(reviewers);
    setToast(`Relance envoyée à ${reviewers.join(' et ')} — les ${blockedLabels} libellés à relire leur ont été rappelés, avec le lien vers chaque rapport.`);
  };
  const nudgeOne = (r: RqRow) => {
    const who = (r.blockers ?? [])[0]?.who;
    if (!who) return;
    setNudged((n) => [...new Set([...n, who])]);
    setToast(`Relance envoyée à ${who} pour ${clientName(r.clientId)} — ${(r.blockers ?? []).length} libellé${(r.blockers ?? []).length > 1 ? 's' : ''} à relire.`);
  };

  const sent = rows.filter((r) => RQ_SENT.includes(r.state)).length;
  const jours = Math.max(cycle.targetDay - cycle.today, 1);

  const header = (
    <CRMHeader
      title="Rapports à produire"
      subtitle="Vue agence du cycle mensuel — les libellés d’état sont ceux de l’éditeur de rapport"
      period=""
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Une ligne par client · triées pour débloquer d’abord</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {reviewers.length > 0 && (
            <button
              type="button"
              className="btn-main"
              style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
              onClick={nudgeAll}
              disabled={nudged.length >= reviewers.length}
            >
              <IcoBell size={12} />
              {nudged.length >= reviewers.length ? 'Relecteurs relancés' : `Relancer les ${reviewers.length} relecteurs`}
            </button>
          )}
          <DemoOnly>
            <span className="lbl">Démo · état</span>
            <select className="state-sel" value={scenario} onChange={(e) => setSc(e.target.value as RqScenario)} aria-label="État de démonstration">
              {RQ_SCENARIOS.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </DemoOnly>
        </div>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="content" style={{ maxWidth: 1040 }}>
          {scenario === 'debut' && <DebutBanner n={rows.length} cycle={cycle} />}
          {scenario === 'pic' && <PicBanner n={rows.length} jours={jours} />}
          {sent === rows.length && rows.length > 0 && <FiniBanner />}

          <CycleCard rows={rows} cycle={cycle} />
          <RqFilter f={filter} setF={setFilter} counts={counts} noProofOnly={noProofOnly} setNoProofOnly={setNoProofOnly} shown={shown.length} total={rows.length} />

          {shown.length === 0 ? (
            <RqEmpty onReset={() => { setFilter('tout'); setNoProofOnly(false); }} />
          ) : (
            RQ_GROUPS.map(([id, title, sub]) => (
              <RqGroupSection key={id} id={id} title={title} sub={sub} cycle={cycle} onNudge={nudgeOne} rows={shown.filter((r) => rqGroup(r, cycle) === id)} />
            ))
          )}

          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6, marginTop: 4 }}>
            Cet écran ne compose ni ne publie : il liste où en est chaque rapport et mène à l’éditeur. « En retard » n’est pas un état de l’éditeur — c’est
            la date d’envoi promise qui est passée, signalée par-dessus l’état réel du rapport.
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 18,
            zIndex: 80,
            background: 'var(--fg1)',
            color: 'var(--bg-solid)',
            padding: '9px 14px',
            borderRadius: 10,
            fontSize: '0.6875rem',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
            maxWidth: 'min(600px,92vw)',
            lineHeight: 1.45,
          }}
        >
          {toast}
        </div>
      )}
    </AppShell>
  );
}
