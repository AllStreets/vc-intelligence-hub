# Current Momentum Score Analysis

## Current Distribution
- Min: 10
- Max: 34
- Count: 154
- Mean: 14.60
- Median: 14.00
- Standard Deviation: 3.53

## Distribution Breakdown
The actual scores cluster heavily around a single value:

| Score | Count | Percentage |
|-------|-------|-----------|
| 10    | 9     | 5.8%      |
| 11    | 5     | 3.2%      |
| 12    | 5     | 3.2%      |
| 13    | 8     | 5.2%      |
| **14** | **98** | **63.6%** |
| 15    | 8     | 5.2%      |
| 16    | 1     | 0.6%      |
| 17    | 8     | 5.2%      |
| 19    | 3     | 1.9%      |
| 22    | 3     | 1.9%      |
| 24    | 1     | 0.6%      |
| 25    | 1     | 0.6%      |
| 26    | 1     | 0.6%      |
| 29    | 1     | 0.6%      |
| 34    | 2     | 1.3%      |

## Root Cause: Baseline Values Create Floor

The scoring algorithm uses hardcoded baselines that prevent low scores and create artificial clustering:

### Baseline Components (in momentum_score calculation):
- Velocity baseline: Minimum base of 10 pts (ensures all trends get minimum 10)
- Mention velocity increases this to ~14-15 when even with minimal mentions
- Source diversity, funding signals, and other factors add incrementally
- **Total floor: ~10 pts minimum before other scoring factors**

### Why Scores Cluster at 14:
- Most trends fall into the "low baseline" category with minimal activity
- Without significant velocity (mentions) or diversity, trends are scored at the baseline + small increments
- 63.6% of all trends score exactly 14, indicating a dominant mode where most factors are at their minimum
- This creates an unnatural spike rather than a bell-curve distribution

## Missing Range

- Full desired range: 1-99 (allowing meaningful differentiation)
- Actual range used: 10-34 (only 25 possible values)
- Missing: 1-9, 35-99 (73% of available range)
- **Current range utilization: Only 25% of desired 1-99 range**

### Problems with Current Distribution:

1. **Lack of differentiation**: 63.6% of trends have identical score (14)
2. **Not using full scale**: Only 25 out of 100 possible values are used
3. **Poor signal quality**: Momentum score fails to meaningfully distinguish between different trend strengths
4. **Biased distribution**: Heavily weighted toward low-activity trends instead of bell-curve

## Solution Direction

Eliminate artificial baselines and implement percentile-based mapping to:
1. Allow full 1-99 range usage
2. Create bell-curve distribution where scores naturally spread across range
3. Maintain deterministic scoring (same inputs always produce same scores)
4. Use percentile ranking relative to all trends to create meaningful differentiation

### Key Change:
Instead of summing components with fixed baselines, calculate percentile ranking of each component, then combine percentiles using weighted formula:

```
momentum_score = ceil(percentile_combination * 99)
```

This ensures:
- All 1-99 values can theoretically be used
- Distribution naturally spreads across full range
- High-momentum trends get high scores
- Low-momentum trends get low scores
- No artificial clustering at single values

See implementation plan in: `/Users/connorevans/Downloads/vc-tool/docs/plans/2026-02-24-enhanced-momentum-distribution.md`
