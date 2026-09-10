'use client';

/**
 * Calendrier éditorial — quota du forfait, ligne de contenu, vue mois,
 * état vide (session 6.1).
 */
import Link from 'next/link';
import { ProgressBar, Pill } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoChart,
  IcoClock,
  IcoDoc,
  IcoKey,
  IcoTrophy,
  IcoWarn,
} from '@/components/ui/Icons';
import { M_LONG, capFirst, monthGrid, parseD } from '@/lib/data/agenda';
import {
  CONTENU_CLIENT,
  CT_DONE,
  CT_MEASURE_DAYS,
  CT_STATES,
  CT_TODAY,
  CT_WRITERS,
  ctLate,
  ctMonth,
  type ContenuItem,
} from '@/lib/data/contenu';
import { routes } from '@/lib/routes';

export const ctMonthLabel = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number);
  return `${capFirst(M_LONG[m - 1])} ${y}`;
};

/* ── Quota du forfait ── */

export function QuotaCard({ content, month }: { content: ContenuItem[]; month: string }) {
  const inMonth = content.filter((c) => ctMonth(c.due) === month);
  const done = inMonth.filter((c) => CT_DONE.includes(c.state)).length;
  const planned = inMonth.length;
  const late = inMonth.filter(ctLate).length;
  const short = planned < CONTENU_CLIENT.quota;
  const pct = Math.min((done / CONTENU_CLIENT.quota) * 100, 100);
  const tone = done >= CONTENU_CLIENT.quota ? 'var(--green-fg)' : late > 0 || short ? 'var(--red)' : 'var(--yellow-fg)';
  const missing = CONTENU_CLIENT.quota - planned;

  return (
    <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Quota du forfait — {ctMonthLabel(month)}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>
            Forfait {CONTENU_CLIENT.plan} · {CONTENU_CLIENT.quotaLabel} inclus au contrat · seuil :{' '}
            {CONTENU_CLIENT.quota} livrés pour tenir l’engagement
          </div>
        </div>
        {done >= CONTENU_CLIENT.quota && <Pill label="Quota tenu" tone="green" icon={<IcoTrophy />} />}
        {short && (
          <Pill
            label={`${missing} article${missing > 1 ? 's' : ''} non planifié${missing > 1 ? 's' : ''}`}
            tone="red"
            icon={<IcoWarn size={12} />}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: tone,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {done} sur {CONTENU_CLIENT.quota}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
          articles livrés ce mois · {planned} planifié{planned > 1 ? 's' : ''}
        </span>
      </div>
      <ProgressBar value={pct} color={tone} height={8} />
      <div style={{ marginTop: 7, fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
        {done >= CONTENU_CLIENT.quota ? (
          'L’engagement du mois est rempli. Les articles au-delà du quota sont offerts en avance sur le mois suivant.'
        ) : short ? (
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>
            {planned === 0
              ? 'Aucun article n’est au calendrier'
              : planned === 1
                ? 'Un seul article est au calendrier'
                : `Seuls ${planned} articles sont au calendrier`}{' '}
            pour un forfait qui en inclut {CONTENU_CLIENT.quota} : c’est un manquement au contrat avant d’être un
            retard éditorial.
          </span>
        ) : (
          <>
            {CONTENU_CLIENT.quota - done} article{CONTENU_CLIENT.quota - done > 1 ? 's' : ''} encore à livrer d’ici la
            fin du mois
            {late > 0 && (
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>
                {' '}
                · {late} en retard sur {late > 1 ? 'leur' : 'son'} échéance
              </span>
            )}
            .
          </>
        )}
      </div>
    </div>
  );
}

/* ── Ligne de contenu ── */

export function ContentRow({ c, clientId }: { c: ContenuItem; clientId: string }) {
  const st = CT_STATES[c.state];
  const late = ctLate(c);
  const done = CT_DONE.includes(c.state);
  const writer = c.writer ? CT_WRITERS[c.writer] : null;
  const measurable = c.state === 'mesure' && !!c.perf;

  return (
    <div
      className="rq-row"
      style={late ? { borderColor: 'var(--red-b)', background: 'var(--red-m)' } : undefined}
    >
      <div className="rq-main">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
          <Pill label={st.label} tone={st.tone} sm icon={done ? <IcoDoc size={13} /> : undefined} />
          {late && (
            <Pill
              label={`Échéance dépassée du ${fmtDateFr(c.due)}`}
              tone="red"
              sm
              icon={<IcoWarn size={12} />}
            />
          )}
          {c.fromKw && c.prioSlug && (
            <Link href={routes.priorite(clientId, c.prioSlug)} style={{ textDecoration: 'none' }}>
              <Pill label="Repéré par Keyword Hunter" tone="violet" sm icon={<IcoKey size={12} />} />
            </Link>
          )}
          {c.proof && (
            <Link href={routes.rapport(clientId, '2026-09')} style={{ textDecoration: 'none' }}>
              <Pill label={`Preuve de valeur ${c.proof}`} tone="green" sm icon={<IcoTrophy size={12} />} />
            </Link>
          )}
        </div>
        <Link href={routes.brief(clientId, c.id)} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.35 }}>{c.title}</div>
        </Link>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4, fontSize: '0.625rem', color: 'var(--fg3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IcoKey size={11} />
            <b style={{ color: 'var(--fg2)' }}>{c.kw}</b> · {c.vol} rech./mois
          </span>
          <span>{c.id.toUpperCase()}</span>
        </div>
        {done && (
          <div className="note-box" style={{ fontSize: '0.625rem' }}>
            {measurable && c.perf ? (
              <>
                <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
                  <IcoChart size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                  <b>{c.perf.visits} visites par mois</b> depuis Google, position {c.perf.pos} sur « {c.kw} »
                  {c.perf.prevPos ? ` (${c.perf.prevPos} au départ)` : ''}. Publié le {c.pubAt}.
                </div>
                {c.url && (
                  <a
                    href={`https://${c.url}`}
                    className="btn-out"
                    style={{ fontSize: '0.5625rem', padding: '0.2rem 0.55rem', textDecoration: 'none', flexShrink: 0 }}
                    target="_blank"
                    rel="noopener"
                  >
                    Voir en ligne
                  </a>
                )}
              </>
            ) : (
              <>
                <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
                  <IcoClock size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                  Publié le {c.pubAt} — <b>performance pas encore mesurable</b> : il faut {CT_MEASURE_DAYS} jours
                  d’indexation avant qu’un chiffre veuille dire quelque chose.
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="rq-side">
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: late ? 'var(--red)' : 'var(--fg2)',
            whiteSpace: 'nowrap',
          }}
        >
          {done ? `Publié le ${c.pubAt}` : fmtDateFr(c.due)}
        </span>
        {writer ? (
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{writer.name}</span>
        ) : (
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', fontStyle: 'italic' }}>
            Pas de rédacteur assigné
          </span>
        )}
      </div>
      <div className="rq-act">
        <Link
          href={routes.brief(clientId, c.id)}
          className="btn-out"
          style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem', textDecoration: 'none' }}
        >
          Ouvrir le brief
          <IcoArrowR />
        </Link>
      </div>
    </div>
  );
}

function fmtDateFr(due: string): string {
  const d = parseD(due);
  return `${d.getDate()} ${M_LONG[d.getMonth()]}`;
}

/* ── Vue mois ── */

const DAY_HEADS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

export function MonthView({
  content,
  month,
  clientId,
}: {
  content: ContenuItem[];
  month: string;
  clientId: string;
}) {
  const [, m] = month.split('-').map(Number);
  const cells = monthGrid(month);

  return (
    <div>
      <div className="ag-month" style={{ marginBottom: 4 }}>
        {DAY_HEADS.map((d) => (
          <div key={d} className="ag-mhead">
            {d}
          </div>
        ))}
      </div>
      <div className="ag-month">
        {cells.map((d) => {
          const items = content.filter((c) => c.due === d);
          const out = parseD(d).getMonth() + 1 !== m;
          const isToday = d === CT_TODAY;
          return (
            <div key={d} className={`ag-cell${out ? ' out' : ''}${isToday ? ' is-today' : ''}`} style={{ cursor: 'default' }}>
              <span className="ag-cd">
                {parseD(d).getDate()}
                {isToday && (
                  <span
                    style={{
                      fontSize: '0.5625rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      padding: '0 5px',
                      borderRadius: 999,
                      background: 'var(--green-m)',
                      border: '1px solid var(--green-b)',
                      color: 'var(--green-fg)',
                    }}
                  >
                    Auj.
                  </span>
                )}
              </span>
              {items.map((c) => {
                const st = CT_STATES[c.state];
                const late = ctLate(c);
                return (
                  <Link key={c.id} href={routes.brief(clientId, c.id)} className="ct-chip" data-tone={late ? 'red' : st.tone}>
                    <span className="ct-chip-s">{late ? 'En retard' : st.short}</span>
                    <span className="ct-chip-t">{c.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── État vide ── */

export function EdEmpty() {
  return (
    <div className="empty">
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucun contenu planifié ce mois-ci</div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5, marginBottom: 11 }}>
        Le forfait {CONTENU_CLIENT.plan} inclut {CONTENU_CLIENT.quotaLabel}. Un mois vide, c’est un engagement
        contractuel non tenu — pas seulement un calendrier vide.
      </div>
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={routes.outil('keyword-hunter')} className="btn-out" style={{ fontSize: '0.6875rem', textDecoration: 'none' }}>
          <IcoKey />
          Chercher des sujets dans Keyword Hunter
        </Link>
      </div>
    </div>
  );
}
