import schedule
import time
from datetime import datetime
from forecast_service import TimesFMForecastService
import os
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('forecast_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ForecastScheduler:
    def __init__(self, finnhub_api_key: str):
        self.service = TimesFMForecastService(finnhub_api_key)
    
    def run_daily_forecasts(self):
        """Run all forecasts daily"""
        logger.info("Starting daily forecast generation...")
        try:
            self.service.generate_all_forecasts()
            logger.info("Daily forecasts completed successfully")
        except Exception as e:
            logger.error(f"Error in daily forecasts: {e}")
    
    def run_weekly_forecasts(self):
        """Run extended forecasts weekly"""
        logger.info("Starting weekly forecast generation...")
        try:
            # Generate longer horizon forecasts
            stocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"]
            for stock in stocks:
                try:
                    forecast = self.service.stock_price_forecast(stock, horizon=90)
                    self.service.save_forecast(forecast, f"{stock.lower()}_weekly_forecast.json")
                except Exception as e:
                    logger.error(f"Error in weekly forecast for {stock}: {e}")
            logger.info("Weekly forecasts completed successfully")
        except Exception as e:
            logger.error(f"Error in weekly forecasts: {e}")
    
    def start(self):
        """Start the scheduler"""
        logger.info("Starting forecast scheduler...")
        
        # Schedule daily forecasts at 6 AM UTC
        schedule.every().day.at("06:00").do(self.run_daily_forecasts)
        
        # Schedule weekly forecasts on Sunday at 8 AM UTC
        schedule.every().sunday.at("08:00").do(self.run_weekly_forecasts)
        
        logger.info("Scheduler started. Waiting for scheduled tasks...")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

if __name__ == "__main__":
    api_key = os.getenv("FINNHUB_API_KEY")
    
    if not api_key:
        logger.error("FINNHUB_API_KEY environment variable not set")
        exit(1)
    
    scheduler = ForecastScheduler(api_key)
    
    # Run once immediately for testing
    logger.info("Running initial forecast generation...")
    scheduler.run_daily_forecasts()
    
    # Start scheduler (comment out to run once only)
    # scheduler.start()
