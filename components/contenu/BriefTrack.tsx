'use client';

/**
 * Brief d'article — colonne de suivi et clôture en preuve de valeur
 * (session 6.1). Même mécanique que la clôture d'une tâche
 * (`components/tache/CloseFlow.tsx`) : marquer un article publié propose
 * d'en faire une preuve, avec son libellé client à relire.
 */
import { useState } from 'react';
import Link from 'next/link';
import { IcoArrowR, IcoCheck, IcoSpark, IcoTrophy } from '@/components/ui/Icons';
import { BR_STAGES, type BriefRecord, type BrStage } from '@/lib/data/brief';
import { CT_MEASURE_DAYS } from '@/lib/data/contenu';
import { routes } from '@/lib/routes';

/* ── Suivi ── */

export function TrackSide({
  b,
  clientId,
  onAdvance,
  onPublish,
}: {
  b: BriefRecord;
  clientId: string;
  onAdvance: (stage: BrStage) => void;
  onPublish: () => void;
}) {
  const idx = BR_STAGES.findIndex(([id]) => id === b.stage);
  const next = BR_STAGES[idx + 1];

  return (
    <div className="card ar-sec" style={{ marginBottom: 0 }}>
      <div className="lbl" style={{ marginBottom: 10 }}>
        Suivi
      </div>
      <div className="ct-steps">
        {BR_STAGES.map(([id, label, hint], i) => (
          <div key={id} className="ct-step">
            <span className={`ct-dot${i < idx ? ' done' : i === idx ? ' now' : ''}`}>
              {i < idx ? <IcoCheck /> : i === idx ? '•' : ''}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: i === idx ? 800 : 600, color: i > idx ? 'var(--fg4)' : 'var(--fg1)' }}>
                {label}
              </div>
              {i === idx && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.45, marginTop: 2 }}>{hint}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 4, paddingTop: 11, borderTop: '1px solid var(--bd)' }}>
        <div className="dl-field" style={{ paddingTop: 0 }}>
          <span className="dl-field-l">Rédacteur</span>
          <span className="dl-field-v">
            {b.writer || <span style={{ color: 'var(--fg4)', fontStyle: 'italic' }}>Pas encore assigné</span>}
          </span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Relecture</span>
          <span className="dl-field-v">{b.track.reviewer}</span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Échéance</span>
          <span className="dl-field-v">{b.due}</span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Publication</span>
          <span className="dl-field-v">
            {b.track.pubAt || <span style={{ color: 'var(--fg4)', fontStyle: 'italic' }}>Non publié</span>}
          </span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Adresse en ligne</span>
          <span className="dl-field-v">
            {b.track.url ? (
              <a href={`https://${b.track.url}`} target="_blank" rel="noopener" style={{ overflowWrap: 'anywhere' }}>
                {b.track.url}
              </a>
            ) : (
              <span style={{ color: 'var(--fg4)', fontStyle: 'italic' }}>Disponible à la publication</span>
            )}
          </span>
        </div>
      </div>
      {next && (
        <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {next[0] === 'publie' ? (
            <button type="button" className="btn-main" onClick={onPublish}>
              <IcoCheck />
              Marquer publié
            </button>
          ) : (
            <button type="button" className="btn-out" style={{ justifyContent: 'center' }} onClick={() => onAdvance(next[0])}>
              Passer à « {next[1].toLowerCase()} »
              <IcoArrowR />
            </button>
          )}
          <Link href={routes.contenu(clientId)} className="btn-out" style={{ justifyContent: 'center', fontSize: '0.6875rem', textDecoration: 'none' }}>
            Revenir au calendrier
          </Link>
        </div>
      )}
      {!next && (
        <div style={{ marginTop: 11 }}>
          <Link href={routes.rapport(clientId, '2026-09')} className="btn-out" style={{ justifyContent: 'center', width: '100%', textDecoration: 'none' }}>
            <IcoTrophy />
            Voir au rapport du mois
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Performance une fois mesurée ── */

export function PerfSide({ b }: { b: BriefRecord }) {
  if (!b.perf) return null;
  return (
    <div className="card ar-sec" style={{ marginBottom: 0 }}>
      <div className="lbl" style={{ marginBottom: 9 }}>
        Performance mesurée
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--green-fg)', fontVariantNumeric: 'tabular-nums' }}>
          {b.perf.visits}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>visites par mois depuis Google</span>
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55 }}>
        Position <b>{b.perf.pos}</b> sur « {b.kw.term} » · seuil utile : première page, soit position 10.
        {b.perf.top10 > 0 && <> {b.perf.top10} requêtes secondaires sont aussi en première page.</>}
      </div>
      <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
        Mesuré {CT_MEASURE_DAYS} jours après publication — avant ce délai, un chiffre n’est pas interprétable.
      </div>
    </div>
  );
}

/* ── Clôture en preuve de valeur ── */

export function ProofClose({
  b,
  onDone,
  onSkip,
}: {
  b: BriefRecord;
  onDone: (text: string) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState(b.proofDraft);
  return (
    <div className="ct-proof">
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9 }}>
        <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoTrophy />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 3 }}>
            Article publié — en faire une preuve de valeur ?
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55 }}>
            Un article publié ne compte pour le client que s’il est raconté dans son rapport. Voici le libellé
            proposé par l’agent — relisez-le : c’est ce texte que le client lira, pas le titre de l’article.
          </div>
        </div>
      </div>
      <label className="lbl" htmlFor="ct-proof-t" style={{ display: 'block', marginBottom: 5 }}>
        Libellé client
      </label>
      <textarea id="ct-proof-t" className="fld-t" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="ct-ai" style={{ marginTop: 9 }}>
        <span style={{ color: 'var(--violet-fg)' }}>
          <IcoSpark size={13} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          Rédigé par l’agent à partir du brief. <b>La performance n’y figure pas</b> : elle sera ajoutée au rapport
          du mois suivant, quand les {CT_MEASURE_DAYS} jours de mesure seront écoulés.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 11, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-out" onClick={onSkip}>
          Pas de preuve pour cet article
        </button>
        <button type="button" className="btn-pri btn-main" style={{ width: 'auto' }} disabled={!text.trim()} onClick={() => onDone(text.trim())}>
          <IcoCheck />
          Créer la preuve de valeur
        </button>
      </div>
    </div>
  );
}
