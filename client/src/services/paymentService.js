import API from './api';

export const getStripeConfig = async () => {
    const { data } = await API.get('/payments/config');
    return data;
};

export const createPaymentIntent = async (orderData) => {
    const { data } = await API.post('/payments/create-intent', orderData);
    return data;
};

export const confirmPayment = async (orderId, paymentIntentId) => {
    const { data } = await API.post('/payments/confirm', { orderId, paymentIntentId });
    return data;
};
