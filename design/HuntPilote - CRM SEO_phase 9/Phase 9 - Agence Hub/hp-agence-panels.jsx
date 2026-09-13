/* HuntPilote — Agence hub : panneaux (accueil, profil, équipe). */
const { useState: agUseState, useRef: agUseRef } = React;

const AgI = {
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="9" x2="9" y2="9.01" /><line x1="15" y1="9" x2="15" y2="9.01" /><line x1="9" y1="13" x2="9" y2="13.01" /><line x1="15" y1="13" x2="15" y2="13.01" /><line x1="9" y1="17" x2="15" y2="17" /></svg>,
  Team: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  Box: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  Tag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 3.83A2 2 0 009.59 3H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.58a2 2 0 002.82 0l4.6-4.6a2 2 0 000-2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" /></svg>,
  Folder: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Warn: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Arrow: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Back: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  Cam: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Lock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

const AgBdg = ({ label, t = 'neutral' }) => {
  const M = { green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg3)'] }[t];
  return <span style={{ background: M[0], border: `1px solid ${M[1]}`, color: M[2], padding: '2px 9px', borderRadius: 999, fontSize: '0.5625rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>;
};
const AgToggle = ({ on, onClick, disabled }) => (
  <div className="tgl" onClick={disabled ? undefined : onClick} style={{ background: on ? 'var(--green)' : 'var(--bd-strong)', opacity: disabled ? 0.55 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}><div className="tgl-knob" style={{ left: on ? 18 : 2 }}></div></div>
);
const AgField = ({ label, children, span, hint }) => (
  <div style={{ gridColumn: span ? '1 / -1' : 'auto' }}>
    <div className="lbl" style={{ marginBottom: 6 }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 4 }}>{hint}</div>}
  </div>
);
const AgSectionHead = ({ title, sub, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{title}</div>
      {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginTop: 3 }}>{sub}</div>}
    </div>
    {action}
  </div>
);
const AgLocked = ({ reason }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0.75rem 1rem', borderRadius: 12, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', marginBottom: 14, fontSize: '0.75rem', color: 'var(--fg2)' }}>
    <span style={{ color: 'var(--fg4)', flexShrink: 0, display: 'flex' }}><AgI.Lock /></span>{reason}
  </div>
);

/* ── Zone de dépôt image (logo / photo) ── */
const AgUploadZone = ({ shape = 'square', size = 64, kind = 'logo', value, requireSquare, disabled, onChange }) => {
  const [state, setState] = agUseState(value ? 'uploaded' : 'empty');
  const [err, setErr] = agUseState('');
  const [preview, setPreview] = agUseState(value || null);
  const inputRef = agUseRef(null);
  const constraint = kind === 'logo' ? 'PNG ou SVG, carré, 512 px' : 'Image carrée recommandée';
  const handleFile = (file) => {
    if (!file || disabled) return;
    const okType = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'].includes(file.type) && (kind !== 'logo' || ['image/png', 'image/svg+xml'].includes(file.type));
    if (!okType) { setState('rejected'); setErr(kind === 'logo' ? 'Format non reconnu — PNG ou SVG seulement.' : 'Format non reconnu — image PNG, JPG ou WebP.'); return; }
    setState('uploading'); setErr('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const square = file.type === 'image/svg+xml' || Math.abs(img.width - img.height) <= img.width * 0.08;
      setTimeout(() => {
        if (requireSquare && !square) { setState('rejected'); setErr('Une image carrée s\u2019affiche mieux — recadrez et reprenez le dépôt.'); }
        else { setPreview(url); setState('uploaded'); onChange && onChange(url); }
      }, 650);
    };
    img.onerror = () => { setState('rejected'); setErr('Le fichier n\u2019a pas pu être lu.'); };
    img.src = url;
  };
  const br = shape === 'circle' ? '50%' : 14;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div onClick={() => !disabled && inputRef.current && inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{ width: size, height: size, borderRadius: br, flexShrink: 0, position: 'relative', overflow: 'hidden', cursor: disabled ? 'default' : 'pointer', background: state === 'uploaded' ? 'var(--bg-muted)' : 'var(--bg-base)', border: state === 'rejected' ? '1.5px dashed var(--red)' : '1.5px dashed var(--bd-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state === 'uploaded' && preview && <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {state === 'empty' && <span style={{ color: 'var(--fg4)' }}><AgI.Cam /></span>}
        {state === 'uploading' && <div className="ag-spin" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--bd-solid)', borderTopColor: 'var(--accent)' }}></div>}
        {state === 'rejected' && <span style={{ color: 'var(--red)' }}><AgI.Warn /></span>}
        {!disabled && state !== 'empty' && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-solid)', border: '1px solid var(--bd-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg3)' }}><AgI.Cam /></div>}
        <input ref={inputRef} type="file" accept={kind === 'logo' ? '.png,.svg,image/png,image/svg+xml' : 'image/*'} style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: state === 'rejected' ? 'var(--red)' : 'var(--fg2)' }}>
          {state === 'empty' && (disabled ? 'Aucun fichier' : 'Glissez une image ou cliquez pour choisir')}
          {state === 'uploading' && 'Téléversement…'}
          {state === 'uploaded' && 'Fichier téléversé'}
          {state === 'rejected' && err}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 2 }}>{constraint}</div>
        {state === 'uploaded' && !disabled && <button type="button" className="btn-out" style={{ marginTop: 6, padding: '0.25rem 0.7rem', fontSize: '0.625rem' }} onClick={() => { setState('empty'); setPreview(null); onChange && onChange(null); }}>Retirer</button>}
      </div>
    </div>
  );
};

/* ── Accueil du hub ── */
const AgHubCard = ({ card, sub }) => {
  const complete = card.state === undefined && sub && sub.complete;
  const state = card.state || (sub ? sub.state : 'neutral');
  const text = card.text || (sub ? sub.text : '');
  const Icon = { profil: AgI.Building, equipe: AgI.Team, catalogue: AgI.Box, offres: AgI.Tag, modeles: AgI.FileText, documents: AgI.Folder }[card.id];
  const stateColor = state === 'critical' ? 'var(--red)' : state === 'warn' ? 'var(--yellow-fg)' : state === 'ok' ? 'var(--green-fg)' : 'var(--fg3)';
  return (
    <div className="card" style={{ padding: '1.125rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--bg-muted)', color: 'var(--fg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon /></div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{card.label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.75rem', color: stateColor, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
        {state === 'ok' ? <AgI.Check /> : state !== 'neutral' && <span style={{ marginTop: 1, flexShrink: 0 }}><AgI.Warn /></span>}
        <span>{text}</span>
      </div>
      <button className="btn-out" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => window.__agNav && window.__agNav(card.id)}>Ouvrir<AgI.Arrow /></button>
    </div>
  );
};
const HubHome = ({ onNav }) => {
  const missing = agProfileMissing(AG_PROFILE);
  const equipeActifs = AG_TEAM.filter(m => m.actif && !m.invited).length;
  const invitesEnAttente = AG_TEAM.filter(m => m.invited).length;
  window.__agNav = onNav;
  const subs = {
    profil: missing.length ? { state: 'warn', text: `${missing.length} champ${missing.length > 1 ? 's' : ''} manquant${missing.length > 1 ? 's' : ''} : ${missing.join(', ')}` } : { state: 'ok', text: 'Complet' },
    equipe: { state: invitesEnAttente ? 'warn' : 'neutral', text: `${equipeActifs} membres actifs${invitesEnAttente ? ` · ${invitesEnAttente} invitation${invitesEnAttente > 1 ? 's' : ''} en attente` : ''}` },
  };
  return (
    <div>
      <AgSectionHead title="Agence hub" sub="Qui vous êtes, qui y travaille, ce que vous vendez — en un coup d’œil." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
        {AG_HUB_CARDS.map(c => <AgHubCard key={c.id} card={c} sub={subs[c.id]} />)}
      </div>
    </div>
  );
};

/* ── Profil ── */
const AG_PROFIL_VIEWS = [['edit', 'Modifiable — vous gérez l\u2019agence'], ['readonly', 'Lecture seule — sans ce droit'], ['error', 'Dernier enregistrement en erreur']];
const ProfilPanel = () => {
  const [view, setView] = agUseState('edit');
  const [p, setP] = agUseState(AG_PROFILE);
  const [saveState, setSaveState] = agUseState('idle');
  const readOnly = view === 'readonly';
  const set = (k) => (e) => setP(prev => ({ ...prev, [k]: e.target.value }));
  const missing = agProfileMissing(p);
  const save = () => {
    setSaveState('saving');
    setTimeout(() => setSaveState(view === 'error' ? 'error' : 'saved'), 900);
    setTimeout(() => setSaveState(s => s === 'saved' ? 'idle' : s), 2600);
  };
  return (
    <div>
      <AgSectionHead title="Profil de l'agence" sub="Ces informations apparaissent sur les devis, factures et contrats envoyés aux clients." action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select className="fld" style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} value={view} onChange={(e) => { setView(e.target.value); setSaveState('idle'); }} aria-label="Vue de démonstration">{AG_PROFIL_VIEWS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
          {readOnly
            ? <button className="btn-out" disabled title="Verrouillé — droit ‘Gérer l’agence’ requis" style={{ opacity: 0.6, cursor: 'not-allowed' }}><AgI.Lock />Enregistrer</button>
            : <button className="btn-pri" onClick={save} disabled={saveState === 'saving'}>{saveState === 'saving' ? 'Enregistrement…' : saveState === 'saved' ? <React.Fragment><AgI.Check />Enregistré</React.Fragment> : <React.Fragment><AgI.Check />Enregistrer</React.Fragment>}</button>}
        </div>} />

      {readOnly && <AgLocked reason="Vous consultez le profil en lecture seule. Le droit ‘Gérer l’agence’ est requis pour le modifier." />}
      {saveState === 'error' && <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 14, borderTop: '3px solid var(--red-b)', background: 'var(--red-m)', display: 'flex', gap: 10, alignItems: 'flex-start' }}><span style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}><AgI.Warn /></span><div style={{ fontSize: '0.8125rem', color: 'var(--fg1)' }}><b>Le profil n\u2019a pas pu être enregistré.</b> Réessayez ; si ça persiste, vérifiez votre connexion.</div></div>}
      {missing.length > 0 && <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 14, borderTop: '3px solid var(--yellow-b)', background: 'var(--yellow-m)', display: 'flex', gap: 10, alignItems: 'flex-start' }}><span style={{ color: 'var(--yellow-fg)', flexShrink: 0, marginTop: 1 }}><AgI.Warn /></span><div style={{ fontSize: '0.8125rem', color: 'var(--fg1)' }}>Numéros de taxes manquants : <b>{missing.join(', ')}</b>. Sans eux, les factures ne peuvent pas être conformes.</div></div>}

      <div className="card" style={{ padding: '1.25rem', marginBottom: 14 }}>
        <div style={{ paddingBottom: 18, borderBottom: '1px solid var(--bd)', marginBottom: 18 }}>
          <AgUploadZone kind="logo" shape="rounded" requireSquare value={p.logo} disabled={readOnly} onChange={(url) => setP(prev => ({ ...prev, logo: url }))} />
          <div style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 8 }}>Le logo apparaît sur les devis, factures et contrats — c'est ce qui motive à le fournir.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <AgField label="Nom de l'agence"><input className="fld" value={p.nom} onChange={set('nom')} disabled={readOnly} /></AgField>
          <AgField label="Raison sociale"><input className="fld" value={p.raisonSociale} onChange={set('raisonSociale')} disabled={readOnly} /></AgField>
          <AgField label="Site web"><input className="fld" value={p.siteWeb} onChange={set('siteWeb')} disabled={readOnly} /></AgField>
          <AgField label="Courriel de contact"><input className="fld" value={p.courriel} onChange={set('courriel')} disabled={readOnly} /></AgField>
          <AgField label="Téléphone"><input className="fld" value={p.telephone} onChange={set('telephone')} disabled={readOnly} /></AgField>
          <AgField label="NEQ"><input className="fld" value={p.neq} onChange={set('neq')} disabled={readOnly} /></AgField>
          <AgField label="Adresse" span><input className="fld" value={p.adresse} onChange={set('adresse')} disabled={readOnly} /></AgField>
          <AgField label="Ville"><input className="fld" value={p.ville} onChange={set('ville')} disabled={readOnly} /></AgField>
          <AgField label="Province"><input className="fld" value={p.province} onChange={set('province')} disabled={readOnly} /></AgField>
          <AgField label="Code postal"><input className="fld" value={p.codePostal} onChange={set('codePostal')} disabled={readOnly} /></AgField>
          <AgField label="Numéro de TPS" hint={!p.tps ? 'Manquant' : undefined}><input className="fld" placeholder="Ex. 123456789 RT0001" value={p.tps} onChange={set('tps')} disabled={readOnly} /></AgField>
          <AgField label="Numéro de TVQ" hint={!p.tvq ? 'Manquant' : undefined}><input className="fld" placeholder="Ex. 1234567890 TQ0001" value={p.tvq} onChange={set('tvq')} disabled={readOnly} /></AgField>
          <AgField label="Instructions de paiement par défaut" sub span><textarea className="fld" rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} value={p.paiement} onChange={set('paiement')} disabled={readOnly} /></AgField>
        </div>
      </div>
    </div>
  );
};

/* ── Équipe ── */
const AG_VIEWERS = [['m1', 'Marie Chen — gestion d\u2019équipe'], ['m4', 'Tom Bélanger — sans ce droit'], ['m5', 'Accueil de Nadia — première connexion']];
const AgStatusBdg = (m) => m.invited ? <AgBdg label="Invitation en attente" t="yellow" /> : !m.actif ? <AgBdg label="Désactivé" t="neutral" /> : m.you ? <AgBdg label="VOUS" t="green" /> : null;

const AgRightsList = ({ member, editable, onToggle }) => (
  <div className="card" style={{ padding: '0.4rem 1.125rem 0.5rem' }}>
    {AG_RIGHTS.map((r, i) => {
      const val = agEffectiveRight(member, r.id);
      const def = agRoleDefault(member.role, r.id);
      const overridden = val !== def;
      const lockedSelf = member.you && r.id === 'gerer_equipe' && val;
      return (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 0', borderBottom: i < AG_RIGHTS.length - 1 ? '1px solid var(--bd)' : 'none' }}>
          {editable
            ? <input type="checkbox" checked={val} disabled={lockedSelf} onChange={() => onToggle(r.id)} style={{ width: 16, height: 16, accentColor: 'var(--accent)', flexShrink: 0, cursor: lockedSelf ? 'not-allowed' : 'pointer' }} />
            : <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: val ? 'var(--green)' : 'var(--bg-muted)', color: '#fff', border: val ? 'none' : '1px solid var(--bd-solid)' }}>{val && <AgI.Check />}</span>}
          <span style={{ fontSize: '0.8125rem', color: 'var(--fg1)', flex: 1 }}>{r.label}</span>
          {overridden && <AgBdg label={val ? 'Accordé en plus' : 'Retiré'} t={val ? 'blue' : 'red'} />}
          {lockedSelf && <span title="Vous ne pouvez pas retirer ce droit à vous-même." style={{ color: 'var(--fg4)', display: 'flex' }}><AgI.Lock /></span>}
        </div>);
    })}
  </div>
);

const AgFicheMembre = ({ member, mine, canManage, onBack, onChange }) => {
  const editableIdentity = canManage || mine;
  const editableRights = canManage;
  const title = mine && !canManage ? 'Mon profil' : member.name;
  const set = (k) => (e) => onChange({ ...member, [k]: e.target.value });
  const toggleRight = (id) => { if (member.you && id === 'gerer_equipe' && agEffectiveRight(member, id)) return; const ov = { ...(member.overrides || {}) }; ov[id] = !agEffectiveRight(member, id); onChange({ ...member, overrides: ov }); };
  return (
    <div>
      <button className="btn-out" style={{ marginBottom: 16 }} onClick={onBack}><AgI.Back />Retour à l'équipe</button>
      <div className="card" style={{ padding: '1.25rem', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <AgUploadZone kind="photo" shape="circle" size={64} requireSquare value={member.photo} disabled={!editableIdentity} onChange={(url) => onChange({ ...member, photo: url })} />
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2, display: 'flex', gap: 7, alignItems: 'center' }}>{member.role} · {member.poste}{AgStatusBdg(member)}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <AgField label="Nom complet"><input className="fld" value={member.name} onChange={set('name')} disabled={!editableIdentity} /></AgField>
          <AgField label="Courriel"><input className="fld" value={member.email} onChange={set('email')} disabled={!editableIdentity} /></AgField>
          <AgField label="Téléphone"><input className="fld" value={member.phone} onChange={set('phone')} disabled={!editableIdentity} /></AgField>
          <AgField label="Poste"><input className="fld" value={member.poste} onChange={set('poste')} disabled={!canManage} /></AgField>
          {!canManage && <div style={{ gridColumn: '1 / -1', fontSize: '0.6875rem', color: 'var(--fg4)' }}>Rôle, poste, taux horaire et droits sont réservés à la gestion d'équipe.</div>}
          <AgField label="Rôle">{canManage ? <select className="fld" value={member.role} onChange={set('role')}>{Object.keys(AG_ROLE_DEFAULTS).map(r => <option key={r} value={r}>{r}</option>)}</select> : <div className="fld" style={{ background: 'var(--bg-muted)', color: 'var(--fg3)' }}>{member.role}</div>}</AgField>
          <AgField label="Date d'arrivée"><input className="fld" type="date" value={member.dateArrivee} onChange={set('dateArrivee')} disabled={!canManage} /></AgField>
          <AgField label="Taux horaire ($ CAD)"><input className="fld" type="number" value={member.taux} onChange={set('taux')} disabled={!canManage} /></AgField>
          <AgField label="Compte actif">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
              <AgToggle on={member.actif} disabled={!canManage || member.you} onClick={() => onChange({ ...member, actif: !member.actif })} />
              <span style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>{member.you ? 'Vous ne pouvez pas vous désactiver vous-même.' : member.actif ? 'Actif' : 'Désactivé'}</span>
            </div>
          </AgField>
        </div>
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 8 }}>Droits</div>
      <AgRightsList member={member} editable={editableRights} onToggle={toggleRight} />
    </div>
  );
};

const AgInviteDialog = ({ onClose, onSend }) => {
  const [f, setF] = agUseState({ name: '', email: '', role: 'Rédacteur', poste: '' });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }} onClick={onClose}>
      <div className="card" style={{ width: 420, maxWidth: '92vw', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800, flex: 1 }}>Inviter un membre</div>
          <button className="btn-icon" onClick={onClose}><AgI.X /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AgField label="Nom complet"><input className="fld" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></AgField>
          <AgField label="Courriel"><input className="fld" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></AgField>
          <AgField label="Rôle"><select className="fld" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{Object.keys(AG_ROLE_DEFAULTS).map(r => <option key={r} value={r}>{r}</option>)}</select></AgField>
          <AgField label="Poste"><input className="fld" value={f.poste} onChange={(e) => setF({ ...f, poste: e.target.value })} /></AgField>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn-out" onClick={onClose}>Annuler</button>
          <button className="btn-pri" disabled={!f.name || !f.email} onClick={() => onSend(f)}><AgI.Plus />Envoyer l'invitation</button>
        </div>
      </div>
    </div>
  );
};

const EquipePanel = () => {
  const [team, setTeam] = agUseState(AG_TEAM);
  const [viewerId, setViewerId] = agUseState('m1');
  const [ficheId, setFicheId] = agUseState(null);
  const [inviteOpen, setInviteOpen] = agUseState(false);
  const [bannerOn, setBannerOn] = agUseState(true);
  const viewer = team.find(m => m.id === viewerId);
  const canManage = agEffectiveRight(viewer, 'gerer_equipe');
  const updateMember = (m) => setTeam(prev => prev.map(x => x.id === m.id ? m : x));
  const activeCount = team.filter(m => m.actif && !m.invited).length;
  const pendingCount = team.filter(m => m.invited).length;

  const fiche = ficheId && team.find(m => m.id === ficheId);
  if (fiche) {
    const mine = fiche.id === viewer.id;
    return <div>
      <AgSectionHead title="Membres d'équipe" action={<select className="fld" style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} value={viewerId} onChange={(e) => { setViewerId(e.target.value); setFicheId(null); }} aria-label="Vue de démonstration">{AG_VIEWERS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>} />
      <AgFicheMembre member={fiche} mine={mine} canManage={canManage} onBack={() => setFicheId(null)} onChange={updateMember} />
    </div>;
  }

  if (viewer.firstLogin && bannerOn) {
    return <div>
      <AgSectionHead title="Membres d'équipe" action={<select className="fld" style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} value={viewerId} onChange={(e) => setViewerId(e.target.value)} aria-label="Vue de démonstration">{AG_VIEWERS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>} />
      <div className="card" style={{ padding: '1.125rem', marginBottom: 16, borderTop: '3px solid var(--green)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 800, flexShrink: 0 }}>{viewer.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Bienvenue, {viewer.name.split(' ')[0]}.</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--fg2)', marginTop: 3 }}>Votre compte est rattaché à Agence HuntPilote comme {viewer.role.toLowerCase()}. Complétez votre fiche.</div>
          <button className="btn-pri" style={{ marginTop: 10 }} onClick={() => { setBannerOn(false); setFicheId(viewer.id); }}>Compléter ma fiche</button>
        </div>
        <button className="btn-icon" onClick={() => setBannerOn(false)}><AgI.X /></button>
      </div>
    </div>;
  }

  return (
    <div>
      <AgSectionHead title="Membres d'équipe" sub={`${activeCount} membres actifs${pendingCount ? ` · ${pendingCount} invitation${pendingCount > 1 ? 's' : ''} en attente` : ''}.`} action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select className="fld" style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} value={viewerId} onChange={(e) => setViewerId(e.target.value)} aria-label="Vue de démonstration">{AG_VIEWERS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
          {canManage && <button className="btn-pri" onClick={() => setInviteOpen(true)}><AgI.Plus />Inviter un membre</button>}
        </div>} />
      {!canManage && <AgLocked reason="Votre rôle ne permet pas de gérer l'équipe. Vous pouvez consulter la liste et modifier votre propre fiche." />}
      <div className="card" style={{ padding: '0.5rem 1.125rem 0.875rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 90px', gap: '0 12px', alignItems: 'center' }}>
          {['Membre', 'Rôle', 'Statut', ''].map((h, i) => <div key={i} className="lbl" style={{ padding: '10px 0', borderBottom: '1px solid var(--bd-solid)', textAlign: i === 3 ? 'right' : 'left' }}>{h}</div>)}
          {team.map(m => {
            const isSelf = m.id === viewer.id;
            return <React.Fragment key={m.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0', borderBottom: '1px solid var(--bd)', opacity: m.actif ? 1 : 0.6 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>{m.photo ? <img src={m.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>{m.email}</div>
                </div>
              </div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid var(--bd)', fontSize: '0.75rem', color: 'var(--fg2)' }}>{m.role}</div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid var(--bd)', display: 'flex', gap: 5, flexWrap: 'wrap' }}>{AgStatusBdg(m) || <span style={{ fontSize: '0.6875rem', color: 'var(--fg4)' }}>Actif</span>}</div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'flex-end' }}>
                {(canManage || isSelf) && !m.invited && <button className="btn-out" style={{ padding: '0.25rem 0.65rem', fontSize: '0.625rem' }} onClick={() => setFicheId(m.id)}>{isSelf && !canManage ? 'Ma fiche' : 'Voir'}</button>}
              </div>
            </React.Fragment>;
          })}
        </div>
      </div>
      {inviteOpen && <AgInviteDialog onClose={() => setInviteOpen(false)} onSend={(f) => { setTeam(p => [...p, { id: 'm' + (p.length + 1), name: f.name, email: f.email, phone: '', role: f.role, poste: f.poste, dateArrivee: new Date().toISOString().slice(0, 10), taux: 0, actif: true, photo: null, initials: f.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase(), color: 'var(--blue)', overrides: {}, invited: true }]); setInviteOpen(false); }} />}
    </div>
  );
};

const StubPanel = ({ label }) => (
  <div>
    <AgSectionHead title={label} sub="Cette section arrive dans une prochaine session." />
    <EmptyInitial icon={<AgI.FileText />} title={`${label} — à venir`} text="Le cadre de l'Agence hub est en place ; le contenu de cette section sera livré lors d'une prochaine session." />
  </div>
);

Object.assign(window, { AgI, AgBdg, AgToggle, AgField, AgSectionHead, AgLocked, AgUploadZone, HubHome, ProfilPanel, EquipePanel, StubPanel });
