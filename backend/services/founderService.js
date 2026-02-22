// Mock founder data generation (abstraction layer for future API swap)
const firstNames = ['Sarah', 'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Avery', 'Quinn', 'Blake', 'Devon', 'Skyler', 'Reese', 'Cameron', 'Dakota', 'Morgan', 'Casey', 'Jordan'];
const lastNames = ['Chen', 'Rodriguez', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Garcia', 'Martinez', 'Lee', 'Wang', 'Kim', 'Patel'];
const titles = ['CEO', 'CTO', 'Co-Founder', 'Engineering Lead', 'Product Lead', 'Founder', 'Chief Product Officer', 'VP Engineering'];
const companies = ['Google', 'Facebook', 'Amazon', 'Microsoft', 'Apple', 'Tesla', 'Stripe', 'Airbnb', 'Uber', 'Slack', 'Notion', 'Figma'];

function generateMockFounders(trend) {
  const idString = String(trend.id);
  const seed = idString.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  // 70% of trends get founders (up from 40%)
  if ((seed % 10) < 3) return [];

  const founderCount = ((seed % 3) + 1);
  const founders = [];

  for (let i = 0; i < founderCount && i < 3; i++) {
    const nameIdx = (seed + i * 131) % firstNames.length;
    const lastIdx = (seed + i * 257) % lastNames.length;
    const titleIdx = (seed + i * 383) % titles.length;
    const company1Idx = (seed + i * 449) % companies.length;
    const company2Idx = (seed + i * 563) % companies.length;
    const exits = ((seed + i * 719) % 8) + 1;
    const roi = ((seed + i * 883) % 400) + 50;

    const firstName = firstNames[nameIdx];
    const lastName = lastNames[lastIdx];
    const lowerFirst = firstName.toLowerCase();
    const lowerLast = lastName.toLowerCase();

    founders.push({
      id: `founder-${trend.id}-${i}`,
      name: `${firstName} ${lastName}`,
      title: titles[titleIdx],
      email: `${lowerFirst}.${lowerLast}@founders.io`,
      social: {
        twitter: `@${lowerFirst}${lowerLast}`,
        linkedin: `linkedin.com/in/${lowerFirst}-${lowerLast}`,
        angellist: `angel.co/u/${lowerFirst}-${lowerLast}`
      },
      sectors: [trend.category],
      pastCompanies: [
        companies[company1Idx],
        company2Idx !== company1Idx ? companies[company2Idx] : companies[(company2Idx + 1) % companies.length]
      ],
      investmentTrack: { exits: exits, averageROI: roi }
    });
  }

  return founders;
}

// Public interface (can be swapped to call LinkedIn/AngelList APIs)
export async function getFounders(trends) {
  // For now, use mock data
  // Future: Check if env var ENABLE_REAL_FOUNDER_APIs is true and APIs are configured
  // If so, call LinkedIn/AngelList APIs and fall back to mock on error

  return trends.flatMap(trend => generateMockFounders(trend));
}

// Get founders for a specific trend
export function getFoundersForTrend(trend) {
  return generateMockFounders(trend);
}

// Get all unique founders (removes duplicates by ID)
export function getUniqueFounders(founders) {
  const seen = new Set();
  return founders.filter(founder => {
    if (seen.has(founder.id)) return false;
    seen.add(founder.id);
    return true;
  });
}

// Build founder network graph data structure
export function buildFounderNetwork(founders) {
  const nodes = founders.map(founder => ({
    data: {
      id: founder.id,
      label: founder.name,
      title: founder.title,
      sectors: founder.sectors,
      pastCompanies: founder.pastCompanies,
      exits: founder.investmentTrack.exits,
      roi: founder.investmentTrack.averageROI
    }
  }));

  const edges = [];
  const edgeSet = new Set();

  // Create connections based on shared attributes
  for (let i = 0; i < founders.length; i++) {
    for (let j = i + 1; j < founders.length; j++) {
      const founder1 = founders[i];
      const founder2 = founders[j];

      let connectionStrength = 0;

      // Shared sectors
      const sharedSectors = founder1.sectors.filter(s => founder2.sectors.includes(s));
      connectionStrength += sharedSectors.length * 2;

      // Shared past companies
      const sharedCompanies = founder1.pastCompanies.filter(c => founder2.pastCompanies.includes(c));
      connectionStrength += sharedCompanies.length * 3;

      // Similar exit success (both successful or both not)
      if ((founder1.investmentTrack.exits > 3) === (founder2.investmentTrack.exits > 3)) {
        connectionStrength += 1;
      }

      // Create edge if connection exists
      if (connectionStrength > 0) {
        const edgeKey = [founder1.id, founder2.id].sort().join('-');
        if (!edgeSet.has(edgeKey)) {
          edges.push({
            data: {
              id: edgeKey,
              source: founder1.id,
              target: founder2.id,
              strength: connectionStrength
            }
          });
          edgeSet.add(edgeKey);
        }
      }
    }
  }

  return { nodes, edges };
}
