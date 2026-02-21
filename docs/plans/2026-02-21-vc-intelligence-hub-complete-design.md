# VC Intelligence Hub - Complete Feature Design
**Date:** 2026-02-21
**Scope:** 13 Features across 5 Pages
**Target:** Production-ready VC interview platform
**Status:** Design Approved

---

## Executive Summary

This document outlines the complete design for expanding the VC Intelligence Hub from a single-page MVP into a **comprehensive 5-page intelligence platform** featuring:

- **13 integrated features** spanning trend discovery, founder evaluation, investment decision-making, historical analytics, and API integration
- **Professional UI** built with navy base, glassmorphism effects, and carefully selected accent colors
- **PostgreSQL persistence** for historical data and watchlist management
- **Automated data collection** with cost-effective API usage
- **Production-ready** with CI/CD pipelines, automated testing, and deployment

---

## Page Architecture & Feature Allocation

### Overview
```
[Discover] → [Evaluate] → [Decide] → [Track] → [Settings]
   ↓            ↓            ↓         ↓          ↓
Features:   Features:   Features:  Features:  Features:
#1,#2,#3,#4 #3,#8,#9   #5,#6,#10  #7,#12,#13  Display
                                               Prefs
```

**Navigation:** Sidebar navigation with icon + label, collapsible on mobile

---

## Page 1: DISCOVER
**Color Accent:** Slate Silver with Blue tones
**Features:** #1 (Trend Momentum), #2 (Search & Filter), #3 (Founder Details), #4 (Source Links)
**Purpose:** Initial market scanning and trend discovery

### Layout Structure

#### A. Top Section: Search & Filter Bar
```
[🔍 Search trends...] [Category Filter ▼] [Clear Filters]
```
- Search: Real-time as you type
- Multi-select category filter (checkboxes dropdown):
  - AI/ML, Fintech, Climate, Healthcare, Cybersecurity, Web3, SaaS, EdTech, Biotech, Enterprise
- Recent searches dropdown for quick access

#### B. Main Content: Trend Grid
- **Grid layout:** 3 columns on desktop, 2 on tablet, 1 on mobile
- **Card design (glassmorphic):**
  ```
  ┌─────────────────────────────────────┐
  │ [Icon] Trend Name                   │
  │ Category Badge (colored accent)      │
  │                                     │
  │ Score: 72/100  📈 +15% (momentum)  │
  │                                     │
  │ Source Links:                       │
  │ • GitHub (2 repos) • NewsAPI        │
  │ • HackerNews (15 mentions)          │
  │                                     │
  │ Founders: @john, @sarah             │
  │ [Add to Watchlist ☆]                │
  └─────────────────────────────────────┘
  ```
- **Momentum indicator (#1):**
  - Up/down arrow with color (green ↑ or red ↓)
  - % change displayed (e.g., "+15%")
  - Animation: Arrow rotates/bounces on update

#### C. Right Sidebar: Deal Discovery
- **Title:** "Recent Funding Announcements"
- **Deal cards** (scrollable list):
  ```
  Company: TrendStartup
  Funding: $5M Series A
  Date: Feb 18, 2026
  Related Trend: AI Infrastructure
  ```
- Click card → expands full deal details
- Link back to trend cards

### Interactions & Animations
- **Staggered fade-in** on load (100ms between cards)
- **Card hover:** Lift with shadow increase, color accent glow
- **Momentum arrows:** Bounce animation when score updates
- **Search results:** Fade + slide transition
- **Filter application:** Smooth fade between result sets

### Data Flow
```
GET /api/trends/scored → Trend cards
GET /api/deals → Deal sidebar
GET /api/founders → Founder links
POST /api/search → Filter results
```

---

## Page 2: EVALUATE
**Color Accent:** Rich Gold with Bronze
**Features:** #3 (Founder Details Panel, expanded), #8 (Comparative Analysis), #9 (Founder Network Graph)
**Purpose:** Deep due diligence and relationship mapping

### Layout Structure

#### A. Left Panel: Founder Network Graph (50% width)
```
Interactive node/link visualization:
- Nodes: Founders (circles) + Companies (squares)
- Links: Co-founder relationships, past employment, investments
- Size: Node size = prominence/mentions
- Color: Color-coded by sector involvement
- Interaction:
  - Hover: Node highlights, tooltip shows name + sector
  - Click: Opens founder details panel (right side)
  - Zoom/Pan: Mouse wheel + drag
```

**Founders data structure:**
```javascript
{
  id: "founder_123",
  name: "Sarah Chen",
  image: "url",
  title: "CEO at TrendStartup",
  sectors: ["AI", "Fintech"],
  connections: [
    { type: "co-founder", name: "John Doe" },
    { type: "past_company", name: "Google" }
  ],
  social: {
    twitter: "url",
    linkedin: "url",
    angellist: "url"
  }
}
```

#### B. Right Panel: Two-Tab System (50% width)

**Tab 1: Sector Comparison Heatmap**
```
Heatmap visualization:
Rows: Sectors (AI, Fintech, Climate, Healthcare, Cybersecurity, Web3, SaaS)
Columns: Regions (US, Europe, Asia, Rest of World)

Cell coloring (intensity based on momentum):
- Dark gold: High momentum (70+)
- Medium gold: Emerging (50-69)
- Light gold: Established (40-49)
- Gray: Low activity (<40)

Interaction:
- Hover: Tooltip shows exact score + top 3 trends in that combo
- Click: Drill down to trend list for that sector/region
```

**Tab 2: Founder Details Panel**
```
┌──────────────────────────────┐
│ [Founder Image]              │
│                              │
│ Sarah Chen                   │
│ CEO at TrendStartup          │
│                              │
│ Sectors: AI, Fintech         │
│ Experience: 12 years         │
│                              │
│ [🐦 Twitter] [💼 LinkedIn]  │
│ [📊 AngelList]               │
│                              │
│ ─────────────────────────── │
│ Past Companies:              │
│ • Google (2018-2021)         │
│ • Stanford (Advisor)         │
│                              │
│ Investment Track Record:     │
│ • 8 successful exits         │
│ • $200M in distributions     │
│                              │
│ Co-founder Network:          │
│ [Mini graph showing 5 people]│
└──────────────────────────────┘
```

### Interactions & Animations
- **Network graph:** Force-directed simulation (organic node movement)
- **Node interaction:** Glow effect on hover, pulse on selection
- **Heatmap:** Cell highlight on hover, tooltip fade-in
- **Panel slide:** Founder details slide in from right
- **Tab transition:** Smooth fade between tabs

### Data Flow
```
GET /api/founders → Founder network data
GET /api/founders/:id → Founder details
GET /api/trends/by-sector-region → Heatmap data
```

---

## Page 3: DECIDE
**Color Accent:** Deep Red with Pink accents
**Features:** #5 (Custom Watchlist), #6 (Investment Thesis Matcher), #10 (Deal Pipeline)
**Purpose:** Investment decision-making and opportunity tracking

### Layout Structure - Two Tabs

#### Tab 1: Investment Thesis Matcher

**A. Input Section (top, sticky):**
```
[Textarea: "Paste your investment thesis..."]
(Example: "We invest in AI + Climate, pre-Series A, US-focused")

[Load Previous ▼] [Save Thesis] [Analyze]
```

**B. Matching Results (scrollable):**
```
Thesis: "AI + Climate, pre-Series A"
Match Score: 89/100

Results (sorted by match %):
┌─────────────────────────────────────┐
│ Carbon Capture AI              89%   │
│ ✓ AI/ML (match)                      │
│ ✓ Climate (match)                    │
│ ✓ Series A signals detected          │
│                                      │
│ [Add to Watchlist] [View Trend]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Green Finance Platform         76%   │
│ ✓ Climate (match)                    │
│ ✓ Fintech signals (not AI)           │
│ ⚠ Series B (not pre-Series A)        │
│                                      │
│ [Add to Watchlist] [View Trend]      │
└─────────────────────────────────────┘

[More results...]
```

**Match explanation logic:**
- Green checkmark: Feature matches criteria
- Yellow warning: Partial match or tangential signal
- Gray: Doesn't match

#### Tab 2: Watchlist + Pipeline Funnel

**A. Watchlist Section (top 40%)**
```
[+ New] [Import CSV] [Export]

┌─────────────────────────────────────┐
│ Carbon Capture AI              ⭐⭐⭐ │
│ Category: AI/Climate                 │
│ Last mention: Feb 19, 2026           │
│ Status: Series A signals             │
│ [View Trend] [Edit Rating] [Remove]  │
└─────────────────────────────────────┘

[More watchlist items...]
```

**B. Deal Pipeline Funnel (bottom 60%)**
```
Visual funnel stages:

Stage 1: Monitoring (30 items)
│  Carbon Capture AI
│  AI Infrastructure
│  Climate Analytics
└─────────────────────

Stage 2: Emerging (15 items)
│  Green Finance
│  AI Healthcare
└──────────────

Stage 3: Active Interest (8 items)
│  BioTech Startup
│  Climate Insurance
└──────────

Stage 4: Series A (3 items)
│  TrendStartup
│  NextGen AI
└───────

Stage 5: Later Stage (2 items)
│ ScaleUp Corp
└───────

Interaction:
- Drag cards between stages (updates DB)
- Right-click context menu: Edit notes, Archive, Remove
- Card hover shows: Score, match %, last activity
```

### Interactions & Animations
- **Thesis matching:** Percentage animates from 0 to final value
- **Results appear:** Staggered fade-in with slide
- **Watchlist add:** Bounce animation into watchlist
- **Pipeline drag:** Physics-based smooth drag between stages
- **Funnel animation:** Stages resize smoothly as items move

### Data Flow
```
POST /api/thesis/match → Score trends against thesis
GET /api/watchlist → Load saved watchlist
POST /api/watchlist → Add/remove items
GET /api/pipeline → Load pipeline stages
PUT /api/pipeline/:id → Update stage
```

---

## Page 4: TRACK
**Color Accent:** Emerald Green with Teal accents
**Features:** #7 (Historical Trend Data), #12 (Export Reports), #13 (API Documentation)
**Purpose:** Analytics, reporting, and system integration

### Layout Structure - Three Tabs

#### Tab 1: Historical Trend Analysis

**A. Controls (sticky top):**
```
[Select Trend ▼] [Date Range: Feb 1 - Feb 21] [Export Chart]
```

**B. Chart Visualization:**
```
Line chart with area fill:
- X-axis: Days (Feb 1 → Feb 21)
- Y-axis: Trend Score (0-100)
- Area: Shaded under curve
- Markers: Vertical lines for funding announcements

Chart features:
- Hover: Tooltip shows date + score + mention count
- Markers pulse on hover
- Smooth animation on initial load (line draws itself)
```

**C. Trend Metadata (below chart):**
```
┌─────────────────────────────────────┐
│ Peak Score: 89/100 (Feb 18)         │
│ Peak Mentions: 247 on Feb 17        │
│ Momentum: Accelerating ⬆️            │
│ Funding Signals: 2 announcements    │
│ Source Diversity: 6 sources         │
└─────────────────────────────────────┘
```

#### Tab 2: Export Intelligence Reports

**A. Report Builder:**
```
Report Configuration:

[✓] Include Historical Charts
[✓] Include Thesis Matches
[✓] Include Founder Data
[✓] Include Sector Analysis

Format: [PDF ●] [CSV]
Date Range: [Last 30 Days ▼]
Sort By: [Momentum ▼]

[Generate Report]
```

**B. Report Preview:**
```
┌─────────────────────────────────────┐
│ VC Intelligence Report              │
│ Generated: Feb 21, 2026             │
│                                     │
│ Executive Summary                   │
│ ─────────────────────────────────   │
│ 5 peak trends identified            │
│ $45M in funding announced           │
│ 23 founder connections mapped       │
│                                     │
│ Top Opportunities                   │
│ 1. Carbon Capture AI (89/100)       │
│ 2. Green Finance (76/100)           │
│ ...                                 │
│                                     │
│ [Download PDF] [Download CSV]       │
└─────────────────────────────────────┘
```

**B. Export Progress:**
- Animated progress bar during generation
- Success toast notification

#### Tab 3: API Documentation (Swagger UI)

```
Interactive Swagger/OpenAPI documentation:

Endpoints organized by category:

📊 Trends
  GET /api/trends
    Description: Get all raw trends
    Parameters: category, limit, offset
    Example Response: [{ name, score, sources }]
    [Try it out]

  GET /api/trends/scored
    Description: Get ranked trends
    [Try it out]

💰 Deals
  GET /api/deals
    Description: Get funding announcements
    [Try it out]

👥 Founders
  GET /api/founders
    Description: Get founder data
    [Try it out]

  GET /api/founders/:id
    Description: Get founder details
    [Try it out]

📈 Historical
  GET /api/historical/:trendId
    Description: Get trend history over time
    [Try it out]

Other endpoints...

Features:
- Expandable request/response examples
- "Try it out" buttons (test endpoints live)
- Authentication info
- Rate limits
- Error codes
```

### Interactions & Animations
- **Historical chart:** Line animation (draws itself over 1 second)
- **Chart markers:** Pulse animation on hover
- **Report generation:** Progress bar animates
- **Report preview:** Sections fade in sequentially
- **Swagger endpoint:** Examples expand/collapse smoothly

### Data Flow
```
GET /api/historical/:trendId → Chart data
POST /api/export/report → Generate PDF/CSV
GET /api/health → System status
GET /api-docs → Swagger specification
```

---

## Page 5: SETTINGS
**Color Accent:** Refined Silver with Navy
**Features:** Display preferences, saved searches, system info
**Purpose:** User configuration and system status

### Layout Structure - Three Tabs

#### Tab 1: Display Preferences

```
┌─────────────────────────────────────┐
│ Display Preferences                 │
│                                     │
│ Items per page:                     │
│ [◀─────●───────▶] 25 items          │
│                                     │
│ Default Sort Order:                 │
│ ( ) Score                           │
│ ( ) Recency                         │
│ (●) Momentum                        │
│ ( ) Mentions                        │
│                                     │
│ Show Columns in Trend List:         │
│ [✓] Trend Name                      │
│ [✓] Score                           │
│ [✓] Momentum                        │
│ [✓] Funding Signals                 │
│ [✓] Founder Count                   │
│ [✓] Sources                         │
│                                     │
│ Theme Accents:                      │
│ Discover:  [Slate Silver ▼]         │
│ Evaluate:  [Rich Gold ▼]            │
│ Decide:    [Deep Red ▼]             │
│ Track:     [Emerald Green ▼]        │
│                                     │
│ [Save Preferences]                  │
└─────────────────────────────────────┘
```

#### Tab 2: Saved Searches

```
[+ New Search]

Recent Searches:
┌─────────────────────────────────────┐
│ "AI + Climate, Pre-Series A"        │
│ Filters: AI, Climate; Stage: Pre-A  │
│ [Load] [Edit] [Delete]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ "Fintech Healthcare"                │
│ Filters: Fintech, Healthcare        │
│ [Load] [Edit] [Delete]              │
└─────────────────────────────────────┘

[More saved searches...]
```

#### Tab 3: System & API Info

```
┌─────────────────────────────────────┐
│ System Status                       │
│                                     │
│ Data Sources Active:                │
│ ✓ GitHub Trending                  │
│ ✓ NewsAPI                           │
│ ✓ Serper Search                     │
│ ✓ Hacker News                       │
│ ✓ Y Combinator Scraper              │
│ ✓ SEC EDGAR                         │
│ ✓ Twitter/X Plugin                  │
│                                     │
│ Last Updated:                       │
│ Trends: Feb 21, 2:34 PM            │
│ Founders: Feb 21, 1:15 PM          │
│ Deals: Feb 21, 1:45 PM             │
│                                     │
│ Cache Statistics:                   │
│ Hit Rate: 87%                       │
│ Stored Items: 2,341                │
│ Cache Size: 12 MB                  │
│                                     │
│ Database:                           │
│ PostgreSQL: ✓ Connected             │
│ Snapshots Stored: 4,521             │
│                                     │
│ [View Full API Documentation]       │
│ [Health Check] [Clear Cache]        │
└─────────────────────────────────────┘
```

### Interactions & Animations
- **Slider:** Visual feedback while dragging
- **Toggle switches:** Smooth animation
- **Saved searches:** List items fade in
- **Status icons:** Pulse animation for active services

### Data Flow
```
GET/PUT /api/user/preferences → Load/save display settings
GET /api/saved-searches → Load saved searches
POST /api/saved-searches → Create search
DELETE /api/saved-searches/:id → Delete search
GET /api/api-status → Get active sources
GET /api/health → System health
```

---

## Visual Design System

### Color Palette

**Primary: Navy Base**
- Main background: `#0d1b2a`
- Card background: `#1a2332`
- Hover background: `#253447`
- Border subtle: `#3a4a5e`

**Accent Colors by Page:**
| Page | Primary | Secondary | Accent Text |
|------|---------|-----------|-------------|
| Discover | Slate Silver `#c0d4e8` | Blue `#5ba3d0` | `#e0eef9` |
| Evaluate | Rich Gold `#d4af37` | Bronze `#8b6f47` | `#ffe8a8` |
| Decide | Deep Red `#c41e3a` | Pink `#ff6b9d` | `#ff8fb3` |
| Track | Emerald Green `#2d8659` | Teal `#20b2aa` | `#5fd3a5` |
| Settings | Refined Silver `#b8c5d6` | Navy Blue `#253447` | `#e8eef5` |

**Text:**
- Primary text: `#e8eef5` (light)
- Secondary text: `#a0afc3` (muted)
- Hover text: `#ffffff` (bright white)

**Semantic:**
- Success: `#2d8659` (green)
- Warning: `#d4af37` (gold)
- Error: `#c41e3a` (red)
- Info: `#5ba3d0` (blue)

### Design Tokens

**Typography:**
- Headings: Inter, 600 weight, size 28-16px
- Body text: Inter, 400 weight, 14px
- Captions: Inter, 400 weight, 12px, muted color

**Spacing:**
- Page padding: 24px
- Card padding: 16px
- Component margin: 12px
- Grid gap: 16px

**Borders & Shadows:**
- Border radius: 8-12px (rounded-lg to rounded-xl)
- Card shadow: `0 4px 16px rgba(0,0,0,0.3)`
- Hover shadow: `0 8px 24px rgba(0,0,0,0.4)`
- Glow effect: Subtle colored box-shadow on accent

**Glassmorphism:**
- Backdrop blur: 8px
- Background opacity: 0.9
- Border: 1px solid rgba(255,255,255,0.1)

### Animation & Micro-interactions

**Page Transitions:**
- Fade + slide: 300ms ease-out
- Stagger: 100ms between elements

**Component Animations:**
- Button hover: Lift + shadow (100ms)
- Input focus: Glow effect + underline color change (150ms)
- Toggle switch: Smooth sliding (200ms)
- Slider drag: Live value update with visual feedback

**Data Animations:**
- Chart draw: 1s ease-out (line animation)
- Percentage counter: 0 to final value over 1s
- List item entry: Fade + slide-in (100-200ms stagger)
- Card hover: Lift + highlight (150ms)

**Loading States:**
- Skeleton screens for data loading
- Progress bar for exports
- Pulsing dots for real-time updates

---

## Database Schema (PostgreSQL)

### Tables

```sql
-- Trend snapshots for historical tracking
CREATE TABLE trend_snapshots (
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
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  trend_id VARCHAR(255) NOT NULL,
  trend_name VARCHAR(255) NOT NULL,
  trend_category VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trend_id)
);

-- Founder relationships for network graph
CREATE TABLE founder_relationships (
  id SERIAL PRIMARY KEY,
  founder_1_id VARCHAR(255) NOT NULL,
  founder_1_name VARCHAR(255) NOT NULL,
  founder_2_id VARCHAR(255) NOT NULL,
  founder_2_name VARCHAR(255) NOT NULL,
  relationship_type VARCHAR(50), -- 'co-founder', 'past_company', 'investor'
  company_shared VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(founder_1_id, founder_2_id, relationship_type)
);

-- Deal pipeline tracking
CREATE TABLE deal_pipeline (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  trend_id VARCHAR(255),
  stage VARCHAR(50) NOT NULL, -- 'monitoring', 'emerging', 'active_interest', 'series_a', 'later_stage'
  notes TEXT,
  match_score INTEGER,
  added_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved investment theses
CREATE TABLE saved_thesis (
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
CREATE TABLE saved_searches (
  id SERIAL PRIMARY KEY,
  search_name VARCHAR(255) NOT NULL,
  filters JSONB, -- Stores filter configuration as JSON
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  items_per_page INTEGER DEFAULT 25,
  default_sort_order VARCHAR(50) DEFAULT 'momentum',
  visible_columns TEXT[],
  theme_accents JSONB, -- Stores accent color preferences per page
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API usage tracking (for cost monitoring)
CREATE TABLE api_usage_log (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255),
  plugin_source VARCHAR(100),
  success BOOLEAN,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_trend_snapshots_date ON trend_snapshots(snapshot_date);
CREATE INDEX idx_trend_snapshots_name ON trend_snapshots(trend_name);
CREATE INDEX idx_watchlist_trend_id ON watchlist(trend_id);
CREATE INDEX idx_pipeline_stage ON deal_pipeline(stage);
CREATE INDEX idx_api_usage_created ON api_usage_log(created_at);
```

### Data Relationships

```
trend_snapshots ←→ deal_pipeline (trend_id)
watchlist ←→ deal_pipeline (trend_id)
founder_relationships (connects founders across trends)
saved_thesis (independent, referenced in matching logic)
saved_searches (independent, user configuration)
user_preferences (singleton, global user settings)
api_usage_log (monitoring, not user-facing)
```

---

## API Endpoints

### Trends
- `GET /api/trends` - Get all raw trends
- `GET /api/trends/scored` - Get ranked trends (sorted by score)
- `GET /api/trends/search?q=keyword` - Search trends by name

### Filters & Analysis
- `POST /api/trends/filter` - Filter by category, sector, region
- `GET /api/trends/by-sector-region` - Get heatmap data

### Founders
- `GET /api/founders` - Get all founder data
- `GET /api/founders/:id` - Get founder details
- `GET /api/founders/relationships` - Get network graph data

### Deals
- `GET /api/deals` - Get funding announcements
- `GET /api/deals/:id` - Get deal details

### Historical Data
- `GET /api/historical/:trendId` - Get trend history over time
- `GET /api/historical/stats/:trendId` - Get peak, momentum, funding signals

### Thesis Matching
- `POST /api/thesis/match` - Score trends against investment thesis
- `GET /api/thesis` - Get saved theses
- `POST /api/thesis` - Create new thesis
- `PUT /api/thesis/:id` - Update thesis
- `DELETE /api/thesis/:id` - Delete thesis

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `PUT /api/watchlist/:id` - Update watchlist item rating
- `DELETE /api/watchlist/:id` - Remove from watchlist

### Pipeline
- `GET /api/pipeline` - Get all pipeline items
- `POST /api/pipeline` - Create pipeline item
- `PUT /api/pipeline/:id` - Update pipeline stage/notes
- `DELETE /api/pipeline/:id` - Remove from pipeline

### Export & Reports
- `POST /api/export/report` - Generate PDF/CSV report

### Saved Searches
- `GET /api/saved-searches` - Get all saved searches
- `POST /api/saved-searches` - Create saved search
- `DELETE /api/saved-searches/:id` - Delete saved search

### User Preferences
- `GET /api/user/preferences` - Get preferences
- `PUT /api/user/preferences` - Update preferences

### System
- `GET /api/health` - Health check
- `GET /api/api-status` - Which data sources are active
- `GET /api/api-status/cache` - Cache hit rate and stats

---

## Data Collection Strategy

### Real Data Collection with Fallbacks

1. **Primary Sources (with API keys):**
   - GitHub Trending
   - NewsAPI
   - Serper Web Search

2. **Free Sources (always available):**
   - Hacker News
   - Y Combinator Scraper
   - SEC EDGAR

3. **New Plugin:**
   - Twitter/X (already added in recent commits)

### Cost Efficiency

- **Caching:** 4-hour TTL reduces API calls by 90%
- **Daily snapshots:** Automated PostgreSQL inserts at 00:00 UTC
- **Graceful degradation:** If API fails, system continues with available sources
- **Mock data fallback:** For testing/demo mode, uses sample data

### Cost Estimate (Monthly)
- GitHub: Free (5K req/hr limit, more than enough)
- NewsAPI: $0 (free tier with limits)
- Serper: $0 (free tier with limits)
- PostgreSQL: Free on Railway/Render (first 10GB)
- **Total: $0-50/month** (only if upgrading paid tiers)

---

## Implementation Roadmap (High-Level)

### Phase 1: Foundation & Data Layer (Days 1-2)
- PostgreSQL setup and migrations
- Trend snapshot collection (automated daily)
- Database schema deployment
- Connection from backend to PostgreSQL

### Phase 2: Quick Visual Wins (Days 3-4)
- Trend momentum arrows (#1)
- Search & filter functionality (#2)
- Founder details panel (#3)
- Source links in cards (#4)
- Deploy to Discover page

### Phase 3: Smart Analytics Pages (Days 5-7)
- Watchlist feature (#5)
- Thesis matcher (#6)
- Historical trend charts (#7)
- Comparative analysis heatmap (#8)
- Create Track & Decide pages

### Phase 4: Advanced Features (Days 8-9)
- Founder network graph (#9)
- Deal pipeline tracker (#10)
- PDF/CSV export (#12)
- API documentation (#13)
- Create Evaluate page

### Phase 5: Polish & Automation (Days 10-11)
- Settings page and preferences
- CI/CD pipelines (GitHub Actions)
- Automated testing
- Production deployment

---

## Success Criteria

- [ ] All 13 features implemented and tested
- [ ] PostgreSQL storing historical snapshots
- [ ] 5-page navigation functional
- [ ] Professional UI with navy base + accent colors
- [ ] Animations smooth (60fps)
- [ ] API costs stay under $50/month
- [ ] All tests passing (target: 80%+ coverage)
- [ ] CI/CD deploying automatically
- [ ] Production deployment working
- [ ] Interview-ready demo ready

---

## Open Questions & Decisions

None - Design fully approved.

---

**Status: APPROVED FOR IMPLEMENTATION**
**Date Approved: 2026-02-21**
**Next Step: Invoke writing-plans skill for detailed implementation roadmap**
