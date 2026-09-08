'use client';

/**
 * Bandeau d'état, blocage par relecture, publication et versions du rapport.
 *
 * Le blocage est la pièce maîtresse : tant qu'un libellé client n'a pas été
 * relu par un humain, le bouton de publication reste verrouillé et l'écran
 * dit précisément quoi relire et où.
 */
import { Lbl, Pill, Sec } from '@/components/ui/Atoms';
import {
  IcoArrowR,
  IcoCheck,
  IcoDoc,
  IcoEye,
  IcoLink,
  IcoLock,
  IcoPen,
  IcoSend,
  IcoWarn,
} from '@/components/ui/Icons';
import { BANNER, REPORT, type EditorState, type SectionId } from '@/lib/data/rapport';

/** Un libellé client non relu, quelle que soit sa nature. */
export type BlockItem = {
  id: string;
  title: string;
  kind: 'proof' | 'prio';
  sec: string;
  secId: SectionId;
};

const TONES: Record<string, readonly [string, string, string]> = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'],
  yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
  neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'],
};

/* ── Bandeau d'état ── */

export function StateBanner({
  state,
  blocked,
  onFix,
  onPublish,
  previewHref,
}: {
  state: EditorState;
  blocked: boolean;
  onFix: () => void;
  onPublish: () => void;
  previewHref: string;
}) {
  const live = state === 'publie' || state === 'corrige';
  // Un brouillon dont tous les libellés sont relus devient « prêt à publier ».
  const key: EditorState = blocked && !live ? 'bloque' : state === 'bloque' ? 'pret' : state;
  const b = BANNER[key];
  const [bg, bd, fg] = TONES[b.tone];

  return (
    <div className="card banner" style={{ background: bg, borderColor: bd }}>
      <span className="banner-ico" style={{ background: fg, color: bg }}>
        {b.tone === 'yellow' ? (
          <IcoWarn size={12} />
        ) : b.tone === 'neutral' ? (
          <IcoPen />
        ) : (
          <IcoCheck />
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--fg1)' }}>{b.title}</div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg2)', lineHeight: 1.5, marginTop: 2 }}>
          {b.desc}
        </p>
      </div>
      {key === 'bloque' && (
        <button type="button" className="btn-pri" onClick={onFix}>
          Voir ce qui manque
          <IcoArrowR />
        </button>
      )}
      {key === 'pret' && (
        <button type="button" className="btn-pri" onClick={onPublish}>
          <IcoSend />
          Publier le rapport
        </button>
      )}
      {live && (
        <a
          className="btn-out"
          href={previewHref}
          target="_blank"
          rel="noopener"
          style={{ textDecoration: 'none' }}
        >
          <IcoEye />
          Voir la page du client
        </a>
      )}
    </div>
  );
}

/* ── Ce qui bloque la publication ── */

export function BlockCard({
  items,
  validate,
  goTo,
}: {
  items: readonly BlockItem[];
  validate: (id: string) => void;
  goTo: (secId: SectionId) => void;
}) {
  const plural = items.length > 1 ? 's' : '';
  return (
    <Sec
      title="À relire avant publication"
      sub={`${items.length} libellé${plural} client encore non relu${plural}`}
      accent="var(--yellow-b)"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it) => (
          <div key={it.id} className="blk-row">
            <span style={{ color: 'var(--yellow-fg)', display: 'flex', flexShrink: 0, marginTop: 2 }}>
              <IcoWarn size={12} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{it.title}</div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 2 }}>
                {it.kind === 'proof' ? 'Preuve de valeur' : 'Priorité visible'} · {it.id} · section
                «&nbsp;{it.sec}&nbsp;»
              </div>
            </div>
            <div className="blk-act">
              <button type="button" className="btn-out" onClick={() => goTo(it.secId)}>
                Aller à la section
              </button>
              <button type="button" className="btn-pri" onClick={() => validate(it.id)}>
                <IcoCheck />
                Marquer relu
              </button>
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
        Un libellé non relu vient du texte d’audit brut. Il n’est pas écrit pour le client : la
        publication reste bloquée jusqu’à sa relecture.
      </p>
    </Sec>
  );
}

/* ── Publication ── */

const PUBLISH_EFFECTS: readonly (readonly [string, string])[] = [
  [
    'Crée un instantané figé',
    'Le client lira cette version, pas la base vivante. Vos modifications ultérieures n’y apparaissent pas.',
  ],
  ['Envoie le lien par courriel', `À ${REPORT.email} — page web, sans mot de passe.`],
];

export function PublishCard({
  state,
  blocked,
  blockCount,
  onPublish,
  onRepublish,
  onFix,
  previewHref,
}: {
  state: EditorState;
  blocked: boolean;
  blockCount: number;
  onPublish: () => void;
  onRepublish: () => void;
  onFix: () => void;
  previewHref: string;
}) {
  const live = state === 'publie' || state === 'corrige';

  return (
    <Sec
      title="Publication"
      sub={live ? `En ligne depuis le ${REPORT.publish}` : 'Rien n’est en ligne pour cette période'}
      right={
        <Pill
          label={live ? (state === 'corrige' ? 'v2 en ligne' : 'v1 en ligne') : 'Brouillon'}
          tone={live ? 'green' : 'neutral'}
          sm
        />
      }
    >
      {!live && (
        <div>
          {blocked ? (
            <>
              <button
                type="button"
                className="btn-pri btn-main"
                disabled
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--fg4)',
                  boxShadow: 'none',
                  cursor: 'not-allowed',
                }}
              >
                <IcoLock />
                Publication bloquée
              </button>
              <button
                type="button"
                className="btn-out"
                onClick={onFix}
                style={{ width: '100%', justifyContent: 'center', marginTop: 6, fontSize: '0.6875rem' }}
              >
                Relire les {blockCount} libellés manquants
              </button>
            </>
          ) : (
            <button type="button" className="btn-pri btn-main" onClick={onPublish}>
              <IcoSend />
              Publier le rapport de septembre
            </button>
          )}
          <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {PUBLISH_EFFECTS.map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 7 }}>
                <span style={{ color: 'var(--fg4)', display: 'flex', flexShrink: 0, marginTop: 2 }}>
                  <IcoCheck />
                </span>
                <div style={{ fontSize: '0.625rem', color: 'var(--fg2)', lineHeight: 1.5 }}>
                  <b style={{ color: 'var(--fg1)' }}>{title}</b> — {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {live && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="link-box">
            <Lbl mb={4}>Lien du client</Lbl>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--fg1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                huntpilote.ca/{REPORT.token}
              </span>
              <button
                type="button"
                className="btn-out"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.5625rem' }}
              >
                <IcoLink />
                Copier
              </button>
            </div>
            <div style={{ fontSize: '0.5rem', color: 'var(--fg3)', marginTop: 5 }}>
              Ouvert 4 fois · dernière lecture le 4 oct. à 08 h 12
            </div>
          </div>

          <a
            className="btn-pri btn-main"
            href={previewHref}
            target="_blank"
            rel="noopener"
            style={{ textDecoration: 'none' }}
          >
            <IcoEye />
            Ouvrir la page du client
          </a>

          <button
            type="button"
            className="btn-out"
            onClick={onRepublish}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.6875rem' }}
            disabled={state === 'corrige'}
          >
            {state === 'corrige' ? 'Version 2 déjà publiée' : 'Publier une correction (v2)'}
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn-out"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.625rem' }}
            >
              <IcoDoc />
              PDF
            </button>
            <button
              type="button"
              className="btn-out"
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: '0.625rem',
                color: 'var(--red)',
                borderColor: 'var(--red-b)',
              }}
            >
              Révoquer le lien
            </button>
          </div>

          <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
            Le PDF est une commodité : la référence reste la page web, que le portail client relira.
          </p>
        </div>
      )}
    </Sec>
  );
}

/* ── Historique des versions ── */

export function VersionsCard({ state }: { state: EditorState }) {
  const list =
    state === 'corrige' ? REPORT.versions : state === 'publie' ? REPORT.versions.slice(1) : [];

  return (
    <Sec
      title="Versions"
      sub={
        list.length
          ? `${list.length} publiée${list.length > 1 ? 's' : ''} · le client lit la plus récente`
          : 'Aucune version publiée'
      }
    >
      {!list.length ? (
        <p style={{ fontSize: '0.6875rem', color: 'var(--fg3)', lineHeight: 1.5 }}>
          La première publication créera la version 1. Chaque correction publiée ajoute une version,
          et l’ancienne reste consultable.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {list.map((v, i) => (
            <div key={v.v} className="ver-row">
              <span
                className="ver-dot"
                style={{ background: i === 0 ? 'var(--green)' : 'var(--bd-strong)' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{v.v}</span>
                  {i === 0 && <Pill label="Lue par le client" tone="green" sm />}
                  <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--fg3)' }}>
                    {v.date}
                  </span>
                </div>
                <p style={{ fontSize: '0.625rem', color: 'var(--fg2)', marginTop: 2, lineHeight: 1.5 }}>
                  {v.note}
                </p>
                <div style={{ fontSize: '0.5rem', color: 'var(--fg3)', marginTop: 2 }}>
                  Par {v.who}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Sec>
  );
}

/* ── Période et destinataire ── */

export function MetaCard() {
  const rows: readonly (readonly [string, string])[] = [
    ['Période couverte', '1 – 30 septembre 2026'],
    ['Client', REPORT.client],
    ['Destinataire', REPORT.email],
    ['Responsable', REPORT.pm],
  ];
  return (
    <Sec title="Période et destinataire">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <Lbl mb={0} style={{ flex: '0 0 7.5rem' }}>
              {label}
            </Lbl>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, flex: 1, minWidth: 0 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 9, fontSize: '0.5625rem', color: 'var(--fg3)', lineHeight: 1.6 }}>
        Le rapport reprend les tâches clôturées et les priorités visibles de cette période
        uniquement.
      </p>
    </Sec>
  );
}
