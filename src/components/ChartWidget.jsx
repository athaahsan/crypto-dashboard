import React, { useEffect, useRef, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

export default function ChartWidget({ data, activeIndicators, chartType = 'candlestick' }) {
  const chartContainerRef = useRef();
  const legendRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const lastDataRef = useRef({ length: 0, firstTime: null });

  const updateChartData = useCallback((chartData) => {
    if (!chartData || chartData.length === 0 || !seriesRef.current.mainSeries) return;

    const s = seriesRef.current;
    
    // Check if this is an incremental update (same starting time, same or +1 length)
    const isIncremental = lastDataRef.current.length > 0 && 
                          lastDataRef.current.firstTime === chartData[0].time &&
                          chartData.length >= lastDataRef.current.length;

    if (isIncremental) {
      // Just update the last item(s)
      const newItems = chartData.slice(lastDataRef.current.length - 1); // get the last item (or new items if length increased)
      newItems.forEach(d => {
        if (chartType === 'line' || chartType === 'area') {
          s.mainSeries.update({ time: d.time, value: d.close });
        } else {
          s.mainSeries.update({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close });
        }

        if (s.volumeSeries) {
          s.volumeSeries.update({ time: d.time, value: d.volume, color: d.close > d.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' });
        }

        if (activeIndicators.includes('EMA')) {
          if (d.ema20 != null && !isNaN(d.ema20)) s.overlaySeries[0].update({ time: d.time, value: d.ema20 });
          if (d.ema50 != null && !isNaN(d.ema50)) s.overlaySeries[1].update({ time: d.time, value: d.ema50 });
          if (d.ema100 != null && !isNaN(d.ema100)) s.overlaySeries[2].update({ time: d.time, value: d.ema100 });
        }
        
        let maOffset = activeIndicators.includes('EMA') ? 3 : 0;
        if (activeIndicators.includes('MA')) {
          if (d.ma7 != null && !isNaN(d.ma7)) s.overlaySeries[maOffset].update({ time: d.time, value: d.ma7 });
          if (d.ma50 != null && !isNaN(d.ma50)) s.overlaySeries[maOffset + 1].update({ time: d.time, value: d.ma50 });
          if (d.ma100 != null && !isNaN(d.ma100)) s.overlaySeries[maOffset + 2].update({ time: d.time, value: d.ma100 });
        }

        if (s.rsiSeries && d.rsi14 != null && !isNaN(d.rsi14)) {
          s.rsiSeries.update({ time: d.time, value: d.rsi14 });
        }

        if (s.macdLine && s.macdSignal && s.macdHist) {
          if (d.macdLine != null && !isNaN(d.macdLine)) s.macdLine.update({ time: d.time, value: d.macdLine });
          if (d.macdSignal != null && !isNaN(d.macdSignal)) s.macdSignal.update({ time: d.time, value: d.macdSignal });
          if (d.macdHist != null && !isNaN(d.macdHist)) s.macdHist.update({ time: d.time, value: d.macdHist, color: d.macdHist > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)' });
        }
      });
    } else {
      // Full reset (setData)
      if (chartType === 'line' || chartType === 'area') {
        s.mainSeries.setData(chartData.map(d => ({ time: d.time, value: d.close })));
      } else {
        s.mainSeries.setData(chartData.map(d => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close })));
      }

      if (s.volumeSeries) {
        s.volumeSeries.setData(chartData.map(d => ({ time: d.time, value: d.volume, color: d.close > d.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' })));
      }

      if (activeIndicators.includes('EMA')) {
        s.overlaySeries[0].setData(chartData.map(d => ({ time: d.time, value: d.ema20 })).filter(d => d.value != null && !isNaN(d.value)));
        s.overlaySeries[1].setData(chartData.map(d => ({ time: d.time, value: d.ema50 })).filter(d => d.value != null && !isNaN(d.value)));
        s.overlaySeries[2].setData(chartData.map(d => ({ time: d.time, value: d.ema100 })).filter(d => d.value != null && !isNaN(d.value)));
      }
      
      let maOffset = activeIndicators.includes('EMA') ? 3 : 0;
      if (activeIndicators.includes('MA')) {
        s.overlaySeries[maOffset].setData(chartData.map(d => ({ time: d.time, value: d.ma7 })).filter(d => d.value != null && !isNaN(d.value)));
        s.overlaySeries[maOffset + 1].setData(chartData.map(d => ({ time: d.time, value: d.ma50 })).filter(d => d.value != null && !isNaN(d.value)));
        s.overlaySeries[maOffset + 2].setData(chartData.map(d => ({ time: d.time, value: d.ma100 })).filter(d => d.value != null && !isNaN(d.value)));
      }

      if (s.rsiSeries) {
        s.rsiSeries.setData(chartData.map(d => ({ time: d.time, value: d.rsi14 })).filter(d => d.value != null && !isNaN(d.value)));
      }

      if (s.macdLine && s.macdSignal && s.macdHist) {
        s.macdLine.setData(chartData.map(d => ({ time: d.time, value: d.macdLine })).filter(d => d.value != null && !isNaN(d.value)));
        s.macdSignal.setData(chartData.map(d => ({ time: d.time, value: d.macdSignal })).filter(d => d.value != null && !isNaN(d.value)));
        s.macdHist.setData(chartData.map(d => ({ time: d.time, value: d.macdHist, color: d.macdHist > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)' })).filter(d => d.value != null && !isNaN(d.value)));
      }
    }

    lastDataRef.current = { length: chartData.length, firstTime: chartData[0].time };
  }, [activeIndicators, chartType]);

  // 1. Chart Initialization - only recreate when activeIndicators or chartType change
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' }, 
        textColor: '#9CA3AF', 
      },
      grid: {
        vertLines: { color: '#1F2937' }, 
        horzLines: { color: '#1F2937' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, 
      },
      autoSize: true,
    });

    const s = {}; // store series references

    const subPanes = [];
    if (activeIndicators.includes('VOL')) subPanes.push('VOL');
    if (activeIndicators.includes('MACD')) subPanes.push('MACD');
    if (activeIndicators.includes('RSI')) subPanes.push('RSI');

    const paneHeight = 0.20; 
    const priceBottom = subPanes.length * paneHeight;

    // --- MAIN PRICE PANE ---
    if (chartType === 'line') {
      s.mainSeries = chart.addLineSeries({
        color: '#10B981',
        lineWidth: 2,
        priceScaleId: 'right',
      });
    } else if (chartType === 'area') {
      s.mainSeries = chart.addAreaSeries({
        lineColor: '#10B981',
        topColor: 'rgba(16, 185, 129, 0.4)',
        bottomColor: 'rgba(16, 185, 129, 0)',
        lineWidth: 2,
        priceScaleId: 'right',
      });
    } else if (chartType === 'bar') {
      s.mainSeries = chart.addBarSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        priceScaleId: 'right',
      });
    } else {
      s.mainSeries = chart.addCandlestickSeries({
        upColor: '#10B981', 
        downColor: '#EF4444', 
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
        priceScaleId: 'right',
      });
    }
    
    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: priceBottom + 0.02,
      },
    });

    // --- OVERLAYS ---
    s.overlaySeries = [];
    if (activeIndicators.includes('EMA')) {
      s.overlaySeries.push(chart.addLineSeries({ color: '#F59E0B', lineWidth: 2, title: 'EMA 20', priceScaleId: 'right' }));
      s.overlaySeries.push(chart.addLineSeries({ color: '#06B6D4', lineWidth: 2, title: 'EMA 50', priceScaleId: 'right' }));
      s.overlaySeries.push(chart.addLineSeries({ color: '#8B5CF6', lineWidth: 2, title: 'EMA 100', priceScaleId: 'right' }));
    }
    if (activeIndicators.includes('MA')) {
      s.overlaySeries.push(chart.addLineSeries({ color: '#FCD34D', lineWidth: 2, title: 'MA 7', priceScaleId: 'right'}));
      s.overlaySeries.push(chart.addLineSeries({ color: '#67E8F9', lineWidth: 2, title: 'MA 50', priceScaleId: 'right'}));
      s.overlaySeries.push(chart.addLineSeries({ color: '#C4B5FD', lineWidth: 2, title: 'MA 100', priceScaleId: 'right'}));
    }

    // --- SUB PANES ---
    let currentBottom = 0;
    
    if (subPanes.includes('RSI')) {
      s.rsiSeries = chart.addLineSeries({
        color: '#A78BFA',
        lineWidth: 2,
        title: 'RSI(14)',
        priceScaleId: 'rsi',
      });
      chart.priceScale('rsi').applyOptions({
        scaleMargins: { top: 1 - currentBottom - paneHeight, bottom: currentBottom },
      });
      currentBottom += paneHeight;
    }

    if (subPanes.includes('MACD')) {
      s.macdLine = chart.addLineSeries({ color: '#3B82F6', lineWidth: 2, title: 'MACD', priceScaleId: 'macd' });
      s.macdSignal = chart.addLineSeries({ color: '#F59E0B', lineWidth: 2, title: 'Signal', priceScaleId: 'macd' });
      s.macdHist = chart.addHistogramSeries({ color: '#EF4444', priceScaleId: 'macd' });
      chart.priceScale('macd').applyOptions({
        scaleMargins: { top: 1 - currentBottom - paneHeight, bottom: currentBottom },
      });
      currentBottom += paneHeight;
    }

    if (subPanes.includes('VOL')) {
      s.volumeSeries = chart.addHistogramSeries({
        color: '#374151',
        priceFormat: { type: 'volume' },
        priceScaleId: 'vol',
      });
      chart.priceScale('vol').applyOptions({
        scaleMargins: { top: 1 - currentBottom - paneHeight, bottom: currentBottom },
      });
      currentBottom += paneHeight;
    }

    chartRef.current = chart;
    seriesRef.current = s;

    chart.subscribeCrosshairMove((param) => {
      if (!legendRef.current) return;
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        legendRef.current.style.display = 'none';
      } else {
        const mainData = param.seriesData.get(s.mainSeries);
        const volData = s.volumeSeries ? param.seriesData.get(s.volumeSeries) : null;
        if (mainData) {
          const formatNum = (n) => n < 1 ? n.toFixed(4) : n.toFixed(2);
          const o = mainData.open !== undefined ? mainData.open : mainData.value;
          const h = mainData.high !== undefined ? mainData.high : mainData.value;
          const l = mainData.low !== undefined ? mainData.low : mainData.value;
          const c = mainData.close !== undefined ? mainData.close : mainData.value;
          const v = volData ? volData.value : null;

          legendRef.current.style.display = 'flex';
          legendRef.current.innerHTML = `
            <div class="flex items-center gap-3 font-mono">
              <span>O: <span class="font-medium text-base-content">${formatNum(o)}</span></span>
              <span>H: <span class="font-medium text-base-content">${formatNum(h)}</span></span>
              <span>L: <span class="font-medium text-base-content">${formatNum(l)}</span></span>
              <span>C: <span class="font-medium text-base-content">${formatNum(c)}</span></span>
              ${v !== null ? `<span>V: <span class="font-medium text-base-content">${v >= 1000 ? (v/1000).toFixed(2) + 'K' : formatNum(v)}</span></span>` : ''}
            </div>
          `;
        } else {
          legendRef.current.style.display = 'none';
        }
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = {};
      lastDataRef.current = { length: 0, firstTime: null };
    };
  }, [activeIndicators, chartType, updateChartData]);

  // 2. Data Population - only update series via setData when data changes
  useEffect(() => {
    updateChartData(data);
  }, [data, updateChartData]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={legendRef} 
        className="absolute top-2 left-4 z-20 flex text-[11px] md:text-xs text-base-content/70 bg-base-200/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-base-300 shadow-sm pointer-events-none transition-opacity duration-150"
        style={{ display: 'none' }}
      ></div>
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}