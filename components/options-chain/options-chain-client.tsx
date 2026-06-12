'use client';

import { useState, useEffect } from 'react';
import OptionsChainTable from './options-chain-table';
import OptionsChart from './options-chart';

interface OptionContract {
  contractSymbol: string;
  strike: number;
  lastPrice: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  contractType: 'CALL' | 'PUT';
  expiration: string;
}

interface OptionsChainData {
  symbol: string;
  currentPrice: number;
  expirationDates: string[];
  calls: OptionContract[];
  puts: OptionContract[];
  lastUpdated: string;
}

const POPULAR_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
  { symbol: "IWM", name: "iShares Russell 2000" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial" },
  { symbol: "GLD", name: "SPDR Gold Shares" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury" },
  { symbol: "XLF", name: "Financial Select Sector" },
  { symbol: "XLK", name: "Technology Select Sector" },
  { symbol: "XLE", name: "Energy Select Sector" },
  { symbol: "XLV", name: "Health Care Select Sector" },
];

export default function OptionsChainClient() {
  const [symbol, setSymbol] = useState('SPY');
  const [data, setData] = useState<OptionsChainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionContract | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');

  const fetchOptionsChain = async (sym: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/options-chain/${sym}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const optionsData = await response.json();
      setData(optionsData);
      setLastRefresh(new Date());
      // Set default expiration to the nearest one
      if (optionsData.expirationDates && optionsData.expirationDates.length > 0) {
        setSelectedExpiration(optionsData.expirationDates[0]);
      }
    } catch (err) {
      console.error(`Error fetching options for ${sym}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setLastRefresh(new Date());
    fetchOptionsChain(symbol);
  }, [symbol]);

  // Auto-refresh every 5 seconds for real-time updates (like thinkorswim)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (data) {
        fetchOptionsChain(symbol);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [symbol, data]);

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol.toUpperCase());
    setSelectedOption(null);
    setShowChart(false);
    setSelectedExpiration('');
  };

  const handleExpirationChange = (expiration: string) => {
    setSelectedExpiration(expiration);
    setSelectedOption(null);
  };

  const handleOptionClick = (option: OptionContract) => {
    setSelectedOption(option);
    setShowChart(true);
  };

  const isMarketHours = () => {
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) return false; // Weekend
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    // Market hours: 9:30 AM - 4:00 PM EST
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    return currentTime >= marketOpen && currentTime < marketClose;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Options Chain</h1>
              <p className="text-gray-600 text-sm mt-1">
                Live options data with historical charts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                <span className={`relative flex h-2 w-2 ${isMarketHours() ? '' : 'opacity-50'}`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isMarketHours() ? 'bg-green-400' : 'bg-gray-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isMarketHours() ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </span>
                <span className={`text-xs font-medium ${isMarketHours() ? 'text-green-600' : 'text-gray-500'}`}>
                  {isMarketHours() ? 'Market Open' : 'Market Closed'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Live • Last updated: {mounted && lastRefresh ? lastRefresh.toLocaleTimeString() : '--'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Symbol Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="symbol" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Symbol
                </label>
                <input
                  id="symbol"
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSymbolChange(symbol)}
                  placeholder="SPY, AAPL, etc..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleSymbolChange(symbol)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                >
                  Search
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Popular Symbols
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SYMBOLS.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => handleSymbolChange(s.symbol)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      symbol === s.symbol
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Price Display */}
        {data && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.symbol}</h2>
                <p className="text-xs text-gray-600">Current Price</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${data.currentPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  {data.expirationDates.length} expirations available
                </p>
              </div>
            </div>
            
            {/* Expiration Date Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Expiration
              </label>
              <div className="flex flex-wrap gap-2">
                {data.expirationDates.map((date) => {
                  const daysToExpiry = Math.floor((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                  let label = '';
                  if (daysToExpiry === 1) label = 'Tomorrow';
                  else if (daysToExpiry <= 3) label = `${daysToExpiry}d`;
                  else if (daysToExpiry <= 7) label = '1w';
                  else if (daysToExpiry <= 14) label = '2w';
                  else if (daysToExpiry <= 21) label = '3w';
                  else if (daysToExpiry <= 30) label = '1m';
                  else if (daysToExpiry <= 60) label = '2m';
                  else if (daysToExpiry <= 90) label = '3m';
                  else if (daysToExpiry <= 180) label = '6m';
                  else label = '1y';
                  
                  return (
                    <button
                      key={date}
                      onClick={() => handleExpirationChange(date)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedExpiration === date
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 mb-4 shadow-sm">
            <div className="text-center text-gray-500">Loading options data...</div>
          </div>
        )}

        {/* Options Chain Table */}
        {data && !loading && selectedExpiration && (
          <OptionsChainTable
            data={data}
            selectedExpiration={selectedExpiration}
            onOptionClick={handleOptionClick}
            selectedOption={selectedOption}
          />
        )}

        {/* Options Chart Modal */}
        {showChart && selectedOption && (
          <OptionsChart
            option={selectedOption}
            symbol={symbol}
            onClose={() => setShowChart(false)}
          />
        )}
      </main>
    </div>
  );
}
