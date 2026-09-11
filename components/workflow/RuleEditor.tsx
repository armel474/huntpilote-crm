'use client';

/**
 * Éditeur d'automatisation — session 4.4.
 *
 * Constructeur de règle linéaire (pas un flux à nœuds : ces règles sont
 * linéaires, une phrase suffit) : Quand → Si → Alors, aperçu en langage
 * naturel, test à blanc obligatoire avant activation, journal d'exécution
 * rejouable. Remplace la liste dans la même page — pas de nouvelle route.
 */
import { useState } from 'react';
import {
  IcoArrowL,
  IcoArrowR,
  IcoBell,
  IcoCal,
  IcoCard,
  IcoChart,
  IcoCheck,
  IcoDoc,
  IcoLink,
  IcoPause,
  IcoPin,
  IcoPlay,
  IcoPlus,
  IcoSend,
  IcoSpin,
  IcoSrch,
  IcoStar,
  IcoTarget,
  IcoWarn,
  IcoX,
  type IconProps,
} from '@/components/ui/Icons';
import { Lbl } from '@/components/ui/Atoms';
import { DemoOnly } from '@/components/ui/Demo';
import { routes } from '@/lib/routes';
import {
  ACTIONS,
  COND_KINDS,
  DEMO_STATES,
  DIMS,
  DRY_MAX,
  FAIL_MAX,
  FORFAITS,
  RULE_CLIENTS,
  SEVS,
  TEAM_NAMES,
  TRIGGERS,
  applyDemoState,
  dryRun,
  pruneConds,
  ruleSentence,
  type ActionId,
  type Cond,
  type CondKind,
  type CondValue,
  type DemoStateId,
  type DryResult,
  type GlyphName,
  type LogEntry,
  type Rule,
  type TriggerId,
} from '@/lib/data/workflow';

const GLYPH: Record<GlyphName, (p: IconProps) => React.ReactElement> = {
  warn: IcoWarn,
  cal: IcoCal,
  clock: IcoChart,
  trophy: IcoTarget,
  link: IcoLink,
  bolt: IcoChart,
  task: IcoCheck,
  doc: IcoDoc,
  mail: IcoSend,
  chart: IcoChart,
  star: IcoStar,
  bill: IcoCard,
  pin: IcoPin,
  bell: IcoBell,
  send: IcoSend,
  search: IcoSrch,
};

const STATUS_META: Record<Rule['status'], [string, 'green' | 'yellow' | 'red' | 'neutral', (p: IconProps) => React.ReactElement]> = {
  active: ['Active', 'green', IcoCheck],
  pause: ['En pause', 'yellow', IcoPause],
  echec: ['En échec répété', 'red', IcoWarn],
  brouillon: ['Brouillon — jamais activée', 'neutral', IcoDoc],
};

const TONE_CSS: Record<'green' | 'yellow' | 'red' | 'neutral', [string, string, string]> = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'],
  yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'],
  neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'],
};

function Pill({ label, tone, icon }: { label: string; tone: 'green' | 'yellow' | 'red' | 'neutral'; icon?: React.ReactNode }) {
  const [bg, bd, fg] = TONE_CSS[tone];
  return (
    <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {icon}
      {label}
    </span>
  );
}

/* ── Section numérotée ── */
function EditorSection({
  step,
  title,
  sub,
  right,
  tone = 'neutral',
  children,
}: {
  step: React.ReactNode;
  title: string;
  sub?: string;
  right?: React.ReactNode;
  tone?: 'green' | 'yellow' | 'red' | 'neutral' | 'blue' | 'violet';
  children: React.ReactNode;
}) {
  const toneCss: Record<string, [string, string, string]> = {
    ...TONE_CSS,
    blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
    violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'],
  };
  const [bg, bd, fg] = toneCss[tone];
  return (
    <div className="card ar-sec">
      <div className="ar-sec-h">
        <span className="ar-step" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}>
          {step}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>
          {sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ── Quand ── */
function TriggerPicker({ rule, set }: { rule: Rule; set: (fn: (r: Rule) => Rule) => void }) {
  const t = rule.trigger ? TRIGGERS[rule.trigger] : null;
  const p = t?.param;
  const val = p ? (rule.params[p.key] !== undefined ? rule.params[p.key] : p.def) : null;
  return (
    <EditorSection step="1" tone="blue" title="Quand" sub="Un seul déclencheur par règle, choisi parmi ce que l’application sait produire.">
      <div className="ar-grid">
        {(Object.entries(TRIGGERS) as [TriggerId, (typeof TRIGGERS)[TriggerId]][]).map(([id, tr]) => {
          const G = GLYPH[tr.icon];
          const on = rule.trigger === id;
          return (
            <button
              key={id}
              type="button"
              className="ar-opt"
              data-on={on}
              aria-pressed={on}
              onClick={() =>
                set((r) => ({ ...r, trigger: id, params: { [tr.param.key]: tr.param.def }, conds: pruneConds(r.conds, id) }))
              }
            >
              <span className="ar-opt-i">
                <G />
              </span>
              <span className="ar-opt-t">{tr.label}</span>
              {on && (
                <span className="ar-opt-c">
                  <IcoCheck />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {t && p && (
        <div className="ar-param">
          <label htmlFor="ar-p">{p.label}</label>
          {p.options ? (
            <select
              id="ar-p"
              className="sel"
              value={val as string}
              onChange={(e) => set((r) => ({ ...r, params: { ...r.params, [p.key]: e.target.value } }))}
            >
              {p.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                id="ar-p"
                type="range"
                min={p.min}
                max={p.max}
                value={val as number}
                onChange={(e) => set((r) => ({ ...r, params: { ...r.params, [p.key]: Number(e.target.value) } }))}
                style={{ flex: 1, minWidth: 120, accentColor: 'var(--accent)' }}
              />
              <span className="ar-param-v">
                {val} {p.unit}
              </span>
            </>
          )}
        </div>
      )}
      {!rule.trigger && <div className="ar-todo">Choisissez un déclencheur pour continuer.</div>}
    </EditorSection>
  );
}

/* ── Si ── */
function CondEditor({ rule, set }: { rule: Rule; set: (fn: (r: Rule) => Rule) => void }) {
  const [adding, setAdding] = useState(false);
  const used = rule.conds.map((c) => c.kind);
  const add = (kind: CondKind) => {
    const k = COND_KINDS[kind];
    const value: CondValue = k.kind === 'clients' || k.kind === 'forfait' ? [] : k.kind === 'dim' ? DIMS[1] : k.kind === 'nombre' ? (k.def ?? 500) : true;
    set((r) => ({ ...r, conds: [...r.conds, { kind, value }] }));
    setAdding(false);
  };
  const upd = (i: number, value: CondValue) => set((r) => ({ ...r, conds: r.conds.map((c, j) => (j === i ? { ...c, value } : c)) }));
  const del = (i: number) => set((r) => ({ ...r, conds: r.conds.filter((_, j) => j !== i) }));
  const available = (Object.keys(COND_KINDS) as CondKind[]).filter((id) => !used.includes(id) && condAllowedFor(id, rule.trigger));

  return (
    <EditorSection
      step="2"
      tone="neutral"
      title="Si"
      sub="Facultatif. Chaque condition restreint le déclencheur — elles s’additionnent, jamais elles ne s’excluent."
      right={<span className="lbl">{rule.conds.length} condition{rule.conds.length > 1 ? 's' : ''}</span>}
    >
      {rule.conds.length === 0 && <div className="ar-todo">Aucune condition : la règle s’applique à tout le portefeuille.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rule.conds.map((c, i) => {
          const k = COND_KINDS[c.kind];
          return (
            <div key={c.kind} className="ar-cond">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 5 }}>{k.label}</div>
                {(k.kind === 'clients' || k.kind === 'forfait') && (
                  <div className="chips">
                    {(k.kind === 'clients' ? RULE_CLIENTS : FORFAITS).map((o) => {
                      const arr = c.value as string[];
                      const on = arr.includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          className="chip"
                          data-on={on}
                          onClick={() => upd(i, on ? arr.filter((x) => x !== o) : [...arr, o])}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}
                {k.kind === 'dim' && (
                  <select className="sel" value={c.value as string} onChange={(e) => upd(i, e.target.value)}>
                    {DIMS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
                {k.kind === 'nombre' && (
                  <div className="ar-param" style={{ marginTop: 0, background: 'transparent', border: 0, padding: 0 }}>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={c.value as number}
                      onChange={(e) => upd(i, Number(e.target.value))}
                      style={{ flex: 1, minWidth: 110, accentColor: 'var(--accent)' }}
                      aria-label="Volume de recherche minimal"
                    />
                    <span className="ar-param-v">{c.value} rech./mois</span>
                  </div>
                )}
                {k.kind === 'bool' && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{k.phrase(true)}</div>}
              </div>
              <button className="btn-icon" type="button" onClick={() => del(i)} aria-label={`Retirer la condition ${k.label}`}>
                <IcoX size={13} />
              </button>
            </div>
          );
        })}
      </div>
      {adding ? (
        <div className="ar-add">
          {available.map((id) => (
            <button key={id} type="button" className="chip" onClick={() => add(id)}>
              {COND_KINDS[id].label}
            </button>
          ))}
          <button className="btn-out" type="button" style={{ fontSize: '0.625rem' }} onClick={() => setAdding(false)}>
            Annuler
          </button>
        </div>
      ) : (
        <button
          className="btn-out"
          type="button"
          style={{ marginTop: 9, fontSize: '0.6875rem' }}
          onClick={() => setAdding(true)}
          disabled={available.length === 0}
        >
          <IcoPlus size={12} />
          Ajouter une condition
        </button>
      )}
    </EditorSection>
  );
}

function condAllowedFor(kind: CondKind, trigger: TriggerId | null) {
  const k = COND_KINDS[kind];
  return !k.only || (!!trigger && k.only.includes(trigger));
}

/* ── Alors ── */
function ActionPicker({ rule, set }: { rule: Rule; set: (fn: (r: Rule) => Rule) => void }) {
  const a = rule.action ? ACTIONS[rule.action] : null;
  const ap = rule.actionParams;
  const setAp = <K extends keyof Rule['actionParams']>(k: K, v: Rule['actionParams'][K]) =>
    set((r) => ({ ...r, actionParams: { ...r.actionParams, [k]: v } }));

  return (
    <EditorSection step="3" tone="green" title="Alors" sub="Une action par règle. Pour en enchaîner deux, écrivez deux règles — une phrase reste lisible.">
      <div className="ar-grid">
        {(Object.entries(ACTIONS) as [ActionId, (typeof ACTIONS)[ActionId]][]).map(([id, ac]) => {
          const G = GLYPH[ac.icon];
          const on = rule.action === id;
          return (
            <button key={id} type="button" className="ar-opt" data-on={on} aria-pressed={on} onClick={() => set((r) => ({ ...r, action: id }))}>
              <span className="ar-opt-i">
                <G />
              </span>
              <span className="ar-opt-t">{ac.label}</span>
              {on && (
                <span className="ar-opt-c">
                  <IcoCheck />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {a && (
        <div className="ar-param" style={{ flexWrap: 'wrap', gap: 10 }}>
          {rule.action === 'priorite' && (
            <>
              <label htmlFor="ar-sev">Sévérité</label>
              <select id="ar-sev" className="sel" value={ap.sev} onChange={(e) => setAp('sev', e.target.value)}>
                {SEVS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label htmlFor="ar-dim">Dimension</label>
              <select id="ar-dim" className="sel" value={ap.dim} onChange={(e) => setAp('dim', e.target.value)}>
                {DIMS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </>
          )}
          {rule.action === 'tache' && (
            <>
              <label htmlFor="ar-as">Assignée à</label>
              <select id="ar-as" className="sel" value={ap.assignee} onChange={(e) => setAp('assignee', e.target.value)}>
                {TEAM_NAMES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <label htmlFor="ar-ef">Effort estimé</label>
              <select id="ar-ef" className="sel" value={ap.effort} onChange={(e) => setAp('effort', Number(e.target.value))}>
                {[1, 2, 4, 8].map((h) => (
                  <option key={h} value={h}>
                    {h} h
                  </option>
                ))}
              </select>
            </>
          )}
          {rule.action === 'notifier' && (
            <>
              <label htmlFor="ar-no">Destinataire</label>
              <select id="ar-no" className="sel" value={ap.assignee} onChange={(e) => setAp('assignee', e.target.value)}>
                {[...TEAM_NAMES, 'toute l’équipe'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </>
          )}
          {rule.action === 'courriel' && (
            <>
              <label htmlFor="ar-de">Destinataire</label>
              <select id="ar-de" className="sel" value={ap.dest} onChange={(e) => setAp('dest', e.target.value)}>
                <option value="client">client</option>
                <option value="chargé de compte">chargé de compte</option>
                <option value="responsable de la facturation">responsable de la facturation</option>
              </select>
            </>
          )}
          {rule.action === 'audit' && (
            <>
              <label htmlFor="ar-au">Portée de l’audit</label>
              <select id="ar-au" className="sel" value={ap.dim} onChange={(e) => setAp('dim', e.target.value)}>
                {['Toutes', ...DIMS].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </>
          )}
          {rule.action === 'rapport' && (
            <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
              Le brouillon reste invisible du client jusqu’à publication.
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>Produit : {a.creates}</span>
        </div>
      )}
      {!rule.action && <div className="ar-todo">Choisissez une action pour continuer.</div>}
    </EditorSection>
  );
}

/* ── Aperçu en langage naturel ── */
function NaturalPreview({ rule }: { rule: Rule }) {
  const s = ruleSentence(rule);
  const done = !!(s.when && s.then);
  return (
    <div className="ar-preview">
      <div className="lbl" style={{ marginBottom: 6 }}>
        La règle, en une phrase
      </div>
      {done ? (
        <p className="ar-phrase">
          <b>Quand</b> {s.when}
          {s.ifs.map((x, i) => (
            <span key={i}>
              , <b>{i === 0 ? 'si' : 'et si'}</b> {x}
            </span>
          ))}
          , <b>alors</b> {s.then}.
        </p>
      ) : (
        <p className="ar-phrase incomplete">
          <b>Quand</b> {s.when || <span className="ar-blank">choisissez un déclencheur</span>}, <b>alors</b>{' '}
          {s.then || <span className="ar-blank">choisissez une action</span>}.
        </p>
      )}
      {done && s.ifs.some((x) => x.includes('aucun')) && (
        <div className="ar-todo" style={{ marginTop: 8 }}>
          Une condition est vide : elle bloquerait toutes les exécutions. Complétez-la ou retirez-la.
        </div>
      )}
    </div>
  );
}

/* ── Bandeau d'état ── */
function StatusBanner({ rule, log }: { rule: Rule; log: LogEntry[] }) {
  const [label, tone, Icon] = STATUS_META[rule.status];
  const fails = log.filter((x) => !x.ok).length;
  let consec = 0;
  for (const x of log) {
    if (x.ok) break;
    consec += 1;
  }
  let msg: React.ReactNode;
  if (rule.status === 'echec') {
    msg = (
      <>
        <b>{consec} échecs consécutifs</b> — au-delà du seuil de {FAIL_MAX}, HuntPilote a suspendu les exécutions. Corrigez la
        cause puis rejouez la dernière exécution.
      </>
    );
  } else if (rule.status === 'pause') {
    msg = (
      <>
        Les déclenchements sont ignorés. Le journal est conservé — {log.length} exécutions passées, {fails} en échec.
      </>
    );
  } else if (rule.status === 'brouillon') {
    msg = <>Cette règle n’a jamais été activée. Un test à blanc est exigé avant activation.</>;
  } else if (log.length === 0) {
    msg = (
      <>
        <b>Jamais déclenchée depuis sa création.</b> Soit le déclencheur ne s’est pas produit, soit une condition est trop
        restrictive — le test à blanc le dira.
      </>
    );
  } else {
    msg = (
      <>
        {log.length} exécutions au journal, dont {fails} en échec. Dernière : {log[0].at}.
      </>
    );
  }
  return (
    <div className="note-box ar-banner" style={{ background: TONE_CSS[tone][0], borderColor: TONE_CSS[tone][1] }}>
      <span style={{ color: TONE_CSS[tone][2], display: 'flex', flexShrink: 0, marginTop: 1 }}>
        <Icon />
      </span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
        <b>{label}.</b> {msg}
      </div>
    </div>
  );
}

/* ── Test à blanc ── */
function DryRunPanel({ rule, onRun, result }: { rule: Rule; onRun: () => void; result: DryResult[] | null }) {
  const s = ruleSentence(rule);
  const ready = !!(s.when && s.then);
  const over = result && result.length > DRY_MAX;
  return (
    <div className="card ar-sec">
      <div className="ar-sec-h">
        <span className="ar-step" style={{ background: 'var(--violet-m)', border: '1px solid var(--violet-b)', color: 'var(--violet-fg)' }}>
          <IcoPlay size={13} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Test à blanc — qu’aurait fait cette règle le mois dernier ?</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.45 }}>
            Rien n’est créé. Le test rejoue les données réelles du 12 août au 9 septembre avec les réglages actuels.
          </div>
        </div>
        <button className="btn-out" type="button" onClick={onRun} disabled={!ready} style={{ fontSize: '0.6875rem' }}>
          <IcoPlay size={11} />
          {result ? 'Relancer le test' : 'Lancer le test'}
        </button>
      </div>
      {!ready && <div className="ar-todo">Complétez le déclencheur et l’action avant de tester.</div>}
      {result && (
        <>
          <div
            className="note-box"
            style={{ marginBottom: 9, background: over ? 'var(--red-m)' : 'var(--green-m)', borderColor: over ? 'var(--red-b)' : 'var(--green-b)' }}
          >
            <span style={{ color: over ? 'var(--red)' : 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
              {over ? <IcoWarn size={13} /> : <IcoCheck size={13} />}
            </span>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
              <b>
                {result.length} objet{result.length > 1 ? 's' : ''} {result.length > 1 ? 'auraient été créés' : 'aurait été créé'}
              </b>{' '}
              sur les 4 dernières semaines · seuil de vigilance : {DRY_MAX} par mois.
              {over ? ' La règle est trop large — resserrez une condition avant de l’activer.' : ' Volume raisonnable : la règle peut être activée.'}
            </div>
          </div>
          {result.length === 0 ? (
            <div className="ar-todo">
              Aucune donnée du mois dernier ne déclenchait cette règle. Elle serait active mais silencieuse — vérifiez le seuil
              du déclencheur et les conditions.
            </div>
          ) : (
            <div className="ar-log">
              {result.map((r, i) => (
                <div key={i} className="ar-log-row">
                  <span className="ar-log-d">{r.date}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{r.client}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.4 }}>{r.detail}</div>
                  </div>
                  <Pill label={r.would} tone="neutral" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Journal d'exécution ── */
function ExecLogPanel({ log, onReplay, replayed }: { log: LogEntry[]; onReplay: (id: string) => void; replayed: string[] }) {
  return (
    <div className="card ar-sec">
      <div className="ar-sec-h">
        <span className="ar-step" style={{ background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', color: 'var(--fg2)' }}>
          <IcoSpin size={13} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Journal d’exécution</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>
            Ce que chaque exécution a réellement produit. Les échecs sont rejouables.
          </div>
        </div>
        <span className="lbl">
          {log.length} exécution{log.length > 1 ? 's' : ''}
        </span>
      </div>
      {log.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucune exécution</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
            La règle n’a jamais été déclenchée depuis sa création. Le test à blanc dira si c’est le déclencheur ou une condition
            qui bloque.
          </div>
        </div>
      ) : (
        <div className="ar-log">
          {log.map((x) => (
            <div key={x.id} className="ar-log-row" style={x.err ? { background: 'var(--red-m)', borderColor: 'var(--red-b)' } : undefined}>
              <span className="ar-log-d">{x.at}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                  {x.ok ? (
                    <Pill
                      label={x.matched > 0 ? `${x.matched} objet${x.matched > 1 ? 's' : ''} créé${x.matched > 1 ? 's' : ''}` : 'Aucun objet créé'}
                      tone={x.matched > 0 ? 'green' : 'neutral'}
                      icon={<IcoCheck size={10} />}
                    />
                  ) : (
                    <Pill label="Échec" tone="red" icon={<IcoWarn size={10} />} />
                  )}
                  <span style={{ fontSize: '0.5rem', color: 'var(--fg4)', fontWeight: 700 }}>{x.id}</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: x.err ? 'var(--red)' : 'var(--fg2)', lineHeight: 1.4 }}>{x.produced}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                {x.toParametres && (
                  <a href={routes.parametres('integrations')} className="btn-out" style={{ fontSize: '0.625rem', padding: '0.25rem 0.6rem', textDecoration: 'none' }}>
                    Corriger la cause
                    <IcoArrowR size={11} />
                  </a>
                )}
                {!x.ok && (
                  <button
                    className="btn-out"
                    type="button"
                    style={{ fontSize: '0.625rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => onReplay(x.id)}
                    disabled={replayed.includes(x.id)}
                  >
                    <IcoSpin size={11} />
                    {replayed.includes(x.id) ? 'Rejouée' : 'Rejouer'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Zone de danger ── */
function DangerZone({ tested, onBack }: { tested: boolean; onBack: () => void }) {
  const [blocked, setBlocked] = useState(false);
  return (
    <div className="ar-danger">
      <div className="lbl" style={{ color: 'var(--red)', marginBottom: 6 }}>
        Zone de danger
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55, marginBottom: 10 }}>
        Une règle mal réglée peut créer une centaine de tâches en une nuit.{' '}
        {tested
          ? 'Le test à blanc a été fait — vous savez ce que cette règle produit.'
          : 'Aucun test à blanc n’a encore été fait sur ces réglages : l’activation reste bloquée.'}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-out" type="button" style={{ borderColor: 'var(--red-b)', color: 'var(--red)' }} onClick={() => setBlocked(true)}>
          <IcoX size={12} />
          Supprimer la règle
        </button>
        <button className="btn-out" type="button" onClick={onBack}>
          Revenir aux automatisations
        </button>
        {blocked && (
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
            Suppression désactivée dans cette démo — le journal d’exécution serait perdu avec la règle.
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Composant principal ── */
export function RuleEditor({
  seed,
  automationId,
  onBack,
  onSetActive,
}: {
  seed: Rule;
  /** id de la ligne d'origine dans AUTOMATIONS — absent pour une règle neuve. */
  automationId?: number;
  onBack: () => void;
  onSetActive?: (id: number, active: boolean) => void;
}) {
  const initialState: DemoStateId = seed.status === 'active' ? 'active' : seed.status === 'brouillon' ? 'nouvelle' : 'pause';
  const [demoState, setDemoState] = useState<DemoStateId>(initialState);
  const [rule, setRule] = useState<Rule>(() => applyDemoState(seed, initialState).rule);
  const [log, setLog] = useState<LogEntry[]>(() => applyDemoState(seed, initialState).log);
  const [dry, setDry] = useState<DryResult[] | null>(null);
  const [replayed, setReplayed] = useState<string[]>([]);

  const setSc = (state: DemoStateId) => {
    const { rule: r, log: l } = applyDemoState(seed, state);
    setDemoState(state);
    setRule(r);
    setLog(l);
    setDry(null);
    setReplayed([]);
  };

  /** Toute modification des réglages invalide le test à blanc : on ne peut pas activer sur un test périmé. */
  const editRule = (fn: (r: Rule) => Rule) => {
    setRule(fn);
    setDry(null);
  };

  const s = ruleSentence(rule);
  const complete = !!(s.when && s.then && rule.name.trim());
  const tested = !!dry;
  const runDry = () => setDry(dryRun(rule));
  const activate = () => {
    setRule((r) => ({ ...r, status: 'active' }));
    if (automationId != null) onSetActive?.(automationId, true);
  };
  const pause = () => {
    setRule((r) => ({ ...r, status: 'pause' }));
    if (automationId != null) onSetActive?.(automationId, false);
  };
  const replay = (id: string) => {
    setReplayed((r) => [...r, id]);
    setLog((l) => l.map((x) => (x.id === id ? { ...x, ok: true, matched: 1, err: false, produced: 'Rejouée avec succès — objet créé', toParametres: false } : x)));
  };

  const canActivate = complete && tested && (dry ? dry.length <= DRY_MAX : false) && rule.status !== 'active';

  return (
    <>
      <div className="subbar">
        <button className="btn-out" type="button" onClick={onBack} style={{ fontSize: '0.6875rem', padding: '0.3rem 0.75rem' }}>
          <IcoArrowL size={11} />
          Automatisations
        </button>
        {(() => {
          const [label, tone, Icon] = STATUS_META[rule.status];
          return <Pill label={label} tone={tone} icon={<Icon size={11} />} />;
        })()}
        {rule.status === 'active' ? (
          <button className="btn-out" type="button" onClick={pause}>
            <IcoPause size={11} />
            Mettre en pause
          </button>
        ) : (
          <button
            className="btn-pri btn-main"
            type="button"
            style={{ width: 'auto' }}
            onClick={activate}
            disabled={!canActivate}
            title={
              !complete
                ? 'Nommez la règle, choisissez un déclencheur et une action'
                : !tested
                  ? 'Lancez le test à blanc avant d’activer'
                  : dry && dry.length > DRY_MAX
                    ? 'Le test dépasse le seuil de vigilance'
                    : 'Activer la règle'
            }
          >
            <IcoCheck size={12} />
            Activer la règle
          </button>
        )}
        {!complete && <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Règle incomplète</span>}
        {complete && !tested && rule.status !== 'active' && (
          <span style={{ fontSize: '0.625rem', color: 'var(--yellow-fg)', fontWeight: 700 }}>Test à blanc exigé avant activation</span>
        )}
        <DemoOnly>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lbl>Démo · état</Lbl>
            <select className="state-sel" value={demoState} onChange={(e) => setSc(e.target.value as DemoStateId)} aria-label="État de démonstration">
              {DEMO_STATES.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </DemoOnly>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.125rem 1.5rem' }}>
        <div className="card ar-sec">
          <label className="lbl" htmlFor="ar-nm" style={{ display: 'block', marginBottom: 5 }}>
            Nom de la règle
          </label>
          <input
            id="ar-nm"
            className="ar-name"
            value={rule.name}
            onChange={(e) => setRule((r) => ({ ...r, name: e.target.value }))}
            placeholder="Nommez la règle, p. ex. « Alerte chute de position »"
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 8, lineHeight: 1.5 }}>
            {rule.desc || 'Décrivez en une ligne ce que cette règle surveille — le nom apparaît tel quel dans la liste des automatisations.'}
          </div>
        </div>
        <StatusBanner rule={rule} log={log} />
        <NaturalPreview rule={rule} />
        <TriggerPicker rule={rule} set={editRule} />
        <CondEditor rule={rule} set={editRule} />
        <ActionPicker rule={rule} set={editRule} />
        <DryRunPanel rule={rule} onRun={runDry} result={dry} />
        <ExecLogPanel log={log} onReplay={replay} replayed={replayed} />
        <DangerZone tested={tested} onBack={onBack} />
      </div>
    </>
  );
}
