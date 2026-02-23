export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MAP_CONFIG = {
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-95.7129, 37.0902], // Center of USA
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
  container: 'map-container'
};

// City coordinates for founder clustering
export const US_CITIES = {
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Cary, NC': { lat: 35.7915, lng: -78.7811 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 }
};

/**
 * Assign founders to cities with random offsets
 * Input: nodes array with structure {data: {id, label}}
 * Output: positioned founders array with all required properties
 */
export function assignFoundersToCities(nodes) {
  const cityNames = Object.keys(US_CITIES);

  return nodes.map((node, index) => {
    // Handle spec data structure: {data: {id, label}}
    const founderId = node.data?.id || node.id;
    const name = node.data?.label || node.name || 'Unknown';

    // Round-robin distribution across 6 cities
    const city = cityNames[index % cityNames.length];
    const cityCoords = US_CITIES[city];

    // Random offset (±0.015 degrees ≈ ±1.7km)
    const offsetLat = (Math.random() - 0.5) * 0.03;
    const offsetLng = (Math.random() - 0.5) * 0.03;

    return {
      founderId: founderId,
      name: name,
      city: city,
      lat: cityCoords.lat + offsetLat,
      lng: cityCoords.lng + offsetLng,
      cityLat: cityCoords.lat,
      cityLng: cityCoords.lng
    };
  });
}

/**
 * Convert founder positions to GeoJSON FeatureCollection
 */
export function buildFounderGeoJSON(founders) {
  return {
    type: 'FeatureCollection',
    features: founders.map(f => ({
      type: 'Feature',
      id: f.founderId,
      geometry: {
        type: 'Point',
        coordinates: [f.lng, f.lat]
      },
      properties: {
        founderId: f.founderId,
        name: f.name,
        city: f.city,
        cityLat: f.cityLat,
        cityLng: f.cityLng
      }
    }))
  };
}

/**
 * Convert founder connections to GeoJSON LineString features
 */
export function buildConnectionGeoJSON(founders, connections = []) {
  return {
    type: 'FeatureCollection',
    features: connections.map((conn, idx) => {
      const founder1 = founders.find(f => f.founderId === conn.from);
      const founder2 = founders.find(f => f.founderId === conn.to);

      if (!founder1 || !founder2) return null;

      return {
        type: 'Feature',
        id: `conn-${idx}`,
        geometry: {
          type: 'LineString',
          coordinates: [
            [founder1.lng, founder1.lat],
            [founder2.lng, founder2.lat]
          ]
        },
        properties: {
          from: conn.from,
          to: conn.to
        }
      };
    }).filter(f => f !== null)
  };
}
