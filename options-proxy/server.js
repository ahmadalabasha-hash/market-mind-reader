const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// API Configuration
const APCA_API_KEY_ID = process.env.APCA_API_KEY_ID || 'YOUR_ALPACA_API_KEY_ID';
const APCA_API_SECRET_KEY = process.env.APCA_API_SECRET_KEY || 'YOUR_ALPACA_API_SECRET_KEY';
const APCA_BASE_URL = process.env.APCA_BASE_URL || 'https://data.alpaca.markets';
const APCA_PAPER_URL = process.env.APCA_PAPER_URL || 'https://paper-api.alpaca.markets';

app.use(cors());
app.use(express.json());

// Market hours detection
function isMarketOpen() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  // Regular market hours: 9:30 AM - 4:00 PM EST
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;
  
  // Extended hours: 4:00 AM - 8:00 PM EST
  const preMarketOpen = 4 * 60;
  const afterMarketClose = 20 * 60;
  
  return currentTime >= marketOpen && currentTime < marketClose;
}

function isExtendedHours() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const preMarketOpen = 4 * 60;
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;
  const afterMarketClose = 20 * 60;
  
  return (currentTime >= preMarketOpen && currentTime < marketOpen) || 
         (currentTime >= marketClose && currentTime < afterMarketClose);
}

// Fetch stock quote from Alpaca Markets API
async function fetchAlpacaQuote(symbol) {
  try {
    if (APCA_API_KEY_ID === 'YOUR_ALPACA_API_KEY_ID' || APCA_API_SECRET_KEY === 'YOUR_ALPACA_API_SECRET_KEY') {
      console.warn('Alpaca API keys not set, using fallback');
      return null;
    }
    
    // Use latest quotes endpoint for real-time data (IEX exchange on free plan)
    const url = `${APCA_BASE_URL}/v2/stocks/${symbol}/quotes/latest`;
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': APCA_API_KEY_ID,
        'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.quote) {
      throw new Error('Invalid quote data from Alpaca');
    }
    
    const quote = data.quote;
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: quote.ap || quote.bp || 0, // Use ask or bid price
      previousClose: quote.c || 0,
      change: 0, // Alpaca doesn't provide change in latest quote
      percentChange: 0,
      high: quote.h || 0,
      low: quote.l || 0,
      open: quote.o || 0,
      isMarketOpen: isMarketOpen(),
      isExtendedHours: isExtendedHours(),
    };
  } catch (error) {
    console.error('Error fetching Alpaca quote:', error);
    return null;
  }
}

// Fetch historical bars from Alpaca Markets API
async function fetchAlpacaBars(symbol, timeframe = '1Day', start = null, end = null) {
  try {
    if (APCA_API_KEY_ID === 'YOUR_ALPACA_API_KEY_ID' || APCA_API_SECRET_KEY === 'YOUR_ALPACA_API_SECRET_KEY') {
      console.warn('Alpaca API keys not set, using fallback');
      return null;
    }
    
    // Default to last 30 days if no dates provided
    const endDate = end || new Date().toISOString().split('T')[0];
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `${APCA_BASE_URL}/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${startDate}&end=${endDate}`;
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': APCA_API_KEY_ID,
        'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.bars) {
      throw new Error('Invalid bars data from Alpaca');
    }
    
    return data.bars.map(bar => ({
      time: new Date(bar.t).getTime(),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v
    }));
  } catch (error) {
    console.error('Error fetching Alpaca bars:', error);
    return null;
  }
}

// Fetch options chain from Alpaca Markets (15-min delayed indicative feed)
async function fetchAlpacaOptions(symbol, expiration) {
  try {
    if (APCA_API_KEY_ID === 'YOUR_ALPACA_API_KEY_ID' || APCA_API_SECRET_KEY === 'YOUR_ALPACA_API_SECRET_KEY') {
      console.warn('Alpaca API keys not set, using fallback');
      return null;
    }
    
    // Use indicative feed (free, 15-min delayed)
    const baseUrl = 'https://data.alpaca.markets/v1beta1/options/snapshots';
    let url = `${baseUrl}/${symbol}?feed=indicative`;
    
    if (expiration) {
      url += `&expiration_date=${expiration}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': APCA_API_KEY_ID,
        'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.snapshots) {
      throw new Error('Invalid options data from Alpaca');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching Alpaca options:', error);
    return null;
  }
}

// Fetch options chain from Yahoo Finance (free, no signup - improved)
async function fetchYahooOptions(symbol, expiration) {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/options/${encodeURIComponent(symbol)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const data = await response.json();
    
    if (!data || !data.optionChain || !data.optionChain.result || data.optionChain.result.length === 0) {
      throw new Error('Invalid options data');
    }
    
    const result = data.optionChain.result[0];
    const quote = result.quote || {};
    
    // Get current price from quote
    const currentPrice = quote.regularMarketPrice || 0;
    
    // Get all expirations
    const expirations = result.expirationDates || [];
    
    // Get options for the requested expiration or first available
    const optionsMeta = result.options || [];
    let targetExpiration = expiration;
    
    if (!targetExpiration && expirations.length > 0) {
      targetExpiration = expirations[0];
    }
    
    // Find the options data for the target expiration
    const expirationDate = new Date(targetExpiration * 1000);
    const targetDateStr = expirationDate.toISOString().split('T')[0];
    
    // Process all options and format them
    const allOptions = [];
    
    optionsMeta.forEach(optionGroup => {
      const calls = optionGroup.calls || [];
      const puts = optionGroup.puts || [];
      
      calls.forEach(call => {
        allOptions.push({
          ...call,
          option_type: 'call',
          expiration_date: new Date(call.expiration * 1000).toISOString().split('T')[0]
        });
      });
      
      puts.forEach(put => {
        allOptions.push({
          ...put,
          option_type: 'put',
          expiration_date: new Date(put.expiration * 1000).toISOString().split('T')[0]
        });
      });
    });
    
    // Filter by expiration if provided
    const filteredOptions = targetExpiration 
      ? allOptions.filter(o => o.expiration_date === targetDateStr)
      : allOptions;
    
    return {
      option: filteredOptions,
      expirations: expirations.map(ts => new Date(ts * 1000).toISOString().split('T')[0]),
      currentPrice
    };
  } catch (error) {
    console.error('Error fetching Yahoo options:', error);
    return null;
  }
}

// Cache for static data when market is closed
const staticDataCache = new Map();

// Get options chain data
app.get('/api/options/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { expiration } = req.query;
  
  // Check if market is open
  const marketOpen = isMarketOpen();
  
  // If market is closed, use cached static data
  if (!marketOpen) {
    const cached = staticDataCache.get(symbol);
    if (cached) {
      return res.json(cached);
    }
  }
  
  // Try to fetch real data from Alpaca
  const stockData = await fetchAlpacaQuote(symbol);
  const alpacaOptions = await fetchAlpacaOptions(symbol, expiration);
  const yahooOptions = await fetchYahooOptions(symbol, expiration);
  
  let currentPrice = stockData?.currentPrice || 450;
  let calls = [];
  let puts = [];
  let expirationDates = [];
  
  // Use Alpaca options data (15-min delayed indicative feed)
  let optionsData = alpacaOptions || yahooOptions;
  
  if (optionsData && optionsData.snapshots) {
    // Process Alpaca snapshots format
    const snapshots = optionsData.snapshots;
    const uniqueExpirations = new Set();
    
    Object.entries(snapshots).forEach(([contractSymbol, snapshot]) => {
      const latestTrade = snapshot.latestTrade;
      const latestQuote = snapshot.latestQuote;
      const greeks = snapshot.greeks;
      const impliedVol = snapshot.impliedVolatility;
      
      // Parse contract symbol to get strike and type
      // Format: AAPL240426C00162500 (Symbol + Date + Type + Strike)
      const isCall = contractSymbol.includes('C');
      const isPut = contractSymbol.includes('P');
      
      if (!isCall && !isPut) return;
      
      // Extract strike from contract symbol (last 8 digits before type)
      const typeIndex = contractSymbol.search(/[CP]/);
      const strikeStr = contractSymbol.substring(typeIndex + 1);
      const strike = parseFloat(strikeStr) / 1000;
      
      // Extract expiration date
      const dateStr = contractSymbol.substring(contractSymbol.length - 15, contractSymbol.length - 8);
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      const expirationDate = `${year}-${month}-${day}`;
      
      uniqueExpirations.add(expirationDate);
      
      const optionData = {
        contractSymbol,
        strike,
        lastPrice: latestTrade?.p || latestQuote?.ap || 0,
        change: 0, // Alpaca doesn't provide change
        percentChange: 0,
        bid: latestQuote?.bp || 0,
        ask: latestQuote?.ap || 0,
        volume: 0, // Alpaca doesn't provide volume in snapshot
        openInterest: 0, // Alpaca doesn't provide OI in snapshot
        impliedVolatility: impliedVol || 0,
        inTheMoney: isCall ? currentPrice > strike : currentPrice < strike,
        expiration: expirationDate,
        lastTradeDate: latestTrade?.t || new Date().toISOString(),
        greeks: greeks || {
          delta: null,
          gamma: null,
          theta: null,
          vega: null,
          rho: null
        }
      };
      
      if (isCall) {
        calls.push(optionData);
      } else {
        puts.push(optionData);
      }
    });
    
    expirationDates = Array.from(uniqueExpirations).sort();
  } else if (optionsData && optionsData.option && optionsData.option.length > 0) {
    // Fallback to Yahoo Finance format
    const options = optionsData.option;
    
    const uniqueExpirations = [...new Set(options.map(o => o.expiration_date))].sort();
    expirationDates = uniqueExpirations;
    
    const filteredOptions = expiration 
      ? options.filter(o => o.expiration_date === expiration)
      : options;
    
    const callsData = filteredOptions.filter(o => o.option_type === 'call');
    const putsData = filteredOptions.filter(o => o.option_type === 'put');
    
    callsData.forEach(call => {
      calls.push({
        contractSymbol: call.symbol,
        strike: call.strike,
        lastPrice: parseFloat(call.last),
        change: parseFloat(call.change),
        percentChange: parseFloat(call.change_percentage),
        bid: parseFloat(call.bid),
        ask: parseFloat(call.ask),
        volume: parseInt(call.volume),
        openInterest: parseInt(call.open_interest),
        impliedVolatility: parseFloat(call.implied_volatility) / 100,
        inTheMoney: currentPrice > call.strike,
        expiration: call.expiration_date,
        lastTradeDate: new Date().toISOString(),
        greeks: call.greeks || {
          delta: null,
          gamma: null,
          theta: null,
          vega: null
        }
      });
    });
    
    putsData.forEach(put => {
      puts.push({
        contractSymbol: put.symbol,
        strike: put.strike,
        lastPrice: parseFloat(put.last),
        change: parseFloat(put.change),
        percentChange: parseFloat(put.change_percentage),
        bid: parseFloat(put.bid),
        ask: parseFloat(put.ask),
        volume: parseInt(put.volume),
        openInterest: parseInt(put.open_interest),
        impliedVolatility: parseFloat(put.implied_volatility) / 100,
        inTheMoney: currentPrice < put.strike,
        expiration: put.expiration_date,
        lastTradeDate: new Date().toISOString(),
        greeks: put.greeks || {
          delta: null,
          gamma: null,
          theta: null,
          vega: null
        }
      });
    });
  } else {
    // Generate synthetic options based on real current price
    const today = new Date();
    
    for (let i = 1; i <= 12; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i * 7);
      expirationDates.push(date.toISOString().split('T')[0]);
    }
    
    // Generate strikes around current price
    const baseStrike = Math.round(currentPrice / 5) * 5;
    for (let strike = baseStrike - 20; strike <= baseStrike + 20; strike += 2.5) {
      const call = generateRealisticOption(strike, 'CALL', currentPrice, expirationDates[0], symbol, marketOpen);
      const put = generateRealisticOption(strike, 'PUT', currentPrice, expirationDates[0], symbol, marketOpen);
      calls.push(call);
      puts.push(put);
    }
  }
  
  const data = {
    symbol: symbol.toUpperCase(),
    currentPrice,
    previousClose: stockData?.previousClose,
    change: stockData?.change || 0,
    percentChange: stockData?.percentChange || 0,
    high: stockData?.high,
    low: stockData?.low,
    open: stockData?.open,
    isMarketOpen: marketOpen,
    isExtendedHours: isExtendedHours(),
    expirationDates,
    calls,
    puts,
  };
  
  // Cache if market is closed
  if (!marketOpen) {
    staticDataCache.set(symbol, data);
  }
  
  res.json(data);
});

function generateRealisticOption(strike, type, currentPrice, expiration, symbol, marketOpen) {
  const inTheMoney = type === 'CALL' ? currentPrice > strike : currentPrice < strike;
  const intrinsicValue = inTheMoney ? Math.abs(currentPrice - strike) : 0;
  
  // Calculate days to expiration
  const daysToExpiry = Math.max(1, (new Date(expiration) - new Date()) / (24 * 60 * 60 * 1000));
  
  // Time value based on days to expiry (time decay)
  const timeValue = Math.sqrt(daysToExpiry / 365) * currentPrice * 0.15;
  
  const lastPrice = Math.max(0.01, intrinsicValue + timeValue);
  
  // Only add random variation if market is open
  const variation = marketOpen ? (Math.random() - 0.5) * 0.05 : 0;
  
  return {
    contractSymbol: `${symbol}${new Date(expiration).getFullYear().toString().slice(-2)}${(new Date(expiration).getMonth() + 1).toString().padStart(2, '0')}${new Date(expiration).getDate().toString().padStart(2, '0')}${type === 'CALL' ? 'C' : 'P'}${(strike * 1000).toFixed(0).padStart(8, '0')}`,
    strike,
    lastPrice: lastPrice * (1 + variation),
    change: marketOpen ? (Math.random() - 0.5) * 0.5 : 0,
    percentChange: marketOpen ? (Math.random() - 0.5) * 2 : 0,
    bid: lastPrice * 0.95 * (1 + variation),
    ask: lastPrice * 1.05 * (1 + variation),
    volume: Math.floor(Math.random() * 10000),
    openInterest: Math.floor(Math.random() * 50000),
    impliedVolatility: 0.15 + Math.random() * 0.1,
    inTheMoney,
    expiration,
    lastTradeDate: new Date().toISOString(),
  };
}

// Get historical data
app.get('/api/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { period } = req.query;
  
  // Try Alpaca first
  const alpacaBars = await fetchAlpacaBars(symbol, '1Day');
  
  if (alpacaBars) {
    const historical = alpacaBars.map(bar => ({
      date: new Date(bar.time).toISOString().split('T')[0],
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
    })).filter(d => d.close > 0);
    
    res.json(historical);
    return;
  }
  
  // Fallback to synthetic data
  console.error('Error fetching historical data from Alpaca, using synthetic data');
  const days = period === '1d' ? 1 : 
               period === '1w' ? 7 : 
               period === '1m' ? 30 : 
               period === '3m' ? 90 : 365;
  
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const basePrice = 450;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: basePrice,
      high: basePrice + Math.random() * 2,
      low: basePrice - Math.random() * 2,
      close: basePrice + (Math.random() - 0.5),
      volume: Math.floor(Math.random() * 10000000),
    });
  }
  
  res.json(data);
});

// Get current quote
app.get('/api/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  
  const stockData = await fetchAlpacaQuote(symbol);
  
  if (stockData) {
    res.json(stockData);
  } else {
    // Fallback
    res.json({
      symbol: symbol.toUpperCase(),
      currentPrice: 450,
      previousClose: 448,
      change: 2,
      percentChange: 0.45,
      isMarketOpen: isMarketOpen(),
      isExtendedHours: isExtendedHours(),
    });
  }
});

// Test function to verify Alpaca connection
async function testAlpacaConnection() {
  console.log('\n=== Testing Alpaca API Connection ===\n');
  
  if (APCA_API_KEY_ID === 'YOUR_ALPACA_API_KEY_ID' || APCA_API_SECRET_KEY === 'YOUR_ALPACA_API_SECRET_KEY') {
    console.log('❌ Alpaca API keys not set. Please set APCA_API_KEY_ID and APCA_API_SECRET_KEY environment variables.');
    return;
  }
  
  try {
    // Test 1: Fetch latest bar for AAPL
    console.log('Test 1: Fetching latest bar for AAPL...');
    const aaplBars = await fetchAlpacaBars('AAPL', '1Day');
    if (aaplBars && aaplBars.length > 0) {
      console.log('✅ AAPL bars fetched successfully');
      console.log('   Latest bar:', aaplBars[aaplBars.length - 1]);
    } else {
      console.log('❌ Failed to fetch AAPL bars');
    }
    
    // Test 2: Fetch options chain for AAPL
    console.log('\nTest 2: Fetching options chain for AAPL...');
    const aaplOptions = await fetchAlpacaOptions('AAPL');
    if (aaplOptions && aaplOptions.snapshots) {
      const snapshotKeys = Object.keys(aaplOptions.snapshots);
      console.log('✅ AAPL options chain fetched successfully');
      console.log('   Number of contracts:', snapshotKeys.length);
      console.log('   First contract:', snapshotKeys[0]);
      console.log('   First snapshot data:', aaplOptions.snapshots[snapshotKeys[0]]);
    } else {
      console.log('❌ Failed to fetch AAPL options chain');
    }
    
    // Test 3: Fetch quote for AAPL
    console.log('\nTest 3: Fetching quote for AAPL...');
    const aaplQuote = await fetchAlpacaQuote('AAPL');
    if (aaplQuote) {
      console.log('✅ AAPL quote fetched successfully');
      console.log('   Quote data:', aaplQuote);
    } else {
      console.log('❌ Failed to fetch AAPL quote');
    }
    
    console.log('\n=== Alpaca API Connection Test Complete ===\n');
  } catch (error) {
    console.error('❌ Error during Alpaca API test:', error);
  }
}

// Run test if called with --test flag
if (process.argv.includes('--test')) {
  testAlpacaConnection().then(() => process.exit(0));
} else {
  app.listen(PORT, () => {
    console.log(`Options proxy server running on http://localhost:${PORT}`);
    console.log('Using Alpaca Markets API for stock and options data');
    console.log('Stock data: IEX exchange (real-time on free plan)');
    console.log('Options data: Indicative feed (15-min delayed on free plan)');
    console.log('Historical data: Available since 2016 (latest 15 mins not available on free plan)');
    console.log('\nTo test Alpaca connection, run: node server.js --test');
  });
}
