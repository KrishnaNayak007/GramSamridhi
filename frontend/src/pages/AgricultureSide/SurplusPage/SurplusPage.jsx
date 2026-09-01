import React, { useState, useEffect, useRef } from 'react';
import { useLocationContext } from '../../../app/LocationContext';
import { apiFetch } from '../../../shared/lib/api';
import './SurplusPage.css';

const CATEGORY_EMOJI = {
  Books: "📚",
  Clothes: "👕",
  Electronics: "💻",
  Furniture: "🪑",
  Stationery: "✏️",
  Toys: "🧸",
  "Household Items": "🏺",
  Food: "🍎",
  Other: "📦"
};

const SEEDED_MOCKS = [];

export default function SurplusPage() {
  const { coords } = useLocationContext();

  // Data states
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('Good');
  const [listingType, setListingType] = useState('Donate'); // "Donate" or "Sell"
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Filter states
  const [selectedCategoryPill, setSelectedCategoryPill] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState('All');

  // Form Errors
  const [errors, setErrors] = useState({});

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastBody, setToastBody] = useState('');
  const toastTimerRef = useRef(null);

  // Image input Ref
  const imageInputRef = useRef(null);

  // Load categories and listings
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

  useEffect(() => {
    loadSurplusData();
  }, []);

  // Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerImageSelect = (e) => {
    e.preventDefault();
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleResetUpload = (e) => {
    if (e) e.preventDefault();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Scroll to post form
  const handleScrollToPost = () => {
    const el = document.getElementById('post-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to marketplace
  const handleScrollToExplore = () => {
    const el = document.getElementById('marketplace-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Toast trigger helper
  const triggerToast = (head, text) => {
    setToastTitle(head);
    setToastBody(text);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3500);
  };

  // Claim handler
  const handleClaim = async (listingId) => {
    // If it's a mock listing, claim locally
    if (String(listingId).startsWith('mock-')) {
      triggerToast('Item Claimed', 'You have claimed this mock item locally.');
      // Update mock item state in state listings
      return;
    }

    try {
      const res = await apiFetch(`/api/v1/surplus/listings/${listingId}/events/`, {
        method: 'POST',
        body: JSON.stringify({ event_type: 'claim' })
      });
      if (res.ok) {
        triggerToast('Item Claimed', 'Listing claimed successfully! Check My Activity.');
        loadSurplusData();
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to claim listing.');
      }
    } catch (err) {
      console.error('Error claiming listing:', err);
    }
  };

  // Submit listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Please enter a title for your item.';
    if (!description.trim()) formErrors.description = 'A short description helps neighbours understand the item.';
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    setLoading(true);

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
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoIds = [uploadData.id];
        }
      }

      // Default lat/lng if coords not synced (Bhubaneswar default)
      const latitude = coords?.latitude || 20.296;
      const longitude = coords?.longitude || 85.824;

      const payload = {
        title: title.trim(),
        category_id: categoryId,
        condition: condition.toLowerCase(),
        listing_type: listingType === 'Donate' ? 'give_away' : 'sell',
        description: description.trim(),
        latitude,
        longitude,
        photo_ids: photoIds
      };

      if (listingType === 'Sell' && price) {
        payload.price = parseFloat(price);
      }

      const res = await apiFetch('/api/v1/surplus/listings/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        triggerToast('Item Published', `"${data.title}" is now visible to your nearby community.`);
        
        // Reset form
        setTitle('');
        setPrice('');
        setDescription('');
        setListingType('Donate');
        setCondition('Good');
        handleResetUpload();
        
        // Reload data
        loadSurplusData();
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      alert('Error posting surplus item.');
    } finally {
      setLoading(false);
    }
  };

  // Combine real listings + seeded mock fallback listings
  const combinedListings = [...listings];
  SEEDED_MOCKS.forEach(mock => {
    // Add mock if listing with that mock title doesn't exist
    if (!listings.some(l => l.title === mock.title)) {
      combinedListings.push(mock);
    }
  });

  // Filter listings
  const filteredListings = combinedListings.filter(item => {
    // Category pill filter
    if (selectedCategoryPill !== 'All') {
      const matchCat = (item.category_name || '').toLowerCase() === selectedCategoryPill.toLowerCase();
      if (!matchCat) return false;
    }

    // Type filter
    if (typeFilter !== 'All') {
      const dbType = item.listing_type === 'give_away' ? 'Donate' : 'Sell';
      if (dbType !== typeFilter) return false;
    }

    // Distance filter
    if (distanceFilter !== 'All') {
      const distLimit = parseFloat(distanceFilter);
      if (parseFloat(item.distance || 0) > distLimit) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(query);
      const matchDesc = (item.description || '').toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  // Count active listings in Ward
  const activeListingsCount = combinedListings.filter(l => l.status !== 'claimed').length;

  return (
    <div className="surplus-page-container">
      <main className="surplus-main">

        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-left">
            <span className="eyebrow"><i></i>SURPLUS · CIRCULAR COMMUNITY</span>
            <h1>Give useful things<br /><span>a second life.</span></h1>
            <p>Donate, sell, or discover useful items nearby — keeping valuable things in use and reducing unnecessary waste.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleScrollToPost}>
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                Post an Item
              </button>
              <button className="btn-text" onClick={handleScrollToExplore}>
                Explore Nearby
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="hero-visual">
              <div className="orbit-ring r1"></div>
              <div className="orbit-ring r2"></div>
              <svg className="orbit-arrow" viewBox="0 0 200 200">
                <path d="M100 14a86 86 0 0 1 74 128" strokeDasharray="4 7" />
                <path d="M182 132l-8 20-20-6" />
              </svg>

              <div className="mini-card mc-1">
                <span className="mc-icon">📚</span>
                <div><strong>Books</strong><span>1.2 km away</span></div>
              </div>
              <div className="mini-card mc-2">
                <span className="mc-icon">🪑</span>
                <div><strong>Furniture</strong><span>Donate</span></div>
              </div>
              <div className="mini-card mc-3">
                <span className="mc-icon">👕</span>
                <div><strong>Clothes</strong><span>₹250</span></div>
              </div>

              <div className="hero-center">
                <svg className="icon-md" viewBox="0 0 24 24">
                  <path d="M7 3 3 7l4 4M17 21l4-4-4-4M3 7h11a5 5 0 0 1 5 5v0M21 17H10a5 5 0 0 1-5-5v0" />
                </svg>
              </div>

              <div className="nearby-badge">
                <svg className="icon-sm" viewBox="0 0 24 24">
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.3" />
                </svg>
                {activeListingsCount} nearby listings
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT STRIP */}
        <section className="impact">
          <div className="impact-heading">
            <span className="eyebrow small"><i></i>COMMUNITY IMPACT</span>
            <p>Every item reused is one less item entering the waste stream.</p>
          </div>
          <div className="impact-numbers">
            <div className="impact-item"><h3>128</h3><span>Items Shared</span></div>
            <div className="impact-item"><h3>47</h3><span>Items Sold</span></div>
            <div className="impact-item"><h3>86 kg</h3><span>Waste Avoided</span></div>
            <div className="impact-item"><h3>32</h3><span>Active Neighbours</span></div>
          </div>
        </section>

        {/* POST ITEM FORM */}
        <section className="post-section" id="post-form-section">
          <div className="post-grid">
            <div className="post-intro">
              <h2>List something useful</h2>
              <p>Have something you no longer need? Someone nearby might.</p>

              <div className="upload-box" id="uploadBox">
                <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInputRef}
                  hidden
                />
                {!photoPreview ? (
                  <label htmlFor="imageInput" onClick={triggerImageSelect}>
                    <div id="previewText" className="upload-placeholder">
                      <svg className="upload-icon" viewBox="0 0 24 24">
                        <path d="M4 8V6a2 2 0 0 1 2-2h2l1.5-2h5L16 4h2a2 2 0 0 1 2 2v2" />
                        <rect x="2" y="8" width="20" height="13" rx="2" />
                        <circle cx="12" cy="14.5" r="3.5" />
                      </svg>
                      <strong>Add item photo</strong>
                      <span>A clear photo helps your listing get noticed.</span>
                      <span className="upload-sub">JPG, PNG · Up to 5MB</span>
                    </div>
                  </label>
                ) : (
                  <>
                    <img id="previewImage" src={photoPreview} alt="Item preview" />
                    <button type="button" onClick={handleResetUpload} className="change-photo">
                      Remove photo
                    </button>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="post-form" noValidate>
              <div className={`field ${errors.title ? 'invalid' : ''}`}>
                <label htmlFor="title">ITEM TITLE</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Engineering Mathematics — Semester 1"
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="category">CATEGORY</label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="Books">Books</option>
                        <option value="Clothes">Clothes</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Toys">Toys</option>
                        <option value="Household Items">Household Items</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="condition">CONDITION</label>
                  <select
                    id="condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option>New</option>
                    <option>Like New</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>LISTING TYPE</label>
                <div className="type-cards" id="typeSegmented">
                  <button
                    type="button"
                    className={`type-card ${listingType === 'Donate' ? 'active' : ''}`}
                    data-type="Donate"
                    onClick={() => setListingType('Donate')}
                  >
                    <svg className="icon-md" viewBox="0 0 24 24">
                      <path d="M12 21c-4-3-8-6.4-8-10.5A4.5 4.5 0 0 1 8.5 6c1.5 0 2.7.7 3.5 1.8C12.8 6.7 14 6 15.5 6A4.5 4.5 0 0 1 20 10.5C20 14.6 16 18 12 21Z" />
                    </svg>
                    <strong>Donate</strong>
                    <span>Give it a new home</span>
                  </button>
                  <button
                    type="button"
                    className={`type-card ${listingType === 'Sell' ? 'active' : ''}`}
                    data-type="Sell"
                    onClick={() => setListingType('Sell')}
                  >
                    <svg className="icon-md" viewBox="0 0 24 24">
                      <path d="M3 7h18M3 7l1.5 12a2 2 0 0 0 2 1.8h11a2 2 0 0 0 2-1.8L21 7M8 7V5a4 4 0 0 1 8 0v2" />
                    </svg>
                    <strong>Sell</strong>
                    <span>Recover some value</span>
                  </button>
                </div>
              </div>

              <div className="field" id="priceField">
                <label htmlFor="price">PRICE (₹)</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  disabled={listingType === 'Donate'}
                />
                {listingType === 'Donate' ? (
                  <span className="hint" id="priceHint">Marked as free — this item will be donated.</span>
                ) : (
                  <span className="hint" id="priceHint">Set a fair price for disposal.</span>
                )}
              </div>

              <div className={`field ${errors.description ? 'invalid' : ''}`}>
                <label htmlFor="description">DESCRIPTION</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your neighbour about the condition, age, and anything they should know."
                  rows="5"
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>

              <div className="location-card">
                <span className="loc-icon">
                  <svg className="icon-sm" viewBox="0 0 24 24">
                    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
                    <circle cx="12" cy="9.5" r="2.3" />
                  </svg>
                </span>
                <div>
                  <strong>LOCAL VISIBILITY</strong>
                  <p>Your listing will be shown to people within your selected community radius.</p>
                  <span className="radius-tag">5 km radius</span>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Item'}
                <svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </form>
          </div>
        </section>

        {/* CATEGORY PILLS */}
        <nav className="category-nav" id="categoryNav">
          {['All', 'Books', 'Clothes', 'Electronics', 'Furniture', 'Stationery', 'Toys', 'Household'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryPill(cat)}
              className={`pill ${selectedCategoryPill === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* NEARBY */}
        <section className="nearby" id="marketplace-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow small"><i></i>LOCAL MARKETPLACE</span>
              <h2>Nearby Surplus</h2>
              <p>Useful items available around your community, ready for a new home.</p>
            </div>
          </div>

          <div className="filter-toolbar">
            <div className="search-box">
              <svg className="icon-sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nearby items…"
              />
            </div>
            <select
              id="filterType"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">Donate / Sell</option>
              <option value="Donate">Donate</option>
              <option value="Sell">Sell</option>
            </select>
            <select
              id="filterDistance"
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
            >
              <option value="All">Any distance</option>
              <option value="1">Within 1 km</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
            </select>
          </div>

          <div className="items-grid" id="itemsGrid">
            {filteredListings.map(item => {
              const hasPhoto = item.photos && item.photos.length > 0;
              const photoUrl = hasPhoto ? item.photos[0].url : null;
              const isMock = String(item.id).startsWith('mock-');
              const isClaimed = item.status === 'claimed';

              const emoji = CATEGORY_EMOJI[item.category_name] || CATEGORY_EMOJI[item.category_id] || "📦";

              const tag = item.listing_type === 'give_away'
                ? <span className="donate-tag">DONATE</span>
                : <span className="sell-tag">₹{item.price}</span>;

              return (
                <article key={item.id} className="item-card" style={{ opacity: isClaimed ? 0.7 : 1 }}>
                  <div className="item-image">
                    {photoUrl ? (
                      <img src={photoUrl} alt={item.title} />
                    ) : (
                      <span style={{ fontSize: '56px' }}>{emoji}</span>
                    )}
                    {tag}
                  </div>
                  <div className="item-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="item-tags">
                      <span>{item.condition}</span>
                      <span>{item.category_name || 'Item'}</span>
                    </div>
                    <div className="item-meta">
                      <span>📍 {item.distance || 0.5} km away</span>
                      {isClaimed ? (
                        <span className="item-view claimed-btn">Claimed</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleClaim(item.id);
                          }}
                          className="item-view"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                        >
                          Claim Item →
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredListings.length === 0 && (
            <p className="empty-state">No items match your filters yet — try widening your search.</p>
          )}
        </section>

        {/* PROCESS STEPS */}
        <section className="how-it-works">
          <span className="eyebrow small"><i></i>THE PROCESS</span>
          <h2>How Surplus works</h2>

          <div className="journey">
            <div className="journey-step">
              <span className="step-num">01</span>
              <h3>List</h3>
              <p>Post something you no longer need.</p>
            </div>
            <div className="journey-connector">
              <svg viewBox="0 0 100 10">
                <line x1="0" y1="5" x2="100" y2="5" strokeDasharray="3 6" />
              </svg>
            </div>
            <div className="journey-step">
              <span className="step-num">02</span>
              <h3>Connect</h3>
              <p>Find someone nearby who needs it.</p>
            </div>
            <div className="journey-connector">
              <svg viewBox="0 0 100 10">
                <line x1="0" y1="5" x2="100" y2="5" strokeDasharray="3 6" />
              </svg>
            </div>
            <div className="journey-step">
              <span className="step-num">03</span>
              <h3>Reuse</h3>
              <p>Keep it in circulation and reduce waste.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div>
            <h2>Your unused item could be useful to someone nearby.</h2>
            <p>List it instead of throwing it away.</p>
          </div>
          <button className="btn-primary dark" onClick={handleScrollToPost}>
            Post an Item
            <svg className="icon-sm" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </section>

      </main>

      {/* TOAST SYSTEM */}
      <div className={`toast ${toastVisible ? 'show' : ''}`} id="toast">
        <svg className="icon-sm" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7" /></svg>
        <div>
          <strong id="toastTitle">{toastTitle}</strong>
          <p id="toastBody">{toastBody}</p>
        </div>
      </div>
    </div>
  );
}
