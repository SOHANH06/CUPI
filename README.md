# Stock Broker Dashboard

A real-time stock broker dashboard application built with React, Tailwind CSS, Node.js, and WebSocket.

## Features

- *User Login*: Email-based login system
- *Stock Subscriptions*: Subscribe/unsubscribe from supported stocks (GOOG, TSLA, AMZN, META, NVDA)
- *Real-time Price Updates*: Live price updates via WebSocket every second
- *Multi-user Support*: Multiple users can have independent dashboards with different subscriptions
- *Asynchronous Updates*: All price updates are sent asynchronously to connected clients

## Technologies Used

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, WebSocket (ws), CORS
- **Development**: react-scripts, nodemon


## Project Structure

```
stock-broker-dashboard/
├── server/                 # Backend (Node.js/Express)
│   ├── server.js          # Main server with WebSocket
│   └── package.json       # Server dependencies
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── App.js         # Main app component with login
│   │   ├── components/
│   │   │   ├── Dashboard.js      # Dashboard component
│   │   │   ├── StockCard.js      # Subscribed stock card
│   │   │   └── AvailableStocks.js # Available stock card
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Tailwind styles
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
npm install
```

2. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

1. **Login**: Enter your email address and click "Login"
2. **Subscribe**: Click "Subscribe" on any available stock to add it to your dashboard
3. **View Prices**: Watch real-time price updates every second
4. **Unsubscribe**: Click "Unsubscribe" to remove a stock from your dashboard
5. **Logout**: Click "Logout" to exit the application

## How It Works

### Backend Flow
1. User logs in with email → Server creates session
2. User subscribes/unsubscribes → Server stores subscription
3. WebSocket connection established → Server authenticates user
4. Every second: Server updates all stock prices with random changes
5. Server broadcasts prices to each user (only for subscribed stocks)

### Frontend Flow
1. User logs in → Session ID created
2. WebSocket connection established → Subscribe to price updates
3. Receive `PRICE_UPDATE` messages every second
4. DOM updates with new prices in real-time
5. No page refresh needed
