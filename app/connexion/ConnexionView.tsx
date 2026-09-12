'use client';

/**
 * Connexion agence.
 *
 * Trois façons d'entrer, toutes servies par Supabase Auth : mot de passe,
 * lien magique, Google. Le lien magique et Google reviennent par
 * `/api/auth/callback`, qui échange le code contre une session et rattache la
 * personne à son invitation.
 *
 * Cet écran reste un outil interne, pas un produit grand public — pas
 * d'argumentaire de vente sur une page de connexion.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { createClient } from '@/lib/supabase/client';
import { routes } from '@/lib/routes';

type Step = 'login' | 'magic-sent' | 'forgot' | 'forgot-sent' | 'new-password' | 'welcome';

/** Ce que Supabase renvoie, dit en français — et sans révéler si un compte existe. */
function messageFor(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Courriel ou mot de passe incorrect.';
    case 'email_not_confirmed':
      return 'Ce courriel n’a pas encore été confirmé. Vérifiez votre boîte.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Patientez une minute avant de réessayer.';
    case 'weak_password':
      return 'Mot de passe trop faible — 8 caractères minimum.';
    case 'same_password':
      return 'Choisissez un mot de passe différent de l’actuel.';
    default:
      return fallback;
  }
}

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

function ErrorLine({ text }: { text: string }) {
  return (
    <div className="cn-err" role="alert">
      <span style={{ display: 'flex', flexShrink: 0, marginTop: 2 }}>
        <IcoWarn size={14} />
      </span>
      <span>{text}</span>
    </div>
  );
}

/** Où renvoyer après connexion : le chemin demandé, ou le tableau de bord. */
function useDestination() {
  const params = useSearchParams();
  const suite = params.get('suite');
  return suite && suite.startsWith('/') && !suite.startsWith('//') ? suite : routes.dashboard();
}

function callbackUrl(suite: string) {
  return `${window.location.origin}/api/auth/callback?suite=${encodeURIComponent(suite)}`;
}

function Login({
  onMagicSent,
  onForgot,
  onLoggedIn,
  initialError,
}: {
  onMagicSent: (email: string) => void;
  onForgot: () => void;
  onLoggedIn: () => void;
  initialError: string | null;
}) {
  const destination = useDestination();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<'password' | 'magic' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(initialError);

  const withPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('password');
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    setBusy(null);
    if (error) {
      setError(messageFor(error.code, 'La connexion a échoué. Réessayez.'));
      return;
    }
    // Rattache une invitation en attente, sans bloquer si rien ne correspond.
    await supabase.rpc('accept_my_invitation');
    onLoggedIn();
    window.location.assign(destination);
  };

  const withMagicLink = async () => {
    setBusy('magic');
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(destination), shouldCreateUser: false },
    });
    setBusy(null);
    if (error) {
      setError(messageFor(error.code, 'L’envoi du lien a échoué. Réessayez.'));
      return;
    }
    onMagicSent(email.trim());
  };

  const withGoogle = async () => {
    setBusy('google');
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl(destination) },
    });
    if (error) {
      setBusy(null);
      setError(messageFor(error.code, 'La connexion avec Google a échoué.'));
    }
    // Sinon, le navigateur part chez Google : rien d'autre à faire ici.
  };

  return (
    <div className="cn-card">
      <Brand />
      <div className="cn-h1">Connexion à l&apos;agence</div>
      <p className="cn-sub">Réservé à l&apos;équipe.</p>
      <form onSubmit={withPassword}>
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
            placeholder="prenom@agence.ca"
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
        {error && <ErrorLine text={error} />}
        <button
          type="submit"
          className="btn-pri"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={!email.trim() || !pass || busy !== null}
        >
          {busy === 'password' ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="cn-sep" />

      <button
        type="button"
        className="btn-out"
        style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
        disabled={!email.trim() || busy !== null}
        onClick={withMagicLink}
        title={email.trim() ? undefined : 'Entrez d’abord votre courriel'}
      >
        {busy === 'magic' ? 'Envoi…' : 'Recevoir un lien de connexion par courriel'}
      </button>
      <button
        type="button"
        className="btn-out"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={busy !== null}
        onClick={withGoogle}
      >
        {busy === 'google' ? 'Redirection…' : 'Continuer avec Google'}
      </button>
      <p className="cn-hint" style={{ marginTop: '1rem' }}>
        Seules les personnes invitées par l&apos;agence peuvent entrer. Un compte créé sans invitation ne voit rien.
      </p>
    </div>
  );
}

function Sent({ email, title, body, onBack }: { email: string; title: string; body: string; onBack: () => void }) {
  return (
    <div className="cn-card">
      <button type="button" className="cn-back" onClick={onBack}>
        <IcoChevL size={13} />
        Retour à la connexion
      </button>
      <Brand />
      <div className="cn-sent" aria-hidden="true">
        <IcoMail size={20} />
      </div>
      <div className="cn-h1">{title}</div>
      <p className="cn-sub" style={{ marginBottom: '1.25rem' }}>
        Si <b style={{ color: 'var(--fg1)' }}>{email}</b> correspond à un compte, {body}
      </p>
    </div>
  );
}

function Forgot({ onBack, onSent }: { onBack: () => void; onSent: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl('/connexion?etape=nouveau-mot-de-passe'),
    });
    setBusy(false);
    if (error) {
      setError(messageFor(error.code, 'L’envoi a échoué. Réessayez.'));
      return;
    }
    onSent(email.trim());
  };

  return (
    <div className="cn-card">
      <button type="button" className="cn-back" onClick={onBack}>
        <IcoChevL size={13} />
        Retour à la connexion
      </button>
      <Brand />
      <div className="cn-h1">Réinitialiser le mot de passe</div>
      <p className="cn-sub">Entrez votre courriel d&apos;agence, nous vous envoyons un lien pour en choisir un nouveau.</p>
      <div className="cn-field">
        <label htmlFor="cn-fe">Courriel</label>
        <input
          id="cn-fe"
          className="fld"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="prenom@agence.ca"
        />
      </div>
      {error && <ErrorLine text={error} />}
      <button
        type="button"
        className="btn-pri"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={!email.trim() || busy}
        onClick={send}
      >
        {busy ? 'Envoi…' : 'Envoyer le lien'}
      </button>
    </div>
  );
}

/** Après un lien de réinitialisation : la session existe, il reste à choisir le mot de passe. */
function NewPassword({ onDone }: { onDone: () => void }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const weak = p1.length > 0 && p1.length < 8;
  const mismatch = p2.length > 0 && p1 !== p2;
  const ok = p1.length >= 8 && p1 === p2;

  const save = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) {
      setError(messageFor(error.code, 'Le mot de passe n’a pas pu être enregistré.'));
      return;
    }
    onDone();
  };

  return (
    <div className="cn-card">
      <Brand />
      <div className="cn-h1">Choisissez votre mot de passe</div>
      <p className="cn-sub">Il remplace l&apos;ancien dès que vous validez.</p>
      <div className="cn-field">
        <label htmlFor="cn-p1">Mot de passe</label>
        <input
          id="cn-p1"
          className="fld"
          type="password"
          autoComplete="new-password"
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
          autoComplete="new-password"
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
      {error && <ErrorLine text={error} />}
      <button
        type="button"
        className="btn-pri"
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={!ok || busy}
        onClick={save}
      >
        {busy ? 'Enregistrement…' : 'Entrer dans HuntPilote'}
      </button>
    </div>
  );
}

function Welcome() {
  const destination = useDestination();
  useEffect(() => {
    const t = setTimeout(() => window.location.assign(destination), 800);
    return () => clearTimeout(t);
  }, [destination]);

  return (
    <div className="cn-card" style={{ textAlign: 'center' }}>
      <Brand />
      <div className="cn-h1">Vous êtes connecté</div>
      <p className="cn-sub" style={{ marginBottom: '1.25rem' }}>Redirection vers le tableau de bord.</p>
      <a href={destination} className="btn-pri" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
        Ouvrir HuntPilote
      </a>
    </div>
  );
}

export function ConnexionView() {
  const { theme, toggleTheme } = useTheme();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>(() =>
    params.get('etape') === 'nouveau-mot-de-passe' ? 'new-password' : 'login',
  );
  const [sentTo, setSentTo] = useState('');

  // Un lien revenu cassé (expiré, déjà utilisé) atterrit ici avec `?erreur=lien`.
  const initialError =
    params.get('erreur') === 'lien' ? 'Ce lien n’est plus valide. Demandez-en un nouveau.' : null;

  return (
    <>
      <div className="cn-demo">
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
        {step === 'login' && (
          <Login
            initialError={initialError}
            onForgot={() => setStep('forgot')}
            onLoggedIn={() => setStep('welcome')}
            onMagicSent={(e) => {
              setSentTo(e);
              setStep('magic-sent');
            }}
          />
        )}
        {step === 'magic-sent' && (
          <Sent
            email={sentTo}
            title="Vérifiez votre boîte"
            body="un lien de connexion vient de partir. Il n’est valide qu’une fois."
            onBack={() => setStep('login')}
          />
        )}
        {step === 'forgot' && (
          <Forgot
            onBack={() => setStep('login')}
            onSent={(e) => {
              setSentTo(e);
              setStep('forgot-sent');
            }}
          />
        )}
        {step === 'forgot-sent' && (
          <Sent
            email={sentTo}
            title="Vérifiez votre boîte"
            body="un lien de réinitialisation vient de partir."
            onBack={() => setStep('login')}
          />
        )}
        {step === 'new-password' && <NewPassword onDone={() => setStep('welcome')} />}
        {step === 'welcome' && <Welcome />}
      </div>
    </>
  );
}
