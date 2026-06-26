import Constants from 'expo-constants';

/**
 * Base URL da API do backend (Laravel /api/v1).
 *
 * Em produção aponta para o mesmo domínio do site. Para desenvolvimento contra
 * o backend local em Docker, sobrescreva via `expo.extra.apiBaseUrl` no app.json
 * (ex.: emulador Android usa http://10.0.2.2:8000/api/v1; device físico usa o IP
 * da sua máquina na LAN).
 */
const DEFAULT_API_BASE_URL = 'https://animesbr.lat/api/v1';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

export const API_BASE_URL = extra.apiBaseUrl?.trim() || DEFAULT_API_BASE_URL;
