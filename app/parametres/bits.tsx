'use client';

/** Petites pièces partagées par les sections des paramètres. */
import type { ActionState } from '@/app/parametres/actions';
import { IcoCheck, IcoWarn } from '@/components/ui/Icons';

export function Field({
  label,
  children,
  span,
  htmlFor,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : 'auto' }}>
      <label htmlFor={htmlFor} className="lbl" style={{ display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export function SectionHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{title}</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 3 }}>{sub}</p>
      </div>
      {action}
    </div>
  );
}

/** Le résultat d'une action serveur, ou un avertissement : une ligne, une icône. */
export function Notice({
  state,
  tone,
  children,
}: {
  state?: ActionState;
  tone?: 'err' | 'ok' | 'warn';
  children?: React.ReactNode;
}) {
  const t = tone ?? (state ? (state.ok ? 'ok' : 'err') : 'warn');
  const body = children ?? state?.message;
  if (!body) return null;
  return (
    <div className={`st-msg ${t}`} role={t === 'err' ? 'alert' : 'status'}>
      <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>
        {t === 'ok' ? <IcoCheck size={14} /> : <IcoWarn size={14} />}
      </span>
      <span>{body}</span>
    </div>
  );
}

/** Une boîte de dialogue au-dessus de la page ; Échap ou le fond la ferment. */
export function Dialog({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="hp-ovl"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className={`st-dlg${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="st-dlg-top">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', flex: 1 }}>{title}</h3>
          <button className="hp-x" onClick={onClose} aria-label="Fermer" type="button">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
