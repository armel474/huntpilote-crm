'use client';

/**
 * Keyword Hunter — blocs propres à l'outil (départ et filtres, regroupement
 * par thème, conservation du résultat).
 *
 * Réutilise `.fam`, `.fam-top`, `.fam-head`, `.fam-act`, `.chev`, `.fam-body`,
 * `.pg-btn`, `.card`, `Sec`, `Pill` du reste de l'application — voir
 * `docs/briefs/socle-partage.md`. Le cadre commun (barre de contexte,
 * bandeaux, coût, historique) vient de `components/outils/*`.
 */
import { Pill, Sec } from '@/components/ui/Atoms';
import {
  IcoChevR,
  IcoClock,
  IcoDoc,
  IcoFlat,
  IcoSnow,
  IcoSrch,
  IcoSun,
  type IconProps,
} from '@/components/ui/Icons';
import { KH_INTENTS, KH_TREND, diffTone, type KhFilters, type KhSuggestion, type KhTrendId } from '@/lib/data/keyword-hunter';

const TREND_ICON: Record<KhTrendId, (p: IconProps) => React.ReactElement> = {
  hiver: IcoSnow,
  ete: IcoSun,
  stable: IcoFlat,
};

/* ── Départ et filtres — le seuil actif s'affiche à côté de chaque mesure filtrée ── */

export function SeedFilters({
  seed,
  onSeed,
  onExplore,
  f,
  onF,
}: {
  seed: string;
  onSeed: (v: string) => void;
  onExplore: () => void;
  f: KhFilters;
  onF: (f: KhFilters) => void;
}) {
  return (
    <div className="card" style={{ padding: '0.875rem 1rem' }}>
      <div className="seed-row">
        <input
          className="seed-inp"
          value={seed}
          onChange={(e) => onSeed(e.target.value)}
          placeholder="Mot-clé racine, URL ou thème…"
          aria-label="Point de départ de l’exploration"
        />
        <button type="button" className="btn-out" onClick={onExplore}>
          <IcoSrch />
          Explorer
        </button>
      </div>
      <div className="filt-grid">
        <div className="filt-g">
          <span className="lbl" style={{ marginBottom: 0 }}>
            Volume minimum · {f.volMin}/mois
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={f.volMin}
            onChange={(e) => onF({ ...f, volMin: +e.target.value })}
            aria-label="Volume minimum"
          />
        </div>
        <div className="filt-g">
          <span className="lbl" style={{ marginBottom: 0 }}>
            Difficulté maximum · ≤ {f.diffMax}
          </span>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={f.diffMax}
            onChange={(e) => onF({ ...f, diffMax: +e.target.value })}
            aria-label="Difficulté maximum"
          />
        </div>
        <div className="filt-g">
          <span className="lbl" style={{ marginBottom: 0 }}>
            Intention
          </span>
          <select className="inp" value={f.intent} onChange={(e) => onF({ ...f, intent: e.target.value as KhFilters['intent'] })}>
            <option value="toutes">Toutes</option>
            {KH_INTENTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div className="filt-g">
          <span className="lbl" style={{ marginBottom: 0 }}>
            Longueur de la requête
          </span>
          <select className="inp" value={f.length} onChange={(e) => onF({ ...f, length: e.target.value as KhFilters['length'] })}>
            <option value="toutes">Toutes</option>
            <option value="courte">Courte · ≤ 3 mots</option>
            <option value="longue">Longue · ≥ 5 mots</option>
          </select>
        </div>
        <div className="filt-g">
          <span className="lbl" style={{ marginBottom: 0 }}>
            &nbsp;
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', color: 'var(--fg2)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={f.question}
              onChange={(e) => onF({ ...f, question: e.target.checked })}
              style={{ accentColor: 'var(--green)' }}
            />
            Contient une question
          </label>
        </div>
      </div>
    </div>
  );
}

/* ── Regroupement par thème — ce qui rend 400 requêtes utilisables ── */

export function ThemeGroup({
  theme,
  rows,
  open,
  onToggle,
  sel,
  onToggleRow,
  onToggleAll,
  brief,
  onBrief,
  f,
}: {
  theme: string;
  rows: readonly KhSuggestion[];
  open: boolean;
  onToggle: () => void;
  sel: ReadonlySet<string>;
  onToggleRow: (c: string) => void;
  onToggleAll: (rows: readonly KhSuggestion[], on: boolean) => void;
  brief?: string;
  onBrief: (theme: string) => void;
  f: KhFilters;
}) {
  const nSel = rows.filter((r) => sel.has(r.c)).length;
  const avgVol = Math.round(rows.reduce((s, r) => s + r.vol, 0) / rows.length);

  return (
    <div className="fam">
      <div className="fam-top">
        <button type="button" className="fam-head" onClick={onToggle} aria-expanded={open}>
          <span className="chev" data-open={open}>
            <IcoChevR />
          </span>
          <span style={{ flex: '1 1 12rem', minWidth: 0 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{theme}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginLeft: 8 }}>
              {rows.length} requête{rows.length > 1 ? 's' : ''} · volume moyen {avgVol.toLocaleString('fr-CA')}/mois
            </span>
          </span>
        </button>
        <div className="fam-act">
          {brief ? (
            <Pill label={`Brief ${brief} créé`} tone="blue" sm icon={<IcoDoc size={10} />} />
          ) : (
            <button type="button" className="btn-out" onClick={() => onBrief(theme)}>
              <IcoDoc size={11} />
              Créer un brief d’article
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="fam-body">
          <div className="kh-head">
            <input
              type="checkbox"
              checked={rows.length > 0 && nSel === rows.length}
              onChange={(e) => onToggleAll(rows, e.target.checked)}
              aria-label={`Sélectionner tout le thème ${theme}`}
            />
            <span className="lbl" style={{ marginBottom: 0 }}>
              Requête
            </span>
            <span className="lbl" style={{ marginBottom: 0 }}>
              Volume
              <span className="kh-thr">seuil ≥ {f.volMin}</span>
            </span>
            <span className="lbl" style={{ marginBottom: 0 }}>
              Difficulté
              <span className="kh-thr">seuil ≤ {f.diffMax}</span>
            </span>
            <span className="lbl" style={{ marginBottom: 0 }}>
              Intention
            </span>
            <span className="lbl" style={{ marginBottom: 0 }}>
              Tendance
            </span>
          </div>
          {rows.map((r) => {
            const trend = KH_TREND[r.trend];
            const TrendIcon = TREND_ICON[r.trend];
            return (
              <div className="kh-row" key={r.c}>
                <input
                  type="checkbox"
                  checked={sel.has(r.c)}
                  onChange={() => onToggleRow(r.c)}
                  aria-label={`Sélectionner ${r.c}`}
                />
                <span className="kh-q">
                  {r.c}
                  {r.question && <Pill label="Question" tone="neutral" sm />}
                </span>
                <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{r.vol.toLocaleString('fr-CA')}</span>
                <Pill label={r.diff} tone={diffTone(r.diff)} sm />
                <Pill label={r.intent} tone="neutral" sm />
                <span className="trend-tag">
                  <TrendIcon />
                  {trend.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Conservation — outil éphémère : le geste d'enregistrer est d'autant plus visible ── */

export function KhKeepCard({ prospect }: { prospect: boolean }) {
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
        Cette exploration n’est jamais historisée, même pour un client. Le cache disparaît après 30 jours.
      </p>
      <div className="note-box" style={{ marginTop: 0, background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
        <b>Enregistrer dans la fiche</b> ou <b>ajouter au suivi de positions</b> sont les deux seuls moyens de garder une
        trace de cette recherche.
      </div>
    </Sec>
  );
}
