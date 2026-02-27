import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, FlatList, Pressable, Dimensions, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import AnimeHorizontalList from '@/components/AnimeHorizontalList';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock Data for the selected anime
const MOCK_ANIME = {
    id: '1',
    title: "Frieren: Beyond Journey's End Season 2",
    image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    rating: '4.8',
    year: '2026',
    pg: 'PG-13',
    quality: 'HD',
    genres: 'Adventure, Drama, Fantasy, Shounen',
    description: 'Second season of Frieren. The adventure is over but life goes on for an elf mage just beginning to learn what living is all about. Elf mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land.',
    episodes: [
        { id: '1', title: 'Episode 1', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg' },
        { id: '2', title: 'Episode 2', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg' },
        { id: '3', title: 'Episode 3', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg' },
    ],
    moreLikeThis: [
        { id: '10', title: 'One Piece', image: 'https://cdn.myanimelist.net/images/anime/9/73474.jpg', isNew: false, isDubbed: false, quality: 'HD' },
        { id: '11', title: 'Demon Slayer', image: 'https://cdn.myanimelist.net/images/anime/1141/142503.jpg', isNew: true, isDubbed: true, quality: 'HD' },
        { id: '12', title: 'Frieren S1', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', isNew: false, isDubbed: true, quality: 'HD' },
    ]
};

export default function AnimeDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'more' | 'comments'>('more');
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // View More Modal Animation Setup
    const [isDescModalVisible, setIsDescModalVisible] = useState(false);
    const descFadeAnim = useRef(new Animated.Value(0)).current;
    const descSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (isRatingModalVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isRatingModalVisible]);

    useEffect(() => {
        if (isDescModalVisible) {
            Animated.parallel([
                Animated.timing(descFadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(descSlideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(descFadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(descSlideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isDescModalVisible]);

    // We are forcing the dark theme for this screen
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView bounces={false} style={styles.flex1} showsVerticalScrollIndicator={false}>
                {/* Header / Hero Image */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: MOCK_ANIME.image }} style={styles.heroImage} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent', '#15171E']}
                        style={styles.heroGradient}
                    />

                    <View style={styles.topNav}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
                            <IconSymbol name="arrow.left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton}>
                            <IconSymbol name="tv.badge.wifi" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {/* Title Row */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={2}>
                            {MOCK_ANIME.title}
                        </Text>
                        <View style={styles.titleActions}>
                            <TouchableOpacity style={styles.actionIcon}>
                                <IconSymbol name="bookmark" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionIcon}>
                                <IconSymbol name="paperplane" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Metadata Row */}
                    <View style={styles.metaRow}>
                        <TouchableOpacity style={styles.ratingBadge} onPress={() => setIsRatingModalVisible(true)}>
                            <IconSymbol name="star.fill" size={16} color="#8E6BEB" />
                            <Text style={styles.ratingText}>{MOCK_ANIME.rating}</Text>
                        </TouchableOpacity>
                        <IconSymbol name="chevron.right" size={14} color="#666" style={{ marginHorizontal: 4 }} />
                        <Text style={styles.metaYear}>{MOCK_ANIME.year}</Text>
                        <View style={styles.metaBox}>
                            <Text style={styles.metaBoxText}>{MOCK_ANIME.pg}</Text>
                        </View>
                        <View style={styles.metaBox}>
                            <Text style={styles.metaBoxText}>{MOCK_ANIME.quality}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonsRow}>
                        <TouchableOpacity style={styles.playButton} onPress={() => router.push({ pathname: '/anime/player/[id]' as any, params: { id: id as string, title: `${MOCK_ANIME.title} - Episode 1` } })}>
                            <IconSymbol name="play.fill" size={20} color="#fff" />
                            <Text style={styles.playButtonText}>{t('play')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.downloadButton}>
                            <IconSymbol name="arrow.down.circle" size={20} color="#8E6BEB" />
                            <Text style={styles.downloadButtonText}>{t('download')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <Text style={styles.genreText}>{t('genreLabel')}: {MOCK_ANIME.genres}</Text>
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.descriptionText, { marginBottom: 0 }]} numberOfLines={4}>
                            {MOCK_ANIME.description}
                        </Text>
                        <TouchableOpacity onPress={() => setIsDescModalVisible(true)} style={{ marginTop: 4 }}>
                            <Text style={[styles.viewMore, { fontWeight: 'bold' }]}>{t('viewMore')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Episodes Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('episodes')}</Text>
                        <View style={styles.searchContainer}>
                            <IconSymbol name="magnifyingglass" size={16} color="#888" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('searchEpisode')}
                                placeholderTextColor="#888"
                            />
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodesList}>
                        {MOCK_ANIME.episodes.map(ep => (
                            <TouchableOpacity
                                key={ep.id}
                                style={styles.episodeCard}
                                onPress={() => router.push({ pathname: '/anime/player/[id]' as any, params: { id: ep.id, title: `${MOCK_ANIME.title} - ${ep.title}` } })}
                            >
                                <Image source={{ uri: ep.image }} style={styles.episodeImage} />
                                <View style={styles.episodeOverlay}>
                                    <View style={styles.playIconCircle}>
                                        <IconSymbol name="play.fill" size={16} color="#000" />
                                    </View>
                                    <Text style={styles.episodeLabel}>{ep.title}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        <Pressable
                            style={[styles.tab, activeTab === 'more' && styles.activeTab]}
                            onPress={() => setActiveTab('more')}
                        >
                            <Text style={[styles.tabText, activeTab === 'more' && styles.activeTabText]}>{t('moreLikeThis')}</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
                            onPress={() => setActiveTab('comments')}
                        >
                            <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>{t('comments')} (454)</Text>
                        </Pressable>
                    </View>

                    {/* Tab Content */}
                    <View style={styles.tabContent}>
                        {activeTab === 'more' ? (
                            <View style={styles.moreLikeThisGrid}>
                                {/* Reusing AnimeHorizontalList inside a vertical scroll isn't ideal for grid, but fits the design if it's horizontal. The screenshot shows cards wrap in a grid? Actually, screenshot 2 shows horizontal cards but clipped. Let's use a horizontal list or a grid. We will map them in a row wrap. */}
                                {MOCK_ANIME.moreLikeThis.map(anime => (
                                    <TouchableOpacity key={anime.id} style={styles.relatedCard}>
                                        <View style={styles.relatedImageContainer}>
                                            <Image source={{ uri: anime.image }} style={styles.relatedImage} />

                                            {/* Top-left Badge */}
                                            <View style={[styles.badge, styles.badgeTopLeft]}>
                                                <Text style={styles.badgeTextLight}>{anime.quality}</Text>
                                            </View>

                                            {/* Top-right Badge */}
                                            {anime.isNew && (
                                                <View style={[styles.badge, styles.badgeTopRight]}>
                                                    <Text style={styles.badgeTextLight}>NOVO</Text>
                                                </View>
                                            )}

                                            {/* Bottom-right Badge */}
                                            <View style={[styles.badge, styles.badgeBottomRight]}>
                                                <Text style={styles.badgeTextLight}>{anime.isDubbed ? 'DUB' : 'LEG'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.commentsPreview}>
                                <Text style={styles.commentsPlaceholder}>{t('loadingComments')}</Text>
                                <TouchableOpacity style={styles.viewAllCommentsBtn} onPress={() => router.push({ pathname: '/anime/[id]/comments', params: { id: id as string } })}>
                                    <Text style={styles.viewAllCommentsText}>{t('viewAllComments')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>

            {/* Animated Rating Bottom Sheet */}
            {/* The wrapper stays mounted if visible or if animating out (fadeAnim > 0 isn't perfectly strictly boolean but sufficient if we manage zIndex) */}
            <View style={[StyleSheet.absoluteFill, { zIndex: isRatingModalVisible ? 10 : -1 }]} pointerEvents={isRatingModalVisible ? 'auto' : 'none'}>
                <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        activeOpacity={1}
                        onPress={() => setIsRatingModalVisible(false)}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.ratingSheet,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.dragHandle} />
                    <Text style={styles.ratingTitle}>Give Rating</Text>

                    <View style={styles.ratingStatsContainer}>
                        <View style={styles.ratingScoreBox}>
                            <Text style={styles.bigRatingScore}>4.8<Text style={styles.totalRatingScore}>/5</Text></Text>
                            <View style={styles.starsRowShort}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <IconSymbol key={i} name="star.fill" size={10} color="#8E6BEB" />
                                ))}
                            </View>
                            <Text style={styles.usersCount}>(722 users)</Text>
                        </View>

                        <View style={styles.ratingBarsBox}>
                            {[5, 4, 3, 2, 1].map((lvl, idx) => (
                                <View key={lvl} style={styles.ratingBarRow}>
                                    <Text style={styles.ratingBarLabel}>{lvl}</Text>
                                    <View style={styles.ratingBarTrack}>
                                        <View style={[styles.ratingBarFill, { width: lvl === 5 ? '90%' : lvl === 4 ? '5%' : '2%' }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.interactiveStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                                <IconSymbol
                                    name={star <= selectedRating ? "star.fill" : "star"}
                                    size={40}
                                    color="#8E6BEB"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.ratingActions}>
                        <TouchableOpacity style={styles.cancelRatingBtn} onPress={() => setIsRatingModalVisible(false)}>
                            <Text style={styles.cancelRatingText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitRatingBtn} onPress={() => setIsRatingModalVisible(false)}>
                            <Text style={styles.submitRatingText}>{t('submit')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>

            {/* View More Description Modal */}
            <View style={[StyleSheet.absoluteFill, { zIndex: isDescModalVisible ? 10 : -1 }]} pointerEvents={isDescModalVisible ? 'auto' : 'none'}>
                <Animated.View style={[styles.modalOverlay, { opacity: descFadeAnim }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        activeOpacity={1}
                        onPress={() => setIsDescModalVisible(false)}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.ratingSheet,
                        { paddingBottom: 60, height: 'auto', maxHeight: SCREEN_HEIGHT * 0.7, transform: [{ translateY: descSlideAnim }] }
                    ]}
                >
                    <View style={styles.dragHandle} />
                    <Text style={styles.ratingTitle}>{MOCK_ANIME.title}</Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        <Text style={[styles.descriptionText, { fontSize: 16, lineHeight: 24, paddingHorizontal: 4 }]}>
                            {MOCK_ANIME.description}
                        </Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.submitRatingBtn} onPress={() => setIsDescModalVisible(false)}>
                        <Text style={styles.submitRatingText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: '#15171E',
    },
    heroContainer: {
        width: '100%',
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    topNav: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: -40, // overlap image gracefully
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        paddingRight: 16,
    },
    titleActions: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 4,
    },
    actionIcon: {
        marginLeft: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#8E6BEB',
        fontWeight: 'bold',
        fontSize: 14,
    },
    metaYear: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '500',
    },
    metaBox: {
        borderWidth: 1,
        borderColor: '#4k4k5k',
        backgroundColor: '#222',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    metaBoxText: {
        color: '#ccc',
        fontSize: 10,
        fontWeight: 'bold',
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    playButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8E6BEB',
        paddingVertical: 14,
        borderRadius: 24,
        gap: 8,
    },
    playButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    downloadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4A4C5C',
        paddingVertical: 14,
        borderRadius: 24,
        gap: 8,
    },
    downloadButtonText: {
        color: '#8E6BEB',
        fontSize: 16,
        fontWeight: 'bold',
    },
    genreText: {
        color: '#ccc',
        fontSize: 13,
        marginBottom: 8,
    },
    descriptionText: {
        color: '#eee',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 24,
    },
    viewMore: {
        color: '#8E6BEB',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2D35',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: 150,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#fff',
        fontSize: 12,
    },
    episodesList: {
        gap: 12,
        marginBottom: 24,
    },
    episodeCard: {
        width: 140,
        height: 90,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    episodeImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    episodeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    episodeLabel: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#2C2D35',
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#8E6BEB',
    },
    tabText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
    },
    tabContent: {
        minHeight: 200,
    },
    moreLikeThisGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 40,
    },
    relatedCard: {
        width: '30%', // Grid of 3
        aspectRatio: 130 / 190,
        borderRadius: 8,
        overflow: 'hidden',
    },
    relatedImageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    relatedImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeTopLeft: {
        top: 4,
        left: 4,
        backgroundColor: '#fff',
    },
    badgeTopRight: {
        top: 4,
        right: 4,
        backgroundColor: '#8E6BEB',
    },
    badgeBottomRight: {
        bottom: 4,
        right: 4,
        backgroundColor: '#000',
    },
    badgeTextLight: {
        color: '#111',
        fontSize: 8,
        fontWeight: 'bold',
    },
    commentsPreview: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    commentsPlaceholder: {
        color: '#888',
        marginBottom: 16,
    },
    viewAllCommentsBtn: {
        backgroundColor: '#2C2D35',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    viewAllCommentsText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    ratingSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1F28', // Dark card
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        height: SCREEN_HEIGHT * 0.55,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    ratingTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    ratingStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2C2D35',
        paddingBottom: 24,
        marginBottom: 24,
    },
    ratingScoreBox: {
        flex: 1,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#2C2D35',
        paddingRight: 16,
    },
    bigRatingScore: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '900',
    },
    totalRatingScore: {
        fontSize: 20,
        color: '#888',
    },
    starsRowShort: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 4,
    },
    usersCount: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingBarsBox: {
        flex: 2,
        paddingLeft: 16,
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingBarLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        width: 16,
    },
    ratingBarTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#8E6BEB',
    },
    interactiveStars: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 32,
    },
    ratingActions: {
        flexDirection: 'row',
        gap: 16,
    },
    cancelRatingBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        backgroundColor: '#2C2D35',
        alignItems: 'center',
    },
    cancelRatingText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitRatingBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        backgroundColor: '#8E6BEB',
        alignItems: 'center',
    },
    submitRatingText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
