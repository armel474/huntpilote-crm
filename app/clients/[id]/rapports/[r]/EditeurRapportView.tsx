'use client';

/**
 * Éditeur de rapport client — écran 1.3, versant agence.
 *
 * Le rapport se compose de sections réordonnables, alimentées par les
 * preuves de valeur des tâches clôturées et par les priorités rendues
 * visibles. Rien ne part au client tant qu'un humain n'a pas relu chaque
 * libellé destiné à être lu par lui.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shell/AppShell';
import { CRMHeader } from '@/components/shell/CRMHeader';
import { SectionEditor, SectionNav } from '@/components/rapport/Editor';
import {
  BlockCard,
  MetaCard,
  PublishCard,
  StateBanner,
  VersionsCard,
  type BlockItem,
} from '@/components/rapport/Publish';
import { Lbl, Sec } from '@/components/ui/Atoms';
import { IcoArrowL, IcoLink } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import {
  ED_STATES,
  REPORT,
  SECTIONS,
  type EditorState,
  type Proof,
  type SectionId,
} from '@/lib/data/rapport';

/** Tous les libellés destinés au client, preuves et priorités confondues. */
const REVIEWABLES = [...REPORT.proofs, ...REPORT.priorities];

const allReviewed = () => Object.fromEntries(REVIEWABLES.map((x) => [x.id, true]));
const seedReview = () => Object.fromEntries(REVIEWABLES.map((x) => [x.id, x.ok]));
const allSections = (except?: SectionId) =>
  Object.fromEntries(SECTIONS.map((s) => [s.id, s.id !== except])) as Record<SectionId, boolean>;

export function EditeurRapportView({ clientId }: { clientId: string }) {
  const [state, setStateRaw] = useState<EditorState>('bloque');
  const [view, setView] = useState<'edition' | 'apercu'>('edition');
  const [order, setOrder] = useState<SectionId[]>(SECTIONS.map((s) => s.id));
  const [on, setOn] = useState<Record<SectionId, boolean>>(() => allSections());
  const [active, setActive] = useState<SectionId>('synthese');
  const [summary, setSummary] = useState<string>(REPORT.summary);
  const [proofs, setProofs] = useState<Proof[]>(() => [...REPORT.proofs]);
  const [okMap, setOkMap] = useState<Record<string, boolean>>(seedReview);

  const previewHref = `/${REPORT.token}`;
  const noProof = state === 'sanspreuve';

  /** Chaque état de démonstration reconstruit une situation cohérente. */
  const setState = (s: EditorState) => {
    setStateRaw(s);
    setView('edition');
    setOkMap(s === 'bloque' ? seedReview() : allReviewed());
    setProofs(s === 'sanspreuve' ? [] : [...REPORT.proofs]);
    setOn(allSections(s === 'sanspreuve' ? 'preuves' : undefined));
    setActive(s === 'sanspreuve' ? 'preuves' : 'synthese');
  };

  const move = (i: number, d: number) =>
    setOrder((o) => {
      const j = i + d;
      if (j < 0 || j >= o.length) return o;
      const n = [...o];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const moveProof = (i: number, d: number) =>
    setProofs((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const n = [...p];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const toggleProof = (id: string) =>
    setProofs((p) => p.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));

  const validate = (id: string) => setOkMap((m) => ({ ...m, [id]: true }));

  /** Seuls les libellés d'une section incluse et retenue bloquent. */
  const blockItems = useMemo<BlockItem[]>(() => {
    const out: BlockItem[] = [];
    if (on.preuves) {
      proofs
        .filter((p) => p.on && !okMap[p.id])
        .forEach((p) =>
          out.push({ id: p.id, title: p.title, kind: 'proof', sec: 'Ce qu’on a fait', secId: 'preuves' }),
        );
    }
    if (on.travail) {
      REPORT.priorities
        .filter((p) => !okMap[p.id])
        .forEach((p) =>
          out.push({
            id: p.id,
            title: p.title,
            kind: 'prio',
            sec: 'Ce sur quoi on travaille',
            secId: 'travail',
          }),
        );
    }
    return out;
  }, [on, proofs, okMap]);

  // Une version déjà publiée ne se rebloque pas : le client lit un instantané.
  const live = state === 'publie' || state === 'corrige';
  const blocked = blockItems.length > 0 && !live;

  const counts = useMemo<Partial<Record<SectionId, string>>>(() => {
    const c: Partial<Record<SectionId, string>> = {
      preuves: noProof ? 'Aucune preuve' : `${proofs.filter((p) => p.on).length} retenues`,
      travail: `${REPORT.priorities.length} visibles`,
    };
    for (const b of blockItems) {
      c[b.secId] = `${blockItems.filter((x) => x.secId === b.secId).length} à relire`;
    }
    return c;
  }, [noProof, proofs, blockItems]);

  const goTo = (secId: SectionId) => {
    setActive(secId);
    setView('edition');
  };
  const firstBlockSection = () => goTo(blockItems[0]?.secId ?? 'preuves');

  const header = (
    <CRMHeader
      title={`Rapport de ${REPORT.period.toLowerCase()}`}
      period=""
      crumbs={[
        { label: 'Client hub', href: routes.clients() },
        { label: REPORT.client, href: routes.client(clientId) },
        { label: 'Rapports', href: routes.client(clientId) },
        { label: REPORT.period },
      ]}
    />
  );

  return (
    <AppShell header={header}>
      <div className="subbar">
        <Link
          href={routes.client(clientId)}
          className="btn-out"
          style={{ textDecoration: 'none', fontSize: '0.6875rem', padding: '0.3rem 0.75rem' }}
        >
          <IcoArrowL />
          Tous les rapports
        </Link>
        <div className="seg" role="group" aria-label="Mode d’affichage">
          {(
            [
              ['edition', 'Édition'],
              ['apercu', 'Aperçu client'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" data-on={view === id} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lbl>
            <label htmlFor="ed-etat">Démo · état</label>
          </Lbl>
          <select
            id="ed-etat"
            className="state-sel"
            value={state}
            onChange={(e) => setState(e.target.value as EditorState)}
          >
            {ED_STATES.map(([id, l]) => (
              <option key={id} value={id}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sc" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.125rem 0' }}>
          <StateBanner
            state={state}
            blocked={blocked}
            onFix={firstBlockSection}
            onPublish={() => setStateRaw('publie')}
            previewHref={previewHref}
          />
        </div>

        <div className="detail-row">
          <div className="col-main">
            {view === 'apercu' ? (
              <Preview previewHref={previewHref} />
            ) : (
              <>
                {blocked && (
                  <BlockCard items={blockItems} validate={validate} goTo={goTo} />
                )}
                <SectionNav
                  order={order}
                  on={on}
                  toggle={(id) => setOn((m) => ({ ...m, [id]: !m[id] }))}
                  move={move}
                  active={active}
                  setActive={setActive}
                  counts={counts}
                />
                <SectionEditor
                  id={active}
                  summary={summary}
                  setSummary={setSummary}
                  proofs={proofs}
                  toggleProof={toggleProof}
                  moveProof={moveProof}
                  okMap={okMap}
                  validate={validate}
                  noProof={noProof && active === 'preuves'}
                  previewHref={previewHref}
                  taskHref={routes.tache(clientId, '142')}
                  prioHref={routes.priorite(clientId, 'p-0418')}
                />
              </>
            )}
          </div>
          <div className="col-side">
            <PublishCard
              state={state}
              blocked={blocked}
              blockCount={blockItems.length}
              onPublish={() => setStateRaw('publie')}
              onRepublish={() => setStateRaw('corrige')}
              onFix={firstBlockSection}
              previewHref={previewHref}
            />
            <MetaCard />
            <VersionsCard state={state} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ── Aperçu du rapport dans un cadre ── */

function Preview({ previewHref }: { previewHref: string }) {
  const [width, setWidth] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <Sec
      title="Aperçu — exactement ce que le client verra"
      sub={`Page web à l’adresse huntpilote.ca/${REPORT.token}`}
      right={
        <div className="seg" role="group" aria-label="Largeur d’aperçu">
          {(
            [
              ['desktop', 'Bureau'],
              ['mobile', 'Mobile'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" data-on={width === id} onClick={() => setWidth(id)}>
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="frame-wrap" data-w={width}>
        <div className="frame-bar">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--fg3)' }}>
            huntpilote.ca/{REPORT.token}
          </span>
          <a
            className="btn-out"
            href={previewHref}
            target="_blank"
            rel="noopener"
            style={{
              marginLeft: 'auto',
              textDecoration: 'none',
              fontSize: '0.5625rem',
              padding: '0.22rem 0.6rem',
            }}
          >
            <IcoLink />
            Ouvrir dans un onglet
          </a>
        </div>
        <iframe src={previewHref} title="Aperçu du rapport client" loading="lazy" />
      </div>
      <p style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
        L’aperçu reflète le brouillon en cours. La publication en figera une copie : le client ne
        verra plus vos modifications suivantes.
      </p>
    </Sec>
  );
}
