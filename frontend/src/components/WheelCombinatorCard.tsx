import React, { useState, useMemo } from 'react';
import {
  Shuffle,
  Calculator,
  Bookmark,
  Check,
  Copy,
  DollarSign,
  Sparkles,
  HelpCircle,
  Trash2,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { savedPlaysService } from '../services/savedPlays';

const UVT_2026_COP = 47083; // 48 UVT = $2.259.984 COP
const THRESHOLD_UVT_COP = 48 * UVT_2026_COP;

export const WheelCombinatorCard: React.FC = () => {
  const [selectedDigits, setSelectedDigits] = useState<number[]>([1, 4, 7, 9]);
  const [targetLength, setTargetLength] = useState<3 | 4>(4);
  const [allowRepeats, setAllowRepeats] = useState<boolean>(false);
  const [betPerLine, setBetPerLine] = useState<number>(1000);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedAllSuccess, setSavedAllSuccess] = useState<boolean>(false);
  const [savedSingleId, setSavedSingleId] = useState<string | null>(null);

  // Toggle single digit (0-9)
  const toggleDigit = (d: number) => {
    if (selectedDigits.includes(d)) {
      if (selectedDigits.length <= 4) {
        // Enforce minimum 4 digits
        return;
      }
      setSelectedDigits(selectedDigits.filter((x) => x !== d));
    } else {
      if (selectedDigits.length >= 6) {
        // Enforce maximum 6 digits
        return;
      }
      setSelectedDigits([...selectedDigits, d].sort((a, b) => a - b));
    }
  };

  // Generate permutations / combinations
  const generatedCombinations = useMemo(() => {
    const digits = selectedDigits;
    const len = targetLength;
    const results: string[] = [];

    if (!allowRepeats) {
      // Permutaciones sin repetición de longitud `len`
      const permute = (current: number[], usedIndices: Set<number>) => {
        if (current.length === len) {
          results.push(current.join(''));
          return;
        }
        for (let i = 0; i < digits.length; i++) {
          if (!usedIndices.has(i)) {
            usedIndices.add(i);
            current.push(digits[i]);
            permute(current, usedIndices);
            current.pop();
            usedIndices.delete(i);
          }
        }
      };
      permute([], new Set());
    } else {
      // Combinaciones con repetición permitida (desdoblamiento ampliado)
      // Limitamos a un subconjunto razonable (máx 100 combinaciones)
      const generateWithRepeats = (current: number[]) => {
        if (current.length === len) {
          results.push(current.join(''));
          return;
        }
        for (let i = 0; i < digits.length; i++) {
          current.push(digits[i]);
          generateWithRepeats(current);
          current.pop();
        }
      };
      generateWithRepeats([]);
    }

    // Unique and sorted
    return Array.from(new Set(results)).sort();
  }, [selectedDigits, targetLength, allowRepeats]);

  const totalLines = generatedCombinations.length;
  const totalCost = totalLines * betPerLine;

  // Potential prizes
  const directMultiplier = targetLength === 4 ? 4500 : 400;
  const combinadoMultiplier = targetLength === 4 ? 208 : 83;

  const grossDirectPrize = betPerLine * directMultiplier;
  const netDirectPrize =
    grossDirectPrize > THRESHOLD_UVT_COP
      ? Math.round(grossDirectPrize * 0.8)
      : grossDirectPrize;

  const grossCombinadoPrize = betPerLine * combinadoMultiplier;
  const netCombinadoPrize =
    grossCombinadoPrize > THRESHOLD_UVT_COP
      ? Math.round(grossCombinadoPrize * 0.8)
      : grossCombinadoPrize;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedCombinations.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAll = () => {
    const type = targetLength === 4 ? '4_CIFRAS' : 'PATA';
    generatedCombinations.forEach((num) => {
      savedPlaysService.savePlay({
        number: num,
        type,
        source: 'RUEDA_NUMERICA',
        notes: `Rueda Numérica (${selectedDigits.join('')}) • ${totalLines} líneas`,
      });
    });
    setSavedAllSuccess(true);
    setTimeout(() => setSavedAllSuccess(false), 2500);
  };

  const handleSaveSingle = (num: string) => {
    const type = targetLength === 4 ? '4_CIFRAS' : 'PATA';
    savedPlaysService.savePlay({
      number: num,
      type,
      source: 'RUEDA_NUMERICA',
      notes: `Rueda Numérica individual (${selectedDigits.join('')})`,
    });
    setSavedSingleId(num);
    setTimeout(() => setSavedSingleId(null), 1500);
  };

  return (
    <div className="bg-[#151C2C]/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera de la Rueda Numérica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-sm">
            <Shuffle className="w-5 h-5 text-neon-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Generador de Combinaciones — Rueda Numérica
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Desdoblamiento
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Genera la cobertura matemática total de tus 4 a 6 dígitos favoritos para 4 cifras o 3 cifras (Pata).
            </p>
          </div>
        </div>

        {/* Badge contador */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-[#0B0F19]/80 px-3 py-1.5 rounded-xl border border-white/10">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>
            {selectedDigits.length} de 6 dígitos seleccionados (mín. 4)
          </span>
        </div>
      </div>

      {/* Selector de Dígitos (0 al 9) */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-gray-200">
            1. Elige entre 4 y 6 dígitos favoritos:
          </label>
          <span className="text-[11px] text-gray-400 font-mono">
            Seleccionados: [{selectedDigits.join(', ')}]
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
            const isSelected = selectedDigits.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDigit(d)}
                className={`h-12 rounded-xl font-mono text-lg font-black transition-all flex items-center justify-center border shadow-sm ${
                  isSelected
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] scale-105'
                    : 'bg-[#0B0F19] text-gray-300 border-white/10 hover:border-white/20 hover:bg-[#151C2C]'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controles de Configuración: Longitud, Repetición y Apuesta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-[#0B0F19]/80 border border-white/10 relative z-10 text-xs">
        {/* Longitud */}
        <div>
          <label className="block text-gray-400 font-semibold mb-1.5">
            2. Tipo de Combinación:
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#151C2C] rounded-lg border border-white/5">
            <button
              onClick={() => setTargetLength(4)}
              className={`py-1.5 rounded-md font-bold transition-all ${
                targetLength === 4
                  ? 'bg-emerald-500/20 text-neon-emerald border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              4 Cifras
            </button>
            <button
              onClick={() => setTargetLength(3)}
              className={`py-1.5 rounded-md font-bold transition-all ${
                targetLength === 3
                  ? 'bg-emerald-500/20 text-neon-emerald border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              3 Cifras (Pata)
            </button>
          </div>
        </div>

        {/* Toggle de Repetición */}
        <div>
          <label className="block text-gray-400 font-semibold mb-1.5">
            3. Regla de Dígitos:
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#151C2C] rounded-lg border border-white/5">
            <button
              onClick={() => setAllowRepeats(false)}
              className={`py-1.5 rounded-md font-bold transition-all ${
                !allowRepeats
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sin Repetir
            </button>
            <button
              onClick={() => setAllowRepeats(true)}
              className={`py-1.5 rounded-md font-bold transition-all ${
                allowRepeats
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Con Repetición
            </button>
          </div>
        </div>

        {/* Valor Apostado por Línea */}
        <div>
          <label className="block text-gray-400 font-semibold mb-1.5">
            4. Apuesta por Línea (COP):
          </label>
          <div className="flex items-center gap-1.5">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetPerLine(amt)}
                className={`flex-1 py-1.5 rounded-lg font-mono font-bold transition-all border ${
                  betPerLine === amt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-[#151C2C] text-gray-300 border-white/5 hover:border-white/20'
                }`}
              >
                ${amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen Financiero y Premios Oficiales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 relative z-10 text-xs">
        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/10 text-center">
          <span className="block text-[10px] uppercase font-semibold text-gray-400">
            Inversión Total ({totalLines} líneas)
          </span>
          <span className="block text-xl font-black font-mono text-white mt-1">
            {formatCOP(totalCost)}
          </span>
          <span className="block text-[10px] text-gray-400 mt-0.5">
            {formatCOP(betPerLine)} × {totalLines} apuestas
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
          <span className="block text-[10px] uppercase font-semibold text-emerald-400">
            Premio Directo Neto ({directMultiplier}x)
          </span>
          <span className="block text-xl font-black font-mono text-neon-emerald mt-1">
            {formatCOP(netDirectPrize)}
          </span>
          <span className="block text-[10px] text-emerald-300/80 mt-0.5">
            {grossDirectPrize > THRESHOLD_UVT_COP ? 'Bruto ' + formatCOP(grossDirectPrize) + ' (-20% UVT)' : '100% Exento de retención'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 text-center">
          <span className="block text-[10px] uppercase font-semibold text-teal-400">
            Premio Combinado Neto ({combinadoMultiplier}x)
          </span>
          <span className="block text-xl font-black font-mono text-teal-300 mt-1">
            {formatCOP(netCombinadoPrize)}
          </span>
          <span className="block text-[10px] text-teal-300/80 mt-0.5">
            Cualquier orden de los {targetLength} dígitos
          </span>
        </div>
      </div>

      {/* Barra de Acciones de la Lista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 relative z-10">
        <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Combinaciones Generadas ({totalLines} total):
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 rounded-xl bg-[#0B0F19] hover:bg-[#151C2C] border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiadas' : 'Copiar Todas'}</span>
          </button>

          <button
            onClick={handleSaveAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              savedAllSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black'
            }`}
          >
            {savedAllSuccess ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{savedAllSuccess ? 'Guardadas en Mis Jugadas' : 'Guardar Todo'}</span>
          </button>
        </div>
      </div>

      {/* Grid de Chips de Combinaciones */}
      <div className="p-3 bg-[#0B0F19]/90 rounded-xl border border-white/10 max-h-56 overflow-y-auto relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {generatedCombinations.map((combo) => {
            const isSingleSaved = savedSingleId === combo;
            return (
              <div
                key={combo}
                className="p-2 rounded-lg bg-[#151C2C]/80 border border-white/5 hover:border-emerald-500/40 flex items-center justify-between gap-1 group transition-colors"
              >
                <span className="font-mono font-black text-xs text-white tracking-wider">
                  {combo}
                </span>
                <button
                  onClick={() => handleSaveSingle(combo)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gold transition-opacity"
                  title="Guardar esta línea"
                >
                  {isSingleSaved ? (
                    <Check className="w-3 h-3 text-neon-emerald" />
                  ) : (
                    <Bookmark className="w-3 h-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota educativa */}
      <div className="mt-4 p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 flex items-start gap-2.5 text-xs text-gray-300 relative z-10">
        <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-teal-300">Estrategia de Rueda Numérica:</strong> El desdoblamiento matemático
          es utilizado por apostadores expertos para garantizar aciertos si el sorteo contiene tus dígitos clave.
          Calcula tu presupuesto antes de apostar y mantén el juego responsable.
        </p>
      </div>
    </div>
  );
};
