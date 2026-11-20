import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import type { AuditRankingResponse, AuditMethodItem } from '../types';

export const MethodAuditCard: React.FC = () => {
  const [data, setData] = useState<AuditRankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAudit = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAuditRanking();
        if (isMounted) {
          setData(res);
          if (res.ranking.length > 0) {
            setSelectedMethodId(res.ranking[0].id);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error al cargar auditoría');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAudit();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#151C2C]/90 rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center min-h-[240px]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-gray-400 font-mono animate-pulse">
          Calculando auditoría de efectividad real de los últimos 15 días en Neon PostgreSQL...
        </p>
      </div>
    );
  }

  if (error || !data || data.ranking.length === 0) {
    return null;
  }

  const selectedMethod =
    data.ranking.find((m) => m.id === selectedMethodId) || data.ranking[0];

  return (
    <div className="bg-[#151C2C]/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-emerald-400 shadow-glowGreen">
            <ShieldCheck className="w-5 h-5 text-neon-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ranking de Efectividad — Auditoría Pública
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Verificable
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Evaluación matemática transparente de los 3 modelos contra los últimos{' '}
              <strong className="text-gray-200">{data.totalEvaluated} sorteos reales</strong> en Colombia (últimos {data.periodDays} días).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-[#0B0F19]/80 px-3 py-1.5 rounded-xl border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Periodo: Últimos 15 días</span>
        </div>
      </div>

      {/* Grid de Métodos: Comparativa de Barras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 relative z-10">
        {data.ranking.map((method, idx) => {
          const isSelected = method.id === selectedMethod.id;
          const isTop = idx === 0;

          return (
            <div
              key={method.id}
              onClick={() => setSelectedMethodId(method.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-950/30 to-[#0B0F19] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                  : 'bg-[#0B0F19]/70 border-white/10 hover:border-white/20'
              }`}
            >
              {isTop && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Award className="w-3 h-3 text-gold" />
                  #1 Mayor Rendimiento
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                    {method.badge}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                    {method.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Score general */}
              <div className="flex items-baseline justify-between mb-3 bg-[#151C2C]/70 p-2.5 rounded-lg border border-white/5">
                <span className="text-xs text-gray-400 font-medium">Índice Compuesto</span>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-neon-emerald">
                    {method.score}
                  </span>
                  <span className="text-[11px] text-gray-400 ml-1">pts</span>
                </div>
              </div>

              {/* Barras de Desglose por Modalidad */}
              <div className="space-y-2 text-xs">
                {/* Uña (1 Cifra) */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span className="font-medium text-gray-400">Uña (Última Cifra - 5x):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {method.unaRate}% ({method.unaHits}/{method.totalEvaluated})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, method.unaRate * 2.5)}%` }}
                    />
                  </div>
                </div>

                {/* Pata (2 Cifras) */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span className="font-medium text-gray-400">Pata (2 Cifras - 400x):</span>
                    <span className="font-mono font-bold text-teal-300">
                      {method.pataRate}% ({method.pataHits}/{method.totalEvaluated})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, method.pataRate * 10)}%` }}
                    />
                  </div>
                </div>

                {/* Combinado */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                    <span className="font-medium text-gray-400">Combinado (4 Cifras - 208x):</span>
                    <span className="font-mono font-bold text-amber-300">
                      {method.combinadoRate}% ({method.combinadoHits}/{method.totalEvaluated})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, method.combinadoRate * 15)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle de Aciertos Reales Verificables del Método Seleccionado */}
      <div className="bg-[#0B0F19]/80 rounded-xl border border-white/10 p-4 relative z-10">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Evidencia Real de Aciertos — {selectedMethod.name}
            </h4>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {selectedMethod.recentHits.length} aciertos auditados recientes
          </span>
        </div>

        {selectedMethod.recentHits.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">
            No se registraron aciertos de alta modalidad en este método en el periodo analizado.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedMethod.recentHits.map((hit, idx) => (
              <div
                key={`${hit.lotteryName}-${idx}`}
                className="p-2.5 rounded-lg bg-[#151C2C]/70 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="block font-semibold text-gray-200 truncate max-w-[140px]">
                    {hit.lotteryName}
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    {formatDate(hit.drawDate)}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px]">
                    <span className="text-gray-400">Ganador:</span>
                    <strong className="text-white bg-white/5 px-1 rounded">{hit.winningNumber}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {hit.matchedModality}
                  </span>
                  <span className="block text-[10px] font-mono text-gold mt-1 font-bold">
                    Premio {hit.payoutMultiplier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aviso Educativo sobre Azar y Transparencia */}
      <div className="mt-4 p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 flex items-start gap-2.5 text-xs text-gray-300 relative z-10">
        <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-teal-300">Auditoría Ética & Azar en Colombia:</strong> Esta auditoría pública
          se calcula de forma automatizada sobre los sorteos oficiales registrados en PostgreSQL. Las proyecciones
          estadísticas y piramidales son herramientas analíticas de estudio y no garantizan ganancias financieras.
        </p>
      </div>
    </div>
  );
};
