import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated, Easing, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { AnimeDetail, Episode } from '@/src/domain/models/Anime';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnimeDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useLanguage();

    const [anime, setAnime] = useState<AnimeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [isDescModalVisible, setIsDescModalVisible] = useState(false);
    const descFadeAnim = useRef(new Animated.Value(0)).current;
    const descSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const load = useCallback(async () => {
        if (!id) return;
        try {
            setError(false);
            setLoading(true);
            const data = await animeRepository.getAnimeDetail(id);
            setAnime(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Lista achatada de episódios (todas as temporadas em ordem).
    const episodes = useMemo<Episode[]>(
        () => (anime?.seasons ?? []).flatMap((s) => s.episodes ?? []),
        [anime]
    );

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

    const openPlayer = (episode: Episode) => {
        const epLabel = episode.number != null ? `EP ${episode.number}` : (episode.title ?? '');
        router.push({
            pathname: '/anime/player/[id]' as any,
            params: { id: String(episode.id), title: `${anime?.title ?? ''} - ${epLabel}`.trim() },
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#8E6BEB" />
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

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView bounces={false} style={styles.flex1} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.heroContainer}>
                    {heroImage ? (
                        <Image source={{ uri: heroImage }} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroImage, styles.placeholder]} />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent', '#15171E']}
                        style={styles.heroGradient}
                    />
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
                            <TouchableOpacity style={styles.actionIcon}>
                                <IconSymbol name="bookmark" size={24} color="#fff" />
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
                        <View style={styles.metaBox}>
                            <Text style={styles.metaBoxText}>HD</Text>
                        </View>
                        {!!anime.format && (
                            <View style={styles.metaBox}>
                                <Text style={styles.metaBoxText}>{anime.format.toUpperCase()}</Text>
                            </View>
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

                    {/* Episodes */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('episodes')}</Text>
                    </View>

                    {episodes.length === 0 ? (
                        <Text style={styles.emptyText}>{t('noEpisodes')}</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodesList}>
                            {episodes.map((ep) => (
                                <TouchableOpacity key={ep.id} style={styles.episodeCard} onPress={() => openPlayer(ep)}>
                                    {ep.thumb_url ? (
                                        <Image source={{ uri: ep.thumb_url }} style={styles.episodeImage} />
                                    ) : heroImage ? (
                                        <Image source={{ uri: heroImage }} style={styles.episodeImage} />
                                    ) : (
                                        <View style={[styles.episodeImage, styles.placeholder]} />
                                    )}
                                    <View style={styles.episodeOverlay}>
                                        <View style={styles.playIconCircle}>
                                            <IconSymbol name="play.fill" size={16} color="#000" />
                                        </View>
                                        <Text style={styles.episodeLabel}>
                                            {ep.number != null ? `EP ${ep.number}` : ep.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Comments link */}
                    <TouchableOpacity
                        style={styles.commentsBtn}
                        onPress={() => router.push({ pathname: '/anime/[id]/comments', params: { id } })}
                    >
                        <Text style={styles.commentsText}>{t('viewAllComments')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
    flex1: { flex: 1 },
    container: { flex: 1, backgroundColor: '#15171E' },
    centered: { alignItems: 'center', justifyContent: 'center' },
    placeholder: { backgroundColor: '#2C2D35' },
    retryButton: { padding: 16, backgroundColor: '#2C2D35', borderRadius: 12 },
    retryText: { color: '#ff6b6b' },
    heroContainer: { width: '100%', height: 350, position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroGradient: { ...StyleSheet.absoluteFillObject },
    topNav: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
    navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    contentContainer: { paddingHorizontal: 20, marginTop: -40 },
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
    emptyText: { color: '#888', marginBottom: 24 },
    episodesList: { gap: 12, marginBottom: 24 },
    episodeCard: { width: 140, height: 90, borderRadius: 8, overflow: 'hidden', position: 'relative' },
    episodeImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    episodeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    playIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    episodeLabel: { position: 'absolute', bottom: 8, left: 8, color: '#fff', fontSize: 12, fontWeight: 'bold' },
    commentsBtn: { backgroundColor: '#2C2D35', paddingVertical: 12, borderRadius: 20, alignItems: 'center', marginBottom: 40 },
    commentsText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    descSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E1F28', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 60, maxHeight: SCREEN_HEIGHT * 0.7 },
    dragHandle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
    sheetTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    closeBtn: { paddingVertical: 16, borderRadius: 24, backgroundColor: '#8E6BEB', alignItems: 'center' },
    closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
