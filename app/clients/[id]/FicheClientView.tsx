'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { LeftPanel, RightPanel } from '@/components/fiche/SidePanels';
import { PanelApercu } from '@/components/fiche/PanelApercu';
import { PanelPriorites } from '@/components/fiche/PanelPriorites';
import { PanelDiagnostics, PanelPlan } from '@/components/fiche/PanelPlan';
import { PanelRapports } from '@/components/fiche/PanelRapports';
import { PanelContrat } from '@/components/fiche/PanelContrat';
import { FICHE_TABS, type FicheTab } from '@/components/fiche/tabs';
import { IcoDoc, IcoPlus, IcoTarget, IcoZap } from '@/components/ui/Icons';
import { CLIENT, PRIORITIES, UX_STATES, type UxState } from '@/lib/data/fiche-client';
import { routes } from '@/lib/routes';

/** Durée simulée d'un audit avant que la fiche ne se remplisse. */
const AUDIT_DURATION_MS = 4000;

export function FicheClientView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<FicheTab>('apercu');
  const [uxState, setUxState] = useState<UxState>('active');
  const auditTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (auditTimer.current !== null) window.clearTimeout(auditTimer.current);
    };
  }, []);

  /**
   * Une fiche neuve est vide : lancer un audit la fait passer par l'état
   * « audit en cours », puis la remplit avec les données collectées.
   */
  const launchAudit = useCallback(() => {
    if (auditTimer.current !== null) window.clearTimeout(auditTimer.current);
    setUxState('audit');
    setTab('apercu');
    auditTimer.current = window.setTimeout(() => {
      setUxState('active');
      auditTimer.current = null;
    }, AUDIT_DURATION_MS);
  }, []);

  const criticalCount = PRIORITIES.filter((p) => p.sev === 'critique').length;
  const auditRunning = uxState === 'audit';

  const renderPanel = () => {
    switch (tab) {
      case 'apercu':
        return <PanelApercu uxState={uxState} setTab={setTab} onLaunchAudit={launchAudit} />;
      case 'priorites':
        return <PanelPriorites clientId={clientId} />;
      case 'plan':
        return <PanelPlan clientId={clientId} />;
      case 'diagnostics':
        return <PanelDiagnostics clientId={clientId} onLaunchAudit={launchAudit} />;
      case 'rapports':
        return <PanelRapports clientId={clientId} />;
      case 'contrat':
        return <PanelContrat />;
      case 'contenu':
        // Onglet de sortie : le clic navigue vers /clients/[id]/contenu, `tab` ne prend jamais cette valeur.
        return null;
    }
  };

  return (
    <AppShell
      header={
        <CRMHeader
          title={CLIENT.name}
          crumbs={[
            { label: 'Client Hub', href: '/clients' },
            { label: CLIENT.name },
            { label: `${CLIENT.sector} · MRR ${CLIENT.mrr}` },
          ]}
        >
          {/* Sélecteur d'état — sert à concevoir et vérifier les variantes UX
              (fiche vide, audit en cours, données obsolètes, erreur partielle). */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.5rem',
              fontWeight: 700,
              color: 'var(--fg4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            État UX
            <select
              value={uxState}
              onChange={(e) => setUxState(e.target.value as UxState)}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                background: 'var(--bg-solid)',
                border: '1px solid var(--bd-solid)',
                color: 'var(--fg2)',
                fontFamily: 'var(--font)',
                fontSize: '0.625rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'none',
                letterSpacing: 'normal',
              }}
            >
              {UX_STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </CRMHeader>
      }
    >
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftPanel uxState={uxState} onLaunchAudit={launchAudit} auditRunning={auditRunning} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            {/* Actions persistantes, disponibles depuis n'importe quel onglet. */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderBottom: '1px solid var(--bd-solid)',
                background: 'var(--bg-solid)',
                flexWrap: 'wrap',
              }}
            >
              <button className="btn-out" type="button" onClick={launchAudit} disabled={auditRunning}>
                <IcoZap size={12} />
                {auditRunning ? 'Diagnostic en cours…' : 'Lancer un diagnostic'}
              </button>
              <button className="btn-out" type="button" onClick={() => setTab('priorites')}>
                <IcoTarget size={12} />
                Assigner une priorité
              </button>
              <button className="btn-out" type="button" onClick={() => setTab('plan')}>
                <IcoPlus size={12} />
                Créer une tâche
              </button>
              <button className="btn-pri" type="button" onClick={() => setTab('rapports')}>
                <IcoDoc size={12} />
                Générer le rapport client
              </button>
            </div>

            <div
              role="tablist"
              aria-label="Sections de la fiche client"
              style={{
                display: 'flex',
                gap: 4,
                borderBottom: '1px solid var(--bd-solid)',
                background: 'var(--bg-solid)',
                padding: '0.5rem 20px',
                overflowX: 'auto',
              }}
            >
              {FICHE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`tab${tab === t.id ? ' on' : ''}`}
                  onClick={() => ('external' in t && t.external ? router.push(routes.contenu(clientId)) : setTab(t.id))}
                  style={
                    tab === t.id
                      ? { background: 'var(--primary)', color: 'var(--primary-fg)', fontWeight: 600 }
                      : undefined
                  }
                >
                  {t.label}
                  {t.id === 'priorites' && criticalCount > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.5rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 999,
                        background: 'var(--red)',
                        color: '#fff',
                      }}
                    >
                      {criticalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 28px' }}>
            {renderPanel()}
          </div>
        </div>

        <RightPanel onGenerateReport={() => setTab('rapports')} />
      </div>
    </AppShell>
  );
}
