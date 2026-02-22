import { useState, useEffect } from 'react';

export function FounderDetailsPanel({ founderId, onClose }) {
  const [founder, setFounder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!founderId) return;

    fetchFounderDetails();
  }, [founderId]);

  const fetchFounderDetails = async () => {
    try {
      const response = await fetch(`/api/founders/${founderId}`);
      const data = await response.json();
      setFounder(data);
    } catch (error) {
      console.error('Error fetching founder details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!founderId) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 shadow-xl z-50 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
      >
        ×
      </button>

      {loading ? (
        <div className="p-6 text-center">Loading founder details...</div>
      ) : founder ? (
        <div className="p-6 space-y-4">
          {/* Founder image/avatar */}
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {founder.name.charAt(0)}
          </div>

          {/* Basic info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{founder.name}</h2>
            <p className="text-slate-400">{founder.title}</p>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Sectors</h3>
            <div className="flex flex-wrap gap-2">
              {founder.sectors?.map(sector => (
                <span key={sector} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                  {sector}
                </span>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Links</h3>
            <div className="space-y-2">
              {founder.social?.twitter && (
                <a href={founder.social.twitter} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                  🐦 Twitter
                </a>
              )}
              {founder.social?.linkedin && (
                <a href={founder.social.linkedin} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                  💼 LinkedIn
                </a>
              )}
              {founder.social?.angellist && (
                <a href={founder.social.angellist} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                  📊 AngelList
                </a>
              )}
            </div>
          </div>

          {/* Past companies */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Past Companies</h3>
            <ul className="space-y-1 text-sm text-slate-300">
              {founder.pastCompanies?.map((company, idx) => (
                <li key={idx}>• {company}</li>
              ))}
            </ul>
          </div>

          {/* Investment track record */}
          {founder.investmentTrackRecord && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Investment Track Record</h3>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• {founder.investmentTrackRecord.exits} successful exits</li>
                <li>• ${founder.investmentTrackRecord.distributions}M in distributions</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-slate-400">Founder not found</div>
      )}
    </div>
  );
}
