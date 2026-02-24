import { useState, useEffect } from 'react';
import { FounderNetworkMap } from '../components/FounderNetworkMap';
import { SectorHeatmap } from '../components/SectorHeatmap';
import { fetchTrendsWithCache, fetchDealsWithCache, getApiBaseUrl } from '../services/dataCache';
import { GLOBAL_CITIES } from '../utils/globalCities';

// Founder titles - varied and realistic
const FOUNDER_TITLES = ['CEO', 'CTO', 'CFO', 'Founder', 'Chairman', 'President', 'VP Engineering', 'VP Product', 'VC Manager', 'Partner'];

// Generate realistic ROI with some normal (100-300%) and some extreme (5000%+)
const generateRealisticROI = () => {
  const random = Math.random();
  if (random < 0.1) {
    // 10% chance of extreme outlier (5000%+)
    return Math.floor(Math.random() * 15000) + 5000;
  } else if (random < 0.25) {
    // 15% chance of very good (1000-5000%)
    return Math.floor(Math.random() * 4000) + 1000;
  } else if (random < 0.6) {
    // 35% chance of good (300-1000%)
    return Math.floor(Math.random() * 700) + 300;
  } else {
    // 40% chance of normal (50-300%)
    return Math.floor(Math.random() * 250) + 50;
  }
};

// Generate fake founder data with city information
const generateFakeFounders = (dealId) => {
  const founderCount = Math.floor(Math.random() * 4) + 1; // 1-4 founders
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew', 'Blake', 'Sage', 'Cameron'];
  const lastNames = ['Chen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Garcia', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

  const founders = [];
  for (let i = 0; i < founderCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = GLOBAL_CITIES[Math.floor(Math.random() * GLOBAL_CITIES.length)];
    const title = FOUNDER_TITLES[Math.floor(Math.random() * FOUNDER_TITLES.length)];

    founders.push({
      id: `founder-${dealId}-${i}`,
      name: `${firstName} ${lastName}`,
      title: title,
      city: `${city.name}, ${city.country}`,
      founderScore: Math.floor(Math.random() * 100) + 1, // 1-100
      investmentTrack: {
        exits: Math.floor(Math.random() * 8), // 0-7 exits
        averageROI: generateRealisticROI()
      },
      twitter: `https://twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      angellist: `https://angel.co/${firstName.toLowerCase()}${lastName.toLowerCase()}`
    });
  }

  return founders;
};

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
      let dealsData = dealsJson.deals || [];

      // Add generated founders to each deal (same as DealPipeline does)
      dealsData = dealsData.map(deal => ({
        ...deal,
        founders: generateFakeFounders(deal.id)
      }));

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
