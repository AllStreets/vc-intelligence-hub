import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_CONFIG, assignFoundersToCities, buildFounderGeoJSON, buildConnectionGeoJSON } from '../utils/mapboxConfig';
import { FounderDetailsPanel } from './FounderDetailsPanel';

if (!MAPBOX_TOKEN) {
  console.error('ERROR: VITE_MAPBOX_TOKEN is not set in environment variables');
}

mapboxgl.accessToken = MAPBOX_TOKEN;

export function FounderNetworkMap({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [founders, setFounders] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [error, setError] = useState(null);
  const draggingFounderId = useRef(null);  // Use ref to avoid closure issues
  const draggedPositions = useRef({});  // Track {founderId: {lng, lat}} for dragged dots

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

    map.current.on('error', (e) => {
      console.error('Mapbox error:', e);
      setError(`Map error: ${e.error?.message || 'Unknown error'}`);
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
      const connectionsList = data.edges?.map(edge => ({
        from: edge.data?.source || edge.source,
        to: edge.data?.target || edge.target,
        strength: edge.data?.strength || 1,
        id: edge.data?.id || edge.id
      })) || [];

      setConnections(connectionsList);

      console.log('Processing connections:', connectionsList.length);

      // Build connection lines GeoJSON
      const connectionGeoJSON = buildConnectionGeoJSON(positionedFounders, connectionsList);
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

        connectionsList.forEach((conn, idx) => {
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

      // Add navigation control (zoom buttons, compass)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      console.log('Map controls added');

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

      // Drag start listener
      map.current.on('mousedown', 'founder-dots', (e) => {
        if (e.features && e.features.length > 0) {
          const founderId = e.features[0].properties.founderId;
          console.log('Drag started for founder:', founderId);

          // Set dragging flag using ref (avoids closure issues)
          draggingFounderId.current = founderId;

          // Prevent map from panning during drag
          e.preventDefault();
        }
      });

      // Drag move listener
      map.current.on('mousemove', (e) => {
        if (!draggingFounderId.current) return;

        // Prevent map from panning while dragging
        e.preventDefault();

        const currentDraggingId = draggingFounderId.current;

        // Update dragged position for this founder
        draggedPositions.current[currentDraggingId] = {
          lng: e.lngLat.lng,
          lat: e.lngLat.lat
        };

        // Update the founder-dots GeoJSON with new position
        const updatedGeometry = {
          type: 'FeatureCollection',
          features: positionedFounders.map(f => {
            const dragged = draggedPositions.current[f.founderId];
            return {
              type: 'Feature',
              id: f.founderId,
              geometry: {
                type: 'Point',
                coordinates: dragged ? [dragged.lng, dragged.lat] : [f.lng, f.lat]
              },
              properties: {
                founderId: f.founderId,
                name: f.name,
                city: f.city,
                cityLat: f.cityLat,
                cityLng: f.cityLng
              }
            };
          })
        };

        // Update the source to show new positions
        if (map.current.getSource('founders')) {
          map.current.getSource('founders').setData(updatedGeometry);
        }

        // Update connection lines GeoJSON to reflect new positions
        const updatedConnections = connectionsList.map((conn, idx) => {
          const founder1 = positionedFounders.find(f => f.founderId === conn.from);
          const founder2 = positionedFounders.find(f => f.founderId === conn.to);

          if (!founder1 || !founder2) return null;

          const pos1 = draggedPositions.current[conn.from] || {lng: founder1.lng, lat: founder1.lat};
          const pos2 = draggedPositions.current[conn.to] || {lng: founder2.lng, lat: founder2.lat};

          return {
            type: 'Feature',
            id: `conn-${idx}`,
            geometry: {
              type: 'LineString',
              coordinates: [[pos1.lng, pos1.lat], [pos2.lng, pos2.lat]]
            },
            properties: {
              id: `conn-${idx}`,
              from: conn.from,
              to: conn.to
            }
          };
        }).filter(f => f !== null);

        const connectionGeoJSON = {
          type: 'FeatureCollection',
          features: updatedConnections
        };

        if (map.current.getSource('connections')) {
          map.current.getSource('connections').setData(connectionGeoJSON);
        }
      });

      // Drag end listener
      map.current.on('mouseup', () => {
        if (draggingFounderId.current) {
          console.log('Drag ended for founder:', draggingFounderId.current);
          draggingFounderId.current = null;
        }
      });
    });

    return () => {
      // Reset all dragged positions when leaving this component
      draggedPositions.current = {};

      if (map.current) {
        // Remove all registered event listeners before removing map
        map.current.off('mousedown', 'founder-dots');
        map.current.off('mousemove');
        map.current.off('mouseup');
        map.current.off('click', 'founder-dots');
        map.current.off('click');
        map.current.off('mouseenter', 'founder-dots');
        map.current.off('mouseleave', 'founder-dots');
        map.current.off('error');
        map.current.off('load');

        map.current.remove();
        map.current = null;
      }
    };
  }, [data]);

  // Empty state
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-96 bg-red-900/20 rounded-lg flex items-center justify-center border border-red-700/50 p-4">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Mapbox Configuration Error</p>
          <p className="text-red-300 text-sm">VITE_MAPBOX_TOKEN environment variable is not set</p>
          <p className="text-red-300 text-xs mt-1">On Vercel: Add VITE_MAPBOX_TOKEN to Environment Variables in project settings</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-red-900/20 rounded-lg flex items-center justify-center border border-red-700/50 p-4">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Map Loading Error</p>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

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

      {/* Interaction instructions overlay */}
      <div className="absolute top-4 left-4 bg-dark-700 border border-dark-600 rounded p-3 text-xs text-slate-300 max-w-xs z-40">
        <p className="font-semibold text-slate-200 mb-2">Founder Network Map</p>
        <ul className="space-y-1 text-slate-400">
          <li>• <span className="text-slate-300">Click</span> founder dots to view details</li>
          <li>• <span className="text-slate-300">Drag</span> dots to reposition</li>
          <li>• <span className="text-slate-300">Scroll</span> to zoom, click background to deselect</li>
        </ul>
      </div>

      {/* Statistics display */}
      <div className="absolute bottom-4 left-4 bg-dark-700 border border-dark-600 rounded p-3 text-xs z-40">
        <div className="text-slate-300">
          <p><span className="font-semibold">{founders.length}</span> founders</p>
          <p><span className="font-semibold">{connections.length}</span> connections</p>
        </div>
      </div>

      {selectedFounder && (
        <FounderDetailsPanel
          founderData={selectedFounder}
          onClose={handleResetHighlight}
        />
      )}
    </div>
  );
}
