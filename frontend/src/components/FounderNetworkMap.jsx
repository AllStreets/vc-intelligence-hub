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

  // Reset highlight function for use in onClose
  const handleResetHighlight = useCallback(() => {
    if (!map.current) return;

    console.log('Resetting highlight');
    setSelectedFounder(null);

    // Reset all founder dots to red
    map.current.setPaintProperty('founder-dots', 'circle-color', '#ef4444');

    // Reset all connection lines to gray
    map.current.setPaintProperty('connection-lines', 'line-color', '#888888');
    map.current.setPaintProperty('connection-lines', 'line-width', 2);
    map.current.setPaintProperty('connection-lines', 'line-opacity', 0.5);
  }, []);

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
      if (connectionGeoJSON?.features?.length > 0) {
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

      // Highlight founder connections function
      const highlightFounderConnections = (founderId) => {
        console.log('Highlighting connections for:', founderId);

        // Find all connections involving this founder
        const connectedFounderIds = new Set();
        const connectedConnectionIds = new Set();

        connections.forEach((conn, idx) => {
          if (conn.from === founderId) {
            connectedFounderIds.add(conn.to);
            connectedConnectionIds.add(`conn-${idx}`);
          } else if (conn.to === founderId) {
            connectedFounderIds.add(conn.from);
            connectedConnectionIds.add(`conn-${idx}`);
          }
        });

        console.log('Connected to', connectedFounderIds.size, 'other founders');

        // Highlight selected founder (yellow) and connected founders (orange)
        map.current.setPaintProperty('founder-dots', 'circle-color', [
          'case',
          ['==', ['get', 'founderId'], founderId],
          '#FFD700', // Gold/yellow for selected
          ['in', ['get', 'founderId'], ['literal', Array.from(connectedFounderIds)]],
          '#FF8C00', // Dark orange for connected
          '#ef4444'  // Red for others (default)
        ]);

        // Brighten connection lines that involve this founder
        map.current.setPaintProperty('connection-lines', 'line-color', [
          'case',
          ['in', ['get', 'id'], ['literal', Array.from(connectedConnectionIds)]],
          '#FFD700', // Gold for connected lines
          '#888888'  // Gray for others (default)
        ]);

        // Make connected lines thicker
        map.current.setPaintProperty('connection-lines', 'line-width', [
          'case',
          ['in', ['get', 'id'], ['literal', Array.from(connectedConnectionIds)]],
          3, // Thicker for connected
          2  // Normal width for others
        ]);

        // Increase opacity of connected lines
        map.current.setPaintProperty('connection-lines', 'line-opacity', [
          'case',
          ['in', ['get', 'id'], ['literal', Array.from(connectedConnectionIds)]],
          0.8,  // Brighter for connected
          0.5   // Default opacity for others
        ]);
      };

      // Reset highlight function
      const resetHighlight = () => {
        console.log('Resetting highlight');
        setSelectedFounder(null);

        // Reset all founder dots to red
        map.current.setPaintProperty('founder-dots', 'circle-color', '#ef4444');

        // Reset all connection lines to gray
        map.current.setPaintProperty('connection-lines', 'line-color', '#888888');
        map.current.setPaintProperty('connection-lines', 'line-width', 2);
        map.current.setPaintProperty('connection-lines', 'line-opacity', 0.5);
      };

      // Add click event listener for founder dots
      map.current.on('click', 'founder-dots', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const founderId = feature.properties.founderId;

          console.log('Clicked founder:', founderId, feature.properties.name);

          // Find the founder object to pass to details panel
          const founder = positionedFounders.find(f => f.founderId === founderId);
          if (founder) {
            setSelectedFounder(founder);
            highlightFounderConnections(founderId);
          }
        }
      });

      // Add click event listener to map background to deselect
      map.current.on('click', (e) => {
        if (!e.features || e.features.length === 0) {
          resetHighlight();
        }
      });

      // Change cursor on hover over founder dots
      map.current.on('mouseenter', 'founder-dots', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'founder-dots', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [data]);

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
          onClose={handleResetHighlight}
        />
      )}
    </div>
  );
}
