'use client';

/**
 * Backlink Analyse — blocs propres à l'outil (profil, gains et pertes,
 * liens toxiques, comparaison concurrentielle).
 *
 * Réutilise `.card`, `Sec`, `Pill`, `.sum-cell`/`.sum-val`/`.delta` du reste
 * de l'application. Le cadre commun vient de `components/outils/*`.
 */
import Link from 'next/link';
import { Pill, Sec } from '@/components/ui/Atoms';
import { IcoArrowR, IcoBan, IcoCheck, IcoClock, IcoLink, IcoPlus, IcoSkull, IcoSnap, IcoUp, IcoX } from '@/components/ui/Icons';
import type { BlAnchor, BlCompetitor, BlGain, BlLoss, BlProfile, BlToxic } from '@/lib/data/backlink-analyse';

/* ── Profil de backlinks ── */

export function ProfileCard({
  p,
  anchors,
  incomplet,
}: {
  p: BlProfile;
  anchors: readonly BlAnchor[];
  incomplet: boolean;
}) {
  return (
    <Sec title="Profil de backlinks" sub={`Relevé du ${p.date} · ${p.domains} domaines référents`}>
      <div className="prof-grid">
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>
            Domaines référents
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="sum-val">{p.domains}</span>
            <span className="delta" style={{ color: 'var(--green-fg)' }}>
              <IcoUp />
              <span>+{p.domains - p.domainsPrev}</span>
            </span>
          </div>
        </div>
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>
            Autorité moyenne
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="sum-val">{p.authority}</span>
            <span className="delta" style={{ color: 'var(--green-fg)' }}>
              <IcoUp />
              <span>+{p.authority - p.authorityPrev}</span>
            </span>
          </div>
        </div>
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>
            Suivis / non suivis
          </div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800 }}>
            {p.followed} % <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'var(--fg3)' }}>suivis</span>
          </div>
        </div>
      </div>
      <div className="lbl">Ancres les plus fréquentes</div>
      {incomplet ? (
        <div className="empty" style={{ padding: '10px 8px' }}>
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
            Ancres indisponibles — données du fournisseur incomplètes pour ce relevé.
          </span>
        </div>
      ) : (
        anchors.map((a) => (
          <div className="anchor-row" key={a.t}>
            <span style={{ fontFamily: 'var(--font-mono)', flex: '0 0 11rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {a.t}
            </span>
            <span className="anchor-bar">
              <span style={{ width: `${(a.n / anchors[0].n) * 100}%` }} />
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums', width: '2.4rem', textAlign: 'right' }}>
              {a.n}
            </span>
          </div>
        ))
      )}
    </Sec>
  );
}

/* ── Gains et pertes de la période — la seule donnée historisée, et ce qui informe ── */

export function GainsLossesCard({
  gains,
  losses,
  reported,
  onReport,
  onCreate,
  created,
  prioHref,
}: {
  gains: readonly BlGain[];
  losses: readonly BlLoss[];
  reported: Record<string, boolean>;
  onReport: (domain: string) => void;
  onCreate: (key: string) => void;
  created: Record<string, string>;
  prioHref: (prio: string) => string;
}) {
  return (
    <Sec title="Gains et pertes de la période" sub="Le corpus complet n’est pas conservé — seuls ces mouvements le sont.">
      <div className="mov-grid">
        <div>
          <div className="mov-col-head" style={{ color: 'var(--green-fg)' }}>
            <IcoPlus />
            {gains.length} domaine{gains.length > 1 ? 's' : ''} gagné{gains.length > 1 ? 's' : ''}
          </div>
          {gains.map((g) => (
            <div className="link-row" key={g.domain}>
              <span className="link-ico" style={{ background: 'var(--green-m)', color: 'var(--green-fg)', borderColor: 'var(--green-b)' }}>
                <IcoLink />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="link-dom">
                  {g.domain} <span className="auth-pill">AD {g.authority}</span>
                </div>
                <div className="link-meta">
                  ancre « {g.anchor} » → {g.url} · {g.date}
                </div>
              </div>
              {reported[g.domain] ? (
                <Pill label="Versé au rapport" tone="green" sm icon={<IcoCheck />} />
              ) : (
                <button type="button" className="btn-out" onClick={() => onReport(g.domain)}>
                  <IcoPlus />
                  Verser au rapport
                </button>
              )}
            </div>
          ))}
        </div>
        <div>
          <div className="mov-col-head" style={{ color: 'var(--red)' }}>
            <IcoX />
            {losses.length} domaine{losses.length > 1 ? 's' : ''} perdu{losses.length > 1 ? 's' : ''}
          </div>
          {losses.map((l) => {
            const prio = l.prio || created[l.domain];
            return (
              <div className="link-row" key={l.domain}>
                <span className="link-ico" style={{ background: 'var(--red-m)', color: 'var(--red)', borderColor: 'var(--red-b)' }}>
                  <IcoX />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="link-dom">
                    {l.domain} <span className="auth-pill">AD {l.authority}</span>
                  </div>
                  <div className="link-meta">
                    {l.reason} · ancre « {l.anchor} » · {l.date}
                  </div>
                </div>
                {l.authority >= 40 &&
                  (prio ? (
                    <Link href={prioHref(prio)} style={{ textDecoration: 'none' }}>
                      <Pill label={prio} tone="blue" sm icon={<IcoArrowR />} />
                    </Link>
                  ) : (
                    <button type="button" className="btn-out" onClick={() => onCreate(l.domain)}>
                      <IcoPlus />
                      Créer la priorité
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </Sec>
  );
}

/* ── Liens toxiques ou suspects ── */

export function ToxicCard({
  rows,
  onDisavow,
  onCreate,
  created,
  prioHref,
}: {
  rows: readonly BlToxic[];
  onDisavow: (domain: string) => void;
  onCreate: (key: string) => void;
  created: Record<string, string>;
  prioHref: (prio: string) => string;
}) {
  const remaining = rows.filter((r) => r.status === 'a-desavouer').length;
  const key = 'toxic-batch';
  const prio = created[key];

  return (
    <Sec
      title="Liens toxiques ou suspects"
      sub={`${rows.length} domaines détectés · score de spam au-delà du seuil de risque`}
      right={
        prio ? (
          <Link href={prioHref(prio)} style={{ textDecoration: 'none' }}>
            <Pill label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<IcoArrowR />} />
          </Link>
        ) : remaining > 0 ? (
          <button type="button" className="btn-out" onClick={() => onCreate(key)}>
            <IcoPlus size={11} />
            Créer la priorité · désaveu groupé
          </button>
        ) : null
      }
    >
      {rows.map((r) => (
        <div className="link-row" key={r.domain}>
          <span className="link-ico" style={{ background: 'var(--red-m)', color: 'var(--red)', borderColor: 'var(--red-b)' }}>
            <IcoSkull />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="link-dom">
              {r.domain} <span className="auth-pill">AD {r.authority} · spam {r.spam}/100</span>
            </div>
            <div className="link-meta">{r.reason} · seuil de risque : spam ≥ 70/100</div>
          </div>
          {r.status === 'desavoue' ? (
            <Pill label="Désavoué" tone="neutral" sm icon={<IcoCheck />} />
          ) : (
            <button type="button" className="btn-out" onClick={() => onDisavow(r.domain)}>
              <IcoBan />
              Désavouer
            </button>
          )}
        </div>
      ))}
    </Sec>
  );
}

/* ── Comparaison avec les concurrents ── */

export function CompetitorsCard({ rows, incomplet }: { rows: readonly BlCompetitor[]; incomplet: boolean }) {
  if (incomplet) {
    return (
      <Sec title="Comparaison avec les concurrents" sub="Renseignés dans la fiche client">
        <div className="empty">
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
            Comparaison indisponible — données du fournisseur incomplètes pour ce relevé.
          </span>
        </div>
      </Sec>
    );
  }
  const max = Math.max(...rows.map((r) => r.domains));
  return (
    <Sec title="Comparaison avec les concurrents" sub="Domaines référents · renseignés dans la fiche client">
      {rows.map((r) => (
        <div className="comp-row" key={r.name}>
          <span style={{ fontSize: '0.6875rem', fontWeight: r.self ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.name}
          </span>
          <span className="comp-bar" data-self={!!r.self}>
            <span style={{ width: `${(r.domains / max) * 100}%` }} />
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.domains}</span>
        </div>
      ))}
    </Sec>
  );
}

/* ── Conservation — variante propre à cet outil : seuls gains/pertes s'historisent ── */

export function BlKeepCard({ prospect }: { prospect: boolean }) {
  return (
    <Sec title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
      <div style={{ marginBottom: 9 }}>
        {prospect ? (
          <Pill label="Instantané · jamais historisé" tone="yellow" icon={<IcoSnap />} />
        ) : (
          <Pill label="Partiellement historisé" tone="blue" icon={<IcoClock />} />
        )}
      </div>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 11 }}>
        {prospect
          ? 'Un prospect ne reçoit pas d’historique de backlinks. Ce profil sert au démarchage et disparaît après 30 jours.'
          : 'Le corpus complet des backlinks n’est jamais conservé — il est trop volumineux et change en continu. Seuls les gains et les pertes de chaque relevé rejoignent l’historique du client.'}
      </p>
      <div className="keep-row">
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
          Conservé automatiquement
        </span>
        <span style={{ color: 'var(--fg3)' }}>·</span>
        <span>Gains et pertes de domaines référents, liens versés au rapport, désaveux effectués</span>
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: 5 }}>
          Jamais conservé
        </span>
        <span style={{ color: 'var(--fg3)' }}>·</span>
        <span>Le corpus complet des backlinks actifs</span>
      </div>
    </Sec>
  );
}
