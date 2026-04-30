import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Gauge, TrendingUp, TrendingDown } from 'lucide-react';

function getDotColor(value) {
  if (value <= 24) return '#EF4444'; // Red (Extreme Fear)
  if (value <= 45) return '#F59E0B'; // Orange/Yellow (Fear)
  if (value <= 54) return '#9CA3AF'; // Gray (Neutral)
  if (value <= 74) return '#10B981'; // Green (Greed)
  return '#059669'; // Darker Green (Extreme Greed)
}

export default function FngWidget({ fngHistory, getFngTrend }) {
  const chartContainerRef = useRef();
  const [dotCoords, setDotCoords] = useState([]);

  const todayFng = fngHistory && fngHistory.length > 0 ? fngHistory[fngHistory.length - 1] : null;
  const trend = todayFng ? getFngTrend(todayFng.value) : 'neutral';

  useEffect(() => {
    if (!chartContainerRef.current || !fngHistory || fngHistory.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#1F2937' },
      },
      timeScale: {
        timeVisible: false,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addAreaSeries({
      lineColor: '#8B5CF6',
      topColor: 'rgba(139, 92, 246, 0.4)',
      bottomColor: 'rgba(139, 92, 246, 0)',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 0,
        minMove: 1,
      },
    });

    const data = fngHistory.map(d => ({
      time: d.time,
      value: d.value,
    }));
    series.setData(data);
    chart.timeScale().fitContent();

    function syncDots() {
      const coords = fngHistory.map(d => {
        const x = chart.timeScale().timeToCoordinate(d.time);
        const y = series.priceToCoordinate(d.value);
        return { x, y, color: getDotColor(d.value) };
      }).filter(d => d.x !== null && d.y !== null);
      setDotCoords(coords);
    }

    // Sync on next frame when layout is strictly finalized
    requestAnimationFrame(() => {
      syncDots();
      requestAnimationFrame(syncDots);
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(syncDots);
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }
    
    // Subscribe to chart logical range changes to sync dots when internal scaling happens
    chart.timeScale().subscribeVisibleLogicalRangeChange(syncDots);
    chart.timeScale().subscribeSizeChange(syncDots);

    return () => {
      resizeObserver.disconnect();
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(syncDots);
      chart.timeScale().unsubscribeSizeChange(syncDots);
      chart.remove();
    };
  }, [fngHistory]);

  return (
    <div className="bg-base-200 border border-base-300 rounded-2xl shadow-sm p-4 flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Gauge className="w-5 h-5" />
        </div>
        <h3 className="text-sm md:text-base font-bold text-base-content/80">Fear & Greed Index</h3>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0 mb-4 mt-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl lg:text-5xl font-black">{todayFng ? todayFng.value : '--'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm lg:text-base font-bold text-base-content/60 uppercase tracking-widest">{todayFng ? todayFng.class : '--'}</span>
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-error" />}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 relative min-h-[150px]">
        <div className="relative w-full flex-1">
          <div ref={chartContainerRef} className="absolute inset-0" />
          {/* HTML Overlay Dots */}
          <div className="absolute inset-0 pointer-events-none">
            {dotCoords.map((p, i) => {
              const isLast = i === dotCoords.length - 1;
              return (
                <div 
                  key={i}
                  className={`absolute rounded-full ${isLast ? 'animate-pulse' : ''}`}
                  style={{
                    left: p.x,
                    top: p.y,
                    width: isLast ? '6px' : '5px',
                    height: isLast ? '6px' : '5px',
                    backgroundColor: p.color,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isLast ? 10 : 1,
                    boxShadow: isLast ? `0 0 8px ${p.color}` : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
