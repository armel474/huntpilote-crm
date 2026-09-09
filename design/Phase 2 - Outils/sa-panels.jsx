/* HuntPilote — Site Audit : blocs de l'outil (résumé de crawl, familles, pages, états).
   Réutilise .crit, .card, ASec, APill, A_STATUS. Le cadre commun vient de to-panels.jsx. */
const { useState: uSA } = React;
const AI4 = window.AIco, AP4 = window.APill, AS4 = window.ASec, ST4 = window.A_STATUS, SI4 = window.SAI;

/* ── RÉSUMÉ DE L'EXPLORATION — chaque mesure porte son seuil ── */
const CrawlSummary = ({ crawl, partial, onRelaunch }) => {
  const d = (a, b, inv) => { const v = a - b; if (v === 0) return <span className="delta" style={{ color: 'var(--fg3)' }}>stable</span>; const bad = inv ? v > 0 : v < 0; return <span className="delta" style={{ color: bad ? 'var(--red)' : 'var(--green-fg)' }}>{v > 0 ? <AI4.Up /> : <AI4.Down />}<span>{(v > 0 ? '+' : '−') + Math.abs(v)}</span></span>; };
  return (
    <AS4 title="Résumé de l’exploration" sub={partial ? `Passage interrompu le ${crawl.date} à ${crawl.hour} · comparaison partielle` : `Dernier passage le ${crawl.date} à ${crawl.hour} · ${crawl.ago} · référence : crawl du ${crawl.prev.date}`}
      right={<button className="btn-out" onClick={onRelaunch}><AI4.Refresh />Relancer l’exploration</button>}>
      <div className="sum-grid">
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Pages explorées</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="sum-val">{crawl.pages}</span>{d(crawl.pages, crawl.prev.pages)}</div>
          <div className="sum-thr">seuil du quota : {crawl.quotaPages} pages par passage</div>
        </div>
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Pages en erreur</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="sum-val" style={{ color: 'var(--red)' }}>{crawl.err}</span>{d(crawl.err, crawl.prev.err, true)}</div>
          <div className="sum-thr">seuil 0 page · 404 et 5xx confondues</div>
        </div>
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Profondeur moyenne</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="sum-val">{crawl.depth}</span><span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>clics</span></div>
          <div className="sum-thr">seuil ≤ 4 clics · {crawl.prev.depth} au passage précédent</div>
        </div>
        <div className="sum-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Dernier passage</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="sum-val" style={{ fontSize: '1.0625rem' }}>{crawl.date}</span></div>
          <div className="sum-thr">seuil : moins de 30 jours · {crawl.ago}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 11, flexWrap: 'wrap' }}>
        <div className="diff-col" style={{ flex: '1 1 14rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AP4 label="12 URL apparues" tone="blue" sm icon={<AI4.Plus />} /><span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>depuis le {crawl.prev.date}</span></div>
          {crawl.apparues.map(u => <span className="diff-li" key={u}>{u}</span>)}
        </div>
        <div className="diff-col" style={{ flex: '1 1 14rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AP4 label="4 URL disparues" tone="neutral" sm icon={<AI4.X />} /><span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>dont 3 devenues 404</span></div>
          {crawl.disparues.map(u => <span className="diff-li" key={u}>{u}</span>)}
        </div>
      </div>
      {partial && (
        <div className="note-box" style={{ background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
          <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><AI4.Warn /></span>
          <div style={{ flex: 1, minWidth: 0 }}><b>Exploration partielle — 128 pages sur ~500.</b> Le serveur a répondu 429 (trop de requêtes) après 128 URL. Les constats ci-dessous ne couvrent qu’un quart du site : ne les enregistrez pas comme un relevé complet.</div>
        </div>)}
      <div className="note-box">
        <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}><window.TI.Info /></span>
        <div style={{ flex: 1, minWidth: 0 }}><b>Pas de score global ici.</b> Cet outil délimite ; le score pondéré des trois dimensions est relevé une fois par mois par l’audit.</div>
        <a href="Audit Detail.html" className="btn-out" style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}>Voir l’audit<AI4.Arrow /></a>
      </div>
    </AS4>);
};

/* ── EXPLORATION EN COURS ── */
const CrawlRunning = ({ pct, onStop }) => (
  <AS4 title="Exploration en cours" sub="Lancée à 09 h 41 · portée : site complet" accent="var(--blue-b)"
    right={<button className="btn-out" onClick={onStop}><SI4.Stop />Arrêter</button>}>
    <div className="prog-row"><span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{Math.round(pct * 4.12)} pages explorées</span><span>sur ~412 attendues</span><span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{pct} %</span></div>
    <div className="track"><div className="fill" style={{ width: `${pct}%`, background: 'var(--blue-fg)' }}></div></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 11 }} aria-live="polite">
      {[['Découverte des URL', pct > 20], ['Réponses HTTP et redirections', pct > 45], ['Balises on-page', pct > 70], ['Core Web Vitals par gabarit', false]].map(([l, done]) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.625rem' }}>
          {done ? <span className="crit-ico" data-st="ok" style={{ width: 16, height: 16, marginTop: 0 }}><AI4.Check /></span> : <span className="crit-ico" data-st="na" style={{ width: 16, height: 16, marginTop: 0 }}><AI4.Clock /></span>}
          <span style={{ color: done ? 'var(--fg1)' : 'var(--fg3)', fontWeight: done ? 700 : 500 }}>{l}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>{done ? 'terminé' : 'en attente'}</span>
        </div>))}
    </div>
    <div className="note-box"><span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}><AI4.Clock /></span><div style={{ flex: 1 }}>Les familles apparaissent au fur et à mesure. Vous pouvez quitter l’écran : l’exploration continue et la fiche vous en avertira.</div></div>
  </AS4>);

/* ── LIGNE DE CONSTAT (.crit inchangée) + liste des pages concernées ── */
const SaCrit = ({ it, famId, created, onCreate, onCreatePage }) => {
  const [open, setOpen] = uSA(false);
  const s = ST4[it.st], key = famId + ':' + it.c;
  const prio = it.prio || created[key];
  const actionable = it.st !== 'ok' && it.st !== 'na';
  return (
    <div className="crit" data-st={it.st}>
      <span className="crit-ico" data-st={it.st}><s.Ico /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{it.c}</span>
          <AP4 label={s.label} tone={s.tone} sm icon={<s.Ico />} />
        </div>
        <div className="crit-meas">
          <span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{it.measure}</span>
          <span style={{ color: 'var(--fg3)' }}>{it.threshold}</span>
        </div>
        {it.note && <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{it.note}</div>}
      </div>
      <div className="crit-act" style={{ gap: 6 }}>
        <button className="btn-out" onClick={() => setOpen(o => !o)} aria-expanded={open}><SI4.Page /><span>{it.n} page{it.n > 1 ? 's' : ''}</span><span className="chev" data-open={open}><SI4.Chev /></span></button>
        {prio
          ? <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><AP4 label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<AI4.Arrow />} /></a>
          : actionable
            ? <button className="btn-out" onClick={() => onCreate(key)}><AI4.Plus />Créer la priorité</button>
            : <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>Rien à traiter</span>}
      </div>
      {open && (
        <div className="crit-more">
          {it.pgs.map(([u, m]) => {
            const pk = famId + ':' + u, pp = created[pk];
            return (
              <div className="pg" key={u}>
                <span className="pg-url" title={u}>{u}</span>
                <span className="pg-meas">{m}</span>
                {pp
                  ? <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><AP4 label={pp} tone="blue" sm /></a>
                  : <button className="pg-btn" onClick={() => onCreatePage(pk)}><AI4.Plus />Priorité</button>}
              </div>);
          })}
          {it.n > it.pgs.length && <div className="pg-rest">{it.n - it.pgs.length} autres pages concernées · exportez le CSV pour la liste complète</div>}
        </div>)}
    </div>);
};

/* ── FAMILLE : le groupement qui rend la liste utilisable ── */
const FamilyGroup = ({ fam, rows, open, onToggle, created, onCreate, onCreatePage }) => {
  const sev = window.SA_SEV[fam.sev];
  const touched = rows.reduce((n, r) => n + r.n, 0);
  const nFail = rows.filter(r => r.st === 'fail').length;
  const key = 'fam:' + fam.id, prio = created[key];
  return (
    <div className="fam" data-sev={fam.sev}>
      <div className="fam-top">
      <button className="fam-head" onClick={onToggle} aria-expanded={open}>
        <span className="chev" data-open={open}><SI4.Chev /></span>
        <span className="fam-ico"><fam.Icon /></span>
        <span style={{ minWidth: 0, flex: '1 1 12rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.015em' }}>{fam.name}</span>
            <AP4 label={sev.label} tone={sev.tone} sm icon={sev.tone === 'red' ? <AI4.X /> : sev.tone === 'yellow' ? <AI4.Warn /> : <AI4.Eye />} />
            <span style={{ fontSize: '0.625rem', color: 'var(--fg2)', fontVariantNumeric: 'tabular-nums' }}>{rows.length} constat{rows.length > 1 ? 's' : ''} · {touched} pages touchées{nFail > 0 ? ` · ${nFail} hors seuil` : ''}</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.45 }}>{fam.sub}</span>
        </span>
      </button>
      <div className="fam-act">
        {prio
          ? <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><AP4 label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<AI4.Arrow />} /></a>
          : <button className="btn-out" onClick={() => onCreate(key)}><AI4.Plus /><span>Créer la priorité · famille</span></button>}
      </div>
      </div>
      {open && (
        <div className="fam-body">
          {rows.map(r => <SaCrit key={r.c} it={r} famId={fam.id} created={created} onCreate={onCreate} onCreatePage={onCreatePage} />)}
        </div>)}
    </div>);
};

/* ── CE QUE CE CRAWL ALIMENTE — la frontière avec l'audit mensuel ── */
const FeedsCard = () => (
  <AS4 title="Ce que ce crawl alimente" sub="L’outil produit la matière ; l’audit produit le score.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[['SEO', 'Indexation, erreurs, on-page, structure', '40 %', 'green'], ['Design', 'Core Web Vitals et images sans alt', 'partiel', 'blue'], ['Présence en ligne', 'Hors portée du crawl', 'aucune', 'neutral']].map(([n, w, part, tone]) => (
        <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{n}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.45 }}>{w}</div>
          </div>
          <AP4 label={part} tone={tone} sm />
        </div>))}
    </div>
    <div className="note-box">Enregistrer dans la fiche verse ces mesures à la dimension correspondante du prochain audit mensuel.</div>
  </AS4>);

/* ── CONSERVATION — variante propre à cet outil : le crawl, lui, est historisé ── */
const SaKeepCard = ({ prospect }) => (
  <AS4 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
    <div style={{ marginBottom: 9 }}>
      {prospect
        ? <AP4 label="Instantané · jamais historisé" tone="yellow" icon={<window.TI.Snap />} />
        : <AP4 label="Conservé une fois enregistré" tone="green" icon={<AI4.Check />} />}
    </div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 11 }}>
      {prospect
        ? 'Un prospect ne reçoit pas d’historique de crawl. Le résultat sert au démarchage et disparaît après 30 jours.'
        : 'Les compteurs et les mesures par gabarit rejoignent l’historique du client. La liste détaillée des URL, elle, reste éphémère : elle sera périmée au prochain passage.'}
    </div>
    <div className="keep-row">
      <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>Conservé automatiquement</span>
      <span style={{ color: 'var(--fg3)' }}>·</span><span>Compteurs de pages et d’erreurs, profondeur, Core Web Vitals par gabarit</span>
      <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: 5 }}>Éphémère · 30 jours</span>
      <span style={{ color: 'var(--fg3)' }}>·</span><span>Liste des URL concernées, sauf celles reprises dans une priorité</span>
    </div>
  </AS4>);

Object.assign(window, { CrawlSummary, CrawlRunning, SaCrit, FamilyGroup, FeedsCard, SaKeepCard });
