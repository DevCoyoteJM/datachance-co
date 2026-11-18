import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, ChevronLeft, ChevronRight, Filter, RotateCcw, Sparkles } from 'lucide-react';
import type { Lottery, HistoryResultItem, LotteryHistoryResponse } from '../types';
import { api } from '../services/api';

interface LotteryHistoryCardProps {
  lottery: Lottery;
}

export const LotteryHistoryCard: React.FC<LotteryHistoryCardProps> = ({ lottery }) => {
  const [historyData, setHistoryData] = useState<LotteryHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async (targetPage = 1) => {
    setLoading(true);
    try {
      const data = await api.getLotteryHistory(lottery.slug, {
        page: targetPage,
        limit: 15,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setHistoryData(data);
      setPage(targetPage);
    } catch (err) {
      console.error('Error fetching lottery history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSearch('');
    setStartDate('');
    setEndDate('');
    fetchHistory(1);
  }, [lottery.slug]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setLoading(true);
    api
      .getLotteryHistory(lottery.slug, { page: 1, limit: 15 })
      .then((data) => {
        setHistoryData(data);
        setPage(1);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-white/10 mt-6 shadow-2xl transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-neon-emerald">
              <History className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Historial de Sorteos Anteriores
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-neon-emerald border border-emerald-500/30">
              {lottery.name}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Registro cronológico oficial y verificable en SQLite. Filtra por número, terminación (*pata*/*uña*) o rango de fechas.
          </p>
        </div>

        {/* Counter badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs font-mono text-gray-300">
            Total Sorteos: <strong className="text-neon-emerald font-bold">{historyData?.pagination.total || 0}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar 4 cifras, pata o uña..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald transition-colors"
          />
        </div>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-neon-emerald transition-colors"
            title="Fecha inicial"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-neon-emerald transition-colors"
            title="Fecha final"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 py-2 px-3 rounded-xl bg-neon-emerald/20 hover:bg-neon-emerald/30 border border-emerald-500/40 text-neon-emerald font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Filter className="w-3.5 h-3.5" /> Filtrar
          </button>
          {(search || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
              title="Limpiar filtros"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Results Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B0F19]/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider bg-white/[0.02]">
              <th className="py-3.5 px-4">Fecha Sorteo</th>
              <th className="py-3.5 px-4">{lottery.isBaloto ? 'Balotas Ganadoras' : 'Número Oficial'}</th>
              <th className="py-3.5 px-4">{lottery.hasSeries ? 'Serie' : lottery.hasZodiac ? 'Signo Zodiacal' : lottery.isBaloto ? 'Superbalota' : 'Pata / Uña'}</th>
              <th className="py-3.5 px-4 text-center">Días Transcurridos</th>
              <th className="py-3.5 px-4 text-right">Jornada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-neon-emerald border-t-transparent animate-spin" />
                    Cargando historial de sorteos reales...
                  </div>
                </td>
              </tr>
            ) : !historyData?.results || historyData.results.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <p className="font-sans text-sm text-gray-300 mb-1">No se encontraron resultados para los filtros aplicados.</p>
                  <button
                    onClick={handleResetFilters}
                    className="font-sans text-xs text-neon-emerald hover:underline"
                  >
                    Restablecer búsqueda
                  </button>
                </td>
              </tr>
            ) : (
              historyData.results.map((r: HistoryResultItem) => {
                const dateObj = new Date(r.drawDate);
                const dateFormatted = dateObj.toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr key={r.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Fecha */}
                    <td className="py-3.5 px-4 font-sans text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-white">{dateFormatted}</span>
                      </div>
                    </td>

                    {/* Número o Balotas */}
                    <td className="py-3.5 px-4">
                      {lottery.isBaloto ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {r.balotas?.split('-').map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-neon-emerald flex items-center justify-center font-bold text-xs shadow-sm"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-base font-bold tracking-wider text-neon-emerald bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-glowGreen">
                          {r.number}
                        </span>
                      )}
                    </td>

                    {/* Serie / Signo / Extra */}
                    <td className="py-3.5 px-4 font-sans">
                      {lottery.isBaloto ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/20 text-gold border border-gold/40 font-mono font-bold text-xs">
                          <Sparkles className="w-3 h-3" /> SB: {r.superbalota}
                        </span>
                      ) : lottery.hasSeries ? (
                        <span className="text-gray-300 font-mono">
                          {r.series ? `Serie ${r.series}` : 'Sin serie'}
                        </span>
                      ) : lottery.hasZodiac ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                          {r.zodiacSign || 'No reg.'}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-mono">
                          Pata: <strong className="text-white">{r.number?.slice(-2)}</strong> · Uña: <strong className="text-white">{r.number?.slice(-1)}</strong>
                        </span>
                      )}
                    </td>

                    {/* Días Transcurridos */}
                    <td className="py-3.5 px-4 text-center font-sans">
                      {r.daysAgo === 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-neon-emerald border border-emerald-500/30 text-[11px] font-bold">
                          Hoy
                        </span>
                      ) : r.daysAgo === 1 ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px]">
                          Ayer
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-[11px]">
                          Hace {r.daysAgo} días
                        </span>
                      )}
                    </td>

                    {/* Jornada */}
                    <td className="py-3.5 px-4 text-right font-sans text-gray-400">
                      <span className="text-xs">{lottery.schedule}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {historyData && historyData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs">
          <span className="text-gray-400">
            Página <strong className="text-white">{historyData.pagination.page}</strong> de{' '}
            <strong className="text-white">{historyData.pagination.totalPages}</strong> (
            {historyData.pagination.total} sorteos registrados)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchHistory(page - 1)}
              disabled={page <= 1 || loading}
              className="py-1.5 px-3 rounded-xl bg-[#0B0F19] hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <button
              onClick={() => fetchHistory(page + 1)}
              disabled={page >= historyData.pagination.totalPages || loading}
              className="py-1.5 px-3 rounded-xl bg-[#0B0F19] hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-1 transition-colors"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
