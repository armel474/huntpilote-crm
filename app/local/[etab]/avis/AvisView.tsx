'use client';

/**
 * SEO local — avis (session 3.2).
 *
 * Note moyenne, tendance et répartition par étoile, analyse de tonalité par
 * l'agent, flux d'avis (sans réponse en tête), réponse assistée relue avant
 * publication.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { BlockingCard } from '@/components/local/Panels';
import { RatingSummaryCard, ReviewRow, SentimentCard } from '@/components/local/AvisPanels';
import { Lbl, Sec } from '@/components/ui/Atoms';
import { IcoArrowL } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { ESTABS, findEstab, isBlocked } from '@/lib/data/local';
import { AVIS_BY_ETAB, genDraft, type Avis, type AvisEtat } from '@/lib/data/local-avis';

const ORDER: Record<AvisEtat, number> = { sans_reponse: 0, a_relire: 1, signale: 2, publiee: 3 };
const DEMO_STATES = [
  ['normal', 'Flux normal'],
  ['aucun', 'Aucun avis'],
] as const;

export function AvisView({ etabId }: { etabId: string }) {
  const router = useRouter();
  const est = findEstab(etabId);
  const data = AVIS_BY_ETAB[est.id];
  const [avis, setAvis] = useState<Avis[]>(() => (data ? data.avis.map((a) => ({ ...a })) : []));
  const [expandedId, setExpandedId] = useState<number | null>(() => (data ? (data.avis.find((a) => a.etat !== 'publiee') ?? null)?.id ?? null : null));
  const [demo, setDemo] = useState<(typeof DEMO_STATES)[number][0]>('normal');
  const [fNote, setFNote] = useState('toutes');
  const [fEtat, setFEtat] = useState('toutes');

  useEffect(() => {
    const d = AVIS_BY_ETAB[est.id];
    setAvis(d ? d.avis.map((a) => ({ ...a })) : []);
    setExpandedId(d ? (d.avis.find((a) => a.etat !== 'publiee') ?? null)?.id ?? null : null);
    setDemo('normal');
    setFNote('toutes');
    setFEtat('toutes');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [est.id]);

  const update = (rid: number, patch: Partial<Avis>) => setAvis((list) => list.map((r) => (r.id === rid ? { ...r, ...patch } : r)));
  const onGenerate = (rid: number) => update(rid, { etat: 'a_relire', reponseDraft: genDraft(avis.find((r) => r.id === rid)!) });
  const onRegenerate = (rid: number) => update(rid, { reponseDraft: `${genDraft(avis.find((r) => r.id === rid)!)} (variante)` });
  const onPublish = (rid: number) => update(rid, { etat: 'publiee', reponse: avis.find((r) => r.id === rid)!.reponseDraft });
  const onSignalAction = (rid: number, action: 'confirme' | 'annule') =>
    update(
      rid,
      action === 'annule'
        ? { etat: 'publiee', reponse: 'Avis retiré du signalement — traité comme un avis normal.' }
        : { signaleMotif: `${avis.find((r) => r.id === rid)!.signaleMotif} Signalement confirmé et transmis à Google.` },
    );

  const blocked = isBlocked(est);
  const shown = demo === 'aucun' ? [] : avis;
  const filtered = useMemo(
    () =>
      shown
        .filter((r) => (fNote === 'toutes' || r.note === +fNote) && (fEtat === 'toutes' || r.etat === fEtat))
        .sort((a, b) => ORDER[a.etat] - ORDER[b.etat]),
    [shown, fNote, fEtat],
  );

  const header = (
    <CRMHeader
      title={`Avis — ${est.name}`}
      period=""
      crumbs={[
        { label: 'HuntPilote', href: '/dashboard' },
        { label: 'SEO local', href: routes.local() },
        { label: est.name, href: routes.etablissement(est.id) },
        { label: 'Avis' },
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
            <label htmlFor="avis-etab-sel">Établissement</label>
          </Lbl>
          <select id="avis-etab-sel" className="acct-sel" value={est.id} onChange={(e) => router.push(routes.etablissementAvis(e.target.value))}>
            {ESTABS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        {!blocked && (
          <>
            <div className="ctx-g">
              <Lbl>
                <label htmlFor="avis-note">Note</label>
              </Lbl>
              <select id="avis-note" className="date-sel" value={fNote} onChange={(e) => setFNote(e.target.value)}>
                <option value="toutes">Toutes</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} étoiles
                  </option>
                ))}
              </select>
            </div>
            <div className="ctx-g">
              <Lbl>
                <label htmlFor="avis-etat">État</label>
              </Lbl>
              <select id="avis-etat" className="date-sel" value={fEtat} onChange={(e) => setFEtat(e.target.value)}>
                <option value="toutes">Tous</option>
                <option value="sans_reponse">Sans réponse</option>
                <option value="a_relire">Réponse à relire</option>
                <option value="publiee">Réponse publiée</option>
                <option value="signale">Signalé</option>
              </select>
            </div>
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="avis-demo">Démo · état</label>
          </Lbl>
          <select id="avis-demo" className="state-sel" value={demo} onChange={(e) => setDemo(e.target.value as (typeof DEMO_STATES)[number][0])}>
            {DEMO_STATES.map(([id, l]) => (
              <option key={id} value={id}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="detail-row">
          <div className="col-main">
            {blocked ? (
              <BlockingCard est={est} />
            ) : filtered.length === 0 && demo === 'aucun' ? (
              <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
                <div className="empty" style={{ border: 'none', padding: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: 5 }}>Aucun avis pour cet établissement</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fg2)' }}>
                    La fiche est trop récente ou aucun client n’a encore laissé d’avis Google.
                  </div>
                </div>
              </div>
            ) : (
              <Sec title="Flux d’avis" sub={`${filtered.length} avis affichés · les avis sans réponse en tête`}>
                {filtered.length === 0 ? (
                  <div className="empty">Aucun avis pour ces filtres.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filtered.map((r) => (
                      <ReviewRow
                        key={r.id}
                        r={r}
                        expanded={expandedId === r.id}
                        onToggle={() => setExpandedId(r.id)}
                        onGenerate={() => onGenerate(r.id)}
                        onDraftChange={(v) => update(r.id, { reponseDraft: v })}
                        onRegenerate={() => onRegenerate(r.id)}
                        onPublish={() => onPublish(r.id)}
                        onSignal={(a) => onSignalAction(r.id, a)}
                      />
                    ))}
                  </div>
                )}
              </Sec>
            )}
          </div>
          <div className="col-side">
            {!blocked && data && <RatingSummaryCard dist={data.dist} trend={data.trend} threshold="Seuil : ≥ 4,0 et 0 avis sans réponse" />}
            {!blocked && data && <SentimentCard sentiment={data.sentiment} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
