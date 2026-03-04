import API from './api';

export const placeOrder = async (orderData) => {
    const { data } = await API.post('/orders', orderData);
    return data;
};

export const getMyOrders = async (params = {}) => {
    const { data } = await API.get('/orders', { params });
    return data;
};

export const getOrder = async (id) => {
    const { data } = await API.get(`/orders/${id}`);
    return data;
};

export const cancelOrder = async (id, reason = '') => {
    const { data } = await API.put(`/orders/${id}/cancel`, { reason });
    return data;
};
