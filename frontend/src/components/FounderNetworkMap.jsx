import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_CONFIG, US_CITIES, assignFoundersToCities, buildFounderGeoJSON, buildConnectionGeoJSON } from '../utils/mapboxConfig';
import { FounderDetailsPanel } from './FounderDetailsPanel';

mapboxgl.accessToken = MAPBOX_TOKEN;

export function FounderNetworkMap({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [founders, setFounders] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [draggingFounderId, setDraggingFounderId] = useState(null);

  // Initialize Mapbox map and position founders
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!data || !data.nodes || data.nodes.length === 0) return;

    // Position founders at cities with random offsets
    const positionedFounders = assignFoundersToCities(data.nodes);
    setFounders(positionedFounders);

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch || 0,
      bearing: MAP_CONFIG.bearing || 0
    });

    map.current.on('load', () => {
      // Add founder positions as GeoJSON source
      const founderGeoJSON = buildFounderGeoJSON(positionedFounders);

      map.current.addSource('founders', {
        type: 'geojson',
        data: founderGeoJSON
      });

      // Circle layer for founder dots
      map.current.addLayer({
        id: 'founder-dots',
        type: 'circle',
        source: 'founders',
        paint: {
          'circle-radius': 12,
          'circle-color': '#EF4444',
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-stroke-opacity': 0.3
        }
      });

      // Symbol layer for founder labels
      map.current.addLayer({
        id: 'founder-labels',
        type: 'symbol',
        source: 'founders',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10,
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#fff',
          'text-opacity': 0.7,
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      console.log('Map loaded with', positionedFounders.length, 'founders');

      // Extract connections from data.edges
      const connections = data.edges?.map(edge => ({
        from: edge.data?.source || edge.source,
        to: edge.data?.target || edge.target,
        strength: edge.data?.strength || 1,
        id: edge.data?.id || edge.id
      })) || [];

      console.log('Processing connections:', connections.length);

      // Build connection lines GeoJSON
      const connectionGeoJSON = buildConnectionGeoJSON(positionedFounders, connections);
      console.log('Built connections GeoJSON with', connectionGeoJSON.features.length, 'lines');

      // Add connections source (must be added after founders source)
      if (connectionGeoJSON.features.length > 0) {
        map.current.addSource('connections', {
          type: 'geojson',
          data: connectionGeoJSON
        });

        // Add connection lines layer (gray, below founder dots)
        map.current.addLayer({
          id: 'connection-lines',
          type: 'line',
          source: 'connections',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888888',
            'line-width': 2,
            'line-opacity': 0.5
          }
        }, 'founder-dots');  // Insert before founder dots so dots appear on top
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [data?.nodes]);

  // Empty state
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="w-full h-96 bg-dark-700 rounded-lg flex items-center justify-center text-slate-400">
        No founder data available
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-dark-700 rounded-lg overflow-hidden border border-dark-600">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {selectedFounder && (
        <FounderDetailsPanel
          founderData={selectedFounder}
          onClose={() => setSelectedFounder(null)}
        />
      )}
    </div>
  );
}
