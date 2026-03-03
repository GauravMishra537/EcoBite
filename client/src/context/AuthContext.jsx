import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on app load
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('ecobite_token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await API.get('/auth/me');
            setUser(data.user);
        } catch {
            localStorage.removeItem('ecobite_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        try {
            const { data } = await API.post('/auth/register', formData);
            localStorage.setItem('ecobite_token', data.token);
            setUser(data.user);
            toast.success('Account created successfully!');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const login = async (formData) => {
        try {
            const { data } = await API.post('/auth/login', formData);
            localStorage.setItem('ecobite_token', data.token);
            setUser(data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await API.post('/auth/logout');
        } catch {
            // Logout even if API call fails
        }
        localStorage.removeItem('ecobite_token');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateProfile = async (formData) => {
        try {
            const { data } = await API.put('/auth/updateprofile', formData);
            setUser(data.user);
            toast.success('Profile updated!');
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.error || 'Update failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
