import { useState, useEffect } from 'react';
import { FounderNetworkGraph } from '../components/FounderNetworkGraph';

export function Evaluate() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/founder-network`);
      if (!response.ok) throw new Error('Failed to fetch founder network');
      const data = await response.json();
      setNetworkData(data);
    } catch (err) {
      console.error('Error fetching founder network:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-4">EVALUATE</h1>
      <p className="text-slate-400 mb-6">Founder networks and sector analysis</p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-200">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-slate-400">Loading founder network...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Founder Network</h2>
            <p className="text-sm text-slate-400 mb-4">
              {networkData?.founderCount || 0} founders, {networkData?.connectionCount || 0} connections
            </p>
            <FounderNetworkGraph data={networkData} />
          </div>
        </div>
      )}
    </div>
  );
}
