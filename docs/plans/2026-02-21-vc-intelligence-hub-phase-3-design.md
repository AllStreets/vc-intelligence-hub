# VC Intelligence Hub Phase 3 Design
## Multi-Page Navigation & Advanced Analytics

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan after this design is approved.

**Goal:** Build a 5-page analytics and portfolio management platform with sidebar navigation, real historical data tracking, and investment thesis matching for VC fund due diligence.

**Architecture:** Progressive Disclosure pattern with independent pages connected via shared state. Sidebar navigation persists across pages. Each page focuses on one primary feature set with full depth (no summaries). Per-page accent colors provide visual identity.

**Tech Stack:** React 18 frontend, Node.js/Express backend, PostgreSQL for historical snapshots, Recharts for data visualization, drag-drop library for Kanban board, SVG icons for UI consistency.

---

## Design Decisions

### Navigation & Page Structure

**Sidebar Navigation Component**
- Fixed left sidebar (w-64) with VC Intelligence Hub logo/title at top
- 5 page links with professional SVG icons and per-page accent colors:
  - Magnifying Glass Icon → DISCOVER (Silver accent)
  - Users Icon → EVALUATE (Red accent)
  - CurrencyDollarIcon → DECIDE (Gold accent)
  - ChartBarIcon → TRACK (Green accent)
  - CogIcon → SETTINGS (Neutral)
- Active page highlighted with accent color underline
- Sidebar stays visible during page navigation (persists)

**Main Content Area**
- Takes remaining screen space (flex-grow)
- Each page renders independently
- Page transitions are instant (no loading states between pages since all data cached)
- Header bar shows: Current page name + accent color bar + breadcrumb/context info

**Page Layout Pattern (Consistent Across All Pages)**
- Header: Page title, accent color bar, quick filters/actions
- Content: Main feature component(s)
- Footer: Optional pagination, export buttons, or additional info

**Per-Page Accent Colors**
- Discover → Silver (#C0C0C0 or Tailwind slate-300)
- Evaluate → Red (#DC2626 or Tailwind red-600)
- Decide → Gold (#FBBF24 or Tailwind amber-400)
- Track → Green (#10B981 or Tailwind emerald-500)
- Settings → Neutral (keep current navy theme)

---

## Page Designs

### Page 1: DISCOVER (Existing, Enhanced)
Current trends page with momentum visualization, search/filter, founder details, source links. Silver accent color applied to interactive elements and headers.

### Page 2: EVALUATE (New) - Red Accent

**Founder Network Graph**
- Interactive visualization showing relationships between founders across trends
- Each founder = node (avatar initial + name)
- Connections = shared sectors or past companies
- Click founder node → opens founder detail panel
- Color by sector (AI/ML=indigo, Fintech=pink, Climate=emerald, etc.)
- Shows: "Network of 100+ founders across 155 trends - discover repeat investors and successful founder teams"
- Data source: Seeded mock data generation (deterministic, 100+ founders from 70% of trends)
- Architecture supports future swap to LinkedIn/AngelList APIs

**Sector Heatmap**
- 10x10 grid showing sectors vs. trend momentum
- Y-axis: 10 sectors (AI/ML, Fintech, Climate, Healthcare, Cybersecurity, Web3, SaaS, EdTech, Biotech, Enterprise)
- X-axis: Momentum score ranges (0-10, 11-20, 21-30, etc.)
- Cell color intensity = number of trends in that bracket
- Hover cell → see list of trends in that bracket
- Red accent color on headers/highlights

**Layout**
- Two-column layout on wide screens, stacked on mobile
- Founder network on left (60%), sector heatmap on right (40%)
- Both interactive and interconnected

### Page 3: DECIDE (New) - Gold Accent

**Investment Thesis Matcher**
- User sets preferences (saved in `saved_thesis` table):
  - Target sectors: Multi-select (AI/ML, Fintech, etc.)
  - Funding stage: Seed, Series A, Series B, Series C, IPO
  - Min momentum score threshold (0-100 slider)
  - Founder quality filter: Min exits, min ROI %
- System scores each trend/deal against thesis (0-100% match)
- Results show: Trend name + match % + reason ("Matches 3/4 criteria: AI/ML ✓, Series B ✓, high founder quality ✓")
- Color-coded: 80-100%=gold, 60-79%=amber, <60%=gray
- Save multiple thesis profiles (Aggressive Growth, Conservative, Climate Focus)

**Custom Watchlist**
- List view of saved trends with ratings (1-5 stars)
- Inline edit rating by clicking stars
- Add notes per trend (text field, saved to DB)
- Quick actions: Remove, share, export
- Sort by: date added, rating, momentum score

**Deal Pipeline Tracker**
- Kanban-style board with 4 columns: Prospecting, Evaluating, Due Diligence, Ready to Invest
- Drag deals between columns to update status (saves to `deal_pipeline` table)
- Each deal card shows: company name, funding type, momentum, founder quality badge
- Click card → see full deal details + related founder info
- Gold accent color on headers/buttons

**Layout**
- Tabs or toggle: Thesis Matcher | Watchlist | Deal Pipeline
- Gold accent color throughout

### Page 4: TRACK (New) - Green Accent

**Historical Trend Analysis**
- Line chart: Trend momentum over 30 days (pulls real data from `trend_snapshots` table)
- X-axis: Date (last 30 days)
- Y-axis: Momentum score (0-100)
- One line per selected trend (multi-select dropdown to choose which trends to compare)
- Hover: Show exact values, date, mention count
- Export button: Save chart as PNG or PDF

**Category Distribution Over Time**
- Stacked area chart: How sector momentum shifted over 30 days
- X-axis: Date
- Y-axis: Avg momentum per sector
- Color by sector (AI/ML=indigo, Fintech=pink, etc.)
- Shows market trends: Which sectors heating up, cooling down
- Helps answer: "Is AI/ML still hot or shifting to Climate tech?"

**Trends Rising/Falling**
- Table showing: Trend name, momentum change (%), 30-day trajectory, current score
- Sort by: Biggest rise, biggest fall, newest trends
- Click trend row → see historical chart for that trend specifically

**Export Reports**
- Generate PDF report with:
  - Selected time period
  - All charts
  - Summary statistics
  - Watchlist status
- CSV export: Historical data table for external analysis
- Green accent color on headers/buttons

**Layout**
- Charts stack vertically on primary view
- Sidebar: Date range picker (default 30 days), trend/sector filters
- Green accent throughout

### Page 5: SETTINGS (New) - Neutral Accent

**Display Preferences**
- Theme: Dark mode (default), light mode option, auto mode
- Accent color preference: Allow user to override default per-page colors (optional)
- Default momentum threshold: Set what counts as "hot" trend
- Notification preferences: Email alerts for watchlist changes, new high-momentum trends, etc.
- Saved to `user_preferences` table

**Saved Searches**
- Create/manage saved search filters (stored in `saved_searches` table)
- Each saved search = name + category filters + search query
- Quick apply: Click saved search → instantly filter trends/deals
- Example: "AI Series B", "High Founder Quality", "Climate Tech Emerging"
- Edit/delete existing searches

**Investment Thesis Presets**
- Save multiple investment thesis profiles (stored in `saved_thesis` table)
- Switch between profiles: "Aggressive Growth", "Conservative", "Climate Focus"
- Each profile remembers: Sectors, stage, momentum threshold, founder quality filters
- Quick-apply for Thesis Matcher on DECIDE page

**System Information**
- Data sources connected: Show which plugins active, API status (green/yellow/gray)
- Last snapshot: When historical data was last captured
- Trends loaded: Total count, last updated timestamp
- Database status: Connected/disconnected
- Help/documentation links

**Layout**
- Accordion sections: Display, Saved Searches, Thesis Presets, System Info
- Each accordion expands independently
- Save button for preferences, auto-save for searches

---

## Data Architecture

### Founder Service Layer

**Current Implementation (Mock Data)**
- `founderService.getFounders()` returns 100+ deterministic seeded founders
- 70% of trends generate 1-3 founders each
- Connections based on shared attributes: sectors, past companies, similar exit success

**Future API Swap (LinkedIn/AngelList)**
- Implementation swaps to call external APIs
- Interface stays identical: `founderService.getFounders()` returns same data structure
- Graceful fallback: If API fails, returns mock data automatically
- No app breakage, no errors to user

**Configuration**
```javascript
const useRealAPIs = process.env.ENABLE_REAL_FOUNDER_APIs === 'true'
  && process.env.LINKEDIN_API_KEY
  && process.env.ANGELLIST_API_KEY;
```

### Database Requirements

Existing tables from Phase 1 support all Phase 3 features:
- `trend_snapshots` - Historical trend data for TRACK page charts
- `watchlist` - Custom watchlist items for DECIDE page
- `deal_pipeline` - Deal status tracking for Kanban board
- `saved_thesis` - Investment thesis profiles for DECIDE page
- `saved_searches` - Saved filter combinations for SETTINGS page
- `user_preferences` - Display and notification settings
- `api_usage_log` - System information tracking

No new tables required.

---

## Feature Priority & Phasing

**Analytics-First Focus**
- EVALUATE page gets premium attention (founder networks, sector heatmaps)
- TRACK page gets full implementation (real historical data, exports)
- DECIDE and SETTINGS get built complete (not minimal)
- All 5 pages polished and interconnected
- No unfinished features

---

## No External Dependencies

**All features work with seeded mock data**
- App runs without LinkedIn/AngelList APIs
- Graceful degradation if future APIs added
- Zero required external service dependencies

---

## Success Criteria

✅ 5-page navigation system fully functional
✅ Each page has distinct accent color and identity
✅ Founder network shows 100+ interconnected nodes
✅ Historical charts pull real data from `trend_snapshots`
✅ Investment thesis matcher scores trends/deals
✅ Watchlist and deal pipeline persist to database
✅ Settings save user preferences
✅ All pages interconnected (trend click → founder details → thesis match)
✅ No unfinished features
✅ Ready for VC fund interview presentation
