import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Controls } from './components/Controls';
import { CandleStickChart } from './components/CandleStickChart';
import { Player } from './components/Player';
import { generateNextCandle } from './utils/marketUtils';
import { CandleData, ChartConfig } from './types';

const App: React.FC = () => {
  // --- State ---
  const [data, setData] = useState<CandleData[]>([]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(5); // Default FPS
  
  const [manualVolatility, setManualVolatility] = useState<number>(1.5);
  
  const [config, setConfig] = useState<ChartConfig>({
    symbol: 'BTC/USD',
    title: '市場模擬動畫',
    xAxisLabel: '時間',
    yAxisLabel: '價格 (USD)',
    bullColor: '#22c55e', 
    bearColor: '#ef4444', 
    startDate: new Date().toISOString().split('T')[0],
    initialPrice: 100,
    timeframe: '1d', // Default
    yMin: '',
    yMax: ''
  });

  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- Handlers ---

  const handleManualAdd = useCallback((direction: 'bull' | 'bear') => {
    setData(prevData => {
      const lastCandle = prevData.length > 0 ? prevData[prevData.length - 1] : undefined;
      const newCandle = generateNextCandle(
        lastCandle, 
        direction, 
        manualVolatility, 
        config.startDate, 
        Number(config.initialPrice),
        config.timeframe
      );
      return [...prevData, newCandle];
    });
    
    if (!isRecording) {
        setCurrentFrame(prev => prev + 1);
        setIsPlaying(false);
    }
  }, [manualVolatility, config.startDate, config.initialPrice, config.timeframe, isRecording]);

  const handleClear = () => {
    setData([]);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const togglePlay = useCallback(() => {
    if (data.length === 0) return;
    if (currentFrame >= data.length && !isPlaying) {
        setCurrentFrame(0);
        setIsPlaying(true);
    } else {
        setIsPlaying(prev => !prev);
    }
  }, [data.length, currentFrame, isPlaying]);

  const handleSeek = (frame: number) => {
    setCurrentFrame(Math.min(Math.max(0, frame), data.length));
  };

  // --- Export Functions ---

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.symbol}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSnapshot = () => {
    if (chartCanvasRef.current) {
        const link = document.createElement('a');
        link.download = `${config.symbol}_snapshot.png`;
        link.href = chartCanvasRef.current.toDataURL('image/png');
        link.click();
    }
  };

  const handleExportVideo = useCallback(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || data.length === 0) return;

    // 1. Reset to start (Frame 0)
    setIsPlaying(false);
    setCurrentFrame(0);
    
    // 2. Setup MediaRecorder
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
                     ? 'video/webm; codecs=vp9' 
                     : 'video/webm';
    
    const recorder = new MediaRecorder(stream, { mimeType });
    
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.symbol}_animation.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
    };

    mediaRecorderRef.current = recorder;

    // 3. Start Recording & Playing with a longer delay
    // This delay (500ms) ensures the chart has time to repaint Frame 0 (initial state)
    // before the recorder starts capturing.
    setTimeout(() => {
        recorder.start();
        setIsRecording(true);
        setIsPlaying(true);
    }, 500);

  }, [data.length, config.symbol]);

  useEffect(() => {
    if (isRecording && currentFrame >= data.length) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsPlaying(false);
        }
    }
  }, [isRecording, currentFrame, data.length]);


  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleManualAdd('bull');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleManualAdd('bear');
      } else if (e.key === ' ') { 
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualAdd, togglePlay]);

  useEffect(() => {
    if (!isRecording) {
        if (currentFrame > data.length) {
          setCurrentFrame(data.length);
        } else if (data.length > 0 && currentFrame === data.length - 1) {
           setCurrentFrame(data.length);
        }
    }
  }, [data.length, isRecording]);


  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            K
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            K-Motion <span className="text-slate-500 font-normal">Studio</span>
          </h1>
        </div>
        {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/50 rounded-full text-red-400 text-xs animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Recording...
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Configuration Panel */}
        <aside className="w-80 p-4 bg-slate-900 border-r border-slate-800 overflow-y-auto hidden md:block">
          <Controls 
            config={config} 
            setConfig={setConfig} 
            onManualAdd={handleManualAdd}
            onClear={handleClear}
            dataLength={data.length}
            manualVolatility={manualVolatility}
            setManualVolatility={setManualVolatility}
            onExportVideo={handleExportVideo}
            onExportSnapshot={handleExportSnapshot}
            onExportJSON={handleExportJSON}
            isRecording={isRecording}
          />
        </aside>

        {/* Center: Chart Canvas */}
        <section className="flex-1 flex flex-col bg-slate-950 relative">
            {/* Chart Area */}
            <div className="flex-1 p-6 relative">
              <div className="absolute inset-0 m-6 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                  {/* The Chart */}
                  <div className="flex-1 w-full min-h-0 bg-[#0f172a]">
                    <CandleStickChart 
                      data={data} 
                      config={config} 
                      visibleCount={currentFrame} 
                      canvasRef={chartCanvasRef}
                    />
                  </div>
              </div>
            </div>

            {/* Bottom: Player Controls */}
            <Player 
              totalFrames={data.length}
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              onPlayPause={togglePlay}
              onSeek={handleSeek}
              fps={fps}
              setFps={setFps}
            />
        </section>
      </main>
      
      {/* Mobile Notice */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-indigo-600 text-white p-2 text-center text-xs">
        為了獲得最佳體驗，請使用桌面版瀏覽器。
      </div>
    </div>
  );
};

export default App;