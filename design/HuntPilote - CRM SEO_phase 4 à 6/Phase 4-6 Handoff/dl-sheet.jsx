/* HuntPilote — Détail d'un deal : assemblage du panneau latéral. */
const { useState: useDS, useEffect: useDSE } = React;

const DealPanel = ({ deal, stages, owners, onClose, onWin, onLose, onLog }) => {
  const [mode, setMode] = useDS(null); // 'log' | 'won' | 'lost'
  const [extra, setExtra] = useDS([]);
  const [lost, setLost] = useDS(null);
  const [won, setWon] = useDS(false);
  useDSE(() => { setMode(null); setExtra([]); setLost(null); setWon(false); }, [deal && deal.id]);
  useDSE(() => { const h = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [onClose]);
  if (!deal) return null;

  const d = window.dlDetail(deal);
  const st = stages.find(s => s.id === deal.stage) || stages[0];
  const own = owners[deal.owner] || { name: deal.owner };
  const dormant = deal.days >= window.DL_DORMANT && !['gagne', 'perdu'].includes(deal.stage);
  const isWon = won || deal.stage === 'gagne';
  const isLost = !!lost;
  const history = [...extra, ...d.history];
  const { DI, DPill, DSec, Field, dlFmt, LogExchange, WonConfirm, LostConfirm, DL_CH_ICON, DL_CHANNELS } = window;

  return (
    <React.Fragment>
      <div className="dl-scrim" onClick={onClose}></div>
      <aside className="dl-sheet" role="dialog" aria-modal="true" aria-label={`Détail du deal ${deal.company}`}>
        <div className="dl-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, textWrap: 'pretty' }}>{deal.company}</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 3 }}>{deal.sector} · {d.site} · {d.createdAt ? `créé le ${d.createdAt}` : `au pipeline depuis ${d.age} jours`}</div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer le panneau"><DI.X /></button>
        </div>

        <div className="dl-body">
          {isWon && (
            <div className="dl-banner green">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}><DI.Trophy /></span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>Deal gagné{d.wonAt ? ` le ${d.wonAt}` : ''} — onboarding lancé.</b> Le client existe dans le Client hub, l’onboarding en 4 étapes est assigné à {own.name} et le premier audit est planifié.
                <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                  <a href="Onboarding.html" className="btn-out" style={{ fontSize: '0.625rem', textDecoration: 'none' }}>Ouvrir l’onboarding<DI.Arrow /></a>
                  <a href="Fiche Client v4.html" className="btn-out" style={{ fontSize: '0.625rem', textDecoration: 'none' }}>Ouvrir la fiche client<DI.Arrow /></a>
                </div>
              </div>
            </div>)}
          {isLost && (
            <div className="dl-banner red">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}><DI.Warn /></span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>Deal perdu — motif : {lost.reason}.</b>{lost.note ? ` ${lost.note}` : ''} L’instantané SEO du prospect sera purgé dans {window.DL_SNAPSHOT_DAYS} jours, conformément à la politique de conservation.</div>
            </div>)}
          {dormant && !isWon && !isLost && (
            <div className="dl-banner yellow">
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}><DI.Clock /></span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b>Dormant depuis {deal.days} jours dans l’étape « {st.label} »</b> — seuil de vigilance : {window.DL_DORMANT} jours. Dernier échange consigné le {history[0] ? history[0].at : '—'}.</div>
            </div>)}

          <DSec title="Le deal" right={<DPill label={st.label} tone={deal.stage === 'gagne' ? 'green' : deal.stage === 'negociation' ? 'yellow' : deal.stage === 'proposition' ? 'blue' : 'neutral'} sm />}>
            <div className="dl-kpis">
              <div className="dl-kpi"><span className="dl-kpi-v">{dlFmt(deal.mrr)} $</span><span className="dl-kpi-l">MRR proposé · par mois</span></div>
              <div className="dl-kpi"><span className="dl-kpi-v">{deal.prob} %</span><span className="dl-kpi-l">Probabilité · seuil de prévision : 50 %</span></div>
              <div className="dl-kpi"><span className="dl-kpi-v" style={dormant ? { color: 'var(--yellow-fg)' } : undefined}>{deal.days} j</span><span className="dl-kpi-l">Dans l’étape · seuil : {window.DL_DORMANT} j</span></div>
            </div>
            <div className="dl-fields">
              <Field l="Services envisagés"><span className="dl-chips">{deal.services.map(s => <span key={s} className="dl-chip plain">{s}</span>)}</span></Field>
              <Field l="Responsable">{own.name}</Field>
              <Field l="Contact">{d.contact}{d.role ? ` · ${d.role}` : ''}</Field>
              <Field l="Coordonnées">{d.email || d.phone
                ? <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{d.email && <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><DI.Mail />{d.email}</span>}{d.phone && <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><DI.Phone />{d.phone}</span>}</span>
                : <span style={{ color: 'var(--fg3)' }}>Non renseignées</span>}</Field>
            </div>
          </DSec>

          <DSec title="Prochaine action" sub={isWon || isLost ? 'Le deal est clos : plus aucune action commerciale attendue.' : null}>
            {isWon || isLost
              ? <div className="dl-empty">Aucune action en attente.</div>
              : <div className="dl-next">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35 }}>{deal.next}</div>
                    <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><DI.Clock />{d.nextAt}</div>
                  </div>
                  <a href="Agenda.html" className="btn-out" style={{ fontSize: '0.625rem', textDecoration: 'none' }}>Voir dans l’agenda<DI.Arrow /></a>
                </div>}
          </DSec>

          <DSec title="Historique des échanges" sub={`${history.length} échange${history.length > 1 ? 's' : ''} consigné${history.length > 1 ? 's' : ''}`}
            right={mode !== 'log' && <button className="btn-out" style={{ fontSize: '0.625rem' }} onClick={() => setMode('log')}><DI.Plus />Consigner un échange</button>}>
            {mode === 'log' && <LogExchange onCancel={() => setMode(null)} onAdd={x => { setExtra(e => [{ ...x, at: 'à l’instant', who: own.name }, ...e]); setMode(null); onLog && onLog(deal.id); }} />}
            <div className="dl-timeline">
              {history.map((h, i) => {
                const [chLabel, chTone] = DL_CHANNELS[h.ch];
                const Icon = DL_CH_ICON[h.ch], [bg, bd, fg] = window.D_TONE[chTone];
                return (
                  <div key={i} className="dl-tl-row">
                    <span className="dl-tl-i" style={{ background: bg, border: `1px solid ${bd}`, color: fg }}><Icon /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 800 }}>{chLabel}</span>
                        <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)' }}>{h.at} · {h.who}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 2, textWrap: 'pretty' }}>{h.text}</div>
                    </div>
                  </div>);
              })}
            </div>
          </DSec>

          <DSec title="Documents" sub={d.docs.length ? null : 'Aucun devis ni proposition pour l’instant.'}>
            {d.docs.length === 0
              ? <div className="dl-empty">Rien à montrer. Le premier document arrive avec la proposition.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {d.docs.map(doc => (
                    <a key={doc.name} href={doc.href} className="dl-doc">
                      <span className="dl-doc-i"><DI.Doc /></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="dl-doc-t">{doc.name}</span>
                        <span className="dl-doc-m">{doc.kind} · {doc.at}{doc.auto ? ' · généré depuis Organic Research' : ''}</span>
                      </span>
                      <DI.Arrow />
                    </a>))}
                </div>}
          </DSec>

          <DSec title="Données SEO du prospect" sub={d.seo.done ? `Instantané du ${d.seo.at} — non historisé : il ne sera pas comparé dans le temps tant que le deal n’est pas gagné.` : null}>
            {!d.seo.done
              ? <div className="dl-empty">Aucun Domain Overview n’a été fait sur ce prospect.
                  <div style={{ marginTop: 8 }}><a href="Domain Overview.html" className="btn-out" style={{ fontSize: '0.625rem', textDecoration: 'none' }}><DI.Chart />Lancer un instantané<DI.Arrow /></a></div>
                </div>
              : <React.Fragment>
                  <div className="dl-kpis">
                    <div className="dl-kpi"><span className="dl-kpi-v">{d.seo.authority}</span><span className="dl-kpi-l">Autorité de domaine · /100</span></div>
                    <div className="dl-kpi"><span className="dl-kpi-v">{d.seo.keywords}</span><span className="dl-kpi-l">Mots-clés positionnés</span></div>
                    <div className="dl-kpi"><span className="dl-kpi-v">{d.seo.traffic}</span><span className="dl-kpi-l">Visites organiques / mois</span></div>
                    <div className="dl-kpi"><span className="dl-kpi-v">{d.seo.top10}</span><span className="dl-kpi-l">Mots-clés en première page</span></div>
                  </div>
                  <div className="dl-note">Cet instantané n’est pas historisé : il photographie {d.seo.domain} au {d.seo.at} et rien d’autre. Le suivi dans le temps commence à la signature.</div>
                  <a href={d.seo.href} className="btn-out" style={{ fontSize: '0.625rem', marginTop: 8, textDecoration: 'none' }}><DI.Chart />Ouvrir l’instantané<DI.Arrow /></a>
                </React.Fragment>}
          </DSec>
        </div>

        <div className="dl-foot">
          {mode === 'won' ? <WonConfirm deal={deal} onCancel={() => setMode(null)} onConfirm={() => { setWon(true); setMode(null); onWin && onWin(deal.id); }} />
            : mode === 'lost' ? <LostConfirm deal={deal} onCancel={() => setMode(null)} onConfirm={(reason, note) => { setLost({ reason, note }); setMode(null); onLose && onLose(deal.id, reason); }} />
            : isWon || isLost ? <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.5 }}>Deal clos. Il reste au journal du pipeline et compte dans le taux de conversion.</div>
            : <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn-pri dl-green" onClick={() => setMode('won')}><DI.Trophy />Marquer gagné</button>
                <button className="btn-out" onClick={() => setMode('lost')}>Marquer perdu</button>
                <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', flex: '1 1 140px', lineHeight: 1.45 }}>« Gagné » crée le client et lance l’onboarding — la conséquence est détaillée avant confirmation.</span>
              </div>}
        </div>
      </aside>
    </React.Fragment>);
};

Object.assign(window, { DealPanel });
