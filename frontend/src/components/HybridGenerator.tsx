import React, { useState, useEffect } from 'react';
import type { Lottery, PyramidData, HybridResponse } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Cpu,
  Layers,
  Copy,
  Check,
  Calendar,
  Flame,
  Zap,
  Info,
  TrendingUp,
  ShieldCheck,
  Award,
  Bookmark,
  Shuffle,
} from 'lucide-react';
import { savedPlaysService } from '../services/savedPlays';
import { WheelCombinatorCard } from './WheelCombinatorCard';
import { MethodAuditCard } from './MethodAuditCard';

interface HybridGeneratorProps {
  lotteries: Lottery[];
  selectedLottery: Lottery | null;
  onSelectLottery: (lottery: Lottery) => void;
}

export const HybridGenerator: React.FC<HybridGeneratorProps> = ({
  lotteries,
  selectedLottery,
  onSelectLottery,
}) => {
  const [activeTool, setActiveTool] = useState<'models' | 'wheel' | 'audit'>('models');
  const [activeMode, setActiveMode] = useState<'statistical' | 'pyramid' | 'hybrid'>('hybrid');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedPlayId, setSavedPlayId] = useState<string | null>(null);

  const handleSavePlay = (
    number: string,
    type: '4_CIFRAS' | 'PATA' | 'BALOTO',
    source: 'ESTADISTICO' | 'PIRAMIDE' | 'HIBRIDO',
    id: string,
    superbalota?: string,
  ) => {
    savedPlaysService.savePlay({
      number,
      type,
      source,
      lotteryName: selectedLottery?.name,
      superbalota,
      notes: `Generado en ${selectedLottery?.name || 'Sorteo'} (${source})`,
    });
    setSavedPlayId(id);
    setTimeout(() => setSavedPlayId(null), 2500);
  };

  // Data states
  const [pyramidData, setPyramidData] = useState<PyramidData | null>(null);
  const [hybridData, setHybridData] = useState<HybridResponse | null>(null);
  const [statisticalData, setStatisticalData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedLottery && lotteries.length > 0) {
      onSelectLottery(lotteries[0]);
    }
  }, [lotteries, selectedLottery, onSelectLottery]);

  // Load data based on current tab and lottery
  useEffect(() => {
    if (selectedLottery) {
      loadTabContent();
    }
  }, [selectedLottery, activeMode, selectedDate]);

  const loadTabContent = async () => {
    if (!selectedLottery) return;
    setLoading(true);
    try {
      if (activeMode === 'pyramid') {
        const data = await api.getPyramid(selectedDate);
        setPyramidData(data);
      } else if (activeMode === 'hybrid') {
        const data = await api.getHybridPrediction(selectedLottery.id, selectedDate);
        setHybridData(data);
      } else if (activeMode === 'statistical') {
        const data = await api.getStatisticalPrediction(selectedLottery.id);
        setStatisticalData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10B981', '#F59E0B', '#3B82F6'],
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const isBaloto = selectedLottery?.isBaloto;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#151C2C] via-[#111827] to-[#151C2C] border border-white/10 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-gold-light mb-1">
            <Zap className="w-3.5 h-3.5 text-gold" />
            Motor Generativo Híbrido
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            IA Predictor & Pirámide Numerológica
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Sinergia entre análisis estadístico formal (SQLite) y numerología tradicional colombiana.
          </p>
        </div>

        {/* Selected Lottery Dropdown */}
        <div className="w-full md:w-72">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Sorteo Destino:
          </label>
          <select
            value={selectedLottery?.id || ''}
            onChange={(e) => {
              const found = lotteries.find((l) => l.id === Number(e.target.value));
              if (found) onSelectLottery(found);
            }}
            className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-amber-500/30 text-white font-medium text-sm focus:outline-none focus:border-gold"
          >
            {lotteries.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#0B0F19] text-white">
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selector Principal de Herramientas: Modelos IA vs Rueda Numérica vs Auditoría */}
      <div className="flex items-center gap-2 p-1.5 bg-[#151C2C] rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTool('models')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTool === 'models'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-glowGold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Modelos Predictivos (IA & Pirámide)</span>
        </button>

        <button
          onClick={() => setActiveTool('wheel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTool === 'wheel'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-glowGreen'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Rueda Numérica (Desdoblamiento)</span>
        </button>

        <button
          onClick={() => setActiveTool('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTool === 'audit'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ranking de Auditoría Pública</span>
        </button>
      </div>

      {activeTool === 'wheel' && <WheelCombinatorCard />}

      {activeTool === 'audit' && <MethodAuditCard />}

      {activeTool === 'models' && (
        <>
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#151C2C] rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveMode('hybrid')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeMode === 'hybrid'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-glowGold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Fusión Híbrida (Pirámide + SQLite)</span>
        </button>

        <button
          onClick={() => setActiveMode('pyramid')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeMode === 'pyramid'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glowGreen'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pirámide Numerológica Pura</span>
        </button>

        <button
          onClick={() => setActiveMode('statistical')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeMode === 'statistical'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Modo 100% Estadístico</span>
        </button>
      </div>

      {/* Date Picker (Visible in Pyramid and Hybrid modes) */}
      {(activeMode === 'pyramid' || activeMode === 'hybrid') && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#151C2C]/60 border border-white/5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-gold" />
            <span>Fecha de Referencia Astrológica:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-gold font-mono"
          />
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="h-80 rounded-3xl bg-[#151C2C]/50 border border-white/5 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <span className="text-sm text-gray-400 font-mono">Generando cruces matemáticos...</span>
          </div>
        </div>
      ) : activeMode === 'hybrid' && hybridData ? (
        /* TAB 1: MODO HÍBRIDO */
        <div className="space-y-6">
          {isBaloto && hybridData.prediction ? (
            /* Baloto Hybrid Result */
            <div className="p-8 rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-b from-[#151C2C] to-[#0E1422] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-gold-light border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-gold" />
                  Jugada Baloto Híbrida Recomendada
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-neon-emerald border border-emerald-500/30">
                  {hybridData.prediction.confidence}% Resonancia
                </span>
              </div>

              {/* Balls */}
              <div className="my-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {hybridData.prediction.balotas.split('-').map((ball, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A2338] border-2 border-emerald-400 text-white font-mono font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-glowGreen"
                  >
                    {ball}
                  </div>
                ))}
                <div className="h-10 w-0.5 bg-white/20 mx-1" />
                <div
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-mono font-black text-2xl sm:text-3xl flex items-center justify-center shadow-glowGold animate-pulse-slow"
                  title="Superbalota"
                >
                  {hybridData.prediction.superbalota}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-white/5 mb-6 text-xs text-gray-300">
                <p className="font-semibold text-gold mb-1">Fundamento del Algoritmo Híbrido:</p>
                <p>{hybridData.prediction.explanation}</p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${hybridData.prediction?.balotas} + SB ${hybridData.prediction?.superbalota}`,
                      'baloto-hybrid'
                    )
                  }
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:shadow-glowGold transition-all cursor-pointer"
                >
                  {copiedId === 'baloto-hybrid' ? (
                    <>
                      <Check className="w-4 h-4" /> ¡Jugada Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Jugada Completa
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Chance & Lottery Hybrid Suggestions */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {hybridData.hybridCombinations?.map((combo, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl glass-card flex flex-col justify-between transition-all ${
                      idx === 0
                        ? 'border-amber-500/40 bg-gradient-to-b from-[#1E2638] to-[#151C2C] shadow-glowGold/20'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                          {combo.type}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {combo.confidence}% Confianza
                        </span>
                      </div>

                      {/* 4 digits */}
                      <div className="my-4 text-center">
                        <div className="text-4xl font-extrabold font-mono tracking-widest text-white tabular-nums drop-shadow-md">
                          {combo.combination}
                        </div>
                        {selectedLottery?.hasZodiac && hybridData.zodiacPrediction && (
                          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300">
                            Signo: {hybridData.zodiacPrediction}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                        {combo.explanation}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSavePlay(combo.combination, '4_CIFRAS', 'HIBRIDO', `save-combo-${idx}`)
                        }
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Guardar jugada en mis favoritos"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${savedPlayId === `save-combo-${idx}` ? 'text-neon-emerald fill-neon-emerald' : 'text-gray-400'}`} />
                        <span>{savedPlayId === `save-combo-${idx}` ? '¡Guardada!' : 'Guardar'}</span>
                      </button>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedLottery?.hasZodiac && hybridData.zodiacPrediction
                              ? `${combo.combination} con ${hybridData.zodiacPrediction}`
                              : combo.combination,
                            `combo-${idx}`
                          )
                        }
                        className="flex-1 py-2.5 px-3 rounded-xl bg-neon-emerald/20 hover:bg-neon-emerald/30 border border-emerald-500/30 text-xs font-bold text-neon-emerald flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedId === `combo-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-neon-emerald" /> ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activeMode === 'pyramid' && pyramidData ? (
        /* TAB 2: PIRÁMIDE NUMEROLÓGICA INTERACTIVA */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 text-center">
            <h3 className="text-lg font-bold text-white mb-1">
              Pirámide Numerológica Oficial del Día
            </h3>
            <p className="text-xs text-gray-400 max-w-xl mx-auto mb-6">
              Calculada reduciendo mediante sumas continuas adyacentes módulo 10 desde la fecha base: {pyramidData.dateFormatted}
            </p>

            {/* Inverted Triangle Graphic */}
            <div className="py-4 px-2 overflow-x-auto flex flex-col items-center gap-2">
              {pyramidData.pyramid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-1.5 sm:gap-2 justify-center">
                  {row.map((digit, colIdx) => {
                    const isDiagonalLeft = colIdx === 0 && rowIdx < 4;
                    const isDiagonalRight = colIdx === row.length - 1 && rowIdx < 4;
                    const isApex = rowIdx === pyramidData.pyramid.length - 1;

                    let ballClass = 'bg-[#151C2C] text-gray-300 border-white/10';
                    if (isApex) {
                      ballClass = 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-amber-300 font-extrabold shadow-glowGold scale-110';
                    } else if (isDiagonalLeft || isDiagonalRight) {
                      ballClass = 'bg-emerald-500/20 text-neon-emerald border-emerald-500/50 font-bold shadow-glowGreen';
                    }

                    return (
                      <div
                        key={colIdx}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-mono text-xs sm:text-sm transition-all ${ballClass}`}
                        title={`Nivel ${rowIdx + 1}, Pos ${colIdx + 1}: ${digit}`}
                      >
                        {digit}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 text-left">
              <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Diagonal Izquierda</span>
                <span className="text-xl font-mono font-bold text-white tracking-wider">
                  {pyramidData.keyCombinations.leftDiagonal}
                </span>
                <button
                  onClick={() => copyToClipboard(pyramidData.keyCombinations.leftDiagonal, 'pyr-left')}
                  className="mt-2 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Diagonal Derecha</span>
                <span className="text-xl font-mono font-bold text-white tracking-wider">
                  {pyramidData.keyCombinations.rightDiagonal}
                </span>
                <button
                  onClick={() => copyToClipboard(pyramidData.keyCombinations.rightDiagonal, 'pyr-right')}
                  className="mt-2 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-amber-500/30">
                <span className="text-[10px] font-bold text-gold uppercase block">Vértice / Cúspide</span>
                <span className="text-xl font-mono font-bold text-white tracking-wider">
                  {pyramidData.keyCombinations.apexCluster}
                </span>
                <button
                  onClick={() => copyToClipboard(pyramidData.keyCombinations.apexCluster, 'pyr-apex')}
                  className="mt-2 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-blue-500/30">
                <span className="text-[10px] font-bold text-blue-400 uppercase block">Núcleo Central</span>
                <span className="text-xl font-mono font-bold text-white tracking-wider">
                  {pyramidData.keyCombinations.centerBase}
                </span>
                <button
                  onClick={() => copyToClipboard(pyramidData.keyCombinations.centerBase, 'pyr-center')}
                  className="mt-2 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeMode === 'statistical' && statisticalData ? (
        /* TAB 3: MODO 100% ESTADÍSTICO */
        <div className="p-8 rounded-3xl glass-card border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Sugerencia 100% Estadística (Basada en SQLite)
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-neon-emerald">
              {statisticalData.confidence}% Fiabilidad
            </span>
          </div>

          {isBaloto ? (
            <div className="my-8 text-center">
              <div className="text-xs text-gray-400 mb-3">Combinación con balance térmico y distribución par/impar:</div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {statisticalData.balotas?.split('-').map((b: string, idx: number) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-full bg-[#151C2C] border-2 border-blue-400 text-white font-mono font-extrabold text-xl flex items-center justify-center shadow-lg"
                  >
                    {b}
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-mono font-black text-xl flex items-center justify-center shadow-glowGold">
                  {statisticalData.superbalota}
                </div>
              </div>
            </div>
          ) : (
            <div className="my-8 text-center">
              <div className="text-xs text-gray-400 mb-2">4 Cifras Optimizadas por Matriz de Calor Posicional:</div>
              <div className="text-5xl font-black font-mono tracking-widest text-neon-emerald drop-shadow-md">
                {statisticalData.number}
              </div>
              {statisticalData.zodiacSign && (
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  Signo dominante: {statisticalData.zodiacSign}
                </div>
              )}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/5 mb-6 text-xs text-gray-400">
            <p className="font-semibold text-white mb-1">Cálculo del Algoritmo:</p>
            <p>{statisticalData.explanation}</p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleSavePlay(
                  isBaloto ? statisticalData.balotas : statisticalData.number,
                  isBaloto ? 'BALOTO' : '4_CIFRAS',
                  'ESTADISTICO',
                  'stat-save',
                  isBaloto ? statisticalData.superbalota : undefined
                )
              }
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${savedPlayId === 'stat-save' ? 'text-neon-emerald fill-neon-emerald' : 'text-gray-400'}`} />
              <span>{savedPlayId === 'stat-save' ? '¡Guardada!' : 'Guardar Jugada'}</span>
            </button>

            <button
              onClick={() =>
                copyToClipboard(
                  isBaloto
                    ? `${statisticalData.balotas} + ${statisticalData.superbalota}`
                    : statisticalData.number,
                  'stat-copy'
                )
              }
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer"
            >
              {copiedId === 'stat-copy' ? (
                <>
                  <Check className="w-4 h-4 text-neon-emerald" /> ¡Jugada Copiada!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Combinación
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

          {/* Panel de Auditoría Pública al final de los modelos */}
          <div className="pt-4">
            <MethodAuditCard />
          </div>
        </>
      )}
    </div>
  );
};
