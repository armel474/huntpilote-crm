/**
 * États système — chargement, vide, erreur, permission (session 6.2).
 *
 * Vocabulaire visuel unique, réutilisable sur tout écran du cockpit.
 * Aucune donnée ici : chaque écran passe ses propres textes, seuils et gestes.
 */
import {
  IcoClock,
  IcoDoc,
  IcoLock,
  IcoPlug,
  IcoSpin,
  IcoSrch,
  IcoTrophy,
  IcoWarn,
} from '@/components/ui/Icons';

/* ── Squelettes : la forme du contenu attendu, pas un tourniquet ── */

export function SkelLine({
  w = '100%',
  h = 11,
  style,
}: {
  w?: number | string;
  h?: number;
  style?: React.CSSProperties;
}) {
  return <div className="hs-skel hs-line" style={{ width: w, height: h, ...style }} />;
}

export function SkelCircle({ s = 28 }: { s?: number }) {
  return <div className="hs-skel hs-circle" style={{ width: s, height: s }} />;
}

export function SkelRow() {
  return (
    <div className="hs-row">
      <SkelCircle />
      <div className="hs-row-b">
        <SkelLine w="46%" />
        <SkelLine w="72%" h={9} />
      </div>
      <SkelLine w={60} h={20} style={{ borderRadius: 999, flexShrink: 0 }} />
    </div>
  );
}

export function SkelList({ n = 4 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[...Array(n)].map((_, i) => (
        <SkelRow key={i} />
      ))}
    </div>
  );
}

export function SkelKpiCard() {
  return (
    <div className="hs-card hs-kpi">
      <SkelLine w="55%" h={9} />
      <SkelLine w="35%" h={22} />
      <SkelLine w="80%" h={9} />
    </div>
  );
}

export function SkelKpiRow({ n = 3 }: { n?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n},minmax(0,1fr))`, gap: 8 }}>
      {[...Array(n)].map((_, i) => (
        <SkelKpiCard key={i} />
      ))}
    </div>
  );
}

export function SkelTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="hs-card" style={{ padding: '0.5rem 1rem 0.875rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`, gap: '8px 14px' }}>
        {[...Array(rows * cols)].map((_, i) => (
          <SkelLine key={i} w={i % cols === 0 ? '85%' : '55%'} style={{ margin: '9px 0' }} />
        ))}
      </div>
    </div>
  );
}

/* ── Vide : trois traitements, jamais le même vide ── */

export function EmptyInitial({
  icon = <IcoDoc size={20} />,
  title,
  text,
  primaryLabel,
  onPrimary,
  primaryHref,
  secondaryLabel,
  onSecondary,
}: {
  icon?: React.ReactNode;
  title: string;
  text?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryHref?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="hs-empty">
      <div className="hs-empty-ico">{icon}</div>
      <div className="hs-empty-t">{title}</div>
      {text && <div className="hs-empty-s">{text}</div>}
      <div className="hs-empty-actions">
        {primaryLabel &&
          (primaryHref ? (
            <a href={primaryHref} className="btn-pri" style={{ textDecoration: 'none' }}>
              {primaryLabel}
            </a>
          ) : (
            <button type="button" className="btn-pri" onClick={onPrimary}>
              {primaryLabel}
            </button>
          ))}
        {secondaryLabel && (
          <button type="button" className="btn-out" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyFilter({
  title = 'Aucun résultat pour ces filtres',
  text,
  onReset,
}: {
  title?: string;
  text?: string;
  onReset?: () => void;
}) {
  return (
    <div className="hs-emptyfilter">
      <span className="hs-emptyfilter-ico">
        <IcoSrch size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="hs-emptyfilter-t">{title}</div>
        {text && <div className="hs-emptyfilter-s">{text}</div>}
      </div>
      {onReset && (
        <button type="button" className="btn-out" style={{ fontSize: '0.6875rem', flexShrink: 0 }} onClick={onReset}>
          Élargir les filtres
        </button>
      )}
    </div>
  );
}

export function EmptyHealthy({
  icon = <IcoTrophy size={18} />,
  title,
  text,
}: {
  icon?: React.ReactNode;
  title: string;
  text?: string;
}) {
  return (
    <div className="hs-healthy">
      <span className="hs-healthy-ico">{icon}</span>
      <div>
        <div className="hs-healthy-t">{title}</div>
        {text && <div className="hs-healthy-s">{text}</div>}
      </div>
    </div>
  );
}

/* ── Erreur : ce qui s'est passé, comment le réparer ── */

export function ErrorLoad({
  what,
  why,
  onRetry,
  retrying,
}: {
  what: string;
  why: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div className="hs-err">
      <span className="hs-err-ico">
        <IcoWarn size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="hs-err-t">Impossible de charger {what}</div>
        <div className="hs-err-s">{why}</div>
        <div className="hs-err-actions">
          <button type="button" className="btn-out" onClick={onRetry} disabled={retrying}>
            <IcoSpin size={12} />
            {retrying ? 'Nouvelle tentative…' : 'Réessayer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorPartial({ available, missing, why }: { available: string; missing: string; why: string }) {
  return (
    <div className="hs-partial">
      <span className="hs-partial-ico">
        <IcoWarn size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.55 }}>
        <b>{available}</b> affiché ci-dessous. <b>{missing}</b> indisponible — {why}
      </div>
    </div>
  );
}

export function ErrorIntegration({
  service,
  client,
  reconnectHref = '/parametres',
}: {
  service: string;
  client?: string;
  reconnectHref?: string;
}) {
  return (
    <div className="hs-integ">
      <span className="hs-integ-ico">
        <IcoPlug size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
          <span className="hs-integ-t" style={{ marginBottom: 0 }}>
            {service} n&apos;est plus connecté{client ? ` — ${client}` : ''}
          </span>
          <span className="hs-integ-tag">Silencieux sinon</span>
        </div>
        <div className="hs-integ-s">
          Le jeton d&apos;accès a expiré. Tant qu&apos;il n&apos;est pas reconnecté, les chiffres qui en
          dépendent restent figés à leur dernière valeur connue — sans le dire.
        </div>
        <div className="hs-err-actions">
          <a href={reconnectHref} className="btn-out" style={{ textDecoration: 'none' }}>
            Reconnecter {service}
          </a>
        </div>
      </div>
    </div>
  );
}

export function ErrorStale({
  at,
  ageLabel,
  thresholdLabel,
  onRefresh,
  refreshing,
}: {
  at: string;
  ageLabel: string;
  thresholdLabel: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="hs-stale">
      <span className="hs-stale-ico">
        <IcoClock size={15} />
      </span>
      <div style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', color: 'var(--fg2)' }}>
        <b>Données du {at}</b> — {ageLabel}, seuil de fraîcheur : {thresholdLabel}.
      </div>
      <button
        type="button"
        className="btn-out"
        style={{ fontSize: '0.6875rem', flexShrink: 0 }}
        onClick={onRefresh}
        disabled={refreshing}
      >
        <IcoSpin size={12} />
        {refreshing ? 'Actualisation…' : 'Actualiser'}
      </button>
    </div>
  );
}

/* ── Permission ── */

export function PermissionBlocked({
  action,
  allowedRoles = [],
  onAsk,
}: {
  action: string;
  allowedRoles?: string[];
  onAsk?: () => void;
}) {
  return (
    <div className="hs-perm">
      <div className="hs-perm-ico">
        <IcoLock size={20} />
      </div>
      <div className="hs-perm-t">Accès restreint</div>
      <div className="hs-perm-s">Votre rôle ne permet pas de {action}. Cette action est réservée à :</div>
      <div className="hs-perm-roles">
        {allowedRoles.map((r) => (
          <span key={r} className="hs-perm-role">
            {r}
          </span>
        ))}
      </div>
      <button type="button" className="btn-out" onClick={onAsk}>
        Demander l&apos;accès
      </button>
    </div>
  );
}
