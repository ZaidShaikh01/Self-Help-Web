import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { loginRequest, registerRequest } from '~/lib/auth';

export interface SignUpFormProps {
  onNavigateToLogin?: () => void;
  onSignUpSuccess?: (name: string, email: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onNavigateToLogin,
  onSignUpSuccess,
}) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (username.trim().length < 3 || username.trim().length > 30) {
      setError('Username must be between 3 and 30 characters.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must accept the terms of service.');
      return;
    }

    setIsLoading(true);

    try {
      await registerRequest({
        fullname: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      });

      await loginRequest(email.trim(), password);

      onSignUpSuccess?.(fullName.trim(), email.trim());
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-error" role="alert">
          <strong>We couldn't create your account.</strong>
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <label className="auth-field" htmlFor="signup-full-name">
        <span>Full name</span>
        <input
          id="signup-full-name"
          name="fullName"
          type="text"
          required
          aria-required="true"
          autoComplete="name"
          placeholder="Alex Morgan"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </label>

      {/* Username */}
      <label className="auth-field" htmlFor="signup-username">
        <span>Username</span>
        <input
          id="signup-username"
          name="username"
          type="text"
          required
          aria-required="true"
          minLength={3}
          maxLength={30}
          autoComplete="username"
          placeholder="alexmorgan"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <small>3–30 characters</small>
      </label>

      {/* Email Address */}
      <label className="auth-field" htmlFor="signup-email">
        <span>Email address</span>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          aria-required="true"
          autoComplete="email"
          placeholder="alex@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      {/* Password */}
      <label className="auth-field" htmlFor="signup-password">
        <span>Password</span>
        <div className="auth-password">
          <input
            id="signup-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            aria-required="true"
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
        <small>Use at least 8 characters.</small>
      </label>

      {/* Terms Agreement */}
      <div className="auth-terms">
        <input
          id="signup-terms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(event) => setAgreedToTerms(event.target.checked)}
        />
        <label htmlFor="signup-terms">
          I agree to the <a href="#terms">Terms of Service</a> and{' '}
          <a href="#privacy">Privacy Policy</a>.
        </label>
      </div>

      {/* Submit Button */}
      <button className="auth-submit" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="auth-spinner" aria-hidden="true" />
            Creating workspace…
          </>
        ) : (
          <>
            Create account
            <CheckCircle2 size={16} aria-hidden="true" />
          </>
        )}
      </button>

      {/* Login Switch */}
      <p className="auth-switch">
        Already have an account?{' '}
        <Link to="/login" onClick={onNavigateToLogin}>
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default SignUpForm;
