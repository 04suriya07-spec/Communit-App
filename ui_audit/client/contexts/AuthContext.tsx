import React, { createContext, useState, useEffect, useCallback } from 'react';
import { personasApi } from '@/api/personas';
import { authApi } from '@/api/auth';
import type { Persona } from '@/types/api';

interface AuthContextType {
    personas: Persona[];
    currentPersona: Persona | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
    setCurrentPersona: (persona: Persona) => void;
    refreshPersonas: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkSession = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await personasApi.list();

            if (response.personas && response.personas.length > 0) {
                setPersonas(response.personas);
                if (!currentPersona) {
                    setCurrentPersona(response.personas[0]);
                }
            } else {
                setPersonas([]);
                setCurrentPersona(null);
            }
        } catch (err: any) {
            if (err.response?.status !== 401) {
                console.error('Session check error:', err);
                setError('Failed to check session');
            }
            setPersonas([]);
            setCurrentPersona(null);
        } finally {
            setIsLoading(false);
        }
    }, [currentPersona]);

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);

            await authApi.login({ email, password });
            await checkSession();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            setIsLoading(true);

            await authApi.register({
                email,
                password,
                initialDisplayName: displayName,
            });

            await checkSession();
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setPersonas([]);
        setCurrentPersona(null);
        setError(null);
        authApi.logout();
    };

    const refreshPersonas = async () => {
        await checkSession();
    };

    const value: AuthContextType = {
        personas,
        currentPersona,
        isLoading,
        error,
        login,
        register,
        logout,
        setCurrentPersona,
        refreshPersonas,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
