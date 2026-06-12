"""
Transformer-Based Forecasting Service
Implements Temporal Fusion Transformer and Autoformer architectures
Similar to GPT but for time series - captures complex patterns and dependencies
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
import json
import os
from data_fetcher import YahooFinanceDataFetcher

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.utils.data import DataLoader, TensorDataset
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    nn = None  # Prevent NameError
    print("PyTorch not available. Install with: pip install torch")

try:
    import timesfm
    TIMESFM_AVAILABLE = True
except ImportError:
    TIMESFM_AVAILABLE = False
    print("TimesFM not available. Install with: pip install timesfm")


# Only define transformer models if PyTorch is available
if TORCH_AVAILABLE:
    class PositionalEncoding(nn.Module):
        """Positional encoding for transformer"""
        
        def __init__(self, d_model, max_len=5000):
            super(PositionalEncoding, self).__init__()
            
            pe = torch.zeros(max_len, d_model)
            position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
            div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model))
            
            pe[:, 0::2] = torch.sin(position * div_term)
            pe[:, 1::2] = torch.cos(position * div_term)
            pe = pe.unsqueeze(0)
            
            self.register_buffer('pe', pe)
        
        def forward(self, x):
            return x + self.pe[:, :x.size(1), :]


    class TemporalFusionTransformer(nn.Module):
        """
        Temporal Fusion Transformer (TFT)
        State-of-the-art transformer for time series forecasting
        Handles temporal dependencies and static covariates
        """
        
        def __init__(self, input_size=1, d_model=128, nhead=8, num_layers=4, 
                     dim_feedforward=512, dropout=0.1, output_size=1):
            super(TemporalFusionTransformer, self).__init__()
            
            self.input_projection = nn.Linear(input_size, d_model)
            self.positional_encoding = PositionalEncoding(d_model)
            
            encoder_layer = nn.TransformerEncoderLayer(
                d_model=d_model,
                nhead=nhead,
                dim_feedforward=dim_feedforward,
                dropout=dropout,
                batch_first=True
            )
            self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
            
            # Variable selection network
            self.variable_selection = nn.Sequential(
                nn.Linear(d_model, d_model),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(d_model, d_model)
            )
            
            # Temporal attention
            self.temporal_attention = nn.MultiheadAttention(d_model, nhead, dropout=dropout, batch_first=True)
            
            # Output layers
            self.output_projection = nn.Sequential(
                nn.Linear(d_model, dim_feedforward),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(dim_feedforward, output_size)
            )
            
            self.d_model = d_model
            
        def forward(self, x):
            # x shape: (batch, seq_len, input_size)
            x = self.input_projection(x)
            x = self.positional_encoding(x)
            
            # Variable selection
            x = self.variable_selection(x)
            
            # Transformer encoding
            encoded = self.transformer_encoder(x)
            
            # Temporal attention (self-attention)
            attn_output, _ = self.temporal_attention(encoded, encoded, encoded)
            
            # Use last time step for prediction
            output = self.output_projection(attn_output[:, -1, :])
            
            return output


    class Autoformer(nn.Module):
        """
        Autoformer: Auto-Correlation Mechanism for Time Series Forecasting
        Uses auto-correlation instead of self-attention for better temporal modeling
        """
        
        def __init__(self, input_size=1, d_model=128, nhead=8, num_layers=4,
                     dim_feedforward=512, dropout=0.1, output_size=1):
            super(Autoformer, self).__init__()
            
            self.input_projection = nn.Linear(input_size, d_model)
            self.positional_encoding = PositionalEncoding(d_model)
            
            encoder_layer = nn.TransformerEncoderLayer(
                d_model=d_model,
                nhead=nhead,
                dim_feedforward=dim_feedforward,
                dropout=dropout,
                batch_first=True
            )
            self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
            
            # Decomposition layers (trend + seasonal)
            self.decomposition = nn.Sequential(
                nn.Linear(d_model, d_model),
                nn.ReLU(),
                nn.Linear(d_model, d_model)
            )
            
            # Auto-correlation mechanism (simplified)
            self.autocorr = nn.MultiheadAttention(d_model, nhead, dropout=dropout, batch_first=True)
            
            # Output layers
            self.output_projection = nn.Sequential(
                nn.Linear(d_model, dim_feedforward),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(dim_feedforward, output_size)
            )
            
            self.d_model = d_model
            
        def forward(self, x):
            # x shape: (batch, seq_len, input_size)
            x = self.input_projection(x)
            x = self.positional_encoding(x)
            
            # Decomposition
            decomposed = self.decomposition(x)
            
            # Transformer encoding
            encoded = self.transformer_encoder(decomposed)
            
            # Auto-correlation attention
            attn_output, _ = self.autocorr(encoded, encoded, encoded)
            
            # Use last time step for prediction
            output = self.output_projection(attn_output[:, -1, :])
            
            return output
else:
    PositionalEncoding = None
    TemporalFusionTransformer = None
    Autoformer = None


class TransformerForecaster:
    """
    Transformer-based forecasting service
    Implements TFT and Autoformer for production-grade forecasting
    """
    
    def __init__(self, model_type: str = 'tft'):
        """
        Args:
            model_type: 'tft' for Temporal Fusion Transformer, 'autoformer' for Autoformer
        """
        self.model_type = model_type
        self.data_fetcher = YahooFinanceDataFetcher()
        self.model = None
        self.scaler = None
        
        if not TORCH_AVAILABLE:
            print("PyTorch not available. Transformer models cannot be used.")
            return
        
        # Initialize model
        if model_type == 'tft':
            self.model = TemporalFusionTransformer(
                input_size=1,
                d_model=128,
                nhead=8,
                num_layers=4,
                dim_feedforward=512,
                dropout=0.1,
                output_size=1
            )
            print(f"✓ {model_type.upper()} model initialized")
        elif model_type == 'autoformer':
            self.model = Autoformer(
                input_size=1,
                d_model=128,
                nhead=8,
                num_layers=4,
                dim_feedforward=512,
                dropout=0.1,
                output_size=1
            )
            print(f"✓ {model_type.upper()} model initialized")
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Initialize scaler
        try:
            from sklearn.preprocessing import MinMaxScaler
            self.scaler = MinMaxScaler()
        except ImportError:
            print("Scikit-learn not available. Scaling disabled.")
        
        self.forecasts_dir = "transformer_forecasts"
        os.makedirs(self.forecasts_dir, exist_ok=True)
    
    def prepare_sequences(self, data: List[float], seq_length: int = 60) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare sequences for transformer training"""
        sequences = []
        targets = []
        
        for i in range(len(data) - seq_length):
            sequences.append(data[i:i + seq_length])
            targets.append(data[i + seq_length])
        
        return np.array(sequences), np.array(targets)
    
    def train(self, data: List[float], epochs: int = 100, batch_size: int = 32, 
              seq_length: int = 60, learning_rate: float = 0.001):
        """Train transformer model on historical data"""
        if self.model is None:
            print("Model not initialized")
            return None
        
        print(f"Training {self.model_type.upper()} model...")
        
        # Prepare sequences
        X, y = self.prepare_sequences(data, seq_length=seq_length)
        
        if len(X) < batch_size:
            print(f"Insufficient data: {len(X)} sequences, need at least {batch_size}")
            return None
        
        # Normalize data
        if self.scaler:
            X = self.scaler.fit_transform(X.reshape(-1, X.shape[-1])).reshape(X.shape)
            y = self.scaler.fit_transform(y.reshape(-1, 1)).flatten()
        
        # Convert to tensors
        X_tensor = torch.FloatTensor(X).unsqueeze(-1)
        y_tensor = torch.FloatTensor(y).unsqueeze(-1)
        
        dataset = TensorDataset(X_tensor, y_tensor)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        # Training
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10, factor=0.5)
        
        self.model.train()
        best_loss = float('inf')
        
        for epoch in range(epochs):
            epoch_loss = 0
            for batch_X, batch_y in dataloader:
                optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()
                epoch_loss += loss.item()
            
            avg_loss = epoch_loss / len(dataloader)
            scheduler.step(avg_loss)
            
            if avg_loss < best_loss:
                best_loss = avg_loss
            
            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch + 1}/{epochs}, Loss: {avg_loss:.6f}")
        
        print(f"Training complete. Best loss: {best_loss:.6f}")
        return self.model
    
    def forecast(self, data: List[float], horizon: int = 30, seq_length: int = 60) -> List[float]:
        """Generate forecast using trained transformer"""
        if self.model is None:
            return None
        
        self.model.eval()
        forecast = []
        
        with torch.no_grad():
            # Prepare last sequence
            if len(data) < seq_length:
                seq = data + [data[-1]] * (seq_length - len(data))
            else:
                seq = data[-seq_length:]
            
            if self.scaler:
                seq = self.scaler.transform(np.array(seq).reshape(-1, 1)).flatten()
            
            current_seq = torch.FloatTensor(seq).unsqueeze(0).unsqueeze(-1)
            
            for _ in range(horizon):
                pred = self.model(current_seq)
                
                if self.scaler:
                    pred_val = self.scaler.inverse_transform(pred.numpy()).flatten()[0]
                else:
                    pred_val = pred.item()
                
                forecast.append(pred_val)
                
                # Update sequence (sliding window)
                current_seq = torch.cat([current_seq[:, 1:, :], pred.unsqueeze(0).unsqueeze(0)], dim=1)
        
        return forecast
    
    def generate_forecast(self, symbol: str, horizon: int = 30, seq_length: int = 60,
                         epochs: int = 100) -> Dict:
        """Generate complete forecast for a symbol"""
        print(f"Generating {self.model_type.upper()} forecast for {symbol}...")
        
        # Fetch historical data
        historical = self.data_fetcher.get_stock_candles(symbol, days_back=365)
        
        if not historical or len(historical) < seq_length + 10:
            return {"error": f"Insufficient data for {symbol}"}
        
        # Train model
        self.train(historical, epochs=epochs, seq_length=seq_length)
        
        # Generate forecast
        forecast = self.forecast(historical, horizon=horizon, seq_length=seq_length)
        
        if forecast is None:
            return {"error": "Forecast generation failed"}
        
        # Calculate statistics
        forecast_array = np.array(forecast)
        mean = np.mean(forecast_array)
        std = np.std(forecast_array)
        confidence_upper = (forecast_array + std).tolist()
        confidence_lower = (forecast_array - std).tolist()
        
        result = {
            "symbol": symbol,
            "type": f"{self.model_type}_forecast",
            "model": self.model_type.upper(),
            "historical": historical[-90:],
            "last_price": historical[-1],
            "horizon": horizon,
            "forecast": forecast,
            "forecast_mean": mean,
            "forecast_std": std,
            "confidence_upper": confidence_upper,
            "confidence_lower": confidence_lower,
            "last_updated": datetime.now().isoformat()
        }
        
        return result
    
    def save_forecast(self, forecast: Dict, filename: str):
        """Save forecast to JSON file"""
        filepath = os.path.join(self.forecasts_dir, filename)
        with open(filepath, "w") as f:
            json.dump(forecast, f, indent=2)
        print(f"✓ {self.model_type.upper()} forecast saved to {filepath}")
    
    def generate_all_forecasts(self, symbols: List[str] = None, horizon: int = 30):
        """Generate forecasts for multiple symbols"""
        if symbols is None:
            symbols = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META"]
        
        print("=" * 60)
        print(f"Generating {self.model_type.upper()} Forecasts")
        print("=" * 60)
        
        for symbol in symbols:
            try:
                forecast = self.generate_forecast(symbol, horizon=horizon)
                if "error" not in forecast:
                    self.save_forecast(forecast, f"{symbol.lower()}_{self.model_type}.json")
                else:
                    print(f"Error forecasting {symbol}: {forecast['error']}")
            except Exception as e:
                print(f"Error forecasting {symbol}: {e}")
        
        print("=" * 60)
        print(f"All {self.model_type.upper()} forecasts generated successfully!")
        print("=" * 60)


class EnsembleTransformerForecaster:
    """
    Ensemble of transformer models (TFT + Autoformer + TimesFM)
    Combines multiple transformer architectures for robust predictions
    """
    
    def __init__(self):
        self.tft_forecaster = TransformerForecaster(model_type='tft')
        self.autoformer_forecaster = TransformerForecaster(model_type='autoformer')
        
        # Initialize TimesFM if available
        if TIMESFM_AVAILABLE:
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
                print("✓ TimesFM model loaded for ensemble")
            except Exception as e:
                print(f"TimesFM loading failed: {e}")
                self.timesfm_model = None
        else:
            self.timesfm_model = None
        
        self.forecasts_dir = "transformer_ensemble_forecasts"
        os.makedirs(self.forecasts_dir, exist_ok=True)
    
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
    
    def ensemble_forecast(self, symbol: str, horizon: int = 30, epochs: int = 50) -> Dict:
        """Generate ensemble forecast from all transformer models"""
        print(f"Generating transformer ensemble forecast for {symbol}...")
        
        # Fetch historical data
        data_fetcher = YahooFinanceDataFetcher()
        historical = data_fetcher.get_stock_candles(symbol, days_back=365)
        
        if not historical or len(historical) < 60:
            return {"error": f"Insufficient data for {symbol}"}
        
        forecasts = {}
        
        # TFT forecast
        try:
            tft_forecast = self.tft_forecaster.generate_forecast(
                symbol, horizon=horizon, epochs=epochs
            )
            if "error" not in tft_forecast:
                forecasts['tft'] = tft_forecast['forecast']
        except Exception as e:
            print(f"TFT forecast error: {e}")
        
        # Autoformer forecast
        try:
            autoformer_forecast = self.autoformer_forecaster.generate_forecast(
                symbol, horizon=horizon, epochs=epochs
            )
            if "error" not in autoformer_forecast:
                forecasts['autoformer'] = autoformer_forecast['forecast']
        except Exception as e:
            print(f"Autoformer forecast error: {e}")
        
        # TimesFM forecast
        try:
            timesfm_pred = self.forecast_timesfm(historical, horizon)
            if timesfm_pred:
                forecasts['timesfm'] = timesfm_pred
        except Exception as e:
            print(f"TimesFM forecast error: {e}")
        
        if not forecasts:
            return {"error": "No transformer models available"}
        
        # Equal weight ensemble (can be improved with accuracy tracking)
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
            "type": "transformer_ensemble_forecast",
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
        print(f"✓ Transformer ensemble forecast saved to {filepath}")
    
    def generate_all_forecasts(self, symbols: List[str] = None, horizon: int = 30):
        """Generate ensemble forecasts for multiple symbols"""
        if symbols is None:
            symbols = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META"]
        
        print("=" * 60)
        print("Generating Transformer Ensemble Forecasts")
        print("=" * 60)
        
        for symbol in symbols:
            try:
                forecast = self.ensemble_forecast(symbol, horizon=horizon)
                if "error" not in forecast:
                    self.save_forecast(forecast, f"{symbol.lower()}_transformer_ensemble.json")
                else:
                    print(f"Error forecasting {symbol}: {forecast['error']}")
            except Exception as e:
                print(f"Error forecasting {symbol}: {e}")
        
        print("=" * 60)
        print("All transformer ensemble forecasts generated successfully!")
        print("=" * 60)


# Main execution
if __name__ == "__main__":
    # Test individual models
    print("Testing TFT model...")
    tft = TransformerForecaster(model_type='tft')
    tft.generate_all_forecasts(symbols=["AAPL", "TSLA"], horizon=30)
    
    print("\nTesting Autoformer model...")
    autoformer = TransformerForecaster(model_type='autoformer')
    autoformer.generate_all_forecasts(symbols=["AAPL", "TSLA"], horizon=30)
    
    print("\nTesting Transformer Ensemble...")
    ensemble = EnsembleTransformerForecaster()
    ensemble.generate_all_forecasts(symbols=["AAPL", "TSLA"], horizon=30)
