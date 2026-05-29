import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME, getUserTier, hasUltimateAccess } from "@/lib/auth-types";
import StockForecastCard from "@/components/forecasts/StockForecastCard";

export default async function ForecastsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  const userTier = getUserTier(session);
  const isSuperAdmin = session?.isSuperAdmin || false;

  // Access control: Only Ultimate users can access forecasts
  if (!hasUltimateAccess(userTier, isSuperAdmin)) {
    redirect("/pricing");
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
        {/* Stock Forecasts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Stock Price Forecasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockForecastCard key={stock.symbol} symbol={stock.symbol} name={stock.name} />
            ))}
          </div>
        </section>

        {/* Index Forecasts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Market Index Forecasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {indices.map((index) => (
              <StockForecastCard key={index.symbol} symbol={index.symbol} name={index.name} />
            ))}
          </div>
        </section>

        {/* Sector Rotation */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Sector Rotation Analysis</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-gray-600">
              Sector rotation forecasts help identify which sectors are expected to outperform in the coming weeks.
            </p>
            <div className="mt-4">
              <a
                href="/api/forecasts/sectors"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                View Sector Data
              </a>
            </div>
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
