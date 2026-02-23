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
