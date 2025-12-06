import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export interface User {
    id: number;
    email: string;
    role: 'admin' | 'user';
    subscriptionPlan?: string | null;
    totpEnabled?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signUp: (email: string, password: string) => Promise<User>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => ({} as User),
    signUp: async () => ({} as User),
    signOut: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchMe() {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) fetchMe();
        else setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        const res = await api.post('/auth/signin', { email, password });
        const { access, refresh, user } = res.data;
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        setUser(user);
        navigate('/');
        return user;
    };

    const signUp = async (email: string, password: string) => {
        const res = await api.post('/auth/signup', { email, password });
        const { access, refresh, user } = res.data;
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        setUser(user);
        navigate('/');
        return user;
    };

    const signOut = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
