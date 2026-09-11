/* HuntPilote FC4 — panels mixing V2 content into V3 shell. Overrides LeftPanel, RightPanel, PanelApercu, PanelReports. */
const { useState: useV4State } = React;
const { Ico, Badge, Dot, Gauge, Spark, Lbl, FC3_CLIENT: C4, FC3_KPIS, FC3_PRIORITIES, FC3_TASKS, FC3_PROOFS, FC3_COMPETITORS, FC3_MY, FC3_ACTIVITY, FC3_SPARK, ContactsBlock } = window;
const FC3PanelApercu = window.PanelApercu;

/* ── DATA (from V2) ── */
const V4_AI_POS = ['Croissance de 12 nouvelles positions top 10 ce mois-ci','CTR en hausse (+0,3 pt) grâce aux optimisations récentes','Profil backlink sain — 3 280 liens actifs (DR moyen 58)'];
const V4_AI_NEG = ['Vitesse mobile insuffisante — LCP à 4,2 s (objectif : < 2,5 s)','23 liens brisés détectés impactant le budget de crawl','4 pages avec duplication de contenu (risque de cannibalisation)'];
const V4_LEVELS = [
  {id:'critique',label:'Critique',count:3,color:'var(--red)',bg:'var(--red-d)',bd:'var(--red-b)',items:['Corriger les 23 liens brisés et rediriger les 404','Améliorer la vitesse mobile — LCP 4,2 s → objectif < 2,5 s','Résoudre les erreurs 404 sur 8 pages stratégiques']},
  {id:'important',label:'Important',count:5,color:'var(--yellow)',bg:'var(--yellow-d)',bd:'var(--yellow-b)',items:['Optimiser les balises title sur 12 pages clés','Corriger les 5 pages sans balise H1','Ajouter les attributs alt sur 34 images','Résoudre la duplication de contenu (4 pages)','Améliorer le maillage interne (23 pages orphelines)']},
  {id:'opportunite',label:'Opportunité',count:8,color:'var(--green)',bg:'var(--green-d)',bd:'var(--green-b)',items:['Cibler 45 mots-clés de longue traîne identifiés','Optimiser 12 requêtes pour les featured snippets','Créer 3 pages de service manquantes','Améliorer la structure FAQ sur 6 pages','Lancer une campagne de link building ciblée','Améliorer le balisage Schema.org sur le catalogue']}];
const V4_TECH = [{label:'Vitesse',score:56},{label:'On-page',score:85},{label:'Backlinks',score:71},{label:'SEO Tech.',score:100}];
const V4_SECTIONS = [
  {name:'Synthèse exécutive',desc:'Résumé IA du mois',on:true},{name:'Trafic organique',desc:'Sessions & évolution',on:true},
  {name:'Positions clés',desc:'Top mots-clés & mouvements',on:true},{name:'Santé technique',desc:'Core Web Vitals, audits',on:true},
  {name:'Backlinks',desc:'Nouveaux liens & profil',on:true},{name:'Prochaines actions',desc:'Recommandations priorisées',on:false}];
const V4_REPORTS = [
  {period:'Avril 2026',date:'2 mai 2026',score:87,pages:8},{period:'Mars 2026',date:'3 avr. 2026',score:82,pages:8},
  {period:'Février 2026',date:'2 mars 2026',score:79,pages:7},{period:'Janvier 2026',date:'4 fév. 2026',score:74,pages:7}];

/* ── SHARED STYLES ── */
const c4 = {background:'var(--bg-2)',border:'1px solid var(--bd)',borderRadius:10,boxShadow:'var(--shadow)'};
const b4Out = {display:'inline-flex',alignItems:'center',gap:5,padding:'4px 11px',borderRadius:6,background:'var(--bg-3)',border:'1px solid var(--bd-1)',color:'var(--fg-2)',fontSize:'0.625rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:600,whiteSpace:'nowrap'};
const b4Green = {display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:6,background:'var(--green-d)',border:'1px solid var(--green-b)',color:'var(--green-fg)',fontSize:'0.6875rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:700,whiteSpace:'nowrap'};
const b4Pri = {display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 14px',borderRadius:8,background:'var(--fg-1)',border:'none',color:'var(--bg-0)',fontSize:'0.75rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:700,whiteSpace:'nowrap'};
const b4Icon = {width:26,height:26,borderRadius:'50%',background:'var(--bg-3)',border:'1px solid var(--bd-1)',color:'var(--fg-3)',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0};
const rule = <div style={{borderTop:'1px solid var(--bd)',margin:'12px 0'}}></div>;

/* ── LEFT PANEL (V3 shell + V2 context, score, audit CTA) ── */
const LeftPanel = ({ uxState, setTab, contacts, onOpenContact, onOpenAllContacts, onAddContact }) => {
  const tone = {active:'green',onboarding:'blue',nodata:'yellow',audit:'blue',stale:'yellow',nocritical:'green',error:'yellow'}[uxState]||'green';
  const label = {active:'Actif',onboarding:'Onboarding',nodata:'Sans intégrations',audit:'Audit en cours',stale:'Données obsolètes',nocritical:'Actif',error:'Erreur partielle'}[uxState]||'Actif';
  const blank = uxState==='onboarding'||uxState==='nodata';
  return (
    <div style={{width:'var(--left-w)',flexShrink:0,borderRight:'1px solid var(--bd)',background:'var(--bg-1)',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'18px 14px 14px'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,paddingBottom:14,borderBottom:'1px solid var(--bd)',marginBottom:14}}>
          <div style={{width:56,height:56,borderRadius:14,background:'var(--green-d)',border:'1.5px solid var(--green-b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.125rem',fontWeight:800,color:'var(--green-fg)',letterSpacing:'-0.03em'}}>{C4.initials}</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'1rem',fontWeight:800,letterSpacing:'-0.025em',color:'var(--fg-1)'}}>{C4.name}</div>
            <div style={{fontSize:'0.75rem',color:'var(--fg-3)',marginTop:2}}>{C4.sector}</div>
            <div style={{display:'flex',gap:5,justifyContent:'center',marginTop:7}}><Badge label={label} tone={tone} sm/><Badge label="Client" tone="neutral" sm/></div>
          </div>
        </div>
        <ContactsBlock contacts={contacts} onOpen={onOpenContact} onOpenAll={onOpenAllContacts} onAdd={onAddContact}/>
        {rule}
        <Lbl text="Services actifs"/>
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>{C4.services.map(s=><Badge key={s} label={s} tone="neutral" sm/>)}</div>
        <div style={{...c4,padding:'11px 12px',marginBottom:10}}>
          <Lbl text="Contexte & Objectif"/>
          <p style={{fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.6,margin:0,textWrap:'pretty'}}>{blank?'Aucun objectif défini. Lancez un audit pour générer le contexte initial.':'Doubler le trafic organique d\'ici Q4 2026. Priorité au positionnement top 3 sur les requêtes transactionnelles.'}</p>
          {!blank&&<div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:4}}>{['Trafic ×2','Top 3 KW','CTR +50 %'].map(t=><Badge key={t} label={t} tone="green" sm/>)}</div>}
        </div>
        <div style={{...c4,padding:'11px 12px 12px',display:'flex',flexDirection:'column',alignItems:'center',gap:4,marginBottom:12}}>
          <Lbl text="Score santé SEO"/>
          {blank?<div style={{width:76,height:76,borderRadius:'50%',border:'6px solid var(--bg-3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:800,color:'var(--fg-4)'}}>—</div>:<Gauge value={uxState==='nocritical'?96:C4.score} size={76}/>}
          <div style={{fontSize:'0.5625rem',color:'var(--fg-3)'}}>{blank?'En attente du premier audit':'Excellent · +5 pts vs mars'}</div>
        </div>
        {[[Ico.User,'Chef de projet',C4.pm],[Ico.Cal,'Client depuis',C4.since],[Ico.Zap,'Dernier audit',blank?'Aucun':C4.lastAudit]].map(([Icon,l,v],i)=>(
          <div key={i} style={{display:'flex',gap:7,marginBottom:9,alignItems:'flex-start'}}>
            <span style={{color:'var(--fg-4)',flexShrink:0,marginTop:2}}><Icon/></span>
            <div><Lbl text={l} mb={2}/><div style={{fontSize:'0.6875rem',color:'var(--fg-1)',fontWeight:600}}>{v}</div></div>
          </div>))}
      </div>
      <div style={{padding:'10px 14px 14px',borderTop:'1px solid var(--bd)',background:'var(--bg-1)'}}>
        <button style={{...b4Pri,width:'100%'}} onClick={()=>setTab&&setTab('diag')}><Ico.Zap/>Lancer un audit</button>
      </div>
    </div>
  );
};

/* ── RIGHT PANEL (V3 shell + V2 modules inclus & competitor self-bar) ── */
const RightPanel = ({ setTab }) => {
  const max = Math.max(...FC3_COMPETITORS.map(c=>c.sessions),FC3_MY)*1.2;
  return (
    <div style={{width:'var(--right-w)',flexShrink:0,borderLeft:'1px solid var(--bd)',background:'var(--bg-1)',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'16px 14px 20px'}}>
        <Lbl text="Prochaine action"/>
        <div style={{...c4,padding:'11px 12px',marginBottom:14}}>
          <div style={{fontSize:'0.5625rem',fontWeight:700,color:'var(--yellow-fg)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>Rapport mensuel · 2 juin</div>
          <div style={{fontSize:'0.75rem',fontWeight:700,color:'var(--fg-1)',marginBottom:3}}>Générer le rapport client</div>
          <div style={{fontSize:'0.5625rem',color:'var(--fg-3)',lineHeight:1.4,marginBottom:8}}>Dernier : 2 mai · 8 sections · Envoyé</div>
          <button style={b4Green} onClick={()=>setTab&&setTab('reports')}><Ico.Doc/>Générer le rapport</button>
        </div>
        {rule}
        <Lbl text="Modules inclus"/>
        {['SEO Tech.','Contenu','Audit','Backlinks'].map(m=>(
          <div key={m} style={{display:'flex',alignItems:'center',gap:7,marginBottom:7,fontSize:'0.6875rem',color:'var(--fg-2)'}}><span style={{color:'var(--green)'}}><Ico.Check/></span>{m}</div>))}
        <div style={{display:'flex',alignItems:'center',gap:7,marginTop:4,fontSize:'0.6875rem',color:'var(--fg-4)',cursor:'pointer'}}><Ico.Plus/>Ajouter un module</div>
        {rule}
        <Lbl text="Concurrence"/>
        <div style={{marginBottom:11}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:'0.6875rem',fontWeight:700,color:'var(--green-fg)'}}>{C4.name} <span style={{fontSize:'0.5625rem',fontWeight:600}}>(vous)</span></span>
            <span style={{fontSize:'0.5625rem',fontWeight:700,color:'var(--green)'}}>{(FC3_MY/1000).toFixed(1)}k/mois</span>
          </div>
          <div style={{height:5,background:'var(--bg-3)',borderRadius:999,overflow:'hidden'}}><div style={{height:'100%',width:`${FC3_MY/max*100}%`,background:'var(--green)',borderRadius:999}}></div></div>
        </div>
        {FC3_COMPETITORS.map(c=>{
          const higher=c.sessions>FC3_MY, d=Math.abs(c.sessions-FC3_MY)/1000;
          return (
            <div key={c.name} style={{marginBottom:11}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:'0.6875rem',fontWeight:600,color:'var(--fg-1)'}}>{c.name}</span>
                <span style={{fontSize:'0.5625rem',fontWeight:700,color:higher?'var(--red)':'var(--green-fg)'}}>{(c.sessions/1000).toFixed(1)}k/mois</span>
              </div>
              <div style={{position:'relative',height:5,background:'var(--bg-3)',borderRadius:999}}>
                <div style={{height:'100%',width:`${c.sessions/max*100}%`,borderRadius:999,background:higher?'rgba(248,113,113,0.45)':'rgba(74,222,128,0.4)'}}></div>
                <div style={{position:'absolute',left:`${FC3_MY/max*100}%`,top:-1,height:7,width:2,background:'var(--green)',borderRadius:1,transform:'translateX(-50%)'}}></div>
              </div>
              <div style={{fontSize:'0.5rem',fontWeight:600,color:higher?'var(--red)':'var(--green-fg)',marginTop:2}}>{higher?'+':'−'}{d.toFixed(1)}k vs vous</div>
            </div>);})}
        <div style={{fontSize:'0.5rem',color:'var(--fg-4)',display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:2,background:'var(--green)',display:'inline-block',borderRadius:1}}></span>= votre trafic</div>
        {rule}
        <Lbl text="Activité récente"/>
        {FC3_ACTIVITY.map((a,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:10,alignItems:'flex-start'}}>
            <div style={{width:22,height:22,borderRadius:6,background:'var(--bg-3)',border:'1px solid var(--bd)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--fg-3)'}}>{a.ic==='zap'?<Ico.Zap/>:a.ic==='link'?<Ico.Link/>:a.ic==='doc'?<Ico.Doc/>:<Ico.Check/>}</div>
            <div><div style={{fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.35,fontWeight:500}}>{a.label}</div><div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>{a.date}</div></div>
          </div>))}
      </div>
    </div>
  );
};

/* ── APERÇU: V2 top cards ── */
const AIReportCard = ({ clean }) => (
  <div style={{...c4,padding:'14px 16px',flex:'0 0 58%',minWidth:0,display:'flex',flexDirection:'column',borderTop:'2px solid var(--violet)'}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
      <div style={{width:28,height:28,borderRadius:7,background:'var(--violet-d)',border:'1px solid var(--violet-b)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--violet-fg)',fontSize:13,flexShrink:0}}>✦</div>
      <div style={{flex:1}}><div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Analyse + Rapport IA</div><div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>Agent HuntPilote · analysé le 27 mai 2026</div></div>
      <Badge label="✦ IA" tone="violet" sm/>
      <button style={{...b4Out,fontSize:'0.5625rem',padding:'3px 9px'}}><Ico.Refresh/>Relancer</button>
    </div>
    <div style={{padding:'9px 11px',borderRadius:8,background:'var(--violet-d)',border:'1px solid var(--violet-b)',marginBottom:10,fontSize:'0.6875rem',lineHeight:1.65,color:'var(--fg-2)'}}>
      {clean?'Le site est en excellente santé SEO. Aucune priorité critique détectée. Les gains récents sont solides : +12 positions top 10, CTR en hausse. Moment idéal pour exploiter la longue traîne identifiée.':'Le site affiche une croissance soutenue sur les mots-clés transactionnels. La refonte du maillage interne a porté ses fruits avec +12 nouvelles positions top 10. Attention aux Core Web Vitals — la vitesse mobile reste sous les seuils recommandés (LCP 4,2 s).'}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,flex:1}}>
      {[['Ce qui va bien',V4_AI_POS,'var(--green)','var(--green-d)','var(--green-b)','var(--green-fg)'],['Ce qui va mal',clean?['Aucun point critique ce mois-ci']:V4_AI_NEG,'var(--red)','var(--red-d)','var(--red-b)','var(--fg-2)']].map(([t,items,col,bg,bd,fg])=>(
        <div key={t} style={{background:bg,border:`1px solid ${bd}`,borderRadius:9,padding:'10px 11px'}}>
          <div style={{fontSize:'0.5rem',fontWeight:700,color:col,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{t}</div>
          {items.map((it,i)=>(
            <div key={i} style={{display:'flex',gap:6,marginBottom:6,alignItems:'flex-start'}}>
              <div style={{width:16,height:16,borderRadius:5,background:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.5625rem',fontWeight:800,color:'var(--bg-0)',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:'0.6875rem',color:fg,lineHeight:1.45}}>{it}</div>
            </div>))}
        </div>))}
    </div>
  </div>
);

const NextActionsCard = ({ setTab, clean }) => {
  const [exp,setExp] = useV4State(null);
  const levels = clean ? V4_LEVELS.filter(l=>l.id!=='critique') : V4_LEVELS;
  return (
    <div style={{...c4,padding:'14px 16px',flex:'1 1 0',minWidth:0,display:'flex',flexDirection:'column'}}>
      <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:11}}>Prochaines actions</div>
      {levels.map(lv=>(
        <div key={lv.id} style={{marginBottom:6}}>
          <div onClick={()=>setExp(exp===lv.id?null:lv.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,background:lv.bg,border:`1px solid ${lv.bd}`,cursor:'pointer',userSelect:'none'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:lv.color,flexShrink:0}}></span>
            <span style={{fontSize:'0.75rem',fontWeight:700,color:lv.color,flex:1}}>{lv.label}</span>
            <span style={{fontSize:'0.5625rem',fontWeight:800,padding:'1px 7px',borderRadius:999,background:'var(--bg-1)',color:lv.color}}>{lv.count}</span>
            <span style={{color:lv.color}}>{exp===lv.id?<Ico.ChevU/>:<Ico.ChevD/>}</span>
          </div>
          {exp===lv.id&&<div style={{padding:'8px 12px 4px 24px',background:lv.bg,border:`1px solid ${lv.bd}`,borderTop:'none',borderRadius:'0 0 8px 8px',marginTop:-2}}>
            {lv.items.map((it,i)=><div key={i} style={{display:'flex',gap:6,alignItems:'flex-start',marginBottom:5}}><span style={{width:4,height:4,borderRadius:'50%',background:lv.color,flexShrink:0,marginTop:5}}></span><span style={{fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.4}}>{it}</span></div>)}
          </div>}
        </div>))}
      <div style={{marginTop:'auto',paddingTop:10,borderTop:'1px solid var(--bd)'}}>
        <button onClick={()=>setTab('seo')} style={{...b4Out,width:'100%',justifyContent:'center',padding:'7px',fontSize:'0.6875rem'}}>Voir toutes les actions <Ico.ChevR/></button>
      </div>
    </div>
  );
};

const MiniGauge = ({ score, label, size=68 }) => {
  const r=size/2-5, circ=2*Math.PI*r, col=score>=80?'var(--green)':score>=60?'var(--yellow)':'var(--red)';
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="5" strokeDasharray={`${score/100*circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:'var(--font)',fontSize:size*.265,fontWeight:800,fill:col}}>{score}</text>
      </svg>
      <span style={{fontSize:'0.625rem',fontWeight:600,color:'var(--fg-3)'}}>{label}</span>
    </div>);
};

const Banner = ({ tone, children }) => {
  const m={blue:['var(--blue-d)','var(--blue-b)','var(--blue-fg)'],yellow:['var(--yellow-d)','var(--yellow-b)','var(--yellow-fg)'],red:['var(--red-d)','var(--red-b)','var(--red)']}[tone];
  return <div style={{background:m[0],border:`1px solid ${m[1]}`,borderRadius:9,padding:'9px 14px',display:'flex',alignItems:'center',gap:10,color:m[2],fontSize:'0.75rem',fontWeight:600}}>{children}</div>;
};

/* ── PANEL APERÇU (V2 top + V3 body) ── */
const PanelApercu = ({ uxState, setTab }) => {
  if (uxState==='nodata'||uxState==='onboarding') return <FC3PanelApercu uxState={uxState} setTab={setTab}/>;
  const clean = uxState==='nocritical';
  const sev = {critique:{bg:'var(--red-d)',bd:'var(--red-b)',dot:'red'},important:{bg:'var(--yellow-d)',bd:'var(--yellow-b)',dot:'yellow'},opportunite:{bg:'var(--green-d)',bd:'var(--green-b)',dot:'green'}};
  const top = clean?FC3_PRIORITIES.filter(p=>p.sev==='opportunite'):FC3_PRIORITIES.filter(p=>p.sev==='critique').slice(0,3).concat(FC3_PRIORITIES.filter(p=>p.sev==='important').slice(0,1));
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {uxState==='audit'&&<Banner tone="blue"><span style={{width:8,height:8,borderRadius:'50%',background:'var(--blue)',animation:'pulse 1.5s ease-in-out infinite',flexShrink:0}}></span><span style={{flex:1}}>Diagnostic complet en cours — résultats estimés dans ≈ 8 min</span><Badge label="En traitement" tone="blue" sm/></Banner>}
      {uxState==='stale'&&<Banner tone="yellow"><Ico.Warn/><span style={{flex:1}}>Données non actualisées depuis 18 jours</span><button style={{...b4Out,color:'var(--yellow-fg)',borderColor:'var(--yellow-b)'}}><Ico.Refresh/>Actualiser</button></Banner>}
      {uxState==='error'&&<Banner tone="red"><Ico.Warn/><span style={{flex:1}}>Chargement partiel — données de backlinks indisponibles</span><button style={{...b4Out,color:'var(--red)',borderColor:'var(--red-b)'}}><Ico.Refresh/>Réessayer</button></Banner>}

      {/* 1. V2 — AI analysis + next actions */}
      <div className="fc4-row" style={{display:'flex',gap:10,alignItems:'stretch'}}><AIReportCard clean={clean}/><NextActionsCard setTab={setTab} clean={clean}/></div>

      {/* 2. V3 — health strip */}
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr',gap:10}}>
        <div style={{...c4,padding:'14px 18px',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
          <Gauge value={clean?96:92} size={82}/>
          <span style={{fontSize:'0.5rem',fontWeight:700,color:'var(--fg-4)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>Score de santé</span>
          <span style={{fontSize:'0.5625rem',color:'var(--green-fg)',fontWeight:600}}>↑ {clean?'+8':'+4'} pts ce mois</span>
        </div>
        <div style={{...c4,padding:'14px 16px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <Lbl text="Objectif principal"/>
          <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--fg-1)',lineHeight:1.35,marginBottom:8}}>{C4.objective}</div>
          <div><div style={{height:5,background:'var(--bg-3)',borderRadius:999,overflow:'hidden',marginBottom:4}}><div style={{height:'100%',width:clean?'78%':'62%',background:'var(--green)',borderRadius:999}}></div></div><span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{clean?'78':'62'} % atteint</span></div>
        </div>
        <div style={{...c4,padding:'14px 16px'}}>
          <Lbl text="Modules actifs"/>
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8}}>{C4.services.map(s=><div key={s} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:5,background:'var(--green-d)',border:'1px solid var(--green-b)'}}><Dot tone="green"/><span style={{fontSize:'0.625rem',fontWeight:600,color:'var(--green-fg)'}}>{s}</span></div>)}</div>
          <div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{C4.plan} · {C4.mrr}/m</div>
        </div>
      </div>

      {/* 3. KPIs */}
      <div className="fc4-keep2" style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:8}}>
        {FC3_KPIS.map((k,i)=>(
          <div key={i} style={{...c4,padding:'12px 13px',opacity:uxState==='error'&&i===4?0.45:1}}>
            <Lbl text={k.label}/>
            <div style={{fontSize:'1.375rem',fontWeight:800,color:'var(--fg-1)',fontVariantNumeric:'tabular-nums',letterSpacing:'-0.035em',lineHeight:1,marginBottom:4}}>{uxState==='error'&&i===4?'—':k.value}</div>
            <div style={{fontSize:'0.5rem',color:'var(--green-fg)',fontWeight:600,display:'flex',alignItems:'center',gap:2}}><Ico.Up/>{k.sub}</div>
          </div>))}
      </div>

      {/* 4. Tech health */}
      <div style={{...c4,padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
          <div style={{flex:1}}><div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Santé technique du site</div><div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>via PageSpeed Insights · 27 mai 2026</div></div>
          <button style={b4Out}><Ico.Refresh/>Actualiser</button>
        </div>
        <div style={{display:'flex',justifyContent:'space-around',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>{V4_TECH.map(t=><MiniGauge key={t.label} {...t}/>)}</div>
      </div>

      {/* 5. Priorities + plan */}
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:10}}>
        <div style={{...c4,padding:'14px 16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
            <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Priorités ouvertes</div>
            <button onClick={()=>setTab('seo')} style={{...b4Out,fontSize:'0.5625rem',padding:'3px 8px'}}>Voir toutes <Ico.ChevR/></button>
          </div>
          {top.map((p,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'9px 10px',borderRadius:8,background:sev[p.sev].bg,border:`1px solid ${sev[p.sev].bd}`,marginBottom:6}}>
              <Dot tone={sev[p.sev].dot}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--fg-1)',lineHeight:1.3,marginBottom:2}}>{p.title}</div><div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{p.source} · Impact : {p.impact}</div></div>
              <button style={{...b4Out,flexShrink:0}}>Assigner</button>
            </div>))}
        </div>
        <div style={{...c4,padding:'14px 16px',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
            <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Plan en cours</div>
            <button onClick={()=>setTab('plan')} style={{...b4Out,fontSize:'0.5625rem',padding:'3px 8px'}}>Voir tout <Ico.ChevR/></button>
          </div>
          <div style={{flex:1}}>
            {FC3_TASKS.map((t,i)=>(
              <div key={i} style={{padding:'9px 10px',borderRadius:8,background:'var(--bg-3)',border:'1px solid var(--bd)',marginBottom:6}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6,marginBottom:4}}><div style={{fontSize:'0.6875rem',fontWeight:600,color:'var(--fg-1)',lineHeight:1.3}}>{t.title}</div><Badge label={t.status} tone={{'En cours':'yellow','À faire':'blue','Terminé':'green'}[t.status]} sm/></div>
                <div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Échéance : {t.due}</div>
              </div>))}
          </div>
          <button style={{width:'100%',padding:'7px 12px',borderRadius:8,background:'transparent',border:'1px dashed var(--bd-2)',color:'var(--fg-3)',fontSize:'0.6875rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginTop:4}}><Ico.Plus/>Créer une tâche</button>
        </div>
      </div>

      {/* 6. Proofs + traffic */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{...c4,padding:'14px 16px'}}>
          <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:12}}>Dernières preuves de valeur</div>
          {FC3_PROOFS.map((vp,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:9}}>
              <div style={{width:20,height:20,borderRadius:5,background:'var(--green-d)',border:'1px solid var(--green-b)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--green-fg)'}}>{vp.ic==='link'?<Ico.Link/>:vp.ic==='doc'?<Ico.Doc/>:<Ico.Check/>}</div>
              <div><div style={{fontSize:'0.6875rem',fontWeight:500,color:'var(--fg-2)',lineHeight:1.35}}>{vp.label}</div><div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>{vp.date}</div></div>
            </div>))}
        </div>
        <div style={{...c4,padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div><div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:1}}>Trafic organique</div><div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Sessions · 20 semaines</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--green)',letterSpacing:'-0.04em',lineHeight:1}}>+72 %</div><div style={{fontSize:'0.5rem',color:'var(--green-fg)',marginTop:2}}>vs il y a 20 sem.</div></div>
          </div>
          <Spark data={FC3_SPARK} height={60}/>
        </div>
      </div>
    </div>
  );
};

/* ── PANEL RAPPORTS (V2 content, dark) ── */
const ReportGenerator = () => {
  const [secs,setSecs] = useV4State(V4_SECTIONS.map(s=>s.on));
  const [auto,setAuto] = useV4State(true);
  const n = secs.filter(Boolean).length;
  return (
    <div style={{...c4,flex:'1 1 0',padding:'14px 16px',display:'flex',flexDirection:'column',minWidth:0,borderTop:'2px solid var(--violet)'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{width:28,height:28,borderRadius:7,background:'var(--violet-d)',border:'1px solid var(--violet-b)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--violet-fg)',fontSize:13,flexShrink:0}}>✦</div>
        <div style={{flex:1}}><div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Générer le rapport · Mai 2026</div><div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>Synthèse rédigée automatiquement par l'agent HuntPilote</div></div>
        <Badge label="✦ IA" tone="violet" sm/>
      </div>
      <Lbl text={`Sections incluses · ${n}/${V4_SECTIONS.length}`} mb={8}/>
      <div className="fc4-keep2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:12}}>
        {V4_SECTIONS.map((s,i)=>(
          <div key={s.name} onClick={()=>setSecs(p=>p.map((v,j)=>j===i?!v:v))} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',userSelect:'none',background:secs[i]?'var(--green-d)':'var(--bg-3)',border:`1px solid ${secs[i]?'var(--green-b)':'var(--bd)'}`,transition:'all 140ms'}}>
            <div style={{width:16,height:16,borderRadius:5,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:secs[i]?'var(--green)':'transparent',border:`1.5px solid ${secs[i]?'var(--green)':'var(--bd-2)'}`,color:'var(--bg-0)'}}>{secs[i]&&<Ico.Check/>}</div>
            <div style={{minWidth:0}}><div style={{fontSize:'0.6875rem',fontWeight:700,color:secs[i]?'var(--green-fg)':'var(--fg-2)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</div><div style={{fontSize:'0.5rem',color:'var(--fg-4)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.desc}</div></div>
          </div>))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 11px',borderRadius:8,background:'var(--violet-d)',border:'1px solid var(--violet-b)',marginBottom:12}}>
        <span style={{color:'var(--violet-fg)',flexShrink:0}}><Ico.Refresh/></span>
        <div style={{flex:1,fontSize:'0.625rem',color:'var(--fg-2)',lineHeight:1.45}}>Génération + envoi automatiques le <b style={{color:'var(--fg-1)'}}>2 de chaque mois</b> à {C4.email}</div>
        <div onClick={()=>setAuto(a=>!a)} style={{width:30,height:17,borderRadius:999,background:auto?'var(--violet)':'var(--bg-4)',position:'relative',flexShrink:0,cursor:'pointer',transition:'background 150ms'}}><div style={{position:'absolute',top:2,left:auto?15:2,width:13,height:13,borderRadius:'50%',background:'#fff',transition:'left 150ms'}}></div></div>
      </div>
      <div style={{marginTop:'auto',display:'flex',gap:8}}>
        <a href="Editeur Rapport.html" style={{...b4Pri,flex:1,textDecoration:'none',justifyContent:'center'}}><Ico.Zap/>Générer et éditer</a>
        <button style={{...b4Out,padding:'6px 12px'}}><Ico.Cal/>Programmer</button>
        <button style={{...b4Out,padding:'6px 12px'}}><Ico.Send/>Envoyer</button>
      </div>
    </div>
  );
};

const ReportCover = () => (
  <div style={{...c4,flex:'0 0 36%',padding:0,overflow:'hidden',display:'flex',flexDirection:'column',minWidth:0}}>
    <div style={{padding:'8px 12px',borderBottom:'1px solid var(--bd)',display:'flex',alignItems:'center',background:'var(--bg-3)'}}>
      <Lbl text="Aperçu du document" mb={0}/><span style={{marginLeft:'auto',fontSize:'0.5rem',color:'var(--fg-4)'}}>5 sections · 8 pages</span>
    </div>
    <div style={{flex:1,padding:'18px 18px 14px',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <div style={{width:22,height:22,background:'var(--green-d)',border:'1px solid var(--green-b)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--green-fg)" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
        <span style={{fontSize:'0.75rem',fontWeight:800,letterSpacing:'-0.02em',color:'var(--fg-1)'}}>HuntPilote</span>
        <span style={{marginLeft:'auto',fontSize:'0.5rem',fontWeight:700,color:'var(--fg-4)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Confidentiel</span>
      </div>
      <div style={{margin:'22px 0'}}>
        <div style={{fontSize:'0.5rem',fontWeight:700,color:'var(--green-fg)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}}>Rapport de performance</div>
        <div style={{fontSize:'1.375rem',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.05,color:'var(--fg-1)'}}>SEO Mensuel</div>
        <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--fg-2)',marginTop:10}}>{C4.name}</div>
        <div style={{fontSize:'0.6875rem',color:'var(--fg-3)',marginTop:2}}>Mai 2026 · préparé par {C4.pm}</div>
      </div>
      <div style={{marginTop:'auto',display:'flex',alignItems:'center',gap:12,paddingTop:12,borderTop:'1px solid var(--bd)'}}>
        <Gauge value={C4.score} size={58}/>
        <div><Lbl text="Score santé global" mb={3}/><div style={{fontSize:'0.6875rem',color:'var(--green)',fontWeight:700,display:'flex',alignItems:'center',gap:3}}><Ico.Up/>+5 pts vs avril</div><div style={{fontSize:'0.5625rem',color:'var(--fg-4)',marginTop:2}}>Trafic +72 % · 142 mots-clés</div></div>
      </div>
      <a href="Rapport Client.html" target="_blank" rel="noopener" style={{...b4Out,width:'100%',justifyContent:'center',marginTop:12,padding:'7px',textDecoration:'none'}}><Ico.Eye/>Voir la page du client</a>
    </div>
  </div>
);

const PanelReports = ({ setTab }) => (
  <div style={{display:'flex',flexDirection:'column',gap:10,paddingBottom:16}}>
    <div className="fc4-row" style={{display:'flex',gap:10,alignItems:'stretch'}}><ReportGenerator/><ReportCover/></div>
    <div style={{...c4,padding:'14px 16px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Historique des rapports</div>
        <span style={{fontSize:'0.5625rem',color:'var(--fg-4)'}}>{V4_REPORTS.length} rapports envoyés</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        {V4_REPORTS.map(r=>(
          <div key={r.period} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:9,border:'1px solid var(--bd)',background:'var(--bg-3)'}}>
            <div style={{width:34,height:42,borderRadius:6,background:'var(--bg-2)',border:'1px solid var(--bd-1)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fg-3)',flexShrink:0,position:'relative'}}>
              <Ico.Doc/><span style={{position:'absolute',bottom:-6,right:-6,fontSize:'0.5rem',fontWeight:800,color:r.score>=85?'var(--green)':'var(--yellow)',background:'var(--bg-2)',border:'1px solid var(--bd-1)',borderRadius:999,padding:'0 4px'}}>{r.score}</span>
            </div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:'0.8125rem',fontWeight:700,color:'var(--fg-1)'}}>Rapport SEO · {r.period}</div><div style={{fontSize:'0.5625rem',color:'var(--fg-3)',marginTop:2}}>Envoyé le {r.date} · {r.pages} pages · à {C4.email}</div></div>
            <Badge label="Envoyé" tone="green" sm/>
            <div style={{display:'flex',gap:5}}><button style={b4Icon} title="Voir"><Ico.Eye/></button><button style={b4Icon} title="Renvoyer"><Ico.Send/></button></div>
          </div>))}
      </div>
    </div>
    <div style={{...c4,padding:'14px 16px',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
      <div style={{flex:'1 1 220px',minWidth:0}}>
        <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:3}}>Communications avec le client</div>
        <div style={{fontSize:'0.6875rem',color:'var(--fg-3)',lineHeight:1.5}}>Un seul fil, tous canaux confondus — courriels, appels, réunions, notes internes et messages du portail client.</div>
      </div>
      <button className="act-btn primary" onClick={()=>setTab&&setTab('communications')}><Ico.Doc/>Ouvrir le fil complet</button>
    </div>
  </div>
);

Object.assign(window, { LeftPanel, RightPanel, PanelApercu, PanelReports });
