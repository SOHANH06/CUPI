import React from 'react';
import AnimatedNumber from './AnimatedNumber';

function StockCard({ stock, price, onUnsubscribe, changed, theme }) {
  if (!price) {
    return (
      <div className={`rounded-xl p-6 border animate-pulse ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`h-6 rounded w-32 mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
        <div className={`h-10 rounded w-40 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
      </div>
    );
  }

  const isPositive = price.change >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className={`rounded-xl p-6 transition-transform ${changed ? 'price-glow' : ''} ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border`}> 
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{stock}</h3>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Real-time</p>
        </div>
        <button
          onClick={() => onUnsubscribe(stock)}
          className={`text-white px-3 py-1 rounded text-sm font-medium transition ${theme === 'dark' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Unsubscribe
        </button>
      </div>

      <div className="mb-4">
        <p className="text-4xl font-extrabold">
          $<AnimatedNumber value={price.price} format={(v) => v.toFixed(2)} />
        </p>
        <p className={`text-lg font-semibold mt-2 ${changeColor}`}>
          {isPositive ? '↑ ' : '↓ '}
          <AnimatedNumber value={Math.abs(price.change)} format={(v) => v.toFixed(2)} />
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}> ({price.changePercent.toFixed(2)}%)</span>
        </p>
      </div>

      <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default StockCard;
