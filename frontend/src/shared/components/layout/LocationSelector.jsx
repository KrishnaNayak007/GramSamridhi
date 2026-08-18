import React, { useEffect } from 'react';
import { useLocationContext } from '../../../app/LocationContext';
import useGeolocation from '../../hooks/useGeolocation';

/**
 * Renders the top-navbar ward/nigam location selector.
 * Resolves current GPS coordinates to administrative wards and updates active context.
 */
export default function LocationSelector() {
  const {
    activeLocation,
    setCoords,
    isResolving,
    resolutionError,
    responsibleDepartment,
    assignedOfficer,
    detectedAddress
  } = useLocationContext();

  const { coords: gpsCoords, loading: gpsLoading, error: gpsError, refresh } = useGeolocation();

  // Sync GPS coordinate hooks with global LocationContext
  useEffect(() => {
    if (gpsCoords) {
      setCoords(gpsCoords);
    }
  }, [gpsCoords, setCoords]);

  const handleUseGPS = () => {
    refresh();
  };

  return (
    <div className="location-selector" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="location-icon" style={{ fontSize: '20px' }} role="img" aria-label="pin">📍</span>
        
        <div className="location-info" style={{ display: 'flex', flexDirection: 'column', maxWidth: '380px' }}>
          {isResolving || gpsLoading ? (
            <span style={{ fontSize: '14px', color: '#666' }}>Locating and resolving...</span>
          ) : activeLocation ? (
            <div>
              {/* Actual street address / real location */}
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#333', lineHeight: '1.3' }}>
                {detectedAddress || 'Resolving street address...'}
              </div>
              {/* Resolved Ward / Jurisdiction */}
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{activeLocation.name}</span>
                {responsibleDepartment && (
                  <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontWeight: '600' }}>
                    {responsibleDepartment.name}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '14px', color: '#ff4d4f' }}>
              {gpsError ? 'GPS Error (Click to retry)' : 'No location detected'}
            </span>
          )}
        </div>

        <button
          onClick={handleUseGPS}
          disabled={isResolving || gpsLoading}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #2e7d32',
            backgroundColor: '#2e7d32',
            color: '#fff',
            fontWeight: '600',
            marginLeft: 'auto'
          }}
        >
          GPS Sync
        </button>
      </div>

      {assignedOfficer && (
        <div style={{ fontSize: '12px', color: '#555', paddingLeft: '28px' }}>
          Assigned Officer: <strong>{assignedOfficer.name}</strong> ({assignedOfficer.role_title})
        </div>
      )}

      {resolutionError && (
        <div style={{ fontSize: '11px', color: 'red', paddingLeft: '28px' }}>
          ⚠️ {resolutionError}
        </div>
      )}
    </div>
  );
}
