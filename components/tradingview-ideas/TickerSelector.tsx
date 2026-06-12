"use client";

interface TickerSelectorProps {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}

const TICKERS = ['SPX', 'SPY', 'QQQ'];

export function TickerSelector({ selectedTicker, onTickerChange }: TickerSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {TICKERS.map((ticker) => (
        <button
          key={ticker}
          onClick={() => onTickerChange(ticker)}
          className={`
            px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${
              selectedTicker === ticker
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-700/50 hover:text-zinc-300'
            }
          `}
        >
          {ticker}
        </button>
      ))}
    </div>
  );
}
