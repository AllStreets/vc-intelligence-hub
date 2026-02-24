// Global cities for founder location generation
// Ordered: 6 original US cities + 18 new global cities
export const GLOBAL_CITIES = [
  // Original US Cities (6)
  { name: 'Chicago', country: 'USA', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { name: 'San Francisco', country: 'USA', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Cary', country: 'USA', state: 'NC', lat: 35.7915, lng: -78.7811 },
  { name: 'Seattle', country: 'USA', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'New York', country: 'USA', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Miami', country: 'USA', state: 'FL', lat: 25.7617, lng: -80.1918 },

  // New US Cities (3)
  { name: 'Rocky Mount', country: 'USA', state: 'NC', lat: 35.9406, lng: -77.8069 },
  { name: 'Chapel Hill', country: 'USA', state: 'NC', lat: 35.9132, lng: -79.0558 },
  { name: 'Alexandria', country: 'USA', state: 'VA', lat: 38.8048, lng: -77.0469 },

  // European Cities (6)
  { name: 'Barcelona', country: 'Spain', state: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Prague', country: 'Czech Republic', state: 'Prague', lat: 50.0755, lng: 14.4378 },
  { name: 'Ibiza', country: 'Spain', state: 'Ibiza', lat: 38.9054, lng: 1.4620 },
  { name: 'Florence', country: 'Italy', state: 'Florence', lat: 43.7696, lng: 11.2558 },
  { name: 'Mallorca', country: 'Spain', state: 'Mallorca', lat: 39.5696, lng: 2.7492 },
  { name: 'London', country: 'United Kingdom', state: 'England', lat: 51.5074, lng: -0.1278 },

  // African Cities (2)
  { name: 'Cape Town', country: 'South Africa', state: 'Western Cape', lat: -33.9249, lng: 18.4241 },
  { name: 'Dubai', country: 'United Arab Emirates', state: 'Dubai', lat: 25.2048, lng: 55.2708 },

  // Asian Cities (2)
  { name: 'Shanghai', country: 'China', state: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { name: 'Mumbai', country: 'India', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },

  // Australia (1)
  { name: 'Sydney', country: 'Australia', state: 'New South Wales', lat: -33.8688, lng: 151.2093 },

  // South America (2)
  { name: 'Buenos Aires', country: 'Argentina', state: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Rio de Janeiro', country: 'Brazil', state: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },

  // Antarctica (1)
  { name: 'Antarctica', country: 'Antarctica', state: 'N/A', lat: -77.8519, lng: 166.6753 }
];

export default GLOBAL_CITIES;
