#!/usr/bin/env python3
"""
Run Ensemble Forecasts
Combines LSTM, XGBoost, Random Forest, Gradient Boosting, and TimesFM
Usage: python run_ensemble_forecasts.py
"""

import sys
from ensemble_forecast_service import EnsembleForecaster

def main():
    print("🚀 Starting Ensemble Forecast Service...")
    print("=" * 60)
    print("Models included:")
    print("  - TimesFM (Google's Time Series Foundation Model)")
    print("  - XGBoost (Gradient Boosting)")
    print("  - LSTM (Long Short-Term Memory)")
    print("  - Random Forest")
    print("  - Gradient Boosting")
    print("=" * 60)
    
    try:
        service = EnsembleForecaster(use_timesfm=True)
        service.generate_all_ensemble_forecasts()
        print("=" * 60)
        print("✅ All ensemble forecasts generated successfully!")
        print("📁 Forecasts saved to the 'ensemble_forecasts' directory")
        print("=" * 60)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
