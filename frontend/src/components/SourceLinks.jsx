import {
  CodeBracketIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  LightBulbIcon,
  DocumentChartBarIcon,
  XMarkIcon
} from '@heroicons/react/20/solid';

export function SourceLinks({ sources }) {
  if (!sources || sources.length === 0) return null;

  const getSourceIcon = (sourceName) => {
    const name = sourceName.toLowerCase().replace(/plugin|plugin\s/, '').trim();

    const iconMap = {
      'github': <CodeBracketIcon className="w-4 h-4" />,
      'newsapi': <NewspaperIcon className="w-4 h-4" />,
      'serper': <MagnifyingGlassIcon className="w-4 h-4" />,
      'hackernews': <LinkIcon className="w-4 h-4" />,
      'yc scraper': <LightBulbIcon className="w-4 h-4" />,
      'yc': <LightBulbIcon className="w-4 h-4" />,
      'sec edgar': <DocumentChartBarIcon className="w-4 h-4" />,
      'secedgar': <DocumentChartBarIcon className="w-4 h-4" />,
      'twitter': <XMarkIcon className="w-4 h-4" />,
      'angellist': <LinkIcon className="w-4 h-4" />
    };

    return iconMap[name] || <LinkIcon className="w-4 h-4" />;
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 hover:text-slate-100 transition-colors"
          >
            <span className="text-slate-400 hover:text-slate-200 transition-colors">{getSourceIcon(source.name)}</span>
            <span>{source.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
