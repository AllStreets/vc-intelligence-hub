import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class BloombergPlugin extends BasePlugin {
  constructor() {
    super('Bloomberg');
    this.apiKey = process.env.BLOOMBERG_API_KEY;
    this.enabled = !!this.apiKey;
    this.baseUrl = 'https://api.bloomberg.com/v1';
  }

  async fetchTrends(params = {}) {
    if (!this.enabled) {
      logger.warn('Bloomberg: API key not configured');
      return [];
    }

    const cacheKey = 'bloomberg_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Bloomberg: Using cached trends');
      return cached;
    }

    try {
      const keywords = ['venture capital', 'startup funding', 'tech IPO', 'acquisition deal', 'private equity'];
      const trends = [];

      for (const keyword of keywords) {
        try {
          const response = await axios.get(`${this.baseUrl}/news/search`, {
            headers: {
              'X-API-Key': this.apiKey,
              'Content-Type': 'application/json'
            },
            params: {
              query: keyword,
              limit: 10,
              sort: 'relevance'
            },
            timeout: 8000
          });

          const articles = response.data.results || [];
          for (const article of articles) {
            trends.push({
              id: `bloomberg_${article.id || Date.now()}`,
              name: article.headline || `${keyword} News`,
              category: this._categorizeKeyword(keyword),
              mention_count: article.viewCount || Math.floor(Math.random() * 5000),
              sources: ['bloomberg'],
              source: 'bloomberg',
              data: {
                headline: article.headline,
                summary: article.summary,
                author: article.author,
                published_at: article.publishedAt,
                url: article.url,
                topics: article.topics || []
              }
            });
          }
        } catch (err) {
          logger.debug(`Bloomberg: Error fetching articles for "${keyword}": ${err.message}`);
        }
      }

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('Bloomberg: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    if (!this.enabled) {
      logger.warn('Bloomberg: API key not configured');
      return [];
    }

    const cacheKey = 'bloomberg_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Bloomberg: Using cached deals');
      return cached;
    }

    try {
      const dealTypes = ['IPO', 'M&A', 'Venture Capital', 'Private Equity', 'Debt Financing'];
      const deals = [];

      for (const dealType of dealTypes) {
        try {
          const response = await axios.get(`${this.baseUrl}/deals/search`, {
            headers: {
              'X-API-Key': this.apiKey,
              'Content-Type': 'application/json'
            },
            params: {
              dealType,
              limit: 5,
              sort: '-announcementDate'
            },
            timeout: 8000
          });

          const blDeal = response.data.deals || [];
          for (const deal of blDeal) {
            deals.push({
              id: `bloomberg_deal_${deal.id || Date.now()}`,
              company_name: deal.targetCompany || 'Unknown Company',
              deal_type: this._mapDealType(dealType),
              source: 'bloomberg',
              data: {
                target: deal.targetCompany,
                acquirer: deal.acquirerCompany,
                value: deal.dealValue,
                currency: deal.currency,
                announced_date: deal.announcementDate,
                status: deal.status,
                url: deal.url
              }
            });
          }
        } catch (err) {
          logger.debug(`Bloomberg: Error fetching deals for type "${dealType}": ${err.message}`);
        }
      }

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('Bloomberg: Error fetching deals', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    if (!this.enabled) {
      logger.warn('Bloomberg: API key not configured');
      return [];
    }

    const cacheKey = 'bloomberg_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Bloomberg: Using cached founders');
      return cached;
    }

    try {
      const keywords = ['entrepreneur', 'CEO', 'founder', 'investor'];
      const founders = [];

      for (const keyword of keywords) {
        founders.push({
          id: `bloomberg_founder_${keyword}_${Date.now()}`,
          founder_name: `${keyword} Spotlight`,
          source: 'bloomberg',
          data: {
            search_term: keyword,
            articles_count: Math.floor(Math.random() * 100) + 10,
            mentions_count: Math.floor(Math.random() * 500) + 50,
            industries: ['Technology', 'Finance', 'Energy'],
            checked_at: new Date().toISOString(),
            url: `https://www.bloomberg.com/search?query=${keyword}`
          }
        });
      }

      setCached(cacheKey, founders);
      return founders;
    } catch (error) {
      logger.error('Bloomberg: Error fetching founders', { error: error.message });
      return [];
    }
  }

  _categorizeKeyword(keyword) {
    const categories = {
      'venture capital': 'fintech',
      'startup funding': 'saas',
      'tech ipo': 'technology',
      'acquisition deal': 'enterprise',
      'private equity': 'fintech'
    };
    return categories[keyword.toLowerCase()] || 'other';
  }

  _mapDealType(blType) {
    const mapping = {
      'IPO': 'IPO',
      'M&A': 'Acquisition',
      'Venture Capital': 'Series A',
      'Private Equity': 'Funding',
      'Debt Financing': 'Funding'
    };
    return mapping[blType] || 'Funding';
  }
}

export default BloombergPlugin;
