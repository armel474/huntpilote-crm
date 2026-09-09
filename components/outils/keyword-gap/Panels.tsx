'use client';

/**
 * Keyword Gap — blocs propres à l'outil (gestion des concurrents comparés,
 * catégories manquants/faibles/forts/uniques, conservation du résultat).
 *
 * Réutilise `.chev`, `.pg-btn`, `.card`, `Sec`, `Pill`, `toneColors` du reste
 * de l'application — voir `docs/briefs/socle-partage.md`. Le cadre commun
 * (barre de contexte, bandeaux, historique) vient de `components/outils/*`.
 */
import { useState } from 'react';
import Link from 'next/link';
import { Pill, Sec, toneColors } from '@/components/ui/Atoms';
import { IcoAlert, IcoArrowR, IcoChevD, IcoChevR, IcoChevU, IcoClock, IcoPlus, IcoStar, IcoX, type IconProps } from '@/components/ui/Icons';
import {
  KG_VOL_FORT,
  type KgCategory,
  type KgCategoryId,
  type KgCompetitor,
  type KgRow,
} from '@/lib/data/keyword-gap';

const CAT_ICON: Record<KgCategoryId, (p: IconProps) => React.ReactElement> = {
  manquants: IcoAlert,
  faibles: IcoChevD,
  forts: IcoChevU,
  uniques: IcoStar,
};

/* ── Gestion des concurrents comparés — jusqu'à trois ── */

export function CompManage({
  clientName,
  competitors,
  onRemove,
  onAdd,
}: {
  clientName: string;
  competitors: readonly KgCompetitor[];
  onRemove: (domain: string) => void;
  onAdd: (domain: string) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="card" style={{ padding: '0.875rem 1rem' }}>
      <div className="lbl">Client et concurrents comparés</div>
      <div className="comp-manage">
        <span className="comp-chip" style={{ background: 'var(--green-m)', borderColor: 'var(--green-b)', color: 'var(--green-fg)' }}>
          {clientName} · vous
        </span>
        {competitors.map((c) => (
          <span className="comp-chip" data-nodata={!!c.noData} key={c.domain}>
            {c.name}
            {c.noData && ' · sans données'}
            <button type="button" onClick={() => onRemove(c.domain)} aria-label={`Retirer ${c.name}`}>
              <IcoX />
            </button>
          </span>
        ))}
        {competitors.length < 3 && (
          <span style={{ display: 'inline-flex', gap: 5 }}>
            <input
              className="inp"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Domaine concurrent…"
              aria-label="Ajouter un concurrent"
              style={{ width: '11rem' }}
            />
            <button
              type="button"
              className="btn-out"
              onClick={() => {
                if (draft.trim()) {
                  onAdd(draft.trim());
                  setDraft('');
                }
              }}
            >
              <IcoPlus />
              Ajouter
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Catégorie — la lecture qui fait la valeur de l'outil ── */

export function CatGroup({
  cat,
  rows,
  competitors,
  open,
  onToggle,
  created,
  onCreate,
  onTrack,
  prioHref,
}: {
  cat: KgCategory;
  rows: readonly KgRow[];
  competitors: readonly KgCompetitor[];
  open: boolean;
  onToggle: () => void;
  created: Record<string, string>;
  onCreate: (c: string) => void;
  onTrack: (c: string) => void;
  prioHref: (prio: string) => string;
}) {
  const gcols = `1.7fr 80px 64px ${competitors.map(() => '64px').join(' ')} 140px`;
  const nFort = cat.id === 'manquants' ? rows.filter((r) => r.vol >= KG_VOL_FORT).length : 0;
  const Icon = CAT_ICON[cat.id];
  const { bg, border, fg } = toneColors(cat.tone);

  return (
    <div className="cat" data-tone={cat.tone}>
      <button type="button" className="cat-head" onClick={onToggle} aria-expanded={open}>
        <span className="chev" data-open={open}>
          <IcoChevR />
        </span>
        <span className="cat-ico" style={{ background: bg, color: fg, borderColor: border }}>
          <Icon />
        </span>
        <span style={{ flex: '1 1 12rem', minWidth: 0 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{cat.label}</span>
          <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginLeft: 8 }}>
            {rows.length} requête{rows.length > 1 ? 's' : ''}
            {nFort > 0 ? ` · ${nFort} à fort volume` : ''}
          </span>
          <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{cat.sub}</span>
        </span>
      </button>
      {open && rows.length > 0 && (
        <div className="cat-body">
          <div className="gap-head" style={{ '--gcols': gcols } as React.CSSProperties}>
            <span className="lbl" style={{ marginBottom: 0 }}>
              Requête
            </span>
            <span className="lbl" style={{ marginBottom: 0 }}>
              Volume
            </span>
            <span className="lbl" style={{ marginBottom: 0, textAlign: 'center' }}>
              Vous
            </span>
            {competitors.map((c) => (
              <span
                className="lbl"
                key={c.domain}
                style={{ marginBottom: 0, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={c.name}
              >
                {c.name.split(' ')[0]}
              </span>
            ))}
            <span className="lbl" style={{ marginBottom: 0 }} />
          </div>
          {rows.map((r) => {
            const prio = created[r.c];
            const actionable = cat.id === 'manquants' || cat.id === 'faibles';
            return (
              <div className="gap-row" key={r.c} style={{ '--gcols': gcols } as React.CSSProperties}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {r.c}
                  {cat.id === 'manquants' && r.vol >= KG_VOL_FORT && <Pill label="Fort volume" tone="red" sm />}
                </span>
                <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', color: 'var(--fg2)' }}>
                  {r.vol.toLocaleString('fr-CA')}/mois
                </span>
                <span className="pos-cell" data-you="true" data-none={r.posClient === null}>
                  {r.posClient === null ? '—' : r.posClient}
                </span>
                {competitors.map((c, i) => {
                  const v = r.posComps[i];
                  return c.noData ? (
                    <span key={c.domain} className="pos-cell" data-none="true" title="Données indisponibles pour ce concurrent">
                      n.d.
                    </span>
                  ) : (
                    <span key={c.domain} className="pos-cell" data-none={v === null}>
                      {v === null ? '—' : v}
                    </span>
                  );
                })}
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {actionable ? (
                    prio ? (
                      <Link href={prioHref(prio)} style={{ textDecoration: 'none' }}>
                        <Pill label={prio} tone="blue" sm icon={<IcoArrowR />} />
                      </Link>
                    ) : (
                      <button type="button" className="pg-btn" onClick={() => onCreate(r.c)}>
                        <IcoPlus size={10} />
                        Priorité
                      </button>
                    )
                  ) : (
                    <button type="button" className="pg-btn" onClick={() => onTrack(r.c)}>
                      <IcoPlus size={10} />
                      Suivre
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Conservation — outil éphémère ── */

export function GapKeepCard({ prospect }: { prospect: boolean }) {
  return (
    <Sec title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?" accent="var(--yellow-b)">
      <div style={{ marginBottom: 9 }}>
        <Pill
          label={prospect ? 'Instantané · jamais historisé' : 'Éphémère · purgé après 30 jours'}
          tone="yellow"
          icon={<IcoClock />}
        />
      </div>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 9 }}>
        La comparaison n’est pas historisée. Seule la carte Concurrence de la fiche garde une trace, et seulement si
        vous l’enregistrez.
      </p>
      <div className="note-box" style={{ marginTop: 0, background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
        <b>Enregistrer dans la fiche</b> met à jour la carte Concurrence — c’est la seule action principale de
        l’écran.
      </div>
    </Sec>
  );
}
