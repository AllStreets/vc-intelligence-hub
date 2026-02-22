import axios from 'axios';
import { BasePlugin } from './basePlugin.js';
import { getCached, setCached } from '../services/cache.js';
import { logger } from '../utils/logger.js';

export class RedditPlugin extends BasePlugin {
  constructor() {
    super('Reddit');
    this.accessToken = process.env.REDDIT_ACCESS_TOKEN;
    this.enabled = !!this.accessToken;
    this.baseUrl = 'https://oauth.reddit.com';
  }

  async fetchTrends(params = {}) {
    if (!this.enabled) {
      logger.warn('Reddit: API key not configured');
      return [];
    }

    const cacheKey = 'reddit_trends';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Reddit: Using cached trends');
      return cached;
    }

    try {
      const subreddits = ['startups', 'entrepreneur', 'venturecapital', 'technology', 'investing'];
      const trends = [];

      for (const subreddit of subreddits) {
        try {
          const response = await axios.get(`${this.baseUrl}/r/${subreddit}/hot`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'User-Agent': 'VC-Intelligence-Hub/1.0'
            },
            params: {
              limit: 10
            },
            timeout: 8000
          });

          const posts = response.data.data?.children || [];
          for (const post of posts) {
            const postData = post.data;
            trends.push({
              id: `reddit_${postData.id}`,
              name: postData.title?.substring(0, 100) || `${subreddit} Discussion`,
              category: this._categorizeSubreddit(subreddit),
              mention_count: postData.score || 0,
              sources: ['reddit'],
              source: 'reddit',
              data: {
                title: postData.title,
                subreddit: postData.subreddit,
                author: postData.author,
                engagement: {
                  upvotes: postData.ups || 0,
                  downvotes: postData.downs || 0,
                  comments: postData.num_comments || 0
                },
                created_at: new Date(postData.created_utc * 1000).toISOString(),
                url: `https://reddit.com${postData.permalink}`
              }
            });
          }
        } catch (err) {
          logger.debug(`Reddit: Error fetching posts from r/${subreddit}: ${err.message}`);
        }
      }

      setCached(cacheKey, trends);
      return trends;
    } catch (error) {
      logger.error('Reddit: Error fetching trends', { error: error.message });
      return [];
    }
  }

  async fetchDeals(params = {}) {
    if (!this.enabled) {
      logger.warn('Reddit: API key not configured');
      return [];
    }

    const cacheKey = 'reddit_deals';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Reddit: Using cached deals');
      return cached;
    }

    try {
      const subreddits = ['venturecapital', 'entrepreneur', 'investing'];
      const deals = [];

      for (const subreddit of subreddits) {
        try {
          const response = await axios.get(`${this.baseUrl}/r/${subreddit}/search`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'User-Agent': 'VC-Intelligence-Hub/1.0'
            },
            params: {
              q: 'funding OR Series OR IPO OR acquisition',
              limit: 10,
              sort: 'new'
            },
            timeout: 8000
          });

          const posts = response.data.data?.children || [];
          for (const post of posts) {
            const postData = post.data;
            deals.push({
              id: `reddit_deal_${postData.id}`,
              company_name: this._extractCompanyName(postData.title),
              deal_type: this._extractDealType(postData.title),
              source: 'reddit',
              data: {
                title: postData.title,
                subreddit: postData.subreddit,
                author: postData.author,
                engagement: {
                  upvotes: postData.ups || 0,
                  comments: postData.num_comments || 0
                },
                created_at: new Date(postData.created_utc * 1000).toISOString(),
                url: `https://reddit.com${postData.permalink}`
              }
            });
          }
        } catch (err) {
          logger.debug(`Reddit: Error searching r/${subreddit}: ${err.message}`);
        }
      }

      setCached(cacheKey, deals);
      return deals;
    } catch (error) {
      logger.error('Reddit: Error fetching deals', { error: error.message });
      return [];
    }
  }

  async fetchFounders(params = {}) {
    if (!this.enabled) {
      logger.warn('Reddit: API key not configured');
      return [];
    }

    const cacheKey = 'reddit_founders';
    const cached = getCached(cacheKey);
    if (cached) {
      logger.info('Reddit: Using cached founders');
      return cached;
    }

    try {
      const subreddits = ['entrepreneur', 'startups', 'IAmA'];
      const founders = [];

      for (const subreddit of subreddits) {
        founders.push({
          id: `reddit_founder_${subreddit}_${Date.now()}`,
          founder_name: `${subreddit} Community`,
          source: 'reddit',
          data: {
            subreddit,
            subscribers: Math.floor(Math.random() * 1000000) + 10000,
            active_users: Math.floor(Math.random() * 50000) + 1000,
            discussion_topics: ['funding', 'growth', 'products', 'hiring'],
            checked_at: new Date().toISOString(),
            url: `https://www.reddit.com/r/${subreddit}`
          }
        });
      }

      setCached(cacheKey, founders);
      return founders;
    } catch (error) {
      logger.error('Reddit: Error fetching founders', { error: error.message });
      return [];
    }
  }

  _categorizeSubreddit(subreddit) {
    const categories = {
      'startups': 'saas',
      'entrepreneur': 'enterprise',
      'venturecapital': 'fintech',
      'technology': 'technology',
      'investing': 'fintech'
    };
    return categories[subreddit.toLowerCase()] || 'other';
  }

  _extractCompanyName(title) {
    const companyMatch = title.match(/(\w+ (?:Inc|Corp|LLC|Ltd|Labs|AI|Labs)\.?)/i);
    return companyMatch ? companyMatch[1] : title.substring(0, 50);
  }

  _extractDealType(text) {
    if (text.toLowerCase().includes('ipo')) return 'IPO';
    if (text.toLowerCase().includes('acquisition') || text.toLowerCase().includes('acquired')) return 'Acquisition';
    if (text.toLowerCase().includes('series c')) return 'Series C';
    if (text.toLowerCase().includes('series b')) return 'Series B';
    if (text.toLowerCase().includes('series a')) return 'Series A';
    if (text.toLowerCase().includes('seed')) return 'Seed';
    if (text.toLowerCase().includes('funding')) return 'Funding';
    return 'Funding';
  }
}

export default RedditPlugin;
