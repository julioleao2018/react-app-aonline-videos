import { Anime } from '../models/Anime';
import { IAnimeRepository } from '../repositories/IAnimeRepository';

export class GetTopAiringAnimesUseCase {
    constructor(private animeRepository: IAnimeRepository) { }

    async execute(): Promise<Anime[]> {
        return this.animeRepository.getTopAiring();
    }
}

export class GetNewEpisodesUseCase {
    constructor(private animeRepository: IAnimeRepository) { }

    async execute(): Promise<Anime[]> {
        return this.animeRepository.getNewEpisodes();
    }
}

export class GetMostFavoriteAnimesUseCase {
    constructor(private animeRepository: IAnimeRepository) { }

    async execute(): Promise<Anime[]> {
        return this.animeRepository.getMostFavorite();
    }
}

export class GetTopSeriesUseCase {
    constructor(private animeRepository: IAnimeRepository) { }

    async execute(): Promise<Anime[]> {
        return this.animeRepository.getTopSeries();
    }
}
