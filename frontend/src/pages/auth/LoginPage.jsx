import React from 'react';
import AuthContainer from './AuthContainer';

export default function LoginPage({ onLoginSuccess, onBackToIntro }) {
  return (
    <AuthContainer 
      initialPanel="role" 
      initialMode="login" 
      onLoginSuccess={onLoginSuccess} 
      onBackToIntro={onBackToIntro}
    />
  );
}
