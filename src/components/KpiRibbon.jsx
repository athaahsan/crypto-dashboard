import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StripItem = ({ title, value, trend, trendValue, isLast }) => (
  <div className={clsx("flex items-center gap-1.5 whitespace-nowrap text-xs md:text-sm px-3", !isLast && "border-r border-base-300/50")}>
    <span className="font-semibold text-base-content/50 uppercase tracking-wider text-[10px] md:text-[11px]">{title}:</span>
    <span className="font-black">{value}</span>
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
  const currentTrend = ticker ? (parseFloat(ticker.priceChangePercent) >= 0 ? 'up' : 'down') : undefined;
  const currentTrendValue = ticker ? `${parseFloat(ticker.priceChangePercent).toFixed(2)}% (24h)` : '-';

  const athPrice = ath ? formatPrice(ath) : '--';
  const athTrend = ath && ticker ? (parseFloat(ticker.lastPrice) >= ath ? 'up' : 'down') : undefined;
  const athTrendValue = ath && ticker ? `${(((parseFloat(ticker.lastPrice) - ath) / ath) * 100).toFixed(2)}%` : '';

  const periodHigh = formatPrice(data?.[data.length - 1]?.high);
  const periodLow = formatPrice(data?.[data.length - 1]?.low);
  
  return (
    <div className="bg-base-200/50 border border-base-300 rounded-lg shadow-sm backdrop-blur-sm overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex items-center w-max min-w-full py-1.5 px-1">
        <StripItem title="Price" value={currentPrice} trend={currentTrend} trendValue={currentTrendValue} />
        <StripItem title="ATH" value={athPrice} trend={athTrend} trendValue={athTrendValue} />
        <StripItem title="Period High" value={periodHigh} />
        <StripItem title="Period Low" value={periodLow} isLast={true} />
      </div>
    </div>
  );
}
