import { logger } from '../utils/logger.js';

export class TrendScoringService {
  /**
   * Score trends with momentum calculation
   * Scoring breakdown (NO BASELINES - can start at 0):
   * - Mention velocity (0-20 pts): How fast mentions growing
   * - Source diversity (0-20 pts): Number of different sources
   * - Funding signals (0-25 pts): Associated funding
   * - Founder prominence (0-15 pts): Known founders involved
   * - Recency (0-20 pts): Recent mentions weighted higher
   * Total range: 0-100 pts (will be percentile-mapped)
   */
  scoreTrends(trendsList) {
    logger.info('TrendScoringService: Scoring trends', { count: trendsList.length });

    // Step 1: Calculate raw scores for all trends
    const withRawScores = trendsList.map(trend => ({
      ...trend,
      rawScore: this.calculateMomentumScore(trend)
    }));

    // Step 2: Calculate percentiles
    const sortedScores = withRawScores.map(t => t.rawScore).sort((a, b) => a - b);

    const scoredTrends = withRawScores.map(trend => {
      // Find percentile position (0-100)
      const rank = sortedScores.indexOf(trend.rawScore);
      const percentile = (rank / (sortedScores.length - 1)) * 100 || 50;

      // Map percentile to 1-99 range using bell curve
      const finalScore = this.mapPercentileToScore(percentile);

      return {
        ...trend,
        momentum_score: finalScore,
        lifecycle: this.getTrendLifecycle(finalScore),
        confidence: this.calculateConfidence(trend)
      };
    });

    // Sort by momentum score descending
    scoredTrends.sort((a, b) => b.momentum_score - a.momentum_score);

    logger.info('TrendScoringService: Scoring complete', {
      topTrend: scoredTrends[0]?.name,
      topScore: scoredTrends[0]?.momentum_score,
      bottomScore: scoredTrends[scoredTrends.length - 1]?.momentum_score
    });

    return scoredTrends;
  }

  mapPercentileToScore(percentile) {
    // percentile: 0-100
    // Convert to probability: 0-1
    const probability = percentile / 100;

    // Get z-score from normal distribution
    const zScore = this.inverseNormalCDF(probability);

    // Map z-score (-3 to +3) to 1-99 range
    // Center at 50, scale so ±3σ covers ±49 (full range)
    const score = 50 + (zScore * 16.5);

    return Math.max(1, Math.min(99, Math.round(score)));
  }

  inverseNormalCDF(p) {
    // Handle extreme values
    if (p < 0.0000285) return -3.7;
    if (p > 0.9999715) return 3.7;

    // Wichura algorithm for approximating inverse normal CDF
    if (p < 0.02425) {
      const t = Math.sqrt(-2 * Math.log(p));
      return -(((2.328819 * t + 2.512396) * t + 1.000000) / (t + 0.308995));
    } else if (p < 0.97575) {
      const t = p - 0.5;
      return (((2.26159 * t + 37.20671) * t + 2.65770) * t + 0.360175) / (((2.04288 * t + 22.47202) * t + 0.240708));
    } else {
      const t = Math.sqrt(-2 * Math.log(1 - p));
      return (((2.328819 * t + 2.512396) * t + 1.000000) / (t + 0.308995));
    }
  }

  calculateMomentumScore(trend) {
    let score = 0;

    // Velocity: 0-20 pts (linear scaling with mention count, NO BASELINE)
    // 1 mention = 0 pts, 10 mentions = 20 pts
    const velocityScore = Math.min((trend.mention_count || 1) * 2, 20);
    score += velocityScore;

    // Source diversity: 0-20 pts (NO BASELINE)
    // 1 source = 0 pts, 6+ sources = 20 pts
    const sourceCount = (trend.sources ? trend.sources.length : 1);
    const sourceDiversity = Math.min(Math.max(sourceCount - 1, 0) * 4, 20);
    score += sourceDiversity;

    // Funding signals: 0-25 pts (unchanged from original, no baseline)
    const fundingScore = this.calculateFundingScore(trend);
    score += fundingScore;

    // Founder prominence: 0-15 pts (unchanged from original, no baseline)
    const founderScore = this.calculateFounderScore(trend);
    score += founderScore;

    // Recency: 0-20 pts (changed from 0-10 to give more weight)
    const recencyScore = this.calculateRecencyScore(trend);
    score += recencyScore;

    // Return raw score (100 max) - will be percentile-mapped later
    return Math.min(score, 100);
  }

  calculateFundingScore(trend) {
    if (!trend.data || typeof trend.data !== 'object') return 0;

    const text = JSON.stringify(trend.data).toLowerCase();
    let score = 0; // No baseline - starts at 0

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

    // Linear decay: < 24 hours = 20 pts, decay by 0.5 per day
    const score = 20 - (age / 24) * 0.5;
    return Math.max(score, 0); // Can now go to 0
  }

  getTrendLifecycle(score) {
    if (score >= 80) return 'peak';
    if (score >= 60) return 'emerging';
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
