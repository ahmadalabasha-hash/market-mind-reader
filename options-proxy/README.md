# SPY Options Chain - NASDAQ Style

A production-ready options chain display matching NASDAQ.com's style and functionality.

## Features

- **NASDAQ-style UI**: Clean, professional interface matching NASDAQ's options chain layout
- **Side-by-side tables**: Separate Calls and Puts tables with identical column structure
- **Alpaca Markets API**: Real-time stock data (IEX) + 15-min delayed options data (indicative feed)
- **Auto-refresh**: Configurable refresh intervals (2, 5, 10, or 30 seconds)
- **Market hours detection**: Automatically stops updates when market is closed
- **Interactive charts**: Lightweight Charts integration for option price history
- **Option details**: Modal with Greeks (Delta, Gamma, Theta, Vega) when clicking an option
- **Expiration selection**: Dropdown to choose different expiration dates
- **Multiple symbols**: SPY, QQQ, AAPL, TSLA, GOOGL, MSFT, AMZN, NVDA, META, IWM
- **Responsive design**: Works on desktop and mobile
- **Free tier available**: Alpaca free tier with 200 API calls/minute

## Quick Start

1. **Get free Alpaca API keys**:
   - Go to https://alpaca.markets/signup
   - Sign up for a free account (email + password)
   - Get your API Key ID and Secret Key from the dashboard
   - Free tier: 200 API calls/minute, 15-min delayed options data

2. **Set your API keys**:
   ```bash
   export APCA_API_KEY_ID=your_alpaca_api_key_id
   export APCA_API_SECRET_KEY=your_alpaca_api_secret_key
   # Optional: Override default URLs
   export APCA_BASE_URL=https://data.alpaca.markets
   export APCA_PAPER_URL=https://paper-api.alpaca.markets
   # Or on Windows:
   set APCA_API_KEY_ID=your_alpaca_api_key_id
   set APCA_API_SECRET_KEY=your_alpaca_api_secret_key
   ```

3. **Test your connection**:
   ```bash
   cd options-proxy
   node server.js --test
   ```
   This will verify your API keys work by fetching AAPL stock bars, options chain, and quote.

4. **Start the proxy server**:
   ```bash
   node server.js
   ```
   
   The proxy server will run on `http://localhost:3001`

5. **Open the HTML file**:
   - Open `options-chain.html` in your browser
   - Or use: `open options-chain.html` (macOS) or `start options-chain.html` (Windows)

## Project Structure

```
options-proxy/
├── server.js              # Node.js proxy server (Alpaca Markets API)
├── package.json           # Node.js dependencies
├── options-chain.html     # Frontend HTML/CSS/JS (self-contained)
└── README.md             # This file
```

## API Endpoints

The proxy server provides the following endpoints:

- `GET /api/options/:symbol` - Get options chain data
  - Query params: `expiration` (optional) - Filter by expiration date
  - Returns: Symbol, current price, expiration dates, calls, puts from Alpaca (15-min delayed indicative feed)

- `GET /api/historical/:symbol` - Get historical price data
  - Query params: `period` (optional) - Time period (1d, 1w, 1m, 3m, 1y)
  - Returns: Array of OHLCV data from Alpaca (available since 2016)

- `GET /api/quote/:symbol` - Get current quote
  - Returns: Current price, change, percent change, high, low, open from Alpaca (IEX exchange)

## Data Columns

The options tables display the following columns (matching NASDAQ):

- **Strike**: Option strike price
- **Symbol**: Option contract symbol
- **Last**: Last traded price
- **Chg**: Price change
- **Bid**: Current bid price
- **Ask**: Current ask price
- **Volume**: Trading volume
- **Open Int**: Open interest
- **IV**: Implied volatility

## Option Detail View

Clicking any option row opens a modal with:

- **Price Chart**: Historical price chart with selectable time ranges (1D, 1W, 1M, 3M, 1Y)
- **Option Details**: Last price, change, bid/ask, volume, open interest, IV, ITM status
- **Greeks**: Delta, Gamma, Theta, Vega (calculated using Black-Scholes)

## Customization

### Change the Symbol

Edit `options-chain.html` and change:
```javascript
const SYMBOL = 'SPY'; // Change to any symbol (AAPL, TSLA, etc.)
```

### Without API Key

If you don't have a Finnhub API key, the app will automatically use synthetic data based on realistic pricing models. The data will be static when the market is closed.

## Technologies Used

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Charts**: Lightweight Charts (TradingView)
- **Backend**: Node.js, Express
- **Data Source**: Alpaca Markets API (stocks + options)

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Notes

- **Alpaca Markets API** provides:
  - Stock data: Real-time from IEX exchange (free plan)
  - Options data: 15-minute delayed indicative feed (free plan)
  - Historical data: Available since 2016 (latest 15 mins not available on free plan)
- Market hours detection prevents unnecessary updates when market is closed
- Greeks are provided by Alpaca API (calculated using Black-Scholes model)
- Historical chart data is from Alpaca (real historical stock data)
- Alpaca free tier: 200 API calls/minute, limited to 30 symbols
- Options data is 15-min delayed - not suitable for real-time trading
- Stock data is real-time from IEX exchange on free plan

## Troubleshooting

**Proxy server won't start:**
- Ensure Node.js is installed (v14 or higher)
- Run `npm install` to install dependencies

**No data loading:**
- Check that the proxy server is running on port 3001
- Verify your Alpaca API keys are set correctly
- Run `node server.js --test` to verify your connection
- Check browser console for errors

**Chart not displaying:**
- Ensure Lightweight Charts CDN is accessible
- Check browser console for JavaScript errors

**API key not working:**
- Verify your Alpaca API keys are valid at https://alpaca.markets
- Check that you have enough API calls remaining (free tier: 200 calls/minute)
- Ensure you're using the correct API keys (Key ID and Secret Key)

## License

This project is for educational and demonstration purposes.
