/**
 * Hospital Service
 */
const HOSPITALS = [
  {
    id: 'hosp01', name: 'City Central Hospital',
    address: '123 Medical Way, Downtown',
    location: { latitude: 22.7733, longitude: 75.9137 },
    type: 'GOVERNMENT', capabilities: ['LEVEL_1_TRAUMA', 'GENERAL_EMERGENCY'],
    currentOccupancy: 72, emergencyPreparednessStatus: 'Trauma Bay Ready', availableBeds: 8,
  },
  {
    id: 'hosp02', name: 'Apollo Heart Institute',
    address: '45 Cardiac Drive, Westside',
    location: { latitude: 22.7833, longitude: 75.9237 },
    type: 'PRIVATE', capabilities: ['CARDIAC_CENTER', 'GENERAL_EMERGENCY'],
    currentOccupancy: 40, emergencyPreparednessStatus: 'ICU Bed Reserved', availableBeds: 12,
  },
  {
    id: 'hosp03', name: 'Sunrise Burn & Trauma Center',
    address: '88 Ring Road, Northside',
    location: { latitude: 22.7600, longitude: 75.8900 },
    type: 'SPECIALTY', capabilities: ['BURN_UNIT', 'LEVEL_1_TRAUMA'],
    currentOccupancy: 55, emergencyPreparednessStatus: 'Burn Unit Available', availableBeds: 6,
  },
];

function search({ capability, severity, location } = {}) {
  let results = [...HOSPITALS];
  if (capability) results = results.filter(h => h.capabilities.includes(capability));
  // If location provided, sort by proximity (simple Euclidean)
  if (location && location.latitude && location.longitude) {
    results.sort((a, b) => {
      const da = Math.hypot(a.location.latitude - location.latitude, a.location.longitude - location.longitude);
      const db = Math.hypot(b.location.latitude - location.latitude, b.location.longitude - location.longitude);
      return da - db;
    });
  }
  return results;
}

function findById(id) {
  return HOSPITALS.find(h => h.id === id) || null;
}

// AI/ML placeholder — recommend best hospital for a case
function recommend({ severity, location, capability }) {
  const results = search({ capability, location });
  return results[0] || HOSPITALS[0];
}

module.exports = { HOSPITALS, search, findById, recommend };
