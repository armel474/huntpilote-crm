import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';

/**
 * Écran d'attente pour les entrées de navigation qui n'ont pas encore
 * été conçues dans Claude Design. Évite un lien mort dans la sidebar.
 */
export function ComingSoon({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <AppShell header={<CRMHeader title={title} subtitle={subtitle} period="" />}>
      <div
        className="content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 12,
        }}
      >
        <div
          className="card"
          style={{ padding: '2.5rem 2rem', maxWidth: 460 }}
        >
          <div
            className="lbl"
            style={{ color: 'var(--accent)', marginBottom: 10 }}
          >
            À concevoir
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--fg3)',
              lineHeight: 1.6,
              marginTop: 8,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
