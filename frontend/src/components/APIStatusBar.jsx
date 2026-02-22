export default function APIStatusBar({ status }) {
  const apis = status.apis || {}
  const activePlugins = status.activePlugins || []

  // Plugins that require API keys
  const requiresApiKey = {
    newsapi: 'NewsAPI Key',
    serper: 'Serper Key',
    github: 'GitHub Token',
    angellist: 'AngelList Key',
    twitter: 'Twitter Bearer'
  }

  const getTrendColor = (name, enabled) => {
    if (!enabled) return 'bg-gray-800 text-gray-400'
    // Plugins that need API keys show yellow if enabled (might not have key)
    if (requiresApiKey[name]) return 'bg-yellow-900 text-yellow-200'
    // Free plugins show green if enabled
    return 'bg-green-900 text-green-200'
  }

  const getTitle = (name, enabled) => {
    if (!enabled) return 'Disabled'
    if (requiresApiKey[name]) return `${requiresApiKey[name]} - configure in .env`
    return 'Active (no API key needed)'
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2 font-semibold">DATA SOURCES ({activePlugins.length} active):</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(apis).map(([name, config]) => (
          <div
            key={name}
            className={`status-badge px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${getTrendColor(name, config.enabled)}`}
            title={getTitle(name, config.enabled)}
          >
            <span className="status-indicator mr-2 inline-block w-1.5 h-1.5 rounded-full" style={{
              backgroundColor: !config.enabled ? '#6b7280' : (requiresApiKey[name] ? '#eab308' : '#22c55e')
            }}></span>
            {name.replace('_', ' ')}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Yellow = needs API key | Green = active | Gray = disabled</p>
    </div>
  )
}
