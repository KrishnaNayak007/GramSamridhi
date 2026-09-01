import React, { useEffect, useRef } from 'react';
import { parseCoordinates } from '../../lib/formatCoords';

export default function GovDetailMap({ coords }) {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
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
      const handleLoad = () => callback();
      script.addEventListener('load', handleLoad);
    };

    loadGoogleMapsScript(() => {
      if (!mapRef.current) return;
      if (!window.google || !window.google.maps) return;

      const position = parseCoordinates(coords);

      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: false,
        });

        markerRef.current = new window.google.maps.Marker({
          position: position,
          map: googleMapRef.current,
        });
      } else {
        googleMapRef.current.setCenter(position);
        if (markerRef.current) {
          markerRef.current.setPosition(position);
        }
      }
    });
  }, [coords]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '150px',
        borderRadius: '12px 12px 0 0',
        backgroundColor: '#e5e3df',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
}
