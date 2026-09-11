/* HuntPilote — Devis à un client déjà signé (7.3) : liste, document et versions. */
const { useState: useQTState } = React;
const { Ico: QIco, Badge, Dot, Lbl: QLbl } = window;

const IcoPencil = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>;
const IcoX2 = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoClock = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>;
const QT_ICON = { brouillon: IcoPencil, envoye: QIco.Send, accepte: QIco.Check, refuse: IcoX2, expire: IcoClock };

const fmtMoney = n => n.toLocaleString('fr-CA', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' $';

/* ── Une ligne de la liste des devis ── */
const QuoteRow = ({ q, contactsById, onOpen }) => {
  const st = window.QT_STATUTS[q.statut];
  const StIco = QT_ICON[q.statut];
  const c = contactsById[q.contact];
  const sub = window.qtSubtotal(q);
  return (
    <div onClick={() => onOpen(q.id)} style={{display:'grid',gridTemplateColumns:'110px 1fr 100px 100px 130px 100px',gap:'0 12px',alignItems:'center',cursor:'pointer'}} className="ct-row">
      <div style={{padding:'10px 0',fontSize:'0.6875rem',fontWeight:700,color:'var(--fg-1)',fontVariantNumeric:'tabular-nums'}}>{q.id}</div>
      <div style={{padding:'10px 0',minWidth:0}}>
        <div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--fg-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.objet}</div>
        {c && <div style={{fontSize:'0.5625rem',color:'var(--fg-3)',marginTop:1}}>{c.name}</div>}
      </div>
      <div style={{padding:'10px 0',fontSize:'0.75rem',fontWeight:700,color:'var(--fg-1)',fontVariantNumeric:'tabular-nums'}}>{fmtMoney(sub)}</div>
      <div style={{padding:'10px 0',fontSize:'0.625rem',color:'var(--fg-3)'}}>{q.emis || '—'}</div>
      <div style={{padding:'10px 0'}}><Badge label={<span style={{display:'inline-flex',alignItems:'center',gap:4}}><StIco/>{st.label}</span>} tone={st.tone} sm/></div>
      <div style={{padding:'10px 0',fontSize:'0.625rem',color:'var(--fg-3)'}}>{q.expire || '—'}</div>
    </div>
  );
};

/* ── Formulaire : nouveau devis ou correction d'un brouillon ── */
const QuoteForm = ({ contacts, initial, onCancel, onSave }) => {
  const [objet, setObjet] = useQTState(initial ? initial.objet : '');
  const [contact, setContact] = useQTState(initial ? initial.contact : (contacts[0] ? contacts[0].id : ''));
  const [lignes, setLignes] = useQTState(initial ? initial.lignes.map(l => ({ ...l })) : [{ desc:'', qte:1, prix:0 }]);
  const [conditions, setConditions] = useQTState(initial ? initial.conditions : '50 % à la commande, 50 % à la livraison. Offre valide 30 jours à partir de l’envoi.');
  const [expire, setExpire] = useQTState(initial ? initial.expire || '' : '');

  const setLigne = (i, field, val) => setLignes(ls => ls.map((l, j) => j === i ? { ...l, [field]: val } : l));
  const addLigne = () => setLignes(ls => [...ls, { desc:'', qte:1, prix:0 }]);
  const removeLigne = i => setLignes(ls => ls.filter((_, j) => j !== i));
  const sub = lignes.reduce((s, l) => s + (Number(l.qte) || 0) * (Number(l.prix) || 0), 0);
  const valid = objet.trim() && contact && lignes.some(l => l.desc.trim() && l.prix > 0);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div><span className="ct-label">Objet du devis</span><input className="ct-inp" value={objet} onChange={e => setObjet(e.target.value)} placeholder="Ex. Ajout d’une seconde langue au site"/></div>
      <div><span className="ct-label">Destinataire</span>
        <select className="ct-select" value={contact} onChange={e => setContact(e.target.value)}>
          {contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}
        </select>
      </div>
      <div>
        <span className="ct-label">Lignes de service</span>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {lignes.map((l, i) => (
            <div key={i} style={{display:'flex',gap:6,alignItems:'center'}}>
              <input className="ct-inp" style={{flex:'1 1 auto'}} value={l.desc} onChange={e => setLigne(i, 'desc', e.target.value)} placeholder="Description du service"/>
              <input className="ct-inp" style={{flex:'0 0 54px'}} type="number" min="1" value={l.qte} onChange={e => setLigne(i, 'qte', e.target.value)} title="Quantité"/>
              <input className="ct-inp" style={{flex:'0 0 90px'}} type="number" min="0" step="0.01" value={l.prix} onChange={e => setLigne(i, 'prix', e.target.value)} title="Prix unitaire ($)"/>
              <button className="act-btn" style={{padding:'6px 8px'}} onClick={() => removeLigne(i)} disabled={lignes.length === 1} aria-label="Retirer la ligne"><IcoX2/></button>
            </div>
          ))}
        </div>
        <button className="act-btn" style={{marginTop:8}} onClick={addLigne}><QIco.Plus/>Ajouter une ligne</button>
        <div style={{marginTop:8,fontSize:'0.6875rem',color:'var(--fg-3)'}}>Sous-total : <b style={{color:'var(--fg-1)'}}>{fmtMoney(sub)}</b> — taxes calculées automatiquement sur le document.</div>
      </div>
      <div><span className="ct-label">Date d’expiration de l’offre (optionnel)</span><input className="ct-inp" value={expire} onChange={e => setExpire(e.target.value)} placeholder="Ex. 28 mai 2026"/></div>
      <div><span className="ct-label">Conditions</span><textarea className="ct-textarea" value={conditions} onChange={e => setConditions(e.target.value)}></textarea></div>
      <div style={{display:'flex',gap:8}}>
        <button className="act-btn" onClick={onCancel}>Annuler</button>
        <button className="act-btn primary" disabled={!valid} onClick={() => onSave({ objet:objet.trim(), contact, lignes:lignes.filter(l => l.desc.trim() && l.prix > 0).map(l => ({ desc:l.desc.trim(), qte:Number(l.qte) || 1, prix:Number(l.prix) || 0 })), conditions:conditions.trim(), expire:expire.trim() || null })}><QIco.Check/>Enregistrer le brouillon</button>
      </div>
    </div>
  );
};

/* ── Le document lui-même (.qt-doc — même langage visuel que .client-doc, toujours blanc) ── */
const QuoteDoc = ({ q, contact }) => {
  const sub = window.qtSubtotal(q);
  const { tps, tvq, total } = window.qtTaxes(sub);
  return (
    <div className="qt-doc">
      <div className="qt-doc-head">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:10}}>
            <span style={{width:24,height:24,background:'#16A34A',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></span>
            <span style={{fontSize:'0.9375rem',fontWeight:800,letterSpacing:'-0.02em'}}>HuntPilote</span>
          </div>
          <div className="qt-doc-lbl">Devis</div>
          <div style={{fontSize:'1.125rem',fontWeight:800,letterSpacing:'-0.02em',textWrap:'pretty'}}>{q.objet}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div className="qt-doc-lbl">Numéro</div><div className="qt-doc-val" style={{marginBottom:8}}>{q.id}</div>
          <div className="qt-doc-lbl">Émis le</div><div className="qt-doc-val" style={{marginBottom:8}}>{q.emis || 'Non émis'}</div>
          <div className="qt-doc-lbl">Expire le</div><div className="qt-doc-val">{q.expire || '—'}</div>
        </div>
      </div>
      <div className="qt-doc-sec">
        <div className="qt-doc-lbl">Client</div>
        <div style={{fontSize:'0.8125rem',fontWeight:700}}>Acme Corp.</div>
        <div style={{fontSize:'0.75rem',color:'#3F3F46',marginTop:2}}>À l’attention de {contact ? `${contact.name} · ${contact.role}` : 'contact non renseigné'}</div>
      </div>
      <div className="qt-doc-sec">
        <div className="qt-line qt-line-h"><span>Description</span><span>Qté</span><span>Prix</span><span>Montant</span></div>
        {q.lignes.map((l, i) => (
          <div key={i} className="qt-line">
            <span>{l.desc}</span><span>{l.qte}</span><span>{fmtMoney(l.prix)}</span><span style={{fontWeight:700}}>{fmtMoney(l.qte * l.prix)}</span>
          </div>
        ))}
        <div style={{marginTop:12}}>
          <div className="qt-tot-row"><span>Sous-total</span><span>{fmtMoney(sub)}</span></div>
          <div className="qt-tot-row"><span>TPS (5 %)</span><span>{fmtMoney(tps)}</span></div>
          <div className="qt-tot-row"><span>TVQ (9,975 %)</span><span>{fmtMoney(tvq)}</span></div>
          <div className="qt-tot-row grand"><span>Total</span><span>{fmtMoney(total)}</span></div>
        </div>
      </div>
      <div className="qt-doc-sec">
        <div className="qt-doc-lbl">Conditions</div>
        <p style={{fontSize:'0.75rem',color:'#3F3F46',lineHeight:1.6,margin:0,textWrap:'pretty'}}>{q.conditions}</p>
      </div>
    </div>
  );
};

/* ── Panneau latéral : détail d'un devis ── */
const QuoteSheet = ({ quote, contacts, onClose, onSend, onNewVersion, onGoThread, onGoContract }) => {
  const [confirming, setConfirming] = useQTState(false);
  if (!quote) return null;
  const contact = contacts.find(c => c.id === quote.contact);
  const st = window.QT_STATUTS[quote.statut];
  const StIco = QT_ICON[quote.statut];

  return (
    <React.Fragment>
      <div className="qt-scrim" onClick={onClose}></div>
      <aside className="qt-sheet" role="dialog" aria-modal="true" aria-label={`Devis ${quote.id}`}>
        <div className="qt-head">
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:3}}>
              <span style={{fontSize:'0.9375rem',fontWeight:800,letterSpacing:'-0.02em'}}>{quote.id}</span>
              <Badge label={<span style={{display:'inline-flex',alignItems:'center',gap:4}}><StIco/>{st.label}</span>} tone={st.tone} sm/>
            </div>
            <div style={{fontSize:'0.625rem',color:'var(--fg-3)'}}>{quote.objet}</div>
          </div>
          <button className="hdr-btn" onClick={onClose} aria-label="Fermer le panneau"><IcoX2/></button>
        </div>

        <div className="qt-body">
          {quote.statut === 'accepte' && quote.contratRef && (
            <div className="ct-banner" style={{background:'var(--green-d)',border:'1px solid var(--green-b)',color:'var(--fg-2)'}}>
              <span style={{color:'var(--green-fg)',flexShrink:0,marginTop:1}}><QIco.Check/></span>
              <div>Accepté — <b>{quote.contratRef}</b>. Visible dans le plan actif ci-dessus.</div>
            </div>
          )}
          {quote.statut === 'refuse' && (
            <div className="ct-banner" style={{background:'var(--bg-3)',border:'1px solid var(--bd-1)',color:'var(--fg-2)'}}>
              <span style={{color:'var(--fg-3)',flexShrink:0,marginTop:1}}><IcoX2/></span>
              <div>Refusé{quote.motifRefus ? ` — ${quote.motifRefus}` : ', sans motif consigné.'}</div>
            </div>
          )}
          {quote.statut === 'expire' && (
            <div className="ct-banner yellow">
              <span style={{color:'var(--yellow-fg)',flexShrink:0,marginTop:1}}><IcoClock/></span>
              <div>Expiré sans réponse le {quote.expire}. Dupliquez son contenu pour émettre un nouveau devis si l’offre tient toujours.</div>
            </div>
          )}
          {quote.statut === 'envoye' && (
            <div className="ct-banner" style={{background:'var(--blue-d)',border:'1px solid var(--blue-b)',color:'var(--fg-2)'}}>
              <span style={{color:'var(--blue-fg)',flexShrink:0,marginTop:1}}><QIco.Send/></span>
              <div>En attente de réponse du client — envoyé le {quote.emis}, expire le {quote.expire || '—'}. Document verrouillé : une correction crée une nouvelle version.</div>
            </div>
          )}

          <QuoteDoc q={quote} contact={contact}/>

          <div className="ct-sec" style={{marginTop:16}}>
            <div className="ct-sec-title"><QLbl text={`Versions${quote.versions.length ? ` · ${quote.versions.length}` : ''}`} mb={0}/></div>
            {quote.versions.length === 0 ? <div className="ct-empty">Pas encore envoyé — aucune version n’existe.</div> : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[...quote.versions].reverse().map((v, i) => (
                  <div key={v.v} style={{display:'flex',gap:9,alignItems:'flex-start'}}>
                    <Dot tone={i === 0 ? 'green' : 'neutral'}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',gap:6,alignItems:'baseline',flexWrap:'wrap'}}>
                        <span style={{fontSize:'0.6875rem',fontWeight:700}}>Version {v.v}</span>
                        <span style={{fontSize:'0.5625rem',color:'var(--fg-3)'}}>{v.at} · {v.who}</span>
                      </div>
                      <div style={{fontSize:'0.625rem',color:'var(--fg-2)',marginTop:1,lineHeight:1.4}}>{v.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="qt-foot">
          {quote.statut === 'brouillon' && (
            confirming ? (
              <React.Fragment>
                <span style={{flex:'1 1 200px',fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.5}}>Envoyer à <b>{contact ? contact.name : 'ce contact'}</b> ? Le document sera verrouillé — une correction créera une nouvelle version.</span>
                <button className="act-btn" onClick={() => setConfirming(false)}>Annuler</button>
                <button className="act-btn primary" onClick={() => { onSend(quote.id); setConfirming(false); }}><QIco.Check/>Confirmer l’envoi</button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <button className="act-btn primary" onClick={() => setConfirming(true)}><QIco.Send/>Envoyer au client</button>
                <span style={{fontSize:'0.5625rem',color:'var(--fg-4)',flex:'1 1 140px'}}>Par courriel, ou déposé dans le fil de communications.</span>
              </React.Fragment>
            )
          )}
          {quote.statut === 'envoye' && (
            <React.Fragment>
              <button className="act-btn" onClick={() => onGoThread && onGoThread(quote.contact)}><QIco.Send/>Relancer via le fil de communications</button>
              <button className="act-btn" onClick={() => onNewVersion(quote.id)}><IcoPencil/>Corriger — créer une nouvelle version</button>
            </React.Fragment>
          )}
          {quote.statut === 'accepte' && <button className="act-btn" onClick={onGoContract}><QIco.Eye/>Voir le plan actif</button>}
        </div>
      </aside>
    </React.Fragment>
  );
};

/* ── Section « Devis » de l'onglet Contrat & facturation ── */
const QuotesSection = ({ contacts, quotes, onOpen, onNew }) => {
  const contactsById = React.useMemo(() => Object.fromEntries(contacts.map(c => [c.id, c])), [contacts]);
  return (
    <div className="card" style={{padding:'14px 16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div>
          <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Devis</div>
          <div style={{fontSize:'0.5625rem',color:'var(--fg-4)',marginTop:1}}>Services additionnels, avenants et renouvellements à ce client déjà signé.</div>
        </div>
        <button className="act-btn primary" onClick={onNew}><QIco.Plus/>Nouveau devis</button>
      </div>
      {quotes.length === 0 ? <div className="ct-empty">Aucun devis émis pour l’instant.</div> : (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'110px 1fr 100px 100px 130px 100px',gap:'0 12px'}}>
            {['Numéro','Objet','Montant','Émis le','Statut','Expire le'].map(h => <div key={h} style={{fontSize:'0.5rem',fontWeight:700,color:'var(--fg-4)',textTransform:'uppercase',letterSpacing:'0.1em',paddingBottom:7,borderBottom:'1px solid var(--bd-1)'}}>{h}</div>)}
          </div>
          <div style={{display:'flex',flexDirection:'column'}}>
            {quotes.map(q => <QuoteRow key={q.id} q={q} contactsById={contactsById} onOpen={onOpen}/>)}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { QuoteRow, QuoteForm, QuoteDoc, QuoteSheet, QuotesSection, IcoX2, IcoPencil, IcoClock });
