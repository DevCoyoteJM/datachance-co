import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, X, CheckCircle, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import type { SavedPlay, LatestGroupedResult } from '../types';
import { savedPlaysService } from '../services/savedPlays';

interface SavedPlaysDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  latestResults: LatestGroupedResult[];
}

export const SavedPlaysDrawer: React.FC<SavedPlaysDrawerProps> = ({
  isOpen,
  onClose,
  latestResults,
}) => {
  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPlays = () => {
    setPlays(savedPlaysService.getPlays());
  };

  useEffect(() => {
    loadPlays();
    const handleUpdate = () => loadPlays();
    window.addEventListener('saved-plays-updated', handleUpdate);
    return () => window.removeEventListener('saved-plays-updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    savedPlaysService.deletePlay(id);
  };

  // Compare play against latest results
  const checkWinningStatus = (play: SavedPlay) => {
    for (const r of latestResults) {
      if (!r.latestResult) continue;

      if (play.type === 'BALOTO' && r.lottery.isBaloto) {
        if (r.latestResult.balotas === play.number) {
          return { match: 'FULL', text: `¡Coincidencia total en ${r.lottery.name}!` };
        }
      } else if (r.latestResult.number) {
        const winningNum = r.latestResult.number;
        if (winningNum === play.number) {
          return { match: 'DIRECTO', text: `¡Premio Directo 4 Cifras en ${r.lottery.name} (${winningNum})!` };
        }
        if (winningNum.slice(-2) === play.number.slice(-2)) {
          return { match: 'PATA', text: `¡Acierto de Pata (..${play.number.slice(-2)}) en ${r.lottery.name}!` };
        }
        if (winningNum.slice(-1) === play.number.slice(-1)) {
          return { match: 'UNA', text: `Acierto de Uña (...${play.number.slice(-1)}) en ${r.lottery.name}` };
        }
      }
    }
    return { match: 'NONE', text: 'Pendiente de sorteo o sin coincidencias de hoy' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-[#0E1424] border-l border-white/10 p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold/10 text-gold">
              <Bookmark className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Mis Jugadas Guardadas</h3>
              <p className="text-xs text-gray-400">
                {plays.length} {plays.length === 1 ? 'jugada almacenada' : 'jugadas almacenadas'} en tu navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {plays.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Sparkles className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-sm font-semibold text-gray-300">No tienes jugadas guardadas aún.</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Guarda tus combinaciones favoritas desde el Generador Híbrido, los Datos del Día o el Verificador Global.
              </p>
            </div>
          ) : (
            plays.map((play) => {
              const status = checkWinningStatus(play);
              const isWin = status.match === 'DIRECTO' || status.match === 'FULL';
              const isPartial = status.match === 'PATA' || status.match === 'UNA';

              return (
                <div
                  key={play.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isWin
                      ? 'bg-emerald-950/40 border-neon-emerald/60 shadow-glowGreen'
                      : isPartial
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-[#151C2C]/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-mono font-bold tracking-widest text-neon-emerald">
                          {play.number}
                        </span>
                        {play.superbalota && (
                          <span className="px-2 py-0.5 rounded-md bg-gold/20 text-gold font-mono font-bold text-xs">
                            SB: {play.superbalota}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-semibold text-gray-300">
                          {play.source}
                        </span>
                        {play.lotteryName && <span>{play.lotteryName}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(play.id, play.number)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        title="Copiar número"
                      >
                        {copiedId === play.id ? <Check className="w-4 h-4 text-neon-emerald" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(play.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Eliminar jugada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Verification status against today's draws */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-xs">
                    {isWin ? (
                      <CheckCircle className="w-3.5 h-3.5 text-neon-emerald shrink-0" />
                    ) : isPartial ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        isWin
                          ? 'text-neon-emerald font-bold'
                          : isPartial
                          ? 'text-amber-300 font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {plays.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <button
              onClick={() => savedPlaysService.clearAll()}
              className="text-rose-400 hover:text-rose-300 transition-colors"
            >
              Borrar todas
            </button>
            <span className="text-gray-500">Guardado local seguro</span>
          </div>
        )}
      </div>
    </div>
  );
};
