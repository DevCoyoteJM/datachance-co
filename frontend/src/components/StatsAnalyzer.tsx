import React, { useState, useEffect } from 'react';
import type { Lottery, LotteryStatsResponse } from '../types';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Flame,
  Snowflake,
  Grid,
  Compass,
  Award,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { LotteryHistoryCard } from './LotteryHistoryCard';
import { PatternRadarCard } from './PatternRadarCard';

interface StatsAnalyzerProps {
  lotteries: Lottery[];
  selectedLottery: Lottery | null;
  onSelectLottery: (lottery: Lottery) => void;
}

const ZODIAC_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#14B8A6', '#6366F1', '#F43F5E',
  '#84CC16', '#06B6D4', '#A855F7', '#EAB308',
];

export const StatsAnalyzer: React.FC<StatsAnalyzerProps> = ({
  lotteries,
  selectedLottery,
  onSelectLottery,
}) => {
  const [stats, setStats] = useState<LotteryStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<'30' | '90' | '365'>('90');

  useEffect(() => {
    if (!selectedLottery && lotteries.length > 0) {
      onSelectLottery(lotteries[0]);
    }
  }, [lotteries, selectedLottery, onSelectLottery]);

  useEffect(() => {
    if (selectedLottery) {
      loadStats(selectedLottery.id);
    }
  }, [selectedLottery]);

  const loadStats = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getLotteryStats(id);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isBaloto = selectedLottery?.isBaloto;

  return (
    <div className="space-y-6">
      {/* Header & Lottery Selector */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neon-emerald mb-1">
            <Layers className="w-4 h-4" />
            <span>Motor de Análisis Probabilístico</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Analizador Estadístico Visual
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Métricas de termometría numérica, recurrencia histórica y mapa de probabilidad posicional.
          </p>
        </div>

        {/* Lottery Dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Seleccionar Sorteo a Examinar:
          </label>
          <select
            value={selectedLottery?.id || ''}
            onChange={(e) => {
              const found = lotteries.find((l) => l.id === Number(e.target.value));
              if (found) onSelectLottery(found);
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-emerald-500/30 text-white font-medium text-sm focus:outline-none focus:border-neon-emerald"
          >
            {lotteries.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#0B0F19] text-white">
                {l.name} ({l.category === 'BALOTO' ? 'Loto' : l.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-96 rounded-3xl bg-[#151C2C]/50 border border-white/5 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-sm text-gray-400 font-mono">Calculando matrices probabilísticas en SQLite...</span>
          </div>
        </div>
      ) : !stats ? (
        <div className="text-center py-12 text-gray-400">Selecciona un juego para visualizar estadísticas</div>
      ) : isBaloto ? (
        /* BALOTO & REVANCHA STATS */
        <div className="space-y-6">
          {/* Top Quick Stats for Baloto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#151C2C] border border-emerald-500/20 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-neon-emerald">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Balotas Más Calientes</span>
                <div className="text-xl font-bold font-mono text-white flex gap-1.5 mt-1">
                  {stats.hotBalls?.slice(0, 3).map((b) => (
                    <span key={b.ball} className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-neon-emerald border border-emerald-500/30">
                      {b.ballFormatted}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#151C2C] border border-blue-500/20 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Snowflake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Balotas Más Rezagadas</span>
                <div className="text-xl font-bold font-mono text-white flex gap-1.5 mt-1">
                  {stats.coldBalls?.slice(0, 3).map((b) => (
                    <span key={b.ball} className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {b.ballFormatted}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#151C2C] border border-amber-500/20 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-gold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Superbalota Favorita</span>
                <div className="text-xl font-extrabold font-mono text-gold-light mt-1 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-sm shadow-glowGold">
                    {stats.hotSuperbalotas?.[0]?.formatted || '07'}
                  </span>
                  <span className="text-xs text-gray-400 font-sans">
                    ({stats.hotSuperbalotas?.[0]?.frequency || 0} apariciones)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa de Frecuencia de Balotas (1 al 43) */}
          <div className="p-6 rounded-3xl glass-card border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-neon-emerald" />
                  Mapa de Frecuencia de Balotas (01 al 43)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mapa de calor con el total de apariciones de cada balota en la historia de {selectedLottery.name}.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-900" /> Baja
                <span className="w-3 h-3 rounded bg-emerald-700" /> Media
                <span className="w-3 h-3 rounded bg-neon-emerald" /> Alta Frecuencia
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-2.5">
              {stats.ballStats?.map((b) => {
                const maxFreq = Math.max(...(stats.ballStats?.map((x) => x.frequency) || [1]));
                const ratio = b.frequency / (maxFreq || 1);
                let bgClass = 'bg-[#151C2C] border-white/10 text-gray-300';
                if (ratio > 0.75) bgClass = 'bg-emerald-500/30 border-emerald-500 text-neon-emerald shadow-glowGreen font-extrabold';
                else if (ratio > 0.45) bgClass = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold';
                else bgClass = 'bg-[#151C2C] border-white/5 text-gray-400';

                return (
                  <div
                    key={b.ball}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer ${bgClass}`}
                    title={`Balota ${b.ballFormatted}: ${b.frequency} salidas. Última vez hace ${b.lastSeenDrawsAgo} sorteos.`}
                  >
                    <span className="text-base font-mono font-bold">{b.ballFormatted}</span>
                    <span className="text-[10px] opacity-75 font-sans mt-0.5">{b.frequency}x</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranking Superbalota (1 al 16) */}
          <div className="p-6 rounded-3xl glass-card border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-gold" />
              Ranking Histórico Superbalota (01 al 16)
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Distribución de apariciones para la balota dorada definitoria del Premio Mayor.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.superbalotaStats}>
                  <XAxis dataKey="formatted" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151C2C', borderColor: '#F59E0B', borderRadius: '12px' }}
                    labelStyle={{ color: '#FBBF24', fontWeight: 'bold' }}
                    formatter={(val: any) => [`${val} apariciones`, 'Frecuencia']}
                  />
                  <Bar dataKey="frequency" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* CHANCES & LOTERÍAS STATS */
        <div className="space-y-6">
          {/* Termómetro de Números Calientes y Fríos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Números Calientes */}
            <div className="p-6 rounded-3xl glass-card border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-neon-emerald">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Dígitos Calientes</h3>
                    <p className="text-xs text-gray-400">Mayor frecuencia de aparición</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-white/5 text-[11px]">
                  {(['30', '90', '365'] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setTimeHorizon(h)}
                      className={`px-2 py-0.5 rounded-lg ${
                        timeHorizon === h ? 'bg-emerald-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {h}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hotDigits}>
                    <XAxis dataKey="digitOrNumber" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151C2C', borderColor: '#10B981', borderRadius: '12px' }}
                      formatter={(val: any) => [`${val} salidas`, 'Frecuencia']}
                    />
                    <Bar dataKey="frequency" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Números Fríos */}
            <div className="p-6 rounded-3xl glass-card border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Snowflake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Dígitos Fríos / Rezagados</h3>
                    <p className="text-xs text-gray-400">Mayor cantidad de sorteos sin caer</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Retorno Probable
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.coldDigits}>
                    <XAxis dataKey="digitOrNumber" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151C2C', borderColor: '#3B82F6', borderRadius: '12px' }}
                      formatter={(val: any) => [`${val} sorteos atrás`, 'Última caída']}
                    />
                    <Bar dataKey="lastSeenDrawsAgo" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Matriz de Calor por Posición (1ra, 2da, 3ra, 4ta cifra) */}
          <div className="p-6 rounded-3xl glass-card border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-neon-emerald" />
                Matriz de Calor por Posición (1ª a 4ª Cifra)
              </h3>
              <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Probabilidad por columna (0 al 9)
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Revela qué dígitos específicos tienen mayor predilección mecánica en cada posición de {selectedLottery.name}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.heatMatrix?.map((col) => {
                const maxPct = Math.max(...col.digits.map((d) => d.percentage));
                return (
                  <div key={col.position} className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-sm text-neon-emerald">{col.positionLabel}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Probabilidad</span>
                    </div>

                    <div className="space-y-1.5">
                      {col.digits.map((d) => {
                        const isTop = d.percentage === maxPct && d.percentage > 0;
                        return (
                          <div
                            key={d.digit}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                              isTop
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-neon-emerald font-bold'
                                : 'bg-[#151C2C]/60 text-gray-300 hover:bg-[#1E273D]'
                            }`}
                          >
                            <span className="font-mono text-sm">{d.digit}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isTop ? 'bg-neon-emerald' : 'bg-emerald-600/70'}`}
                                  style={{ width: `${Math.min(100, d.percentage * 3)}%` }}
                                />
                              </div>
                              <span className="font-mono w-8 text-right">{d.percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rastreador Súper Astro (Donut Chart) */}
          {selectedLottery.hasZodiac && stats.zodiacFrequencies && stats.zodiacFrequencies.length > 0 && (
            <div className="p-6 rounded-3xl glass-card border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Rastreador Zodiacal Súper Astro</h3>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Frecuencia histórica y distribución porcentual de los 12 signos zodiacales para {selectedLottery.name}.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.zodiacFrequencies}
                        dataKey="count"
                        nameKey="sign"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {stats.zodiacFrequencies.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={ZODIAC_COLORS[index % ZODIAC_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#151C2C', borderColor: '#A855F7', borderRadius: '12px' }}
                        formatter={(val: any) => [`${val} caídas`, 'Frecuencia']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stats.zodiacFrequencies.map((z, idx) => (
                    <div
                      key={z.sign}
                      className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 flex flex-col items-start justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: ZODIAC_COLORS[idx % ZODIAC_COLORS.length] }}
                        />
                        <span className="text-xs font-bold text-white">{z.sign}</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 font-mono">
                        {z.count} aciertos ({z.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Radar de Patrones Especiales (Capicúas, Escaleras, Gemelos) */}
      {selectedLottery && !selectedLottery.isBaloto && (
        <PatternRadarCard slug={selectedLottery.slug} lotteryName={selectedLottery.name} />
      )}

      {/* Historial de Sorteos Anteriores (Conectado al Sorteo Seleccionado) */}
      <LotteryHistoryCard lottery={selectedLottery} />
    </div>
  );
};
