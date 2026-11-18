import React, { useState } from 'react';
import { Search, Sparkles, Clock, Target, Calendar, CheckCircle2, Bookmark, Flame } from 'lucide-react';
import type { CheckNumberResponse } from '../types';
import { api } from '../services/api';
import { savedPlaysService } from '../services/savedPlays';

export const GlobalNumberChecker: React.FC = () => {
  const [inputNumber, setInputNumber] = useState('');
  const [data, setData] = useState<CheckNumberResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchedNumber, setSearchedNumber] = useState('');

  const handleSearch = async (numToSearch: string) => {
    const clean = numToSearch.replace(/[^\d]/g, '');
    if (!clean) return;

    setLoading(true);
    setSavedSuccess(false);
    try {
      const res = await api.checkNumber(clean);
      setData(res);
      setSearchedNumber(res.number);
    } catch (err) {
      console.error('Error al verificar número:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputNumber);
  };

  const handleSave = () => {
    if (!data) return;
    savedPlaysService.savePlay({
      number: data.number,
      type: '4_CIFRAS',
      source: 'MANUAL',
      notes: `Consultado en Verificador Global (${data.totalOccurrences} apariciones históricas)`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-white/10 shadow-2xl relative overflow-hidden transition-all">
      {/* Background glow accent */}
      <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-neon-emerald">
              <Search className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Verificador Global de Números
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-neon-emerald border border-emerald-500/30">
              Historial 360° Colombia
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Ingresa cualquier número de 4 cifras para escanear todo el histórico real en SQLite: frecuencia nacional, última aparición y loterías donde ha caído.
          </p>
        </div>

        {/* Popular test chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-500 mr-1">Ejemplos de hoy:</span>
          {['7499', '1162', '2809', '0639', '1417'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setInputNumber(chip);
                handleSearch(chip);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-neon-emerald border border-white/10 text-xs font-mono text-gray-300 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={onSubmit} className="flex gap-2 mb-6 relative z-10">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            maxLength={4}
            value={inputNumber}
            onChange={(e) => setInputNumber(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Escribe 4 cifras (ej. 7499 o 1162)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B0F19] border border-white/10 text-base font-mono font-bold text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald transition-colors tracking-widest"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !inputNumber}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-glowGreen"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Target className="w-4 h-4" />
          )}
          Verificar
        </button>
      </form>

      {/* Analysis Output */}
      {data && (
        <div className="space-y-6 pt-4 border-t border-white/10 relative z-10 animate-fadeIn">
          {/* Top Main Stat Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#101826] to-[#151C2C] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="text-center px-5 py-3 rounded-2xl bg-[#0B0F19] border border-emerald-500/30 shadow-glowGreen">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Número Consultado</span>
                <span className="text-3xl font-mono font-black text-neon-emerald tracking-widest">{data.number}</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  {data.totalOccurrences > 0 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-neon-emerald" />
                      Registrado {data.totalOccurrences} {data.totalOccurrences === 1 ? 'vez' : 'veces'} en premios mayores
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-amber-400" />
                      Sin apariciones registradas en los sorteos analizados
                    </>
                  )}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {data.lastAppearance ? (
                    <>
                      Última salida: <strong className="text-white">{new Date(data.lastAppearance).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>{' '}
                      {data.daysAgo === 0 ? (
                        <span className="text-neon-emerald font-bold">(¡Cayó hoy!)</span>
                      ) : (
                        <span className="text-gray-300">(hace {data.daysAgo} días)</span>
                      )}
                    </>
                  ) : (
                    'Este número no ha salido en la muestra de sorteos almacenados en la base de datos.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all"
              >
                <Bookmark className={`w-4 h-4 ${savedSuccess ? 'text-neon-emerald fill-neon-emerald' : 'text-gray-400'}`} />
                {savedSuccess ? '¡Guardada en Favoritos!' : 'Guardar Jugada'}
              </button>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-white/5">
              <span className="text-[11px] text-gray-400 block mb-1">Aparición Directa</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold text-white">{data.totalOccurrences}</span>
                <span className="text-[10px] text-gray-500">veces</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">4 cifras exactas</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-white/5">
              <span className="text-[11px] text-gray-400 block mb-1">Terminación Pata</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold text-neon-emerald">..{data.pata}</span>
                <span className="text-xs font-bold text-gray-300 font-mono">({data.pataOccurrences}x)</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">Últimas 2 cifras en Colombia</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-white/5">
              <span className="text-[11px] text-gray-400 block mb-1">Terminación Uña</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold text-teal-400">...{data.una}</span>
                <span className="text-xs font-bold text-gray-300 font-mono">({data.unaOccurrences}x)</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">Última cifra en Colombia</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-white/5">
              <span className="text-[11px] text-gray-400 block mb-1">Estatus Temporal</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white">
                  {data.daysAgo === null ? 'Rezagado' : data.daysAgo === 0 ? 'Hoy' : data.daysAgo <= 7 ? 'Caliente' : 'En Espera'}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">
                {data.daysAgo !== null ? `${data.daysAgo} días sin caer` : 'Sin registro reciente'}
              </span>
            </div>
          </div>

          {/* Breakdown by lottery */}
          {data.byLottery && data.byLottery.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-neon-emerald" /> Loterías y Chances donde ha salido:
              </h5>
              <div className="flex flex-wrap gap-2">
                {data.byLottery.map((l) => (
                  <div
                    key={l.lotteryName}
                    className="px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 flex items-center gap-2 text-xs"
                  >
                    <span className="font-semibold text-white">{l.lotteryName}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-neon-emerald font-mono font-bold text-[11px]">
                      {l.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Draw occurrences list */}
          {data.recentOccurrences && data.recentOccurrences.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Historial de apariciones registradas:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {data.recentOccurrences.map((occ) => {
                  const d = new Date(occ.drawDate).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <div
                      key={occ.id}
                      className="p-3 rounded-xl bg-[#0B0F19]/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{occ.lotteryName}</span>
                        <span className="text-[11px] text-gray-400">{d}</span>
                      </div>
                      {occ.series && (
                        <span className="text-gray-400 font-mono text-[11px]">Serie {occ.series}</span>
                      )}
                      {occ.zodiacSign && (
                        <span className="text-purple-300 font-semibold text-[11px]">{occ.zodiacSign}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
