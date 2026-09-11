'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { LeftPanel, RightPanel } from '@/components/fiche/SidePanels';
import { PanelApercu } from '@/components/fiche/PanelApercu';
import { PanelPriorites } from '@/components/fiche/PanelPriorites';
import { PanelDiagnostics, PanelPlan } from '@/components/fiche/PanelPlan';
import { PanelRapports } from '@/components/fiche/PanelRapports';
import { PanelContrat } from '@/components/fiche/PanelContrat';
import { PanelCommunications } from '@/components/fiche/PanelCommunications';
import { ContactsAllSheet, ContactSheet, type NewContactData } from '@/components/fiche/ContactPanels';
import { QuoteFormSheet, QuoteSheet } from '@/components/fiche/QuotePanels';
import { FICHE_TABS, type FicheTab } from '@/components/fiche/tabs';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoDoc, IcoPlus, IcoTarget, IcoZap } from '@/components/ui/Icons';
import { CLIENT, CONTACTS, PRIORITIES, UX_STATES, type Contact, type UxState } from '@/lib/data/fiche-client';
import { QUOTES, type Quote, type QuoteLine } from '@/lib/data/devis';
import { routes } from '@/lib/routes';

/** Durée simulée d'un audit avant que la fiche ne se remplisse. */
const AUDIT_DURATION_MS = 4000;

/** Année de référence de la démo — cohérente avec le reste du jeu de données (Acme Corp., 2026). */
const DEMO_YEAR = 2026;

function nextQuoteId(quotes: Quote[]): string {
  const nums = quotes.map((q) => Number(q.id.split('-').pop())).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `DV-${DEMO_YEAR}-${String(next).padStart(3, '0')}`;
}

/** Contact-panel ouvert : la fiche d'un contact précis, la liste complète, ou le formulaire de création. */
type ContactPanel = { kind: 'contact'; id: string } | { kind: 'all' } | { kind: 'create' } | null;

/** Devis ouvert : le document d'un devis précis, un nouveau devis, ou la correction d'un devis envoyé. */
type QuoteView = { kind: 'view'; id: string } | { kind: 'new' } | { kind: 'edit'; id: string } | null;

export function FicheClientView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<FicheTab>('apercu');
  const [uxState, setUxState] = useState<UxState>('active');
  const auditTimer = useRef<number | null>(null);

  /* ── Contacts — session 7.1 ── */
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [contactPanel, setContactPanel] = useState<ContactPanel>(null);

  /* ── Devis — session 7.3 ── */
  const [quotes, setQuotes] = useState<Quote[]>(QUOTES);
  const [quoteView, setQuoteView] = useState<QuoteView>(null);

  /* ── Renvoi vers le fil de communications, filtré sur un contact — depuis un contact ou un devis ── */
  const [commContactFilter, setCommContactFilter] = useState<string | null>(null);
  const [commKey, setCommKey] = useState(0);

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

  /* ── Contacts ── */

  const openContact = useCallback((id: string) => setContactPanel({ kind: 'contact', id }), []);
  const openAllContacts = useCallback(() => setContactPanel({ kind: 'all' }), []);
  const openCreateContact = useCallback(() => setContactPanel({ kind: 'create' }), []);
  const closeContactPanel = useCallback(() => setContactPanel(null), []);

  const setPrincipalContact = useCallback((id: string) => {
    setContacts((cs) => cs.map((c) => ({ ...c, principal: c.id === id })));
  }, []);
  const archiveContact = useCallback((id: string) => {
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, status: 'archive' } : c)));
  }, []);
  const unarchiveContact = useCallback((id: string) => {
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, status: 'actif' } : c)));
  }, []);
  const saveNewContact = useCallback((data: NewContactData) => {
    const initials = data.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('');
    setContacts((cs) => [
      ...cs,
      { id: `c${cs.length + 1}-${Date.now()}`, initials, principal: false, status: 'actif', ...data },
    ]);
    setContactPanel(null);
  }, []);

  /** Depuis une fiche contact ou un devis : bascule vers Communications, filtré sur ce contact. */
  const goToThread = useCallback((contactId: string) => {
    setCommContactFilter(contactId);
    setCommKey((k) => k + 1);
    setTab('communications');
    setContactPanel(null);
    setQuoteView(null);
  }, []);

  /* ── Devis ── */

  const openQuote = useCallback((id: string) => setQuoteView({ kind: 'view', id }), []);
  const newQuote = useCallback(() => setQuoteView({ kind: 'new' }), []);
  const closeQuoteView = useCallback(() => setQuoteView(null), []);

  const saveQuote = useCallback(
    (data: { objet: string; contactId: string; lignes: QuoteLine[]; conditions: string; expire: string | null }) => {
      setQuotes((qs) => {
        if (quoteView?.kind === 'edit') {
          const editId = quoteView.id;
          return qs.map((q) => (q.id === editId ? { ...q, ...data, statut: 'brouillon', emis: null } : q));
        }
        return [{ id: nextQuoteId(qs), statut: 'brouillon', emis: null, versions: [], ...data }, ...qs];
      });
      setQuoteView(null);
    },
    [quoteView],
  );

  const sendQuote = useCallback((id: string) => {
    setQuotes((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        const nextV = q.versions.length + 1;
        return {
          ...q,
          statut: 'envoye',
          emis: q.emis || 'aujourd’hui',
          versions: [
            ...q.versions,
            {
              v: nextV,
              at: 'aujourd’hui',
              who: 'Vous',
              note:
                nextV === 1
                  ? 'Version envoyée au client par courriel.'
                  : `Version ${nextV} envoyée au client — correction de la version ${nextV - 1}.`,
            },
          ],
        };
      }),
    );
  }, []);
  const requestQuoteCorrection = useCallback((id: string) => setQuoteView({ kind: 'edit', id }), []);

  const contactsById = useMemo(() => Object.fromEntries(contacts.map((c) => [c.id, c])), [contacts]);
  const openContactPanel =
    contactPanel?.kind === 'contact' ? (contacts.find((c) => c.id === contactPanel.id) ?? null) : null;
  const currentQuote = quoteView?.kind === 'view' ? (quotes.find((q) => q.id === quoteView.id) ?? null) : null;
  const editQuote = quoteView?.kind === 'edit' ? (quotes.find((q) => q.id === quoteView.id) ?? null) : null;

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
        return <PanelRapports clientId={clientId} onGoCommunications={() => setTab('communications')} />;
      case 'communications':
        return (
          <PanelCommunications
            key={commKey}
            contacts={contacts}
            initialContactFilter={commContactFilter}
            onOpenContact={openContact}
          />
        );
      case 'contrat':
        return (
          <PanelContrat quotes={quotes} contactsById={contactsById} onOpenQuote={openQuote} onNewQuote={newQuote} />
        );
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
          period=""
          crumbs={[
            { label: 'Client Hub', href: routes.clients() },
            { label: CLIENT.name },
            { label: `${CLIENT.sector} · MRR ${CLIENT.mrr}` },
          ]}
        >
          {/* Sélecteur d'état — sert à concevoir et vérifier les variantes UX
              (fiche vide, audit en cours, données obsolètes, erreur partielle). */}
          <DemoOnly>
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
          </DemoOnly>
        </CRMHeader>
      }
    >
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftPanel
          uxState={uxState}
          onLaunchAudit={launchAudit}
          auditRunning={auditRunning}
          contacts={contacts}
          onOpenContact={openContact}
          onOpenAllContacts={openAllContacts}
          onAddContact={openCreateContact}
        />

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

      {/* Panneaux latéraux — contacts (7.1) et devis (7.3), superposés à n'importe quel onglet. */}
      {contactPanel?.kind === 'all' && (
        <ContactsAllSheet contacts={contacts} onClose={closeContactPanel} onOpen={openContact} onAdd={openCreateContact} />
      )}
      {contactPanel?.kind === 'create' && (
        <ContactSheet
          contact={null}
          isCreate
          onClose={closeContactPanel}
          onSetPrincipal={setPrincipalContact}
          onArchive={archiveContact}
          onUnarchive={unarchiveContact}
          onSave={saveNewContact}
          onGoThread={goToThread}
        />
      )}
      {openContactPanel && (
        <ContactSheet
          contact={openContactPanel}
          isCreate={false}
          onClose={closeContactPanel}
          onSetPrincipal={setPrincipalContact}
          onArchive={archiveContact}
          onUnarchive={unarchiveContact}
          onSave={saveNewContact}
          onGoThread={goToThread}
        />
      )}

      {currentQuote && (
        <QuoteSheet
          quote={currentQuote}
          contacts={contacts}
          onClose={closeQuoteView}
          onSend={sendQuote}
          onNewVersion={requestQuoteCorrection}
          onGoThread={goToThread}
          onGoContract={closeQuoteView}
        />
      )}
      {(quoteView?.kind === 'new' || editQuote) && (
        <QuoteFormSheet
          contacts={contacts.filter((c) => c.status === 'actif')}
          initial={editQuote}
          onClose={closeQuoteView}
          onSave={saveQuote}
        />
      )}
    </AppShell>
  );
}
