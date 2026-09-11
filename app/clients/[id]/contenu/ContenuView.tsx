'use client';

/**
 * Calendrier éditorial — écran 6.1.
 *
 * Vue mois et vue liste du planning de publication d'Acme Corp., quota du
 * forfait en tête (la raison commerciale de l'écran), performances des
 * articles publiés. Comme les autres détails client (tâche, audit,
 * priorité), le compte réellement porté est fixe (Acme Corp.) quel que soit
 * l'identifiant client de l'URL — voir `lib/data/contenu.ts`.
 */
import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { ContentRow, EdEmpty, MonthView, QuotaCard, ctMonthLabel } from '@/components/contenu/Panels';
import { DemoOnly } from '@/components/ui/Demo';
import { IcoArrowR, IcoChart, IcoChevL, IcoChevR, IcoPlus } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  CONTENU_CLIENT,
  CT_DONE,
  CT_SCENARIOS,
  type CtScenarioId,
  ctLate,
  ctMonth,
  ctScenario,
} from '@/lib/data/contenu';

const ORDER: readonly string[] = ['idee', 'brief', 'assigne', 'redaction', 'relecture', 'publie', 'mesure'];

function shiftMonth(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function ContenuView({ clientId }: { clientId: string }) {
  const [scenario, setScenario] = useState<CtScenarioId>('normal');
  const [view, setView] = useState<'liste' | 'mois'>('liste');
  const [month, setMonth] = useState('2026-09');

  const setSc = (s: CtScenarioId) => {
    setScenario(s);
    setMonth('2026-09');
  };

  const sc = ctScenario(scenario);
  const inMonth = sc.content.filter((c) => ctMonth(c.due) === month);
  const ordered = [...inMonth].sort(
    (a, b) =>
      Number(ctLate(b)) - Number(ctLate(a)) ||
      a.due.localeCompare(b.due) ||
      ORDER.indexOf(a.state) - ORDER.indexOf(b.state),
  );
  const published = sc.content.filter((c) => CT_DONE.includes(c.state) && c.perf);
  const totalVisits = published.reduce((s, c) => s + (c.perf?.visits ?? 0), 0);
  const withProof = published.filter((c) => c.proof).length;

  const header = (
    <CRMHeader
      title="Calendrier éditorial"
      period=""
      crumbs={[
        { label: 'Client Hub', href: routes.clients() },
        { label: CONTENU_CLIENT.name, href: routes.client(clientId) },
        { label: 'Contenu' },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <div className="seg" role="group" aria-label="Vue du calendrier">
          <button type="button" data-on={view === 'liste'} onClick={() => setView('liste')}>
            Liste
          </button>
          <button type="button" data-on={view === 'mois'} onClick={() => setView('mois')}>
            Mois
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button type="button" className="btn-icon" onClick={() => setMonth((v) => shiftMonth(v, -1))} aria-label="Mois précédent">
            <IcoChevL />
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 120, textAlign: 'center' }}>{ctMonthLabel(month)}</span>
          <button type="button" className="btn-icon" onClick={() => setMonth((v) => shiftMonth(v, 1))} aria-label="Mois suivant">
            <IcoChevR />
          </button>
        </div>
        <Link href={routes.brief(clientId, 'a-107')} className="btn-main" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
          <IcoPlus size={12} />
          Créer un brief
        </Link>
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="lbl">Démo · état</span>
            <select className="state-sel" value={scenario} onChange={(e) => setSc(e.target.value as CtScenarioId)} aria-label="État de démonstration">
              {CT_SCENARIOS.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="content">
          <QuotaCard content={sc.content} month={month} />

          {published.length > 0 && (
            <div className="note-box" style={{ marginBottom: 12, alignItems: 'center' }}>
              <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoChart size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b>{totalVisits} visites par mois</b> proviennent des {published.length} article{published.length > 1 ? 's' : ''} mesuré
                {published.length > 1 ? 's' : ''} depuis le début du mandat. C’est ce chiffre qui justifie la ligne « contenu » de la
                facture — et il alimente {withProof} preuve{withProof > 1 ? 's' : ''} de valeur au rapport.
              </div>
              <Link
                href={routes.rapport(clientId, '2026-09')}
                className="btn-out"
                style={{ fontSize: '0.625rem', padding: '0.25rem 0.6rem', textDecoration: 'none', flexShrink: 0 }}
              >
                Voir au rapport
                <IcoArrowR />
              </Link>
            </div>
          )}

          {inMonth.length === 0 ? (
            <EdEmpty />
          ) : view === 'mois' ? (
            <MonthView content={inMonth} month={month} clientId={clientId} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ordered.map((c) => (
                <ContentRow key={c.id} c={c} clientId={clientId} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
            Un sujet vient souvent d’une opportunité repérée dans Keyword Hunter ; un article publié et mesuré devient
            une preuve de valeur au rapport du mois. Les deux liens sont portés par chaque ligne.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
