/**
 * Exact replica of the Pandas-based indicators from Streamlit app
 */

export function r4(x) {
  return parseFloat(Number(x).toFixed(4));
}

// EMA equivalent to series.ewm(span=period, adjust=False).mean()
export function calculateEMA(series, period) {
  if (series.length === 0) return [];
  const k = 2 / (period + 1);
  const ema = [series[0]];
  for (let i = 1; i < series.length; i++) {
    ema.push(series[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

// Simple Moving Average
export function calculateMA(series, period) {
  const ma = new Array(series.length).fill(null);
  for (let i = period - 1; i < series.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += series[i - j];
    }
    ma[i] = sum / period;
  }
  // To match length exactly and provide some value early on, often MA is padded or just null
  return ma;
}

// RSI using Wilder's Smoothing / EMA (adjust=False)
export function calculateRSI(series, period = 14) {
  if (series.length < period + 1) return new Array(series.length).fill(null);
  
  const rsi = new Array(series.length).fill(null);
  let avgGain = 0;
  let avgLoss = 0;
  
  // Calculate initial averages
  for (let i = 1; i <= period; i++) {
    const diff = series[i] - series[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;
  
  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    rsi[period] = 100 - (100 / (1 + avgGain / avgLoss));
  }
  
  // The python code uses ewm(alpha=1/period, adjust=False).mean() on gain and loss
  const alpha = 1 / period;
  for (let i = period + 1; i < series.length; i++) {
    const diff = series[i] - series[i - 1];
    let gain = 0;
    let loss = 0;
    
    if (diff > 0) gain = diff;
    else loss = Math.abs(diff);
    
    avgGain = (gain * alpha) + (avgGain * (1 - alpha));
    avgLoss = (loss * alpha) + (avgLoss * (1 - alpha));
    
    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }
  return rsi;
}

// MACD
export function calculateMACD(series, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(series, fast);
  const emaSlow = calculateEMA(series, slow);
  
  const macdLine = [];
  for (let i = 0; i < series.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signal);
  const macdHistogram = [];
  
  for (let i = 0; i < series.length; i++) {
    macdHistogram.push(macdLine[i] - signalLine[i]);
  }
  
  return { macdLine, signalLine, macdHistogram };
}

// ADX
export function calculateADX(high, low, close, period = 14) {
  const upMove = new Array(high.length).fill(0);
  const downMove = new Array(high.length).fill(0);
  const plusDm = new Array(high.length).fill(0);
  const minusDm = new Array(high.length).fill(0);
  const tr = new Array(high.length).fill(0);
  
  // Need to use ewma with alpha=1/period, adjust=False
  for (let i = 1; i < high.length; i++) {
    upMove[i] = high[i] - high[i-1];
    downMove[i] = low[i-1] - low[i];
    
    if (upMove[i] > downMove[i] && upMove[i] > 0) plusDm[i] = upMove[i];
    if (downMove[i] > upMove[i] && downMove[i] > 0) minusDm[i] = downMove[i];
    
    const tr1 = high[i] - low[i];
    const tr2 = Math.abs(high[i] - close[i-1]);
    const tr3 = Math.abs(low[i] - close[i-1]);
    tr[i] = Math.max(tr1, tr2, tr3);
  }
  
  const alpha = 1 / period;
  
  // Calculate EWMA for TR, PlusDM, MinusDM
  const calcEWMA = (series) => {
    const res = [series[0]];
    for (let i = 1; i < series.length; i++) {
      res.push(series[i] * alpha + res[i-1] * (1 - alpha));
    }
    return res;
  };
  
  const atr = calcEWMA(tr);
  const smoothedPlusDm = calcEWMA(plusDm);
  const smoothedMinusDm = calcEWMA(minusDm);
  
  const plusDi = new Array(high.length).fill(0);
  const minusDi = new Array(high.length).fill(0);
  const dx = new Array(high.length).fill(0);
  
  for (let i = 0; i < high.length; i++) {
    if (atr[i] === 0) {
      plusDi[i] = 0;
      minusDi[i] = 0;
    } else {
      plusDi[i] = 100 * (smoothedPlusDm[i] / atr[i]);
      minusDi[i] = 100 * (smoothedMinusDm[i] / atr[i]);
    }
    const sumDi = plusDi[i] + minusDi[i];
    if (sumDi === 0) {
      dx[i] = 0;
    } else {
      dx[i] = (Math.abs(plusDi[i] - minusDi[i]) / sumDi) * 100;
    }
  }
  
  const adx = calcEWMA(dx);
  
  return { adx, plusDi, minusDi };
}