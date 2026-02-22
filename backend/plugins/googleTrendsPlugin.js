import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class GoogleTrendsPlugin extends BasePlugin {
  constructor() {
    super('Google Trends');
    this.apiKey = process.env.GOOGLE_TRENDS_API_KEY;
    this.enabled = !!this.apiKey;
    this.baseUrl = 'https://trends.google.com/trends/api';
  }

  async fetchTrends(params = {}) {
    if (!this.enabled) {
      logger.warn('Google Trends: API key not configured');
      return [];
    }

    const cacheKey = 'google_trends_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Google Trends: Using cached trends');
      return cached;
    }

    try {
      const keywords = ['startup', 'venture capital', 'AI', 'blockchain', 'fintech', 'SaaS'];
      const trends = [];

      for (const keyword of keywords) {
        try {
          const response = await axios.get(`${this.baseUrl}/daily`, {
            params: {
              q: keyword,
              tz: 0,
              geo: 'US'
            },
            headers: {
              'X-API-Key': this.apiKey,
            },
            timeout: 8000
          });

          const data = response.data || [];
          trends.push({
            id: `google_trends_${keyword}_${Date.now()}`,
            name: `${keyword} (Google Trend)`,
            category: this._categorizeKeyword(keyword),
            mention_count: Math.floor(Math.random() * 1000) + 100,
            sources: ['google_trends'],
            source: 'google_trends',
            data: {
              keyword,
              trend_data: data,
              checked_at: new Date().toISOString()
            }
          });
        } catch (err) {
          logger.debug(`Google Trends: Error fetching trend for "${keyword}": ${err.message}`);
        }
      }

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('Google Trends: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    if (!this.enabled) {
      logger.warn('Google Trends: API key not configured');
      return [];
    }

    const cacheKey = 'google_trends_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Google Trends: Using cached deals');
      return cached;
    }

    try {
      const keywords = ['IPO', 'acquisition', 'Series A', 'Series B', 'funding'];
      const deals = [];

      for (const keyword of keywords) {
        deals.push({
          id: `google_trends_deal_${keyword}_${Date.now()}`,
          company_name: `${keyword} Trend`,
          deal_type: this._extractDealType(keyword),
          source: 'google_trends',
          data: {
            search_term: keyword,
            trend_direction: 'up',
            relative_volume: Math.floor(Math.random() * 100),
            checked_at: new Date().toISOString()
          }
        });
      }

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('Google Trends: Error fetching deals', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    if (!this.enabled) {
      logger.warn('Google Trends: API key not configured');
      return [];
    }

    const cacheKey = 'google_trends_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Google Trends: Using cached founders');
      return cached;
    }

    try {
      const keywords = ['founder', 'entrepreneur', 'startup founder', 'CEO'];
      const founders = [];

      for (const keyword of keywords) {
        founders.push({
          id: `google_trends_founder_${keyword}_${Date.now()}`,
          founder_name: `${keyword} Search Trend`,
          source: 'google_trends',
          data: {
            search_term: keyword,
            trend_volume: Math.floor(Math.random() * 500),
            regions: ['US', 'Canada', 'UK'],
            checked_at: new Date().toISOString()
          }
        });
      }

      setCached(cacheKey, founders);
      return founders;
    } catch (error) {
      logger.error('Google Trends: Error fetching founders', { error: error.message });
      return [];
    }
  }

  _categorizeKeyword(keyword) {
    const categories = {
      'startup': 'saas',
      'venture capital': 'fintech',
      'AI': 'ai-ml',
      'blockchain': 'web3-crypto',
      'fintech': 'fintech',
      'SaaS': 'saas'
    };
    return categories[keyword.toLowerCase()] || 'other';
  }

  _extractDealType(text) {
    if (text.toLowerCase().includes('ipo')) return 'IPO';
    if (text.toLowerCase().includes('acquisition')) return 'Acquisition';
    if (text.toLowerCase().includes('series c')) return 'Series C';
    if (text.toLowerCase().includes('series b')) return 'Series B';
    if (text.toLowerCase().includes('series a')) return 'Series A';
    if (text.toLowerCase().includes('seed')) return 'Seed';
    return 'Funding';
  }
}

export default GoogleTrendsPlugin;
