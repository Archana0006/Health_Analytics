import React, { createContext, useContext } from 'react';
import useAuthStore from '../store/useAuthStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { user, token, login, logout } = useAuthStore();

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
