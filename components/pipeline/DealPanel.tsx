'use client';

/**
 * Panneau de détail d'un deal — session 4.4.
 *
 * Ouvert depuis une carte du Kanban, en panneau latéral : le tableau reste
 * visible derrière le voile. Porte l'historique des échanges, les
 * documents, la prochaine action et l'instantané SEO du prospect (non
 * historisé — même convention que les autres outils sur un compte
 * prospect), plus le geste qui compte : « Marquer gagné » annonce ce qu'il
 * va créer avant de le déclencher.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, toneColors } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoChart,
  IcoClock,
  IcoDoc,
  IcoMail,
  IcoPen,
  IcoPhone,
  IcoPlus,
  IcoTrophy,
  IcoUsers,
  IcoWarn,
  IcoX,
  type IconProps,
} from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  CHANNELS,
  DORMANT_DAYS,
  LOST_REASONS,
  OWNERS,
  SNAPSHOT_PURGE_DAYS,
  STAGES,
  WON_EFFECTS,
  dealDetail,
  fmt,
  type Deal,
  type Exchange,
  type ExchangeChannel,
} from '@/lib/data/pipeline';

const CHANNEL_ICON: Record<ExchangeChannel, (p: IconProps) => React.ReactElement> = {
  appel: IcoPhone,
  courriel: IcoMail,
  reunion: IcoUsers,
  note: IcoPen,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dl-field">
      <span className="dl-field-l">{label}</span>
      <span className="dl-field-v">{children}</span>
    </div>
  );
}

function Section({
  title,
  sub,
  right,
  children,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="dl-sec">
      <div className="dl-sec-h">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lbl">{title}</div>
          {sub && (
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.45 }}>
              {sub}
            </div>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ── Consigner un échange ── */
function LogExchangeForm({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (ex: { ch: ExchangeChannel; text: string }) => void;
}) {
  const [ch, setCh] = useState<ExchangeChannel>('appel');
  const [text, setText] = useState('');
  return (
    <div className="dl-form">
      <div className="chips" style={{ marginBottom: 7 }}>
        {(Object.keys(CHANNELS) as ExchangeChannel[]).map((id) => (
          <button
            key={id}
            type="button"
            className="chip"
            data-on={ch === id}
            onClick={() => setCh(id)}
          >
            {CHANNELS[id].label}
          </button>
        ))}
      </div>
      <textarea
        className="dl-ta"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Ce qui s’est dit, et ce qui bloque encore."
        aria-label="Contenu de l’échange"
      />
      <div style={{ display: 'flex', gap: 7, marginTop: 7, justifyContent: 'flex-end' }}>
        <button className="btn-out" type="button" style={{ fontSize: '0.625rem' }} onClick={onCancel}>
          Annuler
        </button>
        <button
          className="btn-out"
          type="button"
          style={{ fontSize: '0.625rem' }}
          disabled={!text.trim()}
          onClick={() => onAdd({ ch, text: text.trim() })}
        >
          Consigner l’échange
        </button>
      </div>
    </div>
  );
}

/* ── Confirmation « gagné » ── */
function WonConfirm({
  deal,
  onCancel,
  onConfirm,
}: {
  deal: Deal;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dl-confirm">
      <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 9 }}>
        <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoTrophy size={13} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 3 }}>
            Marquer « {deal.company} » comme gagné
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
            Ce geste ne change pas seulement l’étape du Kanban. Voici ce qui sera créé immédiatement :
          </div>
        </div>
      </div>
      <ul className="dl-effects">
        {WON_EFFECTS.map(([what, how]) => (
          <li key={what}>
            <IcoCheck />
            <span>
              <b>{what}</b> — {how}
            </span>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 11 }}>
        <button className="btn-out" type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
      <button className="btn-pri btn-main" type="button" style={{ marginTop: 9 }} onClick={onConfirm}>
        <IcoTrophy size={13} />
        Créer le client et lancer l’onboarding
      </button>
    </div>
  );
}

/* ── Confirmation « perdu » ── */
function LostConfirm({
  deal,
  onCancel,
  onConfirm,
}: {
  deal: Deal;
  onCancel: () => void;
  onConfirm: (reason: string, note: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  return (
    <div className="dl-confirm lost">
      <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 9 }}>
        <span style={{ color: 'var(--red)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoWarn size={13} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 3 }}>
            Marquer « {deal.company} » comme perdu
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
            Le motif est obligatoire — c’est lui qui alimente le taux de conversion par cause.
            L’instantané SEO du prospect sera purgé {SNAPSHOT_PURGE_DAYS} jours après la perte,
            conformément à la politique de conservation.
          </div>
        </div>
      </div>
      <div className="chips">
        {LOST_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            className="chip"
            data-on={reason === r}
            onClick={() => setReason(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <textarea
        className="dl-ta"
        style={{ marginTop: 8 }}
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Précision facultative — ce qui aurait pu changer l’issue."
        aria-label="Précision sur la perte"
      />
      <div style={{ display: 'flex', gap: 7, marginTop: 9, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn-out" type="button" onClick={onCancel}>
          Annuler
        </button>
        <button
          className="btn-out"
          type="button"
          style={{ borderColor: 'var(--red-b)', color: 'var(--red)' }}
          disabled={!reason}
          onClick={() => onConfirm(reason, note)}
        >
          Marquer perdu
        </button>
      </div>
    </div>
  );
}

export function DealPanel({
  deal,
  onClose,
  onWin,
  onLose,
  onLog,
}: {
  deal: Deal | null;
  onClose: () => void;
  onWin: (id: number) => void;
  onLose: (id: number, reason: string, note: string) => void;
  onLog: (id: number, exchange: Exchange) => void;
}) {
  const [mode, setMode] = useState<null | 'log' | 'won' | 'lost'>(null);

  useEffect(() => {
    setMode(null);
  }, [deal?.id]);

  useEffect(() => {
    if (!deal) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deal, onClose]);

  if (!deal) return null;

  const d = dealDetail(deal);
  const stage = STAGES.find((s) => s.id === deal.stage) ?? STAGES[0];
  const owner = OWNERS[deal.owner];
  const isWon = deal.stage === 'gagne';
  const isLost = !!deal.lost;
  const dormant = deal.days >= DORMANT_DAYS && !isWon && !isLost;
  const history = [...(deal.extraHistory ?? []), ...d.history];

  return (
    <>
      <div className="dl-scrim" onClick={onClose} />
      <aside className="dl-sheet" role="dialog" aria-modal="true" aria-label={`Détail du deal ${deal.company}`}>
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {deal.company}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 3 }}>
              {deal.sector} · {d.site} ·{' '}
              {d.createdAt ? `créé le ${d.createdAt}` : `au pipeline depuis ${d.age ?? deal.days} jours`}
            </div>
          </div>
          <button className="btn-icon" type="button" onClick={onClose} aria-label="Fermer le panneau">
            <IcoX size={13} />
          </button>
        </div>

        <div className="dl-body">
          {isWon && (
            <div className="dl-banner green">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoTrophy size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b>Deal gagné{d.wonAt ? ` le ${d.wonAt}` : ' à l’instant'} — onboarding lancé.</b> Le
                client existe dans le Client hub, l’onboarding en 4 étapes est assigné à {owner.name} et
                le premier audit est planifié.
                <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                  <Link href={routes.onboarding()} className="btn-out" style={{ fontSize: '0.625rem', textDecoration: 'none' }}>
                    Ouvrir l’onboarding
                    <IcoArrowR size={12} />
                  </Link>
                  <Link
                    href={routes.clients()}
                    className="btn-out"
                    style={{ fontSize: '0.625rem', textDecoration: 'none' }}
                  >
                    Ouvrir le Client hub
                    <IcoArrowR size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}
          {isLost && deal.lost && (
            <div className="dl-banner red">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoWarn size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b>Deal perdu — motif : {deal.lost.reason}.</b>
                {deal.lost.note ? ` ${deal.lost.note}` : ''} L’instantané SEO du prospect sera purgé
                dans {SNAPSHOT_PURGE_DAYS} jours, conformément à la politique de conservation.
              </div>
            </div>
          )}
          {dormant && (
            <div className="dl-banner yellow">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <IcoClock size={13} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b>
                  Dormant depuis {deal.days} jours dans l’étape « {stage.label} »
                </b>{' '}
                — seuil de vigilance : {DORMANT_DAYS} jours. Dernier échange consigné le{' '}
                {history[0]?.at ?? '—'}.
              </div>
            </div>
          )}

          <Section
            title="Le deal"
            right={
              <Badge
                label={stage.label}
                tone={
                  deal.stage === 'gagne'
                    ? 'green'
                    : deal.stage === 'negociation'
                      ? 'yellow'
                      : deal.stage === 'proposition'
                        ? 'blue'
                        : 'neutral'
                }
              />
            }
          >
            <div className="dl-kpis">
              <div className="dl-kpi">
                <span className="dl-kpi-v">{fmt(deal.mrr)} $</span>
                <span className="dl-kpi-l">MRR proposé · par mois</span>
              </div>
              <div className="dl-kpi">
                <span className="dl-kpi-v">{deal.prob} %</span>
                <span className="dl-kpi-l">Probabilité · seuil de prévision : 50 %</span>
              </div>
              <div className="dl-kpi">
                <span className="dl-kpi-v" style={dormant ? { color: 'var(--yellow-fg)' } : undefined}>
                  {deal.days} j
                </span>
                <span className="dl-kpi-l">Dans l’étape · seuil : {DORMANT_DAYS} j</span>
              </div>
            </div>
            <div className="dl-fields">
              <Field label="Services envisagés">
                <span className="chips">
                  {deal.services.map((s) => (
                    <span key={s} className="chip" style={{ cursor: 'default' }}>
                      {s}
                    </span>
                  ))}
                </span>
              </Field>
              <Field label="Responsable">{owner.name}</Field>
              <Field label="Contact">
                {d.contact}
                {d.role ? ` · ${d.role}` : ''}
              </Field>
              <Field label="Coordonnées">
                {d.email || d.phone ? (
                  <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {d.email && (
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        <IcoMail size={11} />
                        {d.email}
                      </span>
                    )}
                    {d.phone && (
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        <IcoPhone size={11} />
                        {d.phone}
                      </span>
                    )}
                  </span>
                ) : (
                  <span style={{ color: 'var(--fg3)' }}>Non renseignées</span>
                )}
              </Field>
            </div>
          </Section>

          <Section
            title="Prochaine action"
            sub={isWon || isLost ? 'Le deal est clos : plus aucune action commerciale attendue.' : undefined}
          >
            {isWon || isLost ? (
              <div className="empty" style={{ textAlign: 'left' }}>
                Aucune action en attente.
              </div>
            ) : (
              <div className="dl-next">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35 }}>{deal.next}</div>
                  <div
                    style={{
                      fontSize: '0.5625rem',
                      color: 'var(--fg3)',
                      marginTop: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <IcoClock size={11} />
                    {d.nextAt}
                  </div>
                </div>
                <Link
                  href={routes.agenda()}
                  className="btn-out"
                  style={{ fontSize: '0.625rem', textDecoration: 'none' }}
                >
                  Voir dans l’agenda
                  <IcoArrowR size={12} />
                </Link>
              </div>
            )}
          </Section>

          <Section
            title="Historique des échanges"
            sub={`${history.length} échange${history.length > 1 ? 's' : ''} consigné${history.length > 1 ? 's' : ''}`}
            right={
              mode !== 'log' && (
                <button className="btn-out" type="button" style={{ fontSize: '0.625rem' }} onClick={() => setMode('log')}>
                  <IcoPlus size={11} />
                  Consigner un échange
                </button>
              )
            }
          >
            {mode === 'log' && (
              <LogExchangeForm
                onCancel={() => setMode(null)}
                onAdd={(ex) => {
                  onLog(deal.id, { ...ex, at: 'à l’instant', who: owner.name });
                  setMode(null);
                }}
              />
            )}
            <div className="dl-timeline">
              {history.map((h, i) => {
                const meta = CHANNELS[h.ch];
                const Icon = CHANNEL_ICON[h.ch];
                const { bg, border, fg } = toneColors(meta.tone);
                return (
                  <div key={i} className="dl-tl-row">
                    <span className="dl-tl-i" style={{ background: bg, border: `1px solid ${border}`, color: fg }}>
                      <Icon size={11} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 800 }}>{meta.label}</span>
                        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>
                          {h.at} · {h.who}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 2 }}>
                        {h.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Documents" sub={d.docs.length ? undefined : 'Aucun devis ni proposition pour l’instant.'}>
            {d.docs.length === 0 ? (
              <div className="empty" style={{ textAlign: 'left' }}>
                Rien à montrer. Le premier document arrive avec la proposition.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {d.docs.map((doc) => (
                  <div key={doc.name} className="dl-doc">
                    <span className="dl-doc-i">
                      <IcoDoc size={12} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="dl-doc-t">{doc.name}</span>
                      <span className="dl-doc-m">
                        {doc.kind} · {doc.at}
                        {doc.auto ? ' · généré depuis Organic Research' : ''}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Données SEO du prospect"
            sub={
              d.seo.done
                ? `Instantané du ${d.seo.at} — non historisé : il ne sera pas comparé dans le temps tant que le deal n’est pas gagné.`
                : undefined
            }
          >
            {!d.seo.done ? (
              <div className="empty" style={{ textAlign: 'left' }}>
                Aucun Domain Overview n’a été fait sur ce prospect.
                <div style={{ marginTop: 8 }}>
                  <Link
                    href={routes.outil('domain-overview')}
                    className="btn-out"
                    style={{ fontSize: '0.625rem', textDecoration: 'none' }}
                  >
                    <IcoChart size={12} />
                    Lancer un instantané
                    <IcoArrowR size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="dl-kpis">
                  <div className="dl-kpi">
                    <span className="dl-kpi-v">{d.seo.authority}</span>
                    <span className="dl-kpi-l">Autorité de domaine · /100</span>
                  </div>
                  <div className="dl-kpi">
                    <span className="dl-kpi-v">{d.seo.keywords}</span>
                    <span className="dl-kpi-l">Mots-clés positionnés</span>
                  </div>
                  <div className="dl-kpi">
                    <span className="dl-kpi-v">{d.seo.traffic}</span>
                    <span className="dl-kpi-l">Visites organiques / mois</span>
                  </div>
                  <div className="dl-kpi">
                    <span className="dl-kpi-v">{d.seo.top10}</span>
                    <span className="dl-kpi-l">Mots-clés en première page</span>
                  </div>
                </div>
                <div className="dl-note">
                  Cet instantané n’est pas historisé : il photographie {d.seo.domain} au {d.seo.at} et rien
                  d’autre. Le suivi dans le temps commence à la signature.
                </div>
                <Link
                  href={routes.outil('domain-overview')}
                  className="btn-out"
                  style={{ fontSize: '0.625rem', marginTop: 8, textDecoration: 'none' }}
                >
                  <IcoChart size={12} />
                  Ouvrir l’instantané
                  <IcoArrowR size={12} />
                </Link>
              </>
            )}
          </Section>
        </div>

        <div className="dl-foot">
          {mode === 'won' ? (
            <WonConfirm
              deal={deal}
              onCancel={() => setMode(null)}
              onConfirm={() => {
                onWin(deal.id);
                setMode(null);
              }}
            />
          ) : mode === 'lost' ? (
            <LostConfirm
              deal={deal}
              onCancel={() => setMode(null)}
              onConfirm={(reason, note) => {
                onLose(deal.id, reason, note);
                setMode(null);
              }}
            />
          ) : isWon || isLost ? (
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
              Deal clos. Il reste au journal du pipeline et compte dans le taux de conversion.
            </div>
          ) : (
            <>
              <button className="btn-pri btn-main" type="button" onClick={() => setMode('won')}>
                <IcoTrophy size={13} />
                Marquer gagné
              </button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                <button className="btn-out" type="button" onClick={() => setMode('lost')}>
                  Marquer perdu
                </button>
                <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', flex: '1 1 140px', lineHeight: 1.45 }}>
                  « Gagné » crée le client et lance l’onboarding — la conséquence est détaillée avant
                  confirmation.
                </span>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
