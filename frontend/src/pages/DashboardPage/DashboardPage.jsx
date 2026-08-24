import React from 'react';
import FarmerDashboardPage from '../AgricultureSide/FarmerDashboardPage';
import CitizenDashboardPage from '../citizenside/CitizenDashboardPage';

export default function DashboardPage({ onNavigate, user }) {
  const isFarmer = user?.role === 'farmer' || user?.username?.includes('farmer') || user?.username === 'devinder_singh';
  
  if (isFarmer) {
    return <FarmerDashboardPage onNavigate={onNavigate} />;
  }
  return <CitizenDashboardPage onNavigate={onNavigate} />;
}
