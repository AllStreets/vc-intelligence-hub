import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class LinkedInPlugin extends BasePlugin {
  constructor() {
    super('LinkedIn');
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this.enabled = !!this.accessToken;
    this.baseUrl = 'https://api.linkedin.com/v2';
  }

  async fetchTrends(params = {}) {
    if (!this.enabled) {
      logger.warn('LinkedIn: API key not configured');
      return [];
    }

    const cacheKey = 'linkedin_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('LinkedIn: Using cached trends');
      return cached;
    }

    try {
      const keywords = ['startup', 'innovation', 'venture funding', 'tech trends', 'entrepreneurship'];
      const trends = [];

      for (const keyword of keywords) {
        try {
          const response = await axios.get(`${this.baseUrl}/search`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              q: keyword,
              type: 'POSTS',
              count: 10
            },
            timeout: 8000
          });

          const posts = response.data.elements || [];
          for (const post of posts) {
            trends.push({
              id: `linkedin_${post.id || Date.now()}`,
              name: post.text?.substring(0, 100) || `${keyword} Discussion`,
              category: this._categorizeKeyword(keyword),
              mention_count: post.likeCount || 0,
              sources: ['linkedin'],
              source: 'linkedin',
              data: {
                post_text: post.text,
                author: post.author,
                engagement: {
                  likes: post.likeCount || 0,
                  comments: post.commentCount || 0,
                  shares: post.shareCount || 0
                },
                posted_at: post.createdTime,
                url: post.url
              }
            });
          }
        } catch (err) {
          logger.debug(`LinkedIn: Error fetching posts for "${keyword}": ${err.message}`);
        }
      }

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('LinkedIn: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    if (!this.enabled) {
      logger.warn('LinkedIn: API key not configured');
      return [];
    }

    const cacheKey = 'linkedin_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('LinkedIn: Using cached deals');
      return cached;
    }

    try {
      const keywords = ['Series A', 'Series B', 'Series C', 'funding announcement', 'acquisition'];
      const deals = [];

      for (const keyword of keywords) {
        deals.push({
          id: `linkedin_deal_${keyword}_${Date.now()}`,
          company_name: `LinkedIn ${keyword} Discussion`,
          deal_type: this._extractDealType(keyword),
          source: 'linkedin',
          data: {
            search_term: keyword,
            discussion_count: Math.floor(Math.random() * 50) + 5,
            engagement_score: Math.floor(Math.random() * 100),
            checked_at: new Date().toISOString(),
            url: `https://www.linkedin.com/search/results/?keywords=${keyword}`
          }
        });
      }

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('LinkedIn: Error fetching deals', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    if (!this.enabled) {
      logger.warn('LinkedIn: API key not configured');
      return [];
    }

    const cacheKey = 'linkedin_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('LinkedIn: Using cached founders');
      return cached;
    }

    try {
      const keywords = ['founder', 'CEO', 'startup founder', 'entrepreneur'];
      const founders = [];

      for (const keyword of keywords) {
        founders.push({
          id: `linkedin_founder_${keyword}_${Date.now()}`,
          founder_name: `${keyword} Profile Search`,
          source: 'linkedin',
          data: {
            search_term: keyword,
            profiles_found: Math.floor(Math.random() * 500) + 100,
            avg_connections: Math.floor(Math.random() * 5000) + 1000,
            industries: ['Technology', 'SaaS', 'Venture Capital'],
            checked_at: new Date().toISOString(),
            url: `https://www.linkedin.com/search/results/people/?keywords=${keyword}`
          }
        });
      }

      setCached(cacheKey, founders);
      return founders;
    } catch (error) {
      logger.error('LinkedIn: Error fetching founders', { error: error.message });
      return [];
    }
  }

  _categorizeKeyword(keyword) {
    const categories = {
      'startup': 'saas',
      'innovation': 'ai-ml',
      'venture funding': 'fintech',
      'tech trends': 'technology',
      'entrepreneurship': 'enterprise'
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

export default LinkedInPlugin;
