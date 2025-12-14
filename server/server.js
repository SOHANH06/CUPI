const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Persistent storage file
const STORAGE_FILE = path.join(__dirname, 'user_data.json');

// In-memory storage
const users = new Map(); // { email -> { id, email, subscriptions: Set } }
const clients = new Map(); // { userId -> Set of WebSocket connections }
const activeSessions = new Map(); // { sessionId -> userId }

// Load user data from file
function loadUserData() {
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
      data.forEach(user => {
        users.set(user.email, {
          id: user.id,
          email: user.email,
          subscriptions: new Set(user.subscriptions)
        });
      });
      console.log('User data loaded from file');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }
}

// Save user data to file
function saveUserData() {
  try {
    const data = Array.from(users.values()).map(user => ({
      id: user.id,
      email: user.email,
      subscriptions: Array.from(user.subscriptions)
    }));
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Load data on startup
loadUserData();

// Supported stocks
const SUPPORTED_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
const stockPrices = new Map();

// Initialize stock prices
SUPPORTED_STOCKS.forEach(stock => {
  stockPrices.set(stock, {
    price: parseFloat((Math.random() * 300 + 50).toFixed(2)),
    change: 0,
    changePercent: 0
  });
});

// Update stock prices every second
setInterval(() => {
  SUPPORTED_STOCKS.forEach(stock => {
    const current = stockPrices.get(stock);
    const changePercent = (Math.random() - 0.5) * 0.02;
    const newPrice = current.price * (1 + changePercent);
    const priceChange = newPrice - current.price;
    
    stockPrices.set(stock, {
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(priceChange.toFixed(2)),
      changePercent: parseFloat((changePercent * 100).toFixed(2))
    });
  });

  // Broadcast to all connected clients
  broadcastPrices();
}, 1000);

// Broadcast prices to all connected users
function broadcastPrices() {
  clients.forEach((connections, userId) => {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user || user.subscriptions.size === 0) return;

    const subscribedPrices = {};
    user.subscriptions.forEach(stock => {
      subscribedPrices[stock] = stockPrices.get(stock);
    });

    const message = JSON.stringify({
      type: 'PRICE_UPDATE',
      data: subscribedPrices,
      timestamp: new Date().toISOString()
    });

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'AUTH') {
        const sessionId = data.sessionId;
        if (activeSessions.has(sessionId)) {
          userId = activeSessions.get(sessionId);

          if (!clients.has(userId)) {
            clients.set(userId, new Set());
          }
          clients.get(userId).add(ws);

          // Send current prices for subscribed stocks
          const user = Array.from(users.values()).find(u => u.id === userId);
          if (user && user.subscriptions.size > 0) {
            const subscribedPrices = {};
            user.subscriptions.forEach(stock => {
              subscribedPrices[stock] = stockPrices.get(stock);
            });

            ws.send(JSON.stringify({
              type: 'INITIAL_PRICES',
              data: subscribedPrices
            }));
          }

          ws.send(JSON.stringify({
            type: 'AUTH_SUCCESS',
            userId
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'AUTH_FAILED',
            error: 'Invalid session'
          }));
          ws.close();
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (userId && clients.has(userId)) {
      clients.get(userId).delete(ws);
      if (clients.get(userId).size === 0) {
        clients.delete(userId);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// REST Endpoints

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  let user = Array.from(users.values()).find(u => u.email === email);

  if (!user) {
    user = {
      id: uuidv4(),
      email,
      subscriptions: new Set()
    };
    users.set(email, user);
  }

  const sessionId = uuidv4();
  activeSessions.set(sessionId, user.id);

  res.json({
    success: true,
    sessionId,
    userId: user.id,
    email: user.email
  });
});

// Get supported stocks
app.get('/api/stocks', (req, res) => {
  res.json({
    stocks: SUPPORTED_STOCKS,
    prices: Array.from(stockPrices.entries()).reduce((acc, [stock, price]) => {
      acc[stock] = price;
      return acc;
    }, {})
  });
});

// Subscribe to stock
app.post('/api/subscribe', (req, res) => {
  const { sessionId, stock } = req.body;

  if (!activeSessions.has(sessionId)) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  if (!SUPPORTED_STOCKS.includes(stock)) {
    return res.status(400).json({ error: 'Unsupported stock' });
  }

  const userId = activeSessions.get(sessionId);
  const user = Array.from(users.values()).find(u => u.id === userId);

  if (user) {
    user.subscriptions.add(stock);
    saveUserData(); // Save to file

    // Notify all connected clients for this user about subscription change
    if (clients.has(userId)) {
      const message = JSON.stringify({
        type: 'SUBSCRIPTION_UPDATE',
        subscriptions: Array.from(user.subscriptions)
      });

      clients.get(userId).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }

    res.json({
      success: true,
      subscriptions: Array.from(user.subscriptions)
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Unsubscribe from stock
app.post('/api/unsubscribe', (req, res) => {
  const { sessionId, stock } = req.body;

  if (!activeSessions.has(sessionId)) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const userId = activeSessions.get(sessionId);
  const user = Array.from(users.values()).find(u => u.id === userId);

  if (user) {
    user.subscriptions.delete(stock);
    saveUserData(); // Save to file

    // Notify all connected clients for this user about subscription change
    if (clients.has(userId)) {
      const message = JSON.stringify({
        type: 'SUBSCRIPTION_UPDATE',
        subscriptions: Array.from(user.subscriptions)
      });

      clients.get(userId).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }

    res.json({
      success: true,
      subscriptions: Array.from(user.subscriptions)
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Get user subscriptions
app.get('/api/subscriptions/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (!activeSessions.has(sessionId)) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const userId = activeSessions.get(sessionId);
  const user = Array.from(users.values()).find(u => u.id === userId);

  if (user) {
    res.json({
      subscriptions: Array.from(user.subscriptions)
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
