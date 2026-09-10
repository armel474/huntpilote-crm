'use client';

/**
 * SEO local — panneaux partagés de la vue d'ensemble et de la fiche
 * d'établissement (session 3.1).
 *
 * Réutilise `.card`, `.crit`, `Sec`, `Pill` du reste de l'application ; les
 * classes propres à cette section (`.estab-row`, `.aq-row`, `.sector-chip`,
 * `.grille-viz`…) vivent dans `app/globals.css`, section « SEO local ».
 */
import { useState } from 'react';
import Link from 'next/link';
import { Lbl, Pill, Sec } from '@/components/ui/Atoms';
import { EmptyHealthy } from '@/components/ui/States';
import {
  IcoArrowR,
  IcoArrowL,
  IcoAttr,
  IcoBuilding,
  IcoCal,
  IcoCamera,
  IcoCheck,
  IcoCheckAll,
  IcoClock,
  IcoCompare,
  IcoDoc,
  IcoExt,
  IcoGlobe,
  IcoLayers,
  IcoList,
  IcoLock,
  IcoMegaphone,
  IcoMsg,
  IcoPhone,
  IcoPlus,
  IcoRoute,
  IcoRuler,
  IcoStar,
  IcoTag,
  IcoUserX,
  IcoWarn,
  IcoX,
  type IconProps,
} from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  ALERT_DEFS,
  ALL_GBP_FIELDS,
  GBP_STATE,
  GRID_POINT_PRICE,
  type AlertId,
  type Establishment,
  type GbpStateId,
} from '@/lib/data/local';

const ALERT_ICON: Record<AlertId, (p: IconProps) => React.ReactElement> = {
  avis_negatif: IcoStar,
  fiche_suspendue: IcoClock,
  chute_position: IcoWarn,
  incoherence: IcoWarn,
  fiche_tiers: IcoLock,
  fiche_non_revendiquee: IcoUserX,
  zone_non_configuree: IcoLayers,
};

const GBP_STATE_ICON: Record<GbpStateId, (p: IconProps) => React.ReactElement> = {
  revendiquee: IcoCheck,
  non_revendiquee: IcoUserX,
  suspendue: IcoClock,
  tiers: IcoLock,
};

const GBP_FIELD_ICON: Record<(typeof ALL_GBP_FIELDS)[number], (p: IconProps) => React.ReactElement> = {
  'Nom et coordonnées': IcoBuilding,
  'Catégories': IcoTag,
  'Horaires (dont horaires spéciaux)': IcoCal,
  'Photos': IcoCamera,
  'Description': IcoDoc,
  'Services': IcoList,
  'Zone desservie': IcoLayers,
  'Attributs': IcoAttr,
  'Site web': IcoExt,
};

export function AlertChip({ id, sm = true }: { id: AlertId; sm?: boolean }) {
  const a = ALERT_DEFS[id];
  const Icon = ALERT_ICON[id];
  return <Pill label={a.label} tone={a.tone} sm={sm} icon={<Icon />} />;
}

export function GbpChip({ st, sm = true }: { st: GbpStateId; sm?: boolean }) {
  const g = GBP_STATE[st];
  const Icon = GBP_STATE_ICON[st];
  return <Pill label={g.label} tone={g.tone} sm={sm} icon={<Icon />} />;
}

/* ── VUE D'ENSEMBLE : KPI DE PORTEFEUILLE ── */

export function PortfolioKpis({ estabs, nSansEtab }: { estabs: Establishment[]; nSansEtab: number }) {
  const mesurables = estabs.filter((e) => e.scoreLocal != null);
  const moy = mesurables.length
    ? Math.round(mesurables.reduce((s, e) => s + (e.scoreLocal ?? 0), 0) / mesurables.length)
    : null;
  const enAction = estabs.filter((e) => e.alerts.length > 0).length;
  const items: { l: string; v: React.ReactNode; tone?: string }[] = [
    { l: 'Établissements suivis', v: estabs.length },
    { l: 'Demandent une action', v: enAction, tone: enAction > 0 ? 'var(--red)' : 'var(--fg1)' },
    { l: 'Score local moyen', v: moy == null ? '—' : moy },
    { l: 'Clients sans établissement', v: nSansEtab, tone: nSansEtab > 0 ? 'var(--yellow-fg)' : 'var(--fg1)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
      {items.map((k) => (
        <div key={k.l} className="card" style={{ padding: '0.7rem 0.9rem' }}>
          <Lbl mb={5}>{k.l}</Lbl>
          <div
            style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: k.tone ?? 'var(--fg1)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {k.v}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── VUE D'ENSEMBLE : CE QUI DEMANDE UNE ACTION ── */

export function ActionQueueCard({ estabs }: { estabs: Establishment[] }) {
  const rows = estabs.filter((e) => e.alerts.length > 0).flatMap((e) => e.alerts.map((a) => ({ est: e, alert: a })));
  const order: Record<string, number> = { red: 0, yellow: 1 };
  rows.sort((a, b) => (order[ALERT_DEFS[a.alert].tone] ?? 2) - (order[ALERT_DEFS[b.alert].tone] ?? 2));

  return (
    <Sec
      title="Ce qui demande une action"
      sub={rows.length ? `${rows.length} situation${rows.length > 1 ? 's' : ''} à traiter, la plus urgente en tête` : 'Aucune situation urgente en ce moment'}
    >
      {rows.length === 0 ? (
        <EmptyHealthy
          icon={<IcoCheckAll size={18} />}
          title="Tous les établissements suivis sont à jour"
          text="Aucune fiche suspendue, aucun avis négatif sans réponse, aucune chute de position à traiter."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map(({ est, alert }) => {
            const AlertIcon = ALERT_ICON[alert];
            return (
              <div key={est.id + alert} className="aq-row">
                <span className="crit-ico" data-st={ALERT_DEFS[alert].tone === 'red' ? 'fail' : 'warn'}>
                  <AlertIcon />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {est.name}
                    <span style={{ color: 'var(--fg3)', fontWeight: 500 }}> · {est.client}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginTop: 1 }}>{ALERT_DEFS[alert].label}</div>
                </div>
                <Link href={routes.etablissement(est.id)} className="btn-out" style={{ textDecoration: 'none', flexShrink: 0 }}>
                  Voir la fiche
                  <IcoArrowR />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Sec>
  );
}

/* ── VUE D'ENSEMBLE : LIGNE D'ÉTABLISSEMENT ── */

export function EstabRow({ est }: { est: Establishment }) {
  const na = <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', fontWeight: 700 }}>non mesuré</span>;
  return (
    <div className="estab-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '1 1 15rem', minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            flexShrink: 0,
            background: 'var(--bg-muted)',
            border: '1px solid var(--bd-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--fg3)',
          }}
        >
          <IcoBuilding />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{est.name}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>
            {est.client} · {est.ville}
          </div>
        </div>
      </div>
      <div className="estab-stat">
        <Lbl mb={2}>Score local</Lbl>
        {est.scoreLocal == null ? (
          na
        ) : (
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: est.scoreLocal >= 75 ? 'var(--green)' : est.scoreLocal >= 55 ? 'var(--yellow-b)' : 'var(--red)',
            }}
          >
            {est.scoreLocal}
          </span>
        )}
      </div>
      <div className="estab-stat">
        <Lbl mb={2}>Avis sans réponse</Lbl>
        {est.scoreLocal == null ? (
          na
        ) : (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: est.avisSansReponse > 0 ? 'var(--red)' : 'var(--fg1)',
            }}
          >
            {est.avisSansReponse}
            <span style={{ color: 'var(--fg3)', fontWeight: 500 }}> · {est.note}/5</span>
          </span>
        )}
      </div>
      <div className="estab-stat">
        <Lbl mb={2}>Incohérences citations</Lbl>
        {est.scoreLocal == null ? (
          na
        ) : (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: (est.incoh ?? 0) > 0 ? 'var(--yellow-fg)' : 'var(--fg1)',
            }}
          >
            {est.incoh}
            <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>
              {' '}
              · {est.citTotal}/{est.citRef} annuaires
            </span>
          </span>
        )}
      </div>
      <div className="estab-stat">
        <Lbl mb={2}>Position pack local</Lbl>
        {est.packPos == null ? (
          na
        ) : (
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {est.packPos.toLocaleString('fr-CA', { minimumFractionDigits: 1 })}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
        <GbpChip st={est.gbp} />
        {est.alerts[0] && <AlertChip id={est.alerts[0]} />}
      </div>
      <Link href={routes.etablissement(est.id)} className="btn-out" style={{ textDecoration: 'none', flexShrink: 0 }}>
        Voir la fiche
      </Link>
    </div>
  );
}

/* ── FICHE : EN-TÊTE MÉTA ── */

export function EstabMetaCard({ est }: { est: Establishment }) {
  return (
    <Sec title="Cet établissement">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {(
          [
            ['Client', est.client, null],
            ['Ville', est.ville, null],
            ['Fiche Google Business', null, est.gbp],
          ] satisfies [string, string | null, GbpStateId | null][]
        ).map(([l, v, gbp]) => (
          <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <Lbl mb={0} style={{ flex: '0 0 8rem' }}>
              {l}
            </Lbl>
            {v ? <span style={{ fontSize: '0.6875rem', fontWeight: 600, flex: 1 }}>{v}</span> : <GbpChip st={gbp!} />}
          </div>
        ))}
      </div>
      <Link
        href={routes.local()}
        className="btn-out"
        style={{ textDecoration: 'none', marginTop: 10, width: '100%', justifyContent: 'center' }}
      >
        <IcoArrowL />
        Retour à la vue d’ensemble
      </Link>
    </Sec>
  );
}

/* ── FICHE : ÉTAT BLOQUANT (non revendiquée / suspendue / tiers) ── */

const BLOCK_COPY: Partial<Record<GbpStateId, { title: string; body: string; cta: string; note: string }>> = {
  non_revendiquee: {
    title: 'Fiche Google Business non revendiquée',
    body: 'Personne à l’agence ne contrôle cette fiche : impossible de lire ses statistiques, de publier ou de corriger sa zone desservie tant qu’elle n’est pas revendiquée.',
    cta: 'Revendiquer la fiche',
    note: 'La revendication se fait depuis le compte Google du client — l’agence peut accompagner la démarche.',
  },
  suspendue: {
    title: 'Fiche suspendue · en attente de validation',
    body: 'Google a suspendu cette fiche en attendant une vérification. Aucune mesure ne peut être relevée pendant la suspension : les chiffres affichés seraient périmés.',
    cta: 'Voir les motifs de suspension',
    note: 'Une fiche revient généralement active quelques jours après la vérification complétée.',
  },
  tiers: {
    title: 'Fiche revendiquée par un tiers',
    body: 'Un autre compte Google détient l’accès à cette fiche — cas fréquent après un changement de propriétaire ou d’agence. L’agence ne peut rien y modifier avant un transfert d’accès.',
    cta: 'Lancer une demande de transfert',
    note: 'Le transfert exige l’approbation du détenteur actuel ; comptez plusieurs jours.',
  },
};

export function BlockingCard({ est }: { est: Establishment }) {
  const c = BLOCK_COPY[est.gbp];
  if (!c) return null;
  const g = GBP_STATE[est.gbp];
  const Icon = GBP_STATE_ICON[est.gbp];
  return (
    <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
      <div className="empty" style={{ border: 'none', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: g.tone === 'red' ? 'var(--red)' : 'var(--yellow-fg)', marginBottom: 8 }}>
          <Icon />
        </div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 6 }}>{c.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.6, maxWidth: '30rem', margin: '0 auto' }}>{c.body}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" className="btn-pri">
            <IcoExt />
            {c.cta}
          </button>
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 10, lineHeight: 1.5 }}>{c.note}</div>
      </div>
    </div>
  );
}

/* ── FICHE : COMPLÉTUDE GOOGLE BUSINESS ── */

export function GbpCompletionCard({ est }: { est: Establishment }) {
  if (est.gbpFilled == null) return null;
  const pct = Math.round((est.gbpFilled / ALL_GBP_FIELDS.length) * 100);
  const auditHref = est.auditRef ? routes.audit(est.clientId, est.auditRef.id.toLowerCase()) : null;
  return (
    <Sec
      title="Complétude de la fiche Google Business"
      sub={`${est.gbpFilled} champs remplis sur ${ALL_GBP_FIELDS.length} · Seuil : ${ALL_GBP_FIELDS.length} sur ${ALL_GBP_FIELDS.length}`}
      right={
        auditHref && (
          <Link href={auditHref} className="btn-out" style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}>
            <IcoCompare />
            Relevé par l’audit {est.auditRef!.id}
          </Link>
        )
      }
    >
      <div className="track" style={{ marginBottom: 10 }}>
        <div className="fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : pct >= 60 ? 'var(--yellow-b)' : 'var(--red)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ALL_GBP_FIELDS.map((f) => {
          const missing = est.gbpMissing.includes(f);
          const Icon = GBP_FIELD_ICON[f];
          return (
            <div key={f} className="crit" data-st={missing ? 'warn' : 'ok'}>
              <span className="crit-ico" data-st={missing ? 'warn' : 'ok'}>
                <Icon />
              </span>
              <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600 }}>{f}</span>
              {missing ? (
                f === 'Zone desservie' ? (
                  <a href="#zone-editor" className="btn-out" style={{ textDecoration: 'none' }}>
                    Configurer la zone
                  </a>
                ) : (
                  <button type="button" className="btn-out">
                    <IcoPlus />
                    Compléter
                  </button>
                )
              ) : (
                <span style={{ fontSize: '0.625rem', color: 'var(--green-fg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IcoCheck />
                  Complet
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Sec>
  );
}

/* ── FICHE : RAPPEL DES CRITÈRES D'AUDIT (mêmes libellés et seuils, vus de plus près) ── */

const CRIT_ICON = { ok: IcoCheck, warn: IcoWarn, fail: IcoX, na: IcoClock } as const;

export function CriteresRappelCard({ est }: { est: Establishment }) {
  if (est.criteres.length === 0) return null;
  const auditHref = est.auditRef ? routes.audit(est.clientId, est.auditRef.id.toLowerCase()) : null;
  return (
    <Sec title="Présence en ligne — les mêmes critères que l’audit" sub="Vus de plus près : mêmes libellés, mêmes seuils. Le lien renvoie au relevé d’origine.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {est.criteres.map((it) => {
          const Icon = CRIT_ICON[it.st];
          return (
            <div key={it.c} className="crit" data-st={it.st}>
              <span className="crit-ico" data-st={it.st}>
                <Icon />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 3 }}>{it.c}</div>
                <div className="crit-meas">
                  <span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{it.measure}</span>
                  <span style={{ color: 'var(--fg3)' }}>{it.threshold}</span>
                </div>
                {it.note && <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{it.note}</div>}
              </div>
              {auditHref && (
                <Link href={auditHref} className="btn-out" style={{ textDecoration: 'none', flexShrink: 0 }}>
                  Voir dans l’audit
                  <IcoArrowR />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Sec>
  );
}

/* ── FICHE : ÉDITEUR DE ZONE DESSERVIE — l'élément le plus important de l'écran ── */

const ZONE_MODES = [
  ['rayon', 'Point et rayon'],
  ['secteurs', 'Liste de secteurs'],
  ['grille', 'Grille de points'],
] as const;

export function ZoneEditorCard({ est }: { est: Establishment }) {
  const init = est.zone;
  const [mode, setMode] = useState<(typeof ZONE_MODES)[number][0]>(init ? init.mode : 'rayon');
  const [rayonKm, setRayonKm] = useState(init && init.mode === 'rayon' ? init.km : 8);
  const [secteurs, setSecteurs] = useState<string[]>(init && init.mode === 'secteurs' ? init.secteurs : []);
  const [secInput, setSecInput] = useState('');
  const [grid, setGrid] = useState(init && init.mode === 'grille' ? `${init.rows}x${init.cols}` : '5x5');
  const [spacing, setSpacing] = useState(init && init.mode === 'grille' ? init.spacingKm : 1);
  const [saved, setSaved] = useState(!!init);
  const [rows, cols] = grid.split('x').map(Number);
  const points = rows * cols;
  const monthlyCost = (points * GRID_POINT_PRICE).toFixed(2);
  const addSecteur = () => {
    const v = secInput.trim();
    if (v && !secteurs.includes(v)) setSecteurs((s) => [...s, v]);
    setSecInput('');
  };

  return (
    <div className="card" id="zone-editor" style={{ padding: '1rem 1.125rem', borderTop: '2px solid var(--green-b)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color: 'var(--green-fg)', display: 'flex' }}>
              <IcoLayers />
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>Zone desservie</span>
            {!saved && <Pill label="Jamais configurée" tone="yellow" sm icon={<IcoWarn />} />}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.5 }}>
            Réglée par établissement, selon ce que le commerce dessert et d’où il se trouve. Choisissez le mode qui correspond à ce commerce.
          </div>
        </div>
      </div>

      <div className="seg" role="group" aria-label="Mode de zone desservie" style={{ marginBottom: 14 }}>
        {ZONE_MODES.map(([id, l]) => (
          <button
            key={id}
            type="button"
            data-on={mode === id}
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
          >
            {l}
          </button>
        ))}
      </div>

      {mode === 'rayon' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }} aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bd-solid)" strokeDasharray="3 4" />
            <circle cx="60" cy="60" r="34" fill="none" stroke="var(--bd-strong)" strokeDasharray="3 4" />
            <circle cx="60" cy="60" r="16" fill="var(--green-m)" stroke="var(--green-b)" />
            <circle cx="60" cy="60" r="3.5" fill="var(--green-fg)" />
          </svg>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <Lbl mb={6}>Rayon depuis l’adresse de l’établissement</Lbl>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range"
                min={1}
                max={40}
                value={rayonKm}
                onChange={(e) => {
                  setRayonKm(+e.target.value);
                  setSaved(false);
                }}
                style={{ flex: 1 }}
                aria-label="Rayon en kilomètres"
              />
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: '4rem', textAlign: 'right' }}>
                {rayonKm} km
              </span>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 6, lineHeight: 1.5 }}>
              Simple et rapide : convient à un commerce de quartier dont la clientèle vient d’une zone à peu près circulaire.
            </div>
          </div>
        </div>
      )}

      {mode === 'secteurs' && (
        <div>
          <Lbl mb={6}>Villes, arrondissements ou codes postaux desservis</Lbl>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {secteurs.map((s) => (
              <span key={s} className="sector-chip">
                {s}
                <button
                  type="button"
                  aria-label={`Retirer ${s}`}
                  onClick={() => {
                    setSecteurs((ss) => ss.filter((x) => x !== s));
                    setSaved(false);
                  }}
                >
                  <IcoX />
                </button>
              </span>
            ))}
            {secteurs.length === 0 && <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>Aucun secteur ajouté</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              className="inp"
              value={secInput}
              onChange={(e) => setSecInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSecteur()}
              placeholder="Ex. Longueuil, J4K, Vieux-Longueuil…"
              style={{ flex: 1 }}
              aria-label="Ajouter un secteur"
            />
            <button type="button" className="btn-out" onClick={addSecteur}>
              <IcoPlus />
              Ajouter
            </button>
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 8, lineHeight: 1.5 }}>
            Adapté à un commerce qui dessert des secteurs précis plutôt qu’un cercle continu.
          </div>
        </div>
      )}

      {mode === 'grille' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="grille-viz" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
            {Array.from({ length: points }).map((_, i) => {
              const isCenter = i === Math.floor(points / 2);
              return <span key={i} className="grille-dot" data-center={isCenter} />;
            })}
          </div>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <div>
                <Lbl mb={4}>Densité de la grille</Lbl>
                <select
                  className="date-sel"
                  value={grid}
                  onChange={(e) => {
                    setGrid(e.target.value);
                    setSaved(false);
                  }}
                  aria-label="Densité de la grille"
                >
                  <option value="3x3">3 × 3 · 9 points</option>
                  <option value="5x5">5 × 5 · 25 points</option>
                  <option value="7x7">7 × 7 · 49 points</option>
                </select>
              </div>
              <div>
                <Lbl mb={4}>Écart entre les points</Lbl>
                <select
                  className="date-sel"
                  value={spacing}
                  onChange={(e) => {
                    setSpacing(+e.target.value);
                    setSaved(false);
                  }}
                  aria-label="Écart entre les points"
                >
                  <option value={0.5}>0,5 km</option>
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                </select>
              </div>
            </div>
            <div className="note-box" style={{ marginTop: 0, background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
              <span style={{ color: 'var(--yellow-fg)', display: 'flex', marginTop: 1 }}>
                <IcoRuler />
              </span>
              <div style={{ flex: 1 }}>
                <b>
                  {points} points de mesure · environ {monthlyCost} $ CA / mois de relevés.
                </b>{' '}
                La densité déterminera le coût : chaque point mesure séparément la variation du pack local à cet endroit.
              </div>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 8, lineHeight: 1.5 }}>
              Le plus précis des trois modes : convient pour mesurer finement la variation de visibilité selon le quartier.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button type="button" className="btn-pri" onClick={() => setSaved(true)}>
          <IcoCheck />
          {saved ? 'Zone enregistrée' : 'Enregistrer la zone'}
        </button>
      </div>
    </div>
  );
}

/* ── FICHE : PUBLICATIONS RÉCENTES ── */

export function PublicationsCard({ est }: { est: Establishment }) {
  return (
    <Sec title="Publications Google récentes" sub={est.publications.length ? `${est.publications.length} publication${est.publications.length > 1 ? 's' : ''}` : undefined}>
      {est.publications.length === 0 ? (
        <div className="empty">Aucune publication dans les 60 derniers jours. Une fiche active publie au moins une fois par mois.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {est.publications.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 9,
                alignItems: 'flex-start',
                padding: '8px 0',
                borderTop: i > 0 ? '1px solid var(--bd)' : 'none',
              }}
            >
              <span className="crit-ico" data-st={p.expiree ? 'na' : 'ok'}>
                <IcoMegaphone />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.text}</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>
                  {p.type} · {p.date} · {p.vues} vues{p.expiree ? ' · expirée' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Sec>
  );
}

/* ── FICHE : QUESTIONS SANS RÉPONSE ── */

export function QaCard({ est }: { est: Establishment }) {
  return (
    <Sec
      title="Questions-réponses"
      sub={est.qa.length ? `${est.qa.length} question${est.qa.length > 1 ? 's' : ''} sans réponse` : undefined}
      right={est.qa.length > 0 ? <Pill label="Sans réponse" tone="yellow" sm icon={<IcoWarn size={12} />} /> : null}
    >
      {est.qa.length === 0 ? (
        <div className="empty">Aucune question en attente.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {est.qa.map((q, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 9,
                alignItems: 'flex-start',
                padding: '8px 0',
                borderTop: i > 0 ? '1px solid var(--bd)' : 'none',
              }}
            >
              <span className="crit-ico" data-st="warn">
                <IcoMsg />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{q.q}</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>Posée le {q.date}</div>
              </div>
              <button type="button" className="btn-out" style={{ flexShrink: 0 }}>
                Répondre
              </button>
            </div>
          ))}
        </div>
      )}
    </Sec>
  );
}

/* ── FICHE : STATISTIQUES ── */

export function StatsCard({ est }: { est: Establishment }) {
  if (!est.stats) return null;
  const rows: [string, number, number, (p: IconProps) => React.ReactElement][] = [
    ['Appels', est.stats.appels, est.stats.appelsD, IcoPhone],
    ['Itinéraires', est.stats.itin, est.stats.itinD, IcoRoute],
    ['Visites du site', est.stats.visites, est.stats.visitesD, IcoGlobe],
  ];
  return (
    <Sec title="Statistiques · 30 derniers jours">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {rows.map(([l, v, d, Icon]) => (
          <div key={l} style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: '0.55rem 0.65rem' }}>
            <div style={{ color: 'var(--fg3)', marginBottom: 4 }}>
              <Icon />
            </div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 2 }}>{l}</div>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: d >= 0 ? 'var(--green-fg)' : 'var(--red)', marginTop: 3 }}>
              {d >= 0 ? '+' : '−'}
              {Math.abs(d)} vs mois précédent
            </div>
          </div>
        ))}
      </div>
    </Sec>
  );
}

/* ── FICHE : ACCÈS AUX ÉCRANS LIÉS ── */

export function LinkedScreensCard({ est }: { est: Establishment }) {
  return (
    <Sec title="Écrans liés">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link href={routes.etablissementAvis(est.id)} className="loc-link-row" style={{ textDecoration: 'none' }}>
          <span className="crit-ico" data-st="neutral">
            <IcoStar />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Avis</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
              {est.note}/5 · {est.avisSansReponse} sans réponse
            </div>
          </div>
          <IcoArrowR />
        </Link>
        <Link href={routes.etablissementCitations(est.id)} className="loc-link-row" style={{ textDecoration: 'none' }}>
          <span className="crit-ico" data-st="neutral">
            <IcoLayers />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Citations</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>
              {est.citTotal}/{est.citRef} annuaires · {est.incoh} incohérence{(est.incoh ?? 0) > 1 ? 's' : ''}
            </div>
          </div>
          <IcoArrowR />
        </Link>
        <Link href={routes.etablissementPositions(est.id)} className="loc-link-row" style={{ textDecoration: 'none' }}>
          <span className="crit-ico" data-st="neutral">
            <IcoRoute />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Positions · pack local</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Position moyenne {est.packPos}</div>
          </div>
          <IcoArrowR />
        </Link>
        <Link href={routes.etablissementConcurrence(est.id)} className="loc-link-row" style={{ textDecoration: 'none' }}>
          <span className="crit-ico" data-st="neutral">
            <IcoCompare />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Concurrence locale</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Qui vous devance dans le pack</div>
          </div>
          <IcoArrowR />
        </Link>
      </div>
    </Sec>
  );
}
