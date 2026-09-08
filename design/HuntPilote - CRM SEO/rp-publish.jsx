/* HuntPilote — Éditeur de rapport : bandeau d'état, blocage par relecture, publication et versions. */
const { RIco: PIco, RPill: PPill, RLbl: PLbl, RSec: PSec, REPORT: PR } = window;

/* ── BANDEAU D'ÉTAT ── */
const BANNER = {
  brouillon: { tone: 'neutral', t: 'Brouillon — rien n’est encore visible du client', d: 'Le rapport se construit. Le client ne voit rien tant que vous n’avez pas publié.' },
  pret: { tone: 'green', t: 'Prêt à publier', d: 'Tous les libellés client sont relus. La publication figera cette version.' },
  bloque: { tone: 'yellow', t: 'Publication bloquée — des libellés client sont encore à relire', d: 'Un texte non relu peut contenir du jargon d’audit. Relisez-les avant de publier.' },
  publie: { tone: 'green', t: 'Publié', d: 'Le client lit une version figée. Vos modifications ici ne l’atteindront qu’à la prochaine publication.' },
  corrige: { tone: 'blue', t: 'Corrigé après publication — version 2 en ligne', d: 'La correction est publiée. Le lien du client affiche désormais la v2.' },
  sanspreuve: { tone: 'yellow', t: 'Aucune preuve de valeur pour cette période', d: 'Aucune tâche clôturée en septembre. Le rapport ne montrera que des chiffres et des chantiers en cours.' },
};
const StateBanner = ({ state, blocked, onFix, onPublish }) => {
  const live = state === 'publie' || state === 'corrige';
  const b = BANNER[blocked && !live ? 'bloque' : state === 'bloque' ? 'pret' : state];
  const tones = { green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'] };
  const [bg, bd, fg] = tones[b.tone];
  const isBlocked = b === BANNER.bloque;
  return (
    <div className="card banner" style={{ background: bg, borderColor: bd }}>
      <span className="banner-ico" style={{ background: fg, color: bg }}>{isBlocked || b.tone === 'yellow' ? <PIco.Warn /> : b.tone === 'neutral' ? <PIco.Pen /> : <PIco.Check />}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)' }}>{b.t}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 2 }}>{b.d}</div>
      </div>
      {isBlocked && <button className="btn-pri" onClick={onFix}>Voir ce qui manque<PIco.Arrow /></button>}
      {b === BANNER.pret && <button className="btn-pri" onClick={onPublish}><PIco.Send />Publier le rapport</button>}
      {(state === 'publie' || state === 'corrige') && <a className="btn-out" href="Rapport Client.html" target="_blank" rel="noopener" style={{ textDecoration: 'none' }}><PIco.Eye />Voir la page du client</a>}
    </div>);
};

/* ── CE QUI BLOQUE LA PUBLICATION ── */
const BlockCard = ({ items, validate, goTo }) => (
  <PSec title="À relire avant publication" sub={`${items.length} libellé${items.length > 1 ? 's' : ''} client encore non relu${items.length > 1 ? 's' : ''}`} accent="var(--yellow-b)">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(it => (
        <div key={it.id} className="blk-row">
          <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 2 }}><PIco.Warn /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{it.title}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{it.kind === 'proof' ? 'Preuve de valeur' : 'Priorité visible'} · {it.id} · section « {it.sec} »</div>
          </div>
          <div className="blk-act">
            <button className="btn-out" onClick={() => goTo(it.secId)}>Aller à la section</button>
            <button className="btn-pri" onClick={() => validate(it.id)}><PIco.Check />Marquer relu</button>
          </div>
        </div>))}
    </div>
    <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Un libellé non relu vient du texte d’audit brut. Il n’est pas écrit pour le client : la publication reste bloquée jusqu’à sa relecture.</div>
  </PSec>
);

/* ── PUBLICATION ── */
const PublishCard = ({ state, blocked, blockCount, onPublish, onRepublish, onFix }) => {
  const live = state === 'publie' || state === 'corrige';
  return (
    <PSec title="Publication" sub={live ? `En ligne depuis le ${PR.publish}` : 'Rien n’est en ligne pour cette période'}
      right={<PPill label={live ? (state === 'corrige' ? 'v2 en ligne' : 'v1 en ligne') : 'Brouillon'} tone={live ? 'green' : 'neutral'} sm />}>
      {!live && (
        <div>
          {blocked
            ? <React.Fragment>
                <button className="btn-pri btn-main" disabled style={{ background: 'var(--bg-muted)', color: 'var(--fg4)', boxShadow: 'none', cursor: 'not-allowed' }}><PIco.Lock />Publication bloquée</button>
                <button className="btn-out" onClick={onFix} style={{ width: '100%', justifyContent: 'center', marginTop: 6, fontSize: '0.6875rem' }}>Relire les {blockCount} libellés manquants</button>
              </React.Fragment>
            : <button className="btn-pri btn-main" onClick={onPublish}><PIco.Send />Publier le rapport de septembre</button>}
          <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[['Crée un instantané figé', 'Le client lira cette version, pas la base vivante. Vos modifications ultérieures n’y apparaissent pas.'], ['Envoie le lien par courriel', `À ${PR.email} — page web, sans mot de passe.`]].map(([t, d]) => (
              <div key={t} style={{ display: 'flex', gap: 7 }}>
                <span style={{ color: 'var(--fg4)', display: 'flex', flexShrink: 0, marginTop: 2 }}><PIco.Check /></span>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}><b style={{ color: 'var(--fg1)' }}>{t}</b> — {d}</div>
              </div>))}
          </div>
        </div>)}
      {live && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="link-box">
            <PLbl mb={4}>Lien du client</PLbl>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>huntpilote.ca/{PR.token}</span>
              <button className="btn-out" style={{ padding: '0.25rem 0.6rem', fontSize: '0.5625rem' }}><PIco.Link />Copier</button>
            </div>
            <div style={{ fontSize: '0.5rem', color: 'var(--fg3)', marginTop: 5 }}>Ouvert 4 fois · dernière lecture le 4 oct. à 08 h 12</div>
          </div>
          <a className="btn-pri btn-main" href="Rapport Client.html" target="_blank" rel="noopener" style={{ textDecoration: 'none' }}><PIco.Eye />Ouvrir la page du client</a>
          <button className="btn-out" onClick={onRepublish} style={{ width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }} disabled={state === 'corrige'}>{state === 'corrige' ? 'Version 2 déjà publiée' : 'Publier une correction (v2)'}</button>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-out" style={{ flex: 1, justifyContent: 'center', fontSize: '0.625rem' }}><PIco.Doc />PDF</button>
            <button className="btn-out" style={{ flex: 1, justifyContent: 'center', fontSize: '0.625rem', color: 'var(--red)', borderColor: 'var(--red-b)' }}>Révoquer le lien</button>
          </div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Le PDF est une commodité : la référence reste la page web, que le portail client relira.</div>
        </div>)}
    </PSec>);
};

/* ── HISTORIQUE DES VERSIONS ── */
const VersionsCard = ({ state }) => {
  const list = state === 'corrige' ? PR.versions : state === 'publie' ? PR.versions.slice(1) : [];
  return (
    <PSec title="Versions" sub={list.length ? `${list.length} publiée${list.length > 1 ? 's' : ''} · le client lit la plus récente` : 'Aucune version publiée'}>
      {!list.length
        ? <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>La première publication créera la version 1. Chaque correction publiée ajoute une version, et l’ancienne reste consultable.</div>
        : <div style={{ display: 'flex', flexDirection: 'column' }}>
            {list.map((v, i) => (
              <div key={v.v} className="ver-row">
                <span className="ver-dot" style={{ background: i === 0 ? 'var(--green)' : 'var(--bd-strong)' }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{v.v}</span>
                    {i === 0 && <PPill label="Lue par le client" tone="green" sm />}
                    <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--fg3)' }}>{v.date}</span>
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginTop: 2, lineHeight: 1.5 }}>{v.note}</div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--fg3)', marginTop: 2 }}>Par {v.who}</div>
                </div>
              </div>))}
          </div>}
    </PSec>);
};

/* ── PÉRIODE ET DESTINATAIRE ── */
const MetaCard = () => (
  <PSec title="Période et destinataire">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {[['Période couverte', '1 – 30 septembre 2026'], ['Client', PR.client], ['Destinataire', PR.email], ['Responsable', PR.pm]].map(([l, v]) => (
        <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <PLbl mb={0} style={{ flex: '0 0 7.5rem' }}>{l}</PLbl>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, flex: 1, minWidth: 0 }}>{v}</span>
        </div>))}
    </div>
    <div style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>Le rapport reprend les tâches clôturées et les priorités visibles de cette période uniquement.</div>
  </PSec>
);

Object.assign(window, { StateBanner, BlockCard, PublishCard, VersionsCard, MetaCard });
