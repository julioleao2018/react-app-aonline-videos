import Constants from 'expo-constants';

/**
 * Base URL da API do backend (Laravel /api/v1).
 *
 * Ordem de resolução (primeiro que existir vence):
 *   1. `.env` → EXPO_PUBLIC_API_BASE_URL (recomendado para desenvolvimento)
 *   2. `app.json` → expo.extra.apiBaseUrl
 *   3. Fallback de produção.
 *
 * Para o backend local em Docker: emulador Android usa http://10.0.2.2:8000/api/v1;
 * device físico usa o IP da sua máquina na LAN (ex.: http://192.168.0.10:8000/api/v1).
 */
const DEFAULT_API_BASE_URL = 'https://animesbr.lat/api/v1';

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = envApiBaseUrl || extra.apiBaseUrl?.trim() || DEFAULT_API_BASE_URL;

/**
 * Referer enviado nas requisições de mídia (HLS/MP4) ao CDN.
 *
 * O CDN (Cloudflare) exige um Referer same-origin do site — sem ele responde 403.
 * O player web usa isso automaticamente; no app precisamos enviar manualmente.
 * Deve apontar para o domínio público do site (NÃO para a API local em dev).
 */
const DEFAULT_MEDIA_REFERER = 'https://animesbr.lat/';

export const MEDIA_REFERER =
    process.env.EXPO_PUBLIC_MEDIA_REFERER?.trim() ||
    (extra as { mediaReferer?: string }).mediaReferer?.trim() ||
    DEFAULT_MEDIA_REFERER;
