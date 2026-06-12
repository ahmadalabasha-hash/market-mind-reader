import { NextResponse } from 'next/server';
import { generateMockOptionsFlow, detectUnusualActivity, calculateDealerPositioning, calculateOptionsSentiment } from '@/lib/options-flow';
import { fetchCandlesFromYahoo } from '@/lib/candle-fetcher';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    
    // Try to get current price for more realistic mock data
    let currentPrice = 150;
    try {
      const candles = await fetchCandlesFromYahoo(symbol, '60');
      if (candles.length > 0) {
        currentPrice = candles[candles.length - 1].close;
      }
    } catch (error) {
      console.log('Using default price for options flow');
    }
    
    // Generate mock options flow data with realistic price
    const optionsFlow = generateMockOptionsFlow(symbol, 100);
    
    // Adjust mock data based on current price
    const adjustedFlow = optionsFlow.map(flow => ({
      ...flow,
      strikePrice: currentPrice * (0.8 + Math.random() * 0.4), // Strikes around current price
      price: currentPrice * 0.05 * (0.5 + Math.random()),
      totalValue: flow.volume * currentPrice * 0.05 * (0.5 + Math.random()) * 100
    }));
    
    // Calculate analytics
    const unusualActivity = detectUnusualActivity(adjustedFlow);
    const dealerPositioning = calculateDealerPositioning(adjustedFlow);
    const sentiment = calculateOptionsSentiment(adjustedFlow);
    
    return NextResponse.json({
      symbol,
      timestamp: Date.now(),
      currentPrice,
      dataSource: 'mock_with_real_price',
      optionsFlow: adjustedFlow.slice(0, 20), // Return latest 20
      unusualActivity,
      dealerPositioning,
      sentiment
    });
  } catch (error) {
    console.error('Options flow error:', error);
    return NextResponse.json(
      { error: 'Failed to load options flow data' },
      { status: 500 }
    );
  }
}
