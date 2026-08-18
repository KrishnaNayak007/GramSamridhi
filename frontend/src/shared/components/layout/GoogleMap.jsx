import React, { useEffect, useRef } from 'react';

/**
 * Reusable Google Map component.
 * Displays a map centered at the given latitude and longitude, with a pin marker.
 */
export default function GoogleMap({ latitude, longitude, zoom = 15 }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // 1. Load Google Maps Javascript API script if not already loaded
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    const initializeMap = () => {
      if (!window.google || !window.google.maps) return;

      const position = { lat: latitude, lng: longitude };

      // Create map instance
      if (!googleMapRef.current && mapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: zoom,
          disableDefaultUI: true,
          zoomControl: true,
        });

        // Add a marker at the position
        markerRef.current = new window.google.maps.Marker({
          position: position,
          map: googleMapRef.current,
          title: 'Your Location',
        });
      } else if (googleMapRef.current) {
        // If map is already initialized, just update center and marker position
        googleMapRef.current.setCenter(position);
        if (markerRef.current) {
          markerRef.current.setPosition(position);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [latitude, longitude, zoom]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '250px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        marginTop: '10px',
        backgroundColor: '#e5e3df', // Fallback color while loading
      }}
    />
  );
}
