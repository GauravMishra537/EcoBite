import API from './api';

export const getCart = async () => {
    const { data } = await API.get('/cart');
    return data;
};

export const addToCart = async (menuItemId, quantity = 1) => {
    const { data } = await API.post('/cart/add', { menuItemId, quantity });
    return data;
};

export const updateCartItem = async (itemId, quantity) => {
    const { data } = await API.put(`/cart/item/${itemId}`, { quantity });
    return data;
};

export const removeCartItem = async (itemId) => {
    const { data } = await API.delete(`/cart/item/${itemId}`);
    return data;
};

export const clearCart = async () => {
    const { data } = await API.delete('/cart');
    return data;
};
