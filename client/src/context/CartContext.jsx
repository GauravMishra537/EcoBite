import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data.cart);
        } catch {
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addItem = async (menuItemId, quantity = 1) => {
        try {
            const data = await cartService.addToCart(menuItemId, quantity);
            setCart(data.cart);
            toast.success('Added to cart!');
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to add item';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    const updateItem = async (itemId, quantity) => {
        try {
            const data = await cartService.updateCartItem(itemId, quantity);
            setCart(data.cart);
            return { success: true };
        } catch (err) {
            toast.error('Failed to update quantity');
            return { success: false };
        }
    };

    const removeItem = async (itemId) => {
        try {
            const data = await cartService.removeCartItem(itemId);
            setCart(data.cart);
            toast.success('Item removed');
            return { success: true };
        } catch {
            toast.error('Failed to remove item');
            return { success: false };
        }
    };

    const clearAll = async () => {
        try {
            const data = await cartService.clearCart();
            setCart(data.cart);
            toast.success('Cart cleared');
            return { success: true };
        } catch {
            toast.error('Failed to clear cart');
            return { success: false };
        }
    };

    const totalItems = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
    const subtotal = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

    const value = {
        cart,
        loading,
        totalItems,
        subtotal,
        addItem,
        updateItem,
        removeItem,
        clearAll,
        fetchCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
