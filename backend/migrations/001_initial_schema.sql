-- Trend snapshots for historical tracking
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id SERIAL PRIMARY KEY,
  trend_name VARCHAR(255) NOT NULL,
  trend_category VARCHAR(100),
  score INTEGER,
  mention_count INTEGER,
  momentum_change FLOAT,
  source_diversity INTEGER,
  funding_signals INTEGER,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trend_name, snapshot_date)
);

-- User watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  trend_id VARCHAR(255) NOT NULL,
  trend_name VARCHAR(255) NOT NULL,
  trend_category VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trend_id)
);

-- Founder relationships for network graph
CREATE TABLE IF NOT EXISTS founder_relationships (
  id SERIAL PRIMARY KEY,
  founder_1_id VARCHAR(255) NOT NULL,
  founder_1_name VARCHAR(255) NOT NULL,
  founder_2_id VARCHAR(255) NOT NULL,
  founder_2_name VARCHAR(255) NOT NULL,
  relationship_type VARCHAR(50),
  company_shared VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(founder_1_id, founder_2_id, relationship_type)
);

-- Deal pipeline tracking
CREATE TABLE IF NOT EXISTS deal_pipeline (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  trend_id VARCHAR(255),
  stage VARCHAR(50) NOT NULL,
  notes TEXT,
  match_score INTEGER,
  added_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved investment theses
CREATE TABLE IF NOT EXISTS saved_thesis (
  id SERIAL PRIMARY KEY,
  thesis_text TEXT NOT NULL,
  thesis_name VARCHAR(255),
  sectors TEXT[],
  regions TEXT[],
  stage_focus VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved filter searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  search_name VARCHAR(255) NOT NULL,
  filters JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  items_per_page INTEGER DEFAULT 25,
  default_sort_order VARCHAR(50) DEFAULT 'momentum',
  visible_columns TEXT[],
  theme_accents JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage_log (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255),
  plugin_source VARCHAR(100),
  success BOOLEAN,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trend_snapshots_date ON trend_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_trend_snapshots_name ON trend_snapshots(trend_name);
CREATE INDEX IF NOT EXISTS idx_watchlist_trend_id ON watchlist(trend_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON deal_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_log(created_at);
