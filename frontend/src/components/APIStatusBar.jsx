export default function APIStatusBar({ status, isCollapsed = false }) {
  const apis = status.apis || {}
  const activePlugins = status.activePlugins || []
  const totalTrends = status.totalTrends || 0

  // Plugins that require API keys
  const requiresApiKey = {
    newsapi: 'NewsAPI',
    serper: 'Serper',
    github: 'GitHub',
    angellist: 'AngelList',
    twitter: 'Twitter'
  }

  const getTrendColor = (config) => {
    if (!config.enabled) return 'bg-gray-800 text-gray-400'
    // Plugins with API keys and returning data = green
    if (config.hasApiKey && config.dataAvailable) return 'bg-green-900 text-green-200'
    // Plugins needing API keys but no key = yellow
    if (requiresApiKey[config.name?.toLowerCase()] && !config.hasApiKey) return 'bg-yellow-900 text-yellow-200'
    // Free plugins with data = green
    if (config.dataAvailable) return 'bg-green-900 text-green-200'
    // Enabled but no data yet = yellow
    return 'bg-yellow-900 text-yellow-200'
  }

  const getTitle = (name, config) => {
    if (!config.enabled) return 'Disabled'
    if (config.dataAvailable) {
      return `Active - ${config.itemCount || 0} items | ${config.hasApiKey ? 'API Key configured' : 'No API key needed'}`
    }
    if (requiresApiKey[name]) {
      return `${requiresApiKey[name]} API key needed - configure in backend/.env`
    }
    return 'Active (no API key needed)'
  }

  const getIndicatorColor = (config) => {
    if (!config.enabled) return '#6b7280' // Gray
    if (config.dataAvailable && config.hasApiKey) return '#22c55e' // Green
    if (config.dataAvailable) return '#22c55e' // Green (free plugin)
    if (requiresApiKey[config.name?.toLowerCase()] && !config.hasApiKey) return '#eab308' // Yellow
    return '#eab308' // Yellow (waiting for data)
  }

  return (
    <div>
      <p className="text-xs text-slate-400 font-semibold">
        DATA SOURCES ({activePlugins.length} active, {totalTrends} total trends):
      </p>
      {!isCollapsed && (
        <>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(apis).map(([name, config]) => (
              <div
                key={name}
                className={`status-badge px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${getTrendColor(config)}`}
                title={getTitle(name, config)}
              >
                <span
                  className="status-indicator mr-2 inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getIndicatorColor(config) }}
                ></span>
                {name.replace('_', ' ')}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Green = data available | Yellow = needs API key or waiting | Gray = disabled</p>
        </>
      )}
    </div>
  )
}
