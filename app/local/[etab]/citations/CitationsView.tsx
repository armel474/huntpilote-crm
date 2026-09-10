'use client';

/**
 * SEO local — citations et annuaires (session 3.2).
 *
 * Référence officielle, annuaires triés par gravité puis par autorité,
 * détail champ par champ d'une incohérence, doublons mis en évidence.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { BlockingCard } from '@/components/local/Panels';
import { AnnuaireRow, ReferenceCard } from '@/components/local/CitationsPanels';
import { EmptyBlock } from '@/components/outils/Empty';
import { Lbl, Sec } from '@/components/ui/Atoms';
import { IcoArrowL, IcoRepeat, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { ESTABS, findEstab, isBlocked } from '@/lib/data/local';
import { AUTORITE_TIER, CITATIONS_BY_ETAB, REFERENCE_BY_ETAB, type CitationEtat } from '@/lib/data/local-citations';

const ETAT_W: Record<CitationEtat, number> = { doublon: 3, incoherent: 2, inaccessible: 1, absent: 0, conforme: -1 };
const DEMO_STATES = [
  ['normal', 'Analyse la plus récente'],
  ['jamais', 'Analyse jamais lancée'],
  ['encours', 'Analyse en cours'],
] as const;

export function CitationsView({ etabId }: { etabId: string }) {
  const router = useRouter();
  const est = findEstab(etabId);
  const ref = REFERENCE_BY_ETAB[est.id];
  const rows = CITATIONS_BY_ETAB[est.id] ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [created, setCreated] = useState<Record<string, { id: string; kind: 'prio' | 'tache' }>>({});
  const [demo, setDemo] = useState<(typeof DEMO_STATES)[number][0]>('normal');

  useEffect(() => {
    setExpanded(null);
    setCreated({});
    setDemo('normal');
  }, [est.id]);

  const blocked = isBlocked(est);
  const sorted = useMemo(
    () => [...rows].sort((a, b) => (ETAT_W[b.etat] * 10 + AUTORITE_TIER[b.autorite]) - (ETAT_W[a.etat] * 10 + AUTORITE_TIER[a.autorite])),
    [rows],
  );
  const present = rows.filter((r) => r.etat !== 'absent' && r.etat !== 'inaccessible').length;
  const doublons = rows.filter((r) => r.etat === 'doublon');
  const nCreated = Object.keys(created).length;
  const create = (annuaire: string, kind: 'prio' | 'tache') =>
    setCreated((m) => ({ ...m, [annuaire]: { id: `P-05${String(Object.keys(m).length + 1).padStart(2, '0')}`, kind } }));
  const prioHref = (id: string) => routes.priorite(est.clientId, id.toLowerCase());
  const tacheHref = (id: string) => routes.tache(est.clientId, id.toLowerCase());

  const header = (
    <CRMHeader
      title={`Citations et annuaires — ${est.name}`}
      period=""
      crumbs={[
        { label: 'HuntPilote', href: '/dashboard' },
        { label: 'SEO local', href: routes.local() },
        { label: est.name, href: routes.etablissement(est.id) },
        { label: 'Citations' },
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
            <label htmlFor="cit-etab-sel">Établissement</label>
          </Lbl>
          <select id="cit-etab-sel" className="acct-sel" value={est.id} onChange={(e) => router.push(routes.etablissementCitations(e.target.value))}>
            {ESTABS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        {!blocked && rows.length > 0 && (
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
            {present} annuaire{present > 1 ? 's' : ''} sur {rows.length} de référence · Seuil : {rows.length} sur {rows.length}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="cit-demo">Démo · état</label>
          </Lbl>
          <select id="cit-demo" className="state-sel" value={demo} onChange={(e) => setDemo(e.target.value as (typeof DEMO_STATES)[number][0])}>
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
            ) : demo === 'jamais' ? (
              <EmptyBlock
                title="Aucune analyse de citations n’a encore été lancée"
                actions={
                  <button type="button" className="btn-pri" onClick={() => setDemo('normal')}>
                    <IcoRepeat />
                    Lancer l’analyse
                  </button>
                }
              >
                L’écran vérifiera {rows.length} annuaires de référence et comparera chacun à la fiche officielle du client.
              </EmptyBlock>
            ) : demo === 'encours' ? (
              <EmptyBlock title="Analyse en cours">7 annuaires vérifiés sur {rows.length}. Les résultats apparaîtront au fur et à mesure.</EmptyBlock>
            ) : (
              <>
                {doublons.length > 0 && (
                  <div className="banner" data-tone="red">
                    <span className="banner-ico">
                      <IcoWarn size={12} />
                    </span>
                    <div style={{ flex: 1, minWidth: '14rem' }}>
                      <b>
                        {doublons.length} doublon{doublons.length > 1 ? 's' : ''} de fiche détecté{doublons.length > 1 ? 's' : ''}.
                      </b>{' '}
                      C’est le problème le plus coûteux et le plus fréquent : deux fiches actives se concurrencent pour le même établissement et
                      diluent son autorité locale.
                    </div>
                  </div>
                )}
                {nCreated > 0 && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
                      {nCreated} geste{nCreated > 1 ? 's' : ''} de correction créé{nCreated > 1 ? 's' : ''} depuis cet écran
                    </span>
                  </div>
                )}
                <Sec title="Annuaires" sub="Triés par gravité et par autorité de la source — un annuaire à forte autorité pèse plus qu’un annuaire obscur">
                  {sorted.length === 0 ? (
                    <div className="empty">Aucun annuaire de référence pour cet établissement.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {sorted.map((row) => (
                        <AnnuaireRow
                          key={row.annuaire}
                          row={row}
                          expanded={expanded === row.annuaire}
                          onToggle={() => setExpanded(row.annuaire)}
                          onCreatePrio={() => create(row.annuaire, 'prio')}
                          onCreateTache={() => create(row.annuaire, 'tache')}
                          created={created[row.annuaire]}
                          prioHref={prioHref}
                          tacheHref={tacheHref}
                        />
                      ))}
                    </div>
                  )}
                </Sec>
              </>
            )}
          </div>
          <div className="col-side">
            {!blocked && ref && <ReferenceCard info={ref} />}
            {!blocked && (
              <Sec title="Ce qui compte le plus" sub="Rappel de hiérarchisation">
                <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.6 }}>
                  Un numéro de téléphone périmé sur un annuaire à forte autorité compte plus qu’une virgule d’écart sur un annuaire obscur. Les
                  doublons de fiche restent le problème le plus coûteux : ils divisent les avis et les citations d’un même établissement en deux
                  identités concurrentes.
                </div>
              </Sec>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
