'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StockForecastCard from "@/components/forecasts/StockForecastCard";
import SectorRotationCard from "@/components/forecasts/SectorRotationCard";

export default function ForecastsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Market Forecasts</h1>
          <p className="text-gray-600 mt-2">
            TimesFM-powered predictions for stocks, indices, and sectors
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Stock Price Forecasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockForecastCard key={stock.symbol} symbol={stock.symbol} name={stock.name} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Market Index Forecasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {indices.map((index) => (
              <StockForecastCard key={index.symbol} symbol={index.symbol} name={index.name} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Sector Rotation Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectorRotationCard />
          </div>
        </section>

        <div className="mt-8 text-center">
          <a href="/ultimate" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
