import { useState, useEffect } from 'react';
import { FounderNetworkMap } from '../components/FounderNetworkMap';
import { SectorHeatmap } from '../components/SectorHeatmap';
import { fetchTrendsWithCache, fetchDealsWithCache, getApiBaseUrl } from '../services/dataCache';

// Build founder network from deals
const buildFounderNetworkFromDeals = (deals) => {
  const founderMap = new Map();
  const edges = [];

  // Collect all founders from deals
  deals?.forEach((deal, dealIndex) => {
    deal.founders?.forEach((founder) => {
      const founderId = founder.id || `founder-${founder.name}`;
      if (!founderMap.has(founderId)) {
        founderMap.set(founderId, {
          data: {
            id: founderId,
            label: founder.name || 'Unknown Founder'
          }
        });
      }
    });

    // Create edges between founders in the same deal
    if (deal.founders && deal.founders.length > 1) {
      for (let i = 0; i < deal.founders.length; i++) {
        for (let j = i + 1; j < deal.founders.length; j++) {
          const founder1Id = deal.founders[i].id || `founder-${deal.founders[i].name}`;
          const founder2Id = deal.founders[j].id || `founder-${deal.founders[j].name}`;
          const edgeId = `edge-${founder1Id}-${founder2Id}`;

          // Only add edge if not already exists
          if (!edges.find(e => e.data.id === edgeId)) {
            edges.push({
              data: {
                id: edgeId,
                source: founder1Id,
                target: founder2Id,
                strength: 1
              }
            });
          }
        }
      }
    }
  });

  return {
    nodes: Array.from(founderMap.values()),
    edges: edges,
    founderCount: founderMap.size,
    connectionCount: edges.length
  };
};

export function Evaluate() {
  const [networkData, setNetworkData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trends for heatmap (use cache)
      const trendsJson = await fetchTrendsWithCache();
      setTrends(trendsJson.trends || []);

      // Fetch deals for heatmap and founder network
      const dealsJson = await fetchDealsWithCache();
      const dealsData = dealsJson.deals || [];
      setDeals(dealsData);

      // Build founder network from deals
      const founderNetwork = buildFounderNetworkFromDeals(dealsData);
      setNetworkData(founderNetwork);
    } catch (err) {
      console.error('Error fetching EVALUATE page data:', err);
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
          <p className="text-slate-400">Loading EVALUATE data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Founder Network</h2>
            <p className="text-sm text-slate-400 mb-4">
              {networkData?.founderCount || 0} founders, {networkData?.connectionCount || 0} connections
            </p>
            <FounderNetworkMap data={networkData} />
          </div>

          <div>
            <SectorHeatmap trends={trends} deals={deals} />
          </div>
        </div>
      )}
    </div>
  );
}
