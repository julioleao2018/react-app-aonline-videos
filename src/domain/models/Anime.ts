export interface Genre {
    id: number;
    name: string;
    slug: string;
}

/** Card de anime usado nas rails da home e em "títulos semelhantes". */
export interface AnimeCard {
    id: number;
    slug: string;
    title: string;
    cover_url: string | null;
    banner_url: string | null;
    rating: number | null;
    year: number | null;
    format: string | null;
    genres: string[];
}

/** Alias de compatibilidade — código antigo importava `Anime`. */
export type Anime = AnimeCard;

/** Episódio a "continuar" numa linha da Minha Lista. */
export interface ContinueEpisode {
    episode_id: number;
    number: number | null;
    season_number: number | null;
}

/** Item das telas Minha Lista (Fila/Histórico/Favoritos), estilo CR. */
export interface MyListItem extends AnimeCard {
    languages: string[];
    is_favorite: boolean;
    in_watchlist: boolean;
    continue: ContinueEpisode | null;
}

export type MyListSort = 'activity' | 'updated' | 'watched' | 'added' | 'alpha';

export interface MyListFilters {
    favoritesOnly?: boolean;
    type?: 'series' | 'movie' | null;
    language?: 'legendado' | 'dublado' | null;
}

export interface Episode {
    id: number;
    number: number | null;
    title: string | null;
    language: string | null;
    slug: string | null;
    thumb_url: string | null;
    duration_seconds: number | null;
    is_free_preview: boolean;
    published_at: string | null;
    play_url: string;
}

export interface Season {
    id: number;
    number: number | null;
    title: string | null;
    image_url: string | null;
    /** Total de episódios publicados (o detalhe não traz mais a lista completa). */
    episode_count?: number;
    /** Só presente em respostas antigas; hoje os episódios vêm paginados. */
    episodes?: Episode[];
}

/** Página de episódios (scroll infinito). */
export interface EpisodesPage {
    episodes: Episode[];
    page: number;
    lastPage: number;
    total: number;
    seasonNumber: number | null;
}

export interface AnimeDetail {
    id: number;
    slug: string;
    title: string;
    alt_titles: string[];
    description: string | null;
    cover_url: string | null;
    banner_url: string | null;
    rating: number | null;
    year: number | null;
    format: string | null;
    comments_count: number;
    in_watchlist: boolean;
    is_favorite: boolean;
    genres: Genre[];
    seasons: Season[];
}

export interface PlaySource {
    id: number;
    label: string | null;
    language: string | null;
    type: 'hls' | 'mp4';
    url: string;
    intro_start_seconds: number | null;
    intro_end_seconds: number | null;
    outro_start_seconds: number | null;
    outro_end_seconds: number | null;
    sort_order: number | null;
}

export interface EpisodePlay {
    episode_id: number;
    title: string | null;
    duration_seconds: number | null;
    sources: PlaySource[];
}

export interface CommentAuthor {
    name: string;
    avatar_url: string | null;
    role: string | null;
    is_admin: boolean;
}

export interface CommentItem {
    id: number;
    body: string;
    is_spoiler: boolean;
    author: CommentAuthor;
    likes_count: number;
    liked_by_me: boolean;
    replies_count: number;
    reply_to_name: string | null;
    created_at: string | null;
}

export interface CommentsResult {
    comments: CommentItem[];
    total: number;
}

export interface LikeState {
    liked: boolean;
    likes_count: number;
}

export interface HomeRails {
    banners: AnimeCard[];
    top_airing: AnimeCard[];
    new_episodes: AnimeCard[];
    most_favorite: AnimeCard[];
    top_series: AnimeCard[];
}
