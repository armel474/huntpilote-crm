/* HuntPilote — Agence hub : écrans Modèles de documents (liste + éditeur). */
const { useState: tplUseState, useRef: tplUseRef, useEffect: tplUseEffect } = React;

const TplI = {
  Star: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.63 22 9.27 16.5 14.14 18.18 21 12 17.27 5.82 21 7.5 14.14 2 9.27 8.91 8.63" /></svg>,
  StarO: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><polygon points="12 2 15.09 8.63 22 9.27 16.5 14.14 18.18 21 12 17.27 5.82 21 7.5 14.14 2 9.27 8.91 8.63" /></svg>,
  Copy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
  Expand: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>,
  Collapse: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>,
  Print: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
  Upload: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Book: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>,
};

/* ── Dictionnaire des balises (slide-over) ── */
const TagDictionary = ({ onClose }) => {
  const [copied, setCopied] = tplUseState('');
  const copy = (t) => { navigator.clipboard && navigator.clipboard.writeText(`{{${t}}}`).catch(() => {}); setCopied(t); setTimeout(() => setCopied(''), 1200); };
  return (
    <div className="dl-scrim" onClick={onClose}>
      <div className="dl-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="dl-head"><div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 800 }}>Dictionnaire des balises</div><button className="btn-icon" onClick={onClose}><AgI.X /></button></div>
        <div className="dl-body">
          <div className="dl-note" style={{ marginBottom: 12 }}>Syntaxe retenue pour cette maquette : <code>{'{{groupe.champ}}'}</code>, blocs répétés <code>{'{{#bloc}} … {{/bloc}}'}</code>. Si les modèles réels de l\u2019agence utilisent une autre syntaxe, c\u2019est elle qui doit gagner ici.</div>
          {DOC_TAG_GROUPS.map((g) => (
            <div key={g.id} className="tag-group">
              <div className="tag-group-h">{g.label}</div>
              {g.tags.map(([tag, ex]) => (
                <div key={tag} className="tag-chip" onClick={() => copy(tag)} title="Copier">
                  <span>{tag.includes('(') ? tag : `{{${tag}}}`}</span>
                  <small>{copied === tag ? 'Copié' : ex}</small>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Éditeur de code avec numéros de ligne ── */
const CodeEditor = ({ value, onChange, disabled }) => {
  const gutterRef = tplUseRef(null); const taRef = tplUseRef(null);
  const lines = (value.match(/\n/g) || []).length + 1;
  const sync = () => { if (gutterRef.current && taRef.current) gutterRef.current.scrollTop = taRef.current.scrollTop; };
  return (
    <div className="code-wrap">
      <div className="code-gutter" ref={gutterRef}>{Array.from({ length: lines }, (_, i) => i + 1).join('\n')}</div>
      <textarea ref={taRef} className="code-ta" spellCheck={false} value={value} disabled={disabled} onScroll={sync} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

/* ── Ligne de la liste ── */
const TplRow = ({ t, isOnlyOne, canManage, onOpen, onSetDefault, year }) => (
  <div className="tpl-row">
    <div className="tpl-row-main" onClick={() => onOpen(t.id)}>
      <div className="tpl-row-name">{t.nom}{t.isDefault && <AgBdg label="Par défaut" t="green" />}{docParseTags(t.html).unknown.length > 0 && <AgBdg label="Incomplet" t="yellow" />}</div>
      <div className="tpl-row-meta"><span>{docNextRef(t, year)} sera le prochain</span><span>Délai de paiement : {t.delaiPaiementJours ? `${t.delaiPaiementJours} j` : '—'}</span><span>{t.nbDocuments} document{t.nbDocuments > 1 ? 's' : ''} produit{t.nbDocuments > 1 ? 's' : ''}</span><span>Modifié le {t.lastModified}</span></div>
    </div>
    {canManage && !t.isDefault && !isOnlyOne && <button className="btn-out" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem' }} onClick={() => onSetDefault(t.id)}><TplI.StarO />Rendre par défaut</button>}
    <button className="btn-out" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem' }} onClick={() => onOpen(t.id)}>{canManage ? 'Modifier' : 'Consulter'}</button>
  </div>
);

/* ── Dialogue nouveau modèle ── */
const NewModelDialog = ({ templates, onClose, onCreate }) => {
  const [kind, setKind] = tplUseState(DOC_KINDS[0].id);
  const [base, setBase] = tplUseState('vierge');
  const kindTpls = templates.filter((t) => t.kind === kind);
  tplUseEffect(() => setBase('vierge'), [kind]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }} onClick={onClose}>
      <div className="card" style={{ width: 440, maxWidth: '92vw', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}><div style={{ fontSize: '1.0625rem', fontWeight: 800, flex: 1 }}>Nouveau modèle</div><button className="btn-icon" onClick={onClose}><AgI.X /></button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AgField label="Sorte de document"><select className="fld" value={kind} onChange={(e) => setKind(e.target.value)}>{DOC_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select></AgField>
          <AgField label="Partir de">
            <select className="fld" value={base} onChange={(e) => setBase(e.target.value)}>
              <option value="vierge">Page vierge</option>
              {kindTpls.map((t) => <option key={t.id} value={t.id}>Copie de « {t.nom} »</option>)}
            </select>
          </AgField>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn-out" onClick={onClose}>Annuler</button>
          <button className="btn-pri" onClick={() => onCreate(kind, base === 'vierge' ? null : base)}><AgI.Plus />Créer le modèle</button>
        </div>
      </div>
    </div>
  );
};

/* ── Écran Modèles (liste) ── */
const ModelesPanel = () => {
  const [templates, setTemplates] = tplUseState(DOC_TEMPLATES);
  const [view, setView] = tplUseState('edit');
  const [openId, setOpenId] = tplUseState(null);
  const [draftSeed, setDraftSeed] = tplUseState(null);
  const [dialogOpen, setDialogOpen] = tplUseState(false);
  const canManage = view === 'edit';
  const year = 2026;

  const setDefault = (id) => setTemplates((prev) => { const t = prev.find((x) => x.id === id); return prev.map((x) => x.kind === t.kind ? { ...x, isDefault: x.id === id } : x); });
  const save = (d) => setTemplates((prev) => prev.some((t) => t.id === d.id) ? prev.map((t) => t.id === d.id ? d : (d.isDefault && t.kind === d.kind ? { ...t, isDefault: false } : t)) : [...(d.isDefault ? prev.map((t) => t.kind === d.kind ? { ...t, isDefault: false } : t) : prev), d]);

  const createDraft = (kind, baseId) => {
    const base = baseId ? templates.find((t) => t.id === baseId) : null;
    const seed = base ? { ...base, id: catUid(), nom: `${base.nom} (copie)`, nbDocuments: 0, isDefault: false, lastModified: 'Non enregistré' }
      : { id: catUid(), kind, nom: '', prefixe: kind.slice(0, 2).toUpperCase(), includeYear: true, numWidth: 3, delaiPaiementJours: 30, isDefault: templates.filter((t) => t.kind === kind).length === 0, nbDocuments: 0, lastModified: 'Non enregistré', html: '<div class="cdoc">\n  \n</div>', introduction: '', mentions: '', pied: '', paiement: '' };
    setDraftSeed(seed); setDialogOpen(false); setOpenId(seed.id);
  };

  const open = openId ? (templates.find((t) => t.id === openId) || draftSeed) : null;
  if (open) return <ModelEditor template={open} isNew={!templates.some((t) => t.id === open.id)} canManage={canManage} allTemplates={templates} year={year}
    onBack={() => { setOpenId(null); setDraftSeed(null); }} onSave={(d) => { save(d); setOpenId(null); setDraftSeed(null); }} />;

  return (
    <div>
      <AgSectionHead title="Modèles de documents" sub="Devis, factures, propositions, contrats, annexes, avenants — le contenu que le générateur remplit." action={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CatViewBar view={view} setView={setView} />{canManage ? <button className="btn-pri" onClick={() => setDialogOpen(true)}><AgI.Plus />Nouveau modèle</button> : <button className="btn-out" disabled title="Verrouillé — droit \u2018Gérer le catalogue\u2019 requis"><AgI.Lock />Nouveau modèle</button>}</div>} />
      {!canManage && <AgLocked reason="Vous consultez les modèles en lecture seule. Le droit \u2018Gérer le catalogue\u2019 est requis pour les modifier." />}
      {DOC_KINDS.map((k) => {
        const items = templates.filter((t) => t.kind === k.id);
        return (
          <div key={k.id} className="tpl-list-group">
            <div className="tpl-list-h"><b>{k.label}</b><span>{items.length} modèle{items.length !== 1 ? 's' : ''}</span></div>
            {items.length === 0
              ? <div className="card" style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--yellow-fg)', flexShrink: 0 }}><AgI.Warn /></span>
                  <div style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--fg2)' }}>Aucun modèle d\u2019{k.label.toLowerCase()}. Les {k.label.toLowerCase()}s ne pourront pas être générés.</div>
                  {canManage && <button className="btn-out" onClick={() => createDraft(k.id, null)}>Créer un modèle</button>}
                </div>
              : <div className="card" style={{ padding: '0 1.125rem' }}>{items.map((t) => <TplRow key={t.id} t={t} isOnlyOne={items.length === 1} canManage={canManage} onOpen={setOpenId} onSetDefault={setDefault} year={year} />)}</div>}
          </div>
        );
      })}
      {dialogOpen && <NewModelDialog templates={templates} onClose={() => setDialogOpen(false)} onCreate={createDraft} />}
    </div>
  );
};

/* ── Éditeur d'un modèle (3 colonnes) ── */
const ModelEditor = ({ template, isNew, canManage, allTemplates, year, onBack, onSave }) => {
  const [d, setD] = tplUseState(template);
  const [saveState, setSaveState] = tplUseState('idle');
  const [sampleId, setSampleId] = tplUseState(DOC_SAMPLE_CLIENTS[0].id);
  const [dictOpen, setDictOpen] = tplUseState(false);
  const [fsPreview, setFsPreview] = tplUseState(false);
  const fileRef = tplUseRef(null);
  const dirty = JSON.stringify(d) !== JSON.stringify(template);
  const set = (k) => (v) => setD((p) => ({ ...p, [k]: v }));
  const analysis = docParseTags(d.html);
  const sample = DOC_SAMPLE_CLIENTS.find((c) => c.id === sampleId);
  const rendered = docRender(d.html, docBuildData(d, sample));

  const back = () => { if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Quitter sans enregistrer ?')) return; onBack(); };
  const save = () => { setSaveState('saving'); setTimeout(() => { onSave(d); }, 500); };
  const paste = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => set('html')(String(r.result)); r.readAsText(f); };
  const printIt = () => window.print();

  return (
    <div>
      <button className="btn-out" style={{ marginBottom: 14 }} onClick={back}><AgI.Back />Retour aux modèles</button>
      <AgSectionHead title={isNew ? 'Nouveau modèle' : d.nom || 'Modèle'} sub={dirty ? 'Modifications non enregistrées' : (d.nbDocuments > 0 ? `Déjà utilisé pour ${d.nbDocuments} document${d.nbDocuments > 1 ? 's' : ''} — les enregistrements ne changent pas ceux déjà produits.` : undefined)} action={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-out" onClick={() => setDictOpen(true)}><TplI.Book />Dictionnaire des balises</button>
          {canManage ? <button className="btn-pri" disabled={!dirty || saveState === 'saving'} onClick={save}>{saveState === 'saving' ? 'Enregistrement…' : saveState === 'saved' ? <React.Fragment><AgI.Check />Enregistré</React.Fragment> : 'Enregistrer le modèle'}</button>
            : <button className="btn-out" disabled title="Verrouillé — droit \u2018Gérer le catalogue\u2019 requis"><AgI.Lock />Enregistrer le modèle</button>}
        </div>} />
      {!canManage && <AgLocked reason="Vous consultez ce modèle en lecture seule. Le droit \u2018Gérer le catalogue\u2019 est requis pour le modifier." />}
      {saveState === 'error' && <div className="dl-banner red" style={{ marginBottom: 14 }}><span><AgI.Warn /></span><span><b>Le modèle n\u2019a pas pu être enregistré.</b> Réessayez ; si ça persiste, vérifiez votre connexion.</span></div>}

      <div className={`tpl-cols${fsPreview ? ' fs-preview' : ''}`}>
        <div>
          <CatSec title="Réglages">
            <AgField label="Nom" span><input className="fld" value={d.nom} onChange={(e) => set('nom')(e.target.value)} disabled={!canManage} /></AgField>
            <div style={{ height: 10 }} />
            <AgField label="Sorte" hint="Figée après création"><div className="fld" style={{ background: 'var(--bg-muted)', color: 'var(--fg3)' }}>{(DOC_KINDS.find((k) => k.id === d.kind) || {}).label}</div></AgField>
            <div style={{ height: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <AgField label="Préfixe"><input className="fld" value={d.prefixe} onChange={(e) => set('prefixe')(e.target.value.toUpperCase())} disabled={!canManage} /></AgField>
              <AgField label="Largeur"><input className="fld" type="number" value={d.numWidth} onChange={(e) => set('numWidth')(Number(e.target.value))} disabled={!canManage} /></AgField>
            </div>
            <div style={{ height: 10 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><AgToggle on={d.includeYear} disabled={!canManage} onClick={() => set('includeYear')(!d.includeYear)} /><span style={{ fontSize: '0.75rem' }}>Inclure l\u2019année</span></div>
            <div className="dl-note" style={{ marginBottom: 12 }}>{docNextRef(d, year)} sera le prochain numéro.</div>
            <AgField label="Délai de paiement (jours)"><input className="fld" type="number" value={d.delaiPaiementJours} onChange={(e) => set('delaiPaiementJours')(Number(e.target.value))} disabled={!canManage} /></AgField>
            <div style={{ height: 10 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AgToggle on={d.isDefault} disabled={!canManage} onClick={() => set('isDefault')(!d.isDefault)} /><span style={{ fontSize: '0.75rem' }}>Modèle par défaut pour « {(DOC_KINDS.find((k) => k.id === d.kind) || {}).label} »</span></div>
          </CatSec>
          <CatSec title="Textes du modèle" sub="Des balises comme les autres — leur valeur vit dans le modèle">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AgField label="Introduction ({{document.introduction}})"><textarea className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={d.introduction} onChange={(e) => set('introduction')(e.target.value)} disabled={!canManage} /></AgField>
              <AgField label="Mentions légales ({{document.mentions}})"><textarea className="fld" rows={2} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={d.mentions} onChange={(e) => set('mentions')(e.target.value)} disabled={!canManage} /></AgField>
              <AgField label="Pied de page ({{document.pied}})"><textarea className="fld" rows={2} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={d.pied} onChange={(e) => set('pied')(e.target.value)} disabled={!canManage} /></AgField>
              <AgField label="Instructions de paiement ({{document.paiement}})"><textarea className="fld" rows={2} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={d.paiement} onChange={(e) => set('paiement')(e.target.value)} disabled={!canManage} /></AgField>
            </div>
          </CatSec>
        </div>

        <div>
          <div className="analysis-bar">
            <span className="ok">{analysis.knownCount} balise{analysis.knownCount > 1 ? 's' : ''} reconnue{analysis.knownCount > 1 ? 's' : ''}</span>
            {analysis.blocks.length > 0 && <span>{analysis.blocks.length} bloc{analysis.blocks.length > 1 ? 's' : ''} répété{analysis.blocks.length > 1 ? 's' : ''} : {analysis.blocks.map((b) => `{{#${b}}}`).join(', ')}</span>}
            {analysis.unknown.length > 0 && <div className="analysis-unk"><span className="warn">{analysis.unknown.length} balise{analysis.unknown.length > 1 ? 's' : ''} inconnue{analysis.unknown.length > 1 ? 's' : ''} :</span>{analysis.unknown.map((u) => <button key={u.tag} onClick={() => setDictOpen(true)} title={u.suggestion ? `Vouliez-vous dire {{${u.suggestion}}} ?` : 'Aucune suggestion'}>{'{{' + u.tag + '}}'}{u.suggestion ? ` → {{${u.suggestion}}}` : ''}</button>)}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <input ref={fileRef} type="file" accept=".html,text/html" style={{ display: 'none' }} onChange={paste} />
            {canManage && <button className="btn-out" onClick={() => fileRef.current.click()}><TplI.Upload />Coller un fichier HTML</button>}
          </div>
          <CodeEditor value={d.html} onChange={set('html')} disabled={!canManage} />
        </div>

        <div className="tpl-preview-col tpl-preview-col">
          <div className="tpl-print-bar">
            <select className="fld" style={{ width: 'auto', padding: '0.35rem 0.55rem', fontSize: '0.75rem' }} value={sampleId} onChange={(e) => setSampleId(e.target.value)} aria-label="Client d'exemple">{DOC_SAMPLE_CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-icon" title={fsPreview ? 'Réduire' : 'Plein écran'} onClick={() => setFsPreview((f) => !f)}>{fsPreview ? <TplI.Collapse /> : <TplI.Expand />}</button>
              <button className="btn-out" onClick={printIt}><TplI.Print />Aperçu impression</button>
            </div>
          </div>
          <div className="client-doc print-doc" dangerouslySetInnerHTML={{ __html: rendered }} />
        </div>
      </div>
      {dictOpen && <TagDictionary onClose={() => setDictOpen(false)} />}
    </div>
  );
};

Object.assign(window, { ModelesPanel, ModelEditor, TagDictionary });
