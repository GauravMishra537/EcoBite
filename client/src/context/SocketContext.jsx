import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect if not authenticated
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Connect to the server
        const serverUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000';

        const newSocket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            // Join user-specific room
            newSocket.emit('join:user', user._id);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user?._id]);

    // Helper to join an order room for tracking
    const joinOrderRoom = (orderId) => {
        if (socket && orderId) {
            socket.emit('join:order', orderId);
        }
    };

    // Helper to leave an order room
    const leaveOrderRoom = (orderId) => {
        if (socket && orderId) {
            socket.emit('leave:order', orderId);
        }
    };

    // Helper to join a restaurant room
    const joinRestaurantRoom = (restaurantId) => {
        if (socket && restaurantId) {
            socket.emit('join:restaurant', restaurantId);
        }
    };

    const value = {
        socket,
        isConnected,
        joinOrderRoom,
        leaveOrderRoom,
        joinRestaurantRoom,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};

export default SocketContext;
