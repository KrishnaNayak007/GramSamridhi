import React from 'react';
import OverviewPage from '../AgricultureSide/OverviewPage/OverviewPage';

export default function DashboardPage({ onNavigate, user }) {
  return <OverviewPage onNavigate={onNavigate} />;
}
