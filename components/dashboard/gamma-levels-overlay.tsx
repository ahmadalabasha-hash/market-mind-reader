"use client";

import { useEffect, useRef, useState } from "react";
import {
  calculateGammaLevels,
  calculateMarketContext,
  cleanSymbol,
  type GammaLevels,
  type MarketContext,
  type SheetGammaLevelRow,
} from "@/lib/gamma-levels";
import { fetchCandlesFromYahoo, type Candle } from "@/lib/candle-fetcher";
import { fetchGammaSheetLevels } from "@/lib/gamma-sheet";

interface GammaLevelsOverlayProps {
  theme?: "classic" | "caffeinated" | "midnight" | "intraday";
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
  timeframe?: string;
}

export function GammaLevelsOverlay({
  theme = "midnight",
  symbol: symbolProp,
  onSymbolChange,
  timeframe: timeframeProp = "60",
}: GammaLevelsOverlayProps) {
  const [gammaLevels, setGammaLevels] = useState<GammaLevels | null>(null);
  const [marketContext, setMarketContext] = useState<MarketContext | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [symbol, setSymbol] = useState(() =>
    symbolProp ? cleanSymbol(symbolProp) : "QQQ",
  );
  const [inputSymbol, setInputSymbol] = useState(() =>
    symbolProp ? cleanSymbol(symbolProp) : "QQQ",
  );
  const [timeframe, setTimeframe] = useState(timeframeProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [availableSymbols, setAvailableSymbols] = useState<Array<{ symbol: string; name: string }>>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!symbolProp) {
      return;
    }

    const normalized = cleanSymbol(symbolProp);
    if (normalized !== symbol) {
      setSymbol(normalized);
      setInputSymbol(normalized);
    }
  }, [symbolProp, symbol]);

  // Load available symbols from gamma sheet
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        const sheetLevels = await fetchGammaSheetLevels();
        const symbols = Object.keys(sheetLevels).map(symbol => ({
          symbol,
          name: symbol // Could enhance with names if available
        }));
        setAvailableSymbols(symbols);
      } catch (error) {
        console.error('Failed to load gamma symbols:', error);
      }
    };
    loadSymbols();
  }, []);

  useEffect(() => {
    const loadCandles = async () => {
      if (!symbol) {
        setError("Please enter a valid symbol.");
        return;
      }

      setLoading(true);
      setError(null);
      setGammaLevels(null);
      setMarketContext(null);

      try {
        const fetchedCandles = await fetchCandlesFromYahoo(symbol, timeframe);
        setCandles(fetchedCandles);

        if (fetchedCandles.length === 0) {
          throw new Error("No candle data available for this symbol.");
        }

        const latestClose = fetchedCandles[fetchedCandles.length - 1].close;
        console.log(`${symbol} latest close from candles:`, latestClose);
        console.log(`${symbol} candles count:`, fetchedCandles.length);
        console.log(`${symbol} candle range:`, {
          high: Math.max(...fetchedCandles.map((c: Candle) => c.high)),
          low: Math.min(...fetchedCandles.map((c: Candle) => c.low))
        });

        // Calculate gamma levels from live data only (no sheet overrides)
        const levels = calculateGammaLevels(
          fetchedCandles,
          latestClose,
          undefined, // No sheet override - calculate from live data
        );
        console.log(`${symbol} calculated gamma levels:`, levels);
        setGammaLevels(levels);

        const closes = fetchedCandles.map((c) => c.close);
        const volatility =
          (Math.max(...closes) - Math.min(...closes)) / latestClose;
        const context = calculateMarketContext(fetchedCandles, volatility);
        setMarketContext(context);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch candle data";
        // If timeframe change fails, fallback to 60m
        if (timeframe !== "60") {
          console.warn(`Failed to load ${timeframe}m data for ${symbol}, falling back to 60m:`, errorMessage);
          setTimeframe("60");
          return;
        }
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCandles();

    // Refresh data every minute
    const interval = setInterval(loadCandles, 60000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const handleSymbolChange = (newSymbol: string) => {
    const normalized = cleanSymbol(newSymbol);
    setInputSymbol(normalized);
    setSymbol(normalized);
    onSymbolChange?.(normalized);
    setShowDropdown(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSymbolChange(inputSymbol);
  };

  // Define color variables before they're used
  const panelBgColor =
    theme === "midnight"
      ? "bg-slate-950/95"
      : theme === "intraday"
        ? "bg-blue-50/95"
        : "bg-gray-900/95";
  const panelTextColor =
    theme === "intraday" ? "text-gray-900" : "text-zinc-100";
  const panelBorderColor =
    theme === "intraday" ? "border-blue-200" : "border-zinc-700";

  if (!gammaLevels || !marketContext) {
    return (
      <div className={`pointer-events-auto fixed bottom-4 left-4 z-10 max-w-xs space-y-2`}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`rounded-lg ${panelBgColor} px-3 py-2 text-xs font-semibold ${panelTextColor} border ${panelBorderColor} hover:opacity-80 transition`}
        >
          {showPanel ? "Hide" : "Show"} Gamma Levels
        </button>

        {showPanel && (
          <div
            ref={panelRef}
            className={`rounded-2xl ${panelBgColor} border ${panelBorderColor} p-4 space-y-3 shadow-2xl`}
          >
            <div className="border-b border-zinc-700 pb-2">
              <p className={`text-xs uppercase tracking-widest font-mono ${theme === "intraday" ? "text-gray-600" : "text-zinc-500"}`}>
                Gamma Levels
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-500/20 border border-rose-500/50 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center">
                <p className={`text-xs ${panelTextColor}`}>Loading data...</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const isBullish = gammaLevels.regime === "bullish_calls";
  const regimeColor = isBullish
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : "bg-rose-500/20 text-rose-400 border-rose-500/30";
  const pricePositionText = isBullish
    ? "ABOVE GEX FLIP → Look for CALLS (Long Bias)"
    : "BELOW GEX FLIP → Look for PUTS (Short Bias)";
  const tradeTypeText = isBullish ? "LONG POSITIONS" : "SHORT POSITIONS";

  return (
    <div className={`pointer-events-auto fixed bottom-4 left-4 z-10 max-w-xs space-y-2`}>
      {/* Toggle button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`rounded-lg ${panelBgColor} px-3 py-2 text-xs font-semibold ${panelTextColor} border ${panelBorderColor} hover:opacity-80 transition`}
      >
        {showPanel ? "Hide" : "Show"} Gamma Levels
      </button>

      {/* Main panel */}
      {showPanel && (
        <div
          ref={panelRef}
          className={`rounded-2xl ${panelBgColor} border ${panelBorderColor} p-4 space-y-3 shadow-2xl`}
        >
          {/* Symbol input section */}
          <div className="border-b border-zinc-700 pb-3">
            <p className={`text-xs uppercase tracking-widest font-mono mb-2 ${theme === "intraday" ? "text-gray-600" : "text-zinc-500"}`}>
              Select Symbol
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-2">
              {/* Timeframe selector */}
              <div className="flex gap-1">
                {['1', '5', '15', '60', '240', 'D'].map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : theme === "intraday"
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {tf === '1' ? '1m' : tf === '5' ? '5m' : tf === '15' ? '15m' : tf === '60' ? '1h' : tf === '240' ? '4h' : '1D'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={inputSymbol}
                  onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Symbol"
                  className={`w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                    theme === "intraday"
                      ? "bg-white border border-blue-300 text-gray-900"
                      : "bg-zinc-900 border border-zinc-600 text-zinc-100"
                  } focus:outline-none focus:border-blue-500`}
                />
                {showDropdown && (
                  <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg ${panelBgColor} border ${panelBorderColor} shadow-2xl z-50 max-h-48 overflow-y-auto`}>
                    {availableSymbols.length > 0 ? (
                      availableSymbols.map((opt) => (
                        <button
                          key={opt.symbol}
                          type="button"
                          onClick={() => handleSymbolChange(opt.symbol)}
                          className={`w-full text-left px-3 py-2 text-xs hover:${theme === "intraday" ? "bg-blue-100" : "bg-zinc-700"} transition ${
                            symbol === opt.symbol
                              ? theme === "intraday"
                                ? "bg-blue-200"
                                : "bg-zinc-700"
                              : ""
                          }`}
                        >
                          <span className="font-semibold">{opt.symbol}</span>
                          <span className={`text-xs ml-2 ${theme === "intraday" ? "text-gray-600" : "text-zinc-400"}`}>
                            {opt.name}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className={`px-3 py-2 text-xs ${theme === "intraday" ? "text-gray-600" : "text-zinc-400"}`}>
                        Loading symbols...
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs font-semibold text-white transition"
              >
                Load
              </button>
            </form>

            {loading && (
              <p className={`text-xs mt-2 ${theme === "intraday" ? "text-blue-600" : "text-blue-400"}`}>
                Fetching live data...
              </p>
            )}

            {error && (
              <div className="rounded-lg bg-rose-500/20 border border-rose-500/50 p-2 text-xs text-rose-400 mt-2">
                {error}
              </div>
            )}
          </div>

          {/* Current Symbol Display */}
          <div className="border-b border-zinc-700 pb-2">
            <p className={`text-lg font-bold ${panelTextColor}`}>{symbol}</p>
            <p className={`text-xs ${theme === "intraday" ? "text-gray-600" : "text-zinc-500"}`}>
              Live Data
            </p>
          </div>

          {/* Trading Signal / Regime */}
          <div
            className={`rounded-xl border-2 p-3 ${regimeColor}`}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide">
                {isBullish ? "📈 Bullish Regime" : "📉 Bearish Regime"}
              </p>
              <p className="text-xs leading-snug">{pricePositionText}</p>
              <div className="mt-2 pt-2 border-t border-current/30 flex items-center justify-between">
                <span className="text-xs font-mono">
                  Price: ${gammaLevels.currentPrice.toFixed(2)}
                </span>
                <span className="text-xs font-mono">
                  GEX: ${gammaLevels.gexFlipPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-xs font-bold mt-1 uppercase">
                Focus: {tradeTypeText}
              </div>
            </div>
          </div>

          {/* Primary levels */}
          <div className="space-y-1 text-xs">
            <p className={`text-xs uppercase tracking-widest font-mono font-semibold mb-2 ${theme === "intraday" ? "text-gray-600" : "text-zinc-500"}`}>
              Gamma Levels
            </p>
            {gammaLevels.primary.map((level, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className={panelTextColor}>{level.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className={`font-mono font-semibold ${panelTextColor}`}>
                    ${level.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Midpoints */}
          {gammaLevels.midpoints.length > 0 && (
            <div className="border-t border-zinc-700 pt-2 space-y-1 text-xs">
              {gammaLevels.midpoints.map((level, idx) => (
                <div key={idx} className="flex items-center justify-between opacity-60">
                  <span className={panelTextColor}>{level.name}</span>
                  <span className={`font-mono ${panelTextColor}`}>
                    ${level.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Market context */}
          {marketContext && (
            <div className="border-t border-zinc-700 pt-2 space-y-1 text-xs">
              <p className={`font-semibold ${panelTextColor} mb-1`}>Market Context</p>
              <div className="flex items-center justify-between">
                <span className={panelTextColor}>GEX Regime</span>
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-xs ${
                    marketContext.gexRegime === "LONG_GAMMA"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {marketContext.gexRegime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={panelTextColor}>Compression</span>
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-xs ${
                    marketContext.compression === "BREAKING"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {marketContext.compression}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={panelTextColor}>Delta Bias</span>
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-xs ${
                    marketContext.deltaBias === "NET_BULLISH"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : marketContext.deltaBias === "NET_BEARISH"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {marketContext.deltaBias}
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={`border-t ${panelBorderColor} pt-2 text-xs ${theme === "intraday" ? "text-gray-500" : "text-zinc-500"}`}>
            Updated {new Date(gammaLevels.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
