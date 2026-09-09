/* HuntPilote — Keyword Hunter : blocs de l'outil. Réutilise .card, ASec, APill. */
const { useState: uKH } = React;
const AI7 = window.AIco, AP7 = window.APill, AS7 = window.ASec, KI7 = window.KHI;

const diffTone = d => d <= 40 ? 'green' : d <= 60 ? 'yellow' : 'red';

/* ── DÉPART ET FILTRES — le seuil actif s'affiche à côté de chaque mesure filtrée ── */
const SeedFilters = ({ seed, onSeed, onExplore, f, onF }) => (
  <div className="card" style={{ padding: '0.875rem 1rem' }}>
    <div className="seed-row">
      <input className="seed-inp" value={seed} onChange={e => onSeed(e.target.value)} placeholder="Mot-clé racine, URL ou thème…" aria-label="Point de départ de l’exploration" />
      <button className="btn-out" onClick={onExplore}><KI7.Srch />Explorer</button>
    </div>
    <div className="filt-grid">
      <div className="filt-g">
        <span className="lbl" style={{ marginBottom: 0 }}>Volume minimum · {f.volMin}/mois</span>
        <input type="range" min="0" max="1000" step="50" value={f.volMin} onChange={e => onF({ ...f, volMin: +e.target.value })} />
      </div>
      <div className="filt-g">
        <span className="lbl" style={{ marginBottom: 0 }}>Difficulté maximum · ≤ {f.diffMax}</span>
        <input type="range" min="10" max="100" step="5" value={f.diffMax} onChange={e => onF({ ...f, diffMax: +e.target.value })} />
      </div>
      <div className="filt-g">
        <span className="lbl" style={{ marginBottom: 0 }}>Intention</span>
        <select className="inp" value={f.intent} onChange={e => onF({ ...f, intent: e.target.value })}>
          <option value="toutes">Toutes</option>
          {window.KH_INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className="filt-g">
        <span className="lbl" style={{ marginBottom: 0 }}>Longueur de la requête</span>
        <select className="inp" value={f.length} onChange={e => onF({ ...f, length: e.target.value })}>
          <option value="toutes">Toutes</option>
          <option value="courte">Courte · ≤ 3 mots</option>
          <option value="longue">Longue · ≥ 5 mots</option>
        </select>
      </div>
      <div className="filt-g">
        <span className="lbl" style={{ marginBottom: 0 }}>&nbsp;</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', color: 'var(--fg2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={f.question} onChange={e => onF({ ...f, question: e.target.checked })} style={{ accentColor: 'var(--green)' }} />Contient une question
        </label>
      </div>
    </div>
  </div>);

/* ── REGROUPEMENT PAR THÈME — ce qui rend 400 requêtes utilisables ── */
const ThemeGroup = ({ theme, rows, open, onToggle, sel, onToggleRow, onToggleAll, brief, onBrief, f }) => {
  const nSel = rows.filter(r => sel.has(r.c)).length;
  const avgVol = Math.round(rows.reduce((s, r) => s + r.vol, 0) / rows.length);
  return (
    <div className="fam">
      <button className="fam-head" onClick={onToggle} aria-expanded={open}>
        <span className="chev" data-open={open}><KI7.Chev /></span>
        <span style={{ flex: '1 1 12rem', minWidth: 0 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{theme}</span>
          <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginLeft: 8 }}>{rows.length} requête{rows.length > 1 ? 's' : ''} · volume moyen {avgVol.toLocaleString('fr-CA')}/mois</span>
        </span>
        <span className="fam-act">
          {brief
            ? <AP7 label={`Brief ${brief} créé`} tone="blue" sm icon={<AI7.Check />} />
            : <span className="btn-out" role="button" tabIndex={0} onClick={e => { e.stopPropagation(); onBrief(theme); }} onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onBrief(theme); } }}><KI7.Doc />Créer un brief d’article</span>}
        </span>
      </button>
      {open && (
        <div className="fam-body">
          <div className="kh-head">
            <input type="checkbox" checked={rows.length > 0 && nSel === rows.length} onChange={e => onToggleAll(rows, e.target.checked)} aria-label={`Sélectionner tout le thème ${theme}`} />
            <span className="lbl" style={{ marginBottom: 0 }}>Requête</span>
            <span className="lbl" style={{ marginBottom: 0 }}>Volume<span className="kh-thr">seuil ≥ {f.volMin}</span></span>
            <span className="lbl" style={{ marginBottom: 0 }}>Difficulté<span className="kh-thr">seuil ≤ {f.diffMax}</span></span>
            <span className="lbl" style={{ marginBottom: 0 }}>Intention</span>
            <span className="lbl" style={{ marginBottom: 0 }}>Tendance</span>
          </div>
          {rows.map(r => {
            const trend = window.KH_TREND[r.trend];
            return (
              <div className="kh-row" key={r.c}>
                <input type="checkbox" checked={sel.has(r.c)} onChange={() => onToggleRow(r.c)} aria-label={`Sélectionner ${r.c}`} />
                <span className="kh-q">{r.c}{r.question && <AP7 label="Question" tone="neutral" sm />}</span>
                <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{r.vol.toLocaleString('fr-CA')}</span>
                <AP7 label={r.diff} tone={diffTone(r.diff)} sm />
                <AP7 label={r.intent} tone="neutral" sm />
                <span className="trend-tag"><trend.Icon />{trend.label}</span>
              </div>);
          })}
        </div>)}
    </div>);
};

/* ── CONSERVATION — outil éphémère : le geste d'enregistrer est d'autant plus visible ── */
const KhKeepCard = ({ prospect }) => (
  <AS7 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?" accent="var(--yellow-b)">
    <div style={{ marginBottom: 9 }}><AP7 label={prospect ? 'Instantané · jamais historisé' : 'Éphémère · purgé après 30 jours'} tone="yellow" icon={<AI7.Clock />} /></div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 9 }}>Cette exploration n’est jamais historisée, même pour un client. Le cache disparaît après 30 jours.</div>
    <div className="note-box" style={{ marginTop: 0, background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}><b>Enregistrer dans la fiche</b> ou <b>ajouter au suivi de positions</b> sont les deux seuls moyens de garder une trace de cette recherche.</div>
  </AS7>);

Object.assign(window, { SeedFilters, ThemeGroup, KhKeepCard, diffTone });
