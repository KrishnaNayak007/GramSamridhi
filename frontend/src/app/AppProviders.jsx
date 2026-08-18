import React from 'react';
import { LocationProvider } from './LocationContext';

/**
 * Global application providers wrapper (QueryClientProvider, AuthProvider, LocationProvider, etc.)
 */
export default function AppProviders({ children }) {
  return (
    <LocationProvider>
      {/* 
        Other global providers would nest here:
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      */}
      {children}
    </LocationProvider>
  );
}
