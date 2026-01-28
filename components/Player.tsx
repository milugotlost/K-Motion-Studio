import React, { useEffect } from 'react';
import { Button } from './Button';

interface PlayerProps {
  totalFrames: number;
  currentFrame: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (frame: number) => void;
  fps: number;
  setFps: (fps: number) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  totalFrames, 
  currentFrame, 
  isPlaying, 
  onPlayPause, 
  onSeek,
  fps,
  setFps
}) => {
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentFrame < totalFrames) {
          onSeek(currentFrame + 1);
        } else {
          onPlayPause(); // Stop at end
        }
      }, 1000 / fps);
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isPlaying, currentFrame, totalFrames, fps, onSeek, onPlayPause]);

  const progress = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4 flex flex-col gap-4">
      {/* Timeline Scrubber */}
      <div className="relative h-6 group cursor-pointer" 
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const pct = Math.max(0, Math.min(1, x / rect.width));
             onSeek(Math.round(pct * totalFrames));
           }}>
        <div className="absolute top-2 left-0 right-0 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Thumb */}
        <div 
          className="absolute top-0 w-1 h-6 bg-white rounded shadow-lg transform -translate-x-1/2 transition-all duration-100 ease-linear pointer-events-none"
          style={{ left: `${progress}%` }}
        />
        {/* Hover Time Tooltip (Basic) */}
        <div className="absolute -top-6 left-0 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Frame: {currentFrame} / {totalFrames}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           {/* Reset */}
           <Button variant="ghost" onClick={() => onSeek(0)} title="重置">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
             </svg>
           </Button>
           
           {/* Previous Frame */}
           <Button 
             variant="ghost" 
             onClick={() => onSeek(currentFrame - 1)} 
             disabled={currentFrame <= 0} 
             title="上一幀"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
             </svg>
           </Button>

           {/* Play / Pause */}
           <Button variant="primary" onClick={onPlayPause} className="w-12 h-10 flex items-center justify-center">
             {isPlaying ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
               </svg>
             )}
           </Button>
           
           {/* Next Frame */}
           <Button 
             variant="ghost" 
             onClick={() => onSeek(currentFrame + 1)} 
             disabled={currentFrame >= totalFrames} 
             title="下一幀"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
             </svg>
           </Button>

           {/* Skip to End */}
           <Button variant="ghost" onClick={() => onSeek(totalFrames)} title="最後一幀">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
             </svg>
           </Button>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono">
           <span className="text-slate-400">{currentFrame.toString().padStart(3, '0')} / {totalFrames.toString().padStart(3, '0')}</span>
           
           <div className="flex items-center gap-2 bg-slate-700/50 p-1 rounded">
              <span className="text-xs text-slate-500 pl-1">FPS</span>
              <select 
                value={fps} 
                onChange={(e) => setFps(Number(e.target.value))}
                className="bg-slate-700 text-white text-xs rounded px-2 py-1 border-none focus:ring-1 focus:ring-indigo-500 cursor-pointer outline-none"
              >
                <option value={1}>1 (慢)</option>
                <option value={3}>3</option>
                <option value={5}>5 (普通)</option>
                <option value={10}>10 (快)</option>
                <option value={20}>20</option>
                <option value={30}>30 (流暢)</option>
              </select>
           </div>
        </div>
      </div>
    </div>
  );
};