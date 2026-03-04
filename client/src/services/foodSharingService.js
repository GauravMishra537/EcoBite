import API from './api';

export const getAvailableListings = async (params = {}) => {
    const { data } = await API.get('/food-sharing', { params });
    return data;
};

export const getListing = async (id) => {
    const { data } = await API.get(`/food-sharing/${id}`);
    return data;
};

export const claimServings = async (id, servings, ngoName = '') => {
    const { data } = await API.post(`/food-sharing/${id}/claim`, { servings, ngoName });
    return data;
};

export const getImpactStats = async () => {
    const { data } = await API.get('/food-sharing/stats');
    return data;
};
