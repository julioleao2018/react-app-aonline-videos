import { API_BASE_URL } from '../../config/env';

/**
 * Origem da API (protocolo + host[:porta]), ex.: "http://10.0.2.2:8000".
 */
const API_ORIGIN = (API_BASE_URL.match(/^https?:\/\/[^/]+/) ?? [''])[0];

/**
 * Reescreve o host de URLs de mídia que apontam para localhost/127.0.0.1 para o
 * host da API. Necessário em dev: o backend gera URLs com APP_URL=localhost:8000,
 * mas no emulador/device "localhost" é o próprio aparelho. Em produção (host real)
 * isto é um no-op.
 */
export function fixMediaUrl(url: string | null): string | null {
    if (!url || !API_ORIGIN) return url;
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, API_ORIGIN);
}
