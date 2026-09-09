/* HuntPilote — Backlink Analyse : blocs de l'outil. Réutilise .card, ASec, APill. */
const { useState: uBL } = React;
const AI6 = window.AIco, AP6 = window.APill, AS6 = window.ASec, BI6 = window.BLI;

/* ── PROFIL DE BACKLINKS ── */
const ProfileCard = ({ p, anchors, incomplet }) => {
  const d = (a, b) => a - b;
  return (
    <AS6 title="Profil de backlinks" sub={`Relevé du ${p.date} · ${p.domains} domaines référents`}>
      <div className="prof-grid">
        <div className="dist-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Domaines référents</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="sum-val">{p.domains}</span><span className="delta" style={{ color: 'var(--green-fg)' }}><AI6.Up /><span>+{d(p.domains, p.domainsPrev)}</span></span></div>
        </div>
        <div className="dist-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Autorité moyenne</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span className="sum-val">{p.authority}</span><span className="delta" style={{ color: 'var(--green-fg)' }}><AI6.Up /><span>+{d(p.authority, p.authorityPrev)}</span></span></div>
        </div>
        <div className="dist-cell">
          <div className="lbl" style={{ marginBottom: 4 }}>Suivis / non suivis</div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 800 }}>{p.followed} % <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'var(--fg3)' }}>suivis</span></div>
        </div>
      </div>
      <div className="lbl">Ancres les plus fréquentes</div>
      {incomplet
        ? <div className="empty" style={{ padding: '10px 8px' }}><span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Ancres indisponibles — données du fournisseur incomplètes pour ce relevé.</span></div>
        : anchors.map(a => (
          <div className="anchor-row" key={a.t}>
            <span style={{ fontFamily: 'var(--font-mono)', flex: '0 0 11rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.t}</span>
            <span className="anchor-bar"><span style={{ width: `${a.n / anchors[0].n * 100}%` }}></span></span>
            <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums', width: '2.4rem', textAlign: 'right' }}>{a.n}</span>
          </div>))}
    </AS6>);
};

/* ── GAINS ET PERTES — la seule donnée historisée, et ce qui informe ── */
const GainsLossesCard = ({ gains, losses, reported, onReport, onCreate, created }) => (
  <AS6 title="Gains et pertes de la période" sub="Le corpus complet n’est pas conservé — seuls ces mouvements le sont.">
    <div className="mov-grid">
      <div>
        <div className="mov-col-head" style={{ color: 'var(--green-fg)' }}><AI6.Plus />{gains.length} domaine{gains.length > 1 ? 's' : ''} gagné{gains.length > 1 ? 's' : ''}</div>
        {gains.map(g => (
          <div className="link-row" key={g.domain}>
            <span className="link-ico" style={{ background: 'var(--green-m)', color: 'var(--green-fg)', borderColor: 'var(--green-b)' }}><BI6.Link /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="link-dom">{g.domain} <span className="auth-pill">AD {g.authority}</span></div>
              <div className="link-meta">ancre « {g.anchor} » → {g.url} · {g.date}</div>
            </div>
            {reported[g.domain]
              ? <AP6 label="Versé au rapport" tone="green" sm icon={<AI6.Check />} />
              : <button className="btn-out" onClick={() => onReport(g.domain)}><AI6.Plus />Verser au rapport</button>}
          </div>))}
      </div>
      <div>
        <div className="mov-col-head" style={{ color: 'var(--red)' }}><AI6.Down />{losses.length} domaine{losses.length > 1 ? 's' : ''} perdu{losses.length > 1 ? 's' : ''}</div>
        {losses.map(l => {
          const prio = created[l.domain];
          return (
            <div className="link-row" key={l.domain}>
              <span className="link-ico" style={{ background: 'var(--red-m)', color: 'var(--red)', borderColor: 'var(--red-b)' }}><AI6.X /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="link-dom">{l.domain} <span className="auth-pill">AD {l.authority}</span></div>
                <div className="link-meta">{l.reason} · ancre « {l.anchor} » · {l.date}</div>
              </div>
              {l.authority >= 40 && (prio
                ? <AP6 label={prio} tone="blue" sm icon={<AI6.Arrow />} />
                : <button className="btn-out" onClick={() => onCreate(l.domain)}><AI6.Plus />Créer la priorité</button>)}
            </div>);
        })}
      </div>
    </div>
  </AS6>);

/* ── LIENS TOXIQUES ── */
const ToxicCard = ({ rows, onDisavow, onCreate, created }) => {
  const remaining = rows.filter(r => r.status === 'a-desavouer').length;
  const key = 'toxic-batch', prio = created[key];
  return (
    <AS6 title="Liens toxiques ou suspects" sub={`${rows.length} domaines détectés · score de spam au-delà du seuil de risque`}
      right={prio ? <AP6 label={`Priorité ${prio} ouverte`} tone="blue" sm icon={<AI6.Arrow />} /> : remaining > 0 ? <button className="btn-out" onClick={() => onCreate(key)}><AI6.Plus />Créer la priorité · désaveu groupé</button> : null}>
      {rows.map(r => (
        <div className="link-row" key={r.domain}>
          <span className="link-ico" style={{ background: 'var(--red-m)', color: 'var(--red)', borderColor: 'var(--red-b)' }}><BI6.Skull /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="link-dom">{r.domain} <span className="auth-pill">AD {r.authority} · spam {r.spam}/100</span></div>
            <div className="link-meta">{r.reason} · seuil de risque : spam ≥ 70/100</div>
          </div>
          {r.status === 'desavoue'
            ? <AP6 label="Désavoué" tone="neutral" sm icon={<AI6.Check />} />
            : <button className="btn-out" onClick={() => onDisavow(r.domain)}><BI6.Ban />Désavouer</button>}
        </div>))}
    </AS6>);
};

/* ── COMPARAISON AVEC LES CONCURRENTS ── */
const CompetitorsCard = ({ rows, incomplet }) => {
  if (incomplet) return (
    <AS6 title="Comparaison avec les concurrents" sub="Renseignés dans la fiche client">
      <div className="empty"><span style={{ fontSize: '0.625rem', color: 'var(--fg3)' }}>Comparaison indisponible — données du fournisseur incomplètes pour ce relevé.</span></div>
    </AS6>);
  const max = Math.max(...rows.map(r => r.domains));
  return (
    <AS6 title="Comparaison avec les concurrents" sub="Domaines référents · renseignés dans la fiche client">
      {rows.map(r => (
        <div className="comp-row" key={r.name}>
          <span style={{ fontSize: '0.6875rem', fontWeight: r.self ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
          <span className="comp-bar" data-self={!!r.self}><span style={{ width: `${r.domains / max * 100}%` }}></span></span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.domains}</span>
        </div>))}
    </AS6>);
};

/* ── CONSERVATION — variante propre à cet outil : seuls gains/pertes s'historisent ── */
const BlKeepCard = ({ prospect }) => (
  <AS6 title="Conservation du résultat" sub="Ce que vous regardez existera-t-il demain ?">
    <div style={{ marginBottom: 9 }}>{prospect ? <AP6 label="Instantané · jamais historisé" tone="yellow" icon={<window.TI.Snap />} /> : <AP6 label="Partiellement historisé" tone="blue" icon={<AI6.Clock />} />}</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 11 }}>
      {prospect ? 'Un prospect ne reçoit pas d’historique de backlinks. Ce profil sert au démarchage et disparaît après 30 jours.'
        : 'Le corpus complet des backlinks n’est jamais conservé — il est trop volumineux et change en continu. Seuls les gains et les pertes de chaque relevé rejoignent l’historique du client.'}
    </div>
    <div className="keep-row">
      <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>Conservé automatiquement</span>
      <span style={{ color: 'var(--fg3)' }}>·</span><span>Gains et pertes de domaines référents, liens versés au rapport, désaveux effectués</span>
      <span className="lbl" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: 5 }}>Jamais conservé</span>
      <span style={{ color: 'var(--fg3)' }}>·</span><span>Le corpus complet des backlinks actifs</span>
    </div>
  </AS6>);

Object.assign(window, { ProfileCard, GainsLossesCard, ToxicCard, CompetitorsCard, BlKeepCard });
