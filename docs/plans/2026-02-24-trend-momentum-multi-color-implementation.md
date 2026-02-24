# Trend Momentum Multi-Color Graph Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement order-based color assignment for multiple trends on the Track page momentum graph, where the first clicked trend gets the first color, with dynamic color expansion using HSL generation for more than 8 simultaneous trends.

**Architecture:** Convert selectedTrends from a Set to an ordered array that tracks click sequence. Compute colorPalette as a derived array mapping indices to colors. Add HSL color generation function for colors 9+. Assign line colors based on trend's position in the selectedTrends array.

**Tech Stack:** React (useState), Recharts (LineChart, Line), HSL color generation (no new dependencies).

---

## Task 1: Add Color Generation Helper Function

**Files:**
- Modify: `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx` (add helper function before component)

**Step 1: Add generateColor helper function**

Add this function right after the imports and before the component definition:

```javascript
// Generate color for index position
// Colors 0-7 use predefined palette
// Colors 8+ generate dynamically using HSL spectrum spread
const generateColor = (index, totalCount = index + 1) => {
  const baseColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  if (index < baseColors.length) {
    return baseColors[index];
  }

  // For colors beyond 8, use HSL color space
  // Distribute across full color spectrum (0-360 degrees)
  const hue = (index / totalCount) * 360;
  const saturation = 75;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
```

**Step 2: Verify function logic**

The function should:
- Return `#3B82F6` (blue) for index 0
- Return `#EF4444` (red) for index 1
- Return dynamically generated hsl() color for index 8+
- Take totalCount parameter to ensure colors are distributed across full spectrum

**Step 3: Commit**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add frontend/src/components/TrendHistoryChart.jsx
git commit -m "feat: add generateColor helper for dynamic color generation"
```

---

## Task 2: Convert selectedTrends from Toggle Set to Ordered Array

**Files:**
- Modify: `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx` (line 6)

**Step 1: Update selectedTrends state initialization**

Change line 6 from:
```javascript
const [selectedTrends, setSelectedTrends] = useState([]);
```

To:
```javascript
const [selectedTrends, setSelectedTrends] = useState([]); // ordered array maintaining click sequence
```

(The state declaration is already an array, but the comment clarifies the new behavior)

**Step 2: Update the auto-selection logic**

Lines 18-19 currently auto-select first 3 trends. Keep this but ensure it's an ordered array:

```javascript
// Auto-select first 3 trends (as ordered array)
setSelectedTrends(topTrends.slice(0, 3).map(t => t.id));
```

This is already correct - it creates an ordered array `[id1, id2, id3]`.

**Step 3: Verify state shape**

selectedTrends should be:
- Array of trend IDs: `["trend-1", "trend-2", "trend-3"]`
- NOT a Set or object
- Maintains insertion order
- Can have duplicates removed (won't in this logic, but array supports it)

**Step 4: Commit**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add frontend/src/components/TrendHistoryChart.jsx
git commit -m "refactor: document selectedTrends as ordered array"
```

---

## Task 3: Update toggleTrendSelection to Maintain Order

**Files:**
- Modify: `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx` (lines 52-58)

**Step 1: Replace toggleTrendSelection function**

Replace lines 52-58 with:

```javascript
const toggleTrendSelection = (trendId) => {
  setSelectedTrends(prev => {
    if (prev.includes(trendId)) {
      // Trend already selected - remove it (deselect)
      return prev.filter(t => t !== trendId);
    } else {
      // Trend not selected - append to end (maintain order)
      return [...prev, trendId];
    }
  });
};
```

**Step 2: Verify behavior**

Test the logic:
- If trend "climate" not in `[ai, biotech]` → result should be `[ai, biotech, climate]` ✓
- If trend "climate" already in `[climate, ai, biotech]` → result should be `[ai, biotech]` ✓
- Maintains strict order based on click sequence ✓

**Step 3: Commit**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add frontend/src/components/TrendHistoryChart.jsx
git commit -m "feat: toggle selection maintains order for color assignment"
```

---

## Task 4: Add colorPalette Derived State

**Files:**
- Modify: `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx` (after line 26, inside useEffect)

**Step 1: Add colorPalette computation to useEffect**

Add this code right after the `setData(mockData)` line (after line 23):

```javascript
// Compute color palette based on selection order
const palette = selectedTrends.map((_, index) =>
  generateColor(index, selectedTrends.length)
);
setColorPalette(palette);
```

Wait, we need to add colorPalette state first. Let me revise:

**Step 1b: Add colorPalette state (before useEffect)**

Add this line right after line 8 (after `setLoading`):

```javascript
const [colorPalette, setColorPalette] = useState([]);
```

**Step 2: Add palette computation in useEffect**

Now add the computation in the useEffect. After line 23 where `setData` is called, add:

```javascript
      // Compute color palette based on order of selected trends
      const palette = topTrends.slice(0, 3).map((_, index) =>
        generateColor(index, 3)
      );
      setColorPalette(palette);
```

**Step 3: Update useEffect dependency**

The useEffect already has proper dependencies `[trends, dateRange]`.

**Step 4: Add palette recomputation when selectedTrends changes**

Add a new useEffect after the existing one:

```javascript
useEffect(() => {
  // Recompute palette whenever selected trends change
  const palette = selectedTrends.map((_, index) =>
    generateColor(index, selectedTrends.length)
  );
  setColorPalette(palette);
}, [selectedTrends]);
```

**Step 5: Commit**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add frontend/src/components/TrendHistoryChart.jsx
git commit -m "feat: add colorPalette derived state computed from selection order"
```

---

## Task 5: Update Line Rendering to Use Order-Based Colors

**Files:**
- Modify: `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx` (lines 97-110)

**Step 1: Update Line rendering logic**

Replace lines 97-110 with:

```javascript
{displayTrends.map((trend, idx) => {
  // Check if this trend is selected
  const selectedIndex = selectedTrends.indexOf(trend.id);

  // Only render line if trend is selected
  if (selectedIndex === -1) {
    return null;
  }

  // Get color from palette based on selection order, not display order
  const colorIndex = selectedIndex;
  const lineColor = colorPalette[colorIndex] || generateColor(colorIndex, selectedTrends.length);

  return (
    <Line
      key={trend.id}
      type="monotone"
      dataKey={trend.id}
      stroke={lineColor}
      dot={false}
      strokeWidth={2}
      isAnimationActive={false}
      name={trend.name}
    />
  );
})}
```

**Step 2: Verify color assignment logic**

Test mentally:
- If selectedTrends = `["climate-id", "ai-id"]` and colorPalette = `["#3B82F6", "#EF4444"]`
- When rendering climate trend: selectedIndex = 0, colorIndex = 0, lineColor = `#3B82F6` (blue) ✓
- When rendering ai trend: selectedIndex = 1, colorIndex = 1, lineColor = `#EF4444` (red) ✓
- When rendering unselected trend: selectedIndex = -1, return null (not rendered) ✓

**Step 3: Commit**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add frontend/src/components/TrendHistoryChart.jsx
git commit -m "feat: assign line colors based on selection order, not display order"
```

---

## Task 6: Test Locally

**Files:**
- Test: `/Users/connorevans/Downloads/vc-tool/frontend`

**Step 1: Start the dev server**

```bash
cd /Users/connorevans/Downloads/vc-tool/frontend
npm run dev
```

Expected: Server starts on http://localhost:5174 without errors

**Step 2: Navigate to Track page**

Open browser to: `http://localhost:5174/track`

**Step 3: Test basic multi-trend selection**

1. View the "Trend Momentum Over Time" graph
2. You should see 3 trends pre-selected (blue, red, green lines)
3. Click on a 4th trend in the button list → Should appear as amber line
4. Click on the blue trend's button → Should disappear from graph
5. Click on a 5th trend → Should appear as purple line

**Step 4: Test color ordering**

1. Deselect all trends (click their buttons to remove them)
2. Click trends in specific order: "Climate Tech" → "AI/ML" → "Biotech"
3. Verify colors in order: Blue → Red → Green
4. Deselect "Climate Tech" (remove blue)
5. Click "FinTech"
6. Verify order is now: Red (AI/ML), Green (Biotech), Amber (FinTech)

**Step 5: Test dynamic color generation**

1. Keep selecting trends until you have 9+ selected
2. Verify:
   - First 8 trends use named colors (blue, red, green, amber, purple, pink, teal, orange)
   - 9th+ trends use generated hsl() colors
   - All lines are visually distinct
   - No console errors

**Step 6: Verify no console errors**

Check browser console (F12 → Console tab):
- Should see no red error messages
- May see normal React development warnings (acceptable)

**Step 7: Commit**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add frontend/src/components/TrendHistoryChart.jsx
git commit -m "test: verify multi-color trend selection works as expected"
```

---

## Task 7: Push to GitHub

**Files:**
- Modified: `/Users/connorevans/Downloads/vc-tool/frontend/src/components/TrendHistoryChart.jsx`

**Step 1: Review changes**

```bash
cd /Users/connorevans/Downloads/vc-tool
git status
```

Expected: Shows TrendHistoryChart.jsx as modified

**Step 2: Check diff**

```bash
git diff frontend/src/components/TrendHistoryChart.jsx
```

Expected: Shows color generation function, order-based selection, and palette-based rendering

**Step 3: Push to GitHub**

```bash
git push origin main
```

Expected: Push succeeds with no conflicts

**Step 4: Verify on GitHub**

Visit your GitHub repo and verify the commits are visible.

**Step 5: Commit design doc**

```bash
cd /Users/connorevans/Downloads/vc-tool
git add docs/plans/2026-02-24-trend-momentum-multi-color-design.md
git commit -m "docs: add design for multi-color trend momentum graph"
git push origin main
```

---

## Verification Checklist

After all tasks complete:

- ✅ First clicked trend displays in blue (#3B82F6)
- ✅ Second clicked trend displays in red (#EF4444)
- ✅ Third clicked trend displays in green (#10B981)
- ✅ Colors freed on deselection (clicking trend again removes it)
- ✅ Newly selected trend gets next color in sequence
- ✅ 9+ trends generate distinct HSL colors
- ✅ No console errors
- ✅ All commits pushed to GitHub

---

## Files Summary

| File | Changes | Type |
|------|---------|------|
| `/frontend/src/components/TrendHistoryChart.jsx` | Add generateColor(), convert toggleTrendSelection to maintain order, add colorPalette state, update Line rendering to use order-based colors | Implementation |

## Dependencies

- No new npm packages required
- No API changes required
- No database changes required

---
