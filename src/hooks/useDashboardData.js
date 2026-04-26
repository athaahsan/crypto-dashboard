import { useState, useEffect, useRef } from 'react';
import { fetchKlines, fetchTicker, fetchFearAndGreed } from '../services/api';
import { calculateEMA, calculateMA, calculateRSI, calculateMACD, calculateADX, r4 } from '../utils/indicators';

// How often to poll when WebSocket is unavailable (ms)
const POLL_INTERVAL_MS = 10_000;

export function useDashboardData(symbol, interval) {
  const [data, setData] = useState(null);
  const [ticker, setTicker] = useState(null);
  const [fng, setFng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  // true = WebSocket connected, false = polling fallback
  const [isLive, setIsLive] = useState(false);

  const klinesRef = useRef([]);
  const fngRef = useRef(null);
  // Keep ws in a ref so the cleanup function always has the real WebSocket
  // instance regardless of when the async load() finishes.
  const wsRef = useRef(null);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function stopPolling() {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    function startPolling() {
      if (pollTimerRef.current) return; // already polling
      setIsLive(false);

      async function poll() {
        if (cancelled) return;
        try {
          const [klines, tickerData] = await Promise.all([
            fetchKlines(symbol, interval, 300),
            fetchTicker(symbol),
          ]);
          if (cancelled) return;
          klinesRef.current = klines;
          setTicker(tickerData);
          processData(klines, fngRef.current);
        } catch (e) {
          // silently retry next cycle
        }
        if (!cancelled) {
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }

      poll(); // first poll immediately, then schedule
    }

    function processData(klines, fngData) {
      const closes = klines.map(k => k.close);
      const highs = klines.map(k => k.high);
      const lows = klines.map(k => k.low);

      const ema20 = calculateEMA(closes, 20);
      const ema50 = calculateEMA(closes, 50);
      const ema100 = calculateEMA(closes, 100);

      const ma7 = calculateMA(closes, 7);
      const ma50 = calculateMA(closes, 50);
      const ma100 = calculateMA(closes, 100);

      const rsi14 = calculateRSI(closes, 14);
      const { macdLine, signalLine, macdHistogram } = calculateMACD(closes);
      const { adx, plusDi, minusDi } = calculateADX(highs, lows, closes, 14);

      const lastClose = closes[closes.length - 1];
      const lastEma20 = ema20[ema20.length - 1];
      const lastEma50 = ema50[ema50.length - 1];
      const lastEma100 = ema100[ema100.length - 1];

      const technicalPayload = {
        source: "binance",
        instrument: symbol,
        timeframe: interval,
        price_last_14: closes.slice(-14).map(r4),
        ema_20: r4(lastEma20),
        ema_50: r4(lastEma50),
        ema_100: r4(lastEma100),
        price_vs_ema20_percent: r4(((lastClose - lastEma20) / lastEma20) * 100),
        price_vs_ema50_percent: r4(((lastClose - lastEma50) / lastEma50) * 100),
        price_vs_ema100_percent: r4(((lastClose - lastEma100) / lastEma100) * 100),
        rsi_14_last_7: rsi14.slice(-7).map(r4),
        macd_histogram_12_26_9_last_7: macdHistogram.slice(-7).map(r4),
        adx_14: r4(adx[adx.length - 1]),
        positive_di_14: r4(plusDi[plusDi.length - 1]),
        negative_di_14: r4(minusDi[minusDi.length - 1]),
        di_delta_14: r4(plusDi[plusDi.length - 1] - minusDi[minusDi.length - 1]),
        crypto_fng_value: fngData?.value,
        crypto_fng_class: fngData?.class
      };

      const chartData = klines.map((k, i) => ({
        ...k,
        ema20: ema20[i],
        ema50: ema50[i],
        ema100: ema100[i],
        ma7: ma7[i],
        ma50: ma50[i],
        ma100: ma100[i],
        rsi14: rsi14[i],
        macdLine: macdLine[i],
        macdSignal: signalLine[i],
        macdHist: macdHistogram[i]
      }));

      setData(chartData);
      setPayload(technicalPayload);
    }

    async function load() {
      setLoading(true);
      try {
        const [klines, tickerData, fngData] = await Promise.all([
          fetchKlines(symbol, interval, 300),
          fetchTicker(symbol),
          fetchFearAndGreed()
        ]);

        // If the effect was cleaned up while we were awaiting, bail out
        // without opening a new WebSocket.
        if (cancelled) return;

        klinesRef.current = klines;
        fngRef.current = fngData;
        setTicker(tickerData);
        setFng(fngData);

        processData(klines, fngData);

        // Setup WebSocket for realtime updates
        const wsUrl = `wss://stream.binance.com/stream?streams=${symbol.toLowerCase()}@ticker/${symbol.toLowerCase()}@kline_${interval}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Give the socket 5 s to connect; if it hasn't opened by then, fall
        // back to polling. This covers geo-blocked environments where the
        // browser silently drops the TCP connection without firing onerror.
        const wsTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN && !cancelled) {
            console.warn('[useDashboardData] WebSocket timed out — switching to polling fallback.');
            ws.close();
            startPolling();
          }
        }, 5000);

        ws.onopen = () => {
          clearTimeout(wsTimeout);
          if (!cancelled) setIsLive(true);
        };

        ws.onerror = () => {
          clearTimeout(wsTimeout);
          if (!cancelled) {
            console.warn('[useDashboardData] WebSocket error — switching to polling fallback.');
            startPolling();
          }
        };

        ws.onclose = (e) => {
          clearTimeout(wsTimeout);
          // code 1000 = intentional close (our cleanup), anything else = unexpected
          if (!cancelled && e.code !== 1000) {
            console.warn('[useDashboardData] WebSocket closed unexpectedly — switching to polling fallback.');
            startPolling();
          }
          if (!cancelled) setIsLive(false);
        };

        ws.onmessage = (event) => {
          const payloadRaw = JSON.parse(event.data);
          // Combined stream payloads wrap the message in "data"
          const msg = payloadRaw.data || payloadRaw;

          if (msg.e === '24hrTicker') {
            setTicker(prev => ({
              ...prev,
              lastPrice: msg.c,
              priceChangePercent: msg.P,
              highPrice: msg.h,
              lowPrice: msg.l,
            }));
          } else if (msg.e === 'kline') {
            const k = msg.k;
            const newKline = {
              time: k.t / 1000,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };

            let currentKlines = [...klinesRef.current];
            const existingIdx = currentKlines.findIndex(c => c.time === newKline.time);

            if (existingIdx !== -1) {
              currentKlines[existingIdx] = newKline;
            } else {
              currentKlines.push(newKline);
              currentKlines.sort((a, b) => a.time - b.time);
              if (currentKlines.length > 300) currentKlines.shift();
            }

            klinesRef.current = currentKlines;
            processData(currentKlines, fngRef.current);
          }
        };

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      stopPolling();
      const ws = wsRef.current;
      if (ws) {
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        wsRef.current = null;
      }
    };
  }, [symbol, interval]);

  return { data, ticker, fng, loading, payload, isLive };
}