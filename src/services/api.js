// src/services/api.js

export async function fetchKlines(symbol, interval = '1d', limit = 300) {
  // Binance format symbol e.g., BTCUSDT
  const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();
  
  // Binance Kline format:
  // [
  //   [
  //     1499040000000,      // Kline open time
  //     "0.01634790",       // Open price
  //     "0.80000000",       // High price
  //     "0.01575800",       // Low price
  //     "0.01577100",       // Close price
  //     "148976.11427815",  // Volume
  //     1499644799999,      // Kline Close time
  //     "2434.19055334",    // Quote asset volume
  //     308,                // Number of trades
  //     "1756.87402397",    // Taker buy base asset volume
  //     "28.46694368",      // Taker buy quote asset volume
  //     "0"                 // Unused field, ignore.
  //   ]
  // ]
  return data.map(k => ({
    time: k[0] / 1000, // lightweight-charts expects seconds for daily
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

export async function fetchTicker(symbol) {
  const url = `https://data-api.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchFearAndGreed() {
  const url = "https://api.alternative.me/fng/?limit=1&format=json";
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.data && data.data.length > 0) {
    return {
      value: parseInt(data.data[0].value),
      class: data.data[0].value_classification
    };
  }
  return { value: 50, class: "Neutral" };
}