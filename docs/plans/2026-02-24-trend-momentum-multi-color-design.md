# Trend Momentum Multi-Color Graph Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan.

**Goal:** Enable multiple trends to display simultaneously on the Trend Momentum Over Time graph with distinct colors assigned in selection order, with dynamic color expansion beyond the initial 8-color palette.

**Architecture:** Track trend selection as an ordered array reflecting click sequence. Assign colors by position in array: 1st clicked = color 0, 2nd clicked = color 1, etc. Free up colors when trends are deselected. Generate additional colors dynamically using HSL color space when more than 8 trends are selected simultaneously.

**Tech Stack:** React (useState, useState ordering), Recharts (LineChart), color generation utilities.

---

## Design Details

### State Management

**selectedTrends** (ordered array, not Set)
- Maintains the sequence of user clicks
- Example: User clicks Climate → AI/ML → Biotech gives `[climate-id, ai-ml-id, biotech-id]`
- When user deselects a trend, remove it from array
- When user selects a trend, append to end of array

**colorPalette** (computed from selectedTrends)
- Derived state: map selectedTrends indices to colors
- Length always equals selectedTrends.length
- Color at index 0 always goes to selectedTrends[0], index 1 to selectedTrends[1], etc.

### Color Generation

**Base Palette (8 colors)**
```javascript
const BASE_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316'  // Orange
];
```

**Dynamic Color Generation (colors 9+)**
- Use HSL color space for even distribution
- When selectedTrends.length > 8:
  - For index i >= 8: calculate `hsl(hue, saturation, lightness)`
  - Hue: `(i / selectedTrends.length) * 360` degrees (full color spectrum)
  - Saturation: 75% (vibrant)
  - Lightness: 50% (balanced brightness)
- Ensures visually distinct colors across full spectrum

### Selection Flow

**toggleTrendSelection(trendId)**
```
Input: trendId being clicked
Logic:
  if trendId in selectedTrends:
    remove trendId from selectedTrends (deselect)
  else:
    append trendId to selectedTrends (select)

  Recompute colorPalette from selectedTrends
  Re-render chart
```

**Color Assignment to Lines**
```
For each displayTrend:
  if trend.id in selectedTrends:
    colorIndex = selectedTrends.indexOf(trend.id)
    lineColor = colorPalette[colorIndex]
    render Line with this color
```

### Example Sequence

```
Initial: selectedTrends = []

Click "Climate Tech":
  selectedTrends = ["climate-id"]
  colorPalette = ["#3B82F6"] (blue)
  Graph shows: 1 blue line

Click "AI/ML":
  selectedTrends = ["climate-id", "ai-id"]
  colorPalette = ["#3B82F6", "#EF4444"] (blue, red)
  Graph shows: 2 lines (climate=blue, AI/ML=red)

Click "Climate Tech" again (deselect):
  selectedTrends = ["ai-id"]
  colorPalette = ["#EF4444"] (red)
  Graph shows: 1 red line (blue is freed)

Click "Biotech":
  selectedTrends = ["ai-id", "biotech-id"]
  colorPalette = ["#EF4444", "#10B981"] (red, green)
  Graph shows: 2 lines (AI/ML=red, biotech=green)

[Select 9 trends...]
  selectedTrends.length = 9
  colorPalette[0-7] = base 8 colors
  colorPalette[8] = dynamically generated (hsl(40, 75%, 50%))
  Graph shows: 9 lines with 8 named colors + 1 generated
```

### Key Behaviors

1. **Color flows with selection order** - First trend clicked always blue, second always red (until deselected)
2. **Colors freed on deselection** - Clicking a selected trend removes it and its color
3. **No color memory** - If user deselects then re-selects same trend, it gets a fresh color based on new position
4. **Seamless expansion** - Users can select 10+ trends without UI breaking
5. **Dynamic generation deterministic** - Same selection order always produces same colors (hue based on count)

---

## Files to Modify

- `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx` - Core logic and color assignment

## Success Criteria

✅ First clicked trend displays in color #3B82F6 (blue)
✅ Second clicked trend displays in color #EF4444 (red)
✅ Each additional trend gets next color in sequence
✅ Deselecting a trend frees its color for the next trend
✅ Selecting 9+ trends generates additional distinct colors
✅ Color assignment is deterministic (same clicks = same colors)
✅ Graph updates smoothly without flashing or jitter
