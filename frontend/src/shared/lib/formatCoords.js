/**
 * Formats a location object into a clean coordinate string or null.
 * e.g., "20.2961° N, 85.8245° E"
 * Returns null if location or coordinates are missing (avoids fake coordinates).
 *
 * @param {Object} location - Location object containing latitude/lat and longitude/lng/lon
 * @returns {string|null}
 */
export function formatCoordinates(location) {
  if (!location) return null;
  const lat = location.latitude ?? location.lat;
  const lng = location.longitude ?? location.lng ?? location.lon;
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return null;
  }
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return null;

  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';
  return `${Math.abs(latNum).toFixed(4)}° ${latDir}, ${Math.abs(lngNum).toFixed(4)}° ${lngDir}`;
}

/**
 * Parses a coordinate string like "20.2961° N, 85.8245° E" into { lat, lng }.
 * Falls back to default city center (Bhubaneswar: 20.296, 85.824) if invalid or missing.
 *
 * @param {string} coordStr - Coordinate string to parse
 * @param {Object} defaultPos - Fallback position object { lat, lng }
 * @returns {{ lat: number, lng: number }}
 */
export function parseCoordinates(coordStr, defaultPos = { lat: 20.296, lng: 85.824 }) {
  if (!coordStr || typeof coordStr !== 'string') return defaultPos;
  try {
    const parts = coordStr.split(',');
    if (parts.length < 2) return defaultPos;
    const latPart = parts[0].trim();
    const lngPart = parts[1].trim();
    const latVal = parseFloat(latPart);
    const lngVal = parseFloat(lngPart);
    if (isNaN(latVal) || isNaN(lngVal)) return defaultPos;
    const lat = latPart.toUpperCase().includes('S') ? -Math.abs(latVal) : Math.abs(latVal);
    const lng = lngPart.toUpperCase().includes('W') ? -Math.abs(lngVal) : Math.abs(lngVal);
    return { lat, lng };
  } catch (e) {
    return defaultPos;
  }
}

/**
 * Formats a jurisdiction string from an incident's administrative_area or location data.
 *
 * @param {Object} incident - Incident data
 * @param {string} defaultDept - Department name
 * @returns {string}
 */
export function formatJurisdiction(incident, defaultDept = "Sanitation") {
  const adminArea = incident?.administrative_area || incident?.representative_location?.administrative_area;
  const areaName = (typeof adminArea === 'string' ? adminArea : adminArea?.name) || incident?.representative_location?.name;
  const parentName = adminArea?.parent_name || "Bhubaneshwar Municipal Corp.";
  
  if (areaName) {
    return `${areaName} → ${parentName} → ${defaultDept}`;
  }
  return "Jurisdiction unresolved";
}
