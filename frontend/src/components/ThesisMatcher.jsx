import { useState, useMemo, memo, useEffect } from 'react';

const ThesisMatcher = memo(function ThesisMatcher({ trends, deals }) {
  const [thesis, setThesis] = useState({
    sectors: [],
    stages: [],
    minMomentum: 50,
    minExits: 0,
    minROI: 0
  });

  const [thesisText, setThesisText] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [results, setResults] = useState([]);

  // Load saved thesis from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vc-investment-thesis');
    if (saved) {
      setThesisText(saved);
    }
  }, []);

  // Auto-save thesis text to localStorage with debouncing
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (thesisText.trim()) {
        localStorage.setItem('vc-investment-thesis', thesisText);
        setIsSaved(true);

        // Also save to thesis presets
        try {
          const presets = JSON.parse(localStorage.getItem('vc-thesis-presets') || '[]');
          const newPreset = {
            id: Date.now(),
            text: thesisText,
            timestamp: new Date().toISOString()
          };
          // Keep only last 20 presets
          const updated = [newPreset, ...presets].slice(0, 20);
          localStorage.setItem('vc-thesis-presets', JSON.stringify(updated));
        } catch (err) {
          console.error('Error saving thesis preset:', err);
        }
      }
    }, 1000); // Auto-save after 1 second of inactivity

    if (thesisText.trim() && isSaved) {
      setIsSaved(true);
    } else if (thesisText.trim()) {
      setIsSaved(false);
    }

    return () => clearTimeout(saveTimer);
  }, [thesisText]);

  const allSectors = ['AI/ML', 'Fintech', 'Climate', 'Healthcare', 'Cybersecurity', 'Web3', 'SaaS', 'EdTech', 'Biotech', 'Enterprise'];
  const allStages = ['Seed', 'Series A', 'Series B', 'Series C', 'IPO'];

  // Score trends/deals against thesis
  const scoreOpportunity = (item) => {
    const reasons = [];

    // If sectors are selected, item must match at least one
    if (thesis.sectors.length > 0) {
      const itemSector = item.category?.replace('-', ' ') || item.funding_type;
      if (!thesis.sectors.includes(itemSector)) {
        return { percentage: 0, reasons: [] }; // Filter out non-matching sectors
      }
      reasons.push(`✓ ${itemSector}`);
    }

    // If stages are selected, item must match at least one
    if (thesis.stages.length > 0) {
      const stageMatch = thesis.stages.some(stage => item.funding_type?.includes(stage));
      if (!stageMatch) {
        return { percentage: 0, reasons: [] }; // Filter out non-matching stages
      }
      reasons.push(`✓ ${item.funding_type}`);
    }

    // Check momentum threshold
    let matches = 0;
    let totalCriteria = 0;

    if (thesis.minMomentum > 0) {
      totalCriteria++;
      const momentum = Math.min(100, item.momentum_score * 2);
      if (momentum >= thesis.minMomentum) {
        matches++;
        reasons.push(`✓ Momentum: ${momentum.toFixed(0)}`);
      } else {
        reasons.push(`✗ Momentum: ${momentum.toFixed(0)}`);
      }
    }

    // Check founder quality
    if ((thesis.minExits > 0 || thesis.minROI > 0) && item.founders?.length > 0) {
      const topFounder = item.founders[0];
      if (topFounder.investmentTrack) {
        if (thesis.minExits > 0) {
          totalCriteria++;
          if (topFounder.investmentTrack.exits >= thesis.minExits) {
            matches++;
            reasons.push(`✓ ${topFounder.investmentTrack.exits} exits`);
          }
        }
        if (thesis.minROI > 0) {
          totalCriteria++;
          if (topFounder.investmentTrack.averageROI >= thesis.minROI) {
            matches++;
            reasons.push(`✓ ${topFounder.investmentTrack.averageROI}% ROI`);
          }
        }
      }
    }

    // If no criteria set, show all items with high score
    if (thesis.sectors.length === 0 && thesis.stages.length === 0 && thesis.minMomentum === 0 && thesis.minExits === 0 && thesis.minROI === 0) {
      return { percentage: 80, reasons: ['No filters applied'] };
    }

    // Calculate percentage based on momentum/founder criteria only
    const percentage = totalCriteria > 0 ? Math.round((matches / totalCriteria) * 100) : 80;

    return { percentage, reasons: reasons.slice(0, 3) };
  };

  // Update results when thesis or data changes
  useMemo(() => {
    const allItems = [...(trends || []), ...(deals || [])];
    const scored = allItems.map(item => ({
      ...item,
      match: scoreOpportunity(item)
    })).sort((a, b) => b.match.percentage - a.match.percentage);

    setResults(scored);
  }, [thesis, trends, deals]);

  const toggleSector = (sector) => {
    setThesis(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const toggleStage = (stage) => {
    setThesis(prev => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage]
    }));
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-amber-900 text-amber-200';
    if (percentage >= 60) return 'bg-amber-900/50 text-amber-200';
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Preference Panel */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-amber-400">Set Your Investment Thesis</h3>
          {!isSaved && <span className="text-xs text-amber-300">Saving...</span>}
          {isSaved && thesisText.trim() && <span className="text-xs text-emerald-400">✓ Saved</span>}
        </div>

        {/* Thesis Statement */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Your Investment Thesis</label>
          <div className="border border-dark-500 rounded-lg p-4">
<textarea
            value={thesisText}
            onChange={(e) => {
              setThesisText(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Describe your investment thesis, key focus areas, and long-term strategy..."
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm h-24 resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">This will be saved automatically</p>
          </div>
        </div>

        {/* Sectors */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Target Sectors</label>
          <div className="border border-dark-500 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {allSectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    thesis.sectors.includes(sector)
                      ? 'bg-amber-600 text-white'
                      : 'bg-dark-600 text-slate-400 hover:bg-dark-500'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Funding Stages</label>
          <div className="border border-dark-500 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-2">
              {allStages.map(stage => (
                <button
                  key={stage}
                  onClick={() => toggleStage(stage)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    thesis.stages.includes(stage)
                      ? 'bg-amber-600 text-white'
                      : 'bg-dark-600 text-slate-400 hover:bg-dark-500'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Momentum Threshold */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Min Momentum: {thesis.minMomentum}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={thesis.minMomentum}
            onChange={(e) => setThesis(prev => ({ ...prev, minMomentum: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>

        {/* Founder Quality */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Min Exits: {thesis.minExits}</label>
            <input
              type="range"
              min="0"
              max="10"
              value={thesis.minExits}
              onChange={(e) => setThesis(prev => ({ ...prev, minExits: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Min ROI: {thesis.minROI}%</label>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              value={thesis.minROI}
              onChange={(e) => setThesis(prev => ({ ...prev, minROI: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Matching Opportunities ({results.filter(r => r.match.percentage >= 60).length})</h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.slice(0, 20).map(item => (
            <a
              key={item.id}
              href={item.sources?.[0]?.url || item.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded flex justify-between items-center cursor-pointer transition-transform hover:scale-105 ${getMatchColor(item.match.percentage)}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.company_name || item.name}</p>
                <p className="text-xs opacity-80 line-clamp-2">{item.match.reasons.join(' • ')}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <span className="font-bold text-lg">{item.match.percentage}%</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});

export { ThesisMatcher };
