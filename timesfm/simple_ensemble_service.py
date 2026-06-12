"""
Simplified Ensemble Forecasting Service
Uses only scikit-learn models (Random Forest, Gradient Boosting) to avoid XGBoost/PyTorch dependencies
"""

import numpy as np
import pandas as pd
from typing import List, Dict
from datetime import datetime
import json
import os
from data_fetcher import YahooFinanceDataFetcher

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.preprocessing import MinMaxScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available. Install with: pip install scikit-learn")


class SimpleEnsembleForecaster:
    """
    Simplified ensemble forecaster using only scikit-learn models
    """
    
    def __init__(self):
        self.data_fetcher = YahooFinanceDataFetcher()
        self.scaler = MinMaxScaler() if SKLEARN_AVAILABLE else None
        
        if SKLEARN_AVAILABLE:
            self.rf_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
            self.gb_model = GradientBoostingRegressor(n_estimators=100, max_depth=6, random_state=42)
            print("✓ Sklearn models initialized")
        else:
            self.rf_model = None
            self.gb_model = None
        
        # Default weights
        self.default_weights = {
            'random_forest': 0.5,
            'gradient_boosting': 0.5
        }
        
        self.forecasts_dir = "simple_ensemble_forecasts"
        os.makedirs(self.forecasts_dir, exist_ok=True)
    
    def train_sklearn_models(self, data: List[float]):
        """Train sklearn models on historical data"""
        if not SKLEARN_AVAILABLE:
            return None
        
        # Prepare features (lagged values + moving averages)
        df = pd.DataFrame({'price': data})
        for lag in range(1, 11):
            df[f'lag_{lag}'] = df['price'].shift(lag)
        df['ma_5'] = df['price'].rolling(5).mean()
        df['ma_10'] = df['price'].rolling(10).mean()
        df['momentum'] = df['price'] / df['price'].shift(5) - 1
        
        df = df.dropna()
        feature_cols = [f'lag_{i}' for i in range(1, 11)] + ['ma_5', 'ma_10', 'momentum']
        X = df[feature_cols].values
        y = df['price'].values
        
        # Train models
        self.rf_model.fit(X, y)
        self.gb_model.fit(X, y)
        
        return {'random_forest': self.rf_model, 'gradient_boosting': self.gb_model}
    
    def forecast_sklearn(self, data: List[float], horizon: int, model_name: str) -> List[float]:
        """Generate forecast using sklearn models"""
        if not SKLEARN_AVAILABLE:
            return None
        
        model = self.rf_model if model_name == 'random_forest' else self.gb_model
        if model is None:
            return None
        
        forecast = []
        current_data = data.copy()
        
        for _ in range(horizon):
            # Prepare features
            features = []
            for lag in range(1, 11):
                if len(current_data) >= lag:
                    features.append(current_data[-lag])
                else:
                    features.append(current_data[-1])
            
            # Add moving averages
            if len(current_data) >= 5:
                features.append(sum(current_data[-5:]) / 5)
            else:
                features.append(current_data[-1])
            
            if len(current_data) >= 10:
                features.append(sum(current_data[-10:]) / 10)
            else:
                features.append(current_data[-1])
            
            # Add momentum
            if len(current_data) >= 5:
                features.append(current_data[-1] / current_data[-5] - 1)
            else:
                features.append(0)
            
            # Predict next value
            next_val = model.predict(np.array([features]))[0]
            forecast.append(next_val)
            current_data.append(next_val)
        
        return forecast
    
    def ensemble_forecast(self, symbol: str, horizon: int = 30) -> Dict:
        """Generate ensemble forecast from sklearn models"""
        print(f"Generating simple ensemble forecast for {symbol}...")
        
        # Fetch historical data
        historical = self.data_fetcher.get_stock_candles(symbol, days_back=365)
        
        if not historical or len(historical) < 50:
            return {"error": f"Insufficient data for {symbol}"}
        
        # Train models on historical data
        print("Training models...")
        if SKLEARN_AVAILABLE:
            self.train_sklearn_models(historical)
        
        # Generate forecasts from each model
        forecasts = {}
        
        if SKLEARN_AVAILABLE:
            print("Generating Random Forest forecast...")
            rf_pred = self.forecast_sklearn(historical, horizon, 'random_forest')
            if rf_pred:
                forecasts['random_forest'] = rf_pred
            
            print("Generating Gradient Boosting forecast...")
            gb_pred = self.forecast_sklearn(historical, horizon, 'gradient_boosting')
            if gb_pred:
                forecasts['gradient_boosting'] = gb_pred
        
        if not forecasts:
            return {"error": "No models available for forecasting"}
        
        # Calculate weights (equal for now)
        weights = {k: 1.0 / len(forecasts) for k in forecasts.keys()}
        
        # Generate weighted ensemble forecast
        ensemble_forecast = []
        for i in range(horizon):
            weighted_sum = 0
            for model_name, pred in forecasts.items():
                if i < len(pred):
                    weighted_sum += pred[i] * weights[model_name]
            ensemble_forecast.append(weighted_sum)
        
        # Calculate confidence intervals
        forecast_array = np.array(ensemble_forecast)
        std = np.std(forecast_array)
        confidence_upper = (forecast_array + std).tolist()
        confidence_lower = (forecast_array - std).tolist()
        
        result = {
            "symbol": symbol,
            "type": "simple_ensemble_forecast",
            "historical": historical[-90:],
            "last_price": historical[-1],
            "horizon": horizon,
            "ensemble_forecast": ensemble_forecast,
            "confidence_upper": confidence_upper,
            "confidence_lower": confidence_lower,
            "individual_forecasts": forecasts,
            "model_weights": weights,
            "forecast_mean": np.mean(ensemble_forecast),
            "forecast_std": std,
            "last_updated": datetime.now().isoformat(),
            "models_used": list(forecasts.keys())
        }
        
        return result
    
    def save_forecast(self, forecast: Dict, filename: str):
        """Save forecast to JSON file"""
        filepath = os.path.join(self.forecasts_dir, filename)
        with open(filepath, "w") as f:
            json.dump(forecast, f, indent=2)
        print(f"✓ Simple ensemble forecast saved to {filepath}")
    
    def generate_all_forecasts(self):
        """Generate ensemble forecasts for all major symbols"""
        print("=" * 60)
        print("Generating Simple Ensemble Forecasts")
        print("=" * 60)
        
        # Stocks
        stocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META"]
        for stock in stocks:
            try:
                forecast = self.ensemble_forecast(stock, horizon=30)
                if "error" not in forecast:
                    self.save_forecast(forecast, f"{stock.lower()}_simple_ensemble.json")
                else:
                    print(f"Error forecasting {stock}: {forecast['error']}")
            except Exception as e:
                print(f"Error forecasting {stock}: {e}")
        
        # Indices
        indices = ["SPY", "QQQ", "IWM", "DIA"]
        for index in indices:
            try:
                forecast = self.ensemble_forecast(index, horizon=30)
                if "error" not in forecast:
                    self.save_forecast(forecast, f"{index.lower()}_simple_ensemble.json")
                else:
                    print(f"Error forecasting {index}: {forecast['error']}")
            except Exception as e:
                print(f"Error forecasting {index}: {e}")
        
        print("=" * 60)
        print("All simple ensemble forecasts generated successfully!")
        print("=" * 60)


# Main execution
if __name__ == "__main__":
    forecaster = SimpleEnsembleForecaster()
    forecaster.generate_all_forecasts()
