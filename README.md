# 🚀 SangamBonds

Welcome to **SangamBonds**, a cutting-edge digital platform democratizing India's corporate bond market through **fractional trading**!

---

## 🌟 Features

* 💰 **Fractional ownership** of high-value corporate bonds (₹15 lakh+) available in affordable units (\~₹1,000)
* 📊 **Real-time order book** with live bids, asks, and spreads
* ⚡ **Instant matching engine** for quick trade execution & wallet updates
* 📁 **Comprehensive portfolio management** & analytics dashboard
* 🔐 **Secure authentication** with JWT & KYC compliance
* 🔄 **Live market & portfolio updates** via WebSocket support
* 🎁 **Referral program** and **blockchain integration roadmap**

---

## 📂 Project Structure

```
SangamBonds/
├── .gitignore
├── backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── bondController.js
│   ├── orderController.js
│   └── portfolioController.js
├── data/
│   └── sampleData.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── Bond.js
│   ├── Order.js
│   ├── Transaction.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── bonds.js
│   ├── orders.js
│   ├── portfolio.js
│   └── users.js
├── utils/
│   ├── logger.js
│   ├── matchingEngine.js
│   └── priceCalculator.js
├── server.js
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── logo.png
│   │   └── manifest.json
│   └── src/
│       ├── App.jsx
│       ├── components/
│       ├── common/
│       │   ├── ErrorBoundary.jsx
│       │   ├── LoadingSpinner.jsx
│       │   └── ProtectedRoute.jsx
│       ├── layout/
│       │   ├── Navbar.jsx
│       │   └── Sidebar.jsx
│       ├── trading/
│       │   ├── OrderBook.jsx
│       │   ├── OrderForm.jsx
│       │   └── TradingChart.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── WebSocketContext.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── pages/
│       │   ├── BondMarket.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Portfolio.jsx
│       │   ├── Profile.jsx
│       │   └── Trading.jsx
│       ├── services/
│       │   └── api.js
│       ├── styles/
│       │   └── globals.css
│       └── utils/
│           └── constants.js
├── package.json
└── package-lock.json
```

---

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/sangambonds.git
   cd sangambonds
   ```

2. **Setup environment variables**

   * Configure `.env` in both `backend` and `frontend` with API keys, database URLs, and JWT secrets.

3. **Run backend server**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Run frontend client**

   ```bash
   cd frontend
   npm install
   npm start
   ```

---
