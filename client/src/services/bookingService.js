import API from './api';

export const getAvailableSlots = async (restaurantId, date) => {
    const { data } = await API.get(`/bookings/slots/${restaurantId}`, { params: { date } });
    return data;
};

export const createBooking = async (bookingData) => {
    const { data } = await API.post('/bookings', bookingData);
    return data;
};

export const getMyBookings = async () => {
    const { data } = await API.get('/bookings/my');
    return data;
};

export const getBooking = async (id) => {
    const { data } = await API.get(`/bookings/${id}`);
    return data;
};

export const cancelBooking = async (id, reason = '') => {
    const { data } = await API.put(`/bookings/${id}/cancel`, { reason });
    return data;
};
