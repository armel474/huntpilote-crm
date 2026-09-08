/* HuntPilote — Éditeur de rapport : navigateur de sections et édition de chaque section. */
const { useState: useES } = React;
const { RIco, RPill, RLbl, RSec, REPORT, SECTIONS } = window;

/* ── NAVIGATEUR DE SECTIONS ── */
const SectionNav = ({ order, on, setOn, move, active, setActive, counts }) => (
  <RSec title="Sections du rapport" sub={`${order.filter(id => on[id]).length} sur ${order.length} incluses · glissez l’ordre avec les flèches`}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {order.map((id, i) => {
        const s = SECTIONS.find(x => x.id === id), sel = active === id, inc = on[id];
        return (
          <div key={id} className="sec-row" data-on={sel} style={{ opacity: inc ? 1 : 0.55 }}>
            <button type="button" className="sec-check" aria-pressed={inc} aria-label={`Inclure ${s.name}`} onClick={() => setOn(id)} style={{ background: inc ? 'var(--green)' : 'transparent', borderColor: inc ? 'var(--green)' : 'var(--bd-strong)', color: '#fff' }}>{inc && <RIco.Check />}</button>
            <button type="button" className="sec-main" onClick={() => setActive(id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}. {s.name}</span>
                {s.ai && <RPill label="✦ IA" tone="violet" sm />}
                {counts[id] && <RPill label={counts[id]} tone={counts[id].includes('relire') ? 'yellow' : 'neutral'} sm icon={counts[id].includes('relire') ? <RIco.Warn /> : null} />}
              </span>
              <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{s.desc}</span>
            </button>
            <span className="sec-arrows">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter"><RIco.Up /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Descendre"><RIco.Down /></button>
            </span>
          </div>);
      })}
    </div>
  </RSec>
);

/* ── ÉDITION D'UNE SECTION ── */
const SectionEditor = ({ id, summary, setSummary, proofs, toggleProof, moveProof, okMap, validate, noProof }) => {
  const s = SECTIONS.find(x => x.id === id);
  const R = REPORT;
  return (
    <RSec title={`Édition — ${s.name}`} sub={s.desc} accent={s.ai ? 'var(--violet)' : undefined}
      right={<a href="Rapport Client.html" className="btn-out" style={{ textDecoration: 'none', fontSize: '0.6875rem' }} target="_blank" rel="noopener"><RIco.Eye />Aperçu client</a>}>

      {id === 'synthese' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
            <RLbl mb={0}>Texte publié au client</RLbl>
            <RPill label="✦ Rédigée par l’agent" tone="violet" sm />
            <button className="btn-out" style={{ marginLeft: 'auto', fontSize: '0.625rem', padding: '0.25rem 0.7rem', color: 'var(--violet-fg)', borderColor: 'var(--violet-b)' }} onClick={() => setSummary(R.summary)}>✦ Régénérer</button>
          </div>
          <textarea className="fld-r" rows={7} value={summary} onChange={e => setSummary(e.target.value)} aria-label="Synthèse du mois" />
          <div style={{ display: 'flex', gap: 12, marginTop: 7, fontSize: '0.5625rem', color: 'var(--fg3)', flexWrap: 'wrap' }}>
            <span>{summary.trim().split(/\s+/).length} mots</span>
            <span>Rédigée le 1 oct. 2026 à partir des preuves et des chiffres de la période</span>
          </div>
          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 9, background: 'var(--violet-m)', border: '1px solid var(--violet-b)', fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
            Chaque affirmation de ce texte s’appuie sur un chiffre affiché plus bas dans le rapport. Si vous en retirez une section, relisez la synthèse.
          </div>
        </div>)}

      {id === 'situation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ed-grid">
            {[['Score de santé publié', `${R.score.now} / 100`, `Août : ${R.score.prev} · +${R.score.now - R.score.prev} points`], ['Objectif affiché', R.objective.label, `${R.objective.pct} % atteint · +${R.objective.pct - R.objective.prevPct} pts ce mois`]].map(([l, v, sub]) => (
              <div key={l} style={{ padding: '9px 11px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--bd)' }}>
                <RLbl mb={4}>{l}</RLbl><div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{v}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{sub}</div>
              </div>))}
          </div>
          <div><RLbl mb={4}>Phrase d’explication (modifiable)</RLbl><textarea className="fld-r" rows={3} defaultValue={R.objective.sentence} aria-label="Phrase d’explication de l’objectif" /></div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Le score et la progression viennent du dernier audit — ils ne se saisissent pas ici. Seule la phrase qui les explique est éditable.</div>
        </div>)}

      {id === 'kpis' && (
        <div>
          <RLbl mb={6}>Chiffres inclus · chacun accompagné de sa phrase</RLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {R.kpis.map(k => (
              <div key={k.label} style={{ padding: '9px 11px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--bd)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{k.value}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{k.label}</span>
                  <RPill label={k.delta} tone="green" sm icon={<RIco.Up />} />
                  <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--fg3)' }}>Août : {k.prev}</span>
                </div>
                <input className="fld-r" defaultValue={k.sentence} aria-label={`Phrase pour ${k.label}`} />
              </div>))}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)' }}>Un chiffre sans phrase n’est pas publiable : le client doit savoir ce que le nombre veut dire.</div>
        </div>)}

      {id === 'preuves' && (
        noProof ? (
          <div style={{ padding: '16px 14px', borderRadius: 10, border: '1.5px dashed var(--bd-strong)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: 'var(--fg3)' }}><RIco.Warn /></div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucune preuve pour septembre</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto' }}>Aucune tâche n’a été clôturée ce mois-ci. Le rapport peut être publié sans cette section, mais il ne montrera que des chiffres et des chantiers en cours — pas de résultat.</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
              <a href="Tache Detail.html" className="btn-pri" style={{ textDecoration: 'none', fontSize: '0.6875rem' }}>Clôturer une tâche<RIco.Arrow /></a>
              <button className="btn-out" style={{ fontSize: '0.6875rem' }}>Retirer la section du rapport</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
              <RLbl mb={0}>Preuves proposées · {proofs.filter(p => p.on).length} retenues</RLbl>
              <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>Issues des tâches clôturées entre le 1 et le 30 septembre</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proofs.map((p, i) => {
                const ok = okMap[p.id];
                return (
                  <div key={p.id} className="proof-row" style={{ opacity: p.on ? 1 : 0.55, borderColor: p.on && !ok ? 'var(--yellow-b)' : 'var(--bd)' }}>
                    <button type="button" className="sec-check" aria-pressed={p.on} aria-label={`Retenir ${p.title}`} onClick={() => toggleProof(p.id)} style={{ background: p.on ? 'var(--green)' : 'transparent', borderColor: p.on ? 'var(--green)' : 'var(--bd-strong)', color: '#fff' }}>{p.on && <RIco.Check />}</button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.title}</span>
                        {ok ? <RPill label="Relu" tone="green" sm icon={<RIco.Check />} /> : <RPill label="À relire" tone="yellow" sm icon={<RIco.Warn />} />}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 5 }}>{p.text}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.5rem', color: 'var(--fg3)' }}>
                        {p.before && <span style={{ fontWeight: 700, color: 'var(--green-fg)' }}>{p.before} → {p.after}</span>}
                        <a href="Tache Detail.html" style={{ color: 'var(--fg3)' }}>Tâche {p.task}</a>
                        {p.prio && <a href="Priorite Detail.html" style={{ color: 'var(--fg3)' }}>Priorité {p.prio}</a>}
                        {!ok && <button className="btn-out" style={{ fontSize: '0.5625rem', padding: '0.2rem 0.6rem' }} onClick={() => validate(p.id)}><RIco.Pen />Relire et valider</button>}
                      </div>
                    </div>
                    <span className="sec-arrows">
                      <button type="button" onClick={() => moveProof(i, -1)} disabled={i === 0} aria-label="Monter"><RIco.Up /></button>
                      <button type="button" onClick={() => moveProof(i, 1)} disabled={i === proofs.length - 1} aria-label="Descendre"><RIco.Down /></button>
                    </span>
                  </div>);
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)' }}>L’ordre ci-dessus est l’ordre d’apparition dans le rapport. Mettez en tête ce qui compte le plus pour ce client.</div>
          </div>
        ))}

      {id === 'travail' && (
        <div>
          <RLbl mb={6}>Priorités visibles au client · {REPORT.priorities.length}</RLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REPORT.priorities.map(p => {
              const ok = okMap[p.id];
              return (
                <div key={p.id} className="proof-row" style={{ borderColor: ok ? 'var(--bd)' : 'var(--yellow-b)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.title}</span>
                      <RPill label={p.state === 'traitement' ? 'En traitement' : 'Annoncé'} tone={p.state === 'traitement' ? 'blue' : 'yellow'} sm />
                      {ok ? <RPill label="Relu" tone="green" sm icon={<RIco.Check />} /> : <RPill label="À relire" tone="yellow" sm icon={<RIco.Warn />} />}
                      <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{p.id}</span>
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>{p.text}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 5, fontSize: '0.5rem', color: 'var(--fg3)' }}>
                      {p.doing && <span>{p.pct} % fait — {p.doing}</span>}
                      <a href="Priorite Detail.html" style={{ color: 'var(--fg3)' }}>Ouvrir la priorité</a>
                      {!ok && <button className="btn-out" style={{ fontSize: '0.5625rem', padding: '0.2rem 0.6rem' }} onClick={() => validate(p.id)}><RIco.Pen />Relire et valider</button>}
                    </div>
                  </div>
                </div>);
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)' }}>Cette liste se règle sur l’écran de la priorité, pas ici : seules celles en <b>annoncé</b> ou <b>en traitement</b> apparaissent. Les priorités internes restent invisibles.</div>
        </div>)}

      {id === 'suite' && (
        <div>
          <RLbl mb={6}>Prévu en octobre · 3 engagements</RLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REPORT.next.map(([t, d]) => (
              <div key={t} style={{ padding: '9px 11px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--bd)' }}>
                <input className="fld-r" defaultValue={t} style={{ fontWeight: 700, marginBottom: 5 }} aria-label="Titre de l’engagement" />
                <input className="fld-r" defaultValue={d} aria-label="Détail de l’engagement" />
              </div>))}
          </div>
          <button className="btn-out" style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: '0.6875rem', borderStyle: 'dashed' }}>Ajouter un engagement</button>
          <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)' }}>Trois engagements suffisent. Ce que vous écrivez ici, le client l’attendra dans le rapport d’octobre.</div>
        </div>)}
    </RSec>);
};

Object.assign(window, { SectionNav, SectionEditor });
