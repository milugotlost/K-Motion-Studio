import React from 'react';
import { ChartConfig, Timeframe } from '../types';
import { Button } from './Button';

interface ControlsProps {
  config: ChartConfig;
  setConfig: (config: ChartConfig) => void;
  onManualAdd: (direction: 'bull' | 'bear') => void;
  onClear: () => void;
  dataLength: number;
  manualVolatility: number;
  setManualVolatility: (val: number) => void;
  onExportVideo: () => void;
  onExportSnapshot: () => void;
  onExportJSON: () => void;
  isRecording: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  config, 
  setConfig, 
  onManualAdd,
  onClear,
  dataLength,
  manualVolatility,
  setManualVolatility,
  onExportVideo,
  onExportSnapshot,
  onExportJSON,
  isRecording
}) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6 h-full overflow-y-auto flex flex-col">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          參數設定
        </h2>
        
        {/* Chart Appearance */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">圖表外觀</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">商品代碼 (Symbol)</label>
              <input 
                type="text" name="symbol" value={config.symbol} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">圖表標題</label>
              <input 
                type="text" name="title" value={config.title} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">漲 (陽線) 顏色</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" name="bullColor" value={config.bullColor} onChange={handleChange}
                  className="h-8 w-8 bg-transparent border-none cursor-pointer"
                />
                <span className="text-xs text-slate-500">{config.bullColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">跌 (陰線) 顏色</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" name="bearColor" value={config.bearColor} onChange={handleChange}
                  className="h-8 w-8 bg-transparent border-none cursor-pointer"
                />
                <span className="text-xs text-slate-500">{config.bearColor}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs text-slate-400 mb-1">X 軸標籤</label>
              <input 
                type="text" name="xAxisLabel" value={config.xAxisLabel} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Y 軸標籤</label>
              <input 
                type="text" name="yAxisLabel" value={config.yAxisLabel} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-700 my-6" />
        
        {/* Axis & Data Settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">數據與時間</h3>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-slate-400 mb-1">時間週期 (Timeframe)</label>
                <select 
                  name="timeframe" 
                  value={config.timeframe} 
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  disabled={dataLength > 0}
                >
                  <option value="1m">1 分鐘</option>
                  <option value="5m">5 分鐘</option>
                  <option value="15m">15 分鐘</option>
                  <option value="30m">30 分鐘</option>
                  <option value="1h">1 小時</option>
                  <option value="4h">4 小時</option>
                  <option value="1d">日 (1D)</option>
                  <option value="1w">週 (1W)</option>
                  <option value="1mo">月 (1M)</option>
                </select>
             </div>
             <div>
                <label className="block text-xs text-slate-400 mb-1">初始價格</label>
                <input 
                  type="number" name="initialPrice" value={config.initialPrice} onChange={handleChange} placeholder="100"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  disabled={dataLength > 0}
                />
             </div>
          </div>

          <div className="mb-2">
              <label className="block text-xs text-slate-400 mb-1">起始日期/時間</label>
              <input 
                type={['1d', '1w', '1mo'].includes(config.timeframe) ? "date" : "datetime-local"}
                name="startDate" 
                value={config.startDate} 
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                disabled={dataLength > 0} 
              />
          </div>
          {(dataLength > 0) && <span className="text-[10px] text-slate-500 -mt-2 block">清除數據後可修改起始設定</span>}

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Y 軸最小值 (Auto)</label>
              <input 
                type="number" name="yMin" value={config.yMin} onChange={handleChange} placeholder="自動"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Y 軸最大值 (Auto)</label>
              <input 
                type="number" name="yMax" value={config.yMax} onChange={handleChange} placeholder="自動"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-700 my-6" />

        {/* Manual Controls */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">手動創作</h3>
             <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">
               {dataLength} 根 K 棒
             </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs text-slate-400">漲跌幅度</label>
              <span className={`text-xs font-mono ${manualVolatility > 20 ? 'text-red-400 font-bold' : 'text-indigo-400'}`}>
                {manualVolatility}%
              </span>
            </div>
            <input 
              type="range" min="0.1" max="50" step="0.5" 
              value={manualVolatility} onChange={(e) => setManualVolatility(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => onManualAdd('bull')}>+ 漲</Button>
             <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={() => onManualAdd('bear')}>- 跌</Button>
          </div>
          
          <Button variant="secondary" className="w-full mt-2" onClick={onClear} disabled={dataLength === 0}>
             清除數據
          </Button>
        </div>

        <hr className="border-slate-700 my-6" />

        {/* Export Section */}
        <div className="space-y-4">
           <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">匯出與保存</h3>
           <Button 
             variant="primary" 
             className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}
             onClick={onExportVideo}
             disabled={dataLength === 0}
           >
             {isRecording ? '● 正在錄製動畫...' : '🎥 匯出動畫影片 (WebM)'}
           </Button>
           <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={onExportSnapshot} disabled={dataLength === 0}>
                📷 截圖 (PNG)
              </Button>
              <Button variant="secondary" onClick={onExportJSON} disabled={dataLength === 0}>
                💾 數據 (JSON)
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};