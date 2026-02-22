import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PluginManager } from './plugins/pluginManager.js';
import { PluginService } from './services/pluginService.js';
import { TrendScoringService } from './services/trendScoringService.js';
import { GitHubPlugin } from './plugins/githubPlugin.js';
import { HackerNewsPlugin } from './plugins/hackerNewsPlugin.js';
import { NewsAPIPlugin } from './plugins/newsapiPlugin.js';
import { SerperPlugin } from './plugins/serperPlugin.js';
import { YCScraperPlugin } from './plugins/ycScraperPlugin.js';
import { SECEdgarPlugin } from './plugins/secEdgarPlugin.js';
import { AngelListPlugin } from './plugins/angellistPlugin.js';
import { TwitterPlugin } from './plugins/twitterPlugin.js';
import { logger } from './utils/logger.js';
import * as snapshotService from './services/snapshotService.js';
import * as watchlistService from './services/watchlistService.js';
import * as userPreferencesService from './services/userPreferencesService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize plugin system
const pluginManager = new PluginManager();

// Register primary data sources (activate with API keys)
pluginManager.registerPlugin('github', new GitHubPlugin());
pluginManager.registerPlugin('newsapi', new NewsAPIPlugin());
pluginManager.registerPlugin('serper', new SerperPlugin());

// Register free plugins (no API key needed)
pluginManager.registerPlugin('hackernews', new HackerNewsPlugin());
pluginManager.registerPlugin('yc_scraper', new YCScraperPlugin());
pluginManager.registerPlugin('sec_edgar', new SECEdgarPlugin());

// Register future plugins (will activate when API keys available)
pluginManager.registerPlugin('angellist', new AngelListPlugin());
pluginManager.registerPlugin('twitter', new TwitterPlugin());

const pluginService = new PluginService(pluginManager);
const trendScoringService = new TrendScoringService();

app.use(cors());
app.use(express.json());

// ============================================
// HELPER FUNCTIONS
// ============================================

// Transform trend sources array into structured objects with URLs
function transformTrendSources(trend) {
  const sourceUrls = {
    'github': 'https://github.com/trending',
    'newsapi': 'https://newsapi.org',
    'serper': 'https://serper.dev',
    'hackernews': 'https://news.ycombinator.com',
    'yc_scraper': 'https://www.ycombinator.com/startups',
    'sec_edgar': 'https://www.sec.gov/edgar',
    'angellist': 'https://www.angellist.com',
    'twitter': 'https://twitter.com'
  };

  if (!trend.sources || !Array.isArray(trend.sources) || trend.sources.length === 0) {
    return null;
  }

  return trend.sources.map(source => ({
    name: source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' '),
    url: sourceUrls[source] || 'https://example.com',
    mention_count: trend.mention_count || 0
  }));
}

// Transform trends to include structured source objects
function enrichTrendsWithSources(trends) {
  return trends.map(trend => ({
    ...trend,
    sources: transformTrendSources(trend)
  }));
}

// Transform trends to match frontend expectations
function transformTrendForFrontend(trend) {
  // Calculate momentum change percentage (based on mention count as proxy)
  // In a real system, this would come from historical snapshots
  const momentumChange = Math.floor(Math.random() * 30 - 15); // -15% to +15% for demo

  return {
    id: trend.id,
    name: trend.name,
    category: trend.category,
    momentum_score: trend.momentum_score,
    score: Math.min(100, trend.momentum_score * 2), // Scale 0-50 to 0-100
    momentum: trend.momentum_score,
    momentumChange: momentumChange,
    lifecycle: trend.lifecycle,
    confidence: trend.confidence,
    sources: trend.sources,
    founders: trend.founders || [], // Empty array if no founders yet
    mention_count: trend.mention_count,
    source: trend.source,
    data: trend.data
  };
}

// Transform full trend list for frontend
function transformTrendsForFrontend(trends) {
  return trends.map(transformTrendForFrontend);
}

// Generate mock founder data for demo (in production, this would come from founder data sources)
function generateMockFounders(trend) {
  const firstNames = ['Sarah', 'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Avery', 'Quinn', 'Blake', 'Jordan', 'Casey', 'Morgan', 'Devon', 'Skyler', 'Reese', 'Cameron', 'Dakota'];
  const lastNames = ['Chen', 'Rodriguez', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Garcia', 'Martinez', 'Lee', 'Wang', 'Kim', 'Patel'];
  const titles = ['CEO', 'CTO', 'Co-Founder', 'Engineering Lead', 'Product Lead', 'Founder', 'Chief Product Officer', 'VP Engineering'];
  const companies = ['Google', 'Facebook', 'Amazon', 'Microsoft', 'Apple', 'Tesla', 'Stripe', 'Airbnb', 'Uber', 'Slack', 'Notion', 'Figma'];

  // Create deterministic but varied seed (convert id to string if it's a number)
  const idString = String(trend.id);
  const seed = idString.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  // Generate founders for 40% of trends
  if ((seed % 10) < 6) return [];

  const founderCount = ((seed % 3) + 1); // 1-3 founders
  const founders = [];

  for (let i = 0; i < founderCount && i < 2; i++) {
    const nameIdx = (seed + i * 131) % firstNames.length;
    const lastIdx = (seed + i * 257) % lastNames.length;
    const titleIdx = (seed + i * 383) % titles.length;
    const company1Idx = (seed + i * 449) % companies.length;
    const company2Idx = (seed + i * 563) % companies.length;
    const exits = ((seed + i * 719) % 8) + 1;
    const roi = ((seed + i * 883) % 400) + 50;

    const firstName = firstNames[nameIdx];
    const lastName = lastNames[lastIdx];
    const lowerFirst = firstName.toLowerCase();
    const lowerLast = lastName.toLowerCase();

    founders.push({
      id: `founder-${trend.id}-${i}`,
      name: `${firstName} ${lastName}`,
      title: titles[titleIdx],
      email: `${lowerFirst}.${lowerLast}@founders.io`,
      social: {
        twitter: `@${lowerFirst}${lowerLast}`,
        linkedin: `linkedin.com/in/${lowerFirst}-${lowerLast}`,
        angellist: `angel.co/u/${lowerFirst}-${lowerLast}`
      },
      sectors: [trend.category],
      pastCompanies: [
        companies[company1Idx],
        company2Idx !== company1Idx ? companies[company2Idx] : companies[(company2Idx + 1) % companies.length]
      ],
      investmentTrack: { exits: exits, averageROI: roi }
    });
  }

  return founders;
}

// Enrich trends with founder data
function enrichTrendsWithFounders(trends) {
  return trends.map(trend => ({
    ...trend,
    founders: generateMockFounders(trend)
  }));
}

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VC Intelligence Hub Backend'
  });
});

app.get('/api/api-status', async (req, res) => {
  try {
    // Get basic plugin status
    const pluginStatus = pluginManager.getPluginStatus();

    // Check which plugins have API keys configured
    const hasApiKey = {
      github: !!process.env.GITHUB_TOKEN,
      newsapi: !!process.env.NEWSAPI_KEY,
      serper: !!process.env.SERPER_API_KEY,
      angellist: !!process.env.ANGELLIST_API_KEY,
      twitter: !!process.env.TWITTER_BEARER_TOKEN
    };

    // Collect trends to see which sources return data
    const { trends, sources } = await pluginService.collectTrends();
    const sourceCounts = {};
    sources?.forEach(source => {
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    // Enhance plugin status with API key and data info
    const enhancedApis = {};
    for (const [name, config] of Object.entries(pluginStatus)) {
      enhancedApis[name] = {
        ...config,
        hasApiKey: hasApiKey[name] || false,
        dataAvailable: (sourceCounts[name] || 0) > 0,
        itemCount: sourceCounts[name] || 0
      };
    }

    res.json({
      apis: enhancedApis,
      activePlugins: pluginManager.getActivePlugins(),
      dataSourcesWithData: Object.keys(sourceCounts),
      totalTrends: trends.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in /api/api-status', { error: error.message });
    res.json({
      apis: pluginManager.getPluginStatus(),
      activePlugins: pluginManager.getActivePlugins(),
      error: 'Could not fetch data availability',
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// TRENDS ENDPOINTS
// ============================================

app.get('/api/trends', async (req, res) => {
  try {
    logger.info('GET /api/trends - Collecting raw trends');
    const result = await pluginService.collectTrends();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/trends', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trends/scored', async (req, res) => {
  try {
    logger.info('GET /api/trends/scored - Collecting and scoring trends');
    const { trends } = await pluginService.collectTrends();
    const deduplicated = trendScoringService.deduplicateTrends(trends);
    const scored = trendScoringService.scoreTrends(deduplicated);
    const enriched = enrichTrendsWithSources(scored);
    const withFounders = enrichTrendsWithFounders(enriched);
    const transformed = transformTrendsForFrontend(withFounders);

    res.json({
      trends: transformed,
      count: transformed.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in /api/trends/scored', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DEALS ENDPOINTS
// ============================================

app.get('/api/deals', async (req, res) => {
  try {
    logger.info('GET /api/deals - Collecting deals');
    const result = await pluginService.collectDeals();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/deals', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FOUNDERS ENDPOINTS
// ============================================

app.get('/api/founders', async (req, res) => {
  try {
    logger.info('GET /api/founders - Collecting founders');
    const result = await pluginService.collectFounders();
    res.json(result);
  } catch (error) {
    logger.error('Error in /api/founders', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HISTORICAL ENDPOINTS
// ============================================

app.get('/api/historical/:trendName', async (req, res) => {
  try {
    const { trendName } = req.params;
    const days = req.query.days || 30;
    const history = await snapshotService.getTrendHistory(trendName, parseInt(days));
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/historical/stats/:trendName', async (req, res) => {
  try {
    const { trendName } = req.params;
    const stats = await snapshotService.getTrendStats(trendName);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WATCHLIST ENDPOINTS
// ============================================

app.get('/api/watchlist', async (req, res) => {
  try {
    const watchlist = await watchlistService.getWatchlist();
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/watchlist', async (req, res) => {
  try {
    const { trendId, trendName, trendCategory } = req.body;
    const result = await watchlistService.addToWatchlist(trendId, trendName, trendCategory);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/watchlist/:trendId', async (req, res) => {
  try {
    const { trendId } = req.params;
    const { rating } = req.body;
    const result = await watchlistService.updateWatchlistRating(trendId, rating);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/watchlist/:trendId', async (req, res) => {
  try {
    const { trendId } = req.params;
    const result = await watchlistService.removeFromWatchlist(trendId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FOUNDERS ENDPOINTS
// ============================================

app.get('/api/founders/:founderId', async (req, res) => {
  try {
    const { founderId } = req.params;

    // Collect all trends to search for founder
    const { trends } = await pluginService.collectTrends();
    const deduplicated = trendScoringService.deduplicateTrends(trends);
    const scored = trendScoringService.scoreTrends(deduplicated);
    const enriched = enrichTrendsWithSources(scored);
    const withFounders = enrichTrendsWithFounders(enriched);

    // Search through all trends for the founder
    for (const trend of withFounders) {
      if (trend.founders && trend.founders.length > 0) {
        const founder = trend.founders.find(f => f.id === founderId);
        if (founder) {
          return res.json(founder);
        }
      }
    }

    res.status(404).json({ error: 'Founder not found' });
  } catch (error) {
    logger.error('Error in /api/founders/:founderId', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER PREFERENCES ENDPOINTS
// ============================================

app.get('/api/user/preferences', async (req, res) => {
  try {
    const prefs = await userPreferencesService.getPreferences();
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/preferences', async (req, res) => {
  try {
    const prefs = await userPreferencesService.updatePreferences(req.body);
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// DAILY SNAPSHOT SCHEDULER
// ============================================

// Schedule daily snapshots at 00:00 UTC
function scheduleDailySnapshots() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);

  const timeUntilMidnight = tomorrow - now;

  setTimeout(() => {
    // Run immediately at midnight
    runDailySnapshot();
    // Then run every 24 hours
    setInterval(runDailySnapshot, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
}

async function runDailySnapshot() {
  try {
    logger.info('Running daily snapshot job');
    const trends = await pluginManager.fetchTrends();
    await snapshotService.saveDailySnapshots(trends);
  } catch (error) {
    logger.error('Daily snapshot job failed:', error);
  }
}

// Start scheduler on server startup
scheduleDailySnapshots();

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  logger.info(`VC Intelligence Hub backend running on http://localhost:${PORT}`);
  logger.info(`Active plugins: ${pluginManager.getActivePlugins().join(', ')}`);
  logger.info(`Total registered plugins: ${Object.keys(pluginManager.plugins || {}).length}`);
});

export default app;
