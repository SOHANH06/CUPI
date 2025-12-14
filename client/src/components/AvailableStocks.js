import React from 'react';
import AnimatedNumber from './AnimatedNumber';

function AvailableStocks({ stock, price, onSubscribe, changed, theme }) {
  if (!price) {
    return (
      <div className={`rounded-xl p-6 border animate-pulse ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`h-6 rounded w-24 mb-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
        <div className={`h-8 rounded w-32 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
      </div>
    );
  }

  const isPositive = price.change >= 0;

  return (
    <div className={`rounded-xl p-6 transition ${changed ? 'price-glow' : ''} ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border`}> 
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{stock}</h3>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Current Price</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-extrabold">
          $<AnimatedNumber value={price.price} format={(v) => v.toFixed(2)} />
        </p>
        <p className={`text-md font-semibold mt-2 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? '↑ ' : '↓ '}
          <AnimatedNumber value={Math.abs(price.change)} format={(v) => v.toFixed(2)} />
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}> ({price.changePercent.toFixed(2)}%)</span>
        </p>
      </div>

      <button
        onClick={() => onSubscribe(stock)}
        className="w-full text-white font-bold py-2 rounded-lg transition"
        style={{ backgroundColor: '#009E60' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#008050'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#009E60'}
      >
        Subscribe
      </button>
    </div>
  );
}

export default AvailableStocks;
