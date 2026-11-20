import React, { useState, useEffect } from 'react';
import {
  Radar,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import type { SpecialPatternsResponse, SpecialPatternItem } from '../types';

interface PatternRadarCardProps {
  slug: string;
  lotteryName: string;
}

export const PatternRadarCard: React.FC<PatternRadarCardProps> = ({ slug, lotteryName }) => {
  const [data, setData] = useState<SpecialPatternsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchPatterns = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getSpecialPatterns(slug);
        if (isMounted) setData(res);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error al cargar radar de patrones');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (slug) {
      fetchPatterns();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Sin registro reciente';
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

  const getAlertBadge = (pat: SpecialPatternItem) => {
    if (pat.alertLevel === 'OVERDUE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
          <Flame className="w-3 h-3 text-rose-400" />
          Muy demorado ({pat.overdueRatio}x)
        </span>
      );
    }
    if (pat.alertLevel === 'WARM') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3 text-amber-300" />
          En ciclo de retorno
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        Frecuencia normal
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#151C2C]/90 rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-gray-400 font-mono animate-pulse">
          Rastreando capicúas, escaleras y gemelos en el histórico de {lotteryName}...
        </p>
      </div>
    );
  }

  if (error || !data || !data.patterns) {
    return null;
  }

  const filteredPatterns =
    activeTab === 'all' ? data.patterns : data.patterns.filter((p) => p.key === activeTab);

  return (
    <div className="bg-[#151C2C]/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera del Radar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-neon-emerald shadow-glowGreen">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Radar de Patrones Especiales
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-neon-emerald border border-emerald-500/20">
                Detector 360°
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Capicúas, escaleras consecutivas, pares gemelos y triples registrados en{' '}
              <strong className="text-gray-200">{data.lottery.name}</strong> ({data.totalDrawsAnalyzed} sorteos evaluados).
            </p>
          </div>
        </div>

        {/* Filtros rápidos de patrones */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B0F19]/80 rounded-xl border border-white/10 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-500/20 text-neon-emerald border border-emerald-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos ({data.patterns.length})
          </button>
          {data.patterns.map((p) => (
            <button
              key={p.key}
              onClick={() => setActiveTab(p.key)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === p.key
                  ? 'bg-emerald-500/20 text-neon-emerald border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.name.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Patrones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {filteredPatterns.map((pat) => (
          <div
            key={pat.key}
            className={`p-4 rounded-xl border transition-all ${
              pat.alertLevel === 'OVERDUE'
                ? 'bg-gradient-to-br from-rose-950/20 to-[#0B0F19] border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.08)]'
                : pat.alertLevel === 'WARM'
                ? 'bg-gradient-to-br from-amber-950/20 to-[#0B0F19] border-amber-500/30'
                : 'bg-[#0B0F19]/70 border-white/10 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{pat.name}</h4>
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {pat.formula}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {pat.description}
                </p>
              </div>
              <div className="shrink-0">{getAlertBadge(pat)}</div>
            </div>

            {/* Estadísticas de caída */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-center">
              <div className="bg-[#151C2C]/60 p-2 rounded-lg border border-white/5">
                <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Última Caída
                </span>
                <span className="block text-sm font-black font-mono text-neon-emerald mt-0.5">
                  {pat.lastMatch ? pat.lastMatch.number : '—'}
                </span>
                <span className="block text-[10px] text-gray-400 truncate">
                  {pat.lastMatch ? formatDate(pat.lastMatch.drawDate) : 'N/A'}
                </span>
              </div>

              <div className="bg-[#151C2C]/60 p-2 rounded-lg border border-white/5">
                <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Sorteos Sin Caer
                </span>
                <span
                  className={`block text-sm font-black font-mono mt-0.5 ${
                    pat.isOverdue ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {pat.drawsAgo} {pat.drawsAgo === 1 ? 'sorteo' : 'sorteos'}
                </span>
                <span className="block text-[10px] text-gray-400">
                  {pat.daysAgo !== null ? `Hace ${pat.daysAgo} días` : 'Reciente'}
                </span>
              </div>

              <div className="bg-[#151C2C]/60 p-2 rounded-lg border border-white/5">
                <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Frecuencia Media
                </span>
                <span className="block text-sm font-black font-mono text-gray-200 mt-0.5">
                  ~{pat.avgDrawsBetween}
                </span>
                <span className="block text-[10px] text-gray-400">
                  {pat.totalMatches} apariciones
                </span>
              </div>
            </div>

            {/* Histórico reciente de números con este patrón */}
            {pat.recentMatches.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    Últimas apariciones registradas:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pat.recentMatches.map((m, idx) => (
                    <span
                      key={`${m.number}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-200 hover:border-emerald-500/40 hover:text-neon-emerald transition-colors"
                      title={`Cayó hace ${m.drawsAgo} sorteos (${formatDate(m.drawDate)})`}
                    >
                      <strong className="text-white">{m.number}</strong>
                      <span className="text-[10px] text-gray-400 font-sans">
                        (-{m.drawsAgo})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota educativa y probabilística */}
      <div className="mt-5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-gray-300 relative z-10">
        <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-emerald-300">Aviso Probabilístico:</strong> En el chance en Colombia,
          cada número de 4 cifras tiene exactamente una probabilidad estricta de 1 en 10.000 (0,01%) en cada sorteo independiente.
          El radar detecta desviaciones y ciclos de retorno por agrupación combinatoria para ayudarte a tomar decisiones informadas.
        </p>
      </div>
    </div>
  );
};
