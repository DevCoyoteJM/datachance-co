import React, { useState, useEffect } from 'react';
import type { CalculationResult, Lottery } from '../types';
import { api } from '../services/api';
import {
  Calculator as CalcIcon,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  Info,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface CalculatorProps {
  lotteries?: Lottery[];
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const ZODIAC_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer',
  'Leo', 'Virgo', 'Libra', 'Escorpio',
  'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

export const Calculator: React.FC<CalculatorProps> = ({ lotteries = [] }) => {
  const [betAmount, setBetAmount] = useState<number>(2000);
  const [selectedGameType, setSelectedGameType] = useState<'CHANCE_TRADICIONAL' | 'SUPER_ASTRO'>('CHANCE_TRADICIONAL');
  const [selectedSpecificLottery, setSelectedSpecificLottery] = useState<string>('todos');
  const [selectedSign, setSelectedSign] = useState<string>('Tauro');
  const [allSigns, setAllSigns] = useState<boolean>(false);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtrar chances y especiales disponibles en el catálogo
  const chanceLotteries = lotteries.filter((l) => l.category === 'CHANCE');
  const astroLotteries = lotteries.filter((l) => l.hasZodiac);

  useEffect(() => {
    loadCalculations();
  }, [betAmount, selectedGameType, allSigns]);

  const loadCalculations = async () => {
    setLoading(true);
    try {
      const data = await api.simulatePrize(betAmount, selectedGameType, allSigns);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
    setBetAmount(val);
  };

  const handleSpecificLotteryChange = (slug: string) => {
    setSelectedSpecificLottery(slug);
    if (slug.includes('astro')) {
      setSelectedGameType('SUPER_ASTRO');
    } else {
      setSelectedGameType('CHANCE_TRADICIONAL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-neon-emerald mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-neon-emerald" />
            Simulador de Liquidación Oficial Colombia
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Calculadora de Premios y Chances
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Compara y liquida cualquier chance colombiano (Ley 643/2001) o simula las modalidades especiales de Súper Astro Sol y Luna con signos zodiacales.
          </p>
        </div>

        {/* Input & Presets */}
        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 w-full md:w-96">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Valor de la Apuesta (COP):
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="text"
              value={betAmount.toLocaleString('es-CO')}
              onChange={handleCustomInput}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#151C2C] border border-emerald-500/40 text-neon-emerald font-mono font-bold text-lg focus:outline-none focus:border-neon-emerald"
            />
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  betAmount === amt
                    ? 'bg-neon-emerald text-slate-950 font-bold shadow-glowGreen'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                ${amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Type Selector & Colombia Explanation */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neon-emerald block mb-1">
              1. Selecciona el Tipo de Juego
            </span>
            <h3 className="text-base font-bold text-white">
              ¿Todos los chances se pagan igual en Colombia?
            </h3>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0B0F19] rounded-2xl border border-white/10">
            <button
              onClick={() => {
                setSelectedGameType('CHANCE_TRADICIONAL');
                setSelectedSpecificLottery('todos');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedGameType === 'CHANCE_TRADICIONAL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glowGreen'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chance Tradicional (4.500x)
            </button>
            <button
              onClick={() => {
                setSelectedGameType('SUPER_ASTRO');
                setSelectedSpecificLottery('super-astro-sol');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedGameType === 'SUPER_ASTRO'
                  ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-glowGold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Súper Astro (42.000x + Signo)
            </button>
          </div>
        </div>

        {/* Informative Banner */}
        {selectedGameType === 'CHANCE_TRADICIONAL' ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-neon-emerald shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <p className="font-bold text-white mb-0.5">
                  Regulación Coljuegos / Ley 643 de 2001:
                </p>
                <p>
                  <strong>Sí, todos los chances tradicionales se pagan exactamente igual en toda Colombia.</strong> Sin importar si juegas Dorado, Chontico, Paisita, Antioqueñita, Cafeterito, Sinuano, Motilón, Culona o Caribeña, o la red concesionaria (Paga Todo, Gana Gana, SuperGiros, Gana, etc.), la ley fija 4.500x directo, 208x combinado, 400x pata y 50x uña.
                </p>
              </div>
            </div>

            {/* Sorteo selector for UX comfort */}
            <div className="shrink-0 w-full md:w-64">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Chance Específico a Simular:
              </label>
              <select
                value={selectedSpecificLottery}
                onChange={(e) => handleSpecificLotteryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-neon-emerald"
              >
                <option value="todos">Cualquier Chance Tradicional</option>
                {chanceLotteries.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.schedule})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-4">
            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <p className="font-bold text-purple-200 mb-0.5">
                  ¿Por qué Súper Astro es diferente?
                </p>
                <p>
                  Súper Astro (Astro Sol y Astro Luna) es un juego novedoso operado bajo concesión especial de Coljuegos. Al requerir acertar las cifras <strong>más el signo zodiacal ganador</strong>, sus multiplicadores son masivos: <strong>42.000 veces</strong> lo apostado en 4 cifras (Súper Pleno), <strong>1.000 veces</strong> en 3 cifras y <strong>100 veces</strong> en 2 cifras.
                </p>
              </div>
            </div>

            {/* Astro Controls: Signo vs Todos los signos */}
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-300">
                  Modalidad de Signo:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAllSigns(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !allSigns
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    1 Signo Específico
                  </button>
                  <button
                    onClick={() => setAllSigns(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      allSigns
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold shadow-glowGold'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    Todos los 12 Signos
                  </button>
                </div>
              </div>

              {!allSigns ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-gray-400">Tu Signo:</span>
                  <select
                    value={selectedSign}
                    onChange={(e) => setSelectedSign(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#151C2C] border border-purple-500/40 text-xs font-bold text-purple-300 focus:outline-none"
                  >
                    {ZODIAC_SIGNS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-xs text-amber-300 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Tu apuesta se divide equitativamente ($ {(Math.round(betAmount / 12)).toLocaleString('es-CO')} por signo).</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map((item) => {
          const hasRetention = item.withholdingTax > 0;
          const isAstro = item.gameType === 'SUPER_ASTRO';

          return (
            <div
              key={item.modality}
              className={`p-6 rounded-3xl glass-card flex flex-col justify-between transition-all ${
                item.multiplier >= 4500
                  ? isAstro
                    ? 'border-purple-500/40 bg-gradient-to-b from-[#1C182F] to-[#151C2C] shadow-glowGold/15'
                    : 'border-emerald-500/40 bg-gradient-to-b from-[#172236] to-[#151C2C] shadow-glowGreen/15'
                  : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    {item.modalityName}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full font-mono font-extrabold text-xs border ${
                      isAstro
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-neon-emerald border-emerald-500/30'
                    }`}
                  >
                    {item.effectiveMultiplier.toLocaleString('es-CO')}x
                  </span>
                </div>

                {/* Main Net Prize */}
                <div className="my-5 p-5 rounded-2xl bg-[#0B0F19]/90 border border-white/5">
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">
                    Premio Neto a Recibir
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-black font-mono tabular-nums mt-1 ${
                      isAstro ? 'text-gold-light' : 'text-neon-emerald'
                    }`}
                  >
                    {item.formattedNet}
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                    <span>Premio Bruto Oficial:</span>
                    <span className="font-mono font-bold text-gray-200">{item.formattedGross}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400 flex items-center gap-1">
                      Retención en la Fuente (20%):
                      {hasRetention && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        hasRetention ? 'text-amber-400' : 'text-gray-500'
                      }`}
                    >
                      {hasRetention ? `- ${item.formattedTax}` : '$ 0 (Exento)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanatory notes */}
              <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-gray-400 flex items-start gap-1.5">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isAstro ? 'text-purple-400' : 'text-emerald-400'
                  }`}
                />
                <span>{item.notes}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tax Note Footer */}
      <div className="p-4 rounded-2xl bg-[#151C2C]/50 border border-white/5 text-xs text-gray-400 flex items-center gap-3">
        <Percent className="w-5 h-5 text-gold shrink-0" />
        <p>
          <strong>Normativa Tributaria DIAN (Art. 306 E.T.):</strong> Los premios de juegos de suerte y azar que superen las 48 UVT (aprox. $2.390.352 COP para el año 2026) tienen una retención en la fuente obligatoria del 20% practicada directamente por el pagador del premio.
        </p>
      </div>
    </div>
  );
};
