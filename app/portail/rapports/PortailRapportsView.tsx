'use client';

/**
 * Ses rapports — session 5.2.
 *
 * L'historique complet des rapports publiés, et la trajectoire du score sur
 * douze mois. « Ouvrir un rapport » mène toujours au document réel
 * (`/r/[token]`, session 1.3) — cet écran est la liste et la trajectoire, pas
 * un second gabarit de rapport. Dans ce jeu de démonstration, un seul
 * rapport complet existe réellement (celui de septembre 2026) : chaque ligne
 * y renvoie, comme le ferait la version publiée de sa propre période dans un
 * produit réel.
 */
import { useEffect, useState } from 'react';
import { IcoArrowR, IcoClock, IcoDoc, IcoDown, IcoLock, IcoUp } from '@/components/ui/Icons';
import { PortalHeader } from '@/app/portail/PortalHeader';
import { REPORT } from '@/lib/data/rapport';
import { PORTAL_ACCOUNT, PORTAL_HISTORY, PORTAL_TARGET_SCORE, PORTAL_THREAD, type PortalReportMonth } from '@/lib/data/portail';
import { routes } from '@/lib/routes';

type Scenario = 'archive' | 'corrige' | 'unseul' | 'aucun';

const SCENARIOS: readonly [Scenario, string][] = [
  ['archive', 'Archive complète — 11 rapports'],
  ['corrige', 'Période corrigée en v2'],
  ['unseul', 'Un seul rapport'],
  ['aucun', 'Aucun rapport'],
];

const REPORT_HREF = `/${REPORT.token}`;
const UNREAD = PORTAL_THREAD.filter((m) => !m.read && m.from === 'pm').length;

function scenarioMonths(scenario: Scenario): readonly PortalReportMonth[] {
  const published = PORTAL_HISTORY.filter((m) => m.published);
  if (scenario === 'aucun') return [];
  if (scenario === 'unseul') return published.slice(0, 1).map((m) => ({ ...m, first: true }));
  if (scenario === 'corrige') return published.slice(-4);
  return published;
}

/* ── trajectoire du score, douze mois ── */
function ScoreCurve({ months }: { months: readonly PortalReportMonth[] }) {
  if (months.length < 2) return null;
  const T = PORTAL_TARGET_SCORE;
  const W = 620;
  const H = 150;
  const PADX = 8;
  const PADY = 16;
  const vals = months.map((m) => m.score);
  const lo = Math.min(...vals, T) - 8;
  const hi = Math.max(...vals, T) + 6;
  const x = (i: number) => PADX + i * ((W - PADX * 2) / (months.length - 1));
  const y = (v: number) => PADY + (1 - (v - lo) / (hi - lo)) * (H - PADY * 2);
  const line = months.map((m, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(m.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(months.length - 1).toFixed(1)},${H - PADY} L${x(0).toFixed(1)},${H - PADY} Z`;
  const last = months[months.length - 1];
  const firstM = months[0];
  const gain = last.score - firstM.score;
  const overIdx = months.findIndex((m) => m.score >= T);

  return (
    <div className="pr-curve-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ flex: '1 1 14rem', minWidth: 0 }}>
          <h2 style={{ marginBottom: 4, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Votre trajectoire sur {months.length} mois
          </h2>
          <p style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--fg2)' }}>
            La santé de votre site est passée de <b style={{ color: 'var(--fg1)' }}>{firstM.score}</b> en {firstM.short}{' '}
            {firstM.label.slice(-4)} à <b style={{ color: 'var(--fg1)' }}>{last.score}</b> en {last.short} {last.label.slice(-4)}, soit{' '}
            <b style={{ color: 'var(--green-fg)' }}>
              {gain > 0 ? `+${gain}` : gain} points
            </b>
            . L’objectif inscrit à votre mandat est de {T}
            {overIdx >= 0 ? `, dépassé depuis ${months[overIdx].short} ${months[overIdx].label.slice(-4)}` : ' — pas encore atteint'}.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--green-d, var(--green-fg))' }}>{last.score}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', fontWeight: 600 }}>sur 100 · objectif {T}</div>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="pr-svg"
        role="img"
        aria-label={`Score de santé de ${firstM.score} en ${firstM.label} à ${last.score} en ${last.label}, objectif ${T}`}
      >
        <defs>
          <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={PADX} y1={y(T)} x2={W - PADX} y2={y(T)} stroke="var(--bd-strong)" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={W - PADX} y={y(T) - 6} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--fg3)">
          Objectif {T}
        </text>
        <path d={area} fill="url(#prGrad)" />
        <path d={line} fill="none" stroke="var(--green)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {months.map((m, i) => (
          <g key={m.id}>
            <circle cx={x(i)} cy={y(m.score)} r={i === months.length - 1 ? 5 : 3.2} fill="var(--bg-solid)" stroke="var(--green)" strokeWidth={i === months.length - 1 ? 3 : 2} />
            <text x={x(i)} y={H - 3} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--fg4)">
              {m.short}
            </text>
          </g>
        ))}
      </svg>
      <div className="pr-legend">
        <span>
          <span className="pr-key" />
          Score de santé, mois par mois
        </span>
        <span>
          <span className="pr-key dash" />
          Objectif du mandat : {T} / 100
        </span>
      </div>
    </div>
  );
}

/* ── une période de l'historique ── */
function ReportRow({ m, prev, onDownload }: { m: PortalReportMonth; prev: PortalReportMonth | undefined; onDownload: (m: PortalReportMonth) => void }) {
  const [open, setOpen] = useState(false);
  const delta = prev ? m.score - prev.score : null;
  const corrected = (m.versions?.length ?? 0) > 1;

  return (
    <div className={`pr-row${corrected ? ' corrected' : ''}`}>
      <div className="pr-score">
        <span className="pr-score-v">{m.score}</span>
        {delta === null ? (
          <span className="pr-tag neutral">Point de départ</span>
        ) : (
          <span className={`pr-tag${delta >= 0 ? '' : ' down'}`}>
            {delta >= 0 ? <IcoUp size={10} /> : <IcoDown size={10} />} {delta >= 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{m.label}</h3>
          {corrected && <span className="pr-tag ver">Corrigé — version {m.versions![0].v}</span>}
        </div>
        <p style={{ fontSize: '0.875rem', margin: '3px 0 0', color: 'var(--fg2)' }}>
          Données au {m.dataAt}, publié le {m.publish}.{' '}
          {m.proofsCount > 0
            ? `${m.proofsCount} chantier${m.proofsCount > 1 ? 's' : ''} terminé${m.proofsCount > 1 ? 's' : ''} ce mois-là.`
            : 'Aucun chantier terminé ce mois-là — le travail en cours était détaillé dans le rapport.'}
        </p>
        {corrected && (
          <>
            <button type="button" className="pr-vtoggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? 'Masquer' : 'Voir'} les {m.versions!.length} versions de cette période
            </button>
            {open && (
              <ul className="pr-versions">
                {m.versions!.map((v) => (
                  <li key={v.v}>
                    <span className={`pr-vdot${v.current ? ' cur' : ''}`}>v{v.v}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        Version {v.v}
                        {v.current ? ' — celle que vous lisez' : ' — remplacée'}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
                        {v.at} · {v.note}
                      </div>
                    </div>
                    <a href={REPORT_HREF} className="pc-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', flexShrink: 0, textDecoration: 'none' }}>
                      Ouvrir
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <div className="pr-actions">
        <a href={REPORT_HREF} className="pc-btn solid" style={{ padding: '0.5rem 0.95rem', fontSize: '0.875rem', textDecoration: 'none' }}>
          Ouvrir
          <IcoArrowR size={13} />
        </a>
        <button type="button" className="pc-btn" style={{ padding: '0.5rem 0.95rem', fontSize: '0.875rem' }} onClick={() => onDownload(m)}>
          <IcoDoc size={13} />
          PDF
        </button>
      </div>
    </div>
  );
}

function PrEmpty() {
  return (
    <div className="pc-wait-card">
      <div className="pc-sent warn" style={{ marginBottom: '1.25rem' }} aria-hidden="true">
        <IcoDoc size={20} />
      </div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Aucun rapport publié pour l’instant</h1>
      <p className="pc-lead">
        Votre premier rapport sera publié le 2 octobre, et rejoindra cette page. Ensuite, un rapport par mois s’y
        ajoutera — vous pourrez les rouvrir ou les télécharger à tout moment.
      </p>
      <div className="pc-frozen-in" style={{ marginTop: '1.25rem' }}>
        <span>
          <IcoLock size={14} />
        </span>
        <div>
          Un rapport publié <b>ne change plus</b>. Chacun reste consultable dans la version envoyée ce mois-là.
        </div>
      </div>
    </div>
  );
}

function PrSingle() {
  return (
    <div className="pc-frozen-in" style={{ marginBottom: '1.25rem' }}>
      <span>
        <IcoClock size={14} />
      </span>
      <div>
        <b>Un seul rapport pour l’instant.</b> La trajectoire de votre score apparaîtra ici dès le deuxième — il
        faut deux points pour tracer une progression.
      </div>
    </div>
  );
}

export function PortailRapportsView() {
  const [scenario, setScenario] = useState<Scenario>('archive');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4600);
    return () => clearTimeout(t);
  }, [toast]);

  const months = scenarioMonths(scenario);
  const recent = [...months].reverse();
  const download = (m: PortalReportMonth) =>
    setToast(`Rapport de ${m.label.toLowerCase()} en préparation — la version publiée le ${m.publish} sera enregistrée en PDF.`);

  return (
    <div className="pc-root page-scroll">
      <div className="pc-demo">
        <select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)} aria-label="État de démonstration">
          {SCENARIOS.map(([id, l]) => (
            <option key={id} value={id}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <PortalHeader active="rapports" client={PORTAL_ACCOUNT.client} person={PORTAL_ACCOUNT.person} initials={PORTAL_ACCOUNT.initials} pm={PORTAL_ACCOUNT.pm} unread={UNREAD} />

      <div className="pr-wrap">
        {months.length === 0 ? (
          <PrEmpty />
        ) : (
          <>
            <div className="pc-eyebrow">Vos rapports</div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 10, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {months.length} rapport{months.length > 1 ? 's' : ''} publié{months.length > 1 ? 's' : ''} depuis{' '}
              {months[0].label.toLowerCase()}
            </h1>
            <p className="pc-lead" style={{ marginBottom: '1.5rem' }}>
              Chaque rapport reste tel qu’il a été envoyé — un document daté, pas une page qui se réécrit. Ouvrez-en
              un pour le relire, ou téléchargez-le pour le transmettre en interne.
            </p>

            {months.length === 1 && <PrSingle />}
            {/* La courbe se lit du plus ancien au plus récent, à l'inverse de la liste ci-dessous. */}
            <ScoreCurve months={months} />

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 11, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Période par période</h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--fg3)' }}>du plus récent au plus ancien</span>
            </div>
            <div className="pr-list">
              {recent.map((m, i) => (
                <ReportRow key={m.id} m={m} prev={recent[i + 1]} onDownload={download} />
              ))}
            </div>

            <div className="pc-frozen-in" style={{ marginTop: '1.5rem' }}>
              <span>
                <IcoLock size={14} />
              </span>
              <div>
                <b>Pourquoi certains mois portent deux versions.</b> Quand nous repérons une erreur après l’envoi,
                nous publions une correction plutôt que de modifier le document d’origine. Les deux restent
                consultables, et la plus récente est celle qui s’ouvre par défaut.
              </div>
            </div>
            <p className="pc-hint" style={{ marginTop: '1rem' }}>
              Une question sur un rapport en particulier ?{' '}
              <a href={routes.portailEchanges()}>Écrivez à {PORTAL_ACCOUNT.pm}</a> — vous pourrez rattacher votre
              question au rapport concerné.
            </p>
          </>
        )}
      </div>

      {toast && (
        <div className="pc-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
