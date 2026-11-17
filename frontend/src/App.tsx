import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StatsAnalyzer } from './components/StatsAnalyzer';
import { HybridGenerator } from './components/HybridGenerator';
import { Calculator } from './components/Calculator';
import { LegalFooter } from './components/LegalFooter';
import type { Lottery, LatestGroupedResult } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'generator' | 'calculator'>('dashboard');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [results, setResults] = useState<LatestGroupedResult[]>([]);
  const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lotsData, resultsData] = await Promise.all([
        api.getLotteries(),
        api.getLatestResults(),
      ]);
      setLotteries(lotsData);
      setResults(resultsData);
      if (lotsData.length > 0 && !selectedLottery) {
        setSelectedLottery(lotsData[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectForStats = (lottery: Lottery) => {
    setSelectedLottery(lottery);
    setActiveTab('analytics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectForPrediction = (lottery: Lottery) => {
    setSelectedLottery(lottery);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar with live COT time and quick sync */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshData={fetchData}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            results={results}
            loading={loading}
            onSelectLotteryForStats={handleSelectForStats}
            onSelectLotteryForPrediction={handleSelectForPrediction}
          />
        )}

        {activeTab === 'analytics' && (
          <StatsAnalyzer
            lotteries={lotteries}
            selectedLottery={selectedLottery}
            onSelectLottery={setSelectedLottery}
          />
        )}

        {activeTab === 'generator' && (
          <HybridGenerator
            lotteries={lotteries}
            selectedLottery={selectedLottery}
            onSelectLottery={setSelectedLottery}
          />
        )}

        {activeTab === 'calculator' && <Calculator lotteries={lotteries} />}
      </main>

      {/* Legal Footer */}
      <LegalFooter />
    </div>
  );
}

export default App;
