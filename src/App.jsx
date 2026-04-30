import React, { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import ChartWidget from './components/ChartWidget';
import AiInsightPanel from './components/AiInsightPanel';
import KpiRibbon from './components/KpiRibbon';
import FngWidget from './components/FngWidget';
import { Settings, BarChart2, Activity, Zap, Send, Layers } from 'lucide-react';
import clsx from 'clsx';

const CRYPTO_OPTIONS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"];
const INTERVAL_OPTIONS = [
  { label: 'Daily', value: '1d' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Hour', value: '1h' },
];
const CHART_TYPE_OPTIONS = [
  { label: 'Candles', value: 'candlestick' },
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
  { label: 'Bar', value: 'bar' },
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
  const [chartType, setChartType] = useState("candlestick");
  const [activeIndicators, setActiveIndicators] = useState(['VOL']);

  // DaisyUI specific theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark'); // Built-in sleek dark theme
  }, []);

  const { data, ticker, fng, ath, loading, payload, isLive } = useDashboardData(symbol, interval);

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
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none select-none">
              crypt<span className="text-primary">Dash</span>
            </h1>
          </div>
          {/* Connection status badge */}
          {isLive ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 border border-success/30 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning/10 border border-warning/30 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              POLLING
            </span>
          )}
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

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in-up animation-delay-100 opacity-0">

          {/* Left Column: Chart & KPI */}
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4">
            {/* Chart Area */}
            <div className="w-full bg-base-200 border border-base-300 rounded-2xl p-2 shadow-sm flex flex-col gap-2 relative overflow-hidden h-[540px]">

              {/* Chart Controls Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-base-100 p-2 rounded-xl border border-base-300 w-full">

                {/* Left side: Symbol and Interval */}
                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="select select-sm md:select-lg bg-base-200 border-none focus:outline-none text-sm font-bold flex-1 rounded-lg min-w-0"
                  >
                    {CRYPTO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('USDT', '')}</option>)}
                  </select>

                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="select select-sm md:select-lg bg-base-200 border-none focus:outline-none text-sm font-medium flex-1 rounded-lg min-w-0"
                  >
                    {INTERVAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>

                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="select select-sm md:select-lg bg-base-200 border-none focus:outline-none text-sm font-medium flex-1 rounded-lg min-w-0"
                  >
                    {CHART_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                {/* Right side: Overlays */}
                <div className="flex items-center gap-1 bg-base-200 p-1 rounded-lg w-full md:w-1/2">
                  <div className="px-2 flex items-center gap-1.5 shrink-0">
                    <Layers className="w-4 h-4 text-base-content/70" />
                    <span className="text-[10px] font-bold text-base-content/70 uppercase tracking-wider hidden sm:block">Overlays</span>
                  </div>
                  <div className="flex flex-1 w-full p-1 rounded-lg shadow-inner gap-1">
                    {INDICATOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleIndicator(opt.value)}
                        className={clsx(
                          "btn btn-sm border-none font-bold h-7 md:h-8 flex-1 min-w-0 rounded-md transition-all duration-300 relative overflow-hidden",
                          activeIndicators.includes(opt.value)
                            ? "bg-primary text-primary-content shadow-sm shadow-primary/30 scale-[1.02] z-10"
                            : "bg-transparent text-base-content/50 hover:bg-base-content/10 hover:text-base-content hover:scale-[1.02]"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-base-100 rounded-xl">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-sm font-medium text-base-content/60">Syncing market data...</p>
                </div>
              ) : (
                <div className="flex-1 w-full rounded-xl overflow-hidden bg-base-100">
                  <ChartWidget data={data} activeIndicators={activeIndicators} chartType={chartType} />
                </div>
              )}
            </div>

            {/* KPI Ribbon Below Chart */}
            <div className="w-full">
              <KpiRibbon
                ticker={ticker}
                ath={ath}
                data={data}
                formatPrice={formatPrice}
              />
            </div>
          </div>

          {/* Right Column: Fear & Greed */}
          <div className="lg:col-span-1 xl:col-span-1">
            <FngWidget fngHistory={fng} getFngTrend={getFngTrend} />
          </div>

          {/* AI Panel Area */}
          <div className="lg:col-span-1 xl:col-span-4 animate-fade-in-up animation-delay-200 opacity-0">
            <AiInsightPanel payload={payload} symbol={symbol.replace('USDT', '')} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;