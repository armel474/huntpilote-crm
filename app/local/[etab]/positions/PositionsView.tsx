'use client';

/**
 * SEO local — positions locales (session 3.3).
 *
 * La position varie selon l'endroit d'où l'on cherche : la carte de zone
 * porte une mesure par point ou par secteur, en couleur ET en chiffre, à
 * côté du tableau requête par requête et de la lecture par secteur.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { BlockingCard } from '@/components/local/Panels';
import { KeywordTable, ZoneMapCard, ZoneNotConfiguredCard, ZoneReadCard } from '@/components/local/PositionsPanels';
import { EmptyBlock } from '@/components/outils/Empty';
import { Lbl } from '@/components/ui/Atoms';
import { IcoArrowL, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { ESTABS, findEstab, isBlocked } from '@/lib/data/local';
import { POSITIONS_BY_ETAB, type PositionsData } from '@/lib/data/local-positions';

const DEMO_STATES = [
  ['normal', 'Relevé le plus récent'],
  ['premier', 'Premier relevé'],
  ['encours', 'Relevé en cours'],
  ['absent', 'Absent du pack sur toute la zone'],
] as const;

export function PositionsView({ etabId }: { etabId: string }) {
  const router = useRouter();
  const est = findEstab(etabId);
  const data = POSITIONS_BY_ETAB[est.id];
  const [demo, setDemo] = useState<(typeof DEMO_STATES)[number][0]>('normal');

  useEffect(() => setDemo('normal'), [est.id]);

  const blocked = isBlocked(est);
  const forceAbsent = demo === 'absent' && !!data;
  const shownData: PositionsData | null = useMemo(() => {
    if (!data) return null;
    if (!forceAbsent) return data;
    if (data.mode === 'grille') return { ...data, grid: data.grid.map((row) => row.map(() => null)) };
    return { ...data, secteurs: data.secteurs.map((s) => ({ ...s, pos: null })) };
  }, [data, forceAbsent]);

  const variance =
    shownData?.mode === 'grille'
      ? shownData.grid.flat().filter((v): v is number => v != null)
      : shownData?.mode === 'secteurs'
        ? shownData.secteurs.map((s) => s.pos).filter((v): v is number => v != null)
        : [];
  const highVariance = variance.length > 1 && Math.max(...variance) - Math.min(...variance) >= 6;

  const header = (
    <CRMHeader
      title={`Positions locales — ${est.name}`}
      period=""
      crumbs={[
        { label: 'HuntPilote', href: '/dashboard' },
        { label: 'SEO local', href: routes.local() },
        { label: est.name, href: routes.etablissement(est.id) },
        { label: 'Positions' },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Link href={routes.etablissement(est.id)} className="btn-out" style={{ textDecoration: 'none' }}>
          <IcoArrowL />
          Fiche de l’établissement
        </Link>
        <div className="ctx-g">
          <Lbl>
            <label htmlFor="pos-etab-sel">Établissement</label>
          </Lbl>
          <select id="pos-etab-sel" className="acct-sel" value={est.id} onChange={(e) => router.push(routes.etablissementPositions(e.target.value))}>
            {ESTABS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        {!blocked && est.zone && data && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lbl>
              <label htmlFor="pos-demo">Démo · état</label>
            </Lbl>
            <select id="pos-demo" className="state-sel" value={demo} onChange={(e) => setDemo(e.target.value as (typeof DEMO_STATES)[number][0])}>
              {DEMO_STATES.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail-row">
          <div className="col-main">
            {blocked ? (
              <BlockingCard est={est} />
            ) : !est.zone ? (
              <ZoneNotConfiguredCard estId={est.id} />
            ) : demo === 'encours' ? (
              <EmptyBlock title="Relevé en cours">
                Les positions se mettent à jour point par point sur la zone. Cela peut prendre quelques minutes selon la densité choisie.
              </EmptyBlock>
            ) : !shownData ? (
              <div className="empty">Aucune donnée de position pour cet établissement.</div>
            ) : (
              <>
                {highVariance && (
                  <div className="banner" data-tone="yellow">
                    <span className="banner-ico">
                      <IcoWarn size={12} />
                    </span>
                    <div style={{ flex: 1, minWidth: '14rem' }}>
                      <b>Position très variable selon les points de la zone.</b> C’est un résultat en soi : la moyenne seule masquerait de forts
                      écarts entre secteurs.
                    </div>
                  </div>
                )}
                <ZoneMapCard data={shownData} estId={est.id} />
                <KeywordTable keywords={demo === 'premier' ? shownData.keywords.map((k) => ({ ...k, prevMoy: k.posMoy })) : shownData.keywords} />
              </>
            )}
          </div>
          <div className="col-side">
            {!blocked && est.zone && shownData && <ZoneReadCard read={shownData.zoneRead} />}
            {!blocked && est.zone && (
              <div className="card" style={{ padding: '0.875rem 1rem' }}>
                <Lbl mb={6}>Configuration de la zone</Lbl>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {est.zone.mode === 'grille'
                    ? `Grille ${est.zone.rows} × ${est.zone.cols} · écart ${est.zone.spacingKm} km`
                    : est.zone.mode === 'secteurs'
                      ? `${est.zone.secteurs.length} secteurs listés`
                      : `Rayon de ${est.zone.km} km`}
                </div>
                <Link
                  href={`${routes.etablissement(est.id)}#zone-editor`}
                  className="btn-out"
                  style={{ textDecoration: 'none', marginTop: 8, width: '100%', justifyContent: 'center' }}
                >
                  Modifier la zone
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
