#!/usr/bin/env python3
"""
Run Transformer-Based Forecasts
Implements Temporal Fusion Transformer (TFT) and Autoformer
Usage: python run_transformer_forecasts.py
"""

import sys
from transformer_forecast_service import TransformerForecaster, EnsembleTransformerForecaster

def main():
    print("🚀 Starting Transformer-Based Forecast Service...")
    print("=" * 60)
    print("Models included:")
    print("  - Temporal Fusion Transformer (TFT)")
    print("  - Autoformer")
    print("  - TimesFM (for ensemble)")
    print("=" * 60)
    
    try:
        # Run individual transformer models
        print("\n1. Running TFT forecasts...")
        tft = TransformerForecaster(model_type='tft')
        tft.generate_all_forecasts(symbols=["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"], horizon=30)
        
        print("\n2. Running Autoformer forecasts...")
        autoformer = TransformerForecaster(model_type='autoformer')
        autoformer.generate_all_forecasts(symbols=["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"], horizon=30)
        
        print("\n3. Running Transformer Ensemble forecasts...")
        ensemble = EnsembleTransformerForecaster()
        ensemble.generate_all_forecasts(symbols=["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"], horizon=30)
        
        print("=" * 60)
        print("✅ All transformer forecasts generated successfully!")
        print("📁 Forecasts saved to the 'transformer_forecasts' and 'transformer_ensemble_forecasts' directories")
        print("=" * 60)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
