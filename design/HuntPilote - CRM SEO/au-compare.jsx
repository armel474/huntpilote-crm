/* HuntPilote — Comparaison de deux audits : régressions d'abord, puis améliorations, puis nouveaux constats. */
const { AIco: CI, APill: CP, ALbl: CL, ASec: CS, AUDIT: CAU } = window;

const CMP = {
  a: { id: 'A-0131', date: '1 septembre 2026', score: 67 },
  b: { id: 'A-0142', date: '1 octobre 2026', score: 72 },
  dims: [
    { name: 'Présence en ligne', Icon: CI.Globe, weight: 25, a: 58, b: 64 },
    { name: 'SEO', Icon: CI.Srch, weight: 45, a: 71, b: 76 },
    { name: 'Design', Icon: CI.Pen, weight: 30, a: 68, b: 71 },
  ],
  rows: [
    { dim: 'SEO', c: 'Liens internes brisés', a: '9 liens', b: '23 liens', kind: 'regress', note: 'La refonte des pages de service a laissé d’anciennes adresses en place.', prio: 'P-0421' },
    { dim: 'Présence en ligne', c: 'Cohérence nom · adresse · téléphone', a: '1 incohérence', b: '3 incohérences', kind: 'regress', note: 'Le changement de numéro de septembre n’a pas été propagé aux annuaires.', prio: null },
    { dim: 'Design', c: 'Cohérence de marque', a: '2 familles typographiques', b: '3 familles typographiques', kind: 'regress', note: 'Une police a été ajoutée sur la nouvelle page de devis.', prio: null },
    { dim: 'Design', c: 'Conversion', a: '8 champs au formulaire', b: '11 champs au formulaire', kind: 'regress', note: 'Trois champs ajoutés au devis : le taux de complétion a baissé de 12 %.', prio: 'P-0435' },
    { dim: 'SEO', c: 'Vitesse d’affichage mobile (LCP)', a: '4,2 s', b: '2,1 s', kind: 'improve', note: 'Passe sous le seuil de 2,5 s : le critère est désormais au seuil.', prio: null },
    { dim: 'SEO', c: 'Descriptions dans les résultats Google', a: '36 pages sans description', b: '18 pages sans description', kind: 'improve', note: 'Moitié du retard comblé.', prio: 'P-0402' },
    { dim: 'Présence en ligne', c: 'Fiche Google Business', a: '4 champs sur 9', b: '6 champs sur 9', kind: 'improve', note: null, prio: 'P-0431' },
    { dim: 'SEO', c: 'Domaines référents', a: '3 280 domaines', b: '3 292 domaines', kind: 'improve', note: null, prio: null },
    { dim: 'Design', c: 'Mobile', a: '14 cibles sous 44 px', b: '9 cibles sous 44 px', kind: 'improve', note: null, prio: null },
    { dim: 'SEO', c: 'Pages orphelines', a: null, b: '23 pages sans lien entrant', kind: 'new', note: 'Détecté pour la première fois : la nouvelle navigation a coupé les liens vers ces pages.', prio: 'P-0428' },
    { dim: 'SEO', c: 'Contenus qui se font concurrence', a: null, b: '4 pages sur le même sujet', kind: 'new', note: 'Deux paires de pages publiées en septembre visent les mêmes recherches.', prio: 'P-0430' },
    { dim: 'Présence en ligne', c: 'Avis clients', a: null, b: '1 avis sans réponse', kind: 'new', note: null, prio: null },
  ],
};

const KIND = {
  regress: { label: 'Dégradé', tone: 'red', Ico: CI.Down, title: 'Ce qui a régressé', desc: 'À traiter en premier : ces critères étaient meilleurs au dernier audit.' },
  improve: { label: 'Amélioré', tone: 'green', Ico: CI.Up, title: 'Ce qui s’est amélioré', desc: 'Ces critères ont progressé depuis le 1 septembre.' },
  new: { label: 'Nouveau', tone: 'yellow', Ico: CI.Warn, title: 'Nouvellement détecté', desc: 'Absent du premier audit : rien à comparer, tout à traiter.' },
};

const CmpRow = ({ r, created, onCreate }) => {
  const k = KIND[r.kind];
  const prio = r.prio || created[r.c];
  return (
    <div className="cmp-row" data-kind={r.kind}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.c}</span>
          <CP label={k.label} tone={k.tone} sm icon={<k.Ico />} />
        </div>
        <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>{r.dim}</div>
        {r.note && <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 4 }}>{r.note}</div>}
      </div>
      <div>
        <CL mb={2}>1 sept.</CL>
        <div className="cmp-val" data-dim="old">{r.a || 'non détecté'}</div>
      </div>
      <div>
        <CL mb={2}>1 oct.</CL>
        <div className="cmp-val">{r.b}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {prio
          ? <a href="Priorite Detail.html" style={{ textDecoration: 'none' }}><CP label={`Priorité ${prio}`} tone="blue" sm icon={<CI.Arrow />} /></a>
          : <button className="btn-out" onClick={() => onCreate(r.c)}><CI.Plus />Créer la priorité</button>}
      </div>
    </div>);
};

const CmpGroup = ({ kind, rows, created, onCreate }) => {
  const k = KIND[kind];
  const tones = { red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'] };
  const [bg, bd, fg] = tones[k.tone];
  return (
    <CS title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span className="grp-ico" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}><k.Ico /></span>{k.title}</span>}
      sub={k.desc} right={<CP label={`${rows.length} critère${rows.length > 1 ? 's' : ''}`} tone={k.tone} sm />}>
      <div className="cmp-head">
        <CL mb={0}>Critère</CL>
        <CL mb={0}>Audit du 1 sept.</CL>
        <CL mb={0}>Audit du 1 oct.</CL>
        <span></span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {rows.map(r => <CmpRow key={r.c} r={r} created={created} onCreate={onCreate} />)}
      </div>
    </CS>);
};

const CmpSummary = () => {
  const n = k => CMP.rows.filter(r => r.kind === k).length;
  return (
    <CS title="Ce qui a changé entre les deux audits" sub={`${CMP.a.date} → ${CMP.b.date} · même pondération des trois dimensions`}
      right={<div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{CMP.a.score}</span>
        <span style={{ color: 'var(--fg4)', display: 'flex' }}><CI.Arrow /></span>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{CMP.b.score}</span>
        <CP label={`+${CMP.b.score - CMP.a.score} pts`} tone="green" sm icon={<CI.Up />} />
      </div>}>
      <div className="weight-grid" style={{ marginBottom: 10 }}>
        {CMP.dims.map(d => (
          <div key={d.name} className="weight-cell">
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span style={{ color: 'var(--fg3)', display: 'flex' }}><d.Icon /></span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, flex: 1, minWidth: 0 }}>{d.name}</span>
              <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', fontWeight: 700 }}>× {d.weight} %</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--fg3)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{d.a}</span>
              <span style={{ color: 'var(--fg4)', display: 'flex' }}><CI.Arrow /></span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{d.b}</span>
              <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: d.b >= d.a ? 'var(--green-fg)' : 'var(--red)' }}>{d.b >= d.a ? '+' : '−'}{Math.abs(d.b - d.a)} pts</span>
            </div>
          </div>))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <CP label={`${n('regress')} critères dégradés`} tone="red" icon={<CI.Down />} />
        <CP label={`${n('improve')} critères améliorés`} tone="green" icon={<CI.Up />} />
        <CP label={`${n('new')} nouveaux constats`} tone="yellow" icon={<CI.Warn />} />
      </div>
      <div className="note-box"><span style={{ color: 'var(--fg3)', display: 'flex', flexShrink: 0, marginTop: 1 }}><CI.Warn /></span><div style={{ flex: 1 }}><b>Le score monte, et pourtant quatre critères ont régressé.</b> La progression vient surtout de la vitesse mobile, qui pèse lourd dans le SEO. Les régressions restent à traiter : elles sont listées en premier ci-dessous.</div></div>
    </CS>);
};

const CmpEmpty = () => (
  <CS title="Rien à comparer" sub="Premier audit de ce client">
    <div className="empty">
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--fg3)', marginBottom: 6 }}><CI.Cmp /></div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Un seul audit existe pour ce client</div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, maxWidth: '30rem', margin: '0 auto' }}>L’audit du 1 octobre 2026 est le premier. Ses mesures servent de point de départ : la comparaison sera possible dès le prochain audit, prévu le 1 novembre.</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
        <a href="Audit Detail.html" className="btn-pri" style={{ textDecoration: 'none' }}>Voir l’audit du 1 octobre<CI.Arrow /></a>
        <button className="btn-out"><CI.Refresh />Relancer un audit maintenant</button>
      </div>
    </div>
  </CS>
);

Object.assign(window, { CMP, KIND, CmpRow, CmpGroup, CmpSummary, CmpEmpty });
