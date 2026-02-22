import { useState, useEffect } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export function Settings() {
  const [preferences, setPreferences] = useState({
    defaultMomentumThreshold: 50
  });
  const [systemInfo, setSystemInfo] = useState({});
  const [savedSearches, setSavedSearches] = useState([]);
  const [thesisPresets, setThesisPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${baseUrl}/api/user/preferences`);
        const data = await response.json();
        setPreferences(data || {});
      } catch (err) {
        // API may not exist yet, use defaults
      }

      try {
        // Fetch saved searches
        const searchResponse = await fetch(`${baseUrl}/api/saved-searches`);
        setSavedSearches(await searchResponse.json());
      } catch (err) {
        setSavedSearches([]);
      }

      try {
        // Fetch thesis presets
        const thesisResponse = await fetch(`${baseUrl}/api/saved-thesis`);
        setThesisPresets(await thesisResponse.json());
      } catch (err) {
        setThesisPresets([]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/api-status`);
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${baseUrl}/api/user/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs)
      });
      setPreferences(newPrefs);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-400 mb-4">SETTINGS</h1>
        <p className="text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-400 mb-8">SETTINGS</h1>

      {/* Display Preferences */}
      <div className="space-y-6">
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5" /> Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Default Momentum Threshold: {preferences.defaultMomentumThreshold}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.defaultMomentumThreshold}
                onChange={(e) => updatePreferences({ ...preferences, defaultMomentumThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Saved Searches */}
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Saved Searches</h2>

          {savedSearches.length === 0 ? (
            <p className="text-slate-400 text-sm">No saved searches yet</p>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((search, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-dark-600 rounded">
                  <span className="text-slate-300">{search.name}</span>
                  <button className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Investment Thesis Presets */}
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Investment Thesis Presets</h2>

          {thesisPresets.length === 0 ? (
            <p className="text-slate-400 text-sm">No thesis presets yet</p>
          ) : (
            <div className="space-y-2">
              {thesisPresets.map((thesis, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-dark-600 rounded">
                  <span className="text-slate-300">{thesis.name}</span>
                  <button className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* System Information */}
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4">System Information</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Data Sources Active</p>
              <p className="text-white font-semibold">{systemInfo.activePlugins?.length || 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Trends Loaded</p>
              <p className="text-white font-semibold">{systemInfo.totalTrends || 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Last Updated</p>
              <p className="text-white font-semibold">
                {systemInfo.timestamp ? new Date(systemInfo.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Database Status</p>
              <p className="text-green-400 font-semibold">Connected</p>
            </div>
          </div>

          {/* Data Sources Detail */}
          <div className="mt-6">
            <p className="text-slate-400 text-sm mb-3">Data Sources:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(systemInfo.apis || {}).map(([name, config]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    config.enabled && config.dataAvailable ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-slate-300 capitalize">{name.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
