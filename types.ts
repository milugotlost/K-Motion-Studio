export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1mo';

export interface ChartConfig {
  symbol: string;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  bullColor: string;
  bearColor: string;
  // Axis & Data Controls
  yMin?: string | number;
  yMax?: string | number;
  startDate?: string;
  initialPrice?: string | number;
  timeframe: Timeframe; // New: Custom time interval
}