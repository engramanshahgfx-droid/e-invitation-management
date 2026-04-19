import api from './api';

const emitAuthUserUpdated = (user) => {
    window.dispatchEvent(new CustomEvent('auth-user-updated', { detail: user }));
};

export const setStoredUser = (user) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    emitAuthUserUpdated(user);
};

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('auth_user') || 'null');
    } catch {
        return null;
    }
};

export const persistAuth = ({ token, user }) => {
    localStorage.setItem('auth_token', token);
    setStoredUser(user);
};

export const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    emitAuthUserUpdated(null);
};

export const fetchCurrentUser = async () => {
    const { data } = await api.get('/auth/me');
    setStoredUser(data.user);
    return data.user;
};