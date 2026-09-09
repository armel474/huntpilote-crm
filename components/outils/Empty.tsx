/**
 * Bloc générique d'état vide/chargement des écrans d'outils — le motif
 * (titre, description centrée, geste) revient identique d'un outil à
 * l'autre ; le texte, lui, reste propre à chaque outil.
 */
import { IcoCheck } from '@/components/ui/Icons';

export function EmptyBlock({
  title,
  children,
  tone,
  actions,
}: {
  title: string;
  children?: React.ReactNode;
  /** `'sain'` colore le bloc en vert — rien à corriger, une bonne nouvelle. `'erreur'` en rouge. */
  tone?: 'sain' | 'erreur';
  actions?: React.ReactNode;
}) {
  const style =
    tone === 'sain'
      ? { borderColor: 'var(--green-b)', background: 'var(--green-m)' }
      : tone === 'erreur'
        ? { borderColor: 'var(--red-b)' }
        : undefined;

  return (
    <div className="empty" style={style}>
      {tone === 'sain' ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span className="crit-ico" data-st="ok">
            <IcoCheck />
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</span>
        </div>
      ) : (
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>{title}</div>
      )}
      {children && (
        <div
          style={{
            fontSize: '0.6875rem',
            color: 'var(--fg2)',
            lineHeight: 1.5,
            maxWidth: '30rem',
            margin: actions ? '0 auto 10px' : '0 auto',
          }}
        >
          {children}
        </div>
      )}
      {actions && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>{actions}</div>
      )}
    </div>
  );
}

/** Silhouette animée pendant le chargement — jamais un simple message. */
export function LoadingSkeleton({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }} aria-live="polite">
      <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skel" style={{ height: 44, opacity: 1 - i * 0.18 }} />
      ))}
    </div>
  );
}
