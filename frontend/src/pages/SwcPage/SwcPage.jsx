import React, { useState } from 'react';
import { useLocationContext } from '../../app/LocationContext';
import { apiFetch } from '../../shared/lib/api';
import GoogleMap from '../../shared/components/layout/GoogleMap';

export default function SwcPage() {
  const { coords, activeLocation, detectedAddress, responsibleDepartment, assignedOfficer } = useLocationContext();

  const [category, setCategory] = useState('garbage_accumulation');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) {
      setErrorMsg('Please sync your GPS location before submitting.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let evidenceId = '99999999-9999-9999-9999-999999999999'; // Default mock evidence

      // If user selected a photo, upload it first to obtain a valid evidence_id
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);

        const uploadRes = await apiFetch('/api/v1/evidence/upload/', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.detail || 'Photo upload failed');
        evidenceId = uploadData.id;
      }

      // Submit the citizen complaint report
      const reportRes = await apiFetch('/api/v1/incidents/reports/', {
        method: 'POST',
        body: JSON.stringify({
          evidence_id: evidenceId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          description,
          category
        })
      });

      const reportData = await reportRes.json();
      if (!reportRes.ok) throw new Error(reportData.detail || 'Complaint submission failed');

      setSuccessMsg(`Complaint submitted successfully! Ticket ID: ${reportData.id.slice(0, 8)}`);
      setDescription('');
      setPhotoFile(null);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', fontFamily: 'var(--font-body)' }}>
      {/* COMPLAINT FORM */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink-950)' }}>
            Submit Civic Waste Issue (SWC)
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-500)', marginTop: '4px' }}>
            Report overflows or collection delays. Issues route dynamically to Ward Officers.
          </p>
        </div>

        {successMsg && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            color: 'var(--green-900)',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: '600'
          }}>
            🎉 {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            color: 'var(--red)',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: '600'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Complaint Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="garbage_accumulation">Garbage Accumulation / Heap</option>
              <option value="bin_overflow">Overflowing Waste Bin</option>
              <option value="drainage_block">Blocked Drainage Sewer</option>
              <option value="pothole">Public Road Pothole</option>
              <option value="street_light_out">Street Light Outage</option>
              <option value="water_overflow">Water Pipe Overflow</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details (e.g. near Landmark, smell, hazard status)..."
              required
              rows={4}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Attach Evidence Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: 'var(--green-700)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--green-900)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--green-700)'}
          >
            {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
          </button>
        </form>
      </div>

      {/* RESOLUTION MAP CARD */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: 'fit-content'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--ink-950)' }}>
            Live Containment Resolver
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '2px' }}>
            Verify target routing assignments.
          </p>
        </div>

        <div style={{ height: '220px', border: '1px solid var(--border-soft)', borderRadius: '8px', overflow: 'hidden' }}>
          {coords ? (
            <GoogleMap latitude={coords.latitude} longitude={coords.longitude} />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-500)',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              📍 Sync GPS in header to show map
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
          <div>
            <strong>Resolved Address:</strong>{' '}
            <span style={{ color: activeLocation ? 'var(--green-700)' : 'var(--ink-500)' }}>
              {detectedAddress || 'Sync location...'}
            </span>
          </div>

          <div>
            <strong>Containing Ward/GP:</strong>{' '}
            {activeLocation ? (
              <span style={{ fontWeight: '700', color: 'var(--green-700)' }}>
                {activeLocation.name} ({activeLocation.area_type})
              </span>
            ) : (
              <span style={{ color: 'var(--ink-300)' }}>None</span>
            )}
          </div>

          <div>
            <strong>Responsible Department:</strong>{' '}
            {responsibleDepartment ? (
              <span style={{ fontWeight: '700', color: 'var(--green-700)' }}>
                {responsibleDepartment.name} ({responsibleDepartment.code})
              </span>
            ) : (
              <span style={{ color: 'var(--ink-300)' }}>None</span>
            )}
          </div>

          <div>
            <strong>Assigned Officer Profile:</strong>{' '}
            {assignedOfficer ? (
              <span style={{ fontWeight: '700', color: 'var(--green-700)' }}>
                {assignedOfficer.name} ({assignedOfficer.role_title})
              </span>
            ) : (
              <span style={{ color: 'var(--ink-300)' }}>None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
