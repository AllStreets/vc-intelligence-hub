import { logger } from '../utils/logger.js';

export class TrendScoringService {
  /**
   * Score trends with momentum calculation
   * Scoring breakdown:
   * - Mention velocity (0-30 pts): How fast mentions growing
   * - Source diversity (0-20 pts): Number of different sources
   * - Funding signals (0-25 pts): Associated funding
   * - Founder prominence (0-15 pts): Known founders involved
   * - Recency (0-10 pts): Recent mentions weighted higher
   */
  scoreTrends(trendsList) {
    logger.info('TrendScoringService: Scoring trends', { count: trendsList.length });

    const scoredTrends = trendsList.map(trend => {
      const score = this.calculateMomentumScore(trend);
      return {
        ...trend,
        momentum_score: score,
        lifecycle: this.getTrendLifecycle(score),
        confidence: this.calculateConfidence(trend)
      };
    });

    // Sort by momentum score descending
    scoredTrends.sort((a, b) => b.momentum_score - a.momentum_score);

    logger.info('TrendScoringService: Scoring complete', {
      topTrend: scoredTrends[0]?.name,
      topScore: scoredTrends[0]?.momentum_score
    });

    return scoredTrends;
  }

  calculateMomentumScore(trend) {
    let score = 0;

    // Mention velocity (0-30 pts) - with boost for low mention counts
    // Single mention = 15 pts baseline (to ensure decent distribution)
    const velocityScore = Math.min(15 + (trend.mention_count || 1) * 3, 30);
    score += velocityScore;

    // Source diversity (0-25 pts) - reward if mentioned in multiple sources
    // Single source = 10 pts baseline, then +5 per additional source
    const sourceDiversity = Math.min(10 + (trend.sources ? trend.sources.length * 5 : 0), 25);
    score += sourceDiversity;

    // Funding signals (0-25 pts) - check for Series A/B/C mentions
    const fundingScore = this.calculateFundingScore(trend);
    score += fundingScore;

    // Founder prominence (0-15 pts) - serial entrepreneurs
    const founderScore = this.calculateFounderScore(trend);
    score += founderScore;

    // Recency (0-10 pts)
    const recencyScore = this.calculateRecencyScore(trend);
    score += recencyScore;

    return Math.min(Math.round(score), 100);
  }

  calculateFundingScore(trend) {
    if (!trend.data || typeof trend.data !== 'object') return 0;

    const text = JSON.stringify(trend.data).toLowerCase();
    let score = 5; // Base score for any trend (vs 0 before)

    if (text.includes('series a') || text.includes('seed')) score += 8;
    if (text.includes('series b')) score += 12;
    if (text.includes('series c') || text.includes('series c+')) score += 15;
    if (text.includes('acquisition')) score += 20;
    if (text.includes('ipo')) score += 25;
    if (text.includes('funding') || text.includes('raised')) score += 3;

    return Math.min(score, 25);
  }

  calculateFounderScore(trend) {
    if (!trend.data || typeof trend.data !== 'object') return 0;

    const text = JSON.stringify(trend.data).toLowerCase();
    const keywords = ['founder', 'ceo', 'serial entrepreneur', 'exit', 'previous startup'];

    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 3;
    });

    return Math.min(score, 15);
  }

  calculateRecencyScore(trend) {
    // If trend has timestamp, score based on age
    let age = 0;

    if (trend.data && trend.data.created_at) {
      const trendDate = new Date(trend.data.created_at);
      const now = new Date();
      age = (now - trendDate) / (1000 * 60 * 60); // hours
    }

    // Recent trends (< 24 hours) get full score
    if (age < 24) return 10;
    // Decay by 0.5 points per day
    return Math.max(10 - (age / 24) * 0.5, 2);
  }

  getTrendLifecycle(score) {
    if (score >= 70) return 'peak';
    if (score >= 50) return 'emerging';
    if (score >= 40) return 'established';
    return 'declining';
  }

  calculateConfidence(trend) {
    // Confidence based on number of sources and consistency
    const sources = trend.sources ? trend.sources.length : 1;
    const confidenceMap = {
      1: 'low',
      2: 'medium',
      3: 'high',
      4: 'high',
      5: 'very-high'
    };
    return confidenceMap[Math.min(sources, 5)];
  }

  deduplicateTrends(trends) {
    const seen = new Map();

    trends.forEach(trend => {
      const key = trend.name.toLowerCase();

      if (seen.has(key)) {
        const existing = seen.get(key);
        // Merge sources
        existing.sources = [...new Set([...(existing.sources || []), ...(trend.sources || [])])];
        // Average mention count
        existing.mention_count = (existing.mention_count + trend.mention_count) / 2;
      } else {
        seen.set(key, trend);
      }
    });

    return Array.from(seen.values());
  }
}

export default TrendScoringService;
