import { useState, useMemo, memo, useEffect } from 'react';
import { parseThesis } from '../utils/thesisParser';

// Map backend category values to frontend display names
const backendToFrontendCategory = {
  'ai-ml': 'AI/ML',
  'fintech': 'Fintech',
  'climate': 'Climate',
  'healthcare': 'Healthcare',
  'cybersecurity': 'Cybersecurity',
  'web3-crypto': 'Web3',
  'saas': 'SaaS',
  'edtech': 'EdTech',
  'biotech': 'Biotech',
  'enterprise': 'Enterprise'
};

// Type detection helpers
const OpportunityType = {
  TREND: 'trend',
  DEAL: 'deal'
};

const getOpportunityType = (item) => {
  if (item.momentum_score !== undefined) return OpportunityType.TREND;
  if (item.funding_type !== undefined) return OpportunityType.DEAL;
  return OpportunityType.TREND;
};

const getOpportunityName = (item) => item.company_name || item.name;

const getOpportunitySector = (item) => {
  const category = item.category;
  return backendToFrontendCategory[category] || category;
};

const hasStageInfo = (item) => !!item.funding_type;

const hasMomentumInfo = (item) => item.momentum_score !== undefined;

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
  const [manuallySetSectors, setManuallySetSectors] = useState(false);
  const [manuallySetStages, setManuallySetStages] = useState(false);

  // Load saved thesis from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vc-investment-thesis');
    if (saved) {
      setThesisText(saved);
    }
  }, []);

  // Load momentum threshold from Settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('vc-momentum-threshold');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        if (preferences.defaultMomentumThreshold !== undefined) {
          setThesis(prev => ({
            ...prev,
            minMomentum: preferences.defaultMomentumThreshold
          }));
        }
      } catch (err) {
        console.error('Error loading momentum threshold:', err);
      }
    }
  }, []);

  // Auto-toggle sectors/stages based on parsed thesis
  useEffect(() => {
    if (thesisText.trim() && !manuallySetSectors && !manuallySetStages) {
      const parsed = parseThesis(thesisText);
      if (parsed.sectors.length > 0 || parsed.stages.length > 0) {
        setThesis(prev => ({
          ...prev,
          sectors: parsed.sectors.length > 0 ? parsed.sectors : prev.sectors,
          stages: parsed.stages.length > 0 ? parsed.stages : prev.stages
        }));
      }
    }
  }, [thesisText, manuallySetSectors, manuallySetStages]);

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
    const oppType = getOpportunityType(item);
    const parsedThesis = thesisText.trim()
      ? parseThesis(thesisText)
      : { sectors: [], stages: [], keywords: [], confidence: 0 };

    // HARD FILTER: Sectors (applies to both if they have category info)
    if (thesis.sectors.length > 0) {
      const itemSector = getOpportunitySector(item);
      // Only filter by sector if item has category (trends do, deals might not)
      if (itemSector) {
        if (!thesis.sectors.includes(itemSector)) {
          return { percentage: 0, reasons: [], oppType };
        }
        reasons.push(`✓ ${itemSector}`);
      }
      // If item has no category, don't filter it out by sector
    }

    // HARD FILTER: Stages (ONLY for deals)
    if (thesis.stages.length > 0) {
      if (oppType === OpportunityType.DEAL) {
        if (!hasStageInfo(item)) {
          return { percentage: 0, reasons: [], oppType };
        }
        const stageMatch = thesis.stages.some(stage =>
          item.funding_type?.includes(stage)
        );
        if (!stageMatch) {
          return { percentage: 0, reasons: [], oppType };
        }
        reasons.push(`✓ ${item.funding_type}`);
      }
      // Trends: Skip stage filter entirely
    }

    // SOFT SCORING: Momentum (ONLY for trends)
    let matches = 0;
    let totalCriteria = 0;

    if (thesis.minMomentum > 0 && oppType === OpportunityType.TREND) {
      if (hasMomentumInfo(item)) {
        totalCriteria++;
        const momentum = Math.min(100, item.momentum_score * 2);
        if (momentum >= thesis.minMomentum) {
          matches++;
          reasons.push(`✓ Momentum: ${momentum.toFixed(0)}`);
        } else {
          reasons.push(`✗ Momentum: ${momentum.toFixed(0)}`);
        }
      }
    }

    // SOFT SCORING: Founder quality (for trends)
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

    // SOFT SCORING: Keyword matching (optional - doesn't penalize if no match)
    if (parsedThesis.keywords.length > 0) {
      const itemText = (getOpportunityName(item) + ' ' +
                       (item.data?.description || '') + ' ' +
                       (item.data?.title || '')).toLowerCase();

      const keywordMatches = parsedThesis.keywords.filter(kw =>
        itemText.includes(kw.toLowerCase())
      );

      if (keywordMatches.length > 0) {
        totalCriteria++;
        matches++;
        reasons.push(`✓ Keywords: ${keywordMatches.slice(0, 2).join(', ')}`);
      }
    }

    // Handle no-criteria case
    if (thesis.sectors.length === 0 && thesis.stages.length === 0 &&
        thesis.minMomentum === 0 && thesis.minExits === 0 && thesis.minROI === 0) {
      return { percentage: 80, reasons: ['No filters applied'], oppType };
    }

    // Calculate percentage
    const percentage = totalCriteria > 0
      ? Math.round((matches / totalCriteria) * 100)
      : (reasons.length > 0 ? 80 : 0);

    return { percentage, reasons: reasons.slice(0, 3), oppType };
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
    setManuallySetSectors(true);
    setThesis(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const toggleStage = (stage) => {
    setManuallySetStages(true);
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
          {thesisText.trim() && (() => {
            const parsed = parseThesis(thesisText);
            return parsed.confidence > 0 && (
              <div className="mt-3 p-3 bg-dark-600 rounded border border-dark-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    AI Understanding: {parsed.confidence}%
                  </span>
                  <div className="w-32 h-1.5 bg-dark-500 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${parsed.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  {parsed.sectors.length > 0 && (
                    <div>Detected sectors: {parsed.sectors.join(', ')}</div>
                  )}
                  {parsed.stages.length > 0 && (
                    <div>Detected stages: {parsed.stages.join(', ')}</div>
                  )}
                  {parsed.keywords.length > 0 && (
                    <div>Key terms: {parsed.keywords.slice(0, 5).join(', ')}</div>
                  )}
                </div>
              </div>
            );
          })()}
          </div>
        </div>

        {/* Sectors */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-slate-300">Target Sectors</label>
            {(thesis.sectors.length > 0 || thesis.stages.length > 0) && (
              <button
                onClick={() => {
                  setThesis(prev => ({ ...prev, sectors: [], stages: [] }));
                  setManuallySetSectors(false);
                  setManuallySetStages(false);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
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
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{getOpportunityName(item)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.match.oppType === OpportunityType.DEAL
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-purple-900 text-purple-200'
                  }`}>
                    {item.match.oppType === OpportunityType.DEAL ? 'DEAL' : 'TREND'}
                  </span>
                </div>
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
