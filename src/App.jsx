import React, { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import ChartWidget from './components/ChartWidget';
import AiInsightPanel from './components/AiInsightPanel';
import MetricCard from './components/MetricCard';
import { Settings, BarChart2, Activity, Zap, Send, Layers, DollarSign, ArrowUpRight, ArrowDownRight, Gauge } from 'lucide-react';
import clsx from 'clsx';

const CRYPTO_OPTIONS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];
const INTERVAL_OPTIONS = [
  { label: 'Daily', value: '1d' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Hour', value: '1h' },
];
const INDICATOR_OPTIONS = [
  { label: 'VOL', value: 'VOL' },
  { label: 'EMA', value: 'EMA' },
  { label: 'MA', value: 'MA' },
  { label: 'MACD', value: 'MACD' },
  { label: 'RSI', value: 'RSI' }
];

function App() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1d");
  const [activeIndicators, setActiveIndicators] = useState(['VOL', 'EMA']);

  // DaisyUI specific theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark'); // Built-in sleek dark theme
  }, []);

  const { data, ticker, fng, loading, payload } = useDashboardData(symbol, interval);

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const num = parseFloat(price);
    return num >= 1 ? `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${num}`;
  };

  const getFngTrend = (val) => {
    if (val <= 45) return 'down';
    if (val >= 55) return 'up';
    return 'neutral';
  };

  const toggleIndicator = (val) => {
    setActiveIndicators(prev => 
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      {/* Top Navbar */}
      <div className="navbar bg-base-200/80 backdrop-blur-xl sticky top-0 z-50 border-b border-base-300 px-4 md:px-8">
        <div className="flex-1 flex items-center gap-3">
          <div className="bg-primary rounded-xl p-2 flex items-center justify-center shadow-lg shadow-primary/20">
            <BarChart2 className="w-5 h-5 text-primary-content" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Crypto Dashboard</h1>
        </div>
        <div className="flex-none">
          <a
            href="https://t.me/dailybtcinsightbot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm md:btn-md rounded-full shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Get Daily Signals</span>
          </a>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-base-200 p-4 rounded-2xl border border-base-300 shadow-sm">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="select select-bordered select-sm md:select-md bg-base-100 rounded-xl focus:outline-none flex-1 lg:w-40"
            >
              {CRYPTO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('USDT', '')}</option>)}
            </select>
            
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="select select-bordered select-sm md:select-md bg-base-100 rounded-xl focus:outline-none flex-1 lg:w-32"
            >
              {INTERVAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="flex items-center flex-wrap gap-1 bg-base-100 p-2 pr-4 rounded-3xl border border-base-300">
            <div className="px-2 py-1 flex items-center gap-2 border-r border-base-300">
              <Layers className="w-4 h-4 text-base-content/50 " />
              <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider hidden sm:block">Overlays</span>
            </div>
            <div className="join my-2 ml-2">
              {INDICATOR_OPTIONS.map((opt, index) => (
                <button
                  key={opt.value}
                  onClick={() => toggleIndicator(opt.value)}
                  className={clsx(
                    "btn btn-sm md:btn-md join-item border-none",
                    index === 0 && "rounded-l-xl",
                    index === INDICATOR_OPTIONS.length - 1 && "rounded-r-xl",
                    activeIndicators.includes(opt.value)
                      ? "bg-primary text-primary-content hover:bg-primary/90"
                      : "bg-base-100 text-base-content/60 hover:bg-base-200 hover:text-base-content"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs using daisyUI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-in-up animation-delay-100 opacity-0">
          <MetricCard 
            title="Current Price" 
            value={formatPrice(ticker?.lastPrice)} 
            trend={ticker ? (parseFloat(ticker.priceChangePercent) >= 0 ? 'up' : 'down') : undefined}
            trendValue={ticker ? `${parseFloat(ticker.priceChangePercent).toFixed(2)}%` : '-'}
            icon={DollarSign}
          />
          <MetricCard 
            title="24h High" 
            value={formatPrice(ticker?.highPrice)} 
            icon={ArrowUpRight}
          />
          <MetricCard 
            title="24h Low" 
            value={formatPrice(ticker?.lowPrice)} 
            icon={ArrowDownRight}
          />
          <MetricCard 
            title="Fear & Greed Index" 
            value={fng ? fng.value : '--'} 
            subValue={fng ? fng.class : ''}
            trend={fng ? getFngTrend(fng.value) : undefined}
            trendValue={fng ? fng.class : ''}
            icon={Gauge}
          />
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-auto animate-fade-in-up animation-delay-200 opacity-0">
          
          {/* Chart Area */}
          <div className="xl:col-span-2 bg-base-200 border border-base-300 rounded-2xl p-1.5 shadow-sm flex flex-col relative overflow-hidden min-h-[500px]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-sm font-medium text-base-content/60">Syncing market data...</p>
              </div>
            ) : (
              <div className="flex-1 w-full rounded-xl overflow-hidden bg-base-100">
                <ChartWidget data={data} activeIndicators={activeIndicators} />
              </div>
            )}
          </div>

          {/* AI Panel Area */}
          <div className="xl:col-span-1 flex flex-col min-h-[500px] xl:h-[700px]">
            <AiInsightPanel payload={payload} symbol={symbol.replace('USDT', '')} />
          </div>

        </div>
        
      </main>
    </div>
  );
}

export default App;