'use client';

/**
 * Colonne latérale des outils : conservation du résultat, coût, historique
 * des enregistrements dans la fiche du compte (règle 3 de `docs/decisions.md`).
 */
import Link from 'next/link';
import { Pill, Sec } from '@/components/ui/Atoms';
import { IcoArrowR, IcoCheck, IcoClock, IcoSnap } from '@/components/ui/Icons';
import { RECENT_SAVES, type Quota, type SaveEntry, type ToolAccount } from '@/lib/data/outils';
import type { CostInfo } from '@/components/outils/ContextBar';

/* ── Marqueur de conservation ── */

export function KeepCard({ prospect }: { prospect: boolean }) {
  const tone = prospect ? 'yellow' : 'neutral';
  const label = prospect ? 'Instantané · jamais historisé' : 'Éphémère · purgé après 30 jours';
  const text = prospect
    ? 'Un prospect ne reçoit pas d’historique. Le résultat reste consultable 30 jours, puis disparaît.'
    : 'Cet outil produit une exploration ponctuelle. Enregistrer dans la fiche est le seul moyen d’en garder une trace durable.';

  return (
    <Sec title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
      <div style={{ marginBottom: 9 }}>
        <Pill label={label} tone={tone} icon={prospect ? <IcoSnap /> : <IcoClock />} />
      </div>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 11 }}>
        {text}
      </p>
      <div className="keep-row">
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
          Conservé automatiquement
        </span>
        <span style={{ color: 'var(--fg3)' }}>·</span>
        <span>Scores d’audit, Lighthouse, positions SERP et locales, backlinks en delta</span>
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: 5 }}>
          Éphémère · 30 jours
        </span>
        <span style={{ color: 'var(--fg3)' }}>·</span>
        <span>Exploration de mots-clés, analyses ponctuelles de concurrents</span>
      </div>
    </Sec>
  );
}

/* ── Coût et consommation ── */

export function CostCard({ cost, quota }: { cost: CostInfo; quota: Quota }) {
  const pct = Math.round((quota.used / quota.max) * 100);
  const warn = pct >= 90;

  return (
    <Sec
      title="Coût de la requête"
      sub="Chaque appel est facturé chez le fournisseur."
      right={<Pill label={cost.weight} tone={cost.weight === 'Requête lourde' ? 'yellow' : 'neutral'} sm />}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 11 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
          {cost.credits}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg2)' }}>crédits · {cost.dollars}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', marginBottom: 5 }}>
        <span style={{ color: 'var(--fg3)' }}>Consommation de septembre</span>
        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {quota.used.toLocaleString('fr-CA')} / {quota.max.toLocaleString('fr-CA')}
        </span>
      </div>
      <div className="track">
        <div
          className="fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: warn ? 'var(--yellow-b)' : 'var(--green)' }}
        />
      </div>
      <div
        style={{
          fontSize: '0.5625rem',
          color: warn ? 'var(--yellow-fg)' : 'var(--fg3)',
          marginTop: 5,
          fontWeight: warn ? 700 : 500,
        }}
      >
        {pct} % du {warn ? 'quota utilisé' : 'quota mensuel'} · seuil d’alerte 90 %
      </div>
    </Sec>
  );
}

/* ── Derniers enregistrements dans la fiche ── */

export function SavesCard({
  acct,
  justSaved,
  prospect,
  items = RECENT_SAVES,
  toolName,
  savedWhat,
  ficheHref,
}: {
  acct: ToolAccount | null;
  justSaved: boolean;
  prospect: boolean;
  items?: readonly SaveEntry[];
  toolName: string;
  savedWhat: string;
  ficheHref: string;
}) {
  return (
    <Sec title="Enregistré dans la fiche" sub={acct ? `Historique de ${acct.name}` : 'Aucun compte sélectionné'}>
      {!acct && (
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
          L’historique apparaît une fois le compte choisi.
        </p>
      )}
      {acct && prospect && (
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
          Un prospect n’a pas d’historique d’outils. L’enregistrement crée un instantané joint au
          dossier de démarchage.
        </p>
      )}
      {acct && !prospect && (
        <div>
          {justSaved && (
            <div className="save-row">
              <span className="crit-ico" data-st="ok">
                <IcoCheck />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>À l’instant · {toolName}</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{savedWhat}</div>
              </div>
            </div>
          )}
          {items.map((s) => (
            <div className="save-row" key={s.date + s.tool}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{s.tool}</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.45 }}>{s.what}</div>
              </div>
              <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', whiteSpace: 'nowrap', marginTop: 2 }}>
                {s.date}
              </span>
            </div>
          ))}
          <Link
            href={ficheHref}
            className="btn-out"
            style={{ textDecoration: 'none', marginTop: 10, width: '100%', justifyContent: 'center' }}
          >
            Ouvrir la fiche du compte
            <IcoArrowR />
          </Link>
        </div>
      )}
    </Sec>
  );
}
