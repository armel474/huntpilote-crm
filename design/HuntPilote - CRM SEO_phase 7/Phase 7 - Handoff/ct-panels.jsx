/* HuntPilote — Contacts d'un client : bloc résumé (panneau gauche), liste complète et fiche contact (panneaux latéraux). */
const { useState: useCTState, useEffect: useCTEffect } = React;
const { Ico: CTIco, Badge: CTBadge, Lbl: CTLbl } = window;

const IcoX = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const CT_CH_LABEL = { email:'Courriel', phone:'Téléphone', sms:'Texto' };
const CT_ECH_TONE = { Email:'blue', Appel:'green', 'Réunion':'violet', Texto:'violet' };

/* ── Ligne compacte (panneau gauche) ── */
const ContactRow = ({ c, onClick }) => (
  <div className="ct-row" onClick={onClick} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 7px',borderRadius:8,cursor:'pointer'}}>
    <div style={{width:28,height:28,borderRadius:'50%',background:'var(--bg-3)',border:'1px solid var(--bd-1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.5625rem',fontWeight:700,color:'var(--fg-2)',flexShrink:0}}>{c.initials}</div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',gap:5}}>
        <span style={{fontSize:'0.6875rem',fontWeight:700,color:'var(--fg-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span>
        {c.principal && <CTBadge label="Principal" tone="green" sm/>}
      </div>
      <div style={{fontSize:'0.5625rem',color:'var(--fg-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.role}</div>
    </div>
    <span style={{color:'var(--fg-4)',flexShrink:0,display:'flex'}}><CTIco.ChevR/></span>
  </div>
);

/* ── Ligne détaillée (panneau « tous les contacts ») ── */
const ContactRowFull = ({ c, onClick }) => (
  <div className="ct-row" onClick={onClick} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:9,cursor:'pointer',opacity:c.status==='archive'?0.6:1}}>
    <div style={{width:32,height:32,borderRadius:'50%',background:'var(--bg-3)',border:'1px solid var(--bd-1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.625rem',fontWeight:700,color:'var(--fg-2)',flexShrink:0}}>{c.initials}</div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
        <span style={{fontSize:'0.75rem',fontWeight:700,color:'var(--fg-1)'}}>{c.name}</span>
        {c.principal && <CTBadge label="Principal" tone="green" sm/>}
        {c.status==='archive' && <CTBadge label="Archivé" tone="neutral" sm/>}
      </div>
      <div style={{fontSize:'0.625rem',color:'var(--fg-3)',marginTop:1}}>{c.role}{c.establishment?` · ${c.establishment}`:''}</div>
    </div>
    <span style={{color:'var(--fg-4)',flexShrink:0,display:'flex'}}><CTIco.ChevR/></span>
  </div>
);

/* ── Bloc « Contacts » du panneau gauche (remplace l'ancien bloc « Contact » unique) ── */
const ContactsBlock = ({ contacts, onOpen, onOpenAll, onAdd }) => {
  const active = contacts.filter(c => c.status === 'actif');
  const shown = active.slice(0, 3);
  const rest = active.length - shown.length;
  return (
    <React.Fragment>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
        <CTLbl text="Contacts" mb={0}/>
        <span onClick={onAdd} style={{display:'flex',alignItems:'center',gap:3,fontSize:'0.5625rem',fontWeight:700,color:'var(--fg-3)',cursor:'pointer'}}><CTIco.Plus/>Ajouter</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:2,marginBottom:rest>0?4:12}}>
        {shown.map(c => <ContactRow key={c.id} c={c} onClick={() => onOpen(c.id)}/>)}
      </div>
      {rest > 0 && (
        <div onClick={onOpenAll} style={{fontSize:'0.625rem',fontWeight:700,color:'var(--green-fg)',cursor:'pointer',marginBottom:12,display:'flex',alignItems:'center',gap:3,padding:'2px 7px'}}>
          Voir tous les contacts ({active.length})<CTIco.ChevR/>
        </div>
      )}
    </React.Fragment>
  );
};

/* ── Panneau latéral : tous les contacts ── */
const ContactsAllSheet = ({ contacts, onClose, onOpen, onAdd }) => {
  useCTEffect(() => { const h = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);
  const active = contacts.filter(c => c.status === 'actif');
  const archived = contacts.filter(c => c.status === 'archive');
  return (
    <React.Fragment>
      <div className="ct-scrim" onClick={onClose}></div>
      <aside className="ct-sheet" role="dialog" aria-modal="true" aria-label="Tous les contacts">
        <div className="ct-head">
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:'0.9375rem',fontWeight:800,letterSpacing:'-0.02em'}}>Contacts</div>
            <div style={{fontSize:'0.625rem',color:'var(--fg-3)',marginTop:2}}>Acme Corp. · {active.length} contact{active.length>1?'s':''} actif{active.length>1?'s':''}</div>
          </div>
          <button className="hdr-btn" onClick={onClose} aria-label="Fermer le panneau"><IcoX/></button>
        </div>
        <div className="ct-body">
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {active.map(c => <ContactRowFull key={c.id} c={c} onClick={() => onOpen(c.id)}/>)}
          </div>
          {archived.length > 0 && (
            <React.Fragment>
              <div style={{marginTop:16,marginBottom:6,fontSize:'0.5rem',fontWeight:700,color:'var(--fg-4)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Anciens contacts ({archived.length})</div>
              <div style={{display:'flex',flexDirection:'column',gap:2}}>
                {archived.map(c => <ContactRowFull key={c.id} c={c} onClick={() => onOpen(c.id)}/>)}
              </div>
            </React.Fragment>
          )}
        </div>
        <div className="ct-foot">
          <button className="act-btn primary" style={{flex:1,justifyContent:'center'}} onClick={onAdd}><CTIco.Plus/>Ajouter un contact</button>
        </div>
      </aside>
    </React.Fragment>
  );
};

/* ── Panneau latéral : fiche d'un contact (vue + création) ── */
const ContactSheet = ({ contact, isCreate, onClose, onSetPrincipal, onArchive, onUnarchive, onSave, onGoThread }) => {
  const [name, setName] = useCTState('');
  const [role, setRole] = useCTState('');
  const [email, setEmail] = useCTState('');
  const [phone, setPhone] = useCTState('');
  const [channel, setChannel] = useCTState('email');
  const [establishment, setEstablishment] = useCTState('');
  const [notes, setNotes] = useCTState('');
  useCTEffect(() => { const h = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);
  if (!isCreate && !contact) return null;

  const archived = !isCreate && contact.status === 'archive';
  const echanges = !isCreate ? (window.CT_ECHANGES[contact.id] || []) : [];
  const submit = () => { if (!name.trim()) return; onSave({ name: name.trim(), role: role.trim() || 'Contact', email: email.trim() || null, phone: phone.trim() || null, channel, establishment: establishment.trim() || null, notes: notes.trim() }); };

  return (
    <React.Fragment>
      <div className="ct-scrim" onClick={onClose}></div>
      <aside className="ct-sheet" role="dialog" aria-modal="true" aria-label={isCreate ? 'Ajouter un contact' : `Fiche de ${contact.name}`}>
        <div className="ct-head">
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:'0.9375rem',fontWeight:800,letterSpacing:'-0.02em',lineHeight:1.25,textWrap:'pretty'}}>{isCreate ? 'Ajouter un contact' : contact.name}</div>
            <div style={{fontSize:'0.625rem',color:'var(--fg-3)',marginTop:2}}>{isCreate ? 'Acme Corp.' : `${contact.role} · Acme Corp.${contact.establishment ? ` · ${contact.establishment}` : ''}`}</div>
          </div>
          <button className="hdr-btn" onClick={onClose} aria-label="Fermer le panneau"><IcoX/></button>
        </div>

        <div className="ct-body">
          {!isCreate && contact.principal && (
            <div className="ct-banner" style={{background:'var(--green-d)',border:'1px solid var(--green-b)',color:'var(--fg-2)'}}>
              <span style={{color:'var(--green-fg)',flexShrink:0,marginTop:1}}><CTIco.Check/></span>
              <div>Contact principal — reçoit le rapport mensuel et les communications par défaut, sauf précision contraire.</div>
            </div>
          )}
          {archived && (
            <div className="ct-banner yellow">
              <span style={{color:'var(--yellow-fg)',flexShrink:0,marginTop:1}}><CTIco.Warn/></span>
              <div>A quitté l’entreprise — contact archivé. Conservé pour que l’historique des échanges reste lisible.</div>
            </div>
          )}

          {isCreate ? (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><span className="ct-label">Nom complet</span><input className="ct-inp" value={name} onChange={e => setName(e.target.value)} placeholder="Ex. Sophie Tremblay"/></div>
              <div><span className="ct-label">Rôle</span><input className="ct-inp" value={role} onChange={e => setRole(e.target.value)} placeholder="Ex. Directrice marketing"/></div>
              <div><span className="ct-label">Courriel</span><input className="ct-inp" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom.nom@client.com"/></div>
              <div><span className="ct-label">Téléphone</span><input className="ct-inp" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(514) 555-0100"/></div>
              <div><span className="ct-label">Canal de communication préféré</span>
                <select className="ct-select" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option value="email">Courriel</option><option value="phone">Téléphone</option><option value="sms">Texto</option>
                </select>
              </div>
              <div><span className="ct-label">Établissement rattaché (optionnel)</span><input className="ct-inp" value={establishment} onChange={e => setEstablishment(e.target.value)} placeholder="Laisser vide pour le siège"/></div>
              <div><span className="ct-label">Notes internes</span><textarea className="ct-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Jamais visible du client…"/></div>
            </div>
          ) : (
            <React.Fragment>
              <div className="ct-sec">
                <div className="ct-sec-title"><CTLbl text="Coordonnées" mb={0}/></div>
                <div className="ct-fields">
                  <div className="ct-field"><span className="ct-field-l">Courriel</span><span className="ct-field-v">{contact.email || <span style={{color:'var(--fg-3)'}}>Non renseigné</span>}</span></div>
                  <div className="ct-field"><span className="ct-field-l">Téléphone</span><span className="ct-field-v">{contact.phone || <span style={{color:'var(--fg-3)'}}>Non renseigné</span>}</span></div>
                  <div className="ct-field"><span className="ct-field-l">Canal préféré</span><span className="ct-field-v"><CTBadge label={CT_CH_LABEL[contact.channel]} tone="blue" sm/></span></div>
                </div>
              </div>

              <div className="ct-sec">
                <div className="ct-sec-title"><CTLbl text="Notes internes · jamais visible du client" mb={0}/></div>
                {contact.notes ? <p style={{fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.6,margin:0,textWrap:'pretty'}}>{contact.notes}</p> : <div className="ct-empty">Aucune note.</div>}
              </div>

              <div className="ct-sec">
                <div className="ct-sec-title"><CTLbl text={`Derniers échanges${echanges.length ? ` · ${echanges.length}` : ''}`} mb={0}/></div>
                {echanges.length === 0 ? <div className="ct-empty">Aucun échange consigné avec ce contact.</div> : (
                  <React.Fragment>
                    {echanges.map((e, i) => (
                      <div key={i} className="ct-echange">
                        <CTBadge label={e.type} tone={CT_ECH_TONE[e.type] || 'neutral'} sm/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:'0.6875rem',fontWeight:600,color:'var(--fg-1)',lineHeight:1.35}}>{e.subject}</div>
                          <div style={{fontSize:'0.5625rem',color:'var(--fg-3)',marginTop:1}}>{e.date} · {e.state}</div>
                        </div>
                      </div>
                    ))}
                    <div onClick={onGoThread} style={{marginTop:8,fontSize:'0.625rem',fontWeight:700,color:'var(--green-fg)',cursor:'pointer',display:'flex',alignItems:'center',gap:3}}>Voir le fil complet<CTIco.ChevR/></div>
                  </React.Fragment>
                )}
              </div>
            </React.Fragment>
          )}
        </div>

        <div className="ct-foot">
          {isCreate ? (
            <React.Fragment>
              <button className="act-btn" onClick={onClose}>Annuler</button>
              <button className="act-btn primary" onClick={submit} disabled={!name.trim()}><CTIco.Check/>Ajouter le contact</button>
            </React.Fragment>
          ) : archived ? (
            <button className="act-btn" onClick={() => onUnarchive(contact.id)}>Désarchiver ce contact</button>
          ) : contact.principal ? (
            <button className="act-btn" onClick={() => onArchive(contact.id)}>Archiver ce contact</button>
          ) : (
            <React.Fragment>
              <button className="act-btn primary" onClick={() => onSetPrincipal(contact.id)}><CTIco.Check/>Marquer comme contact principal</button>
              <button className="act-btn" onClick={() => onArchive(contact.id)}>Archiver ce contact</button>
            </React.Fragment>
          )}
        </div>
      </aside>
    </React.Fragment>
  );
};

Object.assign(window, { ContactsBlock, ContactsAllSheet, ContactSheet });
