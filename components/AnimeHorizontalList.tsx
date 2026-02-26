import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

interface Anime {
    id: string;
    title: string;
    image: string;
    rating?: string;
    quality?: string;
}

interface Props {
    title: string;
    data: Anime[];
}

export default function AnimeHorizontalList({ title, data }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                horizontal
                data={data}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        {item.rating && (
                            <View style={[styles.badge, styles.badgeLeft]}>
                                <Text style={styles.badgeTextDark}>{item.rating}</Text>
                            </View>
                        )}
                        {item.quality && (
                            <View style={[styles.badge, styles.badgeRight, { backgroundColor: '#8E6BEB' }]}>
                                <Text style={styles.badgeTextLight}>{item.quality}</Text>
                            </View>
                        )}
                        {/* The design has no title text below the card, it's just the poster */}
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
        gap: 12,
    },
    card: {
        width: 130,
        height: 190,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        top: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    badgeLeft: {
        left: 8,
    },
    badgeRight: {
        right: 8,
    },
    badgeTextDark: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    badgeTextLight: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
