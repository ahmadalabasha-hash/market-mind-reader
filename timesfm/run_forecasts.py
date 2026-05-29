#!/usr/bin/env python3
"""
Simple script to run TimesFM forecasts
Usage: python run_forecasts.py
"""

import os
import sys
from forecast_service import TimesFMForecastService

def main():
    # Get API key from environment
    api_key = os.getenv("FINNHUB_API_KEY")
    
    if not api_key:
        print("❌ FINNHUB_API_KEY environment variable not set")
        print("Please set it with: export FINNHUB_API_KEY=your_key_here")
        sys.exit(1)
    
    print("🚀 Starting TimesFM Forecast Service...")
    print("=" * 50)
    
    try:
        service = TimesFMForecastService(api_key)
        service.generate_all_forecasts()
        print("=" * 50)
        print("✅ All forecasts generated successfully!")
        print("📁 Forecasts saved to the 'forecasts' directory")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
