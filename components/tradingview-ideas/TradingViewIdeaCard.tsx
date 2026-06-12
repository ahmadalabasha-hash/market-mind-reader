"use client";

import { TradingViewIdea } from "@/app/api/tradingview-ideas/route";

interface TradingViewIdeaCardProps {
  idea: TradingViewIdea;
}

export function TradingViewIdeaCard({ idea }: TradingViewIdeaCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20">
      {/* Header with symbol and author */}
      <div className="border-b border-zinc-700/50 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <span className="text-lg font-bold text-blue-300">{idea.symbol}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">{idea.author.name}</div>
              <div className="text-xs text-zinc-500">@{idea.author.username}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Posted</div>
            <div className="text-sm text-zinc-400">{idea.timestamp}</div>
          </div>
        </div>
      </div>

      {/* Idea content */}
      <div className="px-6 py-5 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-100 leading-tight">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
          {idea.description}
        </p>

        {/* Engagement metrics */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm text-zinc-400">{idea.likes}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm text-zinc-400">{idea.comments}</span>
          </div>
        </div>
      </div>

      {/* Footer with view button */}
      <div className="border-t border-zinc-700/50 bg-zinc-900/30 px-6 py-4">
        <a
          href={idea.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          View on TradingView
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
