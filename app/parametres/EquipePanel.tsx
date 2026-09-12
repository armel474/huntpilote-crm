'use client';

import { useActionState, useEffect, useState } from 'react';
import { inviteMember, updateMember } from '@/app/parametres/actions';
import { Dialog, Field, Notice, SectionHead } from '@/app/parametres/bits';
import { Badge } from '@/components/ui/Atoms';
import { IcoMore, IcoPlus } from '@/components/ui/Icons';
import type { Session } from '@/lib/auth';
import { PERMISSIONS, PERMISSION_LABEL, ROLE_LABEL } from '@/lib/format';
import type { Member, Permission, Role } from '@/lib/queries/agence';

const ROLE_TONE: Record<Role, 'green' | 'blue' | 'violet' | 'yellow'> = {
  admin: 'green',
  chef_projet: 'blue',
  specialiste_seo: 'violet',
  redacteur: 'yellow',
};
const ROLES: Role[] = ['admin', 'chef_projet', 'specialiste_seo', 'redacteur'];

function RoleSelect({ id, defaultValue }: { id: string; defaultValue: Role }) {
  return (
    <select id={id} name="role" className="sel" defaultValue={defaultValue} style={{ fontSize: '0.8125rem' }}>
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABEL[r]}
        </option>
      ))}
    </select>
  );
}

/* ── Inviter ── */

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(inviteMember, null);
  return (
    <Dialog title="Inviter un membre" onClose={onClose}>
      <form action={action}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--fg3)', marginBottom: 14, lineHeight: 1.5 }}>
          La personne apparaît tout de suite dans l&apos;équipe. Son compte se rattache à l&apos;invitation à sa
          première connexion, par son courriel — envoyez-lui l&apos;adresse de HuntPilote.
        </p>
        <Notice state={state} />
        {state?.ok ? (
          <button className="btn-pri" type="button" onClick={onClose}>
            Fermer
          </button>
        ) : (
          <>
            <div className="st-grid2">
              <Field label="Prénom" htmlFor="inv-first">
                <input id="inv-first" name="first_name" className="fld" autoFocus />
              </Field>
              <Field label="Nom" htmlFor="inv-last">
                <input id="inv-last" name="last_name" className="fld" />
              </Field>
              <Field label="Courriel" htmlFor="inv-mail" span>
                <input id="inv-mail" name="email" type="email" className="fld" required />
              </Field>
              <Field label="Rôle" htmlFor="inv-role">
                <RoleSelect id="inv-role" defaultValue="chef_projet" />
              </Field>
              <Field label="Poste" htmlFor="inv-job">
                <input id="inv-job" name="job_title" className="fld" placeholder="Chef de projet" />
              </Field>
              <Field label="Téléphone" htmlFor="inv-tel">
                <input id="inv-tel" name="phone" className="fld" />
              </Field>
            </div>
            <div className="st-dlg-actions">
              <button className="btn-out" type="button" onClick={onClose}>
                Annuler
              </button>
              <button className="btn-pri" type="submit" disabled={pending}>
                <IcoPlus size={12} />
                {pending ? 'Invitation…' : 'Inviter'}
              </button>
            </div>
          </>
        )}
      </form>
    </Dialog>
  );
}

/* ── Modifier ── */

function MemberDialog({
  member,
  self,
  manage,
  roleDefaults,
  onClose,
}: {
  member: Member;
  self: boolean;
  manage: boolean;
  roleDefaults: Record<Role, Permission[]>;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(updateMember, null);
  const [role, setRole] = useState<Role>(member.role);
  // Les droits cochés : ceux du rôle choisi, corrigés par les ajustements
  // nominatifs déjà enregistrés.
  const [granted, setGranted] = useState<Set<Permission>>(() => new Set(member.permissions));

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.at]);

  const v = (x: string | null | undefined) => x ?? '';
  const pickRole = (r: Role) => {
    setRole(r);
    setGranted(new Set(roleDefaults[r]));
  };
  const toggle = (p: Permission) =>
    setGranted((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });
  const defaults = new Set(roleDefaults[role]);

  return (
    <Dialog title={self ? 'Mon profil' : member.fullName} onClose={onClose} wide={manage}>
      <form action={action}>
        <input type="hidden" name="member_id" value={member.id} />
        {manage && <input type="hidden" name="manage" value="1" />}
        <Notice state={state} />

        <div className="st-grid2">
          <Field label="Prénom" htmlFor="mb-first">
            <input id="mb-first" name="first_name" className="fld" defaultValue={v(member.firstName)} />
          </Field>
          <Field label="Nom" htmlFor="mb-last">
            <input id="mb-last" name="last_name" className="fld" defaultValue={v(member.lastName)} />
          </Field>
          <Field label="Courriel" htmlFor="mb-mail" hint={member.pending ? 'Sert au rattachement du compte à la première connexion.' : undefined}>
            <input id="mb-mail" className="fld" defaultValue={v(member.email)} readOnly />
          </Field>
          <Field label="Téléphone" htmlFor="mb-tel">
            <input id="mb-tel" name="phone" className="fld" defaultValue={v(member.phone)} />
          </Field>
          <Field label="Adresse" htmlFor="mb-adr" span>
            <input id="mb-adr" name="address" className="fld" defaultValue={v(member.address)} />
          </Field>
          <Field label="Ville" htmlFor="mb-city">
            <input id="mb-city" name="city" className="fld" defaultValue={v(member.city)} />
          </Field>
          <div className="st-grid2">
            <Field label="Province" htmlFor="mb-prov">
              <input id="mb-prov" name="province" className="fld" defaultValue={v(member.province)} />
            </Field>
            <Field label="Code postal" htmlFor="mb-pc">
              <input id="mb-pc" name="postal_code" className="fld" defaultValue={v(member.postalCode)} />
            </Field>
          </div>
          <Field label="Photo" htmlFor="mb-avatar" span hint="Adresse d’une image carrée. Le téléversement viendra avec le stockage.">
            <input id="mb-avatar" name="avatar_url" type="url" className="fld" defaultValue={v(member.avatarUrl)} placeholder="https://…" />
          </Field>
        </div>

        {manage && (
          <>
            <div className="st-sep" />
            <div className="lbl" style={{ marginBottom: 10 }}>
              Dans l&apos;agence
            </div>
            <div className="st-grid2">
              <Field label="Rôle" htmlFor="mb-role">
                <select
                  id="mb-role"
                  name="role"
                  className="sel"
                  value={role}
                  onChange={(e) => pickRole(e.target.value as Role)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Poste" htmlFor="mb-job">
                <input id="mb-job" name="job_title" className="fld" defaultValue={v(member.jobTitle)} />
              </Field>
              <Field label="Arrivée" htmlFor="mb-start">
                <input id="mb-start" name="started_on" type="date" className="fld" defaultValue={v(member.startedOn)} />
              </Field>
              <Field label="Taux horaire ($)" htmlFor="mb-rate" hint="Sert au calcul des marges, jamais montré au client.">
                <input
                  id="mb-rate"
                  name="hourly_rate"
                  inputMode="decimal"
                  className="fld"
                  defaultValue={member.hourlyRateCents === null ? '' : String(member.hourlyRateCents / 100)}
                />
              </Field>
              <Field label="Accès" span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                  <input type="checkbox" name="active" value="1" defaultChecked={member.active} disabled={self} />
                  Compte actif
                  {self && <span style={{ color: 'var(--fg4)', fontSize: '0.6875rem' }}>· vous ne pouvez pas vous désactiver</span>}
                </label>
              </Field>
            </div>

            <div className="st-sep" />
            <div className="lbl" style={{ marginBottom: 4 }}>
              Ce que {self ? 'vous pouvez' : `${member.firstName ?? member.fullName} peut`} faire
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--fg4)', marginBottom: 10, lineHeight: 1.5 }}>
              Le rôle donne les droits par défaut. Cochez ou décochez pour faire une exception nominative : elle
              est enregistrée comme telle, sans inventer un rôle de plus.
            </p>
            <div className="st-perms">
              {PERMISSIONS.map((p) => {
                const on = granted.has(p);
                const exception = on !== defaults.has(p);
                return (
                  <label key={p} className={`st-perm${on ? ' on' : ''}`}>
                    <input type="checkbox" name="permission" value={p} checked={on} onChange={() => toggle(p)} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8125rem' }}>
                        {PERMISSION_LABEL[p].label}
                        {exception && <Badge label={on ? 'Accordé en plus' : 'Retiré'} tone={on ? 'blue' : 'yellow'} />}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--fg4)' }}>
                        {PERMISSION_LABEL[p].hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        <div className="st-dlg-actions">
          <button className="btn-out" type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-pri" type="submit" disabled={pending}>
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/* ── La liste ── */

export function EquipePanel({
  members,
  session,
  roleDefaults,
  canManage,
}: {
  members: Member[];
  session: Session | null;
  roleDefaults: Record<Role, Permission[]>;
  canManage: boolean;
}) {
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const cell: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid var(--bd)' };
  const active = members.filter((m) => m.active);
  const pending = active.filter((m) => m.pending).length;
  const palette = ['var(--green)', 'var(--blue)', 'var(--violet)', 'var(--yellow-fg)', 'var(--red)'];
  const edited = members.find((m) => m.id === editing);

  if (members.length === 0) {
    return (
      <div>
        <SectionHead title="Membres d'équipe" sub="Qui fait partie de l'agence, et ce que chaque rôle autorise." />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem' }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir son équipe.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Membres d'équipe"
        sub={`${active.length} membre${active.length > 1 ? 's' : ''}${
          pending ? ` · ${pending} invitation${pending > 1 ? 's' : ''} en attente` : ''
        }`}
        action={
          <button
            className="btn-pri"
            type="button"
            disabled={!canManage}
            title={canManage ? undefined : 'Réservé à la gestion d’équipe'}
            onClick={() => setInviting(true)}
          >
            <IcoPlus size={12} />
            Inviter un membre
          </button>
        }
      />
      <div className="card" style={{ padding: '0.5rem 1.125rem 0.875rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr>
              {['Membre', 'Rôle', 'Poste', ''].map((h, i) => (
                <th
                  key={h || 'actions'}
                  className="lbl"
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--bd-solid)',
                    textAlign: i === 3 ? 'right' : 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => {
              const self = session?.memberId === m.id;
              const editable = canManage || self;
              return (
                <tr key={m.id} style={!m.active ? { opacity: 0.5 } : undefined}>
                  <td style={cell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div
                        aria-hidden="true"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: palette[idx % palette.length],
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {m.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatarUrl} alt="" width={34} height={34} style={{ objectFit: 'cover' }} />
                        ) : (
                          m.initials
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                          }}
                        >
                          {m.fullName}
                          {self && (
                            <span
                              style={{
                                fontSize: '0.5rem',
                                fontWeight: 700,
                                color: 'var(--fg4)',
                                background: 'var(--bg-muted)',
                                borderRadius: 999,
                                padding: '1px 6px',
                              }}
                            >
                              VOUS
                            </span>
                          )}
                          {m.pending && <Badge label="Invitation en attente" tone="yellow" />}
                          {!m.active && <Badge label="Désactivé" tone="neutral" />}
                          {m.overrides.length > 0 && (
                            <Badge label={`${m.overrides.length} exception${m.overrides.length > 1 ? 's' : ''}`} tone="blue" />
                          )}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--fg4)' }}>{m.email ?? '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={cell}>
                    <Badge label={ROLE_LABEL[m.role]} tone={ROLE_TONE[m.role]} />
                  </td>
                  <td style={{ ...cell, fontSize: '0.8125rem', color: 'var(--fg2)' }}>{m.jobTitle ?? '—'}</td>
                  <td style={{ ...cell, textAlign: 'right' }}>
                    <button
                      className="btn-icon"
                      type="button"
                      aria-label={self ? 'Modifier mon profil' : `Modifier ${m.fullName}`}
                      disabled={!editable}
                      onClick={() => setEditing(m.id)}
                    >
                      <IcoMore />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg4)', marginTop: 10 }}>
        Une personne invitée figure ici avant de s&apos;être connectée : son compte se rattache à l&apos;invitation
        à la première connexion, par son courriel.
      </p>

      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
      {edited && (
        <MemberDialog
          key={edited.id}
          member={edited}
          self={session?.memberId === edited.id}
          manage={canManage}
          roleDefaults={roleDefaults}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
