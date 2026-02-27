import { Anime } from '../models/Anime';

export interface IAnimeRepository {
    getTopAiring(): Promise<Anime[]>;
    getNewEpisodes(): Promise<Anime[]>;
    getMostFavorite(): Promise<Anime[]>;
    getTopSeries(): Promise<Anime[]>;
    getBannerAnimes(): Promise<Anime[]>;
}
