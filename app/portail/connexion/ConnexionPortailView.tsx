'use client';

/**
 * Connexion au portail client — session 5.1.
 *
 * Par lien magique, jamais par mot de passe : le client entre son courriel,
 * reçoit un lien, clique, il est connecté. Quatre états à couvrir : la
 * saisie, « vérifiez votre boîte », l'adresse inconnue, le lien expiré.
 *
 * Dans cette démonstration, rien n'envoie de vrai courriel : le bouton
 * « J'ai cliqué sur le lien » simule l'arrivée depuis le lien magique et
 * mène directement à `/portail`, comme le ferait un vrai clic reçu par
 * courriel.
 */
import { useState } from 'react';
import { useTheme } from '@/components/shell/ThemeProvider';
import { IcoArrowR, IcoChevL, IcoClock, IcoLogo, IcoMail, IcoMoon, IcoSend, IcoSun, IcoWarn } from '@/components/ui/Icons';
import { routes } from '@/lib/routes';
import { PORTAL_ACCOUNT, PORTAL_KNOWN_EMAILS, PORTAL_LINK_MINUTES } from '@/lib/data/portail';

type Scenario = 'saisie' | 'boite' | 'inconnue' | 'expire';
type Step = 'ask' | 'sent' | 'expired';

const SCENARIOS: readonly [Scenario, string][] = [
  ['saisie', 'Saisie du courriel'],
  ['boite', 'Vérifiez votre boîte'],
  ['inconnue', 'Adresse inconnue'],
  ['expire', 'Lien expiré'],
];

const UNKNOWN_ERROR = `Nous ne connaissons pas cette adresse. Vérifiez l’orthographe, ou écrivez à ${PORTAL_ACCOUNT.pmEmail} pour qu’elle vous ajoute au compte.`;

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: '1.5rem' }}>
      <span className="pc-mark" aria-hidden="true">
        <IcoLogo size={19} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>HuntPilote</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--fg3)' }}>Votre espace client</div>
      </div>
    </div>
  );
}

function AskEmail({
  email,
  setEmail,
  error,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="pc-card">
      <Brand />
      <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Accédez à vos rapports</h1>
      <p style={{ fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
        Entrez l’adresse courriel à laquelle votre agence vous écrit. Nous vous envoyons un lien de connexion —
        aucun mot de passe à retenir.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="pc-field">
          <label htmlFor="pc-email">Adresse courriel</label>
          <input
            id="pc-email"
            className={`pc-input${error ? ' bad' : ''}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@votreentreprise.ca"
            aria-invalid={!!error}
            aria-describedby={error ? 'pc-email-err' : undefined}
          />
        </div>
        {error && (
          <div className="pc-err" id="pc-email-err" role="alert">
            <span>
              <IcoWarn size={14} />
            </span>
            <span>{error}</span>
          </div>
        )}
        <button type="submit" className="pc-btn solid big" disabled={!email.trim()}>
          <IcoSend size={14} />
          Recevoir mon lien de connexion
        </button>
      </form>
      <div className="pc-sep" />
      <p className="pc-hint">
        Le lien reste valide <b style={{ color: 'var(--fg2)' }}>{PORTAL_LINK_MINUTES} minutes</b> et ne fonctionne
        qu’une fois. Une question ? Écrivez à <a href={`mailto:${PORTAL_ACCOUNT.pmEmail}`}>{PORTAL_ACCOUNT.pmEmail}</a>.
      </p>
    </div>
  );
}

function CheckInbox({
  email,
  resent,
  onResend,
  onBack,
}: {
  email: string;
  resent: boolean;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <div className="pc-card">
      <Brand />
      <div className="pc-sent" aria-hidden="true">
        <IcoMail size={20} />
      </div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Vérifiez votre boîte de réception</h1>
      <p style={{ fontSize: '0.9375rem' }}>
        Un lien de connexion vient de partir vers <b style={{ color: 'var(--fg1)' }}>{email}</b>.
      </p>
      <ol className="pc-steps">
        <li>
          <span className="n">1</span>
          <span>Ouvrez le courriel intitulé « Votre lien de connexion — HuntPilote ».</span>
        </li>
        <li>
          <span className="n">2</span>
          <span>Cliquez sur le bouton du courriel. Vous arrivez directement dans votre espace.</span>
        </li>
        <li>
          <span className="n">3</span>
          <span>Rien reçu au bout de deux minutes ? Regardez dans vos indésirables.</span>
        </li>
      </ol>
      <a href={routes.portail()} className="pc-btn solid big" style={{ marginBottom: 9, textDecoration: 'none' }}>
        J’ai cliqué sur le lien — ouvrir mon espace
        <IcoArrowR size={14} />
      </a>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="pc-btn" onClick={onResend} disabled={resent} style={{ flex: 1, justifyContent: 'center' }}>
          {resent ? 'Nouveau lien envoyé' : 'Renvoyer le lien'}
        </button>
        <button type="button" className="pc-btn" onClick={onBack} style={{ flex: 1, justifyContent: 'center' }}>
          <IcoChevL size={13} />
          Changer d’adresse
        </button>
      </div>
      <div className="pc-sep" />
      <p className="pc-hint">
        Le lien expire dans <b style={{ color: 'var(--fg2)' }}>{PORTAL_LINK_MINUTES} minutes</b>. Passé ce délai,
        demandez-en un nouveau depuis cette page.
      </p>
    </div>
  );
}

function ExpiredLink({
  email,
  resent,
  onResend,
  onBack,
}: {
  email: string;
  resent: boolean;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <div className="pc-card">
      <Brand />
      <div className="pc-sent warn" aria-hidden="true">
        <IcoClock size={20} />
      </div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ce lien a expiré</h1>
      <p style={{ fontSize: '0.9375rem' }}>
        Les liens de connexion ne restent valides que <b style={{ color: 'var(--fg1)' }}>{PORTAL_LINK_MINUTES} minutes</b>,
        et ne servent qu’une fois — c’est ce qui protège vos données. Celui-ci a dépassé le délai.
      </p>
      <p style={{ fontSize: '0.9375rem', marginTop: 10, marginBottom: '1.25rem' }}>
        Rien n’est perdu : demandez-en un nouveau, il arrive en quelques secondes.
      </p>
      {resent ? (
        <>
          <div className="pc-frozen-in" style={{ background: 'var(--green-m)', borderColor: 'var(--green-b)', marginBottom: 10 }}>
            <span style={{ color: 'var(--green-fg)' }}>
              <IcoMail size={14} />
            </span>
            <div>
              <b>Nouveau lien envoyé à {email}.</b> Il est valide {PORTAL_LINK_MINUTES} minutes.
            </div>
          </div>
          <a href={routes.portail()} className="pc-btn solid big" style={{ textDecoration: 'none' }}>
            J’ai cliqué sur le nouveau lien
            <IcoArrowR size={14} />
          </a>
        </>
      ) : (
        <button type="button" className="pc-btn solid big" onClick={onResend}>
          <IcoSend size={14} />
          M’envoyer un nouveau lien
        </button>
      )}
      <div className="pc-sep" />
      <p className="pc-hint">
        Ce n’est pas votre adresse ?{' '}
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'var(--green-d)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Utilisez-en une autre
        </button>
        .
      </p>
    </div>
  );
}

export function ConnexionPortailView() {
  const { theme, toggleTheme } = useTheme();
  const [scenario, setScenario] = useState<Scenario>('saisie');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('ask');
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const setSc = (s: Scenario) => {
    setScenario(s);
    setResent(false);
    setError(null);
    if (s === 'saisie') {
      setStep('ask');
      setEmail('');
    }
    if (s === 'boite') {
      setStep('sent');
      setEmail(PORTAL_KNOWN_EMAILS[0]);
    }
    if (s === 'inconnue') {
      setStep('ask');
      setEmail('jean@ancienneadresse.ca');
      setError(UNKNOWN_ERROR);
    }
    if (s === 'expire') {
      setStep('expired');
      setEmail(PORTAL_KNOWN_EMAILS[0]);
    }
  };

  const submit = () => {
    const v = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) {
      setError('Cette adresse n’a pas l’air complète. Elle doit ressembler à vous@votreentreprise.ca.');
      return;
    }
    if (!PORTAL_KNOWN_EMAILS.includes(v)) {
      setError(UNKNOWN_ERROR);
      return;
    }
    setError(null);
    setResent(false);
    setStep('sent');
  };

  return (
    <div className="pc-root page-scroll">
      <div className="pc-demo">
        <select value={scenario} onChange={(e) => setSc(e.target.value as Scenario)} aria-label="État de démonstration">
          {SCENARIOS.map(([id, l]) => (
            <option key={id} value={id}>
              {l}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          aria-label="Changer de thème"
        >
          {theme === 'dark' ? <IcoSun size={14} /> : <IcoMoon size={14} />}
        </button>
      </div>
      <div className="pc-auth">
        {step === 'ask' && (
          <AskEmail
            email={email}
            setEmail={(v) => {
              setEmail(v);
              setError(null);
            }}
            error={error}
            onSubmit={submit}
          />
        )}
        {step === 'sent' && (
          <CheckInbox
            email={email}
            resent={resent}
            onResend={() => setResent(true)}
            onBack={() => {
              setStep('ask');
              setResent(false);
            }}
          />
        )}
        {step === 'expired' && (
          <ExpiredLink
            email={email}
            resent={resent}
            onResend={() => setResent(true)}
            onBack={() => {
              setStep('ask');
              setEmail('');
              setResent(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
