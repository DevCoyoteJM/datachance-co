import React, { useState, useEffect } from 'react';
import {
  Moon,
  Search,
  Sparkles,
  Bookmark,
  Check,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  HelpCircle,
  Copy,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';
import { DREAMS_DICTIONARY } from '../data/dreamsData';
import { api } from '../services/api';
import { savedPlaysService } from '../services/savedPlays';
import type { DreamItem, CheckNumberResponse } from '../types';

export const DreamsAlmanacCard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeDream, setActiveDream] = useState<DreamItem>(DREAMS_DICTIONARY[0]);
  const [statsData, setStatsData] = useState<CheckNumberResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch real data when active dream changes
  useEffect(() => {
    let isMounted = true;
    const fetchCrossStats = async () => {
      if (!activeDream) return;
      setLoadingStats(true);
      try {
        const res = await api.checkNumber(activeDream.number);
        if (isMounted) setStatsData(res);
      } catch (err) {
        console.error('Error fetching dream number stats:', err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    fetchCrossStats();

    return () => {
      isMounted = false;
    };
  }, [activeDream]);

  const categories = [
    'Todos',
    'Animales',
    'Naturaleza',
    'Dinero & Prosperidad',
    'Familia & Vida',
    'Sucesos & Emociones',
    'Objetos & Cotidiano',
  ];

  const filteredDreams = DREAMS_DICTIONARY.filter((d) => {
    const matchesCat = selectedCategory === 'Todos' || d.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.keyword.toLowerCase().includes(q) ||
      d.meaning.toLowerCase().includes(q) ||
      d.number.includes(q) ||
      d.pata.includes(q);
    return matchesCat && matchesSearch;
  });

  const handleSavePlay = () => {
    if (!activeDream) return;
    savedPlaysService.savePlay({
      number: activeDream.number,
      type: '4_CIFRAS',
      source: 'ALMANAQUE_SUENOS',
      notes: `Sueño / Agüero: ${activeDream.keyword} (${activeDream.meaning.slice(0, 45)}...)`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyNumber = () => {
    if (!activeDream) return;
    navigator.clipboard.writeText(activeDream.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Sin caída en histórico';
    try {
      return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  // Determine thermal status based on real data
  const getThermalStatus = () => {
    if (!statsData) return { label: 'Consultando...', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
    if (statsData.totalOccurrences === 0) {
      return {
        label: 'INÉDITO / VIRGEN (0 caídas)',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        explanation: 'Nunca ha caído en el histórico registrado de Colombia; alta expectativa de estreno.',
      };
    }
    if (statsData.daysAgo !== null && statsData.daysAgo < 60) {
      return {
        label: 'CALIENTE (Caída Reciente)',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        explanation: `Cayó hace apenas ${statsData.daysAgo} días. Frecuencia activa en el radar nacional.`,
      };
    }
    if (statsData.daysAgo !== null && statsData.daysAgo > 180) {
      return {
        label: 'FRÍO / DEMORADO (Ciclo de Retorno)',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        explanation: `Suma más de ${statsData.daysAgo} días sin caer en 4 cifras. Candidato de retorno.`,
      };
    }
    return {
      label: 'TEMPERATURA MEDIA',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      explanation: `Registra ${statsData.totalOccurrences} caídas totales en Colombia. Comportamiento equilibrado.`,
    };
  };

  const thermal = getThermalStatus();

  return (
    <div className="bg-[#151C2C]/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera del Almanaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
            <Moon className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Almanaque de Agüeros y Sueños
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Tabla de la Suerte CO
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Diccionario popular colombiano cruzado en tiempo real contra los resultados reales de Colombia.
            </p>
          </div>
        </div>

        {/* Buscador de sueños */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar sueño, animal, objeto..."
            className="w-full bg-[#0B0F19] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categorías Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none relative z-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'bg-[#0B0F19]/60 text-gray-400 hover:text-white border border-white/5 hover:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contenido Principal: Grid de Exploración + Panel de Cruce Real */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Lista de Sueños (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F19]/80 rounded-xl border border-white/10 p-3 max-h-[460px] overflow-y-auto">
          {filteredDreams.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs">
              No se encontraron agüeros para &ldquo;{search}&rdquo;. Intenta con palabras como perro, dinero, boda, agua...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDreams.map((item) => {
                const isSelected = activeDream.keyword === item.keyword;
                return (
                  <button
                    key={item.keyword}
                    onClick={() => setActiveDream(item)}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-950/40 to-indigo-950/20 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                        : 'bg-[#151C2C]/50 border-white/5 hover:border-white/20 hover:bg-[#151C2C]/80'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-white truncate">
                        {item.keyword}
                      </span>
                      <span className="block text-[10px] text-gray-400 truncate mt-0.5">
                        {item.meaning}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-mono font-black text-sm text-purple-300">
                        {item.number}
                      </span>
                      <span className="block font-mono text-[10px] text-gray-400">
                        Pata: {item.pata}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel de Detalle & Cruce Real con PostgreSQL (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#121826] to-[#0B0F19] rounded-xl border border-purple-500/30 p-5 flex flex-col justify-between shadow-lg">
          <div>
            {/* Header del detalle */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  {activeDream.category}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {activeDream.keyword}
                </h4>
                <p className="text-xs text-gray-300 mt-1 italic leading-relaxed">
                  &ldquo;{activeDream.meaning}&rdquo;
                </p>
              </div>

              {/* Botón de Copiar */}
              <button
                onClick={handleCopyNumber}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors shrink-0"
                title="Copiar número"
              >
                {copied ? <Check className="w-4 h-4 text-neon-emerald" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Ficha Visual del Número */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/10 text-center">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  4 Cifras Directo
                </span>
                <span className="block text-2xl font-black font-mono text-neon-emerald tracking-widest mt-1">
                  {activeDream.number}
                </span>
                <span className="block text-[10px] text-gray-400 mt-0.5">Premio 4.500x</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/10 text-center">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Pata (2 Cifras)
                </span>
                <span className="block text-2xl font-black font-mono text-teal-300 tracking-widest mt-1">
                  {activeDream.pata}
                </span>
                <span className="block text-[10px] text-gray-400 mt-0.5">Premio 400x</span>
              </div>
            </div>

            {/* Cruce Real en la Base de Datos */}
            <div className="p-3.5 rounded-xl bg-[#151C2C]/80 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="flex items-center gap-1.5 font-semibold text-gray-300">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Estado Térmico Real:
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${thermal.color}`}
                >
                  {thermal.label}
                </span>
              </div>

              {loadingStats ? (
                <div className="py-4 text-center text-xs text-gray-400 font-mono animate-pulse">
                  Cruzando con Neon PostgreSQL...
                </div>
              ) : statsData ? (
                <>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Caídas exactas en Colombia:</span>
                    <strong className="font-mono text-white">
                      {statsData.totalOccurrences} {statsData.totalOccurrences === 1 ? 'vez' : 'veces'}
                    </strong>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Última caída registrada:</span>
                    <strong className="font-mono text-emerald-400">
                      {statsData.lastAppearance ? formatDate(statsData.lastAppearance) : 'Nunca'}
                    </strong>
                  </div>

                  {statsData.daysAgo !== null && (
                    <div className="flex justify-between text-gray-300">
                      <span className="text-gray-400">Días transcurridos:</span>
                      <strong className="font-mono text-gray-200">
                        {statsData.daysAgo} días sin caer
                      </strong>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Frecuencia de la Pata ({statsData.pata}):</span>
                    <strong className="font-mono text-teal-300">
                      {statsData.pataOccurrences} caídas
                    </strong>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-[11px]">Sin datos de conexión en este momento.</p>
              )}
            </div>
          </div>

          {/* Botón de Acción: Guardar en Mis Jugadas */}
          <div className="mt-5 pt-3 border-t border-white/10">
            <button
              onClick={handleSavePlay}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Guardado en Mis Jugadas
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Guardar {activeDream.number} en Mis Jugadas
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Nota cultural */}
      <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-2 text-xs text-gray-300 relative z-10">
        <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-purple-300">Tradición Popular de Colombia:</strong> La tabla de sueños
          es una manifestación del folclore y agüeros tradicionales del chance colombiano. DataChance CO
          cruza estos agüeros con datos estadísticos reales para que conozcas la temperatura histórica de tu intuición.
        </p>
      </div>
    </div>
  );
};
