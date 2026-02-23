import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAP_CONFIG, US_CITIES } from '../utils/mapboxConfig';
import { FounderDetailsPanel } from './FounderDetailsPanel';

mapboxgl.accessToken = MAPBOX_TOKEN;

export function FounderNetworkMap({ data }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [founders, setFounders] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [draggingFounderId, setDraggingFounderId] = useState(null);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="w-full h-96 bg-dark-700 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">No founder network data available</p>
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
