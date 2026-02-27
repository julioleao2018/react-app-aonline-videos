import { Anime } from '../models/Anime';
import { IAnimeRepository } from '../repositories/IAnimeRepository';

export class GetBannerAnimesUseCase {
    constructor(private animeRepository: IAnimeRepository) { }

    async execute(): Promise<Anime[]> {
        return this.animeRepository.getBannerAnimes();
    }
}
