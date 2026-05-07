import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { CRYPTO_OPTIONS } from '../utils/constants';
import clsx from 'clsx';

export default function TopPerformingCoin({ currentSymbol, onSelectCoin, ticker: externalTicker }) {
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let ws = null;
    let updateInterval = null;
    let pollTimer = null;
    const coinsDataRef = {};

    function stopPolling() {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    }

    function startPolling() {
      if (pollTimer) return;
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }

      async function poll() {
        if (cancelled) return;
        try {
          const response = await fetch('https://data-api.binance.vision/api/v3/ticker/24hr');
          const data = await response.json();
          if (cancelled) return;
          
          data.forEach(ticker => {
            if (CRYPTO_OPTIONS.includes(ticker.symbol)) {
              coinsDataRef[ticker.symbol] = {
                symbol: ticker.symbol,
                priceChangePercent: parseFloat(ticker.priceChangePercent),
                lastPrice: parseFloat(ticker.lastPrice)
              };
            }
          });
          updateTopCoins();
        } catch (e) {
          // silently retry next cycle
        }
        if (!cancelled) {
          pollTimer = setTimeout(poll, 10000); // Poll every 10 seconds
        }
      }
      poll();
    }

    async function initializeData() {
      try {
        const response = await fetch('https://data-api.binance.vision/api/v3/ticker/24hr');
        const data = await response.json();
        
        if (cancelled) return;

        data.forEach(ticker => {
          if (CRYPTO_OPTIONS.includes(ticker.symbol)) {
            coinsDataRef[ticker.symbol] = {
              symbol: ticker.symbol,
              priceChangePercent: parseFloat(ticker.priceChangePercent),
              lastPrice: parseFloat(ticker.lastPrice)
            };
          }
        });

        updateTopCoins();
        connectWebSocket();
      } catch (error) {
        console.error("Failed to fetch initial top performing coins", error);
        startPolling(); // Fallback if initial fetch fails
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function updateTopCoins() {
      if (cancelled) return;
      const allCoins = Object.values(coinsDataRef);
      if (allCoins.length > 0) {
        allCoins.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
        setTopCoins([...allCoins.slice(0, 5)]);
      }
    }

    function connectWebSocket() {
      ws = new WebSocket('wss://stream.binance.com/ws/!ticker@arr');
      
      const wsTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN && !cancelled) {
          console.warn('[TopPerformingCoin] WebSocket timed out — switching to polling fallback.');
          ws.close();
          startPolling();
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(wsTimeout);
        if (!cancelled && !updateInterval) {
          // Throttle React updates to once per second for performance
          updateInterval = setInterval(updateTopCoins, 1000);
        }
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        const tickers = JSON.parse(event.data);
        tickers.forEach(ticker => {
          if (CRYPTO_OPTIONS.includes(ticker.s)) {
            coinsDataRef[ticker.s] = {
              symbol: ticker.s,
              priceChangePercent: parseFloat(ticker.P),
              lastPrice: parseFloat(ticker.c)
            };
          }
        });
      };

      ws.onerror = () => {
        clearTimeout(wsTimeout);
        if (!cancelled) {
          console.warn('[TopPerformingCoin] WebSocket error — switching to polling fallback.');
          startPolling();
        }
      };

      ws.onclose = (e) => {
        clearTimeout(wsTimeout);
        if (!cancelled && e.code !== 1000) {
          console.warn('[TopPerformingCoin] WebSocket closed unexpectedly — switching to polling fallback.');
          startPolling();
        }
      };
    }

    initializeData();

    return () => {
      cancelled = true;
      stopPolling();
      if (ws) {
        // Prevent reconnect loop on unmount
        ws.onclose = null; 
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
      if (updateInterval) clearInterval(updateInterval);
    };
  }, []);

  if (loading || topCoins.length === 0) {
    return (
      <div className="w-full h-14 bg-base-200 animate-pulse rounded-xl border border-base-300"></div>
    );
  }

  const getLogoUrl = (sym) => `https://assets.coincap.io/assets/icons/${sym.replace('USDT', '').toLowerCase()}@2x.png`;

  return (
    <div className="bg-gradient-to-r from-success/10 to-base-200 border border-success/20 rounded-xl p-2 w-full shadow-sm flex flex-col md:flex-row items-center gap-2 md:gap-4 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0 px-2 pt-1 md:pt-0">
        <div className="bg-success/20 p-1 rounded-full flex items-center justify-center shadow-inner shadow-success/10">
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/80 whitespace-nowrap">Top Movers (24H)</h2>
      </div>
      
      <div className="flex overflow-x-auto gap-2 w-full pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {topCoins.map((coin, index) => {
          const isActive = currentSymbol === coin.symbol;
          // For the active coin, prefer the authoritative ticker from useDashboardData
          // so the 24H% matches KpiRibbon exactly.
          const changePercent = (isActive && externalTicker)
            ? parseFloat(externalTicker.priceChangePercent)
            : parseFloat(coin.priceChangePercent);
          const displayPrice = (isActive && externalTicker)
            ? parseFloat(externalTicker.lastPrice)
            : parseFloat(coin.lastPrice);
          const isPositive = changePercent >= 0;


          return (
            <button 
              key={coin.symbol} 
              onClick={() => onSelectCoin && onSelectCoin(coin.symbol)}
              className={clsx(
                "bg-base-100 rounded-lg px-3 py-1.5 border flex items-center gap-3 shrink-0 shadow-sm transition-all hover:border-accent/50 cursor-pointer hover:shadow-md border-base-300"
              )}
            >
              <div className="text-[10px] font-bold text-base-content/50 bg-base-200 px-1.5 py-0.5 rounded">
                #{index + 1}
              </div>
              
              <div className="flex items-center gap-1.5">
                <img 
                  src={getLogoUrl(coin.symbol)} 
                  alt={coin.symbol} 
                  className="w-4 h-4 rounded-full"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <span className="font-bold text-sm tracking-tight text-base-content">
                  {coin.symbol.replace('USDT', '')}
                </span>
              </div>
              
              <span className={`font-bold text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
              
              <span className="font-mono text-xs text-base-content/60">
                ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}