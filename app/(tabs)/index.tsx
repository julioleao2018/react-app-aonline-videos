import { Image } from 'expo-image';
import { StyleSheet, View, Text, ImageBackground, ScrollView, TouchableOpacity, StatusBar, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AnimeHorizontalList from '@/components/AnimeHorizontalList';
import { useLanguage } from '@/hooks/useLanguage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder data for the design
const MOCK_DATA = [
  { id: '1', title: 'One Piece', image: 'https://animesbr.lat/storage/animes/imported/one-piece/cover.jpg', rating: 'PG-13', quality: 'HD' },
  { id: '2', title: 'Frieren', image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg', rating: 'PG-13', quality: 'HD' },
  { id: '3', title: 'Fullmetal Alchemist', image: 'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg', rating: 'R', quality: 'HD' },
];

const CAROUSEL_DATA = [
  {
    id: '1',
    title: 'Sentenced to Be a Hero',
    subtitle: 'Action, Adventure, Comedy, Drama, Fantasy',
    image: 'https://animesbr.lat/storage/animes/imported/yuusha-kei-ni-shosu-choubatsu-yuusha-9004-tai-keimu-kiroku/cover.jpg'
  },
  {
    id: '2',
    title: 'One Piece',
    subtitle: 'Action, Adventure, Fantasy',
    image: 'https://animesbr.lat/storage/animes/imported/one-piece/cover.jpg'
  },
  {
    id: '3',
    title: 'Frieren',
    subtitle: 'Adventure, Drama, Fantasy',
    image: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg'
  }
];

export default function HomeScreen() {
  const { t } = useLanguage();

  const renderCarouselItem = ({ item }: { item: typeof CAROUSEL_DATA[0] }) => (
    <View style={{ width: SCREEN_WIDTH, height: 480 }}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.heroBackground}
        imageStyle={{ opacity: 0.8 }}
      >
        {/* Dark Overlay for better contrast */}
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(21, 23, 30, 0.8)', '#15171E']}
          style={styles.heroGradient}
        >
          <Text style={styles.heroTitle}>
            {item.title === 'Sentenced to Be a Hero' ? t('sentencedToBeAHero') : item.title}
          </Text>
          <Text style={styles.heroSubtitle}>
            {item.subtitle === 'Action, Adventure, Comedy, Drama, Fantasy' ? t('heroSubtitleCategories') : item.subtitle}
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.playButton}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

        {/* Hero Section Carousel */}
        <View style={{ backgroundColor: '#2C2D35', height: 480 }}>
          <FlatList
            data={CAROUSEL_DATA}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
          />
        </View>

        {/* Top Bar Overlay positioned absolutely inside ScrollView so it scrolls up with the page */}
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

        {/* Content Sections */}
        <View style={styles.listsContainer}>
          <AnimeHorizontalList title={t('topAiring')} data={MOCK_DATA} />
          <AnimeHorizontalList title={t('newEpisodes')} data={MOCK_DATA} />
          <AnimeHorizontalList title={t('mostFavorite')} data={MOCK_DATA} />
          <AnimeHorizontalList title={t('topTvSeries')} data={MOCK_DATA} />
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
    paddingTop: 50, // Safe area approx
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
});
