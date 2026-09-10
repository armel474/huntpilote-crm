'use client';

/**
 * Connexion agence — session 6.2.
 *
 * Aucune authentification n'existe encore (décision 12 : mono-utilisateur
 * pour l'instant). Cet écran reste un outil interne, pas un produit grand
 * public — pas d'argumentaire de vente sur une page de connexion.
 */
import { useState } from 'react';
import { useTheme } from '@/components/shell/ThemeProvider';
import {
  IcoChevL,
  IcoEye,
  IcoEyeOff,
  IcoLogo,
  IcoMail,
  IcoMoon,
  IcoSun,
  IcoWarn,
} from '@/components/ui/Icons';

const KNOWN: Record<string, { name: string; role: string; pass: string }> = {
  'marie@huntpilote.ca': { name: 'Marie Chen', role: 'Administratrice', pass: 'bonjour2026' },
};

type Scenario = 'connexion' | 'oublie' | 'invitation' | 'premiere';
type Step = 'login' | 'forgot' | 'invited' | 'first' | 'welcome';

const SCENARIOS: [Scenario, string][] = [
  ['connexion', 'Connexion'],
  ['oublie', 'Mot de passe oublié'],
  ['invitation', 'Invitation reçue'],
  ['premiere', 'Première connexion'],
];

function Brand() {
  return (
    <div className="cn-brand">
      <span className="cn-mark" aria-hidden="true">
        <IcoLogo size={17} />
      </span>
      <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>HuntPilote</span>
    </div>
  );
}

function Login({ onLogin, onForgot }: { onLogin: () => void; onForgot: () => void }) {
  const [email, setEmail] = useState('marie@huntpilote.ca');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = KNOWN[email.trim().toLowerCase()];
    if (!u) {
      setError('Aucun compte HuntPilote pour cette adresse.');
      return;
    }
    if (pass !== u.pass) {
      setError('Mot de passe incorrect.');
      return;
    }
    setError(null);
    onLogin();
  };

  return (
    <div className="cn-card">
      <Brand />
      <div className="cn-h1">Connexion à l&apos;agence</div>
      <p className="cn-sub">Réservé à l&apos;équipe HuntPilote.</p>
      <form onSubmit={submit}>
        <div className="cn-field">
          <label htmlFor="cn-email">Courriel</label>
          <input
            id="cn-email"
            className="fld"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="prenom@huntpilote.ca"
            style={error ? { borderColor: 'var(--red)' } : undefined}
          />
        </div>
        <div className="cn-field">
          <div className="cn-row">
            <label htmlFor="cn-pass">Mot de passe</label>
            <button type="button" className="cn-back" style={{ marginBottom: 0 }} onClick={onForgot}>
              Mot de passe oublié ?
            </button>
          </div>
          <div className="cn-pw-wrap">
            <input
              id="cn-pass"
              className="fld"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              style={error ? { borderColor: 'var(--red)' } : undefined}
            />
            <button
              type="button"
              className="cn-pw-toggle"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {show ? <IcoEyeOff size={15} /> : <IcoEye size={15} />}
            </button>
          </div>
        </div>
        {error && (
          <div className="cn-err">
            <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>
              <IcoWarn size={14} />
            </span>
            <span>{error}</span>
          </div>
        )}
        <button type="submit" className="btn-pri" style={{ width: '100%', justifyContent: 'center' }} disabled={!email.trim() || !pass}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

function Forgot({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('marie@huntpilote.ca');
  const [sent, setSent] = useState(false);

  return (
    <div className="cn-card">
      <button type="button" className="cn-back" onClick={onBack}>
        <IcoChevL size={13} />
        Retour à la connexion
      </button>
      <Brand />
      {sent ? (
        <>
          <div className="cn-sent" aria-hidden="true">
            <IcoMail size={20} />
          </div>
          <div className="cn-h1">Vérifiez votre boîte</div>
          <p className="cn-sub" style={{ marginBottom: '1.25rem' }}>
            Si <b style={{ color: 'var(--fg1)' }}>{email}</b> correspond à un compte, un lien de réinitialisation
            valide 30 minutes vient de partir.
          </p>
          <button type="button" className="btn-out" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSent(false)}>
            Renvoyer à une autre adresse
          </button>
        </>
      ) : (
        <>
          <div className="cn-h1">Réinitialiser le mot de passe</div>
          <p className="cn-sub">Entrez votre courriel d&apos;agence, nous vous envoyons un lien pour en choisir un nouveau.</p>
          <div className="cn-field">
            <label htmlFor="cn-fe">Courriel</label>
            <input
              id="cn-fe"
              className="fld"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom@huntpilote.ca"
            />
          </div>
          <button
            type="button"
            className="btn-pri"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!email.trim()}
            onClick={() => setSent(true)}
          >
            Envoyer le lien
          </button>
        </>
      )}
    </div>
  );
}

function Invited({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="cn-card">
      <Brand />
      <div style={{ marginBottom: 10 }}>
        <span className="cn-role">Invitation</span>
      </div>
      <div className="cn-h1">Marie Chen vous invite chez HuntPilote</div>
      <p className="cn-sub">
        Vous rejoindrez l&apos;agence avec le rôle <b style={{ color: 'var(--fg1)' }}>Rédacteur</b> — accès aux
        briefs de contenu et aux clients qui vous seront assignés. Un administrateur peut ajuster ce rôle plus tard.
      </p>
      <div className="cn-field">
        <label htmlFor="cn-inv-e">Courriel</label>
        <input
          id="cn-inv-e"
          className="fld"
          defaultValue="tom@huntpilote.ca"
          disabled
          style={{ color: 'var(--fg3)', cursor: 'not-allowed' }}
        />
      </div>
      <button type="button" className="btn-pri" style={{ width: '100%', justifyContent: 'center' }} onClick={onAccept}>
        Accepter et choisir un mot de passe
      </button>
      <div className="cn-sep" />
      <p className="cn-hint">
        Ce lien d&apos;invitation expire dans 7 jours. Ce n&apos;est pas vous ? Ignorez ce courriel, rien ne sera
        créé.
      </p>
    </div>
  );
}

function FirstLogin({ onDone }: { onDone: () => void }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const weak = p1.length > 0 && p1.length < 8;
  const mismatch = p2.length > 0 && p1 !== p2;
  const ok = p1.length >= 8 && p1 === p2;

  return (
    <div className="cn-card">
      <Brand />
      <div style={{ marginBottom: 10 }}>
        <span className="cn-role">Tom Bélanger · tom@huntpilote.ca</span>
      </div>
      <div className="cn-h1">Choisissez votre mot de passe</div>
      <p className="cn-sub">Dernière étape avant d&apos;entrer dans HuntPilote.</p>
      <div className="cn-field">
        <label htmlFor="cn-p1">Mot de passe</label>
        <input
          id="cn-p1"
          className="fld"
          type="password"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          placeholder="8 caractères minimum"
          style={weak ? { borderColor: 'var(--red)' } : undefined}
        />
        {weak && (
          <p className="cn-hint" style={{ color: 'var(--red)' }}>
            Encore {8 - p1.length} caractère{8 - p1.length > 1 ? 's' : ''} — le seuil minimal est de 8.
          </p>
        )}
      </div>
      <div className="cn-field">
        <label htmlFor="cn-p2">Confirmer le mot de passe</label>
        <input
          id="cn-p2"
          className="fld"
          type="password"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          placeholder="Retapez-le"
          style={mismatch ? { borderColor: 'var(--red)' } : undefined}
        />
        {mismatch && (
          <p className="cn-hint" style={{ color: 'var(--red)' }}>
            Les deux mots de passe ne correspondent pas.
          </p>
        )}
      </div>
      <button type="button" className="btn-pri" style={{ width: '100%', justifyContent: 'center' }} disabled={!ok} onClick={onDone}>
        Entrer dans HuntPilote
      </button>
    </div>
  );
}

function Welcome() {
  return (
    <div className="cn-card" style={{ textAlign: 'center' }}>
      <Brand />
      <div className="cn-h1">Vous êtes connectée</div>
      <p className="cn-sub" style={{ marginBottom: '1.25rem' }}>
        Bienvenue, Marie. Redirection vers le tableau de bord.
      </p>
      <a href="/dashboard" className="btn-pri" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
        Ouvrir HuntPilote
      </a>
    </div>
  );
}

export function ConnexionView() {
  const { theme, toggleTheme } = useTheme();
  const [scenario, setScenario] = useState<Scenario>('connexion');
  const [step, setStep] = useState<Step>('login');

  const pickScenario = (s: Scenario) => {
    setScenario(s);
    setStep(s === 'connexion' ? 'login' : s === 'oublie' ? 'forgot' : s === 'invitation' ? 'invited' : 'first');
  };

  return (
    <>
      <div className="cn-demo">
        <select value={scenario} onChange={(e) => pickScenario(e.target.value as Scenario)} aria-label="État de démonstration">
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
      <div className="cn-wrap">
        {step === 'login' && <Login onLogin={() => setStep('welcome')} onForgot={() => setStep('forgot')} />}
        {step === 'forgot' && <Forgot onBack={() => setStep('login')} />}
        {step === 'invited' && <Invited onAccept={() => setStep('first')} />}
        {step === 'first' && <FirstLogin onDone={() => setStep('welcome')} />}
        {step === 'welcome' && <Welcome />}
      </div>
    </>
  );
}
