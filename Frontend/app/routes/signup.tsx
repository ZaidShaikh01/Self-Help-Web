import React from 'react';
import { AuthLayout } from '~/components/auth/AuthLayout';
import { SignUpForm, type SignUpFormProps } from '~/components/auth/SignUpForm';

export const SignUpPage: React.FC<SignUpFormProps> = ({
  onNavigateToLogin,
  onSignUpSuccess,
}) => {
  return (
    <AuthLayout
      eyebrow="BEGIN YOUR RECORD"
      title={
        <>
          Create your
          <br className="auth-title-break" /> workspace.
        </>
      }
      description="Start with a private space for the actions and ideas worth returning to."
    >
      <SignUpForm
        onNavigateToLogin={onNavigateToLogin}
        onSignUpSuccess={onSignUpSuccess}
      />
    </AuthLayout>
  );
};

export default SignUpPage;
