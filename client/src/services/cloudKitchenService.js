import API from './api';

export const registerCloudKitchen = async (data) => {
    const { data: res } = await API.post('/cloud-kitchen/register', data);
    return res;
};

export const getDashboard = async () => {
    const { data } = await API.get('/cloud-kitchen/dashboard');
    return data;
};

export const getKitchenOrders = async (params = {}) => {
    const { data } = await API.get('/cloud-kitchen/orders', { params });
    return data;
};

export const updateKitchen = async (updates) => {
    const { data } = await API.put('/cloud-kitchen/update', updates);
    return data;
};

export const toggleKitchenStatus = async () => {
    const { data } = await API.put('/cloud-kitchen/toggle-status');
    return data;
};

export const getKitchenMenu = async () => {
    const { data } = await API.get('/cloud-kitchen/menu');
    return data;
};

export const addKitchenMenuItem = async (item) => {
    const { data } = await API.post('/cloud-kitchen/menu', item);
    return data;
};
