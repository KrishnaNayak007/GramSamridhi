import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import AppProviders from './app/AppProviders';

// workflow: entry point — mounts <AppProviders><App /></AppProviders> into index.html's #root. Never grows past this; new global providers go in AppProviders.jsx, not here.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);
