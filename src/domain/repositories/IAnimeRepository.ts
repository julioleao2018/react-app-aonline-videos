import { AnimeCard, AnimeDetail, CommentItem, CommentsResult, EpisodePlay, HomeRails, LikeState } from '../models/Anime';

export interface IAnimeRepository {
    getHome(): Promise<HomeRails>;
    getTopAiring(): Promise<AnimeCard[]>;
    getNewEpisodes(): Promise<AnimeCard[]>;
    getMostFavorite(): Promise<AnimeCard[]>;
    getTopSeries(): Promise<AnimeCard[]>;
    getBannerAnimes(): Promise<AnimeCard[]>;
    getAnimeDetail(slug: string): Promise<AnimeDetail>;
    getEpisodePlay(episodeId: number | string): Promise<EpisodePlay>;
    getComments(slug: string): Promise<CommentsResult>;
    getReplies(commentId: number): Promise<CommentItem[]>;
    postComment(slug: string, body: string, isSpoiler?: boolean): Promise<CommentItem>;
    replyToComment(commentId: number, body: string, isSpoiler?: boolean): Promise<CommentItem>;
    toggleCommentLike(commentId: number): Promise<LikeState>;
}
