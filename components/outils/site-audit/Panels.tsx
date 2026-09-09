'use client';

/**
 * Site Audit — blocs propres à l'outil (résumé de crawl, familles de
 * constats, page concernées, frontière avec l'audit mensuel).
 *
 * Réutilise `.crit`, `.card`, `Sec`, `Pill`, `A_STATUS` du reste de
 * l'application. Le cadre commun (barre de contexte, bandeaux, coût) vient
 * de `components/outils/*`.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Lbl, Pill, Sec, type Tone } from '@/components/ui/Atoms';
import {
  IcoAlert,
  IcoArrowR,
  IcoCheck,
  IcoChevR,
  IcoClock,
  IcoDoc,
  IcoDown,
  IcoEye,
  IcoGauge,
  IcoIndex,
  IcoInfo,
  IcoPlus,
  IcoSitemap,
  IcoSnap,
  IcoSpin,
  IcoStop,
  IcoType,
  IcoUp,
  IcoWarn,
  IcoX,
  type IconProps,
} from '@/components/ui/Icons';
import { A_STATUS } from '@/lib/data/audit';
import { CRAWL, SA_SEV, type SaCriterion, type SaFamily, type SaFamilyId } from '@/lib/data/site-audit';

const FAM_ICON: Record<SaFamilyId, (p: IconProps) => React.ReactElement> = {
  indexation: IcoIndex,
  erreurs: IcoAlert,
  onpage: IcoType,
  perf: IcoGauge,
  structure: IcoSitemap,
};

const STATUS_ICON = {
  ok: IcoCheck,
  warn: IcoWarn,
  fail: IcoX,
  na: IcoClock,
} as const;

/* ── Résumé de l'exploration — chaque mesure porte son seuil ── */

function DeltaTag({ current, previous, invert }: { current: number; previous: number; invert?: boolean }) {
  const v = current - previous;
  if (v === 0) {
    return (
      <span className="delta" style={{ color: 'var(--fg3)' }}>
        stable
      </span>
    );
  }
  const bad = invert ? v > 0 : v < 0;
  return (
    <span className="delta" style={{ color: bad ? 'var(--red)' : 'var(--green-fg)' }}>
      {v > 0 ? <IcoUp /> : <IcoDown />}
      <span>
        {v > 0 ? '+' : '−'}
        {Math.abs(v)}
      </span>
    </span>
  );
}

export function CrawlSummary({
  partial,
  onRelaunch,
  auditHref,
}: {
  partial: boolean;
  onRelaunch: () => void;
  auditHref: string;
}) {
  const crawl = CRAWL;
  return (
    <Sec
      title="Résumé de l’exploration"
      sub={
        partial
          ? `Passage interrompu le ${crawl.date} à ${crawl.hour} · comparaison partielle`
          : `Dernier passage le ${crawl.date} à ${crawl.hour} · ${crawl.ago} · référence : crawl du ${crawl.prev.date}`
      }
      right={
        <button type="button" className="btn-out" onClick={onRelaunch}>
          <IcoSpin />
          Relancer l’exploration
        </button>
      }
    >
      <div className="sum-grid">
        <div className="sum-cell">
          <Lbl mb={4}>Pages explorées</Lbl>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="sum-val">{crawl.pages}</span>
            <DeltaTag current={crawl.pages} previous={crawl.prev.pages} />
          </div>
          <div className="sum-thr">seuil du quota : {crawl.quotaPages} pages par passage</div>
        </div>
        <div className="sum-cell">
          <Lbl mb={4}>Pages en erreur</Lbl>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="sum-val" style={{ color: 'var(--red)' }}>
              {crawl.err}
            </span>
            <DeltaTag current={crawl.err} previous={crawl.prev.err} invert />
          </div>
          <div className="sum-thr">seuil 0 page · 404 et 5xx confondues</div>
        </div>
        <div className="sum-cell">
          <Lbl mb={4}>Profondeur moyenne</Lbl>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="sum-val">{crawl.depth}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>clics</span>
          </div>
          <div className="sum-thr">seuil ≤ 4 clics · {crawl.prev.depth} au passage précédent</div>
        </div>
        <div className="sum-cell">
          <Lbl mb={4}>Dernier passage</Lbl>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="sum-val" style={{ fontSize: '1.0625rem' }}>
              {crawl.date}
            </span>
          </div>
          <div className="sum-thr">seuil : moins de 30 jours · {crawl.ago}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 11, flexWrap: 'wrap' }}>
        <div className="diff-col" style={{ flex: '1 1 14rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill label="12 URL apparues" tone="blue" sm icon={<IcoPlus />} />
            <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>depuis le {crawl.prev.date}</span>
          </div>
          {crawl.apparues.map((u) => (
            <span className="diff-li" key={u}>
              {u}
            </span>
          ))}
        </div>
        <div className="diff-col" style={{ flex: '1 1 14rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill label="4 URL disparues" sm icon={<IcoX />} />
            <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>dont 3 devenues 404</span>
          </div>
          {crawl.disparues.map((u) => (
            <span className="diff-li" key={u}>
              {u}
            </span>
          ))}
        </div>
      </div>

      {partial && (
        <div className="note-box" style={{ background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
          <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
            <IcoWarn size={12} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>Exploration partielle — 128 pages sur ~500.</b> Le serveur a répondu 429 (trop de
            requêtes) après 128 URL. Les constats ci-dessous ne couvrent qu’un quart du site : ne
            les enregistrez pas comme un relevé complet.
          </div>
        </div>
      )}

      <div className="note-box">
        <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoInfo />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>Pas de score global ici.</b> Cet outil délimite ; le score pondéré des trois dimensions
          est relevé une fois par mois par l’audit.
        </div>
        <Link href={auditHref} className="btn-out" style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}>
          Voir l’audit
          <IcoArrowR />
        </Link>
      </div>
    </Sec>
  );
}

/* ── Exploration en cours ── */

export function CrawlRunning({ pct, onStop }: { pct: number; onStop: () => void }) {
  const steps: readonly [string, boolean][] = [
    ['Découverte des URL', pct > 20],
    ['Réponses HTTP et redirections', pct > 45],
    ['Balises on-page', pct > 70],
    ['Core Web Vitals par gabarit', false],
  ];
  return (
    <Sec
      title="Exploration en cours"
      sub="Lancée à 09 h 41 · portée : site complet"
      accent="var(--blue-b)"
      right={
        <button type="button" className="btn-out" onClick={onStop}>
          <IcoStop />
          Arrêter
        </button>
      }
    >
      <div className="prog-row">
        <span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{Math.round(pct * 4.12)} pages explorées</span>
        <span>sur ~412 attendues</span>
        <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{pct} %</span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%`, background: 'var(--blue-fg)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 11 }} aria-live="polite">
        {steps.map(([label, done]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.625rem' }}>
            <span className="crit-ico" data-st={done ? 'ok' : 'na'} style={{ width: 16, height: 16, marginTop: 0 }}>
              {done ? <IcoCheck /> : <IcoClock />}
            </span>
            <span style={{ color: done ? 'var(--fg1)' : 'var(--fg3)', fontWeight: done ? 700 : 500 }}>{label}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>
              {done ? 'terminé' : 'en attente'}
            </span>
          </div>
        ))}
      </div>
      <div className="note-box">
        <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <IcoClock />
        </span>
        <div style={{ flex: 1 }}>
          Les familles apparaissent au fur et à mesure. Vous pouvez quitter l’écran : l’exploration
          continue et la fiche vous en avertira.
        </div>
      </div>
    </Sec>
  );
}

/* ── Ligne de constat (.crit) + liste des pages concernées ── */

function SaCrit({
  it,
  famId,
  created,
  onCreate,
  onCreatePage,
  prioHref,
}: {
  it: SaCriterion;
  famId: SaFamilyId;
  created: Record<string, string>;
  onCreate: (key: string) => void;
  onCreatePage: (key: string) => void;
  prioHref: (prio: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const s = A_STATUS[it.st];
  const Icon = STATUS_ICON[it.st];
  const key = `${famId}:${it.c}`;
  const prio = it.prio ?? created[key];
  const actionable = it.st !== 'ok' && it.st !== 'na';

  return (
    <div className="crit" data-st={it.st}>
      <span className="crit-ico" data-st={it.st}>
        <Icon size={11} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{it.c}</span>
          <Pill label={s.label} tone={s.tone} sm icon={<Icon size={10} />} />
        </div>
        <div className="crit-meas">
          <span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{it.measure}</span>
          <span style={{ color: 'var(--fg3)' }}>{it.threshold}</span>
        </div>
        {it.note && (
          <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{it.note}</p>
        )}
      </div>
      <div className="crit-act" style={{ gap: 6 }}>
        <button type="button" className="btn-out" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <IcoDoc size={11} />
          <span>
            {it.n} page{it.n > 1 ? 's' : ''}
          </span>
          <span className="chev" data-open={open}>
            <IcoChevR />
          </span>
        </button>
        {prio ? (
          <Link href={prioHref(prio)} style={{ textDecoration: 'none' }}>
            <Pill label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<IcoArrowR />} />
          </Link>
        ) : actionable ? (
          <button type="button" className="btn-out" onClick={() => onCreate(key)}>
            <IcoPlus size={11} />
            Créer la priorité
          </button>
        ) : (
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Rien à traiter</span>
        )}
      </div>
      {open && (
        <div className="crit-more">
          {it.pgs.map(([u, m]) => {
            const pk = `${famId}:${u}`;
            const pp = created[pk];
            return (
              <div className="pg" key={u}>
                <span className="pg-url" title={u}>
                  {u}
                </span>
                <span className="pg-meas">{m}</span>
                {pp ? (
                  <Link href={prioHref(pp)} style={{ textDecoration: 'none' }}>
                    <Pill label={pp} tone="blue" sm />
                  </Link>
                ) : (
                  <button type="button" className="pg-btn" onClick={() => onCreatePage(pk)}>
                    <IcoPlus size={10} />
                    Priorité
                  </button>
                )}
              </div>
            );
          })}
          {it.n > it.pgs.length && (
            <div className="pg-rest">{it.n - it.pgs.length} autres pages concernées · exportez le CSV pour la liste complète</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Famille : le groupement qui rend la liste utilisable ── */

export function FamilyGroup({
  fam,
  rows,
  open,
  onToggle,
  created,
  onCreate,
  onCreatePage,
  prioHref,
}: {
  fam: SaFamily;
  rows: readonly SaCriterion[];
  open: boolean;
  onToggle: () => void;
  created: Record<string, string>;
  onCreate: (key: string) => void;
  onCreatePage: (key: string) => void;
  prioHref: (prio: string) => string;
}) {
  const sev = SA_SEV[fam.sev];
  const Icon = FAM_ICON[fam.id];
  const touched = rows.reduce((n, r) => n + r.n, 0);
  const nFail = rows.filter((r) => r.st === 'fail').length;
  const key = `fam:${fam.id}`;
  const prio = created[key];

  return (
    <div className="fam" data-sev={fam.sev}>
      <div className="fam-top">
        <button type="button" className="fam-head" onClick={onToggle} aria-expanded={open}>
          <span className="chev" data-open={open}>
            <IcoChevR />
          </span>
          <span className="fam-ico">
            <Icon />
          </span>
          <span style={{ minWidth: 0, flex: '1 1 12rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.015em' }}>{fam.name}</span>
              <Pill
                label={sev.label}
                tone={sev.tone}
                sm
                icon={sev.tone === 'red' ? <IcoX /> : sev.tone === 'yellow' ? <IcoWarn size={11} /> : <IcoEye />}
              />
              <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', fontVariantNumeric: 'tabular-nums' }}>
                {rows.length} constat{rows.length > 1 ? 's' : ''} · {touched} pages touchées
                {nFail > 0 ? ` · ${nFail} hors seuil` : ''}
              </span>
            </span>
            <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.45 }}>
              {fam.sub}
            </span>
          </span>
        </button>
        <div className="fam-act">
          {prio ? (
            <Link href={prioHref(prio)} style={{ textDecoration: 'none' }}>
              <Pill label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<IcoArrowR />} />
            </Link>
          ) : (
            <button type="button" className="btn-out" onClick={() => onCreate(key)}>
              <IcoPlus size={11} />
              <span>Créer la priorité · famille</span>
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="fam-body">
          {rows.map((r) => (
            <SaCrit
              key={r.c}
              it={r}
              famId={fam.id}
              created={created}
              onCreate={onCreate}
              onCreatePage={onCreatePage}
              prioHref={prioHref}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Ce que ce crawl alimente — la frontière avec l'audit mensuel ── */

const FEEDS: readonly [string, string, string, Tone][] = [
  ['SEO', 'Indexation, erreurs, on-page, structure', '40 %', 'green'],
  ['Design', 'Core Web Vitals et images sans alt', 'partiel', 'blue'],
  ['Présence en ligne', 'Hors portée du crawl', 'aucune', 'neutral'],
];

export function FeedsCard() {
  return (
    <Sec title="Ce que ce crawl alimente" sub="L’outil produit la matière ; l’audit produit le score.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FEEDS.map(([name, what, part, tone]) => (
          <div key={name} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.45 }}>{what}</div>
            </div>
            <Pill label={part} tone={tone} sm />
          </div>
        ))}
      </div>
      <div className="note-box">
        Enregistrer dans la fiche verse ces mesures à la dimension correspondante du prochain audit
        mensuel.
      </div>
    </Sec>
  );
}

/* ── Conservation — variante propre à cet outil : le crawl est historisé ── */

export function SaKeepCard({ prospect }: { prospect: boolean }) {
  return (
    <Sec title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
      <div style={{ marginBottom: 9 }}>
        {prospect ? (
          <Pill label="Instantané · jamais historisé" tone="yellow" icon={<IcoSnap />} />
        ) : (
          <Pill label="Conservé une fois enregistré" tone="green" icon={<IcoCheck />} />
        )}
      </div>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 11 }}>
        {prospect
          ? 'Un prospect ne reçoit pas d’historique de crawl. Le résultat sert au démarchage et disparaît après 30 jours.'
          : 'Les compteurs et les mesures par gabarit rejoignent l’historique du client. La liste détaillée des URL, elle, reste éphémère : elle sera périmée au prochain passage.'}
      </p>
      <div className="keep-row">
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
          Conservé automatiquement
        </span>
        <span style={{ color: 'var(--fg3)' }}>·</span>
        <span>Compteurs de pages et d’erreurs, profondeur, Core Web Vitals par gabarit</span>
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: 5 }}>
          Éphémère · 30 jours
        </span>
        <span style={{ color: 'var(--fg3)' }}>·</span>
        <span>Liste des URL concernées, sauf celles reprises dans une priorité</span>
      </div>
    </Sec>
  );
}
