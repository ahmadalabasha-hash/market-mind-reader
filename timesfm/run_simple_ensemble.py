#!/usr/bin/env python3
"""
Run Simple Ensemble Forecasts
Uses only scikit-learn models (Random Forest, Gradient Boosting)
No XGBoost or PyTorch required
Usage: python run_simple_ensemble.py
"""

import sys
from simple_ensemble_service import SimpleEnsembleForecaster

def main():
    print("🚀 Starting Simple Ensemble Forecast Service...")
    print("=" * 60)
    print("Models included:")
    print("  - Random Forest")
    print("  - Gradient Boosting")
    print("=" * 60)
    
    try:
        service = SimpleEnsembleForecaster()
        service.generate_all_forecasts()
        print("=" * 60)
        print("✅ All simple ensemble forecasts generated successfully!")
        print("📁 Forecasts saved to the 'simple_ensemble_forecasts' directory")
        print("=" * 60)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
