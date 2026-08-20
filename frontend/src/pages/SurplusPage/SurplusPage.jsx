import React, { useState, useEffect } from 'react';
import { useLocationContext } from '../../app/LocationContext';
import { apiFetch } from '../../shared/lib/api';

export default function SurplusPage() {
  const { coords } = useLocationContext();

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('good');
  const [listingType, setListingType] = useState('give_away');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch categories and listings on mount
  useEffect(() => {
    const loadSurplusData = async () => {
      try {
        const catRes = await apiFetch('/api/v1/surplus/categories/');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) setCategoryId(catData[0].id);
        }

        const listRes = await apiFetch('/api/v1/surplus/listings/');
        if (listRes.ok) {
          const listData = await listRes.json();
          setListings(listData);
        }
      } catch (err) {
        console.error('Error loading surplus data:', err);
      }
    };
    loadSurplusData();
  }, [formSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coords) {
      setFormError('Please sync your GPS location in the header first.');
      return;
    }

    setLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      let photoIds = [];
      
      // Upload photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);

        const uploadRes = await apiFetch('/api/v1/evidence/upload/', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error('Photo upload failed');
        photoIds = [uploadData.id];
      }

      // Create Surplus Listing
      const payload = {
        title,
        category_id: categoryId,
        condition,
        listing_type: listingType,
        description,
        latitude: coords.latitude,
        longitude: coords.longitude,
        photo_ids: photoIds
      };

      if (listingType === 'sell' && price) {
        payload.price = parseFloat(price);
      }

      const res = await apiFetch('/api/v1/surplus/listings/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create listing');

      setFormSuccess(`Listing "${data.title}" posted successfully!`);
      setTitle('');
      setPrice('');
      setDescription('');
      setPhotoFile(null);
    } catch (err) {
      setFormError(err.message || 'Error posting surplus item.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (listingId) => {
    try {
      const res = await apiFetch(`/api/v1/surplus/listings/${listingId}/events/`, {
        method: 'POST',
        body: JSON.stringify({ event_type: 'claim' })
      });
      if (res.ok) {
        alert('Listing claimed successfully! Check My Activity tab for confirmation.');
        // Reload listings
        const listRes = await apiFetch('/api/v1/surplus/listings/');
        if (listRes.ok) setListings(await listRes.json());
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to claim listing.');
      }
    } catch (err) {
      console.error('Error claiming listing:', err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', fontFamily: 'var(--font-body)' }}>
      {/* CREATE LISTING CARD */}
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
            List Surplus Item
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-500)', marginTop: '4px' }}>
            Share surplus foods, books, items, or claim listings. Help minimize local landfill waste.
          </p>
        </div>

        {formSuccess && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            color: 'var(--green-900)',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: '600'
          }}>
            🎉 {formSuccess}
          </div>
        )}

        {formError && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            color: 'var(--red)',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: '600'
          }}>
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Title / Item Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5kg Fresh Tomatoes, Grade 10 Science Books..."
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
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
                <option value="new">Brand New / Packed</option>
                <option value="good">Good / Used</option>
                <option value="fair">Fair / Functional</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Listing Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
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
                <option value="give_away">Give Away (FREE)</option>
                <option value="sell">Sell (Disposal Price)</option>
              </select>
            </div>

            {listingType === 'sell' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price in INR"
                  required
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide item specifications, pickup details, quantities..."
              required
              rows={3}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Item Photo</label>
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
              backgroundColor: 'var(--orange-600)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--orange-700)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--orange-600)'}
          >
            {loading ? 'Posting Listing...' : 'List Surplus Item'}
          </button>
        </form>
      </div>

      {/* ACTIVE LISTINGS */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxHeight: '75vh',
        overflowY: 'auto'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ink-950)' }}>
            Active Local Listings
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '2px' }}>
            Browse and claim free food or low-cost circular items.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: '14px', padding: '30px' }}>
              No active listings available in your area.
            </div>
          ) : (
            listings.map(item => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: item.status === 'claimed' ? 'var(--bg)' : '#fff',
                  opacity: item.status === 'claimed' ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ink-900)' }}>{item.title}</h4>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: item.listing_type === 'give_away' ? 'var(--green-900)' : 'var(--orange-700)',
                    backgroundColor: item.listing_type === 'give_away' ? 'var(--green-100)' : 'var(--orange-100)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {item.listing_type === 'give_away' ? 'FREE' : `₹${item.price}`}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--ink-500)', lineHeight: '1.4' }}>{item.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-300)' }}>
                    <span>📍 {item.location?.name || 'Local Area'}</span>
                    <span style={{ margin: '0 5px' }}>•</span>
                    <span>Cond: {item.condition.toUpperCase()}</span>
                  </div>

                  {item.status === 'available' ? (
                    <button
                      onClick={() => handleClaim(item.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'var(--green-700)',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Claim Item
                    </button>
                  ) : (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--ink-300)',
                      padding: '4px 8px',
                      backgroundColor: 'var(--border-soft)',
                      borderRadius: '6px'
                    }}>
                      CLAIMED
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
