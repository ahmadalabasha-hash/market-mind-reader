import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict

class YahooFinanceDataFetcher:
    def __init__(self):
        pass
    
    def get_stock_candles(self, symbol: str, days_back: int = 365) -> List[float]:
        """Fetch historical price data for a stock using Yahoo Finance"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            ticker = yf.Ticker(symbol)
            hist = ticker.history(start=start_date, end=end_date)
            
            if hist.empty:
                print(f"No data found for {symbol}")
                return []
            
            # Return closing prices as list
            return hist['Close'].tolist()
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return []
    
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
    fetcher = YahooFinanceDataFetcher()
    
    # Test with a few symbols
    symbols = ["AAPL", "TSLA", "NVDA"]
    data = fetcher.get_multiple_stocks(symbols)
    
    for symbol, prices in data.items():
        print(f"{symbol}: {len(prices)} data points")
