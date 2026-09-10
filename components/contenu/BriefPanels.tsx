'use client';

/**
 * Brief d'article — sections de cadrage : mot-clé, intention de recherche,
 * plan proposé, concurrents à battre, consignes (session 6.1).
 */
import { useState } from 'react';
import Link from 'next/link';
import { Pill } from '@/components/ui/Atoms';
import { IcoEye, IcoKey, IcoList, IcoPlus, IcoRuler, IcoSpark, IcoUsers, IcoX } from '@/components/ui/Icons';
import { BR_INTENTS, type BriefRecord, type BrIntent, type BrOutlineRow } from '@/lib/data/brief';
import { routes } from '@/lib/routes';

function IntentPill({ id, sm }: { id: BrIntent; sm?: boolean }) {
  const i = BR_INTENTS[id];
  return <Pill label={i.label} tone={i.tone} sm={sm} />;
}

function BriefSection({
  icon,
  title,
  sub,
  right,
  children,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="card ar-sec">
      <div className="ar-sec-h">
        <span className="ar-step" style={{ background: 'var(--bg-muted)', border: '1px solid var(--bd-solid)', color: 'var(--fg2)' }}>
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>
          {sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.45 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ── Mot-clé cible et requêtes secondaires ── */

export function KeywordSection({ b }: { b: BriefRecord }) {
  return (
    <BriefSection
      icon={<IcoKey size={13} />}
      title="Mot-clé cible et requêtes secondaires"
      sub="Volumes relevés au 28 août 2026 · seuil de sélection : 150 recherches par mois minimum"
    >
      <div className="ct-kw">
        <span className="ct-kw-t">{b.kw.term}</span>
        <IntentPill id={b.kw.intent} sm />
        <span className="ct-num">{b.kw.vol} rech./mois</span>
        <span className="ct-num" style={{ color: 'var(--fg3)' }}>
          difficulté {b.kw.difficulty} / 100 · seuil de faisabilité : 45
        </span>
        {b.kw.pos !== null && <Pill label={`Position ${b.kw.pos} atteinte`} tone="green" sm />}
      </div>
      {b.fromKw && (
        <div className="ct-ai" style={{ marginTop: 9, background: 'var(--bg-muted)', borderColor: 'var(--bd-solid)' }}>
          <span style={{ color: 'var(--fg3)' }}>
            <IcoKey size={13} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {b.fromKwNote}{' '}
            <Link href={routes.priorite(b.clientId, b.prioSlug)}>Revoir l’opportunité</Link>
          </div>
        </div>
      )}
      <div className="lbl" style={{ margin: '13px 0 6px' }}>
        Requêtes secondaires à couvrir
      </div>
      <div className="ct-table">
        {b.secondary.map((s) => (
          <div key={s.term} className="ct-kwrow">
            <span className="ct-kwrow-k">{s.term}</span>
            <IntentPill id={s.intent} sm />
            <span className="ct-num">{s.vol} rech./mois</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
        Ces requêtes se traitent dans le corps du texte, pas en les répétant : chacune correspond à une question à
        laquelle une section doit répondre.
      </div>
    </BriefSection>
  );
}

/* ── Intention de recherche ── */

export function IntentSection({ b }: { b: BriefRecord }) {
  return (
    <BriefSection
      icon={<IcoEye size={13} />}
      title="Intention de recherche"
      sub="Ce que cherche vraiment la personne qui tape cette requête — la partie que les briefs oublient"
    >
      <p style={{ fontSize: '0.8125rem', color: 'var(--fg2)', lineHeight: 1.65 }}>{b.intentText}</p>
      <div className="ct-ai" style={{ marginTop: 10 }}>
        <span style={{ color: 'var(--violet-fg)' }}>
          <IcoSpark size={13} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>Vérification faite par l’agent.</b> {b.intentProof}
        </div>
      </div>
    </BriefSection>
  );
}

/* ── Plan proposé ── */

export function OutlineSection({ b }: { b: BriefRecord }) {
  const [rows, setRows] = useState<BrOutlineRow[]>(b.outline);
  const [dirty, setDirty] = useState(false);

  const upd = (i: number, t: string) => {
    setRows((r) => r.map((x, j) => (j === i ? { ...x, t } : x)));
    setDirty(true);
  };
  const del = (i: number) => {
    setRows((r) => r.filter((_, j) => j !== i));
    setDirty(true);
  };
  const add = (h: 2 | 3) => {
    setRows((r) => [...r, { h, t: '' }]);
    setDirty(true);
  };

  return (
    <BriefSection
      icon={<IcoList size={13} />}
      title="Plan proposé"
      sub={`${rows.length} titres · proposé par l’agent, à vous de le corriger avant de remettre le brief`}
      right={
        dirty ? (
          <Pill label="Modifié" tone="yellow" sm />
        ) : (
          <Pill label="Proposition de l’agent" tone="violet" sm icon={<IcoSpark size={11} />} />
        )
      }
    >
      <div className="ct-outline">
        {rows.map((r, i) => (
          <div key={i} className={`ct-h${r.h === 3 ? ' h3' : ''}`}>
            <span className="ct-h-tag">H{r.h}</span>
            <input
              className="ct-h-in"
              value={r.t}
              onChange={(e) => upd(i, e.target.value)}
              placeholder="Titre de section"
              aria-label={`Titre de niveau ${r.h}`}
            />
            <button type="button" className="btn-icon" style={{ width: 22, height: 22 }} onClick={() => del(i)} aria-label="Retirer ce titre">
              <IcoX size={11} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
        <button type="button" className="btn-out" style={{ fontSize: '0.625rem' }} onClick={() => add(2)}>
          <IcoPlus />
          Ajouter un H2
        </button>
        <button type="button" className="btn-out" style={{ fontSize: '0.625rem' }} onClick={() => add(3)}>
          <IcoPlus />
          Ajouter un H3
        </button>
      </div>
    </BriefSection>
  );
}

/* ── Concurrents à battre ── */

export function CompetitorSection({ b }: { b: BriefRecord }) {
  return (
    <BriefSection icon={<IcoUsers size={13} />} title="Concurrents à battre" sub="Qui occupe la première page aujourd’hui, et par quel angle">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {b.competitors.map((c) => (
          <div key={c.domain} className="ct-comp">
            <span className="ct-rank">{c.rank}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.domain}</span>
                <span className="ct-num" style={{ color: 'var(--fg3)' }}>
                  {c.words} mots
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 3 }}>{c.angle}</div>
            </div>
          </div>
        ))}
      </div>
    </BriefSection>
  );
}

/* ── Consignes de rédaction ── */

export function RulesSection({ b }: { b: BriefRecord }) {
  return (
    <BriefSection icon={<IcoRuler size={13} />} title="Consignes de rédaction" sub="Ce que le rédacteur doit respecter, et pourquoi">
      <div>
        <div className="dl-field">
          <span className="dl-field-l">Longueur visée</span>
          <span className="dl-field-v">
            <b>{b.rules.length}</b>
            <div style={{ color: 'var(--fg3)', fontWeight: 400, marginTop: 2 }}>{b.rules.lengthWhy}</div>
          </span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Ton</span>
          <span className="dl-field-v">{b.rules.tone}</span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Liens internes à placer</span>
          <span className="dl-field-v">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {b.rules.links.map(([t, u]) => (
                <span key={u}>
                  {t} <span style={{ color: 'var(--fg3)', fontSize: '0.625rem' }}>— {u}</span>
                </span>
              ))}
            </div>
          </span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Appel à l’action</span>
          <span className="dl-field-v">{b.rules.cta}</span>
        </div>
        <div className="dl-field">
          <span className="dl-field-l">Illustrations</span>
          <span className="dl-field-v">{b.rules.images}</span>
        </div>
      </div>
    </BriefSection>
  );
}
