/**
 * Formats a raw distance value into a friendly user-facing string (e.g. "0.6 km away" or "50m away").
 * @param {number} distanceInMeters - The distance in meters.
 * @returns {string} Formatted distance representation.
 */
export default function formatDistance(distanceInMeters) {
  if (distanceInMeters === undefined || distanceInMeters === null || isNaN(distanceInMeters)) {
    return '';
  }

  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m away`;
  }

  const distanceInKm = distanceInMeters / 1000;
  return `${distanceInKm.toFixed(1)} km away`;
}
