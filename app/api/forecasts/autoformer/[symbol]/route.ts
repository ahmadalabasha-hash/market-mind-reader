import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const filePath = path.join(process.cwd(), 'timesfm', 'transformer_forecasts', `${symbol.toLowerCase()}_autoformer.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Autoformer forecast not found for this symbol' },
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const forecastData = JSON.parse(fileContents);
    
    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Autoformer forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to load Autoformer forecast' },
      { status: 500 }
    );
  }
}
