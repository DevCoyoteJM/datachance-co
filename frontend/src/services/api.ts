import type {
  Lottery,
  LatestGroupedResult,
  LotteryStatsResponse,
  PyramidData,
  HybridResponse,
  CalculationResult,
  DailyInsights,
} from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  async getLotteries(category?: string, schedule?: string): Promise<Lottery[]> {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (schedule && schedule !== 'ALL') params.append('schedule', schedule);
    const res = await fetch(`${API_BASE}/lotteries?${params.toString()}`);
    if (!res.ok) throw new Error('Error al cargar loterías');
    return res.json();
  },

  async getLatestResults(): Promise<LatestGroupedResult[]> {
    const res = await fetch(`${API_BASE}/results/latest`);
    if (!res.ok) throw new Error('Error al cargar últimos resultados');
    return res.json();
  },

  async getLotteryStats(lotteryId: number): Promise<LotteryStatsResponse> {
    const res = await fetch(`${API_BASE}/analytics/lottery/${lotteryId}`);
    if (!res.ok) throw new Error('Error al cargar estadísticas');
    return res.json();
  },

  async getPyramid(date?: string): Promise<PyramidData> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/analytics/pyramid?${params.toString()}`);
    if (!res.ok) throw new Error('Error al calcular la pirámide');
    return res.json();
  },

  async getHybridPrediction(lotteryId: number, date?: string): Promise<HybridResponse> {
    const params = new URLSearchParams({ lotteryId: lotteryId.toString() });
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/analytics/hybrid?${params.toString()}`);
    if (!res.ok) throw new Error('Error al generar predicción híbrida');
    return res.json();
  },

  async getStatisticalPrediction(lotteryId: number) {
    const res = await fetch(`${API_BASE}/analytics/statistical?lotteryId=${lotteryId}`);
    if (!res.ok) throw new Error('Error al generar sugerencia estadística');
    return res.json();
  },

  async getDailyInsights(slug: string): Promise<DailyInsights> {
    const res = await fetch(`${API_BASE}/analytics/daily-insights/${slug}`);
    if (!res.ok) throw new Error(`Error al obtener insights diarios para ${slug}`);
    return res.json();
  },

  async simulatePrize(
    amount: number,
    gameType = 'CHANCE_TRADICIONAL',
    allSigns = false,
    customMultiplier?: number,
    jackpot?: number,
  ): Promise<CalculationResult[]> {
    const params = new URLSearchParams({
      amount: amount.toString(),
      gameType,
      allSigns: allSigns ? 'true' : 'false',
    });
    if (customMultiplier) params.append('customMultiplier', customMultiplier.toString());
    if (jackpot) params.append('jackpot', jackpot.toString());

    const res = await fetch(`${API_BASE}/calculator/simulate?${params.toString()}`);
    if (!res.ok) throw new Error('Error al calcular premios');
    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  },

  async triggerSync(): Promise<{ status: string; message: string; newResultsCount: number }> {
    const res = await fetch(`${API_BASE}/scraper/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al sincronizar resultados');
    return res.json();
  },
};
