import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email });
      setSessionId(response.data.sessionId);
      setUser(response.data);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSessionId(null);
    setEmail('');
  };

  if (!user) {
    return (
      <div
        data-theme={theme}
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-animated-gradient'
            : ''
        } p-6`}
        style={theme === 'light' ? { backgroundColor: '#f0fdf4' } : {}}
      >
        <div className="max-w-md w-full">
          <div
            className={`rounded-2xl shadow-2xl p-8 border ${
              theme === 'dark'
                ? 'bg-slate-900/75 backdrop-blur-md border-slate-800'
                : 'bg-white border-gray-200 shadow-lg'
            }`}
          >
            <div className="text-center mb-6">
              <h1 className={`text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Stock Broker Dashboard</h1>
              <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} mt-1`}>Secure client access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                <input
                  className={`mt-1 w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-white placeholder-slate-400 focus:ring-indigo-500'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 focus:ring-green-500'
                  }`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                />
              </div>

              {error && (
                <div className={`p-3 rounded ${theme === 'dark' ? 'bg-rose-900/60 text-rose-200' : 'bg-red-50 text-red-700'}`}>{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 font-semibold py-3 rounded-lg shadow-sm transition disabled:opacity-50 text-white"
                style={{
                  backgroundColor: theme === 'dark' ? '#4f46e5' : '#009E60'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme === 'dark' ? '#4338ca' : '#008050'}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme === 'dark' ? '#4f46e5' : '#009E60'}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-300/20">
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Theme:</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>

            <p className={`text-center text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} mt-4`}>By continuing you agree to the demo terms. This is a UI prototype.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      user={user}
      sessionId={sessionId}
      onLogout={handleLogout}
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}

export default App;
