import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate authentication state from localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { access_token, user: userData } = response.data;
            
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setToken(access_token);
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Invalid email or password.';
            const errors = error.response?.data?.errors || null;
            return { success: false, message, errors };
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/user');
            const currentUser = response.data;
            localStorage.setItem('user', JSON.stringify(currentUser));
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return null;
        }
    };

    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (name, email, password, passwordConfirmation) => {
        try {
            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setToken(access_token);
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed.';
            const errors = error.response?.data?.errors || null;
            return { success: false, message, errors };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, refreshUser, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
