import { AnimeCard, AnimeDetail, CommentItem, CommentsResult, Episode, EpisodePlay, EpisodesPage, HomeRails, LikeState, MyListFilters, MyListItem, MyListSort } from '../../domain/models/Anime';
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
        })),
    };
}

/** Envelope de coleção paginada do Laravel: { data, meta }. */
interface PaginatedEnvelope<T> {
    data: T[];
    meta: { current_page: number; last_page: number; total: number };
    season_number?: number | null;
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

    /** Monta os query params de sort/filtro compartilhados pelas telas da Minha Lista. */
    private myListParams(sort?: MyListSort, filters?: MyListFilters): Record<string, string> {
        const params: Record<string, string> = {};
        if (sort) params.sort = sort;
        if (filters?.favoritesOnly) params.favorites_only = '1';
        if (filters?.type) params.type = filters.type;
        if (filters?.language) params.language = filters.language;
        return params;
    }

    private fixListItem(item: MyListItem): MyListItem {
        return { ...item, cover_url: fixMediaUrl(item.cover_url), banner_url: fixMediaUrl(item.banner_url) };
    }

    /** Fila (watchlist) do usuário. */
    async getWatchlist(sort?: MyListSort, filters?: MyListFilters): Promise<MyListItem[]> {
        const { data } = await apiClient.get<Envelope<MyListItem[]>>('/me/watchlist', {
            params: this.myListParams(sort, filters),
        });
        return (data.data ?? []).map((i) => this.fixListItem(i));
    }

    /** Favoritos do usuário. */
    async getFavorites(sort?: MyListSort, filters?: MyListFilters): Promise<MyListItem[]> {
        const { data } = await apiClient.get<Envelope<MyListItem[]>>('/me/favorites', {
            params: this.myListParams(sort, filters),
        });
        return (data.data ?? []).map((i) => this.fixListItem(i));
    }

    /** Histórico (assistidos recentemente). */
    async getHistory(sort?: MyListSort, filters?: MyListFilters): Promise<MyListItem[]> {
        const { data } = await apiClient.get<Envelope<MyListItem[]>>('/me/history', {
            params: this.myListParams(sort, filters),
        });
        return (data.data ?? []).map((i) => this.fixListItem(i));
    }

    /** Adiciona/remove o anime da watchlist; devolve o estado final. */
    async toggleWatchlist(slug: string): Promise<boolean> {
        const { data } = await apiClient.post<Envelope<{ in_watchlist: boolean }>>(
            `/animes/${encodeURIComponent(slug)}/watchlist`
        );
        return !!data.data?.in_watchlist;
    }

    /** Adiciona/remove o anime dos favoritos; devolve o estado final. */
    async toggleFavorite(slug: string): Promise<boolean> {
        const { data } = await apiClient.post<Envelope<{ is_favorite: boolean }>>(
            `/animes/${encodeURIComponent(slug)}/favorite`
        );
        return !!data.data?.is_favorite;
    }

    /** Página de episódios de uma temporada (scroll infinito). */
    async getAnimeEpisodes(
        slug: string,
        options: { season?: number | null; page?: number; perPage?: number } = {}
    ): Promise<EpisodesPage> {
        const params: Record<string, number> = { page: options.page ?? 1, per_page: options.perPage ?? 20 };
        if (options.season != null) params.season = options.season;

        const { data } = await apiClient.get<PaginatedEnvelope<Episode>>(
            `/animes/${encodeURIComponent(slug)}/episodes`,
            { params }
        );

        return {
            episodes: (data.data ?? []).map((ep) => ({ ...ep, thumb_url: fixMediaUrl(ep.thumb_url) })),
            page: data.meta?.current_page ?? 1,
            lastPage: data.meta?.last_page ?? 1,
            total: data.meta?.total ?? 0,
            seasonNumber: data.season_number ?? options.season ?? null,
        };
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
