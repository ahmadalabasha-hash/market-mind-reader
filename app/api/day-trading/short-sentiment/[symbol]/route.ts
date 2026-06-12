import { NextResponse } from 'next/server';
import { generateMockShortInterest, generateMockSentimentIndicator, detectShortSqueeze, calculateOverallSentiment } from '@/lib/short-sentiment';
import { fetchCandlesFromYahoo } from '@/lib/candle-fetcher';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    
    // Try to get real price data
    let currentPrice = 150;
    let priceChange24h = 0;
    let volume24h = 5000000;
    
    try {
      const candles = await fetchCandlesFromYahoo(symbol, '60');
      if (candles.length >= 2) {
        currentPrice = candles[candles.length - 1].close;
        priceChange24h = ((currentPrice - candles[candles.length - 2].close) / candles[candles.length - 2].close) * 100;
        volume24h = candles[candles.length - 1].volume;
      }
    } catch (error) {
      console.log('Using default price for short sentiment');
    }
    
    // Generate mock data with realistic price
    const shortInterest = generateMockShortInterest(symbol);
    const sentimentIndicator = generateMockSentimentIndicator(symbol);
    
    // Detect short squeeze with real price data
    const priceData = {
      currentPrice,
      priceChange24h,
      volume24h,
      avgVolume: volume24h * (0.8 + Math.random() * 0.4)
    };
    const shortSqueezeAlert = detectShortSqueeze(shortInterest, priceData);
    
    // Calculate overall sentiment
    const overallSentiment = calculateOverallSentiment(sentimentIndicator);
    
    return NextResponse.json({
      symbol,
      timestamp: Date.now(),
      currentPrice,
      dataSource: 'mock_with_real_price',
      shortInterest,
      sentimentIndicator,
      shortSqueezeAlert,
      overallSentiment
    });
  } catch (error) {
    console.error('Short sentiment error:', error);
    return NextResponse.json(
      { error: 'Failed to load short sentiment data' },
      { status: 500 }
    );
  }
}
