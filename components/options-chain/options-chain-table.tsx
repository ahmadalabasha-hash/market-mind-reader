'use client';

import { useState } from 'react';

interface OptionContract {
  contractSymbol: string;
  strike: number;
  lastPrice: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  contractType: 'CALL' | 'PUT';
  expiration: string;
}

interface OptionsChainData {
  symbol: string;
  currentPrice: number;
  expirationDates: string[];
  calls: OptionContract[];
  puts: OptionContract[];
  lastUpdated: string;
}

interface OptionsChainTableProps {
  data: OptionsChainData;
  selectedExpiration: string;
  onOptionClick: (option: OptionContract) => void;
  selectedOption: OptionContract | null;
}

export default function OptionsChainTable({ data, selectedExpiration, onOptionClick, selectedOption }: OptionsChainTableProps) {
  const [filterITM, setFilterITM] = useState(false);

  // Filter options based on expiration and ITM status
  const filteredCalls = data.calls
    .filter(c => c.expiration === selectedExpiration)
    .filter(c => !filterITM || c.inTheMoney);
  
  const filteredPuts = data.puts
    .filter(p => p.expiration === selectedExpiration)
    .filter(p => !filterITM || p.inTheMoney);

  // Sort by strike price
  const sortedCalls = [...filteredCalls].sort((a, b) => a.strike - b.strike);
  const sortedPuts = [...filteredPuts].sort((a, b) => a.strike - b.strike);

  // Combine calls and puts by strike for display
  const strikeMap = new Map<number, { call?: OptionContract; put?: OptionContract }>();
  
  sortedCalls.forEach(call => {
    strikeMap.set(call.strike, { ...strikeMap.get(call.strike), call });
  });
  
  sortedPuts.forEach(put => {
    strikeMap.set(put.strike, { ...strikeMap.get(put.strike), put });
  });

  const strikes = Array.from(strikeMap.keys()).sort((a, b) => a - b);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getITMClass = (inTheMoney: boolean) => {
    return inTheMoney ? 'bg-blue-50' : 'bg-white';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Options Chain</h3>
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={filterITM}
            onChange={(e) => setFilterITM(e.target.checked)}
            className="rounded border-gray-300"
          />
          ITM only
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Strike</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Call Last</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Chg</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Bid</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Ask</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Vol</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">OI</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">IV</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">IV</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">OI</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Vol</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Ask</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Bid</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Chg</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">Put Last</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map((strike) => {
              const { call, put } = strikeMap.get(strike) || {};
              const isCallSelected = selectedOption?.contractSymbol === call?.contractSymbol;
              const isPutSelected = selectedOption?.contractSymbol === put?.contractSymbol;
              const isATM = Math.abs(strike - data.currentPrice) < data.currentPrice * 0.01;

              return (
                <tr
                  key={strike}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition ${isATM ? 'bg-yellow-50' : ''}`}
                >
                  <td className={`px-2 py-2 font-semibold text-center ${isATM ? 'text-yellow-700' : 'text-gray-900'}`}>
                    ${strike.toFixed(2)}
                  </td>
                  
                  {/* Call Data */}
                  <td
                    className={`px-2 py-2 cursor-pointer hover:bg-blue-100 transition ${getITMClass(call?.inTheMoney || false)} ${isCallSelected ? 'bg-blue-600 text-white' : 'text-gray-900'} text-right`}
                    onClick={() => call && onOptionClick(call)}
                  >
                    {call ? `$${call.lastPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-2 py-2 text-right ${getChangeColor(call?.change || 0)}`}>
                    {call ? `${call.change >= 0 ? '+' : ''}${call.change.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {call ? `$${call.bid.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {call ? `$${call.ask.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {call ? formatNumber(call.volume) : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {call ? formatNumber(call.openInterest) : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {call ? `${(call.impliedVolatility * 100).toFixed(1)}%` : '-'}
                  </td>
                  
                  {/* Put Data */}
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {put ? `${(put.impliedVolatility * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {put ? formatNumber(put.openInterest) : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {put ? formatNumber(put.volume) : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {put ? `$${put.ask.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-2 py-2 text-gray-600 text-right">
                    {put ? `$${put.bid.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-2 py-2 text-right ${getChangeColor(put?.change || 0)}`}>
                    {put ? `${put.change >= 0 ? '+' : ''}${put.change.toFixed(2)}` : '-'}
                  </td>
                  <td
                    className={`px-2 py-2 cursor-pointer hover:bg-blue-100 transition ${getITMClass(put?.inTheMoney || false)} ${isPutSelected ? 'bg-blue-600 text-white' : 'text-gray-900'} text-right`}
                    onClick={() => put && onOptionClick(put)}
                  >
                    {put ? `$${put.lastPrice.toFixed(2)}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {strikes.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No options data available
        </div>
      )}
    </div>
  );
}
