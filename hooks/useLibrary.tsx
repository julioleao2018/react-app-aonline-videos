import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { useAuth } from './useAuth';

/**
 * Estado global da biblioteca do usuário: quais animes estão na Fila (watchlist)
 * e nos Favoritos. Fonte única de verdade para os botões espalhados pelo app
 * (hero da home, tela do anime, Minha Lista), evitando estados dessincronizados.
 */
interface LibraryContextProps {
    isSaved: (slug: string) => boolean;
    isFavorite: (slug: string) => boolean;
    toggleSaved: (slug: string) => Promise<boolean>;
    toggleFavorite: (slug: string) => Promise<boolean>;
    /** Sincroniza o estado a partir de uma resposta da API (ex.: detalhe do anime). */
    setSaved: (slug: string, value: boolean) => void;
    setFavorite: (slug: string, value: boolean) => void;
    refresh: () => Promise<void>;
    /** Muda a cada alteração — telas podem usar como dependência de efeito. */
    version: number;
}

const LibraryContext = createContext<LibraryContextProps | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const savedRef = useRef<Set<string>>(new Set());
    const favRef = useRef<Set<string>>(new Set());
    const [version, setVersion] = useState(0);

    const bump = useCallback(() => setVersion((v) => v + 1), []);

    const setSaved = useCallback((slug: string, value: boolean) => {
        const set = savedRef.current;
        if (value) set.add(slug); else set.delete(slug);
        bump();
    }, [bump]);

    const setFavorite = useCallback((slug: string, value: boolean) => {
        const set = favRef.current;
        if (value) set.add(slug); else set.delete(slug);
        bump();
    }, [bump]);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) {
            savedRef.current = new Set();
            favRef.current = new Set();
            bump();
            return;
        }
        try {
            const [saved, favs] = await Promise.all([
                animeRepository.getWatchlist(),
                animeRepository.getFavorites(),
            ]);
            savedRef.current = new Set(saved.map((a) => a.slug));
            favRef.current = new Set(favs.map((a) => a.slug));
            bump();
        } catch {
            /* mantém o que tem */
        }
    }, [isAuthenticated, bump]);

    // Recarrega quando o login muda.
    useEffect(() => {
        void refresh();
    }, [refresh]);

    const toggleSaved = useCallback(async (slug: string): Promise<boolean> => {
        const current = savedRef.current.has(slug);
        setSaved(slug, !current); // otimista
        try {
            const result = await animeRepository.toggleWatchlist(slug);
            setSaved(slug, result);
            return result;
        } catch {
            setSaved(slug, current); // reverte
            return current;
        }
    }, [setSaved]);

    const toggleFavorite = useCallback(async (slug: string): Promise<boolean> => {
        const current = favRef.current.has(slug);
        setFavorite(slug, !current);
        try {
            const result = await animeRepository.toggleFavorite(slug);
            setFavorite(slug, result);
            return result;
        } catch {
            setFavorite(slug, current);
            return current;
        }
    }, [setFavorite]);

    const isSaved = useCallback((slug: string) => savedRef.current.has(slug), []);
    const isFavorite = useCallback((slug: string) => favRef.current.has(slug), []);

    return (
        <LibraryContext.Provider
            value={{ isSaved, isFavorite, toggleSaved, toggleFavorite, setSaved, setFavorite, refresh, version }}
        >
            {children}
        </LibraryContext.Provider>
    );
}

export function useLibrary() {
    const ctx = useContext(LibraryContext);
    if (!ctx) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return ctx;
}
