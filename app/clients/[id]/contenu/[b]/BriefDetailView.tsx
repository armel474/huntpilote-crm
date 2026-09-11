'use client';

/**
 * Brief d'article — écran 6.1.
 *
 * Comme le détail d'audit, de tâche ou de priorité, un seul brief complet
 * existe dans le jeu de démonstration : tout identifiant de contenu y mène
 * (voir `generateStaticParams`). Un sélecteur de démonstration fait varier
 * l'état de remise, indépendamment de la ligne d'où l'on est venu — même
 * convention que `TacheDetailView`.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { CompetitorSection, IntentSection, KeywordSection, OutlineSection, RulesSection } from '@/components/contenu/BriefPanels';
import { PerfSide, ProofClose, TrackSide } from '@/components/contenu/BriefTrack';
import { Pill } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoRuler, IcoTrophy } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { BR_STAGES, brScenario, type BrStage } from '@/lib/data/brief';
import { CONTENU_CLIENT, CT_WRITERS } from '@/lib/data/contenu';

export function BriefDetailView({ clientId }: { clientId: string }) {
  const [scenario, setScenario] = useState<BrStage>('assigne');
  const [b, setB] = useState(() => brScenario('assigne'));
  const [closing, setClosing] = useState(false);
  const [proof, setProof] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5200);
    return () => clearTimeout(t);
  }, [toast]);

  const setSc = (s: BrStage) => {
    setScenario(s);
    setB(brScenario(s));
    setClosing(false);
    setProof(null);
  };

  const stage = BR_STAGES.find(([id]) => id === b.stage)!;

  const advance = (id: BrStage) => {
    setB((x) => ({
      ...x,
      stage: id,
      writer: id === 'assigne' && !x.writer ? CT_WRITERS.TB.name : x.writer,
    }));
    const label = BR_STAGES.find(([i]) => i === id)![1];
    setToast(`Brief passé à « ${label.toLowerCase()} ».`);
  };

  const publish = () => {
    setB((x) => ({
      ...x,
      stage: 'publie',
      track: { ...x.track, url: 'acmecorp.fr/blogue/structure-url-fiche-produit', pubAt: '9 septembre 2026' },
    }));
    setClosing(true);
  };

  const header = (
    <CRMHeader
      title={b.title}
      period=""
      crumbs={[
        { label: 'Client Hub', href: routes.clients() },
        { label: CONTENU_CLIENT.name, href: routes.client(clientId) },
        { label: 'Contenu', href: routes.contenu(clientId) },
        { label: b.id.toUpperCase() },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Pill
          label={stage[1]}
          tone={b.stage === 'brief' ? 'neutral' : b.stage === 'relecture' ? 'yellow' : b.stage === 'publie' || b.stage === 'mesure' ? 'green' : 'blue'}
        />
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{stage[2]}</span>
        <Link href={routes.contenu(clientId)} className="btn-out" style={{ fontSize: '0.6875rem', textDecoration: 'none' }}>
          Calendrier éditorial
        </Link>
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="lbl">Démo · état</span>
            <select className="state-sel" value={scenario} onChange={(e) => setSc(e.target.value as BrStage)} aria-label="État de démonstration">
              {BR_STAGES.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="content" style={{ maxWidth: 1200 }}>
          <div className="note-box" style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
              <IcoRuler size={13} />
            </span>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
              <b>Ce brief cadre l’article, il ne le contient pas.</b> Le texte s’écrit dans l’outil du rédacteur ; ici on
              fixe la cible, on suit l’avancement, et on transforme la publication en preuve de valeur.
            </div>
          </div>

          {closing && !proof && (
            <div style={{ marginBottom: 12 }}>
              <ProofClose
                b={b}
                onSkip={() => {
                  setClosing(false);
                  setToast('Article publié sans preuve de valeur. Il n’apparaîtra pas au rapport du client.');
                }}
                onDone={() => {
                  setProof('PV-091');
                  setClosing(false);
                  setToast('Preuve de valeur PV-091 créée et rattachée au rapport de septembre.');
                }}
              />
            </div>
          )}
          {proof && (
            <div className="note-box" style={{ marginBottom: 12, background: 'var(--green-m)', borderColor: 'var(--green-b)' }}>
              <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoTrophy size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b>Preuve de valeur {proof} créée.</b> Elle attend une relecture avant publication du rapport.{' '}
                <Link href={routes.rapport(clientId, '2026-09')}>Ouvrir l’éditeur de rapport</Link>
              </div>
            </div>
          )}
          {b.perf && b.perf.proof && !proof && (
            <div className="note-box" style={{ marginBottom: 12, background: 'var(--green-m)', borderColor: 'var(--green-b)' }}>
              <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoTrophy size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b>Preuve de valeur {b.perf.proof}</b> rattachée au rapport, avec la performance mesurée.{' '}
                <Link href={routes.rapport(clientId, '2026-09')}>Ouvrir l’éditeur de rapport</Link>
              </div>
            </div>
          )}

          <div className="detail-row" style={{ padding: 0 }}>
            <div className="col-main">
              <KeywordSection b={b} />
              <IntentSection b={b} />
              <OutlineSection key={b.stage} b={b} />
              <CompetitorSection b={b} />
              <RulesSection b={b} />
            </div>
            <div className="col-side">
              <TrackSide b={b} clientId={clientId} onAdvance={advance} onPublish={publish} />
              <PerfSide b={b} />
            </div>
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
            maxWidth: 'min(620px,92vw)',
            lineHeight: 1.45,
          }}
        >
          {toast}
        </div>
      )}
    </AppShell>
  );
}
