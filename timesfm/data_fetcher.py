import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict
import os

class FinnhubDataFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://finnhub.io/api/v1"
    
    def get_stock_candles(self, symbol: str, days_back: int = 365) -> List[float]:
        """Fetch historical price data for a stock"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        url = f"{self.base_url}/stock/candle"
        params = {
            "symbol": symbol,
            "resolution": "D",
            "from": int(start_date.timestamp()),
            "to": int(end_date.timestamp()),
            "token": self.api_key
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('s') == 'no_data':
            print(f"No data found for {symbol}")
            return []
        
        # Return closing prices
        return data.get('c', [])
    
    def get_multiple_stocks(self, symbols: List[str]) -> Dict[str, List[float]]:
        """Fetch data for multiple stocks"""
        results = {}
        for symbol in symbols:
            print(f"Fetching data for {symbol}...")
            prices = self.get_stock_candles(symbol)
            if prices:
                results[symbol] = prices
        return results
    
    def get_index_data(self, symbol: str) -> List[float]:
        """Fetch index data (SPY, QQQ, etc.)"""
        return self.get_stock_candles(symbol)

# Example usage
if __name__ == "__main__":
    api_key = os.getenv("FINNHUB_API_KEY", "your_api_key_here")
    fetcher = FinnhubDataFetcher(api_key)
    
    # Test with a few symbols
    symbols = ["AAPL", "TSLA", "NVDA"]
    data = fetcher.get_multiple_stocks(symbols)
    
    for symbol, prices in data.items():
        print(f"{symbol}: {len(prices)} data points")
