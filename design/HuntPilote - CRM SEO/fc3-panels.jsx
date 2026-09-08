/* HuntPilote FC3 — Panel components */
const { useState: usePanelState } = React;
const { Ico, Badge, Dot, Gauge, Spark, Delta, Lbl } = window;

/* ── DATA ── */
const FC3_CLIENT = {
  name:'Acme Corp.', initials:'AC', sector:'E-commerce',
  email:'contact@acmecorp.fr', phone:'(514) 555-0182',
  website:'acmecorp.fr', address:'Montréal, QC',
  services:['SEO Tech.','Contenu','Audit','Backlinks'],
  score:92, mrr:'1 200 $ CA', since:'Janvier 2024',
  pm:'Marie Chen', pmInit:'MC',
  lastAudit:'15 avr. 2026',
  objective:'+30 % trafic organique — T3 2026',
  plan:'Croissance SEO',
  engagement:'12 mois · jusqu\'au 31 déc. 2026',
};

const FC3_KPIS = [
  {label:'Sessions org.',    value:'34,8k', sub:'+18 % vs mars',  up:true},
  {label:'Positions top 10', value:'27',    sub:'+12 ce mois',    up:true},
  {label:'CTR moyen',        value:'3,4 %', sub:'+0,3 pt',        up:true},
  {label:'Pages indexées',   value:'1 240', sub:'+34 pages',      up:true},
  {label:'Backlinks réf.',   value:'3 280', sub:'+12 nouveaux',   up:true},
];

const FC3_PRIORITIES = [
  {sev:'critique', title:'Vitesse mobile insuffisante (LCP 4,2 s)',   source:'Audit tech. · 27 mai', impact:'Crawl + Expérience'},
  {sev:'critique', title:'23 liens brisés détectés',                  source:'Surveillance · 27 mai', impact:'Budget crawl'},
  {sev:'critique', title:'Erreurs 404 non redirigées (8 pages)',       source:'Audit tech. · 27 mai', impact:'Jus de lien'},
  {sev:'important',title:'12 balises title non optimisées',           source:'Analyse · 22 mai',      impact:'Visibilité + CTR'},
  {sev:'important',title:'5 pages sans balise H1',                    source:'Audit tech. · 27 mai',  impact:'On-page SEO'},
  {sev:'important',title:'34 images sans attribut alt',               source:'Audit tech. · 27 mai',  impact:'Indexation image'},
  {sev:'opportunite',title:'45 mots-clés longue traîne inexploités',  source:'Analyse IA · 25 mai',   impact:'Trafic +8 400/m'},
  {sev:'opportunite',title:'12 opportunités de featured snippets',    source:'Analyse IA · 25 mai',   impact:'Visibilité'},
];

const FC3_TASKS = [
  {title:'Réviser les meta descriptions (18 pages)', due:'30 mai 2026', status:'En cours', prio:'haute',   source:'Priorité SEO'},
  {title:'Créer 5 articles blog longue traîne',      due:'15 juin 2026',status:'À faire',  prio:'normale', source:'Plan éditorial'},
  {title:'Audit backlinks concurrents',              due:'10 juin 2026', status:'En cours', prio:'haute',   source:'Priorité SEO'},
];

const FC3_PROOFS = [
  {label:'Meta descriptions optimisées (18 pages)', date:'23 mai', ic:'check'},
  {label:'12 nouveaux backlinks acquis (DR 40+)',   date:'14 mai', ic:'link'},
  {label:'Rapport mensuel envoyé (8 sections)',     date:'2 mai',  ic:'doc'},
  {label:'Maillage interne restructuré (32 pages)', date:'28 avr.',ic:'check'},
];

const FC3_COMPETITORS = [
  {name:'TechShop.ca',    sessions:52300},
  {name:'DigiMarket.ca',  sessions:41100},
  {name:'ShopNova.ca',    sessions:28700},
];
const FC3_MY = 34800;

const FC3_ACTIVITY = [
  {label:'Audit complet Q2 lancé',            date:'27 mai', ic:'zap'},
  {label:'12 nouveaux backlinks détectés',    date:'14 mai', ic:'link'},
  {label:'Rapport avril envoyé',              date:'2 mai',  ic:'doc'},
  {label:'MRR renouvelé — 1 200 $ CA',        date:'1 mai',  ic:'check'},
];

const FC3_SPARK = [28,32,30,35,38,34,40,43,41,48,52,49,55,58,62,64,68,66,72,75];

const FC3_AUDITS = [
  {name:'Audit Complet Q2', date:'15 avr. 2026', score:87, type:'Complet'},
  {name:'Audit Technique',  date:'12 jan. 2026', score:74, type:'Technique'},
  {name:'Audit Contenu',    date:'3 oct. 2025',  score:81, type:'Contenu'},
];

const FC3_REPORTS = [
  {period:'Avril 2026',   date:'2 mai 2026',   pages:8},
  {period:'Mars 2026',    date:'3 avr. 2026',  pages:8},
  {period:'Février 2026', date:'2 mars 2026',  pages:7},
];

/* ── SHARED STYLES ── */
const card = {background:'var(--bg-2)',border:'1px solid var(--bd)',borderRadius:10,boxShadow:'var(--shadow)'};
const btnOut = {display:'inline-flex',alignItems:'center',gap:5,padding:'4px 11px',borderRadius:6,background:'var(--bg-3)',border:'1px solid var(--bd-1)',color:'var(--fg-2)',fontSize:'0.625rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:600,whiteSpace:'nowrap'};
const btnGreen = {display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:6,background:'var(--green-d)',border:'1px solid var(--green-b)',color:'var(--green-fg)',fontSize:'0.6875rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:700};

/* ── LEFT PANEL ── */
const LeftPanel = ({ uxState }) => {
  const statusTone = {active:'green', onboarding:'blue', nodata:'yellow', audit:'blue', stale:'yellow', nocritical:'green', error:'yellow'}[uxState] || 'green';
  const statusLabel = {active:'Actif', onboarding:'Onboarding', nodata:'Sans intégrations', audit:'Audit en cours', stale:'Données obsolètes', nocritical:'Actif', error:'Erreur partielle'}[uxState] || 'Actif';

  return (
    <div style={{width:'var(--left-w)',flexShrink:0,borderRight:'1px solid var(--bd)',background:'var(--bg-1)',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Identity */}
      <div style={{padding:'20px 16px 14px',borderBottom:'1px solid var(--bd)'}}>
        <div style={{width:46,height:46,borderRadius:12,background:'var(--green-d)',border:'1.5px solid var(--green-b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:800,color:'var(--green-fg)',letterSpacing:'-0.03em',marginBottom:11}}>AC</div>
        <div style={{fontSize:'1rem',fontWeight:800,color:'var(--fg-1)',letterSpacing:'-0.025em',lineHeight:1.1,marginBottom:8}}>{FC3_CLIENT.name}</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          <Badge label={FC3_CLIENT.sector} tone="neutral" sm/>
          <Badge label={statusLabel} tone={statusTone} sm/>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px 16px 20px'}}>
        {/* Contact */}
        <Lbl text="Contact"/>
        {[[Ico.Mail,FC3_CLIENT.email],[Ico.Phone,FC3_CLIENT.phone],[Ico.Globe,FC3_CLIENT.website],[Ico.Pin,FC3_CLIENT.address]].map(([Icon,val],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:7,color:'var(--fg-2)'}}>
            <span style={{color:'var(--fg-4)',flexShrink:0}}><Icon/></span>
            <span style={{fontSize:'0.6875rem',lineHeight:1.3,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{val}</span>
          </div>
        ))}

        <div style={{borderTop:'1px solid var(--bd)',margin:'12px 0'}}/>

        {/* Account */}
        <Lbl text="Compte"/>
        {[[Ico.User,`${FC3_CLIENT.pm} (référent)`],[Ico.Cal,`Depuis ${FC3_CLIENT.since}`],[Ico.Zap,`Dernier audit : ${FC3_CLIENT.lastAudit}`]].map(([Icon,val],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:7,color:'var(--fg-2)'}}>
            <span style={{color:'var(--fg-4)',flexShrink:0}}><Icon/></span>
            <span style={{fontSize:'0.6875rem',lineHeight:1.3}}>{val}</span>
          </div>
        ))}

        <div style={{borderTop:'1px solid var(--bd)',margin:'12px 0'}}/>

        {/* Modules */}
        <Lbl text="Modules actifs"/>
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
          {FC3_CLIENT.services.map(s=><Badge key={s} label={s} tone="green" sm/>)}
        </div>

        <div style={{borderTop:'1px solid var(--bd)',margin:'12px 0'}}/>

        {/* Contrat */}
        <Lbl text="Contrat"/>
        <div style={{fontSize:'0.75rem',fontWeight:800,color:'var(--fg-1)',marginBottom:3}}>{FC3_CLIENT.plan}</div>
        <div style={{fontSize:'0.6875rem',color:'var(--green-fg)',fontWeight:700,marginBottom:3}}>{FC3_CLIENT.mrr} / mois</div>
        <div style={{fontSize:'0.625rem',color:'var(--fg-3)',lineHeight:1.45}}>{FC3_CLIENT.engagement}</div>
      </div>
    </div>
  );
};

/* ── RIGHT PANEL ── */
const RightPanel = () => {
  const max = Math.max(...FC3_COMPETITORS.map(c=>c.sessions), FC3_MY) * 1.2;
  return (
    <div style={{width:'var(--right-w)',flexShrink:0,borderLeft:'1px solid var(--bd)',background:'var(--bg-1)',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'16px 14px 20px'}}>

        {/* Next action */}
        <Lbl text="Prochaine action"/>
        <div style={{...card,padding:'11px 12px',marginBottom:14}}>
          <div style={{fontSize:'0.5625rem',fontWeight:700,color:'var(--yellow-fg)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>Rapport mensuel · 2 juin</div>
          <div style={{fontSize:'0.75rem',fontWeight:700,color:'var(--fg-1)',marginBottom:3}}>Générer le rapport client</div>
          <div style={{fontSize:'0.5625rem',color:'var(--fg-3)',lineHeight:1.4,marginBottom:8}}>Dernier : 2 mai · 8 sections · Envoyé</div>
          <button style={btnGreen}><Ico.Doc/>Générer le rapport client</button>
        </div>

        {/* Competitors */}
        <Lbl text="Concurrents (trafic est.)"/>
        {FC3_COMPETITORS.map(c=>{
          const pct = (c.sessions/max)*100, myPct = (FC3_MY/max)*100;
          const higher = c.sessions > FC3_MY;
          return (
            <div key={c.name} style={{marginBottom:11}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:'0.6875rem',fontWeight:600,color:'var(--fg-1)'}}>{c.name}</span>
                <span style={{fontSize:'0.5625rem',fontWeight:700,color:higher?'var(--red)':'var(--green-fg)'}}>{(c.sessions/1000).toFixed(1)}k/m</span>
              </div>
              <div style={{position:'relative',height:5,background:'var(--bg-3)',borderRadius:999}}>
                <div style={{height:'100%',width:`${pct}%`,borderRadius:999,background:higher?'rgba(248,113,113,0.45)':'rgba(74,222,128,0.4)'}}/>
                <div style={{position:'absolute',left:`${myPct}%`,top:-1,height:7,width:2,background:'var(--green)',borderRadius:1,transform:'translateX(-50%)'}}/>
              </div>
              <div style={{fontSize:'0.4875rem',color:'var(--fg-3)',marginTop:2}}>
                {higher?`+${((c.sessions-FC3_MY)/1000).toFixed(1)}k devant vous`:`−${((FC3_MY-c.sessions)/1000).toFixed(1)}k derrière vous`}
              </div>
            </div>
          );
        })}

        <div style={{borderTop:'1px solid var(--bd)',margin:'14px 0'}}/>

        {/* Activity */}
        <Lbl text="Activité récente"/>
        {FC3_ACTIVITY.map((a,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:10,alignItems:'flex-start'}}>
            <div style={{width:22,height:22,borderRadius:6,background:'var(--bg-3)',border:'1px solid var(--bd)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--fg-3)'}}>
              {a.ic==='zap'?<Ico.Zap/>:a.ic==='link'?<Ico.Link/>:a.ic==='doc'?<Ico.Doc/>:<Ico.Check/>}
            </div>
            <div>
              <div style={{fontSize:'0.6875rem',color:'var(--fg-2)',lineHeight:1.35,fontWeight:500}}>{a.label}</div>
              <div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>{a.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── PANEL APERÇU ── */
const PanelApercu = ({ uxState, setTab }) => {
  const sevConf = {
    critique:   {label:'Critique',    bg:'var(--red-d)',    bd:'var(--red-b)',    dot:'red',    color:'var(--red)'},
    important:  {label:'Important',   bg:'var(--yellow-d)', bd:'var(--yellow-b)', dot:'yellow', color:'var(--yellow)'},
    opportunite:{label:'Opportunité', bg:'var(--green-d)',  bd:'var(--green-b)',  dot:'green',  color:'var(--green)'},
  };

  /* ── STATE: no integrations ── */
  if (uxState === 'nodata') return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:420,gap:16,padding:'40px 24px',textAlign:'center'}}>
      <div style={{width:52,height:52,borderRadius:14,background:'var(--yellow-d)',border:'1px solid var(--yellow-b)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--yellow-fg)',fontSize:22}}>⚡</div>
      <div><div style={{fontSize:'1.125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:6}}>Connecter les sources SEO</div>
      <div style={{fontSize:'0.8125rem',color:'var(--fg-2)',maxWidth:380,lineHeight:1.65}}>Aucune intégration active. Connectez Google Search Console et Analytics pour activer le suivi des performances.</div></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
        {['Google Search Console','Google Analytics 4','Semrush / Ahrefs'].map(src=>(
          <button key={src} style={{...btnOut,padding:'8px 14px',fontSize:'0.8125rem',background:'var(--bg-2)',color:'var(--fg-1)'}}><Ico.Plus/>{src}</button>
        ))}
      </div>
    </div>
  );

  /* ── STATE: onboarding ── */
  if (uxState === 'onboarding') {
    const steps=[{done:true,label:'Fiche client créée'},{done:true,label:'Contact principal ajouté'},{done:false,label:'Connecter Google Search Console'},{done:false,label:'Connecter Google Analytics 4'},{done:false,label:'Lancer le premier diagnostic'},{done:false,label:'Définir l\'objectif principal'}];
    return (
      <div style={{padding:'4px 0 24px'}}>
        <div style={{background:'var(--blue-d)',border:'1px solid var(--blue-b)',borderRadius:10,padding:'14px 18px',marginBottom:20}}>
          <div style={{fontSize:'0.875rem',fontWeight:800,color:'var(--blue-fg)',marginBottom:4}}>Onboarding en cours</div>
          <div style={{fontSize:'0.75rem',color:'var(--fg-2)',lineHeight:1.5}}>Complétez les étapes ci-dessous pour activer le pilotage SEO de ce client.</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7,maxWidth:500}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:9,background:s.done?'var(--green-d)':'var(--bg-2)',border:`1px solid ${s.done?'var(--green-b)':'var(--bd)'}`}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:s.done?'var(--green)':'var(--bg-3)',border:`2px solid ${s.done?'var(--green)':'var(--bd-2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:s.done?'#fff':'var(--fg-3)'}}>
                {s.done?<Ico.Check/>:<span style={{fontSize:'0.5625rem',fontWeight:800}}>{i+1}</span>}
              </div>
              <span style={{fontSize:'0.8125rem',fontWeight:s.done?400:600,color:s.done?'var(--green-fg)':'var(--fg-1)',textDecoration:s.done?'line-through':undefined,flex:1}}>{s.label}</span>
              {!s.done&&<button style={{...btnOut}}>Configurer</button>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── CONTEXTUAL BANNERS ── */
  const auditBanner = uxState==='audit'&&(
    <div style={{background:'var(--blue-d)',border:'1px solid var(--blue-b)',borderRadius:9,padding:'9px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'var(--blue)',flexShrink:0,animation:'pulse 1.5s ease-in-out infinite'}}/>
      <span style={{fontSize:'0.75rem',fontWeight:600,color:'var(--blue-fg)',flex:1}}>Diagnostic complet en cours — résultats estimés dans ≈ 8 min</span>
      <Badge label="En traitement" tone="blue" sm/>
    </div>
  );
  const staleBanner = uxState==='stale'&&(
    <div style={{background:'var(--yellow-d)',border:'1px solid var(--yellow-b)',borderRadius:9,padding:'9px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
      <Ico.Warn/><span style={{fontSize:'0.75rem',fontWeight:600,color:'var(--yellow-fg)',flex:1}}>Données non actualisées depuis 18 jours</span>
      <button style={{...btnOut,color:'var(--yellow-fg)',borderColor:'var(--yellow-b)'}}><Ico.Refresh/>Actualiser</button>
    </div>
  );
  const errorBanner = uxState==='error'&&(
    <div style={{background:'var(--red-d)',border:'1px solid var(--red-b)',borderRadius:9,padding:'9px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
      <Ico.Warn/><span style={{fontSize:'0.75rem',fontWeight:600,color:'var(--red)',flex:1}}>Chargement partiel — données de backlinks indisponibles</span>
      <button style={{...btnOut,color:'var(--red)',borderColor:'var(--red-b)'}}><Ico.Refresh/>Réessayer</button>
    </div>
  );

  const isClean = uxState==='nocritical';
  const topPriorities = isClean ? [] : FC3_PRIORITIES.filter(p=>p.sev==='critique').slice(0,3).concat(FC3_PRIORITIES.filter(p=>p.sev==='important').slice(0,1));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {auditBanner}{staleBanner}{errorBanner}

      {/* 1. AI BANNER */}
      <div style={{background:'var(--violet-d)',border:'1px solid var(--violet-b)',borderRadius:12,padding:'14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
          <div style={{width:26,height:26,borderRadius:7,background:'rgba(167,139,250,0.18)',border:'1px solid var(--violet-b)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--violet-fg)',fontSize:13,flexShrink:0}}>✦</div>
          <span style={{fontSize:'0.75rem',fontWeight:700,color:'var(--violet-fg)'}}>Synthèse HuntPilote</span>
          <span style={{fontSize:'0.5rem',color:'var(--fg-3)',marginLeft:'auto'}}>Basé sur 4 sources · 27 mai 2026</span>
          <button style={{...btnOut,borderColor:'var(--violet-b)',color:'var(--violet-fg)',fontSize:'0.5rem',padding:'2px 8px'}}><Ico.Refresh/>Rafraîchir</button>
        </div>
        <p style={{fontSize:'0.75rem',color:'var(--fg-2)',lineHeight:1.7,margin:'0 0 10px'}}>
          {isClean
            ? 'Le site est en excellente santé SEO. Aucune priorité critique détectée. Les gains récents sont solides : +12 positions top 10, CTR en hausse. C\'est le moment idéal pour exploiter les opportunités de longue traîne identifiées.'
            : 'Le site affiche une croissance soutenue sur les mots-clés transactionnels. La refonte du maillage interne a porté ses fruits avec +12 nouvelles positions top 10. La vitesse mobile (LCP 4,2 s) et les 23 liens brisés restent les priorités absolues ce mois-ci.'}
        </p>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          {isClean?(<>
            <span style={{padding:'4px 9px',borderRadius:6,background:'var(--green-d)',border:'1px solid var(--green-b)',fontSize:'0.5625rem',color:'var(--green-fg)',fontWeight:600}}>✅ Aucun problème critique</span>
            <span style={{padding:'4px 9px',borderRadius:6,background:'var(--blue-d)',border:'1px solid var(--blue-b)',fontSize:'0.5625rem',color:'var(--blue-fg)',fontWeight:600}}>💡 45 mots-clés longue traîne disponibles</span>
            <span style={{padding:'4px 9px',borderRadius:6,background:'var(--green-d)',border:'1px solid var(--green-b)',fontSize:'0.5625rem',color:'var(--green-fg)',fontWeight:600}}>🎯 Viser 40 positions top 10 ce mois</span>
          </>):(<>
            <span style={{padding:'4px 9px',borderRadius:6,background:'var(--yellow-d)',border:'1px solid var(--yellow-b)',fontSize:'0.5625rem',color:'var(--yellow-fg)',fontWeight:600}}>⚠ Vitesse mobile · LCP 4,2 s</span>
            <span style={{padding:'4px 9px',borderRadius:6,background:'var(--red-d)',border:'1px solid var(--red-b)',fontSize:'0.5625rem',color:'var(--red)',fontWeight:600}}>🔴 23 liens brisés à corriger</span>
            <span style={{padding:'4px 9px',borderRadius:6,background:'var(--green-d)',border:'1px solid var(--green-b)',fontSize:'0.5625rem',color:'var(--green-fg)',fontWeight:600}}>💚 45 mots-clés longue traîne</span>
          </>)}
        </div>
      </div>

      {/* 2. HEALTH STRIP */}
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr',gap:10}}>
        <div style={{...card,padding:'14px 18px',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
          <Gauge value={isClean?96:92} size={82}/>
          <span style={{fontSize:'0.5rem',fontWeight:700,color:'var(--fg-4)',textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>Score de santé</span>
          <span style={{fontSize:'0.5625rem',color:'var(--green-fg)',fontWeight:600}}>{isClean?'↑ +8 pts ce mois':'↑ +4 pts ce mois'}</span>
        </div>
        <div style={{...card,padding:'14px 16px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <Lbl text="Objectif principal"/>
          <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--fg-1)',lineHeight:1.35,marginBottom:8}}>{FC3_CLIENT.objective}</div>
          <div>
            <div style={{height:5,background:'var(--bg-3)',borderRadius:999,overflow:'hidden',marginBottom:4}}>
              <div style={{height:'100%',width:isClean?'78%':'62%',background:'var(--green)',borderRadius:999}}/>
            </div>
            <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{isClean?'78 %':'62 %'} atteint</span>
          </div>
        </div>
        <div style={{...card,padding:'14px 16px'}}>
          <Lbl text="Modules actifs"/>
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:8}}>
            {FC3_CLIENT.services.map(s=>(
              <div key={s} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:5,background:'var(--green-d)',border:'1px solid var(--green-b)'}}>
                <Dot tone="green"/><span style={{fontSize:'0.625rem',fontWeight:600,color:'var(--green-fg)'}}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{FC3_CLIENT.plan} · {FC3_CLIENT.mrr}/m</div>
        </div>
      </div>

      {/* 3. KPIS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
        {FC3_KPIS.map((k,i)=>(
          <div key={i} style={{...card,padding:'12px 13px'}}>
            <Lbl text={k.label}/>
            <div style={{fontSize:'1.375rem',fontWeight:800,color:'var(--fg-1)',fontVariantNumeric:'tabular-nums',letterSpacing:'-0.035em',lineHeight:1,marginBottom:4}}>{k.value}</div>
            <div style={{fontSize:'0.5rem',color:'var(--green-fg)',fontWeight:600,display:'flex',alignItems:'center',gap:2}}><Ico.Up/>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 4. PRIORITIES + PLAN */}
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:10}}>
        {/* Priorities */}
        <div style={{...card,padding:'14px 16px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
            <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Priorités ouvertes</div>
            <button onClick={()=>setTab('seo')} style={{...btnOut,background:'transparent',border:'none',color:'var(--fg-3)',padding:'2px 6px',fontSize:'0.5625rem',gap:3}}>Voir toutes <Ico.ChevR/></button>
          </div>
          {isClean?(
            <div style={{textAlign:'center',padding:'18px 0'}}>
              <div style={{fontSize:26,marginBottom:8}}>✅</div>
              <div style={{fontWeight:700,color:'var(--green-fg)',fontSize:'0.875rem',marginBottom:4}}>Aucune priorité critique</div>
              <div style={{fontSize:'0.75rem',color:'var(--fg-3)'}}>8 opportunités disponibles à exploiter</div>
              <button onClick={()=>setTab('seo')} style={{...btnGreen,marginTop:12,fontSize:'0.6875rem'}}>Voir les opportunités <Ico.ChevR/></button>
            </div>
          ):(
            topPriorities.map((p,i)=>{
              const conf=sevConf[p.sev];
              return (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'9px 10px',borderRadius:8,background:conf.bg,border:`1px solid ${conf.bd}`,marginBottom:6}}>
                  <Dot tone={conf.dot}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--fg-1)',lineHeight:1.3,marginBottom:2}}>{p.title}</div>
                    <div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{p.source} · Impact : {p.impact}</div>
                  </div>
                  <button style={{...btnOut,flexShrink:0}}>Assigner</button>
                </div>
              );
            })
          )}
        </div>
        {/* Action Plan */}
        <div style={{...card,padding:'14px 16px',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
            <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)'}}>Plan en cours</div>
            <button onClick={()=>setTab('plan')} style={{...btnOut,background:'transparent',border:'none',color:'var(--fg-3)',padding:'2px 6px',fontSize:'0.5625rem',gap:3}}>Voir tout <Ico.ChevR/></button>
          </div>
          <div style={{flex:1}}>
            {FC3_TASKS.map((t,i)=>{
              const tone={
                'En cours':'yellow','À faire':'blue','Terminé':'green'
              }[t.status]||'neutral';
              return (
                <div key={i} style={{padding:'9px 10px',borderRadius:8,background:'var(--bg-3)',border:'1px solid var(--bd)',marginBottom:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6,marginBottom:4}}>
                    <div style={{fontSize:'0.6875rem',fontWeight:600,color:'var(--fg-1)',lineHeight:1.3}}>{t.title}</div>
                    <Badge label={t.status} tone={tone} sm/>
                  </div>
                  <div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Échéance : {t.due}</div>
                </div>
              );
            })}
          </div>
          <button style={{width:'100%',padding:'7px 12px',borderRadius:8,background:'transparent',border:'1px dashed var(--bd-2)',color:'var(--fg-3)',fontSize:'0.6875rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:5,marginTop:4}}>
            <Ico.Plus/>Créer une tâche
          </button>
        </div>
      </div>

      {/* 5. PROOFS + TRAFFIC */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{...card,padding:'14px 16px'}}>
          <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:12}}>Dernières preuves de valeur</div>
          {FC3_PROOFS.map((vp,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:9}}>
              <div style={{width:20,height:20,borderRadius:5,background:'var(--green-d)',border:'1px solid var(--green-b)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'var(--green-fg)'}}>
                {vp.ic==='link'?<Ico.Link/>:vp.ic==='doc'?<Ico.Doc/>:<Ico.Check/>}
              </div>
              <div>
                <div style={{fontSize:'0.6875rem',fontWeight:500,color:'var(--fg-2)',lineHeight:1.35}}>{vp.label}</div>
                <div style={{fontSize:'0.5rem',color:'var(--fg-4)',marginTop:1}}>{vp.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{...card,padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div>
              <div style={{fontSize:'0.8125rem',fontWeight:800,color:'var(--fg-1)',marginBottom:1}}>Trafic organique</div>
              <div style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Sessions · 20 semaines</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:'var(--green)',letterSpacing:'-0.04em',lineHeight:1}}>+72 %</div>
              <div style={{fontSize:'0.5rem',color:'var(--green-fg)',marginTop:2}}>vs il y a 20 sem.</div>
            </div>
          </div>
          <Spark data={FC3_SPARK} height={60}/>
        </div>
      </div>
    </div>
  );
};

/* ── PANEL SEO PRIORITIES ── */
const PanelSEO = ({ setTab }) => {
  const [filter, setFilter] = usePanelState('tous');
  const sevConf = {
    critique:   {label:'Critique',    bg:'var(--red-d)',    bd:'var(--red-b)',    dot:'red',    tone:'red'},
    important:  {label:'Important',   bg:'var(--yellow-d)', bd:'var(--yellow-b)', dot:'yellow', tone:'yellow'},
    opportunite:{label:'Opportunité', bg:'var(--green-d)',  bd:'var(--green-b)',  dot:'green',  tone:'green'},
  };
  const counts = {critique:FC3_PRIORITIES.filter(p=>p.sev==='critique').length, important:FC3_PRIORITIES.filter(p=>p.sev==='important').length, opportunite:FC3_PRIORITIES.filter(p=>p.sev==='opportunite').length};
  const shown = filter==='tous' ? FC3_PRIORITIES : FC3_PRIORITIES.filter(p=>p.sev===filter);

  return (
    <div style={{paddingBottom:16}}>
      <div style={{background:'var(--violet-d)',border:'1px solid var(--violet-b)',borderRadius:10,padding:'11px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
        <span style={{color:'var(--violet-fg)',fontSize:14,flexShrink:0}}>✦</span>
        <div style={{flex:1}}>
          <div style={{fontSize:'0.75rem',fontWeight:700,color:'var(--violet-fg)'}}>Agent IA actif — Surveillance continue</div>
          <div style={{fontSize:'0.5rem',color:'var(--fg-3)',marginTop:1}}>Dernière analyse : 27 mai 2026 · Prochaine dans 6 h</div>
        </div>
        <Badge label={`${FC3_PRIORITIES.length} priorités`} tone="violet"/>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:14}}>
        {[['tous','Tous',null],['critique','Critique',counts.critique],['important','Important',counts.important],['opportunite','Opportunité',counts.opportunite]].map(([id,l,cnt])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{padding:'5px 12px',borderRadius:6,background:filter===id?'var(--bg-2)':'transparent',border:`1px solid ${filter===id?'var(--bd-1)':'transparent'}`,color:filter===id?'var(--fg-1)':'var(--fg-3)',fontSize:'0.6875rem',fontWeight:filter===id?700:500,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',gap:5}}>
            {l}{cnt!==null&&<span style={{fontSize:'0.5rem',fontWeight:800,padding:'1px 5px',borderRadius:999,background:filter===id?'var(--bg-3)':'transparent',color:filter===id?'var(--fg-2)':'var(--fg-4)'}}>{cnt}</span>}
          </button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        {shown.map((p,i)=>{
          const conf=sevConf[p.sev];
          return (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 14px',borderRadius:9,background:conf.bg,border:`1px solid ${conf.bd}`}}>
              <Dot tone={conf.dot}/>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.8125rem',fontWeight:600,color:'var(--fg-1)',lineHeight:1.3,marginBottom:3}}>{p.title}</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <Badge label={conf.label} tone={conf.tone} sm/>
                  <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{p.source}</span>
                  <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Impact : {p.impact}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:5,flexShrink:0}}>
                <button style={btnOut}>Détail</button>
                <button style={btnGreen}>Assigner au plan d'action</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── PANEL ACTION PLAN ── */
const PanelPlan = () => {
  const statusTone = {'En cours':'yellow','À faire':'blue','Terminé':'green'};
  return (
    <div style={{paddingBottom:16}}>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
        <button style={btnGreen}><Ico.Plus/>Créer une tâche</button>
      </div>
      {FC3_TASKS.map((t,i)=>(
        <div key={i} style={{...card,padding:'13px 16px',marginBottom:8}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--fg-1)',marginBottom:6}}>{t.title}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                <Badge label={t.status} tone={statusTone[t.status]||'neutral'} sm/>
                <Badge label={`Priorité ${t.prio}`} tone="neutral" sm/>
                <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Source : {t.source}</span>
                <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>Échéance : {t.due}</span>
              </div>
            </div>
            <div style={{display:'flex',gap:5,flexShrink:0}}>
              <button style={btnOut}>Voir détail</button>
              <button style={btnGreen}><Ico.Check/>Marquer terminé</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── PANEL DIAGNOSTICS ── */
const PanelDiag = () => (
  <div style={{paddingBottom:16}}>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
      <button style={btnGreen}><Ico.Zap/>Lancer un diagnostic</button>
    </div>
    {FC3_AUDITS.map((a,i)=>(
      <div key={i} style={{...card,padding:'13px 16px',marginBottom:8,display:'flex',alignItems:'center',gap:14}}>
        <Gauge value={a.score} size={54}/>
        <div style={{flex:1}}>
          <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--fg-1)',marginBottom:5}}>{a.name}</div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <Badge label={a.type} tone="neutral" sm/>
            <Badge label="Terminé" tone="green" sm/>
            <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{a.date}</span>
          </div>
        </div>
        <div style={{display:'flex',gap:5}}>
          <a href="Audit Comparaison.html" style={{...btnOut,textDecoration:'none'}}>Comparer</a>
          <a href="Audit Detail.html" style={{...btnOut,textDecoration:'none'}}>Voir le détail</a>
        </div>
      </div>
    ))}
  </div>
);

/* ── PANEL REPORTS ── */
const PanelReports = () => (
  <div style={{paddingBottom:16}}>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
      <button style={btnGreen}><Ico.Doc/>Générer le rapport client</button>
    </div>
    {FC3_REPORTS.map((r,i)=>(
      <div key={i} style={{...card,padding:'13px 16px',marginBottom:8,display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:44,height:44,borderRadius:10,background:'var(--green-d)',border:'1px solid var(--green-b)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--green-fg)',flexShrink:0}}><Ico.Doc/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:'0.875rem',fontWeight:700,color:'var(--fg-1)',marginBottom:5}}>Rapport {r.period}</div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <Badge label="Envoyé" tone="green" sm/>
            <span style={{fontSize:'0.5rem',color:'var(--fg-3)'}}>{r.date} · {r.pages} sections</span>
          </div>
        </div>
        <div style={{display:'flex',gap:5}}>
          <button style={btnOut}><Ico.Eye/>Prévisualiser</button>
          <button style={btnOut}><Ico.Send/>Renvoyer</button>
        </div>
      </div>
    ))}
  </div>
);

/* ── PANEL CONTRAT ── */
const PanelContrat = () => (
  <div style={{paddingBottom:16}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
      {[
        {label:'MRR actuel',            value:'1 200 $ CA', sub:'par mois',              tone:'green'},
        {label:'Engagement',            value:'12 mois',    sub:'Jusqu\'au 31 déc. 2026', tone:'neutral'},
        {label:'Prochain renouvellement',value:'31 déc.',   sub:'dans 203 jours',         tone:'blue'},
        {label:'Statut du compte',       value:'À jour',    sub:'Aucun retard',            tone:'green'},
      ].map((s,i)=>(
        <div key={i} style={{...card,padding:'14px 16px'}}>
          <Lbl text={s.label}/>
          <div style={{fontSize:'1.25rem',fontWeight:800,color:'var(--fg-1)',letterSpacing:'-0.03em',marginBottom:3}}>{s.value}</div>
          <div style={{fontSize:'0.5625rem',color:'var(--fg-3)'}}>{s.sub}</div>
        </div>
      ))}
    </div>
    <div style={{...card,padding:'14px 16px'}}>
      <Lbl text="Plan actif"/>
      <div style={{fontSize:'1rem',fontWeight:800,color:'var(--fg-1)',marginBottom:10}}>Croissance SEO</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        {['SEO Technique','Contenu éditorial','Audits mensuels','Backlinks'].map(m=><Badge key={m} label={m} tone="green"/>)}
      </div>
    </div>
  </div>
);

Object.assign(window, {
  LeftPanel, RightPanel, PanelApercu, PanelSEO, PanelPlan, PanelDiag, PanelReports, PanelContrat,
  FC3_CLIENT, FC3_KPIS, FC3_PRIORITIES, FC3_TASKS, FC3_PROOFS, FC3_COMPETITORS, FC3_MY, FC3_ACTIVITY, FC3_SPARK, FC3_REPORTS,
});
