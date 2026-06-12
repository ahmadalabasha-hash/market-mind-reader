import { NextResponse } from 'next/server';
import { generateMockIntradayForecast, generateIntradayForecast } from '@/lib/intraday-forecasts';
import { fetchCandlesFromYahoo } from '@/lib/candle-fetcher';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const horizon = (searchParams.get('horizon') || '1h') as '1h' | '4h' | '1d';
    
    // Try to fetch real candles for more accurate forecast
    let candles: Array<{ open: number; high: number; low: number; close: number; volume: number }> = [];
    
    // Try multiple intervals to get enough data
    const intervals = ['1', '5', '15', '60'];
    for (const interval of intervals) {
      try {
        const fetchedCandles = await fetchCandlesFromYahoo(symbol, interval);
        if (fetchedCandles.length > 50) {
          candles = fetchedCandles;
          console.log(`Using ${interval}m interval for ${symbol}: ${candles.length} candles`);
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch ${interval}m candles for ${symbol}`);
      }
    }
    
    let forecast;
    if (candles.length > 50) {
      forecast = generateIntradayForecast(symbol, candles, horizon);
    } else {
      console.log(`Insufficient data for ${symbol} (${candles.length} candles), using mock`);
      forecast = generateMockIntradayForecast(symbol, horizon);
    }
    
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Intraday forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to generate intraday forecast' },
      { status: 500 }
    );
  }
}
