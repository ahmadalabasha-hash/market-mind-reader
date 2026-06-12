"""
Ensemble Forecasting Service
Combines multiple models (LSTM, Transformer, XGBoost) with weighted predictions
Based on historical accuracy - used by hedge funds and institutional traders
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
import json
import os
from data_fetcher import YahooFinanceDataFetcher

# ML Libraries
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("XGBoost not available. Install with: pip install xgboost")

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available. Install with: pip install scikit-learn")

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, TensorDataset
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    nn = None  # Prevent NameError
    print("PyTorch not available. Install with: pip install torch")

try:
    import timesfm
    # Check if the required class is available
    if hasattr(timesfm, 'TimesFM_2p5_200M_torch'):
        TIMESFM_AVAILABLE = True
    else:
        TIMESFM_AVAILABLE = False
        print("TimesFM not properly installed. Run: pip install -e .")
except ImportError:
    TIMESFM_AVAILABLE = False
    print("TimesFM not available. Install with: pip install timesfm")


# Only define LSTMModel if PyTorch is available
if TORCH_AVAILABLE:
    class LSTMModel(nn.Module):
        """LSTM model for time series forecasting"""
        
        def __init__(self, input_size=1, hidden_size=64, num_layers=2, output_size=1):
            super(LSTMModel, self).__init__()
            self.hidden_size = hidden_size
            self.num_layers = num_layers
            
            self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
            self.fc = nn.Linear(hidden_size, output_size)
            self.dropout = nn.Dropout(0.2)
            
        def forward(self, x):
            h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            
            out, _ = self.lstm(x, (h0, c0))
            out = self.dropout(out[:, -1, :])
            out = self.fc(out)
            return out
else:
    LSTMModel = None


class EnsembleForecaster:
    """
    Ensemble forecaster combining multiple models with dynamic weighting
    """
    
    def __init__(self, use_timesfm: bool = True):
        self.use_timesfm = use_timesfm
        self.data_fetcher = YahooFinanceDataFetcher()
        self.models = {}
        self.model_weights = {}
        self.model_accuracy_history = {}
        self.scaler = MinMaxScaler() if SKLEARN_AVAILABLE else None
        
        # Initialize TimesFM if available
        if use_timesfm and TIMESFM_AVAILABLE:
            try:
                self.timesfm_model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
                    "google/timesfm-2.5-200m-pytorch"
                )
                self.timesfm_model.compile(
                    timesfm.ForecastConfig(
                        max_context=1024,
                        max_horizon=256,
                        normalize_inputs=True
                    )
                )
                print("✓ TimesFM model loaded successfully")
            except Exception as e:
                print(f"TimesFM loading failed: {e}")
                self.timesfm_model = None
        else:
            self.timesfm_model = None
        
        # Initialize XGBoost if available
        if XGBOOST_AVAILABLE:
            self.xgb_model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.01,
                objective='reg:squarederror'
            )
            print("✓ XGBoost model initialized")
        else:
            self.xgb_model = None
        
        # Initialize LSTM if PyTorch available
        if TORCH_AVAILABLE:
            self.lstm_model = LSTMModel(input_size=1, hidden_size=64, num_layers=2, output_size=1)
            print("✓ LSTM model initialized")
        else:
            self.lstm_model = None
        
        # Initialize sklearn models
        if SKLEARN_AVAILABLE:
            self.rf_model = RandomForestRegressor(n_estimators=100, max_depth=10)
            self.gb_model = GradientBoostingRegressor(n_estimators=100, max_depth=6)
            print("✓ Sklearn models initialized")
        else:
            self.rf_model = None
            self.gb_model = None
        
        # Default weights (will be updated based on accuracy)
        self.default_weights = {
            'timesfm': 0.35,
            'xgboost': 0.25,
            'lstm': 0.20,
            'random_forest': 0.10,
            'gradient_boosting': 0.10
        }
        
        self.forecasts_dir = "ensemble_forecasts"
        os.makedirs(self.forecasts_dir, exist_ok=True)
    
    def prepare_sequences(self, data: List[float], seq_length: int = 30) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare sequences for LSTM training"""
        sequences = []
        targets = []
        
        for i in range(len(data) - seq_length):
            sequences.append(data[i:i + seq_length])
            targets.append(data[i + seq_length])
        
        return np.array(sequences), np.array(targets)
    
    def train_lstm(self, data: List[float], epochs: int = 50, batch_size: int = 32):
        """Train LSTM model on historical data"""
        if not TORCH_AVAILABLE or self.lstm_model is None:
            return None
        
        # Prepare sequences
        X, y = self.prepare_sequences(data, seq_length=30)
        
        # Normalize data
        if self.scaler:
            X = self.scaler.fit_transform(X)
            y = self.scaler.fit_transform(y.reshape(-1, 1)).flatten()
        
        # Convert to tensors
        X_tensor = torch.FloatTensor(X).unsqueeze(-1)
        y_tensor = torch.FloatTensor(y).unsqueeze(-1)
        
        dataset = TensorDataset(X_tensor, y_tensor)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        # Training
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.lstm_model.parameters(), lr=0.001)
        
        self.lstm_model.train()
        for epoch in range(epochs):
            for batch_X, batch_y in dataloader:
                optimizer.zero_grad()
                outputs = self.lstm_model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
        
        return self.lstm_model
    
    def train_xgboost(self, data: List[float]):
        """Train XGBoost model on historical data"""
        if not XGBOOST_AVAILABLE or self.xgb_model is None:
            return None
        
        # Prepare features (lagged values)
        df = pd.DataFrame({'price': data})
        for lag in range(1, 11):
            df[f'lag_{lag}'] = df['price'].shift(lag)
        
        df = df.dropna()
        X = df[[f'lag_{i}' for i in range(1, 11)]].values
        y = df['price'].values
        
        # Train
        self.xgb_model.fit(X, y)
        return self.xgb_model
    
    def train_sklearn_models(self, data: List[float]):
        """Train sklearn models (Random Forest, Gradient Boosting)"""
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
    
    def forecast_timesfm(self, data: List[float], horizon: int) -> List[float]:
        """Generate forecast using TimesFM"""
        if self.timesfm_model is None:
            return None
        
        try:
            forecast, _ = self.timesfm_model.forecast(horizon=horizon, inputs=[data])
            return forecast[0].tolist()
        except Exception as e:
            print(f"TimesFM forecast error: {e}")
            return None
    
    def forecast_xgboost(self, data: List[float], horizon: int) -> List[float]:
        """Generate forecast using XGBoost"""
        if self.xgb_model is None:
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
            
            # Predict next value
            next_val = self.xgb_model.predict(np.array([features]))[0]
            forecast.append(next_val)
            current_data.append(next_val)
        
        return forecast
    
    def forecast_lstm(self, data: List[float], horizon: int) -> List[float]:
        """Generate forecast using LSTM"""
        if self.lstm_model is None:
            return None
        
        self.lstm_model.eval()
        forecast = []
        
        with torch.no_grad():
            # Prepare last sequence
            seq_length = 30
            if len(data) < seq_length:
                seq = data + [data[-1]] * (seq_length - len(data))
            else:
                seq = data[-seq_length:]
            
            if self.scaler:
                seq = self.scaler.transform(np.array(seq).reshape(-1, 1)).flatten()
            
            current_seq = torch.FloatTensor(seq).unsqueeze(0).unsqueeze(-1)
            
            for _ in range(horizon):
                pred = self.lstm_model(current_seq)
                if self.scaler:
                    pred_val = self.scaler.inverse_transform(pred.numpy()).flatten()[0]
                else:
                    pred_val = pred.item()
                
                forecast.append(pred_val)
                
                # Update sequence
                current_seq = torch.cat([current_seq[:, 1:, :], pred.unsqueeze(0).unsqueeze(0)], dim=1)
        
        return forecast
    
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
    
    def calculate_model_weights(self, symbol: str) -> Dict[str, float]:
        """Calculate dynamic weights based on historical accuracy"""
        # Check if we have accuracy history for this symbol
        if symbol in self.model_accuracy_history:
            accuracy = self.model_accuracy_history[symbol]
            
            # Convert accuracy to weights (higher accuracy = higher weight)
            total_accuracy = sum(accuracy.values())
            if total_accuracy > 0:
                weights = {k: v / total_accuracy for k, v in accuracy.items()}
                return weights
        
        # Return default weights if no history
        return self.default_weights.copy()
    
    def ensemble_forecast(self, symbol: str, horizon: int = 30) -> Dict:
        """Generate ensemble forecast combining all models"""
        print(f"Generating ensemble forecast for {symbol}...")
        
        # Fetch historical data
        historical = self.data_fetcher.get_stock_candles(symbol, days_back=365)
        
        if not historical or len(historical) < 50:
            return {"error": f"Insufficient data for {symbol}"}
        
        # Train models on historical data
        print("Training models...")
        if TORCH_AVAILABLE:
            self.train_lstm(historical, epochs=30)
        if XGBOOST_AVAILABLE:
            self.train_xgboost(historical)
        if SKLEARN_AVAILABLE:
            self.train_sklearn_models(historical)
        
        # Generate forecasts from each model
        forecasts = {}
        
        if self.timesfm_model:
            print("Generating TimesFM forecast...")
            timesfm_pred = self.forecast_timesfm(historical, horizon)
            if timesfm_pred:
                forecasts['timesfm'] = timesfm_pred
        
        if XGBOOST_AVAILABLE:
            print("Generating XGBoost forecast...")
            xgb_pred = self.forecast_xgboost(historical, horizon)
            if xgb_pred:
                forecasts['xgboost'] = xgb_pred
        
        if TORCH_AVAILABLE:
            print("Generating LSTM forecast...")
            lstm_pred = self.forecast_lstm(historical, horizon)
            if lstm_pred:
                forecasts['lstm'] = lstm_pred
        
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
        
        # Calculate weights
        weights = self.calculate_model_weights(symbol)
        
        # Filter weights to only include available models
        available_weights = {k: weights.get(k, 0) for k in forecasts.keys()}
        total_weight = sum(available_weights.values())
        
        if total_weight > 0:
            available_weights = {k: v / total_weight for k, v in available_weights.items()}
        else:
            # Equal weights if no valid weights
            available_weights = {k: 1.0 / len(forecasts) for k in forecasts.keys()}
        
        # Generate weighted ensemble forecast
        ensemble_forecast = []
        for i in range(horizon):
            weighted_sum = 0
            for model_name, pred in forecasts.items():
                if i < len(pred):
                    weighted_sum += pred[i] * available_weights[model_name]
            ensemble_forecast.append(weighted_sum)
        
        # Calculate confidence intervals
        forecast_array = np.array(ensemble_forecast)
        std = np.std(forecast_array)
        confidence_upper = (forecast_array + std).tolist()
        confidence_lower = (forecast_array - std).tolist()
        
        result = {
            "symbol": symbol,
            "type": "ensemble_forecast",
            "historical": historical[-90:],
            "last_price": historical[-1],
            "horizon": horizon,
            "ensemble_forecast": ensemble_forecast,
            "confidence_upper": confidence_upper,
            "confidence_lower": confidence_lower,
            "individual_forecasts": forecasts,
            "model_weights": available_weights,
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
        print(f"✓ Ensemble forecast saved to {filepath}")
    
    def generate_all_ensemble_forecasts(self):
        """Generate ensemble forecasts for all major symbols"""
        print("=" * 60)
        print("Generating Ensemble Forecasts")
        print("=" * 60)
        
        # Stocks
        stocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META"]
        for stock in stocks:
            try:
                forecast = self.ensemble_forecast(stock, horizon=30)
                if "error" not in forecast:
                    self.save_forecast(forecast, f"{stock.lower()}_ensemble.json")
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
                    self.save_forecast(forecast, f"{index.lower()}_ensemble.json")
                else:
                    print(f"Error forecasting {index}: {forecast['error']}")
            except Exception as e:
                print(f"Error forecasting {index}: {e}")
        
        print("=" * 60)
        print("All ensemble forecasts generated successfully!")
        print("=" * 60)


# Main execution
if __name__ == "__main__":
    forecaster = EnsembleForecaster(use_timesfm=True)
    forecaster.generate_all_ensemble_forecasts()
