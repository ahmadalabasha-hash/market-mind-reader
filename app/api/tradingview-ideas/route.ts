import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export interface TradingViewIdea {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  symbol: string;
  likes: number;
  comments: number;
  timestamp: string;
  url: string;
  chartUrl?: string;
}

export interface TradingViewNews {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  url: string;
  symbol: string;
}

export interface TradingViewTechnical {
  id: string;
  indicator: string;
  value: string;
  signal: 'buy' | 'sell' | 'neutral';
  symbol: string;
}

export interface TradingViewComponent {
  symbol: string;
  name: string;
  weight: number;
  change: number;
  url: string;
}

export interface TradingViewSeasonal {
  period: string;
  performance: number;
  symbol: string;
}

const TICKER_BASE_URLS: Record<string, string> = {
  SPX: 'https://www.tradingview.com/symbols/SPX',
  SPY: 'https://www.tradingview.com/symbols/SPY',
  QQQ: 'https://www.tradingview.com/symbols/QQQ',
};

async function fetchTradingViewIdeas(symbol: string): Promise<TradingViewIdea[]> {
  const url = `${TICKER_BASE_URLS[symbol]}/ideas/`;
  if (!url) {
    throw new Error(`Unsupported ticker: ${symbol}`);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TradingView ideas for ${symbol}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const ideas: TradingViewIdea[] = [];

    // TradingView ideas are typically in a specific container
    // This selector may need adjustment based on actual HTML structure
    $('.tv-idea-card, .idea-card, [data-role="idea"]').each((index, element) => {
      try {
        const $card = $(element);
        
        // Extract title
        const title = $card.find('.tv-idea-card__title, .title, h3, h4').first().text().trim() || 
                     $card.find('a[href*="/chart/"]').first().text().trim();
        
        // Extract description
        const description = $card.find('.tv-idea-card__description, .description, p').first().text().trim() ||
                           $card.find('.tv-idea-card__body').text().trim();
        
        // Extract author
        const authorName = $card.find('.tv-idea-card__author, .author-name, [data-role="author"]').first().text().trim() ||
                         $card.find('a[href*="/u/"]').first().text().trim();
        const authorUsername = $card.find('a[href*="/u/"]').first().attr('href')?.replace('/u/', '') || authorName;
        
        // Extract URL
        const ideaUrl = $card.find('a[href*="/chart/"]').first().attr('href') || 
                       $card.find('a[href*="/ideas/"]').first().attr('href');
        
        // Extract engagement metrics
        const likesText = $card.find('.tv-idea-card__likes, .likes-count, [data-role="likes"]').first().text().trim();
        const commentsText = $card.find('.tv-idea-card__comments, .comments-count, [data-role="comments"]').first().text().trim();
        
        const likes = parseInt(likesText.replace(/[^0-9]/g, '')) || 0;
        const comments = parseInt(commentsText.replace(/[^0-9]/g, '')) || 0;
        
        // Extract timestamp
        const timestamp = $card.find('.tv-idea-card__time, .timestamp, time').first().text().trim() ||
                         $card.find('[data-role="time"]').first().text().trim();
        
        // Extract chart URL if available
        const chartUrl = $card.find('img').first().attr('src') || undefined;

        if (title && ideaUrl) {
          ideas.push({
            id: `${symbol}-${index}-${Date.now()}`,
            title,
            description,
            author: {
              name: authorName || 'Unknown',
              username: authorUsername || 'unknown',
              avatar: undefined,
            },
            symbol,
            likes,
            comments,
            timestamp: timestamp || 'Recently',
            url: ideaUrl.startsWith('http') ? ideaUrl : `https://www.tradingview.com${ideaUrl}`,
            chartUrl,
          });
        }
      } catch (error) {
        console.error(`Error parsing idea card for ${symbol}:`, error);
      }
    });

    // If no ideas found with the above selectors, try alternative approach
    if (ideas.length === 0) {
      // Fallback: Look for any links to charts/ideas
      $('a[href*="/chart/"], a[href*="/ideas/"]').each((index, element) => {
        try {
          const $link = $(element);
          const href = $link.attr('href');
          const text = $link.text().trim();
          
          if (href && text && ideas.length < 10) {
            ideas.push({
              id: `${symbol}-fallback-${index}-${Date.now()}`,
              title: text,
              description: 'TradingView community idea',
              author: {
                name: 'TradingView Community',
                username: 'community',
              },
              symbol,
              likes: 0,
              comments: 0,
              timestamp: 'Recently',
              url: href.startsWith('http') ? href : `https://www.tradingview.com${href}`,
            });
          }
        } catch (error) {
          console.error(`Error parsing fallback link for ${symbol}:`, error);
        }
      });
    }

    return ideas.slice(0, 10); // Limit to 10 ideas per ticker
  } catch (error) {
    console.error(`Error fetching TradingView ideas for ${symbol}:`, error);
    // Return mock data as fallback
    return getMockIdeas(symbol);
  }
}

function getMockIdeas(symbol: string): TradingViewIdea[] {
  return [
    {
      id: `${symbol}-mock-1`,
      title: `${symbol} Technical Analysis - Key Levels to Watch`,
      description: `Comprehensive analysis of ${symbol} with support and resistance levels, trend analysis, and potential entry/exit points based on current market structure.`,
      author: {
        name: 'Technical Analyst',
        username: 'tech_analyst',
      },
      symbol,
      likes: 156,
      comments: 23,
      timestamp: '2 hours ago',
      url: `https://www.tradingview.com/symbols/${symbol}/ideas/`,
    },
    {
      id: `${symbol}-mock-2`,
      title: `${symbol} Market Outlook - Bullish Case Building`,
      description: `Analysis showing bullish momentum building in ${symbol} with key indicators suggesting continuation of the current uptrend. Watch for breakout above resistance.`,
      author: {
        name: 'Market Strategist',
        username: 'market_strat',
      },
      symbol,
      likes: 89,
      comments: 15,
      timestamp: '5 hours ago',
      url: `https://www.tradingview.com/symbols/${symbol}/ideas/`,
    },
    {
      id: `${symbol}-mock-3`,
      title: `${symbol} Volume Analysis - Institutional Flow Detected`,
      description: `Recent volume spikes in ${symbol} indicate institutional accumulation. This could signal a significant move in the coming sessions.`,
      author: {
        name: 'Volume Expert',
        username: 'volume_pro',
      },
      symbol,
      likes: 234,
      comments: 42,
      timestamp: '1 day ago',
      url: `https://www.tradingview.com/symbols/${symbol}/ideas/`,
    },
  ];
}

async function fetchTradingViewNews(symbol: string): Promise<TradingViewNews[]> {
  const url = `${TICKER_BASE_URLS[symbol]}/news/`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Failed to fetch news for ${symbol}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const news: TradingViewNews[] = [];

    $('.news-item, .tv-news-item, article').each((index, element) => {
      try {
        const $item = $(element);
        const title = $item.find('.title, h3, h4').first().text().trim();
        const description = $item.find('.description, p').first().text().trim();
        const source = $item.find('.source, .author').first().text().trim();
        const timestamp = $item.find('.time, .timestamp').first().text().trim();
        const newsUrl = $item.find('a').first().attr('href');

        if (title && newsUrl) {
          news.push({
            id: `${symbol}-news-${index}-${Date.now()}`,
            title,
            description: description || 'No description available',
            source: source || 'TradingView',
            timestamp: timestamp || 'Recently',
            url: newsUrl.startsWith('http') ? newsUrl : `https://www.tradingview.com${newsUrl}`,
            symbol,
          });
        }
      } catch (error) {
        console.error('Error parsing news item:', error);
      }
    });

    return news.length > 0 ? news.slice(0, 10) : getMockNews(symbol);
  } catch (error) {
    console.error(`Error fetching TradingView news for ${symbol}:`, error);
    return getMockNews(symbol);
  }
}

function getMockNews(symbol: string): TradingViewNews[] {
  return [
    {
      id: `${symbol}-news-1`,
      title: `${symbol} hits new highs as market sentiment improves`,
      description: `The ${symbol} index reached new heights today as investors react positively to recent economic data and corporate earnings reports.`,
      source: 'MarketWatch',
      timestamp: '1 hour ago',
      url: `https://www.tradingview.com/symbols/${symbol}/news/`,
      symbol,
    },
    {
      id: `${symbol}-news-2`,
      title: `Federal Reserve signals potential rate adjustments`,
      description: `Latest Fed comments suggest possible changes to monetary policy that could impact ${symbol} and broader markets.`,
      source: 'Reuters',
      timestamp: '3 hours ago',
      url: `https://www.tradingview.com/symbols/${symbol}/news/`,
      symbol,
    },
    {
      id: `${symbol}-news-3`,
      title: `Technical indicators show strong momentum for ${symbol}`,
      description: `Chart patterns and technical analysis suggest continued upside potential for ${symbol} in the near term.`,
      source: 'Bloomberg',
      timestamp: '5 hours ago',
      url: `https://www.tradingview.com/symbols/${symbol}/news/`,
      symbol,
    },
  ];
}

async function fetchTradingViewTechnicals(symbol: string): Promise<TradingViewTechnical[]> {
  const url = `${TICKER_BASE_URLS[symbol]}/technicals/`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Failed to fetch technicals for ${symbol}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const technicals: TradingViewTechnical[] = [];

    $('.technical-indicator, .tv-technical-indicator').each((index, element) => {
      try {
        const $indicator = $(element);
        const name = $indicator.find('.name, .label').first().text().trim();
        const value = $indicator.find('.value, .rating').first().text().trim();
        const signalText = $indicator.find('.signal, .rating').first().text().trim().toLowerCase();
        
        let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
        if (signalText.includes('buy') || signalText.includes('strong')) signal = 'buy';
        if (signalText.includes('sell') || signalText.includes('weak')) signal = 'sell';

        if (name) {
          technicals.push({
            id: `${symbol}-tech-${index}-${Date.now()}`,
            indicator: name,
            value: value || 'N/A',
            signal,
            symbol,
          });
        }
      } catch (error) {
        console.error('Error parsing technical indicator:', error);
      }
    });

    return technicals.length > 0 ? technicals : getMockTechnicals(symbol);
  } catch (error) {
    console.error(`Error fetching TradingView technicals for ${symbol}:`, error);
    return getMockTechnicals(symbol);
  }
}

function getMockTechnicals(symbol: string): TradingViewTechnical[] {
  return [
    {
      id: `${symbol}-tech-1`,
      indicator: 'RSI (14)',
      value: '65.4',
      signal: 'neutral',
      symbol,
    },
    {
      id: `${symbol}-tech-2`,
      indicator: 'MACD',
      value: 'Bullish',
      signal: 'buy',
      symbol,
    },
    {
      id: `${symbol}-tech-3`,
      indicator: 'Moving Average (50)',
      value: 'Above',
      signal: 'buy',
      symbol,
    },
    {
      id: `${symbol}-tech-4`,
      indicator: 'Stochastic',
      value: '72.1',
      signal: 'neutral',
      symbol,
    },
    {
      id: `${symbol}-tech-5`,
      indicator: 'CCI (20)',
      value: '120.5',
      signal: 'sell',
      symbol,
    },
  ];
}

async function fetchTradingViewComponents(symbol: string): Promise<TradingViewComponent[]> {
  const url = `${TICKER_BASE_URLS[symbol]}/components/`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Failed to fetch components for ${symbol}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const components: TradingViewComponent[] = [];

    $('.component-item, .tv-component-item, tr').each((index, element) => {
      try {
        const $item = $(element);
        const symbolText = $item.find('.symbol, a[href*="/symbols/"]').first().text().trim();
        const name = $item.find('.name, .description').first().text().trim();
        const weightText = $item.find('.weight, .percentage').first().text().trim();
        const changeText = $item.find('.change, .percent-change').first().text().trim();
        const componentUrl = $item.find('a[href*="/symbols/"]').first().attr('href');

        if (symbolText && componentUrl) {
          components.push({
            symbol: symbolText,
            name: name || symbolText,
            weight: parseFloat(weightText.replace(/[^0-9.]/g, '')) || 0,
            change: parseFloat(changeText.replace(/[^0-9.-]/g, '')) || 0,
            url: componentUrl.startsWith('http') ? componentUrl : `https://www.tradingview.com${componentUrl}`,
          });
        }
      } catch (error) {
        console.error('Error parsing component:', error);
      }
    });

    return components.length > 0 ? components.slice(0, 15) : getMockComponents(symbol);
  } catch (error) {
    console.error(`Error fetching TradingView components for ${symbol}:`, error);
    return getMockComponents(symbol);
  }
}

function getMockComponents(symbol: string): TradingViewComponent[] {
  const components: TradingViewComponent[] = [];
  const stocks = [
    { sym: 'NVDA', name: 'NVIDIA Corporation', weight: 7.2, change: 2.5 },
    { sym: 'AAPL', name: 'Apple Inc.', weight: 6.8, change: 1.2 },
    { sym: 'MSFT', name: 'Microsoft Corporation', weight: 6.5, change: 0.8 },
    { sym: 'AMZN', name: 'Amazon.com Inc.', weight: 3.4, change: -0.5 },
    { sym: 'GOOGL', name: 'Alphabet Inc.', weight: 4.1, change: 1.1 },
    { sym: 'META', name: 'Meta Platforms Inc.', weight: 2.3, change: 3.2 },
    { sym: 'TSLA', name: 'Tesla Inc.', weight: 1.8, change: -2.1 },
    { sym: 'BRK.B', name: 'Berkshire Hathaway', weight: 1.5, change: 0.3 },
    { sym: 'AVGO', name: 'Broadcom Inc.', weight: 1.4, change: 1.8 },
    { sym: 'LLY', name: 'Eli Lilly and Company', weight: 1.2, change: 2.9 },
  ];

  stocks.forEach((stock, index) => {
    components.push({
      symbol: stock.sym,
      name: stock.name,
      weight: stock.weight,
      change: stock.change,
      url: `https://www.tradingview.com/symbols/${stock.sym}/`,
    });
  });

  return components;
}

async function fetchTradingViewSeasonals(symbol: string): Promise<TradingViewSeasonal[]> {
  const url = `${TICKER_BASE_URLS[symbol]}/seasonals/`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Failed to fetch seasonals for ${symbol}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const seasonals: TradingViewSeasonal[] = [];

    $('.seasonal-item, .tv-seasonal-item').each((index, element) => {
      try {
        const $item = $(element);
        const period = $item.find('.period, .timeframe').first().text().trim();
        const performanceText = $item.find('.performance, .return').first().text().trim();
        const performance = parseFloat(performanceText.replace(/[^0-9.-]/g, '')) || 0;

        if (period) {
          seasonals.push({
            period,
            performance,
            symbol,
          });
        }
      } catch (error) {
        console.error('Error parsing seasonal:', error);
      }
    });

    return seasonals.length > 0 ? seasonals : getMockSeasonals(symbol);
  } catch (error) {
    console.error(`Error fetching TradingView seasonals for ${symbol}:`, error);
    return getMockSeasonals(symbol);
  }
}

function getMockSeasonals(symbol: string): TradingViewSeasonal[] {
  return [
    { period: 'January', performance: 1.2, symbol },
    { period: 'February', performance: -0.8, symbol },
    { period: 'March', performance: 2.1, symbol },
    { period: 'April', performance: 1.5, symbol },
    { period: 'May', performance: 0.3, symbol },
    { period: 'June', performance: -1.2, symbol },
    { period: 'July', performance: 2.4, symbol },
    { period: 'August', performance: -0.5, symbol },
    { period: 'September', performance: -2.1, symbol },
    { period: 'October', performance: 1.8, symbol },
    { period: 'November', performance: 2.6, symbol },
    { period: 'December', performance: 1.9, symbol },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol')?.toUpperCase();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    if (!TICKER_BASE_URLS[symbol]) {
      return NextResponse.json(
        { error: `Unsupported symbol: ${symbol}. Supported symbols: ${Object.keys(TICKER_BASE_URLS).join(', ')}` },
        { status: 400 }
      );
    }

    const dataType = searchParams.get('type') || 'ideas';
    
    let data;
    switch (dataType) {
      case 'ideas':
        data = await fetchTradingViewIdeas(symbol);
        return NextResponse.json({ symbol, type: 'ideas', data });
      case 'news':
        data = await fetchTradingViewNews(symbol);
        return NextResponse.json({ symbol, type: 'news', data });
      case 'technicals':
        data = await fetchTradingViewTechnicals(symbol);
        return NextResponse.json({ symbol, type: 'technicals', data });
      case 'components':
        data = await fetchTradingViewComponents(symbol);
        return NextResponse.json({ symbol, type: 'components', data });
      case 'seasonals':
        data = await fetchTradingViewSeasonals(symbol);
        return NextResponse.json({ symbol, type: 'seasonals', data });
      default:
        data = await fetchTradingViewIdeas(symbol);
        return NextResponse.json({ symbol, type: 'ideas', data });
    }
  } catch (error) {
    console.error('Error in TradingView ideas API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TradingView ideas' },
      { status: 500 }
    );
  }
}
