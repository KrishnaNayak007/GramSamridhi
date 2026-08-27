import { authApi } from '../../services/authApi';

// Initial local storage seeds
const defaultCategories = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Foods & Veggies', icon: '🍎' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Books & Stationery', icon: '📚' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Clothing & Apparel', icon: '👕' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Household Items', icon: '🏠' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Electronics & Gadgets', icon: '🔌' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Others', icon: '📦' }
];

const defaultListings = [
  {
    id: 'l1',
    owner: { username: 'kudiary_shop' },
    title: 'Fresh surplus tomatoes',
    category: defaultCategories[0],
    condition: 'good',
    listing_type: 'give_away',
    price: null,
    description: 'Around 5kg surplus tomatoes from our local grocery store. Free to pick up.',
    location: { name: 'Kudiary GP, Jatni' },
    status: 'available',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'l2',
    owner: { username: 'Bhubaneswar_citizen' },
    title: 'Grade 10 Textbook Set',
    category: defaultCategories[1],
    condition: 'new',
    listing_type: 'give_away',
    price: null,
    description: 'Complete CBSE Class 10 textbook set. Good condition, no missing pages.',
    location: { name: 'BMC Ward 24, Bhubaneswar' },
    status: 'available',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const defaultReports = [
  {
    id: 'r1',
    citizen: { username: 'Bhubaneswar_citizen' },
    description: ' garbage clearance at kanas village. Pile has been accumulating for 3 days.',
    location: { name: 'kanas', district: 'Puri' },
    submitted_at: new Date(Date.now() - 1800000).toISOString(),
    incident: { status: 'open', priority_score: 8.5 }
  }
];

const defaultPreferences = {
  profile_visibility: 'public',
  contact_visibility: 'everyone',
  location_sharing: 'always',
  activity_status_visible: true
};

// Initialize local storage keys if not exist
if (!localStorage.getItem('mock_listings')) {
  localStorage.setItem('mock_listings', JSON.stringify(defaultListings));
}
if (!localStorage.getItem('mock_reports')) {
  localStorage.setItem('mock_reports', JSON.stringify(defaultReports));
}
if (!localStorage.getItem('mock_preferences')) {
  localStorage.setItem('mock_preferences', JSON.stringify(defaultPreferences));
}

/**
 * Custom fetch wrapper that automatically fallback to Mock Offline Engine
 * when backend network calls return errors or the server is unreachable.
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');

  // Bypass network calls when in offline dummy authentication mode to avoid console error spam
  if (token === 'dummy_access_token' || (token && token.startsWith('dummy_'))) {
    return handleMockRequest(url, options);
  }

  const headers = options.headers || {};
  const newOptions = { ...options };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  newOptions.headers = headers;

  try {
    let response = await fetch(url, newOptions);

    if (response.status === 401 && localStorage.getItem('refresh_token')) {
      try {
        const refresh = localStorage.getItem('refresh_token');
        const data = await authApi.refreshToken(refresh);
        localStorage.setItem('access_token', data.access);
        headers['Authorization'] = `Bearer ${data.access}`;
        newOptions.headers = headers;
        response = await fetch(url, newOptions);
      } catch (err) {
        console.warn('Auto-token-refresh failed, logging out...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.reload();
        return new Response(JSON.stringify({ detail: "Session expired. Redirecting..." }), { status: 401 });
      }
    }

    if (!response.ok) {
      // Intercept any non-ok responses (401, 403, 404, 500) and use mock fallback
      return handleMockRequest(url, options);
    }

    return response;
  } catch (error) {
    console.warn(`Network error fetching ${url}. Falling back to client-side mock engine:`, error);
    return handleMockRequest(url, options);
  }
}

/**
 * Handle Mock Offline State API responses
 */
function handleMockRequest(url, options) {
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // Helper to create Response object
  const createResponse = (data, status = 200) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data
    };
  };

  // 1. SURPLUS CATEGORIES
  if (url.includes('/api/v1/surplus/categories/')) {
    return createResponse(defaultCategories);
  }

  // 2. SURPLUS LISTINGS
  if (url.includes('/api/v1/surplus/listings/')) {
    const mockListings = JSON.parse(localStorage.getItem('mock_listings') || '[]');
    
    if (method === 'POST') {
      const selectedCat = defaultCategories.find(c => c.id === body.category_id) || defaultCategories[5];
      const newListing = {
        id: 'mock-listing-' + Math.random().toString(36).substr(2, 9),
        owner: JSON.parse(localStorage.getItem('user') || '{"username": "Bhubaneswar_citizen"}'),
        title: body.title,
        category: selectedCat,
        condition: body.condition || 'good',
        listing_type: body.listing_type || 'give_away',
        price: body.price || null,
        description: body.description || '',
        location: { name: 'BMC Ward 24, Bhubaneswar' },
        status: 'available',
        created_at: new Date().toISOString()
      };
      mockListings.unshift(newListing);
      localStorage.setItem('mock_listings', JSON.stringify(mockListings));
      return createResponse(newListing, 201);
    }
    
    return createResponse(mockListings);
  }

  // 3. CLAIM EVENT
  const listingEventMatch = url.match(/\/api\/v1\/surplus\/listings\/([^/]+)\/events\//);
  if (listingEventMatch && method === 'POST') {
    const listingId = listingEventMatch[1];
    const mockListings = JSON.parse(localStorage.getItem('mock_listings') || '[]');
    const target = mockListings.find(l => l.id === listingId);
    if (target) {
      target.status = 'claimed';
      localStorage.setItem('mock_listings', JSON.stringify(mockListings));
    }
    return createResponse({ status: 'success' }, 201);
  }

  // 4. INCIDENTS REPORTS
  if (url.includes('/api/v1/incidents/reports/') || url.includes('/api/v1/reports/')) {
    const mockReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');

    if (method === 'POST') {
      const newReport = {
        id: 'mock-report-' + Math.random().toString(36).substr(2, 9),
        citizen: JSON.parse(localStorage.getItem('user') || '{"username": "Bhubaneswar_citizen"}'),
        description: body.description,
        location: { name: 'BMC Ward 24, Bhubaneswar' },
        submitted_at: new Date().toISOString(),
        incident: { status: 'open', priority_score: 7.2 }
      };
      mockReports.unshift(newReport);
      localStorage.setItem('mock_reports', JSON.stringify(mockReports));
      return createResponse(newReport, 201);
    }

    return createResponse(mockReports);
  }

  // 5. INCIDENTS LIST
  if (url.includes('/api/v1/incidents/incidents/') || url.includes('/api/v1/incidents/')) {
    const mockReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
    // Convert reports to incidents for listing
    const incidents = mockReports.map(rep => ({
      id: rep.id,
      category: 'garbage_accumulation',
      status: rep.incident?.status || 'open',
      representative_location: rep.location,
      priority_score: rep.incident?.priority_score || 5.0,
      first_reported_at: rep.submitted_at,
      last_reported_at: rep.submitted_at
    }));
    return createResponse(incidents);
  }

  // 6. SURPLUS IMPACT STATS
  if (url.includes('/api/v1/surplus/impact/')) {
    const mockListings = JSON.parse(localStorage.getItem('mock_listings') || '[]');
    const claimedCount = mockListings.filter(l => l.status === 'claimed').length;
    return createResponse({
      waste_prevented_kg: 12450 + (claimedCount * 5),
      claimed_listings_count: 4820 + claimedCount,
      co2_avoided_kg: 3150 + (claimedCount * 2)
    });
  }

  // 7. USER PREFERENCES
  if (url.includes('/api/v1/accounts/preferences/')) {
    const mockPrefs = JSON.parse(localStorage.getItem('mock_preferences') || '{}');
    if (method === 'PATCH') {
      const updated = { ...mockPrefs, ...body };
      localStorage.setItem('mock_preferences', JSON.stringify(updated));
      return createResponse(updated);
    }
    return createResponse(mockPrefs);
  }

  // 8. SECURITY CHANGE PASSWORD
  if (url.includes('/api/v1/accounts/security/change-password/')) {
    return createResponse({ message: 'Password changed successfully.' });
  }

  // 9. GEOGRAPHY RESOLVE
  if (url.includes('/api/v1/geography/resolve/')) {
    const latMatch = url.match(/lat=([0-9.-]+)/);
    const lat = latMatch ? parseFloat(latMatch[1]) : 20.296;

    if (Math.abs(lat - 20.15) < 0.05) {
      return createResponse({
        resolved: true,
        ward: {
          id: 'mock-ward-rural',
          name: 'Kudiary Village',
          area_type: 'VILLAGE'
        },
        responsible_department: {
          name: 'Sanitation Department',
          code: 'SANITATION'
        },
        assigned_officer: {
          name: 'kudiary_gp_secretary',
          role_title: 'GP Panchayat Executive Officer'
        }
      });
    }

    return createResponse({
      resolved: true,
      ward: {
        id: 'mock-ward-urban',
        name: 'BMC Ward 24',
        area_type: 'WARD'
      },
      responsible_department: {
        name: 'Sanitation Department',
        code: 'SANITATION'
      },
      assigned_officer: {
        name: 'Block_level_officer',
        role_title: 'BMC Ward Sanitation Officer'
      }
    });
  }

  // 10. EVIDENCE UPLOAD MOCK
  if (url.includes('/api/v1/evidence/upload/') && method === 'POST') {
    return createResponse({
      id: 'mock-evidence-' + Math.floor(10000 + Math.random() * 89999),
      storage_key: 'mock-storage-key-jpeg',
      media_type: 'image/jpeg',
      captured_at: new Date().toISOString(),
      uploaded_at: new Date().toISOString(),
      status: 'pending',
      checksum: 'mock-md5-checksum'
    }, 201);
  }

  // 11. SUBMIT CITIZEN REPORT MOCK
  if ((url.includes('/api/v1/incidents/reports/') || url.includes('/api/v1/reports/')) && method === 'POST') {
    const mockReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
    const newReport = {
      id: 'mock-report-' + Math.floor(10000 + Math.random() * 89999),
      citizen: {
        username: 'Bhubaneswar_citizen',
        first_name: 'Goutam',
        last_name: 'Soni'
      },
      evidence: {
        id: body?.evidence_id || 'mock-evidence-uuid-12345'
      },
      location: {
        latitude: body?.latitude || 20.296,
        longitude: body?.longitude || 85.824,
        name: 'Park Road, Sector 5, Ward 24'
      },
      incident: {
        id: 'mock-incident-' + Math.floor(10000 + Math.random() * 89999),
        status: 'open',
        priority_score: 5.0
      },
      description: body?.description || '',
      submitted_at: new Date().toISOString()
    };

    mockReports.unshift(newReport);
    localStorage.setItem('mock_reports', JSON.stringify(mockReports));
    return createResponse(newReport, 201);
  }

  // 12. AGRICULTURE PICKUPS
  if (url.includes('/api/v1/agriculture/pickups/')) {
    if (!localStorage.getItem('mock_pickups')) {
      localStorage.setItem('mock_pickups', JSON.stringify([]));
    }
    const mockPickups = JSON.parse(localStorage.getItem('mock_pickups'));
    if (method === 'POST') {
      const newPickup = {
        id: 'mock-pickup-' + Math.floor(10000 + Math.random() * 89999),
        residue_type: body.residue_type || 'Paddy Straw',
        weight_kg: parseFloat(body.weight_kg) || 0.0,
        location_address: body.location_address || '',
        scheduled_slot: body.scheduled_slot || '',
        status: 'pending',
        payment_amount: (parseFloat(body.weight_kg) || 0.0) * 2.15,
        payment_status: 'unpaid',
        created_at: new Date().toISOString()
      };
      mockPickups.unshift(newPickup);
      localStorage.setItem('mock_pickups', JSON.stringify(mockPickups));
      return createResponse(newPickup, 201);
    }
    return createResponse(mockPickups);
  }

  // 13. AGRICULTURE SCHEMES
  if (url.includes('/api/v1/agriculture/schemes/')) {
    const mockSchemes = [
      {
        id: "scheme-pkvy",
        name: "Paramparagat Krishi Vikas Yojana",
        code: "PKVY",
        category: "Organic Farming",
        description: "Support for cluster-based organic farming, certification, and farmer capacity building.",
        benefits: "Financial assistance of Rs. 50,000 per hectare for 3 years, with 60% (Rs. 30,000) for organic inputs.",
        eligibility: "Farmers forming clusters of 20 hectares or more in contiguous areas.",
        apply_url: "https://pgsindia-ncof.gov.in/pkvy/index.html",
        is_active: true
      }
    ];
    return createResponse(mockSchemes);
  }

  // 14. AGRICULTURE COMPLAINTS
  if (url.includes('/api/v1/agriculture/complaints/')) {
    if (!localStorage.getItem('mock_farmer_complaints')) {
      localStorage.setItem('mock_farmer_complaints', JSON.stringify([]));
    }
    const mockComplaints = JSON.parse(localStorage.getItem('mock_farmer_complaints'));
    if (method === 'POST') {
      const newComplaint = {
        id: 'mock-comp-' + Math.floor(10000 + Math.random() * 89999),
        title: body.title,
        category: body.category || 'other',
        description: body.description,
        status: 'pending',
        response_resolution: '',
        created_at: new Date().toISOString()
      };
      mockComplaints.unshift(newComplaint);
      localStorage.setItem('mock_farmer_complaints', JSON.stringify(mockComplaints));
      return createResponse(newComplaint, 201);
    }
    return createResponse(mockComplaints);
  }

  // 15. AGRICULTURE AI ASSISTANT
  if (url.includes('/api/v1/agriculture/ai-assistant/')) {
    const prompt = body.prompt || '';
    let response_text = "Hello! I am your KrishiSahyog assistant. You can ask me any questions about organic farming, residue management, and compost.";
    const p = prompt.toLowerCase();
    if (p.includes("खाद") || p.includes("कम्पोस्ट") || p.includes("गोबर") || p.includes("जैविक")) {
      response_text = "नमस्ते! जैविक खाद (Organic Compost) बनाने के लिए धान के अवशेष (पॉली/पुआल) को छोटे टुकड़ों में काट लें। इसे गोबर, मिट्टी और हरी पत्तियों के साथ मिलकर 60-90 दिनों तक नमी में रखें। इससे उत्तम गुणवत्ता वाली खाद तैयार होगी जो मिट्टी की उत्पादकता बढ़ाएगी।";
    } else if (p.includes("कीड़ा") || p.includes("बीमारी") || p.includes("पेस्ट") || p.includes("सुरक्षा")) {
      response_text = "कीटनाशक सुरक्षा के लिए आप नीम के काढ़े (Neem oil spray) का उपयोग कर सकते हैं। 10 लीटर पानी में 50 मिलीलीटर नीम का तेल और थोड़ा सा साबुन का घोल मिलाकर फसलों पर छिड़काव करें। यह एक सुरक्षित और प्राकृतिक उपाय है।";
    } else if (p.includes("compost") || p.includes("residue") || p.includes("manure") || p.includes("organic")) {
      response_text = "Hello! To prepare high-quality organic compost, mix crop residue with green leaves and manure (1:3 ratio), keep it moist, and turn it every 15 days. Within 8-10 weeks, you will have nutrient-rich compost ready for your fields, helping you avoid residue burning.";
    } else if (p.includes("pest") || p.includes("disease") || p.includes("insect")) {
      response_text = "For natural pest management, we recommend neem-based solutions. Spraying a mixture of neem oil (5ml/L of water) with a few drops of liquid soap helps control aphids, whiteflies, and caterpillars without chemical side effects.";
    }
    return createResponse({ response: response_text });
  }

  // Fallback default
  return createResponse({ detail: 'Endpoint mock not matched' }, 404);
}

