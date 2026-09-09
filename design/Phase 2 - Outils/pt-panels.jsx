/* HuntPilote — Position Tracking : blocs de l'outil. Réutilise .card, ASec, APill, A_STATUS. */
const { useState: uPT, useMemo: mPT } = React;
const AI5 = window.AIco, AP5 = window.APill, AS5 = window.ASec, PI5 = window.PTI;

const bucket = pos => pos === null ? 'hors' : pos <= 3 ? 'top3' : pos <= 10 ? 'top10' : pos <= 30 ? 'top30' : 'hors';
const BUCKETS = [['top3', 'Top 3'], ['top10', 'Top 4–10'], ['top30', 'Top 11–30'], ['hors', 'Au-delà · hors top 30']];

/* ── MOUVEMENTS NOTABLES — ce qu'on regarde en premier ── */
const MoversCard = ({ rows, premier }) => {
  const comparable = rows.filter(r => r.prev !== null && r.pos !== null);
  const gains = [...comparable].sort((a, b) => (b.prev - b.pos) - (a.prev - a.pos)).filter(r => r.prev - r.pos > 0).slice(0, 3);
  const losses = [...comparable].sort((a, b) => (a.prev - a.pos) - (b.prev - b.pos)).filter(r => r.prev - r.pos < 0).slice(0, 3);
  const dropped = rows.filter(r => r.dropped);
  return (
    <AS5 title="Mouvements notables" sub={premier ? 'Premier relevé : rien à comparer encore' : 'Comparés au relevé de la période précédente'}>
      {premier
        ? <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', textAlign: 'center', padding: '10px 0' }}>Revenez après le prochain relevé hebdomadaire pour voir les hausses et les baisses.</div>
        : (<div className="mov-grid">
            <div>
              <div className="mov-col-head" style={{ color: 'var(--green-fg)' }}><PI5.Up />Plus fortes hausses</div>
              {gains.length === 0 && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Aucune amélioration cette période.</div>}
              {gains.map(r => <div className="mov-row" key={r.c}><span className="mov-q">{r.c}</span><AP5 label={`+${r.prev - r.pos}`} tone="green" sm icon={<PI5.Up />} /><span className="mov-pos">{r.prev} → {r.pos}</span></div>)}
            </div>
            <div>
              <div className="mov-col-head" style={{ color: 'var(--red)' }}><PI5.Down />Plus fortes baisses</div>
              {losses.length === 0 && dropped.length === 0 && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Aucune baisse cette période.</div>}
              {losses.map(r => <div className="mov-row" key={r.c}><span className="mov-q">{r.c}</span><AP5 label={`−${r.pos - r.prev}`} tone="red" sm icon={<PI5.Down />} /><span className="mov-pos">{r.prev} → {r.pos}</span></div>)}
              {dropped.map(r => <div className="mov-row" key={r.c}><span className="mov-q">{r.c}</span><AP5 label="Hors top 100" tone="red" sm /><span className="mov-pos">{r.prev} → —</span></div>)}
            </div>
          </div>)}
    </AS5>);
};

/* ── RÉPARTITION PAR TRANCHE — l'indicateur qui parle au client ── */
const DistributionCard = ({ rows, premier }) => {
  const counts = BUCKETS.map(([id]) => rows.filter(r => bucket(r.pos) === id).length);
  const prevCounts = BUCKETS.map(([id]) => rows.filter(r => r.prev !== null && bucket(r.prev) === id).length);
  const total = rows.length || 1;
  const colors = ['var(--green)', 'var(--green-b)', 'var(--yellow-b)', 'var(--bd-strong)'];
  return (
    <AS5 title="Répartition par tranche" sub={`${rows.length} mots-clés suivis · seuil de premier plan : position ≤ ${window.PT_THRESHOLD}`}>
      <div className="dist-bar" style={{ marginBottom: 11 }}>{counts.map((c, i) => c > 0 && <span key={i} style={{ width: `${c / total * 100}%`, background: colors[i] }}></span>)}</div>
      <div className="dist-grid">
        {BUCKETS.map(([id, label], i) => {
          const delta = counts[i] - prevCounts[i];
          return (
            <div className="dist-cell" key={id}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{counts[i]}</div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{label}</div>
              {!premier && delta !== 0 && <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: delta > 0 && id !== 'hors' ? 'var(--green-fg)' : delta < 0 && id === 'hors' ? 'var(--green-fg)' : 'var(--red)', marginTop: 3 }}>{delta > 0 ? '+' : '−'}{Math.abs(delta)}</div>}
            </div>);
        })}
      </div>
    </AS5>);
};

/* ── COURBE D'ÉVOLUTION du mot-clé sélectionné ── */
const TrendCard = ({ sel, period }) => {
  const pts = sel.history;
  const vals = pts.filter(v => v !== null);
  const max = Math.max(...vals, 10), min = Math.min(...vals, 1);
  const W = 280, H = 90, pad = 8;
  const x = i => pad + (i / Math.max(pts.length - 1, 1)) * (W - pad * 2);
  const y = v => pad + ((v - min) / Math.max(max - min, 1)) * (H - pad * 2);
  let d = '', started = false;
  pts.forEach((v, i) => { if (v === null) { started = false; return; } d += (started ? 'L' : 'M') + x(i) + ' ' + y(v) + ' '; started = true; });
  return (
    <AS5 title="Évolution du mot-clé sélectionné" sub={`${sel.c} · ${period.toLowerCase()}`}>
      <div className="trend-wrap">
        <svg className="trend-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Évolution de la position pour ${sel.c}`}>
          <line x1={pad} y1={y(window.PT_THRESHOLD)} x2={W - pad} y2={y(window.PT_THRESHOLD)} stroke="var(--yellow-b)" strokeWidth="1" strokeDasharray="3 3" />
          <path d={d} fill="none" stroke="var(--green-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((v, i) => v !== null && <circle key={i} className="trend-pt" cx={x(i)} cy={y(v)} r="2.6" />)}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: 'var(--fg3)' }}>
          <span>Position {max} (bas)</span><span style={{ color: 'var(--yellow-fg)' }}>seuil ≤ {window.PT_THRESHOLD}</span><span>Position {min} (haut)</span>
        </div>
      </div>
    </AS5>);
};

/* ── TABLEAU DES MOTS-CLÉS SUIVIS + gestion de la liste ── */
const KeywordTable = ({ rows, allRows, sel, onSel, q, onQ, group, onGroup, created, onCreate, onRemove, onAdd }) => {
  const [draft, setDraft] = uPT('');
  return (
    <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="res-bar">
        <input className="inp" value={q} onChange={e => onQ(e.target.value)} placeholder="Filtrer les mots-clés…" aria-label="Filtrer les mots-clés" style={{ width: '12rem' }} />
        <div className="chips" role="group" aria-label="Filtrer par thème">
          <button type="button" className={`chip${group === 'tous' ? ' on' : ''}`} onClick={() => onGroup('tous')}>Tous les thèmes</button>
          {window.PT_GROUPS.map(g => <button type="button" key={g} className={`chip${group === g ? ' on' : ''}`} onClick={() => onGroup(g)}>{g}</button>)}
        </div>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{allRows.length} suivis au total</span>
      </div>
      <div className="add-row">
        <input className="inp" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Ajouter un mot-clé à suivre…" aria-label="Nouveau mot-clé" style={{ flex: '1 1 12rem' }} />
        <button className="btn-out" onClick={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft(''); } }}><PI5.Plus />Ajouter au suivi</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div className="kw-head">
          {['Requête', 'Position', 'Variation', 'Volume', 'URL positionnée', 'Intention', ''].map(h => <div key={h} className="lbl" style={{ marginBottom: 0 }}>{h}</div>)}
        </div>
        {rows.length === 0 && <div className="empty" style={{ marginTop: 8 }}><div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Aucun mot-clé pour ces filtres</div></div>}
        {rows.map(r => {
          const bkt = bucket(r.pos);
          const posTone = r.pos === null ? 'red' : r.pos <= window.PT_THRESHOLD ? 'green' : 'yellow';
          const delta = (r.prev !== null && r.pos !== null) ? r.prev - r.pos : null;
          const prio = r.prio || created[r.c];
          const actionable = r.pos === null || r.pos > window.PT_THRESHOLD;
          return (
            <div className="kw-row" key={r.c} data-sel={sel && sel.c === r.c}>
              <div className="kw-cell" data-col="q">
                <button className="kw-q" onClick={() => onSel(r)} title="Voir l’évolution">{r.c}</button>
                <span className="kw-grp">{r.group}{r.cannib && <span style={{ marginLeft: 6, display: 'inline-block' }}><AP5 label="Cannibalisation" tone="yellow" sm icon={<PI5.Fork />} /></span>}</span>
              </div>
              <div className="kw-cell" data-label="Position" data-col="pos"><AP5 label={r.isNew ? 'Nouveau' : r.pos === null ? 'Hors top 100' : `Position ${r.pos}`} tone={r.isNew ? 'blue' : posTone} sm /></div>
              <div className="kw-cell" data-label="Variation" data-col="delta">
                {r.isNew ? <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>1er relevé</span>
                  : delta === null ? <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>—</span>
                  : delta === 0 ? <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><PI5.Flat />stable</span>
                  : <span style={{ fontSize: '0.625rem', fontWeight: 700, color: delta > 0 ? 'var(--green-fg)' : 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{delta > 0 ? <PI5.Up /> : <PI5.Down />}{Math.abs(delta)}</span>}
              </div>
              <div className="kw-cell kw-vol" data-label="Volume" data-col="vol">{r.vol.toLocaleString('fr-CA')}/mois</div>
              <div className="kw-cell kw-url" data-label="URL" data-col="url" title={r.urls.join(', ')}>{r.urls.length === 0 ? '—' : r.urls.length > 1 ? `${r.urls.length} URL en concurrence` : r.urls[0]}</div>
              <div className="kw-cell" data-label="Intention" data-col="intent"><AP5 label={r.intent} tone="neutral" sm /></div>
              <div className="kw-cell" data-col="act" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                {prio
                  ? <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><AP5 label={`${prio}`} tone="blue" sm icon={<AI5.Arrow />} /></a>
                  : actionable ? <button className="pg-btn" onClick={() => onCreate(r.c)}><PI5.Plus />Priorité</button> : null}
                <button className="kw-rm" onClick={() => onRemove(r.c)} title={`Retirer ${r.c} du suivi`} aria-label={`Retirer ${r.c} du suivi`}><PI5.X /></button>
              </div>
            </div>);
        })}
      </div>
      <div className="note-box"><span style={{ color: 'var(--fg3)', display: 'flex', marginTop: 1 }}><window.TI.Info /></span><span><b>Créer la priorité</b> apparaît sur les mots-clés sous le seuil ou sortis du classement. <b>Enregistrer dans la fiche</b>, en haut, verse le relevé complet à l’historique — c’est la seule action principale de l’écran.</span></div>
    </div>);
};

/* ── COÛT MENSUEL — déterminé par le nombre de mots-clés suivis ── */
const PlanCard = ({ n }) => {
  const tier = window.PLAN_TIERS.find(t => n <= t.max) || window.PLAN_TIERS[window.PLAN_TIERS.length - 1];
  const idx = window.PLAN_TIERS.indexOf(tier);
  const prevMax = idx > 0 ? window.PLAN_TIERS[idx - 1].max : 0;
  const pct = Math.min(100, Math.round((n - prevMax) / (tier.max - prevMax) * 100));
  return (
    <AS5 title="Coût mensuel du suivi" sub="Déterminé par le nombre de mots-clés suivis pour ce compte.">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{n}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg2)' }}>mots-clés suivis</span>
      </div>
      <div className="plan-track"><div className="fill" style={{ width: `${pct}%` }}></div></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: 'var(--fg3)' }}><span>Palier jusqu’à {tier.max}</span><span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{tier.price}</span></div>
    </AS5>);
};

/* ── CONSERVATION — variante propre à cet outil : chaque relevé hebdomadaire est historisé ── */
const PtKeepCard = ({ prospect }) => (
  <AS5 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
    <div style={{ marginBottom: 9 }}>{prospect ? <AP5 label="Instantané · jamais historisé" tone="yellow" icon={<window.TI.Snap />} /> : <AP5 label="Historisé automatiquement" tone="green" icon={<AI5.Check />} />}</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
      {prospect ? 'Un prospect ne reçoit pas de suivi hebdomadaire. Ce relevé sert au démarchage et disparaît après 30 jours.'
        : 'Chaque relevé hebdomadaire rejoint l’historique du client automatiquement — pas besoin d’enregistrer pour le conserver. Enregistrer dans la fiche ajoute ce relevé précis aux preuves de valeur du compte.'}
    </div>
  </AS5>);

Object.assign(window, { MoversCard, DistributionCard, TrendCard, KeywordTable, PlanCard, PtKeepCard, bucket });
