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
    const filePath = path.join(process.cwd(), 'timesfm', 'ensemble_forecasts', `${symbol.toLowerCase()}_ensemble.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Ensemble forecast not found for this symbol' },
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const forecastData = JSON.parse(fileContents);
    
    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Ensemble forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to load ensemble forecast' },
      { status: 500 }
    );
  }
}
