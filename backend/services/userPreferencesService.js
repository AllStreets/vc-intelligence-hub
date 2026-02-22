import { query } from './database.js';
import { logger } from '../utils/logger.js';

const DEFAULT_PREFERENCES = {
  items_per_page: 25,
  default_sort_order: 'momentum',
  visible_columns: ['name', 'score', 'momentum', 'funding_signals', 'founder_count', 'sources'],
  theme_accents: {
    discover: 'slate-silver',
    evaluate: 'rich-gold',
    decide: 'deep-red',
    track: 'emerald-green',
    settings: 'refined-silver'
  }
};

export async function getPreferences() {
  try {
    const result = await query(
      `SELECT * FROM user_preferences LIMIT 1`,
      []
    );

    if (result.rows.length === 0) {
      // Create default preferences
      return await createDefaultPreferences();
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error fetching preferences:', error);
    throw error;
  }
}

export async function createDefaultPreferences() {
  try {
    const result = await query(
      `INSERT INTO user_preferences
       (items_per_page, default_sort_order, visible_columns, theme_accents)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        DEFAULT_PREFERENCES.items_per_page,
        DEFAULT_PREFERENCES.default_sort_order,
        DEFAULT_PREFERENCES.visible_columns,
        JSON.stringify(DEFAULT_PREFERENCES.theme_accents)
      ]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating default preferences:', error);
    throw error;
  }
}

export async function updatePreferences(updates) {
  try {
    const {
      items_per_page,
      default_sort_order,
      visible_columns,
      theme_accents
    } = updates;

    // Get current preferences to merge with updates
    const current = await getPreferences();

    const result = await query(
      `UPDATE user_preferences
       SET items_per_page = COALESCE($1, items_per_page),
           default_sort_order = COALESCE($2, default_sort_order),
           visible_columns = COALESCE($3, visible_columns),
           theme_accents = COALESCE($4, theme_accents),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        items_per_page || null,
        default_sort_order || null,
        visible_columns ? JSON.stringify(visible_columns) : null,
        theme_accents ? JSON.stringify(theme_accents) : null,
        current.id
      ]
    );

    logger.info('Preferences updated');
    return result.rows[0];
  } catch (error) {
    logger.error('Error updating preferences:', error);
    throw error;
  }
}

export async function getSortOrder() {
  try {
    const prefs = await getPreferences();
    return prefs.default_sort_order;
  } catch (error) {
    logger.error('Error getting sort order:', error);
    throw error;
  }
}
