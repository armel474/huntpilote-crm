'use client';

/**
 * SEO local · Citations et annuaires — référence, liste hiérarchisée par
 * gravité puis par autorité, détail d'incohérence champ par champ
 * (session 3.2).
 */
import Link from 'next/link';
import { Lbl, Pill, Sec } from '@/components/ui/Atoms';
import { IcoCheck, IcoClock, IcoPlug, IcoPlus, IcoWarn } from '@/components/ui/Icons';
import { AUTORITE_TIER, CITATION_STATE_DEFS, type AutoriteTier, type CitationRow, type ReferenceInfo } from '@/lib/data/local-citations';

export function AutoriteBars({ tier }: { tier: AutoriteTier }) {
  const n = AUTORITE_TIER[tier];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2 }} title={`Autorité ${tier}`} aria-label={`Autorité ${tier}`}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ width: 3, height: 4 + i * 3, borderRadius: 1, background: i <= n ? 'var(--fg2)' : 'var(--bd-solid)' }} />
      ))}
    </span>
  );
}

/* ── LA RÉFÉRENCE ── */

export function ReferenceCard({ info }: { info: ReferenceInfo }) {
  const rows: [string, string][] = [
    ['Nom', info.nom],
    ['Adresse', info.adresse],
    ['Téléphone', info.telephone],
    ['Site web', info.siteweb],
  ];
  return (
    <Sec title="La référence" sub="Ce que le nom, l’adresse et le téléphone devraient afficher partout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(([l, v]) => (
          <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <Lbl mb={0} style={{ flex: '0 0 6rem' }}>
              {l}
            </Lbl>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: l !== 'Nom' ? 'var(--font-mono)' : 'var(--font)' }}>{v}</span>
          </div>
        ))}
      </div>
    </Sec>
  );
}

/* ── UNE LIGNE D'ANNUAIRE ── */

export function AnnuaireRow({
  row,
  expanded,
  onToggle,
  onCreatePrio,
  onCreateTache,
  created,
  prioHref,
  tacheHref,
}: {
  row: CitationRow;
  expanded: boolean;
  onToggle: () => void;
  onCreatePrio: () => void;
  onCreateTache: () => void;
  created?: { id: string; kind: 'prio' | 'tache' };
  prioHref: (id: string) => string;
  tacheHref: (id: string) => string;
}) {
  const st = CITATION_STATE_DEFS[row.etat];
  const problem = row.etat === 'incoherent' || row.etat === 'doublon';
  const crit = row.etat === 'doublon' ? 'fail' : row.etat === 'incoherent' ? 'warn' : row.etat === 'inaccessible' ? 'na' : 'ok';

  return (
    <div className="crit" data-st={crit}>
      <span className="crit-ico" data-st={crit}>
        {row.etat === 'conforme' ? <IcoCheck /> : row.etat === 'absent' ? <IcoPlug /> : row.etat === 'inaccessible' ? <IcoClock /> : <IcoWarn />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: row.etat === 'conforme' || row.etat === 'absent' ? 0 : 3 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{row.annuaire}</span>
          <AutoriteBars tier={row.autorite} />
          <span style={{ fontSize: '0.5625rem', color: 'var(--fg3)', textTransform: 'capitalize' }}>Autorité {row.autorite}</span>
          <Pill label={st.label} tone={st.tone} sm />
        </div>
        {problem && !expanded && (
          <button type="button" className="btn-out" style={{ marginTop: 4 }} onClick={onToggle}>
            Voir le détail
          </button>
        )}
        {row.etat === 'inaccessible' && <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', marginTop: 2 }}>{row.inaccessibleNote}</div>}
        {problem && expanded && (
          <div style={{ marginTop: 6 }}>
            {row.etat === 'incoherent' && row.champs && (
              <div style={{ display: 'grid', gridTemplateColumns: '6rem 1fr 1fr', gap: '4px 10px', alignItems: 'center', marginBottom: 8 }}>
                <div className="lbl" style={{ paddingBottom: 4 }}>
                  Champ
                </div>
                <div className="lbl" style={{ paddingBottom: 4 }}>
                  Publié
                </div>
                <div className="lbl" style={{ paddingBottom: 4 }}>
                  Attendu
                </div>
                {row.champs.map((c) => (
                  <div key={c.champ} style={{ display: 'contents' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{c.champ}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{c.publie}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--green-fg)', fontFamily: 'var(--font-mono)' }}>{c.attendu}</span>
                  </div>
                ))}
              </div>
            )}
            {row.etat === 'doublon' && <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginBottom: 8 }}>{row.doublonNote}</div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {created ? (
                <Link href={created.kind === 'prio' ? prioHref(created.id) : tacheHref(created.id)} style={{ textDecoration: 'none' }}>
                  <Pill label={`${created.kind === 'prio' ? 'Priorité' : 'Tâche'} ${created.id} ouverte`} tone="blue" sm />
                </Link>
              ) : (
                <>
                  <button type="button" className="btn-out" onClick={onCreatePrio}>
                    <IcoPlus />
                    Créer la priorité
                  </button>
                  <button type="button" className="btn-out" onClick={onCreateTache}>
                    <IcoPlus />
                    Créer la tâche de correction
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
