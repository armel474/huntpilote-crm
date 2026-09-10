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
import { IcoArrowL, IcoCompare } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { ESTABS, findEstab, isBlocked } from '@/lib/data/local';

export function EtablissementView({ etabId }: { etabId: string }) {
  const router = useRouter();
  const est = findEstab(etabId);
  const blocked = isBlocked(est);
  const auditHref = est.auditRef ? routes.audit(est.clientId, est.auditRef.id.toLowerCase()) : null;

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
        {auditHref && (
          <Link href={auditHref} className="btn-out" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <IcoCompare />
            Retour à l’audit {est.auditRef!.id}
          </Link>
        )}
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail-row">
          <div className="col-main">
            {blocked ? (
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
            <EstabMetaCard est={est} />
            {!blocked && <StatsCard est={est} />}
            {!blocked && <LinkedScreensCard est={est} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
