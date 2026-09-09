/* HuntPilote — cadre des outils : données de démonstration et blocs du cadre.
   Réutilise AIco / APill / ASec / CritRow (au-data.jsx, au-panels.jsx). Exporté sur window. */
const { useState: uS, useRef: uR } = React;
const AI2 = window.AIco, AP2 = window.APill, AS2 = window.ASec, AL2 = window.ALbl;

const TI = {
  Save: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  Filter: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Export: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  Snap: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  Coin: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M15 9.5A3 3 0 0012 8h-1a2 2 0 000 4h2a2 2 0 010 4h-1a3 3 0 01-3-1.5" /></svg>,
  Info: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="11" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
};

/* Comptes : clients et prospects dans la même liste, distingués par leur type. */
const TOOL_ACCOUNTS = [
  { id: 'acme', name: 'Acme Corp.', domain: 'acmecorp.ca', type: 'client', plan: 'Croissance' },
  { id: 'boreal', name: 'Boréal Immobilier', domain: 'borealimmo.ca', type: 'client', plan: 'Essentiel' },
  { id: 'lavoie', name: 'Clinique Lavoie', domain: 'cliniquelavoie.com', type: 'client', plan: 'Croissance' },
  { id: 'nordik', name: 'Spa Nordik Estrie', domain: 'spanordik-estrie.ca', type: 'prospect', plan: 'Prospect · devis envoyé' },
  { id: 'fortin', name: 'Quincaillerie Fortin', domain: 'fortin-quincaillerie.ca', type: 'prospect', plan: 'Prospect · premier contact' },
];
const TOOL_ACCT_KEY = 'huntpilote-outil-compte';
const readLastAcct = () => { try { return localStorage.getItem(TOOL_ACCT_KEY); } catch { return null; } };
const writeLastAcct = id => { try { localStorage.setItem(TOOL_ACCT_KEY, id); } catch {} };

/* Contenu fictif de l'outil de démonstration : des lignes de résultat, rien de plus. */
const TOOL_ROWS = [
  { c: 'toiture montréal', st: 'fail', measure: 'Position 18', threshold: 'seuil ≤ 10', vol: 1900, note: '1 900 recherches/mois · première page atteignable selon la difficulté (41/100).' },
  { c: 'réparation toiture prix', st: 'warn', measure: 'Position 12', threshold: 'seuil ≤ 10', vol: 880, prio: 'P-0418' },
  { c: 'soumission toiture rive-sud', st: 'fail', measure: 'Absent du top 100', threshold: 'seuil ≤ 10', vol: 640, note: 'Aucune page ne cible cette requête.' },
  { c: 'couvreur rive-sud', st: 'ok', measure: 'Position 6', threshold: 'seuil ≤ 10', vol: 520 },
  { c: 'entretien toiture hiver', st: 'warn', measure: 'Position 14', threshold: 'seuil ≤ 10', vol: 210 },
  { c: 'toiture urgence fuite', st: 'ok', measure: 'Position 3', threshold: 'seuil ≤ 10', vol: 170 },
];
const TOOL_SAVES = [
  { d: '4 sept. 2026', t: 'Position Tracking', w: '34 mots-clés · instantané mensuel' },
  { d: '28 août 2026', t: 'Site Audit', w: 'Score technique 71 · 12 constats' },
  { d: '21 août 2026', t: 'Backlink Analyse', w: '+18 domaines référents (delta)' },
];

/* ── BARRE DE CONTEXTE (sous-barre existante) : compte, filtre, domaine, période, coût, action principale ── */
const ContextBar = ({ acct, onAcct, filter, onFilter, domain, onDomain, period, onPeriod, periods = ['30 derniers jours', '3 derniers mois', '12 derniers mois'], periodLabel = 'Période', cost, costText, costTitle, saved, onSave, canSave, saveHint, action, selRef }) => {
  const list = TOOL_ACCOUNTS.filter(a => filter === 'tous' || (filter === 'clients' ? a.type === 'client' : a.type === 'prospect'));
  const clients = list.filter(a => a.type === 'client'), prospects = list.filter(a => a.type === 'prospect');
  return (
    <div className="subbar">
      <div className="ctx-g">
        <span className="lbl" style={{ marginBottom: 0 }}>Compte</span>
        <select ref={selRef} className="acct-sel" value={acct ? acct.id : ''} onChange={e => onAcct(e.target.value)} aria-label="Compte analysé">
          <option value="">Choisir un compte…</option>
          {clients.length > 0 && <optgroup label="Clients">{clients.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>}
          {prospects.length > 0 && <optgroup label="Prospects · instantané seulement">{prospects.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>}
        </select>
        {acct && <AP2 label={acct.type === 'client' ? 'Client' : 'Prospect'} tone={acct.type === 'client' ? 'green' : 'yellow'} sm icon={acct.type === 'client' ? <AI2.Check /> : <TI.Snap />} />}
      </div>
      <div className="seg" role="group" aria-label="Filtrer la liste des comptes">
        {[['clients', 'Clients'], ['prospects', 'Prospects'], ['tous', 'Tous']].map(([id, l]) =>
          <button key={id} type="button" className={filter === id ? 'on' : ''} aria-pressed={filter === id} onClick={() => onFilter(id)}>{l}</button>)}
      </div>
      <div className="ctx-sep" aria-hidden="true"></div>
      <div className="ctx-g">
        <span className="lbl" style={{ marginBottom: 0 }}>Domaine</span>
        <div className="dom-field" data-edited={acct && domain !== acct.domain}>
          <span style={{ color: 'var(--fg3)', display: 'flex' }}><AI2.Globe /></span>
          <input value={domain} onChange={e => onDomain(e.target.value)} placeholder="domaine.ca" aria-label="Domaine analysé" spellCheck="false" />
        </div>
        {acct && domain !== acct.domain && <AP2 label="Concurrent · hors fiche" tone="blue" sm />}
      </div>
      <select className="date-sel" value={period} onChange={e => onPeriod(e.target.value)} aria-label={periodLabel}>
        {periods.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
        {costText
          ? <span className="cost-chip" title={costTitle || 'Coût de ce compte pour cet outil'}><TI.Coin />{costText}</span>
          : <span className="cost-chip" title="Coût facturé par le fournisseur de données pour cette requête"><TI.Coin />{cost.credits} crédits · {cost.dollars}</span>}
        {action ? action : (saved
          ? <a href="Fiche Client v4.html" style={{ textDecoration: 'none' }}><span className="btn-out"><AI2.Check />Enregistré · voir la fiche</span></a>
          : <button className="btn-go" onClick={onSave} disabled={!canSave} title={canSave ? 'Verse ce résultat à l’historique du client' : (saveHint || 'Un résultat exploitable est requis')}><TI.Save />Enregistrer dans la fiche</button>)}
      </div>
    </div>);
};

/* ── BANDEAUX D'ÉTAT — un seul à la fois, le plus bloquant d'abord ── */
const Banner = ({ kind, quota, onRetry, onFocusAcct }) => {
  const B = {
    nonconnecte: ['yellow', <AI2.Plug />, <span><b>Intégration au fournisseur de données non connectée.</b> Cet outil ne peut rien interroger avant que la clé d’API soit ajoutée aux paramètres de l’agence.</span>, <a href="Parametres.html" className="btn-out" style={{ textDecoration: 'none' }}><AI2.Plug />Connecter l’intégration</a>],
    erreur: ['red', <AI2.Warn />, <span><b>Le fournisseur n’a pas répondu (502).</b> Aucun crédit n’a été facturé pour cette requête.</span>, <button className="btn-out" onClick={onRetry}><AI2.Refresh />Réessayer</button>],
    quota: ['yellow', <TI.Coin />, <span><b>Quota mensuel bientôt atteint — {(quota || { used: 0, max: 1 }).used.toLocaleString('fr-CA')} / {(quota || { used: 0, max: 1 }).max.toLocaleString('fr-CA')} crédits ({Math.round((quota || { used: 0, max: 1 }).used / (quota || { used: 0, max: 1 }).max * 100)} %).</b> Les requêtes lourdes seront refusées à partir de la limite.</span>, <a href="Parametres.html" className="btn-out" style={{ textDecoration: 'none' }}>Voir la consommation</a>],
    prospect: ['yellow', <TI.Snap />, <span><b>Instantané — non historisé.</b> Un prospect n’a pas d’historique : ce résultat sert au démarchage et n’est pas conservé après 30 jours.</span>, <a href="Pipeline.html" className="btn-out" style={{ textDecoration: 'none' }}>Convertir en client<AI2.Arrow /></a>],
    nosel: ['blue', <TI.Info />, <span><b>Aucun compte sélectionné.</b> Les outils s’exécutent toujours pour un compte : c’est lui qui pré-remplit le domaine et reçoit les résultats enregistrés.</span>, <button className="btn-out" onClick={onFocusAcct}>Choisir un compte</button>],
  }[kind];
  if (!B) return null;
  const [tone, ico, text, act] = B;
  return (<div className="banner" data-tone={tone}><span className="banner-ico">{ico}</span><div style={{ flex: 1, minWidth: '14rem' }}>{text}</div><div className="banner-act">{act}</div></div>);
};

Object.assign(window, { TI, TOOL_ACCOUNTS, TOOL_ROWS, TOOL_SAVES, TOOL_ACCT_KEY, readLastAcct, writeLastAcct, ContextBar, Banner });
