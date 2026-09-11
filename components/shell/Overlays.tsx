'use client';

/**
 * Superpositions partagées du cockpit : recherche globale (⌘K) et panneau
 * de notifications (session 4.3). Montées une fois dans `AppShell`, pilotées
 * par contexte React plutôt que par la manipulation DOM du prototype —
 * l'app a de vrais composants React à câbler, pas une page statique.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  IcoAlert,
  IcoBell,
  IcoCard,
  IcoChart,
  IcoCheckAll,
  IcoClock,
  IcoCog,
  IcoDoc,
  IcoKey,
  IcoPin,
  IcoSend,
  IcoSpark,
  IcoSrch,
  IcoStar,
  IcoTaskCheck,
  IcoUser,
  IcoWarn,
  IcoX,
  IcoZap,
  type IconProps,
} from '@/components/ui/Icons';
import {
  HS_ACTIONS,
  HS_GROUPS,
  HS_GROUP_LABEL,
  HS_GROUP_OF,
  HS_INDEX,
  HS_TYPES,
  hsNorm,
  hsRecents,
  hsSearch,
  type SearchItem,
  type SearchType,
} from '@/lib/data/search';
import {
  HN_DAYS,
  HN_KINDS,
  HN_UNREAD_MAX,
  N_SCENARIOS,
  hnScenario,
  type Notif,
  type NotifKindId,
  type NotifScenario,
} from '@/lib/data/notifications';
import { DemoOnly } from '@/components/ui/Demo';
import { routes } from '@/lib/routes';

const TONE_VARS: Record<string, [string, string, string]> = {
  red: ['var(--o-red-m)', 'var(--o-red-b)', 'var(--o-red)'],
  yellow: ['var(--o-yellow-m)', 'var(--o-yellow-b)', 'var(--o-yellow)'],
  green: ['var(--o-green-m)', 'var(--o-green-b)', 'var(--o-green)'],
  blue: ['var(--o-blue-m)', 'var(--o-blue-b)', 'var(--o-blue)'],
  violet: ['var(--o-violet-m)', 'var(--o-violet-b)', 'var(--o-violet)'],
  neutral: ['var(--o-muted)', 'var(--o-bds)', 'var(--o-fg2)'],
};

const S_ICON: Record<SearchType, (p: IconProps) => React.ReactElement> = {
  action: IcoZap,
  client: IcoUser,
  prospect: IcoUser,
  tache: IcoTaskCheck,
  priorite: IcoAlert,
  motcle: IcoKey,
  rapport: IcoDoc,
  etab: IcoPin,
  facture: IcoCard,
};

const N_ICON: Record<NotifKindId, (p: IconProps) => React.ReactElement> = {
  integration: () => <IcoWarn size={13} />,
  position: IcoChart,
  sante: IcoAlert,
  facture: IcoCard,
  liens: IcoAlert,
  avis: IcoStar,
  rapport: IcoSend,
  deal: IcoStar,
  agent: IcoSpark,
};

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const HP_KEYHINT = IS_MAC ? '⌘ K' : 'Ctrl K';
const GRP_CAP = 4;
const RECENT_STORAGE_KEY = 'huntpilote-search-recents';

/* ── Contexte ── */

type OverlayState = 'search' | 'notif' | null;

type OverlayContextValue = {
  open: OverlayState;
  openSearch: () => void;
  openNotif: () => void;
  close: () => void;
  unreadCount: number;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlays(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlays doit être appelé sous OverlayProvider');
  return ctx;
}

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  try {
    const cur = readRecents().filter((x) => x !== id);
    cur.unshift(id);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(cur.slice(0, 8)));
  } catch {
    /* stockage indisponible : les récents restent vides */
  }
}

/** Vraiment consultés (localStorage) s'il y en a, sinon la sélection illustrative de `hsRecents()`. */
function getRecents(): SearchItem[] {
  const real = readRecents()
    .map((id) => HS_INDEX.find((x) => x.id === id))
    .filter((x): x is SearchItem => !!x);
  return real.length > 0 ? real : hsRecents();
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<OverlayState>(null);
  const [scenario, setScenario] = useState<NotifScenario>('normal');
  const [items, setItems] = useState<Notif[]>(() => hnScenario('normal'));
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hp-nf-scenario') as NotifScenario | null;
      if (stored) {
        setScenario(stored);
        setItems(hnScenario(stored));
      }
    } catch {
      /* stockage indisponible : reste sur le scénario normal */
    }
  }, []);

  const pickScenario = useCallback((s: NotifScenario) => {
    setScenario(s);
    setItems(hnScenario(s));
    setHiddenIds([]);
    try {
      localStorage.setItem('hp-nf-scenario', s);
    } catch {
      /* la sélection reste effective pour la session en cours */
    }
  }, []);

  const visibleItems = useMemo(() => items.filter((n) => !hiddenIds.includes(n.id)), [items, hiddenIds]);
  const unreadCount = useMemo(() => visibleItems.filter((n) => n.unread).length, [visibleItems]);

  const markAllRead = useCallback(() => setItems((is) => is.map((n) => ({ ...n, unread: false }))), []);
  const hideOne = useCallback((id: string) => setHiddenIds((h) => [...h, id]), []);
  const markRead = useCallback(
    (id: string) => setItems((is) => is.map((n) => (n.id === id ? { ...n, unread: false } : n))),
    [],
  );

  const openSearch = useCallback(() => setOpen('search'), []);
  const openNotif = useCallback(() => setOpen('notif'), []);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        setOpen((o) => (o === 'search' ? null : 'search'));
      } else if (k === 'escape') {
        setOpen(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<OverlayContextValue>(
    () => ({ open, openSearch, openNotif, close, unreadCount }),
    [open, openSearch, openNotif, close, unreadCount],
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {open && (
        <div id="hp-overlay-root">
          {open === 'search' && <GlobalSearch onClose={close} />}
          {open === 'notif' && (
            <NotifPanel
              onClose={close}
              scenario={scenario}
              onScenario={pickScenario}
              items={visibleItems}
              onMarkAllRead={markAllRead}
              onOpenOne={markRead}
              onHideOne={hideOne}
            />
          )}
        </div>
      )}
    </OverlayContext.Provider>
  );
}

/* ── Recherche globale ── */

function Mark({ text, q }: { text: string; q: string }) {
  const n = q.trim();
  if (!n) return <>{text}</>;
  const i = hsNorm(text).indexOf(hsNorm(n));
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + n.length)}</mark>
      {text.slice(i + n.length)}
    </>
  );
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const inpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inpRef.current?.focus();
  }, []);

  const { groups, flat, hidden } = useMemo(() => {
    const hits = q.trim() ? hsSearch(q) : [];
    const byGrp: Record<string, SearchItem[]> = {};
    (q.trim() ? hits : []).forEach((it) => {
      const g = HS_GROUP_OF(it.type);
      (byGrp[g] = byGrp[g] || []).push(it);
    });
    let gs: { key: string; label: string; all: SearchItem[] }[];
    if (!q.trim()) {
      gs = [
        { key: 'recent', label: 'Consultés récemment', all: getRecents() },
        { key: 'action', label: 'Actions rapides', all: HS_ACTIONS },
      ];
    } else {
      gs = HS_GROUPS.filter((g) => byGrp[g]?.length).map((g) => ({ key: g, label: HS_GROUP_LABEL[g], all: byGrp[g] }));
    }
    const out = gs.map((g) => ({ ...g, items: openGroups[g.key] ? g.all : g.all.slice(0, GRP_CAP) }));
    return {
      groups: out,
      flat: out.flatMap((g) => g.items),
      hidden: out.reduce((a, g) => a + (g.all.length - g.items.length), 0),
    };
  }, [q, openGroups]);

  useEffect(() => setIdx(0), [q]);
  useEffect(() => {
    const c = listRef.current;
    if (!c) return;
    const el = c.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
    if (!el) return;
    const top = el.offsetTop;
    const bot = top + el.offsetHeight;
    if (top < c.scrollTop) c.scrollTop = top - 28;
    else if (bot > c.scrollTop + c.clientHeight) c.scrollTop = bot - c.clientHeight + 8;
  }, [idx, groups]);

  const go = useCallback(
    (it: SearchItem | undefined) => {
      if (!it) return;
      if (it.type !== 'action') pushRecent(it.id);
      onClose();
      router.push(it.href);
    },
    [onClose, router],
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[idx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  let k = -1;
  return (
    <div className="hp-ovl" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hp-cmd" role="dialog" aria-modal="true" aria-label="Recherche globale">
        <div className="hp-cmd-top">
          <IcoSrch size={16} />
          <input
            ref={inpRef}
            className="hp-cmd-inp"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Chercher un client, une tâche, un mot-clé — ou lancer une action"
            aria-label="Recherche globale"
            role="combobox"
            aria-expanded="true"
            aria-controls="hp-cmd-results"
            autoComplete="off"
          />
          <button className="hp-kbd" onClick={onClose} style={{ cursor: 'pointer' }} type="button">
            Échap
          </button>
        </div>
        <div className="hp-cmd-list" id="hp-cmd-results" ref={listRef} style={{ position: 'relative' }} role="listbox">
          {flat.length === 0 ? (
            <div className="hp-none">
              <div className="hp-none-t">Aucun résultat pour « {q.trim()} »</div>
              <div className="hp-none-s">
                Rien dans les clients, les tâches, les priorités, les mots-clés suivis, les rapports, les
                établissements ni les factures.
              </div>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.key}>
                <div className="hp-grp">
                  <span className="hp-lbl">{g.label}</span>
                  <span className="hp-grp-n">{g.all.length}</span>
                </div>
                {g.items.map((it) => {
                  k += 1;
                  const my = k;
                  const t = it.type === 'action' ? HS_TYPES.action : HS_TYPES[it.type];
                  const Icon = S_ICON[it.type];
                  const [bg, bd, fg] = TONE_VARS[t.tone];
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className="hp-row"
                      data-idx={my}
                      role="option"
                      aria-selected={my === idx}
                      onMouseMove={() => setIdx(my)}
                      onClick={() => go(it)}
                    >
                      <span className="hp-row-ico" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>
                        <Icon size={13} />
                      </span>
                      <span className="hp-row-b">
                        <span className="hp-row-t">
                          <Mark text={it.label} q={q} />
                        </span>
                        {it.sub && <span className="hp-row-m">{it.sub}</span>}
                      </span>
                      <span className="hp-row-type">{t.label}</span>
                    </button>
                  );
                })}
                {g.all.length > g.items.length && (
                  <button
                    type="button"
                    className="hp-more"
                    onClick={() => setOpenGroups((o) => ({ ...o, [g.key]: true }))}
                  >
                    Voir les {g.all.length - g.items.length} autres résultats dans « {g.label} »
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="hp-cmd-foot">
          <span className="hp-hint">
            <span className="hp-kbd">↑ ↓</span> naviguer
          </span>
          <span className="hp-hint">
            <span className="hp-kbd">⏎</span> ouvrir
          </span>
          <span className="hp-hint">
            <span className="hp-kbd">Échap</span> fermer
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {q.trim() ? `${flat.length + hidden} résultat${flat.length + hidden > 1 ? 's' : ''}` : `${flat.length} suggestions`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Panneau de notifications ── */

function NotifPanel({
  onClose,
  scenario,
  onScenario,
  items,
  onMarkAllRead,
  onOpenOne,
  onHideOne,
}: {
  onClose: () => void;
  scenario: NotifScenario;
  onScenario: (s: NotifScenario) => void;
  items: Notif[];
  onMarkAllRead: () => void;
  onOpenOne: (id: string) => void;
  onHideOne: (id: string) => void;
}) {
  const router = useRouter();
  const unread = items.filter((n) => n.unread).length;

  const openOne = (n: Notif) => {
    if (n.gone) return;
    onOpenOne(n.id);
    if (n.href) {
      onClose();
      router.push(n.href);
    }
  };

  return (
    <div className="hp-ovl top-right" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hp-notif" role="dialog" aria-modal="true" aria-label="Notifications">
        <div className="hp-nf-top">
          <span className="hp-nf-title">Notifications</span>
          {unread > 0 && (
            <span className="hp-nf-count">
              {unread > HN_UNREAD_MAX ? `${HN_UNREAD_MAX}+` : unread} non lue{unread > 1 ? 's' : ''}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DemoOnly>
              <select
                className="hp-sel"
                value={scenario}
                onChange={(e) => onScenario(e.target.value as NotifScenario)}
                aria-label="État de démonstration"
              >
                {N_SCENARIOS.map(([id, l]) => (
                  <option key={id} value={id}>
                    {l}
                  </option>
                ))}
              </select>
            </DemoOnly>
            <button className="hp-x" onClick={onClose} aria-label="Fermer les notifications" type="button">
              <IcoX size={13} />
            </button>
          </div>
        </div>
        {items.length > 0 && (
          <div className="hp-nf-bar">
            <button className="hp-btn" onClick={onMarkAllRead} disabled={unread === 0} type="button">
              <IcoCheckAll size={12} />
              Tout marquer comme lu
            </button>
            <a href={routes.parametres('notifications')} className="hp-btn">
              <IcoCog size={12} />
              Réglages des notifications
            </a>
          </div>
        )}
        <div className="hp-nf-list">
          {items.length === 0 ? (
            <div className="hp-none">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'var(--o-fg4)' }}>
                <IcoBell size={15} />
              </div>
              <div className="hp-none-t">Aucune notification</div>
              <div className="hp-none-s">
                Les automatisations et l&apos;agent n&apos;ont rien signalé. Les chutes de position, les liens
                brisés, les avis négatifs et les jetons expirés arrivent ici.
              </div>
              <a href={routes.parametres('notifications')} className="hp-btn">
                <IcoCog size={12} />
                Réglages des notifications
              </a>
            </div>
          ) : (
            HN_DAYS.map(([day, label]) => {
              const group = items.filter((n) => n.day === day);
              if (!group.length) return null;
              const un = group.filter((n) => n.unread).length;
              return (
                <div key={day}>
                  <div className="hp-nf-day">
                    <span className="hp-lbl">{label}</span>
                    <span className="hp-grp-n">
                      {group.length}
                      {un > 0 ? ` · ${un} non lue${un > 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                  {group.map((n) => {
                    const kd = HN_KINDS[n.kind];
                    const Icon = N_ICON[n.kind];
                    const [bg, bd, fg] = TONE_VARS[kd.tone];
                    const crit = !!kd.crit && n.unread;
                    return (
                      <div
                        key={n.id}
                        className={`hp-nf${n.unread ? ' unread' : ''}${crit ? ' crit' : ''}${n.gone ? ' gone' : ''}`}
                        role={n.gone ? undefined : 'button'}
                        tabIndex={n.gone ? undefined : 0}
                        onClick={() => openOne(n)}
                        onKeyDown={(e) => {
                          if (!n.gone && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            openOne(n);
                          }
                        }}
                      >
                        <span className="hp-nf-ico" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>
                          <Icon size={13} />
                        </span>
                        <div className="hp-nf-b">
                          <div className="hp-nf-t">{n.title}</div>
                          <div className="hp-nf-x">{n.gone ? n.goneNote : n.body}</div>
                          <div className="hp-nf-meta">
                            {crit && (
                              <span className="hp-nf-tag">
                                <IcoWarn size={9} />
                                Critique
                              </span>
                            )}
                            <span style={{ fontWeight: 700 }}>{kd.label}</span>
                            <span>·</span>
                            <span>{kd.source}</span>
                            <span>·</span>
                            <span>{n.at}</span>
                          </div>
                          {n.gone ? (
                            <button
                              className="hp-btn"
                              style={{ marginTop: 7 }}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onHideOne(n.id);
                              }}
                            >
                              Masquer cette notification
                            </button>
                          ) : (
                            n.cta && <span className="hp-nf-cta">{n.cta}</span>
                          )}
                        </div>
                        {n.unread && <span className="hp-nf-dot" aria-label="Non lue" />}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="hp-nf-foot">
            <span style={{ fontSize: '0.5625rem', color: 'var(--o-fg3)', lineHeight: 1.6 }}>
              Chaque notification mène à son objet. Les critiques portent une étiquette, pas seulement une couleur.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
