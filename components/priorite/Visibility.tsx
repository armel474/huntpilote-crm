'use client';

/**
 * Colonne de droite du détail d'une priorité : visibilité client et libellé.
 *
 * Ces deux cartes portent la règle 1 de `docs/decisions.md` — trois états de
 * visibilité, double libellé (interne / client), et validation humaine
 * obligatoire avant qu'un texte n'atteigne le client.
 */
import { useState } from 'react';
import { Lbl, Pill, Sec } from '@/components/ui/Atoms';
import { IcoCheck, IcoEye, IcoEyeOff, IcoLogo, IcoTask, IcoWarn } from '@/components/ui/Icons';
import { PD, PD_CLIENT, VIS, type Visibility } from '@/lib/data/priorite';

const VIS_ICON: Record<Visibility, typeof IcoEye> = {
  interne: IcoEyeOff,
  annonce: IcoEye,
  traitement: IcoTask,
};

/* ── Visibilité client ── */

export function VisibilityCard({
  vis,
  setVis,
  assigned,
  closed,
  labelOk,
  label,
}: {
  vis: Visibility;
  setVis: (v: Visibility) => void;
  /** Une priorité assignée est forcément visible « en traitement ». */
  assigned: boolean;
  /** Ignorée ou faux positif : la visibilité est figée. */
  closed: boolean;
  labelOk: boolean;
  label: string;
}) {
  return (
    <Sec title="Visibilité client" sub="Une décision éditoriale : que verra le client dans son rapport ?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {VIS.map((v) => {
          const on = vis === v.id;
          // « En traitement » ne s'atteint que par l'assignation ; les deux
          // autres se referment dès que la priorité est assignée ou close.
          const locked = v.id === 'traitement' ? !assigned : assigned || closed;
          const Icon = VIS_ICON[v.id];
          return (
            <button
              key={v.id}
              type="button"
              className="vis-row"
              disabled={locked}
              aria-pressed={on}
              onClick={() => !locked && setVis(v.id)}
              style={{
                background: on ? 'var(--bg-solid)' : 'transparent',
                borderColor: on ? 'var(--fg1)' : 'var(--bd-solid)',
                boxShadow: on ? '0 0 0 1px var(--fg1)' : 'none',
                opacity: locked && !on ? 0.5 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `1.5px solid ${on ? 'var(--fg1)' : 'var(--bd-strong)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {on && (
                  <span
                    style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fg1)' }}
                  />
                )}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  <Icon />
                  {v.label}
                  {on && (
                    <span
                      style={{
                        fontSize: '0.5rem',
                        fontWeight: 700,
                        color: 'var(--fg4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                      }}
                    >
                      · état courant
                    </span>
                  )}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.5625rem',
                    color: 'var(--fg3)',
                    marginTop: 2,
                  }}
                >
                  {v.trigger}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.625rem',
                    color: 'var(--fg2)',
                    marginTop: 3,
                    lineHeight: 1.45,
                  }}
                >
                  Le client voit : {v.sees}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {assigned && vis !== 'traitement' && (
        <p style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginBottom: 8 }}>
          Passée automatiquement en traitement à l’assignation.
        </p>
      )}

      <Lbl mb={6}>Aperçu — ce que voit le client maintenant</Lbl>
      <ClientPreview vis={vis} labelOk={labelOk} label={label} />
    </Sec>
  );
}

/* ── Aperçu côté client ── */

/**
 * Rendu du document tel que le client le reçoit. Les couleurs sont écrites en
 * dur : ce bloc représente le rapport client, qui reste blanc même quand
 * l'agence travaille en thème sombre.
 */
export function ClientPreview({
  vis,
  labelOk,
  label,
}: {
  vis: Visibility;
  labelOk: boolean;
  label: string;
}) {
  if (vis === 'interne') {
    return (
      <div
        style={{
          padding: '18px 14px',
          borderRadius: 10,
          border: '1.5px dashed var(--bd-strong)',
          textAlign: 'center',
          color: 'var(--fg3)',
          fontSize: '0.6875rem',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color: 'var(--fg4)' }}>
          <IcoEyeOff />
        </div>
        Rien. Cette priorité n’apparaît ni dans le portail ni dans le rapport.
      </div>
    );
  }

  return (
    <div className="client-doc">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            background: '#1F1F1F',
            color: '#fff',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IcoLogo size={9} />
        </span>
        <span
          style={{
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: '#71717A',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {vis === 'annonce' ? 'Point d’attention' : 'En cours de traitement'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: '#A1A1AA' }}>
          Rapport · {PD_CLIENT.name}
        </span>
      </div>

      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#18181B', marginBottom: 4 }}>
        {PD.clientTitle}
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 6,
          outline: labelOk ? 'none' : '1.5px dashed #D4B24A',
          outlineOffset: 3,
        }}
      >
        <p style={{ fontSize: '0.6875rem', lineHeight: 1.55, color: '#3F3F46', margin: 0, textWrap: 'pretty' }}>
          {label}
        </p>
        {!labelOk && (
          <span
            style={{
              position: 'absolute',
              top: -9,
              right: 4,
              fontSize: '0.5rem',
              fontWeight: 700,
              background: '#F5E8B5',
              color: '#7A5D14',
              borderRadius: 999,
              padding: '1px 6px',
            }}
          >
            à relire
          </span>
        )}
      </div>

      {vis === 'annonce' && (
        <div style={{ fontSize: '0.5625rem', color: '#A1A1AA', marginTop: 8 }}>
          Aucune échéance communiquée.
        </div>
      )}

      {vis === 'traitement' && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #E4E4E7' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.5625rem',
              color: '#3F3F46',
              marginBottom: 4,
            }}
          >
            <b>Avancement</b>
            <span>{PD.task.pct} %</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: '#E4E4E7', overflow: 'hidden' }}>
            <div style={{ width: `${PD.task.pct}%`, height: '100%', background: '#16A34A' }} />
          </div>
          <div style={{ fontSize: '0.5625rem', color: '#3F3F46', marginTop: 6, lineHeight: 1.45 }}>
            <b>Fait :</b> {PD.task.done}
          </div>
        </div>
      )}

      {!labelOk && (
        <div
          style={{
            marginTop: 8,
            fontSize: '0.5625rem',
            color: '#7A5D14',
            display: 'flex',
            gap: 4,
            alignItems: 'center',
          }}
        >
          <IcoWarn size={12} />
          Ce texte n’est pas encore validé par un humain — il ne sera pas publié.
        </div>
      )}
    </div>
  );
}

/* ── Libellé client ── */

export function LabelCard({
  label,
  setLabel,
  labelOk,
  setLabelOk,
  vis,
}: {
  label: string;
  setLabel: (v: string) => void;
  labelOk: boolean;
  setLabelOk: (v: boolean) => void;
  vis: Visibility;
}) {
  const [edited, setEdited] = useState(false);
  const visible = vis !== 'interne';

  return (
    <Sec
      title="Libellé client"
      sub="Rédigé par l’agent · la langue du client, pas la nôtre"
      right={
        labelOk ? (
          <Pill label="Validé" tone="green" icon={<IcoCheck />} />
        ) : (
          <Pill label="À relire" tone="yellow" icon={<IcoWarn size={12} />} />
        )
      }
    >
      <div style={{ marginBottom: 8 }}>
        <Lbl mb={3}>Interne — équipe</Lbl>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--fg2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {PD.internal}
        </div>
      </div>

      <Lbl mb={3}>
        <label htmlFor="libelle-client">Client — éditable</label>
      </Lbl>
      <textarea
        id="libelle-client"
        className="lbl-edit"
        value={label}
        rows={5}
        onChange={(e) => {
          setLabel(e.target.value);
          setLabelOk(false);
          setEdited(true);
        }}
      />

      {!labelOk ? (
        <div
          style={{
            marginTop: 8,
            padding: '8px 10px',
            borderRadius: 9,
            background: visible ? 'var(--red-m)' : 'var(--yellow-m)',
            border: `1px solid ${visible ? 'var(--red-b)' : 'var(--yellow-b)'}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'flex-start',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: visible ? 'var(--red)' : 'var(--yellow-fg)',
              lineHeight: 1.4,
            }}
          >
            <span style={{ marginTop: 2 }}>
              <IcoWarn size={12} />
            </span>
            {visible
              ? 'Bloque la publication du rapport de septembre.'
              : 'Bloquera la publication dès que la priorité sera visible.'}
          </div>
          <div style={{ fontSize: '0.5625rem', color: 'var(--fg3)', marginTop: 3, marginLeft: 18 }}>
            Un humain doit valider le texte avant qu’il ne soit montré au client.
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, marginLeft: 18, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-pri"
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.6875rem' }}
              onClick={() => {
                setLabelOk(true);
                setEdited(false);
              }}
            >
              <IcoCheck />
              Valider le libellé
            </button>
            <button
              type="button"
              className="btn-out"
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.6875rem',
                color: 'var(--violet-fg)',
                borderColor: 'var(--violet-b)',
              }}
              onClick={() => setLabel(PD.clientLabel)}
            >
              ✦ Régénérer
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.5625rem',
            color: 'var(--fg3)',
          }}
        >
          <span style={{ color: 'var(--green)', display: 'flex' }}>
            <IcoCheck />
          </span>
          Validé par {PD_CLIENT.pm} · 7 sept. 2026{edited && ' · modifié'}
        </div>
      )}
    </Sec>
  );
}
