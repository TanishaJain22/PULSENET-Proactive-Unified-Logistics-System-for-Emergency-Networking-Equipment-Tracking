/**
 * Routing Service — OSRM proxy + ETA calculation
 */
const axios = require('axios');

/**
 * Calculate distance in meters between two lat/lng points (Haversine).
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate speed (m/s) from two location snapshots.
 */
function calculateSpeed(prev, curr) {
  if (!prev || !curr) return 0;
  const dist = haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
  const dt = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;
  return dt > 0 ? dist / dt : 0;
}

/**
 * Fetch route from OSRM via backend proxy format.
 * coords: "startLng,startLat;endLng,endLat"
 */
async function fetchRoute(coords) {
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const response = await axios.get(osrmUrl, { timeout: 5000 });
    const data = response.data;
    if (data.code !== 'Ok' || !data.routes || !data.routes.length) throw new Error('No route');

    const route = data.routes[0];
    const speedMs = 10; // assume 36 km/h average ambulance speed
    const eta = Math.ceil(route.distance / speedMs / 60); // minutes

    return { ...data, eta };
  } catch (err) {
    console.warn('[Routing] OSRM failed, returning mock:', err.message);
    const parts = coords.split(';');
    const start = (parts[0] || '75.8577,22.7196').split(',').map(Number);
    const end   = (parts[1] || '75.9137,22.7733').split(',').map(Number);
    const dist = haversineDistance(start[1], start[0], end[1], end[0]);
    const eta = Math.ceil(dist / 10 / 60);
    return {
      code: 'Ok',
      routes: [{
        geometry: {
          type: 'LineString',
          coordinates: [start, [(start[0]+end[0])/2, (start[1]+end[1])/2], end],
        },
        distance: dist, duration: dist / 10,
      }],
      eta,
    };
  }
}

module.exports = { fetchRoute, haversineDistance, calculateSpeed };
