"use client";

import { useEffect, useRef, useState } from "react";
import { GammaLevelsOverlay } from "./gamma-levels-overlay";

const STUDY_FORMATS = ["PUB;Wtxy5arU", "Wtxy5arU", "SCRIPT:Wtxy5arU"] as const;

type StudyFormat = (typeof STUDY_FORMATS)[number];

const BASE_CHART_CONFIG = {
  width: "100%",
  height: "100%",
  locale: "en",
  interval: "60",
  colorTheme: "dark",
  isTransparent: true,
  autosize: true,
  hide_side_toolbar: false,
  allow_symbol_change: true,
  support_host: "https://www.tradingview.com",
} as const;

const cleanTradingViewSymbol = (symbol: string) =>
  symbol.split(":").pop()?.toUpperCase() ?? symbol.toUpperCase();

function createWidgetScript(config: Record<string, unknown>) {
  const script = document.createElement("script");
  script.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;
  script.type = "text/javascript";
  script.innerHTML = JSON.stringify(config);
  return script;
}

const FULL_CHART_STUDY = "PUB;Wtxy5arU";

interface AdvancedChartProps {
  symbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export function AdvancedChart({ symbol, onSymbolChange }: AdvancedChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const retryTimer = useRef<number | null>(null);
  const currentSymbol = symbol;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let activeScript: HTMLScriptElement | null = null;
    let isUnmounted = false;

    const cleanup = () => {
      if (retryTimer.current !== null) {
        window.clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      if (container) {
        container.replaceChildren();
      }
      activeScript = null;
    };

    const parseSymbolFromIframe = () => {
      const iframe = container.querySelector("iframe");
      if (!iframe) return;
      const src = iframe.getAttribute("src") ?? "";
      try {
        const url = new URL(src, window.location.href);
        let symbol = url.searchParams.get("symbol") ?? url.searchParams.get("chartSymbol");

        if (!symbol && url.hash) {
          const hash = decodeURIComponent(url.hash.slice(1));
          try {
            const payload = JSON.parse(hash);
            if (payload?.symbol) {
              symbol = payload.symbol;
            }
          } catch {
            // ignore non-JSON hash values
          }
        }

        if (symbol) {
          onSymbolChange?.(cleanTradingViewSymbol(symbol));
        }
      } catch {
        // ignore invalid URLs
      }
    };

    const hasStudyInIframe = (study: StudyFormat) => {
      const iframe = container.querySelector("iframe");
      if (!iframe) return false;
      const src = iframe.getAttribute("src") ?? "";
      const encodedStudy = encodeURIComponent(study);
      return src.includes(encodedStudy) || src.includes("studies=") || src.includes("SCRIPT:");
    };

    const createChart = (study?: StudyFormat) => {
      cleanup();
      const config = study
        ? { ...BASE_CHART_CONFIG, symbol, studies: [study] }
        : { ...BASE_CHART_CONFIG, symbol };
      const script = createWidgetScript(config);
      activeScript = script;
      container.appendChild(script);
      return script;
    };

    const attemptStudy = (index = 0) => {
      if (isUnmounted) return;
      if (index >= STUDY_FORMATS.length) {
        setFallbackMessage(
          "The public TradingView indicator could not be loaded automatically. The chart remains functional without it.",
        );
        createChart();
        retryTimer.current = window.setTimeout(parseSymbolFromIframe, 1200);
        return;
      }

      const study = STUDY_FORMATS[index];
      const script = createChart(study);

      script.onerror = () => {
        if (isUnmounted) return;
        attemptStudy(index + 1);
      };

      script.onload = () => {
        retryTimer.current = window.setTimeout(() => {
          if (isUnmounted) return;
          if (!hasStudyInIframe(study)) {
            attemptStudy(index + 1);
          }
          parseSymbolFromIframe();
        }, 1200);
      };
    };

    const symbolPoll = window.setInterval(parseSymbolFromIframe, 2500);
    attemptStudy();

    return () => {
      isUnmounted = true;
      cleanup();
      window.clearInterval(symbolPoll);
    };
  }, [symbol, onSymbolChange]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('tradingview.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'symbolChanged' || data.symbol || data.newSymbol) {
          const newSymbol = data.symbol || data.newSymbol;
          if (newSymbol && typeof newSymbol === 'string') {
            onSymbolChange?.(cleanTradingViewSymbol(newSymbol));
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSymbolChange]);

  const fullChartUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(
    symbol,
  )}&theme=dark&study=${encodeURIComponent(FULL_CHART_STUDY)}`;

  return (
    <div className="tradingview-widget-container h-full w-full">
      <div className="flex items-center justify-end gap-3 px-4 py-3 sm:px-5">
        <a
          href={fullChartUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          Open Full Chart
        </a>
      </div>
      <div
        ref={ref}
        className="tradingview-widget-container__widget h-[calc(100%-56px)] w-full"
      />
      {fallbackMessage ? (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
          {fallbackMessage}
        </div>
      ) : null}
    </div>
  );
}

export function TradingViewSection() {
  const [chartSymbol, setChartSymbol] = useState("QQQ");

  return (
    <section
      id="charts"
      className="border-b border-[var(--border)] bg-[var(--surface)]/40"
      aria-labelledby="charts-heading"
    >
      <GammaLevelsOverlay theme="midnight" symbol={chartSymbol} onSymbolChange={setChartSymbol} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Live market data
            </p>
            <h2
              id="charts-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
            >
              TradingView Advanced Chart
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              All displayed pricing comes directly from TradingView. Use the
              chart symbol search to switch instruments.
            </p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-500">
              Data by{" "}
              <a
                href="https://www.tradingview.com/"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="text-zinc-400 underline-offset-4 hover:text-zinc-300 hover:underline"
              >
                TradingView
              </a>
              .
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Single source of truth
          </p>
        </div>

        <div
          className="h-[65vh] min-h-[520px] w-full rounded-xl border border-[var(--border)] bg-[#0f1218] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] lg:h-[72vh] lg:min-h-[620px]"
          style={{
            opacity: 0,
            animation: "fade-in-up 0.65s ease-out forwards",
            animationDelay: "120ms",
          }}
        >
          <AdvancedChart symbol={chartSymbol} onSymbolChange={setChartSymbol} />
        </div>
      </div>
    </section>
  );
}
