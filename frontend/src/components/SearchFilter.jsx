import { useState } from 'react';

const CATEGORIES = [
  'AI/ML', 'Fintech', 'Climate', 'Healthcare', 'Cybersecurity',
  'Web3', 'SaaS', 'EdTech', 'Biotech', 'Enterprise'
];

export function SearchFilter({ onSearch, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const toggleCategory = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    onSearch('');
    onFilterChange([]);
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search trends..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <svg className="absolute right-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filter dropdown */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors"
        >
          Category Filter ▼
        </button>

        {selectedCategories.length > 0 && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Category checkboxes */}
      {showCategoryDropdown && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-700 rounded-lg border border-slate-600">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-200">{category}</span>
            </label>
          ))}
        </div>
      )}

      {/* Active filters display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(cat => (
            <span key={cat} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded-full">
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
