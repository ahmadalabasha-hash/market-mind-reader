export type OptionsContract = {
  symbol: string;
  name: string;
  impliedVolatility: number;
  ivRank1y: number;
  optionType: "call" | "put";
  strikePrice: number;
  expirationDate: string;
  volume: number;
  openInterest: number;
  lastPrice: number;
  bid: number;
  ask: number;
};

const mockSymbols = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "QQQ", name: "Invesco QQQ ETF" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF" },
  { symbol: "GLD", name: "SPDR Gold Shares" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury ETF" },
  { symbol: "XLF", name: "Financial Select Sector ETF" },
  { symbol: "XLE", name: "Energy Select Sector ETF" },
  { symbol: "XLV", name: "Health Care Select Sector ETF" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
];

function generateMockContract(symbol: string, name: string, index: number): OptionsContract {
  const baseIV = 0.15 + Math.random() * 0.5;
  const ivRank = Math.floor(Math.random() * 100);
  
  return {
    symbol,
    name,
    impliedVolatility: parseFloat(baseIV.toFixed(4)),
    ivRank1y: ivRank,
    optionType: Math.random() > 0.5 ? "call" : "put",
    strikePrice: 100 + Math.floor(Math.random() * 50),
    expirationDate: new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    volume: Math.floor(Math.random() * 50000) + 1000,
    openInterest: Math.floor(Math.random() * 100000) + 10000,
    lastPrice: parseFloat((Math.random() * 10).toFixed(2)),
    bid: parseFloat((Math.random() * 8).toFixed(2)),
    ask: parseFloat((Math.random() * 12).toFixed(2)),
  };
}

export function generateMockOptionsData(): OptionsContract[] {
  const contracts: OptionsContract[] = [];
  
  mockSymbols.forEach((item, idx) => {
    for (let i = 0; i < 3; i++) {
      contracts.push(generateMockContract(item.symbol, item.name, idx * 3 + i));
    }
  });

  return contracts.sort((a, b) => b.ivRank1y - a.ivRank1y);
}
