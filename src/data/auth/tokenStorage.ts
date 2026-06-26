import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

/**
 * Armazena o token Bearer do Sanctum no SecureStore (Keychain/Keystore).
 * Mantém uma cópia em memória para o interceptor do axios ler de forma síncrona
 * sem custo de I/O a cada request.
 */
let cachedToken: string | null = null;

export async function loadToken(): Promise<string | null> {
    try {
        cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
        cachedToken = null;
    }
    return cachedToken;
}

export async function saveToken(token: string): Promise<void> {
    cachedToken = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
    cachedToken = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function getCachedToken(): string | null {
    return cachedToken;
}
