/* HuntPilote — SEO local · Avis : panneaux (résumé, tonalité, flux filtrable, réponse assistée par l'agent). */
const { useState: uAS } = React;
const { AIco: RAI, APill: RAP, ASec: RAS, ALbl: RAL, LOI: RLOI, AVIS_STATE } = window;

const Stars = ({ note, size = 12 }) => (
  <span style={{ display: 'inline-flex', gap: 1 }} aria-label={`${note} sur 5 étoiles`}>
    {[1, 2, 3, 4, 5].map(n => <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= note ? 'var(--yellow-b)' : 'none'} stroke={n <= note ? 'var(--yellow-b)' : 'var(--bd-strong)'} strokeWidth="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}
  </span>);

/* ── NOTE MOYENNE, TENDANCE ET RÉPARTITION ── */
const RatingSummaryCard = ({ dist, trend, threshold }) => {
  const total = Object.values(dist).reduce((s, n) => s + n, 0);
  const avg = total ? (Object.entries(dist).reduce((s, [n, c]) => s + n * c, 0) / total) : 0;
  const max = Math.max(...Object.values(dist), 1);
  return (
    <RAS title="Note moyenne et tendance" sub={`${total} avis au total · ${trend}`} right={<RAP label={threshold} tone={avg >= 4 ? 'green' : 'yellow'} sm />}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{avg.toFixed(1)}</div>
          <div style={{ marginTop: 4 }}><Stars note={Math.round(avg)} size={13} /></div>
        </div>
        <div style={{ flex: 1, minWidth: '14rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[5, 4, 3, 2, 1].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', width: 14, fontWeight: 700 }}>{n}</span>
              <div className="track" style={{ flex: 1 }}><div className="fill" style={{ width: `${(dist[n] / max) * 100}%`, background: 'var(--yellow-b)' }}></div></div>
              <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', width: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{dist[n]}</span>
            </div>))}
        </div>
      </div>
    </RAS>);
};

/* ── ANALYSE DE TONALITÉ PAR L'AGENT ── */
const SentimentCard = ({ sentiment }) => (
  <div className="card" style={{ padding: '0.875rem 1rem', borderTop: '2px solid var(--violet-b)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}><span style={{ color: 'var(--violet-fg)', fontSize: 13 }}>✦</span><span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Analyse de tonalité</span><RAP label="Par l’agent" tone="violet" sm /></div>
    <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginBottom: 10 }}>Thèmes qui reviennent dans les avis positifs et négatifs récents.</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div>
        <RAL mb={6}>Reviennent en positif</RAL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{sentiment.positifs.map(s => <div key={s.theme} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem' }}><span>{s.theme}</span><span style={{ fontWeight: 700, color: 'var(--green-fg)' }}>{s.count}</span></div>)}</div>
      </div>
      <div>
        <RAL mb={6}>Reviennent en négatif</RAL>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{sentiment.negatifs.map(s => <div key={s.theme} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem' }}><span>{s.theme}</span><span style={{ fontWeight: 700, color: 'var(--red)' }}>{s.count}</span></div>)}</div>
      </div>
    </div>
    <div className="note-box" style={{ background: 'var(--violet-m)', borderColor: 'var(--violet-b)' }}><span style={{ color: 'var(--violet-fg)', display: 'flex', marginTop: 1, fontSize: 12 }}>✦</span><div style={{ flex: 1 }}>{sentiment.insight}</div></div>
  </div>);

/* ── UNE LIGNE D'AVIS — géré, répond, signale ── */
const genDraft = r => `Merci pour votre commentaire${r.auteur !== 'Anonyme' ? ' ' + r.auteur.split(' ')[0] : ''}. ${r.note <= 2 ? 'Nous sommes désolés pour cette expérience et prenons vos remarques au sérieux — un membre de l’équipe vous contactera pour en discuter.' : 'Nous en tenons compte pour la suite.'} N’hésitez pas à nous joindre pour toute question.`;

const ReviewRow = ({ r, expanded, onToggle, onGenerate, onDraftChange, onRegenerate, onPublish, onSignal }) => {
  const st = AVIS_STATE[r.etat];
  const needsAttention = r.etat === 'sans_reponse' || r.etat === 'a_relire' || r.etat === 'signale';
  return (
    <div className="crit" data-st={r.etat === 'sans_reponse' ? 'fail' : r.etat === 'publiee' ? 'ok' : 'warn'}>
      <span className="crit-ico" data-st={r.etat === 'sans_reponse' ? 'fail' : r.etat === 'publiee' ? 'ok' : 'warn'}><st.Ico /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.auteur}</span>
          <Stars note={r.note} />
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{r.date}</span>
          <RAP label={st.label} tone={st.tone} sm />
        </div>
        {r.texte ? <p style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.55, margin: 0, textWrap: 'pretty' }}>{r.texte}</p> : <p style={{ fontSize: '0.75rem', color: 'var(--fg4)', fontStyle: 'italic', margin: 0 }}>Avis sans texte</p>}
        {r.sentiments.length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>{r.sentiments.map(s => <span key={s} style={{ fontSize: '0.5625rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--bg-muted)', color: 'var(--fg3)', border: '1px solid var(--bd-solid)' }}>{s}</span>)}</div>}

        {r.etat === 'publiee' && <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--bd)' }}><div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>{r.reponse}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: 'var(--green)', display: 'flex' }}><RAI.Check /></span>Réponse publiée</div></div>}

        {needsAttention && !expanded && <button className="btn-out" style={{ marginTop: 8 }} onClick={onToggle}>{r.etat === 'signale' ? 'Traiter le signalement' : 'Répondre'}</button>}

        {needsAttention && expanded && r.etat === 'sans_reponse' && (
          <div style={{ marginTop: 9 }}>
            <button className="btn-out" style={{ color: 'var(--violet-fg)', borderColor: 'var(--violet-b)' }} onClick={onGenerate}>✦ Générer une réponse</button>
          </div>)}

        {expanded && r.etat === 'a_relire' && (
          <div style={{ marginTop: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}><RAL mb={0}>Réponse proposée</RAL><RAP label="✦ Rédigée par l’agent" tone="violet" sm /><RAP label="À relire" tone="yellow" sm icon={<RAI.Warn />} /></div>
            <textarea className="fld-t" rows={3} value={r.reponseDraft} onChange={e => onDraftChange(e.target.value)} aria-label="Réponse à l’avis" />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn-out" style={{ color: 'var(--violet-fg)', borderColor: 'var(--violet-b)' }} onClick={onRegenerate}>✦ Régénérer</button>
              <button className="btn-pri" onClick={onPublish}><RAI.Check />Publier la réponse</button>
              <span style={{ fontSize: '0.5625rem', color: 'var(--yellow-fg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><RAI.Warn />Une réponse ne part jamais sans relecture humaine.</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <RAL mb={5}>Aperçu — ce que verra l’auteur de l’avis</RAL>
              <div style={{ position: 'relative', borderRadius: 8, outline: '1.5px dashed var(--yellow-b)', outlineOffset: 3, padding: '8px 10px', background: 'var(--bg-solid)' }}>
                <p style={{ fontSize: '0.6875rem', lineHeight: 1.5, color: 'var(--fg2)', margin: 0, textWrap: 'pretty' }}>{r.reponseDraft}</p>
                <span style={{ position: 'absolute', top: -9, right: 6, fontSize: '0.5rem', fontWeight: 700, background: 'var(--yellow-m)', color: 'var(--yellow-fg)', borderRadius: 999, padding: '1px 6px' }}>à relire</span>
              </div>
            </div>
          </div>)}

        {expanded && r.etat === 'signale' && (
          <div style={{ marginTop: 9 }}>
            <div className="note-box" style={{ marginTop: 0, background: 'var(--red-m)', borderColor: 'var(--red-b)' }}><span style={{ color: 'var(--red)', display: 'flex', marginTop: 1 }}><RAI.Warn /></span><div style={{ flex: 1 }}><b>Motif du signalement</b><br />{r.signaleMotif}</div></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button className="btn-out" onClick={() => onSignal('confirme')}><RAI.Warn />Confirmer le signalement à Google</button>
              <button className="btn-out" onClick={() => onSignal('annule')}>Retirer le signalement</button>
            </div>
          </div>)}
      </div>
    </div>);
};

Object.assign(window, { Stars, RatingSummaryCard, SentimentCard, ReviewRow, genDraft });
