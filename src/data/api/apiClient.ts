import axios from 'axios';
import { API_BASE_URL } from '../../config/env';
import { getCachedToken } from '../auth/tokenStorage';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Handler chamado quando a API responde 401 (token inválido/expirado).
// O AuthProvider registra um callback aqui para limpar a sessão e mandar pro login.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
    onUnauthorized = handler;
}

// Injeta o token Bearer (lido de forma síncrona do cache do tokenStorage).
apiClient.interceptors.request.use((config) => {
    const token = getCachedToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            onUnauthorized?.();
        }
        return Promise.reject(error);
    }
);
