import React, { useState, useMemo } from 'react';
import type {
  LotteryCategory,
  ScheduleShift,
  LatestGroupedResult,
  Lottery,
} from '../types';
import {
  Search,
  Filter,
  Flame,
  Award,
  Calendar,
  Sparkles,
  BarChart2,
  Cpu,
  Clock,
  Compass,
} from 'lucide-react';

interface DashboardProps {
  results: LatestGroupedResult[];
  loading: boolean;
  onSelectLotteryForStats: (lottery: Lottery) => void;
  onSelectLotteryForPrediction: (lottery: Lottery) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  results,
  loading,
  onSelectLotteryForStats,
  onSelectLotteryForPrediction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<LotteryCategory>('ALL');
  const [selectedShift, setSelectedShift] = useState<ScheduleShift>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'ALL' as LotteryCategory, label: 'Todos los Juegos' },
    { id: 'CHANCE' as LotteryCategory, label: 'Chances Diarios' },
    { id: 'LOTERIA' as LotteryCategory, label: 'Loterías Tradicionales' },
    { id: 'ESPECIAL' as LotteryCategory, label: 'Especiales (Súper Astro)' },
    { id: 'BALOTO' as LotteryCategory, label: 'Baloto / Revancha' },
  ];

  const shifts = [
    { id: 'ALL' as ScheduleShift, label: 'Toda Jornada' },
    { id: 'Mañana' as ScheduleShift, label: 'Mañana' },
    { id: 'Tarde' as ScheduleShift, label: 'Tarde' },
    { id: 'Noche' as ScheduleShift, label: 'Noche' },
  ];

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchCategory =
        selectedCategory === 'ALL' || item.lottery.category === selectedCategory;
      const matchShift =
        selectedShift === 'ALL' || item.lottery.schedule === selectedShift;
      const matchSearch = item.lottery.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCategory && matchShift && matchSearch;
    });
  }, [results, selectedCategory, selectedShift, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Ticker */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#151C2C] via-[#10192A] to-[#151C2C] border border-white/10 shadow-glass relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-neon-emerald mb-2">
              <span className="w-2 h-2 rounded-full bg-neon-emerald animate-ping" />
              Sorteos Oficiales Colombia 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Monitor de Resultados y Estadísticas
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mt-1">
              Resultados consolidados de las 15 Loterías Departamentales, Chances Diarios y Baloto con análisis de frecuencia matemática y patrones posicionales.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0B0F19]/80 p-3 rounded-2xl border border-white/5 backdrop-blur-md self-start md:self-auto">
            <div className="text-right">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Total Sorteos Activos</div>
              <div className="text-2xl font-bold font-mono text-neon-emerald tabular-nums">
                {results.length}
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-right">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Actualizaciones</div>
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> En Tiempo Real
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-glowGreen'
                  : 'bg-[#151C2C] text-gray-400 hover:text-white hover:bg-[#1E273D] border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Subfilters: Shift & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151C2C]/50 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Jornada:
            </span>
            {shifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => setSelectedShift(shift.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedShift === shift.id
                    ? 'bg-emerald-500/20 text-neon-emerald border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                {shift.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar lotería o chance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-[#151C2C]/40 border border-white/5 animate-pulse p-5 flex flex-col justify-between"
            >
              <div className="h-6 w-3/4 bg-white/5 rounded-md" />
              <div className="h-12 w-1/2 bg-white/5 rounded-md self-center" />
              <div className="h-8 w-full bg-white/5 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#151C2C]/30 border border-white/5">
          <Filter className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-300">No se encontraron sorteos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Intenta cambiar los filtros de categoría, jornada o el término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map(({ lottery, latestResult }) => {
            const isBaloto = lottery.isBaloto;
            const drawDate = latestResult
              ? new Date(latestResult.drawDate).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Reciente';

            if (isBaloto) {
              const balls = latestResult?.balotas ? latestResult.balotas.split('-') : ['--', '--', '--', '--', '--'];
              const superbalota = latestResult?.superbalota || '--';

              return (
                <div
                  key={lottery.id}
                  className="rounded-3xl glass-card glass-card-gold-hover p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group border border-amber-500/20 bg-gradient-to-b from-[#151C2C] to-[#121824]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500/15 text-gold-light border border-amber-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3 text-gold" />
                        Loto Millonario
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        {drawDate}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-gold-light transition-colors">
                      {lottery.name}
                    </h3>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Sortea: {lottery.playDays} • {lottery.schedule}
                    </div>

                    {/* Jackpot badge */}
                    {latestResult?.jackpot && (
                      <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                        <span className="text-xs text-amber-200/80 font-medium">Acumulado Estimado:</span>
                        <span className="text-sm font-extrabold text-gold font-mono tracking-tight">
                          {latestResult.jackpot}
                        </span>
                      </div>
                    )}

                    {/* Balotas display */}
                    <div className="my-5">
                      <div className="text-[11px] text-gray-400 mb-2 font-medium">5 Balotas Principales + Superbalota:</div>
                      <div className="flex items-center justify-between gap-1.5">
                        {balls.map((b, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-full bg-[#1A2338] border border-emerald-500/30 text-white font-mono font-bold text-sm flex items-center justify-center shadow-inner group-hover:border-emerald-400 transition-colors"
                          >
                            {b}
                          </div>
                        ))}
                        <div className="w-1.5 h-6 bg-white/10 mx-0.5 rounded-full" />
                        <div
                          className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-mono font-extrabold text-base flex items-center justify-center shadow-glowGold animate-pulse-slow cursor-help"
                          title="Superbalota (01-16)"
                        >
                          {superbalota}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => onSelectLotteryForStats(lottery)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-gold" />
                      Frecuencia 1-43
                    </button>
                    <button
                      onClick={() => onSelectLotteryForPrediction(lottery)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold hover:shadow-glowGold transition-all cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Generar Baloto
                    </button>
                  </div>
                </div>
              );
            }

            // Normal Chance / Traditional Lottery Card
            const number = latestResult?.number || '----';
            const series = latestResult?.series;
            const zodiacSign = latestResult?.zodiacSign;

            return (
              <div
                key={lottery.id}
                className="rounded-3xl glass-card glass-card-hover p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        lottery.category === 'LOTERIA'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : lottery.category === 'ESPECIAL'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-neon-emerald border-emerald-500/20'
                      }`}
                    >
                      {lottery.category === 'LOTERIA'
                        ? 'Lotería Oficial'
                        : lottery.category === 'ESPECIAL'
                        ? 'Súper Astro'
                        : 'Chance Diario'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {drawDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-neon-emerald transition-colors">
                    {lottery.name}
                  </h3>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {lottery.playDays} • {lottery.schedule}
                  </div>

                  {/* Number Showcase */}
                  <div className="my-5 p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Resultado Oficial
                      </div>
                      <div className="text-3xl font-extrabold text-neon-emerald font-mono tracking-widest tabular-nums drop-shadow-sm">
                        {number}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      {series && (
                        <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                          <span className="text-[10px] text-gray-500 block leading-tight">SERIE</span>
                          <span className="font-bold text-white">{series}</span>
                        </div>
                      )}
                      {zodiacSign && (
                        <div className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-purple-400" />
                          {zodiacSign}
                        </div>
                      )}
                      {!series && !zodiacSign && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-emerald-400" /> 4 Cifras
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => onSelectLotteryForStats(lottery)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-neon-emerald" />
                    Estadísticas
                  </button>
                  <button
                    onClick={() => onSelectLotteryForPrediction(lottery)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-neon-emerald text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Predecir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
