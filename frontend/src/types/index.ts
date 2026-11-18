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

export interface HybridResponse {
  lottery: Lottery;
  suggested4Digit: string;
  pata: string;
  una: string;
  pyramidSource: PyramidData;
  hotDigitsApplied: string[];
  rationale: string;
  confidenceScore: number;
  balotoSuggestion?: {
    balls: number[];
    superbalota: number;
  };
}

export interface CalculationResult {
  modality: string;
  betAmount: number;
  grossPrize: number;
  withholdingTax: number;
  netPrize: number;
  description: string;
}

export interface DailyInsights {
  lottery: {
    id: number;
    name: string;
    slug: string;
    category: string;
    schedule: string;
    playDays: string;
  };
  latestResult: {
    number: string;
    series: string | null;
    drawDate: string;
    invertedNumber: string;
    mirrorNumber: string;
  };
  counterpartResult?: {
    name: string;
    slug: string;
    number: string;
    drawDate: string;
  } | null;
  delayedStats: {
    una: { digit: number; drawsAgo: number }[];
    pata: { termination: string; drawsAgo: number }[];
    totalDrawsAnalyzed: number;
  };
  pyramidKey: {
    dateFormatted: string;
    leftDiagonal: string;
    rightDiagonal: string;
    apexCluster: string;
    centerBase: string;
  };
  hybridRecommendation: {
    primaryCombination: string;
    secondaryCombination: string;
    confidence: number;
    rationale: string;
  };
}

// Historial de Sorteos Anteriores
export interface HistoryResultItem extends LotteryResult {
  daysAgo: number;
}

export interface LotteryHistoryResponse {
  lottery: Lottery;
  results: HistoryResultItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Buscador Global "Verifica tu Número"
export interface NumberOccurrence {
  id: number;
  lotteryName: string;
  category: string;
  drawDate: string;
  series?: string | null;
  zodiacSign?: string | null;
}

export interface LotteryAppearanceGroup {
  lotteryName: string;
  category: string;
  count: number;
  lastDate: string;
}

export interface CheckNumberResponse {
  number: string;
  totalOccurrences: number;
  lastAppearance: string | null;
  daysAgo: number | null;
  pata: string;
  pataOccurrences: number;
  una: string;
  unaOccurrences: number;
  byLottery: LotteryAppearanceGroup[];
  recentOccurrences: NumberOccurrence[];
}

// Mis Jugadas Guardadas (localStorage)
export interface SavedPlay {
  id: string;
  number: string;
  type: '4_CIFRAS' | 'PATA' | 'BALOTO';
  source: 'ESTADISTICO' | 'PIRAMIDE' | 'HIBRIDO' | 'DATOS_DEL_DIA' | 'MANUAL';
  lotteryName?: string;
  superbalota?: string;
  savedAt: string;
  notes?: string;
}
