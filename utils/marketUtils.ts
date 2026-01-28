import { CandleData, Timeframe } from '../types';

const formatDate = (date: Date, timeframe: Timeframe): string => {
  // Format based on granularity
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  if (['1d', '1w', '1mo'].includes(timeframe)) {
    return `${yyyy}-${mm}-${dd}`;
  }
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const addTimeInterval = (date: Date, timeframe: Timeframe) => {
  switch (timeframe) {
    case '1m': date.setMinutes(date.getMinutes() + 1); break;
    case '5m': date.setMinutes(date.getMinutes() + 5); break;
    case '15m': date.setMinutes(date.getMinutes() + 15); break;
    case '30m': date.setMinutes(date.getMinutes() + 30); break;
    case '1h': date.setHours(date.getHours() + 1); break;
    case '4h': date.setHours(date.getHours() + 4); break;
    case '1d': date.setDate(date.getDate() + 1); break;
    case '1w': date.setDate(date.getDate() + 7); break;
    case '1mo': date.setMonth(date.getMonth() + 1); break;
    default: date.setDate(date.getDate() + 1);
  }
};

export const generateNextCandle = (
  lastCandle: CandleData | undefined,
  direction: 'bull' | 'bear',
  volatilityPercentage: number = 1.5,
  startDateConfig?: string,
  initialPriceConfig?: number,
  timeframe: Timeframe = '1d'
): CandleData => {
  // Use last close, or initial config, or default to 100
  const prevClose = lastCandle ? lastCandle.close : (initialPriceConfig ?? 100);
  
  // Calculate date
  let nextDate: Date;
  if (lastCandle) {
    // If last candle exists, parse its time strictly usually we assume ISO or compatible
    // For simplicity in this mock, we re-parse the string. 
    // Note: Safari can be picky about date parsing, usually YYYY-MM-DD THH:mm is safe.
    // If the format is YYYY-MM-DD, add T00:00 for parsing if needed, but new Date() usually handles it.
    nextDate = new Date(lastCandle.time.includes(':') ? lastCandle.time.replace(' ', 'T') : lastCandle.time);
    addTimeInterval(nextDate, timeframe);
  } else {
    // Start Date
    nextDate = startDateConfig ? new Date(startDateConfig) : new Date();
    // Reset time components if we are just starting and using date picker (which returns YYYY-MM-DD)
    if (startDateConfig && !startDateConfig.includes(':')) {
        nextDate.setHours(9, 0, 0, 0); // Default open market time
    }
  }

  const time = formatDate(nextDate, timeframe);

  const open = prevClose;
  
  // Random factor between 0.5 and 1.2
  const randomScale = 0.5 + (Math.random() * 0.7); 
  const movePercent = (volatilityPercentage / 100) * randomScale;
  const moveAmount = open * movePercent;

  let close, high, low;
  const wickScale = 0.3; 

  if (direction === 'bull') {
    close = open + moveAmount;
    high = close + (Math.random() * moveAmount * wickScale);
    low = Math.max(0.01, open - (Math.random() * moveAmount * wickScale));
  } else {
    close = Math.max(0.01, open - moveAmount);
    high = open + (Math.random() * moveAmount * wickScale);
    low = Math.max(0.01, close - (Math.random() * moveAmount * wickScale));
  }

  // Sanity check
  high = Math.max(high, open, close);
  low = Math.min(low, open, close);

  return {
    time,
    open,
    high,
    low,
    close,
    volume: Math.floor(Math.random() * 10000) + 1000
  };
};