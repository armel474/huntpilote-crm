/**
 * Audit de prospect tel qu'un prospect le lit — session 2.5, sortie
 * d'Organic Research.
 *
 * Document public atteint par un lien à jeton, hors du cockpit : reprend la
 * mise en page du rapport partageable (écran 1.3) en plus léger — un seul
 * chiffre à retenir, pas de suivi dans le temps.
 */
import { IcoLogo } from '@/components/ui/Icons';
import { AUDIT_PROSPECT } from '@/lib/data/audit-prospect';

export function AuditProspectView() {
  const A = AUDIT_PROSPECT;
  const fmt = (n: number) => n.toLocaleString('fr-CA');

  return (
    <div className="audit-prospect">
      <div className="doc">
        <div className="ap-brand">
          <div className="ap-brand-mark" aria-hidden="true">
            <IcoLogo size={13} />
          </div>
          <span className="ap-brand-name">HuntPilote</span>
          <span className="ap-tag">Audit de prospect · document partageable</span>
        </div>

        <h1>
          {A.name} — audit organique
        </h1>
        <p className="ap-sub">
          {A.domain} · préparé par votre agence · {A.preparedDate}
        </p>

        <div className="ap-drop">
          <b>Chute de trafic organique datée du {A.drop.date}.</b> {A.drop.label} a fait chuter le
          trafic estimé de {fmt(A.drop.before)} à {fmt(A.drop.after)} visites/mois, sans retour au
          niveau précédent depuis. C&apos;est le premier chantier à traiter.
        </div>

        <div className="ap-pot">
          <div className="ap-lbl" style={{ color: 'var(--ap-green-d)' }}>
            Potentiel estimé
          </div>
          <div className="ap-pot-num">+{fmt(A.potentialGain)}</div>
          <div className="ap-pot-lbl">
            visites/mois estimées si les {A.potentialRows.length} requêtes actuellement en
            position 4 à 10 passaient en top 3. C&apos;est le chiffre à intégrer dans votre
            proposition.
          </div>
        </div>

        <div className="ap-card">
          <div className="ap-lbl">Requêtes à fort potentiel</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th>Requête</th>
                  <th>Volume/mois</th>
                  <th>Position</th>
                  <th>Page positionnée</th>
                </tr>
              </thead>
              <tbody>
                {A.potentialRows.map((r) => (
                  <tr key={r.c}>
                    <td>{r.c}</td>
                    <td>{fmt(r.vol)}</td>
                    <td className="ap-pos">{r.pos}</td>
                    <td>{r.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ap-card">
          <div className="ap-lbl">Ce que cet audit couvre</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--ap-ink2)', lineHeight: 1.6 }}>
            Évolution du trafic et des positions sur 24 mois, requêtes positionnées, pages qui
            progressent ou reculent, et le potentiel chiffré ci-dessus. Une version plus complète —
            score pondéré, plan d&apos;action, suivi mensuel — est produite une fois le mandat
            signé.
          </div>
        </div>

        <div className="ap-foot">
          <span>Document généré depuis {A.sourceTool} · valable {A.validity}</span>
          <span>HuntPilote — agence web et SEO</span>
        </div>
      </div>
    </div>
  );
}
