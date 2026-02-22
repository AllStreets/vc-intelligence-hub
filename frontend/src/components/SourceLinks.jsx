export function SourceLinks({ sources }) {
  if (!sources || sources.length === 0) return null;

  const getSourceIcon = (sourceName) => {
    const icons = {
      'github': '🐱',
      'newsapi': '📰',
      'serper': '🔍',
      'hackernews': '🔗',
      'yc scraper': '🚀',
      'yc': '🚀',
      'sec edgar': '📊',
      'secedgar': '📊',
      'twitter': '𝕏'
    };
    const key = sourceName.toLowerCase().replace(/plugin|plugin\s/, '').trim();
    return icons[key] || '📌';
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <p className="text-xs text-slate-400 mb-2">Sources:</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>{getSourceIcon(source.name)}</span>
            <span>{source.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
