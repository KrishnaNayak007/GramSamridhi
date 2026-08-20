import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../shared/lib/api';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  // Store the active resolved administrative boundary (Ward / Nigam)
  const [activeLocation, setActiveLocation] = useState(null);
  const [coords, setCoords] = useState({ latitude: 20.296, longitude: 85.824 });
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionError, setResolutionError] = useState(null);

  // Jurisdiction details resolved from location and category
  const [responsibleDepartment, setResponsibleDepartment] = useState(null);
  const [assignedOfficer, setAssignedOfficer] = useState(null);
  const [detectedAddress, setDetectedAddress] = useState(null);

  // Helper to load Google Maps SDK dynamically if not already loaded
  const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
      callback();
      return;
    }
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const handleLoad = () => {
      callback();
    };
    script.addEventListener('load', handleLoad);
  };

  // Automatically trigger API resolution when coords change
  useEffect(() => {
    if (!coords) return;

    const resolveWard = async () => {
      setIsResolving(true);
      setResolutionError(null);
      try {
        const response = await apiFetch(
          `/api/v1/geography/resolve/?lat=${coords.latitude}&lon=${coords.longitude}`
        );
        const data = await response.json();
        
        if (response.ok && data.resolved) {
          setActiveLocation(data.ward);
          setResponsibleDepartment(data.responsible_department);
          setAssignedOfficer(data.assigned_officer);

          // Resolve street address using Google Maps Geocoder on the frontend
          loadGoogleMapsScript(() => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: coords.latitude, lng: coords.longitude } },
              async (results, status) => {
                if (status === 'OK' && results[0]) {
                  setDetectedAddress(results[0].formatted_address);
                } else {
                  console.warn('Google Geocoder failed (billing likely disabled). Falling back to free client-side API...', status);
                  
                  // Fallback: Call BigDataCloud free client-side reverse geocoder
                  try {
                    const fallbackResponse = await fetch(
                      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`
                    );
                    const fallbackData = await fallbackResponse.json();
                    
                    // Build address representation
                    const parts = [];
                    if (fallbackData.locality) parts.push(fallbackData.locality);
                    if (fallbackData.city && fallbackData.city !== fallbackData.locality) parts.push(fallbackData.city);
                    if (fallbackData.principalSubdivision) parts.push(fallbackData.principalSubdivision);
                    if (fallbackData.countryName) parts.push(fallbackData.countryName);
                    
                    const address = parts.join(', ');
                    setDetectedAddress(address || 'Location resolved');
                  } catch (err) {
                    console.error('Fallback geocoder failed:', err);
                    setDetectedAddress('Street address not available');
                  }
                }
              }
            );
          });
        } else {
          setResolutionError(data.message || 'Failed to resolve ward location.');
        }
      } catch (err) {
        setResolutionError('Network error while resolving coordinates.');
        console.error('Location resolution error:', err);
      } finally {
        setIsResolving(false);
      }
    };

    resolveWard();
  }, [coords]);

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        setActiveLocation,
        coords,
        setCoords,
        isResolving,
        resolutionError,
        responsibleDepartment,
        assignedOfficer,
        detectedAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
