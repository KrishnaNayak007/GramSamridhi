import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../shared/lib/api';

export default function MyActivityPage() {
  const [activeTab, setActiveTab] = useState('swc'); // 'swc' | 'surplus'
  const [reports, setReports] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        // Load citizen reports
        const reportsRes = await apiFetch('/api/v1/incidents/reports/');
        if (reportsRes.ok) {
          setReports(await reportsRes.json());
        }

        // Load surplus listings
        const listingsRes = await apiFetch('/api/v1/surplus/listings/');
        if (listingsRes.ok) {
          const listData = await listingsRes.json();
          // Filter own listings (where owner matches logged-in user)
          const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
          const ownListings = listData.filter(item => item.owner?.username === loggedInUser.username);
          setListings(ownListings.length > 0 ? ownListings : listData); // Fallback: show listings for demo if none owned
        }
      } catch (err) {
        console.error('Error fetching activity data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, [activeTab]);

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: '24px',
      fontFamily: 'var(--font-body)',
      minHeight: '70vh'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink-950)' }}>
            My Activity History
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-500)', marginTop: '4px' }}>
            Track the status of your reported waste incidents and surplus sharing claims.
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg)',
          borderRadius: '8px',
          padding: '4px',
          border: '1px solid var(--border-soft)'
        }}>
          <button
            onClick={() => setActiveTab('swc')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'swc' ? '#fff' : 'transparent',
              color: activeTab === 'swc' ? 'var(--green-900)' : 'var(--ink-700)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: activeTab === 'swc' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Waste Reports (SWC)
          </button>
          <button
            onClick={() => setActiveTab('surplus')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'surplus' ? '#fff' : 'transparent',
              color: activeTab === 'surplus' ? 'var(--orange-700)' : 'var(--ink-700)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: activeTab === 'surplus' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
              marginLeft: '4px'
            }}
          >
            Surplus Listings
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB TABLE/LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-500)' }}>
          Loading activity log...
        </div>
      ) : activeTab === 'swc' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-500)', padding: '40px', fontSize: '14px' }}>
              You have not submitted any waste reports yet.
            </div>
          ) : (
            reports.map(report => (
              <div
                key={report.id}
                style={{
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--ink-900)' }}>
                    SWC: {report.description || 'Garbage Accumulation Report'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-300)' }}>
                    <span>📍 Resolved Ward: {report.location?.name || 'BMC Ward 24'}</span>
                    <span style={{ margin: '0 6px' }}>•</span>
                    <span>Submitted: {new Date(report.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: report.incident?.status === 'resolved' ? 'var(--green-100)' : '#fff2e8',
                    color: report.incident?.status === 'resolved' ? 'var(--green-900)' : '#d46b08',
                    border: '1px solid ' + (report.incident?.status === 'resolved' ? '#b7eb8f' : '#ffd591')
                  }}>
                    {report.incident?.status ? report.incident.status.toUpperCase() : 'PENDING'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-300)' }}>
                    ID: {report.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-500)', padding: '40px', fontSize: '14px' }}>
              You have not posted any surplus listings yet.
            </div>
          ) : (
            listings.map(item => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--ink-900)' }}>
                    SURPLUS: {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-300)' }}>
                    <span>📍 Location: {item.location?.name || 'Local Area'}</span>
                    <span style={{ margin: '0 6px' }}>•</span>
                    <span>Type: {item.listing_type.toUpperCase()} ({item.price ? `₹${item.price}` : 'FREE'})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: item.status === 'claimed' ? 'var(--bg)' : '#e6f7ff',
                    color: item.status === 'claimed' ? 'var(--ink-500)' : '#096dd9',
                    border: '1px solid ' + (item.status === 'claimed' ? 'var(--border)' : '#91d5ff')
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-300)' }}>
                    Posted: {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
