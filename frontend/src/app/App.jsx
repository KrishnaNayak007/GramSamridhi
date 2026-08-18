import React from 'react';
import LocationSelector from '../shared/components/layout/LocationSelector';
import GoogleMap from '../shared/components/layout/GoogleMap';
import { useLocationContext } from './LocationContext';

// workflow: renders AppLayout wrapping the router's routed page content. Top of the component tree, no data fetching.
export default function App() {
  const { 
    coords, 
    activeLocation, 
    isResolving, 
    resolutionError,
    responsibleDepartment,
    assignedOfficer,
    detectedAddress
  } = useLocationContext();

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#2e7d32', margin: 0 }}>Swachsahyog Mapping Test</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Verify browser GPS access and PostGIS Ward Resolution</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', backgroundColor: '#fcfcfc' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 15px 0' }}>Location Selector Indicator</h2>
          <LocationSelector />
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#444' }}>Detailed Debug State</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div>
              <strong>GPS Coords:</strong>{' '}
              {coords ? (
                <span>Lat: {coords.latitude.toFixed(6)}, Lon: {coords.longitude.toFixed(6)} (Accuracy: {Math.round(coords.accuracy)}m)</span>
              ) : (
                <span style={{ color: '#999' }}>None (Click GPS Sync above)</span>
              )}
            </div>

            <div>
              <strong>API Resolving:</strong>{' '}
              <span style={{ color: isResolving ? '#2e7d32' : '#666', fontWeight: isResolving ? 'bold' : 'normal' }}>
                {isResolving ? 'Resolving via PostGIS backend...' : 'Idle'}
              </span>
            </div>

            <div>
              <strong>Resolved Ward:</strong>{' '}
              {activeLocation ? (
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {activeLocation.name} (ID: {activeLocation.id})
                </span>
              ) : (
                <span style={{ color: '#999' }}>None</span>
              )}
            </div>

            <div>
              <strong>Actual Address:</strong>{' '}
              {detectedAddress ? (
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {detectedAddress}
                </span>
              ) : (
                <span style={{ color: '#999' }}>None</span>
              )}
            </div>

            <div>
              <strong>Responsible Dept:</strong>{' '}
              {responsibleDepartment ? (
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {responsibleDepartment.name} ({responsibleDepartment.code})
                </span>
              ) : (
                <span style={{ color: '#999' }}>None</span>
              )}
            </div>

            <div>
              <strong>Assigned Officer:</strong>{' '}
              {assignedOfficer ? (
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {assignedOfficer.name} ({assignedOfficer.role_title})
                </span>
              ) : (
                <span style={{ color: '#999' }}>None</span>
              )}
            </div>

            {resolutionError && (
              <div style={{ color: '#ff4d4f', padding: '8px', border: '1px solid #ffccc7', borderRadius: '4px', backgroundColor: '#fff2f0' }}>
                <strong>Resolution Error:</strong> {resolutionError}
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#444' }}>Interactive Visual Map</h3>
          {coords ? (
            <GoogleMap latitude={coords.latitude} longitude={coords.longitude} />
          ) : (
            <div
              style={{
                height: '250px',
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
                border: '1px dashed #ccc',
                fontSize: '14px'
              }}
            >
              Waiting for coordinates. Click GPS Sync to show map.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
