import React, { useRef, useState, useEffect, useMemo } from 'react';
import { CandleData, ChartConfig } from '../types';

interface CandleStickChartProps {
  data: CandleData[];
  config: ChartConfig;
  visibleCount: number;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const CandleStickChart: React.FC<CandleStickChartProps> = ({ data, config, visibleCount, canvasRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoverData, setHoverData] = useState<CandleData | null>(null);
  
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartCanvasRef = canvasRef || internalCanvasRef;

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const activeData = useMemo(() => {
    const count = Math.max(0, visibleCount);
    return data.slice(0, count);
  }, [data, visibleCount]);

  // Current Info for Header (Last visible candle)
  const currentInfo = useMemo(() => {
    if (activeData.length === 0) return null;
    const last = activeData[activeData.length - 1];
    const change = last.close - last.open;
    const changePct = (change / last.open) * 100;
    return {
        price: last.close,
        change,
        changePct,
        isUp: last.close >= last.open
    };
  }, [activeData]);

  // Calculate Scale (Min/Max)
  const { minPrice, maxPrice } = useMemo(() => {
    let autoMin = Infinity;
    let autoMax = -Infinity;
    
    // Always consider the Initial Price as an anchor to prevent massive zoom jumps on the first few candles
    // If user provided an initial price, use it as a baseline anchor
    if (config.initialPrice) {
        const initial = Number(config.initialPrice);
        autoMin = initial;
        autoMax = initial;
    } else {
        // Fallback baseline if no initial price and no data
        autoMin = 100; 
        autoMax = 100;
    }

    if (activeData.length > 0) {
      for (const d of activeData) {
        if (d.low < autoMin) autoMin = d.low;
        if (d.high > autoMax) autoMax = d.high;
      }
    } else if (config.initialPrice) {
         // If no data but initial price exists, create a default window around it
         const initial = Number(config.initialPrice);
         autoMin = initial * 0.95;
         autoMax = initial * 1.05;
    }
    
    // Avoid flat line issues (if min == max)
    if (Math.abs(autoMax - autoMin) < 0.0001) {
        autoMin = autoMin * 0.95;
        autoMax = autoMax * 1.05;
    }
    
    // Add default padding for auto range (10% top/bottom)
    const range = autoMax - autoMin;
    const padding = range * 0.10;
    autoMin = autoMin - padding;
    autoMax = autoMax + padding;

    // 2. Override with Config if present
    let finalMin = autoMin;
    let finalMax = autoMax;

    if (config.yMin !== undefined && config.yMin !== '') {
        const parsed = Number(config.yMin);
        if (!isNaN(parsed)) finalMin = parsed;
    }

    if (config.yMax !== undefined && config.yMax !== '') {
        const parsed = Number(config.yMax);
        if (!isNaN(parsed)) finalMax = parsed;
    }

    if (finalMin >= finalMax) finalMax = finalMin + 1;

    return { minPrice: finalMin, maxPrice: finalMax };
  }, [activeData, config.yMin, config.yMax, config.initialPrice]);

  // Draw Function
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    // Clear & Fill Background
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Layout
    // Increased Top padding to 100 to separate Title from Chart/Axis
    // Increased Bottom padding to 50 to separate X-Axis Label from Date Ticks
    const padding = { top: 100, right: 60, bottom: 50, left: 10 };
    const chartW = dimensions.width - padding.left - padding.right;
    const chartH = dimensions.height - padding.top - padding.bottom;

    // --- DRAW HEADER (Symbol, Title, Price) inside Canvas ---
    
    // 1. Symbol (Top Left)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText(config.symbol, 20, 40);

    // 2. Title (Below Symbol)
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(config.title, 20, 65); // Moved down slightly to y=65

    // 3. Current Price & Pct (Top Right)
    if (currentInfo) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.fillText(currentInfo.price.toFixed(2), dimensions.width - 20, 40);

        const color = currentInfo.isUp ? '#22c55e' : '#ef4444';
        ctx.fillStyle = color;
        ctx.font = '14px "JetBrains Mono", monospace';
        const sign = currentInfo.change >= 0 ? '+' : '';
        const pctText = `${sign}${currentInfo.changePct.toFixed(2)}%`;
        ctx.fillText(pctText, dimensions.width - 20, 65);
    }
    // -----------------------------------------------------

    // Helper: Map Y
    const getY = (price: number) => {
      const range = maxPrice - minPrice;
      if (range === 0) return padding.top + chartH / 2;
      const pct = (price - minPrice) / range;
      return padding.top + chartH - (pct * chartH);
    };

    // Draw Grid & Y Grid Labels (Right side)
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
      const price = minPrice + (maxPrice - minPrice) * t;
      const y = getY(price);
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(dimensions.width - padding.right, y);
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#64748b'; // slate-500
      ctx.fillText(price.toFixed(2), dimensions.width - padding.right + 8, y);
    });

    ctx.setLineDash([]);

    // Axis Titles (Labels)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px "Inter", sans-serif';
    
    // Y-Axis Label
    ctx.textAlign = 'left';
    ctx.fillText(config.yAxisLabel, padding.left, padding.top - 15);
    
    // X-Axis Label: Moved to bottom edge to avoid overlap with date ticks
    ctx.textAlign = 'right';
    ctx.fillText(config.xAxisLabel, dimensions.width - padding.right, dimensions.height - 10);

    if (activeData.length === 0) {
       // Optional: Draw a line at Initial Price even if empty
       if (config.initialPrice) {
           const initY = getY(Number(config.initialPrice));
           ctx.beginPath();
           ctx.moveTo(padding.left, initY);
           ctx.lineTo(dimensions.width - padding.right, initY);
           ctx.strokeStyle = '#64748b';
           ctx.setLineDash([2, 2]);
           ctx.stroke();
           ctx.setLineDash([]);
       }
        
       ctx.textAlign = 'center';
       ctx.fillStyle = '#475569';
       ctx.font = '14px "Inter", sans-serif';
       ctx.fillText("等待數據...", dimensions.width / 2, padding.top + chartH / 2);
       return;
    }

    // Draw Candles
    const candleWidth = chartW / activeData.length;
    const barWidth = Math.max(1, Math.min(candleWidth * 0.7, 50));
    const gap = (candleWidth - barWidth) / 2;

    // Draw Date Labels (Start, Mid, End)
    // Date Labels Y-position: Moved up (height - 30) to leave space for X-Axis Title below
    const dateY = dimensions.height - 30;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(activeData[0].time, padding.left, dateY);
    
    if (activeData.length > 5) {
       ctx.textAlign = 'center';
       ctx.fillText(activeData[Math.floor(activeData.length/2)].time, padding.left + chartW/2, dateY);
    }
    if (activeData.length > 1) {
       ctx.textAlign = 'right';
       ctx.fillText(activeData[activeData.length-1].time, dimensions.width - padding.right, dateY);
    }

    // Loop Draw Candles
    activeData.forEach((d, i) => {
      const x = padding.left + i * candleWidth + gap;
      const centerX = x + barWidth / 2;
      
      const yOpen = getY(d.open);
      const yClose = getY(d.close);
      const yHigh = getY(d.high);
      const yLow = getY(d.low);
      
      const isBull = d.close >= d.open;
      const color = isBull ? config.bullColor : config.bearColor;

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, barWidth * 0.15);

      ctx.beginPath();
      ctx.moveTo(centerX, yHigh);
      ctx.lineTo(centerX, yLow);
      ctx.stroke();

      const bodyY = Math.min(yOpen, yClose);
      const bodyH = Math.max(Math.abs(yOpen - yClose), 1);
      ctx.fillRect(x, bodyY, barWidth, bodyH);
    });

  }, [activeData, dimensions, config, minPrice, maxPrice, currentInfo]);

  // Handle Mouse Interaction for Tooltip (unchanged)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dimensions.width) return;
    
    // Match padding
    const padding = { top: 100, right: 60, bottom: 50, left: 10 };
    const chartW = dimensions.width - padding.left - padding.right;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;

    if (x < 0 || x > chartW) {
        setHoverData(null);
        return;
    }

    const candleWidth = chartW / activeData.length;
    const index = Math.floor(x / candleWidth);

    if (index >= 0 && index < activeData.length) {
        setHoverData(activeData[index]);
    } else {
        setHoverData(null);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverData(null)}
    >
      <canvas 
        ref={chartCanvasRef}
        className="block cursor-crosshair"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* HTML Tooltip Overlay */}
      {hoverData && (
        <div 
          className="absolute top-24 left-4 bg-slate-800/95 backdrop-blur border border-slate-600 p-3 rounded shadow-xl pointer-events-none z-20 min-w-[140px]"
        >
          <div className="text-xs text-slate-400 font-mono mb-2 pb-1 border-b border-slate-700">{hoverData.time}</div>
          <div className="space-y-1 text-xs font-mono">
             <div className="flex justify-between gap-4"><span className="text-slate-500">Open</span> <span className="text-white">{hoverData.open.toFixed(2)}</span></div>
             <div className="flex justify-between gap-4"><span className="text-slate-500">High</span> <span className="text-white">{hoverData.high.toFixed(2)}</span></div>
             <div className="flex justify-between gap-4"><span className="text-slate-500">Low</span> <span className="text-white">{hoverData.low.toFixed(2)}</span></div>
             <div className="flex justify-between gap-4">
               <span className="text-slate-500">Close</span> 
               <span className={`${hoverData.close >= hoverData.open ? 'text-green-400' : 'text-red-400'}`}>
                 {hoverData.close.toFixed(2)}
               </span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};