import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    const cleanedSymbol = symbol.trim().toUpperCase();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanedSymbol)}?interval=1m&range=1d`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Yahoo Finance error ${res.status}`);
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta || !meta.regularMarketPrice) {
      throw new Error('No price data available');
    }

    return meta.regularMarketPrice;
  } catch (error) {
    console.error(`Failed to fetch live price for ${symbol}:`, error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const filePath = path.join(process.cwd(), 'timesfm', 'forecasts', `${symbol.toLowerCase()}_forecast.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Forecast not found for this symbol' },
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const forecastData = JSON.parse(fileContents);
    
    // Fetch live price and update the data
    const livePrice = await fetchLivePrice(symbol);
    if (livePrice !== null) {
      forecastData.last_price = livePrice;
      forecastData.last_updated = new Date().toISOString();
    }
    
    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to load forecast' },
      { status: 500 }
    );
  }
}
