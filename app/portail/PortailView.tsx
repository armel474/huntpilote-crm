'use client';

/**
 * Tableau de bord du portail client — session 5.1.
 *
 * Le portail est figé à la publication : cet écran ne montre jamais de
 * données en direct, seulement l'état publié au dernier rapport, daté. Les
 * cinq temps du rapport (où on en est / ce qui a bougé / ce qu'on a fait /
 * ce sur quoi on travaille / la suite) reprennent les données réelles de
 * `lib/data/rapport.ts` (le même `REPORT` que la page publique `/r/[token]`,
 * session 1.3) — ce n'est pas un second rapport inventé. Un lien en pied de
 * page renvoie vers le document réel, tel qu'envoyé et jamais modifié après
 * coup.
 *
 * L'état « plusieurs établissements » bascule sur Clinique Lavoie, seul
 * client du jeu de données qui a réellement deux adresses
 * (`lib/data/local.ts`) ; son résumé vient de ses propres mesures locales.
 */
import { useMemo, useState } from 'react';
import {
  IcoArrowR,
  IcoBuilding,
  IcoCheck,
  IcoChevL,
  IcoChevR,
  IcoClock,
  IcoDown,
  IcoLock,
  IcoMsg,
  IcoSend,
  IcoUp,
} from '@/components/ui/Icons';
import { PortalHeader } from '@/app/portail/PortalHeader';
import { DemoOnly } from '@/components/ui/Demo';
import { routes } from '@/lib/routes';
import { REPORT } from '@/lib/data/rapport';
import {
  MULTI_ACCOUNT,
  MULTI_NEXT,
  MULTI_PLACES,
  MULTI_PRIORITIES,
  MULTI_STATS,
  PORTAL_ACCOUNT,
  PORTAL_ONBOARD_STEPS,
  PORTAL_PUBLISHED,
  PORTAL_THREAD,
} from '@/lib/data/portail';

type Scenario = 'normal' | 'premier' | 'aucun' | 'sanspreuve' | 'multi';

const SCENARIOS: readonly [Scenario, string][] = [
  ['normal', 'Rapport du mois'],
  ['premier', 'Premier mois, sans comparaison'],
  ['aucun', 'Aucun rapport publié'],
  ['sanspreuve', 'Mois sans preuve de valeur'],
  ['multi', 'Plusieurs établissements'],
];

const UNREAD = PORTAL_THREAD.filter((m) => !m.read && m.from === 'pm').length;

/* ── écran d'attente : le client s'est connecté avant le premier rapport ── */
function NotYet() {
  return (
    <div className="pc-wait">
      <div className="pc-wait-card">
        <div className="pc-sent warn" style={{ marginBottom: '1.25rem' }} aria-hidden="true">
          <IcoClock size={20} />
        </div>
        <h1 style={{ fontSize: '1.625rem', marginBottom: 10 }}>Votre premier rapport arrive le 2 octobre</h1>
        <p className="pc-lead">
          Votre espace est bien ouvert — il n’y a simplement rien à lire pour l’instant. Nous publions un rapport par
          mois, et le premier a besoin d’un mois complet de données pour dire quelque chose d’utile.
        </p>
        <div className="pc-sep" />
        <h3 style={{ marginBottom: 4 }}>Où nous en sommes</h3>
        <ul className="pc-tl">
          {PORTAL_ONBOARD_STEPS.map((s) => (
            <li key={s.title}>
              <span className={`dot ${s.state}`}>{s.state === 'done' ? <IcoCheck size={11} /> : s.state === 'now' ? '•' : ''}</span>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ marginBottom: 2, color: s.state === 'todo' ? 'var(--fg3)' : 'var(--fg1)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9375rem', margin: 0 }}>{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="pc-frozen-in" style={{ marginTop: 4 }}>
          <span>
            <IcoLock size={14} />
          </span>
          <div>
            Vous recevrez un courriel dès la publication. <b>Rien à surveiller d’ici là</b> — et rien ne se passe
            dans cet espace entre deux rapports.
          </div>
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <a href={`mailto:${PORTAL_ACCOUNT.pmEmail}`} className="pc-btn" style={{ textDecoration: 'none' }}>
            <IcoSend size={14} />
            Écrire à {PORTAL_ACCOUNT.pm}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── aperçu des échanges, en bas du tableau de bord ── */
function ThreadPeek() {
  const last = PORTAL_THREAD[PORTAL_THREAD.length - 1];
  return (
    <div className="pc-doc" style={{ marginTop: '1.25rem' }}>
      <div className="pc-sect" style={{ borderTop: 0 }}>
        <div className="pc-sect-head">
          <span className="pc-step" aria-hidden="true">
            <IcoMsg size={13} />
          </span>
          <h2>Vos échanges avec {PORTAL_ACCOUNT.pm}</h2>
        </div>
        <p style={{ marginBottom: 16 }}>
          Une question sur ce rapport ? Écrivez à {PORTAL_ACCOUNT.pm} en rattachant votre question au chiffre ou au
          chantier concerné — elle voit tout de suite de quoi il s’agit.
        </p>
        <div style={{ padding: '1rem 1.1rem', borderRadius: 13, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginBottom: 5, fontWeight: 600 }}>
            Dernier message · {PORTAL_ACCOUNT.pm} · {last.at}
          </div>
          <p style={{ fontSize: '0.9375rem', margin: 0 }}>{last.text}</p>
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <a href={routes.portailEchanges()} className="pc-btn solid" style={{ textDecoration: 'none' }}>
            <IcoMsg size={14} />
            Ouvrir vos échanges
          </a>
          <span className="pc-hint">Réponse en général dans la journée ouvrable.</span>
        </div>
      </div>
    </div>
  );
}

/* ── le résumé du mois, pour Acme Corp. — reprend REPORT tel quel ── */
function AcmeSummary({ monthLabel, publish, dataAt, first, showProofs }: { monthLabel: string; publish: string; dataAt: string; first: boolean; showProofs: boolean }) {
  const proofs = showProofs ? REPORT.proofs.filter((p) => p.on) : [];
  const visibles = REPORT.priorities.filter((p) => p.state === 'annonce' || p.state === 'traitement');

  return (
    <div className="pc-doc">
      {/* 1 — Où on en est */}
      <section className="pc-sect">
        <div className="pc-sect-head">
          <span className="pc-step" aria-hidden="true">1</span>
          <h2>Où on en est</h2>
        </div>
        <p className="pc-lead" style={{ marginBottom: 18 }}>
          {first
            ? 'Voici le premier état des lieux de votre site. Il servira de point de comparaison pour les mois suivants.'
            : REPORT.objective.sentence}
        </p>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--green-d, var(--green-fg))' }}>
              {REPORT.score.now}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--fg3)', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ minWidth: 0, flex: '1 1 14rem' }}>
            <h3 style={{ marginBottom: 3 }}>Santé générale de votre site</h3>
            <p style={{ fontSize: '0.9375rem', margin: 0 }}>
              {first
                ? 'Note de départ, calculée sur votre présence en ligne, votre référencement et votre design.'
                : `En hausse de ${REPORT.score.now - REPORT.score.prev} points depuis le mois dernier. Cette note combine votre présence en ligne, votre référencement et votre design.`}
            </p>
          </div>
        </div>
        {!first && (
          <div style={{ padding: '1.125rem 1.25rem', borderRadius: 12, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)' }}>
            <h3 style={{ marginBottom: 8 }}>Votre objectif : {REPORT.objective.label}</h3>
            <div className="track" style={{ marginBottom: 7 }}>
              <div className="fill" style={{ width: `${REPORT.objective.pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--fg2)', fontWeight: 600 }}>
              <span>{REPORT.objective.pct} % atteint</span>
              <span style={{ color: 'var(--green-fg)' }}>+{REPORT.objective.pct - REPORT.objective.prevPct} points ce mois</span>
            </div>
          </div>
        )}
      </section>

      {/* 2 — Ce qui a bougé */}
      <section className="pc-sect">
        <div className="pc-sect-head">
          <span className="pc-step" aria-hidden="true">2</span>
          <h2>Ce qui a bougé</h2>
        </div>
        <p style={{ marginBottom: 16 }}>{first ? 'Ce sont vos chiffres de départ. Le mois prochain, vous verrez l’évolution.' : 'Comparé au mois précédent.'}</p>
        {REPORT.kpis.map((k) => (
          <div className="pc-kpi" key={k.label}>
            <div className="pc-kpi-val">{k.value}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 3 }}>
                <h3>{k.label}</h3>
                {first ? (
                  <span className="pc-tag" style={{ background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', color: 'var(--fg3)' }}>
                    Point de départ
                  </span>
                ) : (
                  <span className="pc-delta">
                    {k.up ? <IcoUp size={11} /> : <IcoDown size={11} />}
                    {k.delta}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9375rem', margin: 0 }}>
                {k.sentence}
                {!first && <span style={{ color: 'var(--fg3)' }}> (mois précédent : {k.prev})</span>}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* 3 — Ce qu'on a fait */}
      <section className="pc-sect">
        <div className="pc-sect-head">
          <span className="pc-step" aria-hidden="true">3</span>
          <h2>Ce qu’on a fait</h2>
        </div>
        {proofs.length === 0 ? (
          <p>
            {first
              ? 'Le travail commence ce mois-ci : les premiers résultats apparaîtront dans le prochain rapport.'
              : 'Aucun chantier terminé et vérifié ce mois-ci. Le travail en cours est détaillé dans « Ce sur quoi on travaille », plus bas — rien à cacher, simplement rien à cocher cette fois.'}
          </p>
        ) : (
          <>
            <p style={{ marginBottom: 16 }}>{proofs.length} chantiers terminés et vérifiés ce mois-ci.</p>
            {proofs.map((p) => (
              <div className="pc-proof" key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span
                    aria-hidden="true"
                    style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <IcoCheck strokeWidth={3} size={11} />
                  </span>
                  <h3 style={{ color: 'var(--fg1)' }}>{p.title}</h3>
                </div>
                {p.before && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 7 }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--fg3)', textDecoration: 'line-through' }}>{p.before}</span>
                    <span aria-hidden="true" style={{ color: 'var(--fg3)', display: 'flex' }}>
                      <IcoArrowR size={13} />
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-fg)', letterSpacing: '-0.03em' }}>{p.after}</span>
                  </div>
                )}
                <p style={{ fontSize: '0.9375rem', margin: 0 }}>{p.text}</p>
              </div>
            ))}
          </>
        )}
      </section>

      {/* 4 — Ce sur quoi on travaille */}
      <section className="pc-sect">
        <div className="pc-sect-head">
          <span className="pc-step" aria-hidden="true">4</span>
          <h2>Ce sur quoi on travaille</h2>
        </div>
        <p style={{ marginBottom: 16 }}>Les points connus, et où nous en sommes.</p>
        {visibles.map((p) => {
          const inProgress = p.state === 'traitement';
          return (
            <div className="pc-workitem" key={p.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7, flexWrap: 'wrap' }}>
                <h3>{p.title}</h3>
                <span
                  className="pc-tag"
                  style={
                    inProgress
                      ? { background: 'var(--blue-m)', border: '1px solid var(--blue-b)', color: 'var(--blue-fg)' }
                      : { background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)', color: 'var(--yellow-fg)' }
                  }
                >
                  {inProgress ? 'En cours de correction' : 'Repéré, pas encore planifié'}
                </span>
              </div>
              <p style={{ fontSize: '0.9375rem', marginBottom: p.doing ? 12 : 0 }}>{p.text}</p>
              {p.doing && (
                <div>
                  <div className="track" style={{ marginBottom: 6 }}>
                    <div className="fill" style={{ width: `${p.pct}%`, background: 'var(--blue-fg)' }} />
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
      <section className="pc-sect">
        <div className="pc-sect-head">
          <span className="pc-step" aria-hidden="true">5</span>
          <h2>La suite</h2>
        </div>
        <p style={{ marginBottom: 16 }}>Ce qui est prévu le mois prochain.</p>
        {REPORT.next.map(([title, detail]) => (
          <div className="pc-nextitem" key={title}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 8 }} />
            <div style={{ minWidth: 0 }}>
              <h3 style={{ marginBottom: 2 }}>{title}</h3>
              <p style={{ fontSize: '0.9375rem', margin: 0 }}>{detail}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="pc-foot">
        <p className="pc-hint">
          Ce résumé reprend le rapport de {monthLabel.toLowerCase()}, publié le {publish} (données au {dataAt}).{' '}
          <a href={`/${REPORT.token}`}>Voir ce rapport tel qu’il a été envoyé, avec sa mise en page complète →</a>
        </p>
      </footer>
    </div>
  );
}

type PlaceId = 'all' | 'lavoie-laval' | 'lavoie-rs';

/* ── le résumé du mois, pour Clinique Lavoie — plusieurs établissements ── */
function MultiSummary({ place, setPlace }: { place: PlaceId; setPlace: (p: PlaceId) => void }) {
  const stats = MULTI_STATS[place];
  const rsPlace = MULTI_PLACES.find((p) => p.id === 'lavoie-rs');
  const showingRsAlone = place === 'lavoie-rs';

  return (
    <>
      <div className="pc-period" style={{ paddingTop: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg2)' }}>Établissement</span>
        <div className="pc-places">
          <button type="button" className={`pc-place${place === 'all' ? ' on' : ''}`} onClick={() => setPlace('all')}>
            <IcoBuilding size={12} />
            Les deux établissements
          </button>
          {MULTI_PLACES.map((p) => (
            <button key={p.id} type="button" className={`pc-place${place === p.id ? ' on' : ''}`} onClick={() => setPlace(p.id as PlaceId)}>
              {!p.ok && <span className="warn-dot" aria-hidden="true" />}
              {p.label}
              {p.ville !== p.label && ` — ${p.ville}`}
            </button>
          ))}
        </div>
        <span className="pc-hint" style={{ marginLeft: 'auto' }}>
          {place === 'all' ? 'Chiffres additionnés des deux adresses' : 'Chiffres de cette adresse seulement'}
        </span>
      </div>

      <div className="pc-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '1rem' }}>
        <div className="pc-doc">
          <section className="pc-sect">
            <div className="pc-sect-head">
              <span className="pc-step" aria-hidden="true">1</span>
              <h2>Où on en est</h2>
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--green-d, var(--green-fg))' }}>
                  {MULTI_ACCOUNT.score}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--fg3)', fontWeight: 600 }}>/ 100</span>
              </div>
              <div style={{ minWidth: 0, flex: '1 1 14rem' }}>
                <h3 style={{ marginBottom: 3 }}>Santé générale, vos deux établissements</h3>
                <p style={{ fontSize: '0.9375rem', margin: 0 }}>
                  En hausse de {MULTI_ACCOUNT.scoreDelta} points depuis le mois dernier — cette note combine votre
                  présence en ligne, votre référencement et votre design, sur l’ensemble de vos adresses.
                </p>
              </div>
            </div>
          </section>

          <section className="pc-sect">
            <div className="pc-sect-head">
              <span className="pc-step" aria-hidden="true">2</span>
              <h2>Ce qui a bougé</h2>
            </div>
            {showingRsAlone ? (
              <p>
                La fiche Google de {rsPlace?.label} est suspendue ce mois-ci : aucune statistique de fiche
                (appels, itinéraires, visites) n’est disponible tant qu’elle n’est pas réactivée.
              </p>
            ) : (
              <>
                <p style={{ marginBottom: 16 }}>Comparé au mois précédent.</p>
                {stats.map((s) => (
                  <div className="pc-kpi" key={s.label}>
                    <div className="pc-kpi-val">{s.value}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 3 }}>
                        <h3>{s.label}</h3>
                        <span className={`pc-delta${s.delta < 0 ? ' down' : ''}`}>
                          {s.delta >= 0 ? <IcoUp size={11} /> : <IcoDown size={11} />}
                          {s.delta >= 0 ? `+${s.delta}` : s.delta}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9375rem', margin: 0 }}>{s.sentence}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>

          <section className="pc-sect">
            <div className="pc-sect-head">
              <span className="pc-step" aria-hidden="true">3</span>
              <h2>Ce qu’on a fait</h2>
            </div>
            <p>
              Aucun chantier terminé et vérifié ce mois-ci sur vos établissements. Le travail en cours est détaillé
              ci-dessous, dans « Ce sur quoi on travaille ».
            </p>
          </section>

          <section className="pc-sect">
            <div className="pc-sect-head">
              <span className="pc-step" aria-hidden="true">4</span>
              <h2>Ce sur quoi on travaille</h2>
            </div>
            <p style={{ marginBottom: 16 }}>Les points connus, et où nous en sommes.</p>
            {MULTI_PRIORITIES.map((p) => {
              const inProgress = p.state === 'traitement';
              return (
                <div className="pc-workitem" key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7, flexWrap: 'wrap' }}>
                    <h3>{p.title}</h3>
                    <span className="pc-tag" style={{ background: 'var(--bg-solid)', border: '1px solid var(--bd-solid)', color: 'var(--fg3)' }}>
                      {p.place}
                    </span>
                    <span
                      className="pc-tag"
                      style={
                        inProgress
                          ? { background: 'var(--blue-m)', border: '1px solid var(--blue-b)', color: 'var(--blue-fg)' }
                          : { background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)', color: 'var(--yellow-fg)' }
                      }
                    >
                      {inProgress ? 'En cours de correction' : 'Repéré, pas encore planifié'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9375rem', marginBottom: p.doing ? 12 : 0 }}>{p.text}</p>
                  {p.doing && (
                    <div>
                      <div className="track" style={{ marginBottom: 6 }}>
                        <div className="fill" style={{ width: `${p.pct}%`, background: 'var(--blue-fg)' }} />
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

          <section className="pc-sect">
            <div className="pc-sect-head">
              <span className="pc-step" aria-hidden="true">5</span>
              <h2>La suite</h2>
            </div>
            <p style={{ marginBottom: 16 }}>Ce qui est prévu le mois prochain.</p>
            {MULTI_NEXT.map(([title, detail]) => (
              <div className="pc-nextitem" key={title}>
                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 8 }} />
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ marginBottom: 2 }}>{title}</h3>
                  <p style={{ fontSize: '0.9375rem', margin: 0 }}>{detail}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}

export function PortailView() {
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [monthId, setMonthId] = useState<string>('sept26');
  const [place, setPlace] = useState<PlaceId>('all');

  const isMulti = scenario === 'multi';
  const account = isMulti ? MULTI_ACCOUNT : PORTAL_ACCOUNT;
  const published = scenario !== 'aucun';
  const showProofs = scenario !== 'sanspreuve';
  const first = scenario === 'premier';

  const setSc = (s: Scenario) => {
    setScenario(s);
    setPlace('all');
    setMonthId(s === 'premier' ? 'nov25' : s === 'sanspreuve' ? 'aout26' : 'sept26');
  };

  // Le plus récent d'abord : c'est le mois par défaut, il doit être visible sans défiler.
  const months = useMemo(
    () => [...(first ? PORTAL_PUBLISHED.filter((m) => m.id === 'nov25') : PORTAL_PUBLISHED)].reverse(),
    [first],
  );
  const idx = months.findIndex((m) => m.id === monthId);
  const m = months[idx] ?? months[months.length - 1];

  return (
    <div className="pc-root page-scroll">
      <DemoOnly>
        <div className="pc-demo">
          <select value={scenario} onChange={(e) => setSc(e.target.value as Scenario)} aria-label="État de démonstration">
            {SCENARIOS.map(([id, l]) => (
              <option key={id} value={id}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </DemoOnly>

      <PortalHeader active="tableau" client={account.client} person={account.person} initials={account.initials} pm={account.pm} unread={UNREAD} />

      {!published ? (
        <NotYet />
      ) : isMulti ? (
        <MultiSummary place={place} setPlace={setPlace} />
      ) : (
        <>
          <div className="pc-period">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="pc-icon"
                disabled={idx >= months.length - 1}
                onClick={() => setMonthId(months[idx + 1].id)}
                aria-label="Mois précédent"
              >
                <IcoChevL size={14} />
              </button>
              <button
                type="button"
                className="pc-icon"
                disabled={idx <= 0}
                onClick={() => setMonthId(months[idx - 1].id)}
                aria-label="Mois suivant"
              >
                <IcoChevR size={14} />
              </button>
            </div>
            <div className="pc-months" role="tablist" aria-label="Rapports publiés">
              {months.map((x) => (
                <button key={x.id} type="button" role="tab" aria-selected={x.id === monthId} className={`pc-month${x.id === monthId ? ' on' : ''}`} onClick={() => setMonthId(x.id)}>
                  {x.label}
                </button>
              ))}
            </div>
            <span className="pc-hint" style={{ marginLeft: 'auto' }}>
              {months.length} rapport{months.length > 1 ? 's' : ''} publié{months.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="pc-frozen">
            <div className="pc-frozen-in">
              <span>
                <IcoLock size={14} />
              </span>
              <div>
                <b>Données au {m.dataAt}</b>, publiées le {m.publish}. Ce n’est pas un tableau de bord en direct :
                cette page ne bougera plus jusqu’au prochain rapport.
                {first && (
                  <>
                    {' '}
                    C’est votre premier rapport — <b>aucune comparaison n’est possible</b>, il servira de point de
                    départ.
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pc-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '1rem' }}>
            <AcmeSummary monthLabel={m.label} publish={m.publish ?? ''} dataAt={m.dataAt ?? ''} first={first} showProofs={showProofs} />
          </div>
          <div className="pc-wrap" style={{ paddingTop: 0 }}>
            <ThreadPeek />
          </div>
        </>
      )}
    </div>
  );
}
