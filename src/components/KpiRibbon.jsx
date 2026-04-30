import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StripItem = ({ title, value, trend, trendValue, isLast, subValue }) => (
  <div className={clsx("flex items-center gap-1.5 whitespace-nowrap text-xs md:text-sm px-4", !isLast && "border-r border-base-300/50")}>
    <span className="font-semibold text-base-content/50 uppercase tracking-wider text-[10px] md:text-[11px]">{title}:</span>
    <span className="font-black">{value}</span>
    {subValue && <span className="text-[10px] md:text-xs text-base-content/40">({subValue})</span>}
    {trendValue && (
      <span className={clsx("font-bold flex items-center ml-0.5 text-[10px] md:text-xs", {
        "text-success": trend === 'up',
        "text-error": trend === 'down',
        "text-base-content/50": trend === 'neutral'
      })}>
        {trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
        {trendValue}
      </span>
    )}
  </div>
);

export default function KpiRibbon({ ticker, ath, data, formatPrice }) {
  const currentPrice = formatPrice(ticker?.lastPrice);

  const todayOpen = data ? (() => {
    const now = new Date();
    const startOfTodayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000;
    const todayCandles = data.filter(c => c.time >= startOfTodayUTC);
    if (todayCandles.length > 0) return todayCandles[0].open;
    return null;
  })() : null;

  let currentTrend = undefined;
  let currentTrendValue = '-';

  if (ticker && todayOpen) {
    const currentPriceNum = parseFloat(ticker.lastPrice);
    const percentChange = ((currentPriceNum - todayOpen) / todayOpen) * 100;
    currentTrend = percentChange >= 0 ? 'up' : 'down';
    currentTrendValue = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}% (Today)`;
  } else if (ticker) {
    const percentChange = parseFloat(ticker.priceChangePercent);
    currentTrend = percentChange >= 0 ? 'up' : 'down';
    currentTrendValue = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}% (24h)`;
  }

  const athPriceNum = ath?.price || ath; // fallback if ath is just a number
  const athPrice = athPriceNum ? formatPrice(athPriceNum) : '--';
  const athTrend = athPriceNum && ticker ? (parseFloat(ticker.lastPrice) >= athPriceNum ? 'up' : 'down') : undefined;
  const athTrendValue = athPriceNum && ticker ? `${(((parseFloat(ticker.lastPrice) - athPriceNum) / athPriceNum) * 100).toFixed(2)}%` : '';
  const athDateStr = ath?.date ? new Date(ath.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '';

  const periodHigh = formatPrice(data?.[data.length - 1]?.high);
  const periodLow = formatPrice(data?.[data.length - 1]?.low);

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex items-center w-max min-w-full py-2 px-1">
        <StripItem title="Price" value={currentPrice} trend={currentTrend} trendValue={currentTrendValue} />
        <StripItem title="High" value={periodHigh} />
        <StripItem title="Low" value={periodLow} isLast={true} />
        <StripItem title="ATH" value={athPrice} subValue={athDateStr} trend={athTrend} trendValue={athTrendValue} />
      </div>
    </div>
  );
}
