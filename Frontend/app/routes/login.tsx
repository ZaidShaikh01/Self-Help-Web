import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { loginRequest } from '~/lib/auth';
import { AuthLayout } from '~/components/auth/AuthLayout';

interface LoginPageProps {
  onNavigateToSignUp?: () => void;
  onLoginSuccess?: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignUp,
  onLoginSuccess,
}) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await loginRequest(email.trim(), password);

      onLoginSuccess?.(email.trim());
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title={
        <>
          Sign in to
          <br className="auth-title-break" /> Growth OS.
        </>
      }
      description="Return to the practices, reflections, and learning you have kept connected."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="auth-error" role="alert">
            <strong>We couldn't sign you in.</strong>
            <span>{error}</span>
          </div>
        )}

        {/* Email Address */}
        <label className="auth-field" htmlFor="login-email">
          <span>Email address</span>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(error)}
            placeholder="alex@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {/* Password */}
        <label className="auth-field" htmlFor="login-password">
          <span className="auth-field__label-row">
            <span>Password</span>

            <button
              type="button"
              className="auth-forgot"
              onClick={() =>
                window.alert('Connect your password recovery flow here.')
              }
            >
              Forgot password?
            </button>
          </span>

          <div className="auth-password">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={Boolean(error)}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="button"
              className="auth-password__toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {/* Submit Button */}
        <button className="auth-submit" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* Social Login & Signup Navigation */}
      <div className="auth-social">
        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <button
          type="button"
          className="auth-google"
          onClick={() => window.alert('Google sign-in is not connected yet.')}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" onClick={onNavigateToSignUp}>
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
