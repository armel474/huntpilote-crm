/* HuntPilote — Rapports à produire : progression du cycle, filtres, lignes client et blocs de déblocage. */
const { useState: useRQ } = React;

const QI = {
  Doc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Send: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Lock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Pen: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Bell: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  Trophy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Sleep: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
};

const RQ_TONE = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
const QPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = RQ_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const STATE_ICON = { apreparer: QI.Doc, brouillon: QI.Pen, bloque: QI.Lock, pret: QI.Send, publie: QI.Check, corrige: QI.Check, sanspreuve: QI.Warn };
const ordDay = d => d === 1 ? '1er' : String(d);

/* ── PROGRESSION DU CYCLE ── */
const CycleCard = ({ rows, cycle }) => {
  const sent = rows.filter(r => window.RQ_SENT.includes(r.state)).length;
  const total = rows.length;
  const late = rows.filter(r => window.rqLate(r, cycle)).length;
  const blocked = rows.filter(r => r.state === 'bloque').length;
  const noProof = rows.filter(r => r.proofs < window.RQ_PROOF_MIN).length;
  const toUnblock = rows.filter(r => window.rqGroup(r, cycle) === 'debloquer').length;
  const pct = total ? Math.round(sent / total * 100) : 0;
  const behind = cycle.today > cycle.targetDay && sent < total;
  const tone = sent === total ? 'var(--green-fg)' : behind ? 'var(--red)' : 'var(--yellow-fg)';
  return (
    <div className="card" style={{ padding: '0.875rem 1rem', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>Progression du cycle — {cycle.period}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>Période close le {cycle.closedOn} · envoi par défaut {cycle.defaultDue} · cible : tous partis le {cycle.targetLabel} · nous sommes le {cycle.todayLabel}</div>
        </div>
        {behind && <QPill label={`${cycle.today - cycle.targetDay} jour${cycle.today - cycle.targetDay > 1 ? 's' : ''} de retard sur la cible`} tone="red" icon={<QI.Warn />} />}
        {sent === total && total > 0 && <QPill label="Cycle terminé" tone="green" icon={<QI.Check />} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: tone, fontVariantNumeric: 'tabular-nums' }}>{sent} sur {total}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>rapports partis sur {total} attendus</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden', position: 'relative' }} role="img" aria-label={`${pct} % des rapports partis`}>
        <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 999 }}></div>
      </div>
      <div style={{ marginTop: 7, display: 'flex', gap: 4, flexDirection: 'column', fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, color: toUnblock > 0 ? 'var(--red)' : 'var(--fg3)' }}>{toUnblock === 0 ? 'Rien à débloquer' : `${toUnblock} à débloquer · ${late} en retard sur la date promise, ${blocked} bloqué${blocked > 1 ? 's' : ''} par une relecture`}</span>
        <span style={{ fontWeight: 700, color: noProof > 0 ? 'var(--yellow-fg)' : 'var(--fg3)' }}>{noProof === 0 ? 'Tous les comptes ont au moins une preuve' : `${noProof} client${noProof > 1 ? 's' : ''} sans preuve ce mois-ci (seuil : ${window.RQ_PROOF_MIN} preuve minimum)`}</span>
      </div>
    </div>);
};

/* ── FILTRES ── */
const RqFilter = ({ f, setF, counts, noProofOnly, setNoProofOnly, shown, total }) => (
  <div className="card" style={{ padding: '0.7rem 0.875rem', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <div className="chips">
      <button type="button" className={`chip${f === 'tout' ? ' on' : ''}`} onClick={() => setF('tout')}>Tout le portefeuille</button>
      {window.RQ_GROUPS.map(([id, label]) => <button key={id} type="button" className={`chip${f === id ? ' on' : ''}`} onClick={() => setF(id)}>{label} · {counts[id] || 0}</button>)}
    </div>
    <button type="button" className={`chip${noProofOnly ? ' on' : ''}`} onClick={() => setNoProofOnly(!noProofOnly)}>Sans preuve seulement</button>
    <span style={{ marginLeft: 'auto', fontSize: '0.625rem', color: 'var(--fg3)' }}>{shown} sur {total} clients</span>
  </div>);

/* ── LIGNE CLIENT ── */
const RqRow = ({ r, cycle, onNudge }) => {
  const st = window.RQ_STATES[r.state], Icon = STATE_ICON[r.state];
  const late = window.rqLate(r, cycle);
  const noProof = r.proofs < window.RQ_PROOF_MIN;
  const blockers = r.blockers || [];
  return (
    <div className="rq-row" style={late ? { borderColor: 'var(--red-b)' } : undefined}>
      <div className="rq-main">
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', fontSize: '0.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--fg2)' }} title={`Chargé de compte ${r.pm}`}>{r.pm}</span>
          <a href="Fiche Client v4.html" style={{ textDecoration: 'none', color: 'inherit' }}><span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{r.client}</span></a>
          <span className="lbl">{r.plan}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
          <QPill label={st.label} tone={st.tone} sm icon={<Icon />} />
          {late && <QPill label={`En retard de ${cycle.today - r.due} jour${cycle.today - r.due > 1 ? 's' : ''}`} tone="red" sm icon={<QI.Warn />} />}
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{r.sentOn ? `Envoyé le ${r.sentOn} · ${r.version} en ligne` : `Promis le ${ordDay(r.due)} · seuil : ${cycle.defaultDue}`}</span>
        </div>
        {blockers.length > 0 && (
          <div className="rq-block">
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><QI.Lock /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 3 }}>{blockers.length} libellé{blockers.length > 1 ? 's' : ''} client à relire avant publication</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {blockers.map((b, i) => <li key={i} style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.4 }}>« {b.label} » — {b.who}</li>)}
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <a href="Editeur Rapport.html" className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem', textDecoration: 'none' }}><QI.Pen />Relire les {blockers.length} libellé{blockers.length > 1 ? 's' : ''}</a>
              <button className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem' }} onClick={() => onNudge(r)}><QI.Bell />Relancer {blockers[0].who.split(' ')[0]}</button>
            </div>
          </div>)}
      </div>
      <div className="rq-side">
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: noProof ? 'var(--yellow-fg)' : 'var(--fg2)', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {noProof && <QI.Warn />}{r.proofs === 0 ? 'Aucune preuve' : `${r.proofs} preuve${r.proofs > 1 ? 's' : ''}`}
        </span>
        <span style={{ fontSize: '0.5625rem', color: 'var(--fg4)' }}>{noProof ? `seuil : ${window.RQ_PROOF_MIN} minimum` : 'disponibles ce mois-ci'}</span>
      </div>
      <div className="rq-act">
        <a href="Editeur Rapport.html" className="btn-out" style={{ fontSize: '0.625rem', padding: '0.3rem 0.65rem', textDecoration: 'none' }}>{window.RQ_SENT.includes(r.state) ? 'Ouvrir le rapport' : 'Ouvrir l’éditeur'}<QI.Arrow /></a>
      </div>
    </div>);
};

/* ── SECTION DE GROUPE ── */
const RqGroupSection = ({ id, title, sub, rows, cycle, onNudge }) => {
  if (rows.length === 0) return null;
  const isDeb = id === 'debloquer';
  const body = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: isDeb ? 'var(--red)' : id === 'partis' ? 'var(--green-fg)' : 'var(--fg4)', flexShrink: 0 }}></span>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h2>
        <span className="lbl">{rows.length} client{rows.length > 1 ? 's' : ''}</span>
      </div>
      <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginBottom: 8, lineHeight: 1.5 }}>{sub}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{rows.map(r => <RqRow key={r.id} r={r} cycle={cycle} onNudge={onNudge} />)}</div>
    </React.Fragment>);
  return isDeb
    ? <div style={{ padding: '0.75rem 0.875rem', borderRadius: 12, background: 'var(--red-m)', border: '1px solid var(--red-b)', marginBottom: 16 }}>{body}</div>
    : <div style={{ marginBottom: 16 }}>{body}</div>;
};

/* ── BANNIÈRES D'ÉTAT ── */
const DebutBanner = ({ n, cycle }) => (
  <div className="note-box" style={{ marginBottom: 12 }}>
    <span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}><QI.Sleep /></span>
    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>La période vient de se clore.</b> Les {n} rapports de {cycle.period.toLowerCase()} sont à préparer, aucun n’est commencé — c’est normal le lendemain de la clôture. Les envois sont promis {cycle.defaultDue}.</div>
  </div>);
const PicBanner = ({ n, jours }) => (
  <div className="note-box" style={{ background: 'var(--yellow-m)', borderColor: 'var(--yellow-b)', marginBottom: 12 }}>
    <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><QI.Clock /></span>
    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>{n} rapports à sortir en {jours} jour{jours > 1 ? 's' : ''}</b>, aucun n’est encore parti. Commencez par les relectures : c’est ce qui bloque la publication, pas la rédaction.</div>
  </div>);
const FiniBanner = () => (
  <div className="note-box" style={{ background: 'var(--green-m)', borderColor: 'var(--green-b)', marginBottom: 12 }}>
    <span style={{ color: 'var(--green-fg)', display: 'flex', flexShrink: 0, marginTop: 1 }}><QI.Trophy /></span>
    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>Tous les rapports du cycle sont partis.</b> Rien n’attend de relecture, rien n’a dépassé sa date promise.</div>
  </div>);
const RqEmpty = () => (
  <div className="empty">
    <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucun client pour ce filtre</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)' }}>Revenez à « Tout le portefeuille » pour revoir le cycle complet.</div>
  </div>);

Object.assign(window, { QI, QPill, RQ_TONE, STATE_ICON, ordDay, CycleCard, RqFilter, RqRow, RqGroupSection, DebutBanner, PicBanner, FiniBanner, RqEmpty });
