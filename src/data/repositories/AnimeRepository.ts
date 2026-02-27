import { Anime } from '../../domain/models/Anime';
import { IAnimeRepository } from '../../domain/repositories/IAnimeRepository';
import { apiClient } from '../api/apiClient';

export class AnimeRepository implements IAnimeRepository {

    // Example of how DTOs mapping might look
    private mapDtoToAnime(dto: any): Anime {
        return {
            id: dto.id,
            title: dto.title || dto.name, // Adjusting based on Laravel response
            image: dto.cover_image || dto.image_url,
            rating: dto.rating || 'PG-13',
            quality: dto.quality || 'HD',
            subtitle: dto.genres ? dto.genres.join(', ') : '',
        };
    }

    async getTopAiring(): Promise<Anime[]> {
        try {
            // Fetching from Laravel endpoint (example: /api/animes/top-airing)
            const response = await apiClient.get('/animes/top-airing');
            return response.data.map(this.mapDtoToAnime);
        } catch (error) {
            console.error('Error fetching Top Airing', error);
            // Fallback to empty array or throw standard domain error
            return [];
        }
    }

    async getNewEpisodes(): Promise<Anime[]> {
        try {
            const response = await apiClient.get('/animes/new-episodes');
            return response.data.map(this.mapDtoToAnime);
        } catch (error) {
            console.error('Error fetching New Episodes', error);
            return [];
        }
    }

    async getMostFavorite(): Promise<Anime[]> {
        try {
            const response = await apiClient.get('/animes/favorites');
            return response.data.map(this.mapDtoToAnime);
        } catch (error) {
            console.error('Error fetching Favorites', error);
            return [];
        }
    }

    async getTopSeries(): Promise<Anime[]> {
        try {
            const response = await apiClient.get('/animes/series');
            return response.data.map(this.mapDtoToAnime);
        } catch (error) {
            console.error('Error fetching Top Series', error);
            return [];
        }
    }

    async getBannerAnimes(): Promise<Anime[]> {
        try {
            // This might be a specific endpoint for the hero carousel
            const response = await apiClient.get('/animes/banners');
            return response.data.map(this.mapDtoToAnime);
        } catch (error) {
            console.error('Error fetching Banners', error);
            return [];
        }
    }
}
