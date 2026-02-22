import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

export function WatchlistManager() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/watchlist`);
      const data = await response.json();
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (trendId, newRating) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/watchlist/${trendId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating })
      });
      const updated = await response.json();

      setWatchlist(prev => prev.map(item =>
        item.trend_id === trendId ? { ...item, rating: newRating } : item
      ));
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const removeFromWatchlist = async (trendId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${baseUrl}/api/watchlist/${trendId}`, { method: 'DELETE' });
      setWatchlist(prev => prev.filter(item => item.trend_id !== trendId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading watchlist...</p>;
  }

  if (watchlist.length === 0) {
    return <p className="text-slate-400">No trends in watchlist</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {watchlist.map(item => (
        <div key={item.trend_id} className="bg-dark-700 rounded-lg p-4 border border-dark-600">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-white">{item.trend_name}</h4>
              <p className="text-xs text-slate-400 capitalize">{item.trend_category?.replace('-', ' ')}</p>
            </div>
            <button
              onClick={() => removeFromWatchlist(item.trend_id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

          {/* Star rating */}
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => updateRating(item.trend_id, star)}
                className="transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`w-4 h-4 ${
                    star <= (item.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-dark-500'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-xs text-slate-400 italic">{item.notes}</p>
          )}

          <p className="text-xs text-slate-500 mt-2">Added {new Date(item.added_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
