import { useState, useEffect } from 'react';
import { TrashIcon, UserIcon, MapPinIcon, CheckCircleIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { FounderDetailsPanel } from './FounderDetailsPanel';
import { GLOBAL_CITIES } from '../utils/globalCities';

const dealTypeCategories = ['Funding', 'Investment', 'Funding Round', 'Seed/Series A', 'Series B', 'Series C', 'IPO', 'Acquisition'];

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

// Generate fake founder data with city information (same as DealPipeline)
const generateFakeFounders = (deals) => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Drew', 'Blake', 'Sage', 'Cameron'];
  const lastNames = ['Chen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Garcia', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

  return deals.map((deal) => ({
    ...deal,
    founders: deal.founders || (() => {
      const founderCount = Math.floor(Math.random() * 4) + 1; // 1-4 founders
      const founders = [];
      for (let i = 0; i < founderCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const city = GLOBAL_CITIES[Math.floor(Math.random() * GLOBAL_CITIES.length)];
        const title = FOUNDER_TITLES[Math.floor(Math.random() * FOUNDER_TITLES.length)];

        founders.push({
          id: `founder-${deal.id}-${i}`,
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
    })()
  }));
};

export default function DealDiscovery({ deals, onSearchSubmit }) {
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealTypes, setSelectedDealTypes] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [deletedDealIds, setDeletedDealIds] = useState(() => {
    try {
      const saved = localStorage.getItem('vc-deleted-deals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [displayedCount, setDisplayedCount] = useState(30);
  const [selectedFounder, setSelectedFounder] = useState(null);

  const deleteDeal = (dealId) => {
    const updated = [...deletedDealIds, dealId];
    setDeletedDealIds(updated);
    // Persist deleted deals
    try {
      localStorage.setItem('vc-deleted-deals', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving deleted deals:', error);
    }
  };

  const undoDeleteDeal = (dealId) => {
    setDeletedDealIds(deletedDealIds.filter(id => id !== dealId));
  };

  useEffect(() => {
    if (!deals) {
      setFilteredDeals([]);
      return;
    }

    // Add fake founder data to deals
    let dealsWithFounders = generateFakeFounders(deals);
    let filtered = dealsWithFounders.filter(deal => !deletedDealIds.includes(deal.id));

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.data?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.data?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply deal type filter
    if (selectedDealTypes.length > 0) {
      filtered = filtered.filter(deal =>
        selectedDealTypes.includes(deal.funding_type)
      );
    }

    setFilteredDeals(filtered);
  }, [deals, searchQuery, selectedDealTypes, deletedDealIds]);

  const toggleDealType = (type) => {
    const updated = selectedDealTypes.includes(type)
      ? selectedDealTypes.filter(t => t !== type)
      : [...selectedDealTypes, type];
    setSelectedDealTypes(updated);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDealTypes([]);
  };

  const handleSearchWheel = (e) => {
    // Allow scrolling through the search input
    // Find the scrollable parent container (main element in App.jsx)
    let scrollableParent = e.currentTarget.closest('main');
    if (scrollableParent && scrollableParent.scrollHeight > scrollableParent.clientHeight) {
      scrollableParent.scrollTop += e.deltaY;
    }
  };

  if (!deals || deals.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">No deals loaded</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search deals by company or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim() && onSearchSubmit) {
                onSearchSubmit(e.target.value);
              }
            }}
            onWheel={handleSearchWheel}
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <svg className="absolute right-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors"
          >
            Deal Type Filter ▼
          </button>

          {selectedDealTypes.length > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Deal type checkboxes */}
        {showFilter && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-700 rounded-lg border border-slate-600">
            {dealTypeCategories.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDealTypes.includes(type)}
                  onChange={() => toggleDealType(type)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-slate-200">{type}</span>
              </label>
            ))}
          </div>
        )}

        {/* Active filters display */}
        {selectedDealTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDealTypes.map(type => (
              <span key={type} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
                {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No deals found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.slice(0, displayedCount).map((deal) => (
            <div
              key={deal.id}
              className="card hover:border-gray-600 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg">{deal.company_name}</h3>
                  {deal.data?.title && (
                    <p className="text-sm text-gray-400 mt-1">{deal.data.title}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                    deal.funding_type?.includes('Series A') ? 'bg-yellow-900 text-yellow-200' :
                    deal.funding_type?.includes('Series B') ? 'bg-orange-900 text-orange-200' :
                    deal.funding_type?.includes('Series C') ? 'bg-red-900 text-red-200' :
                    deal.funding_type?.includes('Acquisition') ? 'bg-purple-900 text-purple-200' :
                    deal.funding_type?.includes('IPO') ? 'bg-green-900 text-green-200' :
                    'bg-blue-900 text-blue-200'
                  }`}>
                    {deal.funding_type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteDeal(deal.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-900/20 transition-colors text-slate-400 hover:text-red-400"
                    title="Remove from pipeline"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {deal.data?.description && (
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{deal.data.description}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                {deal.data?.source && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                    {deal.data.source}
                  </span>
                )}
                {deal.source && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                    {deal.source}
                  </span>
                )}
                {deal.data?.publishedAt && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    {new Date(deal.data.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Founders section */}
              {deal.founders && deal.founders.length > 0 && (
                <div className="mt-3 space-y-2 text-xs">
                  {deal.founders.map((founder, idx) => (
                    <button
                      key={founder.id}
                      onClick={() => setSelectedFounder(founder)}
                      className="block w-full text-left p-2 rounded hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold">
                          <UserIcon className="w-4 h-4" />
                          <span>{founder.name}</span>
                        </div>
                        {founder.founderScore && (
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            founder.founderScore >= 80 ? 'bg-green-900 text-green-200' :
                            founder.founderScore >= 60 ? 'bg-blue-900 text-blue-200' :
                            founder.founderScore >= 40 ? 'bg-yellow-900 text-yellow-200' :
                            'bg-orange-900 text-orange-200'
                          }`}>
                            Score: {founder.founderScore}
                          </span>
                        )}
                      </div>
                      {founder.title && (
                        <div className="text-amber-300 mt-0.5">{founder.title}</div>
                      )}
                      {founder.city && (
                        <div className="text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          <span>{founder.city}</span>
                        </div>
                      )}
                      {founder.investmentTrack && (
                        <div className="mt-1 flex gap-3 text-gray-300 text-xs">
                          {founder.investmentTrack.exits > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              {founder.investmentTrack.exits} exits
                            </span>
                          )}
                          {founder.investmentTrack.averageROI && (
                            <span className={`flex items-center gap-1 ${founder.investmentTrack.averageROI >= 1000 ? 'text-green-400 font-semibold' : ''}`}>
                              <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                              {founder.investmentTrack.averageROI.toLocaleString()}% ROI
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {deal.data?.url && (
                <a
                  href={deal.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read more →
                </a>
              )}
            </div>
          ))}

          {displayedCount < filteredDeals.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDisplayedCount(prev => prev + 30)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded font-semibold transition-colors"
              >
                Load More ({filteredDeals.length - displayedCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Founder Details Sidebar */}
      <FounderDetailsPanel
        founderId={selectedFounder?.id}
        founderData={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />

      {/* Click outside to close founder panel */}
      {selectedFounder && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedFounder(null)}
        />
      )}
    </div>
  );
}
