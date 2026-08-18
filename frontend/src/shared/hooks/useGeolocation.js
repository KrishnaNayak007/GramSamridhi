import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook wrapping the HTML5 Geolocation API.
 * Returns: { coords: { latitude, longitude, accuracy }, loading, error, refresh }
 */
export default function useGeolocation(options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      options
    );
  }, [options]);

  useEffect(() => {
    refresh();
  }, []);

  return { coords, loading, error, refresh };
}
