/* HuntPilote — Détail d'une priorité : données, icônes, cartes. Exporté sur window. */
const { useState: usePD } = React;

const PI = {
  Chev: ({ deg = 0, s = 10 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: `rotate(${deg}deg)`, flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Eye: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  EyeOff: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  Ext: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Db: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  Task: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>,
  Rotate: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
  Trophy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Pen: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};

/* ── DONNÉES ── */
const PD_CLIENT = { name: 'Acme Corp.', sector: 'Services B2B · Montréal', pm: 'Marie Chen', pmInit: 'MC' };
const PD = {
  id: 'P-0418',
  internal: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques',
  sev: 'critique', dim: 'SEO', sub: 'Audit technique · Core Web Vitals',
  detected: '27 mai 2026', firstSeen: '25 mars 2026', ageDays: 166,
  clientLabel: 'Vos pages mettent trop de temps à s’afficher sur mobile : un visiteur attend plus de 4 secondes avant de voir le contenu principal, alors que Google recommande moins de 2,5 secondes. Cela fait fuir une partie des visiteurs et pèse sur votre classement.',
  clientTitle: 'Vitesse d’affichage sur mobile',
  pages: [
    { url: '/', lcp: 4.8, sessions: 6240, d: 0.4 },
    { url: '/services/seo-local', lcp: 4.6, sessions: 3110, d: 0.3 },
    { url: '/services/refonte-web', lcp: 4.2, sessions: 2870, d: 0.2 },
    { url: '/tarifs', lcp: 4.1, sessions: 2420, d: 0 },
    { url: '/blogue/guide-audit-seo', lcp: 3.9, sessions: 1980, d: 0.5 },
    { url: '/contact', lcp: 3.4, sessions: 1650, d: -0.1 },
  ],
  reco: 'Réduire le LCP sous 2,5 s sur les 6 pages en traitant d’abord ce qui bloque le rendu : le script de chat tiers chargé en tête, les images héros non optimisées et les 3 feuilles CSS bloquantes. Aucune refonte nécessaire — ce sont des corrections de livraison.',
  steps: [
    ['Différer le script de chat tiers (chargement après interaction)', '≈ 1,1 s'],
    ['Convertir 14 images héros en WebP avec dimensions explicites', '≈ 0,8 s'],
    ['Précharger la police et fusionner les 3 CSS bloquants', '≈ 0,4 s'],
  ],
  effort: '2 jours · dév front', effortLevel: 'Moyen',
  impactTech: 'LCP 4,2 s → ≈ 2,2 s', impactBiz: '+12 à 18 % de sessions mobiles', impactCad: '≈ 2 400 $ CA/mois en trafic payant équivalent',
  confidence: 'Élevée',
  prov: { audit: 'Audit technique Q2', date: '27 mai 2026', agent: 'Agent HuntPilote v2.3', crawl: 'Crawl #58 · 6 URL touchées sur 142 explorées',
    sources: [['CrUX', 'Données terrain · p75 · fenêtre 28 j · Chrome mobile'], ['PageSpeed Insights', 'Mesure lab · mobile émulé · 4G lente']] },
  history: [
    { date: '25 mars 2026', lcp: 3.6, ev: 'Détectée — Audit technique Q1', tone: 'yellow' },
    { date: '16 avr. 2026', lcp: 4.0, ev: 'Aggravation +0,4 s — nouveau script de chat repéré', tone: 'red' },
    { date: '27 mai 2026', lcp: 4.2, ev: 'Confirmée — Audit technique Q2', tone: 'red' },
    { date: '7 sept. 2026', lcp: 4.2, ev: 'Dernière vérification — stable', tone: 'neutral' },
  ],
  historyRecurrent: [
    { date: '18 nov. 2025', lcp: 3.9, ev: 'Détectée — Audit technique Q4 2025', tone: 'yellow' },
    { date: '12 févr. 2026', lcp: 2.3, ev: 'Résolue — tâche #97 (images WebP, cache CDN)', tone: 'green' },
    { date: '25 mars 2026', lcp: 3.6, ev: 'Revenue — 41 jours après correction', tone: 'red' },
    { date: '27 mai 2026', lcp: 4.2, ev: 'Aggravation — Audit technique Q2', tone: 'red' },
  ],
  task: { id: '#142', title: 'Optimiser le LCP mobile — 6 pages', who: 'Jules Rivard', status: 'En cours', pct: 40, due: '20 sept. 2026', done: 'Script de chat différé sur 6 pages (LCP −0,9 s mesuré en lab)' },
  proof: { before: '4,2 s', after: '2,1 s', sessions: '+14 % de sessions mobiles (28 j)', date: '2 sept. 2026', report: 'Rapport de septembre' },
};

const SEV = {
  critique: { label: 'Critique', c: 'var(--red)', m: 'var(--red-m)', b: 'var(--red-b)', fg: 'var(--red)' },
  important: { label: 'Important', c: 'var(--yellow)', m: 'var(--yellow-m)', b: 'var(--yellow-b)', fg: 'var(--yellow-fg)' },
  opportunite: { label: 'Opportunité', c: 'var(--green)', m: 'var(--green-m)', b: 'var(--green-b)', fg: 'var(--green-fg)' },
};
const TONE = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
  violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'],
};
const Pill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const SevDot = ({ sev }) => <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEV[sev].c, display: 'inline-block', flexShrink: 0 }}></span>;
const Lbl = ({ children, mb = 8, style }) => <div className="lbl" style={{ marginBottom: mb, ...style }}>{children}</div>;
const Sec = ({ title, sub, right, children, style, accent }) => (
  <div className="card" style={{ padding: '0.875rem 1rem', borderTop: accent ? `2px solid ${accent}` : undefined, ...style }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>{sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>
);

/* ── PAGES TOUCHÉES ── */
const LcpTone = (v) => v >= 4 ? 'red' : v >= 2.5 ? 'yellow' : 'green';
const PagesCard = ({ resolved }) => {
  const pages = resolved ? PD.pages.map(p => ({ ...p, lcp: +(p.lcp - 2.1).toFixed(1), d: -(p.lcp - 2.1) })) : PD.pages;
  const tot = pages.reduce((s, p) => s + p.sessions, 0);
  return (
    <Sec title={`Pages touchées · ${pages.length}`} sub={`${tot.toLocaleString('fr-CA')} sessions/mois concernées · seuil Google : 2,5 s`}
      right={<Pill label="CrUX p75 · 28 j" tone="neutral" sm />}>
      <div className="hp-table hp-cols-4" style={{ display: 'grid', gridTemplateColumns: '1fr 150px 110px 64px', gap: '0 10px', alignItems: 'center' }}>
        {['Page', 'LCP mobile mesuré', 'Sessions / mois', 'Δ 30 j'].map((h, i) => <div key={h} className="lbl" style={{ paddingBottom: 6, borderBottom: '1px solid var(--bd-solid)', textAlign: i > 1 ? 'right' : 'left' }}>{h}</div>)}
        {pages.map(p => { const [bg, bd, fg] = TONE[LcpTone(p.lcp)]; return (
          <React.Fragment key={p.url}>
            <div className="td" style={{ fontWeight: 600, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{p.url}</div>
            <div className="td" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: '0.75rem', color: fg, minWidth: 34 }}>{p.lcp.toFixed(1).replace('.', ',')} s</span>
              <span style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }}>
                <span style={{ position: 'absolute', inset: '0 auto 0 0', width: `${Math.min(p.lcp / 6 * 100, 100)}%`, background: fg, borderRadius: 999 }}></span>
                <span style={{ position: 'absolute', left: `${2.5 / 6 * 100}%`, top: -2, bottom: -2, width: 2, background: 'var(--fg1)', opacity: 0.55 }} title="Seuil 2,5 s"></span>
              </span>
            </div>
            <div className="td" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color: 'var(--fg2)' }}>{p.sessions.toLocaleString('fr-CA')}</div>
            <div className="td" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.6875rem', fontWeight: 700, color: p.d > 0 ? 'var(--red)' : p.d < 0 ? 'var(--green-fg)' : 'var(--fg4)' }}>{p.d > 0 ? '+' : p.d < 0 ? '−' : '='}{p.d !== 0 && Math.abs(p.d).toFixed(1).replace('.', ',') + ' s'}</div>
          </React.Fragment>); })}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 2, height: 9, background: 'var(--fg1)', opacity: 0.55, display: 'inline-block' }}></span>Seuil « bon » Google (2,5 s)</span>
        <span>Δ 30 j : rouge = s’aggrave, vert = s’améliore</span>
      </div>
    </Sec>
  );
};

/* ── RECOMMANDATION ── */
const RecoCard = () => (
  <Sec title="Recommandation de l’agent" sub="Rédigée à partir des mesures ci-dessus · relue par personne pour l’instant" accent="var(--violet)"
    right={<Pill label="✦ IA" tone="violet" sm />}>
    <p style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'var(--fg2)', margin: '0 0 10px', textWrap: 'pretty' }}>{PD.reco}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
      {PD.steps.map(([s, g], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--bd)' }}>
          <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--violet)', color: '#fff', fontSize: '0.5625rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ flex: 1, fontSize: '0.6875rem', fontWeight: 600, minWidth: 0 }}>{s}</span>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--green-fg)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{g}</span>
        </div>))}
    </div>
    <div className="hp-keep2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      {[['Effort estimé', PD.effort, PD.effortLevel, 'neutral'], ['Impact technique attendu', PD.impactTech, 'Sous le seuil sur 6 pages', 'green'], ['Impact d’affaires attendu', PD.impactBiz, PD.impactCad, 'green']].map(([l, v, s, t]) => (
        <div key={l} style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid var(--bd)', background: 'var(--bg-surface)' }}>
          <Lbl mb={4}>{l}</Lbl>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t === 'green' ? 'var(--green-fg)' : 'var(--fg1)' }}>{v}</div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{s}</div>
        </div>))}
    </div>
    <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)' }}>Confiance de l’estimation : <b style={{ color: 'var(--fg2)' }}>{PD.confidence}</b> — 6 pages, mesures terrain concordantes avec le lab.</div>
  </Sec>
);

/* ── HISTORIQUE ── */
const HistoryCard = ({ recurrent, resolved }) => {
  let h = recurrent ? PD.historyRecurrent : PD.history;
  if (resolved) h = [...PD.history.slice(0, 3), { date: '2 sept. 2026', lcp: 2.1, ev: 'Résolue — tâche #142 livrée, preuve de valeur produite', tone: 'green' }];
  const first = h[0], last = h[h.length - 1];
  const worse = last.lcp > first.lcp;
  return (
    <Sec title="Historique" sub={recurrent ? 'Existe depuis 293 jours · déjà corrigée une fois · revenue' : resolved ? 'A existé 161 jours · corrigée' : `Existe depuis ${PD.ageDays} jours · ${worse ? 's’aggrave' : 'stable'} (${first.lcp.toFixed(1).replace('.', ',')} s → ${last.lcp.toFixed(1).replace('.', ',')} s)`}
      right={recurrent ? <Pill label="Récurrente" tone="red" icon={<PI.Rotate />} /> : worse && !resolved ? <Pill label="S’aggrave" tone="red" icon={<PI.Warn />} /> : null}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {h.map((e, i) => { const [, , fg] = TONE[e.tone]; return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '92px 14px 1fr 48px', gap: '0 8px', alignItems: 'start', minHeight: 34 }}>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums', paddingTop: 1 }}>{e.date}</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: e.tone === 'neutral' ? 'var(--bg-muted)' : fg, border: `2px solid ${e.tone === 'neutral' ? 'var(--bd-strong)' : fg}`, flexShrink: 0, marginTop: 3 }}></span>
              {i < h.length - 1 && <span style={{ flex: 1, width: 1, background: 'var(--bd-solid)', marginTop: 3 }}></span>}
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: e.tone === 'neutral' ? 500 : 600, color: e.tone === 'neutral' ? 'var(--fg3)' : 'var(--fg1)', paddingBottom: 10, paddingTop: 1 }}>{e.ev}</div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: TONE[LcpTone(e.lcp)][2] }}>{e.lcp.toFixed(1).replace('.', ',')} s</div>
          </div>); })}
      </div>
      {recurrent && <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 9, background: 'var(--red-m)', border: '1px solid var(--red-b)', fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}><b style={{ color: 'var(--red)' }}>Signal différent d’une priorité neuve.</b> La correction de février n’a pas tenu : cherchez la cause de la régression (déploiement, nouveau script) avant de rejouer la même tâche.</div>}
    </Sec>
  );
};

/* ── PROVENANCE ── */
const ProvCard = () => (
  <Sec title="Provenance" sub="D’où vient chaque affirmation">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--fg4)', display: 'flex' }}><PI.Task /></span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{PD.prov.audit}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{PD.prov.date} · {PD.prov.crawl}</div></div>
        <a href="Fiche Client v4.html" className="btn-out" style={{ padding: '0.25rem 0.6rem', fontSize: '0.625rem', textDecoration: 'none' }}>Voir l’audit</a>
      </div>
      {PD.prov.sources.map(([n, d]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--fg4)', display: 'flex' }}><PI.Db /></span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{n}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{d}</div></div>
        </div>))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--violet-fg)', display: 'flex', fontSize: 12 }}>✦</span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{PD.prov.agent}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Recommandation et libellé client · 27 mai 2026, 06 h 12</div></div>
      </div>
    </div>
  </Sec>
);

Object.assign(window, { PI, PD, PD_CLIENT, SEV, TONE, Pill, SevDot, Lbl, Sec, PagesCard, RecoCard, HistoryCard, ProvCard });
