'use client';

/**
 * Le rapport tel que le client le lit — écran 1.3, versant client.
 *
 * Page publique atteinte par un lien à jeton, hors du cockpit : ni barre
 * latérale, ni densité d'interface. Elle raconte le mois en cinq temps —
 * où on en est, ce qui a bougé, ce qu'on a fait, ce sur quoi on travaille,
 * la suite — dans la langue du client.
 */
import { useState } from 'react';
import { useTheme } from '@/components/shell/ThemeProvider';
import {
  IcoArrowR,
  IcoCheck,
  IcoDoc,
  IcoDown,
  IcoLock,
  IcoLogo,
  IcoSend,
  IcoUp,
} from '@/components/ui/Icons';
import { REPORT } from '@/lib/data/rapport';

/** Situations que la page doit savoir présenter. */
type Mode = 'normal' | 'premier' | 'expire';

export function RapportClientView() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>('normal');

  const first = mode === 'premier';
  const proofs = REPORT.proofs.filter((p) => p.on);
  const R = REPORT;

  const demo = (
    <div className="demo">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as Mode)}
        aria-label="État du rapport"
      >
        <option value="normal">Rapport normal</option>
        <option value="premier">Premier rapport du client</option>
        <option value="expire">Lien expiré ou révoqué</option>
      </select>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </div>
  );

  if (mode === 'expire') {
    return (
      <div className="rapport page-scroll">
        {demo}
        <div className="wrap" style={{ maxWidth: '30rem' }}>
          <div className="doc" style={{ padding: '2rem 1.75rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: 'var(--fg3)' }}>
              <IcoLock size={16} />
            </div>
            <h2 style={{ marginBottom: 10 }}>Ce lien n’est plus valide</h2>
            <p>
              Le lien de ce rapport a expiré ou a été révoqué par votre agence. Écrivez à{' '}
              <a href={`mailto:${R.pmEmail}`}>{R.pmEmail}</a> pour en recevoir un nouveau.
            </p>
            <div style={{ marginTop: 18, fontSize: '0.8125rem', color: 'var(--fg3)' }}>
              Rapport demandé : {R.token}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rapport page-scroll">
      {demo}
      <div className="wrap">
        <article className="doc">
          <header className="doc-head">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <IcoLogo size={15} />
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                HuntPilote
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--fg3)' }}>
                Publié le {R.publish}
              </span>
            </div>
            <div className="eyebrow">Votre rapport mensuel</div>
            <h1>{R.period} — ce qui a changé sur votre site</h1>
            <p style={{ marginTop: 12, fontSize: '0.9375rem' }}>
              Préparé pour <b style={{ color: 'var(--fg1)' }}>{R.client}</b> par {R.pm}, votre
              responsable de compte.
            </p>
          </header>

          {/* 1 — Où on en est */}
          <section className="sect">
            <div className="sect-head">
              <span className="step" aria-hidden="true">
                1
              </span>
              <h2>Où on en est</h2>
            </div>
            <p className="lead" style={{ marginBottom: 18 }}>
              {first
                ? 'Voici le premier état des lieux de votre site. Il servira de point de comparaison pour les mois suivants.'
                : R.objective.sentence}
            </p>
            <div
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span
                  style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: 'var(--green-d)',
                  }}
                >
                  {R.score.now}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--fg3)', fontWeight: 600 }}>/ 100</span>
              </div>
              <div style={{ minWidth: 0, flex: '1 1 14rem' }}>
                <h3 style={{ marginBottom: 3 }}>Santé générale de votre site</h3>
                <p style={{ fontSize: '0.9375rem', margin: 0 }}>
                  {first
                    ? 'Note de départ, calculée sur votre présence en ligne, votre référencement et votre design.'
                    : `En hausse de ${R.score.now - R.score.prev} points depuis août. Cette note combine votre présence en ligne, votre référencement et votre design.`}
                </p>
              </div>
            </div>
            {!first && (
              <div
                style={{
                  padding: '1.125rem 1.25rem',
                  borderRadius: 12,
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--bd-solid)',
                }}
              >
                <h3 style={{ marginBottom: 8 }}>Votre objectif : {R.objective.label}</h3>
                <div className="track" style={{ marginBottom: 7 }}>
                  <div className="fill" style={{ width: `${R.objective.pct}%` }} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    color: 'var(--fg2)',
                    fontWeight: 600,
                  }}
                >
                  <span>{R.objective.pct} % atteint</span>
                  <span style={{ color: 'var(--green-fg)' }}>
                    +{R.objective.pct - R.objective.prevPct} points ce mois
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 2 — Ce qui a bougé */}
          <section className="sect">
            <div className="sect-head">
              <span className="step" aria-hidden="true">
                2
              </span>
              <h2>Ce qui a bougé</h2>
            </div>
            <p style={{ marginBottom: 16 }}>
              {first
                ? 'Ce sont vos chiffres de départ. Le mois prochain, vous verrez l’évolution.'
                : 'Comparé au mois d’août.'}
            </p>
            {R.kpis.map((k) => (
              <div className="kpi" key={k.label}>
                <div className="kpi-val">{k.value}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      flexWrap: 'wrap',
                      marginBottom: 3,
                    }}
                  >
                    <h3>{k.label}</h3>
                    {first ? (
                      <span
                        className="tag"
                        style={{
                          background: 'var(--bg-muted)',
                          border: '1px solid var(--bd-solid)',
                          color: 'var(--fg3)',
                        }}
                      >
                        Point de départ
                      </span>
                    ) : (
                      <span className="delta">
                        {k.up ? <IcoUp /> : <IcoDown />}
                        {k.delta}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9375rem', margin: 0 }}>
                    {k.sentence}
                    {!first && <span style={{ color: 'var(--fg3)' }}> (août : {k.prev})</span>}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* 3 — Ce qu'on a fait */}
          <section className="sect">
            <div className="sect-head">
              <span className="step" aria-hidden="true">
                3
              </span>
              <h2>Ce qu’on a fait</h2>
            </div>
            {first && proofs.length === 0 ? (
              <p>
                Le travail commence ce mois-ci : les premiers résultats apparaîtront dans le rapport
                d’octobre.
              </p>
            ) : (
              <>
                <p style={{ marginBottom: 16 }}>
                  {proofs.length} chantiers terminés et vérifiés ce mois-ci.
                </p>
                {proofs.map((p) => (
                  <div className="proof" key={p.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--green)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IcoCheck strokeWidth={3} />
                      </span>
                      <h3 style={{ color: 'var(--fg1)' }}>{p.title}</h3>
                    </div>
                    {p.before && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 7 }}>
                        <span
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            color: 'var(--fg3)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {p.before}
                        </span>
                        <span aria-hidden="true" style={{ color: 'var(--fg3)', display: 'flex' }}>
                          <IcoArrowR />
                        </span>
                        <span
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: 'var(--green-fg)',
                            letterSpacing: '-0.03em',
                          }}
                        >
                          {p.after}
                        </span>
                      </div>
                    )}
                    <p style={{ fontSize: '0.9375rem', margin: 0 }}>{p.text}</p>
                  </div>
                ))}
              </>
            )}
          </section>

          {/* 4 — Ce sur quoi on travaille */}
          <section className="sect">
            <div className="sect-head">
              <span className="step" aria-hidden="true">
                4
              </span>
              <h2>Ce sur quoi on travaille</h2>
            </div>
            <p style={{ marginBottom: 16 }}>Les points connus, et où nous en sommes.</p>
            {R.priorities.map((p) => {
              const inProgress = p.state === 'traitement';
              return (
                <div className="workitem" key={p.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      marginBottom: 7,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h3>{p.title}</h3>
                    <span
                      className="tag"
                      style={
                        inProgress
                          ? {
                              background: 'var(--blue-m)',
                              border: '1px solid var(--blue-b)',
                              color: 'var(--blue-fg)',
                            }
                          : {
                              background: 'var(--yellow-m)',
                              border: '1px solid var(--yellow-b)',
                              color: 'var(--yellow-fg)',
                            }
                      }
                    >
                      {inProgress ? 'En cours de correction' : 'Repéré, pas encore planifié'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', marginBottom: p.doing ? 12 : 0 }}>{p.text}</p>
                  {p.doing && (
                    <div>
                      <div className="track" style={{ marginBottom: 6 }}>
                        <div
                          className="fill"
                          style={{ width: `${p.pct}%`, background: 'var(--blue-fg)' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--fg2)' }}>
                        <b>{p.pct} % fait</b> — {p.doing}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* 5 — La suite */}
          <section className="sect">
            <div className="sect-head">
              <span className="step" aria-hidden="true">
                5
              </span>
              <h2>La suite</h2>
            </div>
            <p style={{ marginBottom: 16 }}>Ce qui est prévu en octobre.</p>
            {R.next.map(([title, detail]) => (
              <div className="nextitem" key={title}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    flexShrink: 0,
                    marginTop: 8,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ marginBottom: 2 }}>{title}</h3>
                  <p style={{ fontSize: '0.9375rem', margin: 0 }}>{detail}</p>
                </div>
              </div>
            ))}
          </section>

          <footer className="foot">
            <h3 style={{ marginBottom: 6 }}>Une question sur ce rapport ?</h3>
            <p style={{ fontSize: '0.9375rem', marginBottom: 14 }}>
              Écrivez à {R.pm} — elle répond en général dans la journée.
            </p>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <a
                href={`mailto:${R.pmEmail}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.6rem 1.1rem',
                  borderRadius: 999,
                  background: '#15803D',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                <IcoSend />
                Écrire à {R.pm}
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.6rem 1.1rem',
                  borderRadius: 999,
                  background: 'transparent',
                  border: '1px solid var(--bd-strong)',
                  color: 'var(--fg2)',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <IcoDoc />
                Enregistrer en PDF
              </button>
            </div>
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid var(--bd)',
                fontSize: '0.75rem',
                color: 'var(--fg3)',
              }}
            >
              Rapport {R.period} · version {first ? 'v1' : R.versions[0].v} · publié le {R.publish}.
              Ce document ne change plus ; le prochain rapport arrivera début novembre.
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
