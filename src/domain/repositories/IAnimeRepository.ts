import { AnimeCard, AnimeDetail, CommentItem, CommentsResult, EpisodePlay, EpisodesPage, HomeRails, LikeState, MyListFilters, MyListItem, MyListSort } from '../models/Anime';

export interface IAnimeRepository {
    getHome(): Promise<HomeRails>;
    getTopAiring(): Promise<AnimeCard[]>;
    getNewEpisodes(): Promise<AnimeCard[]>;
    getMostFavorite(): Promise<AnimeCard[]>;
    getTopSeries(): Promise<AnimeCard[]>;
    getBannerAnimes(): Promise<AnimeCard[]>;
    getAnimeDetail(slug: string): Promise<AnimeDetail>;
    getAnimeEpisodes(
        slug: string,
        options?: { season?: number | null; page?: number; perPage?: number }
    ): Promise<EpisodesPage>;
    getEpisodePlay(episodeId: number | string): Promise<EpisodePlay>;
    getWatchlist(sort?: MyListSort, filters?: MyListFilters): Promise<MyListItem[]>;
    getFavorites(sort?: MyListSort, filters?: MyListFilters): Promise<MyListItem[]>;
    getHistory(sort?: MyListSort, filters?: MyListFilters): Promise<MyListItem[]>;
    toggleWatchlist(slug: string): Promise<boolean>;
    toggleFavorite(slug: string): Promise<boolean>;
    getComments(slug: string): Promise<CommentsResult>;
    getReplies(commentId: number): Promise<CommentItem[]>;
    postComment(slug: string, body: string, isSpoiler?: boolean): Promise<CommentItem>;
    replyToComment(commentId: number, body: string, isSpoiler?: boolean): Promise<CommentItem>;
    toggleCommentLike(commentId: number): Promise<LikeState>;
}
