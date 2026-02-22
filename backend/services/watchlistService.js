import { query } from './database.js';
import { logger } from '../utils/logger.js';

export async function addToWatchlist(trendId, trendName, trendCategory) {
  try {
    const result = await query(
      `INSERT INTO watchlist (trend_id, trend_name, trend_category, rating)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (trend_id) DO NOTHING
       RETURNING *`,
      [trendId, trendName, trendCategory, 3]
    );

    if (result.rows.length === 0) {
      logger.info(`Trend already in watchlist: ${trendName}`);
      return null;
    }

    logger.info(`Added to watchlist: ${trendName}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Error adding to watchlist:', error);
    throw error;
  }
}

export async function removeFromWatchlist(trendId) {
  try {
    const result = await query(
      `DELETE FROM watchlist WHERE trend_id = $1 RETURNING *`,
      [trendId]
    );

    if (result.rows.length > 0) {
      logger.info(`Removed from watchlist: ${trendId}`);
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error removing from watchlist:', error);
    throw error;
  }
}

export async function getWatchlist() {
  try {
    const result = await query(
      `SELECT * FROM watchlist ORDER BY added_at DESC`,
      []
    );

    return result.rows;
  } catch (error) {
    logger.error('Error fetching watchlist:', error);
    throw error;
  }
}

export async function updateWatchlistRating(trendId, rating) {
  try {
    const result = await query(
      `UPDATE watchlist SET rating = $1 WHERE trend_id = $2 RETURNING *`,
      [rating, trendId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error updating watchlist rating:', error);
    throw error;
  }
}

export async function isInWatchlist(trendId) {
  try {
    const result = await query(
      `SELECT id FROM watchlist WHERE trend_id = $1`,
      [trendId]
    );

    return result.rows.length > 0;
  } catch (error) {
    logger.error('Error checking watchlist:', error);
    throw error;
  }
}
