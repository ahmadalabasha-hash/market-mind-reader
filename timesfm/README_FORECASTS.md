# TimesFM Forecasting System

Complete AI-powered forecasting system for stocks, indices, and sectors using advanced ML models.

## Features

### Basic Forecasting (TimesFM)
- **Stock Price Forecasts**: 30-day predictions for major stocks (AAPL, TSLA, NVDA, etc.)
- **Market Index Forecasts**: Predictions for SPY, QQQ, IWM, DIA
- **Sector Rotation Analysis**: Identify which sectors will outperform
- **Confidence Intervals**: Upper and lower bounds for predictions
- **Scheduled Updates**: Automatic daily/weekly forecast generation

### Advanced Forecasting (NEW)
- **Ensemble Methods**: Combines LSTM, XGBoost, Random Forest, Gradient Boosting, and TimesFM
- **Weighted Predictions**: Dynamic weighting based on historical accuracy
- **Transformer-Based Models**: Temporal Fusion Transformer (TFT) and Autoformer
- **Multi-Model Ensemble**: Combines TFT, Autoformer, and TimesFM for robust predictions
- **Production-Grade**: Used by hedge funds and institutional traders

## Setup

### 1. Install Dependencies

**For basic TimesFM forecasting:**
```bash
cd timesfm
pip install -r requirements.txt
```

**For advanced ensemble and transformer forecasting:**
```bash
cd timesfm
pip install -r advanced_requirements.txt
```

This installs:
- PyTorch (for LSTM and transformer models)
- TensorFlow (optional, for additional models)
- XGBoost, LightGBM, CatBoost (gradient boosting)
- Scikit-learn (traditional ML)
- Darts, PyTorch Forecasting (time series libraries)
- TimesFM (Google's foundation model)

### 2. Set Environment Variables

```bash
export FINNHUB_API_KEY=your_finnhub_api_key_here
```

Get your API key from: https://finnhub.io/

### 3. Run Forecasts

**Basic TimesFM forecasts:**
```bash
python run_forecasts.py
```

**Ensemble forecasts (LSTM + XGBoost + RF + GB + TimesFM):**
```bash
python run_ensemble_forecasts.py
```

**Transformer-based forecasts (TFT + Autoformer + Ensemble):**
```bash
python run_transformer_forecasts.py
```

**With scheduler (runs daily at 6 AM UTC):**
```bash
python scheduler.py
```

## File Structure

```
timesfm/
├── data_fetcher.py              # Fetches data from Yahoo Finance
├── forecast_service.py          # Basic TimesFM forecasting service
├── ensemble_forecast_service.py # Ensemble methods (LSTM, XGBoost, etc.)
├── transformer_forecast_service.py # Transformer models (TFT, Autoformer)
├── scheduler.py                # Scheduled forecast generation
├── run_forecasts.py             # Run basic TimesFM forecasts
├── run_ensemble_forecasts.py   # Run ensemble forecasts
├── run_transformer_forecasts.py # Run transformer forecasts
├── requirements.txt            # Basic dependencies
├── advanced_requirements.txt   # Advanced ML dependencies
├── forecasts/                  # Basic TimesFM forecasts
│   ├── aapl_forecast.json
│   ├── tsla_forecast.json
│   └── spy_forecast.json
├── ensemble_forecasts/         # Ensemble method forecasts
│   ├── aapl_ensemble.json
│   └── tsla_ensemble.json
├── transformer_forecasts/      # Individual transformer forecasts
│   ├── aapl_tft.json
│   └── aapl_autoformer.json
└── transformer_ensemble_forecasts/ # Combined transformer forecasts
    └── aapl_transformer_ensemble.json
```

## API Endpoints

Once forecasts are generated, they're available via:

**Basic TimesFM forecasts:**
- `/api/forecasts/stocks/[symbol]` - Stock forecasts (e.g., `/api/forecasts/stocks/aapl`)
- `/api/forecasts/indices/[symbol]` - Index forecasts (e.g., `/api/forecasts/indices/spy`)
- `/api/forecasts/sectors` - Sector rotation data

**Advanced Ensemble forecasts:**
- `/api/forecasts/ensemble/[symbol]` - Ensemble method forecasts (LSTM + XGBoost + RF + GB + TimesFM)

**Transformer-based forecasts:**
- `/api/forecasts/tft/[symbol]` - Temporal Fusion Transformer forecasts
- `/api/forecasts/autoformer/[symbol]` - Autoformer forecasts
- `/api/forecasts/transformer/[symbol]` - Combined transformer ensemble (TFT + Autoformer + TimesFM)

## Web Interface

Access forecasts at: `/forecasts` (Ultimate plan only)

## Customization

### Add New Stocks

Edit `forecast_service.py` (basic), `ensemble_forecast_service.py` (ensemble), or `transformer_forecast_service.py` (transformer):

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

- **Yahoo Finance**: Historical price data (via yfinance)
- **TimesFM**: Google's time series foundation model
- **Local JSON**: Forecast storage

## Model Comparison

### TimesFM (Basic)
- **Pros**: Fast, pre-trained, good for general time series
- **Cons**: Single model, limited customization
- **Use case**: Quick forecasts, baseline predictions

### Ensemble Methods (Advanced)
- **Pros**: Combines multiple models, weighted predictions, robust
- **Cons**: Slower, requires more training
- **Use case**: Production-grade forecasting, hedge fund quality

### Transformer Models (Advanced)
- **Pros**: Captures complex patterns, state-of-the-art accuracy
- **Cons**: Computationally intensive, longer training time
- **Use case**: High-accuracy requirements, institutional trading

## Production Deployment

For production, consider:

1. **Server**: Run scheduler.py on a dedicated server with GPU for transformer models
2. **Database**: Store forecasts in PostgreSQL instead of JSON
3. **Monitoring**: Add error logging and alerts for model failures
4. **Caching**: Cache API responses for performance
5. **Rate Limiting**: Protect API calls (Yahoo Finance has rate limits)
6. **Model Persistence**: Save trained models to disk to avoid retraining
7. **Accuracy Tracking**: Track model accuracy over time to adjust weights
8. **Load Balancing**: Distribute forecasting across multiple servers for ensemble methods

## Troubleshooting

**No data for symbol:**
- Check if symbol is valid on Yahoo Finance
- Verify internet connection

**Model loading error:**
- Ensure PyTorch is installed for ensemble/transformer models
- Check internet connection (downloads model on first run)
- Verify `advanced_requirements.txt` dependencies are installed

**Out of memory errors:**
- Reduce batch size in training parameters
- Use smaller sequence lengths
- Run on machine with more RAM or GPU

**Slow training:**
- Use GPU if available (PyTorch will auto-detect)
- Reduce number of training epochs
- Use fewer models in ensemble

**Scheduler not running:**
- Check system timezone
- Verify Python process is running
- Check logs for errors

## Advanced Features

### Dynamic Weight Adjustment

The ensemble forecaster automatically adjusts model weights based on historical accuracy. To enable this:

1. Track prediction accuracy over time
2. Update `model_accuracy_history` dictionary
3. Weights are recalculated automatically based on accuracy

### Model Persistence

To save trained models and avoid retraining:

```python
import joblib

# Save model
joblib.dump(forecaster.lstm_model, 'lstm_model.pkl')

# Load model
forecaster.lstm_model = joblib.load('lstm_model.pkl')
```

### Custom Model Weights

Override default weights in `ensemble_forecast_service.py`:

```python
self.default_weights = {
    'timesfm': 0.50,  # Give more weight to TimesFM
    'xgboost': 0.20,
    'lstm': 0.15,
    'random_forest': 0.10,
    'gradient_boosting': 0.05
}
```

## References

- [TimesFM Paper](https://arxiv.org/abs/2310.10688) - Google's time series foundation model
- [Temporal Fusion Transformer](https://arxiv.org/abs/1912.09363) - State-of-the-art transformer for time series
- [Autoformer](https://arxiv.org/abs/2106.13008) - Auto-correlation mechanism for time series
- [XGBoost Documentation](https://xgboost.readthedocs.io/) - Gradient boosting framework
