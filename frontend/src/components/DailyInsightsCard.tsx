import React, { useState, useEffect } from 'react';
import type { DailyInsights } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  ArrowRightLeft,
  Layers,
  Copy,
  Check,
  Share2,
  Calendar,
  Clock,
  TrendingDown,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface PopularDraw {
  slug: string;
  name: string;
  schedule: string;
}

const POPULAR_DRAWS: PopularDraw[] = [
  { slug: 'sinuano-dia', name: 'Sinuano Día', schedule: 'Tarde' },
  { slug: 'sinuano-noche', name: 'Sinuano Noche', schedule: 'Noche' },
  { slug: 'dorado-manana', name: 'Dorado Mañana', schedule: 'Mañana' },
  { slug: 'dorado-tarde', name: 'Dorado Tarde', schedule: 'Tarde' },
  { slug: 'chontico-dia', name: 'Chontico Día', schedule: 'Tarde' },
  { slug: 'chontico-noche', name: 'Chontico Noche', schedule: 'Noche' },
  { slug: 'antioquenita-dia', name: 'Antioqueñita Día', schedule: 'Mañana' },
  { slug: 'paisita-dia', name: 'Paisita Día', schedule: 'Tarde' },
  { slug: 'pijao-de-oro', name: 'Pijao de Oro', schedule: 'Tarde' },
];

export const DailyInsightsCard: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<string>('sinuano-dia');
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadInsights(selectedSlug);
  }, [selectedSlug]);

  const loadInsights = async (slug: string) => {
    setLoading(true);
    try {
      const data = await api.getDailyInsights(slug);
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#10B981', '#F59E0B', '#60A5FA'],
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShare = async () => {
    if (!insights) return;
    const shareText = `🎯 *DataChance CO — Datos Rápidos de Hoy*\n` +
      `Sorteo: ${insights.lottery.name}\n` +
      `Último resultado: ${insights.latestResult.number} (Inverso: ${insights.latestResult.invertedNumber})\n` +
      `🔥 *Uñas más demoradas:* ${insights.delayedStats.una.map(u => `${u.digit} (${u.drawsAgo}s)`).join(', ')}\n` +
      `⚡ *Pata más atrasada:* ${insights.delayedStats.pata[0]?.termination || 'N/A'}\n` +
      `🌟 *Jugada Híbrida del Día:* ${insights.hybridRecommendation.primaryCombination} (${insights.hybridRecommendation.confidence}% Confianza)\n` +
      `Consulta más en DataChance CO`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Datos Rápidos de Hoy - ${insights.lottery.name}`,
          text: shareText,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl glass-card border border-emerald-500/30 p-6 md:p-8 bg-gradient-to-br from-[#151C2C] via-[#101726] to-[#0D1322] shadow-glass relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-neon-emerald mb-2">
            <Zap className="w-3.5 h-3.5 text-neon-emerald animate-pulse" />
            <span>Módulo Exclusivo • Cruce Híbrido Diario</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Datos del Día
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-gold border border-amber-500/30">
              Análisis Híbrido
            </span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Cruce en tiempo real para los sorteos más jugados en Colombia: resultado anterior, dígitos invertidos, termometría de retraso (Uña y Pata) y pirámide de la fecha.
          </p>
        </div>

        {/* Quick share button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Compartir o copiar análisis completo"
          >
            {shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-neon-emerald" />
                <span className="text-neon-emerald">¡Copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selector Rápido de Sorteos Populares */}
      <div className="relative z-10 mb-6">
        <label className="block text-xs font-semibold text-gray-400 mb-2">
          Seleccionar Sorteo Diario a Examinar:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {POPULAR_DRAWS.map((draw) => (
            <button
              key={draw.slug}
              onClick={() => setSelectedSlug(draw.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedSlug === draw.slug
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glowGreen border border-emerald-400/40'
                  : 'bg-[#0B0F19]/80 text-gray-400 hover:text-white hover:bg-[#1E273D] border border-white/5'
              }`}
            >
              <span>{draw.name}</span>
              <span className="text-[10px] ml-1.5 opacity-70">({draw.schedule})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Content */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-[#0B0F19]/60 border border-white/5 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-xs text-gray-400 font-mono">Calculando cruce del sorteo con SQLite...</span>
          </div>
        </div>
      ) : !insights ? (
        <div className="text-center py-8 text-gray-400 text-sm">No hay información disponible para este sorteo</div>
      ) : (
        <div className="relative z-10 space-y-6">
          {/* Fila 1: Último Resultado + Inverso + Espejo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Último Resultado Oficial */}
            <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider text-emerald-400">
                  Último Sorteo Oficial
                </span>
                <span className="text-[11px] text-gray-500">
                  {new Date(insights.latestResult.drawDate).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-neon-emerald tabular-nums">
                  {insights.latestResult.number}
                </span>
                {insights.latestResult.series && (
                  <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                    Serie {insights.latestResult.series}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span>{insights.lottery.name}</span>
              </div>
            </div>

            {/* Inverso y Espejo Numerológico */}
            <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/10 flex flex-col justify-between">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-gold mb-2 block">
                Cruce y Simetría Numérica
              </span>
              <div className="grid grid-cols-2 gap-2 my-1">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-medium">Invertido:</span>
                  <span className="text-xl font-bold font-mono text-white tracking-wider tabular-nums">
                    {insights.latestResult.invertedNumber}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-medium">Espejo (+5 mod 10):</span>
                  <span className="text-xl font-bold font-mono text-amber-300 tracking-wider tabular-nums">
                    {insights.latestResult.mirrorNumber}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">
                Inversión posicional y complemento matemático de sorteo.
              </span>
            </div>

            {/* Cruce con Contraparte de Jornada (si existe) */}
            <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/10 flex flex-col justify-between">
              <span className="font-semibold uppercase text-[10px] tracking-wider text-blue-400 mb-2 block">
                Cruce de Jornada Asociada
              </span>
              {insights.counterpartResult ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">{insights.counterpartResult.name}:</span>
                    <span className="text-xl font-extrabold font-mono text-blue-400 tracking-wider tabular-nums">
                      {insights.counterpartResult.number}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3 text-blue-400" />
                    <span>Conexión estadística Día / Noche</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 flex items-center gap-2 my-auto">
                  <span>Sorteo de jornada única diaria.</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/5 text-[10px] text-gray-500">
                Histórico analizado: {insights.delayedStats.totalDrawsAnalyzed} sorteos recientes.
              </div>
            </div>
          </div>

          {/* Fila 2: Termometría de Dígitos Demorados (Uña y Pata) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uña (Última Cifra) */}
            <div className="p-4 rounded-2xl bg-[#151C2C]/70 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  Dígitos Más Demorados en la UÑA (4ª Cifra)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ciclo de Retorno
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {insights.delayedStats.una.map((item, idx) => (
                  <div
                    key={item.digit}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      idx === 0
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-neon-emerald'
                        : 'bg-[#0B0F19] border-white/5 text-gray-300'
                    }`}
                  >
                    <span className="text-2xl font-black font-mono">{item.digit}</span>
                    <span className="text-[10px] text-gray-400 mt-1 font-sans">
                      {item.drawsAgo} sorteos atrás
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter mt-0.5">
                        Líder Atrasado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pata (Últimas 2 Cifras) */}
            <div className="p-4 rounded-2xl bg-[#151C2C]/70 border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-gold" />
                  Terminaciones Más Demoradas en la PATA (2 Cifras)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-gold-light border border-amber-500/20">
                  Alta Tensión
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {insights.delayedStats.pata.map((item, idx) => (
                  <div
                    key={item.termination}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      idx === 0
                        ? 'bg-amber-500/15 border-amber-500/40 text-gold-light'
                        : 'bg-[#0B0F19] border-white/5 text-gray-300'
                    }`}
                  >
                    <span className="text-2xl font-black font-mono">{item.termination}</span>
                    <span className="text-[10px] text-gray-400 mt-1 font-sans">
                      {item.drawsAgo} sorteos sin caer
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] font-bold text-gold uppercase tracking-tighter mt-0.5">
                        Mayor Rezagado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fila 3: Tarjeta Destacada de Jugada Híbrida del Día */}
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#152336] to-amber-950/40 border border-emerald-500/40 shadow-glowGreen/15 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-neon-emerald border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-neon-emerald" />
                  Jugada Híbrida Recomendada para Hoy
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-gold border border-amber-500/30">
                  {insights.hybridRecommendation.confidence}% Confianza
                </span>
              </div>

              <div className="flex items-baseline gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Jugada Principal (4 Cifras):</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white drop-shadow-md">
                    {insights.hybridRecommendation.primaryCombination}
                  </span>
                </div>

                <div className="pl-4 border-l border-white/10">
                  <span className="text-[10px] text-gray-400 font-medium block">Secundaria (Cruce Pata):</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono tracking-wider text-amber-300">
                    {insights.hybridRecommendation.secondaryCombination}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 max-w-xl pt-1">
                {insights.hybridRecommendation.rationale}
              </p>
            </div>

            {/* Actions: Copiar y Compartir */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() =>
                  handleCopy(insights.hybridRecommendation.primaryCombination, 'daily-primary')
                }
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 hover:shadow-glowGreen transition-all cursor-pointer"
              >
                {copiedId === 'daily-primary' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Jugada</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
