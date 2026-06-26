import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AnimeCard } from '@/src/domain/models/Anime';

interface Props {
    title: string;
    data: AnimeCard[];
    /** Marca os cards com o selo "NOVO" (ex.: rail de novos episódios). */
    markNew?: boolean;
}

export default function AnimeHorizontalList({ title, data, markNew }: Props) {
    const { t } = useLanguage();
    const router = useRouter();

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>{t('seeAll')}</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                horizontal
                data={data}
                keyExtractor={(item) => String(item.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push({ pathname: '/anime/[id]', params: { id: item.slug } })}
                    >
                        <View style={styles.imageContainer}>
                            {item.cover_url ? (
                                <Image source={{ uri: item.cover_url }} style={styles.image} />
                            ) : (
                                <View style={[styles.image, styles.imagePlaceholder]} />
                            )}

                            {/* Inner shadow/gradient at the bottom of the image for depth */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)']}
                                style={styles.imageGradient}
                            />

                            {/* Top-left Badge: Quality (e.g. HD) */}
                            <View style={[styles.badge, styles.badgeTopLeft]}>
                                <Text style={styles.badgeTextLight}>HD</Text>
                            </View>

                            {/* Top-right Badge: New */}
                            {markNew && (
                                <View style={[styles.badge, styles.badgeTopRight]}>
                                    <Text style={styles.badgeTextLight}>NOVO</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.animeTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.animeSubtitle} numberOfLines={1}>
                                {item.genres?.[0] || (item.year ? String(item.year) : '')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    seeAll: {
        color: '#8E6BEB',
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        width: 150,
        backgroundColor: '#1A1A24', // Dark card background matching image
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2F3142', // Subtle border
    },
    imageContainer: {
        width: '100%',
        height: 200,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        backgroundColor: '#2F3142',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    infoContainer: {
        padding: 12,
        paddingTop: 10,
    },
    animeTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    animeSubtitle: {
        color: '#A0A0B0', // Greyish text for season
        fontSize: 12,
    },
    badge: {
        position: 'absolute',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeTopLeft: {
        top: 8,
        left: 8,
        backgroundColor: '#8E6BEB',
    },
    badgeTopRight: {
        top: 8,
        right: 8,
        backgroundColor: '#8E6BEB',
    },
    badgeBottomRight: {
        bottom: 8,
        right: 8,
        backgroundColor: '#000', // Black background for LEG/DUB badge
    },
    badgeTextLight: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
