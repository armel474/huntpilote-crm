/* HuntPilote — Générateur de documents : panneau de création, rendu partagé, liste agence. */
const { useState: genUseState, useEffect: genUseEffect } = React;

const GenI = {
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Warn: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Lock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Trash: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>,
};

const GenBadge = ({ statut }) => {
  const s = GEN_STATUTS[statut] || { label: statut, tone: 'neutral' };
  const M = { green: ['var(--green-m,#DCEFD4)', 'var(--green-b,#BBE3AA)', 'var(--green-fg,#2D5A27)'], yellow: ['var(--yellow-m,#F5E8B5)', 'var(--yellow-b,#D4B24A)', 'var(--yellow-fg,#7A5D14)'], blue: ['var(--blue-m,#DBEAFE)', 'var(--blue-b,#93C5FD)', 'var(--blue-fg,#1D4ED8)'], red: ['var(--red-m,rgba(196,69,69,.08))', 'var(--red-b,rgba(196,69,69,.28))', 'var(--red,#C44545)'], neutral: ['var(--bg-muted,#eee)', 'var(--bd-solid,#ddd)', 'var(--fg3,#777)'] }[s.tone];
  return <span style={{ background: M[0], border: `1px solid ${M[1]}`, color: M[2], padding: '2px 9px', borderRadius: 999, fontSize: '0.625rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>;
};

/* ── Rendu du document (.client-doc, toujours blanc) ── */
const DocRender = ({ doc, template, printable }) => {
  const data = genBuildData(doc, template);
  const html = template ? docRender(template.html, data) : '<div style="padding:40px;color:#999">Modèle introuvable.</div>';
  return <div className={`client-doc${printable ? ' print-doc' : ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
};

/* ── Section repliable minimale (autonome, sans dépendance à hp-cat-panels) ── */
const GenSec = ({ title, sub, defaultOpen = true, children }) => {
  const [open, setOpen] = genUseState(defaultOpen);
  return (
    <div className="cat-sec" style={{ marginBottom: 10 }}>
      <div className="cat-sec-h" onClick={() => setOpen((o) => !o)}>
        <div className="cat-sec-t">{title}{sub && <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', fontWeight: 500, marginTop: 2 }}>{sub}</div>}</div>
        <span style={{ color: 'var(--fg4)', transform: open ? 'rotate(180deg)' : 'none' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></span>
      </div>
      {open && <div className="cat-sec-b">{children}</div>}
    </div>
  );
};

/* ── Panneau « Créer un document » (slide-over, ouvert depuis une fiche client ou un deal) ── */
const NewDocumentPanel = ({ context, onClose, onCreated }) => {
  const [kind, setKind] = genUseState(context.defaultKind || 'devis');
  const templatesOfKind = DOC_TEMPLATES.filter((t) => t.kind === kind);
  const [templateId, setTemplateId] = genUseState((templatesOfKind.find((t) => t.isDefault) || templatesOfKind[0] || {}).id);
  genUseEffect(() => { const list = DOC_TEMPLATES.filter((t) => t.kind === kind); const def = list.find((t) => t.isDefault) || list[0]; setTemplateId(def ? def.id : null); }, [kind]);

  const [mode, setMode] = genUseState(context.defaultMode || 'offre');
  const [offerId, setOfferId] = genUseState(CAT_OFFERS[0].id);
  const [offerChoices, setOfferChoices] = genUseState({});
  const [offerPrice, setOfferPrice] = genUseState(CAT_OFFERS[0].prix);
  genUseEffect(() => { const o = CAT_OFFERS.find((x) => x.id === offerId); setOfferPrice(o ? o.prix : 0); setOfferChoices({}); }, [offerId]);
  const offer = CAT_OFFERS.find((o) => o.id === offerId);

  const [existingId, setExistingId] = genUseState(context.defaultExistingId || '');
  const [freeLines, setFreeLines] = genUseState([{ desc: '', qte: 1, prix: 0 }]);
  const [addArticleId, setAddArticleId] = genUseState(CAT_ARTICLES[0].id);

  const [objet, setObjet] = genUseState(context.objetSuggere || '');
  const [contactName, setContactName] = genUseState(context.contactName || '');
  const [contactTitre, setContactTitre] = genUseState(context.contactTitre || '');
  const [expireDate, setExpireDate] = genUseState('');
  const [delaiPaiement, setDelaiPaiement] = genUseState((templatesOfKind[0] || {}).delaiPaiementJours || 15);
  const [dateSignature, setDateSignature] = genUseState('');

  const existingSources = GEN_DOCUMENTS.filter((d) => {
    if (context.clientName && d.clientName !== context.clientName) return false;
    if (kind === 'contrat') return d.kind === 'proposition' && d.statut === 'accepte';
    if (kind === 'facture' || kind === 'annexe') return d.kind === 'contrat' && d.statut === 'signe';
    return false;
  });

  let lignes = []; let extraBlocks = {};
  if (mode === 'offre' && offer) {
    lignes = [{ desc: offer.nom, qte: 1, prix: offerPrice }];
  } else if (mode === 'existant' && existingId) {
    const src = GEN_DOCUMENTS.find((d) => d.id === existingId);
    if (src) {
      if (kind === 'facture') { const sub = genSubtotal(src); lignes = [{ desc: `Acompte 50 % — ${src.kind === 'contrat' ? 'contrat' : 'document'} ${src.id}`, qte: 1, prix: Math.round(sub * 0.5 * 100) / 100 }]; }
      else if (kind === 'annexe') { extraBlocks = { livrables: src.livrables || [], jalons: src.jalons || [] }; }
      else { lignes = (src.lignes || []).map((l) => ({ ...l })); extraBlocks = { livrables: src.livrables || [], jalons: src.jalons || [], exclusions: src.exclusions || [], paiements: src.paiements || [], attendus_client: src.attendus_client || [] }; }
    }
  } else if (mode === 'libre') { lignes = freeLines.filter((l) => l.desc.trim()); }

  const sub = lignes.reduce((s, l) => s + (Number(l.qte) || 0) * (Number(l.prix) || 0), 0);
  const { tps, tvq, ttc } = genTaxes(sub);
  const template = DOC_TEMPLATES.find((t) => t.id === templateId);
  const draftDoc = { id: '(brouillon)', kind, templateId, clientName: context.clientName, clientRaison: context.clientRaison, contactName, contactTitre, objet, lignes, ...extraBlocks, expire: expireDate || null, echeance: expireDate || null };
  const data = genBuildData(draftDoc, template);
  const rendered = template ? docRender(template.html, data) : '';
  const unresolved = [...new Set([...rendered.matchAll(/\{\{([\w.]+)\}\}/g)].map((m) => m[1]))];

  const missingTaxes = window.AG_PROFILE ? agProfileMissing(AG_PROFILE).length > 0 : false;
  const valid = objet.trim() && lignes.length > 0 && template;

  const create = () => {
    const cnt = GEN_DOCUMENTS.filter((d) => d.kind === kind).length + 1;
    const id = `${template.prefixe}-2026-${cnt.toString().padStart(3, '0')}`;
    const doc = { ...draftDoc, id, statut: 'brouillon', emis: null, from: mode === 'existant' ? existingId : null, produced: [], versions: [], journal: [{ at: 'À l\u2019instant', event: 'Brouillon créé', who: 'Marie Chen' }], delaiPaiementJours: delaiPaiement, dateSignature: dateSignature || null };
    GEN_DOCUMENTS.push(doc);
    onCreated(doc);
  };

  return (
    <div className="dl-scrim" onClick={onClose}>
      <div className="dl-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="dl-head"><div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 800 }}>Nouveau document</div><button className="btn-icon" onClick={onClose}><GenI.X /></button></div>
        <div className="dl-body">
          <GenSec title="1. La sorte">
            <div className="ndp-kind-grid">
              {DOC_KINDS.map((k) => { const has = DOC_TEMPLATES.some((t) => t.kind === k.id); return <button key={k.id} className={`ndp-kind-btn${kind === k.id ? ' on' : ''}`} disabled={!has} title={!has ? 'Aucun modèle — allez d\u2019abord en créer un dans Modèles de documents.' : undefined} onClick={() => setKind(k.id)}>{k.label}{!has && ' — sans modèle'}</button>; })}
            </div>
            {templatesOfKind.length > 1 && <select className="fld" style={{ marginTop: 8 }} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>{templatesOfKind.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}</select>}
          </GenSec>

          <GenSec title="2. Le contenu">
            <div className="ndp-tabs">
              <button className={`ndp-tab${mode === 'offre' ? ' on' : ''}`} onClick={() => setMode('offre')}>Depuis une offre</button>
              <button className={`ndp-tab${mode === 'existant' ? ' on' : ''}`} onClick={() => setMode('existant')} disabled={!existingSources.length}>Depuis un document</button>
              <button className={`ndp-tab${mode === 'libre' ? ' on' : ''}`} onClick={() => setMode('libre')}>Lignes libres</button>
            </div>
            {mode === 'offre' && <div>
              <select className="fld" value={offerId} onChange={(e) => setOfferId(e.target.value)}>{CAT_OFFERS.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}</select>
              {offer && <div style={{ marginTop: 8 }}>
                <div className="off-lines" style={{ marginBottom: 8 }}>{offer.lignes.map((l, i) => l.type === 'groupe' ? (
                  <div key={i}>
                    <div className="off-line-item">{l.nom} — au choix</div>
                    {l.options.map((op, oi) => <label key={oi} className="off-line-opt" style={{ display: 'block', cursor: 'pointer' }}><input type="radio" checked={(offerChoices[i] ?? l.defaultIndex) === oi} onChange={() => setOfferChoices((c) => ({ ...c, [i]: oi }))} /> {op.libelle || catArticle(op.articleId).nom}</label>)}
                  </div>) : <OfferLineView key={i} line={l} offers={CAT_OFFERS} />)}</div>
                <label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Prix facturé{offer.prixType !== 'apartir' && ' (fixe)'}</label>
                <input className="fld" type="number" value={offerPrice} disabled={offer.prixType !== 'apartir'} onChange={(e) => setOfferPrice(Number(e.target.value))} />
              </div>}
            </div>}
            {mode === 'existant' && <select className="fld" value={existingId} onChange={(e) => setExistingId(e.target.value)}>
              <option value="">Choisir un document source</option>
              {existingSources.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.objet}</option>)}
            </select>}
            {mode === 'libre' && <div>
              {freeLines.map((l, i) => <div key={i} className="ndp-line">
                <input className="fld" style={{ flex: 2 }} placeholder="Description" value={l.desc} onChange={(e) => setFreeLines((ls) => ls.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
                <input className="fld" style={{ width: 54 }} type="number" value={l.qte} onChange={(e) => setFreeLines((ls) => ls.map((x, j) => j === i ? { ...x, qte: Number(e.target.value) } : x))} />
                <input className="fld" style={{ width: 80 }} type="number" value={l.prix} onChange={(e) => setFreeLines((ls) => ls.map((x, j) => j === i ? { ...x, prix: Number(e.target.value) } : x))} />
                <button className="btn-icon" onClick={() => setFreeLines((ls) => ls.filter((_, j) => j !== i))}><GenI.Trash /></button>
              </div>)}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button className="btn-out" onClick={() => setFreeLines((ls) => [...ls, { desc: '', qte: 1, prix: 0 }])}><GenI.Plus />Ligne libre</button>
                <select className="fld" style={{ flex: 1 }} value={addArticleId} onChange={(e) => setAddArticleId(e.target.value)}>{CAT_ARTICLES.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}</select>
                <button className="btn-out" onClick={() => { const a = catArticle(addArticleId); setFreeLines((ls) => [...ls, { desc: a.nom, qte: 1, prix: a.prixUnitaire || 0 }]); }}><GenI.Plus />Article</button>
              </div>
            </div>}
            <div className="ndp-tot">
              <div className="ndp-tot-row"><span>Sous-total</span><span>{genFmt(sub)}</span></div>
              <div className="ndp-tot-row"><span>TPS (5 %)</span><span>{genFmt(tps)}</span></div>
              <div className="ndp-tot-row"><span>TVQ (9,975 %)</span><span>{genFmt(tvq)}</span></div>
              <div className="ndp-tot-row ttc"><span>Total</span><span>{genFmt(ttc)}</span></div>
            </div>
          </GenSec>

          <GenSec title="3. Les particularités" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Objet</label><input className="fld" value={objet} onChange={(e) => setObjet(e.target.value)} /></div>
              <div><label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Contact destinataire</label><input className="fld" value={contactName} onChange={(e) => setContactName(e.target.value)} /></div>
              <div><label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Titre du contact</label><input className="fld" value={contactTitre} onChange={(e) => setContactTitre(e.target.value)} placeholder="Ex. Directrice générale" /></div>
              {(kind === 'devis' || kind === 'proposition') && <div><label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Date d\u2019expiration</label><input className="fld" placeholder="Ex. 30 septembre 2026" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} /></div>}
              {kind === 'facture' && <div><label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Délai de paiement (jours)</label><input className="fld" type="number" value={delaiPaiement} onChange={(e) => setDelaiPaiement(Number(e.target.value))} /></div>}
              {kind === 'contrat' && <div><label className="lbl" style={{ display: 'block', marginBottom: 4 }}>Date de signature prévue</label><input className="fld" placeholder="Ex. 20 septembre 2026" value={dateSignature} onChange={(e) => setDateSignature(e.target.value)} /></div>}
            </div>
          </GenSec>

          <GenSec title="4. Aperçu" defaultOpen={false}>
            {missingTaxes && <div className="dl-banner yellow"><span><GenI.Warn /></span><span>Les numéros de TPS/TVQ de l\u2019agence ne sont pas renseignés — ce document ne pourra pas être envoyé une fois créé.</span></div>}
            {unresolved.length > 0 && <div className="dl-banner yellow"><span><GenI.Warn /></span><span>{unresolved.length} balise{unresolved.length > 1 ? 's' : ''} non remplie{unresolved.length > 1 ? 's' : ''} : {unresolved.map((t) => `{{${t}}}`).join(', ')} — ajoutez l\u2019information manquante ou retirez la balise du modèle.</span></div>}
            <div className="client-doc" style={{ maxHeight: 380, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: rendered }} />
          </GenSec>
        </div>
        <div className="dl-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-out" onClick={onClose}>Annuler</button>
          <button className="btn-pri" disabled={!valid} onClick={create}><GenI.Check />Créer le brouillon</button>
        </div>
      </div>
    </div>
  );
};

/* ── Écran Documents (Agence hub) ── */
const DocumentsListPanel = () => {
  const [docs] = genUseState(GEN_DOCUMENTS);
  const [demo, setDemo] = genUseState('donnees');
  const [fKind, setFKind] = genUseState('');
  const [fStatut, setFStatut] = genUseState('');
  const [q, setQ] = genUseState('');
  const list = demo === 'vide' ? [] : docs.filter((d) => (!fKind || d.kind === fKind) && (!fStatut || d.statut === fStatut) && (!q || d.clientName.toLowerCase().includes(q.toLowerCase()) || d.objet.toLowerCase().includes(q.toLowerCase())));
  const summaries = demo === 'vide' ? [] : genSummaries(docs);

  return (
    <div>
      <AgSectionHead title="Documents" sub="Tout ce qui a été produit, toutes sortes confondues." action={<select className="fld" style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} value={demo} onChange={(e) => setDemo(e.target.value)} aria-label="Vue de démonstration"><option value="donnees">Avec documents</option><option value="vide">Aucun document</option></select>} />
      {demo === 'vide' ? <EmptyInitial icon={<AgI.FileText />} title="Aucun document" text="Créez-en un depuis une fiche client ou une opportunité du pipeline — il n\u2019y a pas de création directe ici." />
        : <React.Fragment>
          <div className="gen-summary-row">{summaries.map((s, i) => <div key={i} className={`gen-chip ${s.tone}`}><GenI.Warn />{s.text}</div>)}</div>
          <div className="gen-filters">
            <select className="fld" style={{ width: 'auto' }} value={fKind} onChange={(e) => setFKind(e.target.value)}><option value="">Toutes les sortes</option>{DOC_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
            <select className="fld" style={{ width: 'auto' }} value={fStatut} onChange={(e) => setFStatut(e.target.value)}><option value="">Tous les statuts</option>{Object.entries(GEN_STATUTS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}</select>
            <input className="fld" style={{ width: 200 }} placeholder="Client ou objet" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="card tbl" style={{ padding: '0.4rem 0.75rem 0.5rem', '--tbl-cols': '90px 90px 1fr 1.4fr 100px 100px 90px 90px' }}>
            <div className="tbl-head">{['Référence', 'Sorte', 'Client', 'Objet', 'Montant', 'Statut', 'Date', 'Personne'].map((h, i) => <div key={i} className="lbl">{h}</div>)}</div>
            {list.map((d) => <a key={d.id} href={`Document.html?id=${d.id}`} className="tbl-row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.id}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{(DOC_KINDS.find((k) => k.id === d.kind) || {}).label}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{d.clientName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.objet}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{genFmt(genMontantTTC(d))}</span>
              <span><GenBadge statut={d.statut} /></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{d.emis || '—'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{(d.journal[d.journal.length - 1] || {}).who || '—'}</span>
            </a>)}
            {list.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--fg4)', fontSize: '0.8125rem' }}>Aucun document ne correspond à ces filtres.</div>}
          </div>
        </React.Fragment>}
    </div>
  );
};

Object.assign(window, { GenBadge, DocRender, GenSec, NewDocumentPanel, DocumentsListPanel });
