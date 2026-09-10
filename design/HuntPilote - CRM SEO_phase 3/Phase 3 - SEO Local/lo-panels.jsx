/* HuntPilote — SEO local : panneaux partagés (vue d'ensemble + fiche d'établissement). */
const { useState: uLS } = React;
const { AIco: PAI, APill: PAP, ASec: PAS, ALbl: PAL, LOI, GBP_ICONS, ALL_GBP_FIELDS, GBP_STATE, ALERT_DEFS, ESTABS } = window;

const AlertChip = ({ id, sm = true }) => { const a = ALERT_DEFS[id]; return a ? <PAP label={a.label} tone={a.tone} sm={sm} icon={<a.Ico />} /> : null; };
const GbpChip = ({ st, sm = true }) => { const g = GBP_STATE[st]; return g ? <PAP label={g.label} tone={g.tone} sm={sm} icon={<g.Ico />} /> : null; };
const blocked = est => est.gbp !== 'revendiquee';

/* ── VUE D'ENSEMBLE : KPI DE PORTEFEUILLE ── */
const PortfolioKpis = ({ estabs, nSansEtab }) => {
  const mesurables = estabs.filter(e => e.scoreLocal != null);
  const moy = mesurables.length ? Math.round(mesurables.reduce((s, e) => s + e.scoreLocal, 0) / mesurables.length) : null;
  const enAction = estabs.filter(e => e.alerts.length > 0).length;
  const items = [
    { l: 'Établissements suivis', v: estabs.length },
    { l: 'Demandent une action', v: enAction, tone: enAction > 0 ? 'var(--red)' : 'var(--fg1)' },
    { l: 'Score local moyen', v: moy == null ? '—' : moy },
    { l: 'Clients sans établissement', v: nSansEtab, tone: nSansEtab > 0 ? 'var(--yellow-fg)' : 'var(--fg1)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
      {items.map(k => (
        <div key={k.l} className="card" style={{ padding: '0.7rem 0.9rem' }}>
          <div className="lbl" style={{ marginBottom: 5 }}>{k.l}</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: k.tone || 'var(--fg1)', fontVariantNumeric: 'tabular-nums' }}>{k.v}</div>
        </div>))}
    </div>);
};

/* ── VUE D'ENSEMBLE : CE QUI DEMANDE UNE ACTION ── */
const ActionQueueCard = ({ estabs }) => {
  const rows = estabs.filter(e => e.alerts.length > 0).flatMap(e => e.alerts.map(a => ({ est: e, alert: a })));
  const order = { red: 0, yellow: 1 };
  rows.sort((a, b) => (order[ALERT_DEFS[a.alert].tone] ?? 2) - (order[ALERT_DEFS[b.alert].tone] ?? 2));
  return (
    <PAS title="Ce qui demande une action" sub={rows.length ? `${rows.length} situation${rows.length > 1 ? 's' : ''} à traiter, la plus urgente en tête` : 'Aucune situation urgente en ce moment'}>
      {rows.length === 0
        ? <div className="empty">Tous les établissements suivis sont à jour.</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rows.map(({ est, alert }, i) => { const AlertIco = ALERT_DEFS[alert].Ico; return (
              <div key={est.id + alert} className="aq-row">
                <span className="crit-ico" data-st={ALERT_DEFS[alert].tone === 'red' ? 'fail' : 'warn'}><AlertIco /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{est.name}<span style={{ color: 'var(--fg3)', fontWeight: 500 }}> · {est.client}</span></div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginTop: 1 }}>{ALERT_DEFS[alert].label}</div>
                </div>
                <a className="btn-out" style={{ textDecoration: 'none', flexShrink: 0 }} href={`Fiche Etablissement.html?id=${est.id}`}>Voir la fiche<PAI.Arrow /></a>
              </div>); })}
          </div>}
    </PAS>);
};

/* ── VUE D'ENSEMBLE : LIGNE D'ÉTABLISSEMENT ── */
const EstabRow = ({ est }) => {
  const na = <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)', fontWeight: 700 }}>non mesuré</span>;
  return (
    <div className="estab-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '1 1 15rem', minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg3)' }}><LOI.Building /></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{est.name}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 1 }}>{est.client} · {est.ville}</div>
        </div>
      </div>
      <div className="estab-stat">
        <PAL mb={2}>Score local</PAL>
        {est.scoreLocal == null ? na : <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: est.scoreLocal >= 75 ? 'var(--green)' : est.scoreLocal >= 55 ? 'var(--yellow-b)' : 'var(--red)' }}>{est.scoreLocal}</span>}
      </div>
      <div className="estab-stat">
        <PAL mb={2}>Avis sans réponse</PAL>
        {est.scoreLocal == null ? na : <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: est.avisSansReponse > 0 ? 'var(--red)' : 'var(--fg1)' }}>{est.avisSansReponse}<span style={{ color: 'var(--fg3)', fontWeight: 500 }}> · {est.note}/5</span></span>}
      </div>
      <div className="estab-stat">
        <PAL mb={2}>Incohérences citations</PAL>
        {est.scoreLocal == null ? na : <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: est.incoh > 0 ? 'var(--yellow-fg)' : 'var(--fg1)' }}>{est.incoh}<span style={{ color: 'var(--fg3)', fontWeight: 500 }}> · {est.citTotal}/{est.citRef} annuaires</span></span>}
      </div>
      <div className="estab-stat">
        <PAL mb={2}>Position pack local</PAL>
        {est.packPos == null ? na : <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{est.packPos.toLocaleString('fr-CA', { minimumFractionDigits: 1 })}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
        <GbpChip st={est.gbp} />
        {est.alerts[0] && <AlertChip id={est.alerts[0]} />}
      </div>
      <a className="btn-out" style={{ textDecoration: 'none', flexShrink: 0 }} href={`Fiche Etablissement.html?id=${est.id}`}>Voir la fiche</a>
    </div>);
};

/* ── FICHE : EN-TÊTE MÉTA ── */
const EstabMetaCard = ({ est }) => (
  <PAS title="Cet établissement">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {[['Client', est.client], ['Ville', est.ville], ['Fiche Google Business', null]].map(([l, v]) => (
        <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <PAL mb={0} style={{ flex: '0 0 8rem' }}>{l}</PAL>
          {v ? <span style={{ fontSize: '0.6875rem', fontWeight: 600, flex: 1 }}>{v}</span> : <GbpChip st={est.gbp} />}
        </div>))}
    </div>
    <a href="SEO Local.html" className="btn-out" style={{ textDecoration: 'none', marginTop: 10, width: '100%', justifyContent: 'center' }}><PAI.Back />Retour à la vue d’ensemble</a>
  </PAS>);

/* ── FICHE : ÉTAT BLOQUANT (non revendiquée / suspendue / tiers) ── */
const BLOCK_COPY = {
  non_revendiquee: { title: 'Fiche Google Business non revendiquée', body: 'Personne à l’agence ne contrôle cette fiche : impossible de lire ses statistiques, de publier ou de corriger sa zone desservie tant qu’elle n’est pas revendiquée.', cta: 'Revendiquer la fiche', note: 'La revendication se fait depuis le compte Google du client — l’agence peut accompagner la démarche.' },
  suspendue: { title: 'Fiche suspendue · en attente de validation', body: 'Google a suspendu cette fiche en attendant une vérification. Aucune mesure ne peut être relevée pendant la suspension : les chiffres affichés seraient périmés.', cta: 'Voir les motifs de suspension', note: 'Une fiche revient généralement active quelques jours après la vérification complétée.' },
  tiers: { title: 'Fiche revendiquée par un tiers', body: 'Un autre compte Google détient l’accès à cette fiche — cas fréquent après un changement de propriétaire ou d’agence. L’agence ne peut rien y modifier avant un transfert d’accès.', cta: 'Lancer une demande de transfert', note: 'Le transfert exige l’approbation du détenteur actuel ; comptez plusieurs jours.' },
};
const BlockingCard = ({ est }) => {
  const c = BLOCK_COPY[est.gbp]; if (!c) return null;
  const g = GBP_STATE[est.gbp];
  return (
    <div className="card" style={{ padding: '1.25rem 1.125rem' }}>
      <div className="empty" style={{ border: 'none', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: g.tone === 'red' ? 'var(--red)' : 'var(--yellow-fg)', marginBottom: 8 }}><g.Ico /></div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: 6 }}>{c.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--fg2)', lineHeight: 1.6, maxWidth: '30rem', margin: '0 auto' }}>{c.body}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn-pri"><LOI.Ext />{c.cta}</button>
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 10, lineHeight: 1.5 }}>{c.note}</div>
      </div>
    </div>);
};

/* ── FICHE : COMPLÉTUDE GOOGLE BUSINESS ── */
const GbpCompletionCard = ({ est }) => {
  const pct = Math.round(est.gbpFilled / ALL_GBP_FIELDS.length * 100);
  return (
    <PAS title="Complétude de la fiche Google Business" sub={`${est.gbpFilled} champs remplis sur ${ALL_GBP_FIELDS.length} · Seuil : ${ALL_GBP_FIELDS.length} sur ${ALL_GBP_FIELDS.length}`}
      right={est.auditRef && <a href="Audit Detail.html" className="btn-out" style={{ textDecoration: 'none', fontSize: '0.5625rem', padding: '0.25rem 0.65rem' }}><PAI.Cmp />Relevé par l’audit {est.auditRef.id}</a>}>
      <div className="track" style={{ marginBottom: 10 }}><div className="fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : pct >= 60 ? 'var(--yellow-b)' : 'var(--red)' }}></div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ALL_GBP_FIELDS.map(f => {
          const missing = est.gbpMissing.includes(f); const Ico = GBP_ICONS[f];
          return (
            <div key={f} className="field-row" data-st={missing ? 'warn' : 'ok'}>
              <span className="crit-ico" data-st={missing ? 'warn' : 'ok'}><Ico /></span>
              <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600 }}>{f}</span>
              {missing
                ? (f === 'Zone desservie' ? <a href="#zone-editor" className="btn-out">Configurer la zone</a> : <button className="btn-out"><PAI.Plus />Compléter</button>)
                : <span style={{ fontSize: '0.625rem', color: 'var(--green-fg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><PAI.Check />Complet</span>}
            </div>);
        })}
      </div>
    </PAS>);
};

/* ── FICHE : RAPPEL DES CRITÈRES D'AUDIT (mêmes libellés et seuils, vus de plus près) ── */
const CriteresRappelCard = ({ est }) => (
  <PAS title="Présence en ligne — les mêmes critères que l’audit" sub="Vus de plus près : mêmes libellés, mêmes seuils. Le lien renvoie au relevé d’origine.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {est.criteres.map(it => (
        <div key={it.c} className="crit" data-st={it.st}>
          <span className="crit-ico" data-st={it.st}>{it.st === 'ok' ? <PAI.Check /> : it.st === 'fail' ? <PAI.X /> : <PAI.Warn />}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 3 }}>{it.c}</div>
            <div className="crit-meas"><span style={{ fontWeight: 700, color: 'var(--fg1)' }}>{it.measure}</span><span style={{ color: 'var(--fg3)' }}>{it.threshold}</span></div>
            {it.note && <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{it.note}</div>}
          </div>
          {est.auditRef && <a className="btn-out" style={{ textDecoration: 'none', flexShrink: 0 }} href="Audit Detail.html">Voir dans l’audit<PAI.Arrow /></a>}
        </div>))}
    </div>
  </PAS>);

/* ── FICHE : ÉDITEUR DE ZONE DESSERVIE — l'élément le plus important de l'écran ── */
const ZONE_MODES = [['rayon', 'Point et rayon'], ['secteurs', 'Liste de secteurs'], ['grille', 'Grille de points']];
const ZoneEditorCard = ({ est }) => {
  const init = est.zone;
  const [mode, setMode] = uLS(init ? init.mode : 'rayon');
  const [rayonKm, setRayonKm] = uLS(init && init.mode === 'rayon' ? init.km : 8);
  const [secteurs, setSecteurs] = uLS(init && init.mode === 'secteurs' ? init.secteurs : []);
  const [secInput, setSecInput] = uLS('');
  const [grid, setGrid] = uLS(init && init.mode === 'grille' ? `${init.rows}x${init.cols}` : '5x5');
  const [spacing, setSpacing] = uLS(init && init.mode === 'grille' ? init.spacingKm : 1);
  const [saved, setSaved] = uLS(!!init);
  const [rows, cols] = grid.split('x').map(Number);
  const points = rows * cols;
  const pricePerPoint = 0.35;
  const monthlyCost = (points * pricePerPoint).toFixed(2);
  const addSecteur = () => { const v = secInput.trim(); if (v && !secteurs.includes(v)) setSecteurs(s => [...s, v]); setSecInput(''); };

  return (
    <div className="card" id="zone-editor" style={{ padding: '1rem 1.125rem', borderTop: '2px solid var(--green-b)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ color: 'var(--green-fg)', display: 'flex' }}><LOI.Layers /></span><span style={{ fontSize: '0.875rem', fontWeight: 800 }}>Zone desservie</span>{!saved && <PAP label="Jamais configurée" tone="yellow" sm icon={<PAI.Warn />} />}</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', marginTop: 3, lineHeight: 1.5 }}>Réglée par établissement, selon ce que le commerce dessert et d’où il se trouve. Choisissez le mode qui correspond à ce commerce.</div>
        </div>
      </div>

      <div className="seg" role="group" aria-label="Mode de zone desservie" style={{ marginBottom: 14 }}>
        {ZONE_MODES.map(([id, l]) => <button key={id} type="button" className={mode === id ? 'on' : ''} aria-pressed={mode === id} onClick={() => setMode(id)}>{l}</button>)}
      </div>

      {mode === 'rayon' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bd-solid)" strokeDasharray="3 4" />
            <circle cx="60" cy="60" r="34" fill="none" stroke="var(--bd-strong)" strokeDasharray="3 4" />
            <circle cx="60" cy="60" r="16" fill="var(--green-m)" stroke="var(--green-b)" />
            <circle cx="60" cy="60" r="3.5" fill="var(--green-fg)" />
          </svg>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <PAL mb={6}>Rayon depuis l’adresse de l’établissement</PAL>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min="1" max="40" value={rayonKm} onChange={e => { setRayonKm(+e.target.value); setSaved(false); }} style={{ flex: 1 }} aria-label="Rayon en kilomètres" />
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: '4rem', textAlign: 'right' }}>{rayonKm} km</span>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 6, lineHeight: 1.5 }}>Simple et rapide : convient à un commerce de quartier dont la clientèle vient d’une zone à peu près circulaire.</div>
          </div>
        </div>)}

      {mode === 'secteurs' && (
        <div>
          <PAL mb={6}>Villes, arrondissements ou codes postaux desservis</PAL>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {secteurs.map(s => <span key={s} className="sector-chip">{s}<button aria-label={`Retirer ${s}`} onClick={() => { setSecteurs(ss => ss.filter(x => x !== s)); setSaved(false); }}><PAI.X /></button></span>)}
            {secteurs.length === 0 && <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>Aucun secteur ajouté</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="inp" value={secInput} onChange={e => setSecInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSecteur()} placeholder="Ex. Longueuil, J4K, Vieux-Longueuil…" style={{ flex: 1 }} aria-label="Ajouter un secteur" />
            <button className="btn-out" onClick={addSecteur}><PAI.Plus />Ajouter</button>
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 8, lineHeight: 1.5 }}>Adapté à un commerce qui dessert des secteurs précis plutôt qu’un cercle continu.</div>
        </div>)}

      {mode === 'grille' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="grille-viz" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
            {Array.from({ length: points }).map((_, i) => { const isCenter = i === Math.floor(points / 2); return <span key={i} className="grille-dot" data-center={isCenter}></span>; })}
          </div>
          <div style={{ flex: 1, minWidth: '14rem' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <div>
                <PAL mb={4}>Densité de la grille</PAL>
                <select className="date-sel" value={grid} onChange={e => { setGrid(e.target.value); setSaved(false); }} aria-label="Densité de la grille">
                  <option value="3x3">3 × 3 · 9 points</option><option value="5x5">5 × 5 · 25 points</option><option value="7x7">7 × 7 · 49 points</option>
                </select>
              </div>
              <div>
                <PAL mb={4}>Écart entre les points</PAL>
                <select className="date-sel" value={spacing} onChange={e => { setSpacing(+e.target.value); setSaved(false); }} aria-label="Écart entre les points">
                  <option value="0.5">0,5 km</option><option value="1">1 km</option><option value="2">2 km</option><option value="5">5 km</option>
                </select>
              </div>
            </div>
            <div className="note-box" style={{ marginTop: 0, background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)' }}>
              <span style={{ color: 'var(--yellow-fg)', display: 'flex', marginTop: 1 }}><LOI.Ruler /></span>
              <div style={{ flex: 1 }}><b>{points} points de mesure · environ {monthlyCost} $ CA / mois de relevés.</b> La densité déterminera le coût : chaque point mesure séparément la variation du pack local à cet endroit.</div>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 8, lineHeight: 1.5 }}>Le plus précis des trois modes : convient pour mesurer finement la variation de visibilité selon le quartier.</div>
          </div>
        </div>)}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button className="btn-pri" onClick={() => setSaved(true)}><PAI.Check />{saved ? 'Zone enregistrée' : 'Enregistrer la zone'}</button>
      </div>
    </div>);
};

/* ── FICHE : PUBLICATIONS RÉCENTES ── */
const PublicationsCard = ({ est }) => (
  <PAS title="Publications Google récentes" sub={est.publications.length ? `${est.publications.length} publication${est.publications.length > 1 ? 's' : ''}` : null}>
    {est.publications.length === 0
      ? <div className="empty">Aucune publication dans les 60 derniers jours. Une fiche active publie au moins une fois par mois.</div>
      : <div style={{ display: 'flex', flexDirection: 'column' }}>
          {est.publications.map((p, i) => (
            <div key={i} className="hist-row" style={{ alignItems: 'flex-start' }}>
              <span className="crit-ico" data-st={p.expiree ? 'na' : 'ok'}><LOI.Megaphone /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.text}</div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{p.type} · {p.date} · {p.vues} vues{p.expiree ? ' · expirée' : ''}</div>
              </div>
            </div>))}
        </div>}
  </PAS>);

/* ── FICHE : QUESTIONS SANS RÉPONSE ── */
const QaCard = ({ est }) => (
  <PAS title="Questions-réponses" sub={est.qa.length ? `${est.qa.length} question${est.qa.length > 1 ? 's' : ''} sans réponse` : null}
    right={est.qa.length > 0 ? <PAP label="Sans réponse" tone="yellow" sm icon={<PAI.Warn />} /> : null}>
    {est.qa.length === 0
      ? <div className="empty">Aucune question en attente.</div>
      : <div style={{ display: 'flex', flexDirection: 'column' }}>
          {est.qa.map((q, i) => (
            <div key={i} className="hist-row" style={{ alignItems: 'flex-start' }}>
              <span className="crit-ico" data-st="warn"><LOI.Msg /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{q.q}</div><div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>Posée le {q.date}</div></div>
              <button className="btn-out" style={{ flexShrink: 0 }}>Répondre</button>
            </div>))}
        </div>}
  </PAS>);

/* ── FICHE : STATISTIQUES ── */
const StatsCard = ({ est }) => (
  <PAS title="Statistiques · 30 derniers jours">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      {[['Appels', est.stats.appels, est.stats.appelsD, LOI.Phone], ['Itinéraires', est.stats.itin, est.stats.itinD, LOI.Route], ['Visites du site', est.stats.visites, est.stats.visitesD, PAI.Globe]].map(([l, v, d, Ico]) => (
        <div key={l} style={{ background: 'var(--bg-muted)', borderRadius: 10, padding: '0.55rem 0.65rem' }}>
          <div style={{ color: 'var(--fg3)', marginBottom: 4 }}><Ico /></div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v}</div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 2 }}>{l}</div>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: d >= 0 ? 'var(--green-fg)' : 'var(--red)', marginTop: 3 }}>{d >= 0 ? '+' : '−'}{Math.abs(d)} vs mois précédent</div>
        </div>))}
    </div>
  </PAS>);

/* ── FICHE : ACCÈS AUX ÉCRANS LIÉS ── */
const LinkedScreensCard = ({ est }) => (
  <PAS title="Écrans liés">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <a className="link-row" style={{ textDecoration: 'none' }} href={`Avis.html?id=${est.id}`}><span className="crit-ico" data-st="neutral"><LOI.Star /></span><div style={{ flex: 1 }}><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Avis</div><div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{est.note}/5 · {est.avisSansReponse} sans réponse</div></div><PAI.Arrow /></a>
      <a className="link-row" style={{ textDecoration: 'none' }} href={`Citations.html?id=${est.id}`}><span className="crit-ico" data-st="neutral"><LOI.Layers /></span><div style={{ flex: 1 }}><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Citations</div><div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>{est.citTotal}/{est.citRef} annuaires · {est.incoh} incohérence{est.incoh > 1 ? 's' : ''}</div></div><PAI.Arrow /></a>
      <div className="link-row"><span className="crit-ico" data-st="neutral"><PAI.Srch /></span><div style={{ flex: 1 }}><a href={`Positions.html?id=${est.id}`} style={{ textDecoration: 'none', color: 'var(--fg1)' }}><div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Positions · pack local</div></a><div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Position moyenne {est.packPos}</div></div><a href={`Positions.html?id=${est.id}`} style={{ display: 'flex' }}><PAI.Arrow /></a></div>
      <a className="link-row" style={{ textDecoration: 'none' }} href={`Concurrence.html?id=${est.id}`}><span className="crit-ico" data-st="neutral"><PAI.Up /></span><div style={{ flex: 1 }}><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg1)' }}>Concurrence locale</div><div style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Qui vous devance dans le pack</div></div><PAI.Arrow /></a>
    </div>
  </PAS>);

Object.assign(window, { AlertChip, GbpChip, blocked, PortfolioKpis, ActionQueueCard, EstabRow, EstabMetaCard, BlockingCard, GbpCompletionCard, CriteresRappelCard, ZoneEditorCard, PublicationsCard, QaCard, StatsCard, LinkedScreensCard });
