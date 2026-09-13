/* HuntPilote — Agence hub : Catalogue et Constructeur d'offres. */
const { useState: catUseState, useRef: catUseRef, useEffect: catUseEffect } = React;
const catUid = () => 'x' + Math.random().toString(36).slice(2, 9);

const CatI = {
  Grip: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="5" r="1.6" /><circle cx="16" cy="5" r="1.6" /><circle cx="8" cy="12" r="1.6" /><circle cx="16" cy="12" r="1.6" /><circle cx="8" cy="19" r="1.6" /><circle cx="16" cy="19" r="1.6" /></svg>,
  Chevron: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  Up: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Down: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
};

const CAT_VIEWS = [['edit', 'Modifiable — droit \u2018Gérer le catalogue\u2019'], ['readonly', 'Lecture seule — sans ce droit'], ['error', 'Dernier enregistrement en erreur']];
const CatViewBar = ({ view, setView }) => (
  <select className="fld" style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} value={view} onChange={(e) => setView(e.target.value)} aria-label="Vue de démonstration">
    {CAT_VIEWS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
  </select>
);

const catDragProps = (i, onDrop, enabled) => enabled ? {
  draggable: true,
  onDragStart: (e) => { e.dataTransfer.effectAllowed = 'move'; window.__catDragI = i; },
  onDragOver: (e) => e.preventDefault(),
  onDrop: (e) => { e.preventDefault(); onDrop(window.__catDragI, i); },
} : {};

/* ── Tableau d'articles ── */
const ArticleRow = ({ a, i, onDrop, onOpen, canManage }) => (
  <div className={`tbl-row${!a.actif ? ' archived' : ''}`} onClick={() => onOpen(a)} {...catDragProps(i, onDrop, canManage)}>
    <span className="tbl-drag" onClick={(e) => e.stopPropagation()}>{canManage && <CatI.Grip />}</span>
    <span style={{ fontSize: '0.75rem', color: 'var(--fg3)', fontWeight: 600 }}>{a.code}</span>
    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{a.nom}</span>
    <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{catRecLabel(a.recurrence)}</span>
    <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{a.unite}</span>
    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: a.prixUnitaire == null ? 'var(--yellow-fg)' : 'var(--fg1)' }}>{a.prixUnitaire == null ? 'Sans prix' : catFmt(a.prixUnitaire)}</span>
    <span>{!a.actif && <AgBdg label="Archivé" t="neutral" />}</span>
  </div>
);
const ArticleTable = ({ title, items, onReorder, onOpen, canManage }) => {
  const drop = (from, to) => { if (from == null || from === to) return; const arr = [...items]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); onReorder(arr); };
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 8 }}>{title} <span style={{ color: 'var(--fg4)', fontWeight: 500 }}>· {items.length}</span></div>
      <div className="card tbl" style={{ padding: '0.4rem 0.75rem 0.5rem', '--tbl-cols': '22px 74px 2.1fr 100px 80px 100px 90px' }}>
        <div className="tbl-head">{['', 'Code', 'Nom', 'Récurrence', 'Unité', 'Prix', 'Statut'].map((h, i) => <div key={i} className="lbl">{h}</div>)}</div>
        {items.map((a, i) => <ArticleRow key={a.id} a={a} i={i} onDrop={drop} onOpen={onOpen} canManage={canManage} />)}
      </div>
    </div>
  );
};

/* ── Panneau d'édition d'article (slide-over) ── */
const ArticleEditor = ({ article, isNew, canManage, offers, onSave, onClose }) => {
  const [d, setD] = catUseState(article);
  const [saveState, setSaveState] = catUseState('idle');
  const set = (k) => (e) => { const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; setD((p) => { const nx = { ...p, [k]: v }; if (k === 'sorte' && v === 'produit') nx.recurrence = 'ponctuel'; return nx; }); };
  const usedIn = catArticleUsedIn(article.id, offers);
  const willArchive = d.actif === false && article.actif !== false;
  const save = () => { setSaveState('saving'); setTimeout(() => { onSave(d); }, 500); };
  const valid = d.nom && d.nom.trim() && d.unite && d.unite.trim();
  return (
    <div className="dl-scrim" onClick={onClose}>
      <div className="dl-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="dl-head">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{isNew ? 'Nouvel article' : d.nom}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>{d.code}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><AgI.X /></button>
        </div>
        <div className="dl-body">
          {!canManage && <AgLocked reason="Lecture seule — le droit \u2018Gérer le catalogue\u2019 est requis pour modifier cet article." />}
          {willArchive && usedIn.length > 0 && <div className="dl-banner yellow"><span><AgI.Warn /></span><span>Cet article est utilisé par <b>{usedIn.length} offre{usedIn.length > 1 ? 's' : ''} active{usedIn.length > 1 ? 's' : ''}</b>. Il restera dans ces offres tel quel — seul le catalogue le marquera comme archivé.</span></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <AgField label="Nom" span><input className="fld" value={d.nom} onChange={set('nom')} disabled={!canManage} /></AgField>
            <AgField label="Code"><input className="fld" value={d.code} onChange={set('code')} disabled={!canManage} /></AgField>
            <AgField label="Sorte"><select className="fld" value={d.sorte} onChange={set('sorte')} disabled={!canManage}><option value="service">Service</option><option value="produit">Produit</option></select></AgField>
            <AgField label="Récurrence" hint={d.sorte === 'produit' ? 'Un produit est forcément ponctuel.' : undefined}><select className="fld" value={d.recurrence} onChange={set('recurrence')} disabled={!canManage || d.sorte === 'produit'}><option value="ponctuel">Ponctuel</option><option value="mensuel">Mensuel</option><option value="trimestriel">Trimestriel</option><option value="annuel">Annuel</option></select></AgField>
            <AgField label="Unité"><input className="fld" placeholder="ex. page, mois, heure" value={d.unite} onChange={set('unite')} disabled={!canManage} /></AgField>
            <AgField label="Prix unitaire ($ CAD)" hint={d.prixUnitaire == null ? 'Sans prix — bloque le calcul de valeur des offres qui l\u2019incluent.' : undefined}><input className="fld" type="number" value={d.prixUnitaire == null ? '' : d.prixUnitaire} placeholder="Non défini" onChange={(e) => set('prixUnitaire')(e.target.value === '' ? null : Number(e.target.value))} disabled={!canManage} /></AgField>
            <AgField label="Description" span><textarea className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={d.description} onChange={set('description')} disabled={!canManage} /></AgField>
            <AgField label="Actif"><AgToggle on={d.actif} disabled={!canManage} onClick={() => setD((p) => ({ ...p, actif: !p.actif }))} /></AgField>
          </div>
          <div className="dl-sec">
            <div className="dl-sec-h" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Où cet article est utilisé</div>
            {usedIn.length === 0 ? <div className="dl-empty">Cet article n\u2019apparaît dans aucune offre active.</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{usedIn.map((o) => <a key={o.id} href="#" onClick={(e) => { e.preventDefault(); window.__catPendingOffer = o.id; onClose(); window.__agNav && window.__agNav('offres'); }} style={{ fontSize: '0.75rem', fontWeight: 600 }}>{o.nom} <span style={{ color: 'var(--fg4)', fontWeight: 500 }}>· {o.code}</span></a>)}</div>}
          </div>
        </div>
        <div className="dl-foot" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-out" onClick={onClose}>{canManage ? 'Annuler' : 'Fermer'}</button>
          {canManage && <button className="btn-pri" disabled={!valid || saveState === 'saving'} onClick={save}>{saveState === 'saving' ? 'Enregistrement…' : 'Enregistrer'}</button>}
        </div>
      </div>
    </div>
  );
};

/* ── Écran Catalogue ── */
const CataloguePanel = () => {
  const [articles, setArticles] = catUseState(CAT_ARTICLES);
  const [view, setView] = catUseState('edit');
  const [editing, setEditing] = catUseState(null);
  const canManage = view === 'edit';
  catUseEffect(() => {
    if (window.__catPendingArticle) { const a = articles.find((x) => x.id === window.__catPendingArticle); window.__catPendingArticle = null; if (a) setEditing(a); }
  }, []);
  const openNew = () => setEditing({ id: catUid(), code: `SRV-${(articles.length + 1).toString().padStart(2, '0')}`, nom: '', sorte: 'service', recurrence: 'mensuel', unite: '', prixUnitaire: null, description: '', actif: true, __new: true });
  const save = (d) => { setArticles((prev) => { const ex = prev.find((a) => a.id === d.id); if (ex) return prev.map((a) => a.id === d.id ? d : a); return [...prev, d]; }); setEditing(null); };
  const sansPrix = articles.filter((a) => a.prixUnitaire == null).length;
  return (
    <div>
      <AgSectionHead title="Catalogue" sub={`${articles.length} articles · ${sansPrix} sans prix unitaire.`} action={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CatViewBar view={view} setView={setView} />{canManage ? <button className="btn-pri" onClick={openNew}><AgI.Plus />Nouvel article</button> : <button className="btn-out" disabled title="Verrouillé — droit \u2018Gérer le catalogue\u2019 requis"><AgI.Lock />Nouvel article</button>}</div>} />
      {!canManage && <AgLocked reason="Vous consultez le catalogue en lecture seule. Le droit \u2018Gérer le catalogue\u2019 est requis pour le modifier." />}
      <ArticleTable title="Services" items={articles.filter((a) => a.sorte === 'service')} onReorder={(sub) => setArticles((prev) => [...prev.filter((a) => a.sorte !== 'service'), ...sub])} onOpen={setEditing} canManage={canManage} />
      <ArticleTable title="Produits" items={articles.filter((a) => a.sorte === 'produit')} onReorder={(sub) => setArticles((prev) => [...sub, ...prev.filter((a) => a.sorte !== 'produit')])} onOpen={setEditing} canManage={canManage} />
      {editing && <ArticleEditor article={editing} isNew={!!editing.__new} canManage={canManage} offers={CAT_OFFERS} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
};

/* ── Carte d'offre : rendu unique, liste + aperçu ── */
const OfferLineView = ({ line, offers }) => {
  if (line.type === 'article') { const a = catArticle(line.articleId); if (!a) return null; return <div className="off-line-item">{(line.qte || 1) > 1 && `${line.qte}× `}<b>{line.libelle || a.nom}</b>{a.prixUnitaire == null && <AgBdg label="sans prix" t="yellow" />}</div>; }
  if (line.type === 'offre') { const o = catOffer(line.offreId, offers); return <div className="off-line-item" style={{ fontStyle: 'italic' }}>Tout ce qui est dans <b>{o ? o.nom : '—'}</b></div>; }
  if (line.type === 'groupe') return (
    <div>
      <div className="off-line-item">{line.nom} <span style={{ color: 'var(--fg4)', fontWeight: 500 }}>— au choix</span></div>
      {line.options.map((op, i) => { const a = catArticle(op.articleId); return <div key={i} className="off-line-opt">{i === line.defaultIndex ? '● ' : '○ '}{op.libelle || (a ? a.nom : '')}{i < line.options.length - 1 ? ' — ou —' : ''}</div>; })}
    </div>);
  return null;
};

const OfferCard = ({ offer, offers, interactive, onToggleActive, onEdit }) => {
  const { total, missing } = catValeur(offer, offers);
  const remise = total - offer.prix;
  const nbTaches = offer.taches.length;
  return (
    <div className={`off-card${!offer.active ? ' inactive' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{offer.nom}</div>
            {offer.populaire && <AgBdg label="Populaire" t="green" />}
            {!offer.active && <AgBdg label="Inactive" t="neutral" />}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2, fontStyle: 'italic' }}>{offer.accroche}</div>
        </div>
        {interactive && <AgToggle on={offer.active} onClick={() => onToggleActive(offer.id)} />}
      </div>
      <div>
        <div className="off-price">{offer.prixType === 'apartir' ? 'À partir de ' : ''}{catFmt(offer.prix)}{offer.recurrence === 'mensuel' && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg3)' }}> / mois</span>}</div>
        {offer.tarifEntree && <div className="off-sub">{catFmt(offer.tarifEntree.montant)} les {offer.tarifEntree.periodes} premiers mois, puis {catFmt(offer.prix)} / mois</div>}
        {offer.delaiSemaines && <div className="off-sub">Livré en {offer.delaiSemaines.min} à {offer.delaiSemaines.max} semaines</div>}
        {offer.consultationGratuiteMin && <div className="off-sub">Consultation gratuite de {offer.consultationGratuiteMin} min incluse</div>}
        {offer.recurrence === 'mensuel' && offer.abonnementsActifs > 0 && <div className="off-sub">{offer.abonnementsActifs} abonnement{offer.abonnementsActifs > 1 ? 's' : ''} actif{offer.abonnementsActifs > 1 ? 's' : ''}</div>}
      </div>
      <div className="dl-chips">{offer.segments.map((s) => <span key={s} className="dl-chip plain">{s}</span>)}</div>
      <div className="off-lines">{offer.lignes.map((l, i) => <OfferLineView key={i} line={l} offers={offers} />)}</div>
      <div className="off-benefits">{offer.benefices.map((b, i) => <div key={i} className="off-benefit"><span><AgI.Check /></span>{b}</div>)}</div>
      <div className="off-foot" style={{ flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>
          {nbTaches} tâche{nbTaches > 1 ? 's' : ''} {offer.recurrence === 'mensuel' ? 'par mois' : 'à la vente'} · {offer.livrables.length} livrable{offer.livrables.length > 1 ? 's' : ''}
          <br />
          {missing.length > 0 ? <span style={{ color: 'var(--yellow-fg)', fontWeight: 600 }}>Valeur incalculable : {missing.length} article{missing.length > 1 ? 's' : ''} sans prix</span> : <span>Valeur catalogue {catFmt(total)} · remise {catFmt(Math.max(remise, 0))}</span>}
        </div>
        {interactive && <button className="btn-out" onClick={() => onEdit(offer.id)}>Modifier</button>}
      </div>
      {offer.recommandeeEnsuiteId && <div className="off-next">Idéal avec : <b>{(catOffer(offer.recommandeeEnsuiteId, offers) || {}).nom}</b></div>}
    </div>
  );
};

/* ── Section repliable ── */
const CatSec = ({ title, sub, defaultOpen = true, children }) => {
  const [open, setOpen] = catUseState(defaultOpen);
  return (
    <div className="cat-sec">
      <div className="cat-sec-h" onClick={() => setOpen((o) => !o)}>
        <div className="cat-sec-t">{title}{sub && <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', fontWeight: 500, marginTop: 2 }}>{sub}</div>}</div>
        <span className={`cat-sec-chev${open ? ' open' : ''}`}><CatI.Chevron /></span>
      </div>
      {open && <div className="cat-sec-b">{children}</div>}
    </div>
  );
};

const CAT_ARTICLE_OPTIONS = () => (
  <React.Fragment>
    <optgroup label="Services">{CAT_ARTICLES.filter((a) => a.sorte === 'service').map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}</optgroup>
    <optgroup label="Produits">{CAT_ARTICLES.filter((a) => a.sorte === 'produit').map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}</optgroup>
  </React.Fragment>
);

/* ── Constructeur d'offre ── */
const OffreBuilder = ({ offer, offers, isNew, canManage, onBack, onSave }) => {
  const [d, setD] = catUseState(offer);
  const [segInput, setSegInput] = catUseState('');
  const [benInput, setBenInput] = catUseState('');
  const [saveState, setSaveState] = catUseState('idle');
  const dirty = JSON.stringify(d) !== JSON.stringify(offer);
  const set = (k) => (v) => setD((p) => ({ ...p, [k]: v }));
  const { total, missing } = catValeur(d, offers);
  const remise = total - (d.prix || 0);

  const back = () => { if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Quitter sans enregistrer ?')) return; onBack(); };
  const save = () => { setSaveState('saving'); setTimeout(() => { onSave(d); setSaveState('saved'); setTimeout(() => setSaveState('idle'), 1800); }, 500); };

  const reorder = (key) => (from, to) => { if (from == null || from === to) return; setD((p) => { const arr = [...p[key]]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); return { ...p, [key]: arr }; }); };
  const moveArr = (key, i, dir) => setD((p) => { const arr = [...p[key]]; const j = i + dir; if (j < 0 || j >= arr.length) return p; [arr[i], arr[j]] = [arr[j], arr[i]]; return { ...p, [key]: arr }; });
  const updLine = (i, patch) => setD((p) => ({ ...p, lignes: p.lignes.map((l, idx) => idx === i ? { ...l, ...patch } : l) }));
  const rmLine = (i) => setD((p) => ({ ...p, lignes: p.lignes.filter((_, idx) => idx !== i) }));
  const addArticleLine = () => setD((p) => ({ ...p, lignes: [...p.lignes, { type: 'article', articleId: CAT_ARTICLES[0].id, qte: 1 }] }));
  const addGroupLine = () => setD((p) => ({ ...p, lignes: [...p.lignes, { type: 'groupe', nom: 'Nouveau groupe', defaultIndex: 0, options: [{ articleId: CAT_ARTICLES[0].id, qte: 1, libelle: '' }, { articleId: CAT_ARTICLES[1].id, qte: 1, libelle: '' }] }] }));
  const includable = offers.filter((o) => catCanInclude(offers, d.id, o.id));
  const addOffreLine = () => { if (!includable.length) return; setD((p) => ({ ...p, lignes: [...p.lignes, { type: 'offre', offreId: includable[0].id }] })); };

  const addSeg = () => { if (!segInput.trim()) return; setD((p) => ({ ...p, segments: [...p.segments, segInput.trim()] })); setSegInput(''); };
  const addBen = () => { if (!benInput.trim()) return; setD((p) => ({ ...p, benefices: [...p.benefices, benInput.trim()] })); setBenInput(''); };
  const addTask = () => setD((p) => ({ ...p, taches: [...p.taches, { titre: '', role: 'Chef de projet', echeance: '' }] }));
  const addDeliv = () => setD((p) => ({ ...p, livrables: [...p.livrables, { code: `L-${(p.livrables.length + 1).toString().padStart(2, '0')}`, titre: '', rondes: 1, ordre: p.livrables.length + 1 }] }));

  return (
    <div>
      <button className="btn-out" style={{ marginBottom: 14 }} onClick={back}><AgI.Back />Retour aux offres</button>
      <AgSectionHead title={isNew ? 'Nouvelle offre' : d.nom || 'Offre'} sub={dirty ? 'Modifications non enregistrées' : undefined} action={
        canManage ? <button className="btn-pri" disabled={!dirty || saveState === 'saving'} onClick={save}>{saveState === 'saving' ? 'Enregistrement…' : saveState === 'saved' ? <React.Fragment><AgI.Check />Enregistré</React.Fragment> : 'Enregistrer l\u2019offre'}</button>
          : <button className="btn-out" disabled title="Verrouillé — droit \u2018Gérer le catalogue\u2019 requis"><AgI.Lock />Enregistrer l\u2019offre</button>} />
      {!canManage && <AgLocked reason="Vous consultez cette offre en lecture seule. Le droit \u2018Gérer le catalogue\u2019 est requis pour la modifier." />}
      {saveState === 'error' && <div className="dl-banner red" style={{ marginBottom: 14 }}><span><AgI.Warn /></span><span><b>L\u2019offre n\u2019a pas pu être enregistrée.</b> Réessayez ; si ça persiste, vérifiez votre connexion.</span></div>}

      <div className="detail-row">
        <div>
          <CatSec title="Identité">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <AgField label="Nom"><input className="fld" value={d.nom} onChange={(e) => set('nom')(e.target.value)} disabled={!canManage} /></AgField>
              <AgField label="Code"><input className="fld" value={d.code} onChange={(e) => set('code')(e.target.value)} disabled={!canManage} /></AgField>
              <AgField label="Accroche" span><input className="fld" value={d.accroche} onChange={(e) => set('accroche')(e.target.value)} disabled={!canManage} /></AgField>
            </div>
            <AgField label="Segments (\u2018Idéal pour\u2019)" span>
              <div className="dl-chips" style={{ marginBottom: 8 }}>{d.segments.map((s, i) => <span key={i} className="dl-chip on">{s}{canManage && <span style={{ marginLeft: 5, cursor: 'pointer' }} onClick={() => setD((p) => ({ ...p, segments: p.segments.filter((_, idx) => idx !== i) }))}>×</span>}</span>)}</div>
              {canManage && <div style={{ display: 'flex', gap: 6 }}><input className="fld" placeholder="Ajouter un segment" value={segInput} onChange={(e) => setSegInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSeg()} /><button className="btn-out" onClick={addSeg}>Ajouter</button></div>}
            </AgField>
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AgToggle on={d.populaire} disabled={!canManage} onClick={() => set('populaire')(!d.populaire)} /><span style={{ fontSize: '0.75rem' }}>Populaire</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AgToggle on={d.active} disabled={!canManage} onClick={() => set('active')(!d.active)} /><span style={{ fontSize: '0.75rem' }}>Active</span></div>
            </div>
          </CatSec>

          <CatSec title="Prix">
            {d.recurrence === 'mensuel' && d.abonnementsActifs > 0 && <div className="dl-banner yellow"><span><AgI.Warn /></span><span><b>{d.abonnementsActifs} abonnement{d.abonnementsActifs > 1 ? 's' : ''} actif{d.abonnementsActifs > 1 ? 's' : ''}</b> à {catFmt(d.prix)}. Modifier le prix ici ne change rien pour les clients déjà signés.</span></div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AgField label="Récurrence"><select className="fld" value={d.recurrence} onChange={(e) => set('recurrence')(e.target.value)} disabled={!canManage}><option value="ponctuel">Ponctuel</option><option value="mensuel">Mensuel</option></select></AgField>
              <AgField label="Prix ($ CAD)"><input className="fld" type="number" value={d.prix} onChange={(e) => set('prix')(Number(e.target.value))} disabled={!canManage} /></AgField>
              <AgField label="Type de prix"><select className="fld" value={d.prixType} onChange={(e) => set('prixType')(e.target.value)} disabled={!canManage}><option value="fixe">Fixe</option><option value="apartir">\u00c0 partir de</option></select></AgField>
              <AgField label="Consultation gratuite (min)"><input className="fld" type="number" value={d.consultationGratuiteMin || ''} placeholder="Aucune" onChange={(e) => set('consultationGratuiteMin')(e.target.value === '' ? null : Number(e.target.value))} disabled={!canManage} /></AgField>
              {d.recurrence === 'ponctuel' && <React.Fragment>
                <AgField label="Délai — min (semaines)"><input className="fld" type="number" value={d.delaiSemaines ? d.delaiSemaines.min : ''} onChange={(e) => set('delaiSemaines')({ ...(d.delaiSemaines || { max: 0 }), min: Number(e.target.value) })} disabled={!canManage} /></AgField>
                <AgField label="Délai — max (semaines)"><input className="fld" type="number" value={d.delaiSemaines ? d.delaiSemaines.max : ''} onChange={(e) => set('delaiSemaines')({ ...(d.delaiSemaines || { min: 0 }), max: Number(e.target.value) })} disabled={!canManage} /></AgField>
              </React.Fragment>}
              {d.recurrence === 'mensuel' && <AgField label="Tarif d'entrée" span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: d.tarifEntree ? 8 : 0 }}><AgToggle on={!!d.tarifEntree} disabled={!canManage} onClick={() => set('tarifEntree')(d.tarifEntree ? null : { montant: d.prix, periodes: 3 })} /><span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{d.tarifEntree ? 'Activé' : 'Aucun tarif d\u2019entrée'}</span></div>
                {d.tarifEntree && <div style={{ display: 'flex', gap: 8 }}><input className="fld" type="number" placeholder="Montant" value={d.tarifEntree.montant} onChange={(e) => set('tarifEntree')({ ...d.tarifEntree, montant: Number(e.target.value) })} disabled={!canManage} /><input className="fld" type="number" placeholder="Périodes" value={d.tarifEntree.periodes} onChange={(e) => set('tarifEntree')({ ...d.tarifEntree, periodes: Number(e.target.value) })} disabled={!canManage} /></div>}
              </AgField>}
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-muted)', fontSize: '0.8125rem' }}>
              {missing.length > 0 ? <span style={{ color: 'var(--yellow-fg)', fontWeight: 700 }}>Valeur incalculable : {missing.length} article{missing.length > 1 ? 's' : ''} sans prix — {missing.map((a, i) => <a key={a.id} href="#" onClick={(e) => { e.preventDefault(); window.__catPendingArticle = a.id; window.__agNav && window.__agNav('catalogue'); }}>{a.nom}{i < missing.length - 1 ? ', ' : ''}</a>)}</span>
                : <span>Valeur catalogue <b>{catFmt(total)}</b> · remise <b>{catFmt(Math.max(remise, 0))}</b></span>}
            </div>
          </CatSec>

          <CatSec title="Contenu" sub="Ce que l'offre inclut">
            {d.lignes.map((l, i) => (
              <div key={i} className="cat-line" {...catDragProps(i, reorder('lignes'), canManage)}>
                <span className="cat-line-drag">{canManage && <CatI.Grip />}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {l.type === 'article' && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select className="fld" style={{ flex: '2 1 180px' }} value={l.articleId} onChange={(e) => updLine(i, { articleId: e.target.value })} disabled={!canManage}><CAT_ARTICLE_OPTIONS /></select>
                    <input className="fld" type="number" style={{ width: 66 }} value={l.qte} onChange={(e) => updLine(i, { qte: Number(e.target.value) })} disabled={!canManage} />
                    <input className="fld" style={{ flex: '1 1 140px' }} placeholder="Libellé personnalisé (optionnel)" value={l.libelle || ''} onChange={(e) => updLine(i, { libelle: e.target.value })} disabled={!canManage} />
                  </div>}
                  {l.type === 'offre' && <div style={{ fontSize: '0.8125rem', fontStyle: 'italic', padding: '7px 0' }}>Tout ce qui est dans <b>{(catOffer(l.offreId, offers) || {}).nom}</b></div>}
                  {l.type === 'groupe' && <div>
                    <input className="fld" style={{ marginBottom: 6, fontWeight: 700 }} value={l.nom} onChange={(e) => updLine(i, { nom: e.target.value })} disabled={!canManage} />
                    {l.options.map((op, oi) => <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, paddingLeft: 10 }}>
                      <input type="radio" checked={l.defaultIndex === oi} disabled={!canManage} onChange={() => updLine(i, { defaultIndex: oi })} title="Option par défaut" />
                      <select className="fld" style={{ flex: '2 1 140px' }} value={op.articleId} onChange={(e) => { const opts = [...l.options]; opts[oi] = { ...op, articleId: e.target.value }; updLine(i, { options: opts }); }} disabled={!canManage}><CAT_ARTICLE_OPTIONS /></select>
                      <input className="fld" style={{ flex: '1 1 100px' }} placeholder="Libellé" value={op.libelle || ''} onChange={(e) => { const opts = [...l.options]; opts[oi] = { ...op, libelle: e.target.value }; updLine(i, { options: opts }); }} disabled={!canManage} />
                      {canManage && l.options.length > 2 && <button className="btn-icon" onClick={() => { const opts = l.options.filter((_, x) => x !== oi); updLine(i, { options: opts, defaultIndex: Math.min(l.defaultIndex, opts.length - 1) }); }}><CatI.Trash /></button>}
                    </div>)}
                    {canManage && <button className="cat-add-btn" onClick={() => updLine(i, { options: [...l.options, { articleId: CAT_ARTICLES[0].id, qte: 1, libelle: '' }] })}><AgI.Plus />Option</button>}
                  </div>}
                </div>
                {canManage && <button className="btn-icon" onClick={() => rmLine(i)}><CatI.Trash /></button>}
              </div>
            ))}
            {canManage && <div className="cat-add-row">
              <button className="cat-add-btn" onClick={addArticleLine}><AgI.Plus />Article</button>
              <button className="cat-add-btn" disabled={!includable.length} title={!includable.length ? 'Aucune offre disponible sans créer de boucle' : undefined} onClick={addOffreLine}><AgI.Plus />Offre incluse</button>
              <button className="cat-add-btn" onClick={addGroupLine}><AgI.Plus />Groupe d'options</button>
            </div>}
          </CatSec>

          <CatSec title="Bénéfices">
            {d.benefices.map((b, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < d.benefices.length - 1 ? '1px solid var(--bd)' : 'none' }}>
              <span style={{ color: 'var(--green-fg)', flexShrink: 0 }}><AgI.Check /></span>
              {canManage ? <input className="fld" value={b} onChange={(e) => setD((p) => ({ ...p, benefices: p.benefices.map((x, idx) => idx === i ? e.target.value : x) }))} /> : <span style={{ fontSize: '0.8125rem', flex: 1 }}>{b}</span>}
              {canManage && <div style={{ display: 'flex', gap: 2 }}><button className="btn-icon" onClick={() => moveArr('benefices', i, -1)}><CatI.Up /></button><button className="btn-icon" onClick={() => moveArr('benefices', i, 1)}><CatI.Down /></button><button className="btn-icon" onClick={() => setD((p) => ({ ...p, benefices: p.benefices.filter((_, idx) => idx !== i) }))}><CatI.Trash /></button></div>}
            </div>)}
            {canManage && <div style={{ display: 'flex', gap: 6, marginTop: 8 }}><input className="fld" placeholder="Nouveau bénéfice" value={benInput} onChange={(e) => setBenInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBen()} /><button className="btn-out" onClick={addBen}>Ajouter</button></div>}
          </CatSec>

          <CatSec title="Ce que la vente engendre" sub={`${d.taches.length} tâche${d.taches.length > 1 ? 's' : ''} ${d.recurrence === 'mensuel' ? 'par mois' : 'à la vente'}`}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="lbl" style={{ marginBottom: 8 }}>Tâches</div>
                {d.taches.map((t, i) => <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--bd)' }}>
                  {canManage ? <React.Fragment>
                    <input className="fld" style={{ marginBottom: 4 }} placeholder="Titre de la tâche" value={t.titre} onChange={(e) => setD((p) => ({ ...p, taches: p.taches.map((x, idx) => idx === i ? { ...x, titre: e.target.value } : x) }))} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select className="fld" value={t.role} onChange={(e) => setD((p) => ({ ...p, taches: p.taches.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x) }))}>{CAT_TASK_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                      <input className="fld" placeholder="Échéance" value={t.echeance} onChange={(e) => setD((p) => ({ ...p, taches: p.taches.map((x, idx) => idx === i ? { ...x, echeance: e.target.value } : x) }))} />
                      <button className="btn-icon" onClick={() => setD((p) => ({ ...p, taches: p.taches.filter((_, idx) => idx !== i) }))}><CatI.Trash /></button>
                    </div>
                  </React.Fragment> : <React.Fragment><div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{t.titre}</div><div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>{t.role} · {t.echeance}</div></React.Fragment>}
                </div>)}
                {canManage && <button className="cat-add-btn" style={{ marginTop: 8 }} onClick={addTask}><AgI.Plus />Tâche</button>}
              </div>
              <div>
                <div className="lbl" style={{ marginBottom: 8 }}>Livrables <span style={{ textTransform: 'none', fontWeight: 500 }}>· {d.livrables.length}</span></div>
                {d.livrables.map((l, i) => <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--bd)' }}>
                  {canManage ? <React.Fragment>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}><input className="fld" style={{ width: 62 }} value={l.code} onChange={(e) => setD((p) => ({ ...p, livrables: p.livrables.map((x, idx) => idx === i ? { ...x, code: e.target.value } : x) }))} /><input className="fld" placeholder="Titre du livrable" value={l.titre} onChange={(e) => setD((p) => ({ ...p, livrables: p.livrables.map((x, idx) => idx === i ? { ...x, titre: e.target.value } : x) }))} /></div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input className="fld" type="number" style={{ width: 70 }} title="Rondes de révision" value={l.rondes} onChange={(e) => setD((p) => ({ ...p, livrables: p.livrables.map((x, idx) => idx === i ? { ...x, rondes: Number(e.target.value) } : x) }))} />
                      <span style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>rondes de révision</span>
                      <button className="btn-icon" onClick={() => moveArr('livrables', i, -1)}><CatI.Up /></button><button className="btn-icon" onClick={() => moveArr('livrables', i, 1)}><CatI.Down /></button>
                      <button className="btn-icon" onClick={() => setD((p) => ({ ...p, livrables: p.livrables.filter((_, idx) => idx !== i) }))}><CatI.Trash /></button>
                    </div>
                  </React.Fragment> : <React.Fragment><div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{l.code} — {l.titre}</div><div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>{l.rondes} ronde{l.rondes > 1 ? 's' : ''} de révision</div></React.Fragment>}
                </div>)}
                {canManage && <button className="cat-add-btn" style={{ marginTop: 8 }} onClick={addDeliv}><AgI.Plus />Livrable</button>}
              </div>
            </div>
          </CatSec>

          <CatSec title="Ensuite" defaultOpen={false}>
            <AgField label="Offre recommandée ensuite">
              <select className="fld" value={d.recommandeeEnsuiteId || ''} onChange={(e) => set('recommandeeEnsuiteId')(e.target.value || null)} disabled={!canManage}>
                <option value="">Aucune</option>
                {offers.filter((o) => o.id !== d.id).map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
              </select>
            </AgField>
          </CatSec>
        </div>

        <div style={{ position: 'sticky', top: 0 }}>
          <div className="lbl" style={{ marginBottom: 8 }}>Aperçu — tel qu\u2019affiché ailleurs</div>
          <OfferCard offer={d} offers={offers} interactive={false} />
        </div>
      </div>
    </div>
  );
};

/* ── Écran Offres (liste + constructeur) ── */
const OffresPanel = () => {
  const [offers, setOffers] = catUseState(CAT_OFFERS);
  const [view, setView] = catUseState('edit');
  const [openId, setOpenId] = catUseState(null);
  const canManage = view === 'edit';
  catUseEffect(() => { if (window.__catPendingOffer) { const id = window.__catPendingOffer; window.__catPendingOffer = null; setOpenId(id); } }, []);
  const toggleActive = (id) => setOffers((prev) => prev.map((o) => o.id === id ? { ...o, active: !o.active } : o));
  const save = (d) => { setOffers((prev) => prev.some((o) => o.id === d.id) ? prev.map((o) => o.id === d.id ? d : o) : [...prev, d]); };
  const addNew = () => setOpenId('__new__');

  const open = openId === '__new__' ? { id: catUid(), code: `OFF-${(offers.length + 1).toString().padStart(2, '0')}`, nom: '', accroche: '', categorie: 'web', recurrence: 'ponctuel', segments: [], populaire: false, active: true, prix: 0, prixType: 'fixe', tarifEntree: null, delaiSemaines: { min: 4, max: 6 }, consultationGratuiteMin: null, lignes: [], benefices: [], taches: [], livrables: [], recommandeeEnsuiteId: null }
    : openId ? offers.find((o) => o.id === openId) : null;

  if (open) return <OffreBuilder offer={open} offers={offers} isNew={openId === '__new__'} canManage={canManage} onBack={() => setOpenId(null)} onSave={(d) => { save(d); setOpenId(null); }} />;

  const web = offers.filter((o) => o.categorie === 'web'), seo = offers.filter((o) => o.categorie === 'seo');
  return (
    <div>
      <AgSectionHead title="Offres" sub={`${offers.length} offres.`} action={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CatViewBar view={view} setView={setView} />{canManage ? <button className="btn-pri" onClick={addNew}><AgI.Plus />Nouvelle offre</button> : <button className="btn-out" disabled title="Verrouillé — droit \u2018Gérer le catalogue\u2019 requis"><AgI.Lock />Nouvelle offre</button>}</div>} />
      {!canManage && <AgLocked reason="Vous consultez les offres en lecture seule. Le droit \u2018Gérer le catalogue\u2019 est requis pour les modifier." />}
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 10 }}>Forfaits web</div>
      <div className="off-grid" style={{ marginBottom: 24 }}>{web.map((o) => <OfferCard key={o.id} offer={o} offers={offers} interactive={canManage} onToggleActive={toggleActive} onEdit={setOpenId} />)}</div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 10 }}>Packs SEO</div>
      <div className="off-grid">{seo.map((o) => <OfferCard key={o.id} offer={o} offers={offers} interactive={canManage} onToggleActive={toggleActive} onEdit={setOpenId} />)}</div>
    </div>
  );
};

Object.assign(window, { CataloguePanel, OffresPanel, CatViewBar, CatSec, catUid, CAT_VIEWS, OfferLineView, OfferCard });
