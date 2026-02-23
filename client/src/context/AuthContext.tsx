import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: any) => void;
    signup: (userData: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, [token]);

    const login = (userData: any) => {
        setUser({ _id: userData._id, email: userData.email });
        setToken(userData.token);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify({ _id: userData._id, email: userData.email }));
        navigate('/');
    };

    const signup = (userData: any) => {
        setUser({ _id: userData._id, email: userData.email });
        setToken(userData.token);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify({ _id: userData._id, email: userData.email }));
        navigate('/');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
