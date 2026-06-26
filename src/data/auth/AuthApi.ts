import { Platform } from 'react-native';
import { apiClient } from '../api/apiClient';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
}

interface LoginResponse {
    token: string;
    token_type: string;
    user: AuthUser;
}

export const AuthApi = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
            device_name: `${Platform.OS}-app`,
        });
        return response.data;
    },

    async register(
        name: string,
        email: string,
        password: string,
        passwordConfirmation: string
    ): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            device_name: `${Platform.OS}-app`,
        });
        return response.data;
    },

    async me(): Promise<AuthUser> {
        const response = await apiClient.get<{ data: AuthUser }>('/auth/me');
        return response.data.data;
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    },
};
