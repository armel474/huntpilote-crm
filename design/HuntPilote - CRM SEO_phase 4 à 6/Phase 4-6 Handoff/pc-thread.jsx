/* HuntPilote — portail client : fil d'échanges. Lettres datées, pas une messagerie instantanée. */
const { useState: usePE } = React;

const PE_TONE = { green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };

/* ── CONTEXTE RATTACHÉ ── */
const CtxChip = ({ id, onClear }) => {
  const a = window.peAnchor(id);
  if (!a || !a.kind) return null;
  const c = window.PE_CTX[a.kind], [bg, bd, fg] = PE_TONE[c.tone];
  return (
    <div className="pe-ctx" style={{ background: bg, borderColor: bd }}>
      <span className="pe-ctx-k" style={{ color: fg }}>{c.label}</span>
      <span className="pe-ctx-l">{a.label}</span>
      {a.from !== a.label && <span className="pe-ctx-f">{a.from}</span>}
      {onClear && <button className="pe-ctx-x" onClick={onClear} aria-label="Retirer le contexte">×</button>}
    </div>);
};

const FileRow = ({ f }) => (
  <a href="Rapport Client.html" className="pe-file"><span className="pe-file-i"><window.PNI.Clip /></span><span style={{ minWidth: 0 }}><span className="pe-file-n">{f.name}</span><span className="pe-file-s">{f.size}</span></span></a>);

/* ── UN MESSAGE ── */
const Message = ({ m, isLast, waiting }) => {
  const A = window.PC_ACCOUNT;
  const mine = m.from === 'client';
  return (
    <article className={`pe-msg${mine ? ' mine' : ''}${!m.read && !mine ? ' unread' : ''}`}>
      <header className="pe-msg-h">
        <span className="pc-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', ...(mine ? {} : { background: 'var(--bg-muted)', borderColor: 'var(--bd-solid)', color: 'var(--fg2)' }) }}>{mine ? A.initials : 'MC'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.3 }}>{mine ? 'Vous' : A.pm}<span style={{ fontWeight: 500, color: 'var(--fg3)' }}>{mine ? '' : ' · votre responsable de compte'}</span></div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)' }}>{m.at}</div>
        </div>
        {!m.read && !mine && <span className="pe-new">Non lu</span>}
      </header>
      {m.ctx && <CtxChip id={m.ctx} />}
      <p style={{ fontSize: '1rem', marginTop: 10 }}>{m.text}</p>
      {m.files && m.files.length > 0 && (
        <div className="pe-files">
          <span className="pc-hint" style={{ width: '100%', marginBottom: 2 }}>{m.files.length} pièce{m.files.length > 1 ? 's' : ''} jointe{m.files.length > 1 ? 's' : ''}</span>
          {m.files.map(f => <FileRow key={f.name} f={f} />)}
        </div>)}
      {mine && (
        <footer className="pe-state">
          {m.sent && isLast && waiting
            ? <React.Fragment><window.PNI.Check2 /><span>Reçu par {window.PC_ACCOUNT.pm}. <b>Réponse attendue d’ici demain</b> — le mandat prévoit une réponse sous {window.PE_SLA} jour ouvrable.</span></React.Fragment>
            : <React.Fragment><window.PNI.Check2 /><span>Lu par {window.PC_ACCOUNT.pm}{isLast ? '' : ' · une réponse a suivi'}</span></React.Fragment>}
        </footer>)}
    </article>);
};

/* ── COMPOSITION ── */
const Composer = ({ onSend }) => {
  const [text, setText] = usePE('');
  const [ctx, setCtx] = usePE('a0');
  const [files, setFiles] = usePE([]);
  const add = () => setFiles(f => [...f, { name: `Document-${f.length + 1}.pdf`, size: '320 Ko' }]);
  return (
    <div className="pe-composer">
      <h2 style={{ marginBottom: 4 }}>Écrire à {window.PC_ACCOUNT.pm}</h2>
      <p style={{ fontSize: '0.9375rem', marginBottom: 14 }}>Rattachez votre question à l’élément dont elle parle : {window.PC_ACCOUNT.pm} voit tout de suite de quel chiffre ou de quel chantier il s’agit.</p>
      <div className="pc-field">
        <label htmlFor="pe-ctx">À propos de</label>
        <select id="pe-ctx" className="pc-input" value={ctx} onChange={e => setCtx(e.target.value)}>
          {window.PE_ANCHORS.map(a => <option key={a.id} value={a.id}>{a.kind ? `${window.PE_CTX[a.kind].label} — ${a.label}` : a.label}</option>)}
        </select>
      </div>
      {ctx !== 'a0' && <div style={{ marginBottom: 12 }}><CtxChip id={ctx} onClear={() => setCtx('a0')} /></div>}
      <div className="pc-field">
        <label htmlFor="pe-txt">Votre message</label>
        <textarea id="pe-txt" className="pc-input" rows="4" value={text} onChange={e => setText(e.target.value)} placeholder="Posez votre question — pas besoin de vocabulaire technique." style={{ resize: 'vertical', fontSize: '1rem' }}></textarea>
      </div>
      {files.length > 0 && <div className="pe-files" style={{ marginBottom: 12 }}>{files.map(f => <FileRow key={f.name} f={f} />)}</div>}
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="pc-btn solid" disabled={!text.trim()} onClick={() => { onSend({ text: text.trim(), ctx, files }); setText(''); setCtx('a0'); setFiles([]); }}><window.PNI.Send />Envoyer</button>
        <button className="pc-btn" onClick={add}><window.PNI.Clip />Joindre un fichier</button>
        <span className="pc-hint" style={{ flex: '1 1 12rem' }}>Réponse sous {window.PE_SLA} jour ouvrable. Ce n’est pas une messagerie instantanée — inutile de rester sur la page.</span>
      </div>
    </div>);
};

const PeEmpty = () => (
  <div className="pc-wait-card">
    <div className="pc-sent"><window.PNI.Chat /></div>
    <h1 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Aucun échange pour l’instant</h1>
    <p className="lead">C’est ici que vous posez vos questions à {window.PC_ACCOUNT.pm}, et que vous retrouvez ses réponses. Écrivez votre premier message juste en dessous — le fil restera, mois après mois.</p>
    <div className="pc-frozen-in" style={{ marginTop: '1.25rem' }}>
      <span><window.PNI.Clock /></span>
      <div>Le mandat prévoit une réponse sous <b>{window.PE_SLA} jour ouvrable</b>. Pour une urgence, appelez directement le {window.PC_ACCOUNT.phone || '514 555 0100'}.</div>
    </div>
  </div>);

Object.assign(window, { PE_TONE, CtxChip, FileRow, Message, Composer, PeEmpty });
