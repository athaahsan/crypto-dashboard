import React, { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import ChartWidget from './components/ChartWidget';
import AiInsightPanel from './components/AiInsightPanel';
import KpiRibbon from './components/KpiRibbon';
import FngWidget from './components/FngWidget';
import NewsWidget from './components/NewsWidget';
import Footer from './components/Footer';
import CoinSelector from './components/CoinSelector';
import TopPerformingCoin from './components/TopPerformingCoin';
import { Settings, BarChart2, Activity, Zap, Send, Layers, CandlestickChart, LineChart, AreaChart, ChartColumn } from 'lucide-react';
import { CRYPTO_OPTIONS } from './utils/constants';
import clsx from 'clsx';

const INTERVAL_OPTIONS = [
  { label: '1D', value: '1d' },
  { label: '4H', value: '4h' },
  { label: '1H', value: '1h' },
];
const CHART_TYPE_OPTIONS = [
  {
    label: 'Candles',
    value: 'candlestick',
    icon: <CandlestickChart className="w-5 h-5" />
  },
  {
    label: 'Line',
    value: 'line',
    icon: <LineChart className="w-5 h-5" />
  },
  {
    label: 'Area',
    value: 'area',
    icon: <AreaChart className="w-5 h-5" />
  },
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

  const { data, ticker, fng, ath, news, loading, payload, isLive } = useDashboardData(symbol, interval);

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
          <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-2 flex items-center justify-center shadow-lg shadow-primary/20">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter flex items-baseline select-none">
              <span className="bg-gradient-to-br from-base-content to-base-content/60 bg-clip-text text-transparent">Crypt</span>
              <span className="bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">Dash</span>
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
            className="btn btn-primary btn-sm rounded-xl "
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Get Daily Signals</span>
          </a>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">

        <TopPerformingCoin currentSymbol={symbol} onSelectCoin={setSymbol} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in-up animation-delay-100 opacity-0">

          {/* Left Column: Chart & KPI */}
          <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-4">
            {/* Chart Area */}
            <div className="w-full bg-base-200 border border-base-300 rounded-2xl p-2 shadow-sm flex flex-col gap-2 relative overflow-hidden h-[590px]">

              {/* Chart Controls Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-base-100 p-2 rounded-xl border border-base-300 w-full relative z-30">

                {/* Left side: Symbol, Interval, Chart Type */}
                <div className="flex items-center gap-2 w-full lg:w-1/2">
                  <CoinSelector
                    options={CRYPTO_OPTIONS}
                    value={symbol}
                    onChange={setSymbol}
                  />

                  {/* Interval Segmented Control */}
                  <div className="flex flex-1 basis-0 min-w-0 h-8 items-center">
                    {INTERVAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setInterval(opt.value)}
                        className={clsx(
                          "btn btn-xs flex-1 min-w-0 border-none font-bold transition-colors duration-300 h-full min-h-0 rounded-none first:rounded-l-lg last:rounded-r-lg",
                          interval === opt.value
                            ? "border-solid bg-accent/20 text-primary-content z-10 hover:bg-accent/30"
                            : "border-solid bg-base-200 text-base-content/50 hover:text-base-content hover:bg-base-300"
                        )}
                        title={opt.label}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Chart Type Segmented Control */}
                  <div className="flex flex-1 basis-0 min-w-0 h-8 items-center">
                    {CHART_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setChartType(opt.value)}
                        className={clsx(
                          "btn btn-xs flex-1 min-w-0 border-none transition-colors duration-300 h-full min-h-0 flex items-center justify-center p-0 rounded-none first:rounded-l-lg last:rounded-r-lg",
                          chartType === opt.value
                            ? "border-solid bg-accent/20 text-primary-content z-10 hover:bg-accent/30"
                            : "border-solid bg-base-200 text-base-content/50 hover:text-base-content hover:bg-base-300"
                        )}
                        title={opt.label}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side: Indicators */}
                <div className="flex w-full lg:w-1/2 h-8 h-8 items-center p-0">
                  {INDICATOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleIndicator(opt.value)}
                      className={clsx(
                        "btn btn-xs flex-1 min-w-0 border-none font-bold transition-colors duration-300 h-full min-h-0 rounded-none first:rounded-l-lg last:rounded-r-lg",
                        activeIndicators.includes(opt.value)
                          ? "border-solid bg-accent/20 text-primary-content z-10 hover:bg-accent/30"
                          : "border-solid bg-base-200 text-base-content/50 hover:text-base-content hover:bg-base-300"
                      )}
                      title={opt.label}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-base-100 rounded-xl">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-sm font-medium text-base-content/60">Syncing market data...</p>
                </div>
              ) : (
                <div className="flex-1 w-full rounded-xl overflow-hidden bg-base-100 border border-base-300">
                  <ChartWidget data={data} activeIndicators={activeIndicators} chartType={chartType} />
                </div>
              )}

              {/* KPI Ribbon Below Chart */}
              <KpiRibbon
                ticker={ticker}
                ath={ath}
                data={data}
                formatPrice={formatPrice}
              />
            </div>
          </div>

          {/* Right Column: Fear & Greed */}
          <div className="md:col-span-1 xl:col-span-1">
            <FngWidget fngHistory={fng} getFngTrend={getFngTrend} />
          </div>

          {/* News Area */}
          <div className="md:col-span-1 xl:col-span-2 relative h-[400px] md:h-auto animate-fade-in-up animation-delay-200 opacity-0">
            <div className="md:absolute md:inset-0 h-full">
              <NewsWidget news={news} />
            </div>
          </div>

          {/* AI Panel Area */}
          <div className="md:col-span-2 xl:col-span-2 animate-fade-in-up animation-delay-300 opacity-0">
            <AiInsightPanel payload={payload} symbol={symbol.replace('USDT', '')} />
          </div>

        </div>
      </main>

      {/* Full-width Footer Area */}
      <Footer />
    </div>
  );
}

export default App;