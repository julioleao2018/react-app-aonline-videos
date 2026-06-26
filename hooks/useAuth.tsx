import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AuthApi, AuthUser } from '@/src/data/auth/AuthApi';
import { setUnauthorizedHandler } from '@/src/data/api/apiClient';
import { clearToken, loadToken, saveToken } from '@/src/data/auth/tokenStorage';
import { API_BASE_URL } from '@/src/config/env';

export type SocialProvider = 'google' | 'discord';

interface AuthContextProps {
    user: AuthUser | null;
    /** true enquanto restaura a sessão no boot (mostra splash/loader). */
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    loginWithProvider: (provider: SocialProvider) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const signOut = useCallback(async () => {
        await clearToken();
        setUser(null);
    }, []);

    // Restaura a sessão no boot: se há token salvo, valida buscando /auth/me.
    useEffect(() => {
        let mounted = true;

        (async () => {
            const token = await loadToken();
            if (token) {
                try {
                    const me = await AuthApi.me();
                    if (mounted) setUser(me);
                } catch {
                    await clearToken();
                }
            }
            if (mounted) setIsLoading(false);
        })();

        return () => {
            mounted = false;
        };
    }, []);

    // Quando a API responde 401, derruba a sessão (token expirado/revogado).
    useEffect(() => {
        setUnauthorizedHandler(() => {
            void signOut();
        });
        return () => setUnauthorizedHandler(null);
    }, [signOut]);

    const login = useCallback(async (email: string, password: string) => {
        const { token, user: loggedUser } = await AuthApi.login(email, password);
        await saveToken(token);
        setUser(loggedUser);
    }, []);

    const register = useCallback(
        async (name: string, email: string, password: string, passwordConfirmation: string) => {
            const { token, user: newUser } = await AuthApi.register(name, email, password, passwordConfirmation);
            await saveToken(token);
            setUser(newUser);
        },
        []
    );

    // OAuth Google/Discord: abre o fluxo no WebBrowser e captura o token que o
    // backend devolve no deep link de retorno.
    const loginWithProvider = useCallback(async (provider: SocialProvider) => {
        const returnUrl = Linking.createURL('auth-callback');
        const authUrl = `${API_BASE_URL}/auth/${provider}/redirect?return=${encodeURIComponent(returnUrl)}`;

        const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
        if (result.type !== 'success' || !result.url) {
            throw new Error('cancelled');
        }

        const { queryParams } = Linking.parse(result.url);
        const token = queryParams?.token;
        const error = queryParams?.error;

        if (!token || typeof token !== 'string') {
            throw new Error(typeof error === 'string' ? error : 'social_failed');
        }

        await saveToken(token);
        const me = await AuthApi.me();
        setUser(me);
    }, []);

    const logout = useCallback(async () => {
        try {
            await AuthApi.logout();
        } catch {
            // Mesmo se a chamada falhar (ex.: offline), limpamos a sessão local.
        }
        await signOut();
    }, [signOut]);

    return (
        <AuthContext.Provider
            value={{ user, isLoading, isAuthenticated: !!user, login, register, loginWithProvider, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
