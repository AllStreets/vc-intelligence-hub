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

  // Extract and position founders
  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      setFounders([]);
      return;
    }

    // Convert node data to founder objects
    const founderList = data.nodes.map(node => ({
      id: node.id,
      name: node.name,
      city: node.city || 'Chicago, IL',
      ...node
    }));

    // Assign to cities with offsets
    const positionedFounders = assignFoundersToCities(founderList);
    setFounders(positionedFounders);
  }, [data]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (founders.length === 0) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom
    });

    map.current.on('load', () => {
      // Add founder dots source
      const founderGeoJSON = buildFounderGeoJSON(founders);

      map.current.addSource('founders', {
        type: 'geojson',
        data: founderGeoJSON
      });

      // Add founder circles layer
      map.current.addLayer({
        id: 'founder-dots',
        type: 'circle',
        source: 'founders',
        paint: {
          'circle-radius': 12,
          'circle-color': '#ef4444', // red
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add founder labels layer
      map.current.addLayer({
        id: 'founder-labels',
        type: 'symbol',
        source: 'founders',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-anchor': 'bottom',
          'text-offset': [0, -1.5],
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      console.log('Map loaded with', founders.length, 'founders');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [founders]);

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
