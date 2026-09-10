/* HuntPilote — Calendrier éditorial : vue mois et état vide. */
const EdMonthView = ({ content, month, onOpen }) => {
  const { EI, EPill, edParse, E_TONE } = window;
  const [y, m] = month.split('-').map(Number);
  const off = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const n = new Date(y, m, 0).getDate();
  const rows = Math.ceil((off + n) / 7);
  const cells = [...Array(rows * 7)].map((_, i) => {
    const d = new Date(y, m - 1, 1 - off + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  return (
    <div>
      <div className="ed-month" style={{ marginBottom: 4 }}>{['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map(d => <div key={d} className="ed-mhead">{d}</div>)}</div>
      <div className="ed-month">
        {cells.map(d => {
          const items = content.filter(c => c.due === d);
          const out = edParse(d).getMonth() + 1 !== m;
          const isToday = d === window.ED_TODAY;
          return (
            <div key={d} className={`ed-cell${out ? ' out' : ''}${isToday ? ' today' : ''}`}>
              <span className="ed-cd">{edParse(d).getDate()}{isToday && <span className="ed-today">Auj.</span>}</span>
              {items.map(c => {
                const st = window.ED_STATES[c.state], late = window.edLate(c);
                const [bg, bd, fg] = E_TONE[late ? 'red' : st.tone];
                return (
                  <button key={c.id} type="button" className="ed-chip" style={{ background: bg, borderColor: bd }} onClick={() => onOpen(c)} title={`${c.title} — ${st.label}`}>
                    <span className="ed-chip-s" style={{ color: fg }}>{late ? 'En retard' : st.short}</span>
                    <span className="ed-chip-t">{c.title}</span>
                  </button>);
              })}
            </div>);
        })}
      </div>
    </div>);
};

const EdEmpty = () => (
  <div className="empty">
    <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 4 }}>Aucun contenu planifié ce mois-ci</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5, marginBottom: 11 }}>
      Le forfait {window.ED_CLIENT.plan} inclut {window.ED_CLIENT.quotaLabel}. Un mois vide, c’est un engagement contractuel non tenu — pas seulement un calendrier vide.
    </div>
    <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
      <a href="Keyword Hunter.html" className="btn-out" style={{ fontSize: '0.6875rem', textDecoration: 'none' }}><window.EI.Key />Chercher des sujets dans Keyword Hunter</a>
    </div>
  </div>);

Object.assign(window, { EdMonthView, EdEmpty });
