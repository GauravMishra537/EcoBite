const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const cloudKitchenRoutes = require('./routes/cloudKitchen');
const subscriptionRoutes = require('./routes/subscriptions');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ─── Security Middleware ─────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
}));

// ─── CORS ────────────────────────────────────────────────
app.use(cors({
    origin: env.NODE_ENV === 'production'
        ? true // same origin in production (server serves client)
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));

// ─── Body Parsers ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── API Routes ──────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cloud-kitchen', cloudKitchenRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// ─── Serve Client in Production ──────────────────────────
if (env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientBuildPath));

    // Any route that is not an API route serves the React app
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(clientBuildPath, 'index.html'));
    });
}

// ─── Error Handler (must be last) ────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
const PORT = env.PORT;

const { initSocket } = require('./socket');

const server = app.listen(PORT, () => {
    console.log(`🚀 EcoBite server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Attach Socket.IO to the HTTP server
initSocket(server);
console.log('🔌 Socket.IO attached to server');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = app;
