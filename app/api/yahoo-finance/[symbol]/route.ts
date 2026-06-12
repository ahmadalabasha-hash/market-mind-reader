import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || '60';
    const range = searchParams.get('range') || '3mo';

    const cleanedSymbol = symbol.toUpperCase();
    console.log(`Fetching Yahoo Finance data for ${cleanedSymbol}, interval: ${interval}, range: ${range}`);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      cleanedSymbol,
    )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(
      range,
    )}&includePrePost=false`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    console.log(`Yahoo Finance response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Yahoo Finance error response:', errorText);
      throw new Error(`Yahoo Finance error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log('Yahoo Finance data received successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Yahoo Finance fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Yahoo Finance data' },
      { status: 500 }
    );
  }
}
