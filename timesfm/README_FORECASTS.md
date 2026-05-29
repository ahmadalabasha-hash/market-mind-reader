# TimesFM Forecasting System

Complete AI-powered forecasting system for stocks, indices, and sectors using Google's TimesFM model.

## Features

- **Stock Price Forecasts**: 30-day predictions for major stocks (AAPL, TSLA, NVDA, etc.)
- **Market Index Forecasts**: Predictions for SPY, QQQ, IWM, DIA
- **Sector Rotation Analysis**: Identify which sectors will outperform
- **Confidence Intervals**: Upper and lower bounds for predictions
- **Scheduled Updates**: Automatic daily/weekly forecast generation

## Setup

### 1. Install Dependencies

```bash
cd timesfm
pip install -r requirements.txt
pip install -r forecast_requirements.txt
```

### 2. Set Environment Variables

```bash
export FINNHUB_API_KEY=your_finnhub_api_key_here
```

Get your API key from: https://finnhub.io/

### 3. Run Forecasts

**One-time run:**
```bash
python run_forecasts.py
```

**With scheduler (runs daily at 6 AM UTC):**
```bash
python scheduler.py
```

## File Structure

```
timesfm/
├── data_fetcher.py          # Fetches data from Finnhub API
├── forecast_service.py      # TimesFM forecasting service
├── scheduler.py            # Scheduled forecast generation
├── run_forecasts.py         # Simple script to run forecasts
├── forecasts/               # Generated forecast JSON files
│   ├── aapl_forecast.json
│   ├── tsla_forecast.json
│   ├── spy_forecast.json
│   └── sector_rotation_forecast.json
└── forecast_output.json     # Legacy sales forecast
```

## API Endpoints

Once forecasts are generated, they're available via:

- `/api/forecasts/stocks/[symbol]` - Stock forecasts
- `/api/forecasts/indices/[symbol]` - Index forecasts
- `/api/forecasts/sectors` - Sector rotation data

## Web Interface

Access forecasts at: `/forecasts` (Ultimate plan only)

## Customization

### Add New Stocks

Edit `forecast_service.py`:

```python
stocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "YOUR_STOCK"]
```

### Change Forecast Horizon

```python
forecast = self.stock_price_forecast(symbol, horizon=60)  # 60 days instead of 30
```

### Adjust Schedule

Edit `scheduler.py`:

```python
schedule.every().day.at("09:00").do(self.run_daily_forecasts)  # 9 AM instead of 6 AM
```

## Data Sources

- **Finnhub API**: Historical price data
- **TimesFM**: Google's time series forecasting model
- **Local JSON**: Forecast storage

## Production Deployment

For production, consider:

1. **Server**: Run scheduler.py on a dedicated server
2. **Database**: Store forecasts in PostgreSQL instead of JSON
3. **Monitoring**: Add error logging and alerts
4. **Caching**: Cache API responses for performance
5. **Rate Limiting**: Protect Finnhub API calls

## Troubleshooting

**No data for symbol:**
- Check if symbol is valid on Finnhub
- Verify API key is correct

**Model loading error:**
- Ensure PyTorch is installed
- Check internet connection (downloads model on first run)

**Scheduler not running:**
- Check system timezone
- Verify Python process is running
