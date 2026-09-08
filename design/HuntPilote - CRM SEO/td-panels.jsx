/* HuntPilote — Détail d'une tâche : données, atomes, blocs principaux. Exporté sur window. */
const { useState: useTS } = React;

const TIco = {
  Chev: ({ deg = 0 }) => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: `rotate(${deg}deg)`, flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>,
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Flag: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>,
  Trophy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Clip: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>,
  Doc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Send: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Up: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>,
  Play: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21" /></svg>,
  Pause: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  Eye: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  EyeOff: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  Link: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
};

const T_TONE = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
  violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'],
};
const TPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = T_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const TLbl = ({ children, mb = 8, style }) => <div className="lbl" style={{ marginBottom: mb, ...style }}>{children}</div>;
const TSec = ({ title, sub, right, children, accent, style }) => (
  <div className="card" style={{ padding: '0.875rem 1rem', borderTop: accent ? `2px solid ${accent}` : undefined, ...style }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>{sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>
);

/* ── DONNÉES ── */
const T_CLIENT = { name: 'Acme Corp.', pm: 'Marie Chen', pmInit: 'MC' };

const TASK_TECH = {
  id: '#142', type: 'technique', typeLabel: 'Correctif technique',
  title: 'Optimiser le LCP mobile — 6 pages stratégiques',
  desc: 'Ramener le LCP sous 2,5 s sur les 6 pages identifiées par l’audit Q2, sans refonte : différer le script de chat tiers, convertir les images héros en WebP avec dimensions explicites, précharger la police et fusionner les CSS bloquants.',
  prio: { id: 'P-0418', label: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques', sev: 'critique', dim: 'SEO', audit: 'Audit technique Q2 · 27 mai 2026' },
  who: 'Jules Rivard', whoInit: 'JR', due: '20 sept. 2026', created: '3 sept. 2026', effort: '2 jours · dév front',
  spent: 6.75, estimate: 16,
  timeLog: [['7 sept.', '2 h 15', 'Jules Rivard', 'Différé le script de chat + mesures lab']],
  steps: [
    { t: 'Différer le script de chat tiers (après interaction)', done: true, who: 'JR', gain: '−1,1 s' },
    { t: 'Convertir 14 images héros en WebP + dimensions explicites', done: true, who: 'JR', gain: '−0,8 s' },
    { t: 'Précharger la police et fusionner les 3 CSS bloquants', done: false, who: 'JR', gain: '−0,4 s' },
    { t: 'Vérifier le LCP sur les 6 pages (lab + terrain)', done: false, who: 'JR' },
    { t: 'Consigner la mesure après correction', done: false, who: 'MC' },
  ],
  measure: { label: 'LCP mobile (p75)', before: '4,2 s', after: '2,1 s', target: '< 2,5 s', source: 'CrUX · fenêtre 28 j' },
  secondary: '+14 % de sessions mobiles sur 28 jours',
  proofLabel: 'Vos pages s’affichent maintenant en 2,1 secondes sur mobile, contre 4,2 secondes avant. Les visiteurs voient le contenu deux fois plus vite, et Google considère désormais ces pages comme rapides.',
  comments: [
    { who: 'Marie Chen', init: 'MC', date: '3 sept., 09 h 14', txt: 'Créée depuis la priorité P-0418. Jules, commence par le script de chat — c’est le plus gros gain pour le moins d’effort.' },
    { who: 'Jules Rivard', init: 'JR', date: '5 sept., 16 h 02', txt: 'Script différé sur les 6 pages. Mesure lab : LCP 3,3 s (−0,9 s). Les images héros sont plus lourdes que prévu, je fais la conversion demain.' },
    { who: 'Agent HuntPilote', init: '✦', ai: true, date: '7 sept., 06 h 12', txt: 'Le LCP terrain n’a pas encore bougé (4,2 s) : la fenêtre CrUX est de 28 jours, l’effet des corrections apparaîtra progressivement. Prévoir la mesure de clôture après le 20 septembre.' },
  ],
  files: [['mesures-lcp-avant.pdf', 'PageSpeed · 3 sept.', '412 Ko'], ['capture-waterfall-accueil.png', 'Chrome DevTools · 5 sept.', '1,1 Mo']],
};

const TASK_CONTENT = {
  id: '#151', type: 'contenu', typeLabel: 'Contenu publié',
  title: 'Publier 3 articles longue traîne — guides d’audit',
  desc: 'Rédiger et publier trois guides ciblant les requêtes longue traîne identifiées par l’agent, avec maillage interne vers les pages de service.',
  prio: { id: 'P-0431', label: '45 mots-clés longue traîne inexploités', sev: 'opportunite', dim: 'SEO', audit: 'Analyse IA · 25 mai 2026' },
  who: 'Sofia Nadeau', whoInit: 'SN', due: '30 sept. 2026', created: '1 sept. 2026', effort: '3 jours · rédaction',
  spent: 11.5, estimate: 24,
  timeLog: [['6 sept.', '4 h 00', 'Sofia Nadeau', 'Rédaction du guide « audit SEO complet »']],
  steps: [
    { t: 'Guide « Comment faire un audit SEO complet » — publié', done: true, who: 'SN' },
    { t: 'Guide « Corriger les liens brisés » — publié', done: true, who: 'SN' },
    { t: 'Guide « Comprendre les Core Web Vitals » — en relecture', done: false, who: 'SN' },
    { t: 'Ajouter le maillage interne vers les pages de service', done: false, who: 'SN' },
  ],
  measure: null,
  delivered: [['/blogue/guide-audit-seo-complet', '1 840 mots · publié le 5 sept.'], ['/blogue/corriger-liens-brises', '1 320 mots · publié le 7 sept.']],
  secondary: '2 articles publiés · 3 200 mots · 12 liens internes ajoutés',
  proofLabel: 'Deux nouveaux guides sont en ligne sur votre blogue. Ils répondent à des questions que vos clients tapent dans Google et n’étaient couvertes par aucune page de votre site.',
  comments: [
    { who: 'Marie Chen', init: 'MC', date: '1 sept., 11 h 40', txt: 'Priorité opportunité — pas urgent, mais les 3 guides doivent sortir avant le rapport de septembre pour compter comme preuve.' },
    { who: 'Sofia Nadeau', init: 'SN', date: '7 sept., 14 h 25', txt: 'Deux guides en ligne. Le troisième est écrit, il me manque la relecture de Marie.' },
  ],
  files: [['plan-editorial-septembre.docx', 'Sofia Nadeau · 1 sept.', '86 Ko']],
};

const T_SEV = { critique: ['Critique', 'red'], important: ['Important', 'yellow'], opportunite: ['Opportunité', 'green'] };
const T_STATUS = {
  afaire: { label: 'À faire', tone: 'neutral' }, encours: { label: 'En cours', tone: 'blue' }, retard: { label: 'En retard', tone: 'red' },
  bloquee: { label: 'Bloquée', tone: 'yellow' }, terminee: { label: 'Terminée · preuve non produite', tone: 'yellow' },
  publiee: { label: 'Terminée · dans le rapport publié', tone: 'green' }, sansprio: { label: 'En cours', tone: 'blue' },
};

/* ── LIEN REMONTANT VERS LA PRIORITÉ ── */
const PrioLink = ({ task, orphan }) => {
  if (orphan) return (
    <div style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px dashed var(--bd-strong)', background: 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
        <span style={{ color: 'var(--fg4)', display: 'flex' }}><TIco.Warn /></span>
        <span className="lbl">Aucune priorité source</span>
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.45 }}>Tâche créée à la main. Sans priorité source, le rapport ne pourra pas dire ce qui n’allait pas — seulement ce qui a été fait.</div>
      <button className="btn-out" style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }}><TIco.Link />Rattacher une priorité</button>
    </div>);
  const [sevLabel, sevTone] = T_SEV[task.prio.sev];
  return (
    <a href="Priorite Detail.html" className="prio-link">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span className="lbl" style={{ marginBottom: 0 }}>Priorité source</span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{task.prio.id}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--fg3)', display: 'flex' }}><TIco.Arrow /></span>
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 6 }}>{task.prio.label}</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TPill label={sevLabel} tone={sevTone} sm icon={<span style={{ width: 7, height: 7, borderRadius: '50%', background: `var(--${sevTone === 'red' ? 'red' : sevTone === 'yellow' ? 'yellow' : 'green'})`, display: 'inline-block' }}></span>} />
        <TPill label={task.prio.dim} tone="neutral" sm />
        <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{task.prio.audit}</span>
      </div>
    </a>);
};

/* ── SOUS-ÉTAPES ── */
const StepsCard = ({ task, done }) => {
  const [steps, setSteps] = useTS(task.steps.map(s => done ? true : s.done));
  const n = steps.filter(Boolean).length;
  return (
    <TSec title="Sous-étapes" sub={`${n} sur ${steps.length} terminées`}
      right={<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 76, height: 5, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden' }}><div style={{ width: `${n / steps.length * 100}%`, height: '100%', background: n === steps.length ? 'var(--green)' : 'var(--blue)', borderRadius: 999, transition: 'width 250ms' }}></div></div>
        <span style={{ fontSize: '0.625rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(n / steps.length * 100)} %</span>
      </div>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {task.steps.map((s, i) => (
          <button key={i} type="button" className="step-row" aria-pressed={steps[i]} onClick={() => setSteps(p => p.map((v, j) => j === i ? !v : v))}>
            <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: steps[i] ? 'var(--green)' : 'transparent', border: `1.5px solid ${steps[i] ? 'var(--green)' : 'var(--bd-strong)'}`, color: '#fff' }}>{steps[i] && <TIco.Check />}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', fontWeight: 500, color: steps[i] ? 'var(--fg3)' : 'var(--fg1)', textDecoration: steps[i] ? 'line-through' : 'none', lineHeight: 1.4 }}>{s.t}</span>
            {s.gain && <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--green-fg)', whiteSpace: 'nowrap' }}>{s.gain}</span>}
            <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', fontSize: '0.5rem', fontWeight: 700, color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.who}</span>
          </button>))}
      </div>
      <button className="btn-out" style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: '0.6875rem', borderStyle: 'dashed' }}><TIco.Plus />Ajouter une sous-étape</button>
    </TSec>);
};

/* ── COMMENTAIRES + PIÈCES JOINTES ── */
const ThreadCard = ({ task }) => {
  const [txt, setTxt] = useTS('');
  return (
    <TSec title="Fil de la tâche" sub={`${task.comments.length} commentaires · ${task.files.length} pièces jointes`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {task.comments.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, background: c.ai ? 'var(--violet-m)' : 'var(--green-m)', border: `1px solid ${c.ai ? 'var(--violet-b)' : 'var(--green-b)'}`, color: c.ai ? 'var(--violet-fg)' : 'var(--green-fg)' }}>{c.init}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{c.who}</span>
                {c.ai && <TPill label="✦ IA" tone="violet" sm />}
                <span style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{c.date}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.55, textWrap: 'pretty' }}>{c.txt}</div>
            </div>
          </div>))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {task.files.map(([n, meta, size]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--bd)' }}>
            <span style={{ color: 'var(--fg3)', display: 'flex' }}><TIco.Doc /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.6875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</div><div style={{ fontSize: '0.5rem', color: 'var(--fg3)' }}>{meta}</div></div>
            <span style={{ fontSize: '0.5rem', color: 'var(--fg3)', whiteSpace: 'nowrap' }}>{size}</span>
          </div>))}
        <button className="btn-out" style={{ justifyContent: 'center', fontSize: '0.6875rem', borderStyle: 'dashed' }}><TIco.Clip />Joindre un fichier</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea className="fld-t" rows={2} placeholder="Écrire un commentaire…" value={txt} onChange={e => setTxt(e.target.value)} aria-label="Nouveau commentaire" />
        <button className="btn-pri" disabled={!txt.trim()} style={{ flexShrink: 0, opacity: txt.trim() ? 1 : 0.45, cursor: txt.trim() ? 'pointer' : 'not-allowed' }} onClick={() => setTxt('')}><TIco.Send />Commenter</button>
      </div>
    </TSec>);
};

/* ── TEMPS PASSÉ ── */
const TimeCard = ({ task, done }) => {
  const [running, setRunning] = useTS(false);
  const pct = Math.min(task.spent / task.estimate * 100, 100);
  const fmt = h => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  return (
    <TSec title="Temps passé" sub={`Estimé : ${task.effort}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{fmt(task.spent)}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>sur {task.estimate} h estimées</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', marginBottom: 4 }}><div style={{ width: `${pct}%`, height: '100%', background: pct > 100 ? 'var(--red)' : 'var(--green)', borderRadius: 999 }}></div></div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginBottom: 10 }}>{Math.round(pct)} % du temps estimé consommé</div>
      {task.timeLog.map(([d, h, w, note]) => (
        <div key={d} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingTop: 8, borderTop: '1px solid var(--bd)' }}>
          <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: 44 }}>{d}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.625rem', fontWeight: 700 }}>{h} · {w}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.4 }}>{note}</div></div>
        </div>))}
      {!done && <button className="btn-out" style={{ marginTop: 10, width: '100%', justifyContent: 'center', fontSize: '0.6875rem', color: running ? 'var(--red)' : 'var(--fg2)', borderColor: running ? 'var(--red-b)' : 'var(--bd-strong)' }} onClick={() => setRunning(r => !r)}>{running ? <React.Fragment><TIco.Pause />Arrêter le chronomètre</React.Fragment> : <React.Fragment><TIco.Play />Démarrer le chronomètre</React.Fragment>}</button>}
    </TSec>);
};

Object.assign(window, { TIco, T_TONE, TPill, TLbl, TSec, T_CLIENT, TASK_TECH, TASK_CONTENT, T_SEV, T_STATUS, PrioLink, StepsCard, ThreadCard, TimeCard });
