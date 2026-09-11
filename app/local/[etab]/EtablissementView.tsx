'use client';

/**
 * SEO local — fiche d'établissement (session 3.1).
 *
 * Complétude de la fiche Google Business, éditeur de zone desservie (le plus
 * important de l'écran), rappel des critères de présence en ligne partagés
 * avec l'audit, et états bloquants pour une fiche non revendiquée,
 * suspendue ou tenue par un tiers.
 */
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import {
  BlockingCard,
  CriteresRappelCard,
  EstabMetaCard,
  GbpChip,
  GbpCompletionCard,
  LinkedScreensCard,
  PublicationsCard,
  QaCard,
  StatsCard,
  ZoneEditorCard,
} from '@/components/local/Panels';
import { Lbl } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { ErrorStale, SkelLine } from '@/components/ui/States';
import { IcoArrowL, IcoCompare } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { ESTABS, findEstab, isBlocked } from '@/lib/data/local';

/* ── Démo · état ── */

type EtabScenarioId = 'normal' | 'chargement' | 'perime';

const ETAB_SCENARIOS: [EtabScenarioId, string][] = [
  ['normal', 'Normal'],
  ['chargement', 'Chargement'],
  ['perime', 'Données périmées'],
];

/** Silhouette de carte — même charpente `.card` que les panneaux réels. */
function CardSkeleton({ h = 90 }: { h?: number }) {
  return (
    <div className="card" style={{ padding: '0.875rem 1rem' }} aria-hidden="true">
      <SkelLine w="38%" h={12} style={{ marginBottom: 12 }} />
      <SkelLine w="100%" h={h} style={{ borderRadius: 8 }} />
    </div>
  );
}

export function EtablissementView({ etabId }: { etabId: string }) {
  const router = useRouter();
  const [scenario, setScenario] = useState<EtabScenarioId>('normal');
  const est = findEstab(etabId);
  const blocked = isBlocked(est);
  const auditHref = est.auditRef ? routes.audit(est.clientId, est.auditRef.id.toLowerCase()) : null;
  const loading = scenario === 'chargement';

  const header = (
    <CRMHeader
      title={est.name}
      period=""
      crumbs={[{ label: 'HuntPilote', href: '/dashboard' }, { label: 'SEO local', href: routes.local() }, { label: est.name }]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Link href={routes.local()} className="btn-out" style={{ textDecoration: 'none' }}>
          <IcoArrowL />
          Vue d’ensemble locale
        </Link>
        <div className="ctx-g">
          <span className="lbl" style={{ marginBottom: 0 }}>
            <label htmlFor="etab-sel">Établissement</label>
          </span>
          <select id="etab-sel" className="acct-sel" value={est.id} onChange={(e) => router.push(routes.etablissement(e.target.value))}>
            {ESTABS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <GbpChip st={est.gbp} sm={false} />
        <DemoOnly>
          <div className="ctx-g" style={{ marginLeft: auditHref ? undefined : 'auto' }}>
            <Lbl>
              <label htmlFor="etat-demo-etab">Démo · état</label>
            </Lbl>
            <select
              id="etat-demo-etab"
              className="state-sel"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as EtabScenarioId)}
            >
              {ETAB_SCENARIOS.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
        {auditHref && (
          <Link href={auditHref} className="btn-out" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <IcoCompare />
            Retour à l’audit {est.auditRef!.id}
          </Link>
        )}
      </div>

      {scenario === 'perime' && !blocked && (
        <div style={{ padding: '0.75rem 1.125rem 0' }}>
          <ErrorStale
            at="3 septembre 2026"
            ageLabel="il y a 7 jours"
            thresholdLabel="7 jours"
            onRefresh={() => setScenario('normal')}
          />
        </div>
      )}

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail-row">
          <div className="col-main">
            {loading ? (
              <>
                <CardSkeleton h={130} />
                <CardSkeleton h={170} />
                <CardSkeleton h={100} />
                <CardSkeleton h={70} />
                <CardSkeleton h={70} />
              </>
            ) : blocked ? (
              <BlockingCard est={est} />
            ) : (
              <>
                <GbpCompletionCard est={est} />
                <ZoneEditorCard est={est} />
                <CriteresRappelCard est={est} />
                <PublicationsCard est={est} />
                <QaCard est={est} />
              </>
            )}
          </div>
          <div className="col-side">
            {loading ? (
              <>
                <CardSkeleton h={60} />
                <CardSkeleton h={80} />
                <CardSkeleton h={90} />
              </>
            ) : (
              <>
                <EstabMetaCard est={est} />
                {!blocked && <StatsCard est={est} />}
                {!blocked && <LinkedScreensCard est={est} />}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
