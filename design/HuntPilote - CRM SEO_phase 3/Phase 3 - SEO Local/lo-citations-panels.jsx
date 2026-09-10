/* HuntPilote — SEO local · Citations et annuaires : panneaux (référence, liste hiérarchisée, détail d'incohérence). */
const { useState: uCS } = React;
const { AIco: CAI, APill: CAP, ASec: CAS, ALbl: CAL, CITATION_STATE_DEFS, AUTORITE_TIER } = window;

const AutoriteBars = ({ tier }) => {
  const n = AUTORITE_TIER[tier];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2 }} title={`Autorité ${tier}`} aria-label={`Autorité ${tier}`}>
      {[1, 2, 3].map(i => <span key={i} style={{ width: 3, height: 4 + i * 3, borderRadius: 1, background: i <= n ? 'var(--fg2)' : 'var(--bd-solid)' }}></span>)}
    </span>);
};

/* ── LA RÉFÉRENCE ── */
const ReferenceCard = ({ info }) => (
  <CAS title="La référence" sub="Ce que le nom, l’adresse et le téléphone devraient afficher partout">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[['Nom', info.nom], ['Adresse', info.adresse], ['Téléphone', info.telephone], ['Site web', info.siteweb]].map(([l, v]) => (
        <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}><CAL mb={0} style={{ flex: '0 0 6rem' }}>{l}</CAL><span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: l !== 'Nom' ? 'var(--font-mono)' : 'var(--font)' }}>{v}</span></div>))}
    </div>
  </CAS>);

/* ── UNE LIGNE D'ANNUAIRE ── */
const AnnuaireRow = ({ row, expanded, onToggle, onCreatePrio, onCreateTache, created }) => {
  const st = CITATION_STATE_DEFS[row.etat];
  const problem = row.etat === 'incoherent' || row.etat === 'doublon';
  return (
    <div className="crit" data-st={row.etat === 'doublon' ? 'fail' : row.etat === 'incoherent' ? 'warn' : row.etat === 'inaccessible' ? 'na' : 'ok'}>
      <span className="crit-ico" data-st={row.etat === 'doublon' ? 'fail' : row.etat === 'incoherent' ? 'warn' : row.etat === 'inaccessible' ? 'na' : 'ok'}>{row.etat === 'conforme' ? <CAI.Check /> : row.etat === 'absent' ? <CAI.Plug /> : row.etat === 'inaccessible' ? <CAI.Clock /> : <CAI.Warn />}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: row.etat === 'conforme' || row.etat === 'absent' ? 0 : 3 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{row.annuaire}</span>
          <AutoriteBars tier={row.autorite} />
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', textTransform: 'capitalize' }}>Autorité {row.autorite}</span>
          <CAP label={st.label} tone={st.tone} sm />
        </div>
        {problem && !expanded && <button className="btn-out" style={{ marginTop: 4 }} onClick={onToggle}>Voir le détail</button>}
        {row.etat === 'inaccessible' && <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginTop: 2 }}>{row.inaccessibleNote}</div>}
        {problem && expanded && (
          <div style={{ marginTop: 6 }}>
            {row.etat === 'incoherent' && (
              <div className="hp-table hp-cols-3" style={{ display: 'grid', gridTemplateColumns: '6rem 1fr 1fr', gap: '4px 10px', alignItems: 'center', marginBottom: 8 }}>
                <div className="lbl" style={{ paddingBottom: 4 }}>Champ</div><div className="lbl" style={{ paddingBottom: 4 }}>Publié</div><div className="lbl" style={{ paddingBottom: 4 }}>Attendu</div>
                {row.champs.map(c => <React.Fragment key={c.champ}><span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{c.champ}</span><span style={{ fontSize: '0.6875rem', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{c.publie}</span><span style={{ fontSize: '0.6875rem', color: 'var(--green-fg)', fontFamily: 'var(--font-mono)' }}>{c.attendu}</span></React.Fragment>)}
              </div>)}
            {row.etat === 'doublon' && <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 8 }}>{row.doublonNote}</div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {created ? <CAP label={`Priorité ${created} ouverte`} tone="blue" sm /> : <React.Fragment><button className="btn-out" onClick={onCreatePrio}><CAI.Plus />Créer la priorité</button><button className="btn-out" onClick={onCreateTache}><CAI.Plus />Créer la tâche de correction</button></React.Fragment>}
            </div>
          </div>)}
      </div>
    </div>);
};
Object.assign(window, { AutoriteBars, ReferenceCard, AnnuaireRow });
