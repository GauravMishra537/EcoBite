import API from './api';

export const getPlans = async () => {
    const { data } = await API.get('/subscriptions/plans');
    return data;
};

export const subscribe = async (plan, paymentMethod = 'online') => {
    const { data } = await API.post('/subscriptions/subscribe', { plan, paymentMethod });
    return data;
};

export const getMySubscription = async () => {
    const { data } = await API.get('/subscriptions/my');
    return data;
};

export const cancelSubscription = async (reason = '') => {
    const { data } = await API.put('/subscriptions/cancel', { reason });
    return data;
};

export const checkFreeDelivery = async () => {
    const { data } = await API.get('/subscriptions/check-delivery');
    return data;
};

export const getSubscriptionHistory = async () => {
    const { data } = await API.get('/subscriptions/history');
    return data;
};
