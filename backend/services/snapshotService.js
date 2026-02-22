import { query } from './database.js';
import { logger } from '../utils/logger.js';

export async function saveTrendSnapshot(trend) {
  try {
    const {
      name,
      category,
      score,
      mentionCount,
      momentumChange,
      sourceDiversity,
      fundingSignals,
    } = trend;

    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO trend_snapshots
       (trend_name, trend_category, score, mention_count, momentum_change, source_diversity, funding_signals, snapshot_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (trend_name, snapshot_date) DO UPDATE
       SET score = $3, mention_count = $4, momentum_change = $5, source_diversity = $6, funding_signals = $7
       RETURNING id`,
      [name, category, score, mentionCount, momentumChange, sourceDiversity, fundingSignals, today]
    );

    logger.info(`Snapshot saved for trend: ${name}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error saving trend snapshot:', error);
    throw error;
  }
}

export async function getTrendHistory(trendName, days = 30) {
  try {
    const result = await query(
      `SELECT * FROM trend_snapshots
       WHERE trend_name = $1
       AND snapshot_date >= CURRENT_DATE - INTERVAL '1 day' * $2
       ORDER BY snapshot_date ASC`,
      [trendName, days]
    );

    return result.rows;
  } catch (error) {
    logger.error('Error fetching trend history:', error);
    throw error;
  }
}

export async function getTrendStats(trendName) {
  try {
    const result = await query(
      `SELECT
        MAX(score) as peak_score,
        MAX(mention_count) as peak_mentions,
        AVG(score) as avg_score,
        (SELECT snapshot_date FROM trend_snapshots
         WHERE trend_name = $1 AND score = (SELECT MAX(score) FROM trend_snapshots WHERE trend_name = $1)
         LIMIT 1) as peak_date,
        COUNT(*) as days_tracked
       FROM trend_snapshots
       WHERE trend_name = $1`,
      [trendName]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error fetching trend stats:', error);
    throw error;
  }
}

export async function saveDailySnapshots(trendsFeed) {
  try {
    logger.info(`Saving daily snapshots for ${trendsFeed.length} trends`);

    for (const trend of trendsFeed) {
      await saveTrendSnapshot(trend);
    }

    logger.info('Daily snapshots completed');
    return { saved: trendsFeed.length };
  } catch (error) {
    logger.error('Error in daily snapshots:', error);
    throw error;
  }
}
