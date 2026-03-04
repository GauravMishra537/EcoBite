/**
 * Socket.IO server setup.
 * Attaches to the existing HTTP server and manages real-time events.
 */
const { Server } = require('socket.io');
const env = require('./config/env');

let io = null;

/**
 * Initialize Socket.IO on the given HTTP server.
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin:
                env.NODE_ENV === 'production'
                    ? true
                    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Join a user-specific room (for private order updates)
        socket.on('join:user', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`  └─ User ${userId} joined room user:${userId}`);
            }
        });

        // Join an order-specific room (for tracking a specific order)
        socket.on('join:order', (orderId) => {
            if (orderId) {
                socket.join(`order:${orderId}`);
                console.log(`  └─ Joined order room order:${orderId}`);
            }
        });

        // Leave an order room
        socket.on('leave:order', (orderId) => {
            if (orderId) {
                socket.leave(`order:${orderId}`);
            }
        });

        // Join a restaurant room (for restaurant owners)
        socket.on('join:restaurant', (restaurantId) => {
            if (restaurantId) {
                socket.join(`restaurant:${restaurantId}`);
                console.log(`  └─ Joined restaurant room restaurant:${restaurantId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Get the Socket.IO instance. Must be called after initSocket().
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
    }
    return io;
};

/**
 * Emit an order status update to relevant rooms.
 */
const emitOrderUpdate = (order) => {
    if (!io) return;

    const payload = {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt || new Date(),
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason,
    };

    // Emit to the specific order room
    io.to(`order:${order._id}`).emit('order:statusUpdate', payload);

    // Emit to the user who owns the order
    io.to(`user:${order.user}`).emit('order:statusUpdate', payload);

    // Emit to the restaurant owner
    if (order.restaurant) {
        io.to(`restaurant:${order.restaurant}`).emit('order:statusUpdate', payload);
    }
};

/**
 * Emit a new order notification to a restaurant.
 */
const emitNewOrder = (order) => {
    if (!io) return;

    io.to(`restaurant:${order.restaurant}`).emit('order:new', {
        orderId: order._id,
        total: order.total,
        itemCount: order.items?.length || 0,
        createdAt: order.createdAt,
    });
};

module.exports = { initSocket, getIO, emitOrderUpdate, emitNewOrder };
