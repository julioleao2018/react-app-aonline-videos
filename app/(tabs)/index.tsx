import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AnimeHorizontalList from '@/components/AnimeHorizontalList';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'expo-router';
import { animeRepository } from '@/src/data/repositories/AnimeRepository';
import { AnimeCard, HomeRails } from '@/src/domain/models/Anime';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  const [rails, setRails] = useState<HomeRails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(false);
      const data = await animeRepository.getHome();
      setRails(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const openAnime = (slug: string) =>
    router.push({ pathname: '/anime/[id]', params: { id: slug } });

  const banners = rails?.banners ?? [];

  const renderCarouselItem = ({ item }: { item: AnimeCard }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ width: SCREEN_WIDTH, height: 480 }}
      onPress={() => openAnime(item.slug)}
    >
      <ImageBackground
        source={{ uri: item.banner_url || item.cover_url || undefined }}
        style={styles.heroBackground}
        imageStyle={{ opacity: 0.8 }}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(21, 23, 30, 0.8)', '#15171E']}
          style={styles.heroGradient}
        >
          <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.heroSubtitle} numberOfLines={1}>
            {item.genres?.join(', ')}
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.playButton} onPress={() => openAnime(item.slug)}>
              <IconSymbol name="play.fill" size={20} color="#fff" />
              <Text style={styles.playButtonText}>{t('play')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.myListButton}>
              <IconSymbol name="plus" size={20} color="#fff" />
              <Text style={styles.myListButtonText}>{t('myList')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#8E6BEB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8E6BEB" />
        }
      >
        {/* Hero Section Carousel */}
        {banners.length > 0 && (
          <View style={{ backgroundColor: '#2C2D35', height: 480 }}>
            <FlatList
              data={banners}
              renderItem={renderCarouselItem}
              keyExtractor={(item) => String(item.id)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
            />
          </View>
        )}

        {/* Top Bar Overlay */}
        <View style={styles.topBar}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logo9}>A</Text>
            </View>
            <Text style={styles.logoText}>{t('animesBR')}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="magnifyingglass" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="bell.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <TouchableOpacity style={styles.errorBox} onPress={load}>
            <Text style={styles.errorText}>{t('loadError')}</Text>
          </TouchableOpacity>
        )}

        {/* Content Sections */}
        <View style={styles.listsContainer}>
          <AnimeHorizontalList title={t('topAiring')} data={rails?.top_airing ?? []} />
          <AnimeHorizontalList title={t('newEpisodes')} data={rails?.new_episodes ?? []} markNew />
          <AnimeHorizontalList title={t('mostFavorite')} data={rails?.most_favorite ?? []} />
          <AnimeHorizontalList title={t('topTvSeries')} data={rails?.top_series ?? []} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15171E',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8E6BEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logo9: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
    marginTop: -2,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#8E6BEB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 6,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  myListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#fff',
    gap: 6,
  },
  myListButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listsContainer: {
    marginTop: -10,
  },
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#2C2D35',
    borderRadius: 12,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
});
