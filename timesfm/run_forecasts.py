#!/usr/bin/env python3
"""
Simple script to run TimesFM forecasts using Yahoo Finance
Usage: python run_forecasts.py
"""

import sys
from forecast_service import TimesFMForecastService

def main():
    print("🚀 Starting TimesFM Forecast Service...")
    print("=" * 50)
    
    try:
        # No API key needed for Yahoo Finance
        service = TimesFMForecastService()
        service.generate_all_forecasts()
        print("=" * 50)
        print("✅ All forecasts generated successfully!")
        print("📁 Forecasts saved to the 'forecasts' directory")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
