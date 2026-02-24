import { GLOBAL_CITIES } from './globalCities';

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MAP_CONFIG = {
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-20, 20], // Centered on world (roughly Europe/Africa/Americas)
  zoom: 2.5, // Zoom out to see all continents
  pitch: 0,
  bearing: 0,
  container: 'map-container'
};

export { GLOBAL_CITIES };

/**
 * Assign founders to cities with random offsets
 * Input: nodes array with structure {data: {id, label}}
 * Output: positioned founders array with all required properties
 */
export function assignFoundersToCities(nodes) {
  return nodes.map((node, index) => {
    // Handle spec data structure: {data: {id, label}}
    const founderId = node.data?.id || node.id;
    const name = node.data?.label || node.name || 'Unknown';

    // Round-robin distribution across all global cities
    const cityObj = GLOBAL_CITIES[index % GLOBAL_CITIES.length];
    const cityName = `${cityObj.name}, ${cityObj.country}`;

    // Random offset (±0.015 degrees ≈ ±1.7km)
    const offsetLat = (Math.random() - 0.5) * 0.03;
    const offsetLng = (Math.random() - 0.5) * 0.03;

    return {
      founderId: founderId,
      name: name,
      city: cityName,
      lat: cityObj.lat + offsetLat,
      lng: cityObj.lng + offsetLng,
      cityLat: cityObj.lat,
      cityLng: cityObj.lng
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
          id: `conn-${idx}`,
          from: conn.from,
          to: conn.to
        }
      };
    }).filter(f => f !== null)
  };
}
