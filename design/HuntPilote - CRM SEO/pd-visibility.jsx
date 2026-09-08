/* HuntPilote — Détail d'une priorité : visibilité client, libellé, en-tête et actions. */
const { useState: useVS, useEffect: useVE } = React;
const { PI, PD, PD_CLIENT, SEV, TONE, Pill, SevDot, Lbl, Sec } = window;

const VIS = [
  { id: 'interne', label: 'Interne', trig: 'Par défaut, à la détection', sees: 'Rien. Reste dans le cockpit de l’agence.', Icon: PI.EyeOff },
  { id: 'annonce', label: 'Annoncé', trig: 'Interrupteur manuel', sees: 'Le constat, sans échéance. Prépare une vente ou documente.', Icon: PI.Eye },
  { id: 'traitement', label: 'En traitement', trig: 'Automatique à l’entrée au plan d’action', sees: 'Le constat, ce qui est fait, l’avancement.', Icon: PI.Task },
];

/* ── VISIBILITÉ CLIENT + APERÇU ── */
const VisibilityCard = ({ vis, setVis, assigned, labelOk, label, closed }) => {
  const cur = VIS.find(v => v.id === vis);
  return (
    <Sec title="Visibilité client" sub="Une décision éditoriale : que verra le client dans son rapport ?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {VIS.map(v => {
          const on = vis === v.id, locked = v.id === 'traitement' ? !assigned : assigned || closed;
          return (
            <button key={v.id} className="vis-row" disabled={locked} aria-pressed={on} onClick={() => !locked && setVis(v.id)}
              style={{ background: on ? 'var(--bg-solid)' : 'transparent', borderColor: on ? 'var(--fg1)' : 'var(--bd-solid)', boxShadow: on ? '0 0 0 1px var(--fg1)' : 'none', opacity: locked && !on ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${on ? 'var(--fg1)' : 'var(--bd-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fg1)' }}></span>}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800 }}><v.Icon />{v.label}{on && <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'var(--fg4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>· état courant</span>}</span>
                <span style={{ display: 'block', fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{v.trig}</span>
                <span style={{ display: 'block', fontSize: '0.625rem', color: 'var(--fg2)', marginTop: 3, lineHeight: 1.45 }}>Le client voit : {v.sees}</span>
              </span>
            </button>);
        })}
      </div>
      {assigned && vis !== 'traitement' && <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginBottom: 8 }}>Passée automatiquement en traitement à l’assignation.</div>}
      <Lbl mb={6}>Aperçu — ce que voit le client maintenant</Lbl>
      <ClientPreview vis={vis} labelOk={labelOk} label={label} />
    </Sec>
  );
};

const ClientPreview = ({ vis, labelOk, label }) => {
  if (vis === 'interne') return (
    <div style={{ padding: '18px 14px', borderRadius: 10, border: '1.5px dashed var(--bd-strong)', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.6875rem', lineHeight: 1.5 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color: 'var(--fg4)' }}><PI.EyeOff /></div>
      Rien. Cette priorité n’apparaît ni dans le portail ni dans le rapport.
    </div>);
  return (
    <div className="client-doc">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ width: 16, height: 16, background: '#1F1F1F', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></span>
        <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{vis === 'annonce' ? 'Point d’attention' : 'En cours de traitement'}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: '#A1A1AA' }}>Rapport · {PD_CLIENT.name}</span>
      </div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#18181B', marginBottom: 4 }}>{PD.clientTitle}</div>
      <div style={{ position: 'relative', borderRadius: 6, outline: labelOk ? 'none' : '1.5px dashed #D4B24A', outlineOffset: 3 }}>
        <p style={{ fontSize: '0.6875rem', lineHeight: 1.55, color: '#3F3F46', margin: 0, textWrap: 'pretty' }}>{label}</p>
        {!labelOk && <span style={{ position: 'absolute', top: -9, right: 4, fontSize: '0.5rem', fontWeight: 700, background: '#F5E8B5', color: '#7A5D14', borderRadius: 999, padding: '1px 6px' }}>à relire</span>}
      </div>
      {vis === 'annonce' && <div style={{ fontSize: '0.5625rem', color: '#A1A1AA', marginTop: 8 }}>Aucune échéance communiquée.</div>}
      {vis === 'traitement' && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #E4E4E7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: '#3F3F46', marginBottom: 4 }}><b>Avancement</b><span>{PD.task.pct} %</span></div>
          <div style={{ height: 5, borderRadius: 999, background: '#E4E4E7', overflow: 'hidden' }}><div style={{ width: `${PD.task.pct}%`, height: '100%', background: '#16A34A' }}></div></div>
          <div style={{ fontSize: '0.5625rem', color: '#3F3F46', marginTop: 6, lineHeight: 1.45 }}><b>Fait :</b> {PD.task.done}</div>
        </div>)}
      {!labelOk && <div style={{ marginTop: 8, fontSize: '0.5625rem', color: '#7A5D14', display: 'flex', gap: 4, alignItems: 'center' }}><PI.Warn />Ce texte n’est pas encore validé par un humain — il ne sera pas publié.</div>}
    </div>);
};

/* ── LIBELLÉ CLIENT ── */
const LabelCard = ({ label, setLabel, labelOk, setLabelOk, vis }) => {
  const [edit, setEdit] = useVS(false);
  const visible = vis !== 'interne';
  return (
    <Sec title="Libellé client" sub="Rédigé par l’agent · la langue du client, pas la nôtre"
      right={labelOk ? <Pill label="Validé" tone="green" icon={<PI.Check />} /> : <Pill label="À relire" tone="yellow" icon={<PI.Warn />} />}>
      <div style={{ marginBottom: 8 }}>
        <Lbl mb={3}>Interne — équipe</Lbl>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg2)', fontFamily: 'var(--font-mono)' }}>{PD.internal}</div>
      </div>
      <Lbl mb={3}>Client — éditable</Lbl>
      <textarea className="lbl-edit" value={label} rows={5} onChange={e => { setLabel(e.target.value); setLabelOk(false); setEdit(true); }} aria-label="Libellé client" />
      {!labelOk ? (
        <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 9, background: visible ? 'var(--red-m)' : 'var(--yellow-m)', border: `1px solid ${visible ? 'var(--red-b)' : 'var(--yellow-b)'}` }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '0.6875rem', fontWeight: 700, color: visible ? 'var(--red)' : 'var(--yellow-fg)', lineHeight: 1.4 }}><span style={{ marginTop: 2 }}><PI.Warn /></span>{visible ? 'Bloque la publication du rapport de septembre.' : 'Bloquera la publication dès que la priorité sera visible.'}</div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, marginLeft: 18 }}>Un humain doit valider le texte avant qu’il ne soit montré au client.</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, marginLeft: 18, flexWrap: 'wrap' }}>
            <button className="btn-pri" style={{ padding: '0.35rem 0.8rem', fontSize: '0.6875rem' }} onClick={() => { setLabelOk(true); setEdit(false); }}><PI.Check />Valider le libellé</button>
            <button className="btn-out" style={{ padding: '0.3rem 0.7rem', fontSize: '0.6875rem', color: 'var(--violet-fg)', borderColor: 'var(--violet-b)' }} onClick={() => { setLabel(PD.clientLabel); }}>✦ Régénérer</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.5625rem', color: 'var(--fg3)' }}><span style={{ color: 'var(--green)', display: 'flex' }}><PI.Check /></span>Validé par {PD_CLIENT.pm} · 7 sept. 2026{edit && ' · modifié'}</div>
      )}
    </Sec>
  );
};

/* ── EN-TÊTE DU CONSTAT + ACTION PRINCIPALE ── */
const STATUS = {
  neuve: ['Neuve · non traitée', 'neutral'], arelire: ['Neuve · annoncée au client', 'blue'], assignee: ['Assignée · en traitement', 'blue'],
  resolue: ['Résolue', 'green'], recurrente: ['Récurrente · revenue après correction', 'red'], ignoree: ['Ignorée', 'neutral'], fauxpositif: ['Faux positif', 'neutral'],
};

const ConstatCard = ({ state, onAssign, onClose, onReactivate, onDefer, deferred }) => {
  const [menu, setMenu] = useVS(false);
  const [form, setForm] = useVS(null); // 'ignorer' | 'faux' | 'reporter'
  const [motif, setMotif] = useVS('');
  const s = SEV[PD.sev];
  const [stLabel, stTone] = STATUS[state];
  const closed = state === 'ignoree' || state === 'fauxpositif';
  const assigned = state === 'assignee', resolved = state === 'resolue', recurrent = state === 'recurrente';
  useVE(() => { const h = () => setMenu(false); if (menu) { document.addEventListener('click', h); return () => document.removeEventListener('click', h); } }, [menu]);
  const MOTIFS = { ignorer: ['Refonte du site prévue au T4', 'Hors périmètre du contrat', 'Priorité jugée non rentable', 'Décision du client'], faux: ['Mesure lab non confirmée sur le terrain', 'Pages exclues volontairement (noindex)', 'Données de crawl obsolètes', 'Seuil mal calibré pour ce secteur'] };
  return (
    <div className="card" style={{ padding: '1rem 1.125rem', borderLeft: `3px solid ${s.c}` }}>
      <div className="constat-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <Pill label={s.label} tone={PD.sev === 'critique' ? 'red' : PD.sev === 'important' ? 'yellow' : 'green'} icon={<SevDot sev={PD.sev} />} />
            <Pill label={`${PD.dim} · ${PD.sub}`} tone="neutral" />
            <Pill label={stLabel} tone={stTone} icon={recurrent ? <PI.Rotate /> : resolved ? <PI.Check /> : null} />
            {deferred && <Pill label="Reportée à octobre" tone="yellow" icon={<PI.Clock />} />}
            <span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg4)', fontVariantNumeric: 'tabular-nums' }}>{PD.id}</span>
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0, textWrap: 'balance', textDecoration: closed ? 'line-through' : 'none', color: closed ? 'var(--fg3)' : 'var(--fg1)' }}>{PD.internal}</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: '0.625rem', color: 'var(--fg3)' }}>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><PI.Clock />{recurrent ? 'Première détection 18 nov. 2025 · revenue 25 mars 2026' : `Détectée le ${PD.firstSeen} · existe depuis ${PD.ageDays} jours`}</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><PI.Db />{PD.prov.audit} · {PD.prov.date} · CrUX + PageSpeed</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><PI.Warn />6 pages · 18 270 sessions/mois</span>
          </div>
        </div>

        {/* Zone d'action */}
        <div className="action-zone" style={{ flexShrink: 0, width: 300, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(state === 'neuve' || state === 'arelire' || recurrent) && (
            <React.Fragment>
              <button className="btn-pri btn-main" onClick={onAssign}><PI.Plus />Assigner au plan d’action</button>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', textAlign: 'center' }}>Crée une tâche et passe la priorité <b>en traitement</b>.</div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 6 }}>
                {recurrent && <a href="Fiche Client v4.html" className="btn-out" style={{ fontSize: '0.6875rem', textDecoration: 'none' }}><PI.Task />Tâche #97</a>}
                <button className="btn-out" style={{ fontSize: '0.6875rem' }} onClick={e => { e.stopPropagation(); setMenu(m => !m); }}>Autres actions<PI.Chev deg={menu ? 180 : 0} /></button>
                {menu && (
                  <div className="menu" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setForm('reporter'); setMenu(false); }}><PI.Clock />Reporter la priorité</button>
                    <button onClick={() => { setForm('ignorer'); setMotif(MOTIFS.ignorer[0]); setMenu(false); }}><PI.EyeOff />Ignorer (avec motif)</button>
                    <button onClick={() => { setForm('faux'); setMotif(MOTIFS.faux[0]); setMenu(false); }}><PI.Warn />Marquer comme faux positif</button>
                  </div>)}
              </div>
            </React.Fragment>)}
          {assigned && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--blue-m)', border: '1px solid var(--blue-b)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><span style={{ color: 'var(--blue-fg)', display: 'flex' }}><PI.Task /></span><span className="lbl" style={{ color: 'var(--blue-fg)' }}>Tâche créée</span><span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{PD.task.id}</span></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{PD.task.title}</div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{PD.task.who} · {PD.task.status} · échéance {PD.task.due}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden' }}><div style={{ width: `${PD.task.pct}%`, height: '100%', background: 'var(--blue)' }}></div></div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{PD.task.pct} %</span>
              </div>
              <a href="Fiche Client v4.html" className="btn-pri" style={{ marginTop: 9, width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '0.6875rem' }}>Ouvrir la tâche<PI.Arrow /></a>
            </div>)}
          {resolved && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--green-m)', border: '1px solid var(--green-b)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><span style={{ color: 'var(--green-fg)', display: 'flex' }}><PI.Trophy /></span><span className="lbl" style={{ color: 'var(--green-fg)' }}>Preuve de valeur</span><span style={{ marginLeft: 'auto', fontSize: '0.5625rem', color: 'var(--fg3)' }}>{PD.proof.date}</span></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg3)', textDecoration: 'line-through', letterSpacing: '-0.02em' }}>{PD.proof.before}</span>
                <span style={{ color: 'var(--fg4)', display: 'flex' }}><PI.Arrow /></span>
                <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--green-fg)', letterSpacing: '-0.03em' }}>{PD.proof.after}</span>
                <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>LCP p75</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginTop: 3 }}>{PD.proof.sessions}</div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>Tâche {PD.task.id} · incluse au {PD.proof.report}</div>
              <a href="Fiche Client v4.html" className="btn-out" style={{ marginTop: 9, width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: '0.6875rem' }}><PI.Eye />Voir dans le rapport</a>
            </div>)}
          {closed && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)' }}>
              <div className="lbl" style={{ marginBottom: 4 }}>{state === 'ignoree' ? 'Ignorée le 3 sept. 2026 · Marie Chen' : 'Faux positif · 3 sept. 2026 · Marie Chen'}</div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Motif : {state === 'ignoree' ? 'refonte du site prévue au T4' : 'mesure lab non confirmée sur le terrain'}</div>
              {state === 'fauxpositif' && <div style={{ marginTop: 6, display: 'flex', gap: 5, alignItems: 'flex-start', fontSize: '0.5625rem', color: 'var(--violet-fg)', lineHeight: 1.4 }}><span>✦</span>L’agent en tient compte : seuil LCP recalibré pour ce client, mesure terrain exigée avant détection.</div>}
              <button className="btn-out" style={{ marginTop: 9, width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }} onClick={onReactivate}><PI.Rotate />Réactiver la priorité</button>
            </div>)}
        </div>
      </div>

      {/* Formulaire secondaire inline */}
      {form && (
        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <Lbl mb={4}>{form === 'reporter' ? 'Reporter jusqu’à' : form === 'ignorer' ? 'Motif d’abandon' : 'Pourquoi est-ce un faux positif ?'}</Lbl>
            {form === 'reporter'
              ? <select className="sel" value={motif} onChange={e => setMotif(e.target.value)}>{['Prochain rapport (octobre)', 'Prochain audit trimestriel', 'Dans 3 mois'].map(o => <option key={o}>{o}</option>)}</select>
              : <select className="sel" value={motif} onChange={e => setMotif(e.target.value)}>{MOTIFS[form].map(o => <option key={o}>{o}</option>)}</select>}
          </div>
          {form === 'faux' && <div style={{ flex: '1 1 100%', fontSize: '0.5625rem', color: 'var(--violet-fg)', display: 'flex', gap: 5 }}><span>✦</span>Ce motif alimente le réglage de l’agent : il ajustera ses seuils pour ce client.</div>}
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-out" style={{ fontSize: '0.6875rem' }} onClick={() => setForm(null)}>Annuler</button>
            <button className="btn-pri" style={{ fontSize: '0.6875rem' }} onClick={() => { form === 'reporter' ? onDefer() : onClose(form === 'ignorer' ? 'ignoree' : 'fauxpositif'); setForm(null); }}>
              {form === 'reporter' ? 'Confirmer le report' : form === 'ignorer' ? 'Ignorer cette priorité' : 'Marquer faux positif'}
            </button>
          </div>
        </div>)}
    </div>
  );
};

Object.assign(window, { VIS, VisibilityCard, ClientPreview, LabelCard, ConstatCard, STATUS });
