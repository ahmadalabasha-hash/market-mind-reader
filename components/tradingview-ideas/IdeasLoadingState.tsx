"use client";

export function IdeasLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-900/50"
        >
          {/* Header skeleton */}
          <div className="border-b border-zinc-700/50 bg-zinc-900/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="px-6 py-5 space-y-4">
            <div className="h-6 w-full bg-zinc-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="h-4 w-8 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-8 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="border-t border-zinc-700/50 bg-zinc-900/30 px-6 py-4">
            <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
