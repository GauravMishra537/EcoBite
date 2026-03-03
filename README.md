# 🍃 EcoBite

> **One-stop food & grocery delivery platform** — Order food, book tables, get groceries delivered, subscribe for free delivery, and support NGOs with leftover food sharing.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=flat-square)](#tech-stack)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-blueviolet?style=flat-square)](#features)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black?style=flat-square)](#features)

---

## ✨ Features

| Category | Features |
|---|---|
| 🍔 **Food Delivery** | Browse restaurants, order food, real-time delivery tracking |
| 🏭 **Cloud Kitchens** | Register & manage cloud-kitchen-only restaurants |
| 🛒 **Grocery Delivery** | Order groceries from multiple stores (Blinkit-style) |
| 🪑 **Table Booking** | Reserve tables & pre-order meals for dine-in |
| 💳 **Payments** | Stripe (cards) + Cash on Delivery |
| 📦 **Subscriptions** | Weekly pass with free delivery on all orders |
| 🤝 **NGO Food Sharing** | Restaurants share leftover food with NGOs at minimal cost (CSR) |
| 🤖 **AI Recommendations** | Personalized food suggestions powered by AI |
| 📍 **Live Tracking** | Real-time delivery partner location on map |
| 👨‍💼 **Admin Dashboard** | Analytics, user/restaurant management, order oversight |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), React Router v6, CSS Modules |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT + bcrypt |
| **Payments** | Stripe + Cash on Delivery |
| **Real-time** | Socket.IO |
| **Maps** | Leaflet.js |
| **AI** | OpenAI API |
| **Deployment** | Render |

---

## 📁 Project Structure

```
EcoBite/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route-level pages
│       ├── context/     # React Context providers
│       ├── hooks/       # Custom hooks
│       ├── services/    # API call functions
│       ├── utils/       # Helper functions
│       └── styles/      # Global CSS & design tokens
├── server/              # Express.js backend
│   ├── config/          # DB & env configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth & error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Business logic
│   └── socket/          # Socket.IO handlers
├── .env.example         # Environment variable template
├── package.json         # Root scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Stripe** account ([stripe.com](https://stripe.com)) — test keys are fine

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/EcoBite.git
cd EcoBite

# 2. Install all dependencies
npm run install:all

# 3. Set up environment variables
cp .env.example .env
# Then fill in your MongoDB URI, JWT secret, Stripe keys, etc.

# 4. Start development servers (backend + frontend)
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start both server & client in development mode |
| `npm run dev:server` | Start only the backend server |
| `npm run dev:client` | Start only the frontend client |
| `npm run build:client` | Build the React app for production |
| `npm start` | Start server in production mode |
| `npm run seed` | Seed the database with sample data |

---

## 🤝 Contributing

This is a college major project. Contributions, suggestions, and feedback are welcome!

---

## 📄 License

This project is licensed under the **MIT License**.
