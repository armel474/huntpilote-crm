'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, Delta, Gauge, Lbl, Spark } from '@/components/ui/Atoms';
import {
  IcoCal,
  IcoCheck,
  IcoDl,
  IcoDoc,
  IcoEye,
  IcoFile,
  IcoLogo,
  IcoMail,
  IcoPhone,
  IcoRepeat,
  IcoSend,
  IcoUp,
  IcoX,
  IcoZap,
} from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { REPORT } from '@/lib/data/rapport';
import {
  AI_SUMMARY,
  CLIENT,
  COMMUNICATIONS,
  KEYWORDS,
  KPIS,
  REPORT_SECTIONS,
  REPORTS,
  TRAFFIC_SPARK,
} from '@/lib/data/fiche-client';

const COMM_ICONS = { cal: IcoCal, mail: IcoMail, phone: IcoPhone } as const;

/* ── Aperçu plein écran du rapport ── */

function ReportPreviewOverlay({
  sections,
  onClose,
}: {
  sections: string[];
  onClose: () => void;
}) {
  // Fermeture au clavier : l'aperçu se comporte comme une boîte de dialogue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu du rapport client"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 780,
          background: 'var(--bg-solid)',
          borderRadius: 14,
          border: '1px solid var(--bd-solid)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--bd-solid)',
            background: 'var(--bg-muted)',
            position: 'sticky',
            top: 0,
          }}
        >
          <span className="lbl">Rapport SEO · Mai 2026</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg4)' }}>
            {sections.length} sections
          </span>
          <button className="btn-sm" type="button" style={{ border: '1px solid var(--bd-solid)' }}>
            <IcoDl size={11} />
            PDF
          </button>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer l'aperçu">
            <IcoX size={12} />
          </button>
        </div>

        <div style={{ padding: '2rem 2.25rem' }}>
          {/* En-tête du document */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
            <div
              aria-hidden="true"
              style={{
                width: 24,
                height: 24,
                background: 'var(--primary)',
                color: 'var(--primary-fg)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IcoLogo size={12} />
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              HuntPilote
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.5rem',
                fontWeight: 700,
                color: 'var(--fg4)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Confidentiel
            </span>
          </div>

          <div className="lbl" style={{ color: 'var(--green-fg)', marginBottom: 6 }}>
            Rapport de performance
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            SEO Mensuel
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--fg2)', marginTop: 10 }}>
            {CLIENT.name}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2 }}>
            Mai 2026 · préparé par {CLIENT.pm}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              margin: '1.75rem 0',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--bd-solid)',
            }}
          >
            <Gauge value={CLIENT.score} size={72} />
            <div>
              <div className="lbl" style={{ marginBottom: 3 }}>
                Score santé global
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--green)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <IcoUp size={10} />
                +5 pts vs avril
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 2 }}>
                Trafic +72 % · 142 mots-clés suivis
              </div>
            </div>
          </div>

          {/* Sections retenues */}
          {sections.includes('Synthèse exécutive') && (
            <section style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 8 }}>
                Synthèse exécutive
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', lineHeight: 1.7 }}>{AI_SUMMARY}</p>
            </section>
          )}

          {sections.includes('Trafic organique') && (
            <section style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 10 }}>
                Trafic organique
              </h2>
              <Spark data={TRAFFIC_SPARK} height={80} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 14 }}>
                {KPIS.map((k) => (
                  <div key={k.label}>
                    <Lbl>{k.label}</Lbl>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: 3 }}>{k.value}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--green-fg)' }}>{k.sub}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections.includes('Positions clés') && (
            <section style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 10 }}>
                Positions clés
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Mot-clé', 'Position', 'Volume', 'Évolution'].map((h, i) => (
                      <th
                        key={h}
                        className="lbl"
                        style={{
                          textAlign: i === 0 ? 'left' : 'right',
                          paddingBottom: 8,
                          borderBottom: '1px solid var(--bd-solid)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KEYWORDS.map((k) => (
                    <tr key={k.kw}>
                      <td style={{ fontSize: '0.8125rem', padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
                        {k.kw}
                      </td>
                      <td
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          padding: '9px 0',
                          borderBottom: '1px solid var(--bd)',
                          textAlign: 'right',
                        }}
                      >
                        #{k.pos}
                      </td>
                      <td
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--fg3)',
                          padding: '9px 0',
                          borderBottom: '1px solid var(--bd)',
                          textAlign: 'right',
                        }}
                      >
                        {k.vol}
                      </td>
                      <td style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Delta value={k.delta} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {sections
            .filter((s) => !['Synthèse exécutive', 'Trafic organique', 'Positions clés'].includes(s))
            .map((s) => (
              <section key={s} style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 8 }}>{s}</h2>
                <div
                  style={{
                    border: '1px dashed var(--bd-strong)',
                    borderRadius: 10,
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--fg4)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  section « {s} » — contenu généré à la production du rapport
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ── Générateur ── */

export function PanelRapports({ clientId }: { clientId: string }) {
  const [enabled, setEnabled] = useState<boolean[]>(REPORT_SECTIONS.map((s) => s.on));
  const [autoSend, setAutoSend] = useState(true);
  const [preview, setPreview] = useState(false);

  const selected = REPORT_SECTIONS.filter((_, i) => enabled[i]).map((s) => s.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* Paramétrage */}
        <section
          className="card"
          style={{
            flex: '1 1 0',
            minWidth: 320,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            borderTop: '3px solid var(--violet)',
          }}
          aria-labelledby="report-gen-title"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--violet-m)',
                border: '1px solid var(--violet-b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--violet-fg)',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ✦
            </div>
            <div style={{ flex: 1 }}>
              <h2 id="report-gen-title" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
                Générer le rapport · Mai 2026
              </h2>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
                Synthèse rédigée automatiquement par l&apos;agent HuntPilote
              </div>
            </div>
            <Badge label="✦ IA" tone="violet" />
          </div>

          <div className="lbl" style={{ marginBottom: 8 }}>
            Sections incluses · {selected.length}/{REPORT_SECTIONS.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
            {REPORT_SECTIONS.map((s, i) => (
              <label
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0.5rem 0.625rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: enabled[i] ? 'var(--green-m)' : 'var(--bg-muted)',
                  border: `1px solid ${enabled[i] ? 'var(--green-b)' : 'var(--bd-solid)'}`,
                  transition: 'all 140ms',
                }}
              >
                <input
                  type="checkbox"
                  checked={enabled[i]}
                  onChange={() => setEnabled((p) => p.map((v, j) => (j === i ? !v : v)))}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: 5,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: enabled[i] ? 'var(--green)' : 'transparent',
                    border: `1.5px solid ${enabled[i] ? 'var(--green)' : 'var(--bd-strong)'}`,
                    color: '#fff',
                  }}
                >
                  {enabled[i] && <IcoCheck size={9} />}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: enabled[i] ? 'var(--green-fg)' : 'var(--fg2)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.name}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.5625rem',
                      color: 'var(--fg4)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.desc}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {/* Programmation de l'envoi */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.625rem 0.75rem',
              borderRadius: 8,
              background: 'var(--violet-m)',
              border: '1px solid var(--violet-b)',
              marginBottom: 12,
            }}
          >
            <span style={{ color: 'var(--violet-fg)', flexShrink: 0, display: 'flex' }}>
              <IcoRepeat size={12} />
            </span>
            <div style={{ flex: 1, fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.4 }}>
              Envoi automatique programmé le <b>2 de chaque mois</b> à {CLIENT.email}
            </div>
            <button
              type="button"
              className="tgl"
              role="switch"
              aria-checked={autoSend}
              aria-label="Envoi automatique du rapport"
              onClick={() => setAutoSend((v) => !v)}
              style={{
                width: 30,
                height: 17,
                background: autoSend ? 'var(--violet)' : 'var(--bd-strong)',
              }}
            >
              <span
                className="tgl-knob"
                style={{ width: 13, height: 13, top: 2, left: autoSend ? 15 : 2 }}
              />
            </button>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-pri" type="button" style={{ flex: 1, justifyContent: 'center' }}>
              <IcoZap size={12} />
              Générer le rapport
            </button>
            {/* Voir le rendu exact que recevra le client. */}
            <button className="btn-out" type="button" onClick={() => setPreview(true)}>
              <IcoEye size={12} />
              Voir le rapport complet
            </button>
            {/* Composer et publier : l'éditeur de rapport. */}
            <Link
              className="btn-out"
              href={routes.rapport(clientId, REPORT.slug)}
              style={{ textDecoration: 'none' }}
            >
              <IcoDoc size={12} />
              Ouvrir l’éditeur
            </Link>
          </div>
        </section>

        {/* Aperçu de la couverture */}
        <section
          className="card"
          style={{
            flex: '0 0 300px',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 260,
          }}
          aria-label="Aperçu de la couverture"
        >
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--bd-solid)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-muted)',
            }}
          >
            <span className="lbl">Aperçu du document</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg4)' }}>
              {selected.length} sections
            </span>
          </div>
          <div
            style={{
              flex: 1,
              padding: '1.5rem 1.25rem',
              background: 'var(--bg-solid)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 'auto' }}>
              <div
                aria-hidden="true"
                style={{
                  width: 22,
                  height: 22,
                  background: 'var(--primary)',
                  color: 'var(--primary-fg)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IcoLogo size={11} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                HuntPilote
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  color: 'var(--fg4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Confidentiel
              </span>
            </div>

            <div style={{ margin: '1.5rem 0' }}>
              <div className="lbl" style={{ color: 'var(--green-fg)', marginBottom: 6 }}>
                Rapport de performance
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                SEO Mensuel
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg2)', marginTop: 10 }}>
                {CLIENT.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 2 }}>
                Mai 2026 · préparé par {CLIENT.pm}
              </div>
            </div>

            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingTop: 14,
                borderTop: '1px solid var(--bd-solid)',
              }}
            >
              <Gauge value={CLIENT.score} size={62} />
              <div>
                <div className="lbl" style={{ marginBottom: 3 }}>
                  Score santé global
                </div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--green)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <IcoUp size={9} />
                  +5 pts vs avril
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg4)', marginTop: 2 }}>
                  Trafic +72 % · 142 mots-clés
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Historique des rapports envoyés */}
      <section className="card" style={{ padding: '0.875rem 1rem' }} aria-labelledby="reports-history">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2 id="reports-history" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Historique des rapports
          </h2>
          <span style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>
            {REPORTS.length} rapports envoyés
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {REPORTS.map((r) => (
            <div
              key={r.period}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.75rem 0.875rem',
                borderRadius: 10,
                border: '1px solid var(--bd-solid)',
                background: 'var(--bg-base)',
                flexWrap: 'wrap',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 44,
                  borderRadius: 6,
                  background: 'var(--bg-solid)',
                  border: '1px solid var(--bd-solid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--fg3)',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <IcoFile />
                <span
                  style={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    color: r.score >= 85 ? 'var(--green)' : 'var(--yellow-fg)',
                    background: 'var(--bg-solid)',
                    border: '1px solid var(--bd-solid)',
                    borderRadius: 999,
                    padding: '0 4px',
                  }}
                >
                  {r.score}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Rapport SEO · {r.period}</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg4)', marginTop: 2 }}>
                  Envoyé le {r.date} · {r.pages} pages · à {CLIENT.email}
                </div>
              </div>
              <Badge label={r.status} tone="green" />
              <div style={{ display: 'flex', gap: 5 }}>
                <button className="btn-icon" type="button" title="Voir" aria-label={`Voir le rapport de ${r.period}`}>
                  <IcoEye size={12} />
                </button>
                <button
                  className="btn-icon"
                  type="button"
                  title="Télécharger"
                  aria-label={`Télécharger le rapport de ${r.period}`}
                >
                  <IcoDl size={12} />
                </button>
                <button
                  className="btn-icon"
                  type="button"
                  title="Renvoyer"
                  aria-label={`Renvoyer le rapport de ${r.period}`}
                >
                  <IcoSend size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historique des communications */}
      <section className="card" style={{ padding: '0.875rem 1rem' }} aria-labelledby="comms-history">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2 id="comms-history" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Historique des communications
          </h2>
          <button className="btn-sm" type="button" style={{ border: '1px solid var(--bd-solid)' }}>
            <IcoDoc size={11} />
            Consigner un échange
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {COMMUNICATIONS.map((c, i) => {
            const Icon = COMM_ICONS[c.icon];
            return (
              <div
                key={c.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0.625rem 0',
                  borderBottom:
                    i < COMMUNICATIONS.length - 1 ? '1px solid var(--bd)' : 'none',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--bd-solid)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--fg3)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg1)' }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 1 }}>
                    {c.date} · {c.who}
                  </div>
                </div>
                <Badge label={c.kind} tone="neutral" />
              </div>
            );
          })}
        </div>
      </section>

      {preview && <ReportPreviewOverlay sections={selected} onClose={() => setPreview(false)} />}
    </div>
  );
}
