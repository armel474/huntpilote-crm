/* HuntPilote — Keyword Gap : blocs de l'outil. Réutilise .card, ASec, APill. */
const { useState: uKG } = React;
const AI8 = window.AIco, AP8 = window.APill, AS8 = window.ASec, KI8 = window.KGI;

/* ── GESTION DES CONCURRENTS COMPARÉS — jusqu'à trois ── */
const CompManage = ({ competitors, onRemove, onAdd }) => {
  const [draft, setDraft] = uKG('');
  return (
    <div className="card" style={{ padding: '0.875rem 1rem' }}>
      <div className="lbl">Client et concurrents comparés</div>
      <div className="comp-manage">
        <span className="comp-chip" style={{ background: 'var(--green-m)', borderColor: 'var(--green-b)', color: 'var(--green-fg)' }}>{window.CLIENT.name} · vous</span>
        {competitors.map(c => (
          <span className="comp-chip" key={c.domain} data-nodata={!!c.noData}>{c.name}{c.noData && ' · sans données'}<button onClick={() => onRemove(c.domain)} aria-label={`Retirer ${c.name}`}><KI8.X /></button></span>))}
        {competitors.length < 3 && (
          <span style={{ display: 'inline-flex', gap: 5 }}>
            <input className="inp" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Domaine concurrent…" aria-label="Ajouter un concurrent" style={{ width: '11rem' }} />
            <button className="btn-out" onClick={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft(''); } }}><KI8.Plus />Ajouter</button>
          </span>)}
      </div>
    </div>);
};

/* ── CATÉGORIE — la lecture qui fait la valeur de l'outil ── */
const CatGroup = ({ cat, rows, competitors, open, onToggle, created, onCreate, onTrack }) => {
  const gcols = `1.7fr 80px 64px ${competitors.map(() => '64px').join(' ')} 140px`;
  const nFort = cat.id === 'manquants' ? rows.filter(r => r.vol >= window.VOL_FORT).length : 0;
  return (
    <div className="cat" data-tone={cat.tone}>
      <button className="cat-head" onClick={onToggle} aria-expanded={open}>
        <span className="chev" data-open={open}><KI8.Chev /></span>
        <span className="cat-ico" style={{ background: `var(--${cat.tone}-m)`, color: `var(--${cat.tone === 'red' ? 'red' : cat.tone + '-fg'})`, borderColor: `var(--${cat.tone}-b)` }}><cat.Icon /></span>
        <span style={{ flex: '1 1 12rem', minWidth: 0 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{cat.label}</span>
          <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginLeft: 8 }}>{rows.length} requête{rows.length > 1 ? 's' : ''}{nFort > 0 ? ` · ${nFort} à fort volume` : ''}</span>
          <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{cat.sub}</span>
        </span>
      </button>
      {open && rows.length > 0 && (
        <div className="cat-body">
          <div className="gap-head" style={{ '--gcols': gcols }}>
            <span className="lbl" style={{ marginBottom: 0 }}>Requête</span>
            <span className="lbl" style={{ marginBottom: 0 }}>Volume</span>
            <span className="lbl" style={{ marginBottom: 0, textAlign: 'center' }}>Vous</span>
            {competitors.map(c => <span className="lbl" key={c.domain} style={{ marginBottom: 0, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.name}>{c.name.split(' ')[0]}</span>)}
            <span className="lbl" style={{ marginBottom: 0 }}></span>
          </div>
          {rows.map(r => {
            const prio = created[r.c];
            const actionable = cat.id === 'manquants' || cat.id === 'faibles';
            return (
              <div className="gap-row" key={r.c} style={{ '--gcols': gcols }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>{r.c}{cat.id === 'manquants' && r.vol >= window.VOL_FORT && <AP8 label="Fort volume" tone="red" sm />}</span>
                <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', color: 'var(--fg2)' }}>{r.vol.toLocaleString('fr-CA')}/mois</span>
                <span className="pos-cell" data-you="true" data-none={r.posClient === null}>{r.posClient === null ? '—' : r.posClient}</span>
                {competitors.map((c, i) => {
                  const v = r.posComps[i];
                  return c.noData ? <span key={c.domain} className="pos-cell" data-none="true" title="Données indisponibles pour ce concurrent">n.d.</span>
                    : <span key={c.domain} className="pos-cell" data-none={v === null}>{v === null ? '—' : v}</span>;
                })}
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {actionable
                    ? (prio ? <AP8 label={prio} tone="blue" sm icon={<AI8.Arrow />} /> : <button className="pg-btn" onClick={() => onCreate(r.c)}><KI8.Plus />Priorité</button>)
                    : <button className="pg-btn" onClick={() => onTrack(r.c)}><KI8.Plus />Suivre</button>}
                </span>
              </div>);
          })}
        </div>)}
    </div>);
};

/* ── CONSERVATION — outil éphémère ── */
const GapKeepCard = ({ prospect }) => (
  <AS8 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?" accent="var(--yellow-b)">
    <div style={{ marginBottom: 9 }}><AP8 label={prospect ? 'Instantané · jamais historisé' : 'Éphémère · purgé après 30 jours'} tone="yellow" icon={<AI8.Clock />} /></div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 9 }}>La comparaison n’est pas historisée. Seule la carte Concurrence de la fiche garde une trace, et seulement si vous l’enregistrez.</div>
    <div className="note-box" style={{ marginTop: 0, background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}><b>Enregistrer dans la fiche</b> met à jour la carte Concurrence — c’est la seule action principale de l’écran.</div>
  </AS8>);

Object.assign(window, { CompManage, CatGroup, GapKeepCard });
