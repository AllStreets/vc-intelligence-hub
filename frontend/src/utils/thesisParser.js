const STAGE_PATTERNS = {
  'Seed': /\b(seed|pre-seed|pre seed)\b/i,
  'Series A': /\b(series\s*a|seriesa|ser\s*a)\b/i,
  'Series B': /\b(series\s*b|seriesb|ser\s*b)\b/i,
  'Series C': /\b(series\s*c|seriesc|ser\s*c)\b/i,
  'IPO': /\b(ipo|initial public offering|going public)\b/i
};

const SECTOR_KEYWORDS = {
  'AI/ML': ['ai', 'ml', 'machine learning', 'artificial intelligence'],
  'Fintech': ['fintech', 'finance', 'financial', 'payments'],
  'Climate': ['climate', 'cleantech', 'sustainability', 'renewable'],
  'Healthcare': ['healthcare', 'health', 'medtech', 'biotech'],
  'Cybersecurity': ['cybersecurity', 'security', 'infosec'],
  'Web3': ['web3', 'crypto', 'blockchain', 'defi'],
  'SaaS': ['saas', 'software', 'b2b software'],
  'EdTech': ['edtech', 'education', 'learning'],
  'Biotech': ['biotech', 'biology', 'life sciences'],
  'Enterprise': ['enterprise', 'b2b', 'business software']
};

export function parseThesis(thesisText) {
  if (!thesisText?.trim()) {
    return { sectors: [], stages: [], keywords: [], confidence: 0 };
  }

  const text = thesisText.toLowerCase();
  const parsed = { sectors: [], stages: [], keywords: [], confidence: 0 };

  // Extract stages using regex patterns
  for (const [stage, pattern] of Object.entries(STAGE_PATTERNS)) {
    if (pattern.test(text)) {
      parsed.stages.push(stage);
    }
  }

  // Extract sectors by keyword matching
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    const matches = keywords.some(kw => {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
    if (matches) {
      parsed.sectors.push(sector);
    }
  }

  // Extract general keywords (4+ chars, excluding stopwords)
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'will', 'into',
                             'what', 'when', 'where', 'invest', 'looking', 'focus',
                             'companies', 'startups']);
  const words = text.match(/\b[a-z]{4,}\b/g) || [];
  parsed.keywords = [...new Set(words.filter(w => !stopWords.has(w)))].slice(0, 10);

  // Calculate confidence score
  let confidenceScore = 0;
  if (parsed.sectors.length > 0) confidenceScore += 40;
  if (parsed.stages.length > 0) confidenceScore += 30;
  if (parsed.keywords.length > 3) confidenceScore += 20;
  if (text.length > 50) confidenceScore += 10;
  parsed.confidence = Math.min(100, confidenceScore);

  return parsed;
}
