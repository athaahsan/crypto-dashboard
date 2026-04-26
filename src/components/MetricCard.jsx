import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, subValue, trend, trendValue, icon: Icon }) {
  return (
    <div className="stat bg-base-200 border border-base-300 rounded-2xl shadow-sm relative overflow-hidden">
      {Icon && (
        <div className="stat-figure text-primary">
          <Icon className="w-8 h-8 opacity-80" />
        </div>
      )}
      <div className="stat-title text-base-content/70 font-medium">{title}</div>
      <div className="stat-value flex items-baseline gap-2 text-2xl lg:text-3xl">
        {value}
        {subValue && <span className="text-sm font-normal text-base-content/50">{subValue}</span>}
      </div>

      {trend !== undefined && (
        <div className={clsx("stat-desc flex items-center gap-1 mt-1 font-medium text-sm", {
          "text-success": trend === 'up',
          "text-error": trend === 'down',
          "text-base-content/60": trend === 'neutral'
        })}>
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}