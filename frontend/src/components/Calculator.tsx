import React, { useState, useEffect, useMemo } from 'react';
import type { CalculationResult, Lottery } from '../types';
import { api } from '../services/api';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  Info,
  Scale,
  BrainCircuit,
  Sliders,
  DollarSign,
  Award,
  Zap,
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
  // Pestañas internas dentro de la misma tarjeta:
  // 'FINANCIAL' = Pestaña A — Cálculo de Ganancia Real (Normativa Colombia)
  // 'MATHEMATICAL' = Pestaña B — Análisis Matemático (Método Jerry Selbee)
  const [internalTab, setInternalTab] = useState<'FINANCIAL' | 'MATHEMATICAL'>('FINANCIAL');

  const [betAmount, setBetAmount] = useState<number>(2000);
  const [selectedGameType, setSelectedGameType] = useState<'CHANCE_TRADICIONAL' | 'SUPER_ASTRO' | 'BALOTO'>('CHANCE_TRADICIONAL');
  const [selectedSpecificLottery, setSelectedSpecificLottery] = useState<string>('todos');
  const [selectedSign, setSelectedSign] = useState<string>('Tauro');
  const [allSigns, setAllSigns] = useState<boolean>(false);
  const [balotoJackpotMillones, setBalotoJackpotMillones] = useState<number>(18500);

  // Rolldown Slider (Multiplicador simulado para probar el punto de quiebre EV > 0)
  const [rolldownMultiplier, setRolldownMultiplier] = useState<number>(4500);
  const [rolldownJackpotMillones, setRolldownJackpotMillones] = useState<number>(18500);

  const [results, setResults] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtrar chances y especiales disponibles en el catálogo
  const chanceLotteries = lotteries.filter((l) => l.category === 'CHANCE');

  useEffect(() => {
    loadCalculations();
  }, [betAmount, selectedGameType, allSigns, balotoJackpotMillones]);

  const loadCalculations = async () => {
    setLoading(true);
    try {
      const data = await api.simulatePrize(
        betAmount,
        selectedGameType,
        allSigns,
        undefined,
        selectedGameType === 'BALOTO' ? balotoJackpotMillones : undefined
      );
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

  // Cálculo matemático en tiempo real para el escenario Rolldown (Método Jerry Selbee)
  const activeMainItem = results[0] || null;

  const rolldownSim = useMemo(() => {
    if (selectedGameType === 'BALOTO') {
      const ticketCost = 5700;
      const prob = 1 / 15401568;
      const simJackpotCop = rolldownJackpotMillones * 1_000_000;
      const simNet = simJackpotCop * 0.8;
      const ev = (prob * simNet) - ticketCost;
      const evPerPeso = (prob * simNet / ticketCost) - 1;
      const breakevenJackpotMillones = Math.round((15401568 * ticketCost / 0.8) / 1_000_000); // ~$109.736M

      return {
        prob,
        probRatio: '1 en 15.401.568',
        simPrizeFormatted: `$ ${rolldownJackpotMillones.toLocaleString('es-CO')} Millones`,
        ev,
        evPerPeso,
        isPositive: ev > 0,
        breakevenVal: breakevenJackpotMillones,
        breakevenText: `$ ${breakevenJackpotMillones.toLocaleString('es-CO')} Millones Brutos`,
      };
    }

    // Para Chances (ej: 4 Cifras Directo)
    const prob = activeMainItem?.mathAnalysis?.probabilityFloat || 1 / 10000;
    const probRatio = activeMainItem?.mathAnalysis?.probabilityRatio || '1 en 10.000';
    const grossPrize = betAmount * rolldownMultiplier;
    const isExempt = grossPrize < (48 * 49799);
    const netPrize = isExempt ? grossPrize : grossPrize * 0.8;
    const ev = (prob * netPrize) - betAmount;
    const evPerPeso = (prob * (netPrize / betAmount)) - 1;
    // Breakeven con retención del 20%: (1 / prob) / 0.8
    const breakevenMultiplier = Math.round((1 / prob) / (isExempt ? 1 : 0.8));

    return {
      prob,
      probRatio,
      simPrizeFormatted: `${rolldownMultiplier.toLocaleString('es-CO')}x`,
      ev,
      evPerPeso,
      isPositive: ev > 0,
      breakevenVal: breakevenMultiplier,
      breakevenText: `${breakevenMultiplier.toLocaleString('es-CO')}x`,
    };
  }, [selectedGameType, rolldownMultiplier, rolldownJackpotMillones, betAmount, activeMainItem]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-neon-emerald mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-neon-emerald" />
            <span>Simulador Financiero & Análisis de Probabilidad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calculadora de Premios Colombia
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Simula ganancias netas con retención tributaria DIAN (Ley 643/2001 y 48 UVT) o analiza el Valor Esperado (EV) y punto de equilibrio según el Método Jerry Selbee.
          </p>
        </div>

        {/* Input & Presets */}
        <div className="relative z-10 bg-[#0B0F19] p-4 rounded-2xl border border-white/10 w-full md:w-96 shrink-0">
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

      {/* Main Card with Internal Two Tabs */}
      <div className="rounded-3xl glass-card border border-white/10 p-6 sm:p-8 space-y-6">
        {/* Navigation between Tab A and Tab B */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-white/10">
          {/* Internal Tab Buttons */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0B0F19] rounded-2xl border border-white/10 w-full xl:w-auto overflow-x-auto">
            <button
              onClick={() => setInternalTab('FINANCIAL')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                internalTab === 'FINANCIAL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glowGreen'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Pestaña A — Ganancia Real (Normativa Colombia)</span>
            </button>

            <button
              onClick={() => setInternalTab('MATHEMATICAL')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                internalTab === 'MATHEMATICAL'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-glowGold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Pestaña B — Análisis Matemático (Jerry Selbee)</span>
            </button>
          </div>

          {/* UVT Badge indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3.5 py-2 rounded-xl border border-white/5 self-start xl:self-auto shrink-0">
            <Percent className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>UVT Colombia 2026: <strong className="text-white">$49.799 COP</strong> (48 UVT = $2.390.352)</span>
          </div>
        </div>

        {/* Game Mode Selector (Shared across tabs) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Modalidad de Juego:
            </span>
            <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setSelectedGameType('CHANCE_TRADICIONAL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedGameType === 'CHANCE_TRADICIONAL'
                    ? 'bg-emerald-500/20 text-neon-emerald border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Chance (4.500x)
              </button>
              <button
                onClick={() => setSelectedGameType('SUPER_ASTRO')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedGameType === 'SUPER_ASTRO'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Súper Astro (42.000x)
              </button>
              <button
                onClick={() => setSelectedGameType('BALOTO')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedGameType === 'BALOTO'
                    ? 'bg-amber-500/20 text-gold border border-amber-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Baloto / Revancha
              </button>
            </div>
          </div>

          {/* Conditional Controls based on Game */}
          {selectedGameType === 'SUPER_ASTRO' && (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-purple-200">
                  Súper Astro paga <strong>42.000x</strong> en 4 cifras al acertar las cifras + signo zodiacal.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAllSigns(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    !allSigns ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  1 Signo
                </button>
                <button
                  onClick={() => setAllSigns(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    allSigns ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Todos los 12 Signos
                </button>
              </div>
            </div>
          )}

          {selectedGameType === 'BALOTO' && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gold" />
                <span className="text-xs text-amber-200">
                  Simular Pozo Acumulado de Baloto (Millones COP):
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">$</span>
                <input
                  type="number"
                  step="500"
                  min="4000"
                  max="120000"
                  value={balotoJackpotMillones}
                  onChange={(e) => setBalotoJackpotMillones(Number(e.target.value) || 18500)}
                  className="w-32 px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-amber-500/40 text-gold font-mono font-bold text-sm text-right"
                />
                <span className="text-xs text-gray-400">Millones</span>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA A — CÁLCULO DE GANANCIA REAL (NORMATIVA COLOMBIA) */}
        {/* ------------------------------------------------------------- */}
        {internalTab === 'FINANCIAL' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((item) => {
                const hasRetention = !item.isTaxExempt;
                return (
                  <div
                    key={item.modality}
                    className={`p-6 rounded-3xl glass-card flex flex-col justify-between transition-all ${
                      item.multiplier >= 4500
                        ? 'border-emerald-500/40 bg-gradient-to-b from-[#172236] to-[#151C2C] shadow-glowGreen/15'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-sm font-bold text-white">
                          {item.modalityName}
                        </span>
                        <span className="px-2.5 py-1 rounded-full font-mono font-extrabold text-xs bg-emerald-500/15 text-neon-emerald border border-emerald-500/30">
                          {item.effectiveMultiplier.toLocaleString('es-CO')}x
                        </span>
                      </div>

                      {/* Main Payment Net */}
                      <div className="my-4 p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/5">
                        <div className="text-[11px] text-gray-400 uppercase font-semibold">
                          3. Pago Neto Real en Mano
                        </div>
                        <div className="text-3xl font-black font-mono text-neon-emerald tabular-nums mt-1 drop-shadow-sm">
                          {item.formattedNet}
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                          <span>1. Ganancia Bruta (Monto x Mult):</span>
                          <span className="font-mono font-bold text-gray-200">{item.formattedGross}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-gray-400 flex items-center gap-1">
                            2. Descuento Ganancia Ocasional (20%):
                            {hasRetention && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              hasRetention ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {hasRetention ? `- ${item.formattedTax}` : '$0 (Exento)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory notes */}
                    <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-gray-400 flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item.notes}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Normativa DIAN Box */}
            <div className="p-4 rounded-2xl bg-[#0B0F19]/60 border border-white/10 text-xs text-gray-400 flex items-start gap-3">
              <Scale className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Normativa Tributaria Oficial DIAN (Estatuto Tributario):</strong>
                <span>
                  Los premios de juegos de suerte y azar que superen las <strong>48 UVT</strong> ($2.390.352 COP para 2026) tienen una retención en la fuente del 20% practicada de forma directa por la entidad pagadora. Si el premio es inferior o igual a 48 UVT, el premio se entrega <strong>100% libre de impuestos ($0 Exento)</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA B — ANÁLISIS MATEMÁTICO (MÉTODO JERRY SELBEE) */}
        {/* ------------------------------------------------------------- */}
        {internalTab === 'MATHEMATICAL' && (
          <div className="space-y-6">
            {/* Jerry Selbee Introduction Box */}
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-gold font-bold text-sm">
                <BrainCircuit className="w-5 h-5 text-gold" />
                <span>El Teorema Matemático de Jerry Selbee & Escenario Rolldown</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                En cualquier juego de azar tradicional, el <strong>Valor Esperado (EV)</strong> es negativo porque la casa retiene un margen (en el chance colombiano el retorno teórico al jugador es de ~45%, dejando un 55% a la casa y transferencias a la salud). Jerry Selbee descubrió que cuando los premios no se reparten y se produce un efecto <em>Rolldown</em> (el pozo se distribuye inflando las ganancias de aciertos menores), el valor esperado cruza a positivo (<strong>EV &gt; 0</strong>), convirtiéndose matemáticamente en una ventaja a favor del jugador.
              </p>
            </div>

            {/* Mathematical Probability & EV Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {results.slice(0, 3).map((item) => {
                const isHouse = item.mathAnalysis.advantageParty === 'CASA';
                return (
                  <div
                    key={item.modality}
                    className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white">{item.modalityName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isHouse
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-neon-emerald border border-emerald-500/30'
                          }`}
                        >
                          Ventaja de la {item.mathAnalysis.advantageParty}
                        </span>
                      </div>

                      {/* 1. Probabilidad Exacta */}
                      <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-white/5 space-y-1 mb-3">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                          1. Probabilidad Matemática Exacta
                        </span>
                        <div className="text-xl font-extrabold font-mono text-white">
                          {item.mathAnalysis.probabilityRatio}
                        </div>
                        <span className="text-xs text-emerald-400 font-mono block">
                          ({item.mathAnalysis.probabilityPercentage})
                        </span>
                      </div>

                      {/* 2. EV y RTP */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                          <span>Retorno Teórico (RTP %):</span>
                          <span className="font-mono font-bold text-white">
                            {item.mathAnalysis.rtpPercent}%
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                          <span>Margen de la Casa:</span>
                          <span className="font-mono font-bold text-rose-400">
                            {item.mathAnalysis.houseEdgePercent}%
                          </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                          <span>Valor Esperado (EV / $1 COP):</span>
                          <span
                            className={`font-mono font-bold ${
                              item.mathAnalysis.evPerPeso < 0 ? 'text-rose-400' : 'text-neon-emerald'
                            }`}
                          >
                            {item.mathAnalysis.evPerPeso > 0 ? '+' : ''}
                            {item.mathAnalysis.evPerPeso} COP
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 pt-3 border-t border-white/5">
                      {item.mathAnalysis.breakevenDescription}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. SIMULADOR INTERACTIVO: ESCENARIO ROLLDOWN */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] border border-amber-500/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-gold" />
                  <h3 className="text-base font-bold text-white">
                    Simulador Interactivo de Umbral Rolldown (EV &gt; 0)
                  </h3>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  Punto de Equilibrio: <strong className="text-gold font-mono">{rolldownSim.breakevenText}</strong>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Aumenta el multiplicador o el acumulado con el control deslizante para comprobar visualmente en qué punto exacto el <strong>Valor Esperado se vuelve positivo (+EV)</strong> superando a la casa.
              </p>

              {/* Slider Control */}
              <div className="space-y-3 pt-2">
                {selectedGameType === 'BALOTO' ? (
                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-2">
                      <span className="text-gray-400">Acumulado Mínimo ($4.000 Millones)</span>
                      <span className="text-gold text-sm">$ {rolldownJackpotMillones.toLocaleString('es-CO')} Millones</span>
                      <span className="text-gray-400">Pozo Selbee ($140.000 Millones)</span>
                    </div>
                    <input
                      type="range"
                      min="4000"
                      max="140000"
                      step="2000"
                      value={rolldownJackpotMillones}
                      onChange={(e) => setRolldownJackpotMillones(Number(e.target.value))}
                      className="w-full h-2 bg-[#151C2C] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-2">
                      <span className="text-gray-400">Oficial (4.500x)</span>
                      <span className="text-gold text-sm">{rolldownMultiplier.toLocaleString('es-CO')}x</span>
                      <span className="text-gray-400">Escenario Rolldown (15.000x)</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="16000"
                      step="250"
                      value={rolldownMultiplier}
                      onChange={(e) => setRolldownMultiplier(Number(e.target.value))}
                      className="w-full h-2 bg-[#151C2C] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Status Meter Bar */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  rolldownSim.isPositive
                    ? 'bg-emerald-950/40 border-emerald-500 text-neon-emerald shadow-glowGreen'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                      Diagnóstico del Algoritmo
                    </span>
                    <span className="text-lg font-bold">
                      {rolldownSim.isPositive
                        ? '🟢 ¡ESCENARIO ROLLDOWN POSITIVO! (+EV — Ventaja Matemática del Jugador)'
                        : '🔴 ESCENARIO ESTÁNDAR (-EV — La Casa Mantiene la Ventaja)'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                      EV por Cada $1 Apostado
                    </span>
                    <span className="text-2xl font-black font-mono">
                      {rolldownSim.evPerPeso > 0 ? '+' : ''}
                      {rolldownSim.evPerPeso.toFixed(4)} COP
                    </span>
                  </div>
                </div>

                <p className="text-xs mt-2 opacity-90">
                  {rolldownSim.isPositive
                    ? `En este nivel (${rolldownSim.simPrizeFormatted}), cada peso jugado devuelve estadísticamente $${(
                        1 + rolldownSim.evPerPeso
                      ).toFixed(2)} COP. Es el fenómeno matemático exacto con el que Jerry Selbee generó millones legales en la lotería.`
                    : `Con el multiplicador actual (${rolldownSim.simPrizeFormatted}), cada peso jugado pierde en promedio $${Math.abs(
                        rolldownSim.evPerPeso
                      ).toFixed(2)} COP. Se requiere alcanzar ${rolldownSim.breakevenText} para que el juego sea matemáticamente favorable.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
