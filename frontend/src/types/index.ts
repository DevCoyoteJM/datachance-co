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
  source: 'ESTADISTICO' | 'PIRAMIDE' | 'HIBRIDO' | 'DATOS_DEL_DIA' | 'MANUAL' | 'ALMANAQUE_SUENOS' | 'RUEDA_NUMERICA';
  lotteryName?: string;
  superbalota?: string;
  savedAt: string;
  notes?: string;
}

// 1. Radar de Patrones Especiales (Gemelos, Escaleras, Capicúas)
export interface PatternLastMatch {
  number: string;
  series?: string | null;
  drawDate: string;
  daysAgo: number | null;
  drawsAgo: number;
}

export interface PatternRecentMatch {
  number: string;
  drawDate: string;
  drawsAgo: number;
}

export interface SpecialPatternItem {
  key: string;
  name: string;
  formula: string;
  description: string;
  totalMatches: number;
  lastMatch: PatternLastMatch | null;
  drawsAgo: number;
  daysAgo: number | null;
  avgDrawsBetween: number;
  isOverdue: boolean;
  overdueRatio: number;
  alertLevel: 'NORMAL' | 'WARM' | 'OVERDUE';
  recentMatches: PatternRecentMatch[];
}

export interface SpecialPatternsResponse {
  lottery: {
    id: number;
    name: string;
    slug: string;
    category: string;
    schedule: string;
  };
  totalDrawsAnalyzed: number;
  patterns: SpecialPatternItem[];
}

// 2. Ranking de Efectividad de Métodos (Auditoría Pública)
export interface AuditRecentHit {
  lotteryName: string;
  drawDate: string;
  winningNumber: string;
  predictedNumber: string;
  matchedModality: string;
  payoutMultiplier: string;
}

export interface AuditMethodItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  totalEvaluated: number;
  unaHits: number;
  unaRate: number;
  pataHits: number;
  pataRate: number;
  combinadoHits: number;
  combinadoRate: number;
  directHits: number;
  directRate: number;
  score: number;
  recentHits: AuditRecentHit[];
}

export interface AuditRankingResponse {
  periodDays: number;
  totalEvaluated: number;
  ranking: AuditMethodItem[];
  educationalDisclaimer: string;
}

// 3. Almanaque de Agüeros y Sueños
export interface DreamItem {
  keyword: string;
  category: 'Animales' | 'Naturaleza' | 'Dinero & Prosperidad' | 'Familia & Vida' | 'Sucesos & Emociones' | 'Objetos & Cotidiano';
  number: string;
  pata: string;
  meaning: string;
  icon?: string;
}

// 4. Generador de Combinaciones (Desdoblamiento / Rueda Numérica)
export interface WheelCombinationResult {
  digits: number[];
  combinationLength: 3 | 4;
  allowRepeats: boolean;
  combinations: string[];
  totalCombinations: number;
  betPerLine: number;
  totalCost: number;
  potentialDirectPrize: number;
  potentialCombinadoPrize: number;
}
