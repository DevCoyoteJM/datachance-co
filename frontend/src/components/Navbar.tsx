import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BarChart3, Calculator, Home, Cpu, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  activeTab: 'dashboard' | 'analytics' | 'generator' | 'calculator';
  setActiveTab: (tab: 'dashboard' | 'analytics' | 'generator' | 'calculator') => void;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onRefreshData }) => {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [bogotaTime, setBogotaTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);
      setBogotaTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.triggerSync();
      setSyncMessage(res.message);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch {
      setSyncMessage('Error al sincronizar resultados');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0F19]/80 border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Live Status */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-glowGreen">
              <div className="w-full h-full bg-[#0B0F19] rounded-xl flex items-center justify-center group-hover:bg-[#151C2C] transition-colors">
                <Sparkles className="w-5 h-5 text-neon-emerald animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white font-sans">
                  DataChance <span className="text-neon-emerald">CO</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fintech Analytics
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Inteligencia Estadística de Loterías y Chances en Colombia
              </p>
            </div>
          </div>

          {/* Quick sync button for mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-2 rounded-lg bg-[#151C2C] border border-white/10 text-emerald-400 hover:text-white"
              title="Sincronizar"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-neon-emerald' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-[#151C2C]/90 rounded-2xl border border-white/10 shadow-inner w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-neon-emerald border border-emerald-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-neon-emerald border border-emerald-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-gold-light border border-amber-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>IA Predictor & Pirámide</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-neon-emerald border border-emerald-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora</span>
          </button>
        </nav>

        {/* Clock & Sync desktop */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151C2C] border border-white/10 text-xs text-gray-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tabular-nums font-mono font-medium">{bogotaTime || 'Bogotá COT'}</span>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
            title="Ejecutar comprobación de resultados en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-neon-emerald' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Verificar Sorteos'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="max-w-7xl mx-auto mt-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{syncMessage}</span>
        </div>
      )}
    </header>
  );
};
