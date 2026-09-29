import type { ResidentDashboard as DashboardData } from '../types';

export interface WaterTip {
  id: string;
  category: 'BATHROOM' | 'KITCHEN' | 'LAUNDRY' | 'LEAKS' | 'HABITS';
  title: string;
  description: string;
  actionSteps: string[];
  potentialSavingsKl: number;
  potentialSavingsLiters: number;
  potentialSavingsInr: number;
  difficulty: 'Easy' | 'Moderate' | 'High Impact';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  isAiGenerated: boolean;
  adopted?: boolean;
}

export interface HouseholdProfileForTips {
  flatNumber: string;
  apartmentName: string;
  occupancyCount: number;
  currentMonthUsageKl: number;
  apartmentAvgUsageKl: number;
  currentSlabName: string;
  currentSlabRate: number;
  activeAlertsCount: number;
  hasLeakAlert: boolean;
  hasOveruseAlert: boolean;
  recentLogs?: Array<{ readingDate?: string; consumptionKl: number }>;
  usageTrends?: Array<{ label: string; consumptionKl: number; communityAvgKl: number }>;
}

export interface TopHouseholdInsight {
  headline: string;
  subtext: string;
  lpcd: number;
  diffPercent: number;
  isOverusing: boolean;
  recommendedAction: string;
  potentialSavingsKl: number;
  potentialSavingsInr: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
}

const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Generate smart personalized algorithmic tips based on exact household water profile
 */
export const generateContextualFallbackTips = (
  profile: HouseholdProfileForTips,
  focusCategory: string = 'ALL'
): WaterTip[] => {
  const currentUsage = profile.currentMonthUsageKl || 12.0;
  const avgUsage = profile.apartmentAvgUsageKl || 11.2;
  const isHighUsage = currentUsage > avgUsage || profile.hasOveruseAlert;
  const rate = profile.currentSlabRate || 28;
  const occupancy = profile.occupancyCount || 3;
  const lpcd = Math.round((currentUsage * 1000) / (30 * occupancy));

  const allTips: WaterTip[] = [];

  // 1. Critical Leak tip if leak detected or usage > society avg
  if (profile.hasLeakAlert || isHighUsage) {
    const leakSavingsKl = Math.max(3.5, Math.round((currentUsage - avgUsage) * 0.7 * 10) / 10);
    allTips.push({
      id: 'tip-leak-audit',
      category: 'LEAKS',
      title: profile.hasLeakAlert ? '⚠️ Immediate Action: Active Pipe/Flapper Leak Check' : 'Internal Plumbing & Zero-Flow Night Audit',
      description: `Your unit (Flat ${profile.flatNumber}) recorded ${currentUsage.toFixed(1)} kL this month (~${lpcd} Liters/person/day), which is ${currentUsage > avgUsage ? `${Math.round(((currentUsage - avgUsage) / avgUsage) * 100)}% above society average` : 'nearing higher slab tiers'}. A silent toilet flapper or mixer drip wastes 150–300 Liters every single day.`,
      actionSteps: [
        'Check your sub-meter dial before sleeping and immediately upon waking (zero-flow test with all taps closed).',
        'Place 4 drops of food color in the toilet flush tank; check if dye seeps into bowl without flushing.',
        'Inspect kitchen stop-cock valves, shower wall mixers, and washing machine inlet lines for slow seepage.',
      ],
      potentialSavingsKl: leakSavingsKl,
      potentialSavingsLiters: Math.round(leakSavingsKl * 1000),
      potentialSavingsInr: Math.round(leakSavingsKl * rate),
      difficulty: 'High Impact',
      priority: profile.hasLeakAlert ? 'CRITICAL' : 'HIGH',
      isAiGenerated: false,
    });
  }

  // 2. Bathroom Aerators & Showers
  const aeratorSavingsKl = Math.round(occupancy * 1.8 * 10) / 10;
  allTips.push({
    id: 'tip-bathroom-aerator',
    category: 'BATHROOM',
    title: 'Install 3.5 L/min Low-Flow Faucet Aerators',
    description: `With ${occupancy} occupants in Flat ${profile.flatNumber}, basin taps run for ~25 minutes combined daily. Replacing standard 12 L/min aerators with 3.5 L/min aerators cuts tap volume by 70% while keeping high pressure.`,
    actionSteps: [
      'Unscrew the existing round nozzle from bathroom washbasins and kitchen faucets.',
      'Fit standard M24/M22 3.5 L/min air-injection aerators.',
      `Saves approximately ${Math.round(occupancy * 60)} Liters per day for your ${occupancy}-person household.`,
    ],
    potentialSavingsKl: aeratorSavingsKl,
    potentialSavingsLiters: Math.round(aeratorSavingsKl * 1000),
    potentialSavingsInr: Math.round(aeratorSavingsKl * rate),
    difficulty: 'Easy',
    priority: 'HIGH',
    isAiGenerated: false,
  });

  // 3. RO Water Wastewater Recycling
  const roSavingsKl = Math.round(Math.min(currentUsage * 0.22, 3.5) * 10) / 10;
  allTips.push({
    id: 'tip-ro-recovery',
    category: 'KITCHEN',
    title: 'RO Purifier Reject Line Reclamation',
    description: `RO purifiers discard 2.5–3 Liters of wastewater for every 1 Liter of drinking water. In Flat ${profile.flatNumber}, this sends ~${Math.round(roSavingsKl * 1000).toLocaleString()} Liters of usable water directly down the drain each month.`,
    actionSteps: [
      'Extend the white RO reject hose into a dedicated 20-Liter balcony or utility bucket.',
      'Use the collected reject water for floor mopping, utensil pre-rinsing, and balcony plant watering.',
      'Directly prevents metered consumption from jumping into higher tariff slabs.',
    ],
    potentialSavingsKl: roSavingsKl,
    potentialSavingsLiters: Math.round(roSavingsKl * 1000),
    potentialSavingsInr: Math.round(roSavingsKl * rate),
    difficulty: 'Moderate',
    priority: 'HIGH',
    isAiGenerated: false,
  });

  // 4. Laundry / Washing Machine Full Loads
  allTips.push({
    id: 'tip-laundry-opt',
    category: 'LAUNDRY',
    title: 'Consolidate Laundry into Full-Load Eco Cycles',
    description: `Washing machines consume 50–120 Liters per cycle regardless of load size. Running 2 full loads instead of 4 half-loads per week saves ~2,100 Liters each month for Flat ${profile.flatNumber}.`,
    actionSteps: [
      'Wait for a full laundry batch before running wash cycles.',
      'Select the "Eco 40-60" setting to eliminate redundant wash & rinse water draws.',
      'Inspect the rear drain pipe for unmetered continuous siphon outflow.',
    ],
    potentialSavingsKl: 2.1,
    potentialSavingsLiters: 2100,
    potentialSavingsInr: Math.round(2.1 * rate),
    difficulty: 'Easy',
    priority: 'NORMAL',
    isAiGenerated: false,
  });

  // 5. Shower Duration Reduction
  const showerSavingsKl = Math.round(occupancy * 1.2 * 10) / 10;
  allTips.push({
    id: 'tip-shower-timer',
    category: 'BATHROOM',
    title: 'The 4-Minute Shower / Bucket Bath Habit',
    description: `Overhead showers discharge 10–14 L/min. Trimming daily shower time from 8 minutes to 4 minutes across ${occupancy} occupants cuts ~${Math.round(showerSavingsKl * 1000).toLocaleString()} Liters per month.`,
    actionSteps: [
      'Use a 4-minute timer or smartphone reminder while showering.',
      'Turn off the shower valve while lathering shampoo or soap.',
      'Switch to traditional 15-Liter bucket baths for guaranteed water conservation.',
    ],
    potentialSavingsKl: showerSavingsKl,
    potentialSavingsLiters: Math.round(showerSavingsKl * 1000),
    potentialSavingsInr: Math.round(showerSavingsKl * rate),
    difficulty: 'Easy',
    priority: 'NORMAL',
    isAiGenerated: false,
  });

  // 6. Dual-Flush Cistern Optimization
  allTips.push({
    id: 'tip-cistern-weight',
    category: 'BATHROOM',
    title: 'Dual-Flush Button & Cistern Displacement',
    description: `Single-flush cisterns consume 9–10 Liters per flush. Optimizing toilet flushes saves 4–5 Liters on every flush, totaling ~2,400 Liters/month in Flat ${profile.flatNumber}.`,
    actionSteps: [
      'Use the half-flush button for liquid waste (uses only 3 Liters).',
      'For standard tanks, place a sealed 1-Liter water bottle inside the cistern to displace volume automatically.',
      'Saves ~1 Liter on every single flush with zero effort.',
    ],
    potentialSavingsKl: 2.4,
    potentialSavingsLiters: 2400,
    potentialSavingsInr: Math.round(2.4 * rate),
    difficulty: 'Moderate',
    priority: 'HIGH',
    isAiGenerated: false,
  });

  if (focusCategory === 'ALL') {
    return allTips;
  }
  return allTips.filter((t) => t.category === focusCategory);
};

/**
 * Call Gemini AI to generate customized water conservation tips based on real-time household data
 */
export const fetchGeminiPersonalizedTips = async (
  profile: HouseholdProfileForTips,
  focusCategory: string = 'ALL',
  customGoal: string = '',
  language: string = 'EN'
): Promise<WaterTip[]> => {
  const apiKey = localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_KEY;

  const currentUsage = profile.currentMonthUsageKl || 12.0;
  const avgUsage = profile.apartmentAvgUsageKl || 11.2;
  const occupancy = profile.occupancyCount || 3;
  const currentLiters = Math.round(currentUsage * 1000);
  const avgLiters = Math.round(avgUsage * 1000);
  const lpcd = Math.round(currentLiters / (30 * occupancy));
  const diffPercent = Math.round(((currentUsage - avgUsage) / (avgUsage || 1)) * 100);
  const rate = profile.currentSlabRate || 28;

  const promptText = `
You are an expert Smart Water Metering & Conservation AI for the JalSetu residential IoT platform.

Analyze the following REAL-TIME HOUSEHOLD WATER CONSUMPTION DATA:
- Apartment Community: ${profile.apartmentName}
- Unit: Flat ${profile.flatNumber}
- Occupancy: ${occupancy} persons
- Current Month Water Usage: ${currentUsage.toFixed(2)} kL (${currentLiters.toLocaleString()} Liters)
- Apartment Community Average: ${avgUsage.toFixed(2)} kL (${avgLiters.toLocaleString()} Liters)
- Peer Benchmark Status: ${diffPercent >= 0 ? `+${diffPercent}% HIGHER than society average` : `${Math.abs(diffPercent)}% LOWER than society average (Conserving)`}
- Daily Per-Capita Usage (LPCD): ~${lpcd} Liters/person/day (National standard benchmark is 135 LPCD)
- Active Tariff Slab: ${profile.currentSlabName} (Billing Rate: ₹${rate}/kL)
- Has Active Leak Alert: ${profile.hasLeakAlert ? 'YES (Statistical spike detected - URGENT)' : 'NO'}
- Has Active Overuse Alert: ${profile.hasOveruseAlert ? 'YES (Exceeded baseline threshold)' : 'NO'}
- User Focus Filter: ${focusCategory} ${customGoal ? `| Custom Goal: ${customGoal}` : ''}
- Response Language Code: ${language}

Task:
Generate 5 distinct, highly realistic, actionable water conservation tips specifically tailored to Flat ${profile.flatNumber}'s exact consumption (${currentUsage.toFixed(1)} kL, ${lpcd} LPCD for ${occupancy} people, ${diffPercent >= 0 ? 'above' : 'below'} average).
- The description MUST explicitly cite Flat ${profile.flatNumber}'s metrics, occupant count, and tariff rate where applicable.
- If there is a leak alert or consumption is higher than average, include urgent diagnostic steps.
- Calculate realistic potential monthly savings in Liters (potentialSavingsLiters) and cost reduction in Rupees (potentialSavingsInr = potentialSavingsKl * ${rate}).
- Categorize among BATHROOM, KITCHEN, LAUNDRY, LEAKS, HABITS.

Return ONLY a valid JSON array of objects with the exact schema below (no markdown preamble, no code ticks, just raw JSON):

[
  {
    "id": "tip-1",
    "category": "BATHROOM" | "KITCHEN" | "LAUNDRY" | "LEAKS" | "HABITS",
    "title": "Clear action title",
    "description": "Specific context-aware explanation citing Flat ${profile.flatNumber}'s metrics",
    "actionSteps": ["Step 1", "Step 2", "Step 3"],
    "potentialSavingsKl": 2.5,
    "potentialSavingsLiters": 2500,
    "potentialSavingsInr": 70,
    "difficulty": "Easy" | "Moderate" | "High Impact",
    "priority": "CRITICAL" | "HIGH" | "NORMAL"
  }
]
`;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest'];

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        continue;
      }

      const resJson = await response.json();
      const rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawContent && rawContent.trim().length > 0) {
        // Strip possible ```json ``` markdown wrapper
        const cleanJson = rawContent
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed: any[] = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => {
            const savingsKl = Number(item.potentialSavingsKl) || 1.8;
            return {
              id: item.id || `gemini-tip-${idx + 1}`,
              category: ['BATHROOM', 'KITCHEN', 'LAUNDRY', 'LEAKS', 'HABITS'].includes(item.category)
                ? item.category
                : 'HABITS',
              title: item.title || 'Water Conservation Habit',
              description: item.description || 'Personalized action to reduce monthly water consumption.',
              actionSteps: Array.isArray(item.actionSteps) && item.actionSteps.length > 0
                ? item.actionSteps
                : [item.description],
              potentialSavingsKl: savingsKl,
              potentialSavingsLiters: Number(item.potentialSavingsLiters) || Math.round(savingsKl * 1000),
              potentialSavingsInr: Number(item.potentialSavingsInr) || Math.round(savingsKl * rate),
              difficulty: ['Easy', 'Moderate', 'High Impact'].includes(item.difficulty) ? item.difficulty : 'Easy',
              priority: ['CRITICAL', 'HIGH', 'NORMAL'].includes(item.priority) ? item.priority : 'NORMAL',
              isAiGenerated: true,
            };
          });
        }
      }
    } catch (err) {
      console.warn(`Gemini model ${model} parsing failed, trying fallback:`, err);
    }
  }

  // If Gemini API fails or is offline, return tailored algorithmic contextual fallback
  return generateContextualFallbackTips(profile, focusCategory);
};

/**
 * Get top highlight insight for resident dashboard overview
 */
export const extractTopHouseholdInsight = (
  profile: HouseholdProfileForTips,
  tips: WaterTip[]
): TopHouseholdInsight => {
  const currentUsage = profile.currentMonthUsageKl || 12.0;
  const avgUsage = profile.apartmentAvgUsageKl || 11.2;
  const occupancy = profile.occupancyCount || 3;
  const lpcd = Math.round((currentUsage * 1000) / (30 * occupancy));
  const diffPercent = Math.round(((currentUsage - avgUsage) / (avgUsage || 1)) * 100);
  const isOverusing = currentUsage > avgUsage || profile.hasOveruseAlert || profile.hasLeakAlert;

  const topTip = tips.find((t) => t.priority === 'CRITICAL') ||
    tips.find((t) => t.priority === 'HIGH') ||
    tips[0] ||
    generateContextualFallbackTips(profile)[0];

  let headline = `Flat ${profile.flatNumber}: ${currentUsage.toFixed(1)} kL this month`;
  let subtext = `Consuming ~${lpcd} L/person/day across ${occupancy} residents.`;

  if (profile.hasLeakAlert) {
    headline = `⚠️ Potential Water Leak Detected in Flat ${profile.flatNumber}`;
    subtext = `Continuous sub-meter flow recorded. Immediate zero-flow flapper audit recommended.`;
  } else if (diffPercent > 15) {
    headline = `📈 Flat ${profile.flatNumber} is ${diffPercent}% above Society Average`;
    subtext = `At ${currentUsage.toFixed(1)} kL, your usage is in ${profile.currentSlabName} (₹${profile.currentSlabRate || 28}/kL).`;
  } else if (diffPercent < -10) {
    headline = `🌟 Excellent Conservation in Flat ${profile.flatNumber}!`;
    subtext = `You are using ${Math.abs(diffPercent)}% less water than society peers (~${lpcd} LPCD).`;
  }

  return {
    headline,
    subtext,
    lpcd,
    diffPercent,
    isOverusing,
    recommendedAction: topTip.title,
    potentialSavingsKl: topTip.potentialSavingsKl,
    potentialSavingsInr: topTip.potentialSavingsInr,
    priority: topTip.priority,
  };
};
