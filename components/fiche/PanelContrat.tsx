'use client';

import { Badge, Lbl } from '@/components/ui/Atoms';
import { IcoCard, IcoDl, IcoEye, IcoRepeat } from '@/components/ui/Icons';
import {
  BILLING_STATS,
  CLIENT,
  CONTRACT_FIELDS,
  INVOICES,
  type InvoiceStatus,
} from '@/lib/data/fiche-client';

const STATUS_COLORS: Record<InvoiceStatus, readonly [string, string, string]> = {
  Payée: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'],
  'En attente': ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  'En retard': ['var(--red-m)', 'var(--red-b)', 'var(--red)'],
};

export function PanelContrat() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Indicateurs clés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {BILLING_STATS.map((s) => {
          const color =
            s.tone === 'green' ? 'var(--green)' : s.tone === 'blue' ? 'var(--blue-fg)' : 'var(--fg1)';
          return (
            <div key={s.label} className="card" style={{ padding: '0.75rem 0.875rem' }}>
              <Lbl>{s.label}</Lbl>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 5,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--fg4)', marginTop: 5 }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Contrat + moyen de paiement */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <section className="card" style={{ flex: '1 1 0', padding: '1rem', minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, flex: 1 }}>Contrat actif</h2>
            <Badge label={`Plan ${CLIENT.plan}`} tone="green" large />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 10px' }}>
            {CONTRACT_FIELDS.map(([label, value]) => (
              <div key={label}>
                <div className="lbl" style={{ marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg1)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--bd-solid)',
            }}
          >
            <span style={{ color: 'var(--green)', display: 'flex' }}>
              <IcoRepeat size={12} />
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--fg3)', flex: 1 }}>
              Renouvellement automatique activé
            </span>
            <button className="btn-out" type="button" style={{ fontSize: '0.625rem', padding: '0.3rem 0.7rem' }}>
              Modifier
            </button>
          </div>

          <div className="lbl" style={{ margin: '14px 0 8px' }}>
            Services facturés
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {CLIENT.services.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'var(--bg-muted)',
                  color: 'var(--fg2)',
                  border: '1px solid var(--bd-solid)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        <section
          className="card"
          style={{
            flex: '0 0 290px',
            padding: '1rem',
            minWidth: 250,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 12 }}>
            Moyen de paiement
          </h2>
          <div
            style={{
              padding: '0.875rem',
              borderRadius: 10,
              background: 'var(--primary)',
              color: 'var(--primary-fg)',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 18,
              }}
            >
              <IcoCard />
              <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.85 }}>
                VISA
              </span>
            </div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              •••• •••• •••• 4242
            </div>
            <div style={{ fontSize: '0.5625rem', opacity: 0.7, marginTop: 6 }}>Expire 08/27</div>
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', lineHeight: 1.7, marginBottom: 'auto' }}>
            <div>
              Facturé le <b style={{ color: 'var(--fg1)' }}>1er</b> de chaque mois
            </div>
            <div>Reçu envoyé à {CLIENT.email}</div>
          </div>
          <button className="btn-out" type="button" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            <IcoCard size={12} />
            Mettre à jour
          </button>
        </section>
      </div>

      {/* Historique des factures */}
      <section className="card" style={{ padding: '0.875rem 1rem' }} aria-labelledby="invoices-title">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2 id="invoices-title" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
            Historique des factures
          </h2>
          <button className="btn-out" type="button" style={{ fontSize: '0.625rem', padding: '0.3rem 0.7rem' }}>
            <IcoDl size={11} />
            Tout exporter
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr>
                {['N° Facture', 'Période', 'Date', 'Montant', 'Statut', ''].map((h, i) => (
                  <th
                    key={h || 'actions'}
                    className="lbl"
                    style={{
                      paddingBottom: 8,
                      borderBottom: '1px solid var(--bd-solid)',
                      textAlign: i === 5 ? 'right' : 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => {
                const sc = STATUS_COLORS[inv.status];
                return (
                  <tr key={inv.num}>
                    <td
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '10px 0',
                        borderBottom: '1px solid var(--bd)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {inv.num}
                    </td>
                    <td
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--fg2)',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--bd)',
                      }}
                    >
                      {inv.period}
                    </td>
                    <td
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--fg3)',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--bd)',
                      }}
                    >
                      {inv.date}
                    </td>
                    <td
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '10px 0',
                        borderBottom: '1px solid var(--bd)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {inv.amount}
                    </td>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid var(--bd)' }}>
                      <span
                        style={{
                          fontSize: '0.5625rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: sc[0],
                          border: `1px solid ${sc[1]}`,
                          color: sc[2],
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '10px 0',
                        borderBottom: '1px solid var(--bd)',
                        display: 'flex',
                        gap: 4,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        className="btn-icon"
                        type="button"
                        title="Voir"
                        aria-label={`Voir la facture ${inv.num}`}
                      >
                        <IcoEye size={12} />
                      </button>
                      <button
                        className="btn-icon"
                        type="button"
                        title="Télécharger"
                        aria-label={`Télécharger la facture ${inv.num}`}
                      >
                        <IcoDl size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
