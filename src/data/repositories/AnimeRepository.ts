import { AnimeCard, AnimeDetail, CommentItem, CommentsResult, EpisodePlay, HomeRails, LikeState } from '../../domain/models/Anime';
import { IAnimeRepository } from '../../domain/repositories/IAnimeRepository';
import { apiClient } from '../api/apiClient';
import { fixMediaUrl } from '../api/media';

/** Respostas da API vêm envelopadas em { data: ... }. */
interface Envelope<T> {
    data: T;
}

/** Normaliza o host das imagens (localhost → host da API) em dev. */
function fixCard(card: AnimeCard): AnimeCard {
    return { ...card, cover_url: fixMediaUrl(card.cover_url), banner_url: fixMediaUrl(card.banner_url) };
}

function fixDetail(detail: AnimeDetail): AnimeDetail {
    return {
        ...detail,
        cover_url: fixMediaUrl(detail.cover_url),
        banner_url: fixMediaUrl(detail.banner_url),
        seasons: (detail.seasons ?? []).map((season) => ({
            ...season,
            image_url: fixMediaUrl(season.image_url),
            episodes: (season.episodes ?? []).map((ep) => ({ ...ep, thumb_url: fixMediaUrl(ep.thumb_url) })),
        })),
    };
}

export class AnimeRepository implements IAnimeRepository {
    async getHome(): Promise<HomeRails> {
        const { data } = await apiClient.get<Envelope<HomeRails>>('/home');
        const rails = data.data;
        return {
            banners: rails.banners.map(fixCard),
            top_airing: rails.top_airing.map(fixCard),
            new_episodes: rails.new_episodes.map(fixCard),
            most_favorite: rails.most_favorite.map(fixCard),
            top_series: rails.top_series.map(fixCard),
        };
    }

    async getTopAiring(): Promise<AnimeCard[]> {
        const { data } = await apiClient.get<Envelope<AnimeCard[]>>('/animes/top-airing');
        return data.data.map(fixCard);
    }

    async getNewEpisodes(): Promise<AnimeCard[]> {
        const { data } = await apiClient.get<Envelope<AnimeCard[]>>('/animes/new-episodes');
        return data.data.map(fixCard);
    }

    async getMostFavorite(): Promise<AnimeCard[]> {
        const { data } = await apiClient.get<Envelope<AnimeCard[]>>('/animes/favorites');
        return data.data.map(fixCard);
    }

    async getTopSeries(): Promise<AnimeCard[]> {
        const { data } = await apiClient.get<Envelope<AnimeCard[]>>('/animes/series');
        return data.data.map(fixCard);
    }

    async getBannerAnimes(): Promise<AnimeCard[]> {
        const { data } = await apiClient.get<Envelope<AnimeCard[]>>('/animes/banners');
        return data.data.map(fixCard);
    }

    async getAnimeDetail(slug: string): Promise<AnimeDetail> {
        const { data } = await apiClient.get<Envelope<AnimeDetail>>(`/animes/${encodeURIComponent(slug)}`);
        return fixDetail(data.data);
    }

    async getEpisodePlay(episodeId: number | string): Promise<EpisodePlay> {
        const { data } = await apiClient.get<Envelope<EpisodePlay>>(`/episodes/${episodeId}/play`);
        return data.data;
    }

    async getComments(slug: string): Promise<CommentsResult> {
        const { data } = await apiClient.get<{ data: CommentItem[]; meta: { total: number } }>(
            `/animes/${encodeURIComponent(slug)}/comments`
        );
        return { comments: data.data.map(fixCommentAvatar), total: data.meta.total };
    }

    async getReplies(commentId: number): Promise<CommentItem[]> {
        const { data } = await apiClient.get<Envelope<CommentItem[]>>(`/comments/${commentId}/replies`);
        return data.data.map(fixCommentAvatar);
    }

    async postComment(slug: string, body: string, isSpoiler = false): Promise<CommentItem> {
        const { data } = await apiClient.post<Envelope<CommentItem>>(
            `/animes/${encodeURIComponent(slug)}/comments`,
            { body, is_spoiler: isSpoiler }
        );
        return fixCommentAvatar(data.data);
    }

    async replyToComment(commentId: number, body: string, isSpoiler = false): Promise<CommentItem> {
        const { data } = await apiClient.post<Envelope<CommentItem>>(`/comments/${commentId}/replies`, {
            body,
            is_spoiler: isSpoiler,
        });
        return fixCommentAvatar(data.data);
    }

    async toggleCommentLike(commentId: number): Promise<LikeState> {
        const { data } = await apiClient.post<Envelope<LikeState>>(`/comments/${commentId}/like`);
        return data.data;
    }
}

function fixCommentAvatar(c: CommentItem): CommentItem {
    return { ...c, author: { ...c.author, avatar_url: fixMediaUrl(c.author.avatar_url) } };
}

/** Instância única pronta para uso nas telas. */
export const animeRepository = new AnimeRepository();
