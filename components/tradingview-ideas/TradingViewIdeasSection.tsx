"use client";

import { useState, useEffect } from "react";
import { TradingViewIdea, TradingViewNews, TradingViewTechnical, TradingViewComponent, TradingViewSeasonal } from "@/app/api/tradingview-ideas/route";
import { TradingViewIdeaCard } from "./TradingViewIdeaCard";
import { NewsCard } from "./NewsCard";
import { TechnicalsCard } from "./TechnicalsCard";
import { ComponentsCard } from "./ComponentsCard";
import { SeasonalsCard } from "./SeasonalsCard";
import { TickerSelector } from "./TickerSelector";
import { IdeasLoadingState } from "./IdeasLoadingState";

interface TradingViewIdeasSectionProps {
  userTier: string | undefined;
  isSuperAdmin?: boolean;
}

export function TradingViewIdeasSection({ userTier, isSuperAdmin = false }: TradingViewIdeasSectionProps) {
  const [selectedTicker, setSelectedTicker] = useState("SPX");
  const [activeTab, setActiveTab] = useState<'ideas' | 'news' | 'technicals' | 'components' | 'seasonals'>('ideas');
  const [ideas, setIdeas] = useState<TradingViewIdea[]>([]);
  const [news, setNews] = useState<TradingViewNews[]>([]);
  const [technicals, setTechnicals] = useState<TradingViewTechnical[]>([]);
  const [components, setComponents] = useState<TradingViewComponent[]>([]);
  const [seasonals, setSeasonals] = useState<TradingViewSeasonal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData(selectedTicker, activeTab);
  }, [selectedTicker, activeTab]);

  const fetchData = async (ticker: string, type: 'ideas' | 'news' | 'technicals' | 'components' | 'seasonals') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tradingview-ideas?symbol=${ticker}&type=${type}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }
      const data = await response.json();
      
      switch (type) {
        case 'ideas':
          setIdeas(data.data || []);
          break;
        case 'news':
          setNews(data.data || []);
          break;
        case 'technicals':
          setTechnicals(data.data || []);
          break;
        case 'components':
          setComponents(data.data || []);
          break;
        case 'seasonals':
          setSeasonals(data.data || []);
          break;
      }
    } catch (err) {
      console.error(`Error fetching TradingView ${activeTab}:`, err);
      setError(`Failed to load ${activeTab}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTickerChange = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  const handleTabChange = (tab: 'ideas' | 'news' | 'technicals' | 'components' | 'seasonals') => {
    setActiveTab(tab);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'ideas': return ideas;
      case 'news': return news;
      case 'technicals': return technicals;
      case 'components': return components;
      case 'seasonals': return seasonals;
    }
  };

  const getCurrentDataCount = () => getCurrentData().length;

  const renderCards = () => {
    switch (activeTab) {
      case 'ideas':
        return ideas.map((idea) => (
          <TradingViewIdeaCard key={idea.id} idea={idea} />
        ));
      case 'news':
        return news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ));
      case 'technicals':
        return technicals.map((tech) => (
          <TechnicalsCard key={tech.id} technical={tech} />
        ));
      case 'components':
        return components.map((comp) => (
          <ComponentsCard key={comp.symbol} component={comp} />
        ));
      case 'seasonals':
        return seasonals.map((sea) => (
          <SeasonalsCard key={`${sea.period}-${sea.symbol}`} seasonal={sea} />
        ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">TradingView Data</h2>
          <p className="text-sm text-zinc-400 mt-1">Community insights, news, and market analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-amber-400 font-medium">LIVE DATA</span>
        </div>
      </div>

      {/* Tabs and Ticker Selector */}
      <div className="space-y-4">
        {/* Data Type Tabs */}
        <div className="flex items-center gap-2 p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          {(['ideas', 'news', 'technicals', 'components', 'seasonals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Ticker Selector */}
        <div className="flex items-center justify-between">
          <TickerSelector selectedTicker={selectedTicker} onTickerChange={handleTickerChange} />
          <div className="text-xs text-zinc-500">
            {getCurrentDataCount() > 0 && `${getCurrentDataCount()} ${activeTab} loaded`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <IdeasLoadingState />
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
            <svg className="w-12 h-12 text-rose-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-rose-400 font-medium mb-2">Unable to load ideas</p>
            <p className="text-sm text-zinc-400">{error}</p>
            <button
              onClick={() => fetchData(selectedTicker, activeTab)}
              className="mt-4 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : ideas.length === 0 ? (
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-8 text-center">
            <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-zinc-400 font-medium mb-2">No ideas found</p>
            <p className="text-sm text-zinc-500">Check back later for the latest insights from the TradingView community.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            activeTab === 'technicals' || activeTab === 'seasonals'
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {renderCards()}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 px-6 py-4">
        <p className="text-xs text-zinc-500 text-center">
          Data is fetched in real-time from TradingView. Click on any item to view the full analysis on TradingView.
        </p>
      </div>
    </div>
  );
}
