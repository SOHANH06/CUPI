import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import StockCard from './StockCard';
import AvailableStocks from './AvailableStocks';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

function Dashboard({ user, sessionId, onLogout, theme, onThemeChange }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [prices, setPrices] = useState({});
  const [allStocks, setAllStocks] = useState(DEFAULT_STOCKS);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const changedRef = useRef({});
  const [, forceTick] = useState(0);

  // Initialize prices and subscriptions per user session
  useEffect(() => {
    // Fetch existing subscriptions from server
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/subscriptions/${sessionId}`);
        setSubscriptions(response.data.subscriptions || []);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    // Initialize prices randomly for demo
    const initial = {};
    allStocks.forEach((s) => {
      const p = 100 + Math.random() * 200; // base price
      initial[s] = {
        price: p,
        change: 0,
        changePercent: 0,
      };
    });
    setPrices(initial);

    // Fetch subscriptions for this session
    fetchSubscriptions();

    // small timeout to show skeletons
    const t = setTimeout(() => setLoading(false), 300);

    // Simulate a connected real-time feed
    setConnected(true);

    const iv = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        allStocks.forEach((s) => {
          const prevPrice = prev[s]?.price ?? 100;
          // random delta -1%..1%
          const pct = (Math.random() - 0.48) * 0.012;
          const newPrice = Math.max(1, prevPrice * (1 + pct));
          const change = newPrice - prevPrice;
          const changePercent = (change / prevPrice) * 100;
          next[s] = {
            price: newPrice,
            change,
            changePercent,
          };
          // mark as changed to trigger glow
          changedRef.current[s] = (changedRef.current[s] || 0) + 1;
          setTimeout(() => {
            changedRef.current[s] = Math.max(0, (changedRef.current[s] || 1) - 1);
            forceTick((t) => t + 1);
          }, 700);
        });
        forceTick((t) => t + 1);
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [allStocks, sessionId]);

  const handleSubscribe = async (stock) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscribe`, { sessionId, stock });
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error subscribing to stock:', error);
    }
  };

  const handleUnsubscribe = async (stock) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/unsubscribe`, { sessionId, stock });
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error unsubscribing from stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-lg text-slate-400">Preparing your dashboard…</div>
      </div>
    );
  }

  const unsubscribedStocks = allStocks.filter((stock) => !subscriptions.includes(stock));

  return (
    <div data-theme={theme} className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-white text-gray-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'} backdrop-blur sticky top-0 z-20 border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold">Stock Broker Dashboard</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Data-first demo</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`live-dot ${connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>{connected ? 'Live' : 'Offline'}</span>
              </div>
              <div className={`text-sm px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-slate-800/40 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{user?.email}</div>
              
              <button
                onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                className={`px-2 py-1 rounded text-sm font-medium transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <button onClick={onLogout} className={`${theme === 'dark' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-red-600 hover:bg-red-700'} text-white px-3 py-1 rounded-md`}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Subscription Panel */}
        <section className="mb-8">
          <div className={`rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <h2 className="text-lg font-bold">Stock Subscriptions</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Choose stocks to follow in real-time</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {allStocks.map((s) => {
                const subscribed = subscriptions.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => (subscribed ? handleUnsubscribe(s) : handleSubscribe(s))}
                    style={{
                      backgroundColor: subscribed ? '#009E60' : (theme === 'dark' ? '#1e293b' : '#f1f5f9'),
                      color: subscribed ? 'white' : (theme === 'dark' ? '#cbd5e1' : '#475569')
                    }}
                    className="px-3 py-1 rounded-full text-sm font-medium transition hover:opacity-80"
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live cards grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.length === 0 ? (
            <div className={`col-span-full rounded-xl p-8 text-center ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-gray-50 text-gray-500'}`}>No subscriptions yet. Pick a stock above.</div>
          ) : (
            subscriptions.map((stock) => (
              <StockCard
                key={stock}
                stock={stock}
                price={prices[stock]}
                onUnsubscribe={handleUnsubscribe}
                changed={!!changedRef.current[stock]}
                theme={theme}
              />
            ))
          )}
        </section>

        {/* Available stocks */}
        {unsubscribedStocks.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-bold mb-4">Available Stocks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unsubscribedStocks.map((stock) => (
                <AvailableStocks
                  key={stock}
                  stock={stock}
                  price={prices[stock]}
                  onSubscribe={handleSubscribe}
                  changed={!!changedRef.current[stock]}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
