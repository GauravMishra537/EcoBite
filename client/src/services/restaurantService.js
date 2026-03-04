import API from './api';

/**
 * Get all restaurants with optional filters
 */
export const getRestaurants = async (params = {}) => {
    const { data } = await API.get('/restaurants', { params });
    return data;
};

/**
 * Get single restaurant with its menu
 */
export const getRestaurant = async (id) => {
    const { data } = await API.get(`/restaurants/${id}`);
    return data;
};

/**
 * Get menu items for a restaurant
 */
export const getMenuItems = async (restaurantId, params = {}) => {
    const { data } = await API.get(`/restaurants/${restaurantId}/menu`, { params });
    return data;
};
