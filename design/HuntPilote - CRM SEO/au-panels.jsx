/* HuntPilote — Audit : panneaux du détail (score pondéré, dimensions, design mesuré, caractérisation). */
const { useState: useAS } = React;
const { AIco: AI, APill: AP, ALbl: AL, ASec: AS, A_STATUS, AUDIT: AU, A_WEIGHTED } = window;

/* ── SCORE GLOBAL ET PONDÉRATION ── */
const ScoreCard = ({ dims, running, failedDim, stale, first }) => {
  const usable = dims.filter(d => !d.na);
  const total = usable.reduce((s, d) => s + d.weight, 0);
  const score = usable.length ? A_WEIGHTED(usable) : null;
  /* Référence de comparaison : l'audit qui précède celui affiché. Aucun delta si rien n'est comparable. */
  const ref = stale ? AU.history[3] : AU.history[1];
  const delta = score === null || running || first || failedDim ? null : score - ref.score;
  const staleDate = AU.staleShown.date;
  return (
    <AS title="Score global de l’audit" sub={score === null ? 'Aucune dimension analysée' : `Moyenne des dimensions analysées, pondérée · ${total} % de la pondération couverte`}
      right={stale ? <AP label="Données de plus de 60 jours" tone="yellow" sm icon={<AI.Clock />} /> : null}>
      <div className="score-row">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: score === null ? 'var(--fg4)' : 'var(--fg1)', fontVariantNumeric: 'tabular-nums' }}>{score === null ? '—' : score}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--fg3)', fontWeight: 600 }}>/ 100</span>
          {delta !== null && <AP label={`${delta >= 0 ? '+' : '−'}${Math.abs(delta)} pts depuis le ${ref.date}`} tone={delta >= 0 ? 'green' : 'red'} sm icon={delta >= 0 ? <AI.Up /> : <AI.Down />} />}
          {first && <AP label="Premier audit · rien à comparer" tone="neutral" sm />}
          {failedDim && !running && <AP label="Non comparable aux audits précédents" tone="yellow" sm icon={<AI.Warn />} />}
        </div>
        <div className="weight-grid">
          {dims.map(d => (
            <div key={d.id} className="weight-cell" data-na={!!d.na}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ color: 'var(--fg3)', display: 'flex' }}><d.Icon /></span>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, flex: 1, minWidth: 0 }}>{d.name}</span>
                <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', fontWeight: 700 }}>× {d.weight} %</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: d.na ? 'var(--fg4)' : 'var(--fg1)' }}>{d.na ? '—' : d.score}</span>
                {d.na
                  ? <span style={{ fontSize: '0.5625rem', color: 'var(--yellow-fg)', fontWeight: 700 }}>non analysée</span>
                  : <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{d.prev ? `${d.score - d.prev >= 0 ? '+' : '−'}${Math.abs(d.score - d.prev)} pts` : 'premier relevé'}</span>}
              </div>
              <div className="track" style={{ marginTop: 6 }}><div className="fill" style={{ width: d.na ? 0 : `${d.score}%`, background: d.score >= 75 ? 'var(--green)' : d.score >= 60 ? 'var(--yellow-b)' : 'var(--red)' }}></div></div>
            </div>))}
        </div>
      </div>
      {failedDim && (
        <div className="note-box" style={{ background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
          <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><AI.Warn /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>La dimension {failedDim} n’a pas pu être analysée.</b> Google Business Profile n’est pas connecté pour ce client : le score global est calculé sur {total} % de la pondération et n’est pas comparable aux audits précédents.
          </div>
          <a href="Parametres.html" className="btn-out" style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}><AI.Plug />Connecter</a>
        </div>)}
      {stale && !failedDim && (
        <div className="note-box">
          <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}><AI.Clock /></span>
          <div style={{ flex: 1, minWidth: 0 }}><b>Relevé du {staleDate}.</b> Les mesures ont plus de 60 jours : le site a probablement changé depuis. Relancez l’audit avant d’en tirer des priorités.</div>
          <button className="btn-pri" style={{ fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}><AI.Refresh />Relancer</button>
        </div>)}
    </AS>);
};

/* ── AUDIT EN COURS ── */
const RunningCard = ({ prog }) => (
  <AS title="Audit en cours d’exécution" sub={`Lancé à ${AU.hour} · 412 pages à explorer · progression par dimension`} accent="var(--blue-b)">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {[['presence', 'Présence en ligne', '14 sources vérifiées sur 14'], ['seo', 'SEO', '256 pages explorées sur 412'], ['design', 'Design', 'En attente : démarre après le SEO']].map(([id, name, det]) => (
        <div key={id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{name}</span>
            {prog[id] === 100 ? <AP label="Terminée" tone="green" sm icon={<AI.Check />} /> : prog[id] > 0 ? <AP label="En cours" tone="blue" sm /> : <AP label="En attente" tone="neutral" sm />}
            <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{prog[id]} %</span>
          </div>
          <div className="track"><div className="fill" style={{ width: `${prog[id]}%`, background: prog[id] === 100 ? 'var(--green)' : 'var(--blue-fg)' }}></div></div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3 }}>{det}</div>
        </div>))}
    </div>
    <div className="note-box"><span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}><AI.Clock /></span><div style={{ flex: 1 }}>Les constats de la présence en ligne sont déjà consultables ci-dessous. Le score global n’apparaît qu’une fois les trois dimensions terminées.</div></div>
  </AS>);

/* ── LIGNE DE CONSTAT : mesure, seuil, statut, geste ── */
const CritRow = ({ it, created, onCreate }) => {
  const s = A_STATUS[it.st];
  const prio = it.prio || created[it.c];
  const actionable = it.st !== 'ok' && it.st !== 'na';
  return (
    <div className="crit" data-st={it.st}>
      <span className="crit-ico" data-st={it.st}><s.Ico /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{it.c}</span>
          <AP label={s.label} tone={s.tone} sm icon={<s.Ico />} />
        </div>
        <div className="crit-meas">
          <span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{it.measure}</span>
          <span style={{ color: 'var(--fg3)' }}>{it.threshold}</span>
        </div>
        {it.note && <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{it.note}</div>}
      </div>
      <div className="crit-act">
        {prio
          ? <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><AP label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<AI.Arrow />} /></a>
          : actionable
            ? <button className="btn-out" onClick={() => onCreate(it.c)}><AI.Plus />Créer la priorité</button>
            : <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>Rien à corriger</span>}
      </div>
    </div>);
};

/* ── DIMENSION ── */
const DimCard = ({ dim, created, onCreate, partial }) => {
  const bad = dim.items.filter(i => i.st === 'fail' || i.st === 'warn').length;
  return (
    <AS title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ color: 'var(--fg3)', display: 'flex' }}><dim.Icon /></span>{dim.name}</span>}
      sub={dim.sub}
      right={<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <AP label={`${dim.weight} % du score`} tone="neutral" sm />
        {partial ? <AP label="Non analysée" tone="yellow" sm icon={<AI.Warn />} /> : <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{dim.score}<span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontWeight: 600 }}> / 100</span></span>}
      </div>}>
      {partial
        ? <div className="empty">
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--yellow-fg)', marginBottom: 6 }}><AI.Plug /></div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Dimension non analysée</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '28rem', margin: '0 auto' }}>L’accès à Google Business Profile a expiré le 22 septembre. Sans lui, ni la fiche ni les avis ne peuvent être relevés — les autres sources seules donneraient un score trompeur.</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
              <a href="Parametres.html" className="btn-pri" style={{ textDecoration: 'none' }}><AI.Plug />Reconnecter l’accès</a>
              <button className="btn-out"><AI.Refresh />Relancer cette dimension</button>
            </div>
          </div>
        : <React.Fragment>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dim.items.map(it => <CritRow key={it.c} it={it} created={created} onCreate={onCreate} />)}
            </div>
            <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)' }}>{bad} critère{bad > 1 ? 's' : ''} sous le seuil sur {dim.items.length}. Chaque critère affiche la mesure relevée et le seuil retenu.</div>
          </React.Fragment>}
    </AS>);
};

/* ── DESIGN — CE QUI ENTRE DANS LE SCORE ── */
const DesignScoreCard = ({ created, onCreate, score }) => {
  const d = AU.design;
  const val = score == null ? d.score : score;
  return (
    <AS title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ color: 'var(--fg3)', display: 'flex' }}><AI.Pen /></span>Design — ce qui est mesuré</span>}
      sub="Cinq critères vérifiables. Chacun affiche la mesure relevée et le seuil, jamais une note seule."
      right={<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}><AP label={`${d.weight} % du score`} tone="neutral" sm /><span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{val}<span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontWeight: 600 }}> / 100</span></span></div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {d.items.map(it => <CritRow key={it.c} it={it} created={created} onCreate={onCreate} />)}
      </div>
    </AS>);
};

/* ── DESIGN — CARACTÉRISATION, JAMAIS NOTÉE ── */
const CharacterCard = () => {
  const { style, modern } = AU.design;
  const [open, setOpen] = useAS(true);
  return (
    <div className="charac">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Design — ce qui est caractérisé</span>
            <span className="pill" style={{ background: 'transparent', border: '1px dashed var(--bd-strong)', color: 'var(--fg3)', fontSize: '0.5625rem' }}>Description · hors score</span>
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.5 }}>Le style et l’âge apparent s’apprécient, ils ne se notent pas. Rien de ce bloc n’entre dans le score de l’audit.</div>
        </div>
        <button className="btn-out" onClick={() => setOpen(o => !o)} style={{ fontSize: '0.625rem' }}>{open ? 'Réduire' : 'Détailler les signaux'}</button>
      </div>

      <div className="charac-grid">
        <div>
          <AL mb={7}>Style dominant</AL>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
            {style.all.map(s => <span key={s} className="style-chip" data-on={s === style.dominant}>{s}{s === style.dominant && <span style={{ display: 'flex' }}><AI.Check /></span>}</span>)}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.55 }}>{style.note}</div>
        </div>
        <div>
          <AL mb={7}>Axe de modernité</AL>
          <div className="axis">
            <div className="axis-line"><span className="axis-mark" style={{ left: `${modern.pos}%` }}></span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 5, fontWeight: 600 }}><span>Daté</span><span>Actuel</span></div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 7 }}>{modern.label}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 3 }}>Position justifiée par {modern.signals.filter(s => s[2] === 'daté').length} signaux datés sur {modern.signals.length}. Un site daté peut rester parfaitement utilisable : voyez les critères mesurés ci-dessus pour l’utilisabilité.</div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <AL mb={7}>Signaux relevés</AL>
          <div className="sig-grid">
            {modern.signals.map(([n, txt, tag]) => (
              <div key={n} className="sig">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{n}</span>
                  <span className="sig-tag" data-tag={tag}>{tag === 'daté' ? 'signal daté' : 'signal actuel'}</span>
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>{txt}</div>
              </div>))}
          </div>
          <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Une refonte visuelle se discute avec le client à partir de ces signaux — elle ne se déduit pas d’une note.</div>
        </div>)}
    </div>);
};

/* ── MÉTADONNÉES ET HISTORIQUE ── */
const AuditMetaCard = ({ state, shown }) => (
  <AS title="Cet audit" right={state === 'encours' ? <AP label="En cours" tone="blue" sm /> : state === 'partiel' ? <AP label="Partiellement échoué" tone="yellow" sm icon={<AI.Warn />} /> : <AP label="Terminé" tone="green" sm icon={<AI.Check />} />}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {[['Identifiant', shown.id], ['Lancé le', `${shown.date} à ${AU.hour}`], ['Déclencheur', 'Automatique · 1er du mois'], ['Pages explorées', `${AU.pages} pages`], ['Durée', state === 'encours' ? 'en cours…' : shown.duration || AU.duration]].map(([l, v]) => (
        <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <AL mb={0} style={{ flex: '0 0 7rem' }}>{l}</AL>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, flex: 1, minWidth: 0 }}>{v}</span>
        </div>))}
    </div>
    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
      <button className="btn-out" style={{ flex: 1, justifyContent: 'center' }}><AI.Refresh />Relancer</button>
      <a href="Audit Comparaison.html" className="btn-out" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}><AI.Cmp />Comparer</a>
    </div>
  </AS>
);

const HistoryCard = ({ first, shownId = AU.id }) => (
  <AS title="Audits précédents" sub={first ? 'Aucun audit antérieur' : `${AU.history.length} audits · le score suit la même pondération`}>
    {first
      ? <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>C’est le premier audit de ce client. Il n’y a rien à comparer : ces mesures serviront de point de départ au mois prochain.</div>
      : <div style={{ display: 'flex', flexDirection: 'column' }}>
          {AU.history.map(h => (
            <div key={h.id} className="hist-row">
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{h.score}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{h.date}</div>
                <div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{h.id}{h.id === shownId ? ' · affiché' : ''}</div>
              </div>
              {h.id === shownId ? <AP label="Affiché" tone="green" sm /> : <a href="Audit Comparaison.html" className="btn-out" style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.2rem 0.6rem' }}>Comparer</a>}
            </div>))}
        </div>}
  </AS>
);

Object.assign(window, { ScoreCard, RunningCard, CritRow, DimCard, DesignScoreCard, CharacterCard, AuditMetaCard, HistoryCard });
