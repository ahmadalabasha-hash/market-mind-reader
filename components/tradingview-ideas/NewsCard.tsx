"use client";

import { TradingViewNews } from "@/app/api/tradingview-ideas/route";

interface NewsCardProps {
  news: TradingViewNews;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20">
      {/* Header */}
      <div className="border-b border-zinc-700/50 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">{news.source}</div>
              <div className="text-xs text-zinc-500">{news.timestamp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-100 leading-tight">
          {news.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
          {news.description}
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-700/50 bg-zinc-900/30 px-6 py-4">
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          Read full article
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
