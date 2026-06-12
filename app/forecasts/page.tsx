'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StockForecastCard from "@/components/forecasts/StockForecastCard";
import SectorRotationCard from "@/components/forecasts/SectorRotationCard";

type ModelType = 'timesfm' | 'simple-ensemble' | 'transformer';

export default function ForecastsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('timesfm');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          router.push('/auth');
          return;
        }
        
        const session = await response.json();
        
        // Check if user has Ultimate access
        if (!session.user || (session.user.subscriptionTier !== 'ultimate' && !session.user.isSuperAdmin)) {
          router.push('/pricing');
          return;
        }
        
        setAuthorized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth failed');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
    
    // Update the page refresh timestamp every 30 seconds
    const intervalId = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const stocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
  ];

  const indices = [
    { symbol: "SPY", name: "S&P 500 ETF" },
    { symbol: "QQQ", name: "NASDAQ 100 ETF" },
    { symbol: "IWM", name: "Russell 2000 ETF" },
    { symbol: "DIA", name: "Dow Jones ETF" },
  ];

  const modelDescriptions: Record<ModelType, string> = {
    timesfm: "Google's Time Series Foundation Model - Fast, pre-trained baseline",
    'simple-ensemble': "Random Forest + Gradient Boosting - No external dependencies",
    transformer: "Combined TFT + Autoformer + TimesFM - Maximum robustness"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Market Forecasts</h1>
              <p className="text-gray-600 mt-2">
                Advanced ML predictions for stocks, indices, and sectors
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-600">Live Data</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Auto-refreshing every 30 seconds • Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Model Selector */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Forecasting Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.keys(modelDescriptions).map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model as ModelType)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedModel === model
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900 capitalize mb-1">
                  {model === 'timesfm' ? 'TimesFM' : model}
                </div>
                <div className="text-xs text-gray-600">
                  {modelDescriptions[model as ModelType]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Stock Price Forecasts ({selectedModel === 'timesfm' ? 'TimesFM' : selectedModel})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockForecastCard 
                key={stock.symbol} 
                symbol={stock.symbol} 
                name={stock.name} 
                modelType={selectedModel}
              />
            ))}
          </div>
        </section>

        {selectedModel !== 'transformer' && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Market Index Forecasts ({selectedModel === 'timesfm' ? 'TimesFM' : selectedModel})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {indices.map((index) => (
                <StockForecastCard 
                  key={index.symbol} 
                  symbol={index.symbol} 
                  name={index.name} 
                  modelType={selectedModel}
                />
              ))}
            </div>
          </section>
        )}

        {selectedModel === 'timesfm' && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Sector Rotation Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectorRotationCard />
            </div>
          </section>
        )}

        <div className="mt-8 text-center">
          <a href="/ultimate" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
