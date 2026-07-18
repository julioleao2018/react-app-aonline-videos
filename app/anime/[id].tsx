import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated, Easing, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { AnimeDetail, Episode, Season } from '@/src/domain/models/Anime';
import { useLibrary } from '@/hooks/useLibrary';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const EPISODES_PER_PAGE = 20;

/** Spinner circular animado (gira continuamente). */
function Spinner({ size = 28 }: { size?: number }) {
    const spin = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
        );
        loop.start();
        return () => loop.stop();
    }, [spin]);
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
        <Animated.View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 3,
                borderColor: 'rgba(142,107,235,0.25)',
                borderTopColor: '#8E6BEB',
                transform: [{ rotate }],
            }}
        />
    );
}

export default function AnimeDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useLanguage();

    const [anime, setAnime] = useState<AnimeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Episódios paginados (scroll infinito) da temporada selecionada.
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [episodesLoading, setEpisodesLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const library = useLibrary();

    const [isDescModalVisible, setIsDescModalVisible] = useState(false);
    const descFadeAnim = useRef(new Animated.Value(0)).current;
    const descSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const listRef = useRef<FlatList<Episode>>(null);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            setError(false);
            setLoading(true);
            const data = await animeRepository.getAnimeDetail(id);
            setAnime(data);
            // Semeia o estado global com o que a API retornou.
            library.setSaved(id, !!data.in_watchlist);
            library.setFavorite(id, !!data.is_favorite);
            // Temporada padrão: primeira com episódios, senão a primeira.
            const seasons = data.seasons ?? [];
            const withEps = seasons.find((s) => (s.episode_count ?? 0) > 0) ?? seasons[0];
            setSelectedSeason(withEps?.number ?? null);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Carrega a primeira página de episódios quando a temporada muda.
    useEffect(() => {
        if (!id || !anime) return;
        let mounted = true;
        (async () => {
            setEpisodesLoading(true);
            try {
                const res = await animeRepository.getAnimeEpisodes(id, {
                    season: selectedSeason,
                    page: 1,
                    perPage: EPISODES_PER_PAGE,
                });
                if (!mounted) return;
                setEpisodes(res.episodes);
                setPage(res.page);
                setLastPage(res.lastPage);
                listRef.current?.scrollToOffset({ offset: 0, animated: false });
            } catch {
                if (mounted) setEpisodes([]);
            } finally {
                if (mounted) setEpisodesLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id, anime, selectedSeason]);

    const loadMore = useCallback(async () => {
        if (loadingMore || episodesLoading || page >= lastPage || !id) return;
        setLoadingMore(true);
        try {
            const next = page + 1;
            const res = await animeRepository.getAnimeEpisodes(id, {
                season: selectedSeason,
                page: next,
                perPage: EPISODES_PER_PAGE,
            });
            setEpisodes((prev) => {
                const seen = new Set(prev.map((e) => e.id));
                return [...prev, ...res.episodes.filter((e) => !seen.has(e.id))];
            });
            setPage(res.page);
            setLastPage(res.lastPage);
        } catch {
            // silencioso — mantém o que já carregou
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, episodesLoading, page, lastPage, id, selectedSeason]);

    const seasons = useMemo<Season[]>(() => anime?.seasons ?? [], [anime]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(descFadeAnim, {
                toValue: isDescModalVisible ? 1 : 0,
                duration: isDescModalVisible ? 300 : 200,
                useNativeDriver: true,
            }),
            isDescModalVisible
                ? Animated.spring(descSlideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
                : Animated.timing(descSlideAnim, { toValue: SCREEN_HEIGHT, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]).start();
    }, [isDescModalVisible, descFadeAnim, descSlideAnim]);

    const openPlayer = useCallback((episode: Episode) => {
        const epLabel = episode.number != null ? `EP ${episode.number}` : (episode.title ?? '');
        router.push({
            pathname: '/anime/player/[id]' as any,
            params: { id: String(episode.id), title: `${anime?.title ?? ''} - ${epLabel}`.trim() },
        });
    }, [anime?.title, router]);

    const formatDuration = (seconds: number | null) => {
        if (!seconds || seconds <= 0) return null;
        const minutes = Math.round(seconds / 60);
        return `${minutes} min`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Spinner size={40} />
            </View>
        );
    }

    if (error || !anime) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Stack.Screen options={{ headerShown: false }} />
                <TouchableOpacity onPress={load} style={styles.retryButton}>
                    <Text style={styles.retryText}>{t('loadError')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const heroImage = anime.banner_url || anime.cover_url;
    const genresText = anime.genres.map((g) => g.name).join(', ');

    const ListHeader = (
        <>
            {/* Hero */}
            <View style={styles.heroContainer}>
                {heroImage ? (
                    <Image source={{ uri: heroImage }} style={styles.heroImage} />
                ) : (
                    <View style={[styles.heroImage, styles.placeholder]} />
                )}
                <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent', '#15171E']} style={styles.heroGradient} />
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
                        <IconSymbol name="arrow.left" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={2}>{anime.title}</Text>
                    <View style={styles.titleActions}>
                        <TouchableOpacity style={styles.actionIcon} onPress={() => library.toggleFavorite(id)}>
                            <IconSymbol
                                name={library.isFavorite(id) ? 'heart.fill' : 'heart'}
                                size={24}
                                color={library.isFavorite(id) ? '#8E6BEB' : '#fff'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIcon} onPress={() => library.toggleSaved(id)}>
                            <IconSymbol
                                name={library.isSaved(id) ? 'bookmark.fill' : 'bookmark'}
                                size={24}
                                color={library.isSaved(id) ? '#8E6BEB' : '#fff'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Meta */}
                <View style={styles.metaRow}>
                    {anime.rating != null && (
                        <View style={styles.ratingBadge}>
                            <IconSymbol name="star.fill" size={16} color="#8E6BEB" />
                            <Text style={styles.ratingText}>{anime.rating.toFixed(1)}</Text>
                        </View>
                    )}
                    {anime.year != null && <Text style={styles.metaYear}>{anime.year}</Text>}
                    <View style={styles.metaBox}><Text style={styles.metaBoxText}>HD</Text></View>
                    {!!anime.format && (
                        <View style={styles.metaBox}><Text style={styles.metaBoxText}>{anime.format.toUpperCase()}</Text></View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.playButton, episodes.length === 0 && styles.buttonDisabled]}
                        disabled={episodes.length === 0}
                        onPress={() => episodes[0] && openPlayer(episodes[0])}
                    >
                        <IconSymbol name="play.fill" size={20} color="#fff" />
                        <Text style={styles.playButtonText}>{t('play')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Description */}
                {!!genresText && <Text style={styles.genreText}>{t('genreLabel')}: {genresText}</Text>}
                {!!anime.description && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.descriptionText, { marginBottom: 0 }]} numberOfLines={4}>
                            {anime.description}
                        </Text>
                        <TouchableOpacity onPress={() => setIsDescModalVisible(true)} style={{ marginTop: 4 }}>
                            <Text style={[styles.viewMore, { fontWeight: 'bold' }]}>{t('viewMore')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Comentários (topo, com contagem total) */}
                <TouchableOpacity
                    style={styles.commentsBtn}
                    onPress={() => router.push({ pathname: '/anime/[id]/comments', params: { id } })}
                    activeOpacity={0.7}
                >
                    <View style={styles.commentsBtnLeft}>
                        <IconSymbol name="bubble.left" size={18} color="#fff" />
                        <Text style={styles.commentsText}>{t('viewAllComments')}</Text>
                    </View>
                    <View style={styles.commentsCountBadge}>
                        <Text style={styles.commentsCountText}>{anime.comments_count ?? 0}</Text>
                    </View>
                </TouchableOpacity>

                {/* Episodes header + season selector */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('episodes')}</Text>
                </View>

                {seasons.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.seasonRow}
                    >
                        {seasons.map((s) => {
                            const active = s.number === selectedSeason;
                            return (
                                <TouchableOpacity
                                    key={s.id}
                                    onPress={() => s.number != null && setSelectedSeason(s.number)}
                                    style={[styles.seasonChip, active && styles.seasonChipActive]}
                                >
                                    <Text style={[styles.seasonChipText, active && styles.seasonChipTextActive]}>
                                        {s.number != null ? `T${s.number}` : (s.title ?? '—')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        </>
    );

    const hasMore = page < lastPage;
    const ListFooter = (
        <View style={styles.footerContainer}>
            {loadingMore ? (
                <View style={styles.footerLoading}>
                    <Spinner />
                </View>
            ) : hasMore && episodes.length > 0 ? (
                // Placeholder de altura pra não "pular" quando o spinner aparece.
                <View style={styles.footerLoading} />
            ) : null}
        </View>
    );

    const renderEpisode = ({ item }: { item: Episode }) => {
        const duration = formatDuration(item.duration_seconds);
        return (
            <TouchableOpacity style={styles.episodeRow} onPress={() => openPlayer(item)} activeOpacity={0.7}>
                <View style={styles.episodeThumbWrap}>
                    {item.thumb_url ? (
                        <Image source={{ uri: item.thumb_url }} style={styles.episodeThumb} />
                    ) : heroImage ? (
                        <Image source={{ uri: heroImage }} style={styles.episodeThumb} />
                    ) : (
                        <View style={[styles.episodeThumb, styles.placeholder]} />
                    )}
                    <View style={styles.episodeThumbOverlay}>
                        <View style={styles.playIconCircle}>
                            <IconSymbol name="play.fill" size={14} color="#000" />
                        </View>
                    </View>
                </View>
                <View style={styles.episodeInfo}>
                    <Text style={styles.episodeNumber}>
                        {item.number != null ? `Episódio ${item.number}` : (item.title ?? '')}
                    </Text>
                    {!!item.title && item.number != null && (
                        <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
                    )}
                    {duration && <Text style={styles.episodeDuration}>{duration}</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                ref={listRef}
                data={episodes}
                keyExtractor={(ep) => String(ep.id)}
                renderItem={renderEpisode}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={
                    episodesLoading ? (
                        <View style={styles.episodesLoading}>
                            <Spinner />
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, styles.contentContainer]}>{t('noEpisodes')}</Text>
                    )
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                bounces={false}
            />

            {/* Description modal */}
            <View style={[StyleSheet.absoluteFill, { zIndex: isDescModalVisible ? 10 : -1 }]} pointerEvents={isDescModalVisible ? 'auto' : 'none'}>
                <Animated.View style={[styles.modalOverlay, { opacity: descFadeAnim }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setIsDescModalVisible(false)} />
                </Animated.View>
                <Animated.View style={[styles.descSheet, { transform: [{ translateY: descSlideAnim }] }]}>
                    <View style={styles.dragHandle} />
                    <Text style={styles.sheetTitle}>{anime.title}</Text>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        <Text style={[styles.descriptionText, { fontSize: 16, lineHeight: 24 }]}>{anime.description}</Text>
                    </ScrollView>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setIsDescModalVisible(false)}>
                        <Text style={styles.closeBtnText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#15171E' },
    centered: { alignItems: 'center', justifyContent: 'center' },
    placeholder: { backgroundColor: '#2C2D35' },
    retryButton: { padding: 16, backgroundColor: '#2C2D35', borderRadius: 12 },
    retryText: { color: '#ff6b6b' },
    listContent: { paddingBottom: 40 },
    heroContainer: { width: '100%', height: 350, position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroGradient: { ...StyleSheet.absoluteFillObject },
    topNav: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
    navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    contentContainer: { paddingHorizontal: 20, marginTop: -40 },
    footerContainer: { paddingHorizontal: 20, marginTop: 24 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: '#fff', paddingRight: 16 },
    titleActions: { flexDirection: 'row', gap: 16, paddingTop: 4 },
    actionIcon: { marginLeft: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: '#8E6BEB', fontWeight: 'bold', fontSize: 14 },
    metaYear: { color: '#ccc', fontSize: 14, fontWeight: '500' },
    metaBox: { borderWidth: 1, borderColor: '#444', backgroundColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    metaBoxText: { color: '#ccc', fontSize: 10, fontWeight: 'bold' },
    buttonsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    playButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8E6BEB', paddingVertical: 14, borderRadius: 24, gap: 8 },
    buttonDisabled: { opacity: 0.5 },
    playButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    genreText: { color: '#ccc', fontSize: 13, marginBottom: 8 },
    descriptionText: { color: '#eee', fontSize: 13, lineHeight: 20, marginBottom: 24 },
    viewMore: { color: '#8E6BEB' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    seasonRow: { gap: 8, paddingBottom: 16 },
    seasonChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2C2D35' },
    seasonChipActive: { backgroundColor: '#8E6BEB' },
    seasonChipText: { color: '#ccc', fontWeight: 'bold', fontSize: 13 },
    seasonChipTextActive: { color: '#fff' },
    emptyText: { color: '#888', marginBottom: 24 },
    episodesLoading: { paddingVertical: 30, alignItems: 'center' },
    footerLoading: { paddingVertical: 20, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
    episodeRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center', gap: 12 },
    episodeThumbWrap: { width: 130, height: 74, borderRadius: 8, overflow: 'hidden', position: 'relative' },
    episodeThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    episodeThumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
    playIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    episodeInfo: { flex: 1, justifyContent: 'center' },
    episodeNumber: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    episodeTitle: { color: '#aaa', fontSize: 12, lineHeight: 16 },
    episodeDuration: { color: '#777', fontSize: 11, marginTop: 4 },
    commentsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2C2D35', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginTop: 4, marginBottom: 24 },
    commentsBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    commentsText: { color: '#fff', fontWeight: 'bold' },
    commentsCountBadge: { minWidth: 28, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: '#8E6BEB', alignItems: 'center' },
    commentsCountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    descSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E1F28', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 60, maxHeight: SCREEN_HEIGHT * 0.7 },
    dragHandle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
    sheetTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    closeBtn: { paddingVertical: 16, borderRadius: 24, backgroundColor: '#8E6BEB', alignItems: 'center' },
    closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
