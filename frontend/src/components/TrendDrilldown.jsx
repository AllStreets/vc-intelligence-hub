export default function TrendDrilldown({ trend }) {
  if (!trend) return null

  const scoreBreakdown = [
    { label: 'Momentum Score', value: trend.momentum_score, max: 100 },
  ]

  return (
    <div className="space-y-4 sticky top-32">
      {/* Main Details Card */}
      <div className="card">
        <h3 className="card-header">Trend Details</h3>

        <div className="space-y-4">
          {/* Score */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">MOMENTUM SCORE</p>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold text-blue-400">{trend.momentum_score}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded transition-all"
                    style={{ width: `${trend.momentum_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">LIFECYCLE</p>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${
              trend.lifecycle === 'peak' ? 'bg-green-900 text-green-200' :
              trend.lifecycle === 'emerging' ? 'bg-blue-900 text-blue-200' :
              trend.lifecycle === 'established' ? 'bg-gray-700 text-gray-200' :
              'bg-red-900 text-red-200'
            }`}>
              {trend.lifecycle}
            </div>
          </div>

          {/* Confidence */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">CONFIDENCE</p>
            <p className="text-lg font-semibold capitalize text-gray-100">{trend.confidence}</p>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">CATEGORY</p>
            <p className="text-lg font-semibold capitalize text-gray-100">
              {trend.category?.replace('-', ' ')}
            </p>
          </div>

          {/* Mention Count */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">MENTIONS</p>
            <p className="text-2xl font-bold text-orange-400">{trend.mention_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Sources Card */}
      {trend.sources && trend.sources.length > 0 && (
        <div className="card">
          <h4 className="card-header">Data Sources</h4>
          <div className="space-y-2">
            {trend.sources.map((source, idx) => (
              <div key={`${source.name}-${idx}`} className="flex items-center gap-2 p-2 bg-dark-900 rounded">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-300">{source.name}</p>
                  <p className="text-xs text-gray-500">{source.mention_count} mentions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data Card */}
      {trend.data && (
        <div className="card">
          <h4 className="card-header">Raw Data</h4>
          <div className="bg-dark-900 rounded p-3 text-xs font-mono text-gray-400 overflow-auto max-h-64">
            {Object.entries(trend.data).map(([key, value]) => (
              <div key={key} className="py-1">
                <span className="text-gray-500">{key}:</span>
                {' '}
                <span className="text-blue-400">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
