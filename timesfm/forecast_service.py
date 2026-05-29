import timesfm
import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from data_fetcher import FinnhubDataFetcher
import os

class TimesFMForecastService:
    def __init__(self, finnhub_api_key: str):
        self.model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
        self.model.compile(timesfm.ForecastConfig(max_context=1024, max_horizon=256))
        self.data_fetcher = FinnhubDataFetcher(finnhub_api_key)
        self.forecasts_dir = "forecasts"
        os.makedirs(self.forecasts_dir, exist_ok=True)
    
    def generate_forecast(self, historical_data: List[float], horizon: int = 30) -> List[float]:
        """Generate forecast using TimesFM"""
        if len(historical_data) < 10:
            raise ValueError("Need at least 10 data points for forecasting")
        
        forecast, _ = self.model.forecast(horizon=horizon, inputs=[historical_data])
        return forecast[0].tolist()
    
    def stock_price_forecast(self, symbol: str, horizon: int = 30) -> Dict:
        """Generate stock price forecast"""
        print(f"Generating forecast for {symbol}...")
        
        # Fetch historical data
        historical = self.data_fetcher.get_stock_candles(symbol, days_back=365)
        
        if not historical:
            return {"error": f"No data available for {symbol}"}
        
        # Generate forecast
        forecast = self.generate_forecast(historical, horizon=horizon)
        
        # Calculate confidence bounds (simple approximation)
        mean = sum(forecast) / len(forecast)
        std = (sum((x - mean) ** 2 for x in forecast) / len(forecast)) ** 0.5
        
        result = {
            "symbol": symbol,
            "type": "stock_price",
            "historical": historical[-90:],  # Last 90 days
            "forecast": forecast,
            "horizon": horizon,
            "last_price": historical[-1],
            "forecast_mean": mean,
            "forecast_std": std,
            "confidence_upper": [x + std for x in forecast],
            "confidence_lower": [x - std for x in forecast],
            "last_updated": datetime.now().isoformat(),
            "model": "TimesFM 2.5"
        }
        
        return result
    
    def index_forecast(self, symbol: str, horizon: int = 30) -> Dict:
        """Generate market index forecast"""
        return self.stock_price_forecast(symbol, horizon)
    
    def sector_rotation_forecast(self, symbols: List[str], horizon: int = 30) -> Dict:
        """Generate sector rotation forecast"""
        print(f"Generating sector rotation forecast for {len(symbols)} sectors...")
        
        sector_forecasts = {}
        for symbol in symbols:
            forecast = self.stock_price_forecast(symbol, horizon)
            if "error" not in forecast:
                sector_forecasts[symbol] = forecast
        
        # Rank sectors by expected return
        ranked = sorted(
            sector_forecasts.items(),
            key=lambda x: x[1]["forecast_mean"] / x[1]["last_price"],
            reverse=True
        )
        
        result = {
            "type": "sector_rotation",
            "sectors": [s[0] for s in ranked],
            "forecasts": {s[0]: s[1] for s in ranked},
            "rankings": [{"symbol": s[0], "expected_return": s[1]["forecast_mean"] / s[1]["last_price"]} for s in ranked],
            "last_updated": datetime.now().isoformat(),
            "model": "TimesFM 2.5"
        }
        
        return result
    
    def save_forecast(self, forecast: Dict, filename: str):
        """Save forecast to JSON file"""
        filepath = os.path.join(self.forecasts_dir, filename)
        with open(filepath, "w") as f:
            json.dump(forecast, f, indent=2)
        print(f"✓ Forecast saved to {filepath}")
    
    def generate_all_forecasts(self):
        """Generate all types of forecasts"""
        print("=" * 50)
        print("Generating TimesFM Forecasts")
        print("=" * 50)
        
        # Stock forecasts
        stocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"]
        for stock in stocks:
            try:
                forecast = self.stock_price_forecast(stock, horizon=30)
                self.save_forecast(forecast, f"{stock.lower()}_forecast.json")
            except Exception as e:
                print(f"Error forecasting {stock}: {e}")
        
        # Index forecasts
        indices = ["SPY", "QQQ", "IWM", "DIA"]
        for index in indices:
            try:
                forecast = self.index_forecast(index, horizon=30)
                self.save_forecast(forecast, f"{index.lower()}_forecast.json")
            except Exception as e:
                print(f"Error forecasting {index}: {e}")
        
        # Sector rotation
        sector_etfs = ["XLK", "XLF", "XLV", "XLE", "XLI", "XLU"]
        try:
            forecast = self.sector_rotation_forecast(sector_etfs, horizon=30)
            self.save_forecast(forecast, "sector_rotation_forecast.json")
        except Exception as e:
            print(f"Error forecasting sector rotation: {e}")
        
        print("=" * 50)
        print("All forecasts generated successfully!")
        print("=" * 50)

# Main execution
if __name__ == "__main__":
    api_key = os.getenv("FINNHUB_API_KEY", "your_api_key_here")
    
    if api_key == "your_api_key_here":
        print("Please set FINNHUB_API_KEY environment variable")
        print("Example: export FINNHUB_API_KEY=your_key_here")
    else:
        service = TimesFMForecastService(api_key)
        service.generate_all_forecasts()
