/* HuntPilote — Communications (7.2) : fil unifié tous canaux, composer, filtres, états. */
const { useState: useCMState } = React;
const { Ico, Badge, Dot, Lbl, NavIco } = window;

const ctxColor = tone => tone === 'neutral' ? 'var(--fg-3)' : `var(--${tone}-fg)`;

/* ── Fusion des données : fil agence (cm-data.jsx) + fil portail (pc-thread-data.jsx, même donnée) ── */
function cmPortalFeed(scenario) {
  const key = scenario === 'attente' ? 'attente' : scenario === 'longue' ? 'longue' : 'normal';
  const { thread } = window.peScenario(key);
  return thread.map(m => {
    const a = m.ctx ? window.peAnchor(m.ctx) : null;
    const kind = a && a.kind ? (window.CM_PE_KIND_MAP[a.kind] || 'rapport') : null;
    return {
      id: 'pe-' + m.id, channel: 'portail', contact: 'c1',
      dir: m.from === 'client' ? 'in' : 'out',
      who: m.from === 'client' ? 'Marie Tremblay' : (window.FC3_CLIENT ? window.FC3_CLIENT.pm : 'Agence'),
      day: m.day, at: m.at, ts: window.CM_PORTAL_TS[m.id] || 0,
      text: m.text, files: m.files || [],
      ctx: kind ? { kind, label: a.label } : null,
    };
  });
}

function cmBuildFeed(scenario) {
  if (scenario === 'aucun') return [];
  const agency = scenario === 'longue' ? [...window.CM_AGENCY_ENTRIES, ...window.CM_OLD_ENTRIES] : window.CM_AGENCY_ENTRIES;
  const agencyMapped = agency.map(e => ({ ...e, ctx: e.ctx ? { kind: window.cmAnchor(e.ctx).kind, label: window.cmAnchor(e.ctx).label } : null }));
  return [...agencyMapped, ...cmPortalFeed(scenario)].sort((a, b) => b.ts - a.ts);
}

function groupByMonth(rows) {
  const map = {};
  rows.forEach(r => { const k = r.day.split(' ').slice(-2).join(' '); (map[k] = map[k] || []).push(r); });
  return map;
}

/* ── Une ligne du fil ── */
const ThreadRow = ({ e, contactsById, onOpenContact }) => {
  const cfg = window.CM_CHANNELS[e.channel];
  const c = contactsById[e.contact];
  return (
    <div className={`cm-row${e._pending ? ' pending' : ''}`}>
      <Dot tone={cfg.tone === 'neutral' ? 'neutral' : cfg.tone}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap',marginBottom:2}}>
          <Badge label={cfg.label} tone={cfg.tone} sm/>
          <span className={`cm-vis ${cfg.visible ? 'visible' : 'interne'}`}>{cfg.visible ? 'Visible du client' : 'Interne'}</span>
          {e._pending && <Badge label="En attente de réponse" tone="yellow" sm/>}
          <span style={{fontSize:'0.625rem',color:'var(--fg-3)'}}>
            {e.who}{c && c.name !== e.who ? <React.Fragment> · avec <span onClick={() => onOpenContact && onOpenContact(e.contact)} style={{color:'var(--green-fg)',cursor:onOpenContact ? 'pointer' : 'default',fontWeight:600}}>{c.name}</span></React.Fragment> : null}
          </span>
          <span style={{fontSize:'0.5625rem',color:'var(--fg-4)',marginLeft:'auto',whiteSpace:'nowrap'}}>{e.day} · {e.at}</span>
        </div>
        <p style={{fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.55,margin:0,textWrap:'pretty'}}>{e.text}</p>
        {e.ctx && <div className="cm-ctx"><b style={{color:ctxColor(window.CM_CTX_KINDS[e.ctx.kind].tone)}}>{window.CM_CTX_KINDS[e.ctx.kind].label}</b><span>{e.ctx.label}</span></div>}
        {e.files && e.files.length > 0 && <div>{e.files.map((f, i) => <span key={i} className="cm-file"><Ico.Doc/>{f.name}</span>)}</div>}
      </div>
    </div>
  );
};

/* ── Composer ── */
const Composer = ({ contacts, onAdd }) => {
  const [contact, setContact] = useCMState(contacts[0] ? contacts[0].id : '');
  const [channel, setChannel] = useCMState('courriel');
  const [ctx, setCtx] = useCMState('x0');
  const [text, setText] = useCMState('');
  const [files, setFiles] = useCMState([]);
  const [confirming, setConfirming] = useCMState(false);
  const cfg = window.CM_CHANNELS[channel];
  const contactObj = contacts.find(c => c.id === contact);
  const addFile = () => setFiles(f => [...f, { name:`Document-${f.length + 1}.pdf`, size:'280 Ko' }]);
  const reset = () => { setText(''); setFiles([]); setCtx('x0'); setConfirming(false); };
  const send = () => {
    if (!text.trim() || !cfg.connected) return;
    if (cfg.visible && !confirming) { setConfirming(true); return; }
    onAdd({ id:'u' + Date.now(), channel, contact, dir:'out', who:'Vous', day:'Aujourd’hui', at:'à l’instant', ts:99999999.99,
      text:text.trim(), files, ctx: ctx !== 'x0' ? { kind:window.cmAnchor(ctx).kind, label:window.cmAnchor(ctx).label } : null });
    reset();
  };
  return (
    <div className="cm-composer">
      <Lbl text="Nouveau message" mb={2}/>
      <div className="cm-frow">
        <div><span className="cm-flabel">Avec</span>
          <select className="cm-select" value={contact} onChange={e => { setContact(e.target.value); setConfirming(false); }}>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}
          </select>
        </div>
        <div><span className="cm-flabel">Canal</span>
          <select className="cm-select" value={channel} onChange={e => { setChannel(e.target.value); setConfirming(false); }}>
            <optgroup label="Visible du client">{Object.entries(window.CM_CHANNELS).filter(([, c]) => c.visible).map(([k, c]) => <option key={k} value={k}>{c.label}{!c.connected ? ' (non connecté)' : ''}</option>)}</optgroup>
            <optgroup label="Interne — jamais visible du client">{Object.entries(window.CM_CHANNELS).filter(([, c]) => !c.visible).map(([k, c]) => <option key={k} value={k}>{c.label}{!c.connected ? ' (non connecté)' : ''}</option>)}</optgroup>
          </select>
        </div>
        <div><span className="cm-flabel">Rattaché à</span>
          <select className="cm-select" value={ctx} onChange={e => setCtx(e.target.value)}>
            {window.CM_ANCHORS.map(a => <option key={a.id} value={a.id}>{a.kind ? `${window.CM_CTX_KINDS[a.kind].label} — ${a.label}` : a.label}</option>)}
          </select>
        </div>
      </div>

      {!cfg.connected && <div className="cm-warn"><Ico.Warn/><span>{cfg.label} n’est pas encore connecté à HuntPilote — le message ne pourra pas partir. <a href="Parametres.html?section=integrations">Connecter dans Paramètres →</a></span></div>}

      <textarea className="cm-textarea" value={text} onChange={e => { setText(e.target.value); setConfirming(false); }} placeholder={cfg.visible ? 'Votre message — visible par le contact choisi.' : 'Note interne — jamais visible du client.'}></textarea>

      {files.length > 0 && <div>{files.map((f, i) => <span key={i} className="cm-file"><Ico.Doc/>{f.name}</span>)}</div>}

      {confirming ? (
        <div className="cm-confirm">
          <Ico.Warn/>
          <span style={{flex:'1 1 200px',fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.5}}>Ce message sera <b>visible par {contactObj ? contactObj.name : 'ce contact'}</b> sur {cfg.label}. Confirmer l’envoi ?</span>
          <button className="act-btn" onClick={() => setConfirming(false)}>Annuler</button>
          <button className="act-btn primary" onClick={send}><Ico.Check/>Confirmer l’envoi</button>
        </div>
      ) : (
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <button className="act-btn primary" disabled={!text.trim() || !cfg.connected} onClick={send}><Ico.Send/>{cfg.visible ? 'Envoyer' : 'Consigner'}</button>
          <button className="act-btn" onClick={addFile}><Ico.Plus/>Joindre un fichier</button>
          {cfg.visible && <span style={{fontSize:'0.5625rem',color:'var(--fg-4)',flex:'1 1 140px'}}>Une confirmation sera demandée avant l’envoi.</span>}
        </div>
      )}
    </div>
  );
};

/* ── Panneau principal ── */
const PanelCommunications = ({ contacts, onOpenContact }) => {
  const [scenario, setScenario] = useCMState(() => { try { return localStorage.getItem('hp-cm-scenario') || 'normal'; } catch { return 'normal'; } });
  const [included, setIncluded] = useCMState(() => Object.keys(window.CM_CHANNELS));
  const [contactFilter, setContactFilter] = useCMState('tous');
  const [period, setPeriod] = useCMState('tout');
  const [extra, setExtra] = useCMState([]);

  const updateScenario = s => { setScenario(s); try { localStorage.setItem('hp-cm-scenario', s); } catch {} setExtra([]); };
  const toggleChannel = ch => setIncluded(inc => inc.includes(ch) ? inc.filter(x => x !== ch) : [...inc, ch]);
  const resetFilters = () => { setIncluded(Object.keys(window.CM_CHANNELS)); setContactFilter('tous'); setPeriod('tout'); };

  const contactsById = React.useMemo(() => Object.fromEntries(contacts.map(c => [c.id, c])), [contacts]);
  const base = React.useMemo(() => cmBuildFeed(scenario), [scenario]);
  const feed = [...extra, ...base].sort((a, b) => b.ts - a.ts);
  const pendingId = scenario === 'attente' && feed.length && feed[0].dir === 'in' ? feed[0].id : null;

  const filtered = feed.filter(e => included.includes(e.channel) && (contactFilter === 'tous' || e.contact === contactFilter) && (period === 'tout' || e.day.endsWith(period)));
  const onlyUnconnected = included.length === 1 && !window.CM_CHANNELS[included[0]].connected;
  const grouped = scenario === 'longue' && filtered.length ? groupByMonth(filtered) : null;
  const activeContacts = contacts.filter(c => c.status === 'actif');

  return (
    <div className="cm-wrap">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Communications</div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:'0.5rem',fontWeight:700,color:'var(--fg-4)',textTransform:'uppercase',letterSpacing:'0.08em'}}>État</span>
          <select className="cm-sel" value={scenario} onChange={e => updateScenario(e.target.value)}>
            <option value="normal">Fil actif</option>
            <option value="aucun">Aucune communication</option>
            <option value="attente">Message client en attente</option>
            <option value="longue">Long historique</option>
          </select>
        </div>
      </div>

      <Composer contacts={activeContacts} onAdd={m => setExtra(x => [m, ...x])}/>

      {scenario !== 'aucun' && (
        <div className="cm-toolbar">
          {Object.entries(window.CM_CHANNELS).map(([key, cfg]) => (
            <span key={key} className={`cm-chip${included.includes(key) ? ' on' : ''}`} onClick={() => toggleChannel(key)}>
              <span className="dot" style={{background: cfg.tone === 'neutral' ? 'var(--fg-4)' : `var(--${cfg.tone})`}}></span>{cfg.label}
            </span>
          ))}
          <select className="cm-sel" value={contactFilter} onChange={e => setContactFilter(e.target.value)}>
            <option value="tous">Tous les contacts</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="cm-seg">
            {[['tout','Tout'],['2026','2026'],['2025','2025']].map(([v, l]) => (
              <button key={v} className={period === v ? 'on' : ''} onClick={() => setPeriod(v)}>{l}</button>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{padding: (scenario === 'aucun' || filtered.length === 0) ? '0' : '4px 14px 8px'}}>
        {scenario === 'aucun' ? (
          <div className="cm-empty">
            <div style={{fontSize:'0.8125rem',fontWeight:700,color:'var(--fg-1)'}}>Aucune communication pour l’instant</div>
            <div style={{fontSize:'0.6875rem',maxWidth:320,lineHeight:1.5}}>Client tout juste signé — le fil se remplira au fil des échanges, tous canaux confondus, dès le premier message.</div>
          </div>
        ) : onlyUnconnected && filtered.length === 0 ? (
          <div className="cm-empty">
            <Ico.Warn/>
            <div style={{fontSize:'0.8125rem',fontWeight:700,color:'var(--fg-1)'}}>{window.CM_CHANNELS[included[0]].label} n’est pas connecté</div>
            <div style={{fontSize:'0.6875rem',maxWidth:320,lineHeight:1.5}}>Connectez ce canal pour voir apparaître les échanges ici.</div>
            <a href="Parametres.html?section=integrations" className="act-btn primary" style={{textDecoration:'none',marginTop:4}}>Connecter dans Paramètres</a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty">
            <NavIco.Search/>
            <div style={{fontSize:'0.8125rem',fontWeight:700,color:'var(--fg-1)'}}>Aucun résultat pour ces filtres</div>
            <button className="act-btn" onClick={resetFilters}>Réinitialiser les filtres</button>
          </div>
        ) : grouped ? (
          Object.entries(grouped).map(([month, rows]) => (
            <React.Fragment key={month}>
              <div className="cm-month">{month}</div>
              {rows.map(e => <ThreadRow key={e.id} e={{ ...e, _pending: e.id === pendingId }} contactsById={contactsById} onOpenContact={onOpenContact}/>)}
            </React.Fragment>
          ))
        ) : (
          filtered.map(e => <ThreadRow key={e.id} e={{ ...e, _pending: e.id === pendingId }} contactsById={contactsById} onOpenContact={onOpenContact}/>)
        )}
      </div>
    </div>
  );
};

Object.assign(window, { PanelCommunications });
