/* HuntPilote — Détail d'une tâche : en-tête, clôture en 3 temps, preuve de valeur. */
const { useState: useCS } = React;
const { TIco, TPill, TLbl, TSec, T_CLIENT, T_SEV, T_STATUS, PrioLink } = window;

/* ── EN-TÊTE ── */
const TaskHeader = ({ task, state, orphan, blocked, onStart, onOpenClose }) => {
  const st = T_STATUS[state];
  const done = state === 'terminee' || state === 'publiee';
  return (
    <div className="card" style={{ padding: '1rem 1.125rem' }}>
      <div className="t-head" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <TPill label={st.label} tone={st.tone} icon={done ? <TIco.Check /> : state === 'retard' || state === 'bloquee' ? <TIco.Warn /> : <TIco.Clock />} />
            <TPill label={task.typeLabel} tone={task.type === 'contenu' ? 'violet' : 'neutral'} icon={task.type === 'contenu' ? <TIco.Doc /> : null} />
            {orphan && <TPill label="Sans priorité source" tone="yellow" icon={<TIco.Warn />} />}
            <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>Tâche {task.id}</span>
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0, textWrap: 'balance', color: done ? 'var(--fg3)' : 'var(--fg1)', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.6, margin: '8px 0 0', textWrap: 'pretty' }}>{task.desc}</p>
          <div className="t-meta">
            {[['Responsable', task.who], ['Échéance', task.due], ['Effort estimé', task.effort], ['Créée le', task.created]].map(([l, v]) => (
              <div key={l}><TLbl mb={2}>{l}</TLbl><div style={{ fontSize: '0.75rem', fontWeight: 700, color: l === 'Échéance' && state === 'retard' ? 'var(--red)' : 'var(--fg1)' }}>{v}{l === 'Échéance' && state === 'retard' && ' · 3 j de retard'}</div></div>))}
          </div>
          {blocked && (
            <div style={{ marginTop: 10, padding: '9px 11px', borderRadius: 10, background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--yellow-fg)' }}><TIco.Warn />Bloquée depuis le 6 septembre</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginTop: 3, marginLeft: 18, lineHeight: 1.45 }}>Motif : accès FTP en attente chez l’hébergeur du client. Relance envoyée le 7 septembre à contact@acmecorp.fr.</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, marginLeft: 18, flexWrap: 'wrap' }}>
                <button className="btn-pri" style={{ fontSize: '0.6875rem' }} onClick={onStart}>Débloquer et reprendre</button>
                <button className="btn-out" style={{ fontSize: '0.6875rem' }}>Relancer le client</button>
              </div>
            </div>)}
        </div>

        {/* Zone d'action — la clôture */}
        <div className="t-action">
          {!done && (
            <React.Fragment>
              <button className="btn-close-task" onClick={onOpenClose} disabled={blocked} style={{ opacity: blocked ? 0.45 : 1, cursor: blocked ? 'not-allowed' : 'pointer' }}><TIco.Trophy />Terminer et produire la preuve</button>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', textAlign: 'center' }}>{blocked ? 'Débloquez la tâche pour pouvoir la clôturer.' : 'Terminer une tâche, c’est produire la preuve de valeur qui ira au rapport.'}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-out" style={{ fontSize: '0.6875rem' }}><TIco.Clock />Reporter l’échéance</button>
                <button className="btn-out" style={{ fontSize: '0.6875rem' }}><TIco.Warn />Signaler un blocage</button>
              </div>
            </React.Fragment>)}
          {state === 'terminee' && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--yellow-m)', border: '1px solid var(--yellow-b)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ color: 'var(--yellow-fg)', display: 'flex' }}><TIco.Warn /></span><span className="lbl" style={{ color: 'var(--yellow-fg)' }}>Preuve non produite</span></div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.45 }}>Le travail est fait, mais rien ne le montre au client. La preuve manquera au rapport de septembre.</div>
              <button className="btn-close-task" style={{ marginTop: 9 }} onClick={onOpenClose}><TIco.Trophy />Produire la preuve</button>
            </div>)}
          {state === 'publiee' && <ProofCard task={task} />}
        </div>
      </div>
    </div>);
};

/* ── PREUVE DE VALEUR PRODUITE ── */
const ProofCard = ({ task }) => (
  <div style={{ padding: '11px 13px', borderRadius: 10, background: 'var(--green-m)', border: '1px solid var(--green-b)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
      <span style={{ color: 'var(--green-fg)', display: 'flex' }}><TIco.Trophy /></span>
      <span className="lbl" style={{ color: 'var(--green-fg)', marginBottom: 0 }}>Preuve de valeur</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--fg3)' }}>8 sept. 2026</span>
    </div>
    {task.measure ? (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 4 }}>
        <span style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--fg3)', textDecoration: 'line-through' }}>{task.measure.before}</span>
        <span style={{ color: 'var(--fg3)', display: 'flex' }}><TIco.Arrow /></span>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--green-fg)', letterSpacing: '-0.03em' }}>{task.measure.after}</span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{task.measure.label}</span>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 5 }}>
        {task.delivered.map(([u, m]) => <div key={u}><div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{u}</div><div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{m}</div></div>)}
      </div>)}
    <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 7 }}>{task.secondary}</div>
    <div style={{ paddingTop: 7, borderTop: '1px solid var(--green-b)', fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>« {task.proofLabel} »</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, fontSize: '0.5rem', color: 'var(--fg3)' }}><span style={{ color: 'var(--green)', display: 'flex' }}><TIco.Check /></span>Libellé validé par {T_CLIENT.pm} · publié dans le rapport de septembre</div>
    <a href="Fiche Client v4.html" className="btn-out" style={{ marginTop: 9, width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '0.6875rem' }}><TIco.Eye />Voir dans le rapport publié</a>
  </div>
);

/* ── CLÔTURE EN 3 TEMPS ── */
const STEPS = [
  { n: 1, label: 'Ce qui a changé' },
  { n: 2, label: 'Destination' },
  { n: 3, label: 'Libellé client' },
];

const CloseFlow = ({ task, onCancel, onDone }) => {
  const [step, setStep] = useCS(1);
  const content = task.type === 'contenu';
  const [mode, setMode] = useCS(content ? 'livre' : 'mesure');
  const [before, setBefore] = useCS(task.measure ? task.measure.before : '');
  const [after, setAfter] = useCS(task.measure ? task.measure.after : '');
  const [note, setNote] = useCS(content ? task.secondary : '');
  const [dest, setDest] = useCS('rapport');
  const [label, setLabel] = useCS(task.proofLabel);
  const [ok, setOk] = useCS(false);

  const canNext = step === 1 ? (mode === 'mesure' ? before.trim() && after.trim() : note.trim()) : step === 2 ? true : ok;

  return (
    <div className="card close-flow">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--green-m)', border: '1px solid var(--green-b)', color: 'var(--green-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TIco.Trophy /></span>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>Clôturer la tâche {task.id}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>Trois questions, puis la preuve part au rapport.</div>
        </div>
        <div className="steps-ind">
          {STEPS.map(s => (
            <div key={s.n} className="step-ind" data-on={step === s.n} data-done={step > s.n}>
              <span className="step-num">{step > s.n ? <TIco.Check /> : s.n}</span>
              <span className="step-lab">{s.label}</span>
            </div>))}
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="seg" role="group" aria-label="Type de preuve">
            <button type="button" className={mode === 'mesure' ? 'on' : ''} onClick={() => setMode('mesure')}>Une mesure a changé</button>
            <button type="button" className={mode === 'note' ? 'on' : ''} onClick={() => setMode('note')}>Pas de mesure — une note</button>
            {content && <button type="button" className={mode === 'livre' ? 'on' : ''} onClick={() => setMode('livre')}>Contenu publié</button>}
          </div>
          {mode === 'mesure' && (
            <div className="close-body">
              <div className="measure-row">
                <div><TLbl mb={4}>Mesure suivie</TLbl><input className="fld-t" value={task.measure ? task.measure.label : 'LCP mobile (p75)'} readOnly /></div>
                <div><TLbl mb={4}>Avant</TLbl><input className="fld-t" value={before} onChange={e => setBefore(e.target.value)} placeholder="4,2 s" /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 9, color: 'var(--fg3)' }}><TIco.Arrow /></div>
                <div><TLbl mb={4}>Après</TLbl><input className="fld-t" value={after} onChange={e => setAfter(e.target.value)} placeholder="2,1 s" style={{ borderColor: 'var(--green-b)', fontWeight: 700 }} /></div>
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 6 }}>Source : {task.measure ? task.measure.source : 'CrUX · fenêtre 28 j'} · objectif {task.measure ? task.measure.target : '< 2,5 s'} — la mesure avant vient de la priorité source, elle n’est pas ressaisie.</div>
              <div style={{ marginTop: 10 }}><TLbl mb={4}>Effet secondaire observé (optionnel)</TLbl><input className="fld-t" value={note} onChange={e => setNote(e.target.value)} placeholder="+14 % de sessions mobiles sur 28 jours" /></div>
            </div>)}
          {mode === 'note' && (
            <div className="close-body">
              <TLbl mb={4}>Ce qui a changé</TLbl>
              <textarea className="fld-t" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Décrivez ce qui a été fait et ce que ça change, sans chiffre." />
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 6 }}>Une preuve sans mesure reste une preuve — elle sera présentée comme un constat, pas comme un résultat chiffré.</div>
            </div>)}
          {mode === 'livre' && (
            <div className="close-body">
              <TLbl mb={6}>Contenu publié</TLbl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {task.delivered.map(([u, m]) => (
                  <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--bd)' }}>
                    <span style={{ width: 17, height: 17, borderRadius: 5, background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TIco.Check /></span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.6875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u}</div><div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{m}</div></div>
                    <span style={{ color: 'var(--fg3)', display: 'flex' }}><TIco.Link /></span>
                  </div>))}
              </div>
              <div style={{ marginTop: 10 }}><TLbl mb={4}>Ce que ça apporte</TLbl><input className="fld-t" value={note} onChange={e => setNote(e.target.value)} /></div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 6 }}>Un article publié compte comme preuve au même titre qu’un correctif technique.</div>
            </div>)}
        </div>)}

      {step === 2 && (
        <div className="close-body">
          <TLbl mb={6}>Où va cette preuve ?</TLbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[['rapport', 'Au prochain rapport client', 'Rapport de septembre · publication le 2 octobre. Le client verra la preuve avec son libellé.', <TIco.Send />],
              ['interne', 'Reste interne', 'La preuve alimente l’historique de l’agence, mais n’apparaît dans aucun rapport.', <TIco.EyeOff />]].map(([id, t, d, ic]) => (
              <button key={id} type="button" className="vis-row-t" aria-pressed={dest === id} onClick={() => setDest(id)} style={{ borderColor: dest === id ? 'var(--fg1)' : 'var(--bd-solid)', boxShadow: dest === id ? '0 0 0 1px var(--fg1)' : 'none', background: dest === id ? 'var(--bg-solid)' : 'transparent' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${dest === id ? 'var(--fg1)' : 'var(--bd-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{dest === id && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fg1)' }}></span>}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800 }}>{ic}{t}</span>
                  <span style={{ display: 'block', fontSize: '0.625rem', color: 'var(--fg2)', marginTop: 3, lineHeight: 1.45 }}>{d}</span>
                </span>
              </button>))}
          </div>
          {dest === 'rapport' && <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 9, background: 'var(--blue-m)', border: '1px solid var(--blue-b)', fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>La priorité <b>{task.prio.id}</b> passera en <b>résolue</b> et le rapport pourra dire : voici ce qui n’allait pas, voici ce qu’on a fait.</div>}
        </div>)}

      {step === 3 && (
        <div className="close-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <TLbl mb={0} style={{ marginBottom: 0 }}>Libellé client de la preuve</TLbl>
            <TPill label="✦ Rédigé par l’agent" tone="violet" sm />
            {ok ? <TPill label="Validé" tone="green" sm icon={<TIco.Check />} /> : <TPill label="À relire" tone="yellow" sm icon={<TIco.Warn />} />}
          </div>
          <textarea className="fld-t" rows={4} value={label} onChange={e => { setLabel(e.target.value); setOk(false); }} aria-label="Libellé client de la preuve" />
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-out" style={{ fontSize: '0.6875rem', color: 'var(--violet-fg)', borderColor: 'var(--violet-b)' }} onClick={() => setLabel(task.proofLabel)}>✦ Régénérer</button>
            <button className="btn-pri" style={{ fontSize: '0.6875rem' }} onClick={() => setOk(true)} disabled={ok}><TIco.Check />Valider le libellé</button>
            {!ok && <span style={{ fontSize: '0.5625rem', color: 'var(--yellow-fg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><TIco.Warn />Tant qu’il est à relire, la preuve bloque la publication du rapport.</span>}
          </div>
          {dest === 'rapport' && (
            <div style={{ marginTop: 12 }}>
              <TLbl mb={6}>Aperçu — dans le rapport de septembre</TLbl>
              <div className="client-doc-t">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <span style={{ width: 15, height: 15, background: '#16A34A', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></span>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#2D5A27', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ce qui a été réglé ce mois-ci</span>
                </div>
                {mode === 'mesure' && before && after && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#A1A1AA', textDecoration: 'line-through' }}>{before}</span>
                    <span style={{ color: '#A1A1AA', display: 'flex' }}><TIco.Arrow /></span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.03em' }}>{after}</span>
                  </div>)}
                <p style={{ fontSize: '0.6875rem', lineHeight: 1.55, color: '#3F3F46', margin: 0, textWrap: 'pretty' }}>{label}</p>
                {note && <div style={{ fontSize: '0.5625rem', color: '#3F3F46', marginTop: 6, fontWeight: 700 }}>{note}</div>}
                {!ok && <div style={{ marginTop: 7, fontSize: '0.5rem', fontWeight: 700, color: '#7A5D14' }}>Texte non validé — ne sera pas publié en l’état.</div>}
              </div>
            </div>)}
        </div>)}

      <div className="close-foot">
        <button className="btn-out" style={{ fontSize: '0.6875rem' }} onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}>{step === 1 ? 'Annuler' : 'Retour'}</button>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Étape {step} sur 3</span>
        {step < 3
          ? <button className="btn-pri" style={{ opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }} disabled={!canNext} onClick={() => canNext && setStep(s => s + 1)}>Continuer<TIco.Arrow /></button>
          : <button className="btn-close-task" style={{ width: 'auto', opacity: ok ? 1 : 0.45, cursor: ok ? 'pointer' : 'not-allowed' }} disabled={!ok} onClick={() => ok && onDone(dest)}><TIco.Trophy />{dest === 'rapport' ? 'Clôturer et envoyer au rapport' : 'Clôturer — preuve interne'}</button>}
      </div>
    </div>);
};

Object.assign(window, { TaskHeader, ProofCard, CloseFlow });
