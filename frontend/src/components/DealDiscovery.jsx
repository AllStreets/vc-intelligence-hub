import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const dealTypeCategories = ['Funding', 'Investment', 'Funding Round', 'Seed/Series A', 'Series B', 'Series C', 'IPO', 'Acquisition'];

export default function DealDiscovery({ deals }) {
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealTypes, setSelectedDealTypes] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [deletedDealIds, setDeletedDealIds] = useState([]);

  const deleteDeal = (dealId) => {
    setDeletedDealIds([...deletedDealIds, dealId]);
  };

  const undoDeleteDeal = (dealId) => {
    setDeletedDealIds(deletedDealIds.filter(id => id !== dealId));
  };

  useEffect(() => {
    if (!deals) {
      setFilteredDeals([]);
      return;
    }

    let filtered = deals.filter(deal => !deletedDealIds.includes(deal.id));

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
          {filteredDeals.slice(0, 30).map((deal) => (
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
                    onClick={() => deleteDeal(deal.id)}
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

          {filteredDeals.length > 30 && (
            <p className="text-center text-gray-500 py-4 text-sm">
              Showing 30 of {filteredDeals.length} deals
            </p>
          )}
        </div>
      )}
    </div>
  );
}
