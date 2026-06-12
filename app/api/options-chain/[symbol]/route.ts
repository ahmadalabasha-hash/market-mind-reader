import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

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

interface OptionsChainResponse {
  symbol: string;
  currentPrice: number;
  expirationDates: string[];
  calls: OptionContract[];
  puts: OptionContract[];
  lastUpdated: string;
}

async function fetchOptionsChain(symbol: string): Promise<OptionsChainResponse | null> {
  try {
    const cleanedSymbol = symbol.trim().toUpperCase();
    
    // First, fetch the current stock price
    const priceUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanedSymbol)}?interval=1d&range=1d`;
    
    const priceRes = await fetch(priceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!priceRes.ok) {
      throw new Error(`Failed to fetch price: ${priceRes.status}`);
    }

    const priceData = await priceRes.json();
    const quote = priceData?.chart?.result?.[0]?.meta;
    
    if (!quote || !quote.regularMarketPrice) {
      throw new Error('No price data available');
    }

    const currentPrice = quote.regularMarketPrice;
    
    // Generate synthetic options data based on current price
    // In production, you would use a real options data API like CBOE, Interactive Brokers, etc.
    const strikes = [];
    const strikeIncrement = currentPrice * 0.05; // 5% increments
    
    // Generate strikes around current price
    for (let i = -10; i <= 10; i++) {
      const strike = Math.round((currentPrice + (i * strikeIncrement)) / 5) * 5; // Round to nearest $5
      if (strike > 0) {
        strikes.push(strike);
      }
    }
    
    // Remove duplicates and sort
    const uniqueStrikes = [...new Set(strikes)].sort((a, b) => a - b);
    
    const expirationDates = [
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks
      new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 month
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 months
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
    ];
    
    // Generate synthetic calls and puts for ALL expiration dates
    const allCalls: OptionContract[] = [];
    const allPuts: OptionContract[] = [];
    
    expirationDates.forEach(expiration => {
      const daysToExpiry = Math.floor((new Date(expiration).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      const timeDecay = Math.max(0.1, 1 - (daysToExpiry / 365)); // Time decay factor
      
      uniqueStrikes.forEach(strike => {
        const inTheMoneyCall = strike < currentPrice;
        const inTheMoneyPut = strike > currentPrice;
        
        // Calculate time value based on days to expiry
        const timeValueFactor = Math.sqrt(daysToExpiry / 365) * currentPrice * 0.2;
        
        // Call pricing
        const callIntrinsicValue = Math.max(0, currentPrice - strike);
        const callTimeValue = timeValueFactor * (1 + Math.random() * 0.2);
        const callLastPrice = callIntrinsicValue + callTimeValue;
        const callIv = 0.15 + (Math.random() * 0.35) + (inTheMoneyCall ? -0.05 : 0);
        
        allCalls.push({
          contractSymbol: `${cleanedSymbol}${expiration.replace(/-/g, '')}C${strike * 1000}`,
          strike,
          lastPrice: Math.max(0.01, callLastPrice),
          change: (Math.random() - 0.5) * 3,
          percentChange: (Math.random() - 0.5) * 15,
          volume: Math.floor(Math.random() * 15000),
          openInterest: Math.floor(Math.random() * 75000),
          bid: Math.max(0.01, callLastPrice * 0.95),
          ask: Math.max(0.01, callLastPrice * 1.05),
          impliedVolatility: Math.max(0.1, callIv),
          inTheMoney: inTheMoneyCall,
          contractType: 'CALL',
          expiration
        });
        
        // Put pricing
        const putIntrinsicValue = Math.max(0, strike - currentPrice);
        const putTimeValue = timeValueFactor * (1 + Math.random() * 0.2);
        const putLastPrice = putIntrinsicValue + putTimeValue;
        const putIv = 0.15 + (Math.random() * 0.35) + (inTheMoneyPut ? -0.05 : 0);
        
        allPuts.push({
          contractSymbol: `${cleanedSymbol}${expiration.replace(/-/g, '')}P${strike * 1000}`,
          strike,
          lastPrice: Math.max(0.01, putLastPrice),
          change: (Math.random() - 0.5) * 3,
          percentChange: (Math.random() - 0.5) * 15,
          volume: Math.floor(Math.random() * 15000),
          openInterest: Math.floor(Math.random() * 75000),
          bid: Math.max(0.01, putLastPrice * 0.95),
          ask: Math.max(0.01, putLastPrice * 1.05),
          impliedVolatility: Math.max(0.1, putIv),
          inTheMoney: inTheMoneyPut,
          contractType: 'PUT',
          expiration
        });
      });
    });

    return {
      symbol: cleanedSymbol,
      currentPrice,
      expirationDates,
      calls: allCalls,
      puts: allPuts,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to fetch options chain for ${symbol}:`, error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const optionsData = await fetchOptionsChain(symbol);
    
    if (!optionsData) {
      return NextResponse.json(
        { error: 'Failed to fetch options chain data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(optionsData);
  } catch (error) {
    console.error('Options chain error:', error);
    return NextResponse.json(
      { error: 'Failed to load options chain' },
      { status: 500 }
    );
  }
}
