import { AnswerSummary, Portfolio } from '../types';

const PORTFOLIO_1: Portfolio = {
  title: 'Moderate Growth Portfolio',
  clientProfile: 'Mid-career professional, age 40, 20-year investment horizon',
  investmentObjectives: [
    'Target return: 7-8% annually',
    'Primary goal: Long-term capital appreciation with moderate income',
    'Time horizon: 20 years until retirement',
  ],
  riskTolerance: 'Moderate - willing to accept moderate volatility for higher returns',
  assetAllocation: [
    { assetClass: 'Domestic Equities', targetPct: 35, range: '30-40%' },
    { assetClass: 'International Equities', targetPct: 25, range: '20-30%' },
    { assetClass: 'Investment Grade Bonds', targetPct: 30, range: '25-35%' },
    { assetClass: 'Real Estate (REITs)', targetPct: 5, range: '3-7%' },
    { assetClass: 'Cash/Money Market', targetPct: 5, range: '3-7%' },
  ],
  strategicSplit: '60% growth assets / 40% income & defensive assets',
  rebalancing:
    'Quarterly review, rebalance when allocation drifts beyond ±5% from target',
};

const PORTFOLIO_2: Portfolio = {
  title: 'Conservative Income Portfolio',
  clientProfile: 'Retiree, age 65, 15-year investment horizon',
  investmentObjectives: [
    'Target return: 4-5% annually',
    'Primary goal: Capital preservation with steady income generation',
    'Liquidity requirement: 2 years of living expenses readily accessible',
  ],
  riskTolerance: 'Low - prioritizes capital preservation over growth',
  assetAllocation: [
    { assetClass: 'Domestic Equities', targetPct: 20, range: '15-25%' },
    { assetClass: 'International Equities', targetPct: 10, range: '8-12%' },
    { assetClass: 'Investment Grade Bonds', targetPct: 45, range: '40-50%' },
    { assetClass: 'Short-Term Bonds', targetPct: 15, range: '12-18%' },
    { assetClass: 'Cash/Money Market', targetPct: 10, range: '8-12%' },
  ],
  strategicSplit: '30% growth assets / 70% income & defensive assets',
  rebalancing:
    'Semi-annual review, rebalance when allocation drifts beyond ±5% from target, prioritize withdrawals from overweight assets',
};

function hasForeseeableNearTermNeeds(answer: string): boolean {
  const lower = answer.toLowerCase().trim();

  // Explicit "no" answers
  if (
    lower === 'no' ||
    lower === 'none' ||
    lower === 'nope' ||
    lower === 'not really' ||
    lower.startsWith('no,') ||
    lower.startsWith('no ') ||
    lower.includes('no foreseeable') ||
    lower.includes('don\'t have any') ||
    lower.includes('do not have any') ||
    lower.includes('nothing planned')
  ) {
    return false;
  }

  // Indicators of near-term needs
  const needIndicators = [
    'yes', 'need', 'buy', 'purchase', 'house', 'home', 'car',
    'wedding', 'tuition', 'college', 'university', 'medical',
    'surgery', 'renovation', 'down payment', 'emergency',
    'within', 'next year', 'next 2', 'next 3', 'next two', 'next three',
    'soon', 'upcoming', 'planning to', 'saving for',
  ];

  return needIndicators.some((indicator) => lower.includes(indicator));
}

export function selectPortfolio(answers: AnswerSummary): {
  portfolioId: 'P1' | 'P2';
  rationale: string;
  portfolio: Portfolio;
} {
  const reasons: string[] = [];

  if (answers.riskToleranceConfirm === 'low') {
    reasons.push('Confirmed risk tolerance is low');
  }

  if (answers.investmentHorizon === 'under 5 years') {
    reasons.push('Investment horizon is under 5 years');
  }

  if (answers.age >= 60) {
    reasons.push(`Age is ${answers.age} (60 or above)`);
  }

  if (hasForeseeableNearTermNeeds(answers.foreseeableNeeds)) {
    reasons.push('Has foreseeable near-term cash needs');
  }

  if (reasons.length > 0) {
    return {
      portfolioId: 'P2',
      rationale: `Selected Conservative Income Portfolio because: ${reasons.join('; ')}.`,
      portfolio: PORTFOLIO_2,
    };
  }

  return {
    portfolioId: 'P1',
    rationale:
      'Selected Moderate Growth Portfolio: no conservative triggers identified. Risk tolerance is not low, investment horizon is 5+ years, age is under 60, and no major near-term cash needs.',
    portfolio: PORTFOLIO_1,
  };
}
