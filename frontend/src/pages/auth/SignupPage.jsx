import React from 'react';
import AuthContainer from './AuthContainer';

export default function SignupPage({ onSignupSuccess, onBackToIntro }) {
  return (
    <AuthContainer 
      initialPanel="role" 
      initialMode="register" 
      onLoginSuccess={onSignupSuccess} 
      onBackToIntro={onBackToIntro}
    />
  );
}
