'use client';

import { useActionState } from 'react';
import { saveAgencyProfile } from '@/app/parametres/actions';
import { Field, Notice, SectionHead } from '@/app/parametres/bits';
import { IcoCheck, IcoLogo } from '@/components/ui/Icons';
import type { AgencyProfile } from '@/lib/queries/agence';

export function AgencePanel({ agency, canEdit }: { agency: AgencyProfile | null; canEdit: boolean }) {
  const [state, action, pending] = useActionState(saveAgencyProfile, null);
  const v = (x: string | null | undefined) => x ?? '';
  const missingTax = agency && (!agency.gstNumber || !agency.qstNumber);
  const ro = !canEdit;

  return (
    <form action={action} key={agency?.id ?? 'none'}>
      <SectionHead
        title="Profil de l'agence"
        sub="Ces informations apparaissent sur les devis, les factures et les rapports envoyés aux clients."
        action={
          <button
            className="btn-pri"
            type="submit"
            disabled={!agency || ro || pending}
            title={ro ? 'Réservé à la gestion de l’agence' : undefined}
          >
            <IcoCheck size={12} />
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        }
      />
      {!agency && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem', marginBottom: 14 }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir son profil.
        </div>
      )}
      <Notice state={state} />
      {missingTax && (
        <Notice tone="warn">
          Les numéros d&apos;inscription à la TPS et à la TVQ ne sont pas saisis. Une facture qui réclame les
          taxes doit les afficher, sinon le client ne peut pas récupérer ses crédits.
        </Notice>
      )}
      {agency && ro && (
        <Notice tone="warn">
          Vous pouvez consulter le profil, mais seule une personne qui gère l&apos;agence peut le modifier.
        </Notice>
      )}
      <div className="card" style={{ padding: '1.25rem', marginBottom: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            paddingBottom: 18,
            borderBottom: '1px solid var(--bd)',
            marginBottom: 18,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'var(--primary)',
              color: 'var(--primary-fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {agency?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoUrl} alt="" width={64} height={64} style={{ objectFit: 'cover' }} />
            ) : (
              <IcoLogo size={28} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {agency?.name ?? 'Agence'}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--fg3)', marginTop: 2 }}>
              Logo affiché sur les documents · PNG ou SVG, 512×512 px — le téléversement viendra avec le stockage.
            </p>
          </div>
        </div>

        <div className="st-grid2">
          <Field label="Nom de l'agence" htmlFor="st-name">
            <input id="st-name" name="name" className="fld" defaultValue={v(agency?.name)} readOnly={ro} required />
          </Field>
          <Field label="Raison sociale" htmlFor="st-legal">
            <input id="st-legal" name="legal_name" className="fld" defaultValue={v(agency?.legalName)} readOnly={ro} />
          </Field>
          <Field label="Site web" htmlFor="st-web">
            <input id="st-web" name="website" className="fld" defaultValue={v(agency?.website)} readOnly={ro} />
          </Field>
          <Field label="Courriel de contact" htmlFor="st-mail">
            <input id="st-mail" name="email" type="email" className="fld" defaultValue={v(agency?.email)} readOnly={ro} />
          </Field>
          <Field label="Téléphone" htmlFor="st-tel">
            <input id="st-tel" name="phone" className="fld" defaultValue={v(agency?.phone)} readOnly={ro} />
          </Field>
          <Field label="Adresse" htmlFor="st-adr">
            <input id="st-adr" name="address" className="fld" defaultValue={v(agency?.address)} readOnly={ro} />
          </Field>
          <Field label="Ville" htmlFor="st-city">
            <input id="st-city" name="city" className="fld" defaultValue={v(agency?.city)} readOnly={ro} />
          </Field>
          <div className="st-grid2">
            <Field label="Province" htmlFor="st-prov">
              <input id="st-prov" name="province" className="fld" defaultValue={v(agency?.province)} readOnly={ro} />
            </Field>
            <Field label="Code postal" htmlFor="st-pc">
              <input id="st-pc" name="postal_code" className="fld" defaultValue={v(agency?.postalCode)} readOnly={ro} />
            </Field>
          </div>
          <Field label="Numéro de TPS" htmlFor="st-gst" hint="Format : 123456789 RT0001">
            <input id="st-gst" name="gst_number" className="fld" defaultValue={v(agency?.gstNumber)} placeholder="À saisir" readOnly={ro} />
          </Field>
          <Field label="Numéro de TVQ" htmlFor="st-qst" hint="Format : 1234567890 TQ0001">
            <input id="st-qst" name="qst_number" className="fld" defaultValue={v(agency?.qstNumber)} placeholder="À saisir" readOnly={ro} />
          </Field>
        </div>
      </div>
    </form>
  );
}
