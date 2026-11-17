export type LotteryCategory = 'ALL' | 'CHANCE' | 'LOTERIA' | 'ESPECIAL' | 'BALOTO';
export type ScheduleShift = 'ALL' | 'Mañana' | 'Tarde' | 'Noche';

export interface Lottery {
  id: number;
  name: string;
  slug: string;
  category: 'LOTERIA' | 'CHANCE' | 'ESPECIAL' | 'BALOTO';
  schedule: 'Mañana' | 'Tarde' | 'Noche';
  playDays: string;
  hasSeries: boolean;
  hasZodiac: boolean;
  isBaloto: boolean;
}

export interface LotteryResult {
  id: number;
  lotteryId: number;
  lottery?: Lottery;
  number?: string | null;
  series?: string | null;
  zodiacSign?: string | null;
  balotas?: string | null;
  superbalota?: string | null;
  jackpot?: string | null;
  drawDate: string;
  createdAt?: string;
}

export interface LatestGroupedResult {
  lottery: Lottery;
  latestResult: LotteryResult | null;
}

export interface PositionalHeatItem {
  digit: number;
  count: number;
  percentage: number;
}

export interface PositionalHeatMatrix {
  position: number;
  positionLabel: string;
  digits: PositionalHeatItem[];
}

export interface HotColdDigit {
  digitOrNumber: string;
  frequency: number;
  lastSeenDrawsAgo: number;
  status: 'HOT' | 'WARM' | 'COLD';
}

export interface ZodiacFrequency {
  sign: string;
  count: number;
  percentage: number;
}

export interface BalotoBallStat {
  ball: number;
  ballFormatted: string;
  frequency: number;
  lastSeenDrawsAgo: number;
}

export interface BalotoSuperbalotaStat {
  superbalota: number;
  formatted: string;
  frequency: number;
  lastSeenDrawsAgo: number;
}

export interface LotteryStatsResponse {
  lottery: Lottery;
  totalDraws: number;
  // Para Chances / Loterías:
  heatMatrix?: PositionalHeatMatrix[];
  hotDigits?: HotColdDigit[];
  coldDigits?: HotColdDigit[];
  allDigitStats?: HotColdDigit[];
  zodiacFrequencies?: ZodiacFrequency[];
  // Para Baloto:
  ballStats?: BalotoBallStat[];
  hotBalls?: BalotoBallStat[];
  coldBalls?: BalotoBallStat[];
  superbalotaStats?: BalotoSuperbalotaStat[];
  hotSuperbalotas?: BalotoSuperbalotaStat[];
}

export interface PyramidData {
  dateFormatted: string;
  pyramid: number[][];
  keyCombinations: {
    leftDiagonal: string;
    rightDiagonal: string;
    apexCluster: string;
    centerBase: string;
  };
}

export interface HybridCombination {
  combination: string;
  type: string;
  confidence: number;
  explanation: string;
}

export interface HybridResponse {
  mode: 'HYBRID_CHANCE' | 'HYBRID_BALOTO';
  lottery: Lottery;
  pyramid: PyramidData;
  zodiacPrediction?: string | null;
  hybridCombinations?: HybridCombination[];
  prediction?: {
    balotas: string;
    superbalota: string;
    confidence: number;
    explanation: string;
  };
}

export interface CalculationResult {
  modality: string;
  modalityName: string;
  gameType: 'CHANCE_TRADICIONAL' | 'SUPER_ASTRO';
  gameName: string;
  betAmount: number;
  multiplier: number;
  effectiveMultiplier: number;
  grossPrize: number;
  withholdingTax: number;
  netPrize: number;
  formattedBet: string;
  formattedGross: string;
  formattedTax: string;
  formattedNet: string;
  notes: string;
  allSigns?: boolean;
}
