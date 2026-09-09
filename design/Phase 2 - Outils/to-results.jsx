/* HuntPilote — cadre des outils : zone de résultats (contenu propre à l'outil) et colonne latérale. */
const { useState: uS2 } = React;
const AI3 = window.AIco, AP3 = window.APill, AS3 = window.ASec, CR3 = window.CritRow;

/* ── ZONE DE L'OUTIL : interroger, filtrer, exporter, agir sur les lignes ── */
const ResultsRegion = ({ status, rows, created, onCreate, q, onQ, only, onOnly, onWiden, onFocusAcct, onRetry }) => (
  <div className="slot">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
      <span className="slot-tag"><window.TI.Filter />Zone propre à l’outil</span>
      <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.45, flex: 1, minWidth: '12rem' }}>Les sept outils remplacent ce bloc — jamais le cadre. Ici, une liste de résultats fictive.</span>
    </div>
    <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="res-bar">
        <input className="inp" value={q} onChange={e => onQ(e.target.value)} placeholder="Filtrer les résultats…" aria-label="Filtrer les résultats" style={{ width: '11rem' }} />
        <select className="inp" value={only} onChange={e => onOnly(e.target.value)} aria-label="Filtrer par statut">
          <option value="tous">Tous les statuts</option>
          <option value="sous">Sous le seuil</option>
          <option value="ok">Au seuil</option>
        </select>
        <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{status === 'ok' ? `${rows.length} résultat${rows.length > 1 ? 's' : ''}` : '—'}</span>
        <button className="btn-out" style={{ marginLeft: 'auto' }} disabled={status !== 'ok'}><window.TI.Export />Exporter en CSV</button>
      </div>
      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }} aria-live="polite">
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6 }}><AI3.Clock />Interrogation du fournisseur de données…</div>
          {[0, 1, 2, 3].map(i => <div key={i} className="skel" style={{ height: 44, opacity: 1 - i * 0.18 }}></div>)}
        </div>)}
      {status === 'nosel' && (
        <div className="empty">
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Choisissez un compte pour lancer l’outil</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto 10px' }}>Le compte pré-remplit le domaine, fixe la période comparable et reçoit les résultats que vous enregistrez. Clients et prospects figurent dans la même liste.</div>
          <button className="btn-out" onClick={onFocusAcct}>Choisir un compte</button>
        </div>)}
      {status === 'filtre' && (
        <div className="empty">
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucun résultat pour ces filtres</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 10 }}>34 résultats existent pour ce domaine, aucun ne correspond à la combinaison actuelle.</div>
          <button className="btn-out" onClick={onWiden}><AI3.Refresh />Élargir la recherche</button>
        </div>)}
      {status === 'sain' && (
        <div className="empty" style={{ borderColor: 'var(--green-b)', background: 'var(--green-m)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span className="crit-ico" data-st="ok"><AI3.Check /></span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Rien à corriger ici</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>Les 34 résultats suivis sont au seuil ou au-dessus. Bonne nouvelle à verser au prochain rapport client — aucune priorité à créer.</div>
        </div>)}
      {status === 'erreur' && (
        <div className="empty" style={{ borderColor: 'var(--red-b)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Résultats indisponibles</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 10 }}>La dernière requête a échoué avant de renvoyer des lignes. Aucun crédit facturé.</div>
          <button className="btn-out" onClick={onRetry}><AI3.Refresh />Relancer la requête</button>
        </div>)}
      {status === 'nonconnecte' && (
        <div className="empty">
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Outil en attente d’intégration</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 10 }}>Les résultats apparaîtront dès que la clé d’API du fournisseur sera enregistrée dans les paramètres de l’agence.</div>
          <a href="Parametres.html" className="btn-out" style={{ textDecoration: 'none' }}><AI3.Plug />Ouvrir les paramètres</a>
        </div>)}
      {status === 'ok' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {rows.map(r => <CR3 key={r.c} it={r} created={created} onCreate={onCreate} />)}
          <div className="note-box"><span style={{ color: 'var(--fg3)', display: 'flex', marginTop: 1 }}><window.TI.Info /></span><span><b>Créer la priorité</b> est une action de ligne, répétée sur chaque résultat. <b>Enregistrer dans la fiche</b>, en haut, verse l’ensemble du résultat à l’historique du compte : c’est la seule action principale de l’écran.</span></div>
        </div>)}
    </div>
  </div>);

/* ── MARQUEUR DE CONSERVATION ── */
const KeepCard = ({ prospect }) => {
  const [tone, label, ico, txt] = prospect
    ? ['yellow', 'Instantané · jamais historisé', <window.TI.Snap />, 'Un prospect ne reçoit pas d’historique. Le résultat reste consultable 30 jours, puis disparaît.']
    : ['neutral', 'Éphémère · purgé après 30 jours', <AI3.Clock />, 'Cet outil produit une exploration ponctuelle. Enregistrer dans la fiche est le seul moyen d’en garder une trace durable.'];
  return (
    <AS3 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
      <div style={{ marginBottom: 9 }}><AP3 label={label} tone={tone} icon={ico} /></div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 11 }}>{txt}</div>
      <div className="keep-row">
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>Conservé automatiquement</span>
        <span style={{ color: 'var(--fg3)' }}>·</span><span>Scores d’audit, Lighthouse, positions SERP et locales, backlinks en delta</span>
        <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: 5 }}>Éphémère · 30 jours</span>
        <span style={{ color: 'var(--fg3)' }}>·</span><span>Exploration de mots-clés, analyses ponctuelles de concurrents</span>
      </div>
    </AS3>);
};

/* ── COÛT ET CONSOMMATION ── */
const CostCard = ({ cost, quota }) => {
  const pct = Math.round(quota.used / quota.max * 100), warn = pct >= 90;
  return (
    <AS3 title="Coût de la requête" sub="Chaque appel est facturé chez le fournisseur." right={<AP3 label={cost.weight} tone={cost.weight === 'Requête lourde' ? 'yellow' : 'neutral'} sm />}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 11 }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{cost.credits}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg2)' }}>crédits · {cost.dollars}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', marginBottom: 5 }}>
        <span style={{ color: 'var(--fg3)' }}>Consommation de septembre</span>
        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{quota.used.toLocaleString('fr-CA')} / {quota.max.toLocaleString('fr-CA')}</span>
      </div>
      <div className="track"><div className="fill" style={{ width: `${Math.min(pct, 100)}%`, background: warn ? 'var(--yellow-b)' : 'var(--green)' }}></div></div>
      <div style={{ fontSize: '0.5625rem', color: warn ? 'var(--yellow-fg)' : 'var(--fg3)', marginTop: 5, fontWeight: warn ? 700 : 500 }}>{warn ? `${pct} % du quota utilisé · seuil d’alerte 90 %` : `${pct} % du quota mensuel · seuil d’alerte 90 %`}</div>
    </AS3>);
};

/* ── DERNIERS ENREGISTREMENTS DANS LA FICHE ── */
const SavesCard = ({ acct, justSaved, prospect, items, toolName = 'Outil de démonstration', savedWhat }) => (
  <AS3 title="Enregistré dans la fiche" sub={acct ? `Historique de ${acct.name}` : 'Aucun compte sélectionné'}>
    {!acct && <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>L’historique apparaît une fois le compte choisi.</div>}
    {acct && prospect && <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5 }}>Un prospect n’a pas d’historique d’outils. L’enregistrement crée un instantané joint au dossier de démarchage.</div>}
    {acct && !prospect && (
      <div>
        {justSaved && <div className="save-row"><span className="crit-ico" data-st="ok"><AI3.Check /></span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>À l’instant · {toolName}</div><div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{savedWhat || `${window.TOOL_ROWS.length} résultats · période courante`}</div></div></div>}
        {(items || window.TOOL_SAVES).map(s => (
          <div className="save-row" key={s.d + s.t}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{s.t}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.45 }}>{s.w}</div>
            </div>
            <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', whiteSpace: 'nowrap', marginTop: 2 }}>{s.d}</span>
          </div>))}
        <a href="Fiche Client v4.html" className="btn-out" style={{ textDecoration: 'none', marginTop: 10, width: '100%', justifyContent: 'center' }}>Ouvrir la fiche du compte<AI3.Arrow /></a>
      </div>)}
  </AS3>);

Object.assign(window, { ResultsRegion, KeepCard, CostCard, SavesCard });
