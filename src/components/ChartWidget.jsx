import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function ChartWidget({ data, activeIndicators }) {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const seriesRef = useRef({});

  // 1. Chart Initialization - only recreate when activeIndicators change
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
    s.candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981', 
      downColor: '#EF4444', 
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
      priceScaleId: 'right',
    });
    
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
      s.overlaySeries.push(chart.addLineSeries({ color: '#FCD34D', lineWidth: 1, title: 'MA 7', priceScaleId: 'right', lineStyle: 2 }));
      s.overlaySeries.push(chart.addLineSeries({ color: '#67E8F9', lineWidth: 1, title: 'MA 50', priceScaleId: 'right', lineStyle: 2 }));
      s.overlaySeries.push(chart.addLineSeries({ color: '#C4B5FD', lineWidth: 1, title: 'MA 100', priceScaleId: 'right', lineStyle: 2 }));
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

    // Apply data immediately if already available
    updateChartData(data);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = {};
    };
  }, [activeIndicators]); // Note: data is explicitly NOT in this dependency array


  // 2. Data Population - only update series via setData when data changes
  useEffect(() => {
    updateChartData(data);
  }, [data]);

  function updateChartData(chartData) {
    if (!chartData || chartData.length === 0 || !seriesRef.current.candlestickSeries) return;

    const s = seriesRef.current;

    s.candlestickSeries.setData(chartData.map(d => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close })));

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

  return <div ref={chartContainerRef} className="w-full h-full min-h-[500px] lg:min-h-[600px]" />;
}