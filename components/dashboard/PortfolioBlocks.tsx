'use client';

/**
 * Cinq blocs « portefeuille en un coup d'œil » ajoutés au Dashboard en
 * session 8.1 — voir `docs/briefs/8-1-dashboard.md`.
 *
 * Chacun est un résumé (3-5 lignes max) avec un lien de sortie vers l'écran
 * complet déjà en ligne — jamais une seconde liste. Toutes les données sont
 * de vraies sources déjà utilisées ailleurs (`ALL_PRIORITIES`, `rqScenario`,
 * `DEALS`, `AGENCY_INTEGRATIONS`) : rien n'est recalculé ou dupliqué ici, ce
 * fichier ne fait que les résumer pour cet écran. Un état sain se dit comme
 * une bonne nouvelle (`EmptyHealthy`, socle depuis la session 6.2), jamais
 * comme une absence, et le retard/l'alerte ne repose jamais sur la seule
 * couleur — un mot l'accompagne toujours.
 */

import Link from 'next/link';
import { ALL_PRIORITIES } from '@/lib/data/priorites-transversales';
import { RQ_SENT, clientName as rqClientName, rqLate, rqScenario } from '@/lib/data/rapports-a-produire';
import { DEALS, DORMANT_DAYS, fmt } from '@/lib/data/pipeline';
import { AGENCY_INTEGRATIONS } from '@/lib/data/settings';
import { CLIENTS } from '@/lib/data/clients';
import { DASH_QUOTES_PENDING, DASH_THREADS_UNREAD } from '@/lib/data/dashboard';
import { routes } from '@/lib/routes';
import { IcoArrowR, IcoPlug, IcoWarn } from '@/components/ui/Icons';
import { EmptyHealthy, SkelLine, SkelList } from '@/components/ui/States';

const clientLabel = (id: string) => CLIENTS.find((c) => c.id === id)?.name ?? id;

/* ── Atomes partagés aux cinq blocs ── */

function BlockHead({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.625rem',
      }}
    >
      <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-1)' }}>{title}</h2>
      {count != null && count > 0 && (
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--error)',
            background: 'var(--error-bg)',
            padding: '2px 8px',
            borderRadius: 9999,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function ExitLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: 'var(--accent)',
        textDecoration: 'none',
        marginTop: '0.625rem',
      }}
    >
      {label}
      <IcoArrowR size={11} />
    </Link>
  );
}

const blockCardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

/** Squelette générique de chargement — même charpente pour les cinq blocs. */
export function PortfolioBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <section className="card-glass card-pad" aria-hidden="true">
      <SkelLine w={120} h={13} style={{ marginBottom: '0.75rem' }} />
      <SkelList n={lines} />
    </section>
  );
}

/* ── 1. Priorités critiques du portefeuille ── */

export function CriticalPrioritiesCard() {
  const critical = ALL_PRIORITIES.filter((p) => p.sev === 'critique').sort((a, b) => a.age - b.age);
  const top = critical.slice(0, 4);

  return (
    <section className="card-glass card-pad" style={blockCardStyle} aria-labelledby="critical-title">
      <div id="critical-title">
        <BlockHead title="Priorités critiques" count={critical.length} />
      </div>
      {top.length === 0 ? (
        <EmptyHealthy title="Aucune priorité critique ouverte." />
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
          {top.map((p, i) => (
            <li
              key={p.id}
              style={{ borderBottom: i < top.length - 1 ? '1px solid var(--border-solid)' : 'none' }}
            >
              <Link
                href={routes.priorite(p.clientId, p.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  padding: '5px 0',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }}>
                  <IcoWarn size={12} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--fg-1)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {clientLabel(p.clientId)}{' '}
                    <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>· {p.dim}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--fg-3)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.label}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--fg-4)',
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {p.age} j
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ExitLink href={routes.prioritesTransversales()} label="Voir toutes les priorités critiques" />
    </section>
  );
}

/* ── 2. Rapports à produire ce mois ── */

export function ReportsToProduceCard() {
  const { cycle, rows } = rqScenario('normal');
  const late = rows.filter((r) => rqLate(r, cycle));
  const sent = rows.filter((r) => RQ_SENT.includes(r.state));

  return (
    <section className="card-glass card-pad" style={blockCardStyle} aria-labelledby="reports-title">
      <div id="reports-title">
        <BlockHead title="Rapports à produire" />
      </div>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', marginTop: -6, marginBottom: '0.75rem' }}>
        {cycle.period}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--fg-1)' }}>{rows.length}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>dus</div>
        </div>
        <div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--success)' }}>{sent.length}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>publiés</div>
        </div>
        <div>
          <div
            style={{
              fontSize: '1.0625rem',
              fontWeight: 800,
              color: late.length ? 'var(--error)' : 'var(--fg-3)',
            }}
          >
            {late.length}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>en retard</div>
        </div>
      </div>
      {late.length > 0 ? (
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--error)',
            background: 'var(--error-bg)',
            padding: '0.45rem 0.625rem',
            borderRadius: 8,
            fontWeight: 600,
            lineHeight: 1.45,
          }}
        >
          En retard — {late.map((r) => rqClientName(r.clientId)).join(', ')} : date d’envoi dépassée
        </div>
      ) : (
        <EmptyHealthy title="Aucun rapport en retard." />
      )}
      <ExitLink href={routes.rapportsAProduire()} label="Voir les rapports à produire" />
    </section>
  );
}

/* ── 3. Aperçu du pipeline ── */

export function PipelineOverviewCard() {
  const open = DEALS.filter((d) => d.stage !== 'gagne' && !d.lost);
  const totalMrr = open.reduce((s, d) => s + d.mrr, 0);
  // Étape avancée (négociation) ou beaucoup de jours dans l'étape : ces deals
  // approchent d'une clôture, dans un sens ou dans l'autre.
  const closing = open
    .filter((d) => d.stage === 'negociation' || d.days >= DORMANT_DAYS)
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 4);

  return (
    <section className="card-glass card-pad" style={blockCardStyle} aria-labelledby="pipeline-title">
      <div id="pipeline-title">
        <BlockHead title="Pipeline" />
      </div>
      {open.length === 0 ? (
        <EmptyHealthy title="Aucun deal ouvert dans le pipeline." />
      ) : (
        <>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
              {fmt(totalMrr)} $
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)' }}>
              MRR proposé cumulé · {open.length} deals ouverts, hors gagnés
            </div>
          </div>
          {closing.length > 0 && (
            <>
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--fg-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Proches d’une clôture
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {closing.map((d, i) => (
                <li
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 0',
                    borderBottom: i < closing.length - 1 ? '1px solid var(--border-solid)' : 'none',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--fg-1)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {d.company}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)', flexShrink: 0 }}>
                    {d.days} j dans l’étape
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--fg-1)',
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmt(d.mrr)} $
                  </div>
                </li>
              ))}
              </ul>
            </>
          )}
        </>
      )}
      <ExitLink href={routes.pipeline()} label="Voir le pipeline" />
    </section>
  );
}

/* ── 4. Devis en attente et communications non lues ── */

export function QuotesThreadsCard() {
  const quotesTotal = DASH_QUOTES_PENDING.reduce((s, q) => s + q.amount, 0);
  const threadsTotal = DASH_THREADS_UNREAD.reduce((s, t) => s + t.unread, 0);
  const healthy = DASH_QUOTES_PENDING.length === 0 && threadsTotal === 0;

  return (
    <section className="card-glass card-pad" style={{ ...blockCardStyle, gap: '0.875rem' }} aria-labelledby="qt-title">
      <div id="qt-title">
        <BlockHead title="Devis & communications" />
      </div>

      {healthy ? (
        <EmptyHealthy title="Aucun devis en attente, aucun message non lu." />
      ) : (
        <>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--fg-1)' }}>
                {DASH_QUOTES_PENDING.length}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)' }}>
                devis en attente · {fmt(quotesTotal)} $ cumulé
              </div>
            </div>
            {DASH_QUOTES_PENDING.length > 0 && (
              <ul style={{ listStyle: 'none', marginTop: 4 }}>
                {DASH_QUOTES_PENDING.map((q, i) => (
                  <li key={`${q.clientId}-${i}`}>
                    <Link
                      href={routes.client(q.clientId)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 6,
                        fontSize: '0.6875rem',
                        color: 'var(--fg-3)',
                        textDecoration: 'none',
                        padding: '2px 0',
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--fg-2)',
                          fontWeight: 500,
                        }}
                      >
                        {clientLabel(q.clientId)}
                      </span>
                      <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{fmt(q.amount)} $</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border-solid)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--fg-1)' }}>{threadsTotal}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg-4)' }}>
                messages non lus · {DASH_THREADS_UNREAD.length} clients
              </div>
            </div>
            {DASH_THREADS_UNREAD.length > 0 && (
              <ul style={{ listStyle: 'none', marginTop: 4 }}>
                {DASH_THREADS_UNREAD.map((t, i) => (
                  <li key={`${t.clientId}-${i}`}>
                    <Link
                      href={routes.client(t.clientId)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 6,
                        fontSize: '0.6875rem',
                        color: 'var(--fg-3)',
                        textDecoration: 'none',
                        padding: '2px 0',
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--fg-2)',
                          fontWeight: 500,
                        }}
                      >
                        {clientLabel(t.clientId)}
                      </span>
                      <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {t.unread} non lu{t.unread > 1 ? 's' : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/* ── 5. Intégrations déconnectées — en permanence, pas en démo ── */

export function IntegrationsCard() {
  const down = AGENCY_INTEGRATIONS.filter((i) => !i.connected);

  return (
    <section className="card-glass card-pad" style={blockCardStyle} aria-labelledby="integ-title">
      <div id="integ-title">
        <BlockHead title="Intégrations" count={down.length} />
      </div>
      {down.length === 0 ? (
        <EmptyHealthy title="Toutes les intégrations sont connectées." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '0.625rem' }}>
          {down.map((i) => (
            <div
              key={i.id}
              style={{
                display: 'flex',
                gap: 7,
                alignItems: 'flex-start',
                padding: '0.5rem 0.625rem',
                borderRadius: 8,
                background: 'var(--error-bg)',
              }}
            >
              <span style={{ color: 'var(--error)', flexShrink: 0, marginTop: 1 }}>
                <IcoPlug size={14} />
              </span>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg-2)', lineHeight: 1.45 }}>
                <b style={{ color: 'var(--fg-1)' }}>{i.name} déconnecté</b> — les données qui en dépendent
                restent figées à leur dernière valeur connue.
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: '0.625rem', color: 'var(--fg-4)' }}>
        {AGENCY_INTEGRATIONS.length - down.length} / {AGENCY_INTEGRATIONS.length} connectées
      </div>
      <ExitLink href={routes.parametres('integrations')} label="Gérer les intégrations" />
    </section>
  );
}
