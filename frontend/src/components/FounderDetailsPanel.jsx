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
      setLoading(true);
      setFounder(null);
      const response = await fetch(`/api/founders/${founderId}`);
      if (!response.ok) {
        console.error('Founder not found:', response.status);
        setFounder(null);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setFounder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching founder details:', error);
      setFounder(null);
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 0a10.664 10.664 0 00-9.5-5.5" />
                  </svg>
                  Twitter
                </a>
              )}
              {founder.social?.linkedin && (
                <a href={founder.social.linkedin} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {founder.social?.angellist && (
                <a href={founder.social.angellist} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                  AngelList
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
          {founder.investmentTrack && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Investment Track Record</h3>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• {founder.investmentTrack.exits} successful exits</li>
                <li>• {founder.investmentTrack.averageROI}% average ROI</li>
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
